import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../../utils/auth";

// renders the page only when a token exists, otherwise sends the user to login
export default function ProtectedRoute({ children }: { children: ReactNode }){
    if (!getToken()) return <Navigate to="/login" replace />;
    return children;
}
