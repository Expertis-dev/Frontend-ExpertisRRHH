"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload, AlertCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"


export const CrearEmpleado = () => {
    // Estados para datos de ubicación
    const [ubigeoData, setUbigeoData] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [provinciasNacimiento, setProvinciasNacimiento] = useState([]);
    const [distritosNacimiento, setDistritosNacimiento] = useState([]);

    // Estados para el formulario
    const [currentStep, setCurrentStep] = useState(0)
    const [formErrors, setFormErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    // Datos del formulario
    const [formData, setFormData] = useState({
        dni: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombreCompleto: "",
        fechaInicioGestion: "",
        edad: "",
        estadoCivil: "",
        cargo: "",
        numHijos: "",
        correo: "",
        telefono: "",
        asignacionFamiliar: "",
        direccion: "",
        departamento: "",
        provincia: "",
        distrito: "",
        fechaNacimientoLugar: "",
        departamentoNacimiento: "",
        provinciaNacimiento: "",
        distritoNacimiento: "",
        sueldo: "",
        afp: "",
        regimenPension: "",
        tipoComision: "",
        porcentajeAfp: "",
    })
    const sections = [
        {
            title: "Información Personal",
            fields: [
                { label: "Nombre", value: `${formData.nombreCompleto} ${formData.apellidoPaterno} ${formData.apellidoMaterno}` },
                { label: "DNI", value: formData.dni },
                { label: "Edad", value: `${formData.edad} años` },
                { label: "Estado Civil", value: formData.estadoCivil },
                { label: "N° de Hijos", value: formData.numHijos },
                { label: "Teléfono", value: formData.telefono },
                { label: "Correo", value: formData.correo },
            ]
        },
        {
            title: "Datos Laborales",
            fields: [
                { label: "Cargo", value: formData.cargo },
                { label: "Sueldo", value: `S/ ${formData.sueldo}` },
                { label: "Fecha Inicio", value: formData.fechaInicioGestion },
                { label: "Tipo Comisión", value: formData.tipoComision },
                { label: "Asignación Familiar", value: formData.asignacionFamiliar },
            ]
        },
        {
            title: "Datos de AFP",
            fields: [
                { label: "AFP", value: formData.afp },
                { label: "Régimen", value: formData.regimenPension },
                { label: "Porcentaje AFP", value: `${formData.porcentajeAfp}%` },
            ]
        },
        {
            title: "Ubicación",
            fields: [
                { label: "Dirección", value: formData.direccion },
                { label: "Departamento", value: formData.departamento },
                { label: "Provincia", value: formData.provincia },
                { label: "Distrito", value: formData.distrito },
            ]
        },
        {
            title: "Datos de Nacimiento",
            fields: [
                { label: "Fecha Nacimiento", value: formData.fechaNacimientoLugar },
                { label: "Departamento", value: formData.departamentoNacimiento },
                { label: "Provincia", value: formData.provinciaNacimiento },
                { label: "Distrito", value: formData.distritoNacimiento },
            ]
        }
    ]


    // Cargar datos de ubicación
    useEffect(() => {
        const fetchUbigeoData = async () => {
            try {
                const response = await fetch("/data.json")
                const data = await response.json()
                setUbigeoData(data)
                setDepartamentos(data.map(item => ({ id: item.id, name: item.name })))
            } catch (error) {
                console.error("Error cargando los datos:", error)
            }
        }

        fetchUbigeoData()
    }, [])

    // Efectos para cargar provincias y distritos
    useEffect(() => {
        if (formData.departamento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.departamento)
            if (deptoSeleccionado) {
                setProvincias(deptoSeleccionado.provincias.map(prov => ({ id: prov.id, name: prov.name })))
                setFormData(prev => ({ ...prev, provincia: "", distrito: "" }))
            }
        }
    }, [formData.departamento, ubigeoData])

    useEffect(() => {
        if (formData.provincia && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.departamento)
            if (deptoSeleccionado) {
                const provSeleccionada = deptoSeleccionado.provincias.find(prov => prov.name === formData.provincia)
                if (provSeleccionada) {
                    setDistritos(provSeleccionada.distritos.map(dist => ({ id: dist.id, name: dist.name })))
                    setFormData(prev => ({ ...prev, distrito: "" }))
                }
            }
        }
    }, [formData.provincia, ubigeoData, formData.departamento])

    useEffect(() => {
        if (formData.departamentoNacimiento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.departamentoNacimiento)
            if (deptoSeleccionado) {
                setProvinciasNacimiento(deptoSeleccionado.provincias.map(prov => ({ id: prov.id, name: prov.name })))
                setFormData(prev => ({ ...prev, provinciaNacimiento: "", distritoNacimiento: "" }))
            }
        }
    }, [formData.departamentoNacimiento, ubigeoData])

    useEffect(() => {
        if (formData.provinciaNacimiento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(depto => depto.name === formData.departamentoNacimiento)
            if (deptoSeleccionado) {
                const provSeleccionada = deptoSeleccionado.provincias.find(prov => prov.name === formData.provinciaNacimiento)
                if (provSeleccionada) {
                    setDistritosNacimiento(provSeleccionada.distritos.map(dist => ({ id: dist.id, name: dist.name })))
                    setFormData(prev => ({ ...prev, distritoNacimiento: "" }))
                }
            }
        }
    }, [formData.provinciaNacimiento, ubigeoData, formData.departamentoNacimiento])

    // Validación del formulario
    const validateStep = (step) => {
        const errors = {}
        let isValid = true

        if (step === 0) {
            if (!formData.dni || !/^\d{8}$/.test(formData.dni)) {
                errors.dni = "DNI debe tener 8 dígitos"
                isValid = false
            }
            if (!formData.nombreCompleto.trim()) {
                errors.nombreCompleto = "Nombre es requerido"
                isValid = false
            }
            if (!formData.apellidoPaterno.trim()) {
                errors.apellidoPaterno = "Apellido paterno es requerido"
                isValid = false
            }
            if (!formData.apellidoMaterno.trim()) {
                errors.apellidoMaterno = "Apellido materno es requerido"
                isValid = false
            }
            if (!formData.fechaInicioGestion) {
                errors.fechaInicioGestion = "Fecha de inicio es requerida"
                isValid = false
            }
            if (!formData.edad || formData.edad < 18 || formData.edad > 65) {
                errors.edad = "Edad debe ser entre 18 y 65 años"
                isValid = false
            }
            if (!formData.estadoCivil) {
                errors.estadoCivil = "Estado civil es requerido"
                isValid = false
            }
            if (!formData.cargo.trim()) {
                errors.cargo = "Cargo es requerido"
                isValid = false
            }
            if (formData.numHijos === "" || parseInt(formData.numHijos) < 0 || parseInt(formData.numHijos) >= 20) {
                errors.numHijos = "Debe ser un número entre 0 y 20"
                isValid = false
            }
            if (!formData.telefono.trim()) {
                errors.telefono = "Teléfono es requerido"
                isValid = false
            }
            if (!formData.correo.trim() || !/^\S+@\S+\.\S+$/.test(formData.correo)) {
                errors.correo = "Correo electrónico inválido"
                isValid = false
            }
            if (!formData.asignacionFamiliar) {
                errors.asignacionFamiliar = "Asignación familiar es requerida"
                isValid = false
            }
        } else if (step === 1) {
            if (!formData.direccion.trim()) {
                errors.direccion = "Dirección es requerida"
                isValid = false
            }
            if (!formData.fechaNacimientoLugar) {
                errors.fechaNacimientoLugar = "Fecha de nacimiento es requerida"
                isValid = false
            }
            if (!formData.departamento) {
                errors.departamento = "Departamento es requerido"
                isValid = false
            }
            if (!formData.provincia) {
                errors.provincia = "Provincia es requerida"
                isValid = false
            }
            if (!formData.distrito) {
                errors.distrito = "Distrito es requerido"
                isValid = false
            }
            if (!formData.departamentoNacimiento) {
                errors.departamentoNacimiento = "Departamento de nacimiento es requerido"
                isValid = false
            }
            if (!formData.provinciaNacimiento) {
                errors.provinciaNacimiento = "Provincia de nacimiento es requerida"
                isValid = false
            }
            if (!formData.distritoNacimiento) {
                errors.distritoNacimiento = "Distrito de nacimiento es requerido"
                isValid = false
            }
        } else if (step === 2) {
            if (!formData.sueldo || isNaN(formData.sueldo) || formData.sueldo < 1200) {
                errors.sueldo = "Sueldo mínimo es 1200"
                isValid = false
            }
            if (!formData.afp) {
                errors.afp = "AFP es requerida"
                isValid = false
            }
            if (!formData.regimenPension) {
                errors.regimenPension = "Régimen de pensión es requerido"
                isValid = false
            }
            if (!formData.tipoComision) {
                errors.tipoComision = "Tipo de comisión es requerido"
                isValid = false
            }
            if (!formData.porcentajeAfp || isNaN(formData.porcentajeAfp)) {
                errors.porcentajeAfp = "Porcentaje AFP debe ser un número válido"
                isValid = false
            }
        }

        setFormErrors(errors)
        return isValid
    }

    // Manejo de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
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
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 2))
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    // Envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(false)
        setIsLoading(true)

        try {
            // Simular envío a la API
            await new Promise(resolve => setTimeout(resolve, 2000))

            console.log("Datos enviados:", formData)
            setIsSuccess(true)
        } catch (error) {
            console.error("Error al enviar datos:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Renderizado del formulario por pasos
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Campos del paso 1 */}
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

    // Componentes para cada sección de campos
    const renderPersonalInfoFields = () => (
        <>
            <InputField
                label="DNI*" id="dni" name="dni" value={formData.dni}
                onChange={handleChange} maxLength={8} error={formErrors.dni}
            />
            <InputField
                label="NOMBRES*" id="nombreCompleto" name="nombreCompleto"
                value={formData.nombreCompleto} onChange={handleChange} error={formErrors.nombreCompleto}
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
                label="FECHA INICIO DE GESTIÓN*" id="fechaInicioGestion" name="fechaInicioGestion"
                type="date" value={formData.fechaInicioGestion} onChange={handleChange} error={formErrors.fechaInicioGestion}
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
            <InputField
                label="EDAD*" id="edad" name="edad" type="number"
                value={formData.edad} onChange={handleChange} error={formErrors.edad}
            />
            <InputField
                label="NUM. HIJOS*" id="numHijos" name="numHijos" type="number"
                min="0" max="19" value={formData.numHijos} onChange={handleChange} error={formErrors.numHijos}
            />
            <InputField
                label="CARGO*" id="cargo" name="cargo"
                value={formData.cargo} onChange={handleChange} error={formErrors.cargo}
            />
            <InputField
                label="TELÉFONO*" id="telefono" name="telefono"
                value={formData.telefono} onChange={handleChange} error={formErrors.telefono}
            />
            <InputField
                label="CORREO*" id="correo" name="correo" type="email"
                value={formData.correo} onChange={handleChange} error={formErrors.correo}
            />
            <RadioField
                label="ASIG. FAMILIAR*" name="asignacionFamiliar"
                value={formData.asignacionFamiliar} onValueChange={handleRadioChange}
                error={formErrors.asignacionFamiliar}
                options={[
                    { value: "si", label: "SI" },
                    { value: "no", label: "NO" }
                ]}
            />
        </>
    )

    const renderAddressFields = () => (
        <>
            <InputField
                label="DIRECCIÓN*" id="direccion" name="direccion"
                value={formData.direccion} onChange={handleChange} error={formErrors.direccion}
            />
            <SelectField
                label="DEPARTAMENTO*" name="departamento" value={formData.departamento}
                onValueChange={handleSelectChange} error={formErrors.departamento}
                options={departamentos.map(d => ({ value: d.name, label: d.name }))}
            />
            <SelectField
                label="PROVINCIA*" name="provincia" value={formData.provincia}
                onValueChange={handleSelectChange} error={formErrors.provincia}
                disabled={!formData.departamento}
                options={provincias.map(p => ({ value: p.name, label: p.name }))}
                placeholder={formData.departamento ? "Seleccione provincia" : "Primero seleccione departamento"}
            />
            <SelectField
                label="DISTRITO*" name="distrito" value={formData.distrito}
                onValueChange={handleSelectChange} error={formErrors.distrito}
                disabled={!formData.provincia}
                options={distritos.map(d => ({ value: d.name, label: d.name }))}
                placeholder={formData.provincia ? "Seleccione distrito" : "Primero seleccione provincia"}
            />
        </>
    )

    const renderBirthplaceFields = () => (
        <>
            <InputField
                label="FECHA NACIMIENTO*" id="fechaNacimientoLugar" name="fechaNacimientoLugar"
                type="date" value={formData.fechaNacimientoLugar} onChange={handleChange}
                error={formErrors.fechaNacimientoLugar}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
            />
            <SelectField
                label="DEPARTAMENTO*" name="departamentoNacimiento" value={formData.departamentoNacimiento}
                onValueChange={handleSelectChange} error={formErrors.departamentoNacimiento}
                options={departamentos.map(d => ({ value: d.name, label: d.name }))}
            />
            <SelectField
                label="PROVINCIA*" name="provinciaNacimiento" value={formData.provinciaNacimiento}
                onValueChange={handleSelectChange} error={formErrors.provinciaNacimiento}
                disabled={!formData.departamentoNacimiento}
                options={provinciasNacimiento.map(p => ({ value: p.name, label: p.name }))}
                placeholder={formData.departamentoNacimiento ? "Seleccione provincia" : "Primero seleccione departamento"}
            />
            <SelectField
                label="DISTRITO*" name="distritoNacimiento" value={formData.distritoNacimiento}
                onValueChange={handleSelectChange} error={formErrors.distritoNacimiento}
                disabled={!formData.provinciaNacimiento}
                options={distritosNacimiento.map(d => ({ value: d.name, label: d.name }))}
                placeholder={formData.provinciaNacimiento ? "Seleccione distrito" : "Primero seleccione provincia"}
            />
        </>
    )

    const renderWorkInfoFields = () => (
        <div className="grid grid-cols-2 gap-6">
            <InputField
                label="SUELDO*" id="sueldo" name="sueldo" type="number"
                min={1200} value={formData.sueldo} onChange={handleChange} error={formErrors.sueldo}
            />
            <SelectField
                label="AFP*" name="afp" value={formData.afp}
                onValueChange={handleSelectChange} error={formErrors.afp}
                options={[
                    { value: "profuturo", label: "PROFUTURO" },
                    { value: "integra", label: "INTEGRA" },
                    { value: "prima", label: "PRIMA" },
                    { value: "habitat", label: "HABITAT" }
                ]}
            />
            <SelectField
                label="RÉGIMEN DE PENSIÓN*" name="regimenPension" value={formData.regimenPension}
                onValueChange={handleSelectChange} error={formErrors.regimenPension}
                options={[
                    { value: "regular", label: "REGULAR" },
                    { value: "especial", label: "ESPECIAL" }
                ]}
            />
            <SelectField
                label="TIPO DE COMISIÓN*" name="tipoComision" value={formData.tipoComision}
                onValueChange={handleSelectChange} error={formErrors.tipoComision}
                options={[
                    { value: "flujo", label: "FLUJO" },
                    { value: "mixta", label: "MIXTA" }
                ]}
            />
            <InputField
                label="DEPENDIENTES EPS (conyugue e hijos)*" id="porcentajeAfp" name="porcentajeAfp"
                type="number" value={formData.porcentajeAfp} min={0} max={20}
                onChange={handleChange} error={formErrors.porcentajeAfp}
                className="col-span-2"
            />
        </div>
    )

    // Componentes reutilizables
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
            <Select
                onValueChange={(value) => onValueChange(name, value)}
                value={value}
                disabled={disabled}
            >
                <SelectTrigger className={error ? "border-red-500" : ""}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
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
            <RadioGroup
                value={value}
                onValueChange={(value) => onValueChange(name, value)}
                className="flex space-x-8 pt-2"
            >
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

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <h1 className="text-center text-2xl font-bold mb-4">REGISTRO EMPLEADO</h1>

            {/* Slider de progreso */}
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

            {/* Formulario */}
            {renderStep()}

            {/* Botones de navegación */}
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
                        onClick={() => setIsSubmitting(true)}
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

            {/* Modal de confirmación */}
            <Dialog open={isSubmitting} onOpenChange={setIsSubmitting}>
                <DialogContent className="w-[90vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center">¿Estás seguro de registrar nuevo empleado?</DialogTitle>
                        <DialogDescription className="text-center">
                            Revise los datos antes de confirmar el registro
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Resumen de datos */}
                        {sections.map((section, index) => (
                            <div key={index} className="space-y-2">
                                <h3 className="font-semibold text-gray-700 border-b pb-1">{section.title}</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {section.fields.map((field, i) => (
                                        <div key={i}>
                                            <p className="text-gray-500">{field.label}:</p>
                                            <p className="font-medium">{field.value || "-"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsSubmitting(false)}
                            className="w-full"
                        >
                            Cancelar
                        </Button>
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

            {/* Modal de carga */}
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

            {/* Modal de éxito */}
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
                            className="w-full"
                            onClick={() => {
                                setIsSuccess(false)
                                // Resetear formulario si es necesario
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