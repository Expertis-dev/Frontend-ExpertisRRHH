import { DatePicker, Input } from "antd"
import { useState } from "react"
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, RefreshCw, Trash } from "lucide-react";
const datosAfiliados = [
  {
    id: 1,
    documento: "70451236",
    nombreCompleto: "CARLOS CALDERÓN VEGA",
    regimenSalud: "Regular",
    plan: "Integral",
    eps: "Rímac",
    nroDependientes: 2,
    fechaInicio: "15/01/2025",
    fechaFin: "—",
    mesInicio: "ENERO 2025",
    mesFin: "VIGENTE",
  },
  {
    id: 2,
    documento: "76123458",
    nombreCompleto: "MARÍA FERNÁNDEZ LÓPEZ",
    regimenSalud: "Regular",
    plan: "Clásico",
    eps: "Pacífico",
    nroDependientes: 0,
    fechaInicio: "01/03/2025",
    fechaFin: "—",
    mesInicio: "MARZO 2025",
    mesFin: "VIGENTE",
  },
  {
    id: 3,
    documento: "74859326",
    nombreCompleto: "JOSÉ LUIS GARCÍA MENDOZA",
    regimenSalud: "Pensionista",
    plan: "Red Preferente",
    eps: "MAPFRE",
    nroDependientes: 1,
    fechaInicio: "10/11/2024",
    fechaFin: "09/11/2025",
    mesInicio: "NOVIEMBRE 2024",
    mesFin: "NOVIEMBRE 2025",
  },
  {
    id: 4,
    documento: "70984561",
    nombreCompleto: "ANA MARÍA RODRÍGUEZ SALAZAR",
    regimenSalud: "Independiente",
    plan: "Total Salud",
    eps: "Sanitas",
    nroDependientes: 3,
    fechaInicio: "20/05/2025",
    fechaFin: "—",
    mesInicio: "MAYO 2025",
    mesFin: "VIGENTE",
  },
  {
    id: 5,
    documento: "71569324",
    nombreCompleto: "PEDRO MIGUEL QUISPE FLORES",
    regimenSalud: "Regular",
    plan: "Clásico",
    eps: "Rímac",
    nroDependientes: 0,
    fechaInicio: "05/02/2024",
    fechaFin: "04/02/2025",
    mesInicio: "FEBRERO 2024",
    mesFin: "FEBRERO 2025",
  },
  {
    id: 6,
    documento: "73214569",
    nombreCompleto: "LUCÍA ALEJANDRA HUAMÁN DÍAZ",
    regimenSalud: "Regular",
    plan: "Integral",
    eps: "Pacífico",
    nroDependientes: 2,
    fechaInicio: "12/07/2025",
    fechaFin: "—",
    mesInicio: "JULIO 2025",
    mesFin: "VIGENTE",
  },
  {
    id: 7,
    documento: "70123459",
    nombreCompleto: "DIEGO ARIAS CASTRO",
    regimenSalud: "Regular",
    plan: "Platinum",
    eps: "MAPFRE",
    nroDependientes: 1,
    fechaInicio: "28/09/2024",
    fechaFin: "—",
    mesInicio: "SEPTIEMBRE 2024",
    mesFin: "VIGENTE",
  },
  {
    id: 8,
    documento: "74561238",
    nombreCompleto: "SOFÍA VARGAS PONCE",
    regimenSalud: "Independiente",
    plan: "Bronce",
    eps: "Sanitas",
    nroDependientes: 0,
    fechaInicio: "03/06/2025",
    fechaFin: "—",
    mesInicio: "JUNIO 2025",
    mesFin: "VIGENTE",
  },
  {
    id: 9,
    documento: "71652349",
    nombreCompleto: "MARIO ENRIQUE CHÁVEZ REYES",
    regimenSalud: "Regular",
    plan: "Clásico",
    eps: "Rímac",
    nroDependientes: 4,
    fechaInicio: "17/12/2023",
    fechaFin: "16/12/2024",
    mesInicio: "DICIEMBRE 2023",
    mesFin: "DICIEMBRE 2024",
  },
  {
    id: 10,
    documento: "70894512",
    nombreCompleto: "VALERIA NOEMÍ PAREDES LEÓN",
    regimenSalud: "Regular",
    plan: "Integral",
    eps: "Pacífico",
    nroDependientes: 2,
    fechaInicio: "09/04/2025",
    fechaFin: "—",
    mesInicio: "ABRIL 2025",
    mesFin: "VIGENTE",
  },
  {
    id: 11,
    documento: "72458963",
    nombreCompleto: "ALONSO MARTÍNEZ RIVERA",
    regimenSalud: "Pensionista",
    plan: "Red Preferente",
    eps: "MAPFRE",
    nroDependientes: 0,
    fechaInicio: "22/10/2023",
    fechaFin: "21/10/2024",
    mesInicio: "OCTUBRE 2023",
    mesFin: "OCTUBRE 2024",
  },
  {
    id: 12,
    documento: "71996324",
    nombreCompleto: "KARLA JESÚS SALINAS ROMERO",
    regimenSalud: "Regular",
    plan: "Total Salud",
    eps: "Sanitas",
    nroDependientes: 1,
    fechaInicio: "30/08/2025",
    fechaFin: "—",
    mesInicio: "AGOSTO 2025",
    mesFin: "VIGENTE",
  },
];
export const ListarAfiliado = () => {
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
                  <th className="p-2 text-center text-sm font-medium">Regimen de salud</th>
                  <th className="p-2 text-center text-sm font-medium">Plan</th>
                  <th className="p-2 text-center text-sm font-medium">EPS</th>
                  <th className="p-2 text-center text-sm font-medium">Nº Dependientes</th>
                  <th className="p-2 text-center text-sm font-medium">Fecha inicio</th>
                  <th className="p-2 text-center text-sm font-medium">Fecha fin</th>
                  <th className="p-2 text-center text-sm font-medium">Mes inicio</th>
                  <th className="p-2 text-center text-sm font-medium">Mes fin</th>
                  <th className="p-2 text-center text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datosAfiliados.map((fila, index) => (
                  <motion.tr
                    key={`${fila.documento}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="p-1 text-center text-sm">{fila.documento}</td>
                    <td className="p-1 text-center text-sm">{fila.nombreCompleto}</td>
                    <td className="p-1 text-center text-sm">{fila.regimenSalud}</td>
                    <td className="p-1 text-center text-sm">{fila.plan}</td>
                    <td className="p-1 text-center text-sm">{fila.eps}</td>
                    <td className="p-1 text-center text-sm">{fila.nroDependientes}</td>
                    <td className="p-1 text-center text-sm">{fila.fechaInicio}</td>
                    <td className="p-1 text-center text-sm">{fila.fechaFin}</td>
                    <td className="p-1 text-center text-sm">{fila.mesInicio}</td>
                    <td className="p-1 text-center text-sm">{fila.mesFin}</td>
                    <td className="p-1 text-center text-sm">
                      <div className="grid grid-cols-3 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver"
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          disabled={true}

                        >
                          <Pencil className="h-4 w-4 text-green-500" />
                        </Button>

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
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>

  )
}