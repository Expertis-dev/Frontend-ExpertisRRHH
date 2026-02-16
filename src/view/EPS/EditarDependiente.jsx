import PropTypes from "prop-types";
import dayjs from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker, Input, Select, Card } from "antd"
import { User, Users, Calendar, Save, X, Baby, Heart, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SEXO_OPTIONS = [
    { label: "Masculino", value: "MASCULINO" },
    { label: "Femenino", value: "FEMENINO" },
];

const PARENTESCO_OPTIONS = [
    { label: "Cónyuge", value: "CONYUGUE" },
    { label: "Hijo/a", value: "HIJO" }
];

export const EditarDependiente = ({
    setSelectDependiente,
    selectDependiente = {},
    isEditarDep,
    setIsEditarDep,
}) => {
    // Estilos mejorados
    const inputStyles = "w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white";
    const labelStyles = "flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1";
    const cardStyles = "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg";
    // Función para validar el formulario
    const validarFormulario = () => {
        if (!selectDependiente?.nombre?.trim()) {
            toast.error("Campo requerido", {
                description: "El nombre del dependiente es obligatorio",
            });
            return false;
        }
        if (!selectDependiente?.parentesco) {
            toast.error("Campo requerido", {
                description: "El parentesco es obligatorio",
            });
            return false;
        }

        if (!selectDependiente?.sexo) {
            toast.error("Campo requerido", {
                description: "El sexo es obligatorio",
            });
            return false;
        }

        if (!selectDependiente?.fechaNac) {
            toast.error("Campo requerido", {
                description: "La fecha de nacimiento es obligatoria",
            });
            return false;
        }

        // Validar que la fecha de nacimiento no sea futura
        const fechaNac = dayjs(selectDependiente.fechaNac, "DD/MM/YYYY");
        if (fechaNac.isAfter(dayjs())) {
            toast.error("Fecha inválida", {
                description: "La fecha de nacimiento no puede ser futura",
            });
            return false;
        }

        return true;
    };

    const ModificarDependiente = (e) => {
        e.preventDefault();
        if (!validarFormulario()) {
            return;
        }
        try {
            // Mostrar toast de carga
            const loadingToast = toast.loading("Actualizando dependiente...", {
                duration: Infinity,
            });

            // Simular llamada a la API
            setTimeout(() => {
                console.log("Datos a guardar:", selectDependiente);

                // Cerrar toast de carga
                toast.dismiss(loadingToast);

                // Mostrar toast de éxito
                toast.success("Dependiente actualizado", {
                    description: "Los datos se han guardado correctamente",
                    duration: 3000,
                });

                // Cerrar el modal después de guardar
                setTimeout(() => {
                    setIsEditarDep(false);
                }, 1000);

            }, 1500);

        } catch (error) {
            toast.error("Error al guardar", {
                description: "No se pudo actualizar el dependiente",
            });
            console.error("Error:", error);
        }
    };

    const handleClose = () => {
        setIsEditarDep(false);
        setSelectDependiente({});
    };

    const calcularEdad = (fechaNac) => {
        if (!fechaNac) return null;
        const nacimiento = dayjs(fechaNac, "DD/MM/YYYY");
        const hoy = dayjs();
        return hoy.diff(nacimiento, 'year');
    };

    const getEdadColor = (edad) => {
        if (edad < 18) return "text-green-600 dark:text-green-400";
        if (edad < 60) return "text-blue-600 dark:text-blue-400";
        return "text-amber-600 dark:text-amber-400";
    };

    return (
        <Dialog open={isEditarDep} onOpenChange={setIsEditarDep}>
            <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border-0 shadow-2xl">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Edit3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Editar Dependiente
                                </DialogTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Actualizando información del familiar
                                </p>
                            </div>
                        </div>
                        {selectDependiente.nombre && (
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {selectDependiente.nombre || "Familiar"}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <form className="flex flex-col gap-8 max-h-[60vh] overflow-auto " onSubmit={ModificarDependiente}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Columna Izquierda - Información Básica */}
                        <Card
                            title={
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <User className="h-5 w-5" />
                                    <span>Información Básica</span>
                                </div>
                            }
                            className={cardStyles}
                        >
                            <div className="space-y-4">
                                {/* Nombre Completo */}
                                <div>
                                    <label className={labelStyles}>
                                        <User className="h-4 w-4" />
                                        Nombre Completo *
                                    </label>
                                    <Input
                                        value={selectDependiente.nombre || ""}
                                        onChange={(e) =>
                                            setSelectDependiente((prev) => ({
                                                ...prev,
                                                nombre: e.target.value.toUpperCase(),
                                            }))
                                        }
                                        placeholder="Ingrese el nombre completo"
                                        className={inputStyles}
                                        maxLength={100}
                                        size="large"
                                    />
                                </div>

                                {/* Parentesco y Sexo */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelStyles}>
                                            <Heart className="h-4 w-4" />
                                            Parentesco *
                                        </label>
                                        <Select
                                            className="w-full"
                                            placeholder="Seleccione parentesco"
                                            value={selectDependiente.parentesco || undefined}
                                            onChange={(value) =>
                                                setSelectDependiente((prev) => ({ ...prev, parentesco: value }))
                                            }
                                            options={PARENTESCO_OPTIONS}
                                            getPopupContainer={(trigger) => trigger.parentNode}
                                            optionFilterProp="label"
                                            showSearch
                                            allowClear
                                            size="large"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelStyles}>
                                            <Users className="h-4 w-4" />
                                            Sexo *
                                        </label>
                                        <Select
                                            className="w-full"
                                            placeholder="Seleccione sexo"
                                            value={selectDependiente.sexo || undefined}
                                            onChange={(value) =>
                                                setSelectDependiente((prev) => ({ ...prev, sexo: value }))
                                            }
                                            options={SEXO_OPTIONS}
                                            getPopupContainer={(trigger) => trigger.parentNode}
                                            optionFilterProp="label"
                                            showSearch
                                            allowClear
                                            size="large"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Columna Derecha - Fecha de Nacimiento e Información */}
                        <Card
                            title={
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <Calendar className="h-5 w-5" />
                                    <span>Fecha de Nacimiento</span>
                                </div>
                            }
                            className={cardStyles}
                        >
                            <div className="space-y-2">
                                {/* Fecha de Nacimiento */}
                                <div>
                                    <label className={labelStyles}>
                                        <Baby className="h-4 w-4" />
                                        Fecha de Nacimiento *
                                    </label>
                                    <DatePicker
                                        className="w-full"
                                        format="DD/MM/YYYY"
                                        value={
                                            selectDependiente.fechaNac
                                                ? dayjs(selectDependiente.fechaNac, "DD/MM/YYYY")
                                                : null
                                        }
                                        onChange={(date, dateString) =>
                                            setSelectDependiente((prev) => ({
                                                ...prev,
                                                fechaNac: dateString || "",
                                            }))
                                        }
                                        getPopupContainer={(trigger) => trigger.parentNode}
                                        placeholder="DD/MM/AAAA"
                                        disabledDate={(current) => {
                                            return current && current > dayjs().endOf('day');
                                        }}
                                        size="large"
                                    />
                                </div>

                                {/* Información de Edad */}
                                {selectDependiente.fechaNac && (
                                    <div className="p-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Edad calculada
                                            </p>
                                            <p className={`text-2xl font-bold ${getEdadColor(calcularEdad(selectDependiente.fechaNac))}`}>
                                                {calcularEdad(selectDependiente.fechaNac)} años
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Nacimiento: {selectDependiente.fechaNac}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Información adicional */}
                                {selectDependiente.fechaRegistro && (
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                    Fecha de registro
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    {selectDependiente.fechaRegistro}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                    {/* Botones de acción */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex items-center border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 transition-all duration-200"
                        >
                            <X className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                        >
                            <Save className="h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
EditarDependiente.propTypes = {
    setSelectDependiente: PropTypes.func.isRequired,
    selectDependiente: PropTypes.object,
    isEditarDep: PropTypes.bool.isRequired,
    setIsEditarDep: PropTypes.func.isRequired,
};