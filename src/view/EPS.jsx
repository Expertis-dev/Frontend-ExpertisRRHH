"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const EPS = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredData, setFilteredData] = useState([])
  const [isValid, setIsValid] = useState(false)

  // Datos de ejemplo para la tabla
  const epsData = [
    {
      dni: "48413516",
      employeeCode: "111111",
      planEps: "154",
      dependiente: "1",
      descuento: "SI",
      epsPotestativo: "",
      mesInicio: "01/01/2025",
      mesFin: "01/02/2025",
    },
    {
      dni: "48413516",
      employeeCode: "111111",
      planEps: "273",
      dependiente: "1",
      descuento: "SI",
      epsPotestativo: "",
      mesInicio: "01/03/2025",
      mesFin: "",
    },
    {
      dni: "84784578",
      employeeCode: "1234563",
      planEps: "308",
      dependiente: "2",
      descuento: "NO",
      epsPotestativo: "",
      mesInicio: "01/01/2025",
      mesFin: "",
    },
    {
      dni: "48521259",
      employeeCode: "5845455",
      planEps: "165",
      dependiente: "1",
      descuento: "SI",
      epsPotestativo: "",
      mesInicio: "01/01/2025",
      mesFin: "",
    },
  ]

  // Inicializar datos filtrados
  useEffect(() => {
    setFilteredData(epsData)
  }, [])

  // Filtrar datos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredData(epsData)
    } else if (searchQuery.length === 8) {
      const results = epsData.filter(item => item.dni.includes(searchQuery))
      setFilteredData(results)
    }
  }, [searchQuery])

  const handleSearchChange = (e) => {
    const value = e.target.value
    // Validar que solo sean números y máximo 8 dígitos
    if (/^\d*$/.test(value) && value.length <= 8) {
      setSearchQuery(value)
      setIsValid(value.length === 8)
    }
  }

  const handleSearch = () => {
    if (isValid) {
      const results = epsData.filter(item => item.dni.includes(searchQuery))
      setFilteredData(results)
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('es-ES')
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-center text-2xl font-semibold mb-4 text-gray-800">EPS</h1>

      {/* Campo de búsqueda */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 w-1/2" >
        <div className="flex items-center gap-2 w-full">
          <span className="font-medium text-gray-700 whitespace-nowrap min-w-[90px]">Documento:</span>
          <div className="relative w-full">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Ingrese DNI (8 dígitos)"
              maxLength={8}
              inputMode="numeric"
              pattern="\d*"
              className="w-full"
            />
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto transition-all min-w-[120px]"
          onClick={handleSearch}
          disabled={!isValid}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>

      {/* Tabla de EPS */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="py-3 px-4 text-center border border-gray-600">DNI</th>
              <th className="py-3 px-4 text-center border border-gray-600">COD. EMPLEADO</th>
              <th className="py-3 px-4 text-center border border-gray-600">PLAN EPS</th>
              <th className="py-3 px-4 text-center border border-gray-600">DEPENDIENTE</th>
              <th className="py-3 px-4 text-center border border-gray-600">DESCUENTO</th>
              <th className="py-3 px-4 text-center border border-gray-600">EPS POTESTATIVO</th>
              <th className="py-3 px-4 text-center border border-gray-600">INICIO</th>
              <th className="py-3 px-4 text-center border border-gray-600">FIN</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((eps, index) => (
                <tr 
                  key={`${eps.dni}-${eps.employeeCode}-${index}`} 
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2 px-4 text-center border border-gray-300">{eps.dni}</td>
                  <td className="py-2 px-4 text-center border border-gray-300">{eps.employeeCode}</td>
                  <td className="py-2 px-4 text-center border border-gray-300">{eps.planEps}</td>
                  <td className="py-2 px-4 text-center border border-gray-300">{eps.dependiente}</td>
                  <td className={`py-2 px-4 text-center border border-gray-300 font-medium ${
                    eps.descuento === "SI" ? "text-green-600" : "text-red-600"
                  }`}>
                    {eps.descuento}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    {eps.epsPotestativo || "-"}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    {formatDate(eps.mesInicio)}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    {eps.mesFin ? formatDate(eps.mesFin) : "Actual"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500 border border-gray-300">
                  No se encontraron resultados para el DNI: {searchQuery}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}