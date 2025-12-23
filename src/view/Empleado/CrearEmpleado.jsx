import { PlusCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Check, AlertTriangle, AlertCircle, Loader2, Info, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import dayjs from 'dayjs';
// Componentes reutilizables
function sumarDiasHabiles(fecha, cantidad) {
    let diasSumados = 0;
    let resultado = dayjs(fecha);

    while (diasSumados < cantidad) {
        resultado = resultado.add(1, 'day');
        const dia = resultado.day(); // 0 = domingo, 6 = sábado

        if (dia >= 1 && dia <= 5) {
            diasSumados++;
        }
    }

    return resultado;
}

const InputField = ({ label, id, name, type = "text", value, onChange, error, className = "", ...props }) => (
    <div className={`space-y-2 ${className}`}>
        <Label htmlFor={id} className="text-slate-800 mb-1">{label}</Label>
        <Input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className={`border-gray-300 ${error ? "border-red-500" : ""}`}
            {...props}
        />
        {error && (
            <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {error}
            </p>
        )}
    </div>
)

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

const RadioField = ({ label, name, value, onValueChange, error, options, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        <Label className="text-slate-800 mb-1">{label}</Label>
        <RadioGroup value={value} onValueChange={(value) => onValueChange(name, value)} className="flex space-x-8 pt-2">
            {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                    <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
                </div>
            ))}
        </RadioGroup>
        {error && (
            <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {error}
            </p>
        )}
    </div>
)

export const CrearEmpleado = () => {
    const [modalCargo, setModalCargo] = useState(false)
    const navegar = useNavigate()
    // Estados iniciales
    const initialState = {
        documento: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombre: "",
        fecIniciGestion: "",
        sexo: "",
        estadoCivil: "",
        cargo: "",
        nroHijos: "",
        correo: "",
        telefono: "",
        asignacionfamiliar: "",
        dir: "",
        dep: "",
        prov: "",
        dist: "",
        fecNacimiento: "",
        depNacimiento: "",
        provNacimiento: "",
        distNacimiento: "",
        sueldo: "",
        afp: "",
        tipoContrato: "",
        tip_comision: "",
        porcentajeAfp: "",
        impuestoRetenido: "",
        ingresoBruto: "",
    }

    // Estados del componente
    const [ubigeoData, setUbigeoData] = useState([])
    const [deps, setDeps] = useState([])
    const [provincias, setProvincias] = useState([])
    const [distritos, setDistritos] = useState([])
    const [provsNacimiento, setProvsNacimiento] = useState([])
    const [distsNacimiento, setDistsNacimiento] = useState([])
    const [registro, setRegistro] = useState(true)
    const [cargos, setCargos] = useState([])
    const [currentStep, setCurrentStep] = useState(0)
    const [formErrors, setFormErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [formData, setFormData] = useState(initialState)
    const [nuevoCargo, setNuevoCargo] = useState("")
    // Estados para los diálogos modales
    const [dialogState, setDialogState] = useState({
        documentoInput: true,
        verifying: false,
        newEmployee: false,
        terminatedEmployee: false,
        registeredEmployee: false
    })
    // Secciones para el resumen de datos
    const sections = [
        {
            title: "Información Personal",
            fields: [
                { label: "Nombre", value: `${formData.nombre.toUpperCase()} ${formData.apellidoPaterno.toUpperCase()} ${formData.apellidoMaterno.toUpperCase()}` },
                { label: "Documento", value: formData.documento.toUpperCase() },
                { label: "Sexo", value: formData.sexo.toUpperCase() },
                { label: "Estado Civil", value: formData.estadoCivil.toUpperCase() },
                { label: "N° de Hijos", value: formData.nroHijos.toUpperCase() },
                { label: "Teléfono", value: formData.telefono.toUpperCase() },
                { label: "Correo", value: formData.correo.toUpperCase() },
            ]
        },
        {
            title: "Datos Laborales",
            fields: [
                { label: "Cargo", value: formData.cargo.toUpperCase() },
                { label: "Sueldo", value: `S/ ${formData.sueldo.toUpperCase()}` },
                { label: "Fecha Inicio", value: formData.fecIniciGestion.toUpperCase() },
                { label: "Tipo Comisión", value: formData.tip_comision === "0" ? "NULA" : formData.tip_comision.toUpperCase() },
                { label: "Asignación Familiar", value: formData.asignacionfamiliar.toUpperCase() },
                { label: "Impuesto Retenido", value: formData.impuestoRetenido.toUpperCase() },
                { label: "Ingreso Bruto", value: formData.ingresoBruto.toUpperCase() },
            ]
        },
        {
            title: "Datos de AFP",
            fields: [
                { label: "AFP", value: formData.afp === "0" ? "NO TIENE AFP" : formData.afp.toUpperCase() },
                { label: "Régimen", value: formData.tipoContrato.toUpperCase() },
            ]
        },
        {
            title: "Ubicación",
            fields: [
                { label: "Dirección", value: formData.dir.toUpperCase() },
                { label: "Departamento", value: formData.dep.toUpperCase() },
                { label: "Provincia", value: formData.prov.toUpperCase() },
                { label: "Distrito", value: formData.dist.toUpperCase() },
            ]
        },
        {
            title: "Datos de Nacimiento",
            fields: [
                { label: "Fecha Nacimiento", value: formData.fecNacimiento.toUpperCase() },
                { label: "Departamento", value: formData.depNacimiento.toUpperCase() },
                { label: "Provincia", value: formData.provNacimiento.toUpperCase() },
                { label: "Distrito", value: formData.distNacimiento.toUpperCase() },
            ]
        }
    ]

    // Efectos para cargar datos iniciales
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Cargar datos de ubigeo
                const ubigeoResponse = await fetch("/data.json")
                const ubigeoData = await ubigeoResponse.json()
                setUbigeoData(ubigeoData)
                setDeps(ubigeoData.map(item => ({ id: item.id, name: item.name })))

                // Cargar datos de cargos
                const cargosResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarCargos`)
                const cargosData = await cargosResponse.json()
                setCargos(cargosData)
            } catch (error) {
                console.error("Error cargando los datos:", error)
            }
        }

        fetchInitialData()
    }, [])

    // Efectos para cargar provincias y distritos
    useEffect(() => {
        if (formData.dep && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.dep)
            if (deptoSeleccionado) {
                setProvincias(deptoSeleccionado.provincias.map(prov => ({ id: prov.id, name: prov.name })))
                setFormData(prev => ({ ...prev, prov: "", dist: "" }))
            }
        }
    }, [formData.dep, ubigeoData])

    useEffect(() => {
        if (formData.prov && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.dep)
            if (deptoSeleccionado) {
                const provSeleccionada = deptoSeleccionado.provincias.find(prov => prov.name === formData.prov)
                if (provSeleccionada) {
                    setDistritos(provSeleccionada.distritos.map(dist => ({ id: dist.id, name: dist.name })))
                    setFormData(prev => ({ ...prev, dist: "" }))
                }
            }
        }
    }, [formData.prov, ubigeoData, formData.dep])

    useEffect(() => {
        if (formData.depNacimiento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.depNacimiento)
            if (deptoSeleccionado) {
                setProvsNacimiento(deptoSeleccionado.provincias.map(prov => ({ id: prov.id, name: prov.name })))
                setFormData(prev => ({ ...prev, provNacimiento: "", distNacimiento: "" }))
            }
        }
    }, [formData.depNacimiento, ubigeoData])

    useEffect(() => {
        if (formData.provNacimiento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.depNacimiento)
            if (deptoSeleccionado) {
                const provSeleccionada = deptoSeleccionado.provincias.find(prov => prov.name === formData.provNacimiento)
                if (provSeleccionada) {
                    setDistsNacimiento(provSeleccionada.distritos.map(dist => ({ id: dist.id, name: dist.name })))
                    setFormData(prev => ({ ...prev, distNacimiento: "" }))
                }
            }
        }
    }, [formData.provNacimiento, ubigeoData, formData.depNacimiento])

    // Validación del formulario por pasos
    const validateStep = (step) => {
        const errors = {}
        if (step === 0) {
            if (!formData.nombre.trim()) errors.nombre = "Nombre es requerido";
            if (!formData.apellidoPaterno.trim()) errors.apellidoPaterno = "Apellido paterno es requerido";
            if (!formData.apellidoMaterno.trim()) errors.apellidoMaterno = "Apellido materno es requerido";
            if (!formData.fecIniciGestion) errors.fecIniciGestion = "Fecha de inicio es requerida";
            if (!formData.sexo) errors.sexo = "Sexo es requerido";
            if (!formData.estadoCivil) errors.estadoCivil = "Estado civil es requerido";
            if (!formData.cargo.trim()) errors.cargo = "Cargo es requerido";

            // Validación para número de hijos (solo números enteros positivos entre 0 y 20)
            const hijos = formData.nroHijos;
            if (hijos === "" || !/^\d+$/.test(hijos) || parseInt(hijos) < 0 || parseInt(hijos) > 20) {
                errors.nroHijos = "Debe ser un número entero entre 0 y 20";
            }

            // Validación para teléfono (exactamente 9 dígitos, solo números)
            const telefono = formData.telefono.trim();
            if (!telefono) {
                errors.telefono = "Teléfono es requerido";
            } else if (!/^\d{9}$/.test(telefono)) {
                errors.telefono = "Debe tener exactamente 9 dígitos numéricos";
            }

            if (!isValidEmail(formData.correo)) errors.correo = "Correo electrónico inválido";
            if (!formData.fecNacimiento) errors.fecNacimiento = "Fecha de nacimiento es requerida";
            if (!formData.asignacionfamiliar) errors.asignacionfamiliar = "Asignación familiar es requerida";
        }
        else if (step === 1) {
            if (!formData.dir.trim()) errors.dir = "Dirección es requerida"
            if (!formData.dep) errors.dep = "Departamento es requerido"
            if (!formData.prov) errors.prov = "Provincia es requerida"
            if (!formData.dist) errors.dist = "Distrito es requerido"
            if (!formData.depNacimiento) errors.depNacimiento = "Departamento de nacimiento es requerido"
            if (!formData.provNacimiento) errors.provNacimiento = "Provincia de nacimiento es requerida"
            if (!formData.distNacimiento) errors.distNacimiento = "Distrito de nacimiento es requerido"
        }
        else if (step === 2) {
            if (!formData.sueldo || isNaN(formData.sueldo) || formData.sueldo < 500) errors.sueldo = "Sueldo mínimo es 500"
            if (!formData.afp) errors.afp = "AFP es requerida"
            if (!formData.tipoContrato) errors.tipoContrato = "Tipo contrato es requerido"
            if (!formData.tip_comision) errors.tip_comision = "Tipo de comisión es requerido"
            if (!formData.impuestoRetenido || isNaN(formData.impuestoRetenido) || formData.impuestoRetenido < 0) errors.impuestoRetenido = "Impuesto retenido inválido"
            if (!formData.ingresoBruto || isNaN(formData.ingresoBruto) || formData.ingresoBruto < 0) errors.ingresoBruto = "Ingreso bruto inválido"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }
    function isValidEmail(email) {
        if (!email.trim()) return false;

        const atIndex = email.indexOf('@');
        const dotIndex = email.lastIndexOf('.');

        return !(
            atIndex < 1 ||
            dotIndex <= atIndex + 1 ||
            dotIndex === email.length - 1
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? (isNaN(value) ? prev[name] : value) : value
        }))

        // Limpiar error si existe
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
    }

    const handleRadioChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
    }

    // Navegación entre pasos
    const nextStep = () => validateStep(currentStep) && setCurrentStep(prev => Math.min(prev + 1, 2))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))
    const AgregarNuevoCargo = () => {
        const cargoRepetido = cargos.some(c => c.CARGO.toUpperCase() === nuevoCargo.toUpperCase())
        console.log(cargoRepetido)
        if (cargoRepetido) {
            alert("El cargo ya existe")
        } else {
            setCargos(prev => [...prev, { CARGO: nuevoCargo }])
            setModalCargo(false)
            setFormData(prev => ({ ...prev, cargo: nuevoCargo }))
            setNuevoCargo("")
        }
    }
    const limpiarTexto = (valor) => {
        return valor
            .trim()              // quita espacios al inicio y al final
            .replace(/\s+/g, " ") // convierte múltiples espacios internos en uno solo
            .toUpperCase()
    }
    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            setIsSubmitting(false)
            setIsLoading(true)
            const fecInicioGestion = formData.fecIniciGestion;
            const fecFinGestion = sumarDiasHabiles(fecInicioGestion, 3);
            console.log("Fecha final:", fecFinGestion.format("YYYY-MM-DD"));
            const nombreLimpio = limpiarTexto(formData.nombre || "")
            const apePatLimpio = limpiarTexto(formData.apellidoPaterno || "")
            const apeMatLimpio = limpiarTexto(formData.apellidoMaterno || "")
            const datos = {
                documento: formData.documento,
                nombre: nombreLimpio,
                apellido: `${apePatLimpio} ${apeMatLimpio}`.trim(),
                nom_completo: `${nombreLimpio} ${apePatLimpio} ${apeMatLimpio}`.trim(),
                alias: `${nombreLimpio.split(" ")[0]} ${apePatLimpio}`.trim(),
                fecAlta: formData.fecIniciGestion,
                cargo: formData.cargo.toUpperCase(),
                correo: formData.correo,
                fecNacimiento: formData.fecNacimiento,
                lugarNacimiento: `${formData.depNacimiento.toUpperCase()} - ${formData.provNacimiento.toUpperCase()} - ${formData.distNacimiento.toUpperCase()}`,
                sexo: formData.sexo.toUpperCase(),
                estadoCivil: formData.estadoCivil.toUpperCase(),
                nroHijos: formData.nroHijos,
                dir: formData.dir.toUpperCase(),
                dist: formData.dist.toUpperCase(),
                prov: formData.prov.toUpperCase(),
                dep: formData.dep.toUpperCase(),
                telefono: formData.telefono,
                modalidad: "PRESENCIAL", // Agregar este campo si es necesario
                fecInicioGestion: fecFinGestion.format("YYYY-MM-DD"),
                fecRegistro: new Date().toISOString().split("T")[0],
                sueldo: formData.sueldo,
                afp: formData.afp.toUpperCase(),
                tip_comision: formData.tip_comision.toUpperCase(),
                regimen: formData.tipoContrato.toUpperCase(),
                asignacionfamiliar: formData.asignacionfamiliar.toUpperCase(),
                impRetenido: formData.impuestoRetenido,
                ingresoBruto: formData.ingresoBruto,
                usuario: "ADMIN"
            }
            console.log("Datos a enviar:", datos)
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/registrarEmpleado`, datos)
            if (response.status === 200) {
                setIsLoading(false)
                setIsSuccess(true)
                console.log("Empleado registrado:", response)
            }
        } catch (error) {
            console.error("Error al enviar datos:", error)
        }
    }
    const renderPersonalInfoFields = () => (
        <>
            <InputField
                label="NOMBRES*" id="nombre" name="nombre"
                value={formData.nombre} onChange={handleChange} error={formErrors.nombre}
            />
            <InputField
                label="APELLIDO PATERNO*" id="apellidoPaterno" name="apellidoPaterno"
                value={formData.apellidoPaterno} onChange={handleChange} error={formErrors.apellidoPaterno}
            />
            <InputField
                label="APELLIDO MATERNO*" id="apellidoMaterno" name="apellidoMaterno"
                value={formData.apellidoMaterno} onChange={handleChange} error={formErrors.apellidoMaterno}
            />
            <InputField
                label="FECHA INGRESO*" id="fecIniciGestion" name="fecIniciGestion"
                type="date" value={formData.fecIniciGestion} onChange={handleChange} error={formErrors.fecIniciGestion}
            />
            <SelectField
                label="ESTADO CIVIL*" name="estadoCivil" value={formData.estadoCivil}
                onValueChange={handleSelectChange} error={formErrors.estadoCivil}
                options={[
                    { value: "soltero", label: "Soltero" },
                    { value: "casado", label: "Casado" },
                    { value: "divorciado", label: "Divorciado" },
                    { value: "viudo", label: "Viudo" }
                ]}
            />
            <SelectField
                label="SEXO*" name="sexo" value={formData.sexo}
                onValueChange={handleSelectChange} error={formErrors.sexo}
                options={[
                    { value: "MASCULINO", label: "Masculino" },
                    { value: "FEMENINO", label: "Femenino" },
                ]}
            />
            <InputField
                label="NUM. HIJOS*" id="nroHijos" name="nroHijos" type="number"
                min="0" max="19" value={formData.nroHijos} onChange={handleChange} error={formErrors.nroHijos}
            />
            <div className="flex items-center gap-2">
                <SelectField
                    className="w-full"
                    label="CARGO*" name="cargo" value={formData.cargo}
                    onValueChange={(name, value) => {
                        handleSelectChange(name, value)
                        // Resetear campos dependientes del cargo
                        const isPracticante = value.toUpperCase().includes("PRACTICANTE")
                        setFormData(prev => ({
                            ...prev,
                            tipoContrato: isPracticante ? "practicante" : "",
                            afp: isPracticante ? "0" : "",
                            tip_comision: "0"
                        }))
                    }}
                    error={formErrors.cargo}
                    options={cargos.map(c => ({ value: c.CARGO, label: c.CARGO }))}
                />
                <Button
                    variant="outline"
                    className="translate-y-2"
                    size="small"
                    onClick={() => setModalCargo(true)}
                >
                    <PlusCircleOutlined className="text-white bg-green-700 p-1 rounded-md" />
                </Button>
                <Dialog open={modalCargo} onOpenChange={() => setModalCargo(false)} >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Agregar nuevo cargo</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center">
                            <Label className="text-slate-800 mb-2 text-start w-full">Nuevo Cargo*</Label>
                            <Input
                                value={nuevoCargo}
                                onChange={(e) => setNuevoCargo(e.target.value.toUpperCase())}
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={AgregarNuevoCargo}
                            >
                                Agregar
                            </Button>
                        </DialogFooter>
                    </DialogContent>

                </Dialog>
            </div>
            <InputField
                label="TELÉFONO*" id="telefono" name="telefono"
                value={formData.telefono} onChange={handleChange} error={formErrors.telefono}
            />
            <InputField
                label="CORREO*" id="correo" name="correo" type="email"
                value={formData.correo} onChange={handleChange} error={formErrors.correo}
            />
            <InputField
                label="FECHA NACIMIENTO*" id="fecNacimiento" name="fecNacimiento"
                type="date" value={formData.fecNacimiento} onChange={handleChange}
                error={formErrors.fecNacimiento}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
            />
            <RadioField
                label="ASIG. FAMILIAR*" name="asignacionfamiliar"
                value={formData.asignacionfamiliar} onValueChange={handleRadioChange}
                error={formErrors.asignacionfamiliar}
                options={[
                    { value: "si", label: "SI" },
                    { value: "no", label: "NO" }
                ]}
            />


        </>
    )

    const renderAddressFields = () => (
        <div className="flex flex-col gap-2">
            <InputField
                label="DIRECCIÓN*" id="dir" name="dir"
                value={formData.dir} onChange={handleChange} error={formErrors.dir}
            />
            <SelectField
                label="DEPARTAMENTO*" name="dep" value={formData.dep}
                onValueChange={handleSelectChange} error={formErrors.dep}
                options={deps.map(d => ({ value: d.name, label: d.name }))}
            />
            <SelectField
                label="PROVINCIA*" name="prov" value={formData.prov}
                onValueChange={handleSelectChange} error={formErrors.prov}
                disabled={!formData.dep}
                options={provincias.map(p => ({ value: p.name, label: p.name }))}
                placeholder={formData.dep ? "Seleccione provincia" : "Primero seleccione departamento"}
            />
            <SelectField
                label="DISTRITO*" name="dist" value={formData.dist}
                onValueChange={handleSelectChange} error={formErrors.dist}
                disabled={!formData.prov}
                options={distritos.map(d => ({ value: d.name, label: d.name }))}
                placeholder={formData.prov ? "Seleccione distrito" : "Primero seleccione provincia"}
            />
        </div>
    )

    const renderBirthplaceFields = () => (
        <div className="flex flex-col gap-2">
            <SelectField
                label="DEPARTAMENTO*" name="depNacimiento" value={formData.depNacimiento}
                onValueChange={handleSelectChange} error={formErrors.depNacimiento}
                options={deps.map(d => ({ value: d.name, label: d.name }))}
            />
            <SelectField
                label="PROVINCIA*" name="provNacimiento" value={formData.provNacimiento}
                onValueChange={handleSelectChange} error={formErrors.provNacimiento}
                disabled={!formData.depNacimiento}
                options={provsNacimiento.map(p => ({ value: p.name, label: p.name }))}
                placeholder={formData.depNacimiento ? "Seleccione provincia" : "Primero seleccione departamento"}
            />
            <SelectField
                label="DISTRITO*" name="distNacimiento" value={formData.distNacimiento}
                onValueChange={handleSelectChange} error={formErrors.distNacimiento}
                disabled={!formData.provNacimiento}
                options={distsNacimiento.map(d => ({ value: d.name, label: d.name }))}
                placeholder={formData.provNacimiento ? "Seleccione distrito" : "Primero seleccione provincia"}
            />
        </div>
    )

    const renderWorkInfoFields = () => {
        const isPracticante = formData.cargo?.toUpperCase().includes("PRACTICANTE")

        const afpOptions = isPracticante
            ? [{ value: "0", label: "NO TIENE AFP" }]
            : [
                { value: "profuturo", label: "PROFUTURO" },
                { value: "integra", label: "INTEGRA" },
                { value: "prima", label: "PRIMA" },
                { value: "habitat", label: "HABITAT" },
                { value: "ONP", label: "ONP" }
            ]

        const comisionOptions = (!isPracticante && formData.afp !== "ONP" && formData.afp !== "0")
            ? [
                { value: "mixta", label: "MIXTA" },
                { value: "flujo", label: "FLUJO" }
            ]
            : [{ value: "0", label: "NULA" }]

        return (
            <div className="grid grid-cols-2 gap-6">
                <InputField
                    label="SUELDO*" id="sueldo" name="sueldo" type="number"
                    min={1200} value={formData.sueldo} onChange={handleChange} error={formErrors.sueldo}
                />
                <InputField
                    label="INGRESO BRUTO*" id="ingresoBruto" name="ingresoBruto" type="number"
                    min={0} value={formData.ingresoBruto} onChange={handleChange} error={formErrors.ingresoBruto}
                />
                <InputField
                    label="IMPUESTO RETENIDO*" id="impuestoRetenido" name="impuestoRetenido" type="number"
                    min={0} value={formData.impuestoRetenido} onChange={handleChange} error={formErrors.impuestoRetenido}
                />
                <SelectField
                    label="TIPO CONTRATO*" name="tipoContrato" value={formData.tipoContrato}
                    onValueChange={(name, value) => {
                        handleSelectChange(name, value)
                        // Resetear valores dependientes
                        setFormData(prev => ({
                            ...prev,
                            afp: isPracticante ? "0" : "",
                            tip_comision: "0"
                        }))
                    }}
                    error={formErrors.tipoContrato}
                    options={isPracticante
                        ? [{ value: "practicante", label: "PRACTICANTE" }]
                        : [
                            { value: "ria", label: "RIA" },
                            { value: "regular", label: "REGULAR" }
                        ]
                    }
                    disabled={!formData.cargo}
                />

                <SelectField
                    label="AFP*" name="afp" value={formData.afp}
                    onValueChange={(name, value) => {
                        handleSelectChange(name, value)
                        // Resetear comisión si es ONP o NO TIENE AFP
                        if (value === "ONP" || value === "0") {
                            setFormData(prev => ({ ...prev, tip_comision: "0" }))
                        }
                    }}
                    error={formErrors.afp}
                    options={afpOptions}
                    disabled={!formData.tipoContrato}
                />

                <SelectField
                    label="TIPO COMISIÓN*" name="tip_comision" value={formData.tip_comision}
                    onValueChange={handleSelectChange}
                    error={formErrors.tip_comision}
                    options={comisionOptions}
                    disabled={isPracticante || formData.afp === "" || formData.afp === "ONP" || formData.afp === "0"}
                />

            </div>
        )
    }

    // Renderizado del formulario por pasos
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                {renderPersonalInfoFields()}
                            </div>
                        </CardContent>
                    </Card>
                )
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-lg font-semibold mb-4 text-slate-800">🏠 Dirección Actual</h2>
                                {renderAddressFields()}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-lg font-semibold mb-4 text-slate-800">📍 Lugar de Nacimiento</h2>
                                {renderBirthplaceFields()}
                            </CardContent>
                        </Card>
                    </div>
                )
            case 2:
                return (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-lg font-semibold mb-4 text-slate-800 text-center">Asignación AFP y EPS</h2>
                            {renderWorkInfoFields()}
                        </CardContent>
                    </Card>
                )
            default:
                return null
        }
    }

    // Manejo de diálogos
    const closeAllDialogs = () => {
        setDialogState({
            documentoInput: true,
            verifying: false,
            newEmployee: false,
            terminatedEmployee: false,
            registeredEmployee: false
        })
    }

    const showDialog = (dialogName) => {
        closeAllDialogs()
        setDialogState(prev => ({ ...prev, [dialogName]: true }))
    }

    const validateDocumento = () => {
        const errors = {}
        if (!formData.documento) errors.documento = "Documento es requerido"
        else if (!/^\d{8}$/.test(formData.documento)) errors.documento = "Documento debe tener 8 dígitos"

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const verifyEmployee = async () => {
        if (!validateDocumento()) return

        try {
            showDialog('verifying')
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/empleados/validarEmpleado/${formData.documento}`
            )
            const employeeData = response.data.data[0]

            if (!employeeData) {
                showDialog('newEmployee')
            } else {
                switch (employeeData.estadoLaboral) {
                    case "VIGENTE":
                        showDialog('registeredEmployee')
                        setRegistro(true)
                        break
                    case "CESADO":
                        showDialog('terminatedEmployee')
                        break
                    default:
                        showDialog('newEmployee')
                }
            }
        } catch (error) {
            console.error("Error al verificar empleado:", error)

        }
    }

    if (registro) {
        return (
            <>
                <Dialog open={dialogState.documentoInput} onOpenChange={() => navegar("/rrhh/empleados-listar")}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Ingrese el documento del empleado</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="documento" className="text-slate-800 mb-1">
                                Documento*
                            </Label>
                            <Input
                                id="documento"
                                name="documento"
                                type="text"
                                inputMode="numeric"
                                value={formData.documento}
                                onChange={handleChange}
                                maxLength={8}
                                className={`border-gray-300 ${formErrors.documento ? "border-red-500" : ""}`}
                                placeholder="Ingrese 8 dígitos"
                            />
                            {formErrors.documento && (
                                <p className="text-sm text-red-500 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.documento}
                                </p>
                            )}
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={verifyEmployee}
                            >
                                Verificar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={dialogState.verifying}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Verificando Documento</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-600 text-center">Buscando empleado...</p>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={dialogState.newEmployee}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Nuevo empleado</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <UserPlus className="h-8 w-8 text-green-600 translate-x-1" />
                            </div>
                            <p className="text-gray-600 text-center">
                                Ingresará un nuevo empleado al sistema.
                            </p>
                            <Button onClick={() => setRegistro(false)} className="cursor-pointer">
                                Continuar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={dialogState.terminatedEmployee}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Reingreso del Empleado</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <AlertTriangle className="h-12 w-12 text-yellow-500" />
                            <p className="text-gray-600 text-center">
                                Este empleado está registrado pero su estado es CESADO.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={closeAllDialogs}>
                                    Cancelar
                                </Button>
                                <Button onClick={() => setRegistro(false)} className="cursor-pointer">
                                    Proceder con reingreso
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={dialogState.registeredEmployee}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Empleado registrado</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <Info className="h-12 w-12 text-blue-500" />
                            <p className="text-gray-600 text-center text-sm">
                                Este empleado ya está registrado y su estado es <span className="font-bold text-lg"> VIGENTE.</span>

                            </p>
                            <Button
                                onClick={() => {
                                    setDialogState({
                                        documentoInput: true,
                                        verifying: false,
                                        newEmployee: false,
                                        terminatedEmployee: false,
                                        registeredEmployee: false
                                    })
                                }}
                                className="cursor-pointer"
                            >
                                Aceptar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    } else {
        return (

            <div className="w-full max-w-5xl mx-auto p-4">
                <h1 className="text-center text-2xl font-bold mb-4">REGISTRO EMPLEADO</h1>
                <div className="mb-10">
                    <div className="relative">
                        <div className="flex justify-between mb-4">
                            <span className={currentStep >= 0 ? "font-medium text-blue-600" : ""}>Datos Personales</span>
                            <span className={currentStep >= 1 ? "font-medium text-blue-600" : ""}>Dirección</span>
                            <span className={currentStep >= 2 ? "font-medium text-blue-600" : ""}>Datos Laborales</span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / 2) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between mt-1">
                            {[0, 1, 2].map((step) => (
                                <div
                                    key={step}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center -mt-5 ${currentStep >= step ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
                                >
                                    {currentStep > step ? <Check className="w-4 h-4" /> : <span className="text-xs">{step + 1}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {renderStep()}
                <div className="flex justify-between mt-6">
                    {currentStep > 0 && (
                        <Button
                            type="button"
                            onClick={prevStep}
                            variant="outline"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                            Anterior
                        </Button>
                    )}

                    {currentStep === 2 ? (
                        <Button
                            type="button"
                            className="bg-green-500 hover:bg-green-600 ml-auto cursor-pointer"
                            onClick={() => {
                                const validar = validateStep(currentStep)
                                console.log(validar)
                                if (validar) {
                                    setIsSubmitting(true)
                                }
                            }}
                        >
                            Finalizar
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={nextStep}
                            className="bg-blue-500 hover:bg-blue-600 ml-auto cursor-pointer"
                        >
                            Siguiente
                        </Button>
                    )}
                </div>

                <Dialog open={isSubmitting} onOpenChange={setIsSubmitting}>
                    <DialogContent className="w-[90vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-center">¿Estás seguro de registrar nuevo empleado?</DialogTitle>
                            <DialogDescription className="text-center">
                                Revise los datos antes de confirmar el registro
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {sections.map((section, index) => (
                                <div key={index} className="space-y-2">
                                    <h3 className="font-bold text-gray-700 border-b-2 pb-1">{section.title}</h3>
                                    <div className="grid grid-cols-2 gap-1 text-sm">
                                        {section.fields.map((field, i) => (
                                            <div key={i} className="flex gap-2">
                                                <p className="font-medium">{field.label}:</p>
                                                <p className="text-gray-700">{field.value || "-"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={handleSubmit}
                            >
                                Confirmar Registro
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isLoading}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Procesando registro</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-600 text-center">Guardando los datos del empleado...</p>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Datos Guardados</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-gray-600 text-center">Los datos del empleado se han guardado correctamente.</p>
                        </div>
                        <DialogFooter>
                            <Button
                                className="w-full "
                                onClick={() => {
                                    setIsSuccess(false)
                                    navegar("/rrhh/empleados-listar")
                                }}
                            >
                                Aceptar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}