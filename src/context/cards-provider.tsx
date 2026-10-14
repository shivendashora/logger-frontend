import { useCallback, useRef, useState, type ReactNode } from "react";
import { fetchHandler } from "../hooks/fetchHandler";
import { API_BASE, PAGE_SIZE } from "../config";
import {
    CardsContext, SaveContext, SearchContext, SelectionContext,
    type Card, type Draft, type LogResponse,
} from "./cards-context";

interface PageResponse {
    total: number;
    data: LogResponse[];
}

const toCard = (log: LogResponse): Card => ({
    id: String(log.id),
    name: log.name,
    description: log.description,
    filePath: log.file_path ?? "",
    fileUrl: log.file_url ? `${API_BASE}${log.file_url}` : null,
    fileType: log.file_type,
});

// one page of the user's logs, optionally filtered by a search
// (URLSearchParams encodes the text, so spaces or "&" in a search can't break the URL)
const fetchPage = (searchQuery: string, offset: number) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (searchQuery) params.set("searchQuery", searchQuery);
    return fetchHandler<PageResponse>(null, "GET", `${API_BASE}/get-logs?${params}`);
};

export function CardsProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>({ name: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // the search the loaded pages belong to (loadMore continues it), and a counter that marks
    // replies from an older load as stale so they can't overwrite or append to newer results
    const searchRef = useRef("");
    const requestIdRef = useRef(0);
    const loadingMoreRef = useRef(false);

    const hasMore = cards.length < total;

    // saves the draft on the server, then shows what the server stored (errors are thrown for the caller)
    const saveCard = async (id: string) => {
        const result = await fetchHandler<{ data: { name: string; description: string } }>(
            { name: draft.name, description: draft.description }, "PUT", `${API_BASE}/logs/${id}`
        );
        const saved = { name: result.data.name, description: result.data.description };
        setCards((prev) => prev.map((card) => card.id === id ? { ...card, ...saved } : card));
        setDraft(saved);
    }

    // newest first, so a freshly created log shows at the top of the grid
    const addCard = (card: Card) => {
        setCards((prev) => [card, ...prev]);
        setTotal((prev) => prev + 1);
    }

    // deletes on the server, then drops only the ids the server confirms it deleted
    // (errors are thrown so the caller can show them)
    const deleteCards = async (ids: string[]) => {
        const result = await fetchHandler<{ data: { deleted_ids: number[] } }>(
            { ids: ids.map(Number) }, "POST", `${API_BASE}/logs/delete`
        );
        const deleted = new Set<string>(result.data.deleted_ids.map(String));
        setCards((prev) => prev.filter((card) => !deleted.has(card.id)));
        setTotal((prev) => Math.max(0, prev - deleted.size));
    }

    // replaces the cards with the first page of the user's logs, optionally filtered by a search
    // (useCallback keeps it stable so pages can list it in useEffect deps)
    const loadCards = useCallback(async (searchQuery = "") => {
        const requestId = ++requestIdRef.current;
        searchRef.current = searchQuery;
        loadingMoreRef.current = false;
        setLoadingMore(false);
        setLoading(true);
        setError(null);
        try{
            const result = await fetchPage(searchQuery, 0);
            if (requestId !== requestIdRef.current) return;
            setCards(result.data.map(toCard));
            setTotal(result.total);
        }catch(e: unknown){
            if (requestId === requestIdRef.current) setError(e instanceof Error ? e.message : "Could not load logs");
        }finally{
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, []);

    // appends the next page; called when the user scrolls to the end of the grid
    const loadMore = useCallback(async () => {
        if (loading || loadingMoreRef.current || cards.length >= total) return;
        const requestId = requestIdRef.current;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        setError(null);
        try{
            const result = await fetchPage(searchRef.current, cards.length);
            if (requestId !== requestIdRef.current) return;
            // skip ids already shown, in case logs were added since the last page was fetched
            setCards((prev) => {
                const seen = new Set(prev.map((card) => card.id));
                return [...prev, ...result.data.map(toCard).filter((card) => !seen.has(card.id))];
            });
            setTotal(result.total);
        }catch(e: unknown){
            if (requestId === requestIdRef.current) setError(e instanceof Error ? e.message : "Could not load more logs");
        }finally{
            if (requestId === requestIdRef.current) {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            }
        }
    }, [loading, cards.length, total]);

    // for a card page opened directly (refresh, shared link) whose log isn't in the loaded pages
    // (errors are thrown so the page can show "not found")
    const loadCard = useCallback(async (id: string) => {
        const log = await fetchHandler<LogResponse>(null, "GET", `${API_BASE}/logs/${id}`);
        const card = toCard(log);
        setCards((prev) => prev.some((c) => c.id === card.id) ? prev : [...prev, card]);
    }, []);

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

    // "all" means every loaded card; cards further down appear as you scroll
    const allSelected = cards.length > 0 && selected.size === cards.length;
    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(cards.map((card) => card.id)));
    }

    return (
        <CardsContext.Provider value={{ cards, total, hasMore, draft, setDraft, saveCard, addCard, loadCards, loadMore, loadCard, deleteCards, loading, loadingMore, error }}>
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
