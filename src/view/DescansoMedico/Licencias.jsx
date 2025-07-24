import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker, Modal, Select, message, AutoComplete } from 'antd';
const { RangePicker } = DatePicker;
import { Trash2, Search, RefreshCw, Trash, Plus } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import dayjs from 'dayjs';
import { CompResultado } from "@/components/CompSucces";
import { useData } from "@/provider/Provider";
dayjs.locale("es");
export const Licencias = () => {
    const { nombre } = useData()
    // Datos de prueba

    const [isModalDeleteSuccessOpen, setIsModalDeleteSuccessOpen] = useState(false);
    const [isModalCargandoEliminarLicencia, setIsModalCargandoEliminarLicencia] = useState(false);
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);
    const [isModalLoadingOpen, setIsModalLoadingOpen] = useState(false);
    const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);
    const [data, setData] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
    const [empleadoEscogido, setEmpleadoEscogido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputAutoCompleteValue, setInputAutoCompleteValue] = useState(''); // Nuevo estado
    const [dateRange, setDateRange] = useState([]);
    const [tipoFilter, setTipoFilter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [licenseToDelete, setLicenseToDelete] = useState(null); // Nuevo estado para almacenar la licencia a eliminar
    const [newLicense, setNewLicense] = useState({
        nombreCompleto: "",
        documento: "",
        tipo: "",
        cobertura: "CON GOCE",
        fechaInicio: dayjs().format('YYYY-MM-DD'),
        fechaFin: dayjs().add(10, 'day').format('YYYY-MM-DD'),
        dias: 0,
        observacion: "",
        diasAcumulados: 0
    });

    // Mapeo de días según observación
    const diasPorObservacion = {
        "Parto natural o cesárea": 10,
        "Nacimiento prematuro o múltiple": 20,
        "Nacimiento con enfermedad congénita o discapacidad": 30,
        "Complicaciones graves con la madre": 31,
        "Dentro de la ciudad": 5,
        "Fuera de la ciudad": 7
    };

    // Obtener empleados desde la API
    const obtenerEmpleados = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`);
            const dataEmpleados = response.data.recordset.filter(dato => dato.nombreCompleto !== null);
            const datosFiltrados = dataEmpleados.filter(empleado => empleado.estadoLaboral === "VIGENTE");
            console.log("Datos de empleados:", datosFiltrados);
            setEmpleados(datosFiltrados.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)));
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    const obtenerLicencias = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarLicencias`);

            // Verifica la estructura de la respuesta
            console.log("Respuesta completa:", response);
            console.log("Datos recibidos:", response.data);

            let dataLicencias = [];

            // Diferentes formas de acceder a los datos según la estructura de respuesta
            if (Array.isArray(response.data)) {
                dataLicencias = response.data;
            } else if (response.data.recordset) {
                dataLicencias = response.data.recordset;
            } else if (response.data.data) {
                dataLicencias = response.data.data;
            }

            // Filtrar y ordenar
            dataLicencias = dataLicencias
                .filter(dato => dato.nombreCompleto !== null)
                .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));

            setData(dataLicencias);
            console.log("Licencias cargadas:", dataLicencias);

        } catch (error) {
            console.error("Error al obtener licencias:", error);
            message.error("Error al cargar las licencias");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        obtenerEmpleados();
        obtenerLicencias();
        setLoading(false);
    }, []);

    // Manejar búsqueda de empleados para el autocompletado
    const handleBuscarEmpleado = (searchText) => {
        setInputAutoCompleteValue(searchText); // Actualiza el valor del input

        if (!searchText) {
            setEmpleadosFiltrados([]);
            return;
        }

        const filtered = empleados.filter(empleado =>
            empleado.nombreCompleto.toLowerCase().includes(searchText.toLowerCase()) ||
            empleado.documento.includes(searchText)
        ).map(empleado => ({
            value: empleado.nombreCompleto,
            label: `${empleado.nombreCompleto} - ${empleado.documento}`,
            empleado: empleado
        }));

        setEmpleadosFiltrados(filtered);
    };


    // Filtrar por rango de fechas
    const filtrarPorRangoFechas = (licencias, rangoFechas) => {
        if (!rangoFechas || rangoFechas.length !== 2) return licencias;

        try {
            const fechaInicioRango = new Date(rangoFechas[0]);
            const fechaFinRango = new Date(rangoFechas[1]);

            if (isNaN(fechaInicioRango.getTime()) || isNaN(fechaFinRango.getTime())) {
                throw new Error('Fechas inválidas en el rango');
            }

            return licencias.filter(licencia => {
                const fechaInicioLicencia = new Date(licencia.fecha_inicio);
                return (
                    fechaInicioLicencia >= fechaInicioRango &&
                    fechaInicioLicencia <= fechaFinRango
                );
            });
        } catch (error) {
            console.error("Error al filtrar por fechas:", error);
            return licencias;
        }
    };

    // Filtrar datos
    const filteredData = useMemo(() => {
        let result = [...data];

        if (searchTerm) {
            result = result.filter(item =>
                item.documento.includes(searchTerm) ||
                item.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (tipoFilter) {
            result = result.filter(item => item.TipoGoce === tipoFilter);
        }

        if (dateRange && dateRange.length === 2) {
            result = filtrarPorRangoFechas(result, dateRange);
        }

        return result;
    }, [data, searchTerm, tipoFilter, dateRange]);

    // Opciones para el Select de tipo
    const tipoOptions = [
        { value: null, label: "Todos los tipos de goce" },
        { value: "CON GOCE", label: "Con Goce" },
        { value: "SIN GOCE", label: "Sin Goce" }
    ];

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm("");
        setTipoFilter(null);
        setDateRange([]);
    };

    // Manejar cambio de fechas
    const handleDateChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange(dates);
        } else {
            setDateRange([]);
        }
    };

    // Formatear fecha
    const formatDate = (date) => {
        // Si ya es un objeto Date válido
        if (date instanceof Date && !isNaN(date)) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Si es una cadena en formato ISO (YYYY-MM-DD)
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date; // Ya está en el formato correcto
        }

        // Si es un timestamp numérico
        if (typeof date === 'number') {
            const d = new Date(date);
            if (!isNaN(d)) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        }

        // Si no es ninguno de los anteriores, lanza error o retorna valor por defecto
        console.error('Fecha no válida:', date);
        return '0000-00-00'; // O lanza un error según tu necesidad
    };

    // Calcular días entre fechas
    const calcularDias = (fechaInicio, fechaFin) => {
        const inicio = dayjs(fechaInicio);
        const fin = dayjs(fechaFin);
        return fin.diff(inicio, 'day') + 1; // +1 para incluir el día inicial
    };

    // Validar formulario
    const validarFormulario = () => {
        if (newLicense.cobertura === "CON GOCE") {
            if (!empleadoEscogido) {
                message.error("Debe seleccionar un empleado");
                return false;
            }
            if (!newLicense.observacion) {
                message.error("Debe seleccionar una observación");
                return false;
            }
            if (!newLicense.fechaInicio) {
                message.error("Debe ingresar una fecha de inicio");
                return false;
            }
        } else {
            if (!newLicense.nombreCompleto) {
                message.error("Debe ingresar el nombre del empleado");
                return false;
            }
            if (!newLicense.observacion) {
                message.error("Debe ingresar una observación");
                return false;
            }
            if (!newLicense.fechaInicio || !newLicense.fechaFin) {
                message.error("Debe ingresar ambas fechas");
                return false;
            }
            if (dayjs(newLicense.fechaFin).isBefore(dayjs(newLicense.fechaInicio))) {
                message.error("La fecha fin no puede ser anterior a la fecha inicio");
                return false;
            }
        }
        return true;
    };

    // Mostrar modal de confirmación
    const showConfirmModal = () => {
        if (!validarFormulario()) return;
        setIsModalOpen(false);
        // Calcular días según el tipo de licencia
        let diasCalculados = 0;
        if (newLicense.cobertura === "CON GOCE") {
            diasCalculados = diasPorObservacion[newLicense.observacion] || 0;
            // Actualizar fecha fin basada en los días calculados
            setNewLicense(prev => ({
                ...prev,
                dias: diasCalculados,
                fechaFin: dayjs(prev.fechaInicio).add(diasCalculados - 1, 'day').format('YYYY-MM-DD')
            }));
        } else {
            diasCalculados = calcularDias(newLicense.fechaInicio, newLicense.fechaFin);
            setNewLicense(prev => ({
                ...prev,
                dias: diasCalculados
            }));
        }

        setIsConfirmModalOpen(true);
    };

    // Confirmar y guardar la licencia
    const confirmAndSaveLicense = async () => {
        try {
            // 1. Validación de datos antes de enviar
            if (!empleadoEscogido?.idEmpleado) {
                throw new Error("No se ha seleccionado un empleado válido");
            }

            if (!newLicense.fechaInicio || !newLicense.fechaFin) {
                throw new Error("Fechas de licencia no válidas");
            }

            // Convertir fechas a objetos Date asegurando el formato correcto
            const fechaInicio = new Date(newLicense.fechaInicio + 'T00:00:00');
            const fechaFin = new Date(newLicense.fechaFin + 'T00:00:00');

            // Verificar si las fechas están en el mismo mes y año
            const mismoMes = fechaInicio.getMonth() === fechaFin.getMonth() &&
                fechaInicio.getFullYear() === fechaFin.getFullYear();

            if (mismoMes) {
                // Si es el mismo mes, registrar normalmente
                await registrarLicenciaUnica();
            } else {
                // Si abarca varios meses, dividir en registros por mes
                await registrarLicenciasPorMeses(fechaInicio, fechaFin);
            }

            // Cerrar modales y limpiar estado
            setIsConfirmModalOpen(false);
            setIsModalOpen(false);
            setEmpleadoEscogido(null);
            obtenerLicencias();
            handlePostSubmissionFlow();

        } catch (error) {
            console.error("Error al registrar la licencia:", error);
            handleSubmissionError(error);
        }
    };

    // Función para dividir y registrar licencias por meses (versión mejorada)
    const registrarLicenciasPorMeses = async (fechaInicio, fechaFin) => {
        let currentStart = new Date(fechaInicio);
        const endDate = new Date(fechaFin);

        setIsModalLoadingOpen(true);

        try {
            while (currentStart <= endDate) {
                // Calcular último día del mes actual
                const currentEndMonth = new Date(
                    currentStart.getFullYear(),
                    currentStart.getMonth() + 1,
                    0
                );

                // Ajustar si el fin del mes es mayor que la fecha final de la licencia
                const endDateForPeriod = currentEndMonth > endDate ? endDate : currentEndMonth;

                // Calcular días en este período (incluyendo ambos días)
                const diffDays = Math.floor((endDateForPeriod - currentStart) / (1000 * 60 * 60 * 24)) + 1;

                // Formatear fechas correctamente
                const formattedStart = formatDate(currentStart);
                const formattedEnd = formatDate(endDateForPeriod);

                // Crear payload para este período
                const payload = {
                    idEmpleado: empleadoEscogido.idEmpleado,
                    fecInicio: formattedStart,
                    fecFin: formattedEnd,
                    numDias: diffDays,
                    usuario: nombre,
                    texto_json: {
                        Tipo: newLicense.tipo,
                        TipoGoce: newLicense.cobertura,
                        Detalle: newLicense.observacion,
                        ParteDe: `Licencia original: ${newLicense.fechaInicio} a ${newLicense.fechaFin}`
                    }
                };

                console.log('Registrando parte de licencia:', payload);

                // Enviar este período
                await enviarLicencia(payload);

                // Mover al primer día del siguiente mes
                currentStart = new Date(
                    endDateForPeriod.getFullYear(),
                    endDateForPeriod.getMonth() + 1,
                    1
                );
            }
        } catch (error) {
            console.error('Error al registrar licencias por meses:', error);
            throw error;
        } finally {
            setIsModalLoadingOpen(false);
        }
    };

    // Función para registrar una licencia única (sin división por meses)
    const registrarLicenciaUnica = async () => {
        const payload = {
            idEmpleado: empleadoEscogido.idEmpleado,
            fecInicio: newLicense.fechaInicio,
            fecFin: newLicense.fechaFin,
            numDias: newLicense.dias,
            usuario: nombre,
            texto_json: {
                Tipo: newLicense.tipo,
                TipoGoce: newLicense.cobertura,
                Detalle: newLicense.observacion,
            }
        };

        setIsModalLoadingOpen(true);
        await enviarLicencia(payload);
        setIsModalLoadingOpen(false);
    };

    // Función auxiliar para enviar una licencia al backend
    const enviarLicencia = async (payload) => {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/registrarLicencia`,
            {
                ...payload,
                texto_json: JSON.stringify(payload.texto_json)
            }
        );

        if (response.status !== 200) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }
    };

    // Función separada para manejar el flujo post-envío exitoso
    const handlePostSubmissionFlow = () => {
        // Mostrar éxito
        setIsModalSuccessOpen(true);
        // Resetear después de mostrar éxito
        setTimeout(() => {
            resetFormAndState();
        }, 2000);
    };
    // Función para manejar errores
    const handleSubmissionError = (error) => {
        setIsModalLoadingOpen(false);
        setIsConfirmModalOpen(false);
        console.log(error);
        // Mostrar modal de error
        setIsModalErrorOpen(true);

        // Opcional: Auto-cerrar el modal de error después de un tiempo
        setTimeout(() => {
            setIsModalErrorOpen(false);
        }, 3000);
    };

    // Función para resetear el formulario y estado
    const resetFormAndState = () => {
        setIsModalSuccessOpen(false);
        setNewLicense({
            nombreCompleto: "",
            documento: "",
            tipo: "",
            cobertura: "CON GOCE",
            fechaInicio: dayjs().format('YYYY-MM-DD'),
            fechaFin: dayjs().add(10, 'day').format('YYYY-MM-DD'),
            dias: 0,
            observacion: "",
            diasAcumulados: 0
        });
        setEmpleadoEscogido(null);
        setInputAutoCompleteValue('');
        setEmpleadosFiltrados([]);
    };

    // Función para preparar la eliminación de una licencia
    const prepareDeleteLicense = (license) => {
        setLicenseToDelete(license);
        setIsModalDeleteOpen(true);
    };

    // Confirmar eliminación de la licencia
    const confirmDeleteLicense = async () => {
        if (!licenseToDelete) return;

        console.log("Eliminando licencia:", licenseToDelete);

        try {
            // Preparar datos para la eliminación
            const cuerpo = {
                id: licenseToDelete.idAusenciasLaborables,
                idEmpleado: licenseToDelete.idEmpleado,
                usuario: nombre,
            };

            // Cerrar modal de confirmación y mostrar carga
            setIsModalDeleteOpen(false);
            setIsModalCargandoEliminarLicencia(true);

            // Animación de eliminación local (opcional)
            setData(prevData => prevData.map(item =>
                item.idAusenciasLaborables === licenseToDelete.idAusenciasLaborables
                    ? { ...item, isDeleting: true }
                    : item
            ));

            // Enviar solicitud al servidor
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/eliminarLicencia`,
                cuerpo
            );

            // Verificar respuesta exitosa
            if (response.status !== 200) {
                throw new Error(`Error al eliminar: ${response.statusText}`);
            }

            // Esperar un momento para que se vea la animación de carga
            await new Promise(resolve => setTimeout(resolve, 800));

            // Actualizar estado local (con animación)
            setData(prevData => {
                const newData = prevData.filter(
                    item => item.idAusenciasLaborables !== licenseToDelete.idAusenciasLaborables
                );
                return newData;
            });

            // Mostrar éxito
            setIsModalCargandoEliminarLicencia(false);
            setIsModalDeleteSuccessOpen(true);

            // Ocultar mensaje de éxito después de 2 segundos
            setTimeout(() => {
                setIsModalDeleteSuccessOpen(false);
                setLicenseToDelete(null);
            }, 2000);

        } catch (error) {
            console.error("Error al eliminar licencia:", error);

            // Manejo de errores
            setIsModalCargandoEliminarLicencia(false);

            // Mostrar mensaje de error
            message.error("Error al eliminar la licencia");

            // Revertir estado visual si es necesario
            setData(prevData => prevData.map(item =>
                item.idAusenciasLaborables === licenseToDelete.idAusenciasLaborables
                    ? { ...item, isDeleting: false }
                    : item
            ));
        }
    };

    const handleCancel = () => {
        setNewLicense({
            nombreCompleto: "",
            documento: "",
            tipo: "",
            cobertura: "CON GOCE",
            fechaInicio: dayjs().format('YYYY-MM-DD'),
            fechaFin: dayjs().add(10, 'day').format('YYYY-MM-DD'),
            dias: 0,
            observacion: "",
            diasAcumulados: 0
        });
        setEmpleadoEscogido(null);
        setInputAutoCompleteValue(''); // Limpia el valor del input
        setEmpleadosFiltrados([]); // Limpia los resultados filtrados
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLicense(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="w-full max-w-8xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center text-2xl font-bold mb-6 text-gray-800 dark:text-white"
            >
                LICENCIAS
            </motion.h1>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    <div className="relative flex items-center">
                        <Input
                            type="text"
                            placeholder="Buscar por DNI o nombre"
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                    </div>

                    <Select
                        placeholder="Filtrar por tipo"
                        options={tipoOptions}
                        value={tipoFilter}
                        onChange={setTipoFilter}
                        className="w-full"
                    />

                    <RangePicker
                        onChange={handleDateChange}
                        format="DD/MM/YYYY"
                        className="w-full"
                        value={dateRange}
                    />
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={handleClearFilters}
                        variant="outline"
                        className="mt-4 md:mt-0"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar
                    </Button>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Licencia
                    </Button>
                </div>
            </div>

            {/* Tabla de licencias */}
            <div className="overflow-y-auto max-h-[65vh] rounded-lg border border-gray-200 dark:border-gray-700 shadow">
                <table className="min-w-full border-collapse">
                    <thead >
                        <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                            <th className="w-60 text-center text-sm font-medium">NOMBRE COMPLETO</th>
                            <th className="p-2 text-center text-sm font-medium">DOCUMENTO</th>
                            <th className="p-1 text-center text-sm font-medium">TIPO</th>
                            <th className="px-4 text-center text-sm font-medium">TIPO DE GOCE</th>
                            <th className="p-1 text-center text-sm font-medium">FECHA INICIO</th>
                            <th className="p-1 text-center text-sm font-medium">FECHA FIN</th>
                            <th className="p-1 text-center text-sm font-medium">NUM. DIAS</th>
                            <th className="w-52 text-center text-sm font-medium">OBSERVACIONES</th>
                            <th className="p-1 text-center text-sm font-medium">ELIMINAR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="py-8 text-center">
                                    <div className="flex justify-center">
                                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <motion.tr
                                    key={`${item.documento}-${index}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.nombreCompleto || "---"}</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.documento || "---"}</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.Tipo || "OTRO"}</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.TipoGoce || "SN"}</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.fecha_inicio.split("T")[0].split("-").reverse().join("/") || "SN"}</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.fecha_fin.split("T")[0].split("-").reverse().join("/") || "SN"}</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.numDias || "SN"} DIAS</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.Detalle || "SN"}</td>
                                    <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <div className="flex space-x-2 justify-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Eliminar"
                                                disabled={true}
                                                onClick={() => prepareDeleteLicense(item)}
                                            >
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="py-4 text-center text-gray-500 dark:text-gray-400">
                                    No se encontraron resultados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para nueva licencia */}
            <Modal
                title={<h1 className="text-xl font-bold text-slate-800 pb-2 text-center">REGISTRAR NUEVA LICENCIA</h1>}
                open={isModalOpen}
                onOk={showConfirmModal}
                onCancel={handleCancel}
                className="translate-y-5"
                width={700}
                footer={[
                    <div className="flex justify-end space-x-2" key="footer">
                        <Button variant="ghost" className="border-2 border-neutral-200" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={showConfirmModal}>
                            Continuar
                        </Button>
                    </div>
                ]}
            >
                <div className="flex flex-col gap-4 ">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Goce</label>
                        <Select
                            style={{ width: '50%' }}
                            options={[
                                { value: 'CON GOCE', label: 'Con Goce' },
                                { value: 'SIN GOCE', label: 'Sin Goce' }
                            ]}
                            value={newLicense.cobertura}
                            onChange={(value) => {
                                // Resetear todos los valores
                                setNewLicense({
                                    nombreCompleto: "",
                                    documento: "",
                                    tipo: "",
                                    cobertura: value,
                                    fechaInicio: dayjs().format('YYYY-MM-DD'),
                                    fechaFin: value === "CON COCE"
                                        ? dayjs().add(10, 'day').format('YYYY-MM-DD')
                                        : dayjs().add(1, 'day').format('YYYY-MM-DD'),
                                    dias: 0,
                                    observacion: "",
                                    diasAcumulados: 0
                                });
                                setEmpleadoEscogido(null);
                                setInputAutoCompleteValue(''); // Limpia el valor del input
                                setEmpleadosFiltrados([]); // Limpia los resultados filtrados
                            }}
                        />
                    </div>

                    {newLicense.cobertura === "CON GOCE" ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Empleado</label>
                                    <AutoComplete
                                        options={empleadosFiltrados}
                                        onSearch={handleBuscarEmpleado}
                                        onSelect={(value, option) => {
                                            setEmpleadoEscogido(option.empleado);
                                            setNewLicense(prev => ({
                                                ...prev,
                                                nombreCompleto: option.empleado.nombreCompleto,
                                                documento: option.empleado.documento
                                            }));
                                            setInputAutoCompleteValue(value); // Actualiza el valor mostrado
                                        }}
                                        value={inputAutoCompleteValue} // Controla el valor mostrado
                                        placeholder="Buscar empleado"
                                        style={{ width: "100%" }}
                                        className="p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo</label>
                                    <Select
                                        style={{ width: '100%' }}
                                        options={[
                                            { value: 'PATERNIDAD', label: 'Paternidad' },
                                            { value: 'FALLECIMIENTO', label: 'Fallecimiento' }
                                        ]}
                                        value={newLicense.tipo}
                                        onChange={(value) => setNewLicense(prev => ({ ...prev, tipo: value, observacion: '' }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Observaciones</label>
                                    {newLicense.tipo === 'PATERNIDAD' ? (
                                        <Select
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Parto natural o cesárea', label: 'Parto natural o cesárea' },
                                                { value: 'Nacimiento prematuro o múltiple', label: 'Nacimiento prematuro o múltiple' },
                                                { value: 'Nacimiento con enfermedad congénita o discapacidad', label: 'Nacimiento con enfermedad congénita o discapacidad' },
                                                { value: 'Complicaciones graves con la madre', label: 'Complicaciones graves con la madre' },
                                            ]}
                                            value={newLicense.observacion}
                                            onChange={(value) => setNewLicense(prev => ({ ...prev, observacion: value }))}
                                        />
                                    ) : newLicense.tipo === 'FALLECIMIENTO' ? (
                                        <Select
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Dentro de la ciudad', label: 'Dentro de la ciudad' },
                                                { value: 'Fuera de la ciudad', label: 'Fuera de la ciudad' }
                                            ]}
                                            value={newLicense.observacion}
                                            onChange={(value) => setNewLicense(prev => ({ ...prev, observacion: value }))}
                                        />
                                    ) : (
                                        <Select
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Dentro de la ciudad', label: 'Dentro de la ciudad' },
                                            ]}
                                            disabled
                                            value={newLicense.observacion}
                                            onChange={(value) => setNewLicense(prev => ({ ...prev, observacion: value }))}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={dayjs(newLicense.fechaInicio)}
                                        onChange={(date) => setNewLicense(prev => ({
                                            ...prev,
                                            fechaInicio: date ? date.format('YYYY-MM-DD') : "",
                                            fechaFin: date && newLicense.dias > 0 ?
                                                date.add(newLicense.dias - 1, 'day').format('YYYY-MM-DD') :
                                                prev.fechaFin
                                        }))}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre</label>
                                    <AutoComplete
                                        options={empleadosFiltrados}
                                        onSearch={handleBuscarEmpleado}
                                        onSelect={(value, option) => {
                                            console.log("Empleado seleccionado:", option);
                                            setEmpleadoEscogido(option.empleado);
                                            setNewLicense(prev => ({
                                                ...prev,
                                                nombreCompleto: option.empleado.nombreCompleto,
                                                documento: option.empleado.documento
                                            }));
                                        }}
                                        placeholder="Buscar empleado"
                                        style={{ width: "100%" }}
                                        className="p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Observaciones</label>
                                    <Input
                                        name="observacion"
                                        value={newLicense.observacion}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={dayjs(newLicense.fechaInicio)}
                                        onChange={(date) => setNewLicense(prev => ({
                                            ...prev,
                                            fechaInicio: date ? date.format('YYYY-MM-DD') : ""
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={dayjs(newLicense.fechaFin)}
                                        disabled={!newLicense.fechaInicio}
                                        onChange={(date) => setNewLicense(prev => ({
                                            ...prev,
                                            fechaFin: date ? date.format('YYYY-MM-DD') : "",
                                        }))}
                                        disabledDate={(current) => {
                                            return current && current < dayjs(newLicense.fechaInicio).startOf('day');
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Modal de confirmación */}
            <Modal
                title={<h1 className="text-xl font-bold text-slate-700 pb-2 text-center">VERIFICAR LICENCIA</h1>}
                open={isConfirmModalOpen}
                onOk={confirmAndSaveLicense}
                onCancel={() => {
                    setIsConfirmModalOpen(false)
                    setIsModalOpen(true)
                }}
                width={600}
                footer={[
                    <div className="flex justify-end space-x-2" key="footer">
                        <Button variant="ghost" className="border-2 border-neutral-200" onClick={() => { setIsConfirmModalOpen(false); setIsModalOpen(true) }}>
                            Corregir
                        </Button>
                        <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={confirmAndSaveLicense}>
                            Confirmar Registro
                        </Button>
                    </div>
                ]}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Empleado</label>
                            <p className="text-sm font-semibold">{newLicense.nombreCompleto}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Documento</label>
                            <p className="text-sm font-semibold">{newLicense.documento}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Tipo de Goce</label>
                            <p className="text-sm font-semibold">{newLicense.cobertura}</p>
                        </div>
                        {
                            newLicense.cobertura === "CON GOCE" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tipo de Licencia</label>
                                    <p className="text-sm font-semibold">{newLicense.tipo}</p>
                                </div>
                            )
                        }
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Fecha Inicio</label>
                            <p className="text-sm font-semibold">{formatDate(newLicense.fechaInicio)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Fecha Fin</label>
                            <p className="text-sm font-semibold">{formatDate(newLicense.fechaFin)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Días</label>
                            <p className="text-sm font-semibold text-red-600">{newLicense.dias} días</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Observaciones</label>
                            <p className="text-sm font-semibold">{newLicense.observacion}</p>
                        </div>
                    </div>
                    {newLicense.cobertura === "CON GOCE" && (
                        <div className="mt-4 p-4 bg-blue-50 rounded">
                            <p className="text-sm text-blue-700">
                                <strong>Nota:</strong> Para licencias CON GOCE, el sistema ha calculado automáticamente {newLicense.dias} días basados en la observación seleccionada.
                            </p>
                        </div>
                    )}
                    {newLicense.cobertura === "SIN GOCE" && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded">
                            <p className="text-sm text-yellow-700">
                                <strong>Nota:</strong> Para licencias SIN GOCE, el sistema ha calculado {newLicense.dias} días como la diferencia entre las fechas ingresadas.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal de carga */}
            <Modal
                title={null}
                open={isModalLoadingOpen}
                width={400}
                footer={null}
            >
                <CompResultado tipo="loading" titulo={<span>Registrando licencia...</span>} mensaje={<span>Por favor, espere mientras se registra la licencia.</span>} />
            </Modal>

            {/* Modal de éxito */}
            <Modal
                title={null}
                open={isModalSuccessOpen}
                width={400}
                footer={null}
            >
                <CompResultado tipo="success" titulo={<span>Licencia registrada con éxito</span>} mensaje={<span>La licencia ha sido registrada correctamente.</span>} />
            </Modal>

            {/* Modal de error */}
            <Modal
                title={null}
                open={isModalErrorOpen}
                width={400}
                footer={null}
            >
                <CompResultado tipo="error" titulo={<span>Error al registrar licencia</span>} mensaje={<span>Ha ocurrido un error al registrar la licencia.</span>} />
            </Modal>

            {/* Modal de confirmación de eliminación */}
            <Modal
                title={<h1 className="text-xl font-bold text-slate-700 pb-2 text-center">CONFIRMAR ELIMINACIÓN</h1>}
                open={isModalDeleteOpen}
                className="-translate-y-16"
                onOk={confirmDeleteLicense}
                onCancel={() => setIsModalDeleteOpen(false)}
                width={600}
                footer={[
                    <div className="flex justify-end space-x-2" key="footer">
                        <Button variant="outline" onClick={() => setIsModalDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteLicense}>
                            Confirmar Eliminación
                        </Button>
                    </div>
                ]}
            >
                <div className="space-y-4">
                    <p className="text-center text-lg mb-4">¿Estás seguro de que deseas eliminar esta licencia?</p>

                    {licenseToDelete && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Empleado</label>
                                    <p className="text-sm font-semibold">{licenseToDelete.nombreCompleto}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Documento</label>
                                    <p className="text-sm font-semibold">{licenseToDelete.documento}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tipo de Goce</label>
                                    <p className="text-sm font-semibold">{licenseToDelete.TipoGoce}</p>
                                </div>
                                {licenseToDelete.TipoGoce === "CON GOCE" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Tipo de Licencia</label>
                                        <p className="text-sm font-semibold">{licenseToDelete.Tipo}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Fecha Inicio</label>
                                    <p className="text-sm font-semibold">{formatDate(licenseToDelete.fecha_inicio)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Fecha Fin</label>
                                    <p className="text-sm font-semibold">{formatDate(licenseToDelete.fecha_fin)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Días</label>
                                    <p className="text-sm font-semibold text-red-600">{licenseToDelete.numDias} días</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Observaciones</label>
                                    <p className="text-sm font-semibold">{licenseToDelete.Detalle}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-4 bg-red-50 rounded">
                        <p className="text-sm text-red-700">
                            <strong>Advertencia:</strong> Esta acción no se puede deshacer. La licencia será eliminada permanentemente.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Modal de carga */}
            <Modal
                title={null}
                open={isModalCargandoEliminarLicencia}
                width={400}
                footer={null}
            >
                <CompResultado tipo="loading" titulo={<span>Eliminando licencia...</span>} mensaje={<span>Por favor, espere mientras se elimina la licencia.</span>} />
            </Modal>
            <Modal
                title={null}
                open={isModalDeleteSuccessOpen}
                width={400}
                footer={null}
            >
                <CompResultado tipo="error" titulo={<span>Licencia eliminada</span>} mensaje={<span>La licencia se ha eliminado correctamente.</span>} />
            </Modal>

        </div>
    );
};