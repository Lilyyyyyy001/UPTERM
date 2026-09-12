"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase-browser";

type Course = {
    id: number;
    code: string;
    name: string;
    lecturer: string;
    credits: number;
};

type Material = {
    id: number;
    courseId: number;
    title: string;
    description: string;
    filePath: string | null;
    fileName: string | null;
    fileType: string | null;
    fileSize: number | null;
};

type Assignment = {
    id: number;
    courseId: number;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
};

export default function CoursePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const supabase = createClient();

    const [course, setCourse] = useState<Course | null>(null);
    const [courseId, setCourseId] = useState<number | null>(null);

    const [materials, setMaterials] = useState<Material[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [materialError, setMaterialError] = useState("");

    const [assignmentTitle, setAssignmentTitle] = useState("");
    const [assignmentDescription, setAssignmentDescription] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [grade, setGrade] = useState("");
    const [gradeMessage, setGradeMessage] = useState("");
    const [savingGrade, setSavingGrade] = useState(false);

    useEffect(() => {
        async function loadCourse() {
            const { id } = await params;
            const numericId = Number(id);

            setCourseId(numericId);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return;
            }

            const { data: courseData, error: courseError } =
                await supabase
                    .from("courses")
                    .select("id, code, name, lecturer, credits")
                    .eq("id", numericId)
                    .eq("user_id", user.id)
                    .single();

            if (courseError) {
                console.error("Error loading course:", courseError);
                setCourse(null);
                return;
            }

            setCourse(courseData);

            const { data: materialData, error: materialError } =
                await supabase
                    .from("course_materials")
                    .select(
                        "id, course_id, title, description, file_path, file_name, file_type, file_size"
                    )
                    .eq("course_id", numericId)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: true });

            if (materialError) {
                console.error(
                    "Error loading course materials:",
                    materialError
                );
            } else {
                setMaterials(
                    (materialData || []).map((material) => ({
                        id: material.id,
                        courseId: material.course_id,
                        title: material.title,
                        description: material.description || "",
                        filePath: material.file_path || null,
                        fileName: material.file_name || null,
                        fileType: material.file_type || null,
                        fileSize: material.file_size || null,
                    }))
                );
            }

            // Load existing grade
            const { data: gradeData, error: gradeError } =
                await supabase
                    .from("grades")
                    .select("grade")
                    .eq("user_id", user.id)
                    .eq("course_id", numericId)
                    .maybeSingle();

            if (gradeError) {
                console.error("Error loading grade:", gradeError);
            } else if (gradeData) {
                setGrade(gradeData.grade);
            }

            // Assignments are still using localStorage for now
            const savedAssignments =
                localStorage.getItem("upterm-assignments");

            if (savedAssignments) {
                const allAssignments: Assignment[] =
                    JSON.parse(savedAssignments);

                setAssignments(
                    allAssignments.filter(
                        (assignment) =>
                            assignment.courseId === numericId
                    )
                );
            }
        }

        loadCourse();
    }, [params]);

    function formatFileSize(bytes: number | null) {
        if (!bytes) return "";

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    async function saveGrade() {
        setGradeMessage("");

        if (courseId === null) {
            setGradeMessage("Course could not be identified.");
            return;
        }

        if (!grade) {
            setGradeMessage("Please select a grade first.");
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setGradeMessage("You must be logged in to save a grade.");
            return;
        }

        setSavingGrade(true);

        try {
            const { data: existing, error: findError } =
                await supabase
                    .from("grades")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("course_id", courseId)
                    .maybeSingle();

            if (findError) {
                console.error("Error checking existing grade:", findError);
                setGradeMessage(
                    `Could not save grade: ${findError.message}`
                );
                return;
            }

            if (existing) {
                const { error: updateError } = await supabase
                    .from("grades")
                    .update({ grade })
                    .eq("id", existing.id)
                    .eq("user_id", user.id);

                if (updateError) {
                    console.error("Error updating grade:", updateError);
                    setGradeMessage(
                        `Could not save grade: ${updateError.message}`
                    );
                    return;
                }
            } else {
                const { error: insertError } = await supabase
                    .from("grades")
                    .insert({
                        user_id: user.id,
                        course_id: courseId,
                        grade,
                    });

                if (insertError) {
                    console.error("Error inserting grade:", insertError);
                    setGradeMessage(
                        `Could not save grade: ${insertError.message}`
                    );
                    return;
                }
            }

            setGradeMessage("Grade saved successfully.");
        } catch (error) {
            console.error("Unexpected grade error:", error);
            setGradeMessage("Something went wrong while saving the grade.");
        } finally {
            setSavingGrade(false);
        }
    }

    async function addMaterial(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMaterialError("");

        if (!title.trim() || courseId === null) {
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setMaterialError("You must be logged in to upload a material.");
            return;
        }

        setUploading(true);

        let uploadedFilePath: string | null = null;

        try {
            if (selectedFile) {
                const safeFileName = selectedFile.name
                    .replace(/[^a-zA-Z0-9._-]/g, "_")
                    .replace(/_+/g, "_");

                const filePath = `${user.id}/${courseId}/${Date.now()}-${safeFileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("course-materials")
                    .upload(filePath, selectedFile, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) {
                    console.error("Error uploading file:", uploadError);
                    setMaterialError(
                        `File upload failed: ${uploadError.message}`
                    );
                    return;
                }

                uploadedFilePath = filePath;
            }

            const { data, error } = await supabase
                .from("course_materials")
                .insert({
                    user_id: user.id,
                    course_id: courseId,
                    title: title.trim(),
                    description: description.trim(),
                    file_path: uploadedFilePath,
                    file_name: selectedFile?.name || null,
                    file_type: selectedFile?.type || null,
                    file_size: selectedFile?.size || null,
                })
                .select(
                    "id, course_id, title, description, file_path, file_name, file_type, file_size"
                )
                .single();

            if (error) {
                console.error("Error adding material:", error);

                if (uploadedFilePath) {
                    await supabase.storage
                        .from("course-materials")
                        .remove([uploadedFilePath]);
                }

                setMaterialError(
                    `Could not save material: ${error.message}`
                );
                return;
            }

            const newMaterial: Material = {
                id: data.id,
                courseId: data.course_id,
                title: data.title,
                description: data.description || "",
                filePath: data.file_path || null,
                fileName: data.file_name || null,
                fileType: data.file_type || null,
                fileSize: data.file_size || null,
            };

            setMaterials((current) => [...current, newMaterial]);

            setTitle("");
            setDescription("");
            setSelectedFile(null);
            setMaterialError("");
            setShowMaterialForm(false);
        } catch (error) {
            console.error("Unexpected material upload error:", error);
            setMaterialError(
                "Something went wrong while uploading the material."
            );
        } finally {
            setUploading(false);
        }
    }

    async function openMaterial(material: Material) {
        if (!material.filePath) {
            return;
        }

        const { data, error } = await supabase.storage
            .from("course-materials")
            .createSignedUrl(material.filePath, 60 * 60);

        if (error) {
            console.error("Error creating file URL:", error);
            setMaterialError("Unable to open this file.");
            return;
        }

        window.open(data.signedUrl, "_blank");
    }

    async function removeMaterial(material: Material) {
        setMaterialError("");

        if (material.filePath) {
            const { error: storageError } = await supabase.storage
                .from("course-materials")
                .remove([material.filePath]);

            if (storageError) {
                console.error(
                    "Error removing material file:",
                    storageError
                );
                setMaterialError("Could not remove the uploaded file.");
                return;
            }
        }

        const { error } = await supabase
            .from("course_materials")
            .delete()
            .eq("id", material.id)
            .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

        if (error) {
            console.error("Error removing material:", error);
            setMaterialError("Could not remove the material.");
            return;
        }

        setMaterials((current) =>
            current.filter((item) => item.id !== material.id)
        );
    }

    function addAssignment(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!assignmentTitle.trim() || !dueDate || courseId === null) {
            return;
        }

        const newAssignment: Assignment = {
            id: Date.now(),
            courseId,
            title: assignmentTitle.trim(),
            description: assignmentDescription.trim(),
            dueDate,
            completed: false,
        };

        const savedAssignments =
            localStorage.getItem("upterm-assignments");

        const allAssignments: Assignment[] = savedAssignments
            ? JSON.parse(savedAssignments)
            : [];

        localStorage.setItem(
            "upterm-assignments",
            JSON.stringify([...allAssignments, newAssignment])
        );

        setAssignments((current) => [...current, newAssignment]);

        setAssignmentTitle("");
        setAssignmentDescription("");
        setDueDate("");
        setShowAssignmentForm(false);
    }

    function toggleAssignment(id: number) {
        const updatedAssignments = assignments.map((assignment) =>
            assignment.id === id
                ? {
                    ...assignment,
                    completed: !assignment.completed,
                }
                : assignment
        );

        setAssignments(updatedAssignments);

        const savedAssignments =
            localStorage.getItem("upterm-assignments");

        const allAssignments: Assignment[] = savedAssignments
            ? JSON.parse(savedAssignments)
            : [];

        const updatedAllAssignments = allAssignments.map((assignment) =>
            assignment.id === id
                ? {
                    ...assignment,
                    completed: !assignment.completed,
                }
                : assignment
        );

        localStorage.setItem(
            "upterm-assignments",
            JSON.stringify(updatedAllAssignments)
        );
    }

    function removeAssignment(id: number) {
        const savedAssignments =
            localStorage.getItem("upterm-assignments");

        if (!savedAssignments) return;

        const allAssignments: Assignment[] =
            JSON.parse(savedAssignments);

        const updatedAssignments = allAssignments.filter(
            (assignment) => assignment.id !== id
        );

        localStorage.setItem(
            "upterm-assignments",
            JSON.stringify(updatedAssignments)
        );

        setAssignments((current) =>
            current.filter((assignment) => assignment.id !== id)
        );
    }

    if (!course) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">
                        Course not found
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        This course doesn't exist in your UPTERM workspace.
                    </p>

                    <Link
                        href="/courses"
                        className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                    >
                        ← Back to Courses
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <header className="border-b border-slate-200 bg-white px-6 py-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/courses"
                        className="text-sm font-medium text-slate-400 hover:text-slate-900"
                    >
                        ← Back to Courses
                    </Link>

                    <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-bold tracking-wider text-slate-400">
                                {course.code}
                            </p>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight">
                                {course.name}
                            </h1>

                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                                <span>
                                    {course.credits} credit units
                                </span>

                                {course.lecturer && (
                                    <span>
                                        • {course.lecturer}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
                {/* Course Overview */}
                <section className="rounded-3xl bg-slate-900 p-7 text-white md:p-9">
                    <p className="text-sm text-slate-300">
                        COURSE WORKSPACE
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {course.code} Workspace
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                        Organize your materials, assignments and study
                        activities for this course.
                    </p>
                </section>

                {/* Course Grade */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div>
                        <h2 className="text-lg font-bold">
                            🎓 Course Grade
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Enter the grade you received for this course.
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <select
                            value={grade}
                            onChange={(event) => {
                                setGrade(event.target.value);
                                setGradeMessage("");
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-slate-400 sm:flex-1"
                        >
                            <option value="">
                                Select your grade
                            </option>
                            <option value="A">
                                A — 5 points
                            </option>
                            <option value="B">
                                B — 4 points
                            </option>
                            <option value="C">
                                C — 3 points
                            </option>
                            <option value="D">
                                D — 2 points
                            </option>
                            <option value="E">
                                E — 1 point
                            </option>
                            <option value="F">
                                F — 0 points
                            </option>
                        </select>

                        <button
                            onClick={saveGrade}
                            disabled={!grade || savingGrade}
                            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {savingGrade
                                ? "Saving..."
                                : "Save Grade"}
                        </button>
                    </div>

                    {gradeMessage && (
                        <div
                            className={`mt-4 rounded-xl px-4 py-3 text-sm ${gradeMessage.includes("successfully")
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                        >
                            {gradeMessage}
                        </div>
                    )}
                </section>

                {/* Materials */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-lg font-bold">
                                📚 Lecture Materials
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Upload and organize your study materials.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setShowMaterialForm(
                                    !showMaterialForm
                                )
                            }
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            {showMaterialForm
                                ? "Close Form"
                                : "+ Add Material"}
                        </button>
                    </div>

                    {showMaterialForm && (
                        <form
                            onSubmit={addMaterial}
                            className="mt-6 space-y-4 border-t border-slate-100 pt-6"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Material Title
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    placeholder="e.g. Week 1 — Introduction"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Description / Notes
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Add some notes..."
                                    rows={4}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Upload File
                                </label>

                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ||
                                            null;

                                        setSelectedFile(file);
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    Supported: PDF, Word, PowerPoint,
                                    Excel, TXT and images.
                                </p>

                                {selectedFile && (
                                    <div className="mt-3 rounded-xl bg-slate-50 p-4">
                                        <p className="text-sm font-semibold">
                                            {selectedFile.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {formatFileSize(
                                                selectedFile.size
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {materialError && (
                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {materialError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Save Material"}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 space-y-4">
                        {materials.length === 0 ? (
                            <div className="rounded-xl bg-slate-50 p-8 text-center">
                                <p className="font-semibold">
                                    No materials yet
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Add your first lecture material.
                                </p>
                            </div>
                        ) : (
                            materials.map((material) => (
                                <article
                                    key={material.id}
                                    className="rounded-xl border border-slate-200 p-5"
                                >
                                    <p className="text-xs font-bold tracking-wider text-slate-400">
                                        {course.code}
                                    </p>

                                    <h3 className="mt-2 font-bold">
                                        {material.title}
                                    </h3>

                                    {material.description && (
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                                            {material.description}
                                        </p>
                                    )}

                                    {material.fileName && (
                                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm font-semibold">
                                                📎 {material.fileName}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {formatFileSize(
                                                    material.fileSize
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {material.filePath && (
                                            <button
                                                onClick={() =>
                                                    openMaterial(
                                                        material
                                                    )
                                                }
                                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                                            >
                                                Open File
                                            </button>
                                        )}

                                        <button
                                            onClick={() =>
                                                removeMaterial(
                                                    material
                                                )
                                            }
                                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-900"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                {/* Assignments */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-lg font-bold">
                                📝 Assignments
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Track your assignments and deadlines.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setShowAssignmentForm(
                                    !showAssignmentForm
                                )
                            }
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            {showAssignmentForm
                                ? "Close Form"
                                : "+ Add Assignment"}
                        </button>
                    </div>

                    {showAssignmentForm && (
                        <form
                            onSubmit={addAssignment}
                            className="mt-6 space-y-4 border-t border-slate-100 pt-6"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Assignment Title
                                </label>

                                <input
                                    type="text"
                                    value={assignmentTitle}
                                    onChange={(event) =>
                                        setAssignmentTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Assignment 1 — Arrays"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Instructions / Details
                                </label>

                                <textarea
                                    value={assignmentDescription}
                                    onChange={(event) =>
                                        setAssignmentDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="What do you need to do?"
                                    rows={4}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(event) =>
                                        setDueDate(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                            >
                                Save Assignment
                            </button>
                        </form>
                    )}

                    <div className="mt-6 space-y-4">
                        {assignments.length === 0 ? (
                            <div className="rounded-xl bg-slate-50 p-8 text-center">
                                <p className="font-semibold">
                                    No assignments yet
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Add your first assignment.
                                </p>
                            </div>
                        ) : (
                            assignments.map((assignment) => (
                                <article
                                    key={assignment.id}
                                    className="rounded-xl border border-slate-200 p-5"
                                >
                                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() =>
                                                    toggleAssignment(
                                                        assignment.id
                                                    )
                                                }
                                                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs ${assignment.completed
                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                        : "border-slate-300"
                                                    }`}
                                            >
                                                {assignment.completed
                                                    ? "✓"
                                                    : ""}
                                            </button>

                                            <div>
                                                <h3
                                                    className={`font-bold ${assignment.completed
                                                            ? "text-slate-400 line-through"
                                                            : ""
                                                        }`}
                                                >
                                                    {assignment.title}
                                                </h3>

                                                <p className="mt-2 text-sm text-slate-500">
                                                    {assignment.description ||
                                                        "No additional details."}
                                                </p>

                                                <p className="mt-3 text-xs font-semibold text-slate-400">
                                                    Due:{" "}
                                                    {assignment.dueDate}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                removeAssignment(
                                                    assignment.id
                                                )
                                            }
                                            className="text-sm font-semibold text-slate-400 hover:text-slate-900"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                {/* Future Features */}
                <section className="grid gap-5 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="text-2xl">🧠</p>

                        <h3 className="mt-4 font-bold">
                            AI Study Assistant
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Study this course with Claude.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="text-2xl">❓</p>

                        <h3 className="mt-4 font-bold">
                            Quizzes
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Test your understanding.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="text-2xl">📊</p>

                        <h3 className="mt-4 font-bold">
                            Course Progress
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Track your progress.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}