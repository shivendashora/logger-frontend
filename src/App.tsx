import { Navigate, Route, Routes } from "react-router-dom";
import LoggedDetails from "./components/logged-details";
import LoggedView from "./components/logged-details/logged-view";
import AuthForm from "./components/auth/auth-form";
import CreateLog from "./components/create-log";
import About from "./components/about";
import ProtectedRoute from "./components/auth/protected-route";
import { getToken } from "./utils/auth";


// a component, so the token is checked each time "/" is visited
// (an inline getToken() in App's JSX is only read when App renders, which is once at page load)
function RootRedirect(){
  return <Navigate to={getToken() ? "/Home" : "/login"} replace />
}

export default function App(){
  return(
    <div className="w-full flex-1 min-h-0 flex flex-col items-center">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/Home" element={<ProtectedRoute><LoggedDetails /></ProtectedRoute>} />
          <Route path="/log-card/:id" element={<ProtectedRoute><LoggedView /></ProtectedRoute>} />
          <Route path="/create-log" element={<ProtectedRoute><CreateLog /></ProtectedRoute>} />
          <Route path="/About" element={<About />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/signup" element={<AuthForm mode="signup" />} />
      </Routes>
    </div>
  )
}
