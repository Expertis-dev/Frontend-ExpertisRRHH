import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
export function RutaProtegida({ children }) {
    const [autenticado, setAutenticado] = useState(true);
    const location = useLocation();
    useEffect(() => {
        if (location.pathname !== "/" || location.pathname !== "/finanzas/empleados-listar") {
            const verificarToken = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verificar-token`,
                        { token }
                    );
                    console.log("Token verificado:", data);
                    if (data.valor) {
                        setAutenticado(true);
                    } else {
                        setAutenticado(false);
                    }
                } catch (error) {
                    console.log("Token inválido:", error);
                    setAutenticado(false);
                }
            };

            verificarToken();
        } else {
            setAutenticado(true);
        }
    }, [location.pathname]);

    if (!autenticado) return <Navigate to="/" replace />;

    return children;
}
