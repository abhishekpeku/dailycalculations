'use client';

import { useMemo, useState } from 'react';
import { WidgetCard, widgetAccent, DownloadMenu } from '@/components/CalculatorWidget';
import type { ExportPayload } from '@/lib/export';

// ISO 7064 MOD 97-10, exactly as ISO 7064 defines it and Wikipedia's "International Bank Account
// Number" article describes it: move the first 4 characters to the end, replace every letter with
// two digits (A=10 ... Z=35), then take the whole string mod 97. A valid IBAN's remainder is 1.
// See data/calculators/tech.ts ("iban-calculator") for the cited content.
//
// The remainder is accumulated digit-by-digit (remainder = (remainder * base + digit) % 97)
// instead of ever forming the full number — a 34-character IBAN expands past 70 digits once every
// letter becomes two digits, far beyond what a JS number (or this site's numeric CalculatorInput)
// can hold exactly, so this calculator takes the IBAN as free text, not split into numeric fields.
function letterValue(ch: string) {
  return ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
}

function mod97Remainder(rearranged: string) {
  let remainder = 0;
  for (const ch of rearranged) {
    if (ch >= '0' && ch <= '9') {
      remainder = (remainder * 10 + Number(ch)) % 97;
    } else {
      remainder = (remainder * 100 + letterValue(ch)) % 97;
    }
  }
  return remainder;
}

function normalize(raw: string) {
  return raw.replace(/\s+/g, '').toUpperCase();
}

const FORMAT_RE = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;

type ValidationResult =
  | { status: 'empty' }
  | { status: 'badFormat'; reason: string }
  | { status: 'checked'; iban: string; remainder: number; valid: boolean };

function validateIban(raw: string): ValidationResult {
  if (raw.trim() === '') return { status: 'empty' };
  const iban = normalize(raw);
  if (!FORMAT_RE.test(iban)) {
    return { status: 'badFormat', reason: 'Must start with 2 letters (country code) and 2 digits (check digits), followed by letters/digits only.' };
  }
  if (iban.length < 15 || iban.length > 34) {
    return { status: 'badFormat', reason: `IBANs are 15-34 characters long; this one is ${iban.length}.` };
  }
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const remainder = mod97Remainder(rearranged);
  return { status: 'checked', iban, remainder, valid: remainder === 1 };
}

function checkDigitsFor(countryCode: string, bban: string) {
  const provisional = `${countryCode}00${bban}`;
  const rearranged = provisional.slice(4) + provisional.slice(0, 4);
  const remainder = mod97Remainder(rearranged);
  return String(98 - remainder).padStart(2, '0');
}

function groupIban(iban: string) {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

type Mode = 'validate' | 'generate';

export default function IbanCalculator() {
  const [mode, setMode] = useState<Mode>('validate');
  const [iban, setIban] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [bban, setBban] = useState('');
  const accent = widgetAccent('tech');

  const validation = useMemo(() => validateIban(iban), [iban]);

  const generated = useMemo(() => {
    const code = normalize(countryCode).replace(/[^A-Z]/g, '');
    const body = normalize(bban).replace(/[^A-Z0-9]/g, '');
    if (code.length !== 2 || body.length === 0) return null;
    const checkDigits = checkDigitsFor(code, body);
    return { checkDigits, full: `${code}${checkDigits}${body}` };
  }, [countryCode, bban]);

  const exportData: ExportPayload | null =
    mode === 'validate' && validation.status === 'checked'
      ? {
          title: 'IBAN Calculator',
          url: typeof window === 'undefined' ? '' : window.location.href,
          inputs: [{ label: 'IBAN', value: groupIban(validation.iban), kind: 'text' }],
          result: { label: 'Format/checksum result', value: validation.valid ? 'Valid format and checksum' : 'Invalid checksum', kind: 'text' },
          outputs: [{ label: 'MOD-97 remainder', value: String(validation.remainder), raw: validation.remainder, kind: 'integer' }]
        }
      : mode === 'generate' && generated
      ? {
          title: 'IBAN Calculator',
          url: typeof window === 'undefined' ? '' : window.location.href,
          inputs: [
            { label: 'Country code', value: normalize(countryCode), kind: 'text' },
            { label: 'BBAN', value: normalize(bban), kind: 'text' }
          ],
          result: { label: 'Check digits', value: generated.checkDigits, kind: 'text' },
          outputs: [{ label: 'Full IBAN', value: groupIban(generated.full), kind: 'text' }]
        }
      : null;

  return (
    <WidgetCard>
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'validate' as Mode, label: 'Validate an IBAN' },
          { id: 'generate' as Mode, label: 'Generate check digits' }
        ]).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={mode === m.id ? { borderColor: accent, backgroundColor: `${accent}1A`, color: accent } : undefined}
            className={`rounded-2xl border px-4 py-1.5 text-sm font-medium transition ${mode === m.id ? '' : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'validate' ? (
        <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">IBAN</span>
            <input
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="e.g. GB82 WEST 1234 5698 7654 32"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm tracking-wide text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            />
          </label>

          {validation.status === 'empty' ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter an IBAN to check its format and checksum.</p>
          ) : validation.status === 'badFormat' ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              Not a valid IBAN format. {validation.reason}
            </div>
          ) : (
            <>
              <div
                className={`rounded-2xl border p-4 text-center ${
                  validation.valid
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${validation.valid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {validation.valid ? 'Valid format and checksum' : 'Invalid checksum'}
                </p>
                <p className={`mt-1 font-mono text-xl font-bold tracking-wide ${validation.valid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {groupIban(validation.iban)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                <p>
                  MOD-97 remainder: <strong className="text-slate-800 dark:text-slate-200">{validation.remainder}</strong>{' '}
                  (a valid IBAN&apos;s remainder is always exactly 1).
                </p>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Country code (2 letters)</span>
              <input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="e.g. GB"
                maxLength={2}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm uppercase text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">BBAN (bank/branch/account, no check digits)</span>
              <input
                value={bban}
                onChange={(e) => setBban(e.target.value)}
                placeholder="e.g. WEST12345698765432"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm uppercase text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
              />
            </label>
          </div>

          {generated ? (
            <div className="rounded-2xl border p-4 text-center" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0F` }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>Check digits</p>
              <p className="mt-1 text-3xl font-bold" style={{ color: accent }}>{generated.checkDigits}</p>
              <p className="mt-2 font-mono text-sm text-slate-600 dark:text-slate-400">{groupIban(generated.full)}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter a 2-letter country code and the BBAN (everything after the check digits) to compute the check digits.</p>
          )}
        </>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Everything above runs in your browser. Nothing you type is sent to a server or stored — see the watch-outs below for what this checksum check does and does not prove.
      </p>

      <div className="flex justify-end">
        <DownloadMenu calculatorId="iban-calculator" exportData={exportData} />
      </div>
    </WidgetCard>
  );
}
