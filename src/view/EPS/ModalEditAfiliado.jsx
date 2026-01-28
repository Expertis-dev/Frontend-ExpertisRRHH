import PropTypes from "prop-types";
import dayjs from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormField, DateField, SelectField } from "./DetalleAfiliado";
import { Input, Select, Card, Steps, Tag, List, Alert, DatePicker } from "antd";
import {
    Save,
    Edit3,
    CreditCard,
    DollarSign,
    Shield,
    Users,
    Plus,
    Loader2
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    const [planOriginal, setPlanOriginal] = useState(null); // Plan base para filtrado de nivel
    const [nuevoDependiente, setNuevoDependiente] = useState(emptyNuevoDependiente);
    const [dependientesPreviosLocal, setDependientesPreviosLocal] = useState([]);
    const [parentescos, setParentescos] = useState({}); // Mapeo de idDependiente -> parentesco
    const [activeTab, setActiveTab] = useState("seleccionar");
    const [isLoading, setIsLoading] = useState(false);
    const { planEPS } = useData();
    // ====== Helper: key estable y SIEMPRE string (evita bug de selección) ======
    const getDepKey = (d) => {
        // Priorizamos idAfiliadoEPS que es lo que el backend de asociación requiere
        if (d?.idAfiliadoEPS != null) return String(d.idAfiliadoEPS);
        if (d?.idAfiliado != null) return String(d.idAfiliado);
        if (d?.idDependiente != null) return String(d.idDependiente);
        if (d?.docAfiliado != null) return String(d.docAfiliado);
        if (d?.numeroDocumento != null) return String(d.numeroDocumento);
        if (d?.documento != null) return String(d.documento);
        return String(d?.nombreAfiliado ?? d?.nombreCompleto ?? "");
    };

    // Plan seleccionado (elección actual en el modal)
    const planSeleccionado = useMemo(() => {
        if (!selectAfiliado?.plan) return null;
        return (
            planEPS.find((p) => `${p.nombrePlan} - ${p.tipo}` === selectAfiliado.plan) ||
            null
        );
    }, [selectAfiliado?.plan, planEPS]);

    // Filtrado de planes: Misma marca y jerarquía igual o superior
    const planesFiltrados = useMemo(() => {
        // Detectamos el string del plan actual (buscando en ambas posibles propiedades)
        const currentPlanStr = selectAfiliado?.Plan || selectAfiliado?.plan || planOriginal;
        if (!currentPlanStr) return planEPS;

        const normalize = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, ' ');
        const normalizedInput = normalize(currentPlanStr);

        // Buscamos el objeto del plan en la lista maestra para saber su nombrePlan (marca)
        const objBase = planEPS.find(p => {
            const fullLabel = normalize(`${p.nombrePlan} - ${p.tipo}`);
            return fullLabel === normalizedInput;
        }) || planEPS.find(p => normalize(p.nombrePlan) === normalizedInput);

        if (!objBase) return planEPS;

        const marcaBase = normalize(objBase.nombrePlan);

        // El nivel mínimo lo define el plan ORIGINAL (con el que entró al modal)
        const normalizedOriginal = planOriginal ? normalize(planOriginal) : normalizedInput;
        const objOriginal = planEPS.find(p => normalize(`${p.nombrePlan} - ${p.tipo}`) === normalizedOriginal);
        const numDepsMinimos = objOriginal ? obtenerNumeroDependientes(objOriginal.tipo) : 0;

        return planEPS.filter((p) => {
            // Regla 1: Misma marca (nombrePlan)
            const mismaMarca = normalize(p.nombrePlan) === marcaBase;

            // Regla 2: Jerarquía igual o superior al original
            const numDepsNuevo = obtenerNumeroDependientes(p.tipo);

            return mismaMarca && numDepsNuevo >= numDepsMinimos;
        });
    }, [planEPS, planOriginal, selectAfiliado?.Plan, selectAfiliado?.plan]);

    const dependientesRequeridos = useMemo(() => {
        return obtenerNumeroDependientes(planSeleccionado?.tipo);
    }, [planSeleccionado?.tipo]);

    // ====== FIX #1: fetch dependientes SOLO por IDs necesarios (no por todo selectAfiliado) ======
    useEffect(() => {
        const fetchDependientes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarHistoricoAfiliadosEPS`);
                const data = response.data?.recordset ?? response.data ?? [];
                setDependientesPreviosLocal(Array.isArray(data) ? data : []);
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
            setPlanOriginal(null);
            setParentescos({});
            setActiveTab("seleccionar");
            setIsLoading(false);
        } else {
            // Unimos el Nombre del Plan y el Tipo para tener el string completo (ej. "PLAN BASE - TITULAR SOLO")
            const planNombre = selectAfiliado?.Plan || selectAfiliado?.plan || selectAfiliado?.nombrePlan;
            const planTipo = selectAfiliado?.Tipo || selectAfiliado?.tipo;

            if (planNombre && !planOriginal) {
                const fullPlanString = planTipo ? `${planNombre} - ${planTipo}` : planNombre;
                setPlanOriginal(fullPlanString);

                // Aseguramos que el estado interno reconozca este plan como el actual
                if (!selectAfiliado.plan) {
                    setSelectAfiliado(prev => ({ ...prev, plan: fullPlanString }));
                }
            }
        }
    }, [isEdit, selectAfiliado, planOriginal, setSelectAfiliado]);

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

        // Buscamos los objetos completos para mostrarlos en consola
        const seleccionadosData = valuesStr.map(id =>
            dependientesPreviosLocal.find(d => getDepKey(d) === id)
        ).filter(Boolean);

        console.log("=== DEPENDIENTES SELECCIONADOS (FULL DATA) ===");
        console.table(seleccionadosData);
        console.log("Detalle crudo:", seleccionadosData);

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

    // ====== NUEVO: Registrar Dependiente Real ======
    const handleRegistrarDependiente = async (e) => {
        e?.preventDefault?.();

        if (!nuevoDependiente.nombre?.trim()) {
            toast.error("Campo requerido", { description: "Nombre es obligatorio" });
            return;
        }
        if (!nuevoDependiente.numeroDocumento?.trim()) {
            toast.error("Campo requerido", { description: "N° Documento es obligatorio" });
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

        const payload = {
            DOCUMENTO: nuevoDependiente.numeroDocumento,
            nombres: nuevoDependiente.nombre.trim().toUpperCase(),
            apellidos: `${nuevoDependiente.apellidoPaterno} ${nuevoDependiente.apellidoMaterno}`.trim().toUpperCase(),
            fecNacimiento: nuevoDependiente.fechaNacimiento ? dayjs(nuevoDependiente.fechaNacimiento, "DD/MM/YYYY").format("YYYY-MM-DD") : null,
            sexo: nuevoDependiente.sexo === "MASCULINO" ? "MASCULINO" : "FEMENINO"
        };

        const loadingToast = toast.loading("Registrando persona dependiente...");
        try {
            const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/registrarDependiente`, payload);

            // Capturamos el ID que retorna el SP
            const newId = resp.data?.idAfiliado || resp.data?.recordset?.[0]?.idAfiliado || payload.DOCUMENTO;
            const newKey = String(newId);

            toast.dismiss(loadingToast);
            toast.success("Dependiente registrado exitosamente");

            const nuevo = {
                idAfiliadoEPS: newId,
                nombreAfiliado: `${payload.nombres} ${payload.apellidos}`,
                documento: payload.DOCUMENTO,
                parentesco: nuevoDependiente.parentesco,
                __isNew: true
            };

            setDependientesPreviosLocal(prev => [nuevo, ...prev]);

            // Auto-seleccionar si hay cupo
            setSelectAfiliado((prev) => {
                const actual = Array.isArray(prev.dependientesSeleccionados) ? prev.dependientesSeleccionados.map(String) : [];
                if (dependientesRequeridos > 0 && actual.length >= dependientesRequeridos) return prev;
                return { ...prev, dependientesSeleccionados: [...actual, newKey] };
            });

            // Si se registró con success, guardamos el parentesco que eligió
            if (nuevoDependiente.parentesco) {
                setParentescos(prev => ({ ...prev, [newKey]: nuevoDependiente.parentesco }));
            }

            setNuevoDependiente(emptyNuevoDependiente);
            setActiveTab("seleccionar");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error al registrar dependiente", {
                description: error.response?.data?.message || "No se pudo registrar a la persona."
            });
        }
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

    const handleConfirmarCambio = async (e) => {
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

        if (!selectAfiliado.mesInicio) {
            toast.error("Campo requerido", { description: "Debe seleccionar un período (mes de inicio)" });
            return;
        }

        // Validar parentescos en el resumen
        const faltanParentescos = dependientesSeleccionados.some(id => !parentescos[id]);
        if (faltanParentescos) {
            toast.error("Falta información", { description: "Debe seleccionar el parentesco para todos los dependientes en el resumen." });
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Actualizando afiliación y dependientes...", { duration: Infinity });

        try {
            // 1. Registro del Titular (Cambio de Plan / Nuevo Movimiento)
            const payloadTitular = {
                Documento: selectAfiliado.documento || selectAfiliado.Documento,
                idPlan: selectAfiliado.idPlanEPS,
                mesInicio: selectAfiliado.mesInicio // Formato YYYY-MM-01
            };
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/registrarAfiliadoEPS`, payloadTitular);

            // 2. Asociación de Dependientes
            if (dependientesSeleccionados.length > 0) {
                for (const depId of dependientesSeleccionados) {
                    const payloadAsoc = {
                        DOCUMENTO_TITULAR: selectAfiliado.documento || selectAfiliado.Documento,
                        idPlan: selectAfiliado.idPlanEPS,
                        mesInicio: selectAfiliado.mesInicio,
                        idAfiliadoDependiente: depId,
                        parentesco: parentescos[depId],
                        tipoRegistro: "R"
                    };
                    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/asosciarDependiente`, payloadAsoc);
                }
            }

            toast.dismiss(loadingToast);
            toast.success("Plan y dependientes actualizados", {
                description: "La información se ha procesado correctamente",
                duration: 3000,
            });

            setTimeout(() => setIsEdit(false), 800);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error al actualizar", {
                description: error.response?.data?.message || "No se pudo completar la operación"
            });
        } finally {
            setIsLoading(false);
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
            <DialogContent className="max-w-xl bg-white rounded-xl p-0 overflow-hidden flex flex-col h-[85vh]">
                <DialogHeader className="text-blue-500 p-6 pb-2">
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
                    <Steps current={stepIndex} size="small" className="px-6 py-2">
                        {steps.map((s) => (
                            <Step key={s.key} title={s.title} />
                        ))}
                    </Steps>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
                    <div className="flex flex-col gap-4 pb-4">
                        {/* STEP: PLAN */}
                        {currentStepKey === "plan" && (
                            <Card className={cardStyles}>
                                <div className="flex justify-center">
                                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                                        <Shield className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>

                                <div className="space-y-4 mt-4">
                                    {planOriginal && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase tracking-wider text-blue-500 dark:text-blue-400 font-bold mb-0.5">Plan Actual del Afiliado</p>
                                                <div className="flex flex-wrap items-center gap-x-2">
                                                    <span className="text-sm text-blue-900 dark:text-blue-100 font-bold">{planOriginal.split(' - ')[0]}</span>
                                                    <span className="text-[10px] text-blue-400 font-medium whitespace-nowrap px-1.5 py-0.5 bg-blue-100/50 dark:bg-blue-800/30 rounded-md">
                                                        {planOriginal.split(' - ')[1] || "PERSONALIZADO"}
                                                    </span>
                                                </div>
                                            </div>
                                            <Tag color="blue" className="rounded-full px-3 py-0.5 border-0 font-bold shadow-sm text-[10px]">ACTIVO</Tag>
                                        </div>
                                    )}

                                    <label className={labelStyles}>
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                        Seleccione Nuevo Plan *
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
                                        options={planesFiltrados.map((plan) => {
                                            const labelStr = `${plan.nombrePlan} - ${plan.tipo}`;
                                            const isActual = planOriginal &&
                                                labelStr.toLowerCase().replace(/\s+/g, ' ') === planOriginal.toLowerCase().replace(/\s+/g, ' ');

                                            return {
                                                value: labelStr,
                                                label: isActual ? `⭐ ${labelStr} (Actual)` : labelStr,
                                            };
                                        })}
                                        size="large"
                                    />

                                    {planSeleccionado && (
                                        <>
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

                                            <div className="mt-4">
                                                <label className={labelStyles}>
                                                    <Plus className="h-4 w-4 text-blue-600" />
                                                    Período de Aplicación (Mes Inicio) *
                                                </label>
                                                <DatePicker
                                                    picker="month"
                                                    style={{ ...selectStyles, height: '44px' }}
                                                    placeholder="Seleccione Mes de Inicio"
                                                    value={selectAfiliado.mesInicio ? dayjs(selectAfiliado.mesInicio) : null}
                                                    onChange={(date) => {
                                                        setSelectAfiliado(prev => ({
                                                            ...prev,
                                                            mesInicio: date ? date.startOf('month').format('YYYY-MM-DD') : null
                                                        }));
                                                    }}
                                                    format="MMMM YYYY"
                                                    className="w-full rounded-xl transition-all"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* STEP: DEPENDIENTES */}
                        {currentStepKey === "deps" && (
                            <Card className={`${cardStyles} border-0 shadow-none`}>
                                <div className="space-y-4">
                                    <div className="text-center mb-2">
                                        <Tag color="purple" className="px-4 py-1 rounded-full font-semibold">
                                            Debe seleccionar {dependientesRequeridos} dependiente(s)
                                        </Tag>
                                    </div>

                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4 bg-blue-50/50 p-1 rounded-xl">
                                            <TabsTrigger value="seleccionar" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                <Users className="h-4 w-4 mr-2" />
                                                Seleccionar Previos
                                            </TabsTrigger>
                                            <TabsTrigger value="agregar" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Agregar Nuevo
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="seleccionar" className="mt-0">
                                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                                                {dependientesPreviosLocal.length === 0 ? (
                                                    <Alert
                                                        type="warning"
                                                        showIcon
                                                        message="No hay dependientes previos"
                                                        description="Registra un nuevo dependiente en la pestaña siguiente para poder continuar."
                                                    />
                                                ) : (
                                                    <div className="space-y-3">
                                                        <label className={labelStyles}>
                                                            <Users className="h-4 w-4 text-purple-700" />
                                                            Dependientes Disponibles
                                                        </label>
                                                        <Select
                                                            style={{ width: '100%' }}
                                                            mode="multiple"
                                                            value={dependientesSeleccionados}
                                                            onChange={(vals) => handleDependientesChange(vals)}
                                                            options={dependientesOptions}
                                                            placeholder="🔍 Seleccione los dependientes para el plan..."
                                                            showSearch
                                                            allowClear
                                                            optionFilterProp="label"
                                                            getPopupContainer={(trigger) => trigger.parentNode}
                                                            filterOption={(input, option) =>
                                                                option?.label?.toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            size="large"
                                                            maxTagCount="responsive"
                                                            className="custom-select-multiple"
                                                        />
                                                        <div className="flex justify-between items-center px-2">
                                                            <span className="text-xs text-gray-500">Selecciona los familiares asociados al titular</span>
                                                            <Tag color="blue" className="m-0 font-bold">
                                                                {dependientesSeleccionados.length} / {dependientesRequeridos}
                                                            </Tag>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="agregar" className="mt-0">
                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
                                                    <FormField
                                                        label="Plan Asociado"
                                                        value={selectAfiliado.plan?.split(' - ')[0] || "EPS"}
                                                        disabled
                                                    />

                                                    <FormField
                                                        label="Nombre *"
                                                        value={nuevoDependiente.nombre}
                                                        onChange={(value) => handleInputChange("nombre", value)}
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
                                                        label="N° Documento *"
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
                                                    />

                                                    <SelectField
                                                        label="Parentesco (Opcional)"
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
                                                    />
                                                </div>

                                                <div className="flex justify-center pt-2">
                                                    <Button
                                                        type="button"
                                                        onClick={handleRegistrarDependiente}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Registrar y Añadir
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
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

                                                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2">
                                                    {dependientesSeleccionadosDetalle.map((item) => {
                                                        const id = getDepKey(item);
                                                        return (
                                                            <div key={id} className="flex flex-col p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm gap-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                                                        {item?.nombreAfiliado ?? item?.nombreCompleto ?? String(item)}
                                                                    </span>
                                                                    {item?.__isNew && <Tag color="green">Nuevo</Tag>}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Parentesco *</span>
                                                                    <Select
                                                                        placeholder="Seleccionar..."
                                                                        className="w-full"
                                                                        size="small"
                                                                        value={parentescos[id]}
                                                                        onChange={(val) => setParentescos(prev => ({ ...prev, [id]: val }))}
                                                                        options={[
                                                                            { label: "Cónyuge", value: "CONYUGUE" },
                                                                            { label: "Hijo/a", value: "HIJO" },
                                                                            { label: "Padre", value: "PADRE" },
                                                                            { label: "Madre", value: "MADRE" },
                                                                            { label: "Hermano/a", value: "HERMANO" },
                                                                            { label: "Otro", value: "OTRO" },
                                                                        ]}
                                                                        getPopupContainer={(trigger) => trigger.parentNode}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                    </div>
                </div>

                {/* BOTONES */}
                <div className="flex gap-3 justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-xl">
                    <Button
                        type="button"
                        onClick={handleBack}
                        disabled={stepIndex === 0 || isLoading}
                        className="px-4 py-3 rounded-xl"
                        variant="outline"
                    >
                        Atrás
                    </Button>

                    {currentStepKey === "resumen" ? (
                        <Button
                            type="button"
                            onClick={handleConfirmarCambio}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white min-w-[160px]"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isLoading ? "Procesando..." : "Confirmar cambio"}
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
            </DialogContent>
        </Dialog >
    );
};
ModalEditAfiliado.propTypes = {
    setSelectAfiliado: PropTypes.func.isRequired,
    selectAfiliado: PropTypes.object,
    isEdit: PropTypes.bool.isRequired,
    setIsEdit: PropTypes.func.isRequired,
};
