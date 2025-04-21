import React, { useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
const empleado = [
  {
    DNI: "12345678",
    CODIGO: "EMP001",
    afp: "AFP Integra",
    tipoComision: "Comisión Mixta",
    mesInicio: "Enero",
    mesFin: "Diciembre",
  },
  {
    DNI: "87654321",
    CODIGO: "EMP002",
    afp: "Prima AFP",
    tipoComision: "Comisión Fija",
    mesInicio: "Febrero",
    mesFin: "Noviembre",
  },
  {
    DNI: "11223344",
    CODIGO: "EMP003",
    afp: "Profuturo AFP",
    tipoComision: "Comisión Variable",
    mesInicio: "Marzo",
    mesFin: "Octubre",
  },
  {
    DNI: "55667788",
    CODIGO: "EMP004",
    afp: "AFP Habitat",
    tipoComision: "Comisión Mixta",
    mesInicio: "Abril",
    mesFin: "Septiembre",
  },
  {
    DNI: "99887766",
    CODIGO: "EMP005",
    afp: "AFP Prima",
    tipoComision: "Comisión Fija",
    mesInicio: "Mayo",
    mesFin: "Agosto",
  },
]
export const AFPempleado = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEmpleados, setFilteredEmpleados] = useState([])
  const [empleados, setEmpleados] = useState(empleado)
  useEffect(() => {
    setFilteredEmpleados(empleados)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = empleados.filter(emp =>
        emp.DNI.includes(searchQuery) || // Búsqueda exacta por DNI
        emp.CODIGO.toLowerCase().includes(query) // Búsqueda por código
      )
      setFilteredEmpleados(filtered)
    }
  }, [searchQuery, empleados])

  const handleSearchChange = (e) => {
    const inputValue = e.target.value
    setSearchQuery(inputValue)
  }

  return (
    <div className="w-full px-4">
      <h1 className="text-center text-xl font-bold text-gray-800">AFP EMPLEADOS</h1>
      
      {/* Barra de búsqueda */}
      <div className="py-4 w-full md:w-1/3">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full">
            <span className="font-medium text-gray-700 whitespace-nowrap">Buscar:</span>
            <div className="relative w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Ingrese DNI o código"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabla de empleados */}
      <Card className="shadow-lg overflow-y-auto max-h-[70vh]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>CODIGO EMPLEADO</TableHead>
                <TableHead>AFP</TableHead>
                <TableHead>TIPO COMISION</TableHead>
                <TableHead>MES INICIO</TableHead>
                <TableHead>MES FIN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmpleados.map((empleado) => (
                <TableRow key={empleado.DNI} className="border-t hover:bg-blue-50 transition-colors">
                  <TableCell>{empleado.DNI}</TableCell>
                  <TableCell>{empleado.CODIGO}</TableCell>
                  <TableCell>{empleado.afp}</TableCell>
                  <TableCell>{empleado.tipoComision}</TableCell>
                  <TableCell>{empleado.mesInicio}</TableCell>
                  <TableCell>{empleado.mesFin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}