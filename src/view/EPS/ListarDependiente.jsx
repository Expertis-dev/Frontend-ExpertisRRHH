import { DatePicker, Input, Card, Tag, Empty } from "antd"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Users, Filter, FileText } from "lucide-react";
import { exportToExcel } from "@/logic/ExportarDocumento";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import { toast } from "sonner";

dayjs.extend(isBetween);
dayjs.extend(utc);

const { RangePicker } = DatePicker;
const { Search: SearchInput } = Input;

export const ListarDependiente = () => {
    const [dateRange, setDateRange] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [allDependientes, setAllDependientes] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchDependientes = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarDependientes`);
                const datos = response.data.filter(dependiente => dependiente.mesFin === null);
                setAllDependientes(datos);
            } catch (error) {
                console.error("Error al obtener los dependientes:", error);
                toast.error("Error al cargar la lista de dependientes");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDependientes();
    }, []);

    // Filtrado de datos derivado del estado original
    const filteredDependientes = useMemo(() => {
        let filtered = [...allDependientes];

        // Filtro por búsqueda
        if (searchTerm.trim() !== "") {
            const lowSearch = searchTerm.toLowerCase();
            filtered = filtered.filter((dependiente) =>
                (dependiente.nombreAfiliado || "").toLowerCase().includes(lowSearch) ||
                (dependiente.docTitular || "").toLowerCase().includes(lowSearch) ||
                (dependiente.nombreTitular || "").toLowerCase().includes(lowSearch)
            );
        }

        // Filtro por fecha
        if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
            const [start, end] = dateRange;
            filtered = filtered.filter((a) => {
                if (!a.mesInicio) return false;
                // Intentamos parsear la fecha que viene del API
                const d = dayjs(a.mesInicio);
                return d.isValid() && d.isBetween(start.startOf("day"), end.endOf("day"), null, "[]");
            });
        }
        return filtered;
    }, [searchTerm, dateRange, allDependientes]);

    const handleClearFilters = () => {
        setSearchTerm("")
        setDateRange([])
    }

    const getPlanColor = (plan) => {
        const planColors = {
            'Integral': "blue",
            'Red Preferente': "purple",
            'Total Salud': "green",
            'Clásico': "orange",
        };
        return planColors[plan] || 'default';
    }
    const getParentescoColor = (parentesco) => {
        const parentescoColors = {
            'Hijo': 'green',
            'Cónyuge': 'red',
            'Hija': 'blue',
            'MADRE': 'pink',
            'HERMANO': 'orange',
            'OTRO': 'gray',
        };
        return parentescoColors[parentesco] || 'default';
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        LISTA DE DEPENDIENTES
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Gestiona y consulta la información de los dependientes registrados
                </p>
            </motion.div>

            {/* Filtros y Controles */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card
                    className="shadow-sm border-0"
                    title={
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <span className="font-semibold">Filtros y Acciones</span>
                        </div>
                    }
                    extra={
                        <div className="flex flex-wrap gap-3">
                            <Button
                                disabled={filteredDependientes.length === 0}
                                onClick={() => exportToExcel(filteredDependientes, "LISTA DE DEPENDIENTES")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Download className="h-4 w-4" />
                                Descargar Excel
                            </Button>
                        </div>
                    }
                >
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div>
                                <p className="block text-sm font-medium text-gray-700 text-start">
                                    Buscar dependiente
                                </p>
                                <SearchInput
                                    placeholder="Buscar por nombre o documento del titular..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    allowClear
                                />
                            </div>

                            <div>
                                <p className="block text-sm font-medium text-gray-700 text-start">
                                    Rango de fechas
                                </p>
                                <RangePicker
                                    onChange={setDateRange}
                                    value={dateRange}
                                    format="DD/MM/YYYY"
                                    className="w-full"
                                    placeholder={["Fecha inicio", "Fecha fin"]}
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <Button
                                    onClick={handleClearFilters}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Tabla de resultados */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Card
                    className="shadow-sm border-0"
                    title={
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-gray-600" />
                            <span className="font-semibold">Lista de Dependientes</span>
                            <Tag color="blue">
                                {filteredDependientes.length} registros
                            </Tag>
                        </div>
                    }
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Cargando dependientes...</p>
                        </div>
                    ) : filteredDependientes.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No se encontraron dependientes"
                        >
                            <Button onClick={handleClearFilters}>
                                Limpiar filtros
                            </Button>
                        </Empty>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="overflow-y-auto max-h-[60vh] rounded-lg border">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Documento</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Nombre del Dependiente</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Parentesco</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Régimen de Salud</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">EPS</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Fecha Inicio</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Fecha Fin</th>
                                            <th className="p-3 text-center text-sm font-semibold text-gray-700">Nombre del Afiliado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDependientes.map((fila, index) => (
                                            <motion.tr
                                                key={`${fila.docTitular}-${fila.nombreAfiliado}-${index}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                                className="bg-white hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                            >
                                                <td className="p-3 text-sm font-medium text-gray-900">
                                                    {fila.docTitular}
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {fila.nombreAfiliado}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Tag color={getParentescoColor(fila.parentesco)}>
                                                        {fila.parentesco}
                                                    </Tag>
                                                </td>
                                                <td className="p-3 text-sm text-gray-700">
                                                    {fila.tipo}
                                                </td>
                                                <td className="p-3">
                                                    <Tag color={getPlanColor(fila.nombrePlan)}>
                                                        {fila.nombrePlan}
                                                    </Tag>
                                                </td>
                                                <td className="p-3 text-sm text-gray-700">
                                                    {fila.eps}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {fila.mesInicio ? dayjs.utc(fila.mesInicio).format('DD/MM/YYYY') : '-'}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {fila.mesFin ? dayjs.utc(fila.mesFin).format('DD/MM/YYYY') : 'VIGENTE'}
                                                </td>
                                                <td className="p-2">
                                                    <div className="text-sm text-center font-medium text-gray-900">
                                                        {fila.nombreTitular}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    )
}