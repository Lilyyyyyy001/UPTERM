"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
    id: number;
    code: string;
    name: string;
    lecturer: string;
    credits: number;
};

type Assignment = {
    id: number;
    courseId: number;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
};

export default function AssignmentsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    useEffect(() => {
        const savedCourses = localStorage.getItem("upterm-courses");
        const savedAssignments = localStorage.getItem("upterm-assignments");

        if (savedCourses) {
            setCourses(JSON.parse(savedCourses));
        }

        if (savedAssignments) {
            setAssignments(JSON.parse(savedAssignments));
        }
    }, []);

    const getCourse = (courseId: number) => {
        return courses.find((course) => course.id === courseId);
    };

    const toggleAssignment = (id: number) => {
        const updated = assignments.map((assignment) =>
            assignment.id === id
                ? { ...assignment, completed: !assignment.completed }
                : assignment
        );

        setAssignments(updated);
        localStorage.setItem("upterm-assignments", JSON.stringify(updated));
    };

    const pendingAssignments = assignments.filter(
        (assignment) => !assignment.completed
    );

    const completedAssignments = assignments.filter(
        (assignment) => assignment.completed
    );

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <div className="mx-auto max-w-6xl p-6 md:p-10">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        ←
                    </Link>

                    <div>
                        <p className="text-sm text-slate-400">Academic OS</p>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Assignments
                        </h1>
                    </div>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-400">Total</p>
                        <p className="mt-2 text-3xl font-bold">{assignments.length}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-400">Pending</p>
                        <p className="mt-2 text-3xl font-bold">
                            {pendingAssignments.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-400">Completed</p>
                        <p className="mt-2 text-3xl font-bold">
                            {completedAssignments.length}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">Your assignments</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Keep track of everything you need to submit.
                        </p>
                    </div>

                    {assignments.length === 0 ? (
                        <div className="rounded-2xl bg-slate-50 p-10 text-center">
                            <p className="text-3xl">📚</p>
                            <h3 className="mt-3 font-semibold">No assignments yet</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Add assignments from your course workspace.
                            </p>

                            <Link
                                href="/courses"
                                className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                Go to Courses →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.map((assignment) => {
                                const course = getCourse(assignment.courseId);

                                return (
                                    <div
                                        key={assignment.id}
                                        className={`flex items-center gap-4 rounded-2xl border p-4 transition ${assignment.completed
                                                ? "border-slate-100 bg-slate-50"
                                                : "border-slate-200 bg-white"
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleAssignment(assignment.id)}
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${assignment.completed
                                                    ? "border-slate-900 bg-slate-900 text-white"
                                                    : "border-slate-300 text-transparent hover:border-slate-500"
                                                }`}
                                        >
                                            ✓
                                        </button>

                                        <div className="min-w-0 flex-1">
                                            <h3
                                                className={`font-semibold ${assignment.completed
                                                        ? "text-slate-400 line-through"
                                                        : ""
                                                    }`}
                                            >
                                                {assignment.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {course
                                                    ? `${course.code} · ${course.name}`
                                                    : "Course unavailable"}
                                            </p>

                                            {assignment.description && (
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {assignment.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-slate-400">Due</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {assignment.dueDate || "No date"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}