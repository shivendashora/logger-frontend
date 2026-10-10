import LoggedCards from "./log-cards";

export default function LoggedDetails(){
    return (
        <div className="w-full max-h-[700px] overflow-y-auto scrollbar-hidden flex flex-col text-white text-2xl font-semibold">
            <LoggedCards/>
        </div>
    )
}
