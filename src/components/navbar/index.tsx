import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCards, useSaveContext, useSearch, useSelection } from "../../context/cards-context";
import { clearToken, getToken } from "../../utils/auth";
import { useEffect, useState } from "react";
import SearchBar from "./search-bar";

const buttonBase = "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer";
const smallButton = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

const TrashIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </svg>
);

export default function Navbar(){

    const { isEditing, setIsEditing } = useSaveContext()
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    // re-evaluated on every navigation, since useLocation re-renders the navbar
    const isLoggedIn = !!getToken()
    const navItems = ["Home", "About"]
    const { cards, draft, setDraft, saveCard, deleteCards, loadCards } = useCards();
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const { selecting, selected, allSelected, startSelecting, exitSelecting, toggleAll } = useSelection();
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // /log-card/1 -> ["", "log-card", "1"]
    const [, currentPath, cardId] = location.pathname.split('/')
    const cardState = currentPath === "log-card"

    // saves the edited name/description on the server and stays on the card
    const handleSave = async () => {
        setSaving(true)
        setSaveError(null)
        try{
            await saveCard(cardId)
            setIsEditing(false)
        }catch(e: unknown){
            setSaveError(e instanceof Error ? e.message : "Could not save changes")
        }finally{
            setSaving(false)
        }
    }

    const handleLogout = () => {
        clearToken()
        setMenuOpen(false)
        navigate("/login")
    }

    const handleEdit=()=>{
        setSaveError(null)
        setIsEditing(true)
    }


    // search bar shows on the home grid and on a single card's page
    const showSearch = isLoggedIn && (currentPath === "Home" || cardState)
    // shared through context so the cards can highlight what's being searched
    const { searchQuery, setSearchQuery } = useSearch()

    // the list is only re-fetched on the home grid; on a card page the search just highlights,
    // and the home page applies it when it opens
    const onHome = currentPath === "Home"

    useEffect(() => {
        if (!searchQuery || !onHome) return

        const timerId = setTimeout(() => {
            loadCards(searchQuery)
        }, 500)

        // runs before the next keystroke's effect: cancels the timer that hasn't fired yet
        return () => clearTimeout(timerId)
    }, [searchQuery, onHome, loadCards])


    // runs on every keystroke (and when cleared): keep the input in sync, then search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        if (!value.trim() && onHome) loadCards()
    }

    const exitDelete = () => {
        setDeleteError(null)
        exitSelecting()
    }

    const handleDelete = async () => {
        setDeleting(true)
        setDeleteError(null)
        try{
            await deleteCards([...selected])
            exitDelete()
        }catch(e: unknown){
            setDeleteError(e instanceof Error ? e.message : "Could not delete logs")
        }finally{
            setDeleting(false)
        }
    }

    // throw away unsaved changes and put the card's saved values back in the draft
    const handleCancel=()=>{
        const card = cards.find((c) => c.id === cardId)
        if (card) setDraft({ name: card.name, description: card.description })
        setSaveError(null)
        setIsEditing(false)
    }
    

    return(
        // outer wrapper is the positioning box for the phone menu / delete error (top-full = below the whole navbar)
        <div className="relative z-20 bg-transparent w-full text-white shrink-0">
        <div className="w-full h-16 sm:h-30 flex items-center justify-between gap-4 px-4 sm:px-6">

            <span className="shrink-0 text-lg sm:text-2xl font-semibold tracking-tight">
                Logger App
            </span>

            {/* desktop: search sits between the title and the actions */}
            {showSearch && (
                <SearchBar value={searchQuery} onChange={handleSearchChange} className="hidden md:flex flex-1 max-w-md mx-auto" />
            )}
            {cardState ? (
                <div className="flex flex-row gap-2 sm:gap-4 text-sm sm:text-base">
                    <button disabled={isEditing} onClick={() => { setIsEditing(false); navigate("/Home") }} className={`${buttonBase} border border-white disabled:opacity-40 hover:text-gray-400`}>
                        Back
                    </button>
                    {/* Save only makes sense while editing; a blank name can't be saved */}
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} disabled={saving || !draft.name.trim()} className={`${buttonBase} bg-white text-black hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {saving ? "Saving..." : "Save"}
                            </button>
                            <button onClick={handleCancel} disabled={saving} className={`${buttonBase} border border-white hover:text-gray-400 disabled:opacity-40`}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={handleEdit} className={`${buttonBase} bg-white text-black hover:bg-gray-300`}>
                            Edit
                        </button>
                    )}
                    {saveError && <span className="absolute top-full right-4 sm:right-6 text-red-400 text-sm">{saveError}</span>}
                </div>
            ) : isLoggedIn && selecting ? (
                // selection mode replaces the usual links with bulk-delete controls
                <div className="flex items-center gap-2 sm:gap-3 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => { if (el) el.indeterminate = selected.size > 0 && !allSelected; }}
                            onChange={toggleAll}
                            className="w-4 h-4 accent-violet-500 cursor-pointer"
                        />
                        <span className="hidden sm:inline">Select all</span>
                        <span className="text-white/50">{selected.size}/{cards.length}</span>
                    </label>

                    {/* deletes straight away, no confirmation step */}
                    <button onClick={handleDelete} disabled={selected.size === 0 || deleting} className={`${smallButton} bg-red-500/90 text-white hover:bg-red-600`}>
                        <TrashIcon />
                        <span className="hidden sm:inline">{deleting ? "Deleting..." : "Delete"}</span>
                        {!deleting && selected.size > 0 ? ` (${selected.size})` : ""}
                    </button>
                    <button onClick={exitDelete} disabled={deleting} className={`${smallButton} border border-white/40 hover:bg-white/10`}>
                        Cancel
                    </button>

                    {deleteError && <span className="absolute top-full right-4 sm:right-6 text-red-400 text-sm">{deleteError}</span>}
                </div>
            ) : isLoggedIn && (
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* delete lives here: opens selection mode on the home grid */}
                    {currentPath === "Home" && cards.length > 0 && (
                        <button
                            onClick={() => { setMenuOpen(false); setDeleteError(null); startSelecting(); }}
                            aria-label="Select logs to delete"
                            title="Select logs to delete"
                            className="p-2 rounded-lg cursor-pointer hover:bg-white/10 hover:text-red-400"
                        >
                            <TrashIcon size={20} />
                        </button>
                    )}
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

        {/* phone: not enough room in the bar, so search gets its own row */}
        {showSearch && (
            <div className="md:hidden px-4 pb-3">
                <SearchBar value={searchQuery} onChange={handleSearchChange} />
            </div>
        )}
        </div>
    )
}
