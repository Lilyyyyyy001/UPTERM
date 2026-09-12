"use client";

"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";

const suggestions = [
    {
        icon: "💡",
        title: "Explain a topic",
        text: "Explain a difficult topic to me simply",
    },
    {
        icon: "❓",
        title: "Quiz me",
        text: "Quiz me on what I'm studying",
    },
    {
        icon: "📄",
        title: "Summarize notes",
        text: "Help me summarize my lecture notes",
    },
    {
        icon: "📅",
        title: "Create a study plan",
        text: "Create a study plan for me",
    },
];

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AssistantPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (event: FormEvent) => {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        setMessages((current) => [
            ...current,
            { role: "user", content: trimmedMessage },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/assistant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: trimmedMessage,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong.");
            }

            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    content: data.reply,
                },
            ]);
        } catch (error) {
            console.error(error);

            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    content:
                        "Sorry, I couldn't connect to UPTERM AI right now. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-slate-400">
                        UPTERM AI
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                        Your academic assistant 🤖
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                        Ask questions, understand difficult topics, create study plans,
                        summarize your notes, and prepare for exams.
                    </p>
                </div>

                {messages.length === 0 && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.title}
                                type="button"
                                onClick={() => setMessage(suggestion.text)}
                                className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                            >
                                <div className="text-2xl">{suggestion.icon}</div>

                                <h2 className="mt-3 font-bold">
                                    {suggestion.title}
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    {suggestion.text}
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="min-h-[420px] space-y-5 p-6 md:p-8">
                        {messages.length === 0 ? (
                            <div className="flex min-h-[350px] items-center justify-center text-center">
                                <div>
                                    <div className="text-5xl">🤖</div>

                                    <h2 className="mt-4 text-xl font-bold">
                                        What are you studying today?
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                        Ask UPTERM AI anything about your coursework.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex ${item.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user"
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-800"
                                            }`}
                                    >
                                        {item.role === "assistant" ? (
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ children }) => (
                                                        <h1 className="mb-3 text-xl font-bold">{children}</h1>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h2 className="mb-3 text-lg font-bold">{children}</h2>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="mb-2 text-base font-bold">{children}</h3>
                                                    ),
                                                    p: ({ children }) => (
                                                        <p className="mb-3 last:mb-0">{children}</p>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
                                                    ),
                                                    li: ({ children }) => <li>{children}</li>,
                                                    strong: ({ children }) => (
                                                        <strong className="font-bold">{children}</strong>
                                                    ),
                                                    code: ({ children }) => (
                                                        <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">
                                                            {children}
                                                        </code>
                                                    ),
                                                }}
                                            >
                                                {item.content}
                                            </ReactMarkdown>
                                        ) : (
                                            item.content
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-400">
                                    UPTERM AI is thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={sendMessage}
                        className="border-t border-slate-100 p-4 md:p-5"
                    >
                        <div className="flex gap-3">
                            <input
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Ask UPTERM AI anything..."
                                disabled={loading}
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
                            />

                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {loading ? "..." : "Send"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}