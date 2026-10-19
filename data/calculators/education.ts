import type { CalculatorConfig } from './types.ts';

export const educationCalculators: CalculatorConfig[] = [
  {
    id: 'gpa-calculator',
    category: 'education',
    updatedAt: '2026-09-10',
    aliases: ['grade point average calculator', 'cgpa calculator', 'college gpa calculator', 'semester gpa calculator'],
    related: ['pomodoro-timer', 'date-difference-calculator', 'character-counter', 'sleep-time-calculator'],
    title: 'GPA Calculator',
    description: 'Calculate your GPA across a full 2-year masters, 3-year, or 4-year bachelor\'s program. Add courses per semester and see per-semester and cumulative GPA instantly.',
    example: 'Calculate cumulative GPA for a 4-year bachelor\'s degree with different courses each semester.',
    inputs: [
      { id: 'course1Grade', label: 'Course 1 grade points (A=4, B=3, C=2, D=1)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0 },
      { id: 'course1Credits', label: 'Course 1 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course2Grade', label: 'Course 2 grade points', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'course2Credits', label: 'Course 2 credits', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'course3Grade', label: 'Course 3 grade points', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 },
      { id: 'course3Credits', label: 'Course 3 credits', type: 'number', placeholder: '2', defaultValue: 2, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'GPA Calculator – 2, 3 & 4 Year Programs',
      description: 'Calculate semester and cumulative GPA for a 2-year masters, 3-year, or 4-year bachelor\'s program. Add unlimited courses per semester.',
      faq: [
        { question: 'How is GPA calculated?', answer: 'Multiply each course grade point by its credit hours, sum the results across all courses, then divide by total credits.' },
        { question: 'What grade point scale does this use?', answer: 'It uses the standard 4.0 scale: A=4, B=3, C=2, D=1, F=0. Decimals like 3.7 (A-) are also accepted.' },
        { question: 'Can I calculate GPA for a full degree?', answer: 'Yes. Select your program type (2-year masters, 3-year, or 4-year bachelor\'s) and the calculator spans all semesters, showing both per-semester and cumulative GPA.' },
        { question: 'How many courses can I add per semester?', answer: 'As many as you need. Use the "+ Add course" button in any semester to add more, and the × button to remove one.' }
      ]
    },
    compute(values) {
      const totalPoints =
        values.course1Grade * values.course1Credits +
        values.course2Grade * values.course2Credits +
        values.course3Grade * values.course3Credits;
      const totalCredits = values.course1Credits + values.course2Credits + values.course3Credits;
      const gpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
      return { gpa, totalCredits, totalPoints };
    }
  }
];
