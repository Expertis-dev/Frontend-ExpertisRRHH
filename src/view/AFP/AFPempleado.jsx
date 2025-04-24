import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import axios from 'axios'

export const AFPempleado = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEmpleados, setFilteredEmpleados] = useState([])
  const [empleados, setEmpleados] = useState([])
  const ObtenerAFP = async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/afp/listarEmpleadosAFP`)
    if (response.status === 200) {
      const datos = response.data.sort((a, b) =>
        a.ALIAS_EMPLEADO.localeCompare(b.ALIAS_EMPLEADO)
      )
      setEmpleados(datos)
      setFilteredEmpleados(datos)
    }
  }
  useEffect(() => {
    ObtenerAFP()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmpleados(empleados)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = empleados.filter(emp =>
        emp.documento.includes(searchQuery) ||
        emp.ALIAS_EMPLEADO.includes(searchQuery.toUpperCase())
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
      <h1 className="text-center text-xl font-bold text-gray-800">SP EMPLEADOS</h1>

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
                placeholder="Ingrese DNI"
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
                <TableHead>ALIAS EMPLEADO</TableHead>
                <TableHead>AFP</TableHead>
                <TableHead>TIPO COMISION</TableHead>
                <TableHead>MES INICIO</TableHead>
                <TableHead>MES FIN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmpleados.map((empleado, index) => (
                <TableRow key={index} className="border-t hover:bg-blue-50 transition-colors">
                  <TableCell>{empleado.documento}</TableCell>
                  <TableCell className="">{empleado.ALIAS_EMPLEADO}</TableCell>
                  <TableCell>{empleado.SISTEMA_DE_PENSION}</TableCell>
                  <TableCell>{empleado.tipoComision}</TableCell>
                  <TableCell>{empleado.mesInicio.split("T")[0]}</TableCell>
                  <TableCell>{empleado.mesFin === null ? "N/A" : empleado.mesFin.split("T")[0]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}