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
    useEffect(()=>{
        localStorage.setItem("nombre", nombre)
    }, [nombre])
    const value = useMemo(() => ({
        nombre,
        setNombre
    }), [nombre]);
    return (
        <Context.Provider
            value={value}
        >
            {children}
        </Context.Provider>
    )
}
