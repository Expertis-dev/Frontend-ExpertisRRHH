"use client"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from 'antd'
import axios from "axios"
import { Trash2, Search, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export const Contratos = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContractType, setSelectedContractType] = useState("TODOS")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Opciones para el filtro de contrato
  const contractOptions = [
    { value: "TODOS", label: "Todos los contratos" },
    { value: "RIA", label: "RIA" },
    { value: "REGULAR", label: "Regular" },
    { value: "PRACTICANTE", label: "Practicante" }
  ]

  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/tipoContrato/mostrarTipoContrato`
        )
        if (response.status === 200) {
          setData(response.data.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)))
          setError(null)
        }
      } catch (err) {
        console.error("Error al obtener contratos:", err)
        setError("No se pudieron cargar los contratos")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filtrar datos basados en búsqueda y tipo de contrato
  const filteredData = useMemo(() => {
    if (!data) return []

    return data.filter(item => {
      const matchesSearch = searchQuery === "" ||
        item.nombreCompleto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.documento?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesContract = selectedContractType === "TODOS" ||
        item.tipoContrato?.toUpperCase() === selectedContractType.toUpperCase()

      return matchesSearch && matchesContract
    })
  }, [data, searchQuery, selectedContractType])

  const handleRefresh = () => {
    setSearchQuery("")
    setSelectedContractType("TODOS")
    setError(null)  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center text-2xl font-bold mb-6 text-gray-800 dark:text-white"
      >
        MODALIDAD DE CONTRATACIÓN
      </motion.h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="relative w-full max-w-md">
            <div className="relative flex items-center">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por DNI o nombre"
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={selectedContractType}
              style={{ width: '100%' }}
              onChange={setSelectedContractType}
              options={contractOptions}
              className="[&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
            />
          </div>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          className="mt-4 md:mt-0"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {/* Tabla de contratos */}
      <div className="overflow-y-auto max-h-[60vh] rounded-lg border border-gray-200 dark:border-gray-700 shadow">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
              <th className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-600">DNI</th>
              <th className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-600">NOMBRE COMPLETO</th>
              <th className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-600">TIPO DE CONTRATO</th>
              <th className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-600">MES INICIO</th>
              <th className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-600">MES FIN</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((contract, index) => (
                <motion.tr
                  key={`${contract.documento}-${contract.tipoContrato}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 font-medium">
                    {contract.documento}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                    {contract.nombreCompleto}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${contract.tipoContrato === 'RIA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        contract.tipoContrato === 'REGULAR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                      {contract.tipoContrato}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                    {contract.mesInicio ? contract.mesInicio.split("T")[0] : "-"}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                    {contract.mesFin ? contract.mesFin.split("T")[0] : "-"}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}