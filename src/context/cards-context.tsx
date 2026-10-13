import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useFetchHandler } from "../hooks/fetchHandler";

export interface Card {
    id: string;
    name: string;
    description: string;
    filePath: string;
    fileUrl: string | null;    // full URL the attachment is served at, null when there's no file
    fileType: string | null;   // MIME type, e.g. "image/png"
}

export const API_BASE = "http://127.0.0.1:8000";

// must match ALLOWED_EXTENSIONS / MAX_FILE_SIZE in the backend's helper/normalHelper.py
export const ALLOWED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp"];
export const ALLOWED_FILE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface Draft {
    name: string;
    description: string;
}

interface CardsContextValue {
    cards: Card[];
    draft: Draft;
    setDraft: (draft: Draft) => void;
    saveCard: (id: string) => void;
    addCard: (card: Card) => void;
    loadCards: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

// shape of one log in the /get-logs response
interface LogResponse {
    id: number;
    name: string;
    description: string;
    file_path: string | null;
    file_url: string | null;
    file_type: string | null;
}

interface SaveContextValue {
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

const CardsContext = createContext<CardsContextValue | null>(null);
const SaveContext = createContext<SaveContextValue | null>(null);

export function CardsProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>({ name: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);

    const saveCard = (id: string) => {
        setCards((prev) => prev.map((card) => card.id === id ? { ...card, ...draft } : card));
    }

    // newest first, so a freshly created log shows at the top of the grid
    const addCard = (card: Card) => {
        setCards((prev) => [card, ...prev]);
    }

    // replaces the cards with the logged-in user's logs from the backend
    // (useCallback keeps it stable so pages can list it in useEffect deps)
    const loadCards = useCallback(async () => {
        setLoading(true);
        setError(null);
        try{
            const result = await useFetchHandler(null, "GET", "http://127.0.0.1:8000/get-logs");
            setCards(result.data.map((log: LogResponse) => ({
                id: String(log.id),
                name: log.name,
                description: log.description,
                filePath: log.file_path ?? "",
                fileUrl: log.file_url ? `${API_BASE}${log.file_url}` : null,
                fileType: log.file_type,
            })));
        }catch(e: unknown){
            setError(e instanceof Error ? e.message : "Could not load logs");
        }finally{
            setLoading(false);
        }
    }, []);

    return (
        <CardsContext.Provider value={{ cards, draft, setDraft, saveCard, addCard, loadCards, loading, error }}>
            <SaveContext.Provider value={{ isEditing, setIsEditing }}>
                {children}
            </SaveContext.Provider>
        </CardsContext.Provider>
    )
}

export function useCards() {
    const context = useContext(CardsContext);
    if (!context) throw new Error("useCards must be used inside <CardsProvider>");
    return context;
}

export function useSaveContext() {
    const context = useContext(SaveContext);
    if (!context) throw new Error("useSaveContext must be used inside <CardsProvider>");
    return context;
}
