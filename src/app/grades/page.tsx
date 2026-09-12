"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase-browser";

type Course = {
    id: number;
    code: string;
    name: string;
    lecturer: string;
    credits: number;
};

type Grade = {
    course_id: number;
    grade: string;
};

const gradePoints: Record<string, number> = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0,
};

export default function GradesPage() {
    const supabase = createClient();

    const [courses, setCourses] = useState<Course[]>([]);
    const [grades, setGrades] = useState<Record<number, string>>({});
    const [gpa, setGpa] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadData() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: courseData, error: courseError } = await supabase
                .from("courses")
                .select("id, code, name, lecturer, credits")
                .eq("user_id", user.id)
                .order("code");

            if (courseError) {
                console.error(courseError);
                setMessage("Could not load your courses.");
                setLoading(false);
                return;
            }

            const { data: gradeData, error: gradeError } = await supabase
                .from("grades")
                .select("course_id, grade")
                .eq("user_id", user.id);

            if (gradeError) {
                console.error(gradeError);
                setMessage("Could not load your grades.");
                setLoading(false);
                return;
            }

            const gradeMap: Record<number, string> = {};

            (gradeData as Grade[] | null)?.forEach((item) => {
                gradeMap[item.course_id] = item.grade;
            });

            setCourses(courseData || []);
            setGrades(gradeMap);
            setLoading(false);
        }

        loadData();
    }, []);

    useEffect(() => {
        let qualityPoints = 0;
        let totalCredits = 0;

        courses.forEach((course) => {
            const grade = grades[course.id];

            if (grade && gradePoints[grade] !== undefined) {
                qualityPoints += gradePoints[grade] * Number(course.credits);
                totalCredits += Number(course.credits);
            }
        });

        if (totalCredits > 0) {
            setGpa(qualityPoints / totalCredits);
        } else {
            setGpa(null);
        }
    }, [courses, grades]);

    async function saveGrade(courseId: number) {
        const grade = grades[courseId];

        if (!grade) return;

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setMessage("You need to be logged in.");
            return;
        }

        const { data: existing } = await supabase
            .from("grades")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .maybeSingle();

        let error = null;

        if (existing) {
            const result = await supabase
                .from("grades")
                .update({ grade })
                .eq("id", existing.id);

            error = result.error;
        } else {
            const result = await supabase.from("grades").insert({
                user_id: user.id,
                course_id: courseId,
                grade,
            });

            error = result.error;
        }

        if (error) {
            console.error(error);
            setMessage("Could not save grade.");
            return;
        }

        setMessage("Grade saved successfully.");
    }

    const gradedCount = courses.filter(
        (course) => grades[course.id]
    ).length;

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <div className="mx-auto max-w-5xl p-6 md:p-10">

                <p className="text-sm font-medium text-slate-400">
                    ACADEMIC PERFORMANCE
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                    Grades & GPA
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Enter your grades and UPTERM will calculate your GPA.
                </p>

                <div className="mt-8 rounded-3xl bg-slate-900 p-7 text-white">
                    <p className="text-sm text-slate-400">
                        CURRENT GPA
                    </p>

                    <p className="mt-2 text-5xl font-bold">
                        {gpa !== null ? gpa.toFixed(2) : "—"}
                    </p>

                    <p className="mt-3 text-sm text-slate-400">
                        {gradedCount} of {courses.length} courses graded
                    </p>
                </div>

                {message && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                        {message}
                    </div>
                )}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="font-bold">
                        Your Courses
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Select the grade you received for each course.
                    </p>

                    {loading ? (
                        <p className="mt-8 text-sm text-slate-400">
                            Loading your courses...
                        </p>
                    ) : courses.length === 0 ? (
                        <p className="mt-8 text-sm text-slate-400">
                            No courses found.
                        </p>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {course.code}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {course.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {course.credits} credit
                                            {Number(course.credits) !== 1 ? "s" : ""}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <select
                                            value={grades[course.id] || ""}
                                            onChange={(event) =>
                                                setGrades((current) => ({
                                                    ...current,
                                                    [course.id]: event.target.value,
                                                }))
                                            }
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                                        >
                                            <option value="">Select grade</option>
                                            <option value="A">A — 5 points</option>
                                            <option value="B">B — 4 points</option>
                                            <option value="C">C — 3 points</option>
                                            <option value="D">D — 2 points</option>
                                            <option value="E">E — 1 point</option>
                                            <option value="F">F — 0 points</option>
                                        </select>

                                        <button
                                            onClick={() => saveGrade(course.id)}
                                            disabled={!grades[course.id]}
                                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="font-bold">
                        5-Point Grading Scale
                    </h2>

                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                        {Object.entries(gradePoints).map(([grade, points]) => (
                            <div
                                key={grade}
                                className="rounded-xl bg-slate-50 p-3 text-center"
                            >
                                <p className="text-lg font-bold">
                                    {grade}
                                </p>

                                <p className="text-xs text-slate-400">
                                    {points} point{points !== 1 ? "s" : ""}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}