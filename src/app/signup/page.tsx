"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function SignupPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSignup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone,
                },
            },
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setSuccess(
            "Account created successfully! Check your email to verify your account."
        );

        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
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
                        Create your account
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Create your UPTERM student account.
                    </p>
                </div>

                <form
                    onSubmit={handleSignup}
                    className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                    <div>
                        <label className="text-sm font-semibold">
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

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
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08012345678"
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
                            placeholder="Create a password"
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Enter your password again"
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-slate-900 hover:underline"
                        >
                            Log in
                        </Link>
                    </p>

                </form>
            </div>
        </main>
    );
}