import { UbigeoPicker } from "@/components/Direccion";
import { Input, DatePicker, Select, Card, Divider, Modal } from "antd";
import { useState, useMemo } from "react";
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
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/provider/Provider";

const { Option } = Select;

export const RegistroEspecial = () => {
    const [ubigeo, setUbigeo] = useState({});
    const { planEPS } = useData();
    const [data, setData] = useState({
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNac: null,
        edad: "",
        sexo: "",
        tipoDocumento: "DNI",
        numeroDocumento: "",
        plan: "BASE PEAS",
        montoPlan: 500,
        celular: "",
        email: "",
        estadoCivil: "",
        direccion: "",
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Función para calcular edad
    const computeAge = (d) => {
        if (!d || !dayjs.isDayjs(d)) return "";
        const now = dayjs();
        let age = now.year() - d.year();
        if (now.month() < d.month() || (now.month() === d.month() && now.date() < d.date())) {
            age -= 1;
        }
        return String(Math.max(age, 0));
    };

    // Funciones de limpieza
    const cleanOnlyDigits = (v) => (v || "").replace(/\D/g, "");
    const cleanAlphaNum = (v) => (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cleanNames = (v) => (v || "").replace(/\s+/g, " ").trim();

    // Validaciones mejoradas
    const validar = () => {
        const errs = [];
        // Información personal
        if (!data.nombres.trim()) errs.push("Nombres es requerido");
        if (!data.apellidoPaterno.trim()) errs.push("Apellido paterno es requerido");
        if (!data.apellidoMaterno.trim()) errs.push("Apellido materno es requerido");

        // Fecha de nacimiento y edad
        if (!data.fechaNac) {
            errs.push("Fecha de nacimiento es requerida");
        } else {
            const edadCalc = computeAge(data.fechaNac);
            if (edadCalc === "" || Number.isNaN(Number(edadCalc))) {
                errs.push("Fecha de nacimiento no válida");
            } else if (data.edad && String(data.edad) !== edadCalc) {
                errs.push(`Edad inconsistente. Debería ser ${edadCalc} años`);
            }
        }
        // Sexo
        if (!data.sexo) errs.push("Sexo es requerido");
        // Documento
        if (!data.tipoDocumento) errs.push("Tipo de documento es requerido");
        if (!data.numeroDocumento) {
            errs.push(`Número de ${data.tipoDocumento} es requerido`);
        } else {
            if (data.tipoDocumento === "DNI" && !/^\d{8}$/.test(data.numeroDocumento)) {
                errs.push("DNI debe tener 8 dígitos");
            }
            if (data.tipoDocumento === "CE" && !/^[A-Z0-9]{9,12}$/i.test(data.numeroDocumento)) {
                errs.push("CE debe ser alfanumérico (9-12 caracteres)");
            }
            if (data.tipoDocumento === "PASAPORTE" && !/^[A-Z0-9]{6,12}$/i.test(data.numeroDocumento)) {
                errs.push("Pasaporte debe ser alfanumérico (6-12 caracteres)");
            }
        }
        // Plan
        if (!data.plan) errs.push("Plan es requerido");
        // Ubigeo
        if (!ubigeo?.departamentoId) errs.push("Departamento es requerido");
        if (!ubigeo?.provinciaId) errs.push("Provincia es requerida");
        if (!ubigeo?.distritoId) errs.push("Distrito es requerido");
        // Contacto
        if (!/^9\d{8}$/.test(data.celular)) {
            errs.push("Celular debe tener 9 dígitos y empezar con 9");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errs.push("Email no válido");
        }
        if (!data.direccion || data.direccion.trim().length < 5) {
            errs.push("Dirección requerida (mínimo 5 caracteres)");
        }
        return errs;
    };

    // Plan seleccionado
    const planSeleccionado = useMemo(() =>
        planEPS.find(p => p.value === data.plan) || planEPS[0],
        [data.plan]
    );

    const handleSubmit = () => {
        const errors = validar();
        if (errors.length > 0) {
            toast.error("Error en el formulario", {
                description: errors[0],
                duration: 5000,
            });
            return;
        }

        // Mostrar modal de confirmación
        setShowConfirmModal(true);
    };

    const confirmRegistration = async () => {
        setShowConfirmModal(false);
        setIsLoading(true);

        // Mostrar toast de carga
        const loadingToast = toast.loading("Registrando afiliado...", {
            duration: Infinity,
        });

        try {
            // Simular llamada a la API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Preparar datos para envío
            const datosEnvio = {
                ...data,
                fechaNac: data.fechaNac ? data.fechaNac.format("YYYY-MM-DD") : null,
                edad: data.edad || computeAge(data.fechaNac),
                departamento: ubigeo?.departamento,
                provincia: ubigeo?.provincia,
                distrito: ubigeo?.distrito,
                ubigeoId: ubigeo?.distritoId,
            };

            console.log("Datos a enviar:", datosEnvio);

            // Aquí iría tu llamada real a la API
            // await axios.post('/api/registrar-afiliado-especial', datosEnvio);

            // Cerrar toast de carga
            toast.dismiss(loadingToast);

            // Mostrar toast de éxito
            toast.success("Afiliado registrado correctamente", {
                description: `Se ha registrado a ${data.nombres} ${data.apellidoPaterno} en el plan ${planSeleccionado.label}`,
                duration: 4000,
            });

            // Resetear formulario
            setData({
                nombres: "",
                apellidoPaterno: "",
                apellidoMaterno: "",
                fechaNac: null,
                edad: "",
                sexo: "",
                tipoDocumento: "DNI",
                numeroDocumento: "",
                plan: "BASE PEAS",
                montoPlan: 500,
                celular: "",
                email: "",
                estadoCivil: "",
                direccion: "",
            });
            setUbigeo({});

        } catch (error) {
            // Cerrar toast de carga
            toast.dismiss(loadingToast);

            // Mostrar toast de error
            toast.error("❌ Error al registrar afiliado", {
                description: "Ha ocurrido un error al procesar la solicitud.",
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Estilos consistentes
    const inputStyles = "w-full";
    const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
    const sectionStyles = "space-y-4";

    return (
        <>
            <Card
                title={
                    <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold text-blue-900">REGISTRO ESPECIAL</span>
                    </div>
                }
                className="shadow-lg border-0"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna Izquierda - Información Personal */}
                    <div className={sectionStyles}>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <IdCard className="h-5 w-5" />
                                Información Personal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 space-x-4 space-y-1">
                                <div>
                                    <label htmlFor="nombres" className={labelStyles}>Nombres</label>
                                    <Input
                                        prefix={<User className="text-gray-400" size={16} />}
                                        value={data.nombres}
                                        onChange={(e) => setData(s => ({ ...s, nombres: e.target.value.toUpperCase() }))}
                                        onBlur={(e) => setData(s => ({ ...s, nombres: cleanNames(e.target.value) }))}
                                        placeholder="Ingrese nombres completos"
                                        className={inputStyles}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="apellidoPaterno" className={labelStyles}>Apellido Paterno</label>
                                    <Input
                                        value={data.apellidoPaterno}
                                        onChange={(e) => setData(s => ({ ...s, apellidoPaterno: e.target.value.toUpperCase() }))}
                                        onBlur={(e) => setData(s => ({ ...s, apellidoPaterno: cleanNames(e.target.value) }))}
                                        placeholder="Apellido paterno"
                                        className={inputStyles}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="apellidoMaterno" className={labelStyles}>Apellido Materno</label>
                                    <Input
                                        value={data.apellidoMaterno}
                                        onChange={(e) => setData(s => ({ ...s, apellidoMaterno: e.target.value.toUpperCase() }))}
                                        onBlur={(e) => setData(s => ({ ...s, apellidoMaterno: cleanNames(e.target.value) }))}
                                        placeholder="Apellido materno"
                                        className={inputStyles}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fechaNacimiento" className={labelStyles}>Fecha de Nacimiento</label>
                                    <DatePicker
                                        prefix={<Calendar className="text-gray-400" size={16} />}
                                        className={inputStyles}
                                        format="DD/MM/YYYY"
                                        value={data.fechaNac}
                                        onChange={(d) => setData(s => ({
                                            ...s,
                                            fechaNac: d,
                                            edad: d ? computeAge(d) : "",
                                        }))}
                                        placeholder="DD/MM/AAAA"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edad" className={labelStyles}>Edad</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={120}
                                        value={data.edad}
                                        className={inputStyles}
                                        suffix="años"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="sexo" className={labelStyles}>Sexo</label>
                                    <Select
                                        className={inputStyles}
                                        placeholder="Seleccione sexo"
                                        value={data.sexo}
                                        onChange={(value) => setData(s => ({ ...s, sexo: value }))}
                                        disabled={isLoading}
                                    >
                                        <Option value="MASCULINO">Masculino</Option>
                                        <Option value="FEMENINO">Femenino</Option>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="celular" className={labelStyles}>
                                        <Phone className="inline mr-1" size={14} />
                                        Celular
                                    </label>
                                    <Input
                                        value={data.celular}
                                        onChange={(e) => setData(s => ({ ...s, celular: cleanOnlyDigits(e.target.value) }))}
                                        maxLength={9}
                                        placeholder="9XXXXXXXX"
                                        className={inputStyles}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className={labelStyles}>
                                        <Mail className="inline mr-1" size={14} />
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData(s => ({ ...s, email: e.target.value.trim() }))}
                                        placeholder="correo@ejemplo.com"
                                        className={inputStyles}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="estadoCivil" className={labelStyles}>
                                        <Heart className="inline mr-1" size={14} />
                                        Estado Civil
                                    </label>
                                    <Select
                                        className={inputStyles}
                                        placeholder="Seleccione estado civil"
                                        value={data.estadoCivil}
                                        onChange={(value) => setData(s => ({ ...s, estadoCivil: value }))}
                                        disabled={isLoading}
                                    >
                                        <Option value="SOLTERO">Soltero</Option>
                                        <Option value="CASADO">Casado</Option>
                                        <Option value="DIVORCIADO">Divorciado</Option>
                                        <Option value="VIUDO">Viudo</Option>
                                        <Option value="CONVIVIENTE">Conviviente</Option>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <IdCard className="h-5 w-5" />
                                Documento de Identidad
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 space-x-4 space-y-1">
                                <div>
                                    <label htmlFor="tipoDocumento" className={labelStyles}>Tipo de Documento</label>
                                    <Select
                                        className={inputStyles}
                                        value={data.tipoDocumento}
                                        onChange={(value) => setData(s => ({
                                            ...s,
                                            tipoDocumento: value,
                                            numeroDocumento: "",
                                        }))}
                                        disabled={isLoading}
                                    >
                                        <Option value="DNI">DNI</Option>
                                        <Option value="CE">Carnet Extranjería</Option>
                                        <Option value="PASAPORTE">Pasaporte</Option>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="documento" className={labelStyles}>N° de Documento</label>
                                    <Input
                                        value={data.numeroDocumento}
                                        onChange={(e) => setData(s => ({
                                            ...s,
                                            numeroDocumento: s.tipoDocumento === "DNI"
                                                ? cleanOnlyDigits(e.target.value)
                                                : cleanAlphaNum(e.target.value),
                                        }))}
                                        maxLength={data.tipoDocumento === "DNI" ? 8 : 12}
                                        placeholder={`Ingrese ${data.tipoDocumento}`}
                                        className={inputStyles}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha - Información Adicional */}
                    <div className={sectionStyles}>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Plan de Afiliación
                            </h3>
                            <div className="grid grid-cols-1 space-x-4 space-y-1">
                                <div>
                                    <label htmlFor="plan" className={labelStyles}>Seleccione Plan</label>
                                    <Select
                                        className={inputStyles}
                                        value={data.plan}
                                        onChange={(value) => setData(s => ({
                                            ...s,
                                            plan: value,
                                            montoPlan: planEPS.find(p => p.value === value)?.monto ?? s.montoPlan,
                                        }))}
                                        disabled={isLoading}
                                    >
                                        {planEPS.map(plan => (
                                            <Option key={plan.value} value={plan.value}>
                                                {plan.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="monto" className={labelStyles}>Monto del Plan</label>
                                    <Input
                                        disabled
                                        value={`S/ ${data.montoPlan.toLocaleString('es-PE')}`}
                                        className={inputStyles}
                                        style={{ fontWeight: 'bold', color: '#059669' }}
                                    />
                                </div>

                                {planSeleccionado.descripcion && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            {planSeleccionado.descripcion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Divider />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Ubicación y Contacto
                            </h3>
                            <div className="space-x-4 space-y-1">
                                <UbigeoPicker
                                    value={ubigeo}
                                    onChange={setUbigeo}
                                    dataUrl="/data.json"
                                    className="!grid-cols-1 gap-3"
                                    disabled={isLoading}
                                />
                                <div>
                                    <label htmlFor="direccion" className={labelStyles}>Dirección Completa</label>
                                    <Input.TextArea
                                        value={data.direccion}
                                        onChange={(e) => setData(s => ({ ...s, direccion: e.target.value.trimStart().toUpperCase() }))}
                                        placeholder="Ingrese dirección completa"
                                        rows={3}
                                        className={inputStyles}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de Registro */}
                <div className="flex justify-center mt-8 pt-6 border-t">
                    <Button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 py-3 h-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 border-0"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                REGISTRANDO...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                REGISTRAR AFILIADO
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Modal de Confirmación */}
            <Modal
                open={showConfirmModal}
                title={
                    <div className="flex items-center gap-3 text-blue-600">
                        <CheckCircle className="h-6 w-6" />
                        <span className="text-lg font-semibold">Confirmar Registro</span>
                    </div>
                }
                onCancel={() => setShowConfirmModal(false)}
                footer={(
                    <Button
                        variant=""
                        onClick={confirmRegistration}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Procesando...
                            </>
                        ) : (
                            "Confirmar Registro"
                        )}
                    </Button>
                )}
                width={600}
            >
                <div className="py-2">
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <p className="text-blue-700 font-medium">
                            ¿Está seguro de que desea registrar al siguiente afiliado?
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold text-gray-600">Nombre completo:</span>
                                <p className="text-gray-800">{data.nombres} {data.apellidoPaterno} {data.apellidoMaterno}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Documento:</span>
                                <p className="text-gray-800">{data.tipoDocumento}: {data.numeroDocumento}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Edad:</span>
                                <p className="text-gray-800">{data.edad} años</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold text-gray-600">Plan:</span>
                                <p className="text-gray-800">{planSeleccionado.label}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Monto:</span>
                                <p className="text-green-600 font-bold">S/ {data.montoPlan.toLocaleString('es-PE')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Contacto:</span>
                                <p className="text-gray-800">{data.celular} | {data.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Esta acción registrará al afiliado en el sistema con el plan seleccionado.
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
};