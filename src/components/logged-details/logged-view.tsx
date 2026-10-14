import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE, useCards, useSaveContext, useSearch } from "../../context/cards-context";
import Highlight from "../highlight";
import { downloadFile } from "../../hooks/fetchHandler";

// "C:\...\Uploads\<32 hex>_notes.pdf" -> "notes.pdf"
const displayName = (filePath: string) =>
    (filePath.split(/[\\/]/).pop() ?? "").replace(/^[0-9a-f]{32}_/, "");

export default function LoggedView() {

    const { isEditing } = useSaveContext();
    const { id } = useParams();
    const { cards, draft, setDraft, loadCards, loading } = useCards();
    const { searchQuery } = useSearch();
    const card = cards.find((c) => c.id === id);
    // remembers an image URL that failed to load, so a missing image hides the panel
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // opened directly (e.g. page refresh) before the home page fetched anything
    useEffect(() => {
        if (cards.length === 0) loadCards();
    }, []);

    // load the selected card into the editable draft
    useEffect(() => {
        if (card) setDraft({ name: card.name, description: card.description });
    }, [id, card?.id]);

    if (!card && loading) {
        return <p className="text-white/70 text-xl">Loading...</p>
    }

    if (!card) {
        return <p className="text-white text-xl">Card not found</p>
    }

    const fileName = displayName(card.filePath);
    const isImage = !!card.fileType?.startsWith("image/");
    const isPdf = card.fileType === "application/pdf";
    const showPanel = !!card.fileUrl && failedUrl !== card.fileUrl;

    const handleDownload = async () => {
        setDownloading(true);
        setDownloadError(null);
        try{
            await downloadFile(`${API_BASE}/logs/${card.id}/download`, fileName);
        }catch(e: unknown){
            setDownloadError(e instanceof Error ? e.message : "Download failed");
        }finally{
            setDownloading(false);
        }
    }

    return(
        // no justify-center here: centring a scroll container's content pushes its top out of reach when it overflows
        <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row gap-6 items-stretch px-4 sm:px-8 pb-8 overflow-y-auto overscroll-none scrollbar-hidden">
            {/* without an attachment the log takes the full width (capped so lines stay readable, centred by mx-auto) */}
            <div className={`glass-card backdrop-blur-lg rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shrink-0 lg:shrink ${showPanel ? "w-full lg:w-1/2" : "w-full max-w-4xl mx-auto"}`}>
                {isEditing ? (
                    <input
                        type="text"
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        value={draft.name}
                        className="h-10 px-4 py-2 border border-white rounded-lg text-white bg-transparent focus:outline-none"
                    />
                ) : (
                    <h1 className="text-xl sm:text-2xl font-medium text-white"><Highlight text={card.name} query={searchQuery} /></h1>
                )}

                <div className="w-full flex-1 min-h-[40vh] lg:min-h-0">
                    {isEditing ? (
                        <textarea
                        id="description"
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        value={draft.description}
                        className="w-full h-full px-4 py-2 border border-white rounded-lg text-white/90 bg-transparent focus:outline-none resize-none"
                        ></textarea>
                    ) : (
                        // a textarea can't style part of its text, so reading mode renders the description
                        // as plain text (keeping line breaks) to show search highlights
                        <div id="description" className="w-full h-full px-4 py-2 border border-transparent rounded-lg text-white/90 whitespace-pre-wrap break-words overflow-y-auto scrollbar-hidden">
                            <Highlight text={draft.description} query={searchQuery} />
                        </div>
                    )}
                </div>
            </div>

            {showPanel && (
                <div className="glass-card backdrop-blur-lg rounded-2xl w-full lg:w-1/2 flex flex-col overflow-hidden h-[75dvh] shrink-0 lg:h-auto lg:shrink">
                    {/* header: file name on the left, download on the side */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/15">
                        <span className="text-white/80 text-sm truncate" title={fileName}>
                            {isPdf ? "📄" : "🖼️"} {fileName}
                        </span>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-black text-sm cursor-pointer hover:bg-gray-300 disabled:opacity-50"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                            </svg>
                            {downloading ? "Downloading..." : "Download"}
                        </button>
                    </div>
                    {downloadError && <span className="px-4 pt-2 text-red-400 text-sm">{downloadError}</span>}

                    {/* preview: images inline, PDFs in the browser's built-in viewer */}
                    <div className="flex-1 min-h-0 p-2 flex items-center justify-center">
                        {isImage ? (
                            <img
                                src={card.fileUrl!}
                                alt={card.name}
                                onError={() => setFailedUrl(card.fileUrl)}
                                className="max-w-full max-h-full object-contain rounded-xl"
                            />
                        ) : isPdf ? (
                            <iframe src={card.fileUrl!} title={fileName} className="w-full h-full rounded-xl bg-white" />
                        ) : (
                            <p className="text-white/60 text-sm text-center px-4">
                                Preview isn't available for this file type. Use Download to open it.
                            </p>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}
