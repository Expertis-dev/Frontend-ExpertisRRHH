import { useState, useEffect } from "react"
import { Search, Eye, Pencil, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export const ListarEmpleados = () => {
  // Estados de búsqueda y validación
  const [searchQuery, setSearchQuery] = useState("")
  const [isValid, setIsValid] = useState(false)
  
  // Estados para los diálogos
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  
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

  // Datos de ejemplo
  const employees = Array(30).fill(null).map((_, index) => ({
    id: index + 1,
    fullName: "Carlos Sebastian Calderon Vega",
    dni: "12345678",
    entryDate: "01/01/2023",
    exitDate: "01/01/2023",
    employeeCode: "06815077-2015-11",
    terminationReason: "N/A",
    grossIncome: 5000,
    taxWithheld: 800,
    bonus: "N/A",
    position: "Desarrollador Senior",
    familyAllowance: "2 hijos",
    afp: "AFP Integra",
  }))

  // Efecto para verificar si todos los pasos están completos
  useEffect(() => {
    if (selectedField) {
      const fieldData = formData[selectedField]
      setAllStepsValid(fieldData.valid)
    }
  }, [formData, selectedField])

  // Manejo del documento de búsqueda
  const handleDocumentoChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/\D/g, '');
    const truncatedValue = numericValue.slice(0, 8);
    setSearchQuery(truncatedValue);
    setIsValid(/^\d{8}$/.test(truncatedValue));
  };

  // Abrir detalles del empleado
  const openDetails = (employee) => {
    setSelectedEmployee(employee)
    setDetailsOpen(true)
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
        amount: employee.grossIncome.toString(), 
        currency: 'PEN', 
        valid: true 
      },
      position: { 
        title: employee.position, 
        department: 'Tecnología', 
        startDate: employee.entryDate,
        valid: true 
      },
      familyAllowance: { 
        hasAllowance: employee.familyAllowance !== "N/A", 
        dependents: employee.familyAllowance === "2 hijos" ? 2 : 0, 
        amount: employee.familyAllowance === "2 hijos" ? 200 : 0,
        valid: true 
      },
      personalData: { 
        fullName: employee.fullName, 
        dni: employee.dni, 
        address: 'Dirección no especificada',
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
        valid: validateStep(selectedField, {...prev[selectedField], ...value})
      }
    }))
  }

  // Validar el paso actual
  const validateStep = (field, data) => {
    switch(field) {
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
      // Primer paso: selección de campo
      if (!selectedField) return
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Segundo paso: edición del campo
      if (!allStepsValid) return
      setCurrentStep(3)
    }
  }

  // Enviar datos (último paso)
  const handleSubmit = () => {
    console.log('Datos enviados:', {
      employeeId: selectedEmployee.id,
      field: selectedField,
      data: formData[selectedField]
    })
    setEditOpen(false)
  }

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch(currentStep) {
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
                  <p><span className="font-medium">Anterior:</span> PEN {selectedEmployee.grossIncome}</p>
                </>
              )}
              {selectedField === 'position' && (
                <>
                  <p><span className="font-medium">Nuevo puesto:</span> {formData.position.title}</p>
                  <p><span className="font-medium">Departamento:</span> {formData.position.department}</p>
                  <p><span className="font-medium">Fecha inicio:</span> {formData.position.startDate}</p>
                  <p><span className="font-medium">Anterior:</span> {selectedEmployee.position}</p>
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
                  <p><span className="font-medium">Anterior:</span> {selectedEmployee.familyAllowance}</p>
                </>
              )}
              {selectedField === 'personalData' && (
                <>
                  <p><span className="font-medium">Nombre completo:</span> {formData.personalData.fullName}</p>
                  <p><span className="font-medium">DNI:</span> {formData.personalData.dni}</p>
                  <p><span className="font-medium">Dirección:</span> {formData.personalData.address}</p>
                  <p><span className="font-medium">Foto:</span> {formData.personalData.photo ? 'Subida' : 'Sin cambios'}</p>
                  <p><span className="font-medium">Anterior nombre:</span> {selectedEmployee.fullName}</p>
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
      <div className="py-8 w-1/2">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full">
            <span className="font-medium text-gray-700 whitespace-nowrap">Documento:</span>
            <div className="relative w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleDocumentoChange}
                placeholder="Ingrese DNI (8 dígitos)"
                maxLength={8}
                inputMode="numeric"
                pattern="\d*"
              />
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto transition-all cursor-pointer" disabled={!isValid}>
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Tabla de empleados */}
      <Card className="shadow-lg overflow-y-auto max-h-[70vh] ">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gray-100">
                <TableHead className="font-bold text-gray-700">NOMBRE COMPLETO</TableHead>
                <TableHead className="font-bold text-gray-700">DNI</TableHead>
                <TableHead className="font-bold text-gray-700">FECHA INGRESO</TableHead>
                <TableHead className="font-bold text-gray-700">FECHA SALIDA</TableHead>
                <TableHead className="font-bold text-gray-700">ESTADO LABORAL</TableHead> 
                <TableHead className="font-bold text-gray-700">MOTIVO CESE</TableHead>           
                <TableHead className="font-bold text-gray-700">DETALLE</TableHead>
                <TableHead className="font-bold text-gray-700">EDITAR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="border-t hover:bg-blue-50 transition-colors">
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>{employee.dni}</TableCell>
                  <TableCell>{employee.entryDate}</TableCell>
                  <TableCell>{employee.exitDate}</TableCell>
                  <TableCell>PRACTICANTE</TableCell>                  
                  <TableCell>{employee.terminationReason}</TableCell>                  
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

      {/* Modal de Detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[96vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-blue-800 border-b pb-2">
              MODAL DE RELACIÓN DEL EMPLEADO
            </DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Datos generales */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold text-center mb-2 text-blue-700">
                  DATOS GENERALES DEL EMPLEADO (SERÁN LOS DATOS QUE SE VISUALIZÓ EN LA TABLA)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p>
                      <span className="font-semibold">Nombre:</span> {selectedEmployee.fullName}
                    </p>
                    <p>
                      <span className="font-semibold">DNI:</span> {selectedEmployee.dni}
                    </p>
                    <p>
                      <span className="font-semibold">Código:</span> {selectedEmployee.employeeCode}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <span className="font-semibold">Ingreso:</span> {selectedEmployee.entryDate}
                    </p>
                    <p>
                      <span className="font-semibold">Salida:</span> {selectedEmployee.exitDate}
                    </p>
                    <p>
                      <span className="font-semibold">Motivo Cese:</span> {selectedEmployee.terminationReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secciones de detalles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detalle de puestos */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2 border-b pb-1">Detalle de los puestos de trabajo</h3>
                  <p>Puesto actual: {selectedEmployee.position}</p>
                  <p>Fecha de asignación: {selectedEmployee.entryDate}</p>
                  <p>Departamento: Tecnología</p>
                </div>

                {/* Detalle de AFP */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2 border-b pb-1">Detalle de los AFP</h3>
                  <p>AFP actual: {selectedEmployee.afp}</p>
                  <p>Fecha de afiliación: 01/01/2020</p>
                  <p>Porcentaje: 10%</p>
                </div>

                {/* Detalle de sueldos */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2 border-b pb-1">Detalle de los sueldos</h3>
                  <p>Sueldo bruto: S/ {selectedEmployee.grossIncome}</p>
                  <p>Impuesto retenido: S/ {selectedEmployee.taxWithheld}</p>
                  <p>Sueldo neto: S/ {selectedEmployee.grossIncome - selectedEmployee.taxWithheld}</p>
                </div>

                {/* Detalle de asignación familiar */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2 border-b pb-1">Detalle de la Asignación Familiar</h3>
                  <p>Estado: Activo</p>
                  <p>Dependientes: {selectedEmployee.familyAllowance}</p>
                  <p>Monto asignado: S/ 200</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
              Cerrar
            </Button>
          </DialogFooter>
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
    </div>
  )
}