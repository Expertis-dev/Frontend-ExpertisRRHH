"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const RetencionJudicial = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [originalData, setOriginalData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const [formData, setFormData] = useState({
    dni: "",
    retencion: "",
    mesInicio: "",
  })

  // Datos de ejemplo para la tabla
  useEffect(() => {
    const initialData = [
      {
        id: 1,
        dni: "72522562",
        codEmpleado: "111111",
        retencion: "30%",
        mesInicio: "01-Ene-25",
        mesFin: "",
        validacion: 1,
      },
      {
        id: 2,
        dni: "48413516",
        codEmpleado: "111111",
        retencion: "30%",
        mesInicio: "01-Ene-25",
        mesFin: "",
        validacion: 1,
      },
      {
        id: 3,
        dni: "84784578",
        codEmpleado: "1234563",
        retencion: "25%",
        mesInicio: "01-Feb-25",
        mesFin: "",
        validacion: 1,
      },
      {
        id: 4,
        dni: "48521259",
        codEmpleado: "5845455",
        retencion: "15%",
        mesInicio: "01-Mar-25",
        mesFin: "",
        validacion: 1,
      },
    ]
    setOriginalData(initialData)
    setFilteredData(initialData)
  }, [])

  // Generar opciones de meses (los próximos 12 meses)
  const generateMonthOptions = () => {
    const months = []
    const date = new Date()
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    for (let i = 0; i < 12; i++) {
      const year = date.getFullYear().toString().slice(-2)
      const month = monthNames[date.getMonth()]
      months.push(`01-${month}-${year}`)
      date.setMonth(date.getMonth() + 1)
    }
    
    return months
  }

  const monthOptions = generateMonthOptions()

  const handleSearch = () => {
    if (searchQuery.length !== 8) return
    
    const resultados = originalData.filter(item => item.dni === searchQuery)
    
    if (resultados.length === 0) {
      alert("No se encontraron resultados para este DNI")
      setFilteredData([])
    } else {
      setFilteredData(resultados)
    }
  }

  const handleResetSearch = () => {
    setSearchQuery("")
    setFilteredData(originalData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddClick = () => {
    setIsAddModalOpen(true)
  }

  const handleAddSubmit = () => {
    setIsAddModalOpen(false)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false)
    setIsLoadingModalOpen(true)

    setTimeout(() => {
      setIsLoadingModalOpen(false)

      const newRecord = {
        id: originalData.length + 1,
        dni: formData.dni,
        codEmpleado: "111111",
        retencion: formData.retencion.includes("%") ? formData.retencion : `${formData.retencion}%`,
        mesInicio: formData.mesInicio,
        mesFin: "",
        validacion: 1,
      }

      const updatedData = [newRecord, ...originalData]
      setOriginalData(updatedData)
      setFilteredData(updatedData)
      setIsSuccessModalOpen(true)

      setFormData({
        dni: "",
        retencion: "",
        mesInicio: "",
      })
    }, 1500)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in">
      <h1 className="text-center text-2xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text">
        GESTIÓN DE RETENCIÓN JUDICIAL
      </h1>

      <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
        {/* Campo de búsqueda */}
        <div className="relative flex items-center rounded-lg transition-all duration-300 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-transparent w-full max-w-xs bg-gray-50 hover:bg-gray-100 focus-within:bg-white">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              if (e.target.value === "" || /^\d{0,8}$/.test(e.target.value)) {
                setSearchQuery(e.target.value)
              }
            }}
            className="border-none bg-transparent focus:ring-0 flex-1 py-[6.5px] px-3 text-gray-700 rounded-l-lg focus:outline-none"
            placeholder="Buscar por DNI"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            aria-label="Buscar por número de DNI"
            maxLength={8}
          />
          <Button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg rounded-l-none transition-colors duration-300 py-2 px-3 cursor-pointer"
            aria-label="Buscar"
            disabled={searchQuery.length !== 8}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchQuery && (
          <Button 
            onClick={handleResetSearch}
            variant="outline"
            className="text-gray-600 hover:bg-gray-200"
          >
            Limpiar búsqueda
          </Button>
        )}

        {/* Botón Agregar */}
        <Button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          + Agregar Retención
        </Button>
      </div>

      {/* Tabla de Retenciones Judiciales */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-700 to-gray-600 text-white">
              <th className="py-3 px-4 text-center border border-gray-600 font-semibold">ID</th>
              <th className="py-3 px-4 text-center border border-gray-600 font-semibold">DNI</th>
              <th className="py-3 px-4 text-center border border-gray-600 font-semibold">COD. EMPLEADO</th>
              <th className="py-3 px-4 text-center border border-gray-600 font-semibold">RETENCIÓN</th>
              <th className="py-3 px-4 text-center border border-gray-600 font-semibold">MES INICIO</th>
              <th className="py-3 px-4 text-center border border-gray-600 font-semibold">MES FIN</th>
              <th className="py-3 px-4 text-center border border-gray-600 font-semibold">VALIDACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((retention, index) => (
                <tr
                  key={index}
                  className={`transition-colors duration-200 ${index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"}`}
                >
                  <td className="py-3 px-4 text-center border border-gray-200">{retention.id}</td>
                  <td className="py-3 px-4 text-center border border-gray-200 font-medium">{retention.dni}</td>
                  <td className="py-3 px-4 text-center border border-gray-200">{retention.codEmpleado}</td>
                  <td className="py-3 px-4 text-center border border-gray-200 font-semibold text-blue-600">
                    {retention.retencion}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-200">{retention.mesInicio}</td>
                  <td className="py-3 px-4 text-center border border-gray-200">
                    {retention.mesFin || "-"}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-200">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        retention.validacion === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {retention.validacion === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar nueva retención judicial */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl text-gray-800">
              NUEVA RETENCIÓN JUDICIAL
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="dni" className="text-right font-medium text-gray-700">
                DNI
              </label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese 8 dígitos"
                  maxLength={8}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="retencion" className="text-right font-medium text-gray-700">
                RETENCIÓN
              </label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="retencion"
                  name="retencion"
                  value={formData.retencion}
                  onChange={handleInputChange}
                  className="focus:ring-2 focus:ring-blue-500"
                  placeholder="Ejemplo: 30%"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="mesInicio" className="text-right font-medium text-gray-700">
                MES INICIO
              </label>
              <div className="col-span-3 space-y-1">
                <select
                  id="mesInicio"
                  name="mesInicio"
                  value={formData.mesInicio}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione mes</option>
                  {monthOptions.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white shadow-sm transition-colors duration-300 w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleAddSubmit}
              disabled={!formData.dni || !formData.retencion || !formData.mesInicio}
              className={`${
                formData.dni && formData.retencion && formData.mesInicio
                  ? "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white transition-all duration-300 w-full sm:w-auto`}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl text-gray-800">
              CONFIRMAR REGISTRO
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4 text-center text-gray-700">¿Está seguro de registrar la siguiente retención judicial?</p>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <div className="grid grid-cols-2 gap-3">
                <p className="font-semibold text-gray-700">DNI:</p>
                <p className="text-gray-800">{formData.dni}</p>

                <p className="font-semibold text-gray-700">Retención:</p>
                <p className="text-gray-800">{formData.retencion.includes("%") ? formData.retencion : `${formData.retencion}%`}</p>

                <p className="font-semibold text-gray-700">Mes Inicio:</p>
                <p className="text-gray-800">{formData.mesInicio}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white shadow-sm transition-colors duration-300 w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleConfirmSubmit}
              className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de carga */}
      <Dialog open={isLoadingModalOpen} onOpenChange={setIsLoadingModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg" showClose={false}>
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p className="text-center text-gray-700 animate-pulse">Procesando registro...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl text-gray-800">
              ¡REGISTRO EXITOSO!
            </DialogTitle>
          </DialogHeader>

          <Alert className="bg-green-50 border-green-200 flex items-center gap-3 animate-fade-in">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <AlertDescription className="text-green-700">
              Se agregó la nueva retención judicial correctamente.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full"
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}