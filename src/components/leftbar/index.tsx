import { useWorkState, type WorkState } from "../../store/modules";




export default function Leftbar() {
    const WorkState = useWorkState((p)=>p)
    
    const leftbar = [
        { "id": "geometry", "name": "Geometrie"},
        { "id": "material","name": "Material" },
        { "id": "support","name":"support" },
        { "id": "mesh","name": "Mesh" },
        { "id": "job-1","name": "Analysis" },
        { "id": "job-2","name": "result" }
    ]

    console.log(WorkState.currentWorkState)

    return (
        <aside className=" flex flex-col min-w-40 h-full bg-[#0a1020] text-white p-2 gap-1">
            {leftbar.map(item => (<div key={item.id} className={`p-2 hover:text-[#e1e2ec]  cursor-pointer select-none ${item.id == WorkState.currentWorkState ? "text-white" : "text-white/60"}`} 
            onClick={()=>WorkState.SetCurrentWorkState(item.id  as WorkState)}>
                {item.name} 
            </div>)
            )}
        </aside>
    )
}

