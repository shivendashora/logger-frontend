export default function navbar(){


    const navItems = ["Home", "About"]
    return(
        <div className="bg-transparent w-full text-white h-30 flex items-center justify-between px-4 sticky top-0 z-50">

            <span className="text-2xl font-semibold">
                Logger App
            </span>
            <li className="flex flex-row gap-4">
                {navItems.map((item, key) => (
                    <ul key={key} className="px-4 cursor-pointer hover:text-gray-400">
                        {item}
                    </ul>
                ))}

            </li>


        </div>
    )
}