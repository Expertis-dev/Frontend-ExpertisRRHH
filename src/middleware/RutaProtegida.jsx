import { Navigate } from "react-router-dom";
export function RutaProtegida({ children }) {
    const nombre = localStorage.getItem("nombre");
    if (!nombre || nombre === "null") {
        return <Navigate to="/" replace />;
    }
    return children;
}