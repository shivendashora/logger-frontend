import LoggedDetails from "./components/logged-details";
import Navbar from "./components/navbar";


export default function App(){
  return(
    <div className="w-full h-screen absolute flex flex-col items-center">
       <Navbar/>
       <LoggedDetails/>
    </div>
  )
}