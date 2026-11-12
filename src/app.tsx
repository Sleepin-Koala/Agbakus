import "./app.css"
import Upbar from "./components/upbar";
import Leftbar from "./components/leftbar";
import Viewport from "./components/viewport/viewport";
import Rightbar from "./components/rightbar";
import StatusBar from "./components/statusBar";

export default function MainScreen() {

    return (
        <div className="flex flex-col h-screen w-screen">
            {/* <Upbar/> */}
                <div className="flex flex-1 min-h-0">
                    <Leftbar />
                    <Viewport/>
                    <Rightbar/>
                </div>
            <StatusBar/>
        </div>
    )
}