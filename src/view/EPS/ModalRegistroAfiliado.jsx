import PropTypes from "prop-types";
import { UserPlus, MapPin, User, Calendar, Phone, Mail, CreditCard, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UbigeoPicker } from "@/components/Direccion";
import { useEffect, useState } from "react";
import { Planes } from "../../data/Info";
import axios from "axios";
import { toast } from "sonner";
import { Modal, Select, Card, Divider } from "antd";

const { Option } = Select;

export const ModalRegistroAfiliado = ({ isCrear, setIsCrear }) => {
    const [ubigeo, setUbigeo] = useState({});
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [data, setData] = useState({
        plan: Planes[0]?.value || "",
        montoPlan: Planes[0]?.monto || 0,
        direccion: "",
        sexo: "M",
        tipoDocumento: "DNI",
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Estilos mejorados
    const inputStyles = "w-full p-2 border-0 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400";
    const labelStyles = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2";
    const cardStyles = "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg";

    const selectStyles = {
        width: '100%',
        height: '44px',
    };

    useEffect(() => {
        const ObtenerEmpleado = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`
                );
                const datos = response.data.recordset;

                const dataEmpleados = datos
                    .filter(dato => dato.nombreCompleto !== null)
                    .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

                setEmpleados(dataEmpleados.filter(dato =>
                    String(dato.estadoLaboral).trim().toUpperCase() === "VIGENTE"
                ));
            } catch (error) {
                console.error("Error al obtener empleados:", error);
                toast.error("Error al cargar la lista de empleados");
            }
        }
        ObtenerEmpleado();
    }, []);

    const handleEmpleadoChange = (empleadoId) => {
        const empleado = empleados.find(emp => emp.idEmpleado === parseInt(empleadoId));
        setEmpleadoSeleccionado(empleado);

        if (empleado) {
            const tieneUbicacion = empleado.departamento && empleado.provincia && empleado.distrito;

            if (tieneUbicacion) {
                setUbigeo({
                    departamento: empleado.departamento,
                    provincia: empleado.provincia,
                    distrito: empleado.distrito
                });
            }

            setData(prev => ({
                ...prev,
                direccion: empleado.direccion || "",
            }));

            toast.success(`${empleado.nombreCompleto} seleccionado`);
        }
    };

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return "";
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad.toString();
    };

    const formatearFechaInput = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        return date.toISOString().split('T')[0];
    };

    const handleSubmit = () => {
        if (!empleadoSeleccionado) {
            toast.error("Debe seleccionar un empleado");
            return;
        }
        if (!data.plan) {
            toast.error("Debe seleccionar un plan");
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
            
            // Aquí iría tu llamada real a la API
            // await axios.post('/api/registrar-afiliado', {
            //     empleado: empleadoSeleccionado,
            //     plan: data.plan,
            //     montoPlan: data.montoPlan,
            //     direccion: data.direccion,
            //     sexo: data.sexo,
            //     tipoDocumento: data.tipoDocumento,
            //     ubigeo: ubigeo
            // });

            // Cerrar toast de carga
            toast.dismiss(loadingToast);
            
            // Mostrar toast de éxito
            toast.success("Afiliado registrado correctamente", {
                description: `El empleado ${empleadoSeleccionado.nombreCompleto} ha sido registrado exitosamente.`,
                duration: 4000,
            });

            // Resetear formulario
            setEmpleadoSeleccionado(null);
            setData({
                plan: Planes[0]?.value || "",
                montoPlan: Planes[0]?.monto || 0,
                direccion: "",
                sexo: "M",
                tipoDocumento: "DNI",
            });
            setUbigeo({});
            // Cerrar modal después de un breve delay
            setTimeout(() => {
                setIsCrear(false);
            }, 1000);
        } catch (error) {
            console.error("Error en confirmRegistration:", error);
            toast.dismiss(loadingToast);
            // Mostrar toast de error
            toast.error("Error al registrar afiliado", {
                description: "Ha ocurrido un error al procesar la solicitud.",
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getPlanInfo = () => {
        const planSeleccionado = Planes.find(p => p.value === data.plan);
        return planSeleccionado ? planSeleccionado.label : "No seleccionado";
    };

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
                            Complete la información del afiliado y sus dependientes
                        </p>
                    </div>
                }
                style={{ top: "2vh"}}
                onCancel={() => setIsCrear(false)}
                width={1200}
                footer={null}
                closable={!isLoading}
                maskClosable={!isLoading}
            >
                <div className="max-h-[60vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Columna 1 - Información Personal */}
                        <Card
                            title={
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <User className="h-5 w-5" />
                                    <span>Información Personal</span>
                                </div>
                            }
                            className={cardStyles}
                        >
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
                                            option?.label.toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={empleados.map(empleado => ({
                                            value: empleado.idEmpleado.toString(),
                                            label: `${empleado.nombreCompleto} - ${empleado.documento}`
                                        }))}
                                        disabled={isLoading}
                                    />
                                </div>

                                {empleadoSeleccionado && (
                                    <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="nombres" className={labelStyles}>Nombres</label>
                                                <Input
                                                    value={empleadoSeleccionado.nombres || ""}
                                                    disabled
                                                    className={inputStyles}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="apellidos" className={labelStyles}>Apellidos</label>
                                                <Input
                                                    value={empleadoSeleccionado.apellidos || ""}
                                                    disabled
                                                    className={inputStyles}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="fechaNacimiento" className={labelStyles}>
                                                    <Calendar className="h-4 w-4" />
                                                    Fecha Nacimiento
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={formatearFechaInput(empleadoSeleccionado.fecNacimiento)}
                                                    disabled
                                                    className={inputStyles}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="edad" className={labelStyles}>Edad</label>
                                                <Input
                                                    value={calcularEdad(empleadoSeleccionado.fecNacimiento)}
                                                    disabled
                                                    className={inputStyles}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="sexo" className={labelStyles}>Sexo</label>
                                                <Select
                                                    style={selectStyles}
                                                    value={data.sexo}
                                                    onChange={(value) => setData(prev => ({ ...prev, sexo: value }))}
                                                    disabled={isLoading}
                                                >
                                                    <Option value="M">Masculino</Option>
                                                    <Option value="F">Femenino</Option>
                                                </Select>
                                            </div>
                                            <div>
                                                <label htmlFor="tipoDocumento" className={labelStyles}>Tipo Documento</label>
                                                <Select
                                                    style={selectStyles}
                                                    value={data.tipoDocumento}
                                                    onChange={(value) => setData(prev => ({ ...prev, tipoDocumento: value }))}
                                                    disabled={isLoading}
                                                >
                                                    <Option value="DNI">DNI</Option>
                                                    <Option value="CE">Carnet Extranjería</Option>
                                                    <Option value="PASAPORTE">Pasaporte</Option>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="documento" className={labelStyles}>Documento</label>
                                                <Input
                                                    value={empleadoSeleccionado.documento || ""}
                                                    disabled
                                                    className={inputStyles}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="estadoCivil" className={labelStyles}>Estado Civil</label>
                                                <Input
                                                    value={empleadoSeleccionado.estadoCivil || ""}
                                                    disabled
                                                    className={inputStyles}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Columna 2 - Información del Plan y Contacto */}
                        <div>
                            <Card
                                title={
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <CreditCard className="h-5 w-5" />
                                        <span>Plan y Ubicación</span>
                                    </div>
                                }
                                className={cardStyles}
                            >
                                <div className="space-y-2">
                                    <div>
                                        <label className={labelStyles}>
                                            <CreditCard className="h-4 w-4" />
                                            Seleccione Plan
                                        </label>
                                        <Select
                                            style={selectStyles}
                                            value={data.plan}
                                            onChange={(value) => setData(prev => ({
                                                ...prev,
                                                plan: value,
                                                montoPlan: Planes.find(p => p.value === value)?.monto ?? prev.montoPlan,
                                            }))}
                                            placeholder="💰 Seleccione un plan"
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().includes(input.toLowerCase())
                                            }
                                            disabled={isLoading}
                                        >
                                            {Planes.map(plan => (
                                                <Option key={plan.value} value={plan.value}>
                                                    {plan.label} - S/ {plan.monto?.toLocaleString('es-PE')}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="monto" className={labelStyles}>Monto del Plan</label>
                                        <Input
                                            disabled
                                            value={`S/ ${data.montoPlan.toLocaleString('es-PE')}`}
                                            className={`${inputStyles} font-bold text-green-600 dark:text-green-400`}
                                            style={{ borderColor: '#10b981' }}
                                        />
                                    </div>

                                    <Divider />

                                    {/* Sección de Ubicación */}
                                    <div className={`${empleadoSeleccionado ? "block":"hidden"}`}>
                                        <label className={labelStyles}>
                                            <MapPin className="h-4 w-4" />
                                            Ubicación
                                        </label>

                                        {empleadoSeleccionado?.departamento && empleadoSeleccionado?.provincia && empleadoSeleccionado?.distrito ? (
                                            <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                                                        <span className="font-semibold text-gray-600 dark:text-gray-400">Departamento:</span>
                                                        <span className="text-green-700 dark:text-green-300 font-medium">{empleadoSeleccionado.departamento}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                                                        <span className="font-semibold text-gray-600 dark:text-gray-400">Provincia:</span>
                                                        <span className="text-green-700 dark:text-green-300 font-medium">{empleadoSeleccionado.provincia}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                                                        <span className="font-semibold text-gray-600 dark:text-gray-400">Distrito:</span>
                                                        <span className="text-green-700 dark:text-green-300 font-medium">{empleadoSeleccionado.distrito}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-green-600 dark:text-green-400 text-center mt-2">
                                                    ✅ Ubicación cargada automáticamente
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <UbigeoPicker
                                                    value={ubigeo}
                                                    onChange={setUbigeo}
                                                    dataUrl="/data.json"
                                                    className="!grid-cols-1 gap-3"
                                                    disabled={isLoading}
                                                />
                                                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                                    ⚠️ Complete la ubicación del empleado
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`${empleadoSeleccionado ? "block":"hidden"}`}>
                                        <label htmlFor="direccion" className={labelStyles}>Dirección Completa</label>
                                        <textarea
                                            value={data.direccion}
                                            onChange={(e) => setData(prev => ({ ...prev, direccion: e.target.value.trimStart().toUpperCase() }))}
                                            placeholder="Ingrese dirección completa..."
                                            rows={3}
                                            className={`${inputStyles} border-2`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                        <Phone className="h-5 w-5" />
                                        <span>Información de Contacto</span>
                                    </div>
                                }
                                className={`${cardStyles} ${empleadoSeleccionado ? "block":"hidden"}`}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelStyles}>
                                            <Phone className="h-4 w-4" />
                                            Teléfono / Celular
                                        </label>
                                        <Input
                                            value={empleadoSeleccionado?.telefono || ""}
                                            onChange={(e) => {
                                                // Manejar cambio si es necesario
                                            }}
                                            className={inputStyles}
                                            placeholder="Ingrese número de teléfono"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelStyles}>
                                            <Mail className="h-4 w-4" />
                                            Correo Electrónico
                                        </label>
                                        <Input
                                            value={empleadoSeleccionado?.correo || ""}
                                            onChange={(e) => {
                                                // Manejar cambio si es necesario
                                            }}
                                            className={inputStyles}
                                            placeholder="Ingrese correo electrónico"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={() => setIsCrear(false)}
                        className="px-8 py-2 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancelar"}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isLoading || !empleadoSeleccionado || !data.plan}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Procesando...
                            </>
                        ) : (
                            "Registrar Afiliado"
                        )}
                    </Button>
                </div>
            </Modal>

            {/* Modal de Confirmación */}
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
                    >
                        Cancelar
                    </Button>,
                    <Button
                        key="confirm"
                        onClick={confirmRegistration}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Confirmar Registro
                    </Button>
                ]}
                width={500}
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
                            <span>{getPlanInfo()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Monto:</span>
                            <span className="text-green-600 font-bold">S/ {data.montoPlan.toLocaleString('es-PE')}</span>
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
};