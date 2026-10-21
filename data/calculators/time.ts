import type { CalculatorConfig } from './types.ts';

export const timeCalculators: CalculatorConfig[] = [
  {
    id: 'age-calculator',
    category: 'time',
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
  // Custom-component stub: rendered by a special component in page.tsx. v2 content + WidgetCard restyle in step 39.
  {
    id: 'pomodoro-timer',
    category: 'time',
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
