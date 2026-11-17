import type { CalculatorConfig } from './types.ts';

export const timeCalculators: CalculatorConfig[] = [
  {
    id: 'age-calculator',
    category: 'time',
    group: 'Ages & Dates',
    glyph: 'yrs',
    updatedAt: '2026-10-21',
    aliases: ['how old am i calculator', 'date of birth calculator', 'age in days calculator', 'birthday calculator', 'chronological age calculator'],
    related: ['date-difference-calculator', 'pregnancy-due-date-calculator', 'visa-stay-days-calculator', 'sleep-time-calculator'],
    title: 'Age Calculator',
    description: 'Find your exact age in years, months and days from your date of birth, plus the total days you have been alive and a countdown to your next birthday.',
    example: 'Someone born March 15, 1990 is 36 years, 3 months and 2 days old on June 17, 2026 — 13,243 days lived, with 271 days to their next birthday.',
    timeDependent: true,
    breakdown: {
      headline: 'years',
      headlineLabel: 'Age in years',
      outputs: [
        { id: 'years', label: 'Years', format: 'integer' },
        { id: 'months', label: 'Plus months', format: 'integer' },
        { id: 'days', label: 'Plus days', format: 'integer' },
        { id: 'totalDays', label: 'Total days lived', format: 'integer' },
        { id: 'daysToNextBirthday', label: 'Days until next birthday', format: 'integer' }
      ],
      groups: [{ title: 'Date of birth', inputs: ['birthMonth', 'birthDay', 'birthYear'] }],
      // Axis: epoch ms from the last birthday to the next, with today marked between them.
      derive: (values) => {
        const today = new Date(values.todayMs);
        const todayMidMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        let nextBirthdayMs = new Date(today.getFullYear(), values.birthMonth - 1, values.birthDay).getTime();
        if (nextBirthdayMs < todayMidMs) nextBirthdayMs = new Date(today.getFullYear() + 1, values.birthMonth - 1, values.birthDay).getTime();
        const lastBirthdayMs = new Date(new Date(nextBirthdayMs).getFullYear() - 1, values.birthMonth - 1, values.birthDay).getTime();
        return { lastBirthdayMs, nextBirthdayMs, todayMidMs };
      },
      visual: {
        type: 'timeline',
        start: 'lastBirthdayMs',
        end: 'nextBirthdayMs',
        today: 'todayMidMs',
        startLabel: 'last birthday',
        endLabel: 'next birthday',
        title: 'Countdown to your next birthday'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How an exact age is calculated',
        paragraphs: [
          'Most "age" you state out loud is just this year minus your birth year, which is right on your birthday and wrong by one for the rest of the year. An exact age needs the month and day too: count the full years from birth to the most recent birthday, then the leftover months and days from that birthday to today. The result is expressed the way people actually say it — "36 years, 3 months and 2 days" — not a single decimal number.',
          'The same birth date also fixes two other figures: the total number of days you have been alive, found by converting both dates to a day count and subtracting, and the days remaining until your next birthday, found by moving the birth month and day forward to the next occurrence on or after today.',
          'Because the calculation depends on today\'s date, the result changes every day without you touching the form. The page reads your device\'s clock after it loads rather than baking in a fixed date, which is why the figures appear a moment after the page first renders.'
        ]
      },
      howTo: {
        intro: 'Enter your date of birth. Every figure below is calculated against today\'s date, read from your device.',
        steps: [
          { name: 'Enter your date of birth', text: 'Fill in the month, day and full four-digit year you were born.' },
          { name: 'Read your age', text: 'The headline is your age in whole years. The rows below fill in the rest: "36" years with "3" plus months and "2" plus days means 36 years, 3 months and 2 days old.' },
          { name: 'Check the total days lived', text: 'This is every calendar day from birth to today, counted exactly rather than estimated from years.' },
          { name: 'See the countdown', text: 'Days until next birthday counts down to the next time your birth month and day come around.' },
          { name: 'Watch the timeline', text: 'The bar spans your last birthday to your next one, with today marked in between.' }
        ],
        outro: 'Everything is calculated in your browser from your device\'s clock. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Years, months and days are counted as a running calendar total, not a single division.',
        expression:
          'years = full birth-month/day occurrences from birth to today\nmonths, days = the remainder from the last birthday to today\ntotalDays = round( (today − birth) ÷ 86,400,000 )\nnextBirthday = this year\'s birth month/day, or next year\'s if it has passed',
        terms: [
          { symbol: 'years', meaning: 'The number of times the birth month and day have occurred on or before today, since birth.' },
          { symbol: 'months, days', meaning: 'What is left after the last full year: the gap from the most recent birthday to today, split into whole months and the remaining days.' },
          { symbol: 'totalDays', meaning: 'Both dates converted to a timestamp and subtracted, the same method the date difference calculator uses, so it is exact to the day.' },
          { symbol: 'nextBirthday', meaning: 'This year\'s birth month and day if that date has not happened yet, otherwise the same date next year.' }
        ],
        note: 'Dates are compared at local midnight, so the age changes at midnight in your device\'s time zone, not at your exact birth time.'
      },
      workedExample: {
        intro: 'Someone was born on March 15, 1990. What is their exact age on June 17, 2026?',
        rows: [
          { label: 'Full years (March 15, 1990 to March 15, 2026)', value: '36 years' },
          { label: 'Months since the last birthday (March 15 to June 15)', value: '3 months' },
          { label: 'Days since then (June 15 to June 17)', value: '2 days' },
          { label: 'Total days lived (March 15, 1990 to June 17, 2026)', value: '13,243 days' },
          { label: 'Next birthday (March 15, 2026 has passed)', value: 'March 15, 2027' },
          { label: 'Days to next birthday (June 17, 2026 to March 15, 2027)', value: '271 days' }
        ],
        result: '36 years, 3 months, 2 days · 13,243 days lived · 271 days to the next birthday',
        explanation:
          'Each figure comes from the same birth date read a different way: the calendar remainder gives years/months/days, the full timestamp gap gives the day count, and moving the birth date forward past today gives the countdown. All three always agree, because they come from the one date.'
      },
      watchOut: [
        { title: 'The age changes at your local midnight', body: 'Not at the moment you were born. Someone born at 11 p.m. turns a year older at midnight the same as someone born at 1 a.m.' },
        { title: 'February 29 birthdays roll forward', body: 'In a year without a leap day, a birth date of February 29 is read as March 1 rather than February 28, because the date simply does not exist that year. Someone born February 29, 2000 has their marked birthday land on March 1 in a year like 2026.' },
        { title: 'Total days is exact; years/months/days is calendar-based', body: 'The day count does not round or average. The years/months/days breakdown depends on how long the specific months in your span are, so two people whose spans are the same number of days will not always show the same months-and-days figure.' },
        { title: 'This is not a legal age determination', body: 'School enrollment cutoffs, drinking age and other eligibility rules sometimes use a different reference date rather than the calendar date of birth. Check the specific rule rather than relying on this figure alone.' },
        { title: 'Uses your device\'s date and time zone', body: 'The result depends on the clock and time zone set on the device you are using. If they are wrong, the age shown will be too.' }
      ],
      references: [
        { label: 'The Open Group, IEEE Std 1003.1-2017 (POSIX.1), Base Definitions §4.16, Seconds Since the Epoch', url: 'https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html' },
        { label: 'Royal Museums Greenwich, Which years are leap years, and can you have leap seconds?', url: 'https://www.rmg.co.uk/stories/time/which-years-are-leap-years-can-you-have-leap-seconds' }
      ]
    },
    inputs: [
      { id: 'birthMonth', label: 'Birth month (1–12)', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 1 },
      { id: 'birthDay', label: 'Birth day (1–31)', type: 'number', placeholder: '15', defaultValue: 15, step: 1, min: 1 },
      { id: 'birthYear', label: 'Birth year', type: 'number', placeholder: '1990', defaultValue: 1990, step: 1, min: 1900 }
    ],
    seo: {
      title: 'Age Calculator – Exact Age in Years, Months and Days',
      description: 'Calculate your exact age in years, months and days from your date of birth, plus total days lived and a countdown to your next birthday.',
      faq: [
        { question: 'How do I calculate my exact age?', answer: 'Enter your date of birth. The calculator counts the full years from your birth date to your most recent birthday, then the leftover months and days up to today — for example 36 years, 3 months and 2 days.' },
        { question: 'How many days old am I?', answer: 'Both dates are converted to a timestamp and subtracted, the same method as the date difference calculator. Someone born March 15, 1990 has lived 13,243 days as of June 17, 2026.' },
        { question: 'Why is my age in months different from just multiplying years by 12?', answer: 'The months figure shown is only the remainder since your last birthday, not your whole age in months. A 36-year-old who is 3 months past their birthday is "36 years, 3 months" old, which is the same point in time as 435 months (36 × 12 + 3) if you want a single running total.' },
        { question: 'How many days until my next birthday?', answer: 'The calculator moves your birth month and day to this year; if that date has already passed, it uses next year instead, then counts the days from today to it. For a March 15 birthday checked on June 17, 2026, the next birthday is March 15, 2027, which is 271 days away.' },
        { question: 'What happens to a February 29 birthday in other years?', answer: 'Since February 29 only exists in leap years, the date rolls forward to March 1 in a year without a leap day. A person born February 29 therefore has their marked birthday land on March 1 in most years.' },
        { question: 'Does the calculator use my time zone?', answer: 'Yes. It reads today\'s date from the device you are using, at local midnight, so results match the date on your own clock.' },
        { question: 'Can I calculate age as of a different date, not today?', answer: 'Not directly — this calculator always measures from today. For the days between your birth date and any other specific date, use the date difference calculator instead.' }
      ]
    },
    compute(values) {
      const now = values.todayMs !== undefined ? new Date(values.todayMs) : new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const birth = new Date(values.birthYear, values.birthMonth - 1, values.birthDay);

      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      years = Math.max(0, years);

      const totalDays = Math.max(0, Math.round((today.getTime() - birth.getTime()) / 86400000));

      let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBirthday.getTime() < today.getTime()) nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
      const daysToNextBirthday = Math.round((nextBirthday.getTime() - today.getTime()) / 86400000);

      return { years, months, days, totalDays, daysToNextBirthday };
    }
  },
  {
    id: 'work-hours-calculator',
    category: 'time',
    group: 'Work & Focus',
    glyph: 'hrs',
    updatedAt: '2026-10-21',
    aliases: ['timesheet calculator', 'hours worked calculator', 'time card calculator', 'shift hours calculator'],
    related: ['paycheck-calculator', 'pto-calculator', 'meeting-cost-calculator', 'freelancer-rate-calculator'],
    title: 'Work Hours Calculator',
    description: 'Calculate total hours worked, overtime, and gross pay for a shift or week. Supports US overtime rules (over 40 hours/week at 1.5×).',
    example: 'Calculate pay for 45 hours worked at $18/hr with standard US overtime.',
    breakdown: {
      headline: 'grossPay',
      headlineLabel: 'Gross pay for the period',
      outputs: [
        { id: 'grossPay', label: 'Gross pay', format: 'currency' },
        { id: 'regularPay', label: 'Regular pay', format: 'currency' },
        { id: 'overtimePay', label: 'Overtime pay', format: 'currency' },
        { id: 'totalHours', label: 'Total hours', format: 'number' },
        { id: 'annualEstimate', label: 'Annualized (52 weeks)', format: 'currency' }
      ],
      groups: [
        { title: 'Hours worked', inputs: ['regularHours', 'overtimeHours'] },
        { title: 'Pay rate', inputs: ['hourlyRate', 'overtimeMultiplier'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'regularPay', label: 'Regular pay' },
          { from: 'overtimePay', label: 'Overtime pay' }
        ],
        center: 'grossPay',
        centerSub: 'gross pay'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How gross pay from hours worked is calculated',
        paragraphs: [
          'Gross pay for an hourly job is the hours you worked multiplied by your rate — but any hours over the overtime threshold are paid at a higher rate, not the plain one. Under the federal Fair Labor Standards Act (FLSA), non-exempt US employees earn at least 1.5 times their regular rate for every hour worked over 40 in a single workweek, with no cap on how much overtime can be worked.',
          'That makes a week really two pay calculations added together: regular hours at the regular rate, plus overtime hours at the regular rate times the overtime multiplier (1.5 for federal "time and a half," 2.0 for double time where it applies). The two amounts sum to gross pay — the figure before taxes, retirement contributions or other withholding.',
          'Some states go further than the federal rule. California and a few others also require daily overtime once a shift passes 8 hours, even in a week that totals under 40, plus a "double time" rate for the longest shifts. The federal weekly rule is the floor everywhere in the US; state rules can only add to it, never take it away.'
        ]
      },
      howTo: {
        intro: 'Enter the hours you worked, split into regular and overtime, and your hourly rate.',
        steps: [
          { name: 'Enter regular hours', text: 'Type the hours worked at your standard rate, typically up to 40 for the week.' },
          { name: 'Enter overtime hours', text: 'Type any hours worked beyond the regular threshold. Leave this at 0 if none apply.' },
          { name: 'Enter your hourly rate', text: 'Type your base hourly pay, before any overtime premium.' },
          { name: 'Check the overtime multiplier', text: 'The US federal standard is 1.5. Change it only if your situation uses a different rate, such as double time.' },
          { name: 'Read the breakdown', text: 'Gross pay is the headline. The chart below splits it into regular and overtime pay, and the yearly estimate multiplies the period by 52.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Regular and overtime pay are calculated separately, then added.',
        expression: 'regularPay = regularHours × rate\novertimePay = overtimeHours × rate × multiplier\ngrossPay = regularPay + overtimePay\nannualEstimate = grossPay × 52',
        terms: [
          { symbol: 'rate', meaning: 'Hourly pay before any overtime premium.' },
          { symbol: 'multiplier', meaning: 'How much more overtime pays than regular time: 1.5 for federal "time and a half," 2.0 for double time.' },
          { symbol: 'annualEstimate', meaning: 'Gross pay for the entered period, times 52, assuming every period looks the same. It is a projection, not a guarantee.' }
        ],
        note: 'Estimates only. This is gross pay before taxes and deductions, and it does not apply any state daily-overtime rule automatically — enter your actual overtime hours by hand if your state requires them.'
      },
      workedExample: {
        intro: 'You work 45 hours in a week at $18 an hour: 40 regular hours and 5 hours of overtime at time and a half.',
        rows: [
          { label: 'Regular pay (40 × $18)', value: '$720.00' },
          { label: 'Overtime pay (5 × $18 × 1.5)', value: '$135.00' },
          { label: 'Total hours (40 + 5)', value: '45' },
          { label: 'Gross pay (720 + 135)', value: '$855.00' },
          { label: 'Annual estimate (855 × 52)', value: '$44,460.00' }
        ],
        result: 'Gross pay $855.00 for the week',
        explanation:
          'The overtime hour effectively pays $27.00 (18 × 1.5), 50% more than the $18.00 regular rate, which is why the 5 overtime hours ($135) are worth more than 5 regular hours would be ($90). The $44,460 annual figure assumes this exact schedule every week of the year, which is rarely exact — treat it as a rough projection, not a salary guarantee.'
      },
      watchOut: [
        { title: 'Overtime is weekly, not daily, under federal law', body: 'The FLSA threshold is 40 hours in a single workweek. Working 10 hours in a day is not automatically overtime under federal rules alone unless the week also tops 40 hours.' },
        { title: 'Some states require daily overtime', body: 'California, for example, requires 1.5× pay after 8 hours in a workday (up to 12) and 2× beyond 12 hours, even in a week under 40 hours total. Check your state labor department if you work long shifts.' },
        { title: 'Salaried and exempt employees are different', body: 'This calculator assumes an hourly, non-exempt worker. Many salaried employees are exempt from overtime rules entirely, depending on their duties and pay level.' },
        { title: 'The federal minimum wage is a floor, not the norm', body: 'The federal minimum wage has been $7.25 an hour since 2009. Many states and cities set a higher minimum, and the higher of the two always applies.' },
        { title: 'The annual estimate assumes no time off', body: 'Multiplying by 52 ignores unpaid leave, holidays, and weeks with different hours. Treat it as a ceiling for a steady schedule, not an exact annual figure.' }
      ],
      references: [
        { label: 'U.S. Department of Labor, Wage and Hour Division, Overtime Pay', url: 'https://www.dol.gov/agencies/whd/overtime' },
        { label: 'U.S. Department of Labor, Wage and Hour Division, Fair Labor Standards Act (FLSA)', url: 'https://www.dol.gov/agencies/whd/flsa' },
        { label: 'California Department of Industrial Relations, DLSE FAQ: Overtime', url: 'https://www.dir.ca.gov/dlse/faq_overtime.htm' }
      ]
    },
    inputs: [
      { id: 'regularHours', label: 'Regular hours worked this week', type: 'number', placeholder: '40', defaultValue: 40, step: 0.25, min: 0 },
      { id: 'overtimeHours', label: 'Overtime hours (over 40/week)', type: 'number', placeholder: '5', defaultValue: 0, step: 0.25, min: 0 },
      { id: 'hourlyRate', label: 'Hourly rate', type: 'currency', placeholder: '18', defaultValue: 18, step: 0.25, min: 0 },
      { id: 'overtimeMultiplier', label: 'Overtime multiplier (US standard = 1.5)', type: 'number', placeholder: '1.5', defaultValue: 1.5, step: 0.25, min: 1 }
    ],
    seo: {
      title: 'Work Hours Calculator – US Overtime Rules',
      description: 'Calculate total hours worked and gross pay including US federal overtime (1.5× for hours over 40/week). Enter regular hours, overtime, and hourly rate.',
      faq: [
        { question: 'How do I calculate gross pay from hours worked?', answer: 'Multiply regular hours by your rate, multiply overtime hours by your rate times the overtime multiplier, then add the two. 40 regular hours plus 5 overtime hours at $18/hr and 1.5× comes to $720.00 + $135.00 = $855.00.' },
        { question: 'When does US overtime kick in?', answer: 'Under the Fair Labor Standards Act (FLSA), non-exempt employees earn 1.5× their regular rate for all hours worked over 40 in a workweek. Some states, including California and Nevada, also have daily overtime rules.' },
        { question: 'Does this calculator handle daily overtime?', answer: 'It applies the federal weekly rule only. For California-style daily overtime (over 8 hours in a day), enter your actual overtime hours by hand or check your state labor department.' },
        { question: 'What is the federal minimum wage?', answer: 'The federal minimum wage has been $7.25 an hour since July 24, 2009. Many states and cities set a higher minimum, and employees are entitled to whichever is higher.' },
        { question: 'What is the difference between gross pay and take-home pay?', answer: 'Gross pay is what this calculator shows: hours times rate, before anything is withheld. Take-home pay subtracts taxes and other deductions — see the paycheck calculator for that step.' },
        { question: 'How reliable is the annual estimate?', answer: 'It multiplies the entered period by 52, assuming every week matches exactly. $855 a week projects to $44,460 a year, but unpaid time off, holidays and schedule changes mean most people earn somewhat less than the straight multiplication.' },
        { question: 'What is double-time pay?', answer: 'Double time pays 2× the regular rate instead of 1.5×. It applies in specific situations, such as hours beyond 12 in a workday under California law. Enter 2 as the overtime multiplier to model it.' }
      ]
    },
    compute(values) {
      const regularPay = values.regularHours * values.hourlyRate;
      const overtimePay = values.overtimeHours * values.hourlyRate * values.overtimeMultiplier;
      const totalHours = values.regularHours + values.overtimeHours;
      const grossPay = regularPay + overtimePay;
      const annualEstimate = grossPay * 52;
      return { totalHours, regularPay, overtimePay, grossPay, annualEstimate };
    }
  },
  {
    id: 'date-difference-calculator',
    category: 'time',
    group: 'Ages & Dates',
    glyph: 'Δd',
    updatedAt: '2026-10-21',
    aliases: ['days between dates calculator', 'date duration calculator', 'countdown calculator', 'weeks between dates', 'days until date'],
    related: ['age-calculator', 'visa-stay-days-calculator', 'pto-calculator', 'work-hours-calculator'],
    title: 'Date Difference Calculator',
    description: 'Find the number of days, weeks, and months between two dates using year, month, and day inputs.',
    example: 'Calculate days between January 1, 2024 and July 4, 2026.',
    breakdown: {
      headline: 'days',
      headlineLabel: 'Days between the dates',
      outputs: [
        { id: 'days', label: 'Days', format: 'integer' },
        { id: 'weeks', label: 'Weeks', format: 'number' },
        { id: 'months', label: 'Months (average, 30.44 days)', format: 'number' }
      ],
      groups: [
        { title: 'Start date', inputs: ['startYear', 'startMonth', 'startDay'] },
        { title: 'End date', inputs: ['endYear', 'endMonth', 'endDay'] }
      ],
      derive: (values) => {
        const start = new Date(values.startYear, values.startMonth - 1, values.startDay).getTime();
        const end = new Date(values.endYear, values.endMonth - 1, values.endDay).getTime();
        return { rangeStartMs: Math.min(start, end), rangeEndMs: Math.max(start, end) };
      },
      visual: {
        type: 'timeline',
        start: 'rangeStartMs',
        end: 'rangeEndMs',
        startLabel: 'start date',
        endLabel: 'end date',
        title: 'The date range'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What "date difference" really calculates',
        paragraphs: [
          'Counting days between two dates by hand is error-prone because months are not all the same length and February changes depending on the year. Computers sidestep the problem the same way this calculator does: every calendar date is converted to a single running number — the milliseconds elapsed since a fixed reference point, often called an epoch — so the "difference" between two dates becomes ordinary subtraction instead of calendar bookkeeping.',
          'The Gregorian calendar, used almost everywhere today, adds a leap day in years divisible by 4, except century years, which are only leap years if divisible by 400 (2000 was a leap year; 1900 was not). That rule is already baked into how a date converts to a timestamp, so a span that crosses February 29 is counted correctly without any special handling.',
          'Once the two dates are timestamps, the difference in days, weeks or months is just division. Days are exact. Weeks divide by 7. Months divide by the average month length, because actual calendar months are not all the same size — that is the one figure here that is an approximation rather than an exact count.'
        ]
      },
      references: [
        { label: 'The Open Group, IEEE Std 1003.1-2017 (POSIX.1), Base Definitions §4.16, Seconds Since the Epoch', url: 'https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html' },
        { label: 'Royal Museums Greenwich, Which years are leap years, and can you have leap seconds?', url: 'https://www.rmg.co.uk/stories/time/which-years-are-leap-years-can-you-have-leap-seconds' }
      ],
      howTo: {
        intro:
          'The two dates go in as separate year, month and day fields, so there is no date format to get wrong. Written out, 3/4/2026 means 3 April in London and 4 March in New York; 2026, 3, 4 means the same thing everywhere.',
        steps: [
          {
            name: 'Enter the start date',
            text: 'Fill the first three fields with the date you are counting from — 2024, 1 and 1 for 1 January 2024. Use the full four-digit year.'
          },
          {
            name: 'Enter the end date',
            text: 'Fill the last three fields with the date you are counting to — 2026, 7 and 4 for 4 July 2026.'
          },
          {
            name: 'Read the day count',
            text: 'Days is the whole number of calendar days between the two dates. It is the figure you want for deadlines, countdowns and visa windows.'
          },
          {
            name: 'Check weeks and months',
            text: 'Weeks and months are the same gap expressed differently, and both keep their decimals — 130.71 weeks is 130 weeks and 5 days.'
          },
          {
            name: 'Reverse the dates if it is easier',
            text: 'The result is an absolute difference, so putting the later date first gives the same answer rather than a negative one.'
          }
        ],
        outro:
          'Nothing is submitted and nothing is stored — every figure is recalculated in your browser as you type.'
      },
      formula: {
        intro:
          'Counting days between dates is subtraction, but not on the calendar — months have four different lengths and February has two. The reliable method is to convert both dates to a single running count of milliseconds, subtract, and convert back.',
        expression:
          'days = round( (endDate − startDate) ÷ 86,400,000 )\nweeks = days ÷ 7\nmonths = days ÷ 30.44',
        terms: [
          {
            symbol: 'endDate − startDate',
            meaning:
              'Both dates as a timestamp — the number of milliseconds since 1 January 1970 — subtracted. Uneven month lengths and leap days are already baked into the timestamp, so nothing needs to be handled separately.'
          },
          {
            symbol: '86,400,000',
            meaning: 'Milliseconds in one day: 1,000 × 60 seconds × 60 minutes × 24 hours.'
          },
          {
            symbol: 'round( … )',
            meaning:
              'Daylight saving makes one day a year 23 hours long and another 25. Rounding to the nearest whole day absorbs that, so a clock change can never shift the count by one.'
          },
          {
            symbol: '30.44',
            meaning:
              'The average length of a month: 365.25 days ÷ 12 = 30.4375, which is why the month figure is an approximation and the day figure is not.'
          }
        ],
        note:
          'Every date in the calculation is treated as midnight local time, so the answer is a count of calendar days rather than a duration in hours.'
      },
      workedExample: {
        intro:
          'Take the gap between 1 January 2024 and 4 July 2026 — a span that contains a leap day, so it is a fair test of the method.',
        rows: [
          { label: 'Start date', value: '1 January 2024 (2024, 1, 1)' },
          { label: 'End date', value: '4 July 2026 (2026, 7, 4)' },
          { label: '2024 (leap year)', value: '366 days' },
          { label: '2025', value: '365 days' },
          { label: '1 January to 4 July 2026', value: '184 days' }
        ],
        result: '915 days · 130.71 weeks · 30.06 months',
        explanation:
          '366 + 365 + 184 = 915 days. Dividing by 7 gives 130.71 weeks, which reads as 130 whole weeks plus 5 days. Dividing by 30.44 gives 30.06 months — close to two and a half years, as expected. Miss the leap day in 2024 and every one of those figures is wrong by one.'
      },
      watchOut: [
        {
          title: 'This is the gap, not an inclusive count',
          body:
            '915 days is the distance between the two dates. If you are counting days a visa is used, days billed, or nights booked and both the first and last day count, add one: 916.'
        },
        {
          title: 'Months are an average, not calendar months',
          body:
            '30.06 months is 915 ÷ 30.44. It is not the same as "30 calendar months and 2 days", because the actual months in that span are not all 30.44 days long. For a notice period, a rental agreement or a contract term, count calendar months on a calendar.'
        },
        {
          title: 'Impossible dates roll forward silently',
          body:
            'Entering 2 for the month and 30 for the day gives 1 or 2 March rather than an error, because out-of-range days are normalised rather than rejected. Check that the day you typed actually exists in that month.'
        },
        {
          title: 'No time of day and no time zone',
          body:
            'Both dates are read as local midnight. A flight leaving at 23:00 and landing at 01:00 counts as one day, not two hours, and a deadline at 09:00 counts the same as one at 17:00.'
        },
        {
          title: 'Business days are a different question',
          body:
            'The count is calendar days, weekends and public holidays included. For a rough working-day figure, multiply the weeks by 5 — 130.71 weeks is about 653 working days before holidays — and subtract the holidays that fall in the range.'
        }
      ]
    },
    inputs: [
      { id: 'startYear', label: 'Start year', type: 'number', placeholder: '2024', defaultValue: 2024, step: 1, min: 1900 },
      { id: 'startMonth', label: 'Start month (1–12)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'startDay', label: 'Start day (1–31)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'endYear', label: 'End year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 },
      { id: 'endMonth', label: 'End month (1–12)', type: 'number', placeholder: '7', defaultValue: 7, step: 1, min: 1 },
      { id: 'endDay', label: 'End day (1–31)', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 }
    ],
    seo: {
      title: 'Date Difference Calculator',
      description: 'Calculate the exact number of days, weeks, and months between any two dates. Useful for deadlines, project planning, and event countdowns.',
      faq: [
        { question: 'How do I calculate the number of days between two dates?', answer: 'Enter the start and end year, month, and day. Both dates are converted to a timestamp, subtracted, and divided by the number of milliseconds in a day, which gives the difference in days, weeks, and months.' },
        { question: 'Does this account for leap years?', answer: 'Yes. Leap days are already part of each date\'s timestamp, so a span covering 29 February 2024 counts it automatically. Between 1 January 2024 and 4 July 2026 the calculator returns 915 days, which includes that extra day.' },
        { question: 'Does the result include both the start and end date?', answer: 'No. The result is the gap between the two dates, so 1 January to 2 January is 1 day. If both the first and last day should count — days of a visa used, nights booked, days billed — add one to the result.' },
        { question: 'Why is the number of months a decimal?', answer: 'Months are not all the same length, so the calculator divides by the average month of 30.44 days (365.25 / 12). That makes the month figure an approximation. The day count is exact, so use it whenever precision matters.' },
        { question: 'How many weeks are between two dates?', answer: 'Divide the day count by 7. The decimal is leftover days rather than a fraction of a week: 130.71 weeks means 130 whole weeks plus 5 days.' },
        { question: 'Can I use it as a countdown to a future date?', answer: 'Yes. Put today in the start fields and the future date in the end fields, and the day count is the number of days until it. The order does not actually matter — the result is an absolute difference, so reversing the dates gives the same answer rather than a negative one.' },
        { question: 'Does the time of day or my time zone change the answer?', answer: 'No. Both dates are treated as midnight local time, so the answer is a count of calendar days. Daylight saving is absorbed by rounding to the nearest whole day, which means a clock change cannot push the count off by one.' },
        { question: 'Can I count business days instead of calendar days?', answer: 'Not directly — the count includes weekends and public holidays. For a rough figure, multiply the number of weeks by 5, then subtract any holidays inside the range.' }
      ]
    },
    compute(values) {
      const start = new Date(values.startYear, values.startMonth - 1, values.startDay).getTime();
      const end = new Date(values.endYear, values.endMonth - 1, values.endDay).getTime();
      const diffMs = Math.abs(end - start);
      const days = Math.round(diffMs / 86400000);
      const weeks = days / 7;
      const months = days / 30.44;
      return { days, weeks, months };
    }
  },
  {
    id: 'sleep-time-calculator',
    category: 'time',
    group: 'Sleep',
    glyph: 'zzz',
    updatedAt: '2026-10-21',
    aliases: ['bedtime calculator', 'sleep cycle calculator', 'wake up time calculator', 'when should i sleep'],
    related: ['pomodoro-timer', 'timezone-meeting-planner', 'age-calculator', 'tdee-calculator'],
    title: 'Sleep Time Calculator',
    description: 'Find the best bedtime or wake-up time based on 90-minute sleep cycles. Plan 5–6 complete cycles for optimal rest.',
    example: 'Find the best wake time if you fall asleep at 10:30 PM.',
    breakdown: {
      headline: 'wakeTimeDecimal',
      headlineLabel: 'Recommended wake time (24-hr decimal)',
      outputs: [
        { id: 'wakeTimeDecimal', label: 'Recommended wake time (24-hr decimal)', format: 'number' },
        { id: 'wakeHour', label: 'Wake hour (24-hr)', format: 'integer' },
        { id: 'wakeMinute', label: 'Wake minute', format: 'integer' },
        { id: 'totalSleepHours', label: 'Total time asleep (hours)', format: 'number' }
      ],
      groups: [
        { title: 'Bedtime', inputs: ['sleepHour', 'sleepMinute'] },
        { title: 'Sleep settings', inputs: ['fallAsleepMinutes', 'targetCycles'] }
      ],
      // Axis: minutes since falling asleep, fixed to 6 cycles so 4/5/6-cycle milestones always fit.
      derive: (values) => {
        const target = values.targetCycles * 90;
        return { axisStart: 0, axisEnd: Math.max(540, target), cycle4: 360, cycle5: 450, cycle6: 540, targetCycleMinutes: target };
      },
      visual: {
        type: 'timeline',
        start: 'axisStart',
        end: 'axisEnd',
        milestones: [
          { label: '4 cycles (6h)', at: 'cycle4' },
          { label: '5 cycles (7.5h)', at: 'cycle5' },
          { label: '6 cycles (9h)', at: 'cycle6' }
        ],
        today: 'targetCycleMinutes',
        startLabel: 'fall asleep',
        endLabel: '6 cycles later',
        title: 'Sleep cycles from the moment you fall asleep'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How the 90-minute sleep cycle method works',
        paragraphs: [
          'Sleep moves through a repeating pattern of stages — light sleep, deep sleep, then REM sleep where most dreaming happens — and one full pass through that pattern is a sleep cycle. The National Heart, Lung, and Blood Institute puts a real cycle at roughly 80 to 100 minutes, with most adults completing four to six of them in a night; this calculator uses 90 minutes as the round-number average.',
          'The idea behind timing sleep around cycles is that waking up in the middle of deep sleep tends to feel groggy, while waking near the boundary between cycles tends to feel easier, because the body is already closer to a lighter stage. The calculator adds whole 90-minute cycles to the moment you actually fall asleep — your bedtime plus however long it typically takes you to drift off — so the suggested wake time lands on one of those boundaries.',
          'Five to six cycles (7.5 to 9 hours) covers the range the CDC recommends for most adults, who need 7 or more hours a night. Fewer than four cycles means under 6 hours of sleep, which is below the recommended range if it happens regularly.'
        ]
      },
      howTo: {
        intro: 'Enter your bedtime, how long you usually take to fall asleep, and the number of cycles you are aiming for.',
        steps: [
          { name: 'Enter your bedtime', text: 'Type the hour (24-hour clock) and minute you plan to get into bed.' },
          { name: 'Enter your fall-asleep time', text: 'The default of 14 minutes is a typical average; adjust it if you know your own number.' },
          { name: 'Choose a target cycle count', text: 'Five or six cycles (7.5 or 9 hours) is the usual recommendation for adults.' },
          { name: 'Read the wake time', text: 'The headline is the 24-hour decimal wake time; the rows below split it into a clock hour and minute.' },
          { name: 'Compare cycle options', text: 'The timeline marks 4, 5 and 6 cycles from the moment you fall asleep, with your chosen target highlighted.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Sleep onset is bedtime plus the time it takes to fall asleep. The wake time is sleep onset plus a whole number of 90-minute cycles.',
        expression: 'sleepOnset = bedtime + fallAsleepMinutes\nwakeTime = sleepOnset + cycles × 90 minutes\ntotalSleepHours = (cycles × 90) ÷ 60',
        terms: [
          { symbol: 'bedtime', meaning: 'When you get into bed intending to sleep, on the 24-hour clock.' },
          { symbol: 'fallAsleepMinutes', meaning: 'Average time from lying down to actually falling asleep; around 14 minutes is typical for a healthy sleeper.' },
          { symbol: 'cycles', meaning: 'How many complete ~90-minute cycles to sleep through. 5–6 is the common target for adults.' }
        ],
        note: '90 minutes is an average. A real cycle runs about 80 to 100 minutes, so an actual wake time can land up to roughly an hour away from the estimate over 6 cycles.'
      },
      workedExample: {
        intro: 'You get into bed at 10:30 p.m. and usually take 14 minutes to fall asleep. What time should you wake up after 6 full cycles?',
        rows: [
          { label: 'Sleep onset (10:30 p.m. + 14 min)', value: '10:44 p.m.' },
          { label: 'One cycle', value: '90 minutes' },
          { label: '6 cycles (6 × 90 min)', value: '540 minutes = 9 hours' },
          { label: 'Wake time (10:44 p.m. + 9 h)', value: '7:44 a.m.' },
          { label: 'Alternative: 5 cycles (7.5 h)', value: 'wake 6:14 a.m.' },
          { label: 'Alternative: 4 cycles (6 h)', value: 'wake 4:44 a.m.' }
        ],
        result: 'Wake at 7:44 a.m. for 6 full cycles (9 hours asleep)',
        explanation: 'Each extra cycle simply adds 90 minutes to the previous wake time: 4:44 a.m., then 6:14 a.m., then 7:44 a.m. Picking between them is a trade-off between more sleep and an earlier start, not a right-or-wrong answer.'
      },
      watchOut: [
        { title: '90 minutes is an average, not your exact cycle', body: 'Real cycles run about 80 to 100 minutes and vary by person and by night, so the suggested wake time is a reasonable estimate, not a guarantee.' },
        { title: 'This counts from sleep onset, not bedtime', body: 'Forgetting to add your fall-asleep time shifts every suggested wake time earlier than it should be.' },
        { title: 'Consistently short sleep carries health risks', body: 'The CDC recommends 7 or more hours a night for adults. Regularly sleeping fewer than 4 cycles (under 6 hours) is associated with health risks and is not something to aim for even if it feels manageable.' },
        { title: 'Waking mid-cycle is not dangerous', body: 'It is just more likely to feel groggy. If your schedule forces an off-cycle wake time, that is a comfort trade-off, not a safety issue.' },
        { title: 'Not medical advice', body: 'Ongoing trouble falling or staying asleep, or feeling unrested despite enough time in bed, are worth discussing with a doctor rather than solving with timing alone.' }
      ],
      references: [
        { label: 'National Heart, Lung, and Blood Institute, Stages of Sleep', url: 'https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep' },
        { label: 'Centers for Disease Control and Prevention, About Sleep', url: 'https://www.cdc.gov/sleep/about/index.html' }
      ]
    },
    inputs: [
      { id: 'sleepHour', label: 'Sleep time – hour (0–23, 24-hr)', type: 'number', placeholder: '22', defaultValue: 22, step: 1, min: 0 },
      { id: 'sleepMinute', label: 'Sleep time – minute (0–59)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'fallAsleepMinutes', label: 'Minutes to fall asleep', type: 'number', placeholder: '14', defaultValue: 14, step: 1, min: 0 },
      { id: 'targetCycles', label: 'Target sleep cycles (5 or 6 recommended)', type: 'number', placeholder: '6', defaultValue: 6, step: 1, min: 1 }
    ],
    seo: {
      title: 'Sleep Time Calculator – Sleep Cycle Planner',
      description: 'Calculate the ideal wake-up time based on 90-minute sleep cycles. Enter your bedtime and the calculator shows when to wake up after 4, 5, or 6 full cycles.',
      faq: [
        { question: 'What is a sleep cycle and how long does it last?', answer: 'A sleep cycle moves through light sleep, deep sleep and REM sleep, and lasts about 80 to 100 minutes according to the National Heart, Lung, and Blood Institute. This calculator uses 90 minutes as a round average.' },
        { question: 'How many sleep cycles should I aim for?', answer: 'Most adults feel best with 5 to 6 cycles, or 7.5 to 9 hours, matching the CDC\'s recommendation of 7 or more hours of sleep a night.' },
        { question: 'What time should I wake up if I get into bed at 10:30 p.m.?', answer: 'Adding 14 minutes to fall asleep and 6 full cycles (9 hours) gives a wake time of about 7:44 a.m. Five cycles would be about 6:14 a.m., and four cycles about 4:44 a.m.' },
        { question: 'Why does waking at the end of a cycle feel better?', answer: 'Each cycle ends in or near lighter sleep before the next one begins. Waking there tends to feel easier than waking during deep sleep in the middle of a cycle.' },
        { question: 'Is less than 6 hours of sleep always bad for one night?', answer: 'One short night is unlikely to cause lasting harm for most people, but the CDC links consistently getting under 7 hours to higher risks for several health conditions. Occasional short nights and a regular pattern of them are different situations.' },
        { question: 'How accurate is the 90-minute estimate?', answer: 'It is an average, not a measurement of your own cycles. Since a real cycle can run from about 80 to 100 minutes, the actual wake time for 6 cycles could be up to roughly an hour earlier or later than the estimate.' },
        { question: 'Does how long I take to fall asleep matter?', answer: 'Yes. The cycles are counted from when you actually fall asleep, not from when you get into bed, so skipping that number shifts every suggested wake time earlier than it should be.' }
      ]
    },
    compute(values) {
      const sleepStartMinutes = values.sleepHour * 60 + values.sleepMinute + values.fallAsleepMinutes;
      const cycleMinutes = 90;
      const wakeMinutes = (sleepStartMinutes + values.targetCycles * cycleMinutes) % 1440;
      const wakeHour = Math.floor(wakeMinutes / 60);
      const wakeMin = wakeMinutes % 60;
      const totalSleepHours = (values.targetCycles * cycleMinutes) / 60;
      const wakeTimeDecimal = wakeHour + wakeMin / 60;
      return { totalSleepHours, wakeTimeDecimal, wakeHour, wakeMinute: wakeMin };
    }
  },
  {
    id: 'business-days-calculator',
    category: 'time',
    group: 'Ages & Dates',
    glyph: 'bd',
    updatedAt: '2026-11-17',
    aliases: ['working days calculator', 'weekdays between dates calculator', 'work days between two dates', 'business day countdown calculator'],
    related: ['date-difference-calculator', 'visa-stay-days-calculator', 'pto-calculator', 'work-hours-calculator'],
    title: 'Business Days Calculator',
    description: 'Count the business days (weekdays, minus weekends) between two dates, with an optional number of holidays to subtract.',
    example: 'Monday, January 5, 2026 to Friday, January 30, 2026 is 26 calendar days but only 20 business days — 19 once Martin Luther King Jr. Day is subtracted.',
    breakdown: {
      headline: 'businessDays',
      headlineLabel: 'Business days',
      outputs: [
        { id: 'businessDays', label: 'Business days (weekdays, minus holidays)', format: 'integer' },
        { id: 'weekendDays', label: 'Weekend days in range', format: 'integer' },
        { id: 'holidaysExcluded', label: 'Holidays subtracted', format: 'integer' },
        { id: 'totalDaysInclusive', label: 'Total calendar days (both dates included)', format: 'integer' }
      ],
      groups: [
        { title: 'Start date', inputs: ['startYear', 'startMonth', 'startDay'] },
        { title: 'End date', inputs: ['endYear', 'endMonth', 'endDay'] },
        { title: 'Holidays', inputs: ['holidaysToExclude'], optional: true }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'businessDays', label: 'Business days' },
          { from: 'weekendDays', label: 'Weekend days' },
          { from: 'holidaysExcluded', label: 'Holidays' }
        ],
        center: 'totalDaysInclusive',
        centerSub: 'total days'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What counts as a business day here',
        paragraphs: [
          'A business day is a weekday — Monday through Friday — so counting business days means counting the days in a range and then removing every Saturday and Sunday. This calculator also counts both the start date and the end date themselves, since that is how most real deadlines work: a task due "5 business days from today" includes today and the fifth day, not just the gap between them.',
          'That is a deliberate difference from the Date Difference Calculator on this site, which measures the calendar-day gap between two dates and does not count either endpoint — 1 January to 2 January is "1 day" there, because it is measuring the distance between the dates, not the number of days touched. Use the date difference calculator for a pure day-count gap; use this one when you want to know how many working days a date range actually covers, inclusive of both ends.',
          'Public holidays are not built in, since they vary by country, state and employer. Instead, enter the number of holidays that fall on a weekday inside your range and the calculator subtracts them from the business-day count. A holiday that already falls on a Saturday or Sunday is excluded by the weekend rule already — don\'t count it twice.'
        ]
      },
      howTo: {
        intro: 'Enter a start date and an end date. Both dates are counted as part of the range.',
        steps: [
          { name: 'Enter the start date', text: 'The first day of the range, included in the count if it is a weekday.' },
          { name: 'Enter the end date', text: 'The last day of the range, also included if it is a weekday.' },
          { name: 'Read the business-day count', text: 'The headline is the number of weekdays in the range, before any holidays are subtracted.' },
          { name: 'Subtract holidays, if any', text: 'Open the Holidays section and enter how many public holidays that fall on a weekday sit inside your date range.' },
          { name: 'Check the breakdown', text: 'The chart below splits the full range into business days, weekend days and subtracted holidays.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The range is split into whole 7-day weeks (5 business days each) plus a short remainder, so no day-by-day loop is needed for the bulk of a long range.',
        expression:
          'totalDays = days from start to end, counting both ends\nfullWeeks = floor(totalDays ÷ 7), each worth 5 business days\nremainder = totalDays − fullWeeks × 7\nbusinessDays = fullWeeks × 5 + (weekdays among the first "remainder" days from the start date) − holidaysToExclude',
        terms: [
          { symbol: 'totalDays', meaning: 'Every calendar day from the start date to the end date, with both dates included.' },
          { symbol: 'fullWeeks', meaning: 'How many complete 7-day weeks fit in the range. Every complete week has exactly 5 weekdays and 2 weekend days, regardless of which day it starts on.' },
          { symbol: 'remainder', meaning: 'The leftover days after removing the full weeks — at most 6 of them — checked one by one against the day of the week they fall on.' },
          { symbol: 'holidaysToExclude', meaning: 'A count of holidays you supply, not specific dates, subtracted from the weekday total.' }
        ],
        note: 'Dates are compared at local midnight, the same convention the date difference and age calculators use. This counts calendar weekends (Saturday and Sunday); it does not know about countries where the weekend falls on different days.'
      },
      workedExample: {
        intro: 'How many business days are there from Monday, January 5, 2026 to Friday, January 30, 2026, a range that includes Martin Luther King Jr. Day (the third Monday in January, January 19, 2026)?',
        rows: [
          { label: 'Total days, both ends included', value: '26 days' },
          { label: 'Full weeks (26 ÷ 7, rounded down)', value: '3 weeks = 15 business days' },
          { label: 'Remaining 5 days (Jan 26–30, Mon–Fri)', value: '5 business days' },
          { label: 'Business days before holidays (15 + 5)', value: '20 days' },
          { label: 'Holidays to subtract (MLK Day, Jan 19)', value: '1 day' },
          { label: 'Business days after holidays (20 − 1)', value: '19 days' }
        ],
        result: '19 business days (20 before subtracting the one holiday), out of 26 calendar days',
        explanation: 'The range runs Monday to Friday, so every one of the 6 weekend days (three Saturdays, three Sundays) is removed automatically, leaving 20 weekdays. January 19 is a Monday that falls inside the range and is a federal holiday, so it is subtracted by hand to reach the final 19.'
      },
      watchOut: [
        { title: 'Both dates are included, unlike the date difference calculator', body: 'This calculator counts the start and end date themselves. The date difference calculator on this site instead measures the gap between two dates and counts neither endpoint — the two are not interchangeable.' },
        { title: 'Holidays are a count, not specific dates', body: 'Enter how many weekday holidays fall inside your range. If a holiday falls on a Saturday or Sunday in a given year, it is already excluded by the weekend rule — do not also count it as a holiday.' },
        { title: 'Only Saturday and Sunday are treated as the weekend', body: 'Some countries use a different weekend (Friday–Saturday, for example). This calculator always removes Saturday and Sunday, which is the US and most-common international convention.' },
        { title: 'Impossible dates roll forward silently', body: 'Entering day 31 for a 30-day month is read as the 1st of the next month rather than rejected, the same behavior as the date difference calculator.' },
        { title: 'This is not a legal deadline calculator', body: 'Court rules, contracts and government agencies sometimes define "business day" with their own exceptions. Check the specific rule for anything with legal or financial consequences.' }
      ],
      references: [
        { label: 'U.S. Office of Personnel Management, Federal Holidays', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/' },
        { label: 'Royal Museums Greenwich, Which years are leap years, and can you have leap seconds?', url: 'https://www.rmg.co.uk/stories/time/which-years-are-leap-years-can-you-have-leap-seconds' }
      ]
    },
    inputs: [
      { id: 'startYear', label: 'Start year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 },
      { id: 'startMonth', label: 'Start month (1–12)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'startDay', label: 'Start day (1–31)', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 1 },
      { id: 'endYear', label: 'End year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 },
      { id: 'endMonth', label: 'End month (1–12)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'endDay', label: 'End day (1–31)', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'holidaysToExclude', label: 'Holidays to subtract (weekdays only)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 0 }
    ],
    seo: {
      title: 'Business Days Calculator – Weekdays Between Dates',
      description: 'Count the business days between two dates, excluding Saturdays and Sundays, with an optional number of holidays to subtract.',
      faq: [
        { question: 'How do I calculate business days between two dates?', answer: 'Enter a start and end date. The calculator counts every day in the range, removes Saturdays and Sundays, and subtracts any holiday count you enter. Monday, January 5, 2026 to Friday, January 30, 2026 is 20 business days before holidays, 19 after subtracting Martin Luther King Jr. Day.' },
        { question: 'Is this the same as the date difference calculator?', answer: 'No. The date difference calculator measures the gap between two dates and does not count either endpoint. This calculator counts both the start and end date and removes weekends, which is the convention most "X business days from now" deadlines use.' },
        { question: 'Does this calculator know my country\'s public holidays?', answer: 'No. Enter the number of weekday holidays that fall inside your date range yourself, and the calculator subtracts that count from the business-day total.' },
        { question: 'What if a holiday falls on a weekend?', answer: 'Don\'t count it. Weekend days are already removed by the weekday rule, so including a weekend holiday in the holiday count would subtract it twice.' },
        { question: 'Does it handle a weekend that isn\'t Saturday and Sunday?', answer: 'No. This calculator always treats Saturday and Sunday as the weekend, the convention used in the US and most countries. It cannot be changed to a different weekend pattern.' },
        { question: 'Can I use this to count business days until a deadline?', answer: 'Yes. Put today\'s date as the start date and the deadline as the end date. Because both dates are included, the result matches how deadlines like "5 business days" are usually counted.' }
      ]
    },
    compute(values) {
      const start = new Date(values.startYear, values.startMonth - 1, values.startDay).getTime();
      const end = new Date(values.endYear, values.endMonth - 1, values.endDay).getTime();
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      const totalDaysInclusive = Math.round((hi - lo) / 86400000) + 1;
      const startDow = new Date(lo).getDay();
      const fullWeeks = Math.floor(totalDaysInclusive / 7);
      const remainder = totalDaysInclusive - fullWeeks * 7;
      let remainderBusinessDays = 0;
      for (let i = 0; i < remainder; i++) {
        const dow = (startDow + i) % 7;
        if (dow !== 0 && dow !== 6) remainderBusinessDays++;
      }
      const rawBusinessDays = fullWeeks * 5 + remainderBusinessDays;
      const weekendDays = totalDaysInclusive - rawBusinessDays;
      const holidaysExcluded = Math.min(Math.max(0, Math.round(values.holidaysToExclude)), rawBusinessDays);
      const businessDays = rawBusinessDays - holidaysExcluded;
      return { businessDays, weekendDays, holidaysExcluded, totalDaysInclusive };
    }
  },
  {
    id: 'day-of-week-calculator',
    category: 'time',
    group: 'Ages & Dates',
    glyph: 'dow',
    updatedAt: '2026-11-17',
    aliases: ['what day of the week calculator', 'day of week finder', 'weekday calculator', 'day name from date calculator'],
    related: ['date-difference-calculator', 'age-calculator', 'leap-year-calculator', 'business-days-calculator'],
    title: 'Day of the Week Calculator',
    description: "Find what day of the week any date falls on, past or future, using Zeller's congruence, a real calendar algorithm.",
    example: 'January 1, 2000 falls on a Saturday.',
    breakdown: {
      headline: 'dayOfWeekCode',
      headlineLabel: 'Day of the week',
      outputs: [
        {
          id: 'dayOfWeekCode',
          label: 'Day of the week',
          labels: [
            { value: 0, label: 'Sunday' },
            { value: 1, label: 'Monday' },
            { value: 2, label: 'Tuesday' },
            { value: 3, label: 'Wednesday' },
            { value: 4, label: 'Thursday' },
            { value: 5, label: 'Friday' },
            { value: 6, label: 'Saturday' }
          ]
        },
        { id: 'isoWeekday', label: 'ISO 8601 weekday number (1 = Monday)', format: 'integer' },
        {
          id: 'isWeekend',
          label: 'Falls on a weekend?',
          labels: [
            { value: 0, label: 'No' },
            { value: 1, label: 'Yes' }
          ]
        }
      ],
      groups: [{ title: 'Date to check', inputs: ['dateYear', 'dateMonth', 'dateDay'] }]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: "How a date's weekday is calculated without a calendar",
        paragraphs: [
          'Any date can be reduced to its weekday with pure arithmetic, no calendar lookup table required. The best-known method is Zeller\'s congruence, which takes the day, month and year and combines them into a single formula whose remainder after dividing by 7 is the weekday. This calculator implements that formula directly rather than reading a day-of-week value out of a pre-built table.',
          'The formula has one quirk worth knowing: it treats January and February as months 13 and 14 of the previous year, so a date like February 2, 2026 is handled internally as month 14 of 2025. That shift exists because the Gregorian leap-day adjustment (the extra February 29) falls most naturally at the end of the "formula year" this way, which keeps the rest of the arithmetic simple.',
          'Because the whole calculation is just floor division and multiplication on the day, month and year you enter, it works identically for any date, past or future, without depending on a device\'s clock or calendar library.'
        ]
      },
      howTo: {
        intro: 'Enter any date. The result is the day of the week it falls on, calculated directly rather than looked up.',
        steps: [
          { name: 'Enter the year, month and day', text: 'Use the full four-digit year for the date you want to check.' },
          { name: 'Read the weekday', text: 'The headline names the day of the week — Sunday through Saturday.' },
          { name: 'Check the ISO weekday number', text: 'A second numbering some countries and the ISO 8601 date standard use, where Monday is 1 and Sunday is 7, instead of the Sunday-first convention shown as the headline.' },
          { name: 'See whether it is a weekend', text: 'A quick yes/no for whether the date falls on a Saturday or Sunday.' }
        ],
        outro: 'Everything is calculated in your browser using the formula below. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "Zeller's congruence for the Gregorian calendar, exactly as the formula is defined, with January and February counted as months 13 and 14 of the previous year.",
        expression:
          'h = ( q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋ − 2J ) mod 7\nK = (adjusted year) mod 100\nJ = ⌊(adjusted year) ÷ 100⌋\nh: 0 = Saturday, 1 = Sunday, 2 = Monday, … 6 = Friday',
        terms: [
          { symbol: 'q', meaning: 'The day of the month, 1–31.' },
          { symbol: 'm', meaning: 'The month number, but counted 3 (March) through 14 (February of the following calendar year) — January and February are shifted into the previous year\'s count.' },
          { symbol: 'K, J', meaning: 'The last two digits of the adjusted year, and the century, found by splitting the adjusted year at the hundreds place.' },
          { symbol: '⌊ ⌋', meaning: 'Floor: round down to the nearest whole number, discarding any remainder.' }
        ],
        note: 'The headline reorders Zeller\'s own 0=Saturday result into the more familiar 0=Sunday numbering. The ISO 8601 weekday figure is a third numbering again, 1=Monday through 7=Sunday, shown separately to avoid mixing the three conventions.'
      },
      workedExample: {
        intro: 'What day of the week is January 1, 2000?',
        rows: [
          { label: 'Adjusted month (January → month 13 of 1999)', value: 'm = 13, adjusted year = 1999' },
          { label: 'K (1999 mod 100)', value: '99' },
          { label: 'J (⌊1999 ÷ 100⌋)', value: '19' },
          { label: 'q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋ − 2J', value: '1 + 36 + 99 + 24 + 4 − 38 = 126' },
          { label: 'h (126 mod 7)', value: '0 → Saturday' }
        ],
        result: 'January 1, 2000 was a Saturday (ISO weekday 6)',
        explanation: 'A result of h = 0 in Zeller\'s own numbering is Saturday. This calculator reorders that into the more familiar Sunday-first numbering for the headline, and separately reports the ISO 8601 numbering (Monday = 1), which places a Saturday at 6.'
      },
      watchOut: [
        { title: 'This is a formula, not a lookup table', body: 'The result comes from Zeller\'s congruence applied to the year, month and day you enter, the same arithmetic shown above — not a pre-built list of dates.' },
        { title: 'January and February shift into "last year" internally', body: 'The formula treats them as months 13 and 14 of the previous year purely as a calculation device. The date you entered and the result shown are still the real calendar date.' },
        { title: 'Three different weekday numbering systems exist', body: 'Zeller\'s own output (0=Saturday), the common Sunday-first numbering (0=Sunday) used for this calculator\'s headline, and the ISO 8601 numbering (1=Monday, shown separately) all number the same seven days differently.' },
        { title: 'Assumes the proleptic Gregorian calendar throughout', body: 'The Gregorian calendar was adopted at different times in different countries, starting in 1582. A date entered from before a country\'s own adoption will not match the day that was actually observed there at the time.' },
        { title: 'No time of day or time zone involved', body: 'This answers a calendar-date question, not a specific instant, so there is nothing to convert between time zones.' }
      ],
      references: [
        { label: "Wikipedia, Zeller's congruence (Gregorian calendar formula and worked example)", url: "https://en.wikipedia.org/wiki/Zeller%27s_congruence" },
        { label: 'Wikipedia, ISO 8601 (weekday numbering, Monday = 1 through Sunday = 7)', url: 'https://en.wikipedia.org/wiki/ISO_8601' }
      ]
    },
    inputs: [
      { id: 'dateYear', label: 'Year', type: 'number', placeholder: '2000', defaultValue: 2000, step: 1, min: 1 },
      { id: 'dateMonth', label: 'Month (1–12)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 },
      { id: 'dateDay', label: 'Day (1–31)', type: 'number', placeholder: '1', defaultValue: 1, step: 1, min: 1 }
    ],
    seo: {
      title: 'Day of the Week Calculator – Zeller\'s Congruence',
      description: "Find the day of the week for any date, past or future, computed with Zeller's congruence, a real calendar formula, not a lookup table.",
      faq: [
        { question: 'What day of the week was January 1, 2000?', answer: "Saturday. Applying Zeller's congruence to January 1, 2000 (treated internally as month 13 of 1999) gives h = 0, which is Saturday in the formula's own numbering." },
        { question: 'What algorithm finds the day of the week from a date?', answer: "This calculator uses Zeller's congruence, a formula that combines the day, month and an adjusted year into a single expression whose remainder after dividing by 7 gives the weekday." },
        { question: 'Why does the formula treat January and February differently?', answer: "Zeller's congruence counts January and February as months 13 and 14 of the previous year, so the leap-day adjustment falls at the natural end of its internal year. The actual calendar date you enter is unaffected." },
        { question: 'What is the ISO 8601 weekday number?', answer: 'ISO 8601 numbers the days 1 through 7 starting with Monday and ending with Sunday, unlike the Sunday-first numbering (0–6) used for this calculator\'s headline. Both describe the same seven days.' },
        { question: 'Does this work for dates before 1900 or after 2100?', answer: "Yes, the formula itself has no date range limit, since it is pure arithmetic on the year, month and day. Dates before a country's own adoption of the Gregorian calendar (starting 1582) will not match the day actually observed there at the time, however." },
        { question: 'Can I check whether a date falls on a weekend?', answer: 'Yes. The "Falls on a weekend?" row answers that directly for Saturdays and Sundays.' }
      ]
    },
    compute(values) {
      let year = values.dateYear;
      let month = values.dateMonth;
      const day = values.dateDay;
      if (month < 3) {
        month += 12;
        year -= 1;
      }
      const K = ((year % 100) + 100) % 100;
      const J = Math.floor(year / 100);
      let h = (day + Math.floor((13 * (month + 1)) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) - 2 * J) % 7;
      h = ((h % 7) + 7) % 7;
      const dayOfWeekCode = (h + 6) % 7;
      const isoWeekday = ((dayOfWeekCode + 6) % 7) + 1;
      const isWeekend = dayOfWeekCode === 0 || dayOfWeekCode === 6 ? 1 : 0;
      return { dayOfWeekCode, isoWeekday, isWeekend };
    }
  },
  {
    id: 'leap-year-calculator',
    category: 'time',
    group: 'Ages & Dates',
    glyph: 'leap',
    updatedAt: '2026-11-17',
    aliases: ['is this year a leap year calculator', 'leap year checker', 'how many leap years between two years', 'leap day calculator'],
    related: ['date-difference-calculator', 'age-calculator', 'day-of-week-calculator', 'business-days-calculator'],
    title: 'Leap Year Calculator',
    description: 'Check whether a year is a leap year under the Gregorian rule, and count how many leap years fall between two years.',
    example: '1900 is not a leap year (divisible by 100, not 400), but 2000 is. 1900–2024 inclusive contains 31 leap years out of 125 total years.',
    breakdown: {
      headline: 'isLeapYear',
      headlineLabel: 'Is the checked year a leap year?',
      outputs: [
        {
          id: 'isLeapYear',
          label: 'Is it a leap year?',
          labels: [
            { value: 0, label: 'No' },
            { value: 1, label: 'Yes' }
          ]
        },
        { id: 'leapYearCount', label: 'Leap years in the range', format: 'integer' },
        { id: 'totalYearsInRange', label: 'Total years in the range', format: 'integer' },
        { id: 'leapYearSharePercent', label: 'Share of the range that is a leap year', format: 'percent' }
      ],
      groups: [
        { title: 'Check a single year', inputs: ['checkYear'] },
        { title: 'Count leap years in a range', inputs: ['rangeStartYear', 'rangeEndYear'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'leapYearCount', label: 'Leap years' },
          { from: 'commonYearCount', label: 'Common years' }
        ],
        center: 'totalYearsInRange',
        centerSub: 'years in range'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'Why the calendar needs leap years, and the exact rule',
        paragraphs: [
          'A year on the calendar is 365 days, but the time Earth actually takes to orbit the Sun — a solar year — is about 365.2422 days, according to Royal Museums Greenwich. Ignoring that extra roughly quarter-day would slowly shift the calendar out of step with the seasons, so an extra day is added to February in most years divisible by 4 to make up the difference.',
          'The Julian calendar did exactly that — a leap year every 4 years, no exceptions — which overcorrects slightly, since 365.25 days a year is a bit more than the real 365.2422. The Gregorian calendar fixes the overcorrection with one additional rule: "the year number must be divisible by four – except for end-of-century years, which must be divisible by 400" (Royal Museums Greenwich). That is why 1900 and 2100 are not leap years despite being divisible by 4, while 2000 and 2400 are, because they also divide evenly by 400.',
          'Counting how many leap years fall in a range of years uses the same rule, just applied to every year in the range at once rather than one at a time: the number of leap years from year 1 up to any year y is ⌊y÷4⌋ − ⌊y÷100⌋ + ⌊y÷400⌋, counting every year divisible by 4, then removing the century years, then adding the divisible-by-400 years back in. Subtracting that count at the start of a range from the count at the end gives the leap years in between.'
        ]
      },
      howTo: {
        intro: 'Check a single year, or set a range to count how many leap years it contains.',
        steps: [
          { name: 'Enter a year to check', text: 'The headline answers whether that one year is a leap year.' },
          { name: 'Enter a start and end year for the range', text: 'Both years are included in the count, in either order.' },
          { name: 'Read the leap year count', text: 'The number of leap years in the range, alongside the total number of years it spans.' },
          { name: 'Check the share', text: 'Roughly 1 year in 4 is a leap year on average; the percentage shows how close your specific range comes to that.' }
        ],
        outro: 'Everything is calculated in your browser using the rule above. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'A single year is tested directly against the Gregorian rule. A range is counted using the same rule applied as a running total.',
        expression:
          'isLeapYear(y) = (y mod 4 = 0) AND (y mod 100 ≠ 0 OR y mod 400 = 0)\nleapYearsUpTo(y) = ⌊y ÷ 4⌋ − ⌊y ÷ 100⌋ + ⌊y ÷ 400⌋\nleapYearCount = leapYearsUpTo(endYear) − leapYearsUpTo(startYear − 1)',
        terms: [
          { symbol: 'y mod 4 = 0', meaning: 'Divisible by 4 — the base rule, true for 3 out of every 4 years.' },
          { symbol: 'y mod 100 ≠ 0', meaning: 'Not an end-of-century year — the exception that removes 1900, 2100 and similar years.' },
          { symbol: 'y mod 400 = 0', meaning: 'Divisible by 400 — the exception to the exception, which puts 2000 and 2400 back in.' },
          { symbol: 'leapYearsUpTo(y)', meaning: 'Counts every leap year from year 1 through year y using the same three tests, without checking each year one by one.' }
        ],
        note: 'Over any 400-year span the Gregorian rule gives exactly 100 − 4 + 1 = 97 leap years, for an average year length of 365 + 97⁄400 = 365.2425 days — closer to the real 365.2422-day solar year than the Julian calendar\'s 365.25.'
      },
      workedExample: {
        intro: 'Is 1900 a leap year, and how many leap years fall between 1900 and 2024 inclusive?',
        rows: [
          { label: '1900 ÷ 4', value: 'divides evenly' },
          { label: '1900 ÷ 100', value: 'also divides evenly — century year' },
          { label: '1900 ÷ 400', value: 'does not divide evenly — the century exception stands' },
          { label: '1900 leap year?', value: 'No' },
          { label: 'Leap years from year 1 through 2024 (⌊2024÷4⌋ − ⌊2024÷100⌋ + ⌊2024÷400⌋)', value: '506 − 20 + 5 = 491' },
          { label: 'Leap years from year 1 through 1899', value: '460' },
          { label: 'Leap years, 1900 through 2024 (491 − 460)', value: '31' },
          { label: 'Total years, 1900 through 2024 inclusive', value: '125' }
        ],
        result: '1900 is not a leap year; 1900–2024 inclusive contains 31 leap years out of 125 total years (about 24.8%)',
        explanation: '1900 fails the leap test because it is a century year not divisible by 400. Counting 31 leap years in 125 years (24.8%) comes out a little under the simple "1 in 4" (25%) estimate, which is exactly what the century exception is supposed to do over a long enough span.'
      },
      watchOut: [
        { title: 'Century years are the exception, not the rule', body: 'Most years divisible by 4 are leap years, but a year divisible by 100 is only a leap year if it is also divisible by 400. 1900, 2100 and 2200 are not leap years; 2000 and 2400 are.' },
        { title: 'The rule is a correction, not a perfect match', body: 'The Gregorian average of 365.2425 days a year is extremely close to the real solar year of about 365.2422 days, but not exact — it will still drift over many thousands of years, just far more slowly than the Julian calendar it replaced.' },
        { title: 'Assumes the proleptic Gregorian calendar throughout', body: 'The Gregorian calendar was adopted at different times in different countries, starting in 1582. Applying this rule to years before a given country\'s own adoption does not match what was actually observed there at the time.' },
        { title: 'February 29 birthdays roll forward in other years', body: 'A birth date or anniversary of February 29 is read as March 1 in a year without a leap day, since the date simply does not exist that year — the same behavior the age calculator uses.' },
        { title: 'The range count includes both years you enter', body: 'Entering 1900 and 2024 counts leap years in every year from 1900 through 2024, not up to but excluding one end.' }
      ],
      references: [
        { label: 'Royal Museums Greenwich, Which years are leap years, and can you have leap seconds?', url: 'https://www.rmg.co.uk/stories/time/which-years-are-leap-years-can-you-have-leap-seconds' }
      ]
    },
    inputs: [
      { id: 'checkYear', label: 'Year to check', type: 'number', placeholder: '1900', defaultValue: 1900, step: 1, min: 1 },
      { id: 'rangeStartYear', label: 'Range start year', type: 'number', placeholder: '1900', defaultValue: 1900, step: 1, min: 1 },
      { id: 'rangeEndYear', label: 'Range end year', type: 'number', placeholder: '2024', defaultValue: 2024, step: 1, min: 1 }
    ],
    seo: {
      title: 'Leap Year Calculator – Check a Year & Count a Range',
      description: 'Check whether a year is a leap year under the Gregorian rule, and count how many leap years fall between two years.',
      faq: [
        { question: 'Is 1900 a leap year?', answer: 'No. 1900 is divisible by 4 and by 100, but not by 400, so the century exception to the Gregorian rule applies and 1900 is a common (non-leap) year.' },
        { question: 'Is 2000 a leap year?', answer: 'Yes. 2000 is divisible by 4, 100 and 400, so it passes the century exception\'s own exception and is a leap year, unlike 1900 or 2100.' },
        { question: 'What is the exact rule for a leap year?', answer: 'A year is a leap year if it is divisible by 4, unless it is also divisible by 100 — in which case it must be divisible by 400 as well. 2024 is a leap year; 2026 is not.' },
        { question: 'How many leap years are there between two given years?', answer: 'The calculator counts leap years from year 1 up to each endpoint using the same rule, then subtracts. Between 1900 and 2024 inclusive there are 31 leap years out of 125 total years.' },
        { question: 'Why do leap years exist at all?', answer: 'Earth takes about 365.2422 days to orbit the Sun, not a flat 365. Adding a day roughly every 4 years keeps the calendar from slowly drifting out of step with the seasons.' },
        { question: 'How accurate is the Gregorian rule?', answer: 'Its 400-year cycle averages 365.2425 days a year, very close to the real 365.2422-day solar year — far closer than the Julian calendar\'s flat 365.25, though still not a perfect match over very long timescales.' }
      ]
    },
    compute(values) {
      const isLeapYear = (values.checkYear % 4 === 0 && (values.checkYear % 100 !== 0 || values.checkYear % 400 === 0)) ? 1 : 0;

      const lo = Math.min(values.rangeStartYear, values.rangeEndYear);
      const hi = Math.max(values.rangeStartYear, values.rangeEndYear);
      const totalYearsInRange = hi - lo + 1;
      const leapYearsUpTo = (y: number) => (y < 1 ? 0 : Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400));
      const leapYearCount = leapYearsUpTo(hi) - leapYearsUpTo(lo - 1);
      const commonYearCount = totalYearsInRange - leapYearCount;
      const leapYearSharePercent = (leapYearCount / totalYearsInRange) * 100;

      return { isLeapYear, leapYearCount, commonYearCount, totalYearsInRange, leapYearSharePercent };
    }
  },
  {
    id: 'unix-timestamp-converter',
    category: 'time',
    group: 'Ages & Dates',
    glyph: 'unix',
    updatedAt: '2026-11-17',
    aliases: ['epoch converter', 'unix time converter', 'timestamp to date calculator', 'epoch to date converter'],
    related: ['date-difference-calculator', 'day-of-week-calculator', 'age-calculator', 'business-days-calculator'],
    title: 'Unix Timestamp Converter',
    description: 'Convert a Unix timestamp (seconds since January 1, 1970 UTC) to a calendar date and time, or a date and time back to its epoch seconds.',
    example: 'Epoch second 1,000,000,000 is September 9, 2001, 01:46:40 UTC.',
    breakdown: {
      headline: 'epochSecondsResult',
      headlineLabel: 'Unix timestamp (seconds since the epoch, UTC)',
      outputs: [
        { id: 'epochSecondsResult', label: 'Unix timestamp (seconds, UTC)', format: 'integer' },
        { id: 'year', label: 'Year (UTC)', format: 'integer' },
        { id: 'month', label: 'Month (UTC)', format: 'integer' },
        { id: 'day', label: 'Day (UTC)', format: 'integer' },
        { id: 'hour', label: 'Hour (UTC, 24-hr)', format: 'integer' },
        { id: 'minute', label: 'Minute (UTC)', format: 'integer' },
        { id: 'second', label: 'Second (UTC)', format: 'integer' }
      ],
      groups: [
        { title: 'Conversion direction', inputs: ['direction'] },
        { title: 'From a Unix timestamp', inputs: ['epochSeconds'] },
        { title: 'From a calendar date & time (UTC)', inputs: ['dateYear', 'dateMonth', 'dateDay', 'dateHour', 'dateMinute', 'dateSecond'], optional: true }
      ],
      derive: (values) => ({ resultEpochMs: values.epochSecondsResult * 1000, epoch0Ms: 0, limit2038Ms: 2147483647000 }),
      visual: {
        type: 'timeline',
        start: 'epoch0Ms',
        end: 'limit2038Ms',
        today: 'resultEpochMs',
        startLabel: 'Unix epoch (1970)',
        endLabel: '32-bit limit (2038)',
        title: 'Where this timestamp falls between the Unix epoch and the 2038 problem'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'What a Unix timestamp actually counts',
        paragraphs: [
          'A Unix timestamp, formally "seconds since the Epoch" in the POSIX standard, is the number of seconds that have elapsed since 00:00:00 Coordinated Universal Time (UTC) on January 1, 1970 — second 0. Every later moment is a positive number counting up from there; moments before 1970 are negative. Storing time as one incrementing number rather than separate year, month, day and time-of-day fields makes comparing two moments, or measuring the gap between them, ordinary subtraction instead of calendar arithmetic.',
          'The standard defines the relationship precisely with a formula for converting a broken-down UTC date and time into seconds, and it is explicit that the model is simplified: POSIX states that "each and every day shall be accounted for by exactly 86400 seconds," meaning a Unix timestamp does not count leap seconds — the occasional extra second added to UTC to keep it aligned with Earth\'s actual rotation. That makes Unix time extremely convenient for arithmetic, at the cost of not being a perfectly precise astronomical clock.',
          'This calculator converts in both directions: give it a timestamp and it reports the matching UTC calendar date and time, or give it a calendar date and time (also in UTC) and it reports the matching timestamp. Everything is shown in UTC specifically, not your device\'s local time zone, so the number is the same no matter where in the world you are.'
        ]
      },
      howTo: {
        intro: 'Pick a direction, then fill in either the timestamp or the calendar fields.',
        steps: [
          { name: 'Choose a direction', text: 'Convert a Unix timestamp to a date, or a date back to a Unix timestamp.' },
          { name: 'Enter the timestamp, or the date and time', text: 'Fill in whichever group matches the direction you picked. All date and time fields are UTC.' },
          { name: 'Read the result', text: 'The headline is the Unix timestamp in seconds; the rows below show the matching year, month, day, hour, minute and second in UTC.' },
          { name: 'Check the timeline', text: 'The bar places your timestamp between the Unix epoch (1970) and the 32-bit signed-integer limit in 2038, for scale.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Converting a UTC calendar date to a timestamp, or back, is the same relationship read in either direction.',
        expression:
          'epochSeconds = (UTC milliseconds for the entered date and time − 0) ÷ 1000\ndate & time = the UTC calendar reading of (epochSeconds × 1000) milliseconds since January 1, 1970, 00:00:00 UTC',
        terms: [
          { symbol: 'the Epoch', meaning: '00:00:00 UTC, January 1, 1970 — second 0 by definition. Timestamps before this moment are negative.' },
          { symbol: 'UTC', meaning: 'Every field on this page, in both directions, is Coordinated Universal Time, not a local time zone.' }
        ],
        note: 'POSIX defines every day as exactly 86,400 seconds and does not count leap seconds, so a Unix timestamp is a simplified, arithmetic-friendly clock rather than an astronomically exact one.'
      },
      workedExample: {
        intro: 'What calendar date and time, in UTC, is Unix timestamp 1,000,000,000?',
        rows: [
          { label: 'Timestamp', value: '1,000,000,000 seconds since the epoch' },
          { label: 'In milliseconds (× 1,000)', value: '1,000,000,000,000 ms since 00:00:00 UTC, Jan 1, 1970' },
          { label: 'UTC calendar reading', value: 'September 9, 2001' },
          { label: 'UTC time of day', value: '01:46:40' }
        ],
        result: 'Unix timestamp 1,000,000,000 is September 9, 2001, 01:46:40 UTC',
        explanation: 'Dividing by the 86,400 seconds POSIX assigns to every day (times 1,000 for milliseconds) walks forward from the 1970 epoch to the matching UTC calendar date and time, the reverse of what the "date and time → timestamp" direction does to a date you enter.'
      },
      watchOut: [
        { title: 'Every field is UTC, not your local time', body: 'Convert to your own time zone separately if you need local time — this calculator does not read your device\'s time zone, so the same timestamp always produces the same UTC fields regardless of where you are.' },
        { title: 'Leap seconds are not counted', body: 'POSIX defines "seconds since the Epoch" so that every day is exactly 86,400 seconds, ignoring the leap seconds occasionally added to UTC. A Unix timestamp is not a perfectly precise astronomical measurement.' },
        { title: 'The "Year 2038 problem" is a storage limit, not a math limit', body: 'Some older 32-bit systems store a Unix timestamp as a signed 32-bit integer, which overflows at 2,147,483,647 seconds — January 19, 2038, 03:14:07 UTC. This calculator does ordinary arithmetic and has no such ceiling.' },
        { title: 'Negative timestamps are valid, but not universally supported', body: 'A negative value represents a date before 1970. The math here handles it correctly, but not every system or tool accepts a negative Unix timestamp.' },
        { title: 'Only the active direction\'s fields are used', body: 'Switching direction uses whichever group of fields matches; the other group\'s values are read only once you switch to that direction.' }
      ],
      references: [
        { label: 'The Open Group, IEEE Std 1003.1-2017 (POSIX.1), Base Definitions §4.16, Seconds Since the Epoch', url: 'https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html' },
        { label: 'Royal Museums Greenwich, Which years are leap years, and can you have leap seconds?', url: 'https://www.rmg.co.uk/stories/time/which-years-are-leap-years-can-you-have-leap-seconds' }
      ]
    },
    inputs: [
      {
        id: 'direction',
        label: 'Conversion direction',
        type: 'number',
        placeholder: '0',
        defaultValue: 0,
        step: 1,
        min: 0,
        options: [
          { value: 0, label: 'Unix timestamp → date & time' },
          { value: 1, label: 'Date & time → Unix timestamp' }
        ]
      },
      { id: 'epochSeconds', label: 'Unix timestamp (seconds since the epoch, UTC)', type: 'number', placeholder: '1000000000', defaultValue: 1000000000, step: 1 },
      { id: 'dateYear', label: 'Year (UTC)', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 },
      { id: 'dateMonth', label: 'Month (UTC, 1–12)', type: 'number', placeholder: '7', defaultValue: 7, step: 1, min: 1 },
      { id: 'dateDay', label: 'Day (UTC, 1–31)', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 1 },
      { id: 'dateHour', label: 'Hour (UTC, 0–23)', type: 'number', placeholder: '12', defaultValue: 12, step: 1, min: 0 },
      { id: 'dateMinute', label: 'Minute (UTC, 0–59)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'dateSecond', label: 'Second (UTC, 0–59)', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    seo: {
      title: 'Unix Timestamp Converter – Epoch Seconds ↔ Date',
      description: 'Convert a Unix timestamp (seconds since Jan 1, 1970 UTC) to a date and time, or a UTC date and time back to its epoch seconds.',
      faq: [
        { question: 'What is a Unix timestamp?', answer: 'The number of seconds elapsed since 00:00:00 UTC on January 1, 1970, the "epoch" defined by the POSIX standard. Timestamp 1,000,000,000 is September 9, 2001, 01:46:40 UTC.' },
        { question: 'Does a Unix timestamp use my local time zone?', answer: 'No. This calculator always converts to and from UTC. Convert the result to your own time zone separately if you need local time.' },
        { question: 'Can a Unix timestamp be negative?', answer: 'Yes, a negative value represents a date before January 1, 1970. The arithmetic here handles negative timestamps correctly, though not every system or tool does.' },
        { question: 'Do Unix timestamps count leap seconds?', answer: 'No. POSIX defines every day as exactly 86,400 seconds, so Unix time does not account for the leap seconds occasionally inserted into UTC.' },
        { question: 'What is the Year 2038 problem?', answer: 'Some older 32-bit systems store a Unix timestamp as a signed 32-bit integer, which overflows at 2,147,483,647 seconds — January 19, 2038, 03:14:07 UTC. This calculator performs ordinary arithmetic and is not affected.' },
        { question: 'How do I convert a date to a Unix timestamp?', answer: 'Switch the direction to "Date & time → Unix timestamp," enter the date and time in UTC, and the headline shows the matching epoch seconds.' }
      ]
    },
    compute(values) {
      const dateToEpoch = values.direction >= 0.5;
      let epochSecondsResult: number, year: number, month: number, day: number, hour: number, minute: number, second: number;
      if (dateToEpoch) {
        epochSecondsResult = Math.round(Date.UTC(values.dateYear, values.dateMonth - 1, values.dateDay, values.dateHour, values.dateMinute, values.dateSecond) / 1000);
        year = values.dateYear;
        month = values.dateMonth;
        day = values.dateDay;
        hour = values.dateHour;
        minute = values.dateMinute;
        second = values.dateSecond;
      } else {
        epochSecondsResult = values.epochSeconds;
        const d = new Date(values.epochSeconds * 1000);
        year = d.getUTCFullYear();
        month = d.getUTCMonth() + 1;
        day = d.getUTCDate();
        hour = d.getUTCHours();
        minute = d.getUTCMinutes();
        second = d.getUTCSeconds();
      }
      return { epochSecondsResult, year, month, day, hour, minute, second };
    }
  },
  {
    id: 'timesheet-calculator',
    category: 'time',
    group: 'Work & Focus',
    glyph: 'ts',
    updatedAt: '2026-11-17',
    aliases: ['weekly timesheet calculator', 'biweekly timesheet calculator', 'employee timesheet calculator', 'weekly hours and overtime rollup calculator'],
    related: ['work-hours-calculator', 'overtime-pay-calculator', 'pto-calculator', 'paycheck-calculator'],
    title: 'Timesheet Calculator',
    description: 'Add up hours worked across a full week, day by day, and split the weekly total into regular and overtime pay at a threshold you set.',
    example: 'Working 9 hours Monday through Friday and 2 hours Saturday (47 hours total) at $20/hr with a 40-hour threshold pays $1,010.00 — $800.00 regular plus $210.00 overtime.',
    breakdown: {
      headline: 'grossPay',
      headlineLabel: 'Gross pay for the week',
      outputs: [
        { id: 'grossPay', label: 'Gross pay', format: 'currency' },
        { id: 'totalHours', label: 'Total hours this week', format: 'number' },
        { id: 'regularHours', label: 'Regular hours', format: 'number' },
        { id: 'overtimeHours', label: 'Overtime hours', format: 'number' },
        { id: 'regularPay', label: 'Regular pay', format: 'currency' },
        { id: 'overtimePay', label: 'Overtime pay', format: 'currency' }
      ],
      groups: [
        { title: 'Hours by day', inputs: ['monHours', 'tueHours', 'wedHours', 'thuHours', 'friHours', 'satHours', 'sunHours'] },
        { title: 'Pay & overtime rule', inputs: ['hourlyRate', 'overtimeThreshold', 'overtimeMultiplier'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'regularPay', label: 'Regular pay' },
          { from: 'overtimePay', label: 'Overtime pay' }
        ],
        center: 'grossPay',
        centerSub: 'gross pay'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'How a weekly timesheet rolls up into pay',
        paragraphs: [
          'A timesheet records hours day by day across a pay period, rather than a single pre-totaled number. This calculator mirrors that: enter the hours worked each day of the week, and it adds them into a weekly total before splitting that total into regular and overtime pay at a threshold you set, 40 hours by default under the federal Fair Labor Standards Act (FLSA).',
          'That is a different starting point from the two other hours-and-pay calculators on this site. The Work Hours Calculator computes pay for a single shift from hours you have already pre-split into regular and overtime. The Overtime Pay Calculator takes one already-combined weekly total and adds a separate double-time tier for hours already identified as subject to a daily double-time rule. This calculator is the one that builds the weekly total itself from a day-by-day entry — closer to how an actual paper or digital timesheet is filled in — but, unlike the Overtime Pay Calculator, it has no separate double-time tier.',
          'Only the weekly total and the threshold decide the split: every hour up to the threshold is regular, and everything past it is overtime at the multiplier you set. The day-by-day entries exist to make adding up the week easier, not to change how the overtime rule is applied.'
        ]
      },
      howTo: {
        intro: 'Enter the hours worked each day of the week, then your hourly rate and overtime rule.',
        steps: [
          { name: 'Enter hours for each day', text: 'Monday through Sunday. Leave a day at 0 if you did not work it.' },
          { name: 'Enter your hourly rate', text: 'Your base pay before any overtime premium.' },
          { name: 'Check the overtime threshold', text: 'Defaults to 40 hours a week, the federal FLSA standard. Change it only if your situation differs.' },
          { name: 'Check the overtime multiplier', text: 'Defaults to 1.5 for standard "time and a half." Adjust it for a different rule.' },
          { name: 'Read the breakdown', text: 'Gross pay is the headline, with the weekly total, regular and overtime hours, and a chart of where the money comes from.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The seven daily entries are summed first; everything else follows the same regular/overtime split the other pay calculators on this site use.',
        expression:
          'totalHours = monHours + tueHours + wedHours + thuHours + friHours + satHours + sunHours\nregularHours = min(totalHours, overtimeThreshold)\novertimeHours = max(0, totalHours − overtimeThreshold)\nregularPay = regularHours × hourlyRate\novertimePay = overtimeHours × hourlyRate × overtimeMultiplier\ngrossPay = regularPay + overtimePay',
        terms: [
          { symbol: 'overtimeThreshold', meaning: 'Hours per week before overtime starts — 40 is the federal FLSA default.' },
          { symbol: 'overtimeMultiplier', meaning: 'How much overtime pays versus regular time — 1.5 ("time and a half") is the federal standard.' }
        ],
        note: 'Estimates only, based on the FLSA federal floor. This calculator does not apply any state daily-overtime rule automatically, and has no double-time tier — use the Overtime Pay Calculator if you need one.'
      },
      workedExample: {
        intro: 'You work 9 hours Monday through Friday and 2 hours Saturday, nothing Sunday, at $20/hr with the standard 40-hour threshold and 1.5× multiplier.',
        rows: [
          { label: 'Daily hours (Mon–Fri 9, Sat 2, Sun 0)', value: '9 + 9 + 9 + 9 + 9 + 2 + 0 = 47 hours' },
          { label: 'Regular hours (min(47, 40))', value: '40' },
          { label: 'Overtime hours (47 − 40)', value: '7' },
          { label: 'Regular pay (40 × $20)', value: '$800.00' },
          { label: 'Overtime pay (7 × $20 × 1.5)', value: '$210.00' },
          { label: 'Gross pay (800 + 210)', value: '$1,010.00' }
        ],
        result: 'Gross pay $1,010.00 for 47 hours worked',
        explanation: 'The daily entries only decide the weekly total of 47 hours — once summed, the overtime split works exactly as it would if 47 had been entered as a single number: 40 hours regular, 7 hours at the 1.5× overtime rate.'
      },
      watchOut: [
        { title: 'Distinct from the Work Hours Calculator', body: 'That calculator computes pay for one shift from hours already split into regular and overtime. This one adds up a full week day by day and splits the total for you.' },
        { title: 'Distinct from the Overtime Pay Calculator', body: 'That calculator takes one already-combined weekly total and adds a separate double-time tier. This one builds the weekly total from daily entries, but has no double-time tier of its own.' },
        { title: 'Federal overtime is weekly, not daily', body: 'The FLSA threshold of 40 hours applies to the week as a whole, not to any single day — working 10 hours in one day is not automatically overtime under federal rules alone.' },
        { title: 'Assumes an hourly, non-exempt worker', body: 'Many salaried employees are exempt from FLSA overtime rules entirely, depending on their duties and pay level. This calculator does not determine exempt status.' },
        { title: 'One week at a time', body: 'For a biweekly or semi-monthly pay period, run this once per week and add the results, rather than entering two weeks of hours at once against a single 40-hour threshold.' }
      ],
      references: [
        { label: 'U.S. Department of Labor, Wage and Hour Division, Overtime Pay', url: 'https://www.dol.gov/agencies/whd/overtime' },
        { label: 'U.S. Department of Labor, Wage and Hour Division, Fair Labor Standards Act (FLSA)', url: 'https://www.dol.gov/agencies/whd/flsa' }
      ]
    },
    inputs: [
      { id: 'monHours', label: 'Monday hours', type: 'number', placeholder: '9', defaultValue: 9, step: 0.25, min: 0 },
      { id: 'tueHours', label: 'Tuesday hours', type: 'number', placeholder: '9', defaultValue: 9, step: 0.25, min: 0 },
      { id: 'wedHours', label: 'Wednesday hours', type: 'number', placeholder: '9', defaultValue: 9, step: 0.25, min: 0 },
      { id: 'thuHours', label: 'Thursday hours', type: 'number', placeholder: '9', defaultValue: 9, step: 0.25, min: 0 },
      { id: 'friHours', label: 'Friday hours', type: 'number', placeholder: '9', defaultValue: 9, step: 0.25, min: 0 },
      { id: 'satHours', label: 'Saturday hours', type: 'number', placeholder: '2', defaultValue: 2, step: 0.25, min: 0 },
      { id: 'sunHours', label: 'Sunday hours', type: 'number', placeholder: '0', defaultValue: 0, step: 0.25, min: 0 },
      { id: 'hourlyRate', label: 'Hourly rate', type: 'currency', placeholder: '20', defaultValue: 20, step: 0.25, min: 0 },
      { id: 'overtimeThreshold', label: 'Weekly overtime threshold (hours)', type: 'number', placeholder: '40', defaultValue: 40, step: 1, min: 0 },
      { id: 'overtimeMultiplier', label: 'Overtime multiplier', type: 'number', placeholder: '1.5', defaultValue: 1.5, step: 0.25, min: 1 }
    ],
    seo: {
      title: 'Timesheet Calculator – Weekly Hours & Overtime',
      description: 'Add up hours worked each day of the week and split the weekly total into regular and overtime pay at a threshold you choose.',
      faq: [
        { question: 'How do I calculate pay from a weekly timesheet?', answer: 'Enter the hours worked each day of the week; the calculator sums them, then splits the weekly total into regular and overtime pay at your threshold. 47 hours at $20/hr with a 40-hour threshold and 1.5× multiplier comes to $800.00 regular plus $210.00 overtime, $1,010.00 total.' },
        { question: 'How is this different from the Work Hours Calculator?', answer: 'The Work Hours Calculator takes hours you have already split into regular and overtime for a single shift. This calculator adds up a full week day by day and does the splitting for you.' },
        { question: 'How is this different from the Overtime Pay Calculator?', answer: 'The Overtime Pay Calculator takes one already-combined weekly total and adds a separate double-time tier. This calculator builds the weekly total from daily entries but has no double-time tier.' },
        { question: 'Does this calculator handle daily overtime rules like California\'s?', answer: 'No, it applies the federal weekly 40-hour rule only. For a state with its own daily overtime rule, adjust your entered hours by hand or use the Overtime Pay Calculator\'s double-time field.' },
        { question: 'What if I work a biweekly pay period?', answer: 'Run the calculator once for each week and add the two results, rather than entering two weeks of hours against a single 40-hour threshold.' },
        { question: 'Are salaried employees covered by this calculator?', answer: 'This assumes an hourly, non-exempt worker. Many salaried employees are exempt from FLSA overtime rules entirely, depending on their duties and pay level.' }
      ]
    },
    compute(values) {
      const totalHours = values.monHours + values.tueHours + values.wedHours + values.thuHours + values.friHours + values.satHours + values.sunHours;
      const regularHours = Math.min(totalHours, values.overtimeThreshold);
      const overtimeHours = Math.max(0, totalHours - values.overtimeThreshold);
      const regularPay = regularHours * values.hourlyRate;
      const overtimePay = overtimeHours * values.hourlyRate * values.overtimeMultiplier;
      const grossPay = regularPay + overtimePay;
      return { totalHours, regularHours, overtimeHours, regularPay, overtimePay, grossPay };
    }
  },
  // Custom-component stub: rendered by a special component in page.tsx. v2 content + WidgetCard restyle in step 39.
  {
    id: 'pomodoro-timer',
    category: 'time',
    group: 'Work & Focus',
    glyph: '25',
    updatedAt: '2026-10-21',
    aliases: ['focus timer', 'study timer', '25 minute timer', 'productivity timer', 'tomato timer'],
    related: ['sleep-time-calculator', 'work-hours-calculator', 'meeting-cost-calculator'],
    title: 'Pomodoro Timer',
    description: 'A configurable Pomodoro timer with focus sessions, short breaks, long breaks, and session tracking. Based on the Pomodoro Technique.',
    example: 'Run 4 × 25-minute focus sessions with 5-minute breaks and a 15-minute long break — one full cycle is 130 minutes.',
    inputs: [],
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What the Pomodoro Technique does',
        paragraphs: [
          'The Pomodoro Technique is a way of structuring work into short, timed sessions separated by breaks, developed by Francesco Cirillo in the late 1980s while he was a university student. The method is named after the tomato-shaped kitchen timer ("pomodoro" is Italian for tomato) he used to hold himself to a fixed block of focused work.',
          'The standard structure is a 25-minute focus session, called a pomodoro, followed by a 5-minute short break. After four pomodoros, the break is longer — 15 to 30 minutes — before the pattern starts again. The timer on this page uses 25/5/15 with a long break every 4 pomodoros as the default, and every duration is adjustable.',
          'The appeal is less about the exact numbers than the structure itself: a visible, counting-down timer makes starting easier than an open-ended "work on this for a while," and a scheduled break gives permission to stop without losing the thread, since the next pomodoro picks it back up.'
        ]
      },
      howTo: {
        intro: 'Set your focus, short break and long break lengths, then start the timer.',
        steps: [
          { name: 'Set your durations', text: 'The defaults are 25 minutes of focus, a 5-minute short break, a 15-minute long break, and a long break every 4 pomodoros. Change any of them before you start.' },
          { name: 'Press Start', text: 'The ring counts down the current phase. Stay on task until it reaches the break.' },
          { name: 'Take the short break', text: 'Step away from the screen, even briefly, before the next focus session begins.' },
          { name: 'Repeat the cycle', text: 'After the number of pomodoros you set, the timer switches to the longer break automatically.' },
          { name: 'Track your count', text: 'Completed pomodoros are shown as filled dots and a running total, useful for estimating how long similar tasks take.' }
        ],
        outro: 'The timer runs entirely in your browser. Closing the tab or letting the device sleep pauses the countdown.'
      },
      formula: {
        intro: 'The technique is a repeating schedule rather than a calculation, but the total time for one cycle follows directly from the settings.',
        expression: 'oneCycleMinutes = N × focus + (N − 1) × shortBreak + longBreak',
        terms: [
          { symbol: 'focus', meaning: 'Length of one pomodoro; 25 minutes by default.' },
          { symbol: 'shortBreak', meaning: 'Break between pomodoros within a cycle; 5 minutes by default.' },
          { symbol: 'N', meaning: 'How many pomodoros before the long break; 4 by default.' },
          { symbol: 'longBreak', meaning: 'The longer break after N pomodoros; 15 minutes by default (the break after the Nth pomodoro replaces that short break).' }
        ],
        note: 'Cirillo\'s own guidance is that the goal is understanding how you work and making realistic choices, not forcing a fixed number of minutes — treat 25/5/15 as a starting point to adjust, not a rule.'
      },
      workedExample: {
        intro: 'Using the defaults — 25-minute focus, 5-minute short break, 15-minute long break every 4 pomodoros — how long is one full cycle?',
        rows: [
          { label: '4 focus sessions (4 × 25 min)', value: '100 minutes' },
          { label: '3 short breaks between them (3 × 5 min)', value: '15 minutes' },
          { label: '1 long break after the 4th pomodoro', value: '15 minutes' },
          { label: 'Total (100 + 15 + 15)', value: '130 minutes' }
        ],
        result: 'One full cycle: 130 minutes (2 hours 10 minutes), with 4 completed pomodoros',
        explanation: 'There are only 3 short breaks for 4 pomodoros, because the break that would follow the 4th pomodoro is the long break instead, not an additional short one.'
      },
      watchOut: [
        { title: 'The timer does not detect interruptions', body: 'If something pulls your attention away, use Skip or Reset rather than letting the countdown run in the background unobserved.' },
        { title: '25 minutes is a starting point, not a rule', body: 'The official guidance from the technique\'s creator frames it as a tool for understanding your own working pattern, not a fixed law. Longer or shorter focus blocks both work if they fit the task.' },
        { title: 'Changing a duration restarts the current phase', body: 'Editing focus, short break or long break length resets the running countdown, so change settings between sessions rather than mid-session.' },
        { title: 'The browser tab needs to stay open', body: 'Since the countdown runs in JavaScript in the page, closing the tab or letting the device sleep pauses it rather than continuing in the background.' },
        { title: 'Breaks still need to be real breaks', body: 'A 5-minute break spent reading more screens defeats the purpose. Standing up, stretching or looking away from a screen is closer to what the short break is for.' }
      ],
      references: [
        { label: 'Duke University Academic Resource Center, Pomodoro Technique', url: 'https://arc.duke.edu/pomodoro-technique' },
        { label: 'Francesco Cirillo, official Pomodoro® Technique site', url: 'https://www.pomodorotechnique.com/' }
      ]
    },
    seo: {
      title: 'Pomodoro Timer – Focus and Break Timer',
      description: 'Configurable Pomodoro timer with customizable focus sessions, short breaks, and long breaks. Tracks completed pomodoros and supports the full Pomodoro Technique.',
      faq: [
        { question: 'What is the Pomodoro Technique?', answer: 'Developed by Francesco Cirillo, the Pomodoro Technique uses 25-minute focused work sessions ("pomodoros") separated by 5-minute breaks. After 4 pomodoros, a longer 15-30 minute break follows.' },
        { question: 'Can I customize the timer durations?', answer: 'Yes. Adjust the focus, short break, and long break lengths, and how many pomodoros happen before a long break, directly in the settings panel.' },
        { question: 'Why is it called Pomodoro?', answer: 'Pomodoro is Italian for tomato. Cirillo used a tomato-shaped kitchen timer as a university student when he developed the technique in the late 1980s.' },
        { question: 'How long is one full Pomodoro cycle?', answer: 'With the defaults (25/5/15 minutes, a long break every 4 pomodoros), one cycle is 4 × 25 + 3 × 5 + 15 = 130 minutes, about 2 hours 10 minutes, covering 4 completed pomodoros.' },
        { question: 'What should I do during the break?', answer: 'Step away from the screen: stand up, stretch, or look at something other than a display. The break is meant to be a real pause, not more reading.' },
        { question: 'What happens if I get interrupted mid-session?', answer: 'The timer keeps counting down regardless. Use Skip to move on to the next phase or Reset to start the session over if an interruption breaks your focus.' },
        { question: 'Is 25 minutes the right length for everyone?', answer: 'No single length suits every task or person. 25 minutes is Cirillo\'s original default; some people use longer blocks for deep work or shorter ones for tedious tasks. Adjust the setting and see what holds your attention.' }
      ]
    },
    compute() { return {}; }
  }
];
