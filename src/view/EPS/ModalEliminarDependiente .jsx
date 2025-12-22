import { Trash2, AlertTriangle, User, Users, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
export const ModalEliminarDependiente = ({ 
    isEliminar, 
    setIsEliminar, 
    selectDependiente, 
    onConfirmarEliminacion 
}) => {
    const handleEliminar = () => {
        try {
            // Mostrar toast de carga
            const loadingToast = toast.loading("Eliminando dependiente...", {
                duration: Infinity,
            });
            // Simular llamada a la API
            setTimeout(() => {
                console.log("Eliminando dependiente:", selectDependiente);
                
                // Cerrar toast de carga
                toast.dismiss(loadingToast);

                // Mostrar toast de éxito
                toast.success("Dependiente eliminado", {
                    description: "El dependiente se ha eliminado correctamente",
                    duration: 3000,
                });

                // Ejecutar callback de confirmación
                if (onConfirmarEliminacion) {
                    onConfirmarEliminacion(selectDependiente);
                }

                // Cerrar el modal
                setIsEliminar(false);

            }, 1500);

        } catch (error) {
            toast.error("Error al eliminar", {
                description: "No se pudo eliminar el dependiente",
            });
            console.error("Error:", error);
        }
    };

    const handleCancelar = () => {
        setIsEliminar(false);
    };

    return (
        <Dialog open={isEliminar} onOpenChange={setIsEliminar}>
            <DialogContent className="max-w-xl bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-3xl max-h-[95vh] overflow-auto ">
                {/* Header con advertencia */}
                <DialogHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-bold text-white mb-1">
                                Eliminar Dependiente
                            </DialogTitle>
                            <p className="text-red-100 text-sm">
                                Confirmar eliminación del registro
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                <div className="space-y-2">
                    {/* Icono de advertencia */}
                    <div className="flex justify-center">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    {/* Mensaje de confirmación */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            ¿Estás seguro de eliminar este dependiente?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Esta acción no se puede deshacer. El dependiente será eliminado permanentemente del sistema.
                        </p>
                    </div>

                    {/* Información del dependiente */}
                    {selectDependiente && (
                        <div className="bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                Información del Dependiente
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {/* Nombre Completo */}
                                <InfoCard
                                    label="Nombre Completo"
                                    value={selectDependiente.nombreCompleto || selectDependiente.nombre}
                                    icon={<User className="h-3 w-3" />}
                                    className="bg-white dark:bg-gray-700"
                                />
                                
                                {/* Parentesco */}
                                <InfoCard
                                    label="Parentesco"
                                    value={selectDependiente.parentesco}
                                    icon={<Users className="h-3 w-3" />}
                                    className="bg-white dark:bg-gray-700"
                                />
                                
                            </div>
                        </div>
                    )}

                    {/* Advertencia adicional */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-2">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                    Advertencia importante
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                    Al eliminar este dependiente, se perderán todos los datos asociados y no podrán recuperarse.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelar}
                            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 transition-all duration-300 py-3 rounded-xl font-semibold"
                        >
                            <FileText className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleEliminar}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 py-3 rounded-xl hover:scale-105"
                        >
                            <Trash2 className="h-4 w-4" />
                            Sí, Eliminar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Componente auxiliar para mostrar información
const InfoCard = ({ label, value, icon, className = "" }) => (
    <div className={`p-3 rounded-lg border border-gray-200 dark:border-gray-600 ${className}`}>
        <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {label}
            </span>
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-white truncate block">
            {value || "No especificado"}
        </span>
    </div>
);