"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase-browser";

export default function LoginPage() {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        window.location.href = "/";
    }

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
            <div className="mx-auto max-w-md">

                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="text-2xl font-black tracking-tight"
                    >
                        UPTERM
                    </Link>

                    <h1 className="mt-8 text-3xl font-bold tracking-tight">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Log in to continue to your academic OS.
                    </p>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="text-sm font-semibold">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        Don't have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold text-slate-900 hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    );
}