export default function StatusBar() {
    return (
        <div className="w-full h-7 bg-[#0a1020] justify-start items-center flex select-none border-t-2 border-amber-400">
            <div className="flex gap-2 items-center ml-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-light text-xs">STATUS</span>
            </div>
        </div>
    )

}