import PropTypes from "prop-types";
import { UserPlus, User, CreditCard, Loader2, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Modal, Select, Card, Steps, Tag } from "antd";
import { useData } from "@/provider/Provider";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
const { Option } = Select;
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

import { FormField, DateField, SelectField } from "./DetalleAfiliado";
export const ModalRegistroAfiliado = ({ isCrear, setIsCrear, afiliados }) => {
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [numDep, setNumDep] = useState(0);
    const { planEPS } = useData();

    // --- Wizard ---
    const [pasoActual, setPasoActual] = useState(0);
    const [nuevoDependiente, setNuevoDependiente] = useState(emptyNuevoDependiente);
    // Dependientes (Paso 2)
    const [usarDependientes, setUsarDependientes] = useState(false);
    const [dependientesOptions, setDependientesOptions] = useState([]);
    const [dependientesSeleccionados, setDependientesSeleccionados] = useState([]);
    const [dependientesLoading, setDependientesLoading] = useState(false);

    const [data, setData] = useState({
        plan: "",
        montoPlan: 0,
        direccion: "",
        sexo: "M",
        tipoDocumento: "DNI",
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Estilos
    const inputStyles =
        "w-full p-2 border-0 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400";
    const labelStyles =
        "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2";
    const selectStyles = { width: "100%", height: "44px" };

    // Plan por defecto (robusto ante value/nombrePlan)
    const planDefault = useMemo(() => {
        const first = planEPS?.[0];
        if (!first) return { plan: "", monto: 0 };
        return {
            plan: first.value ?? first.nombrePlan ?? "",
            monto: first.monto ?? 0,
        };
    }, [planEPS]);

    // Set defaults cuando se abre
    useEffect(() => {
        if (!isCrear) return;
        setPasoActual(0);
        setUsarDependientes(false);
        setDependientesSeleccionados([]);
        setDependientesOptions([]);

        setEmpleadoSeleccionado(null);
        setData((prev) => ({
            ...prev,
            plan: planDefault.plan,
            montoPlan: planDefault.monto,
            direccion: "",
            sexo: "M",
            tipoDocumento: "DNI",
        }));
    }, [isCrear, planDefault.plan, planDefault.monto]);

    // Cargar empleados
    useEffect(() => {
        const ObtenerEmpleado = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`
                );
                const datos = response.data.recordset;

                const dataEmpleados = datos
                    .filter((dato) => dato.nombreCompleto !== null)
                    .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

                setEmpleados(
                    dataEmpleados.filter(
                        (dato) => String(dato.estadoLaboral).trim().toUpperCase() === "VIGENTE"
                    )
                );
            } catch (error) {
                console.error("Error al obtener empleados:", error);
                toast.error("Error al cargar la lista de empleados");
            }
        };
        fetchDependientes();
        ObtenerEmpleado();
    }, []);

    const handleEmpleadoChange = (empleadoId) => {
        const empleado = empleados.find((emp) => emp.idEmpleado === parseInt(empleadoId));
        if (!empleado) return;

        // Validación: no duplicado en afiliados
        if (afiliados?.some((af) => af.Documento === empleado.documento)) {
            toast.error("El empleado ya está registrado como afiliado, por favor seleccione otro.");
            setEmpleadoSeleccionado(null);
            return;
        }
        setEmpleadoSeleccionado(empleado);
        setDependientesSeleccionados([]);
        // Cargar dependientes cuando se selecciona un empleado
        fetchDependientes();
    };
    const handleInputChange = (field, value) => {
        if (field === "fechaNacimiento") {
            const formatted = value ? dayjs(value).format("DD/MM/YYYY") : null;
            setNuevoDependiente((p) => ({ ...p, [field]: formatted }));
            return;
        }
        setNuevoDependiente((p) => ({ ...p, [field]: value }));
    };
    const getDepKey = (d) => {
        // Ajusta el orden si en tu API quieres priorizar otro campo
        if (d?.idAfiliado != null) return String(d.idAfiliado);
        if (d?.idDependiente != null) return String(d.idDependiente);
        if (d?.docAfiliado != null) return String(d.docAfiliado);
        if (d?.numeroDocumento != null) return String(d.numeroDocumento);
        if (d?.documento != null) return String(d.documento);
        return String(d?.nombreAfiliado ?? d?.nombreCompleto ?? "");
    };
    const fetchDependientes = async () => {
        setDependientesLoading(true);
        try {
            const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarHistoricoAfiliadosEPS`);
            const lista = resp.data?.recordset ?? resp.data ?? [];
            const options = lista.map((d) => ({
                value: getDepKey(d),
                label: d?.nombreAfiliado
                    ? `${d.nombreAfiliado}${d.parentesco ? ` (${d.parentesco})` : ""}`
                    : d?.nombreCompleto
                        ? `${d.nombreCompleto}${d.parentesco ? ` (${d.parentesco})` : ""}`
                        : getDepKey(d),
            }));
            console.log("Dependientes options:", options);
            setDependientesOptions(options);
        } catch (e) {
            console.error("Error fetchDependientes:", e);
            toast.error("No se pudieron cargar los dependientes");
            setDependientesOptions([]);
        } finally {
            setDependientesLoading(false);
        }
    };
    const planLabel = useMemo(() => {
        console.log("planEPS disponible:", planEPS);
        const plan = data.plan.split(" - ")[0];
        console.log("plan extraído:", plan);
        const p = planEPS?.find((x) => x.nombrePlan === plan.trim());
        return p?.label ?? p?.nombrePlan ?? "No seleccionado";
    }, [planEPS, data.plan]);

    const tipoLabel = useMemo(() => {
        console.log("planEPS disponible:", planEPS);
        const plan = data.plan.split(" - ")[1];
        console.log("plan extraído:", plan);
        return plan ?? "No seleccionado";
    }, [planEPS, data.plan]);

    const getPlanMonto = (value) => {
        const plan = value.split(" - ")[0];
        const tipo = value.split(" + ")[1];
        if (tipo) {
            const num = tipo.split(" ")[0];
            setNumDep(num);
        } else {
            setNumDep(0);
        }
        const p = planEPS?.find((x) => x.nombrePlan.trim() === plan.trim() && x.tipo === value.split(" - ")[1].trim());
        return p?.costo ?? 0;
    };

    // --- VALIDACIONES por paso ---
    const validarPaso0 = () => {
        if (!empleadoSeleccionado) {
            toast.error("Campo requerido", { description: "Debe seleccionar un empleado" });
            return false;
        }
        console.log(data.plan)
        if (data.plan.trim() === "PLAN BASE ESENCIAL") {
            toast.error("Campo requerido", { description: "Debe seleccionar un plan" });
            return false;
        }
        return true;
    };
    const validarPaso1 = () => {
        console.log(numDep)
        console.log(dependientesSeleccionados.length)
        if (dependientesSeleccionados.length == numDep) {
            return true
        } else {
            toast.error("Faltan dependientes", {
                description: `Debes seleccionar exactamente ${numDep} dependiente(s).`,
            });
            return false;
        }
    };

    const handleNext = () => {
        if (pasoActual === 0 && !validarPaso0()) return;
        if (pasoActual === 1 && !validarPaso1()) return;
        if (numDep === 0) {
            setPasoActual(2);
            return;
        }
        setPasoActual((p) => Math.min(p + 1, 2));
    };

    const handleBack = () => {
        if (numDep === 0 && pasoActual === 2) {
            setPasoActual(0);
            return;
        }
        setPasoActual((p) => Math.max(p - 1, 0))
    };

    const handleFinish = () => {
        // Llegaste a resumen -> abres confirmación
        if (!validarPaso0()) return;
        if (!validarPaso1()) return;
        setShowConfirmModal(true);
    };

    const confirmRegistration = async () => {
        setShowConfirmModal(false);
        setIsLoading(true);
        const loadingToast = toast.loading("Registrando afiliado...", { duration: Infinity });
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.dismiss(loadingToast);
            toast.success("Afiliado registrado correctamente", {
                description: `El empleado ${empleadoSeleccionado.nombreCompleto} ha sido registrado exitosamente.`,
                duration: 4000,
            });
            setEmpleadoSeleccionado(null);
            setUsarDependientes(false);
            setDependientesSeleccionados([]);
            setDependientesOptions([]);
            setData({
                plan: planDefault.plan,
                montoPlan: planDefault.monto,
                direccion: "",
                sexo: "M",
                tipoDocumento: "DNI",
            });

            setTimeout(() => {
                setIsCrear(false);
            }, 700);
        } catch (error) {
            console.error("Error en confirmRegistration:", error);
            toast.dismiss(loadingToast);
            toast.error("Error al registrar afiliado", {
                description: "Ha ocurrido un error al procesar la solicitud.",
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const cerrarModal = () => {
        if (isLoading) return;
        setIsCrear(false);
    };
    const handleDependientesChange = (values) => {
        const valuesStr = (values || []).map(String);
        console.log("Selected dependientes:", valuesStr);
        if (numDep > 0 && valuesStr.length > numDep) {
            const next = valuesStr.slice(0, numDep);
            toast.warning(`Solo puedes seleccionar ${numDep} dependiente(s).`);
            setDependientesSeleccionados(next);
        } else {
            setDependientesSeleccionados(valuesStr);
        }
    };
    const PasoSeleccionEmpleadoPlan = (
        <Card>
            <div className="space-y-4">
                <div>
                    <label className={labelStyles}>
                        <User className="h-4 w-4" />
                        Empleado
                    </label>

                    <Select
                        style={selectStyles}
                        value={empleadoSeleccionado?.idEmpleado?.toString()}
                        onChange={handleEmpleadoChange}
                        placeholder="Buscar empleado..."
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                            option?.label?.toLowerCase().includes(input.toLowerCase())
                        }
                        options={empleados.map((empleado) => ({
                            value: empleado.idEmpleado.toString(),
                            label: `${empleado.nombreCompleto} - ${empleado.documento}`,
                        }))}
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className={labelStyles}>
                        <CreditCard className="h-4 w-4" />
                        Seleccione Plan
                    </label>
                    <Select
                        style={selectStyles}
                        value={data.plan}
                        onChange={(value) => {

                            console.log("WWWWWWWWWWWWWWWWWWWWWWW", value)
                            setData((prev) => ({
                                ...prev,
                                plan: value,
                                montoPlan: getPlanMonto(value),
                            }))
                        }
                        }
                        placeholder="💰 Seleccione un plan"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children ?? "").toString().toLowerCase().includes(input.toLowerCase())
                        }
                        disabled={isLoading}
                    >
                        {planEPS?.map((plan) => (
                            <Option key={plan.idPlanEPS} value={`${plan.nombrePlan} - ${plan.tipo}`}>
                                {plan.nombrePlan} - {plan.tipo}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div>
                    <label htmlFor="monto" className={labelStyles}>
                        Monto del Plan
                    </label>
                    <Input
                        disabled
                        value={`S/ ${Number(data.montoPlan ?? 0).toLocaleString("es-PE")}`}
                        className={`${inputStyles} font-bold text-green-600 dark:text-green-400`}
                        style={{ borderColor: "#10b981" }}
                    />
                </div>
            </div>
        </Card>
    );

    const PasoDependientes = (
        <Card>
            <div className="space-y-4 h-[95vh] ">
                <label className={labelStyles}>
                    <Users className="h-4 w-4" />
                    Seleccione dependientes
                </label>
                <Tabs defaultValue="seleccionar">
                    <TabsList>
                        <TabsTrigger value="seleccionar">
                            <Users className="h-4 w-4" />
                            Seleccionar Previos
                        </TabsTrigger>
                        <TabsTrigger value="agregar">
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Nuevo
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="seleccionar">
                        <Card>
                            <CardContent className="grid gap-6">
                                <Select
                                    mode="multiple"
                                    style={{ width: "100%", minHeight: 44 }}
                                    placeholder={dependientesLoading ? "Cargando..." : "Selecciona dependientes..."}
                                    value={dependientesSeleccionados}
                                    onChange={(vals) => handleDependientesChange(vals)}
                                    options={dependientesOptions}
                                    optionFilterProp="label"
                                    showSearch
                                    allowClear
                                    loading={dependientesLoading}
                                    disabled={isLoading || dependientesLoading}
                                />
                                {dependientesOptions.length === 0 && !dependientesLoading && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                        No hay dependientes disponibles para este afiliado.
                                    </div>
                                )}

                            </CardContent>
                            <CardFooter>
                                <div className=" text-sm text-gray-600 dark:text-gray-300">
                                    Seleccionados:{" "}
                                    <b>
                                        {dependientesSeleccionados.length}/{numDep}
                                    </b>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="agregar">
                        <Card>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    <FormField label="Plan Asociado" value={nuevoDependiente.plan} disabled />

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
                                    {/*
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
                                    */}
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-center pt-4">
                                <Button
                                    type="button"
                                    className="bg-green-600 hover:bg-green-700 px-8 py-2 rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Registrar Dependiente
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </Card>
    );

    const PasoResumen = (
        <Card>
            <div className="space-y-4">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                    Revisa la información antes de registrar:
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between gap-3">
                        <span className="font-semibold">Empleado:</span>
                        <span className="text-right">{empleadoSeleccionado?.nombreCompleto ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="font-semibold">Documento:</span>
                        <span className="text-right">{empleadoSeleccionado?.documento ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="font-semibold">Plan:</span>
                        <span className="text-right">{planLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="font-semibold">Tipo:</span>
                        <span className="text-right">{tipoLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="font-semibold">Monto:</span>
                        <span className="text-green-600 font-bold text-right">
                            S/ {Number(data.montoPlan ?? 0).toLocaleString("es-PE")}
                        </span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="font-semibold">Dependientes:</span>
                        <span className="text-right">
                            <Tag color="blue">{dependientesSeleccionados.length}</Tag>
                        </span>
                    </div>
                </div>

                {dependientesSeleccionados.length > 0 && (
                    <div className="text-sm">
                        <div className="font-semibold mb-2">Seleccionados:</div>
                        <div className="flex flex-col flex-wrap gap-2 border-y-2 ">
                            {dependientesSeleccionados.map((id) => {
                                const opt = dependientesOptions.find((o) => o.value === id);
                                return (
                                    <div className="flex justify-between items-center py-1">
                                        <p>{opt?.label}</p>
                                        <Select
                                            className="w-1/2"
                                            value={nuevoDependiente.parentesco}
                                            onChange={(value) => handleInputChange("parentesco", value)}
                                            options={[
                                                { label: "Cónyuge", value: "CONYUGUE" },
                                                { label: "Hijo/a", value: "HIJO" },
                                            ]}
                                            placeholder={`Seleccione Dependiente`}
                                            getPopupContainer={(trigger) => trigger.parentNode}
                                            optionFilterProp="label"
                                            showSearch
                                            allowClear
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500">
                    Al confirmar, se registrará el afiliado con la configuración indicada.
                </div>
            </div>
        </Card>
    );

    const contenidoPaso = useMemo(() => {
        if (pasoActual === 0) return PasoSeleccionEmpleadoPlan;
        if (pasoActual === 1) return PasoDependientes;
        return PasoResumen;
    }, [pasoActual, PasoSeleccionEmpleadoPlan, PasoDependientes, PasoResumen]);

    const tituloPaso = useMemo(() => {
        if (pasoActual === 0) return "Seleccionar Empleado y Plan";
        if (pasoActual === 1) return "Dependientes";
        return "Resumen";
    }, [pasoActual]);

    return (
        <>
            <Modal
                open={isCrear}
                title={
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Crear Nuevo Afiliado
                            </h1>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tituloPaso}
                        </p>
                    </div>
                }
                style={{ top: "2vh" }}
                onCancel={cerrarModal}
                width={700}
                footer={null}
                closable={!isLoading}
                maskClosable={!isLoading}
            >
                <div className="space-y-4">
                    <Steps
                        current={pasoActual}
                        items={[
                            { title: "Empleado - Plan" },
                            { title: "Dependientes" },
                            { title: "Resumen" },
                        ]}
                    />

                    <div className="max-h-[60vh] overflow-y-auto p-4">{contenidoPaso}</div>

                    {/* Footer (botones wizard) */}
                    <div className="flex justify-between gap-3 mt-2 px-2">
                        <Button
                            variant="outline"
                            onClick={pasoActual === 0 ? cerrarModal : handleBack}
                            className="px-8 py-2 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                            disabled={isLoading}
                        >
                            {pasoActual === 0 ? "Cancelar" : "Atrás"}
                        </Button>

                        {pasoActual < 2 ? (
                            <Button
                                onClick={handleNext}
                                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={isLoading}
                            >
                                Siguiente
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinish}
                                className="px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
                                    </span>
                                ) : (
                                    "Registrar"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modal Confirmación */}
            <Modal
                open={showConfirmModal}
                title={
                    <div className="flex items-center gap-3 text-blue-600">
                        <UserPlus className="h-6 w-6" />
                        <span className="text-lg font-semibold">Confirmar Registro</span>
                    </div>
                }
                onCancel={() => setShowConfirmModal(false)}
                footer={[
                    <Button
                        key="cancel"
                        variant="outline"
                        onClick={() => setShowConfirmModal(false)}
                        className="px-6"
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>,
                    <Button
                        key="confirm"
                        onClick={confirmRegistration}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading}
                    >
                        Confirmar Registro
                    </Button>,
                ]}
                width={520}
            >
                <div className="space-y-4 py-4">
                    <p className="text-gray-700">
                        ¿Está seguro de que desea registrar al siguiente empleado como afiliado?
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="font-semibold">Empleado:</span>
                            <span>{empleadoSeleccionado?.nombreCompleto}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Documento:</span>
                            <span>{empleadoSeleccionado?.documento}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Plan:</span>
                            <span>{planLabel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Tipo:</span>
                            <span>{tipoLabel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Monto:</span>
                            <span className="text-green-600 font-bold">
                                S/ {Number(data.montoPlan ?? 0).toLocaleString("es-PE")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Dependientes:</span>
                            <span>{numDep}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        Esta acción registrará al empleado en el sistema de afiliados con el plan seleccionado.
                    </p>
                </div>
            </Modal>
        </>
    );
};

ModalRegistroAfiliado.propTypes = {
    isCrear: PropTypes.bool.isRequired,
    setIsCrear: PropTypes.func.isRequired,
    afiliados: PropTypes.array,
};
