import type { Dispatch, SetStateAction } from "react";
import type { CurrentWorkState } from "../types";


interface LeftbarProps {
    currentWorkState : CurrentWorkState
    setCurrentWorkState : Dispatch<SetStateAction<CurrentWorkState>>

}



export default function Leftbar({currentWorkState , setCurrentWorkState} : LeftbarProps) {
    const leftbar = [
        { "id": "geometry", "name": "Geometrie"},
        { "id": "material","name": "Material" },
        { "id": "support","name":"support" },
        { "id": "mesh","name": "Mesh" },
        { "id": "analysis","name": "Analysis" },
        { "id": "result","name": "result" }
    ]

    return (
        <aside className=" flex flex-col min-w-40 h-full bg-[#0a1020] text-white p-2 gap-1">
            {leftbar.map(item => (<div key={item.id} className={`p-2 hover:text-[#e1e2ec]  cursor-pointer select-none ${item.id == currentWorkState ? "text-white" : "text-white/60"}`} onClick={()=>setCurrentWorkState(item.id)}>
                {item.name} 
            </div>)
            )}
        </aside>
    )
}

