import { Context } from "@/context/Context";
import { useContext, useState, useEffect, useMemo } from "react";


// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useData debe ser usado con un DataProvider");
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [nombre, setNombre] = useState(() => {
        const nombreObtenido = localStorage.getItem("nombre")
        return nombreObtenido || null
    })
    const [token, setToken] = useState(() => {
        const tokenObtenido = localStorage.getItem("token")
        return tokenObtenido || null
    })
    const [planEPS, setPlanEPS] = useState(() => {
        const planEPSObtenido = localStorage.getItem("planesEPS")
        const plan = planEPSObtenido ? JSON.parse(planEPSObtenido) : null
        return plan || null
    })
    useEffect(() => {
        localStorage.setItem("nombre", nombre)
        localStorage.setItem("token", token)
        localStorage.setItem("planEPS", planEPS)
    }, [nombre, token, planEPS])
    const value = useMemo(() => ({
        nombre,
        setNombre,
        token,
        setToken,
        planEPS,
        setPlanEPS
    }), [nombre, token, planEPS]);
    return (
        <Context.Provider
            value={value}
        >
            {children}
        </Context.Provider>
    )
}
