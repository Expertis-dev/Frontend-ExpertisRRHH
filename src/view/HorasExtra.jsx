"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

export const HorasExtra = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [filteredData, setFilteredData] = useState([])

  const [formData, setFormData] = useState({
    dni: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
  })

  // Datos de ejemplo para la tabla
  const [overtimeData, setOvertimeData] = useState([
    {
      dni: "72522562",
      fecha: "21/05/2024",
      horaInicio: "17:00",
      cantidadHoras: "2",
      horaFin: "19:00",
      codEmpleado: "72413508-2020-10",
    },
    {
      dni: "72522562",
      fecha: "22/05/2024",
      horaInicio: "18:00",
      cantidadHoras: "3",
      horaFin: "21:00",
      codEmpleado: "72413508-2020-10",
    },
    {
      dni: "72522563",
      fecha: "21/05/2024",
      horaInicio: "16:00",
      cantidadHoras: "1",
      horaFin: "17:00",
      codEmpleado: "72413508-2020-11",
    },
    {
      dni: "72522564",
      fecha: "23/05/2024",
      horaInicio: "19:00",
      cantidadHoras: "4",
      horaFin: "23:00",
      codEmpleado: "72413508-2020-12",
    },
  ])

  // Inicializar datos filtrados
  useEffect(() => {
    setFilteredData(overtimeData)
  }, [overtimeData])

  // Filtrar datos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredData(overtimeData)
    } else {
      const results = overtimeData.filter(item =>
        item.dni.includes(searchQuery) ||
        item.codEmpleado.includes(searchQuery)
      )
      setFilteredData(results)
    }
  }, [searchQuery, overtimeData])

  // Validar formulario cuando cambian los datos
  useEffect(() => {
    const { dni, fecha, horaInicio, horaFin } = formData
    setFormIsValid(
      dni.length === 8 &&
      fecha !== "" &&
      horaInicio !== "" &&
      horaFin !== "" &&
      new Date(`2000-01-01T${horaFin}`) > new Date(`2000-01-01T${horaInicio}`)
    )
  }, [formData])

  const handleSearchChange = (e) => {
    const value = e.target.value
    if (/^\d*$/.test(value) && value.length <= 8) {
      setSearchQuery(value)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddClick = () => {
    setIsAddModalOpen(true)
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    setIsAddModalOpen(false)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false)
    setIsLoadingModalOpen(true)

    // Simular proceso de carga
    setTimeout(() => {
      setIsLoadingModalOpen(false)

      // Calcular cantidad de horas
      const inicio = new Date(`2000-01-01T${formData.horaInicio}`)
      const fin = new Date(`2000-01-01T${formData.horaFin}`)
      const diffHours = Math.round((fin - inicio) / (1000 * 60 * 60))

      // Formatear fecha
      const fechaFormateada = new Date(formData.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      // Agregar nuevo registro
      const newRecord = {
        dni: formData.dni,
        fecha: fechaFormateada,
        horaInicio: formData.horaInicio,
        cantidadHoras: diffHours.toString(),
        horaFin: formData.horaFin,
        codEmpleado: `${formData.dni}-${new Date().getFullYear()}`,
      }

      setOvertimeData([newRecord, ...overtimeData])
      setIsSuccessModalOpen(true)

      // Limpiar formulario
      setFormData({
        dni: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
      })
    }, 1500)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-2xl font-bold mb-8 text-gray-800"
      >
        GESTIÓN DE HORAS EXTRA
      </motion.h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        {/* Campo de búsqueda */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative w-full md:w-auto"
        >
          <div className="relative flex items-center">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por DNI o Código"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={8}
            />
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          </div>
        </motion.div>

        {/* Botón Agregar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleAddClick}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Horas Extra
          </Button>
        </motion.div>
      </div>

      {/* Tabla de Horas Extra */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto rounded-xl shadow-lg border border-gray-200"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-700 to-gray-800">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">DNI</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">FECHA</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">INICIO</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">HORAS</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">FIN</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">CÓDIGO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((overtime, index) => (
                <motion.tr
                  key={`${overtime.dni}-${overtime.fecha}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">{overtime.dni}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{overtime.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-medium">{overtime.horaInicio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {overtime.cantidadHoras} hrs
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">{overtime.horaFin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{overtime.codEmpleado}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Modal para agregar nueva hora extra */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">

          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">
              REGISTRAR HORAS EXTRA
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                  DNI del Empleado
                </label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  placeholder="Ingrese 8 dígitos"
                  maxLength={8}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700">
                    Hora Inicio
                  </label>
                  <Input
                    id="horaInicio"
                    name="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700">
                    Hora Fin
                  </label>
                  <Input
                    id="horaFin"
                    name="horaFin"
                    type="time"
                    value={formData.horaFin}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {formData.horaInicio && formData.horaFin && new Date(`2000-01-01T${formData.horaFin}`) <= new Date(`2000-01-01T${formData.horaInicio}`) && (
                <Alert variant="destructive" className="text-sm flex text-center">
                  La hora de fin debe ser mayor a la hora de inicio
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formIsValid}
                className={`bg-blue-600 hover:bg-blue-700 text-white transition-all  ${formIsValid ? 'shadow-md cursor-pointer' : ' cursor-not-allowed '}`}
              >
                Continuar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-gray-800">
                Confirmar Registro
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <p className="text-center text-gray-600">
                ¿Está seguro de registrar las siguientes horas extra?
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">DNI:</span>
                    <span className="font-semibold">{formData.dni}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Fecha:</span>
                    <span>{new Date(formData.fecha).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Horario:</span>
                    <span>
                      {formData.horaInicio} - {formData.horaFin}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Total Horas:</span>
                    <span className="font-semibold text-blue-600">
                      {Math.round(
                        (new Date(`2000-01-01T${formData.horaFin}`) -
                          new Date(`2000-01-01T${formData.horaInicio}`)
                        )) / (1000 * 60 * 60)} horas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Volver
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md cursor-pointer"
              >
                Confirmar Registro
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Modal de carga */}
      <Dialog open={isLoadingModalOpen} onOpenChange={setIsLoadingModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg" showClose={false}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 flex flex-col items-center justify-center space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-blue-600" />
            </motion.div>
            <p className="text-center text-gray-600 font-medium">Procesando registro...</p>
            <p className="text-center text-sm text-gray-500">Por favor espere un momento</p>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-gray-800">
                ¡Registro Exitoso!
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <Alert className="bg-green-50 border-green-200 flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <AlertDescription className="text-green-700 font-medium">
                  Las horas extra se registraron correctamente.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white w-full shadow-md"
              >
                Aceptar
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}