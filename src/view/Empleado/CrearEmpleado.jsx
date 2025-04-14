import axios from 'axios';
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload, AlertCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export const CrearEmpleado = () => {
    // Estados para datos de ubicación
    const [ubigeoData, setUbigeoData] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);
    const [provinciasNacimiento, setProvinciasNacimiento] = useState([]);
    const [distritosNacimiento, setDistritosNacimiento] = useState([]);
    const [errorUbigeo, setErrorUbigeo] = useState("");
    const [currentStep, setCurrentStep] = useState(0)
    const [formErrors, setFormErrors] = useState({})
    const [addressWordCount, setAddressWordCount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [formData, setFormData] = useState({
        // Datos personales
        dni: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombreCompleto: "",
        fechaInicioGestion: "", // Cambiado de fechaNacimiento
        edad: "",
        estadoCivil: "",
        cargo: "",
        numHijos: "",
        correo: "",
        telefono: "",
        asignacionFamiliar: "",

        // Dirección y lugar de nacimiento
        direccion: "",
        departamento: "",
        provincia: "",
        distrito: "",
        fechaNacimientoLugar: "",
        departamentoNacimiento: "",
        provinciaNacimiento: "",
        distritoNacimiento: "",

        // AFP y EPS
        sueldo: "",
        afp: "",
        regimenPension: "",
        tipoComision: "",
        porcentajeAfp: "",
    })

    const validateStep = (step) => {
        const errors = {}
        let isValid = true

        if (step === 0) {
            // Validar datos personales
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
            if (!formData.fechaInicioGestion) { // Cambiado de fechaNacimiento
                errors.fechaInicioGestion = "Fecha de inicio de gestión es requerida"
                isValid = false
            }
            if (!formData.edad) {
                errors.edad = "Fecha de inicio de gestión es requerida"
                isValid = false
            } else {
                if (formData.edad < 18 || formData.edad > 65) {
                    errors.edad = "Edad debe ser entre 18 y 65 años"
                    isValid = false
                }
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
            // Validar dirección y lugar de nacimiento
            if (!formData.direccion.trim()) {
                errors.direccion = "Dirección es requerida"
                isValid = false
            }
            if (!formData.fechaNacimientoLugar) {
                errors.fechaNacimientoLugar = "Fecha de nacimiento es requerida"
                isValid = false
            } else {
                const birthDate = new Date(formData.fechaNacimientoLugar)
                const today = new Date()
                const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
                if (birthDate > minDate) {
                    errors.fechaNacimientoLugar = "Debe ser mayor de 18 años"
                    isValid = false
                }
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
            // Validar AFP y EPS
            if (!formData.sueldo || isNaN(formData.sueldo)) {
                errors.sueldo = "Sueldo debe ser un número válido"
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
    useEffect(() => {
        fetch("/data.json")
            .then(res => res.json())
            .then(data => {
                setUbigeoData(data);
                // Extraer departamentos
                const deptos = data.map(item => ({
                    id: item.id,
                    name: item.name
                }));
                setDepartamentos(deptos);
            })
            .catch(error => console.error("Error cargando los datos:", error));
    }, []);
    // Efecto para cargar provincias cuando se selecciona un departamento (dirección actual)
    useEffect(() => {
        if (formData.departamento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(
                depto => depto.name === formData.departamento
            );

            if (deptoSeleccionado) {
                const provs = deptoSeleccionado.provincias.map(prov => ({
                    id: prov.id,
                    name: prov.name
                }));
                setProvincias(provs);
                setFormData(prev => ({ ...prev, provincia: "", distrito: "" }));
            }
        }
    }, [formData.departamento, ubigeoData]);

    // Efecto para cargar distritos cuando se selecciona una provincia (dirección actual)
    useEffect(() => {
        if (formData.provincia && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(
                depto => depto.name === formData.departamento
            );

            if (deptoSeleccionado) {
                const provSeleccionada = deptoSeleccionado.provincias.find(
                    prov => prov.name === formData.provincia
                );

                if (provSeleccionada) {
                    const dists = provSeleccionada.distritos.map(dist => ({
                        id: dist.id,
                        name: dist.name
                    }));
                    setDistritos(dists);
                    setFormData(prev => ({ ...prev, distrito: "" }));
                }
            }
        }
    }, [formData.provincia, ubigeoData, formData.departamento]);

    // Efecto para cargar provincias cuando se selecciona un departamento (lugar de nacimiento)
    useEffect(() => {
        if (formData.departamentoNacimiento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(
                depto => depto.name === formData.departamentoNacimiento
            );

            if (deptoSeleccionado) {
                const provs = deptoSeleccionado.provincias.map(prov => ({
                    id: prov.id,
                    name: prov.name
                }));
                setProvinciasNacimiento(provs);
                setFormData(prev => ({ ...prev, provinciaNacimiento: "", distritoNacimiento: "" }));
            }
        }
    }, [formData.departamentoNacimiento, ubigeoData]);

    // Efecto para cargar distritos cuando se selecciona una provincia (lugar de nacimiento)
    useEffect(() => {
        if (formData.provinciaNacimiento && ubigeoData.length > 0) {
            const deptoSeleccionado = ubigeoData.find(
                depto => depto.name === formData.departamentoNacimiento
            );

            if (deptoSeleccionado) {
                const provSeleccionada = deptoSeleccionado.provincias.find(
                    prov => prov.name === formData.provinciaNacimiento
                );

                if (provSeleccionada) {
                    const dists = provSeleccionada.distritos.map(dist => ({
                        id: dist.id,
                        name: dist.name
                    }));
                    setDistritosNacimiento(dists);
                    setFormData(prev => ({ ...prev, distritoNacimiento: "" }));
                }
            }
        }
    }, [formData.provinciaNacimiento, ubigeoData, formData.departamentoNacimiento]);

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Limpiar error cuando el usuario empieza a escribir
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Limpiar error cuando el usuario selecciona una opción
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleRadioChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Limpiar error cuando el usuario selecciona una opción
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 2) {
                setCurrentStep(currentStep + 1)
            }
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (validateStep(currentStep)) {
            setIsSubmitting(true)
            console.log("Datos enviados:", formData)

            // Simulamos el envío de datos con un timeout
            setTimeout(() => {
                setIsSubmitting(false)
                setIsSuccess(true)

                // Después de 3 segundos, cerramos el modal
                setTimeout(() => {
                    setIsSuccess(false)
                    // Aquí podrías redirigir o resetear el formulario
                }, 3000)
            }, 1500)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <h1 className="text-center text-2xl font-bold mb-4">REGISTRO EMPLEADO</h1>

            {/* Slider de progreso (ahora solo 3 pasos) */}
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

            <div>
                {/* Paso 1: Datos Personales */}
                {currentStep === 0 && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dni" className="text-slate-800 mb-1">
                                        DNI*
                                    </Label>
                                    <Input
                                        id="dni"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                        maxLength={8}
                                    />
                                    {formErrors.dni && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.dni}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombreCompleto" className="text-slate-800">
                                        NOMBRES*
                                    </Label>
                                    <Input
                                        id="nombreCompleto"
                                        name="nombreCompleto"
                                        value={formData.nombreCompleto}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.nombreCompleto && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.nombreCompleto}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apellidoPaterno" className="text-slate-800 mb-1">
                                        APELLIDO PATERNO*
                                    </Label>
                                    <Input
                                        id="apellidoPaterno"
                                        name="apellidoPaterno"
                                        value={formData.apellidoPaterno}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.apellidoPaterno && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.apellidoPaterno}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apellidoMaterno" className="text-slate-800 mb-1">
                                        APELLIDO MATERNO*
                                    </Label>
                                    <Input
                                        id="apellidoMaterno"
                                        name="apellidoMaterno"
                                        value={formData.apellidoMaterno}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.apellidoMaterno && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.apellidoMaterno}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fechaInicioGestion" className="text-slate-800 mb-1">
                                        FECHA INICIO DE GESTIÓN*
                                    </Label>
                                    <Input
                                        id="fechaInicioGestion"
                                        name="fechaInicioGestion"
                                        type="date"
                                        value={formData.fechaInicioGestion}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.fechaInicioGestion && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.fechaInicioGestion}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estadoCivil" className="text-slate-800 mb-1">
                                        ESTADO CIVIL*
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange("estadoCivil", value)}
                                        value={formData.estadoCivil}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="soltero">Soltero</SelectItem>
                                            <SelectItem value="casado">Casado</SelectItem>
                                            <SelectItem value="divorciado">Divorciado</SelectItem>
                                            <SelectItem value="viudo">Viudo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.estadoCivil && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.estadoCivil}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edad" className="text-slate-800 mb-1">
                                        EDAD*
                                    </Label>
                                    <Input
                                        id="edad"
                                        name="edad"
                                        type="number"
                                        value={formData.edad}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.edad && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.edad}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numHijos" className="text-slate-800 mb-1">
                                        NUM. HIJOS*
                                    </Label>
                                    <Input
                                        id="numHijos"
                                        name="numHijos"
                                        type="number"
                                        min="0"
                                        max="19"
                                        value={formData.numHijos}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.numHijos && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.numHijos}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cargo" className="text-slate-800 mb-1">
                                        CARGO*
                                    </Label>
                                    <Input
                                        id="cargo"
                                        name="cargo"
                                        value={formData.cargo}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.cargo && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.cargo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telefono" className="text-slate-800 mb-1">
                                        TELÉFONO*
                                    </Label>
                                    <Input
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.telefono && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.telefono}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="correo" className="text-slate-800 mb-1">
                                        CORREO*
                                    </Label>
                                    <Input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.correo && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.correo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-800 mb-1">ASIG. FAMILIAR*</Label>
                                    <RadioGroup
                                        value={formData.asignacionFamiliar}
                                        onValueChange={(value) => handleRadioChange("asignacionFamiliar", value)}
                                        className="flex space-x-8 pt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="si" id="asig-si" />
                                            <Label htmlFor="asig-si">SI</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="asig-no" />
                                            <Label htmlFor="asig-no">NO</Label>
                                        </div>
                                    </RadioGroup>
                                    {formErrors.asignacionFamiliar && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.asignacionFamiliar}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Paso 2: Dirección y Lugar de Nacimiento */}
                {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-lg font-semibold mb-4 text-slate-800"> 🏠 Dirección Actual</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion" className="text-slate-800 mb-1">
                                            DIRECCIÓN* ({addressWordCount}/10 palabras mín.)
                                        </Label>
                                        <Input
                                            id="direccion"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            className="border-gray-300"
                                        />
                                        {formErrors.direccion && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.direccion}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departamento" className="text-slate-800 mb-1">
                                            DEPARTAMENTO*
                                        </Label>
                                        <Select
                                            onValueChange={(value) => handleSelectChange("departamento", value)}
                                            value={formData.departamento}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione departamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departamentos.map((depto) => (
                                                    <SelectItem key={depto.id} value={depto.name}>
                                                        {depto.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.departamento && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.departamento}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="provincia" className="text-slate-800 mb-1">
                                            PROVINCIA*
                                        </Label>
                                        <Select
                                            onValueChange={(value) => handleSelectChange("provincia", value)}
                                            value={formData.provincia}
                                            disabled={!formData.departamento}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={formData.departamento ? "Seleccione provincia" : "Primero seleccione departamento"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provincias.map((prov) => (
                                                    <SelectItem key={prov.id} value={prov.name}>
                                                        {prov.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.provincia && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.provincia}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="distrito" className="text-slate-800 mb-1">
                                            DISTRITO*
                                        </Label>
                                        <Select
                                            onValueChange={(value) => handleSelectChange("distrito", value)}
                                            value={formData.distrito}
                                            disabled={!formData.provincia}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={formData.provincia ? "Seleccione distrito" : "Primero seleccione provincia"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {distritos.map((dist) => (
                                                    <SelectItem key={dist.id} value={dist.name}>
                                                        {dist.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.distrito && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.distrito}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-lg font-semibold mb-4 text-slate-800">📍 Lugar de Nacimiento</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fechaNacimientoLugar" className="text-slate-800 mb-1">
                                            FECHA NACIMIENTO*
                                        </Label>
                                        <Input
                                            id="fechaNacimientoLugar"
                                            name="fechaNacimientoLugar"
                                            type="date"
                                            value={formData.fechaNacimientoLugar}
                                            onChange={handleChange}
                                            className="border-gray-300"
                                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                                                .toISOString()
                                                .split("T")[0]} // convierte a YYYY-MM-DD
                                        />

                                        {formErrors.fechaNacimientoLugar && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.fechaNacimientoLugar}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departamentoNacimiento" className="text-slate-800 mb-1">
                                            DEPARTAMENTO*
                                        </Label>
                                        <Select
                                            onValueChange={(value) => handleSelectChange("departamentoNacimiento", value)}
                                            value={formData.departamentoNacimiento}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione departamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departamentos.map((depto) => (
                                                    <SelectItem key={depto.id} value={depto.name}>
                                                        {depto.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.departamentoNacimiento && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.departamentoNacimiento}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="provinciaNacimiento" className="text-slate-800 mb-1">
                                            PROVINCIA*
                                        </Label>
                                        <Select
                                            onValueChange={(value) => handleSelectChange("provinciaNacimiento", value)}
                                            value={formData.provinciaNacimiento}
                                            disabled={!formData.departamentoNacimiento}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={formData.departamentoNacimiento ? "Seleccione provincia" : "Primero seleccione departamento"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinciasNacimiento.map((prov) => (
                                                    <SelectItem key={prov.id} value={prov.name}>
                                                        {prov.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.provinciaNacimiento && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.provinciaNacimiento}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="distritoNacimiento" className="text-slate-800 mb-1">
                                            DISTRITO*
                                        </Label>
                                        <Select
                                            onValueChange={(value) => handleSelectChange("distritoNacimiento", value)}
                                            value={formData.distritoNacimiento}
                                            disabled={!formData.provinciaNacimiento}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={formData.provinciaNacimiento ? "Seleccione distrito" : "Primero seleccione provincia"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {distritosNacimiento.map((dist) => (
                                                    <SelectItem key={dist.id} value={dist.name}>
                                                        {dist.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.distritoNacimiento && (
                                            <p className="text-sm text-red-500 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.distritoNacimiento}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Paso 3: AFP y EPS */}
                {currentStep === 2 && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-lg font-semibold mb-4 text-slate-800 text-center">Asignación AFP y EPS</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="sueldo" className="text-slate-800 mb-1">
                                        SUELDO*
                                    </Label>
                                    <Input
                                        id="sueldo"
                                        name="sueldo"
                                        type="number"
                                        value={formData.sueldo}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                    />
                                    {formErrors.sueldo && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.sueldo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="afp" className="text-slate-800 mb-1">
                                        AFP*
                                    </Label>
                                    <Select onValueChange={(value) => handleSelectChange("afp", value)} value={formData.afp}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="profuturo">PROFUTURO</SelectItem>
                                            <SelectItem value="integra">INTEGRA</SelectItem>
                                            <SelectItem value="prima">PRIMA</SelectItem>
                                            <SelectItem value="habitat">HABITAT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.afp && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.afp}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="regimenPension" className="text-slate-800 mb-1">
                                        RÉGIMEN DE PENSIÓN*
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange("regimenPension", value)}
                                        value={formData.regimenPension}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="regular">REGULAR</SelectItem>
                                            <SelectItem value="especial">ESPECIAL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.regimenPension && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.regimenPension}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tipoComision" className="text-slate-800 mb-1">
                                        TIPO DE COMISIÓN*
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange("tipoComision", value)}
                                        value={formData.tipoComision}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flujo">FLUJO</SelectItem>
                                            <SelectItem value="mixta">MIXTA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.tipoComision && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.tipoComision}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="porcentajeAfp" className="text-slate-800 mb-1">
                                        PORCENTAJE AFP (% retención o aporte)*
                                    </Label>
                                    <Input
                                        id="porcentajeAfp"
                                        name="porcentajeAfp"
                                        type="number"
                                        value={formData.porcentajeAfp}
                                        onChange={handleChange}
                                        className="border-gray-300"
                                        placeholder="Ejemplo: 10%"
                                    />
                                    {formErrors.porcentajeAfp && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.porcentajeAfp}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}


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
                            type="submit"
                            className="bg-green-500 hover:bg-green-600 ml-auto cursor-pointer"
                            onClick={handleSubmit}
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
            </div>
            {/* Modal de carga */}
            <Dialog open={isSubmitting}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Guardando Datos</DialogTitle>
                        <DialogDescription className="text-center">
                            Por favor espera mientras se guardan los datos...
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de éxito */}
            <Dialog open={isSuccess}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Datos Guardados</DialogTitle>
                        <DialogDescription className="sr-only">
                            Operación completada con éxito
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-gray-600 text-center">Los datos del empleado se han guardado correctamente.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}