"use client";

import { useEffect, useState } from "react";

type Goal = {
    id: number;
    title: string;
    description: string;
    category: string;
    target: number;
    progress: number;
    unit: string;
};

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Academic");
    const [target, setTarget] = useState("");
    const [unit, setUnit] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("upterm-goals");

        if (saved) {
            try {
                setGoals(JSON.parse(saved));
            } catch {
                setGoals([]);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "upterm-goals",
            JSON.stringify(goals)
        );
    }, [goals]);

    function addGoal() {
        if (!title.trim() || !target || !unit.trim()) {
            return;
        }

        const newGoal: Goal = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            category,
            target: Number(target),
            progress: 0,
            unit: unit.trim(),
        };

        setGoals([...goals, newGoal]);

        setTitle("");
        setDescription("");
        setTarget("");
        setUnit("");
        setCategory("Academic");
        setShowForm(false);
    }

    function increaseProgress(id: number, amount: number) {
        setGoals(
            goals.map((goal) => {
                if (goal.id !== id) {
                    return goal;
                }

                return {
                    ...goal,
                    progress: Math.min(
                        goal.target,
                        goal.progress + amount
                    ),
                };
            })
        );
    }

    function deleteGoal(id: number) {
        setGoals(
            goals.filter((goal) => goal.id !== id)
        );
    }

    const completedGoals = goals.filter(
        (goal) => goal.progress >= goal.target
    ).length;

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <div className="flex min-h-screen">

                <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
                    <div className="mb-10">
                        <h1 className="text-2xl font-bold">
                            UPTERM
                        </h1>

                        <p className="text-xs text-slate-400">
                            Academic OS
                        </p>
                    </div>

                    <nav className="space-y-2">
                        <a href="/" className="block rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100">
                            ⌂ Dashboard
                        </a>

                        <a href="/courses" className="block rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100">
                            ▣ Courses
                        </a>

                        <a href="/assignments" className="block rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100">
                            ✓ Assignments
                        </a>

                        <a href="/timetable" className="block rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100">
                            ▦ Timetable
                        </a>

                        <a href="/analytics" className="block rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100">
                            ◈ Analytics
                        </a>

                        <a
                            href="/goals"
                            className="block rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                        >
                            ◎ Goals
                        </a>

                        <a href="/calendar" className="block rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100">
                            □ Calendar
                        </a>
                    </nav>
                </aside>

                <section className="flex-1">
                    <header className="border-b border-slate-200 bg-white px-6 py-6 md:px-10">
                        <p className="text-sm text-slate-400">
                            Academic planning
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                            Goals 🎯
                        </h2>
                    </header>

                    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">

                        <div className="rounded-3xl bg-slate-900 p-8 text-white">
                            <p className="text-sm text-slate-300">
                                YOUR ACADEMIC GOALS
                            </p>

                            <h3 className="mt-2 text-3xl font-bold">
                                Turn your plans into progress.
                            </h3>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                Set goals for your academics, studying and
                                personal development, then track your progress.
                            </p>

                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900"
                            >
                                + Add Goal
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <p className="text-sm text-slate-400">
                                    Total Goals
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {goals.length}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <p className="text-sm text-slate-400">
                                    Completed
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {completedGoals}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <p className="text-sm text-slate-400">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {goals.length - completedGoals}
                                </p>
                            </div>
                        </div>

                        {showForm && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <h3 className="text-lg font-bold">
                                    Create a goal
                                </h3>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Goal title"
                                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                    />

                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                    >
                                        <option>Academic</option>
                                        <option>Study</option>
                                        <option>Personal</option>
                                    </select>

                                    <input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description"
                                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                    />

                                    <input
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        type="number"
                                        placeholder="Target"
                                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                    />

                                    <input
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        placeholder="Unit (GPA, days, hours...)"
                                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                    />
                                </div>

                                <button
                                    onClick={addGoal}
                                    className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                                >
                                    Create Goal
                                </button>
                            </div>
                        )}

                        <div>
                            <h3 className="font-bold">
                                Your goals
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                Keep track of what you want to achieve.
                            </p>

                            {goals.length === 0 ? (
                                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center">
                                    <p className="text-lg font-bold">
                                        No goals yet 🎯
                                    </p>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Add your first goal to get started.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {goals.map((goal) => {
                                        const percentage = Math.round(
                                            Math.min(
                                                goal.progress / goal.target,
                                                1
                                            ) * 100
                                        );

                                        return (
                                            <div
                                                key={goal.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-6"
                                            >
                                                <div className="flex justify-between gap-4">
                                                    <div>
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                                                            {goal.category}
                                                        </span>

                                                        <h4 className="mt-3 text-lg font-bold">
                                                            {goal.title}
                                                        </h4>

                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {goal.description}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => deleteGoal(goal.id)}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>

                                                <div className="mt-6">
                                                    <div className="flex justify-between text-sm font-semibold">
                                                        <span>
                                                            {goal.progress} / {goal.target}{" "}
                                                            {goal.unit}
                                                        </span>

                                                        <span>
                                                            {percentage}%
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 h-3 rounded-full bg-slate-100">
                                                        <div
                                                            className="h-3 rounded-full bg-slate-900 transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {goal.progress >= goal.target ? (
                                                    <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white">
                                                        ✓ Goal completed!
                                                    </div>
                                                ) : (
                                                    <div className="mt-5 flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                increaseProgress(goal.id, 1)
                                                            }
                                                            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                                                        >
                                                            +1
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                increaseProgress(goal.id, 5)
                                                            }
                                                            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                                                        >
                                                            +5
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                </section>
            </div>
        </main>
    );
}