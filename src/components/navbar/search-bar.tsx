interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

// presentational only: the parent owns the query and decides what a search does
// (onChange fires on every keystroke and when the field is cleared)
export default function SearchBar({ value, onChange, className = "" }: SearchBarProps){
    return (
        <div role="search" className={`glass-card backdrop-blur-lg flex items-center gap-2 rounded-xl px-3 h-10 focus-within:border-white/50 ${className}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/60">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search logs..."
                aria-label="Search logs"
                className="w-full min-w-0 bg-transparent text-sm sm:text-base font-normal text-white placeholder:text-white/40 outline-none"
            />
            {value && (
                <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="shrink-0 text-white/50 hover:text-white cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            )}
        </div>
    )
}
