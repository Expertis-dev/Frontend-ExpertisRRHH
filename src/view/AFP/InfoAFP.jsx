import React, { useEffect, useState } from 'react'

import { Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { DatePickerFirstDay } from "@/components/ui/MesInputs"

export const InfoAFP = () => {
  const [afpList, setAfpList] = useState([])
  const [filtroAFP, setFiltroAFP] = useState([])
  const [selectedAfp, setSelectedAfp] = useState("Todos")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [newAfp, setNewAfp] = useState({
    codMesInicio: "",
    codMesFin: null,
    SISTEMA_DE_PENSION: "",
    tipoComision: "",
    aportacion: "",
    comision: "",
    seguro: "",
    seguroTope: "",
    columna1: ""
  })
  const [error, setError] = useState("")

  const afps = [
    { afp: "HABITAT" },
    { afp: "INTEGRA" },
    { afp: "PRIMA" },
    { afp: "PROFUTURO" },
    { afp: "ONP" }
  ]

  const ObtenerDatos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/afp/listarDatosSP_AFP`)
      if (response.status === 200) {
        const info = response.data.sort((a, b) =>
          a.codMesInicio.localeCompare(b.codMesInicio)
        )
        setAfpList(info)
        setFiltroAFP(info)
      }
    } catch (error) {
      console.error("Error al obtener datos de AFP:", error)
    }
  }

  useEffect(() => {
    ObtenerDatos()
  }, [])

  useEffect(() => {
    if (selectedAfp !== "Todos") {
      const filtrados = afpList.filter(afp => afp.SISTEMA_DE_PENSION === selectedAfp)
      setFiltroAFP(filtrados)
    } else {
      setFiltroAFP(afpList)
    }
  }, [selectedAfp, afpList])

  const handleAddAfp = () => {
    setShowAddModal(true)
    setError("")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAfp(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (date, field) => {
    setNewAfp(prev => ({
      ...prev,
      [field]: date
    }))
  }

  const validateForm = () => {
    if (!newAfp.SISTEMA_DE_PENSION) {
      setError("Debe seleccionar una AFP")
      return false
    }
    if (!newAfp.codMesInicio) {
      setError("Debe ingresar una fecha de inicio")
      return false
    }
    if (!newAfp.tipoComision) {
      setError("Debe ingresar el tipo de comisión")
      return false
    }
    if (!newAfp.comision) {
      setError("Debe ingresar la comisión")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    setShowAddModal(false)
    setShowConfirmModal(true)
  }

  const confirmAddAfp = async () => {
    setShowConfirmModal(false)
    setShowLoadingModal(true)

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500))

      // En producción, usar esto:
      // const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/afp/crear`, newAfp)

      // Actualizar estado local (simulación)
      const newRecord = {
        ...newAfp,
        codMesInicio: newAfp.codMesInicio.toISOString(),
        codMesFin: newAfp.codMesFin ? newAfp.codMesFin.toISOString() : null
      }

      setAfpList(prev => [...prev, newRecord])
      setShowSuccessModal(true)
      resetForm()
    } catch (error) {
      console.error("Error al guardar AFP:", error)
    } finally {
      setShowLoadingModal(false)
    }
  }

  const resetForm = () => {
    setNewAfp({
      codMesInicio: "",
      codMesFin: null,
      SISTEMA_DE_PENSION: "",
      tipoComision: "",
      aportacion: "",
      comision: "",
      seguro: "",
      seguroTope: "",
      columna1: ""
    })
  }

  return (
    <div className="w-full px-4">
      <h1 className="text-center text-xl font-bold text-gray-800">INFORMACIÓN AFP</h1>

      {/* Barra de búsqueda y selección */}
      <div className="py-4 w-full flex flex-col justify-between sm:flex-row gap-4">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700 whitespace-nowrap">FILTRO POR AFP:</span>
          <Select value={selectedAfp} onValueChange={setSelectedAfp}>
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Seleccione AFP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              {afps.map((afp, index) => (
                <SelectItem key={index} value={afp.afp}>{afp.afp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleAddAfp}
        >
          + Nuevo Registro AFP
        </Button>
      </div>

      {/* Tabla de AFPs */}
      <Card className="shadow-lg overflow-y-auto max-h-[70vh]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead>COD. MES INICIO</TableHead>
                <TableHead>COD. MES FIN</TableHead>
                <TableHead>AFP</TableHead>
                <TableHead>TIPO COMISIÓN</TableHead>
                <TableHead>APORTACIONES</TableHead>
                <TableHead>COMISIÓN</TableHead>
                <TableHead>SEGURO</TableHead>
                <TableHead>SEGURO TOPE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtroAFP.map((afp, key) => (
                <TableRow key={key} className="border-t hover:bg-blue-50 transition-colors">
                  <TableCell>{afp.codMesInicio.split("T")[0]}</TableCell>
                  <TableCell>{afp.codMesFin ? afp.codMesFin.split("T")[0] : "N/A"}</TableCell>
                  <TableCell>{afp.SISTEMA_DE_PENSION}</TableCell>
                  <TableCell>{afp.tipoComision}</TableCell>
                  <TableCell>{afp.aportacion}</TableCell>
                  <TableCell>{afp.comision || "N/A"}</TableCell>
                  <TableCell>{afp.seguro || "N/A"}</TableCell>
                  <TableCell>{afp.seguroTope || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal para agregar nueva AFP */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              INGRESAR NUEVO REGISTRO AFP
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>AFP*</Label>
              <Select
                value={newAfp.SISTEMA_DE_PENSION}
                onValueChange={(value) => setNewAfp(prev => ({ ...prev, SISTEMA_DE_PENSION: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione AFP" />
                </SelectTrigger>
                <SelectContent>
                  {afps.map((afp, index) => (
                    <SelectItem key={index} value={afp.afp}>{afp.afp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>TIPO DE COMISIÓN*</Label>
              <Input
                name="tipoComision"
                value={newAfp.tipoComision}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>FECHA INICIO*</Label>
              <DatePickerFirstDay
                handleDateChange={(date) => handleDateChange(date, 'codMesInicio')}
              />
            </div>

            <div className="space-y-2">
              <Label>FECHA FIN (Opcional)</Label>
              <DatePickerFirstDay
                handleDateChange={(date) => handleDateChange(date, 'codMesFin')}
              />
            </div>

            <div className="space-y-2">
              <Label>APORTACIONES</Label>
              <Input
                name="aportacion"
                value={newAfp.aportacion}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>COMISIÓN*</Label>
              <Input
                name="comision"
                value={newAfp.comision}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>SEGURO</Label>
              <Input
                name="seguro"
                value={newAfp.seguro}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>SEGURO TOPE</Label>
              <Input
                name="seguroTope"
                value={newAfp.seguroTope}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Confirmar Datos
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Resumen del nuevo registro AFP:</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">AFP:</span> {newAfp.SISTEMA_DE_PENSION}</p>
                <p><span className="font-medium">FECHA INICIO:</span> {newAfp.codMesInicio}</p>
                <p><span className="font-medium">FECHA FIN:</span> {newAfp.codMesFin || "N/A"}</p>
                <p><span className="font-medium">TIPO COMISIÓN:</span> {newAfp.tipoComision}</p>
                <p><span className="font-medium">COMISIÓN:</span> {newAfp.comision}</p>
                <p><span className="font-medium">APORTACIONES:</span> {newAfp.aportacion || "N/A"}</p>
                <p><span className="font-medium">SEGURO:</span> {newAfp.seguro || "N/A"}</p>
                <p><span className="font-medium">SEGURO TOPE:</span> {newAfp.seguroTope || "N/A"}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowConfirmModal(false)
              setShowAddModal(true)
            }}>
              Volver a editar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmAddAfp}
            >
              Confirmar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de carga */}
      <Dialog open={showLoadingModal} onOpenChange={setShowLoadingModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Procesando...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p>Guardando los datos de la AFP...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de completado */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">¡Completado!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-center text-gray-600">El nuevo registro AFP ha sido guardado exitosamente.</p>
          </div>
          <DialogFooter className="justify-center">
            <Button onClick={() => setShowSuccessModal(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}