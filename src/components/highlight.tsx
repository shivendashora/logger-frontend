// escapes characters that mean something in a regex, so "v1.2" or "(a)" are searched literally
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// renders text with every case-insensitive match of query wrapped in <mark>
export default function Highlight({ text, query }: { text: string; query: string }){
    // collapse spaces the same way the backend cleans the search
    const term = query.trim().replace(/\s+/g, " ");
    if (!term) return <>{text}</>;

    // splitting on a capturing group keeps the matches: odd indexes are the matched parts
    const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "gi"));

    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1
                    ? <mark key={index} className="bg-yellow-300/90 text-black rounded px-0.5">{part}</mark>
                    : part
            )}
        </>
    );
}
