import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHandler } from "../../hooks/fetchHandler";
import { useCards, type LogResponse } from "../../context/cards-context";
import { ALLOWED_FILE_EXTENSIONS, ALLOWED_FILE_TYPES, API_BASE, MAX_FILE_SIZE } from "../../config";

// quick check before uploading; the backend re-checks the real file contents
const fileError = (file: File) => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(file.type) || !ALLOWED_FILE_EXTENSIONS.includes(extension)) {
        return "Only PDF or image files (png, jpg, gif, webp) are allowed";
    }
    if (file.size === 0) return "File is empty";
    if (file.size > MAX_FILE_SIZE) return "File must be 10 MB or smaller";
    return null;
}

const inputClass = "w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-base font-normal outline-none focus:border-white placeholder:text-white/40";

export default function CreateLog(){
    const { addCard } = useCards();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) return setError("Please attach a file");
        const invalid = fileError(file);
        if (invalid) return setError(invalid);
        setError(null);
        setSubmitting(true);

        try{
            // the endpoint reads multipart form fields, so send FormData (fetchHandler adds the token)
            const requestPayload = new FormData();
            requestPayload.append("name", name);
            requestPayload.append("description", description);
            requestPayload.append("file", file);

            const result = await fetchHandler<{ data: LogResponse }>(requestPayload, "POST", `${API_BASE}/logFormData`);

            // use what the backend actually saved, including where it stored the file
            addCard({
                id: String(result.data.id),
                name: result.data.name,
                description: result.data.description,
                filePath: result.data.file_path ?? file.name,
                fileUrl: result.data.file_url ? `${API_BASE}${result.data.file_url}` : null,
                fileType: result.data.file_type,
            });
            navigate("/Home");
        }catch(e: unknown){
            setError(e instanceof Error ? e.message : "An unexpected error occured");
        }finally{
            setSubmitting(false);
        }
    }

    return (
        <div className="w-full flex-1 min-h-0 overflow-y-auto overscroll-none scrollbar-hidden flex items-start sm:items-center justify-center px-4 py-4">
            <form
                onSubmit={handleSubmit}
                className="glass-card backdrop-blur-lg w-full max-w-lg flex flex-col gap-4 p-6 rounded-2xl text-white"
            >
                <h1 className="text-xl sm:text-2xl font-semibold">Create log</h1>

                <input className={inputClass} placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
                <textarea className={`${inputClass} h-40 resize-none`} placeholder="Description" required value={description} onChange={(e) => setDescription(e.target.value)} />
                <input
                    type="file"
                    required
                    accept={[...ALLOWED_FILE_TYPES, ...ALLOWED_FILE_EXTENSIONS].join(",")}
                    onChange={(e) => {
                        const picked = e.target.files?.[0] ?? null;
                        setFile(picked);
                        setError(picked ? fileError(picked) : null);
                    }}
                    className="text-sm text-white/70 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-white/15 file:text-white file:cursor-pointer hover:file:bg-white/25"
                />

                <span className="-mt-2 text-xs text-white/50">PDF or image (png, jpg, gif, webp), up to 10 MB</span>

                {error && <span className="text-red-400 text-sm">{error}</span>}

                <div className="flex justify-end gap-2 sm:gap-4">
                    <button type="button" onClick={() => navigate("/Home")} className="px-4 py-2 border border-white rounded-lg cursor-pointer hover:text-gray-400">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-white text-black rounded-lg cursor-pointer hover:bg-gray-300 disabled:opacity-50">
                        {submitting ? "Saving..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    )
}
