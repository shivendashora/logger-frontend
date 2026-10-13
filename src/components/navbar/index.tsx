import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCards, useSaveContext } from "../../context/cards-context";
import { clearToken, getToken } from "../../utils/auth";
import { useState } from "react";

const buttonBase = "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer";

export default function Navbar(){

    const { isEditing, setIsEditing } = useSaveContext()
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    // re-evaluated on every navigation, since useLocation re-renders the navbar
    const isLoggedIn = !!getToken()
    const navItems = ["Home", "About"]
    const { cards, setDraft, saveCard } = useCards();

    // /log-card/1 -> ["", "log-card", "1"]
    const [, currentPath, cardId] = location.pathname.split('/')
    const cardState = currentPath === "log-card"

    const handleSave = () => {
        saveCard(cardId)
        setIsEditing(false)
        navigate("/")
    }

    const handleLogout = () => {
        clearToken()
        setMenuOpen(false)
        navigate("/login")
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
        <div className="relative z-20 bg-transparent w-full text-white h-16 sm:h-30 shrink-0 flex items-center justify-between px-4 sm:px-6">

            <span className="text-lg sm:text-2xl font-semibold tracking-tight">
                Logger App
            </span>
            {cardState ? (
                <div className="flex flex-row gap-2 sm:gap-4 text-sm sm:text-base">
                    <button disabled={isEditing} onClick={() => { setIsEditing(false); navigate("/") }} className={`${buttonBase} border border-white disabled:opacity-40 hover:text-gray-400`}>
                        Back
                    </button>
                    <button onClick={handleSave} className={`${buttonBase} bg-white text-black hover:bg-gray-300`}>
                        Save
                    </button>
                    {isEditing ? (
                        <button onClick={handleCancel} className={`${buttonBase} border border-white hover:text-gray-400`}>
                            Cancel
                        </button>
                    ) : (
                        <button onClick={handleEdit} className={`${buttonBase} bg-white text-black hover:bg-gray-300`}>
                            Edit
                        </button>
                    )}
                </div>
            ) : isLoggedIn && (
                <div className="flex items-center gap-2 sm:gap-4">
                    {currentPath !== "create-log" && (
                        <button onClick={() => { setMenuOpen(false); navigate("/create-log") }} className={`${buttonBase} bg-white text-black text-sm sm:text-base hover:bg-gray-300`}>
                            + Create log
                        </button>
                    )}

                    {/* desktop links */}
                    <ul className="hidden sm:flex flex-row gap-4">
                        {navItems.map((item, key) => (
                            <li key={key} className="px-4 cursor-pointer hover:text-gray-400" >
                                <Link to={`/${item}`}>
                                    {item}
                                </Link>
                            </li>
                        ))}
                        <li className="px-4 cursor-pointer hover:text-gray-400" onClick={handleLogout}>
                            Logout
                        </li>
                    </ul>

                    {/* phone: hamburger toggles a glass dropdown */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        className="sm:hidden p-2 -mr-2 rounded-lg cursor-pointer hover:bg-white/10"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {menuOpen
                                ? <path d="M6 6l12 12M18 6L6 18" />
                                : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                    {menuOpen && (
                        <ul className="glass-card backdrop-blur-lg sm:hidden absolute top-full right-4 left-4 flex flex-col rounded-2xl p-2 text-base">
                            {navItems.map((item, key) => (
                                <li key={key}>
                                    <Link to={`/${item}`} onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-white/10">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10">
                                    Logout
                                </button>
                            </li>
                        </ul>
                    )}
                </div>
            )}

        </div>
    )
}
