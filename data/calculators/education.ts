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
  },
  {
    id: 'final-grade-calculator',
    category: 'education',
    group: 'Grades & GPA',
    glyph: 'FG',
    updatedAt: '2026-11-18',
    aliases: ['what grade do i need on my final', 'final exam grade calculator', 'exam score needed calculator', 'what do i need on my final calculator'],
    related: ['grade-calculator', 'gpa-calculator', 'weighted-average-calculator', 'percentage-calculator'],
    title: 'Final Grade Calculator',
    description: "Find the score you need on your final exam to reach a target overall grade, given your current grade and the final's weight. Also shows the best grade you could still reach.",
    example: "Currently at 82%, with a final exam worth 25% of the grade, reaching an 85% overall requires a 94% on the final.",
    breakdown: {
      headline: 'neededScore',
      headlineLabel: 'Score needed on the final',
      outputs: [
        { id: 'neededScore', label: 'Score needed on the final', format: 'percent' },
        { id: 'maxPossibleGrade', label: 'Best possible overall grade (100% on the final)', format: 'percent' },
        { id: 'currentContribution', label: "Current grade's contribution so far", format: 'percent' }
      ],
      groups: [
        { title: 'Your numbers', inputs: ['currentGrade', 'finalWeight', 'desiredGrade'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'desiredGrade', label: 'Target overall grade' },
          { from: 'neededScore', label: 'Needed on the final' },
          { from: 'maxPossibleGrade', label: 'Best possible overall' }
        ],
        title: 'Target vs. what the final needs to be',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: '"What do I need on my final?", worked backward from your target grade',
        paragraphs: [
          "Your overall grade is a weighted average of your current grade (everything before the final) and your final exam score, weighted by how much the final counts. If the final is worth 25% of the grade, your current grade effectively keeps a 75% share and the final gets the remaining 25% — so overall = current × 0.75 + final × 0.25. This calculator rearranges that same equation to solve for the final score instead of the overall grade: given a target overall grade, it isolates the one unknown.",
          "It is the direct companion to the grade calculator: that page starts from category scores and computes where you stand right now; this page starts from where you stand right now and computes what one remaining category — the final — needs to be to land on a specific target.",
          "The result can come out above 100% or below 0%. A number above 100% means the target is not reachable no matter how well you do on the final, given your current grade and the final's weight; a number at or below 0% means you have already secured that overall grade even with a zero on the final."
        ]
      },
      howTo: {
        intro: 'Enter your current grade, how much the final exam is worth, and the overall grade you want to reach.',
        steps: [
          { name: 'Enter your current grade', text: "Your overall percentage grade in the course before the final exam is factored in." },
          { name: "Enter the final's weight", text: 'The percent of your overall grade the final exam controls, from your syllabus — commonly somewhere between 10% and 40%.' },
          { name: 'Enter your target grade', text: 'The overall percentage grade you want to end the course with.' },
          { name: 'Read the score you need', text: 'The headline is the percentage you need on the final exam itself to reach that target.' },
          { name: 'Check what\'s actually possible', text: "The best-possible-grade figure shows your overall grade if you score a perfect 100% on the final — compare it to your target before you set expectations." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: "The overall grade is current grade and final score blended by the final's weight. Solving that equation for the final score gives the needed-score formula below.",
        expression: 'currentContribution = currentGrade × (1 − finalWeight)\noverall = currentContribution + neededScore × finalWeight\nneededScore = (desiredGrade − currentContribution) ÷ finalWeight',
        terms: [
          { symbol: 'currentGrade', meaning: 'Your overall percentage grade before the final exam.' },
          { symbol: 'finalWeight', meaning: "The final exam's weight, as a fraction of the overall grade (25% is 0.25 in the formula; enter 25 in the calculator)." },
          { symbol: 'desiredGrade', meaning: 'The overall percentage grade you want to reach.' }
        ],
        note: "A result above 100% means the target isn't reachable from your current grade at this final weight — no score on the final can produce it. This is arithmetic, not advice on whether to attend office hours or ask for extra credit."
      },
      workedExample: {
        intro: "Currently at 82%, a final exam worth 25% of the grade, targeting an 85% overall.",
        rows: [
          { label: "Current grade's contribution (82 × 0.75)", value: '61.5' },
          { label: 'Needed on the final ((85 − 61.5) ÷ 0.25)', value: '94' },
          { label: 'Best possible overall (82 × 0.75 + 100 × 0.25)', value: '86.5' }
        ],
        result: 'Score needed on the final = 94%',
        explanation: "Because the final only controls a quarter of the grade, the 3-point gap between 82% and 85% overall requires a disproportionately large 94% on the final itself — and the best this student could reach with a perfect final is 86.5%, so 85% is achievable but with little room to spare."
      },
      watchOut: [
        { title: 'A result over 100% means the target is out of reach', body: "If the needed score is higher than 100%, no final exam score can produce your target grade — check the best-possible-grade figure, which is your ceiling." },
        { title: 'A result at or below 0% means you have already clinched it', body: 'Your current grade and the remaining weight are already enough to guarantee the target, even with a zero on the final.' },
        { title: "The final's weight is a fraction of the WHOLE grade, not of what's left", body: "Enter the percent your syllabus assigns to the final out of 100% total, the same way you'd enter it on the grade calculator — not a weight relative only to other exams." },
        { title: 'This assumes nothing else changes', body: "If other assignments (extra credit, a dropped quiz, a curve) are still pending, your actual current grade may shift before the final — rerun this with an updated current grade." },
        { title: 'Not the same question as the grade calculator', body: 'The grade calculator computes your current overall grade from category scores you already have. This calculator assumes you already know that current grade and solves for one still-unknown score instead.' }
      ],
      references: [
        { label: 'Wolfram MathWorld, Weighted Mean', url: 'https://mathworld.wolfram.com/WeightedMean.html' },
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' }
      ]
    },
    inputs: [
      { id: 'currentGrade', label: 'Current grade (before the final)', type: 'percent', placeholder: '82', defaultValue: 82, step: 0.1, min: 0 },
      { id: 'finalWeight', label: "Final exam's weight", type: 'percent', placeholder: '25', defaultValue: 25, step: 1, min: 1 },
      { id: 'desiredGrade', label: 'Target overall grade', type: 'percent', placeholder: '85', defaultValue: 85, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'Final Grade Calculator – What Score Do You Need?',
      description: "Find the score you need on your final exam to hit a target overall grade, given your current grade and the final's weight. See your best-case grade too.",
      faq: [
        { question: 'What score do I need on my final exam?', answer: "Subtract your current grade's weighted contribution from your target, then divide by the final's weight. At 82% currently with a 25%-weighted final and an 85% target: (85 − 61.5) ÷ 0.25 = 94%." },
        { question: 'What if I need more than 100% on the final?', answer: "That means your target isn't reachable this time — no score can produce it given your current grade and the final's weight. Compare against the best-possible-grade figure, which is your ceiling if you score 100%." },
        { question: 'What if the calculator says I need 0% or less?', answer: "You've already secured that overall grade — even a zero on the final would leave you at or above your target." },
        { question: 'Is the final\'s weight relative to the whole grade or just the other exams?', answer: "Enter it as a percent of the entire course grade (the same number your syllabus lists), not relative only to other exams." },
        { question: 'How is this different from the grade calculator?', answer: "The grade calculator computes your current overall grade from category scores you already have. This one assumes that current grade is known and solves backward for a single missing score instead." },
        { question: "Does this account for extra credit or a curve?", answer: 'No — it only uses the three numbers you enter. If extra credit, a dropped grade, or a curve changes your current grade, re-enter the updated current grade and recalculate.' }
      ]
    },
    compute(values) {
      const w = values.finalWeight / 100;
      const currentContribution = values.currentGrade * (1 - w);
      const neededScore = (values.desiredGrade - currentContribution) / w;
      const maxPossibleGrade = currentContribution + 100 * w;
      return { neededScore, maxPossibleGrade, currentContribution };
    }
  },
  {
    id: 'study-time-calculator',
    category: 'education',
    group: 'Study & Time',
    glyph: 'ST',
    updatedAt: '2026-11-18',
    aliases: ['how many hours should i study calculator', 'study hours per credit hour calculator', 'recommended study time calculator', 'credit hour study time calculator'],
    related: ['final-grade-calculator', 'grade-calculator', 'pomodoro-timer', 'sleep-time-calculator'],
    title: 'Study Time Calculator',
    description: 'Estimate recommended weekly study hours from your credit hours, using the federal credit-hour guideline of at least 2 out-of-class hours per credit per week, adjustable for a heavier course load.',
    example: 'Fifteen credit hours at the federal 2-hours-per-credit minimum, with a 25% heavier-than-typical adjustment, recommend about 37.5 study hours a week — 5.36 hours a day.',
    breakdown: {
      headline: 'recommendedWeeklyHours',
      headlineLabel: 'Recommended weekly study hours',
      outputs: [
        { id: 'recommendedWeeklyHours', label: 'Recommended weekly study hours', format: 'number' },
        { id: 'dailyAverage', label: 'Average per day (÷7)', format: 'number' },
        { id: 'totalWeeklyCommitment', label: 'Total weekly commitment (study + estimated class time)', format: 'number' }
      ],
      groups: [
        { title: 'Your course load', inputs: ['creditHours', 'hoursPerCreditGuideline', 'difficultyAdjustmentPercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'classroomHours', label: 'Estimated class time' },
          { from: 'recommendedWeeklyHours', label: 'Recommended study time' }
        ],
        title: 'Weekly hours: class vs. recommended study time',
        highlight: 1
      },
      derive: (values) => ({ classroomHours: values.creditHours })
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Where the "2 hours of study per credit hour" guideline comes from',
        paragraphs: [
          'U.S. federal regulation defines a credit hour, for accreditation purposes, as "one hour of classroom or direct faculty instruction and a minimum of two hours of out of class student work each week for approximately fifteen weeks" (34 CFR 600) — a definition the University of Cincinnati\'s own registrar publishes verbatim on its credit-hour policy page. In plain terms: a 15-credit course load implies roughly 15 hours a week of class time and a minimum of about 30 hours a week of outside study, before any adjustment for how demanding the material is.',
          "That federal figure is explicitly a floor, not a target. It exists so accreditors can confirm a credit hour represents a consistent minimum workload across institutions — it is not a claim that 2 hours per credit is enough for every student in every course. A heavier reading load, a lab-heavy science course, or a class you personally find difficult can reasonably need more; this calculator's difficulty adjustment scales the baseline upward to model that, rather than presenting the federal minimum as if it were a universal recommendation.",
          "The result is still only a planning estimate. How much study time you actually need depends on your own background, the specific course, and how efficiently you study — not just the number of credits on your schedule."
        ]
      },
      howTo: {
        intro: 'Enter your total credit hours, the study-hours-per-credit guideline you want to use, and any adjustment for a heavier-than-typical course load.',
        steps: [
          { name: 'Enter your total credit hours', text: 'The combined credit hours across all your courses this term.' },
          { name: 'Enter the study-hours-per-credit guideline', text: 'The federal minimum is 2 hours of out-of-class work per credit hour per week; raise it if you want a more conservative planning figure.' },
          { name: 'Enter a difficulty adjustment, if any', text: "A percentage to scale the baseline up for a demanding course load — 25% for somewhat heavier than typical, more for a notably difficult term. Leave at 0% for the federal minimum as-is." },
          { name: 'Read your recommended weekly hours', text: 'The headline is your estimated weekly study-time target, with a daily average and a combined class-plus-study total below it.' },
          { name: 'Compare against class time', text: 'The chart shows estimated weekly class time next to recommended study time, assuming roughly 1 contact hour per credit — the same ratio the federal definition itself uses.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Recommended weekly study hours scale the credit-hour guideline by your total credits and any difficulty adjustment.',
        expression: 'recommendedWeeklyHours = creditHours × hoursPerCreditGuideline × (1 + difficultyAdjustmentPercent ÷ 100)\ndailyAverage = recommendedWeeklyHours ÷ 7\ntotalWeeklyCommitment = recommendedWeeklyHours + creditHours',
        terms: [
          { symbol: 'creditHours', meaning: 'Your total credit hours this term.' },
          { symbol: 'hoursPerCreditGuideline', meaning: 'Out-of-class study hours per credit hour per week — 2 is the cited federal minimum.' },
          { symbol: 'difficultyAdjustmentPercent', meaning: 'An upward adjustment, as a percent, for a heavier-than-typical course load.' }
        ],
        note: "This is a planning estimate built from a regulatory minimum, not a personalized study plan — your own course difficulty and study efficiency matter more than this formula can capture."
      },
      workedExample: {
        intro: '15 credit hours, the 2-hour-per-credit federal minimum, and a 25% adjustment for a heavier-than-typical term.',
        rows: [
          { label: 'Baseline (15 × 2)', value: '30 hours/week' },
          { label: 'With 25% adjustment (30 × 1.25)', value: '37.5 hours/week' },
          { label: 'Daily average (37.5 ÷ 7)', value: '≈ 5.36 hours/day' },
          { label: 'Estimated class time (15 credits × 1 hour)', value: '15 hours/week' },
          { label: 'Total weekly commitment (37.5 + 15)', value: '52.5 hours/week' }
        ],
        result: 'Recommended study time ≈ 37.5 hours/week (about 5.36 hours/day)',
        explanation: "The 25% adjustment adds 7.5 hours on top of the 30-hour federal-minimum baseline, reflecting a course load this student considers heavier than typical — pushing the full weekly commitment, class time included, past 50 hours."
      },
      watchOut: [
        { title: 'The 2-hours-per-credit figure is a legal minimum, not a target', body: "It exists to define a consistent floor for accreditation, not to describe how much any specific student should study. Treat the unadjusted result as a lower bound." },
        { title: 'Course difficulty varies far more than credit hours do', body: 'Two 3-credit courses can demand very different weekly effort. The difficulty adjustment is a rough dial, not a substitute for judging your own specific courses.' },
        { title: 'Class time is estimated, not entered', body: 'The chart assumes roughly 1 contact hour per credit, the same ratio the federal definition pairs with its 2-hour study minimum — your actual scheduled class time may differ slightly (labs, seminars).' },
        { title: 'This does not account for exam weeks or project deadlines', body: 'Study time is rarely level across a term — expect real weeks to run well above and below this weekly average.' }
      ],
      references: [
        { label: 'University of Cincinnati, Office of the Registrar: Credit Hour Definition (citing 34 CFR 600)', url: 'https://www.uc.edu/about/registrar/registration/policies/credit-hour-definition.html' }
      ]
    },
    inputs: [
      { id: 'creditHours', label: 'Total credit hours this term', type: 'number', placeholder: '15', defaultValue: 15, step: 1, min: 1 },
      { id: 'hoursPerCreditGuideline', label: 'Study hours per credit per week (2 = federal minimum)', type: 'number', placeholder: '2', defaultValue: 2, step: 0.5, min: 0 },
      { id: 'difficultyAdjustmentPercent', label: 'Difficulty adjustment (% above the baseline)', type: 'percent', placeholder: '25', defaultValue: 25, step: 5, min: 0 }
    ],
    seo: {
      title: 'Study Time Calculator – Recommended Hours per Week',
      description: 'Estimate recommended weekly study hours from your credit hours, using the cited federal 2-hours-per-credit minimum, adjustable for a heavier course load.',
      faq: [
        { question: 'How many hours should I study per credit hour?', answer: 'Federal regulation (34 CFR 600) defines a credit hour as requiring a minimum of 2 hours of out-of-class work per week, as published on the University of Cincinnati registrar\'s credit-hour policy page. For 15 credits, that minimum is 30 hours a week.' },
        { question: 'Is 2 hours per credit hour enough?', answer: "It's a legal minimum for accreditation purposes, not a personalized recommendation. Harder courses, unfamiliar material, or a heavier course load can reasonably need more — use the difficulty adjustment to model that." },
        { question: 'How is the daily average calculated?', answer: 'The recommended weekly hours are simply divided by 7. For 37.5 hours/week, that is 37.5 ÷ 7 ≈ 5.36 hours a day.' },
        { question: 'How is class time estimated?', answer: 'The chart assumes about 1 contact hour of class per credit hour, the same pairing the federal credit-hour definition itself uses alongside its 2-hour study minimum.' },
        { question: 'Does this account for exam weeks?', answer: 'No — it produces a flat weekly average across the whole term. Real study time is uneven, typically rising sharply around exams and major deadlines.' },
        { question: 'What if my school uses a different study-hours guideline?', answer: "Change the study-hours-per-credit field — some academic success centers recommend 2 to 3 hours per credit instead of the bare federal minimum of 2." }
      ]
    },
    compute(values) {
      const classroomHours = values.creditHours;
      const recommendedWeeklyHours = values.creditHours * values.hoursPerCreditGuideline * (1 + values.difficultyAdjustmentPercent / 100);
      const dailyAverage = recommendedWeeklyHours / 7;
      const totalWeeklyCommitment = recommendedWeeklyHours + classroomHours;
      return { recommendedWeeklyHours, dailyAverage, totalWeeklyCommitment };
    }
  },
  {
    id: 'test-score-to-letter-grade-calculator',
    category: 'education',
    group: 'Grades & GPA',
    glyph: 'A-F',
    updatedAt: '2026-11-18',
    aliases: ['percentage to letter grade calculator', 'what letter grade is this percentage', 'grade scale converter', 'test grade percentage calculator'],
    related: ['grade-calculator', 'final-grade-calculator', 'gpa-calculator', 'percentage-calculator'],
    title: 'Test Score to Letter Grade Calculator',
    description: 'Convert a raw test score or percentage into a letter grade, on the common 90/80/70/60 US scale by default or your own school\'s cutoffs — and see exactly how many points separate you from the next grade up.',
    example: 'An 85% score falls in the 80-89 range on the common scale: a B, five points below the 90% needed for an A.',
    breakdown: {
      headline: 'letterGradeCode',
      headlineLabel: 'Letter grade',
      outputs: [
        { id: 'letterGradeCode', label: 'Letter grade', labels: [
          { value: 0, label: 'F' },
          { value: 1, label: 'D' },
          { value: 2, label: 'C' },
          { value: 3, label: 'B' },
          { value: 4, label: 'A' }
        ] },
        { id: 'pointsToNextGrade', label: 'Points to the next grade up', format: 'number' }
      ],
      groups: [
        { title: 'Your score', inputs: ['score'] },
        { title: 'Cutoffs (edit for your own school\'s scale)', inputs: ['aCutoff', 'bCutoff', 'cCutoff', 'dCutoff'] }
      ],
      visual: {
        type: 'rangeBar',
        value: 'score',
        bands: [
          { label: 'F', min: 0, max: 60, color: '#ef4444' },
          { label: 'D', min: 60, max: 70 },
          { label: 'C', min: 70, max: 80 },
          { label: 'B', min: 80, max: 90 },
          { label: 'A', min: 90, max: 101 }
        ],
        title: 'Where your score falls on the scale'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'The common US percentage scale, and why it is a default, not a rule',
        paragraphs: [
          "The U.S. Department of Education's National Center for Education Statistics, in the methodology for its High School Transcript Study, converts numeric scores to letter grades as 90-100 = A, 80-89 = B, 70-79 = C, 60-69 = D, and below 60 = F — explicitly \"unless the school documents specify other letter grade equivalents for numeric grades.\" That caveat is the whole story: this is the most common scale, not a universal one.",
          'Individual schools, colleges, and even individual instructors set their own cutoffs — some use plus/minus bands (a B+ at 87-89), some set the passing line higher for a specific program, and some shift every cutoff up or down. This calculator defaults to the common 90/80/70/60 scale but lets you replace any cutoff with your own syllabus\'s numbers, which is the only way to get a letter grade that matches your actual course.',
          "This is a different conversion from a GPA scale. A percentage-to-letter scale translates one raw score (a test, an assignment, a final percentage) into a letter. The GPA calculator instead converts an already-assigned letter grade into grade points and averages those points across whole courses by credit hours — a separate step that happens after a letter grade like this one already exists."
        ]
      },
      howTo: {
        intro: 'Enter your score and, if your school uses different cutoffs than the common scale, replace the four cutoff values.',
        steps: [
          { name: 'Enter your score', text: 'The percentage or raw score (out of 100) you want to convert.' },
          { name: "Check the cutoffs", text: 'The default cutoffs are the common 90/80/70/60 scale. Replace any of them with your own school\'s or instructor\'s cutoffs if they differ.' },
          { name: 'Read your letter grade', text: 'The headline shows which letter grade your score falls into under the cutoffs entered.' },
          { name: 'See how close you are to the next grade', text: 'The second figure is exactly how many points separate your score from the next letter grade up — 0 if you already have the top grade.' },
          { name: 'Check the scale visually', text: "The bar shows where your score sits across all five bands at a glance." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Your score is compared against four cutoffs, from highest to lowest, and assigned the first letter grade it qualifies for.',
        expression: 'if score ≥ aCutoff: A\nelse if score ≥ bCutoff: B\nelse if score ≥ cCutoff: C\nelse if score ≥ dCutoff: D\nelse: F\npointsToNextGrade = (cutoff for the next letter up) − score',
        terms: [
          { symbol: 'score', meaning: 'Your raw score or percentage.' },
          { symbol: 'aCutoff, bCutoff, cCutoff, dCutoff', meaning: 'The minimum score needed for an A, B, C, and D respectively — 90/80/70/60 by default.' }
        ],
        note: "Every cutoff here is inclusive of its lower bound (a score of exactly 90 is an A on the default scale) — check whether your own school rounds or treats boundary scores differently."
      },
      workedExample: {
        intro: 'A score of 85%, using the default 90/80/70/60 cutoffs.',
        rows: [
          { label: 'Is 85 ≥ 90 (A cutoff)?', value: 'No' },
          { label: 'Is 85 ≥ 80 (B cutoff)?', value: 'Yes → grade is B' },
          { label: 'Points to the next grade up (90 − 85)', value: '5' }
        ],
        result: 'Letter grade = B, 5 points from an A',
        explanation: "85 clears the 80-point B cutoff but falls short of the 90-point A cutoff, placing it squarely in the B range with 5 points of room below the next grade up."
      },
      watchOut: [
        { title: 'This default scale is common, not universal', body: "NCES's own methodology notes it applies \"unless the school documents specify other letter grade equivalents\" — always check your own syllabus or school policy before trusting the default cutoffs." },
        { title: "This isn't a GPA scale", body: 'This converts one raw score into a letter grade. A GPA additionally converts that letter into grade points and averages across whole courses by credit hours — see the GPA calculator for that separate step.' },
        { title: 'Plus/minus grades are not modeled', body: "Many schools split each band further (B+ at 87-89, for example). Enter a plus/minus cutoff of your own in the relevant field if your school grades that way — this calculator only has one cutoff per letter." },
        { title: 'Cutoffs assume a descending order', body: 'Enter the A cutoff as the highest number and D as the lowest — the calculator checks them from highest to lowest and does not reorder values for you.' }
      ],
      references: [
        { label: 'National Center for Education Statistics, High School Transcript Study: Grade Point Average Calculation (grade conversion table)', url: 'https://nces.ed.gov/nationsreportcard/hsts/howgpa.aspx' }
      ]
    },
    inputs: [
      { id: 'score', label: 'Your score (%)', type: 'percent', placeholder: '85', defaultValue: 85, step: 0.1, min: 0 },
      { id: 'aCutoff', label: 'A cutoff (minimum score for an A)', type: 'percent', placeholder: '90', defaultValue: 90, step: 1, min: 0 },
      { id: 'bCutoff', label: 'B cutoff', type: 'percent', placeholder: '80', defaultValue: 80, step: 1, min: 0 },
      { id: 'cCutoff', label: 'C cutoff', type: 'percent', placeholder: '70', defaultValue: 70, step: 1, min: 0 },
      { id: 'dCutoff', label: 'D cutoff', type: 'percent', placeholder: '60', defaultValue: 60, step: 1, min: 0 }
    ],
    seo: {
      title: 'Test Score to Letter Grade Calculator',
      description: 'Convert a score or percentage into a letter grade on the common 90/80/70/60 scale, or your own school\'s cutoffs, and see your points to the next grade up.',
      faq: [
        { question: 'What percentage is an A, B, C, or D?', answer: "On the common U.S. scale cited by the National Center for Education Statistics: 90-100 is an A, 80-89 a B, 70-79 a C, 60-69 a D, and below 60 an F — unless your school specifies different cutoffs." },
        { question: 'Is the 90/80/70/60 scale universal?', answer: "No. It's the most common scale, but individual schools, colleges, and instructors set their own cutoffs. Replace the default cutoff fields with your own school's numbers for an accurate result." },
        { question: 'How is this different from a GPA calculator?', answer: "This converts one raw score into a letter grade. A GPA calculator takes an already-assigned letter grade, converts it to grade points, and averages those points across whole courses by credit hours — a separate, later step." },
        { question: "What does \"points to the next grade\" mean?", answer: "It's the gap between your score and the cutoff for the next letter grade up. An 85% is 5 points below the 90% needed for an A." },
        { question: 'Does this handle plus/minus grades like B+?', answer: 'No — each letter has one cutoff. If your school grades with plus/minus bands, you would need to set a custom cutoff for each band separately and run the calculator again.' },
        { question: 'Is a score of exactly 90 an A?', answer: 'Yes, on the default scale — each cutoff is inclusive of its lower bound. Check whether your own school treats a boundary score the same way.' }
      ]
    },
    compute(values) {
      const { score, aCutoff, bCutoff, cCutoff, dCutoff } = values;
      let letterGradeCode: number;
      let nextCutoff: number;
      if (score >= aCutoff) { letterGradeCode = 4; nextCutoff = score; }
      else if (score >= bCutoff) { letterGradeCode = 3; nextCutoff = aCutoff; }
      else if (score >= cCutoff) { letterGradeCode = 2; nextCutoff = bCutoff; }
      else if (score >= dCutoff) { letterGradeCode = 1; nextCutoff = cCutoff; }
      else { letterGradeCode = 0; nextCutoff = dCutoff; }
      const pointsToNextGrade = letterGradeCode === 4 ? 0 : nextCutoff - score;
      return { letterGradeCode, pointsToNextGrade };
    }
  },
  {
    id: 'reading-speed-calculator',
    category: 'education',
    group: 'Study & Time',
    glyph: 'WPM',
    updatedAt: '2026-11-18',
    aliases: ['words per minute calculator', 'reading rate calculator', 'how fast do i read calculator', 'wpm calculator'],
    related: ['character-counter', 'study-time-calculator', 'pomodoro-timer', 'final-grade-calculator'],
    title: 'Reading Speed Calculator',
    description: 'Find your reading speed in words per minute from a timed passage: enter the word count and how long it took to read, in minutes and seconds.',
    example: 'Reading a 500-word passage in 2 minutes 30 seconds works out to 200 words per minute.',
    breakdown: {
      headline: 'wpm',
      headlineLabel: 'Reading speed',
      outputs: [
        { id: 'wpm', label: 'Words per minute', format: 'number' },
        { id: 'totalSeconds', label: 'Total time', format: 'integer' }
      ],
      groups: [
        { title: 'Your timed passage', inputs: ['wordCount', 'minutesElapsed', 'secondsElapsed'] }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Words per minute: a rate, not a fixed trait',
        paragraphs: [
          "Words per minute is simply the number of words in a passage divided by how long it took to read it, converted to a per-minute rate. It is a measurement of one specific reading of one specific passage — not a fixed personal statistic. The same person's reading speed changes with the text's difficulty, how familiar they already are with the subject, how carefully they are reading (skimming versus reading for full comprehension), and even how tired they are.",
          "Because of that, a single words-per-minute number is most useful compared against your own past results on similarly difficult material — timing yourself on comparable passages before and after practicing a reading strategy, for instance — rather than against someone else's number from a different kind of text.",
          "This calculator reports the rate exactly as entered, with no adjustment for comprehension. Reading faster without understanding what you read is not the same thing as reading faster."
        ]
      },
      howTo: {
        intro: 'Time yourself reading a passage, then enter the word count and the time it took.',
        steps: [
          { name: 'Count (or look up) the word count', text: "Many documents show a word count directly; otherwise count or estimate the words in the passage you timed." },
          { name: 'Time yourself reading it', text: 'Start a timer when you begin reading and stop it the moment you finish.' },
          { name: 'Enter the minutes and seconds', text: 'Split the elapsed time into whole minutes and the remaining seconds.' },
          { name: 'Read your words-per-minute rate', text: 'The headline is your reading speed for that specific passage, at that specific time.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Words per minute is the word count divided by the total elapsed time, with the time converted entirely to minutes first.',
        expression: 'totalMinutes = minutesElapsed + secondsElapsed ÷ 60\nwordsPerMinute = wordCount ÷ totalMinutes',
        terms: [
          { symbol: 'wordCount', meaning: 'The number of words in the passage you read.' },
          { symbol: 'minutesElapsed, secondsElapsed', meaning: 'The time it took to read the passage, split into whole minutes and remaining seconds.' }
        ]
      },
      workedExample: {
        intro: 'A 500-word passage, read in 2 minutes 30 seconds.',
        rows: [
          { label: 'Total time in minutes (2 + 30÷60)', value: '2.5 minutes' },
          { label: 'Words per minute (500 ÷ 2.5)', value: '200' }
        ],
        result: 'Reading speed = 200 words per minute',
        explanation: 'The 30 extra seconds add a quarter-minute to the 2 full minutes, so the word count is divided by 2.5 minutes rather than a flat 2.'
      },
      watchOut: [
        { title: "One timed passage isn't a fixed reading speed", body: "The same reader moves at different speeds on an easy novel versus a dense technical manual. Compare results across similarly difficult passages, not against a single universal number." },
        { title: 'This does not check comprehension', body: "The calculator only measures speed. Reading quickly through material you don't absorb isn't a meaningful improvement over reading it more slowly and understanding it." },
        { title: 'Word count accuracy matters', body: "If you estimate rather than count the words, your words-per-minute figure is only as accurate as that estimate." },
        { title: 'Very short passages are noisy', body: 'Timing a 20-word sentence introduces a lot of relative error from reaction time starting and stopping the timer; longer passages give a more stable rate.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' }
      ]
    },
    inputs: [
      { id: 'wordCount', label: 'Word count', type: 'number', placeholder: '500', defaultValue: 500, step: 1, min: 1 },
      { id: 'minutesElapsed', label: 'Minutes', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 },
      { id: 'secondsElapsed', label: 'Seconds', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 }
    ],
    seo: {
      title: 'Reading Speed Calculator – Words per Minute',
      description: 'Find your reading speed in words per minute from a timed passage. Enter the word count and how long it took, in minutes and seconds.',
      faq: [
        { question: 'How do I calculate words per minute?', answer: 'Divide the word count by the total time in minutes. A 500-word passage read in 2 minutes 30 seconds (2.5 minutes) is 500 ÷ 2.5 = 200 words per minute.' },
        { question: 'What is a good reading speed?', answer: "Reading speed varies widely by person, text difficulty, and familiarity with the subject, so there is no single target. It is most useful to compare your own results across similarly difficult passages over time." },
        { question: 'Does a higher words-per-minute number mean better reading?', answer: 'Not by itself — this calculator measures speed only, not comprehension. Reading quickly through text you do not absorb is not a meaningful improvement.' },
        { question: 'How should I count the words in a passage?', answer: 'Use an exact count from a word processor or document viewer when possible; a rough estimate works but makes your words-per-minute figure only as accurate as that estimate.' },
        { question: 'Why does this ask for minutes and seconds separately?', answer: "Splitting the time avoids decimal-minute entry errors — 2 minutes 30 seconds becomes 2.5 minutes internally, converted automatically before dividing." },
        { question: 'Is this the same as the character counter\'s reading time estimate?', answer: "No — the character counter runs the calculation the other way, estimating reading time from a word count at a fixed assumed rate. This calculator measures your actual rate from a passage you timed yourself." }
      ]
    },
    compute(values) {
      const totalMinutes = values.minutesElapsed + values.secondsElapsed / 60;
      const wpm = values.wordCount / totalMinutes;
      const totalSeconds = values.minutesElapsed * 60 + values.secondsElapsed;
      return { wpm, totalSeconds };
    }
  },
  {
    id: 'class-attendance-calculator',
    category: 'education',
    group: 'Study & Time',
    glyph: '%',
    updatedAt: '2026-11-18',
    aliases: ['attendance percentage calculator', 'how many classes can i miss calculator', 'minimum attendance calculator', 'class absence calculator'],
    related: ['grade-calculator', 'final-grade-calculator', 'percentage-calculator', 'study-time-calculator'],
    title: 'Class Attendance Calculator',
    description: 'Check your current attendance percentage against a minimum requirement, and see exactly how many more classes you can miss (or already missed too many) to stay above it.',
    example: 'Out of 30 classes with 3 missed, attendance is 90% — with an 80% minimum, 3 more absences are still allowed before dropping below it.',
    breakdown: {
      headline: 'currentAttendanceRate',
      headlineLabel: 'Current attendance',
      outputs: [
        { id: 'currentAttendanceRate', label: 'Current attendance', format: 'percent' },
        { id: 'remainingMissable', label: 'More classes you can still miss', format: 'integer' },
        { id: 'maxMissableTotal', label: 'Total classes you can ever miss', format: 'integer' }
      ],
      groups: [
        { title: 'Your attendance', inputs: ['totalClasses', 'classesMissed', 'minAttendancePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'classesMissed', label: 'Missed so far' },
          { from: 'remainingMissable', label: 'Still missable' }
        ],
        title: 'Classes missed vs. how many more you can miss',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Attendance percentage, and the "classes you can still miss" it implies',
        paragraphs: [
          "Attendance percentage is simply classes attended divided by total classes, times 100. A minimum attendance requirement — common in many courses, though the exact threshold and consequences are set by each school or instructor, not by any universal rule — turns that percentage into a hard cap on absences: once your missed-class count would push your attendance below the minimum, any further absence breaks the requirement.",
          "This calculator works that cap out directly. It finds the smallest number of classes you must attend to keep your percentage at or above the minimum (rounding up, since attending a fractional class isn't possible), subtracts that from the total to get the most classes you could ever miss in the term, and then subtracts what you've already missed to show how much room is left.",
          "If that remaining figure is negative, it means your current attendance has already fallen below the minimum — not a projection, but where you already stand."
        ]
      },
      howTo: {
        intro: 'Enter the total number of class sessions, how many you have missed, and the minimum attendance percentage your course requires.',
        steps: [
          { name: 'Enter total classes', text: 'The total number of class sessions in the term (or up to the point you want to check).' },
          { name: 'Enter classes missed', text: 'How many of those sessions you have missed so far.' },
          { name: 'Enter the minimum attendance requirement', text: "Your syllabus's required attendance percentage — commonly somewhere around 75-90%, but set by your own course." },
          { name: 'Read your current attendance', text: 'The headline is your attendance percentage so far.' },
          { name: 'Check how much room is left', text: "The second figure is how many more classes you can miss and still meet the requirement — negative means you've already fallen short." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'The minimum requirement sets a maximum number of total absences; subtracting what you have already missed gives the remaining allowance.',
        expression: 'requiredAttended = ⌈totalClasses × minAttendancePercent ÷ 100⌉\nmaxMissableTotal = totalClasses − requiredAttended\nremainingMissable = maxMissableTotal − classesMissed\ncurrentAttendanceRate = (totalClasses − classesMissed) ÷ totalClasses × 100',
        terms: [
          { symbol: 'totalClasses', meaning: 'The total number of class sessions being tracked.' },
          { symbol: 'classesMissed', meaning: 'How many of those sessions have been missed so far.' },
          { symbol: 'minAttendancePercent', meaning: 'The minimum attendance percentage the course requires.' }
        ],
        note: 'The required-attended figure is rounded up (a fractional class still counts as a class you must attend), which is why the allowed-absence count is a whole number.'
      },
      workedExample: {
        intro: '30 total classes, 3 already missed, an 80% minimum attendance requirement.',
        rows: [
          { label: 'Required attended (⌈30 × 0.80⌉)', value: '24' },
          { label: 'Max missable total (30 − 24)', value: '6' },
          { label: 'Remaining missable (6 − 3)', value: '3' },
          { label: 'Current attendance ((30 − 3) ÷ 30 × 100)', value: '90%' }
        ],
        result: 'Current attendance = 90%, 3 more absences still allowed',
        explanation: 'At 80% minimum, up to 6 absences out of 30 classes are allowed in total; having already used 3 of those, exactly 3 remain before attendance would drop below the 80% line.'
      },
      watchOut: [
        { title: 'The minimum percentage is your course\'s own policy, not a universal rule', body: 'Attendance requirements and what counts as an "absence" (excused absences, late arrivals, partial credit) vary by school and instructor — check your own syllabus.' },
        { title: 'A negative remaining count means you are already below the minimum', body: "It isn't a warning about the future — it means your attendance percentage right now is already under the requirement you entered." },
        { title: 'Rounding can make the allowance feel stricter than expected', body: 'Because required attendance rounds up to a whole class, two courses with very similar percentages and class counts can allow a different maximum number of absences.' },
        { title: 'Future classes are not accounted for', body: "This checks your standing as of the classes entered. If more classes remain in the term, your attendance percentage (and remaining allowance) will keep changing as they happen." }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' }
      ]
    },
    inputs: [
      { id: 'totalClasses', label: 'Total classes', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 },
      { id: 'classesMissed', label: 'Classes missed so far', type: 'number', placeholder: '3', defaultValue: 3, step: 1, min: 0 },
      { id: 'minAttendancePercent', label: 'Minimum attendance required', type: 'percent', placeholder: '80', defaultValue: 80, step: 1, min: 0 }
    ],
    seo: {
      title: 'Class Attendance Calculator – Absences Allowed',
      description: 'Check your attendance percentage against a minimum requirement and see how many more classes you can miss before falling below it.',
      faq: [
        { question: 'How do I calculate my attendance percentage?', answer: 'Divide classes attended by total classes and multiply by 100. Attending 27 of 30 classes (3 missed) is (30 − 3) ÷ 30 × 100 = 90%.' },
        { question: 'How many classes can I still miss?', answer: 'Find the maximum total absences the minimum allows (total classes minus the rounded-up number you must attend), then subtract what you have already missed. At 30 classes, an 80% minimum, and 3 already missed, that is 6 − 3 = 3 more.' },
        { question: 'What does a negative "remaining missable" number mean?', answer: 'It means your current attendance has already dropped below the minimum you entered — it is not a projection, it is where you already stand.' },
        { question: 'Why is the required-attended number rounded up?', answer: "You can't attend a fractional class, so the minimum number of classes needed to clear the percentage requirement always rounds up to a whole number." },
        { question: 'Is 80% a standard attendance requirement?', answer: 'No — it is just this example\'s number. Attendance minimums are set by each school or instructor and commonly range anywhere from about 75% to 90%, so use your own syllabus\'s figure.' },
        { question: 'Does this account for excused absences?', answer: 'No — enter whatever your course counts as a missed class under its own policy; this calculator does not distinguish excused from unexcused absences.' }
      ]
    },
    compute(values) {
      const requiredAttended = Math.ceil(values.totalClasses * values.minAttendancePercent / 100);
      const maxMissableTotal = values.totalClasses - requiredAttended;
      const remainingMissable = maxMissableTotal - values.classesMissed;
      const currentAttendanceRate = (values.totalClasses - values.classesMissed) / values.totalClasses * 100;
      return { currentAttendanceRate, remainingMissable, maxMissableTotal };
    }
  },
  {
    id: 'cumulative-gpa-calculator',
    category: 'education',
    group: 'Grades & GPA',
    glyph: 'ΣGPA',
    updatedAt: '2026-11-18',
    aliases: ['overall gpa calculator', 'combined gpa calculator', 'new cumulative gpa calculator', 'gpa after this semester calculator'],
    related: ['gpa-calculator', 'grade-calculator', 'final-grade-calculator', 'weighted-average-calculator'],
    title: 'Cumulative GPA Calculator',
    description: "Combine your prior cumulative GPA and credits with a new term's grades to find your new overall cumulative GPA. Distinct from the single-term GPA calculator.",
    example: 'A 3.5 cumulative GPA on 60 prior credits, plus a new term of 10 credits averaging 3.58, combines to a new cumulative GPA of about 3.51.',
    breakdown: {
      headline: 'newCumulativeGpa',
      headlineLabel: 'New cumulative GPA',
      outputs: [
        { id: 'newCumulativeGpa', label: 'New cumulative GPA', format: 'number' },
        { id: 'newTotalCredits', label: 'New total credits', format: 'number' },
        { id: 'termGpa', label: "This term's own GPA", format: 'number' },
        { id: 'termCredits', label: 'This term\'s credits', format: 'number' }
      ],
      groups: [
        { title: 'Your prior record', inputs: ['priorGpa', 'priorCredits'] },
        { title: 'New term, course 1', inputs: ['course1Grade', 'course1Credits'] },
        { title: 'New term, course 2', inputs: ['course2Grade', 'course2Credits'] },
        { title: 'New term, course 3', inputs: ['course3Grade', 'course3Credits'], optional: true },
        { title: 'New term, course 4', inputs: ['course4Grade', 'course4Credits'], optional: true }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'priorCredits', label: 'Prior credits' },
          { from: 'termCredits', label: 'New term credits' }
        ],
        center: 'newCumulativeGpa',
        centerSub: 'new cumulative GPA'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Rolling a new term into an existing cumulative GPA',
        paragraphs: [
          "A cumulative GPA is the same credit-weighted average the GPA calculator computes for a single term, just carried forward across every term so far. The trick to updating it without re-entering every course you have ever taken is to treat your entire prior record as one combined figure: your prior cumulative GPA, multiplied by your prior total credits, gives your prior total grade points — exactly as if your whole academic history were a single very large \"course.\"",
          "From there, this calculator adds the new term's own grade points and credits to that prior total, and divides the combined total points by the combined total credits. The result folds in the new term correctly, weighted by its own credits, without disturbing the actual GPA calculation of any course you took before.",
          "This is different from the single-term GPA calculator, which starts from zero and computes a GPA for one term's courses alone. This calculator always starts from a prior cumulative figure you already have and updates it — the right tool once you have more than one term of history to carry forward."
        ]
      },
      howTo: {
        intro: "Enter your prior cumulative GPA and total credits, then this new term's courses.",
        steps: [
          { name: 'Enter your prior cumulative GPA', text: 'Your official GPA as of right before this new term, from your transcript.' },
          { name: 'Enter your prior total credits', text: 'The total credit hours that GPA is based on.' },
          { name: "Enter this term's courses", text: 'Grade points and credit hours for each course this term. Courses 3 and 4 are optional extra slots.' },
          { name: 'Read your new cumulative GPA', text: 'The headline is your updated overall GPA, combining your prior record with this term.' },
          { name: "Compare against this term alone", text: "This term's own GPA and credits are shown separately, so you can see how much this one term is pulling your overall average up or down." }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Prior GPA and credits are converted back into total grade points, combined with the new term\'s own points and credits, and divided out again.',
        expression: 'priorPoints = priorGpa × priorCredits\ntermPoints = sum of (grade × credits) for the new term\'s courses\ntermCredits = sum of credits for the new term\'s courses\nnewCumulativeGpa = (priorPoints + termPoints) ÷ (priorCredits + termCredits)',
        terms: [
          { symbol: 'priorGpa, priorCredits', meaning: 'Your cumulative GPA and total credits before this term.' },
          { symbol: 'grade, credits', meaning: "Each new-term course's grade points and credit hours." }
        ],
        note: "This assumes your prior cumulative GPA was itself already credit-weighted correctly — the same assumption any transcript's own cumulative GPA line makes."
      },
      workedExample: {
        intro: '3.5 cumulative GPA on 60 prior credits; a new term with a 4.0 (3 credits), a 3.0 (3 credits), and a 3.7 (4 credits).',
        rows: [
          { label: 'Prior points (3.5 × 60)', value: '210' },
          { label: "Term points (4.0×3 + 3.0×3 + 3.7×4)", value: '12 + 9 + 14.8 = 35.8' },
          { label: 'Term credits (3+3+4)', value: '10' },
          { label: 'New total points (210 + 35.8)', value: '245.8' },
          { label: 'New total credits (60 + 10)', value: '70' },
          { label: 'New cumulative GPA (245.8 ÷ 70)', value: '3.5114' }
        ],
        result: 'New cumulative GPA ≈ 3.51',
        explanation: "This term's own 3.58 GPA (35.8 ÷ 10) is slightly above the prior 3.5 cumulative figure, so folding it in nudges the cumulative GPA up slightly, from 3.5 to about 3.51 — a small move because the new term's 10 credits are much smaller than the 60 credits already on record."
      },
      watchOut: [
        { title: 'A small term moves a large prior record only a little', body: "The more prior credits you have, the less a single new term — even a very different one — shifts your cumulative GPA. This is a direct consequence of credit-weighting, not a rounding artifact." },
        { title: "Your prior GPA's own scale matters", body: "This assumes your prior cumulative GPA and this term's grade points use the same scale (commonly 4.0). Mixing a weighted high school scale with an unweighted college scale, for example, will give a misleading combined figure." },
        { title: 'Only 4 new-term course slots', body: 'A term with more than 4 courses needs the extras combined by hand (sum grade points and credits) into one of the four rows before entering it.' },
        { title: "This isn't the same question as the GPA calculator", body: "The GPA calculator computes a single term from scratch, starting at zero. This calculator always starts from an existing prior cumulative GPA and credits you already have." }
      ],
      references: [
        { label: 'University of North Carolina at Chapel Hill, Office of the University Registrar: Explanation of Grading System', url: 'https://registrar.unc.edu/explanation-of-grading-system/' },
        { label: 'Wolfram MathWorld, Weighted Mean', url: 'https://mathworld.wolfram.com/WeightedMean.html' }
      ]
    },
    inputs: [
      { id: 'priorGpa', label: 'Prior cumulative GPA', type: 'number', placeholder: '3.5', defaultValue: 3.5, step: 0.01, min: 0 },
      { id: 'priorCredits', label: 'Prior total credits', type: 'number', placeholder: '60', defaultValue: 60, step: 1, min: 0 },
      { id: 'course1Grade', label: 'Course 1 grade points', type: 'number', placeholder: '4', defaultValue: 4, step: 0.1, min: 0 },
      { id: 'course1Credits', label: 'Course 1 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course2Grade', label: 'Course 2 grade points', type: 'number', placeholder: '3', defaultValue: 3, step: 0.1, min: 0 },
      { id: 'course2Credits', label: 'Course 2 credits', type: 'number', placeholder: '3', defaultValue: 3, step: 0.5, min: 0 },
      { id: 'course3Grade', label: 'Course 3 grade points', type: 'number', placeholder: '3.7', defaultValue: 3.7, step: 0.1, min: 0 },
      { id: 'course3Credits', label: 'Course 3 credits', type: 'number', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'course4Grade', label: 'Course 4 grade points', type: 'number', placeholder: '0', defaultValue: 0, step: 0.1, min: 0 },
      { id: 'course4Credits', label: 'Course 4 credits', type: 'number', placeholder: '0', defaultValue: 0, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Cumulative GPA Calculator – New Term + Prior GPA',
      description: "Combine your prior cumulative GPA and credits with a new term's grades to find your updated overall GPA. Distinct from the single-term GPA calculator.",
      faq: [
        { question: 'How do I calculate my new cumulative GPA?', answer: 'Convert your prior GPA and credits into prior total points (GPA × credits), add this term\'s own points and credits, then divide the combined points by the combined credits. 210 prior points + 35.8 term points, over 60 + 10 credits, is 245.8 ÷ 70 ≈ 3.51.' },
        { question: 'How is this different from the GPA calculator?', answer: "The GPA calculator computes one term from scratch. This calculator starts from a prior cumulative GPA and credits you already have, and rolls a new term into that existing total." },
        { question: 'Why does a new term move my GPA so little?', answer: "Credit-weighting means a term with far fewer credits than your prior total has proportionally less influence on the combined average — the more credits already on record, the smaller the shift." },
        { question: 'What if my prior GPA used a different scale than this term?', answer: "This calculator assumes both use the same scale (commonly 4.0). Mixing scales — a weighted high school GPA with an unweighted college one, for instance — produces a misleading combined figure." },
        { question: 'Can I combine more than 4 new courses?', answer: 'Not directly — combine any extra courses by hand (sum their grade points and credits together) into one of the four course rows first.' },
        { question: "What does \"this term's own GPA\" show?", answer: 'It is the GPA for only the new courses you entered, calculated the same way the single-term GPA calculator would, shown separately so you can see this term\'s own performance alongside the combined result.' }
      ]
    },
    compute(values) {
      const priorPoints = values.priorGpa * values.priorCredits;
      const termCourses: [number, number][] = [
        [values.course1Grade, values.course1Credits],
        [values.course2Grade, values.course2Credits],
        [values.course3Grade, values.course3Credits],
        [values.course4Grade, values.course4Credits]
      ];
      const termPoints = termCourses.reduce((sum, [grade, credits]) => sum + grade * credits, 0);
      const termCredits = termCourses.reduce((sum, [, credits]) => sum + credits, 0);
      const newTotalCredits = values.priorCredits + termCredits;
      const newCumulativeGpa = newTotalCredits === 0 ? 0 : (priorPoints + termPoints) / newTotalCredits;
      const termGpa = termCredits === 0 ? 0 : termPoints / termCredits;
      return { newCumulativeGpa, newTotalCredits, termGpa, termCredits };
    }
  }
];
