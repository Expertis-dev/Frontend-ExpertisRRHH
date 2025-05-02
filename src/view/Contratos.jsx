"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const Contratos = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedContractType, setSelectedContractType] = useState("TODOS")
  const [filteredData, setFilteredData] = useState([])
  const dropdownRef = useRef(null)

  // Datos de ejemplo para la tabla
  const contractData = [
    {
      dni: "48512478",
      employeeCode: "123456",
      contractType: "REGULAR",
      startDate: "01/04/2023",
      endDate: "01/04/2024",
    },
    {
      dni: "48512478",
      employeeCode: "123456",
      contractType: "RIA",
      startDate: "01/04/2022",
      endDate: "01/04/2023",
    },
    {
      dni: "87654321",
      employeeCode: "123457",
      contractType: "REGULAR",
      startDate: "01/04/2023",
      endDate: "01/04/2024",
    },
    {
      dni: "48512388",
      employeeCode: "654321",
      contractType: "CAS",
      startDate: "01/04/2023",
      endDate: "01/04/2024",
    },
  ]
  useEffect(() => {
    setFilteredData(contractData)
  }, [])

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value
    // Validar que solo sean números y máximo 8 dígitos
    if (/^\d*$/.test(value) && value.length <= 8) {
      setSearchQuery(value)
    }
  }

  // Filtrar datos cuando cambian los filtros
  useEffect(() => {
    let result = contractData
    
    // Filtrar por DNI si hay búsqueda
    if (searchQuery.length >= 1) {
      result = result.filter(item => item.dni.includes(searchQuery))
    }
    
    // Filtrar por tipo de contrato si no es "TODOS"
    if (selectedContractType !== "TODOS") {
      result = result.filter(item => item.contractType === selectedContractType)
    }
    
    setFilteredData(result)
  }, [searchQuery, selectedContractType])

  const handleContractTypeSelect = (type) => {
    setSelectedContractType(type)
    setIsDropdownOpen(false)
  }

  // Validar si el DNI tiene 8 dígitos para habilitar la búsqueda
  const isValid = searchQuery.length === 8

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-center text-2xl font-bold mb-6 text-gray-800">
        MODALIDAD DE CONTRATACION
      </h1>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        {/* Campo de búsqueda */}
        <div className="flex flex-col sm:flex-row items-center gap-4 ">
          <div className="flex items-center gap-2 w-full">
            <span className="font-medium text-gray-700 whitespace-nowrap">Documento:</span>
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
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto transition-all"
            disabled={!isValid}
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>

        {/* Dropdown de tipo de contrato */}
        <div className="relative" ref={dropdownRef}>
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="outline"
            className="bg-gray-50 border-gray-300 text-gray-700 flex items-center justify-between w-full md:w-40"
          >
            <span className="truncate">{selectedContractType}</span>
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </Button>

          {isDropdownOpen && (
            <Card className="absolute right-0 mt-1 w-40 z-10 border border-gray-200 shadow-lg">
              <div className="py-1">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedContractType === "TODOS" ? "bg-gray-100 font-medium" : ""}`}
                  onClick={() => handleContractTypeSelect("TODOS")}
                >
                  TODOS
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t border-gray-100 ${selectedContractType === "REGULAR" ? "bg-gray-100 font-medium" : ""}`}
                  onClick={() => handleContractTypeSelect("REGULAR")}
                >
                  REGULAR
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t border-gray-100 ${selectedContractType === "CAS" ? "bg-gray-100 font-medium" : ""}`}
                  onClick={() => handleContractTypeSelect("RIA")}
                >
                  RIA
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t border-gray-100 ${selectedContractType === "PRACTICANTE" ? "bg-gray-100 font-medium" : ""}`}
                  onClick={() => handleContractTypeSelect("PRACTICANTE")}
                >
                  PRACTICANTE
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tabla de contratos */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-500 text-white">
              <th className="py-3 px-4 text-left border border-gray-600">DNI</th>
              <th className="py-3 px-4 text-left border border-gray-600">COD. EMPLEADO</th>
              <th className="py-3 px-4 text-left border border-gray-600">TIPO DE CONTRATO</th>
              <th className="py-3 px-4 text-left border border-gray-600">INICIO</th>
              <th className="py-3 px-4 text-left border border-gray-600">SALIDA</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((contract, index) => (
                <tr 
                  key={`${contract.dni}-${contract.employeeCode}-${index}`} 
                  className="bg-white"
                >
                  <td className="py-2 px-4 border border-gray-300">{contract.dni}</td>
                  <td className="py-2 px-4 border border-gray-300">{contract.employeeCode}</td>
                  <td className="py-2 px-4 border border-gray-300">{contract.contractType}</td>
                  <td className="py-2 px-4 border border-gray-300">{contract.startDate}</td>
                  <td className="py-2 px-4 border border-gray-300">{contract.endDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
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