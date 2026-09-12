"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function AnalyticsPage() {
    const supabase = createClient();

    const [courses, setCourses] = useState<Course[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: courseData, error: courseError } =
                await supabase
                    .from("courses")
                    .select("id, code, name, lecturer, credits")
                    .eq("user_id", user.id)
                    .order("code");

            if (courseError) {
                console.error("Could not load courses:", courseError);
            }

            const { data: gradeData, error: gradeError } =
                await supabase
                    .from("grades")
                    .select("course_id, grade")
                    .eq("user_id", user.id);

            if (gradeError) {
                console.error("Could not load grades:", gradeError);
            }

            setCourses(courseData || []);
            setGrades(gradeData || []);
            setLoading(false);
        }

        loadData();
    }, []);

    const gradeMap: Record<number, string> = {};

    grades.forEach((item) => {
        gradeMap[item.course_id] = item.grade;
    });

    let qualityPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
        const grade = gradeMap[course.id];

        if (grade && gradePoints[grade] !== undefined) {
            qualityPoints +=
                gradePoints[grade] * Number(course.credits);

            totalCredits += Number(course.credits);
        }
    });

    const gpa =
        totalCredits > 0
            ? qualityPoints / totalCredits
            : null;

    const gradedCourses = courses.filter(
        (course) => gradeMap[course.id]
    );

    const totalCourseCredits = courses.reduce(
        (total, course) => total + Number(course.credits),
        0
    );

    const gradeCounts: Record<string, number> = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
    };

    grades.forEach((item) => {
        if (gradeCounts[item.grade] !== undefined) {
            gradeCounts[item.grade]++;
        }
    });

    const bestCourses = [...gradedCourses]
        .sort((a, b) => {
            const gradeA = gradePoints[gradeMap[a.id]] ?? -1;
            const gradeB = gradePoints[gradeMap[b.id]] ?? -1;

            return gradeB - gradeA;
        })
        .slice(0, 3);

    const attentionCourses = [...gradedCourses]
        .filter((course) => {
            const points = gradePoints[gradeMap[course.id]];
            return points <= 2;
        })
        .sort((a, b) => {
            const gradeA = gradePoints[gradeMap[a.id]] ?? 99;
            const gradeB = gradePoints[gradeMap[b.id]] ?? 99;

            return gradeA - gradeB;
        })
        .slice(0, 3);

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <div className="mx-auto max-w-7xl p-6 md:p-10">

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <Link
                            href="/"
                            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                        >
                            ← Back to Dashboard
                        </Link>

                        <p className="mt-6 text-sm font-semibold text-slate-400">
                            ACADEMIC ANALYTICS
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                            Your academic performance
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            See how you're performing across your courses.
                        </p>
                    </div>

                    <Link
                        href="/grades"
                        className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
                    >
                        Manage Grades →
                    </Link>
                </div>

                {/* Main GPA card */}
                <div className="mt-8 rounded-3xl bg-slate-900 p-7 text-white md:p-9">
                    <div className="grid gap-8 md:grid-cols-3">

                        <div>
                            <p className="text-sm text-slate-400">
                                CURRENT GPA
                            </p>

                            <p className="mt-2 text-5xl font-bold">
                                {loading
                                    ? "..."
                                    : gpa !== null
                                        ? gpa.toFixed(2)
                                        : "—"}
                            </p>

                            <p className="mt-3 text-sm text-slate-400">
                                Out of 5.00
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400">
                                QUALITY POINTS
                            </p>

                            <p className="mt-2 text-4xl font-bold">
                                {loading
                                    ? "..."
                                    : qualityPoints.toFixed(1)}
                            </p>

                            <p className="mt-3 text-sm text-slate-400">
                                From graded courses
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400">
                                CREDIT UNITS
                            </p>

                            <p className="mt-2 text-4xl font-bold">
                                {loading
                                    ? "..."
                                    : totalCredits}
                            </p>

                            <p className="mt-3 text-sm text-slate-400">
                                Credits included in GPA
                            </p>
                        </div>

                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-400">
                            Total Courses
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {loading ? "..." : courses.length}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            This semester
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-400">
                            Courses Graded
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {loading ? "..." : gradedCourses.length}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Of {courses.length} courses
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-400">
                            Total Credits
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {loading ? "..." : totalCourseCredits}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Across all courses
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-400">
                            Completion
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {courses.length > 0
                                ? Math.round(
                                    (gradedCourses.length / courses.length) * 100
                                )
                                : 0}
                            %
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Courses with grades
                        </p>
                    </div>

                </div>

                {/* Grade Distribution */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="font-bold">
                        Grade Distribution
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Your current grade breakdown.
                    </p>

                    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
                        {Object.entries(gradeCounts).map(
                            ([grade, count]) => (
                                <div
                                    key={grade}
                                    className="rounded-xl bg-slate-50 p-4 text-center"
                                >
                                    <p className="text-2xl font-bold">
                                        {grade}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {count}{" "}
                                        {count === 1
                                            ? "course"
                                            : "courses"}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Best + Attention */}
                <div className="mt-6 grid gap-6 lg:grid-cols-2">

                    {/* Best courses */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="font-bold">
                            🏆 Best Performing Courses
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Your strongest grades so far.
                        </p>

                        <div className="mt-5 space-y-3">
                            {bestCourses.length === 0 ? (
                                <div className="rounded-xl bg-slate-50 p-5 text-center">
                                    <p className="text-sm font-semibold">
                                        No graded courses yet.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Add grades to see your performance.
                                    </p>
                                </div>
                            ) : (
                                bestCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {course.code}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {course.name}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">
                                            {gradeMap[course.id]}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Attention */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="font-bold">
                            ⚠️ Courses Needing Attention
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Courses where your current grade is D or below.
                        </p>

                        <div className="mt-5 space-y-3">
                            {attentionCourses.length === 0 ? (
                                <div className="rounded-xl bg-slate-50 p-5 text-center">
                                    <p className="text-sm font-semibold">
                                        You're doing great! 🎉
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        No low grades detected.
                                    </p>
                                </div>
                            ) : (
                                attentionCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {course.code}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {course.name}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">
                                            {gradeMap[course.id]}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* Course Performance Table */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="font-bold">
                        Course Performance
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Detailed breakdown of your current semester.
                    </p>

                    {loading ? (
                        <p className="mt-8 text-sm text-slate-400">
                            Loading your academic data...
                        </p>
                    ) : courses.length === 0 ? (
                        <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
                            <p className="font-semibold">
                                No courses found.
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Add courses first to see your analytics.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                                        <th className="px-3 py-3">
                                            Course
                                        </th>

                                        <th className="px-3 py-3">
                                            Credits
                                        </th>

                                        <th className="px-3 py-3">
                                            Grade
                                        </th>

                                        <th className="px-3 py-3">
                                            Points
                                        </th>

                                        <th className="px-3 py-3">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {courses.map((course) => {
                                        const grade =
                                            gradeMap[course.id];

                                        const points =
                                            grade &&
                                                gradePoints[grade] !== undefined
                                                ? gradePoints[grade]
                                                : null;

                                        return (
                                            <tr
                                                key={course.id}
                                                className="border-b border-slate-50 last:border-0"
                                            >
                                                <td className="px-3 py-4">
                                                    <p className="font-semibold">
                                                        {course.code}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {course.name}
                                                    </p>
                                                </td>

                                                <td className="px-3 py-4 text-sm">
                                                    {course.credits}
                                                </td>

                                                <td className="px-3 py-4">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">
                                                        {grade || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-4 text-sm font-semibold">
                                                    {points !== null
                                                        ? points
                                                        : "—"}
                                                </td>

                                                <td className="px-3 py-4">
                                                    {grade ? (
                                                        <span className="text-sm font-medium text-green-600">
                                                            Graded
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">
                                                            Awaiting grade
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}