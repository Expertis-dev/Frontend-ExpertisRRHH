import axios from "axios"
import { useState, useEffect } from "react"
import { Eye, Pencil, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { DatePickerFirstDay } from "@/components/ui/MesInputs"
import { PlusCircleOutlined } from "@ant-design/icons";
const SelectField = ({ label, name, value, onValueChange, error, options, disabled = false, placeholder = "Seleccione", className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="text-slate-800 mb-1">{label}</Label>
    <Select onValueChange={(value) => onValueChange(name, value)} value={value} disabled={disabled}>
      <SelectTrigger className={error ? "border-red-500" : ""}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && (
      <p className="text-sm text-red-500 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" /> {error}
      </p>
    )}
  </div>
)
export const ListarEmpleados = () => {
  const [modalCargo, setModalCargo] = useState(false);
  const [nuevoCargo, setNuevoCargo] = useState("");
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
  const [cargos, setCargos] = useState([])
  // Estados para los diálogos
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  // Estados para el flujo de edición por pasos
  const [selectedField, setSelectedField] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    salary: { amount: '', valid: false, cod_mes: "" },
    position: { title: '', cod_mes: '', valid: false },
    familyAllowance: { hasAllowance: false, dependents: 0, amount: 0, valid: false },
    personalData: { fullName: '', dni: '', address: '', photo: null, valid: false }
  })
  const [allStepsValid, setAllStepsValid] = useState(false)
  const salarioActualPrueba = 1500; // Este valor debería venir de tus datos actuales
  // Obtener empleados desde el backend
  const obtenerEmpleados = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`)
      setEmpleados(response.data.recordset)
      setFilteredEmpleados(response.data.recordset)
      console.log(response.data.recordset)
      const cargosResponse = await fetch("https://p9zzp66h-3000.brs.devtunnels.ms/api/empleados/listarCargos")
      const cargosData = await cargosResponse.json()
      setCargos(cargosData)
    } catch (error) {
      console.error("Error al obtener empleados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    obtenerEmpleados()
  }, [])

  // Efecto para verificar si todos los pasos están completos
  useEffect(() => {
    if (selectedField) {
      const fieldData = formData[selectedField]
      setAllStepsValid(fieldData.valid)
    }
  }, [formData, selectedField])

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query === '') {
      setFilteredEmpleados(empleados);
    } else {
      const filtered = empleados.filter(emp => {
        if (!emp) return false;
        const documento = emp.documento ? emp.documento.toString().toLowerCase() : '';
        const codigo = emp.CODIGO ? emp.CODIGO.toString().toLowerCase() : '';
        const nombre = emp.nombreCompleto ? emp.nombreCompleto.toString().toLowerCase() : '';
        return documento.includes(query) ||
          codigo.includes(query) ||
          nombre.includes(query);
      });
      setFilteredEmpleados(filtered);
    }

  }, [searchQuery, empleados]);

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

    const [year, month, day] = dateString.split('T')[0].split('-')
    return `${day}/${month}/${year}` // Formato "DD/MM/YYYY"
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
    console.log(employee)
    setDetailsOpen(true)
    setLoadingDetails(true)

    try {
      await Promise.all([
        HistoricoCese(employee.idPersona),
        HistoricoPuestos(employee.idPersona),
        HistoricoAFP(employee.idPersona),
        HistoricoAsignacionFamiliar(employee.idPersona),
        HistoricoSueldo(employee.idPersona)
      ]);
    } catch (error) {
      console.error("Error al cargar detalles:", error)
    } finally {
      setLoadingDetails(false)
    }
  }
  const AgregarNuevoCargo = async () => {
    if (!nuevoCargo.trim()) {
      alert("Por favor ingrese un nombre de cargo");
      return;
    }

    const cargoRepetido = cargos.some(c => c.CARGO.toUpperCase() === nuevoCargo.toUpperCase());

    if (cargoRepetido) {
      alert("El cargo ya existe");
      return;
    }

    try {
      // Aquí deberías hacer la llamada API para guardar el nuevo cargo
      // await axios.post('/api/cargos', { cargo: nuevoCargo });

      // Actualizar estado local
      setCargos(prev => [...prev, { CARGO: nuevoCargo }]);
      setFormData(prev => ({
        ...prev,
        position: {
          ...prev.position,
          title: nuevoCargo,
          valid: !!prev.position.startDate
        }
      }));
      setModalCargo(false);
      setNuevoCargo("");
    } catch (error) {
      console.error("Error al agregar cargo:", error);
      alert("Ocurrió un error al agregar el cargo");
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
        cod_mes: "",
        valid: false
      },
      position: {
        title: employee.cargo || '',
        cod_mes: employee.fecIngreso || '', // Cambiado de startDate a cod_mes
        valid: false
      },
      familyAllowance: {
        hasAllowance: employee.asignacionFamiliar === 'Sí',
        dependents: employee.numHijos || 0,
        amount: employee.montoAsignacion || 0,
        valid: false
      },
      personalData: {
        fullName: employee.nombreCompleto || '',
        dni: employee.documento || '',
        address: employee.direccion || '',
        photo: null,
        valid: false
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
        return !!data.amount && !isNaN(data.amount) && data.cod_mes !== "";
      case 'position':
        return !!data.title && !!data.cod_mes;
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
      if (!selectedField || !formData[selectedField].valid) {
        alert("Por favor complete todos los campos correctamente");
        return;
      }
  
      // Datos comunes para todos los casos
      const basePayload = {
        idPersona: selectedEmployee.idPersona
      };
  
      // Datos específicos según el campo
      let endpoint = '';
      let requestData = {};
      
      switch (selectedField) {
        case 'salary':
          endpoint = '/api/empleados/actualizar-salario';
          requestData = {
            ...basePayload,
            nuevoMonto: formData.salary.amount,
            cod_mes: formData.salary.cod_mes
          };
          break;
          
        case 'position':
          endpoint = '/api/empleados/actualizar-puesto';
          requestData = {
            ...basePayload,
            nuevoPuesto: formData.position.title,
            cod_mes: formData.position.cod_mes
          };
          break;
          
        case 'familyAllowance':
          endpoint = '/api/empleados/actualizar-asignacion';
          requestData = {
            ...basePayload,
            tieneAsignacion: formData.familyAllowance.hasAllowance,
            dependientes: formData.familyAllowance.dependents,
            monto: formData.familyAllowance.amount
          };
          break;
          
        case 'personalData':
          endpoint = '/api/empleados/actualizar-datos';
          requestData = {
            ...basePayload,
            nombreCompleto: formData.personalData.fullName,
            dni: formData.personalData.dni,
            direccion: formData.personalData.address
            // foto sería manejada aparte como FormData
          };
          break;
          
        default:
          throw new Error('Campo no válido');
      }
  
      console.log('Enviando datos:', requestData);
      // Descomentar cuando el endpoint esté listo:
      // const response = await axios.put(endpoint, requestData);
      // console.log('Respuesta:', response.data);
  
      // Actualizar estado local
      const updatedEmpleados = empleados.map(emp =>
        emp.idPersona === selectedEmployee.idPersona
          ? { ...emp, ...mapFormDataToEmployee(formData) }
          : emp
      );
  
      setEmpleados(updatedEmpleados);
      setFilteredEmpleados(updatedEmpleados);
      setEditOpen(false);
      //alert("Cambios guardados exitosamente");
  
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      alert("Ocurrió un error al guardar los cambios");
    }
  };

  // Mapear datos del formulario a estructura de empleado
  const mapFormDataToEmployee = (formData) => {
    return {
      ...(selectedField === 'salary' && {
        sueldo: parseFloat(formData.salary.amount)
      }),
      ...(selectedField === 'position' && {
        cargo: formData.position.title,
        fecIngreso: formData.position.cod_mes // Cambiado para usar cod_mes
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
          <div className="space-y-4 py-4 ">
            <DialogDescription className="text-center">
              Complete los datos para modificar {selectedField === 'salary' ? 'el sueldo' :
                selectedField === 'position' ? 'el puesto' :
                  selectedField === 'familyAllowance' ? 'la asignación familiar' : 'los datos personales'}
            </DialogDescription>

            {selectedField === 'salary' && (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="amount">Nuevo Sueldo</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="500"
                        step="100"
                        value={formData.salary.amount}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          let isValid = false;

                          if (inputValue !== '') {
                            const numericValue = parseFloat(inputValue);
                            isValid = !isNaN(numericValue) && numericValue >= 500 && numericValue !== salarioActualPrueba;
                          }

                          setFormData(prev => ({
                            ...prev,
                            salary: {
                              ...prev.salary,
                              amount: inputValue,
                              valid: isValid && prev.salary.cod_mes !== "" // Solo válido si también hay fecha
                            }
                          }));
                        }}
                        className={!formData.salary.valid && formData.salary.amount !== '' ? 'border-red-500' : ''}
                      />
                      {formData.salary.amount !== '' && !formData.salary.valid && (
                        <p className="text-sm text-red-500">
                          {parseFloat(formData.salary.amount) === salarioActualPrueba
                            ? 'El sueldo que quiere ingresar es el mismo al sueldo actual'
                            : 'El monto mínimo permitido es 500'}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Codigo Mes</Label>
                      <div className="flex  flex-col items-center justify-center">
                        <DatePickerFirstDay
                          handleDateChange={(date) => {
                            const hasDate = !!date;

                            setFormData(prev => ({
                              ...prev,
                              salary: {
                                ...prev.salary,
                                cod_mes: date ? date.toISOString().split("T")[0] : "",
                                valid: prev.salary.amount !== "" &&
                                  parseFloat(prev.salary.amount) >= 500 &&
                                  parseFloat(prev.salary.amount) !== salarioActualPrueba &&
                                  hasDate
                              }
                            }));
                          }}
                        />
                        {formData.salary.cod_mes === "" && (
                          <p className="text-sm text-red-500">
                            Por favor seleccione una fecha válida
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedField === 'position' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <SelectField
                    className="w-full"
                    label="CARGO*"
                    name="cargo"
                    value={formData.position.title}
                    onValueChange={(name, value) => {
                      setFormData(prev => ({
                        ...prev,
                        position: {
                          ...prev.position,
                          title: value,
                          valid: !!value && !!prev.position.cod_mes
                        }
                      }));
                    }}
                    options={cargos.map(c => ({ value: c.CARGO, label: c.CARGO }))}
                  />
                  <Button
                    variant="outline"
                    className="translate-y-3"
                    size="small"
                    onClick={() => setModalCargo(true)}
                  >
                    <PlusCircleOutlined className="text-white bg-green-700 p-1 rounded-md" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Codigo Mes*</Label>
                  <div className="flex items-center justify-center">
                    <DatePickerFirstDay
                      handleDateChange={(date) => {
                        const hasDate = !!date;
                        setFormData(prev => ({
                          ...prev,
                          position: {
                            ...prev.position,
                            cod_mes: date ? date.toISOString().split("T")[0] : "",
                            valid: !!prev.position.title && hasDate
                          }
                        }));
                      }}
                    />
                  </div>
                  {formData.position.cod_mes === "" && (
                    <p className="text-sm text-red-500">Por favor seleccione una fecha válida</p>
                  )}
                </div>

                {!formData.position.valid && (
                  <p className="text-sm text-red-500">
                    {!formData.position.title ? 'Por favor seleccione un cargo' :
                      !formData.position.cod_mes ? 'Por favor seleccione una fecha' :
                        'Complete todos los campos requeridos'}
                  </p>
                )}
                <Dialog open={modalCargo} onOpenChange={() => setModalCargo(false)}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-center">Agregar nuevo cargo</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                      <Label className="text-slate-800 mb-2 text-start w-full">Nuevo Cargo*</Label>
                      <Input
                        value={nuevoCargo}
                        onChange={(e) => setNuevoCargo(e.target.value.toUpperCase())}
                        placeholder="Ingrese el nombre del cargo"
                      />
                      {!nuevoCargo.trim() && (
                        <p className="text-sm text-red-500 w-full mt-1">Por favor ingrese un nombre de cargo</p>
                      )}
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setModalCargo(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={AgregarNuevoCargo}
                        disabled={!nuevoCargo.trim()}
                      >
                        Agregar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

            <div className="border rounded-lg p-2">
              <h3 className="font-semibold text-center">Resumen de cambios:</h3>
              <hr className="py-1" />
              {selectedField === 'salary' && (
                <>
                  <div className="flex justify-between">
                    <p><span className="font-medium">Anterior sueldo:</span>{salarioActualPrueba} </p>
                    <p><span className="font-medium">Nuevo sueldo:</span> {formData.salary.currency} {formData.salary.amount}</p>
                  </div>
                  <div><p><span className="font-medium">Codigo Mes: </span>{formData.salary.cod_mes} </p></div>
                </>
              )}
              {selectedField === 'position' && (
                <>
                  <p><span className="font-medium">Nuevo puesto:</span> {formData.position.title}</p>
                  <p><span className="font-medium">Mes inicio:</span> {formData.position.cod_mes}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p><span className="font-semibold">Nombre:</span> {selectedEmployee.nombreCompleto}</p>
                      <p><span className="font-semibold">DNI:</span> {selectedEmployee.documento}</p>
                      <p><span className="font-semibold">Código:</span> {selectedEmployee.CODIGO}</p>
                      <p><span className="font-semibold">Edad:</span> {selectedEmployee.Edad}</p>
                      <p><span className="font-semibold">Correo:</span> {selectedEmployee.correo}</p>
                      <p><span className="font-semibold">Num.Hijos:</span> {selectedEmployee.nroHijos}</p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Ingreso:</span> {formatDate(selectedEmployee.fecIngreso)}</p>
                      <p><span className="font-semibold">Telefono:</span> {selectedEmployee.telefono}</p>
                      <p><span className="font-semibold">Estado:</span> {selectedEmployee.estadoLaboral}</p>
                      <p><span className="font-semibold">Motivo Cese:</span> {selectedEmployee.motivoCese || 'N/A'}</p>
                      <p><span className="font-semibold">Estado Civil:</span> {selectedEmployee.estadoCivil}</p>
                      <p><span className="font-semibold">Cant. Ingresos:</span> {selectedEmployee.CantidadIngresos}</p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Dirección:</span> {selectedEmployee.direccion || 'N/A'}</p>
                      <p><span className="font-semibold">Departamento:</span> {selectedEmployee.departamento || 'N/A'}</p>
                      <p><span className="font-semibold">Provincia:</span> {selectedEmployee.provincia || 'N/A'}</p>
                      <p><span className="font-semibold">Distrito:</span> {selectedEmployee.distrito || 'N/A'}</p>
                      <p><span className="font-semibold">Fech. Nacimiento:</span> {formatDate(selectedEmployee.fecNacimiento)}</p>
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
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">

                      <Table>
                        <TableHeader >
                          <TableRow >
                            <TableHead>SUELDO</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosSueldos.map((sueldo, index) => (
                            <TableRow key={index} className="border-t hover:bg-blue-50 transition-colors">
                              <TableCell>{sueldo.sueldoFijo}</TableCell>
                              <TableCell>{formatDate(sueldo.mesInicio)}</TableCell>
                              <TableCell>{formatDate(sueldo.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {
                        datosSueldos.length === 0 &&
                        <div>
                          <p className="text-center text-sm  text-gray-500">No se encontraron datos de los sueldos  </p>
                        </div>
                      }

                    </div>
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
        <DialogContent className="max-w-md max-h-[95vh]  overflow-y-scroll">
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