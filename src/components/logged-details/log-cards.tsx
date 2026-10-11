import { useNavigate } from "react-router-dom";
import { useCards, type Card } from "../../context/cards-context";

export default function LoggedCards(){
    const { cards: cardsData } = useCards();
    const navigate = useNavigate();

    const handleCardClick = (card : Card )=>{
        navigate(`/log-card/${card.id}`);
    }
    return(
        <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-4 w-full px-4 py-4 max-h-[600px] overflow-y-auto scrollbar-hidden">
            {cardsData.map((card)=>(
            <button onClick={() => handleCardClick(card)} key={card.id} className = "w-full h-120 max-h-full overflow-y-auto scrollbar-hidden bg-black-500 flex flex-col border border-gray-400 rounded-lg ">
                
                <div className = "w-full flex items-center justify-center p-4 border-b border-gray-400">
                    <span className="text-white text-[20px] font-normal">{card.name}</span>
                </div>
                <span className="text-white text-[20px] font-normal truncate p-4">{card.description}</span>
            </button>
            ))}

        </div>

    )
}