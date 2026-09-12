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

type ScheduleItem = {
    id: number;
    courseId: number;
    day: string;
    startTime: string;
    endTime: string;
    venue: string;
};

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function TimetablePage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [courseId, setCourseId] = useState("");
    const [day, setDay] = useState("Monday");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [venue, setVenue] = useState("");

    useEffect(() => {
        const savedCourses = localStorage.getItem("upterm-courses");
        const savedSchedule = localStorage.getItem("upterm-schedule");

        if (savedCourses) {
            setCourses(JSON.parse(savedCourses));
        }

        if (savedSchedule) {
            setSchedule(JSON.parse(savedSchedule));
        }
    }, []);

    const saveSchedule = (updated: ScheduleItem[]) => {
        setSchedule(updated);
        localStorage.setItem("upterm-schedule", JSON.stringify(updated));
    };

    const addSession = () => {
        if (!courseId || !startTime || !endTime) return;

        const newSession: ScheduleItem = {
            id: Date.now(),
            courseId: Number(courseId),
            day,
            startTime,
            endTime,
            venue,
        };

        saveSchedule([...schedule, newSession]);

        setCourseId("");
        setDay("Monday");
        setStartTime("");
        setEndTime("");
        setVenue("");
        setShowForm(false);
    };

    const removeSession = (id: number) => {
        saveSchedule(schedule.filter((session) => session.id !== id));
    };

    const getCourse = (id: number) => {
        return courses.find((course) => course.id === id);
    };

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <div className="mx-auto max-w-7xl p-6 md:p-10">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        >
                            ←
                        </Link>

                        <div>
                            <p className="text-sm text-slate-400">Academic OS</p>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Timetable
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        {showForm ? "Cancel" : "+ Add Session"}
                    </button>
                </div>

                {showForm && (
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-bold">Add timetable session</h2>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Course</label>
                                <select
                                    value={courseId}
                                    onChange={(e) => setCourseId(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                                >
                                    <option value="">Select a course</option>

                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} — {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Day</label>
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                                >
                                    {days.map((item) => (
                                        <option key={item}>{item}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Start time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">End time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">
                                    Venue <span className="text-slate-400">(optional)</span>
                                </label>

                                <input
                                    type="text"
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    placeholder="e.g. LT 2"
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            onClick={addSession}
                            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Save Session
                        </button>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {days.map((currentDay) => {
                        const daySessions = schedule
                            .filter((session) => session.day === currentDay)
                            .sort((a, b) => a.startTime.localeCompare(b.startTime));

                        return (
                            <div
                                key={currentDay}
                                className="rounded-2xl border border-slate-200 bg-white p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold">{currentDay}</h2>

                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                        {daySessions.length}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {daySessions.length === 0 ? (
                                        <p className="py-4 text-center text-sm text-slate-400">
                                            No sessions
                                        </p>
                                    ) : (
                                        daySessions.map((session) => {
                                            const course = getCourse(session.courseId);

                                            return (
                                                <div
                                                    key={session.id}
                                                    className="rounded-xl bg-slate-50 p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-400">
                                                                {session.startTime} – {session.endTime}
                                                            </p>

                                                            <p className="mt-1 font-semibold">
                                                                {course?.code || "Unknown course"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {course?.name || "Course unavailable"}
                                                            </p>

                                                            {session.venue && (
                                                                <p className="mt-2 text-xs text-slate-500">
                                                                    📍 {session.venue}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => removeSession(session.id)}
                                                            className="text-xs text-slate-400 hover:text-red-500"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}