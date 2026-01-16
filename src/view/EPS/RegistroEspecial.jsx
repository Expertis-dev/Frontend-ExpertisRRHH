import { UbigeoPicker } from "@/components/Direccion";
import { Input, DatePicker, Select, Card, Divider, Modal, Steps, Tag } from "antd";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    IdCard,
    Heart,
    CreditCard,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2,
    Users,
    Plus,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/provider/Provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField, DateField, SelectField } from "./DetalleAfiliado";
import axios from "axios";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Option } = Select;

const emptyNuevoDependiente = {
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: null,
    tipoDocumento: "DNI",
    numeroDocumento: "",
    sexo: "",
    parentesco: "",
};

export const RegistroEspecial = () => {
    const [ubigeo, setUbigeo] = useState({});
    const { planEPS } = useData();
    const [pasoActual, setPasoActual] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Estado del Titular
    const [data, setData] = useState({
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNac: null,
        edad: "",
        sexo: "",
        tipoDocumento: "DNI",
        numeroDocumento: "",
        plan: "",
        montoPlan: 0,
        celular: "",
        email: "",
        estadoCivil: "",
        direccion: "",
        periodo: null,
    });

    // Estados de Dependientes
    const [numDep, setNumDep] = useState(0);
    const [activeTab, setActiveTab] = useState("seleccionar");
    const [nuevoDependiente, setNuevoDependiente] = useState(emptyNuevoDependiente);
    const [dependientesSeleccionados, setDependientesSeleccionados] = useState([]);
    const [dependientesOptions, setDependientesOptions] = useState([]);
    const [dependientesLoading, setDependientesLoading] = useState(false);
    const [parentescos, setParentescos] = useState({});

    // Cargar dependientes previos al iniciar
    useEffect(() => {
        fetchDependientes();
    }, []);

    const fetchDependientes = async () => {
        setDependientesLoading(true);
        try {
            const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarHistoricoAfiliadosEPS`);
            const lista = resp.data?.recordset ?? resp.data ?? [];
            const options = lista.map((d) => ({
                value: String(d.idAfiliadoEPS || d.idAfiliado || d.numeroDocumento),
                label: `${d.nombreAfiliado || d.nombreCompleto}${d.parentesco ? ` (${d.parentesco})` : ""}`,
            }));
            setDependientesOptions(options);
        } catch (e) {
            console.error("Error fetchDependientes:", e);
            toast.error("No se pudieron cargar los dependientes previos");
        } finally {
            setDependientesLoading(false);
        }
    };

    const computeAge = (d) => {
        if (!d || !dayjs.isDayjs(d)) return "";
        const now = dayjs();
        let age = now.year() - d.year();
        if (now.month() < d.month() || (now.month() === d.month() && now.date() < d.date())) {
            age -= 1;
        }
        return String(Math.max(age, 0));
    };

    const handlePlanChange = (value) => {
        const planObj = planEPS.find(p => `${p.nombrePlan} - ${p.tipo}` === value);
        if (planObj) {
            // Extraer número de dependientes del tipo (ej: "TITULAR + 1")
            const match = planObj.tipo.match(/\d+/);
            setNumDep(match ? parseInt(match[0]) : 0);
            setData(s => ({
                ...s,
                plan: value,
                montoPlan: planObj.costo || planObj.monto || 0
            }));
        }
    };

    const handleInputChangeDependiente = (field, value) => {
        if (field === "fechaNacimiento") {
            const formatted = value ? dayjs(value, "DD/MM/YYYY").format("YYYY-MM-DD") : null;
            setNuevoDependiente((p) => ({ ...p, [field]: formatted }));
            return;
        }
        setNuevoDependiente((p) => ({ ...p, [field]: value }));
    };

    const handleRegistrarNuevoDependiente = async () => {
        if (!nuevoDependiente.nombre || !nuevoDependiente.numeroDocumento || !nuevoDependiente.sexo) {
            toast.error("Complete los campos obligatorios del dependiente");
            return;
        }
        const payload = {
            DOCUMENTO: nuevoDependiente.numeroDocumento,
            nombres: nuevoDependiente.nombre.trim().toUpperCase(),
            apellidos: `${nuevoDependiente.apellidoPaterno} ${nuevoDependiente.apellidoMaterno}`.trim().toUpperCase(),
            fecNacimiento: nuevoDependiente.fechaNacimiento,
            sexo: nuevoDependiente.sexo === "MASCULINO" ? "MASCULINO" : "FEMENINO"
        };

        const loadingToast = toast.loading("Registrando dependiente...");
        try {
            console.log("PAYLOAD REGISTRO DEPENDIENTE NUEVO:", payload);
            const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/registrarDependiente`, payload);
            // Capturamos con la misma prioridad que el listado para asegurar compatibilidad con la asociación
            const newId = resp.data?.idAfiliadoEPS || resp.data?.idAfiliado || resp.data?.recordset?.[0]?.idAfiliadoEPS || resp.data?.recordset?.[0]?.idAfiliado || payload.DOCUMENTO;

            toast.dismiss(loadingToast);
            toast.success("Dependiente registrado exitosamente");

            const newKey = String(newId);
            setDependientesOptions(prev => [{ value: newKey, label: `${payload.nombres} (NUEVO)` }, ...prev]);
            setDependientesSeleccionados(prev => {
                if (numDep > 0 && prev.length >= numDep) {
                    toast.warning(`Ya has alcanzado el límite de ${numDep} dependientes.`);
                    return prev;
                }
                return [...prev, newKey];
            });
            setNuevoDependiente(emptyNuevoDependiente);
            setActiveTab("seleccionar");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error al registrar dependiente");
        }
    };

    const validarPaso0 = () => {
        if (!data.nombres || !data.apellidoPaterno || !data.numeroDocumento || !data.plan || !data.periodo) {
            toast.error("Complete los campos obligatorios del titular");
            return false;
        }
        if (!ubigeo.distritoId) {
            toast.error("Seleccione la ubicación completa");
            return false;
        }
        return true;
    };

    const validarPaso1 = () => {
        if (numDep > 0 && dependientesSeleccionados.length !== numDep) {
            toast.error(`Debe seleccionar exactamente ${numDep} dependiente(s) para este plan.`);
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (pasoActual === 0 && !validarPaso0()) return;
        if (pasoActual === 1 && !validarPaso1()) return;
        setPasoActual(p => p + 1);
    };

    const confirmRegistration = async () => {
        setShowConfirmModal(false);
        setIsLoading(true);
        const loadingToast = toast.loading("Procesando registro especial...");

        try {
            const planObj = planEPS.find(p => `${p.nombrePlan} - ${p.tipo}` === data.plan);

            // 1. Payload Titular Especial para app.usp_registrarTitularEspecial_AfiliadoEPS
            const payloadTitular = {
                tipo_documento: data.tipoDocumento,
                DOCUMENTO: data.numeroDocumento,
                nombres: data.nombres.trim().toUpperCase(),
                apePaterno: data.apellidoPaterno.trim().toUpperCase(),
                apeMaterno: data.apellidoMaterno.trim().toUpperCase(),
                fecNacimiento: data.fechaNac.format("YYYY-MM-DD"),
                sexo: data.sexo,
                celular: data.celular,
                email: data.email,
                estadoCivil: data.estadoCivil,
                idPlan: planObj?.idPlanEPS,
                departamento: ubigeo.departamento,
                provincia: ubigeo.provincia,
                distrito: ubigeo.distrito,
                direccion: data.direccion.trim().toUpperCase(),
                mesInicio: data.periodo
            };

            // Registro del Titular Especial
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/registrarTitularEspecialEPS`, payloadTitular);
            console.log("RESPUESTA REGISTRO TITULAR:", response.data);

            // 2. Asociar dependientes
            for (const depId of dependientesSeleccionados) {
                const payloadAsoc = {
                    DOCUMENTO_TITULAR: data.numeroDocumento,
                    idEmpleado: null, // Requerido como null para Especiales
                    idPlan: planObj?.idPlanEPS,
                    mesInicio: data.periodo,
                    idAfiliadoDependiente: depId,
                    parentesco: parentescos[depId] || "HIJO",
                    tipoRegistro: "E"
                };
                console.log(`PAYLOAD ASOCIACIÓN DEPENDIENTE ESPECIAL ${depId}:`, payloadAsoc);
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/asosciarDependiente`, payloadAsoc);
            }

            toast.dismiss(loadingToast);
            toast.success("Registro Especial completado con éxito");
            setPasoActual(0);
            setData({ /* reset values */ });
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error en el registro especial");
        } finally {
            setIsLoading(false);
        }
    };

    // Vistas de Pasos
    const PasoTitular = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-blue-700 border-b pb-2">
                    <User size={18} /> Datos Personales
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="text-xs font-semibold">Nombres *</label>
                        <Input value={data.nombres} onChange={e => setData(s => ({ ...s, nombres: e.target.value.toUpperCase() }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Ap. Paterno *</label>
                        <Input value={data.apellidoPaterno} onChange={e => setData(s => ({ ...s, apellidoPaterno: e.target.value.toUpperCase() }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Ap. Materno *</label>
                        <Input value={data.apellidoMaterno} onChange={e => setData(s => ({ ...s, apellidoMaterno: e.target.value.toUpperCase() }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Fecha Nac. *</label>
                        <DatePicker className="w-full" format="DD/MM/YYYY" value={data.fechaNac} onChange={d => setData(s => ({ ...s, fechaNac: d, edad: computeAge(d) }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Edad</label>
                        <Input disabled value={data.edad} suffix="años" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Sexo *</label>
                        <Select className="w-full" value={data.sexo} onChange={v => setData(s => ({ ...s, sexo: v }))}>
                            <Option value="MASCULINO">Masculino</Option>
                            <Option value="FEMENINO">Femenino</Option>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Estado Civil</label>
                        <Select className="w-full" value={data.estadoCivil} onChange={v => setData(s => ({ ...s, estadoCivil: v }))}>
                            <Option value="SOLTERO">Soltero</Option>
                            <Option value="CASADO">Casado</Option>
                            <Option value="CONVIVIENTE">Conviviente</Option>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-blue-700 border-b pb-2">
                    <CreditCard size={18} /> Plan y Ubicación
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold">Tipo Doc. *</label>
                        <Select className="w-full" value={data.tipoDocumento} onChange={v => setData(s => ({ ...s, tipoDocumento: v }))}>
                            <Option value="DNI">DNI</Option>
                            <Option value="CE">CE</Option>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold">N° Documento *</label>
                        <Input value={data.numeroDocumento} onChange={e => setData(s => ({ ...s, numeroDocumento: e.target.value }))} maxLength={12} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-semibold">Plan EPS *</label>
                        <Select className="w-full" value={data.plan} onChange={handlePlanChange}>
                            {planEPS.map(p => (
                                <Option key={p.idPlanEPS} value={`${p.nombrePlan} - ${p.tipo}`}>
                                    {p.nombrePlan} - {p.tipo}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Período *</label>
                        <DatePicker picker="month" className="w-full" format="MMMM YYYY" value={data.periodo ? dayjs(data.periodo) : null}
                            onChange={d => setData(s => ({ ...s, periodo: d ? d.startOf('month').format('YYYY-MM-DD') : null }))} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold">Celular</label>
                        <Input value={data.celular} onChange={e => setData(s => ({ ...s, celular: e.target.value }))} maxLength={9} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-semibold">Correo Electrónico</label>
                        <Input value={data.email} onChange={e => setData(s => ({ ...s, email: e.target.value }))} />
                    </div>
                </div>
                <UbigeoPicker value={ubigeo} onChange={setUbigeo} className="!grid-cols-1 gap-2" />
                <div>
                    <label className="text-xs font-semibold">Dirección</label>
                    <Input value={data.direccion} onChange={e => setData(s => ({ ...s, direccion: e.target.value.toUpperCase() }))} />
                </div>
            </div>
        </div>
    );

    const PasoDep = (
        <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                Plan seleccionado requiere: <strong>{numDep} dependientes.</strong>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="seleccionar">Seleccionar Existente</TabsTrigger>
                    <TabsTrigger value="agregar">Registrar Nuevo</TabsTrigger>
                </TabsList>

                <TabsContent value="seleccionar" className="p-4 bg-white border rounded-b-lg">
                    <div className="space-y-4">
                        <Select
                            mode="multiple"
                            placeholder="Buscar dependientes..."
                            className="w-full"
                            style={{ minHeight: '45px' }}
                            value={dependientesSeleccionados}
                            onChange={vals => setDependientesSeleccionados(vals.slice(0, numDep))}
                            options={dependientesOptions}
                            showSearch
                            optionFilterProp="label"
                        />
                        {dependientesSeleccionados.length > 0 && (
                            <div className="space-y-2 border-t pt-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Parentescos:</p>
                                {dependientesSeleccionados.map(id => (
                                    <div key={id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm">{dependientesOptions.find(o => o.value === id)?.label}</span>
                                        <Select
                                            size="small"
                                            placeholder="Parentesco"
                                            className="w-40"
                                            value={parentescos[id]}
                                            onChange={v => setParentescos(p => ({ ...p, [id]: v }))}
                                        >
                                            <Option value="CONYUGUE">Cónyuge</Option>
                                            <Option value="HIJO">Hijo/a</Option>
                                            <Option value="PADRE">Padre</Option>
                                            <Option value="MADRE">Madre</Option>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="agregar" className="p-4 bg-white border rounded-b-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormField label="Nombre *" value={nuevoDependiente.nombre} onChange={v => handleInputChangeDependiente("nombre", v)} />
                        <FormField label="Ap. Paterno *" value={nuevoDependiente.apellidoPaterno} onChange={v => handleInputChangeDependiente("apellidoPaterno", v)} />
                        <FormField label="Ap. Materno *" value={nuevoDependiente.apellidoMaterno} onChange={v => handleInputChangeDependiente("apellidoMaterno", v)} />
                        <DateField label="Fec. Nacimiento *" value={nuevoDependiente.fechaNacimiento ? dayjs(nuevoDependiente.fechaNacimiento) : null} onChange={v => handleInputChangeDependiente("fechaNacimiento", v)} />
                        <FormField label="N° Documento *" value={nuevoDependiente.numeroDocumento} onChange={v => handleInputChangeDependiente("numeroDocumento", v)} />
                        <SelectField label="Sexo *" value={nuevoDependiente.sexo} onChange={v => handleInputChangeDependiente("sexo", v)} options={[{ label: "Masculino", value: "MASCULINO" }, { label: "Femenino", value: "FEMENINO" }]} />
                        <div className="md:col-span-full flex justify-center pt-4">
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-10" onClick={handleRegistrarNuevoDependiente}>
                                <Plus className="mr-2 h-4 w-4" /> Registrar y Añadir
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    const PasoResumen = (
        <div className="max-w-2xl mx-auto space-y-4">
            <Card className="bg-blue-50 border-blue-200">
                <h4 className="font-bold border-b border-blue-200 pb-2 mb-2 flex items-center gap-2">
                    <User size={16} /> Titular del Registro Especial
                </h4>
                <div className="grid grid-cols-2 text-sm gap-y-1">
                    <span className="text-gray-500">Nombre:</span>
                    <span className="font-medium">{data.nombres} {data.apellidoPaterno}</span>
                    <span className="text-gray-500">Documento:</span>
                    <span className="font-medium">{data.tipoDocumento} {data.numeroDocumento}</span>
                    <span className="text-gray-500">Plan Asignado:</span>
                    <span className="font-bold text-blue-700">{data.plan}</span>
                    <span className="text-gray-500">Inicio:</span>
                    <span className="font-medium">{data.periodo}</span>
                </div>
            </Card>

            {dependientesSeleccionados.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                    <h4 className="font-bold border-b border-green-200 pb-2 mb-2 flex items-center gap-2 text-green-800">
                        <Users size={16} /> Dependientes Vinculados
                    </h4>
                    <div className="space-y-2">
                        {dependientesSeleccionados.map(id => (
                            <div key={id} className="flex justify-between text-sm bg-white/50 p-2 rounded">
                                <span>{dependientesOptions.find(o => o.value === id)?.label}</span>
                                <Tag color="green">{parentescos[id] || "HIJO"}</Tag>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-700">
                Nota: Al finalizar, este registro se procesará de forma independiente al no ser un empleado activo de la planilla regular.
            </div>
        </div>
    );

    return (
        <div className="w-full flex justify-center py-8 px-4 bg-gray-50/50 min-h-screen">
            <Card className="max-w-6xl w-full shadow-2xl border-t-4 border-t-blue-600 bg-white">
                <div className="mb-8 p-6 bg-white rounded-t-lg border-b">
                    <Steps
                        current={pasoActual}
                        items={[
                            { title: 'Titular Especial', icon: <User size={20} /> },
                            { title: 'Dependientes', icon: <Users size={20} /> },
                            { title: 'Resumen Final', icon: <CheckCircle size={20} /> },
                        ]}
                    />
                </div>

                <div className="min-h-[450px] py-4 px-8">
                    {pasoActual === 0 && PasoTitular}
                    {pasoActual === 1 && PasoDep}
                    {pasoActual === 2 && PasoResumen}
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t font-semibold p-8 bg-gray-50/50 rounded-b-lg">
                    <Button
                        variant="outline"
                        onClick={() => setPasoActual(p => p - 1)}
                        disabled={pasoActual === 0 || isLoading}
                        className="px-6 border-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>

                    {pasoActual < 2 ? (
                        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8 text-white shadow-md transition-all">
                            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={() => setShowConfirmModal(true)} className="bg-green-600 hover:bg-green-700 px-8 text-white shadow-md transition-all" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            FINALIZAR REGISTRO
                        </Button>
                    )}
                </div>

                <Modal
                    open={showConfirmModal}
                    title={
                        <div className="flex items-center gap-2 text-blue-600">
                            <CheckCircle size={20} />
                            <span>¿Confirmar Registro Especial?</span>
                        </div>
                    }
                    onOk={confirmRegistration}
                    onCancel={() => setShowConfirmModal(false)}
                    okText="Sí, procesar"
                    cancelText="Revisar"
                    confirmLoading={isLoading}
                    centered
                >
                    <div className="py-4 text-center">
                        <p className="text-gray-600">
                            Se creará el registro de afiliación especial para <br />
                            <strong className="text-lg text-gray-900">{data.nombres} {data.apellidoPaterno}</strong><br />
                            y sus dependientes seleccionados.
                        </p>
                    </div>
                </Modal>
            </Card>
        </div>
    );
};