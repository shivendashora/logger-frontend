import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCards, useSaveContext } from "../../context/cards-context";

export default function navbar(){

    const navItems = ["Home", "About"]
    const { isEditing, setIsEditing } = useSaveContext()
    const location = useLocation();
    const navigate = useNavigate();
    const { cards, setDraft, saveCard } = useCards();

    // /log-card/1 -> ["", "log-card", "1"]
    const [, currentPath, cardId] = location.pathname.split('/')
    const cardState = currentPath === "log-card"

    const handleSave = () => {
        saveCard(cardId)
        setIsEditing(false)
        navigate("/")
    }

    const handleEdit=()=>{
        setIsEditing(true)
    }

    // throw away unsaved changes and put the card's saved values back in the draft
    const handleCancel=()=>{
        const card = cards.find((c) => c.id === cardId)
        if (card) setDraft({ name: card.name, description: card.description })
        setIsEditing(false)
    }

    return(
        <div className="bg-transparent w-full text-white h-30 shrink-0 flex items-center justify-between px-4">

            <span className="text-2xl font-semibold">
                Logger App
            </span>
            {cardState ? (
                <div className="flex flex-row gap-4">
                    <button disabled={isEditing} onClick={() => { setIsEditing(false); navigate("/") }} className="px-4 py-2 border border-white rounded-lg cursor-pointer hover:text-gray-400">
                        Back
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-white text-black rounded-lg cursor-pointer hover:bg-gray-300">
                        Save
                    </button>
                    {isEditing ? (
                        <button onClick={handleCancel} className="px-4 py-2 border border-white rounded-lg cursor-pointer hover:text-gray-400">
                            Cancel
                        </button>
                    ) : (
                        <button onClick={handleEdit} className="px-4 py-2 bg-white text-black rounded-lg cursor-pointer hover:bg-gray-300">
                            Edit
                        </button>
                    )}
                </div>
            ) : (
                <ul className="flex flex-row gap-4">
                    {navItems.map((item, key) => (
                        <li key={key} className="px-4 cursor-pointer hover:text-gray-400" >
                            <Link to={`/${item}`}>
                                {item}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    )
}
