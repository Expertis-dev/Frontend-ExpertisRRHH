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
import { Checkbox } from '@/components/ui/checkbox';
import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { set } from 'date-fns';

export const InfoAFP = () => {
  const [afpList, setAfpList] = useState([])
  const [filtroAFP, setFiltroAFP] = useState([])
  const [selectedAfp, setSelectedAfp] = useState("Todos")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showONP, setShowONP] = useState(false)
  const [showAFP, setShowAFP] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [opcionSelect, setOpcionSelect] = useState("")
  const [fileList, setFileList] = useState([])
  const [cambiosEncontrados, setCambiosEncontrados] = useState([])
  const [file, setFile] = useState(null)
  const [showVerificar, setShowVerificar] = useState(false)
  const [error, setError] = useState("")
  const [ultimoMesInicio, setUltimoMesInicio] = useState("")
  const [newONP, setNewONP] = useState({
    aportacion: "",
    codMesInicio: ""
  })

  const { Dragger } = Upload;
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
          b.codMesInicio.localeCompare(a.codMesInicio)
        )
        setAfpList(info)
        setFiltroAFP(info)
      }
    } catch (error) {
      console.error("Error al obtener datos de AFP:", error)
    }
  }

  const ObtenerCambios = async () => {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/afp/cambiosSP_AFP`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        console.log(response.data.detalles)
        setUltimoMesInicio(response.data.ultimoMesInicio)
        setCambiosEncontrados(response.data.detalles)
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

  const handleONPChange = (e) => {
    const { name, value } = e.target
    setNewONP(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChangeONP = (date) => {
    setNewONP(prev => ({
      ...prev,
      codMesInicio: date
    }))
  }

  const handleSubmit = () => {
    if (!opcionSelect) {
      setError("Debe seleccionar una opción")
      return
    }

    if (opcionSelect === "AFP") {
      setShowAddModal(false)
      setShowAFP(true)
    } else {
      setShowAddModal(false)
      setShowONP(true)
    }
  }

  const getLastONPDate = () => {
    const onpRecords = afpList.filter(afp => afp.SISTEMA_DE_PENSION === "ONP")
    if (onpRecords.length === 0) return null
    return onpRecords[0].codMesInicio
  }

  const validateONPForm = () => {
    if (!newONP.aportacion) {
      setError("Debe ingresar la aportación")
      return false
    }
    if (!newONP.codMesInicio) {
      setError("Debe seleccionar el mes de inicio")
      return false
    }

    const lastDate = getLastONPDate()
    if (lastDate && new Date(newONP.codMesInicio) <= new Date(lastDate)) {
      setError(`El mes de inicio debe ser posterior al último registro ONP (${lastDate})`)
      return false
    }

    setError("")
    return true
  }

  const confirmAddONP = async () => {
    if (!validateONPForm()) return

    setShowLoadingModal(true)

    try {
      const payload = {
        SISTEMA_DE_PENSION: "ONP",
        aportacion: newONP.aportacion,
        codMesInicio: newONP.codMesInicio.toISOString(),
        tipoComision: "N/A",
        comision: "0",
        seguro: "0",
        seguroTope: "0"
      }

      // En producción, usar esto:
      // const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/afp/crear`, payload)

      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Actualizar estado local (simulación)
      setAfpList(prev => [...prev, payload])
      setShowSuccessModal(true)
      setShowONP(false)
      setNewONP({
        aportacion: "",
        codMesInicio: ""
      })
    } catch (error) {
      console.error("Error al guardar ONP:", error)
      setError("Error al guardar el registro ONP")
    } finally {
      setShowLoadingModal(false)
    }
  }

  const confirmAddAFP = async () => {
    if (!file) {
      setError("Debe seleccionar un archivo Excel")
      return
    }
    setShowVerificar(false)
    setShowLoadingModal(true)

    try {
      // Simular procesamiento del archivo
      await new Promise(resolve => setTimeout(resolve, 2000))

      // En producción, usar esto:
      const formData = new FormData()
      formData.append('archivo', file)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/afp/cambiosSP_AFP`, formData)
      console.log("Respuesta del servidor:", response.data)

      // Simulación de éxito
      setShowSuccessModal(true)
      setShowAFP(false)
      setFile(null)
      setFileList([])
      ObtenerDatos() // Refrescar datos
    } catch (error) {
      console.error("Error al importar archivo AFP:", error)
      setError("Error al procesar el archivo Excel")
    } finally {
      setShowLoadingModal(false)
    }
  }

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".xls,.xlsx",
    fileList: fileList,
    beforeUpload(file) {
      const isExcel =
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        setError("Solo se permiten archivos Excel (.xls, .xlsx)")
        return Upload.LIST_IGNORE;
      }

      setFile(file);
      setFileList([file]);
      setError("");
      return false; // Evita la subida automática
    },
    onRemove() {
      setFile(null);
      setFileList([]);
    },
  };
  const VerificarArchivo = () => {
    ObtenerCambios();
    setShowAFP(false)
    setShowVerificar(true)
  }
  return (
    <div className="w-full px-4">
      <h1 className="text-center text-xl font-bold text-gray-800">INFORMACIÓN SP</h1>

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

      {/* Modal para seleccionar tipo (AFP/ONP) */}
      <Dialog open={showAddModal} onOpenChange={() => {
        setShowAddModal(false)
        setOpcionSelect("")
        setError("")
      }}>
        <DialogContent className="max-w-xs max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              ¿QUE SEGURO PERSONA DESEA MODIFICAR?
            </DialogTitle>
          </DialogHeader>
          <div className='flex justify-evenly'>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={opcionSelect === "AFP"}
                onCheckedChange={(checked) =>
                  setOpcionSelect(checked ? "AFP" : "")
                }
              />
              <Label>AFP</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={opcionSelect === "ONP"}
                onCheckedChange={(checked) =>
                  setOpcionSelect(checked ? "ONP" : "")
                }
              />
              <Label>ONP</Label>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => {
              setShowAddModal(false)
              setOpcionSelect("")
            }}>
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

      {/* Modal de AFP (importar Excel) */}
      <Dialog open={showAFP} onOpenChange={setShowAFP}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              INGRESAR EL EXCEL CON EL FORMATO REQUERIDO
            </DialogTitle>
          </DialogHeader>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Haga clic o arrastre el archivo a esta área para cargarlo
            </p>
            <p className="ant-upload-hint">
              Solo se aceptan archivos Excel (.xls, .xlsx)
            </p>
          </Dragger>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <DialogFooter className={"mt-5"}>
            <Button variant="outline" onClick={() => {
              setShowAFP(false)
              setShowAddModal(true)
              setError("")
            }}>
              VOLVER
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={VerificarArchivo}
              disabled={!file}
            >
              VERIFICAR ARCHIVO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de ONP */}
      <Dialog open={showONP} onOpenChange={setShowONP}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              REGISTRAR UN NUEVO ONP
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>APORTACIÓN (%)</Label>
              <Input
                name="aportacion"
                type="number"
                value={newONP.aportacion}
                onChange={handleONPChange}
                placeholder="Ingrese el porcentaje de aportación"
              />
            </div>
            <div>
              <Label>COD MES INICIO</Label>
              <DatePickerFirstDay
                handleDateChange={handleDateChangeONP}
                mesInicio={getLastONPDate() ? new Date(getLastONPDate()) : null}
              />
              {getLastONPDate() && (
                <p className="text-sm text-gray-500 mt-1">
                  Último registro ONP: {getLastONPDate().split("T")[0]}
                </p>
              )}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowONP(false)
              setShowAddModal(true)
              setError("")
            }}>
              VOLVER
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmAddONP}
            >
              CONFIRMAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Modal de VERIFICAR , DONDE SE MOSTRARAN LA TABLA */}
      <Dialog open={showVerificar} onOpenChange={setShowVerificar}>
        <DialogContent className="max-w-max ">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              DATOS OBTENIDOS
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/*AQUI PONES LA TABLA QUE SE NECESITA*/}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MES</TableHead>
                  <TableHead>AFP</TableHead>
                  <TableHead>TIPO</TableHead>
                  <TableHead>APORTACIÓN (%) ANTERIOR</TableHead>
                  <TableHead>APORTACIÓN (%) ACTUAL</TableHead>
                  <TableHead>COMISIÓN (%) ANTERIOR</TableHead>
                  <TableHead>COMISIÓN (%) ACTUAL</TableHead>
                  <TableHead>SEGURO (%) ANTERIOR</TableHead>
                  <TableHead>SEGURO (%) ACTUAL</TableHead>
                  <TableHead>SEGURO TOPE ANTERIOR</TableHead>
                  <TableHead>SEGURO TOPE ACTUAL</TableHead>
                  <TableHead>TOTAL ANTERIOR</TableHead>
                  <TableHead>TOTAL ACTUAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cambiosEncontrados.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{ultimoMesInicio.split("T")[0]} </TableCell>
                    <TableCell>{data.sistema}</TableCell>
                    <TableCell>{data.tipo}</TableCell>
                    <TableCell>{data.cambios?.aportacion?.anterior ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.aportacion?.actual ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.comision?.anterior ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.comision?.actual ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.seguro?.anterior ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.seguro?.actual ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.seguroTope?.anterior ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.seguroTope?.actual ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.total?.anterior ?? '-'}</TableCell>
                    <TableCell>{data.cambios?.total?.actual ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowVerificar(false)
              setShowAFP(true)
              setError("")
            }}>
              CANCELAR
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmAddAFP}
            >
              SUBIR CAMBIOS
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
            <p>Guardando los datos...</p>
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
            <p className="text-center text-gray-600">
              {opcionSelect === "AFP"
                ? "El archivo AFP ha sido procesado exitosamente."
                : "El nuevo registro ONP ha sido guardado exitosamente."}
            </p>
          </div>
          <DialogFooter className="justify-center">
            <Button onClick={() => setShowSuccessModal(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}