import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCards, type Card } from "../../context/cards-context";

export default function LoggedCards(){
    const { cards: cardsData, loadCards, loading, error } = useCards();
    const navigate = useNavigate();

    // fetch the user's logs every time the home page opens
    useEffect(() => {
        loadCards();
    }, [loadCards]);

    const handleCardClick = (card : Card )=>{
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
            {cardsData.map((card)=>(
            <button onClick={() => handleCardClick(card)} key={card.id} className = "glass-card backdrop-blur-lg backdrop-saturate-150 w-full h-120 max-h-full overflow-y-auto scrollbar-hidden flex flex-col rounded-2xl text-left cursor-pointer transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-[0_12px_40px_rgba(124,58,237,0.35)]">

                <div className = "w-full flex items-center justify-center p-4 border-b border-white/15">
                    <span className="text-white text-[20px] font-medium">{card.name}</span>
                </div>
                <span className="text-white/75 text-[18px] font-normal truncate p-4">{card.description}</span>
            </button>
            ))}

        </div>

    )
}
