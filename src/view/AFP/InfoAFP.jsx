import React, { useEffect, useState } from 'react'
import { Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { DatePickerFirstDay } from "@/components/ui/MesInputs"
import { Checkbox } from '@/components/ui/checkbox';
import { Upload } from "antd";
import { PlusCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { useData } from '@/provider/Provider';


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
  const [nuevoMes, setNuevoMes] = useState("")
  const [codMes, setCodMes] = useState("")
  const [newONP, setNewONP] = useState({
    aportacion: "",
    codMesInicio: ""
  })
  const { nombre } = useData()
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
        const info = response.data.sort((a, b) => {
          // Primero ordenar por fecha (descendente)
          const dateComparison = b.codMesInicio.localeCompare(a.codMesInicio);

          // Si las fechas son diferentes, devolver el resultado de la comparación de fechas
          if (dateComparison !== 0) {
            return dateComparison;
          }

          // Si las fechas son iguales, ordenar por comision (descendente)
          return b.comision - a.comision;
        });
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
        console.log(response.data)
        setCodMes(response.data.codMesInicio)
        setUltimoMesInicio(response.data.ultimoMesInicio)
        setCambiosEncontrados(response.data.detalles)
        setNuevoMes(response.data.codMesInicio)
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
        aportacion: Number(newONP.aportacion),
        codMesInicio: newONP.codMesInicio.toISOString().split("T")[0],
        usuario: nombre
      }
      console.log(payload)
      // En producción, usar esto:
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/afp/registrarONP`, payload)
      if (response.status === 200) {
        console.log("Registro ONP guardado:", response)
        setAfpList(prev => [...prev, payload])
        setShowSuccessModal(true)
        setShowONP(false)
        setNewONP({
          aportacion: "",
          codMesInicio: ""
        })
        setShowLoadingModal(false)
      } else {
        setShowLoadingModal(false)
        setShowONP(true)
      }
    } catch (error) {
      console.error("Error al guardar ONP:", error)
      setError("Error al guardar el registro ONP")
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
      } else {
        setFile(file);
        setFileList([file]);
        setError("");
      }
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
  const subirCambios = async () => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/afp/registrarInfoSP`, { cambiosEncontrados, nombre, codMes })
    if (response.status === 200) {
      setShowVerificar(false)
      setShowSuccessModal(true)
      setCambiosEncontrados([])
      setUltimoMesInicio("")
    } else {
      setError("Error al subir los cambios")
    }
  }
  return (
    <div className="w-full px-4">
      <h1 className="text-center text-xl font-bold text-gray-800">INFORMACIÓN SP</h1>

      {/* Barra de búsqueda y selección */}
      <div className="py-4 w-full flex flex-col justify-between sm:flex-row gap-4">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700 whitespace-nowrap">FILTRO POR SP:</span>
          <Select value={selectedAfp} onValueChange={setSelectedAfp}>
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Seleccione SP" />
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
          <PlusCircleOutlined /> Nuevo Registro SP
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
                  <TableCell>{afp.aportacion * 100} %</TableCell>
                  <TableCell>
                    {afp.comision ? `${(afp.comision * 100).toFixed(2)} %` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {afp.seguro ? `${(afp.seguro * 100).toFixed(2)} %` : "N/A"}
                  </TableCell>

                  <TableCell>{afp.seguroTope}</TableCell>
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
              ¿QUÉ SISTEMA DE PENSIÓN DESEA MODIFICAR?
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
        <DialogContent className="max-w-[95vw] ">
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
                  <TableHead className="font-semibold">AFP</TableHead>
                  <TableHead className="font-semibold">TIPO</TableHead>
                  <TableHead className="w-20 font-semibold">ULTIMO MES CARGADO</TableHead>
                  <TableHead className="w-20 font-semibold">MES A CARGAR</TableHead>
                  <TableHead className="font-semibold">APORTACIÓN (%) ANTERIOR</TableHead>
                  <TableHead className="font-semibold">APORTACIÓN (%) ACTUAL</TableHead>
                  <TableHead className="font-semibold">COMISIÓN (%) ANTERIOR</TableHead>
                  <TableHead className="font-semibold">COMISIÓN (%) ACTUAL</TableHead>
                  <TableHead className="font-semibold">SEGURO (%) ANTERIOR</TableHead>
                  <TableHead className="font-semibold">SEGURO (%) ACTUAL</TableHead>
                  <TableHead className="font-semibold">SEGURO TOPE ANTERIOR</TableHead>
                  <TableHead>SEGURO TOPE ACTUAL</TableHead>
                  <TableHead>TOTAL ANTERIOR</TableHead>
                  <TableHead>TOTAL ACTUAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cambiosEncontrados.map((data, index) => (
                  <TableRow key={index} className={`${data.ESTADO === "NO CAMBIO" ? "bg-green-200" : " bg-red-300 "}`} >
                    <TableCell>{data.SP}</TableCell>
                    <TableCell>{data.TIPO}</TableCell>
                    <TableCell className="bg-neutral-100">{ultimoMesInicio.split("T")[0]} </TableCell>
                    <TableCell className="bg-green-300">{nuevoMes} </TableCell>
                    <TableCell className="bg-neutral-100">{data.APORTACION_ANTERIOR ?? '-'} %</TableCell>
                    <TableCell className="bg-green-300">{data.APORTACION_ACTUAL ?? '-'} %</TableCell>
                    <TableCell className="bg-neutral-100">{data.COMISION_ANTERIOR ?? '-'} %</TableCell>
                    <TableCell className="bg-green-300">{data.COMISION_ACTUAL ?? '-'} %</TableCell>
                    <TableCell className="bg-neutral-100">{data.SEGURO_ANTERIOR ?? '-'} %</TableCell>
                    <TableCell className="bg-green-300">{data.SEGURO_ACTUAL ?? '-'} %</TableCell>
                    <TableCell className="bg-neutral-100">{data.SEGUROTOPE_ANTERIOR ?? '-'} </TableCell>
                    <TableCell className="bg-green-300">{data.SEGUROTOPE_ACTUAL ?? '-'} </TableCell>
                    <TableCell className="bg-neutral-100">{data.TOTAL_ANTERIOR ?? '-'} %</TableCell>
                    <TableCell className="bg-green-300">{data.TOTAL_ACTUAL ?? '-'} %</TableCell>
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
              onClick={subirCambios}
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