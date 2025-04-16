import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const HistorialDescuentos = () => {
    const [data, setData] = useState([
        {
            codigoEmpleado: "EMP001",
            nombreCompleto: "Juan Pérez",
            dni: "12345678",
            fechaIngreso: "2023-01-15",
            estadoLaboral: "Activo",
            montoDescuento: 150.0,
            motivo: "Tardanzas"
        },
        {
            codigoEmpleado: "EMP002",
            nombreCompleto: "María López",
            dni: "87654321",
            fechaIngreso: "2022-11-10",
            estadoLaboral: "Inactivo",
            montoDescuento: 200.0,
            motivo: "Faltas injustificadas"
        },
        {
            codigoEmpleado: "EMP003",
            nombreCompleto: "Carlos Gómez",
            dni: "45678912",
            fechaIngreso: "2023-03-05",
            estadoLaboral: "Activo",
            montoDescuento: 100.0,
            motivo: "Errores en el trabajo"
        }
    ]);

    return (
        <div className="p-4 flex flex-col gap-4">
            <h1 className='text-2xl'>Histórico de Descuentos</h1>
            <div className="flex gap-4 items-center w-full justify-between">
                <input
                    type="text"
                    placeholder="Buscar por alias del empleado"
                    className="border p-2 rounded w-1/2"
                    onChange={(e) => {
                        const searchValue = e.target.value.toLowerCase();
                        setData((prevData) =>
                            prevData.filter((item) =>
                                item.nombreCompleto.toLowerCase().includes(searchValue)
                            )
                        );
                    }}
                />
                <input
                    type="date"
                    className="border p-2 rounded"
                    onChange={(e) => {
                        const selectedDate = e.target.value;
                        setData((prevData) =>
                            prevData.filter((item) => item.fechaIngreso === selectedDate)
                        );
                    }}
                />
            </div>

            <Table>
                <TableHeader className="sticky top-0 z-10 bg-red-400">
                    <TableRow>
                        <TableHead className="font-bold text-gray-700">CÓDIGO EMPLEADO</TableHead>
                        <TableHead className="font-bold text-gray-700">NOMBRE COMPLETO</TableHead>
                        <TableHead className="font-bold text-gray-700">DNI</TableHead>
                        <TableHead className="font-bold text-gray-700">FECHA INGRESO</TableHead>
                        <TableHead className="font-bold text-gray-700">ESTADO LABORAL</TableHead>
                        <TableHead className="font-bold text-gray-700">MONTO DESCUENTO</TableHead>
                        <TableHead className="font-bold text-gray-700">MOTIVO</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.codigoEmpleado}</TableCell>
                            <TableCell>{item.nombreCompleto}</TableCell>
                            <TableCell>{item.dni}</TableCell>
                            <TableCell>{item.fechaIngreso}</TableCell>
                            <TableCell>{item.estadoLaboral}</TableCell>
                            <TableCell>{item.montoDescuento}</TableCell>
                            <TableCell>{item.motivo}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default HistorialDescuentos;