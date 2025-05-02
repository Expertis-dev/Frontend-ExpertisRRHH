import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'antd';
import axios from 'axios';
import { Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useData } from '@/provider/Provider';

export const CambiarFecCese = () => {
    const [empleados, setEmpleados] = useState([]);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
    const [empleadoEscogido, setEmpleadoEscogido] = useState(null);
    const [ultimoCese, setUltimoCese] = useState("");
    const [nuevaFecha, setNuevaFecha] = useState("");
    const [modificar, setModificar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const { nombre } = useData()
    const ObtenerEmpleadosCesados = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`);
            if (response.status === 200) {
                const empleadosFiltrados = response.data.recordset
                    .filter(empleado => empleado.estadoLaboral === "CESADO")
                    .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

                setEmpleados(empleadosFiltrados);
                setEmpleadosFiltrados(empleadosFiltrados.map(emp => ({
                    value: emp.nombreCompleto,
                    label: emp.nombreCompleto,
                    ...emp // Incluir todos los datos del empleado
                })));
            }
        } catch (err) {
            console.error("Error al obtener empleados cesados:", err);
            setError("No se pudieron cargar los empleados cesados");
        }
    };

    useEffect(() => {
        ObtenerEmpleadosCesados();
    }, []);

    useEffect(() => {
        const obtenerUltimoCese = async () => {
            if (empleadoEscogido?.idPersona) {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/empleados/historicoCeses/${empleadoEscogido.idPersona}`
                    );

                    console.log("Respuesta completa:", response.data); // Para depuración

                    if (response.status === 200 && response.data.data && response.data.data.length > 0) {
                        // Ordenar por fecha de cese (más reciente primero)
                        const cesesOrdenados = [...response.data.data[0]].sort((a, b) =>
                            new Date(b.fecCese) - new Date(a.fecCese)
                        );

                        console.log("Ceses ordenados:", cesesOrdenados); // Para depuración

                        // Tomar la primera fecha (la más reciente)
                        const ultimoCese = cesesOrdenados[0]?.fecCese;
                        setUltimoCese(ultimoCese || "");

                        console.log("Último cese:", ultimoCese); // Para depuración
                    } else {
                        setUltimoCese("");
                        console.warn("No se encontraron ceses para este empleado");
                    }
                } catch (err) {
                    console.error("Error al obtener histórico de ceses:", err);
                    setError("No se pudo cargar el historial de ceses");
                    setUltimoCese("");
                }
            }
        };

        obtenerUltimoCese();
    }, [empleadoEscogido]);

    const handleBuscarEmpleado = (value) => {
        const filtrados = empleados
            .filter(empleado =>
                empleado.nombreCompleto.toLowerCase().includes(value.toLowerCase())
            )
            .map(empleado => ({
                value: empleado.nombreCompleto,
                label: empleado.nombreCompleto,
                ...empleado
            }));

        setEmpleadosFiltrados(filtrados);
    };

    const handleNuevaFecha = (e) => {
        setNuevaFecha(e.target.value);
    };

    const Enviar = () => {
        if (!nuevaFecha) {
            setError("Debe seleccionar una nueva fecha");
            return;
        }
        setModificar(true);
    };

    const Confirmar = async () => {
        setLoading(true);
        try {
            const cuerpo = {
                idEmpleado: empleadoEscogido.idEmpleado,
                nuevaFechaCese: nuevaFecha,
                usuario: nombre
            };
            console.log(cuerpo)
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/cese/modificarCese`,
                cuerpo
            );

            if (response.status === 200) {
                setLoading(false);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setModificar(false);
                    setEmpleadoEscogido(null);
                    setNuevaFecha("");
                    ObtenerEmpleadosCesados(); // Refrescar datos
                }, 2000);
            }
        } catch (err) {
            console.error("Error al modificar cese:", err);
            setError("Ocurrió un error al modificar la fecha de cese");
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6 text-center">Cambiar Fecha de Cese</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <label htmlFor="empleado" className="block mb-2 font-medium">
                    Empleado Cesado:
                </label>
                <AutoComplete
                    options={empleadosFiltrados}
                    onSearch={handleBuscarEmpleado}
                    onSelect={(value, option) => {
                        console.log(option, value)
                        setEmpleadoEscogido(option);
                        setError(null);
                    }}
                    placeholder="Buscar empleado cesado"
                    style={{ width: "100%" }}
                    className="p-2 border rounded"
                />
            </div>

            {empleadoEscogido && (
                <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                    <div>
                        <p className="font-medium">Nombre:</p>
                        <p>{empleadoEscogido.nombreCompleto}</p>
                    </div>

                    <div>
                        <p className="font-medium">Fecha de Cese Actual:</p>
                        <p>{ultimoCese ? ultimoCese.split("T")[0] : "No disponible"}</p>
                    </div>

                    <div>
                        <label htmlFor="nuevaFecha" className="block mb-2 font-medium">
                            Nueva Fecha de Cese:
                        </label>
                        <input
                            type="date"
                            id="nuevaFecha"
                            onChange={handleNuevaFecha}
                            className="p-2 border rounded"
                        />
                    </div>

                    <button
                        onClick={Enviar}
                        disabled={!nuevaFecha}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Enviar
                    </button>
                </div>
            )}

            {/* Diálogo de confirmación */}
            <Dialog open={modificar} onOpenChange={setModificar}>
                <DialogContent className="max-w-[30vw] max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center text-yellow-800">
                            ¿Estás seguro de modificar la fecha de Cese?
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 my-4">
                        <div>
                            <p className="font-semibold">EMPLEADO:</p>
                            <p>{empleadoEscogido?.nombreCompleto}</p>
                        </div>

                        <div>
                            <p className="font-semibold">FECHA DE CESE ACTUAL:</p>
                            <p>{ultimoCese ? ultimoCese.split("T")[0] : "No disponible"}</p>
                        </div>

                        <div>
                            <p className="font-semibold">NUEVA FECHA DE CESE:</p>
                            <p>{nuevaFecha ? nuevaFecha.split("T")[0] : "No especificada"}</p>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between">
                        <button
                            onClick={() => setModificar(false)}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={Confirmar}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                            Confirmar
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de carga */}
            <Dialog open={loading}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Procesando actualización</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-blue-600 spin-reverse"></div>
                        </div>
                        <p className="mt-4 text-blue-600 font-medium">
                            Actualizando datos...
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de éxito */}
            <Dialog open={success}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Datos Actualizados</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 text-center">
                            Los datos del empleado se han actualizado correctamente.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};