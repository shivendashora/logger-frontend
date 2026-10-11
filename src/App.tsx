import { Route, Routes } from "react-router-dom";
import LoggedDetails from "./components/logged-details";
import LoggedView from "./components/logged-details/logged-view";
import AuthForm from "./components/auth/auth-form";


export default function App(){
  return(
    <div className="w-full flex-1 min-h-0 flex flex-col items-center">
        <Routes>
          <Route path="/" element={<LoggedDetails />} />
          <Route path="/Home" element={< LoggedDetails/>} />
          <Route path="/log-card/:id" element={<LoggedView />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/signup" element={<AuthForm mode="signup" />} />
      </Routes>
    </div>
  )
}
