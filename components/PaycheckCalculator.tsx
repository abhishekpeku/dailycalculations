'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/calculator';

// ── 2025 IRS figures ────────────────────────────────────────────────────────
type FilingStatus = 'single' | 'mfj' | 'hoh';

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15000,
  mfj: 30000,
  hoh: 22500,
};

// [taxableIncome threshold, rate]
const BRACKETS: Record<FilingStatus, [number, number][]> = {
  single: [
    [11925, 0.10], [48475, 0.12], [103350, 0.22],
    [197300, 0.24], [250525, 0.32], [626350, 0.35], [Infinity, 0.37],
  ],
  mfj: [
    [23850, 0.10], [96950, 0.12], [206700, 0.22],
    [394600, 0.24], [501050, 0.32], [751600, 0.35], [Infinity, 0.37],
  ],
  hoh: [
    [17000, 0.10], [64850, 0.12], [103350, 0.22],
    [197300, 0.24], [250500, 0.32], [626350, 0.35], [Infinity, 0.37],
  ],
};

const SS_WAGE_BASE = 176100;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADD_MEDICARE_RATE = 0.009;
const ADD_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000, mfj: 250000, hoh: 200000,
};

// Annual pre-tax contribution limits
const LIMITS = {
  traditional401k: 23500,
  hsa_individual: 4300,
  hsa_family: 8550,
  fsa: 3300,
  depCare: 5000,
  commuterMonthly: 325,
};

// ── helpers ──────────────────────────────────────────────────────────────────
function calcFederalTax(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = BRACKETS[status];
  let tax = 0;
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, cap) - prev;
    tax += slice * rate;
    prev = cap;
  }
  return tax;
}

function num(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmt(v: number) { return formatCurrency(v); }

// ── types ────────────────────────────────────────────────────────────────────
type HSACoverage = 'individual' | 'family';
type PayFrequency = 52 | 26 | 24 | 12;

const PAY_FREQ_LABELS: { value: PayFrequency; label: string }[] = [
  { value: 52, label: 'Weekly' },
  { value: 26, label: 'Bi-Weekly' },
  { value: 24, label: 'Semi-Monthly' },
  { value: 12, label: 'Monthly' },
];

const FILING_LABELS: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'mfj', label: 'Married Filing Jointly' },
  { value: 'hoh', label: 'Head of Household' },
];

// ── sub-components ───────────────────────────────────────────────────────────
function Field({
  label, hint, value, onChange, prefix,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; prefix?: string;
}) {
  return (
    <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
      <span className="font-medium">{label}</span>
      {hint && <span className="block text-xs text-slate-400 dark:text-slate-500">{hint}</span>}
      <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-brand-400 dark:focus-within:ring-brand-500/20">
        {prefix && <span className="pl-3 text-slate-400 dark:text-slate-500">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={0}
          step="any"
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent px-3 py-2.5 text-slate-900 outline-none dark:text-slate-100"
        />
      </div>
    </label>
  );
}

function ResultRow({ label, value, sub }: { label: string; value: number; sub?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-sm ${sub ? 'pl-4 text-slate-500 dark:text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
      <span>{label}</span>
      <span className={sub ? '' : 'tabular-nums'}>{fmt(value)}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
export default function PaycheckCalculator() {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [payFreq, setPayFreq] = useState<PayFrequency>(26);
  const [grossAnnual, setGrossAnnual] = useState('60000');
  const [stateRate, setStateRate] = useState('5');
  const [localRate, setLocalRate] = useState('');

  // Pre-tax deductions (annual amounts unless noted)
  const [trad401k, setTrad401k] = useState('');
  const [hsaCoverage, setHsaCoverage] = useState<HSACoverage>('individual');
  const [hsa, setHsa] = useState('');
  const [fsa, setFsa] = useState('');
  const [depCare, setDepCare] = useState('');
  const [commuter, setCommuter] = useState(''); // per month
  const [healthPremium, setHealthPremium] = useState(''); // per period
  const [dentalVision, setDentalVision] = useState(''); // per period

  // Post-tax deductions (per period)
  const [roth401k, setRoth401k] = useState('');
  const [lifeInsurance, setLifeInsurance] = useState('');
  const [otherPostTax, setOtherPostTax] = useState('');

  const results = useMemo(() => {
    const annual = num(grossAnnual);
    const periods = payFreq;

    // Pre-tax annual amounts
    const t401k = Math.min(num(trad401k), LIMITS.traditional401k);
    const hsaMax = hsaCoverage === 'family' ? LIMITS.hsa_family : LIMITS.hsa_individual;
    const hsaAmt = Math.min(num(hsa), hsaMax);
    const fsaAmt = Math.min(num(fsa), LIMITS.fsa);
    const depCareAmt = Math.min(num(depCare), LIMITS.depCare);
    const commuterAnnual = Math.min(num(commuter), LIMITS.commuterMonthly) * 12;
    const healthAnnual = num(healthPremium) * periods;
    const dentalAnnual = num(dentalVision) * periods;

    const totalPreTaxAnnual = t401k + hsaAmt + fsaAmt + depCareAmt + commuterAnnual + healthAnnual + dentalAnnual;

    // Federal taxable income
    const federalTaxableIncome = Math.max(0, annual - totalPreTaxAnnual - STANDARD_DEDUCTION[filingStatus]);
    const annualFederalTax = calcFederalTax(federalTaxableIncome, filingStatus);

    // FICA (on gross minus 401k/HSA/FSA, i.e. FICA exempt pre-tax plans)
    // Health premiums via employer cafeteria plan are FICA-exempt; we assume section 125
    const ficaWages = Math.max(0, annual - t401k - hsaAmt - fsaAmt - depCareAmt - commuterAnnual - healthAnnual - dentalAnnual);
    const ssWages = Math.min(ficaWages, SS_WAGE_BASE);
    const annualSS = ssWages * SS_RATE;
    const addMedThreshold = ADD_MEDICARE_THRESHOLD[filingStatus];
    const annualMedicare = ficaWages * MEDICARE_RATE + Math.max(0, ficaWages - addMedThreshold) * ADD_MEDICARE_RATE;

    // State & local (on gross minus pre-tax deductions, simplified)
    const stateTaxableIncome = Math.max(0, annual - totalPreTaxAnnual);
    const annualStateTax = stateTaxableIncome * (num(stateRate) / 100);
    const annualLocalTax = stateTaxableIncome * (num(localRate) / 100);

    // Post-tax deductions annual
    const roth = num(roth401k) * periods;
    const life = num(lifeInsurance) * periods;
    const other = num(otherPostTax) * periods;
    const totalPostTaxAnnual = roth + life + other;

    const annualNet = annual - totalPreTaxAnnual - annualFederalTax - annualSS - annualMedicare - annualStateTax - annualLocalTax - totalPostTaxAnnual;

    const perPeriod = (v: number) => v / periods;

    return {
      // per period
      gross: perPeriod(annual),
      preTax: perPeriod(totalPreTaxAnnual),
      preTax401k: perPeriod(t401k),
      preTaxHsa: perPeriod(hsaAmt),
      preTaxFsa: perPeriod(fsaAmt),
      preTaxDepCare: perPeriod(depCareAmt),
      preTaxCommuter: perPeriod(commuterAnnual),
      preTaxHealth: num(healthPremium),
      preTaxDental: num(dentalVision),
      federalTax: perPeriod(annualFederalTax),
      socialSecurity: perPeriod(annualSS),
      medicare: perPeriod(annualMedicare),
      stateTax: perPeriod(annualStateTax),
      localTax: perPeriod(annualLocalTax),
      postTax: perPeriod(totalPostTaxAnnual),
      postTaxRoth: num(roth401k),
      postTaxLife: num(lifeInsurance),
      postTaxOther: num(otherPostTax),
      netPay: perPeriod(annualNet),
      annualNet,
      // for limit hints
      t401kCapped: t401k,
      hsaCapped: hsaAmt,
      hsaMax,
    };
  }, [grossAnnual, payFreq, filingStatus, stateRate, localRate, trad401k, hsa, hsaCoverage, fsa, depCare, commuter, healthPremium, dentalVision, roth401k, lifeInsurance, otherPostTax]);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">

      {/* Filing & frequency */}
      <SectionCard title="Pay Info">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Filing status</p>
          <div className="flex flex-wrap gap-2">
            {FILING_LABELS.map(({ value, label }) => (
              <button key={value} onClick={() => setFilingStatus(value)}
                className={`rounded-2xl border px-3 py-1.5 text-sm transition ${filingStatus === value ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Pay frequency</p>
          <div className="flex flex-wrap gap-2">
            {PAY_FREQ_LABELS.map(({ value, label }) => (
              <button key={value} onClick={() => setPayFreq(value)}
                className={`rounded-2xl border px-3 py-1.5 text-sm transition ${payFreq === value ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Annual gross salary" prefix="$" value={grossAnnual} onChange={setGrossAnnual} />
          <Field label="State income tax rate" hint="Enter 0 if no state tax" prefix="%" value={stateRate} onChange={setStateRate} />
          <Field label="Local / city tax rate" hint="Leave blank if none" prefix="%" value={localRate} onChange={setLocalRate} />
        </div>
      </SectionCard>

      {/* Pre-tax deductions */}
      <SectionCard title="Pre-Tax Deductions (reduce federal & state taxable income)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Traditional 401(k) — annual"
            hint={`2025 limit: $${LIMITS.traditional401k.toLocaleString()}`}
            prefix="$" value={trad401k} onChange={setTrad401k}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">HSA coverage type</p>
            <div className="flex gap-2">
              {(['individual', 'family'] as HSACoverage[]).map((v) => (
                <button key={v} onClick={() => setHsaCoverage(v)}
                  className={`rounded-2xl border px-3 py-1.5 text-sm capitalize transition ${hsaCoverage === v ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <Field
            label="HSA contribution — annual"
            hint={`2025 limit: $${results.hsaMax.toLocaleString()}`}
            prefix="$" value={hsa} onChange={setHsa}
          />
          <Field
            label="Health Care FSA — annual"
            hint={`2025 limit: $${LIMITS.fsa.toLocaleString()}`}
            prefix="$" value={fsa} onChange={setFsa}
          />
          <Field
            label="Dependent Care FSA — annual"
            hint={`2025 limit: $${LIMITS.depCare.toLocaleString()}`}
            prefix="$" value={depCare} onChange={setDepCare}
          />
          <Field
            label="Commuter benefit — per month"
            hint={`2025 limit: $${LIMITS.commuterMonthly}/mo`}
            prefix="$" value={commuter} onChange={setCommuter}
          />
          <Field
            label="Health insurance premium — per paycheck"
            hint="Employee share only"
            prefix="$" value={healthPremium} onChange={setHealthPremium}
          />
          <Field
            label="Dental & vision premium — per paycheck"
            prefix="$" value={dentalVision} onChange={setDentalVision}
          />
        </div>
      </SectionCard>

      {/* Post-tax deductions */}
      <SectionCard title="Post-Tax Deductions (per paycheck, after all taxes)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Roth 401(k)" prefix="$" value={roth401k} onChange={setRoth401k} />
          <Field label="Life / disability insurance" prefix="$" value={lifeInsurance} onChange={setLifeInsurance} />
          <Field label="Other post-tax deductions" prefix="$" value={otherPostTax} onChange={setOtherPostTax} />
        </div>
      </SectionCard>

      {/* Results */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950/30">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Net take-home pay</p>
            <p className="text-4xl font-bold text-brand-700 dark:text-brand-300">{fmt(results.netPay)}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">per paycheck · {fmt(results.annualNet)} / year</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Gross per paycheck</p>
            <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">{fmt(results.gross)}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {/* Pre-tax */}
          {results.preTax > 0 && (
            <div className="py-2">
              <ResultRow label="Pre-tax deductions" value={-results.preTax} />
              {results.preTax401k > 0 && <ResultRow label="Traditional 401(k)" value={-results.preTax401k} sub />}
              {results.preTaxHsa > 0 && <ResultRow label="HSA" value={-results.preTaxHsa} sub />}
              {results.preTaxFsa > 0 && <ResultRow label="Health Care FSA" value={-results.preTaxFsa} sub />}
              {results.preTaxDepCare > 0 && <ResultRow label="Dependent Care FSA" value={-results.preTaxDepCare} sub />}
              {results.preTaxCommuter > 0 && <ResultRow label="Commuter benefit" value={-results.preTaxCommuter} sub />}
              {results.preTaxHealth > 0 && <ResultRow label="Health insurance" value={-results.preTaxHealth} sub />}
              {results.preTaxDental > 0 && <ResultRow label="Dental & vision" value={-results.preTaxDental} sub />}
            </div>
          )}

          {/* Taxes */}
          <div className="py-2">
            <ResultRow label="Federal income tax" value={-results.federalTax} />
            <ResultRow label="Social Security (6.2%)" value={-results.socialSecurity} sub />
            <ResultRow label="Medicare (1.45% + 0.9%)" value={-results.medicare} sub />
            {results.stateTax > 0 && <ResultRow label="State income tax" value={-results.stateTax} />}
            {results.localTax > 0 && <ResultRow label="Local / city tax" value={-results.localTax} />}
          </div>

          {/* Post-tax */}
          {results.postTax > 0 && (
            <div className="py-2">
              <ResultRow label="Post-tax deductions" value={-results.postTax} />
              {results.postTaxRoth > 0 && <ResultRow label="Roth 401(k)" value={-results.postTaxRoth} sub />}
              {results.postTaxLife > 0 && <ResultRow label="Life / disability" value={-results.postTaxLife} sub />}
              {results.postTaxOther > 0 && <ResultRow label="Other" value={-results.postTaxOther} sub />}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Estimates based on 2025 IRS figures. Does not account for tax credits, additional withholding, or state-specific rules. Consult a tax professional for exact figures.
      </p>
    </div>
  );
}
