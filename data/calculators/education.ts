import type { CalculatorConfig } from './types.ts';

export const educationCalculators: CalculatorConfig[] = [
  {
    id: 'gpa-calculator',
    category: 'education',
    group: 'Grades & GPA',
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
  },
  {
    id: 'grade-calculator',
    category: 'education',
    group: 'Grades & GPA',
    glyph: 'GR',
    updatedAt: '2026-11-18',
    aliases: ['weighted grade calculator', 'class grade calculator', 'course grade calculator', 'category weighted grade calculator', 'test and quiz grade calculator'],
    related: ['gpa-calculator', 'weighted-average-calculator', 'percentage-calculator', 'percent-change-calculator'],
    title: 'Grade Calculator',
    description: "Calculate your overall course grade from up to 5 weighted categories — homework, quizzes, tests, a final exam, or whatever your syllabus lists. Enter each category's weight and your score in it.",
    example: "Homework (15% weight, 92% score), quizzes (20%, 85%), tests (35%, 78%) and a final exam (30%, 88%) combine to an overall grade of 84.5%.",
    breakdown: {
      headline: 'overallGrade',
      headlineLabel: 'Overall grade',
      outputs: [
        { id: 'overallGrade', label: 'Overall grade', format: 'percent' },
        { id: 'totalWeight', label: 'Total weight entered', format: 'percent' },
        { id: 'weightedPoints', label: 'Weighted points', format: 'number' }
      ],
      groups: [
        { title: 'Category 1', inputs: ['category1Weight', 'category1Score'] },
        { title: 'Category 2', inputs: ['category2Weight', 'category2Score'] },
        { title: 'Category 3', inputs: ['category3Weight', 'category3Score'] },
        { title: 'Category 4', inputs: ['category4Weight', 'category4Score'], optional: true },
        { title: 'Category 5', inputs: ['category5Weight', 'category5Score'], optional: true }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'category1Weight', label: 'Category 1' },
          { from: 'category2Weight', label: 'Category 2' },
          { from: 'category3Weight', label: 'Category 3' },
          { from: 'category4Weight', label: 'Category 4' },
          { from: 'category5Weight', label: 'Category 5' }
        ],
        center: 'overallGrade',
        centerSub: 'overall grade'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What a weighted-category grade is, and how it differs from GPA',
        paragraphs: [
          "Most course syllabi don't average every assignment equally — they group assignments into categories (homework, quizzes, tests, a final exam) and assign each category a weight, the share of the final grade it controls. Your score in each category is multiplied by that category's weight, those products are added up, and the total is divided by the sum of the weights. A category worth 35% of the grade affects the outcome far more than one worth 5%, no matter how many individual assignments sit inside it.",
          "This is a different calculation from GPA, even though both average weighted numbers. GPA combines whole courses that are already finished and graded — it takes each course's final letter grade (converted to points) and weights it by credit hours. This calculator works one level down, inside a single course that hasn't finished yet: it combines category scores, before any letter grade exists, to estimate where that one course's percentage grade currently stands.",
          'The underlying arithmetic — multiply each number by its weight, sum, divide by the total weight — is exactly the general weighted mean described by Wolfram MathWorld and used by the site\'s own weighted average calculator. This page is that same formula specialized for the specific labels and 0-100% scale a course syllabus uses, the way the GPA calculator specializes it for letter grades and credit hours.'
        ]
      },
      howTo: {
        intro: "Enter the weight and your score for each grading category on your syllabus. Categories 4 and 5 are optional extra slots.",
        steps: [
          { name: "Enter each category's weight", text: "The percent of the final grade your syllabus assigns to that category — for example, homework 15%, quizzes 20%, tests 35%, final exam 30%." },
          { name: "Enter your score in each category", text: 'Your percentage earned within that category, not your letter grade — for example, 92% on homework.' },
          { name: 'Add more categories if needed', text: 'Open categories 4 and 5 for a longer syllabus; leave any category\'s weight at 0 to exclude it entirely.' },
          { name: 'Read your overall grade', text: 'The headline is your weighted overall grade, with total weight entered and weighted points below it.' },
          { name: 'Check the weight distribution', text: "The donut shows how much of your grade each category controls, which categories carry the most risk if a score there drops." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The overall grade is total weighted points divided by total weight, where each category\'s weighted points are its weight times your score in it.',
        expression: 'categoryPoints = weight × score\ntotalPoints = sum of categoryPoints across all categories\ntotalWeight = sum of weight across all categories\nGrade = totalPoints ÷ totalWeight',
        terms: [
          { symbol: 'weight', meaning: "The percent of your final grade this category is worth, per your syllabus." },
          { symbol: 'score', meaning: 'Your percentage score earned within that category.' }
        ],
        note: "If your weights don't add up to exactly 100%, the grade is still correct — the formula divides by whatever total weight you entered, not a fixed 100 — but double-check your syllabus for the exact category list and weights first."
      },
      workedExample: {
        intro: 'Four categories: homework (15% weight, 92% score), quizzes (20%, 85%), tests (35%, 78%) and a final exam (30%, 88%).',
        rows: [
          { label: 'Category points (weight × score)', value: '1,380, 1,700, 2,730, 2,640' },
          { label: 'Total points (sum)', value: '8,450' },
          { label: 'Total weight (15+20+35+30)', value: '100' },
          { label: 'Grade (8,450 ÷ 100)', value: '84.5%' }
        ],
        result: 'Overall grade = 84.5%',
        explanation: "The heavily weighted test category (35%) and a middling 78% score there pull the average down more than the strong homework score pulls it up, because tests carry more than twice homework's weight."
      },
      watchOut: [
        { title: "The categories and weights are your syllabus's, not a fixed rule", body: 'Every class sets its own categories and weights; there is no standard breakdown. Check your syllabus before entering numbers here.' },
        { title: "Weights don't need to total 100", body: "The formula divides by the total weight you actually entered, so 15/20/35/30 and 1.5/2/3.5/3 give the same grade — there's no need to rescale first." },
        { title: 'This is not your GPA', body: "GPA averages finished courses by credit hours, using letter-grade points. This calculator averages categories inside one unfinished course, using raw percentage scores — see the GPA calculator for the course-level calculation." },
        { title: "A category weight of 0 excludes it entirely", body: 'Leave any unused category slot\'s weight at 0 and it adds nothing to the total weight or the weighted points — identical to leaving it out.' },
        { title: 'Only 5 category slots', body: 'A syllabus with more than 5 categories needs its extra categories combined by hand into one of the five rows first (sum their weights, and weight-average their scores) before entering a single combined row.' }
      ],
      references: [
        { label: 'Wolfram MathWorld, Weighted Mean', url: 'https://mathworld.wolfram.com/WeightedMean.html' },
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' }
      ]
    },
    inputs: [
      { id: 'category1Weight', label: 'Category 1 weight', type: 'percent', placeholder: '15', defaultValue: 15, step: 1, min: 0 },
      { id: 'category1Score', label: 'Category 1 score', type: 'percent', placeholder: '92', defaultValue: 92, step: 0.1, min: 0 },
      { id: 'category2Weight', label: 'Category 2 weight', type: 'percent', placeholder: '20', defaultValue: 20, step: 1, min: 0 },
      { id: 'category2Score', label: 'Category 2 score', type: 'percent', placeholder: '85', defaultValue: 85, step: 0.1, min: 0 },
      { id: 'category3Weight', label: 'Category 3 weight', type: 'percent', placeholder: '35', defaultValue: 35, step: 1, min: 0 },
      { id: 'category3Score', label: 'Category 3 score', type: 'percent', placeholder: '78', defaultValue: 78, step: 0.1, min: 0 },
      { id: 'category4Weight', label: 'Category 4 weight (optional)', type: 'percent', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'category4Score', label: 'Category 4 score', type: 'percent', placeholder: '88', defaultValue: 88, step: 0.1, min: 0 },
      { id: 'category5Weight', label: 'Category 5 weight (optional, leave 0 to exclude)', type: 'percent', placeholder: '0', defaultValue: 0, step: 1, min: 0 },
      { id: 'category5Score', label: 'Category 5 score', type: 'percent', placeholder: '0', defaultValue: 0, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Grade Calculator – Weighted Category Average',
      description: "Calculate your overall grade from weighted categories like homework, quizzes, tests and a final exam. Enter each category's weight and score.",
      faq: [
        { question: 'How is a weighted grade calculated?', answer: "Multiply each category's weight by your score in it, add those across all categories, then divide by total weight. Homework (15%, 92), quizzes (20%, 85), tests (35%, 78) and a final (30%, 88) give 8,450 ÷ 100 = 84.5%." },
        { question: 'How is this different from the GPA calculator?', answer: "GPA averages whole, finished courses by credit hours using letter-grade points. This calculator averages the categories inside one still-in-progress course using raw percentage scores — it answers a different, earlier question." },
        { question: 'How is this different from the weighted average calculator?', answer: "Same underlying formula — weight × value, summed, divided by total weight — just labeled and scaled for a course grade (percent categories and percent scores). Use the weighted average calculator for any other value/weight scenario." },
        { question: 'Do my category weights need to add up to 100%?', answer: "No. The formula divides by whatever total weight you enter, so 15/20/35/30 and a rescaled 1.5/2/3.5/3 produce the identical grade." },
        { question: 'What if my class only has 3 grading categories?', answer: 'Leave categories 4 and 5 at a weight of 0 — they will be excluded from both the total weight and the weighted points automatically.' },
        { question: 'Can I combine several small assignments into one category?', answer: "Yes — if your syllabus has more than 5 categories, combine the extra ones by hand (sum their weights, weight-average their scores) into a single row before entering it here." }
      ]
    },
    compute(values) {
      const categories: [number, number][] = [
        [values.category1Weight, values.category1Score],
        [values.category2Weight, values.category2Score],
        [values.category3Weight, values.category3Score],
        [values.category4Weight, values.category4Score],
        [values.category5Weight, values.category5Score]
      ];
      const weightedPoints = categories.reduce((sum, [weight, score]) => sum + weight * score, 0);
      const totalWeight = categories.reduce((sum, [weight]) => sum + weight, 0);
      const overallGrade = totalWeight === 0 ? 0 : weightedPoints / totalWeight;
      return { overallGrade, totalWeight, weightedPoints };
    }
  }
];
