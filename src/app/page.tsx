"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

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

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
};

type ScheduleItem = {
  id: number;
  courseId: number;
  day: string;
  startTime: string;
  endTime: string;
  venue: string;
};

const gradePoints: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

const navigation = [
  { icon: "⌂", label: "Dashboard" },
  { icon: "▣", label: "Courses" },
  { icon: "✓", label: "Assignments" },
  { icon: "▦", label: "Timetable" },
  { icon: "◈", label: "Analytics" },
  { icon: "◎", label: "Goals" },
  { icon: "□", label: "Calendar" },
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState("");
  const [studentName, setStudentName] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const [loadingAcademicData, setLoadingAcademicData] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  useEffect(() => {
    const today = new Date();

    setCurrentDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );

    const savedAssignments =
      localStorage.getItem("upterm-assignments");

    const savedSchedule =
      localStorage.getItem("upterm-schedule");

    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch (error) {
        console.error("Could not load assignments:", error);
      }
    }

    if (savedSchedule) {
      try {
        setSchedule(JSON.parse(savedSchedule));
      } catch (error) {
        console.error("Could not load timetable:", error);
      }
    }

  }, []);

  useEffect(() => {
    async function loadAcademicData() {
      setLoadingAcademicData(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingAcademicData(false);
        return;
      }

      // Load student profile
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Could not load student profile:",
          profileError
        );
      }

      if (profile?.full_name) {
        setStudentName(profile.full_name);
      }

      // Load courses
      const { data: courseData, error: courseError } =
        await supabase
          .from("courses")
          .select("id, code, name, lecturer, credits")
          .eq("user_id", user.id)
          .order("code");

      if (courseError) {
        console.error(
          "Could not load courses:",
          courseError
        );
      } else {
        setCourses(courseData || []);
      }

      // Load grades
      const { data: gradeData, error: gradeError } =
        await supabase
          .from("grades")
          .select("course_id, grade")
          .eq("user_id", user.id);

      if (gradeError) {
        console.error(
          "Could not load grades:",
          gradeError
        );
      } else {
        setGrades(gradeData || []);
      }

      setLoadingAcademicData(false);
    }

    loadAcademicData();

  }, []);

  const getCourse = (courseId: number) => {
    return courses.find((course) => course.id === courseId);
  };

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

  const currentGpa =
    totalCredits > 0
      ? qualityPoints / totalCredits
      : null;

  const gradedCourses = courses.filter(
    (course) => gradeMap[course.id]
  ).length;

  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const todaySchedule = schedule
    .filter((session) => session.day === todayName)
    .sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  const completedAssignments = assignments.filter(
    (assignment) => assignment.completed
  ).length;

  const studyProgress =
    assignments.length > 0
      ? Math.round(
        (completedAssignments / assignments.length) * 100
      )
      : 0;
  const pendingAssignments = assignments.filter(
    (assignment) => !assignment.completed
  );

  const dueThisWeek = pendingAssignments.filter(
    (assignment) => {
      if (!assignment.dueDate) return false;

      const due = new Date(assignment.dueDate);
      const today = new Date();

      if (Number.isNaN(due.getTime())) return false;

      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfToday);
      endOfWeek.setDate(
        startOfToday.getDate() + 7
      );
      endOfWeek.setHours(23, 59, 59, 999);

      return (
        due >= startOfToday &&
        due <= endOfWeek
      );
    }

  ).length;

  const upcomingAssignments = [
    ...pendingAssignments,
  ]
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();

      return dateA - dateB;
    })
    .slice(0, 3);

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return "No date";

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return dueDate;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  };

  const firstName = studentName
    ? studentName.split(" ")[0]
    : "Student";

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
              <h1 className="text-lg font-bold tracking-tight">
                UPTERM
              </h1>

              <p className="text-xs text-slate-400">
                Academic OS
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item, index) => {
              const routes = [
                "/",
                "/courses",
                "/assignments",
                "/timetable",
                "/analytics",
                "/goals",
                "/calendar",
              ];

              return (
                <Link
                  key={item.label}
                  href={routes[index]}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${index === 0
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <span className="w-5 text-center text-base">
                    {item.icon}
                  </span>

                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400">
              STUDY PROGRESS
            </p>

            <p className="mt-2 text-2xl font-bold">
              {studyProgress}%
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-500"
                style={{ width: `${studyProgress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {assignments.length === 0
                ? "Add assignments to track your progress."
                : `${completedAssignments} of ${assignments.length} assignments completed.`}
            </p>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-10">
            <div>
              <p className="text-sm text-slate-400">
                {currentDate}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Hi, {firstName}!
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 sm:block">
                Search
              </button>

              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
                {studentName
                  ? studentName.charAt(0).toUpperCase()
                  : "U"}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">

            {/* Welcome */}
            <div className="rounded-3xl bg-slate-900 p-7 text-white md:p-9">
              <p className="text-sm text-slate-300">
                YOUR ACADEMIC OVERVIEW
              </p>

              <h3 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Stay on top of your semester.
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Everything you need to manage your courses,
                assignments, schedule and academic progress —
                all in one place!
              </p>

              <Link
                href="/assistant"
                className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Open AI Assistant →
              </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* GPA */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-400">
                  Current GPA
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loadingAcademicData
                    ? "..."
                    : currentGpa !== null
                      ? currentGpa.toFixed(2)
                      : "—"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {gradedCourses > 0
                    ? `${gradedCourses} of ${courses.length} courses graded`
                    : "Out of 5.00"}
                </p>
              </div>

              {/* Courses */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-400">
                  Courses
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loadingAcademicData
                    ? "..."
                    : courses.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  This semester
                </p>
              </div>

              {/* Assignments */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-400">
                  Assignments
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {assignments.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {dueThisWeek} due this week
                </p>
              </div>

              {/* Study streak */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-400">
                  Study Streak
                </p>

                <p className="mt-2 text-3xl font-bold">
                  12 days
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Personal best: 18
                </p>
              </div>

            </div>

            {/* Lower dashboard */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Assignments */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">
                      Upcoming assignments
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Stay ahead of your deadlines.
                    </p>
                  </div>

                  <Link
                    href="/assignments"
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-5 divide-y divide-slate-100">

                  {upcomingAssignments.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-6 text-center">
                      <p className="font-semibold">
                        No pending assignments 🎉
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    upcomingAssignments.map(
                      (assignment) => {
                        const course = getCourse(
                          assignment.courseId
                        );

                        return (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between gap-4 py-4"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {assignment.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {course
                                  ? `${course.code} · ${course.name}`
                                  : "Course unavailable"}{" "}
                                · Due{" "}
                                {formatDueDate(
                                  assignment.dueDate
                                )}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              Upcoming
                            </span>
                          </div>
                        );
                      }
                    )
                  )}

                </div>
              </div>

              {/* Today's schedule */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <h3 className="font-bold">
                  Today's schedule
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {todayName}
                </p>

                <div className="mt-6 space-y-4">

                  {todaySchedule.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-6 text-center">
                      <p className="font-semibold">
                        No sessions today
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Enjoy the free time!
                      </p>
                    </div>
                  ) : (
                    todaySchedule.map(
                      (session) => {
                        const course = getCourse(
                          session.courseId
                        );

                        return (
                          <div
                            key={session.id}
                            className="rounded-xl bg-slate-50 p-4"
                          >
                            <p className="text-xs font-semibold text-slate-400">
                              {session.startTime} –{" "}
                              {session.endTime}
                            </p>

                            <p className="mt-1 font-semibold">
                              {course?.code ||
                                "Unknown course"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {course?.name ||
                                "Course unavailable"}
                            </p>

                            {session.venue && (
                              <p className="mt-2 text-xs text-slate-500">
                                📍 {session.venue}
                              </p>
                            )}
                          </div>
                        );
                      }
                    )
                  )}

                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </main>

  );
}