import PropTypes from "prop-types";
import dayjs from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormField, DateField, SelectField } from "./DetalleAfiliado";
import { Input, Select, Card, Steps, Tag, List, Alert } from "antd";
import {
    Save,
    Edit3,
    CreditCard,
    DollarSign,
    Shield,
    Users,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useData } from "@/provider/Provider";

const { Step } = Steps;

function obtenerNumeroDependientes(tipo = "") {
    const m = String(tipo).match(/TITULAR\s*\+\s*(\d+)/i);
    return m ? Number(m[1]) : 0;
}

const emptyNuevoDependiente = {
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: null, // "DD/MM/YYYY"
    tipoDocumento: "DNI",
    numeroDocumento: "",
    sexo: "",
    parentesco: "",
};

export const ModalEditAfiliado = ({
    setSelectAfiliado,
    selectAfiliado = {},
    isEdit,
    setIsEdit,
}) => {
    const labelStyles =
        "flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3";
    const cardStyles =
        "bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-900 border border-blue-100 rounded-2xl overflow-hidden";

    const selectStyles = {
        width: "100%",
        borderRadius: "12px",
        border: "2px solid #e5e7eb",
        transition: "all 0.3s ease",
    };

    const [stepIndex, setStepIndex] = useState(0);
    const [depMode, setDepMode] = useState("select"); // "select" | "create"
    const [nuevoDependiente, setNuevoDependiente] = useState(emptyNuevoDependiente);
    const [dependientesPreviosLocal, setDependientesPreviosLocal] = useState([]);
    const { planEPS } = useData();
    // ====== Helper: key estable y SIEMPRE string (evita bug de selección) ======
    const getDepKey = (d) => {
        // Ajusta el orden si en tu API quieres priorizar otro campo
        if (d?.idAfiliado != null) return String(d.idAfiliado);
        if (d?.idDependiente != null) return String(d.idDependiente);
        if (d?.docAfiliado != null) return String(d.docAfiliado);
        if (d?.numeroDocumento != null) return String(d.numeroDocumento);
        if (d?.documento != null) return String(d.documento);
        return String(d?.nombreAfiliado ?? d?.nombreCompleto ?? "");
    };

    // Plan seleccionado
    const planSeleccionado = useMemo(() => {
        if (!selectAfiliado?.plan) return null;
        return (
            planEPS.find((p) => `${p.nombrePlan} - ${p.tipo}` === selectAfiliado.plan) ||
            null
        );
    }, [selectAfiliado?.plan]);

    const dependientesRequeridos = useMemo(() => {
        return obtenerNumeroDependientes(planSeleccionado?.tipo);
    }, [planSeleccionado?.tipo]);

    // ====== FIX #1: fetch dependientes SOLO por IDs necesarios (no por todo selectAfiliado) ======
    useEffect(() => {
        const fetchDependientes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarHistoricoAfiliadosEPS`);
                const data = Array.isArray(response.data) ? response.data : [];
                setDependientesPreviosLocal(data);
            } catch (error) {
                console.error("Error al obtener el historico:", error);
                toast.error("Error al cargar el historico", {
                    description: "No se pudieron obtener los datos del servidor",
                });
                setDependientesPreviosLocal([]);
            }
        };

        if (isEdit && selectAfiliado?.idAfiliadoTitular && selectAfiliado?.idMovEPS) {
            fetchDependientes();
        }
    }, [isEdit, selectAfiliado?.idAfiliadoTitular, selectAfiliado?.idMovEPS]);

    // ====== FIX #2: value SIEMPRE string (y nunca null/number mezclado) ======
    const dependientesSeleccionados = useMemo(() => {
        const arr = Array.isArray(selectAfiliado?.dependientesSeleccionados)
            ? selectAfiliado.dependientesSeleccionados
            : [];
        return arr.map((x) => String(x));
    }, [selectAfiliado?.dependientesSeleccionados]);

    const steps = useMemo(() => {
        const base = [{ key: "plan", title: "Plan" }];
        if (dependientesRequeridos > 0) base.push({ key: "deps", title: "Dependientes" });
        base.push({ key: "resumen", title: "Resumen" });
        return base;
    }, [dependientesRequeridos]);

    const currentStepKey = steps[stepIndex]?.key;

    useEffect(() => {
        if (!isEdit) {
            setStepIndex(0);
            setDepMode("select");
            setNuevoDependiente(emptyNuevoDependiente);
            setDependientesPreviosLocal([]);
        }
    }, [isEdit]);

    // Si requiere dependientes y no hay previos, forzar modo crear
    useEffect(() => {
        if (currentStepKey === "deps" && dependientesRequeridos > 0) {
            if (dependientesPreviosLocal.length === 0) setDepMode("create");
        }
    }, [currentStepKey, dependientesRequeridos, dependientesPreviosLocal.length]);

    const handlePlanChange = (value) => {
        const plan = planEPS.find((p) => `${p.nombrePlan} - ${p.tipo}` === value);
        setSelectAfiliado((prev) => ({
            ...prev,
            plan: value,
            idPlanEPS: plan?.idPlanEPS,
            costo: plan?.costo ?? 0,
            nombrePlan: plan?.nombrePlan ?? "",
            tipoPlan: plan?.tipo ?? "",
            dependientesSeleccionados: [],
        }));
        setStepIndex(0);
    };

    // ====== options normalizadas ======
    const dependientesOptions = useMemo(() => {
        return dependientesPreviosLocal.map((d) => ({
            value: getDepKey(d),
            label: d?.nombreAfiliado
                ? `${d.nombreAfiliado}${d.parentesco ? ` (${d.parentesco})` : ""}`
                : d?.nombreCompleto
                    ? `${d.nombreCompleto}${d.parentesco ? ` (${d.parentesco})` : ""}`
                    : getDepKey(d),
        }));
    }, [dependientesPreviosLocal]);

    const handleDependientesChange = (values) => {
        const valuesStr = (values || []).map(String);
        console.log("Selected dependientes:", valuesStr);

        let next = valuesStr;
        if (dependientesRequeridos > 0 && valuesStr.length > dependientesRequeridos) {
            next = valuesStr.slice(0, dependientesRequeridos);
            toast.warning(`Solo puedes seleccionar ${dependientesRequeridos} dependiente(s).`);
        }

        setSelectAfiliado((prev) => ({
            ...prev,
            dependientesSeleccionados: next,
        }));
    };

    const handleInputChange = (field, value) => {
        if (field === "fechaNacimiento") {
            const formatted = value ? dayjs(value).format("DD/MM/YYYY") : null;
            setNuevoDependiente((p) => ({ ...p, [field]: formatted }));
            return;
        }
        setNuevoDependiente((p) => ({ ...p, [field]: value }));
    };

    // ====== FIX #3: NO form anidado. Este handler se llama por botón type="button" ======
    const handleRegistrarDependiente = (e) => {
        e?.preventDefault?.();

        if (!nuevoDependiente.nombre?.trim()) {
            toast.error("Campo requerido", { description: "Nombre es obligatorio" });
            return;
        }
        if (!nuevoDependiente.fechaNacimiento) {
            toast.error("Campo requerido", { description: "Fecha de nacimiento es obligatoria" });
            return;
        }
        if (!nuevoDependiente.sexo) {
            toast.error("Campo requerido", { description: "Sexo es obligatorio" });
            return;
        }
        if (!nuevoDependiente.parentesco) {
            toast.error("Campo requerido", { description: "Parentesco es obligatorio" });
            return;
        }

        const nuevo = {
            idDependiente: `tmp_${Date.now()}`, // local
            nombreAfiliado: [
                nuevoDependiente.nombre,
                nuevoDependiente.apellidoPaterno,
                nuevoDependiente.apellidoMaterno,
            ]
                .filter(Boolean)
                .join(" "),
            parentesco: nuevoDependiente.parentesco,
            sexo: nuevoDependiente.sexo,
            tipoDocumento: nuevoDependiente.tipoDocumento,
            docAfiliado: nuevoDependiente.numeroDocumento,
            fechaNacimiento: nuevoDependiente.fechaNacimiento,
            __isNew: true,
            __payload: { ...nuevoDependiente },
        };

        setDependientesPreviosLocal((prev) => [nuevo, ...prev]);

        // auto-seleccionar si aún hay cupo
        setSelectAfiliado((prev) => {
            const actual = Array.isArray(prev.dependientesSeleccionados)
                ? prev.dependientesSeleccionados.map(String)
                : [];
            if (dependientesRequeridos > 0 && actual.length >= dependientesRequeridos) return prev;

            const idNuevo = getDepKey(nuevo);
            const next = [...actual, idNuevo];
            return { ...prev, dependientesSeleccionados: next };
        });

        toast.success("Dependiente registrado", {
            description: "Se agregó a la lista y quedó seleccionado",
        });

        setNuevoDependiente(emptyNuevoDependiente);
        setDepMode("select");
    };

    const handleNext = () => {
        if (currentStepKey === "plan") {
            if (!selectAfiliado?.plan) {
                toast.error("Campo requerido", { description: "Debe seleccionar un plan" });
                return;
            }
            setStepIndex((s) => Math.min(s + 1, steps.length - 1));
            return;
        }

        if (currentStepKey === "deps") {
            if (dependientesSeleccionados.length !== dependientesRequeridos) {
                toast.error("Faltan dependientes", {
                    description: `Debes seleccionar exactamente ${dependientesRequeridos} dependiente(s).`,
                });
                return;
            }
            setStepIndex((s) => Math.min(s + 1, steps.length - 1));
            return;
        }
    };

    const handleBack = () => setStepIndex((s) => Math.max(s - 1, 0));

    const handleConfirmarCambio = (e) => {
        e.preventDefault();

        if (!selectAfiliado?.plan) {
            toast.error("Campo requerido", { description: "Debe seleccionar un plan" });
            return;
        }

        if (dependientesRequeridos > 0 && dependientesSeleccionados.length !== dependientesRequeridos) {
            toast.error("Faltan dependientes", {
                description: `Debes seleccionar exactamente ${dependientesRequeridos} dependiente(s).`,
            });
            return;
        }
        console.log("Dependientes previos locales:", dependientesPreviosLocal);
        const nuevosDependientes = dependientesPreviosLocal.filter((d) => d.__isNew);
        console.log("Nuevos dependientes a registrar:", nuevosDependientes);
        try {
            const loadingToast = toast.loading("Aplicando cambio de plan...", { duration: Infinity });

            setTimeout(() => {
                console.log("Payload final:", {
                    ...selectAfiliado,
                    planSeleccionado,
                    dependientesSeleccionados,
                    nuevosDependientes,
                });

                toast.dismiss(loadingToast);
                toast.success("Plan actualizado", {
                    description: "El plan se ha actualizado correctamente",
                    duration: 3000,
                });

                setTimeout(() => setIsEdit(false), 800);
            }, 800);
        } catch (error) {
            toast.error("Error al guardar", { description: "No se pudo actualizar el plan" });
            console.error("Error:", error);
        }
    };

    const dependientesSeleccionadosDetalle = useMemo(() => {
        return dependientesPreviosLocal.filter((d) => {
            const id = getDepKey(d);
            return dependientesSeleccionados.includes(id);
        });
    }, [dependientesPreviosLocal, dependientesSeleccionados]);

    return (
        <Dialog open={isEdit} onOpenChange={setIsEdit}>
            <DialogContent className="max-w-xl bg-white rounded-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-blue-500">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-2xl backdrop-blur-sm">
                            <Edit3 className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-bold text-blue-500 mb-1">
                                Cambio de Plan
                            </DialogTitle>
                            <p className="text-blue-400 text-sm">
                                {selectAfiliado.nombreCompleto || "Actualizando información del plan"}
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                <div>
                    <Steps current={stepIndex} size="small">
                        {steps.map((s) => (
                            <Step key={s.key} title={s.title} />
                        ))}
                    </Steps>
                </div>

                <div className="flex flex-col">
                    {/* STEP: PLAN */}
                    {currentStepKey === "plan" && (
                        <Card className={cardStyles}>
                            <div className="flex justify-center">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                                    <Shield className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>

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
                                        option?.label?.toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={planEPS.map((plan) => ({
                                                value: `${plan.nombrePlan} - ${plan.tipo}`,
                                                label: `${plan.nombrePlan} - ${plan.tipo}`,
                                            }))}
                                    size="large"
                                />
                            </div>

                            {planSeleccionado && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex gap-2 justify-center">
                                        <Tag color="blue">{planSeleccionado.nombrePlan}</Tag>
                                        <Tag color={dependientesRequeridos > 0 ? "purple" : "green"}>
                                            {planSeleccionado.tipo}
                                        </Tag>
                                    </div>

                                    <label className={labelStyles}>
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        Monto del Plan
                                    </label>
                                    <Input
                                        disabled
                                        value={`S/ ${(planSeleccionado.costo || 0).toLocaleString("es-PE")}`}
                                        className="w-full text-center text-xl font-bold py-4 rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                        style={{ fontSize: "1.25rem", fontWeight: "700" }}
                                    />
                                </div>
                            )}
                        </Card>
                    )}

                    {/* STEP: DEPENDIENTES */}
                    {currentStepKey === "deps" && (
                        <Card className={`${cardStyles}`}>
                            <div className="relative flex justify-center mb-4">
                                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                                    <Users className="h-8 w-8 text-purple-700" />
                                </div>

                                <div className="absolute top-0 right-0 flex flex-col justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant={depMode === "create" ? "default" : "outline"}
                                        onClick={() => setDepMode("create")}
                                        className="rounded-xl"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Agregar nuevo
                                    </Button>
                                </div>

                                <div className="absolute top-0 left-0 flex flex-col justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant={depMode === "select" ? "default" : "outline"}
                                        onClick={() => setDepMode("select")}
                                        className="rounded-xl"
                                    >
                                        Seleccionar previos
                                    </Button>
                                </div>
                            </div>

                            <div className="text-center mb-2">
                                <Tag color="purple">Debe seleccionar {dependientesRequeridos} dependiente(s)</Tag>
                            </div>

                            {/* MODO: seleccionar previos */}
                            {depMode === "select" && (
                                <>
                                    {dependientesPreviosLocal.length === 0 ? (
                                        <Alert
                                            type="warning"
                                            showIcon
                                            message="No hay dependientes previos"
                                            description="Registra un nuevo dependiente para poder continuar."
                                        />
                                    ) : (
                                        <>
                                            <label className={labelStyles}>
                                                <Users className="h-4 w-4 text-purple-700" />
                                                Dependientes
                                            </label>
                                            <Select
                                                style={selectStyles}
                                                value={dependientesSeleccionados}
                                                onChange={(vals) => handleDependientesChange(vals)}
                                                options={dependientesOptions.map((o) => ({
                                                    label: o.label,
                                                    value: String(o.value),
                                                }))}
                                                placeholder="Buscar plan..."
                                                showSearch
                                                allowClear
                                                optionFilterProp="label"
                                                getPopupContainer={(trigger) => trigger.parentNode}
                                                filterOption={(input, option) =>
                                                    option?.label?.toLowerCase().includes(input.toLowerCase())
                                                }
                                                size="large"
                                                mode="tags"
                                            />
                                            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                                Seleccionados:{" "}
                                                <b>
                                                    {dependientesSeleccionados.length}/{dependientesRequeridos}
                                                </b>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* MODO: registrar nuevo (SIN form anidado) */}
                            {depMode === "create" && (
                                <div className="mt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        <FormField label="Plan Asociado" value={selectAfiliado.plan} disabled />

                                        <FormField
                                            label="Nombre *"
                                            value={nuevoDependiente.nombre}
                                            onChange={(value) => handleInputChange("nombre", value)}
                                            required
                                        />

                                        <FormField
                                            label="Apellido Paterno"
                                            value={nuevoDependiente.apellidoPaterno}
                                            onChange={(value) => handleInputChange("apellidoPaterno", value)}
                                        />

                                        <FormField
                                            label="Apellido Materno"
                                            value={nuevoDependiente.apellidoMaterno}
                                            onChange={(value) => handleInputChange("apellidoMaterno", value)}
                                        />

                                        <DateField
                                            label="Fecha Nacimiento *"
                                            value={
                                                nuevoDependiente.fechaNacimiento
                                                    ? dayjs(nuevoDependiente.fechaNacimiento, "DD/MM/YYYY")
                                                    : null
                                            }
                                            onChange={(value) => handleInputChange("fechaNacimiento", value)}
                                        />

                                        <SelectField
                                            label="Tipo Documento"
                                            value={nuevoDependiente.tipoDocumento}
                                            onChange={(value) => handleInputChange("tipoDocumento", value)}
                                            options={[
                                                { label: "DNI", value: "DNI" },
                                                { label: "Carnet de Extranjería", value: "CARNET_EXTRANJERIA" },
                                            ]}
                                        />

                                        <FormField
                                            label="N° Documento"
                                            value={nuevoDependiente.numeroDocumento}
                                            onChange={(value) => handleInputChange("numeroDocumento", value)}
                                        />

                                        <SelectField
                                            label="Sexo *"
                                            value={nuevoDependiente.sexo}
                                            onChange={(value) => handleInputChange("sexo", value)}
                                            options={[
                                                { label: "Masculino", value: "MASCULINO" },
                                                { label: "Femenino", value: "FEMENINO" },
                                            ]}
                                            required
                                        />

                                        <SelectField
                                            label="Parentesco *"
                                            value={nuevoDependiente.parentesco}
                                            onChange={(value) => handleInputChange("parentesco", value)}
                                            options={[
                                                { label: "Cónyuge", value: "CONYUGUE" },
                                                { label: "Hijo/a", value: "HIJO" },
                                                { label: "Padre", value: "PADRE" },
                                                { label: "Madre", value: "MADRE" },
                                                { label: "Hermano/a", value: "HERMANO" },
                                                { label: "Otro", value: "OTRO" },
                                            ]}
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <Button
                                            type="button"
                                            onClick={handleRegistrarDependiente}
                                            className="bg-green-600 hover:bg-green-700 px-8 py-2 rounded-xl"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Registrar Dependiente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* STEP: RESUMEN */}
                    {currentStepKey === "resumen" && (
                        <Card className={cardStyles}>
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                                    <Shield className="h-8 w-8 text-emerald-700" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-300">Plan</div>
                                    <div className="font-semibold">
                                        {planSeleccionado?.nombrePlan} - {planSeleccionado?.tipo}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-300">Costo</div>
                                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                        S/ {(planSeleccionado?.costo || 0).toLocaleString("es-PE")}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                                        Dependientes
                                    </div>

                                    {dependientesRequeridos === 0 ? (
                                        <Tag color="green">Titular solo (sin dependientes)</Tag>
                                    ) : (
                                        <>
                                            <div className="mb-2">
                                                <Tag color="purple">Requeridos: {dependientesRequeridos}</Tag>
                                                <Tag color="blue">Seleccionados: {dependientesSeleccionados.length}</Tag>
                                            </div>

                                            <List
                                                size="small"
                                                bordered
                                                dataSource={dependientesSeleccionadosDetalle}
                                                locale={{ emptyText: "No se seleccionaron dependientes" }}
                                                renderItem={(item) => (
                                                    <List.Item>
                                                        {item?.nombreAfiliado ?? item?.nombreCompleto ?? String(item)}
                                                        {item?.parentesco ? (
                                                            <Tag className="ml-2">{item.parentesco}</Tag>
                                                        ) : null}
                                                        {item?.__isNew ? (
                                                            <Tag color="green" className="ml-2">
                                                                Nuevo
                                                            </Tag>
                                                        ) : null}
                                                    </List.Item>
                                                )}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* BOTONES */}
                    <div className="flex gap-3 justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            onClick={handleBack}
                            disabled={stepIndex === 0}
                            className="px-4 py-3 rounded-xl"
                            variant="outline"
                        >
                            Atrás
                        </Button>

                        {currentStepKey === "resumen" ? (
                            <Button
                                type="button"
                                onClick={handleConfirmarCambio}
                                className="flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                            >
                                <Save className="h-4 w-4" />
                                Confirmar cambio
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={
                                    (currentStepKey === "plan" && !selectAfiliado.plan) ||
                                    (currentStepKey === "deps" &&
                                        dependientesSeleccionados.length !== dependientesRequeridos)
                                }
                                className="flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                                Siguiente
                            </Button>
                        )}
                    </div>
                </div>
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
