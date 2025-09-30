import PropTypes from "prop-types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input, Select, Card } from "antd"
import { Save, Edit3, CreditCard, DollarSign, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Planes } from "../../data/Info";

export const ModalEditAfiliado = ({
    setSelectAfiliado,
    selectAfiliado = {},
    isEdit,
    setIsEdit,
}) => {
    // Estilos mejorados
    const labelStyles = "flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3";
    const cardStyles = "bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden";

    // Estilo para el Select
    const selectStyles = {
        width: '100%',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        transition: 'all 0.3s ease'
    };

    // Función para manejar el cambio de plan
    const handlePlanChange = (value) => {
        const planSeleccionado = Planes.find(p => p.value === value);
        setSelectAfiliado(prev => ({
            ...prev,
            plan: value,
            monto: planSeleccionado?.monto || 0,
            nombrePlan: planSeleccionado?.label || ''
        }));
    };

    const ModificarDependiente = (e) => {
        e.preventDefault();

        if (!selectAfiliado?.plan) {
            toast.error("Campo requerido", {
                description: "Debe seleccionar un plan",
            });
            return;
        }

        try {
            const loadingToast = toast.loading("Actualizando plan del afiliado...", {
                duration: Infinity,
            });

            setTimeout(() => {
                console.log("Datos a guardar:", selectAfiliado);
                toast.dismiss(loadingToast);

                toast.success("Plan actualizado", {
                    description: "El plan se ha actualizado correctamente",
                    duration: 3000,
                });

                setTimeout(() => {
                    setIsEdit(false);
                }, 1000);

            }, 1500);

        } catch (error) {
            toast.error("Error al guardar", {
                description: "No se pudo actualizar el plan",
            });
            console.error("Error:", error);
        }
    };
    return (
        <Dialog open={isEdit} onOpenChange={setIsEdit}>
            <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-3xl overflow-hidden">
                {/* Header elegante */}
                <DialogHeader className="text-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl backdrop-blur-sm">
                            <Edit3 className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-bold text-blue-500 mb-1">
                                Editar Plan del Afiliado
                            </DialogTitle>
                            <p className="text-blue-400 text-sm">
                                {selectAfiliado.nombreCompleto || "Actualizando información del plan"}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form className="flex flex-col" onSubmit={ModificarDependiente}>
                    {/* Tarjeta principal del plan */}
                    <Card
                        className={cardStyles}
                    >
                        {/* Icono decorativo */}
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                                <Shield className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>

                        {/* Selección de Plan */}
                        <div>
                            <label className={labelStyles}>
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                Seleccione Plan *
                            </label>
                            <Select
                                style={selectStyles}
                                value={selectAfiliado.plan}
                                onChange={handlePlanChange}
                                placeholder="Buscar plan..."
                                showSearch
                                allowClear
                                optionFilterProp="label"
                                getPopupContainer={(trigger) => trigger.parentNode}
                                filterOption={(input, option) =>
                                    option?.label.toLowerCase().includes(input.toLowerCase())
                                }
                                options={Planes.map(plan => ({
                                    value: plan.value,
                                    label: `${plan.label} - S/ ${plan.monto?.toLocaleString('es-PE')}`
                                }))}
                                size="large"
                            />
                        </div>
                        {selectAfiliado.plan && (
                            <div className="mt-4">
                                <label className={labelStyles}>
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    Monto del Plan
                                </label>
                                <Input
                                    disabled
                                    value={`S/ ${(selectAfiliado.monto || 0).toLocaleString('es-PE')}`}
                                    className="w-full text-center text-xl font-bold py-4 rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                    style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700'
                                    }}
                                />
                            </div>
                        )}
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="submit"
                            disabled={!selectAfiliado.plan}
                            className={`w-full flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-8 py-3 rounded-xl ${selectAfiliado.plan
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Save className="h-4 w-4" />
                            Actualizar Plan
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
ModalEditAfiliado.propTypes = {
    setSelectAfiliado: PropTypes.func.isRequired,
    selectAfiliado: PropTypes.object,
    isEdit: PropTypes.bool.isRequired,
    setIsEdit: PropTypes.func.isRequired,
};