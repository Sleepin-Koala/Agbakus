import { FaWindowMinimize ,FaRegWindowRestore   } from "react-icons/fa6"
import {FaWindowClose} from "react-icons/fa"


export default function upBar() {

  return (
        <div className="flex  bg-blue-500 h-7.5">
        <div className="flex text-xs h-full ">
          AGBAKUS ISEM
        </div>
        <div className="flex flex-1 justify-end gap-2">
            <FaWindowMinimize className="w-8 h-full hover:bg-gray-700 px-2 justify-center items-center"/>
            <FaRegWindowRestore className="w-8 h-full px-2  hover:bg-gray-700 justify-center items-center"/>
            <FaWindowClose className="w-8 h-full aspect-square px-2  hover:bg-red-600 justify-center items-center"/>
        </div>
      </div>
  )
}