import { DatePicker, Input } from "antd"
import { useState } from "react"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, RefreshCw, Trash } from "lucide-react";
const datosDependientes = [
    {
        id: 1,
        documentoTitular: "70451236",
        nombreDependiente: "JUAN CARLOS CALDERÓN PÉREZ",
        parentesco: "Hijo",
        regimenSalud: "Regular",
        plan: "Integral",
        eps: "Rímac",
        fechaInicio: "15/01/2025",
        fechaFin: "—",
        mesInicio: "ENERO 2025",
        mesFin: "VIGENTE",
    },
    {
        id: 2,
        documentoTitular: "70451236",
        nombreDependiente: "ELENA MARÍA VEGA SALAZAR",
        parentesco: "Cónyuge",
        regimenSalud: "Regular",
        plan: "Integral",
        eps: "Rímac",
        fechaInicio: "15/01/2025",
        fechaFin: "—",
        mesInicio: "ENERO 2025",
        mesFin: "VIGENTE",
    },
    {
        id: 3,
        documentoTitular: "74859326",
        nombreDependiente: "MIGUEL ÁNGEL GARCÍA TORRES",
        parentesco: "Hijo",
        regimenSalud: "Pensionista",
        plan: "Red Preferente",
        eps: "MAPFRE",
        fechaInicio: "10/11/2024",
        fechaFin: "09/11/2025",
        mesInicio: "NOVIEMBRE 2024",
        mesFin: "NOVIEMBRE 2025",
    },
    {
        id: 4,
        documentoTitular: "70984561",
        nombreDependiente: "CAMILA RODRÍGUEZ HUAMÁN",
        parentesco: "Hija",
        regimenSalud: "Independiente",
        plan: "Total Salud",
        eps: "Sanitas",
        fechaInicio: "20/05/2025",
        fechaFin: "—",
        mesInicio: "MAYO 2025",
        mesFin: "VIGENTE",
    },
];

export const ListarDependiente = () => {
    const [dateRange, setDateRange] = useState([])
    return (
        <div>
            <p className="text-center text-3xl font-semibold mb-6 bg-clip-text text-black">LISTAR AFILIADO</p>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-8xl mb-6"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <Input
                        placeholder="Buscar por nombre o DNI"
                        //prefix={<Search className="text-gray-400" />}
                        //value={searchTerm}
                        //onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-lg"
                    />
                    <DatePicker.RangePicker
                        onChange={setDateRange}
                        value={dateRange}
                        format="DD/MM/YYYY"
                        className="w-full rounded-lg"
                        placeholder={["Fecha inicio", "Fecha fin"]}
                    />
                    <Button
                        //onClick={handleClearFilters}
                        variant="outline"
                        className="rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Limpiar
                    </Button>
                    <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                        Ver Especiales
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Download className="h-4 w-4" />
                        Descargar Excel
                    </Button>
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full overflow-x-auto"
                >
                    <div className="overflow-y-auto max-h-[70vh] rounded-lg border border-gray-200 dark:border-gray-700 shadow">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                                    <th className="p-2 text-center text-sm font-medium">Documento</th>
                                    <th className="p-2 text-center text-sm font-medium">Nombre Completo</th>
                                    <th className="p-2 text-center text-sm font-medium">Parentesco</th>
                                    <th className="p-2 text-center text-sm font-medium">Regimen de salud</th>
                                    <th className="p-2 text-center text-sm font-medium">Plan</th>
                                    <th className="p-2 text-center text-sm font-medium">EPS</th>
                                    <th className="p-2 text-center text-sm font-medium">Fecha inicio</th>
                                    <th className="p-2 text-center text-sm font-medium">Fecha fin</th>
                                    <th className="p-2 text-center text-sm font-medium">Mes inicio</th>
                                    <th className="p-2 text-center text-sm font-medium">Mes fin</th>
                                    <th className="p-2 text-center text-sm font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosDependientes.map((fila, index) => (
                                    <motion.tr
                                        key={fila.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <td className="p-2 text-center text-sm">{fila.documentoTitular}</td>
                                        <td className="p-2 text-center text-sm">{fila.nombreDependiente}</td>
                                        <td className="p-2 text-center text-sm">{fila.parentesco}</td>
                                        <td className="p-2 text-center text-sm">{fila.regimenSalud}</td>
                                        <td className="p-2 text-center text-sm">{fila.plan}</td>
                                        <td className="p-2 text-center text-sm">{fila.eps}</td>
                                        <td className="p-2 text-center text-sm">{fila.fechaInicio}</td>
                                        <td className="p-2 text-center text-sm">{fila.fechaFin}</td>
                                        <td className="p-2 text-center text-sm">{fila.mesInicio}</td>
                                        <td className="p-2 text-center text-sm">{fila.mesFin}</td>
                                        <td className="p-2 text-center text-sm">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="ghost" size="icon" title="Ver">
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Editar" disabled>
                                                    <Pencil className="h-4 w-4 text-green-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Eliminar" disabled>
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </div>

    )
}

