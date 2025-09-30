import { DatePicker, Input, Card, Tag, Empty } from "antd"
import { useMemo, useState } from "react"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Users, Filter, FileText } from "lucide-react";
import { datosDependientes } from "../../data/Info";

const { RangePicker } = DatePicker;
const { Search: SearchInput } = Input;

export const ListarDependiente = () => {
    const [dateRange, setDateRange] = useState([])
    const [datosFiltrados, setDatosFiltrados] = useState(datosDependientes)
    const [searchTerm, setSearchTerm] = useState("")

    // Filtrado de datos
    useMemo(() => {
        let filteredData = datosDependientes;

        // Filtro por búsqueda
        if (searchTerm.trim() !== "") {
            filteredData = filteredData.filter((dependiente) =>
                dependiente.nombreDependiente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dependiente.documentoTitular.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dependiente.eps?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por fecha (si se implementara)
        if (dateRange && dateRange.length === 2) {
            // Aquí podrías agregar lógica de filtrado por fecha
            // filteredData = filteredData.filter(dependiente => ...)
        }

        setDatosFiltrados(filteredData)
    }, [searchTerm, dateRange])

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
        <div className="space-y-6 p-4">
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
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                <FileText className="h-4 w-4" />
                                Ver Especiales
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                <Download className="h-4 w-4" />
                                Descargar Excel
                            </Button>
                        </div>
                    }
                >
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div>
                                <p className="block text-sm font-medium text-gray-700">
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
                                <p className="block text-sm font-medium text-gray-700">
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
                                    className="flex-1 h-8"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Limpiar
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
                                {datosFiltrados.length} registros
                            </Tag>
                        </div>
                    }
                >
                    {datosFiltrados.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No se encontraron dependientes"
                            className="py-12"
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
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Documento Titular</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Nombre del Dependiente</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Parentesco</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Régimen de Salud</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">EPS</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Fecha Inicio</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Fecha Fin</th>
                                            <th className="p-3 text-center text-sm font-semibold text-gray-700">Nobre del Afiliado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datosFiltrados.map((fila, index) => (
                                            <motion.tr
                                                key={`${fila.documentoTitular}-${fila.nombreDependiente}-${index}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                                className="bg-white hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                            >
                                                <td className="p-3 text-sm font-medium text-gray-900">
                                                    {fila.documentoTitular}
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {fila.nombreDependiente}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Tag color={getParentescoColor(fila.parentesco)}>
                                                        {fila.parentesco}
                                                    </Tag>
                                                </td>
                                                <td className="p-3 text-sm text-gray-700">
                                                    {fila.regimenSalud}
                                                </td>
                                                <td className="p-3">
                                                    <Tag color={getPlanColor(fila.plan)}>
                                                        {fila.plan}
                                                    </Tag>
                                                </td>
                                                <td className="p-3 text-sm text-gray-700">
                                                    {fila.eps}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {fila.fechaInicio}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {fila.fechaFin || 'Indefinido'}
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