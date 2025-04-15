import axios from "axios"
import { useState, useEffect } from "react"
import { Eye, Pencil, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export const ListarEmpleados = () => {
  // Estados de búsqueda y validación
  const [searchQuery, setSearchQuery] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [empleados, setEmpleados] = useState([])
  const [filteredEmpleados, setFilteredEmpleados] = useState([])
  const [datosCese, setDatosCese] = useState([])
  const [datosPuestos, setDatosPuestos] = useState([])
  const [datosAFP, setDatosAFP] = useState([])
  const [datosAsigFam, setDatosAsigFam] = useState([])
  const [datosSueldos, setDatosSueldos] = useState([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  // Estados para los diálogos
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  // Estados para el flujo de edición por pasos
  const [selectedField, setSelectedField] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    salary: { amount: '', currency: 'PEN', valid: false },
    position: { title: '', department: '', startDate: '', valid: false },
    familyAllowance: { hasAllowance: false, dependents: 0, amount: 0, valid: false },
    personalData: { fullName: '', dni: '', address: '', photo: null, valid: false }
  })
  const [allStepsValid, setAllStepsValid] = useState(false)

  // Obtener empleados desde el backend
  const obtenerEmpleados = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`)
      setEmpleados(response.data.recordset)
      setFilteredEmpleados(response.data.recordset)
    } catch (error) {
      console.error("Error al obtener empleados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    obtenerEmpleados()
  }, [])

  // Filtrar empleados por búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmpleados(empleados)
    } else {
      const filtered = empleados.filter(emp =>
        emp.documento.includes(searchQuery) ||
        emp.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.CODIGO.includes(searchQuery)
      )
      setFilteredEmpleados(filtered)
    }
  }, [searchQuery, empleados])

  // Efecto para verificar si todos los pasos están completos
  useEffect(() => {
    if (selectedField) {
      const fieldData = formData[selectedField]
      setAllStepsValid(fieldData.valid)
    }
  }, [formData, selectedField])
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmpleados(empleados);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = empleados.filter(emp =>
        emp.documento.includes(searchQuery) || // Búsqueda exacta por DNI
        emp.nombreCompleto.toLowerCase().includes(query) || // Búsqueda parcial por nombre
        emp.CODIGO.toLowerCase().includes(query) // Búsqueda parcial por código
      );
      setFilteredEmpleados(filtered);
    }
  }, [searchQuery, empleados]);
  // Manejo del documento de búsqueda
  // Modificaciones en la función de manejo de búsqueda
  const handleSearchChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);

    // No necesitamos validación para búsqueda por nombre
    if (inputValue.trim() === '') {
      setIsValid(false);
    } else {
      setIsValid(true); // Consideramos válido cualquier texto para búsqueda por nombre
    }
  };

  // Formatear fecha para visualización
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE')
  }
  const HistoricoCese = async (idPersona) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/historicoCeses/${idPersona}`)
    console.log(response.data.data[0])
    setDatosCese(response.data.data[0])
  }
  const HistoricoPuestos = async (idPersona) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/historicoPuestoTrabajo/${idPersona}`)
    console.log(response.data.data[0])
    setDatosPuestos(response.data.data[0])

  }
  const HistoricoAFP = async (idPersona) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/historicoAFP/${idPersona}`)
    console.log(response.data.data[0])
    setDatosAFP(response.data.data[0])

  }
  const HistoricoAsignacionFamiliar = async (idPersona) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/historicoAsignacionFamiliar/${idPersona}`)
    console.log(response.data.data[0])
    setDatosAsigFam(response.data.data[0])

  }

  const HistoricoSueldo = async (idPersona) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/historicoSueldos/${idPersona}`)
    console.log(response.data.data[0])
    setDatosSueldos(response.data.data[0])

  }


  // Abrir detalles del empleado
  const openDetails = async (employee) => {
    setSelectedEmployee(employee)
    setDetailsOpen(true)
    setLoadingDetails(true)

    try {
      await Promise.all([
        HistoricoCese(employee.idPersona),
        HistoricoPuestos(employee.idPersona),
        HistoricoAFP(employee.idPersona),
        HistoricoAsignacionFamiliar(employee.idPersona)
      ]);
    } catch (error) {
      console.error("Error al cargar detalles:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Abrir edición del empleado
  const openEdit = (employee) => {
    setSelectedEmployee(employee)
    setSelectedField(null)
    setCurrentStep(1)
    setEditOpen(true)

    // Inicializar formulario con datos del empleado
    setFormData({
      salary: {
        amount: employee.sueldo?.toString() || '',
        currency: 'PEN',
        valid: true
      },
      position: {
        title: employee.cargo || '',
        department: employee.departamento || '',
        startDate: employee.fecIngreso || '',
        valid: true
      },
      familyAllowance: {
        hasAllowance: employee.asignacionFamiliar === 'Sí',
        dependents: employee.numHijos || 0,
        amount: employee.montoAsignacion || 0,
        valid: true
      },
      personalData: {
        fullName: employee.nombreCompleto || '',
        dni: employee.documento || '',
        address: employee.direccion || '',
        photo: null,
        valid: true
      }
    })
  }

  // Manejar cambio en los campos del formulario
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [selectedField]: {
        ...prev[selectedField],
        ...value,
        valid: validateStep(selectedField, { ...prev[selectedField], ...value })
      }
    }))
  }

  // Validar el paso actual
  const validateStep = (field, data) => {
    switch (field) {
      case 'salary':
        return !!data.amount && !isNaN(data.amount)
      case 'position':
        return !!data.title && !!data.department && !!data.startDate
      case 'familyAllowance':
        return true // Todos los campos son opcionales
      case 'personalData':
        return !!data.fullName && !!data.dni // Foto es opcional
      default:
        return false
    }
  }

  // Avanzar al siguiente paso
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedField) return
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!allStepsValid) return
      setCurrentStep(3)
    }
  }

  // Enviar datos actualizados al backend
  const handleSubmit = async () => {
    try {
      const payload = {
        idPersona: selectedEmployee.idPersona,
        [selectedField]: formData[selectedField]
      }

      // Aquí iría la llamada real al backend
      console.log('Datos a enviar:', payload)

      // Ejemplo de llamada API (descomentar cuando esté listo el endpoint)
      // const response = await axios.put('/api/empleados/actualizar', payload)
      // console.log('Respuesta del servidor:', response.data)

      // Actualizar localmente los datos (esto sería reemplazado por la respuesta del backend)
      const updatedEmpleados = empleados.map(emp =>
        emp.idPersona === selectedEmployee.idPersona
          ? { ...emp, ...mapFormDataToEmployee(formData) }
          : emp
      )

      setEmpleados(updatedEmpleados)
      setFilteredEmpleados(updatedEmpleados)
      setEditOpen(false)

    } catch (error) {
      console.error("Error al actualizar empleado:", error)
    }
  }

  // Mapear datos del formulario a estructura de empleado
  const mapFormDataToEmployee = (formData) => {
    return {
      ...(selectedField === 'salary' && {
        sueldo: parseFloat(formData.salary.amount)
      }),
      ...(selectedField === 'position' && {
        cargo: formData.position.title,
        departamento: formData.position.department,
        fecIngreso: formData.position.startDate
      }),
      ...(selectedField === 'familyAllowance' && {
        asignacionFamiliar: formData.familyAllowance.hasAllowance ? 'Sí' : 'No',
        numHijos: formData.familyAllowance.dependents,
        montoAsignacion: formData.familyAllowance.amount
      }),
      ...(selectedField === 'personalData' && {
        nombreCompleto: formData.personalData.fullName,
        documento: formData.personalData.dni,
        direccion: formData.personalData.address
      })
    }
  }

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 py-4">
            <DialogDescription className="text-center">
              Seleccione el campo que desea modificar
            </DialogDescription>
            <div className="border rounded-lg p-6 space-y-4">
              {/* Sueldo */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="salary"
                  checked={selectedField === 'salary'}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? 'salary' : null)
                  }
                />
                <Label htmlFor="salary" className="text-lg">
                  Sueldo
                </Label>
              </div>

              {/* Puesto */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="position"
                  checked={selectedField === 'position'}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? 'position' : null)
                  }
                />
                <Label htmlFor="position" className="text-lg">
                  Puesto
                </Label>
              </div>

              {/* Asignación Familiar */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="familyAllowance"
                  checked={selectedField === 'familyAllowance'}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? 'familyAllowance' : null)
                  }
                />
                <Label htmlFor="familyAllowance" className="text-lg">
                  Asignación Familiar
                </Label>
              </div>

              {/* Datos Personales */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personalData"
                  checked={selectedField === 'personalData'}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? 'personalData' : null)
                  }
                />
                <Label htmlFor="personalData" className="text-lg">
                  Datos Personales
                </Label>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 py-4">
            <DialogDescription className="text-center">
              Complete los datos para modificar {selectedField === 'salary' ? 'el sueldo' :
                selectedField === 'position' ? 'el puesto' :
                  selectedField === 'familyAllowance' ? 'la asignación familiar' : 'los datos personales'}
            </DialogDescription>

            {selectedField === 'salary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.salary.amount}
                      onChange={(e) => handleFieldChange('salary', { amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.salary.currency}
                      onChange={(e) => handleFieldChange('salary', { currency: e.target.value })}
                    >
                      <option value="PEN">Soles (PEN)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                  </div>
                </div>
                {!formData.salary.valid && (
                  <p className="text-sm text-red-500">Por favor ingrese un monto válido</p>
                )}
              </div>
            )}

            {selectedField === 'position' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del puesto</Label>
                  <Input
                    id="title"
                    value={formData.position.title}
                    onChange={(e) => handleFieldChange('position', { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.position.department}
                    onChange={(e) => handleFieldChange('position', { department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.position.startDate}
                    onChange={(e) => handleFieldChange('position', { startDate: e.target.value })}
                  />
                </div>
                {!formData.position.valid && (
                  <p className="text-sm text-red-500">Por favor complete todos los campos</p>
                )}
              </div>
            )}

            {selectedField === 'familyAllowance' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAllowance"
                    checked={formData.familyAllowance.hasAllowance}
                    onCheckedChange={(checked) =>
                      handleFieldChange('familyAllowance', { hasAllowance: checked })
                    }
                  />
                  <Label htmlFor="hasAllowance">Recibe asignación familiar</Label>
                </div>

                {formData.familyAllowance.hasAllowance && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dependents">Número de dependientes</Label>
                      <Input
                        id="dependents"
                        type="number"
                        min="0"
                        value={formData.familyAllowance.dependents}
                        onChange={(e) => handleFieldChange('familyAllowance', {
                          dependents: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto asignado</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        value={formData.familyAllowance.amount}
                        onChange={(e) => handleFieldChange('familyAllowance', {
                          amount: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedField === 'personalData' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={formData.personalData.fullName}
                    onChange={(e) => handleFieldChange('personalData', { fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={formData.personalData.dni}
                    onChange={(e) => handleFieldChange('personalData', { dni: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.personalData.address}
                    onChange={(e) => handleFieldChange('personalData', { address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Foto (opcional)</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFieldChange('personalData', { photo: e.target.files[0] })
                      }
                    }}
                  />
                </div>
                {!formData.personalData.valid && (
                  <p className="text-sm text-red-500">Por favor complete los campos requeridos</p>
                )}
              </div>
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 py-4">
            <DialogDescription className="text-center">
              Revise los cambios antes de enviar
            </DialogDescription>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Resumen de cambios:</h3>
              {selectedField === 'salary' && (
                <>
                  <p><span className="font-medium">Nuevo sueldo:</span> {formData.salary.currency} {formData.salary.amount}</p>
                  <p><span className="font-medium">Anterior:</span> PEN {selectedEmployee.sueldo || 'N/A'}</p>
                </>
              )}
              {selectedField === 'position' && (
                <>
                  <p><span className="font-medium">Nuevo puesto:</span> {formData.position.title}</p>
                  <p><span className="font-medium">Departamento:</span> {formData.position.department}</p>
                  <p><span className="font-medium">Fecha inicio:</span> {formData.position.startDate}</p>
                  <p><span className="font-medium">Anterior:</span> {selectedEmployee.cargo || 'N/A'}</p>
                </>
              )}
              {selectedField === 'familyAllowance' && (
                <>
                  <p><span className="font-medium">Asignación familiar:</span> {formData.familyAllowance.hasAllowance ? 'Sí' : 'No'}</p>
                  {formData.familyAllowance.hasAllowance && (
                    <>
                      <p><span className="font-medium">Dependientes:</span> {formData.familyAllowance.dependents}</p>
                      <p><span className="font-medium">Monto:</span> {formData.familyAllowance.amount}</p>
                    </>
                  )}
                  <p><span className="font-medium">Anterior:</span> {selectedEmployee.asignacionFamiliar || 'N/A'}</p>
                </>
              )}
              {selectedField === 'personalData' && (
                <>
                  <p><span className="font-medium">Nombre completo:</span> {formData.personalData.fullName}</p>
                  <p><span className="font-medium">DNI:</span> {formData.personalData.dni}</p>
                  <p><span className="font-medium">Dirección:</span> {formData.personalData.address}</p>
                  <p><span className="font-medium">Foto:</span> {formData.personalData.photo ? 'Subida' : 'Sin cambios'}</p>
                  <p><span className="font-medium">Anterior nombre:</span> {selectedEmployee.nombreCompleto || 'N/A'}</p>
                </>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full px-4">
      <h1 className="text-center text-2xl font-bold text-gray-800">MÓDULO DE EMPLEADOS</h1>

      {/* Barra de búsqueda */}
      <div className="py-8 w-full md:w-1/3">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full">
            <span className="font-medium text-gray-700 whitespace-nowrap">Buscar:</span>
            <div className="relative w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Ingrese DNI, nombre o código"
              />
            </div>
          </div>
        </div>
      </div>
      {!loading ? (
        <>
          {/* Tabla de empleados */}
          < Card className="shadow-lg overflow-y-auto max-h-[70vh]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="bg-gray-100">
                    <TableHead>CODIGO EMPLEADO</TableHead>
                    <TableHead>NOMBRE COMPLETO</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>FECHA INGRESO</TableHead>
                    <TableHead>ESTADO LABORAL</TableHead>
                    <TableHead>DETALLE</TableHead>
                    <TableHead>EDITAR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpleados.map((employee) => (
                    <TableRow key={employee.idPersona} className="border-t hover:bg-blue-50 transition-colors">
                      <TableCell>{employee.CODIGO}</TableCell>
                      <TableCell>{employee.nombreCompleto}</TableCell>
                      <TableCell>{employee.documento}</TableCell>
                      <TableCell>{formatDate(employee.fecIngreso)}</TableCell>
                      <TableCell>{employee.estadoLaboral}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 cursor-pointer"
                          onClick={() => openDetails(employee)}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-800 hover:bg-green-100 cursor-pointer"
                          onClick={() => openEdit(employee)}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="font-semibold text-xl">Cargando los datos...</p>
        </div>
      )
      }
      {/* Modal de Detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-slate-800 border-b pb-2">
              DETALLES DEL EMPLEADO
            </DialogTitle>
          </DialogHeader>



          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-blue-600 spin-reverse"></div>
              </div>
              <p className="mt-4 text-blue-600 font-medium">Cargando detalles del empleado...</p>
            </div>
          ) : (
            selectedEmployee && (
              <div className="space-y-2">
                {/* Datos generales */}
                <div className="border border-blue-200 rounded-lg p-2 bg-neutral-100">
                  <h3 className="font-bold text-center mb-2 text-slate-700">
                    DATOS GENERALES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p><span className="font-semibold">Nombre:</span> {selectedEmployee.nombreCompleto}</p>
                      <p><span className="font-semibold">DNI:</span> {selectedEmployee.documento}</p>
                      <p><span className="font-semibold">Código:</span> {selectedEmployee.CODIGO}</p>
                      <p><span className="font-semibold">Dirección:</span> {selectedEmployee.direccion || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Ingreso:</span> {formatDate(selectedEmployee.fecIngreso)}</p>
                      <p><span className="font-semibold">Salida:</span> {formatDate(selectedEmployee.fecCese) || 'N/A'}</p>
                      <p><span className="font-semibold">Estado:</span> {selectedEmployee.estadoLaboral}</p>
                      <p><span className="font-semibold">Motivo Cese:</span> {selectedEmployee.motivoCese || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Secciones de detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Detalle de puestos */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">DETALLE DE LOS PUESTOS DE TRABAJO</h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">

                      <Table>
                        <TableHeader >
                          <TableRow >
                            <TableHead>CARGO</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosPuestos.map((puesto, index) => (
                            <TableRow key={index} className="border-t hover:bg-blue-50 transition-colors">
                              <TableCell>{puesto.CARGO}</TableCell>
                              <TableCell>{formatDate(puesto.mesInicio)}</TableCell>
                              <TableCell>{formatDate(puesto.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {
                        datosPuestos.length === 0 &&
                        <div>
                          <p className="text-center text-sm  text-gray-500">No se encontraron datos de puestos para este empleado.</p>
                        </div>
                      }

                    </div>
                  </div>

                  {/* Detalle de asignación familiar */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">DETALLE DE LOS AFP</h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">

                      <Table>
                        <TableHeader >
                          <TableRow>
                            <TableHead>SP</TableHead>
                            <TableHead>TIPO COMISION</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosAFP.map((afp, index) => (
                            <TableRow key={index} className="border-t hover:bg-blue-50 transition-colors">
                              <TableCell>{afp.SP}</TableCell>
                              <TableCell>{afp.tipoComision}</TableCell>
                              <TableCell>{formatDate(afp.mesInicio)}</TableCell>
                              <TableCell>{formatDate(afp.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {
                        datosAFP.length === 0 &&
                        <div>
                          <p className="text-center text-sm  text-gray-500">No se encontraron datos de AFP para este empleado.</p>
                        </div>
                      }

                    </div>
                  </div>
                  {/* Detalle de puestos */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">DETALLE DE LOS SUELDOS</h3>
                    <p><span className="font-medium">Puesto:</span> {selectedEmployee.cargo || 'N/A'}</p>
                    <p><span className="font-medium">Departamento:</span> {selectedEmployee.departamento || 'N/A'}</p>
                    <p><span className="font-medium">Sueldo:</span> S/ {selectedEmployee.sueldo || 'N/A'}</p>
                    <p><span className="font-medium">AFP:</span> {selectedEmployee.AFP || 'N/A'}</p>
                  </div>

                  {/* Detalle de asignación familiar */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">DETALLE DE LA ASIGNACION FAMILIAR</h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">

                      <Table>
                        <TableHeader >
                          <TableRow >
                            <TableHead>ASIGNACION</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosAsigFam.map((asig, index) => (
                            <TableRow key={index} className="border-t hover:bg-blue-50 transition-colors">
                              <TableCell>{asig.asignacion}</TableCell>
                              <TableCell>{formatDate(asig.mesInicio)}</TableCell>
                              <TableCell>{formatDate(asig.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {
                        datosAsigFam.length === 0 &&
                        <div>
                          <p className="text-center text-sm  text-gray-500">No se encontraron datos de asignación familiar para este empleado.</p>
                        </div>
                      }

                    </div>
                  </div>
                  {/* Detalle de asignación familiar */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">DETALLE DE LOS CESES</h3>

                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">

                      <Table>
                        <TableHeader >
                          <TableRow >
                            <TableHead>FECHA INGRESO</TableHead>
                            <TableHead>FECHA CESE</TableHead>
                            <TableHead>MOTIVO</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosCese.map((cese, index) => (
                            <TableRow key={index} className="border-t hover:bg-blue-50 transition-colors">
                              <TableCell>{formatDate(cese.fecIngreso)}</TableCell>
                              <TableCell>{formatDate(cese.fecCese)}</TableCell>
                              <TableCell>{cese.motivo}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {
                        datosCese.length === 0 &&
                        <div>
                          <p className="text-center text-sm text-gray-500">No se encontraron datos de cese para este empleado.</p>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </DialogContent>
      </Dialog>
      {/* Modal de Edición (ahora con pasos) */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        if (!open) {
          setEditOpen(false)
          setCurrentStep(1)
          setSelectedField(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-yellow-800">
              {currentStep === 1 ? '¿QUÉ CAMPO REQUIERE MODIFICAR?' :
                currentStep === 2 ? 'MODIFICAR DATOS' : 'CONFIRMAR CAMBIOS'}
            </DialogTitle>
            <div className="py-2">
              <Progress value={(currentStep / 3) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Paso {currentStep} de 3</span>
                {currentStep === 2 && selectedField && formData[selectedField].valid && (
                  <span className="text-green-500 flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Datos completos
                  </span>
                )}
                {currentStep === 2 && selectedField && !formData[selectedField].valid && (
                  <span className="text-red-500 flex items-center">
                    <X className="h-3 w-3 mr-1" /> Complete los datos
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          {renderCurrentStep()}

          <DialogFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Atrás
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedField(null)
                  setEditOpen(false)
                }}
              >
                Cancelar
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={handleNextStep}
                className="bg-yellow-600 hover:bg-yellow-700 flex items-center"
                disabled={
                  (currentStep === 1 && !selectedField) ||
                  (currentStep === 2 && !allStepsValid)
                }
              >
                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                Confirmar y enviar <Check className="h-4 w-4 ml-1" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}