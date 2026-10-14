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
    loadCards: (searchQuery?: string) => Promise<void>;
    deleteCards: (ids: string[]) => Promise<void>;
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

interface SelectionContextValue {
    selecting: boolean;
    selected: Set<string>;
    allSelected: boolean;
    startSelecting: () => void;
    exitSelecting: () => void;
    toggleCard: (id: string) => void;
    toggleAll: () => void;
}

const CardsContext = createContext<CardsContextValue | null>(null);
const SaveContext = createContext<SaveContextValue | null>(null);
const SelectionContext = createContext<SelectionContextValue | null>(null);

// what's typed in the navbar search: the navbar fetches with it, the cards highlight it
interface SearchContextValue {
    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function CardsProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>({ name: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const saveCard = (id: string) => {
        setCards((prev) => prev.map((card) => card.id === id ? { ...card, ...draft } : card));
    }

    // newest first, so a freshly created log shows at the top of the grid
    const addCard = (card: Card) => {
        setCards((prev) => [card, ...prev]);
    }

    // deletes on the server, then drops only the ids the server confirms it deleted
    // (errors are thrown so the caller can show them)
    const deleteCards = async (ids: string[]) => {
        const result = await useFetchHandler({ ids: ids.map(Number) }, "POST", `${API_BASE}/logs/delete`);
        const deleted = new Set<string>(result.data.deleted_ids.map(String));
        setCards((prev) => prev.filter((card) => !deleted.has(card.id)));
    }

    // selection mode for bulk delete: the navbar holds the controls, the grid shows the ticks
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const exitSelecting = useCallback(() => {
        setSelecting(false);
        setSelected(new Set());
    }, []);

    const toggleCard = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    const allSelected = cards.length > 0 && selected.size === cards.length;
    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(cards.map((card) => card.id)));
    }

    // replaces the cards with the logged-in user's logs from the backend, optionally filtered by a search
    // (useCallback keeps it stable so pages can list it in useEffect deps)
    const loadCards = useCallback(async (searchQuery?: string) => {
        setLoading(true);
        setError(null);
        try{
            // URLSearchParams encodes the text, so spaces or "&" in a search can't break the URL
            const params = new URLSearchParams();
            if (searchQuery) params.set("searchQuery", searchQuery);
            const query = params.toString();
            const result = await useFetchHandler(null, "GET", `${API_BASE}/get-logs${query ? `?${query}` : ""}`);
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
        <CardsContext.Provider value={{ cards, draft, setDraft, saveCard, addCard, loadCards, deleteCards, loading, error }}>
            <SaveContext.Provider value={{ isEditing, setIsEditing }}>
                <SelectionContext.Provider value={{ selecting, selected, allSelected, startSelecting: () => setSelecting(true), exitSelecting, toggleCard, toggleAll }}>
                    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
                        {children}
                    </SearchContext.Provider>
                </SelectionContext.Provider>
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

export function useSelection() {
    const context = useContext(SelectionContext);
    if (!context) throw new Error("useSelection must be used inside <CardsProvider>");
    return context;
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) throw new Error("useSearch must be used inside <CardsProvider>");
    return context;
}
