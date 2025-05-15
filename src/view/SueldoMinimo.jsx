import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Check, AlertTriangle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
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
import { PlusCircleOutlined } from "@ant-design/icons"
import axios from "axios";
import dayjs from "dayjs";
import { useData } from "@/provider/Provider";

export const SueldoMinimo = () => {
    const [data, setData] = useState([]);
    const [isSueldo, setIsSueldo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);
    const [nuevoSueldo, setNuevoSueldo] = useState("");
    const [fechaInicio, setFechaInicio] = useState(null);
    const [error, setError] = useState("");
    const { nombre } = useData()
    const ObtenerSueldos = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/sueldosminimos/listarHistoricoSueldosminimos`)
            if (response.status === 200) {
                setData(response.data.sort((a, b) => new Date(b.mesInicio) - new Date(a.mesInicio)))
            }
        } catch (error) {
            console.error("Error al obtener sueldos:", error)
        }
    }

    useEffect(() => {
        ObtenerSueldos()
    }, [])

    const isValidForm = () => {
        if (!nuevoSueldo || isNaN(nuevoSueldo) || parseFloat(nuevoSueldo) <= 0) {
            setError("Ingrese un monto válido (mayor a 0)");
            return false;
        }
        if (!fechaInicio) {
            setError("Seleccione una fecha de inicio");
            return false;
        }

        // Validar que la fecha no sea anterior al último registro
        const ultimoRegistro = data[0];
        if (ultimoRegistro && new Date(fechaInicio) <= new Date(ultimoRegistro.mesInicio)) {
            setError(`La fecha debe ser posterior a ${ultimoRegistro.mesInicio.split("T")[0]}`);
            return false;
        }

        setError("");
        return true;
    };

    const handleSubmit = () => {
        if (!isValidForm()) return;
        setIsSueldo(false)
        setIsConfirm(true);
    };

    const confirmSubmit = async () => {
        setIsConfirm(false);
        setIsLoading(true);

        try {
            const cuerpo = {
                nuevoSueldoMinimo: parseFloat(nuevoSueldo),
                mesinicio: fechaInicio.format("YYYY-MM-DD"),
                usuario: nombre
            }
            console.log(cuerpo)
            const response = await axios.post(` ${import.meta.env.VITE_BACKEND_URL}/api/sueldosminimos/registarNuevoSueldoMinimo `, cuerpo);
            if (response.status === 200) {
                await ObtenerSueldos();
                setIsSuccess(true);
                Limpiar();
                setTimeout(() => setIsSuccess(false), 2000)
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            setError("Ocurrió un error al guardar los datos");
        } finally {
            setIsLoading(false);
        }
    };

    const Limpiar = () => {
        setNuevoSueldo("")
        setFechaInicio(null)
        setError("")
    }

    return (
        <div className="flex flex-col gap-4 items-center">
            <p className="text-xl font-bold text-center">SUELDO MÍNIMO</p>
            <div className="w-full flex px-8 justify-end">
                <Button
                    onClick={() => setIsSueldo(true)}
                    className="text-white bg-green-600 hover:bg-green-700"
                >
                    <PlusCircleOutlined /> AÑADIR NUEVO SUELDO MINIMO
                </Button>
            </div>

            {/* TABLA DE SUELDOS */}
            <div className="w-2/3 max-h-[80vh] overflow-y-auto border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="text-center text-md">SUELDO MÍNIMO</TableHead>
                            <TableHead className="text-center text-md">FECHA INICIO</TableHead>
                            <TableHead className="text-center text-md">FECHA FIN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((datos, index) => (
                            <TableRow key={index} className="hover:bg-blue-50">
                                <TableCell className="text-center text-md">{`S/. ${parseFloat(datos.montoSueldo).toFixed(2)}`}</TableCell>
                                <TableCell className="text-center text-md">{(datos.mesInicio.split("T")[0]).split("-").reverse().slice(1).join("-")}</TableCell>
                                <TableCell className="text-center text-md">
                                    {datos.mesFin ? (datos.mesFin.split("T")[0]).split("-").reverse().slice(1).join("-") : "VIGENTE"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* MODAL PARA AGREGAR NUEVO SUELDO */}
            <Dialog open={isSueldo} onOpenChange={() => {
                Limpiar();
                setIsSueldo(false);
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
                                onChange={(e) => setNuevoSueldo(e.target.value)}
                                placeholder="Ingrese el monto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha de Inicio*</Label>
                            <DatePickerFirstDay
                                mesInicio={data.find(dato => dato.mesFin === null)?.mesInicio}
                                handleDateChange={(date) => setFechaInicio(date)}
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
                                onClick={handleSubmit}
                                disabled={!nuevoSueldo || !fechaInicio}
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
                            ¿Está seguro de agregar un nuevo sueldo mínimo de S/. {nuevoSueldo} a partir del {dayjs(fechaInicio).format('MM/YYYY')}?
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirm(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmSubmit} className="bg-green-600 hover:bg-green-700">
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL DE CARGA */}
            <Dialog open={isLoading}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Procesando</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-blue-600">Actualizando datos...</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL DE ÉXITO */}
            <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">¡Éxito!</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 text-center">
                            El sueldo mínimo se ha actualizado correctamente.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}