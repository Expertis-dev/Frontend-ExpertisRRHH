import React from "react";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button"; // Asegúrate de que tu Button existe

export const CompResultado = ({
    tipo = "success",
    titulo,
    mensaje,
    textoBoton = "Cerrar",
    onCerrar,
    mostrarBoton = true,
    children,
}) => {
    // Configuración por tipo
    const configuraciones = {
        success: {
            icon: <CheckCircle2 className="w-12 h-12" />,
            colorIcono: "text-emerald-500",
            colorFondo: "bg-emerald-50",
            colorBorde: "border-emerald-200",
        },
        error: {
            icon: <XCircle className="w-12 h-12" />,
            colorIcono: "text-rose-500",
            colorFondo: "bg-rose-50",
            colorBorde: "border-rose-200",
        },
        warning: {
            icon: <AlertCircle className="w-12 h-12" />,
            colorIcono: "text-amber-500",
            colorFondo: "bg-amber-50",
            colorBorde: "border-amber-200",
        },
        loading: {
            icon: <RefreshCw className="w-12 h-12 animate-spin" />,
            colorIcono: "text-blue-500",
            colorFondo: "bg-blue-50",
            colorBorde: "border-blue-200",
        },
    };
    const config = configuraciones[tipo];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 20 }}
                className={`p-8 rounded-xl border ${config.colorFondo} ${config.colorBorde} shadow-sm max-w-md mx-auto`}
            >
                <div className="flex flex-col items-center text-center gap-4">

                    {/* Ícono animado */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className={config.colorIcono}
                    >
                        {config.icon}
                    </motion.div>

                    {/* Texto principal */}
                    <div className="space-y-3">
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl font-semibold text-gray-900"
                        >
                            {titulo}
                        </motion.h3>

                        {mensaje && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-600"
                            >
                                {mensaje}
                            </motion.p>
                        )}
                    </div>

                    {/* Contenido adicional */}
                    {children && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full"
                        >
                            {children}
                        </motion.div>
                    )}

                    {/* Botón de acción */}
                    {mostrarBoton && onCerrar && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-2"
                        >
                            <Button
                                size="lg"
                                onClick={onCerrar}
                                variant={tipo === "error" ? "destructive" : "default"}
                            >
                                {textoBoton}
                            </Button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
