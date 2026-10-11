import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCards, useSaveContext } from "../../context/cards-context";

export default function LoggedView() {

    const { isEditing } = useSaveContext();
    const { id } = useParams();
    const { cards, draft, setDraft } = useCards();
    const card = cards.find((c) => c.id === id);

    // load the selected card into the editable draft
    useEffect(() => {
        if (card) setDraft({ name: card.name, description: card.description });
    }, [id]);

    if (!card) {
        return <p className="text-white text-xl">Card not found</p>
    }

    return(
        <div className="w-full h-full flex flex-row gap-6 items-start justify-center px-8">
            <div className = "w-1/2 h-full flex flex-col gap-6 pb-8">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            value={draft.name}
                            className="h-10 px-4 py-2 border border-white text-white bg-black-500 focus:outline-none"
                        />
                    </>
                ) : (
                    <h1 className="text-2xl font-normal text-white">{card.name}</h1>
                )}

                <div className="w-full flex-1 min-h-0">
                    <textarea
                    id="description"
                    readOnly={!isEditing}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    value={draft.description}
                    className={`w-full h-full px-4 py-2 border text-white bg-black-500 focus:outline-none resize-none ${isEditing ? "border-white" : "border-transparent"}`}
                    ></textarea>

                </div>



            </div>
            <div className = "w-1/2 px-4">
                <img src = "/hero.png" alt="Card-value"/>
            </div>

        </div>
    )
}