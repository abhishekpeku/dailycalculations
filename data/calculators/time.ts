import type { CalculatorConfig } from './types.ts';

export const timeCalculators: CalculatorConfig[] = [
  {
    id: 'age-calculator',
    category: 'time',
    updatedAt: '2026-09-10',
    aliases: ['how old am i calculator', 'date of birth calculator', 'age in days calculator', 'birthday calculator'],
    related: ['date-difference-calculator', 'pregnancy-due-date-calculator', 'visa-stay-days-calculator', 'sleep-time-calculator'],
    title: 'Age Calculator',
    description: 'Estimate current age using your birth year and the current year.',
    example: 'Calculate age for someone born in 1990 in the current year.',
    inputs: [
      { id: 'birthYear', label: 'Birth year', type: 'number', placeholder: '1990', defaultValue: 1990, step: 1, min: 1900 },
      { id: 'currentYear', label: 'Current year', type: 'number', placeholder: '2026', defaultValue: 2026, step: 1, min: 1900 }
    ],
    seo: {
      title: 'Age Calculator',
      description: 'Quickly estimate age from a birth year and a current year, including future or past years. Useful for eligibility checks, planning ahead, or a fast estimate without a full birth date.',
      faq: [
        { question: 'How do I calculate age?', answer: 'Subtract the birth year from the current year to estimate age.' },
        { question: 'Can I adjust the current year?', answer: 'Yes, change the current year to estimate age in a future year.' }
      ]
    },
    compute(values) {
      const age = Math.max(0, values.currentYear - values.birthYear);
      return { age };
    }
  },
  {
    id: 'work-hours-calculator',
    category: 'time',
    updatedAt: '2026-09-10',
    aliases: ['timesheet calculator', 'hours worked calculator', 'time card calculator', 'shift hours calculator'],
    related: ['paycheck-calculator', 'pto-calculator', 'meeting-cost-calculator', 'freelancer-rate-calculator'],
    title: 'Work Hours Calculator',
    description: 'Calculate total hours worked, overtime, and gross pay for a shift or week. Supports US overtime rules (over 40 hours/week at 1.5×).',
    example: 'Calculate pay for 45 hours worked at $18/hr with standard US overtime.',
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
        { question: 'When does US overtime kick in?', answer: 'Under the Fair Labor Standards Act (FLSA), non-exempt employees earn 1.5× their regular rate for all hours worked over 40 in a workweek. Some states (CA, NV) also have daily overtime rules.' },
        { question: 'Does this calculator handle daily overtime?', answer: 'This tool applies the federal weekly rule. For California daily overtime (over 8 hrs/day), enter your hours manually or consult your state labor board.' },
        { question: 'What is the federal minimum wage?', answer: 'The federal minimum wage is $7.25/hr as of 2025. Many states and cities have higher minimums — always use the highest applicable rate.' }
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
    updatedAt: '2026-09-10',
    aliases: ['days between dates calculator', 'date duration calculator', 'countdown calculator', 'weeks between dates', 'days until date'],
    related: ['age-calculator', 'visa-stay-days-calculator', 'pto-calculator', 'work-hours-calculator'],
    title: 'Date Difference Calculator',
    description: 'Find the number of days, weeks, and months between two dates using year, month, and day inputs.',
    example: 'Calculate days between January 1, 2024 and July 4, 2026.',
    content: {
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
    updatedAt: '2026-09-10',
    aliases: ['bedtime calculator', 'sleep cycle calculator', 'wake up time calculator', 'when should i sleep'],
    related: ['pomodoro-timer', 'timezone-meeting-planner', 'age-calculator', 'tdee-calculator'],
    title: 'Sleep Time Calculator',
    description: 'Find the best bedtime or wake-up time based on 90-minute sleep cycles. Plan 5–6 complete cycles for optimal rest.',
    example: 'Find the best wake time if you fall asleep at 10:30 PM.',
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
        { question: 'What is a sleep cycle?', answer: 'A sleep cycle lasts about 90 minutes and moves through light sleep, deep sleep, and REM. Waking at the end of a cycle feels more natural and less groggy.' },
        { question: 'How many sleep cycles do I need?', answer: 'Most adults feel best with 5–6 cycles (7.5–9 hours). Fewer than 4 cycles (under 6 hours) consistently is associated with health risks.' },
        { question: 'What time should I go to sleep?', answer: 'Work backwards from your required wake-up time using 90-minute cycles plus your average fall-asleep time (~14 minutes).' }
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
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'pomodoro-timer',
    category: 'time',
    updatedAt: '2026-09-10',
    aliases: ['focus timer', 'study timer', '25 minute timer', 'productivity timer'],
    related: ['sleep-time-calculator', 'work-hours-calculator', 'meeting-cost-calculator'],
    title: 'Pomodoro Timer',
    description: 'A configurable Pomodoro timer with focus sessions, short breaks, long breaks, and session tracking. Based on the Pomodoro Technique.',
    example: 'Run 4 × 25-minute focus sessions with 5-minute breaks and a 15-minute long break.',
    inputs: [],
    seo: {
      title: 'Pomodoro Timer – Focus and Break Timer',
      description: 'Configurable Pomodoro timer with customizable focus sessions, short breaks, and long breaks. Tracks completed pomodoros and supports the full Pomodoro Technique.',
      faq: [
        { question: 'What is the Pomodoro Technique?', answer: 'Developed by Francesco Cirillo, the Pomodoro Technique uses 25-minute focused work sessions separated by 5-minute breaks. After 4 sessions, take a longer 15-30 minute break.' },
        { question: 'Can I customize the timer durations?', answer: 'Yes. Adjust focus, short break, and long break durations, and set how many pomodoros before a long break.' },
        { question: 'Why is it called Pomodoro?', answer: 'Pomodoro is Italian for tomato. Cirillo used a tomato-shaped kitchen timer as a university student when he developed the technique.' }
      ]
    },
    compute() { return {}; }
  }
];
