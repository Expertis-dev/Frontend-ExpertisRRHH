import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Check, AlertTriangle, AlertCircle, Loader2, Info, UserPlus } from "lucide-react"
import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerFirstDay } from "@/components/ui/MesInputs";

const dataSimulada = [{
    sueldoMinimo: 980,
    fecInicio: "19-02-2010",
    fecFin: "20-09-2012"
}, {
    sueldoMinimo: 1025,
    fecInicio: "21-09-2012",
    fecFin: "10-01-2025"
}, {
    sueldoMinimo: 1135,
    fecInicio: "11-01-2025",
    fecFin: ""
}];

export const SueldoMinimo = () => {
    const [data, setData] = useState(dataSimulada);
    const [isSueldo, setIsSueldo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);
    const [nuevoSueldo, setNuevoSueldo] = useState("");
    const [fechaInicio, setFechaInicio] = useState(null);
    const [error, setError] = useState("");

    // Validar formulario
    const isValidForm = () => {
        return nuevoSueldo && !isNaN(nuevoSueldo) && parseFloat(nuevoSueldo) > 0 && fechaInicio;
    };

    // Manejar el envío del formulario
    const handleSubmit = () => {
        Limpiar()
        if (!isValidForm()) {
            setError("Por favor complete todos los campos correctamente");
            return;
        }
        setIsSueldo(false)
        setIsConfirm(true);
    };

    // Confirmar y guardar los datos
    const confirmSubmit = async () => {
        Limpiar()
        setIsConfirm(false);
        setIsLoading(true);
        
        // Simular llamada a API
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Actualizar los datos
            const nuevoRegistro = {
                sueldoMinimo: parseFloat(nuevoSueldo),
                fecInicio: fechaInicio.toLocaleDateString('es-ES'),
                fecFin: ""
            };
            
            // Actualizar el último registro para agregar fecha fin
            const updatedData = [...data];
            if (updatedData.length > 0) {
                updatedData[updatedData.length - 1].fecFin = fechaInicio.toLocaleDateString('es-ES');
            }
            
            setData([...updatedData, nuevoRegistro]);
            setIsSuccess(true);
            
            // Resetear el formulario
            setNuevoSueldo("");
            setFechaInicio(null);
            setIsSueldo(false);
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const Limpiar = ()=>{
        setNuevoSueldo("")
        setFechaInicio("")
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-xl font-bold text-center">SUELDO MÍNIMO</p>
            <div className="flex px-8 justify-end">
                <Button onClick={() => setIsSueldo(true)} className="bg-green-600">
                    + Agregar
                </Button>
            </div>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead>SUELDO MÍNIMO</TableHead>
                            <TableHead>FECHA INICIO</TableHead>
                            <TableHead>FECHA FIN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((datos, index) => (
                            <TableRow
                                key={index}
                                className="border-t hover:bg-blue-50 transition-colors"
                            >
                                <TableCell>{datos.sueldoMinimo}</TableCell>
                                <TableCell>{datos.fecInicio}</TableCell>
                                <TableCell>{datos.fecFin === "" ? "N/A" : datos.fecFin}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* MODAL PARA AGREGAR NUEVO SUELDO MÍNIMO */}
            <Dialog open={isSueldo} onOpenChange={() => {
                Limpiar()
                setIsSueldo(false);
                setError("");
            }}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">INGRESAR NUEVO SUELDO MÍNIMO</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nuevo Sueldo Mínimo*</Label>
                            <Input
                                type="number"
                                min="500"
                                step="100"
                                value={nuevoSueldo}
                                onChange={(e) => {
                                    setNuevoSueldo(e.target.value);
                                    setError("");
                                }}
                                placeholder="Ingrese el monto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha de Inicio*</Label>
                            <DatePickerFirstDay 
                            mesInicio={"01-03-2025"}
                                handleDateChange={(date) => {
                                    setFechaInicio(date.toISOString().split("T")[0]);
                                    setError("");
                                }}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                        <DialogFooter>
                            <Button 
                                type="button" 
                                onClick={handleSubmit}
                                disabled={!isValidForm()}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Guardar
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL DE CONFIRMACIÓN */}
            <Dialog open={isConfirm} onOpenChange={setIsConfirm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Confirmar Cambios</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-4 space-y-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <p className="text-gray-600 text-center">
                            ¿Está seguro de agregar un nuevo sueldo mínimo de {nuevoSueldo} a partir del {fechaInicio}?
                        </p>
                        <div className="flex flex-col gap-4 w-full">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsConfirm(false)}
                                className="w-full"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={confirmSubmit}
                                className="bg-green-600 hover:bg-green-700 w-full"
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL DE LOADING */}
            <Dialog open={isLoading}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Procesando actualización</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-blue-600 spin-reverse"></div>
                        </div>
                        <p className="mt-4 text-blue-600 font-medium">
                            Actualizando datos...
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL DE ÉXITO */}
            <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Datos Actualizados</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 text-center">
                            El nuevo sueldo mínimo se ha registrado correctamente.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}