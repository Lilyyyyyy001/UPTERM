"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CalendarEvent = {
    id: number;
    title: string;
    description: string;
    date: string;
    type: string;
};

const eventTypes = [
    "Assignment",
    "Exam",
    "Lecture",
    "Study Session",
    "Personal",
    "Other",
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");

    const [currentMonth, setCurrentMonth] = useState(
        new Date().getMonth()
    );

    const [currentYear, setCurrentYear] = useState(
        new Date().getFullYear()
    );

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("Assignment");

    useEffect(() => {
        const savedEvents = localStorage.getItem("upterm-calendar");

        if (savedEvents) {
            try {
                setEvents(JSON.parse(savedEvents));
            } catch {
                setEvents([]);
            }
        }
    }, []);

    const saveEvents = (updated: CalendarEvent[]) => {
        const sorted = [...updated].sort((a, b) =>
            a.date.localeCompare(b.date)
        );

        setEvents(sorted);
        localStorage.setItem(
            "upterm-calendar",
            JSON.stringify(sorted)
        );
    };

    const addEvent = () => {
        if (!title.trim() || !date) return;

        const newEvent: CalendarEvent = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            date,
            type,
        };

        saveEvents([...events, newEvent]);

        setTitle("");
        setDescription("");
        setDate("");
        setType("Assignment");
        setShowForm(false);
    };

    const removeEvent = (id: number) => {
        saveEvents(events.filter((event) => event.id !== id));
    };

    const monthName = new Date(
        currentYear,
        currentMonth,
        1
    ).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const calendarDays = useMemo(() => {
        const firstDay = new Date(
            currentYear,
            currentMonth,
            1
        ).getDay();

        const daysInMonth = new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();

        const previousMonthDays = new Date(
            currentYear,
            currentMonth,
            0
        ).getDate();

        const days = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: previousMonthDays - i,
                date: "",
                currentMonth: false,
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const month = String(currentMonth + 1).padStart(2, "0");
            const dayString = String(day).padStart(2, "0");

            days.push({
                day,
                date: `${currentYear}-${month}-${dayString}`,
                currentMonth: true,
            });
        }

        while (days.length < 42) {
            const nextDay: number = days.length - firstDay - daysInMonth + 1;

            days.push({
                day: nextDay,
                date: "",
                currentMonth: false,
            });
        }

        return days;
    }, [currentMonth, currentYear]);

    const eventsForDate = (dateString: string) =>
        events.filter((event) => event.date === dateString);

    const today = new Date();

    const todayString =
        `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(
            2,
            "0"
        )}`;

    const selectedEvents = selectedDate
        ? eventsForDate(selectedDate)
        : [];

    const upcomingEvents = [...events]
        .filter((event) => event.date >= todayString)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setSelectedDate(todayString);
    };

    const formatDate = (dateString: string) => {
        return new Date(
            `${dateString}T00:00:00`
        ).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <div className="flex min-h-screen">

                {/* Sidebar */}
                <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 md:flex">
                    <div className="mb-10 flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                            U
                        </div>

                        <div>
                            <h1 className="text-lg font-bold">
                                UPTERM
                            </h1>

                            <p className="text-xs text-slate-400">
                                Academic OS
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <Link
                            href="/"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            <span>⌂</span>
                            Dashboard
                        </Link>

                        <Link
                            href="/courses"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            <span>▣</span>
                            Courses
                        </Link>

                        <Link
                            href="/assignments"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            <span>✓</span>
                            Assignments
                        </Link>

                        <Link
                            href="/timetable"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            <span>▦</span>
                            Timetable
                        </Link>

                        <Link
                            href="/analytics"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            <span>◈</span>
                            Analytics
                        </Link>

                        <Link
                            href="/goals"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            <span>◎</span>
                            Goals
                        </Link>

                        <Link
                            href="/calendar"
                            className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-3 text-sm font-medium text-white"
                        >
                            <span>□</span>
                            Calendar
                        </Link>
                    </nav>
                </aside>

                {/* Main content */}
                <section className="flex-1">

                    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-10">
                        <div>
                            <p className="text-sm text-slate-400">
                                Academic planning
                            </p>

                            <h2 className="mt-1 text-2xl font-bold">
                                Calendar 📅
                            </h2>
                        </div>

                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            {showForm ? "Cancel" : "+ Add Event"}
                        </button>
                    </header>

                    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">

                        {/* Calendar */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">

                            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                                <div>
                                    <h3 className="text-xl font-bold">
                                        {monthName}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Your academic schedule at a glance.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={goToToday}
                                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                    >
                                        Today
                                    </button>

                                    <button
                                        onClick={goToPreviousMonth}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                                    >
                                        ←
                                    </button>

                                    <button
                                        onClick={goToNextMonth}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 border-b border-slate-200">
                                {weekdays.map((day) => (
                                    <div
                                        key={day}
                                        className="p-2 text-center text-xs font-semibold text-slate-400 md:p-3"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7">
                                {calendarDays.map((day, index) => {
                                    const dayEvents = day.date
                                        ? eventsForDate(day.date)
                                        : [];

                                    const isToday =
                                        day.date === todayString;

                                    const isSelected =
                                        day.date === selectedDate;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (day.date) {
                                                    setSelectedDate(day.date);
                                                }
                                            }}
                                            className={`min-h-24 border-b border-r border-slate-100 p-2 text-left transition md:min-h-28 ${!day.currentMonth
                                                ? "bg-slate-50 text-slate-300"
                                                : "hover:bg-slate-50"
                                                } ${isSelected
                                                    ? "bg-slate-100"
                                                    : ""
                                                }`}
                                        >
                                            <div
                                                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${isToday
                                                    ? "bg-slate-900 text-white"
                                                    : ""
                                                    }`}
                                            >
                                                {day.day}
                                            </div>

                                            <div className="mt-2 space-y-1">
                                                {dayEvents.slice(0, 2).map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="truncate rounded-md bg-slate-900 px-1.5 py-1 text-[10px] font-medium text-white"
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}

                                                {dayEvents.length > 2 && (
                                                    <p className="text-[10px] text-slate-400">
                                                        +{dayEvents.length - 2} more
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Add Event */}
                        {showForm && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <h3 className="text-lg font-bold">
                                    Add academic event
                                </h3>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">

                                    <div>
                                        <label className="text-sm font-medium">
                                            Event title
                                        </label>

                                        <input
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            placeholder="e.g. CSC 204 Exam"
                                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Date
                                        </label>

                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) =>
                                                setDate(e.target.value)
                                            }
                                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Event type
                                        </label>

                                        <select
                                            value={type}
                                            onChange={(e) =>
                                                setType(e.target.value)
                                            }
                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                        >
                                            {eventTypes.map((eventType) => (
                                                <option key={eventType}>
                                                    {eventType}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Description
                                        </label>

                                        <input
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            placeholder="Optional details..."
                                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={addEvent}
                                    className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Save Event
                                </button>
                            </div>
                        )}

                        {/* Selected date */}
                        {selectedDate && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">
                                            Selected date
                                        </p>

                                        <h3 className="mt-1 text-xl font-bold">
                                            {formatDate(selectedDate)}
                                        </h3>
                                    </div>

                                    <button
                                        onClick={() => setSelectedDate("")}
                                        className="text-sm text-slate-400 hover:text-slate-900"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div className="mt-5">
                                    {selectedEvents.length === 0 ? (
                                        <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
                                            No events scheduled for this day.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-semibold">
                                                                {event.title}
                                                            </h4>

                                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                                                {event.type}
                                                            </span>
                                                        </div>

                                                        {event.description && (
                                                            <p className="mt-1 text-sm text-slate-400">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            removeEvent(event.id)
                                                        }
                                                        className="text-xs text-slate-400 hover:text-red-500"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upcoming events */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="mb-5">
                                <h3 className="font-bold">
                                    Upcoming events
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Your next important academic dates.
                                </p>
                            </div>

                            {upcomingEvents.length === 0 ? (
                                <div className="rounded-xl bg-slate-50 p-6 text-center">
                                    <p className="font-semibold">
                                        No upcoming events
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Add an exam, assignment or study session.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100">
                                                <span className="text-[10px] font-medium uppercase text-slate-400">
                                                    {new Date(
                                                        `${event.date}T00:00:00`
                                                    ).toLocaleDateString("en-US", {
                                                        month: "short",
                                                    })}
                                                </span>

                                                <span className="font-bold">
                                                    {new Date(
                                                        `${event.date}T00:00:00`
                                                    ).getDate()}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-semibold">
                                                        {event.title}
                                                    </h4>

                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                                        {event.type}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    {formatDate(event.date)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    removeEvent(event.id)
                                                }
                                                className="text-xs text-slate-400 hover:text-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </section>
            </div>
        </main>
    );
}