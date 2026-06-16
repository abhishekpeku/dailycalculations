'use client';

import { useState, useMemo, useCallback } from 'react';

type CourseType = '2year' | '3year' | '4year';

type Course = {
  id: string;
  name: string;
  grade: number;
  credits: number;
};

type Semester = {
  courses: Course[];
};

const SEMESTER_COUNTS: Record<CourseType, number> = {
  '2year': 4,
  '3year': 6,
  '4year': 8,
};

const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  '2year': '2-Year Masters',
  '3year': '3-Year Bachelor\'s',
  '4year': '4-Year Bachelor\'s',
};

let _id = 0;
const uid = () => `c${++_id}`;

const defaultCourse = (): Course => ({ id: uid(), name: '', grade: 4, credits: 3 });
const defaultSemester = (): Semester => ({ courses: [defaultCourse(), defaultCourse(), defaultCourse()] });

function semesterGpa(courses: Course[]) {
  const credits = courses.reduce((s, c) => s + c.credits, 0);
  const points = courses.reduce((s, c) => s + c.grade * c.credits, 0);
  return { gpa: credits === 0 ? 0 : points / credits, credits, points };
}

function fmt(n: number) {
  return n.toFixed(2);
}

export default function GpaCalculator() {
  const [courseType, setCourseType] = useState<CourseType>('4year');
  const [semesters, setSemesters] = useState<Semester[]>(() =>
    Array.from({ length: SEMESTER_COUNTS['4year'] }, defaultSemester)
  );

  const activeSemesters = semesters.slice(0, SEMESTER_COUNTS[courseType]);

  const handleTypeChange = useCallback((type: CourseType) => {
    const count = SEMESTER_COUNTS[type];
    setSemesters((prev) => {
      if (prev.length >= count) return prev;
      return [...prev, ...Array.from({ length: count - prev.length }, defaultSemester)];
    });
    setCourseType(type);
  }, []);

  const updateCourse = useCallback((si: number, ci: number, field: 'name' | 'grade' | 'credits', value: string | number) => {
    setSemesters((prev) => {
      const next = prev.map((s, i) =>
        i !== si ? s : {
          courses: s.courses.map((c, j) =>
            j !== ci ? c : { ...c, [field]: value }
          )
        }
      );
      return next;
    });
  }, []);

  const addCourse = useCallback((si: number) => {
    setSemesters((prev) =>
      prev.map((s, i) => i !== si ? s : { courses: [...s.courses, defaultCourse()] })
    );
  }, []);

  const removeCourse = useCallback((si: number, ci: number) => {
    setSemesters((prev) =>
      prev.map((s, i) =>
        i !== si ? s : { courses: s.courses.filter((_, j) => j !== ci) }
      )
    );
  }, []);

  const semesterStats = useMemo(() =>
    activeSemesters.map((s) => semesterGpa(s.courses)),
    [activeSemesters]
  );

  const cumulative = useMemo(() => {
    const totalCredits = semesterStats.reduce((s, st) => s + st.credits, 0);
    const totalPoints = semesterStats.reduce((s, st) => s + st.points, 0);
    return {
      gpa: totalCredits === 0 ? 0 : totalPoints / totalCredits,
      credits: totalCredits,
      points: totalPoints,
    };
  }, [semesterStats]);

  const yearCount = SEMESTER_COUNTS[courseType] / 2;

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-panel dark:border-slate-800 dark:bg-slate-950/90">
      {/* Course type selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Course type</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(COURSE_TYPE_LABELS) as CourseType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                courseType === type
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300'
                  : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              {COURSE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Years and semesters */}
      {Array.from({ length: yearCount }, (_, yi) => (
        <div key={yi} className="space-y-4">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Year {yi + 1}
          </h3>

          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1].map((half) => {
              const si = yi * 2 + half;
              const stats = semesterStats[si];
              const sem = activeSemesters[si];

              return (
                <div
                  key={si}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Semester {half + 1}
                    </p>
                    <span className="rounded-xl bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                      GPA {fmt(stats.gpa)}
                    </span>
                  </div>

                  {/* Course header */}
                  <div className="mb-1 grid grid-cols-[1fr_5rem_5rem_1.5rem] gap-1 px-1 text-xs text-slate-400 dark:text-slate-500">
                    <span>Course (optional)</span>
                    <span>Grade pts</span>
                    <span>Credits</span>
                    <span />
                  </div>

                  <div className="space-y-1">
                    {sem.courses.map((course, ci) => (
                      <div key={course.id} className="grid grid-cols-[1fr_5rem_5rem_1.5rem] gap-1 items-center">
                        <input
                          type="text"
                          value={course.name}
                          onChange={(e) => updateCourse(si, ci, 'name', e.target.value)}
                          placeholder={`Course ${ci + 1}`}
                          className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-400"
                        />
                        <input
                          type="number"
                          value={course.grade}
                          onChange={(e) => updateCourse(si, ci, 'grade', Number(e.target.value))}
                          step={0.1}
                          min={0}
                          max={4}
                          placeholder="4.0"
                          className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-400"
                        />
                        <input
                          type="number"
                          value={course.credits}
                          onChange={(e) => updateCourse(si, ci, 'credits', Number(e.target.value))}
                          step={0.5}
                          min={0}
                          placeholder="3"
                          className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-400"
                        />
                        <button
                          onClick={() => removeCourse(si, ci)}
                          disabled={sem.courses.length <= 1}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          aria-label="Remove course"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addCourse(si)}
                    className="mt-2 text-xs font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    + Add course
                  </button>

                  <div className="mt-3 flex gap-3 border-t border-slate-200 pt-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <span>{fmt(stats.credits)} credits</span>
                    <span>{fmt(stats.points)} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Cumulative summary */}
      <div className="grid gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/30 sm:grid-cols-3">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Cumulative GPA</p>
          <p className="mt-1 text-3xl font-bold text-brand-700 dark:text-brand-300">{fmt(cumulative.gpa)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Credits</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-200">{fmt(cumulative.credits)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Grade Points</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-200">{fmt(cumulative.points)}</p>
        </div>
      </div>
    </div>
  );
}
