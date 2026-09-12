"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase-browser";

type StudentProfile = {
    fullName: string;
    email: string;
    phone: string;
    university: string;
    department: string;
    level: string;
    semester: string;
    studentId: string;
};

const emptyProfile: StudentProfile = {
    fullName: "",
    email: "",
    phone: "",
    university: "",
    department: "",
    level: "",
    semester: "",
    studentId: "",
};

export default function SettingsPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<StudentProfile>(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setError("");

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setError("You need to be logged in to view your profile.");
                setLoading(false);
                return;
            }

            const { data, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, phone")
                .eq("id", user.id)
                .maybeSingle();

            if (profileError) {
                console.error(profileError);
                setError("Could not load your profile.");
                setLoading(false);
                return;
            }

            const savedProfile = localStorage.getItem("upterm-profile");

            let localProfile: Partial<StudentProfile> = {};

            if (savedProfile) {
                try {
                    localProfile = JSON.parse(savedProfile);
                } catch {
                    localProfile = {};
                }
            }

            setProfile({
                fullName: data?.full_name || "",
                email: user.email || "",
                phone: data?.phone || "",
                university: localProfile.university || "",
                department: localProfile.department || "",
                level: localProfile.level || "",
                semester: localProfile.semester || "",
                studentId: localProfile.studentId || "",
            });

            setLoading(false);
        }

        loadProfile();
    }, []);

    function handleChange(
        field: keyof StudentProfile,
        value: string
    ) {
        setProfile((current) => ({
            ...current,
            [field]: value,
        }));

        setMessage("");
        setError("");
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setError("You need to be logged in.");
            setSaving(false);
            return;
        }

        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                full_name: profile.fullName,
                phone: profile.phone,
            })
            .eq("id", user.id);

        if (profileError) {
            console.error(profileError);
            setError("Could not save your profile. Please try again.");
            setSaving(false);
            return;
        }

        localStorage.setItem(
            "upterm-profile",
            JSON.stringify(profile)
        );

        setMessage("Profile saved successfully.");
        setSaving(false);
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-900">
                <div className="mx-auto max-w-5xl px-6 py-10">
                    <p className="text-sm text-slate-500">
                        Loading your profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-5xl px-6 py-10">

                <div className="mb-8">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        ← Back to Dashboard
                    </Link>

                    <h1 className="mt-6 text-3xl font-bold tracking-tight">
                        Settings
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Manage your UPTERM student profile and academic information.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* Personal Information */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Personal Information
                        </h2>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">

                            <div>
                                <label className="text-sm font-semibold">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={profile.fullName}
                                    onChange={(e) =>
                                        handleChange(
                                            "fullName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                                />

                                <p className="mt-1 text-xs text-slate-400">
                                    Your email comes from your UPTERM account.
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) =>
                                        handleChange(
                                            "phone",
                                            e.target.value
                                        )
                                    }
                                    placeholder="08012345678"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    Student ID / Matric Number
                                </label>

                                <input
                                    type="text"
                                    value={profile.studentId}
                                    onChange={(e) =>
                                        handleChange(
                                            "studentId",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your student ID"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                />
                            </div>

                        </div>
                    </section>

                    {/* Academic Information */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Academic Information
                        </h2>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">

                            <div>
                                <label className="text-sm font-semibold">
                                    University
                                </label>

                                <input
                                    type="text"
                                    value={profile.university}
                                    onChange={(e) =>
                                        handleChange(
                                            "university",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your university"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    Department / Programme
                                </label>

                                <input
                                    type="text"
                                    value={profile.department}
                                    onChange={(e) =>
                                        handleChange(
                                            "department",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Data Science"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    Level
                                </label>

                                <select
                                    value={profile.level}
                                    onChange={(e) =>
                                        handleChange(
                                            "level",
                                            e.target.value
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                                >
                                    <option value="">
                                        Select level
                                    </option>
                                    <option value="100 Level">
                                        100 Level
                                    </option>
                                    <option value="200 Level">
                                        200 Level
                                    </option>
                                    <option value="300 Level">
                                        300 Level
                                    </option>
                                    <option value="400 Level">
                                        400 Level
                                    </option>
                                    <option value="500 Level">
                                        500 Level
                                    </option>
                                    <option value="Postgraduate">
                                        Postgraduate
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    Current Semester
                                </label>

                                <select
                                    value={profile.semester}
                                    onChange={(e) =>
                                        handleChange(
                                            "semester",
                                            e.target.value
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                                >
                                    <option value="">
                                        Select semester
                                    </option>
                                    <option value="First Semester">
                                        First Semester
                                    </option>
                                    <option value="Second Semester">
                                        Second Semester
                                    </option>
                                </select>
                            </div>

                        </div>
                    </section>

                    {/* Save */}
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">

                        <div>
                            {message && (
                                <p className="text-sm font-semibold text-green-600">
                                    ✓ {message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>

                    </div>

                </form>
            </div>
        </main>
    );
}