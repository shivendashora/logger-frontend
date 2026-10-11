import { createContext, useContext, useState, type ReactNode } from "react";

export interface Card {
    id: string;
    name: string;
    description: string;
    filePath: string;
}

interface Draft {
    name: string;
    description: string;
}

interface CardsContextValue {
    cards: Card[];
    draft: Draft;
    setDraft: (draft: Draft) => void;
    saveCard: (id: string) => void;
}

const initialCards: Card[] = [
    {"id": "1", "name":"logger-one","description":"description text","filePath":"filePath"},
    {"id": "2", "name":"logger-one","description":"description text","filePath":"filePath"},
    {"id": "3", "name":"logger-one","description":"description text","filePath":"filePath"},
    {"id": "4", "name":"logger-one","description":"description text","filePath":"filePath"},
    {"id": "5", "name":"logger-one","description":"description text","filePath":"filePath"},
    {"id": "6", "name":"logger-one","description":"description text","filePath":"filePath"},
    {"id": "7", "name":"logger-one","description":"description text","filePath":"filePath"},
    {"id": "8", "name":"logger-one","description":"description text","filePath":"filePath"}
]

interface SaveContextValue {
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

const CardsContext = createContext<CardsContextValue | null>(null);
const SaveContext = createContext<SaveContextValue | null>(null);

export function CardsProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<Card[]>(initialCards);
    const [draft, setDraft] = useState<Draft>({ name: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);

    const saveCard = (id: string) => {
        setCards((prev) => prev.map((card) => card.id === id ? { ...card, ...draft } : card));
    }

    return (
        <CardsContext.Provider value={{ cards, draft, setDraft, saveCard }}>
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
