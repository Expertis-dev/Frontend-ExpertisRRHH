import axios from "axios";
import { Navigate } from "react-router-dom";
export function RutaProtegida({ children }) {
    const response = axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verificar-token`,
        { token: localStorage.getItem("token") }
    );
    const nombre = localStorage.getItem("nombre");
    if (!nombre || nombre === "null") {
        return <Navigate to="/" replace />;
    }
    return children;
}