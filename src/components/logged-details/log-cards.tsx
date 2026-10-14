import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCards, useSearch, useSelection, type Card } from "../../context/cards-context";
import Highlight from "../highlight";

export default function LoggedCards(){
    const { cards: cardsData, loadCards, loading, error } = useCards();
    // the delete controls live in the navbar; this grid only shows and toggles the selection
    const { selecting, selected, toggleCard, exitSelecting } = useSelection();
    const { searchQuery } = useSearch();
    const navigate = useNavigate();

    // fetch the user's logs every time the home page opens
    useEffect(() => {
        loadCards();
    }, [loadCards]);

    // leaving the home page cancels selection mode
    useEffect(() => exitSelecting, [exitSelecting]);

    // in selection mode a click selects the card instead of opening it
    const handleCardClick = (card : Card )=>{
        if (selecting) return toggleCard(card.id);
        navigate(`/log-card/${card.id}`);
    }

    if (loading && cardsData.length === 0) {
        return <p className="text-white/70 text-lg font-normal text-center py-8">Loading logs...</p>
    }

    if (error) {
        return <p className="text-red-400 text-lg font-normal text-center py-8">{error}</p>
    }

    if (cardsData.length === 0) {
        return <p className="text-white/70 text-lg font-normal text-center py-8">No logs yet. Use "+ Create log" to add one.</p>
    }

    return(
        <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-4 w-full px-4 py-4 flex-1 min-h-0 overflow-y-auto overscroll-none scrollbar-hidden">
            {cardsData.map((card)=>{
            const isSelected = selected.has(card.id);
            return (
            <button
                onClick={() => handleCardClick(card)}
                key={card.id}
                aria-pressed={selecting ? isSelected : undefined}
                className = {`glass-card backdrop-blur-lg backdrop-saturate-150 relative w-full h-120 max-h-full overflow-y-auto scrollbar-hidden flex flex-col rounded-2xl text-left cursor-pointer transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-[0_12px_40px_rgba(124,58,237,0.35)] ${isSelected ? "ring-2 ring-violet-400" : ""}`}
            >
                {selecting && (
                    // tick circle showing the card's selection state
                    <span className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-violet-500 border-violet-500" : "border-white/60 bg-black/20"}`}>
                        {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5L20 7" />
                            </svg>
                        )}
                    </span>
                )}

                <div className = "w-full flex items-center justify-center p-4 border-b border-white/15">
                    <span className="text-white text-[20px] font-medium"><Highlight text={card.name} query={searchQuery} /></span>
                </div>
                <span className="text-white/75 text-[18px] font-normal truncate p-4"><Highlight text={card.description} query={searchQuery} /></span>
            </button>
            )})}

        </div>

    )
}
