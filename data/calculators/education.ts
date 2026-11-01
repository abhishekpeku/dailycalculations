import type { CalculatorConfig } from './types.ts';

export const educationCalculators: CalculatorConfig[] = [
  {
    id: 'gpa-calculator',
    category: 'education',
    glyph: 'GPA',
    updatedAt: '2026-10-21',
    aliases: ['grade point average calculator', 'cgpa calculator', 'college gpa calculator', 'semester gpa calculator'],
    related: ['date-difference-calculator', 'character-counter', 'sleep-time-calculator', 'pomodoro-timer'],
    title: 'GPA Calculator',
    description: 'Calculate your grade point average on the standard 4.0 scale from up to 6 courses, with total credits, total grade points, and a credit-weighted grade distribution. Grading scales vary by school — check yours.',
    example: 'Six courses — grades of 4.0, 3.7, 3.3, 3.0, 2.0 and 3.7 across 3-4 credits each — average to a 3.28 GPA on 19 total credits.',
    breakdown: {
      headline: 'gpa',
      headlineLabel: 'GPA',
      outputs: [
        { id: 'gpa', label: 'GPA', format: 'number' },
        { id: 'totalCredits', label: 'Total credits', format: 'number' },
        { id: 'totalPoints', label: 'Total grade points', format: 'number' }
      ],
      groups: [
        { title: 'Course 1', inputs: ['course1Grade', 'course1Credits'] },
        { title: 'Course 2', inputs: ['course2Grade', 'course2Credits'] },
        { title: 'Course 3', inputs: ['course3Grade', 'course3Credits'] },
        { title: 'Course 4', inputs: ['course4Grade', 'course4Credits'], optional: true },
        { title: 'Course 5', inputs: ['course5Grade', 'course5Credits'], optional: true },
        { title: 'Course 6', inputs: ['course6Grade', 'course6Credits'], optional: true }
      ],
      // Letter-grade bands for the chart only: this calculator's own rounding convention, not an
      // official or universal GPA-points-to-letter mapping (real cutoffs vary by school).
      derive: (values) => {
        const courses = [
          [values.course1Grade, values.course1Credits],
          [values.course2Grade, values.course2Credits],
          [values.course3Grade, values.course3Credits],
          [values.course4Grade, values.course4Credits],
          [values.course5Grade, values.course5Credits],
          [values.course6Grade, values.course6Credits]
        ];
        const bands = { aCredits: 0, bCredits: 0, cCredits: 0, dCredits: 0, fCredits: 0 };
        for (const [grade, credits] of courses) {
          if (!(credits > 0)) continue;
          if (grade >= 3.5) bands.aCredits += credits;
          else if (grade >= 2.5) bands.bCredits += credits;
          else if (grade >= 1.5) bands.cCredits += credits;
          else if (grade >= 0.5) bands.dCredits += credits;
          else bands.fCredits += credits;
        }
        return bands;
      },
      visual: {
        type: 'donut',
        segments: [
          { from: 'aCredits', label: 'A range (3.5-4.0)' },
          { from: 'bCredits', label: 'B range (2.5-3.49)' },
          { from: 'cCredits', label: 'C range (1.5-2.49)' },
          { from: 'dCredits', label: 'D range (0.5-1.49)' },
          { from: 'fCredits', label: 'F range (below 0.5)' }
        ],
        center: 'totalCredits',
        centerSub: 'total credits'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How GPA is calculated, and why scales vary by school',
        paragraphs: [
          'A grade point average is a credit-weighted mean: each course\'s grade (as a number of "grade points") is multiplied by its credit hours, those products are added up across every course, and the total is divided by total credits. A 4-credit course affects the average twice as much as a 2-credit course, which is the entire reason GPA uses credits at all rather than a simple average of letter grades.',
          'The widely used reference point is a 4.0 scale — A worth 4 points, B worth 3, C worth 2, D worth 1, F worth 0 — which the College Board describes as "just one common example," not a universal standard. Plus and minus grades commonly sit between those whole numbers, but even that detail is not fixed: one university\'s registrar lists A- as 3.7 grade points, while another lists it as 3.6667, on otherwise similar 4.0 scales. Some high schools also weight GPA upward for honors, AP or IB courses, pushing the scale above 4.0 entirely.',
          'Because of this variation, the only way to know your own school\'s exact scale is to check your school\'s own catalog or registrar page. This calculator uses the common A=4/B=3/C=2/D=1/F=0 points (with standard plus/minus fractions) and a credit-weighted average — the calculation method is close to universal, even where the exact point values are not.'
        ]
      },
      howTo: {
        intro: 'Enter the grade points and credit hours for each course. Courses 4-6 are optional extra slots.',
        steps: [
          { name: 'Enter grade points for each course', text: 'Use your school\'s scale — most commonly 4.0 for an A, down to 0 for an F, with plus/minus grades as decimals (3.7 for an A-, for example).' },
          { name: 'Enter credit hours for each course', text: 'Usually 1-5 credits per course; check your transcript or course catalog for the exact figure.' },
          { name: 'Add more courses if needed', text: 'Open courses 4, 5 and 6 for a fuller semester; leave any course\'s credits at 0 to exclude it entirely.' },
          { name: 'Read your GPA', text: 'The headline is your credit-weighted GPA, with total credits and total grade points below it.' },
          { name: 'Check the grade distribution', text: 'The donut groups your credit hours into A/B/C/D/F ranges, a quick visual on where your credits are concentrated.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'GPA is total grade points divided by total credits, where each course\'s grade points are its grade value times its credits.',
        expression: 'coursePoints = grade × credits\ntotalPoints = sum of coursePoints across all courses\ntotalCredits = sum of credits across all courses\nGPA = totalPoints ÷ totalCredits',
        terms: [
          { symbol: 'grade', meaning: 'Grade points on your school\'s scale — commonly 4.0 for an A down to 0 for an F, with decimals for plus/minus grades.' },
          { symbol: 'credits', meaning: 'The credit hours (or "units") assigned to the course, which weight its effect on the average.' }
        ],
        note: 'Check your own school\'s catalog or registrar for its exact grade-point scale before relying on this for an official record — scales and plus/minus values are not standardized, even though the credit-weighted averaging method is nearly universal.'
      },
      workedExample: {
        intro: 'Six courses: grades of 4.0 (3 credits), 3.7 (3 credits), 3.3 (4 credits), 3.0 (3 credits), 2.0 (3 credits), and 3.7 (3 credits).',
        rows: [
          { label: 'Grade points per course (grade × credits)', value: '12.0, 11.1, 13.2, 9.0, 6.0, 11.1' },
          { label: 'Total grade points (sum)', value: '62.4' },
          { label: 'Total credits (3+3+4+3+3+3)', value: '19' },
          { label: 'GPA (62.4 ÷ 19)', value: '3.2842' }
        ],
        result: 'GPA ≈ 3.28 on 19 total credits',
        explanation: 'The two A- grades (3.7 each) and the single A (4.0) pull the average up, while the C (2.0) pulls it down; because every course here carries 3 or 4 credits, no single course dominates the average as much as a 1-credit course would if it were included.'
      },
      watchOut: [
        { title: 'Grading scales are not standardized', body: 'The College Board\'s own guidance states plainly that schools use different grading scales and cautions students to "always check with your school for the most accurate GPA conversion" — a figure from this calculator should be checked against your school\'s own scale before you rely on it.' },
        { title: 'Plus/minus values differ even on a 4.0 scale', body: 'One university registrar lists A- as 3.7 grade points; another lists the same letter grade as 3.6667. Both are legitimate 4.0-scale schools — the exact decimal is a school-specific choice, not a fixed rule.' },
        { title: 'This does not model weighted (honors/AP/IB) GPA', body: 'Some high schools add bonus points for advanced courses, pushing the scale above 4.0. Enter your school\'s actual weighted grade points per course if that applies to you — this calculator does not add weighting automatically.' },
        { title: 'Only 6 course slots', body: 'A semester with more than 6 courses needs to be entered as more than one pass, or combined by summing grade points and credits for extra courses by hand before entering a single combined row.' },
        { title: 'The grade-distribution chart uses this page\'s own bands', body: 'The A/B/C/D/F credit grouping in the chart is a rounding convention for the visual only, not an official or universal scale — your school\'s actual letter-grade cutoffs may place a borderline grade point differently.' }
      ],
      references: [
        { label: 'College Board, BigFuture: How to Calculate Your GPA on a 4.0 Scale', url: 'https://bigfuture.collegeboard.org/plan-for-college/get-started/how-to-calculate-gpa-4.0-scale' },
        { label: 'University of North Carolina at Chapel Hill, Office of the University Registrar: Explanation of Grading System', url: 'https://registrar.unc.edu/explanation-of-grading-system/' },
        { label: 'University of Cincinnati, Office of the Registrar: Grading Scales and Definitions', url: 'https://www.uc.edu/about/registrar/transcripts-diplomas-verifications/grading-scales.html' }
      ]
    },
    inputs: [
      { id: 'course1Grade', label: 'Course 1 grade points (A=4, B=3, C=2, D=1)', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0 },
      { id: 'course1Credits', label: 'Course 1 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course2Grade', label: 'Course 2 grade points', type: 'number', placeholder: '3.7', defaultValue: 3.7, step: 0.1, min: 0 },
      { id: 'course2Credits', label: 'Course 2 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course3Grade', label: 'Course 3 grade points', type: 'number', placeholder: '3.3', defaultValue: 3.3, step: 0.1, min: 0 },
      { id: 'course3Credits', label: 'Course 3 credits', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'course4Grade', label: 'Course 4 grade points', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'course4Credits', label: 'Course 4 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course5Grade', label: 'Course 5 grade points', type: 'number', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 },
      { id: 'course5Credits', label: 'Course 5 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course6Grade', label: 'Course 6 grade points', type: 'number', placeholder: '3.7', defaultValue: 3.7, step: 0.1, min: 0 },
      { id: 'course6Credits', label: 'Course 6 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'GPA Calculator – 4.0 Scale, Up to 6 Courses',
      description: 'Calculate your GPA on the standard 4.0 scale from up to 6 courses, with total credits, total grade points, and a grade distribution chart. Scales vary by school — see sources.',
      faq: [
        { question: 'How is GPA calculated?', answer: 'Multiply each course\'s grade points by its credit hours, add the results across all courses, then divide by total credits. Six courses totaling 62.4 grade points over 19 credits give a 3.28 GPA.' },
        { question: 'What grade point scale does this use?', answer: 'The common 4.0 scale: A=4, B=3, C=2, D=1, F=0, with decimals like 3.7 for an A- accepted. The College Board describes this as "just one common example" of a grading scale, not a universal standard.' },
        { question: 'Do all schools use the same GPA scale?', answer: 'No. Grading scales vary by school. One university registrar lists A- as 3.7 grade points; another lists it as 3.6667 on an otherwise similar 4.0 scale. Always check your own school\'s catalog or registrar for its exact scale.' },
        { question: 'Can I calculate GPA for more than 6 courses?', answer: 'Not directly in one pass — this calculator has 6 course slots. For more courses, sum the grade points and credit hours for the extra courses by hand and combine them into one of the six rows, or calculate in two passes and combine the totals.' },
        { question: 'Does this handle weighted GPA for AP, IB, or honors courses?', answer: 'Not automatically. If your school adds bonus grade points for advanced courses, enter the already-weighted grade point value for that course rather than the standard 4.0-scale value.' },
        { question: 'What does the grade distribution chart show?', answer: 'It groups your total credit hours into A/B/C/D/F ranges based on each course\'s grade points, using this calculator\'s own rounding bands for the chart — not an official or universal letter-grade cutoff.' },
        { question: 'Can I leave a course out of the calculation?', answer: 'Yes — set that course\'s credits to 0 and it will not affect the GPA, total credits, or total grade points.' }
      ]
    },
    compute(values) {
      const courses: [number, number][] = [
        [values.course1Grade, values.course1Credits],
        [values.course2Grade, values.course2Credits],
        [values.course3Grade, values.course3Credits],
        [values.course4Grade, values.course4Credits],
        [values.course5Grade, values.course5Credits],
        [values.course6Grade, values.course6Credits]
      ];
      const totalPoints = courses.reduce((sum, [grade, credits]) => sum + grade * credits, 0);
      const totalCredits = courses.reduce((sum, [, credits]) => sum + credits, 0);
      const gpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
      return { gpa, totalCredits, totalPoints };
    }
  }
];
