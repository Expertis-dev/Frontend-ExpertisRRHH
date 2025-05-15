import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function RutaProtegida({ children }) {
    const [estadoAutenticacion, setEstadoAutenticacion] = useState({
        autenticado: false,
        cargando: true
    });
    const location = useLocation();

    useEffect(() => {
        const verificarToken = async () => {
            try {
                const token = localStorage.getItem("token");

                // Si no hay token, redirigir inmediatamente
                if (!token) {
                    setEstadoAutenticacion({ autenticado: false, cargando: false });
                    return;
                }

                const { data } = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/auth/verificar-token`,
                    { token }
                );

                setEstadoAutenticacion({
                    autenticado: data.valor,
                    cargando: false
                });
            } catch (error) {
                console.error("Error verificando token:", error);
                setEstadoAutenticacion({
                    autenticado: false,
                    cargando: false
                });
            }
        };

        // Verificar token para todas las rutas excepto login
        if (location.pathname !== "/") {
            verificarToken();
        } else {
            setEstadoAutenticacion({ autenticado: false, cargando: false });
        }
    }, [location.pathname]);

    // Mostrar spinner mientras se verifica
    if (estadoAutenticacion.cargando) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Redirigir si no está autenticado (excepto para la ruta de login)
    if (!estadoAutenticacion.autenticado && location.pathname !== "/") {
        return <Navigate to="/" replace />;
    }

    return children;
}