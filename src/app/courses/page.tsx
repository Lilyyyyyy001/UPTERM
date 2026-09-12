"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase-browser";

type Course = {
    id: number;
    code: string;
    name: string;
    lecturer: string;
    credits: number;
};

export default function CoursesPage() {
    const supabase = createClient();

    const [courses, setCourses] = useState<Course[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [lecturer, setLecturer] = useState("");
    const [credits, setCredits] = useState("");

    useEffect(() => {
        async function loadCourses() {
            const { data, error } = await supabase
                .from("courses")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error loading courses:", error);
                return;
            }

            setCourses(data || []);
        }

        loadCourses();
    }, []);

    async function addCourse(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!code.trim() || !name.trim() || !credits) {
            return;
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            alert("You must be logged in to add a course.");
            return;
        }

        const { data, error } = await supabase
            .from("courses")
            .insert({
                user_id: user.id,
                code: code.trim().toUpperCase(),
                name: name.trim(),
                lecturer: lecturer.trim(),
                credits: Number(credits),
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding course:", error);
            alert(`Could not add course: ${error.message}`);
            return;
        }

        setCourses((currentCourses) => [...currentCourses, data]);

        setCode("");
        setName("");
        setLecturer("");
        setCredits("");
        setShowForm(false);
    }

    async function removeCourse(id: number) {
        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error removing course:", error);
            alert("Could not remove course. Please try again.");
            return;
        }

        setCourses((currentCourses) =>
            currentCourses.filter((course) => course.id !== id)
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-6 py-10">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            My Courses
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Manage your courses and access your academic workspace.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        {showForm ? "Cancel" : "+ Add Course"}
                    </button>
                </div>

                {showForm && (
                    <form
                        onSubmit={addCourse}
                        className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <h2 className="mb-5 text-xl font-bold text-slate-900">
                            Add a Course
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">

                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Course code (e.g. CSC 204)"
                                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                            />

                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Course name"
                                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                            />

                            <input
                                value={lecturer}
                                onChange={(e) => setLecturer(e.target.value)}
                                placeholder="Lecturer"
                                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                            />

                            <input
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                placeholder="Credits"
                                type="number"
                                min="0"
                                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                            />

                        </div>

                        <button
                            type="submit"
                            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Save Course
                        </button>
                    </form>
                )}

                <section>
                    {courses.length === 0 ? (

                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <h2 className="text-xl font-bold text-slate-900">
                                No courses yet
                            </h2>

                            <p className="mt-2 text-slate-500">
                                Add your first course to get started.
                            </p>
                        </div>

                    ) : (

                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {courses.map((course) => (

                                <article
                                    key={course.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                >

                                    <div>

                                        <p className="text-sm font-bold text-slate-500">
                                            {course.code}
                                        </p>

                                        <h2 className="mt-2 text-xl font-bold text-slate-900">
                                            {course.name}
                                        </h2>

                                        <div className="mt-4 space-y-1 text-sm text-slate-500">

                                            <p>
                                                Lecturer:{" "}
                                                {course.lecturer || "Not specified"}
                                            </p>

                                            <p>
                                                Credits: {course.credits}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="mt-6 flex gap-2">

                                        <Link
                                            href={`/courses/${course.id}`}
                                            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50"
                                        >
                                            Open Course →
                                        </Link>

                                        <button
                                            onClick={() => removeCourse(course.id)}
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </section>

            </div>
        </main>
    );
}