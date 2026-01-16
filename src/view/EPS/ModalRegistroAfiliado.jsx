import PropTypes from "prop-types";
import { UserPlus, User, CreditCard, Loader2, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Modal, Select, Card, Steps, Tag, DatePicker } from "antd";
import { useData } from "@/provider/Provider";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Option } = Select;

const emptyNuevoDependiente = {
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: null, // Guardaremos como "YYYY-MM-DD"
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
    const [dependientesFullData, setDependientesFullData] = useState([]); // Nueva: para guardar toda la data cruda
    const [parentescos, setParentescos] = useState({}); // Nueva: para guardar parentesco por cada dependiente seleccionado
    const [activeTab, setActiveTab] = useState("seleccionar"); // Nueva: para controlar el tab activo

    const [data, setData] = useState({
        plan: "",
        montoPlan: 0,
        direccion: "",
        sexo: "M",
        tipoDocumento: "DNI",
        periodo: null,
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
        setDependientesFullData([]);
        setParentescos({});
        setActiveTab("seleccionar");

        setEmpleadoSeleccionado(null);
        setData((prev) => ({
            ...prev,
            plan: planDefault.plan,
            montoPlan: planDefault.monto,
            direccion: "",
            sexo: "M",
            tipoDocumento: "DNI",
            periodo: null,
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
            // value llega como "DD/MM/YYYY" desde el componente DateField
            // Lo guardamos internamente como "YYYY-MM-DD" para facilitar el envío al backend
            const formatted = value ? dayjs(value, "DD/MM/YYYY").format("YYYY-MM-DD") : null;
            setNuevoDependiente((p) => ({ ...p, [field]: formatted }));
            return;
        }
        setNuevoDependiente((p) => ({ ...p, [field]: value }));
    };
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
    const fetchDependientes = async () => {
        setDependientesLoading(true);
        try {
            const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarHistoricoAfiliadosEPS`);
            const lista = resp.data?.recordset ?? resp.data ?? [];
            console.log("LISTA CRUDA DE DEPENDIENTES (desde API):", lista);
            setDependientesFullData(lista); // Guardamos la data completa aquí
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
        const plan = data.plan.split(" - ")[0];
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
        if (!data.periodo) {
            toast.error("Campo requerido", { description: "Debe seleccionar un período" });
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

        // Validar que todos los dependientes seleccionados tengan parentesco
        const faltanParentescos = dependientesSeleccionados.some(id => !parentescos[id]);
        if (faltanParentescos) {
            toast.error("Falta información", { description: "Debe seleccionar el parentesco para todos los dependientes." });
            return;
        }

        setShowConfirmModal(true);
    };

    const handleRegistrarNuevoDependiente = async () => {
        // 1. Validaciones básicas
        if (!nuevoDependiente.nombre || !nuevoDependiente.numeroDocumento || !nuevoDependiente.sexo) {
            toast.error("Complete los campos obligatorios (*)");
            return;
        }

        // 2. Preparar payload según tu SP
        const payload = {
            DOCUMENTO: nuevoDependiente.numeroDocumento,
            nombres: nuevoDependiente.nombre.trim().toUpperCase(),
            apellidos: `${nuevoDependiente.apellidoPaterno} ${nuevoDependiente.apellidoMaterno}`.trim().toUpperCase(),
            // Ya está en formato YYYY-MM-DD en el state
            fecNacimiento: nuevoDependiente.fechaNacimiento,
            sexo: nuevoDependiente.sexo === "MASCULINO" ? "MASCULINO" : "FEMENINO"
        };

        const loadingToast = toast.loading("Registrando persona dependiente...");
        try {
            const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/registrarDependiente`, payload);

            // Capturamos el ID que retorna tu SP
            const newId = resp.data?.idAfiliado || resp.data?.recordset?.[0]?.idAfiliado || payload.DOCUMENTO;

            toast.dismiss(loadingToast);
            toast.success("Dependiente registrado exitosamente");

            // 3. Agregar a la lista usando el ID como Key
            const newKey = String(newId);
            const newOption = {
                value: newKey,
                label: `${payload.nombres} ${payload.apellidos} (NUEVO)`
            };

            setDependientesOptions(prev => [newOption, ...prev]);
            setDependientesFullData(prev => [{
                ...payload,
                idAfiliadoEPS: newId, // Guardamos el ID real como idAfiliadoEPS
                nombreAfiliado: `${payload.nombres} ${payload.apellidos}`,
                documento: payload.DOCUMENTO
            }, ...prev]);

            handleDependientesChange([...dependientesSeleccionados, newKey]);

            // Limpiar formulario de nuevo dependiente
            setNuevoDependiente(emptyNuevoDependiente);

            // Redirigir a la pestaña de "Seleccionar Previos"
            setActiveTab("seleccionar");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error al registrar dependiente", {
                description: error.response?.data?.message || "No se pudo registrar a la persona."
            });
        }
    };

    const confirmRegistration = async () => {
        setShowConfirmModal(false);
        setIsLoading(true);
        const loadingToast = toast.loading("Registrando afiliado...", { duration: Infinity });

        try {
            // Extraer el idPlan del string "nombrePlan - tipo"
            const selectedPlanObj = planEPS?.find(
                (p) => `${p.nombrePlan} - ${p.tipo}` === data.plan
            );

            const payload = {
                Documento: empleadoSeleccionado.documento,
                idEmpleado: empleadoSeleccionado.idEmpleado,
                idPlan: selectedPlanObj?.idPlanEPS,
                mesInicio: data.periodo // Ya está en formato YYYY-MM-01
            };
            console.log("PAYLOAD TITULAR (A enviar a /registrarAfiliadoEPS):", payload);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/registrarAfiliadoEPS`, payload);

            // --- PASO 2: Asociación de Dependientes ---
            if (dependientesSeleccionados.length > 0) {
                for (const depId of dependientesSeleccionados) {
                    const payloadAsoc = {
                        DOCUMENTO_TITULAR: empleadoSeleccionado.documento,
                        idEmpleado: empleadoSeleccionado.idEmpleado,
                        idPlan: selectedPlanObj?.idPlanEPS,
                        mesInicio: data.periodo,
                        idAfiliadoDependiente: depId, // depId ya es el idAfiliado por el getDepKey
                        parentesco: parentescos[depId]
                    };
                    console.log(`PAYLOAD ASOCIACIÓN DEPENDIENTE ${depId} (A enviar a /asosciarDependiente):`, payloadAsoc);
                    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/asosciarDependiente`, payloadAsoc);
                }
            }

            toast.dismiss(loadingToast);
            toast.success("Afiliado registrado correctamente", {
                description: `El empleado ${empleadoSeleccionado.nombreCompleto} ha sido registrado exitosamente.`,
                duration: 4000,
            });

            // Limpiar estados
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
                periodo: null,
            });

            setTimeout(() => {
                setIsCrear(false);
            }, 700);
        } catch (error) {
            console.error("Error en confirmRegistration:", error);
            toast.dismiss(loadingToast);
            toast.error("Error al registrar afiliado", {
                description: error.response?.data?.message || "Ha ocurrido un error al procesar la solicitud.",
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
                <div>
                    <label className={labelStyles}>
                        <Plus className="h-4 w-4" />
                        Período
                    </label>
                    <DatePicker
                        picker="month"
                        style={selectStyles}
                        placeholder="Seleccione Período (Ej: Febrero 2026)"
                        value={data.periodo ? dayjs(data.periodo) : null}
                        onChange={(date) => {
                            setData(prev => ({
                                ...prev,
                                periodo: date ? date.startOf('month').format('YYYY-MM-DD') : null
                            }))
                        }}
                        format="MMMM YYYY"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </Card>
    );

    const PasoDependientes = (
        <Card className="border-0 shadow-none">
            <div className="space-y-2">
                <label className={labelStyles}>
                    <Users className="h-4 w-4" />
                    Seleccione dependientes
                </label>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                        <Card className="border-0 shadow-none">
                            <CardContent className="grid gap-3 p-0">
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
                                                ? dayjs(nuevoDependiente.fechaNacimiento)
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
                            <CardFooter className="flex justify-center pt-2 pb-0">
                                <Button
                                    type="button"
                                    onClick={handleRegistrarNuevoDependiente}
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
                    <div className="flex justify-between gap-3">
                        <span className="font-semibold">CodMes:</span>
                        <span className="text-right font-medium">
                            {data.periodo ?? "-"}
                        </span>
                    </div>
                </div>

                {dependientesSeleccionados.length > 0 && (
                    <div className="text-sm">
                        <div className="font-semibold mb-2">Seleccionadosa:</div>
                        <div className="flex flex-col flex-wrap gap-2 border-y-2 ">
                            {dependientesSeleccionados.map((id) => {
                                const opt = dependientesOptions.find((o) => o.value === id);
                                return (
                                    <div className="flex justify-between items-center py-1">
                                        <p>{opt?.label}</p>
                                        <Select
                                            className="w-1/2"
                                            value={parentescos[id]}
                                            onChange={(value) => setParentescos(prev => ({ ...prev, [id]: value }))}
                                            options={[
                                                { label: "Cónyuge", value: "CONYUGUE" },
                                                { label: "Hijo/a", value: "HIJO" }
                                            ]}
                                            placeholder={`Seleccione Parentesco`}
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

                    {/* Contenedor con scroll para los pasos */}
                    <div className="max-h-[75vh] overflow-y-auto px-4 py-2">{contenidoPaso}</div>

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

                        <div className="flex gap-2">
                            {pasoActual < 2 ? (
                                <Button
                                    onClick={handleNext}
                                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-200 transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    Siguiente
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleFinish}
                                    className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-green-200 transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    Finalizar y Registrar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal de confirmación final */}
            <Modal
                title="Confirmar Registro"
                open={showConfirmModal}
                onOk={confirmRegistration}
                onCancel={() => setShowConfirmModal(false)}
                okText="Sí, Registrar"
                cancelText="Revisar de nuevo"
                confirmLoading={isLoading}
            >
                <p>¿Estás seguro de que deseas registrar este afiliado con los datos proporcionados?</p>
            </Modal>
        </>
    );
};

ModalRegistroAfiliado.propTypes = {
    isCrear: PropTypes.bool.isRequired,
    setIsCrear: PropTypes.func.isRequired,
    afiliados: PropTypes.array,
};
