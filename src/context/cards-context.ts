import { createContext, useContext } from "react";

// contexts, their types and the hooks to read them; the provider component lives in cards-provider.tsx
// (kept apart so fast refresh works: a .tsx file should only export components)

export interface Card {
    id: string;
    name: string;
    description: string;
    filePath: string;
    fileUrl: string | null;    // full URL the attachment is served at, null when there's no file
    fileType: string | null;   // MIME type, e.g. "image/png"
}

export interface Draft {
    name: string;
    description: string;
}

// shape of one log in the backend's replies
export interface LogResponse {
    id: number;
    name: string;
    description: string;
    file_path: string | null;
    file_url: string | null;
    file_type: string | null;
}

export interface CardsContextValue {
    cards: Card[];
    total: number;               // all logs matching the current search, loaded or not
    hasMore: boolean;            // more pages left to load
    draft: Draft;
    setDraft: (draft: Draft) => void;
    saveCard: (id: string) => Promise<void>;
    addCard: (card: Card) => void;
    loadCards: (searchQuery?: string) => Promise<void>;
    loadMore: () => Promise<void>;
    loadCard: (id: string) => Promise<void>;   // fetches one log into the list if it isn't loaded
    deleteCards: (ids: string[]) => Promise<void>;
    loading: boolean;            // first page (or a fresh search) is loading
    loadingMore: boolean;        // a further page is loading
    error: string | null;
}

export interface SaveContextValue {
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

export interface SelectionContextValue {
    selecting: boolean;
    selected: Set<string>;
    allSelected: boolean;
    startSelecting: () => void;
    exitSelecting: () => void;
    toggleCard: (id: string) => void;
    toggleAll: () => void;
}

// what's typed in the navbar search: the navbar fetches with it, the cards highlight it
export interface SearchContextValue {
    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;
}

export const CardsContext = createContext<CardsContextValue | null>(null);
export const SaveContext = createContext<SaveContextValue | null>(null);
export const SelectionContext = createContext<SelectionContextValue | null>(null);
export const SearchContext = createContext<SearchContextValue | null>(null);

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
