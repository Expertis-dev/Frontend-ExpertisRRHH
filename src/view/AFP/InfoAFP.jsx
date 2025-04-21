import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"


const afps = [
  {
    cod_mes_inicio: "001",
    cod_mes_fin: "002",
    afp: "AFP Integra",
    tipoComision: "Comisión Mixta",
    aportaciones: "10%",
    comision: "10%",
    seguro: "1.5%",
    seguroTope: "0.5%",
    columna1: "Columna 1 Data"
  },
  {
    cod_mes_inicio: "003",
    cod_mes_fin: "004",
    afp: "Prima AFP",
    tipoComision: "Comisión Fija",
    aportaciones: "10%",
    comision: "12%",
    seguro: "2%",
    seguroTope: "0.7%",
    columna1: "Columna 1 Data"
  },
  {
    cod_mes_inicio: "005",
    cod_mes_fin: "006",
    afp: "Profuturo AFP",
    tipoComision: "Comisión Variable",
    aportaciones: "10%",
    comision: "11%",
    seguro: "1.8%",
    seguroTope: "0.6%",
    columna1: "Columna 1 Data"
  },
  {
    cod_mes_inicio: "007",
    cod_mes_fin: "008",
    afp: "AFP Habitat",
    tipoComision: "Comisión Mixta",
    aportaciones: "10%",
    comision: "9%",
    seguro: "1.2%",
    seguroTope: "0.4%",
    columna1: "Columna 1 Data"
  },
  {
    cod_mes_inicio: "009",
    cod_mes_fin: "010",
    afp: "AFP Prima",
    tipoComision: "Comisión Fija",
    aportaciones: "10%",
    comision: "13%",
    seguro: "2.5%",
    seguroTope: "0.8%",
    columna1: "Columna 1 Data"
  },
]
export const InfoAFP = () => {
  const [afpList, setAfpList] = useState(afps)
  const [filtroAFP, setFiltroAFP] = useState(afps)
  const [selectedAfp, setSelectedAfp] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [newAfp, setNewAfp] = useState({
    cod_mes_inicio: "",
    cod_mes_fin: "",
    afp: "",
    tipoComision: "",
    comision: "",
    seguro: "",
    seguroTope: "",
    columna1: ""
  })
  useEffect(() => {
    if (selectedAfp != "" && selectedAfp != "Todos") {
      const filtrados = afpList.filter((afp) => afp.afp === selectedAfp)
      setFiltroAFP(filtrados)
    } else {
      setFiltroAFP(afpList)
    }

  }, [selectedAfp])


  const handleAddAfp = () => {
    setShowAddModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAfp(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = () => {
    setShowAddModal(false)
    setShowConfirmModal(true)
  }

  const confirmAddAfp = () => {
    setShowConfirmModal(false)
    setShowLoadingModal(true)

    // Simular llamada a API
    setTimeout(() => {
      setAfpList(prev => [...prev, newAfp])
      setShowLoadingModal(false)
      setShowSuccessModal(true)
      resetForm()
    }, 2000)
  }

  const resetForm = () => {
    setNewAfp({
      cod_mes_inicio: "",
      cod_mes_fin: "",
      afp: "",
      tipoComision: "",
      comision: "",
      seguro: "",
      seguroTope: "",
      columna1: ""
    })
  }

  return (
    <div className="w-full px-4">
      <h1 className="text-center text-xl font-bold text-gray-800">INFORMACION AFP</h1>

      {/* Barra de búsqueda y selección */}
      <div className="py-4 w-full md:w-full flex flex-col justify-between sm:flex-row gap-4">


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
                <TableHead>TIPO COMISION</TableHead>
                <TableHead>APORTACIONES</TableHead>
                <TableHead>COMISION</TableHead>
                <TableHead>SEGURO</TableHead>
                <TableHead>SEGURO TOPE</TableHead>
                <TableHead>COLUMNA 1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtroAFP.map((afp, key) => (
                <TableRow key={key} className="border-t hover:bg-blue-50 transition-colors">
                  <TableCell>{afp.cod_mes_inicio}</TableCell>
                  <TableCell>{afp.cod_mes_fin}</TableCell>
                  <TableCell>{afp.afp}</TableCell>
                  <TableCell>{afp.tipoComision}</TableCell>
                  <TableCell>{afp.aportaciones}</TableCell>
                  <TableCell>{afp.comision}</TableCell>
                  <TableCell>{afp.seguro}</TableCell>
                  <TableCell>{afp.seguroTope}</TableCell>
                  <TableCell>{afp.columna1}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal para agregar nueva AFP */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              INGRESAR NUEVO AFP
            </DialogTitle>
          </DialogHeader>
          <div className='max-h-[70vh]'>
            <div className='flex gap-10'>
              
            </div>

            <div className="space-y-2">
              <Label>AFP</Label>
              <Input
                name="afp"
                value={newAfp.afp}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>TIPO_COMISION</Label>
              <Input
                name="tipoComision"
                value={newAfp.tipoComision}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>APORTACION</Label>
              <Input
                name="comision"
                value={newAfp.comision}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>COMISION</Label>
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

            <div className="space-y-2">
              <Label>COLUMNA 1</Label>
              <Input
                name="columna1"
                value={newAfp.columna1}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <DialogFooter>
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
              <h3 className="font-semibold mb-2">Resumen de la nueva AFP:</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">COD_MES_INICIO:</span> {newAfp.cod_mes_inicio}</p>
                <p><span className="font-medium">COD_MES_FIN:</span> {newAfp.cod_mes_fin}</p>
                <p><span className="font-medium">AFP:</span> {newAfp.afp}</p>
                <p><span className="font-medium">TIPO_COMISION:</span> {newAfp.tipoComision}</p>
                <p><span className="font-medium">COMISION:</span> {newAfp.comision}</p>
                <p><span className="font-medium">SEGURO:</span> {newAfp.seguro}</p>
                <p><span className="font-medium">SEGURO TOPE:</span> {newAfp.seguroTope}</p>
                <p><span className="font-medium">COLUMNA 1:</span> {newAfp.columna1}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
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
          <div className="flex flex-col items-center ">
            <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-center text-lg">La nueva AFP ha sido registrada exitosamente.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}