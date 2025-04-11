import { useState } from "react"
import { Search, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export const Empleado = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedField, setSelectedField] = useState(null); // null | 'salary' | 'position' | 'familyAllowance' | 'personalData'
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isValid, setIsValid] = useState(false)
  // Campos a editar
  const [fieldsToEdit, setFieldsToEdit] = useState({
    salary: false,
    position: false,
    familyAllowance: false,
    personalData: false,
  })

  // Datos de ejemplo
  const employees = Array(30)
    .fill(null)
    .map((_, index) => ({
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

  const openDetails = (employee) => {
    setSelectedEmployee(employee)
    setDetailsOpen(true)
  }

  const openEdit = (employee) => {
    setSelectedEmployee(employee)
    setEditOpen(true)
  }
  const handleDocumentoChange = (e) => {
    const inputValue = e.target.value;
    
    // 1. Eliminar cualquier carácter que no sea dígito
    const numericValue = inputValue.replace(/\D/g, '');
    
    // 2. Limitar a 8 dígitos máximo
    const truncatedValue = numericValue.slice(0, 8);
    
    // 3. Actualizar el estado solo si es válido
    setSearchQuery(truncatedValue);
    
    // 4. Opcional: Validación completa (exactamente 8 dígitos)
    const isValid = /^\d{8}$/.test(truncatedValue);
    setIsValid(isValid);
  };


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
                maxLength={8} // Esto ayuda visualmente pero no previene la entrada no numérica
                inputMode="numeric" // Muestra teclado numérico en dispositivos móviles
                pattern="\d*" // Sugiere que solo se esperan dígitos
              />
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto transition-all" disabled={!isValid}>
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
                <TableHead className="font-bold text-gray-700">INGRESO</TableHead>
                <TableHead className="font-bold text-gray-700">SALIDA</TableHead>
                <TableHead className="font-bold text-gray-700">CODIGO EMPLEADO</TableHead>
                <TableHead className="font-bold text-gray-700">MOTIVO CESE</TableHead>
                <TableHead className="font-bold text-gray-700">INGRESO BRUTO</TableHead>
                <TableHead className="font-bold text-gray-700">IMPUESTO RETENIDO</TableHead>
                <TableHead className="font-bold text-gray-700">SUMA GRACIOSA</TableHead>
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
                  <TableCell>{employee.employeeCode}</TableCell>
                  <TableCell>{employee.terminationReason}</TableCell>
                  <TableCell>{employee.grossIncome}</TableCell>
                  <TableCell>{employee.taxWithheld}</TableCell>
                  <TableCell>{employee.bonus}</TableCell>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-yellow-800">
              ¿QUÉ CAMPO REQUIERE MODIFICAR?
            </DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-4 py-4">
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
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setSelectedField(null);
              setEditOpen(false);
            }}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Lógica para continuar con la edición
                console.log('Campo seleccionado:', selectedField);
                setEditOpen(false);
                // Aquí puedes abrir otro modal específico según la selección
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={!selectedField} // Botón deshabilitado si no hay selección
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
