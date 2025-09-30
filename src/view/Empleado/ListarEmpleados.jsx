import axios from "axios";
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Check, Eye, Pencil, ChevronLeft, X, ChevronRight, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DatePickerFirstDay } from "@/components/ui/MesInputs";
import { PlusCircleOutlined } from "@ant-design/icons";
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
const SelectField = ({
  label,
  name,
  value,
  onValueChange,
  error,
  options,
  disabled = false,
  placeholder = "Seleccione",
  className = "",
}) => (
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
      <SelectContent className="max-h-72 overflow-auto">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export const ListarEmpleados = () => {
  const [editarUbicacion, setEditarUbicacion] = useState(false);
  const [ubigeoData, setUbigeoData] = useState([]);
  const [deps, setDeps] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [modalCargo, setModalCargo] = useState(false);
  const [nuevoCargo, setNuevoCargo] = useState("");
  const [ultimoSueldo, setUltimoSueldo] = useState({});
  const [ultimoAsigFam, setUltimoAsigFam] = useState({});
  const [ultimoPuesto, setUltimoPuesto] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [datosCese, setDatosCese] = useState([]);
  const [datosPuestos, setDatosPuestos] = useState([]);
  const [datosAFP, setDatosAFP] = useState([]);
  const [datosAsigFam, setDatosAsigFam] = useState([]);
  const [datosSueldos, setDatosSueldos] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cargos, setCargos] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [estadoEmpleado, setEstadoEmpleado] = useState("VIGENTE");
  const [todosEmpleados, setTodosEmpleados] = useState([]);
  const [filtroDias, setFiltroDias] = useState([])
  const [formData, setFormData] = useState({
    salary: { amount: "", valid: false, cod_mes: "" },
    position: { title: "", cod_mes: "", valid: false },
    familyAllowance: { hasAllowance: false, cod_mes: "", valid: false },
    personalData: {
      correo: "",
      telefono: "",
      direccion: "",
      dep: "",
      prov: "",
      dist: "",
      nroHijos: 0,
      estadoCivil: "",
      valid: false,
    },
  });

  const [allStepsValid, setAllStepsValid] = useState(false);

  const obtenerEmpleados = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`
      );
      const datos = response.data.recordset;

      // Filtrar empleados con nombreCompleto y ordenar
      const dataEmpleados = datos
        .filter(dato => dato.nombreCompleto !== null)
        .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

      // Guardar todos los empleados
      setTodosEmpleados(dataEmpleados);

      // Filtrar por estado
      setEmpleados(dataEmpleados.filter(dato =>
        String(dato.estadoLaboral).trim().toUpperCase() === "VIGENTE"
      ));
      console.log(dataEmpleados)
      setFilteredEmpleados(dataEmpleados.filter(dato =>
        String(dato.estadoLaboral).trim().toUpperCase() === "VIGENTE"
      ));
      const cargosResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarCargos`
      );
      setCargos(cargosResponse.data);

      const ubigeoResponse = await fetch("/data.json");
      const ubigeoData = await ubigeoResponse.json();
      setUbigeoData(ubigeoData);
      setDeps(ubigeoData.map((item) => ({ id: item.id, name: item.name })));
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  useEffect(() => {
    if (formData.personalData.dep && ubigeoData.length > 0) {
      const deptoSeleccionado = ubigeoData.find(
        (depto) => depto.name === formData.personalData.dep
      );
      if (deptoSeleccionado) {
        setProvincias(
          deptoSeleccionado.provincias.map((prov) => ({
            id: prov.id,
            name: prov.name,
          }))
        );
        setFormData((prev) => ({
          ...prev,
          personalData: {
            ...prev.personalData,
            prov: "",
            dist: "",
            valid: validateStep("personalData", {
              ...prev.personalData,
              prov: "",
              dist: "",
            }),
          },
        }));
      }
    }
  }, [formData.personalData.dep, ubigeoData]);

  useEffect(() => {
    if (formData.personalData.prov && ubigeoData.length > 0) {
      const deptoSeleccionado = ubigeoData.find(
        (depto) => depto.name === formData.personalData.dep
      );
      if (deptoSeleccionado) {
        const provSeleccionada = deptoSeleccionado.provincias.find(
          (prov) => prov.name === formData.personalData.prov
        );
        if (provSeleccionada) {
          setDistritos(
            provSeleccionada.distritos.map((dist) => ({
              id: dist.id,
              name: dist.name,
            }))
          );
          setFormData((prev) => ({
            ...prev,
            personalData: {
              ...prev.personalData,
              dist: "",
              valid: validateStep("personalData", {
                ...prev.personalData,
                dist: "",
              }),
            },
          }));
        }
      }
    }
  }, [formData.personalData.prov, ubigeoData, formData.personalData.dep]);

  useEffect(() => {
    if (selectedField) {
      const fieldData = formData[selectedField];
      setAllStepsValid(fieldData.valid);
    }
  }, [formData, selectedField]);


  const filtrarPorRangoFechas = (empleados, rangoFechas) => {
    try {
      const fechaInicio = new Date(rangoFechas[0]);
      const fechaFin = new Date(rangoFechas[1]);

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new Error('Fechas inválidas en el rango');
      }

      return empleados.filter(empleado => {
        if (!empleado?.fecIngreso) return false;

        try {
          const fechaEmpleado = new Date(empleado.fecIngreso);
          return !isNaN(fechaEmpleado.getTime()) &&
            fechaEmpleado >= fechaInicio &&
            fechaEmpleado <= fechaFin;
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error("Error al filtrar por fechas:", error);
      return []; // Retorna array vacío en caso de error
    }
  };
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    // Base para filtrar según el estado seleccionado
    let baseEmpleados = estadoEmpleado === "VIGENTE"
      ? empleados
      : todosEmpleados.filter(dato =>
        String(dato.estadoLaboral).trim().toUpperCase() === estadoEmpleado.toUpperCase()
      );
    if (Array.isArray(filtroDias) && filtroDias.length == 2) {
      baseEmpleados = filtrarPorRangoFechas(baseEmpleados, filtroDias);
    }
    if (query === "") {
      setFilteredEmpleados(baseEmpleados);
    } else {
      const filtered = baseEmpleados.filter((emp) => {
        if (!emp) return false;
        const documento = emp.documento ? emp.documento.toString().toLowerCase() : "";
        const codigo = emp.CODIGO ? emp.CODIGO.toString().toLowerCase() : "";
        const nombre = emp.nombreCompleto ? emp.nombreCompleto.toString().toLowerCase() : "";
        return (
          documento.includes(query) ||
          codigo.includes(query) ||
          nombre.includes(query)
        );
      });
      setFilteredEmpleados(filtered);
    }
  }, [searchQuery, estadoEmpleado, empleados, todosEmpleados, filtroDias]);

  const handleSearchChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month] = dateString.split("T")[0].split("-");
    return `${month}/${year}`;
  };

  const ObtenerUltimo = (datos) => {
    return datos.find((dato) => dato.mesFin === null);
  };

  const HistoricoCese = async (idPersona) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL
      }/api/empleados/historicoCeses/${idPersona}`
    );
    setDatosCese(response.data.data);
  };

  const HistoricoPuestos = async (idPersona) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL
      }/api/empleados/historicoPuestoTrabajo/${idPersona}`
    );
    console.log(response.data.data)
    setDatosPuestos(response.data.data);
    if (response.data.data.length > 0) {
      setUltimoPuesto(ObtenerUltimo(response.data.data));
    }

  };

  const HistoricoAFP = async (idPersona) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL
      }/api/empleados/historicoAFP/${idPersona}`
    );
    setDatosAFP(response.data.data);
  };
  const HistoricoAsignacionFamiliar = async (idPersona) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL
      }/api/empleados/historicoAsignacionFamiliar/${idPersona}`
    );
    setDatosAsigFam(response.data.data);
    if (response.data.data.length > 0) {
      setUltimoAsigFam(ObtenerUltimo(response.data.data));
    }
  };

  const HistoricoSueldo = async (idPersona) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL
      }/api/empleados/historicoSueldos/${idPersona}`
    );
    setDatosSueldos(response.data.data);
    if (response.data.data.length > 0) {
      setUltimoSueldo(ObtenerUltimo(response.data.data));
    }
  };

  const openDetails = async (employee) => {
    setSelectedEmployee(employee);
    console.log(employee)
    setDetailsOpen(true);
    setLoadingDetails(true);

    try {
      await HistoricoCese(employee.idPersona);
      await HistoricoPuestos(employee.idPersona);
      await HistoricoAFP(employee.idPersona);
      await HistoricoAsignacionFamiliar(employee.idPersona);
      await HistoricoSueldo(employee.idPersona);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const AgregarNuevoCargo = async () => {
    if (!nuevoCargo.trim()) {
      alert("Por favor ingrese un nombre de cargo");
      return;
    }

    const cargoRepetido = cargos.some(
      (c) => c.CARGO.toUpperCase() === nuevoCargo.toUpperCase()
    );
    if (cargoRepetido) {
      alert("El cargo ya existe");
      return;
    }

    try {
      setCargos((prev) => [...prev, { CARGO: nuevoCargo }]);
      setFormData((prev) => ({
        ...prev,
        position: {
          ...prev.position,
          title: nuevoCargo,
          valid: !!prev.position.cod_mes,
        },
      }));
      setModalCargo(false);
      setNuevoCargo("");
    } catch (error) {
      console.error("Error al agregar cargo:", error);
      alert("Ocurrió un error al agregar el cargo");
    }
  };

  const openEdit = async (employee) => {
    setSelectedEmployee(employee);
    setSelectedField(null);
    setCurrentStep(1);
    setEditOpen(true);
    try {
      await HistoricoPuestos(employee.idPersona);
      await HistoricoSueldo(employee.idPersona);
      await HistoricoAsignacionFamiliar(employee.idPersona);
    } catch (error) {
      console.log(error);
    }

    setFormData({
      salary: {
        amount: employee.sueldo?.toString() || "",
        cod_mes: "",
        valid: false,
      },
      position: {
        title: employee.cargo || "",
        cod_mes: employee.fecIngreso || "",
        valid: false,
      },
      familyAllowance: {
        hasAllowance: employee.asignacionFamiliar === "Sí",
        cod_mes: "",
        valid: false,
      },
      personalData: {
        correo: employee.correo || "",
        telefono: employee.telefono || "",
        direccion: employee.direccion || "",
        dep: "",
        prov: "",
        dist: "",
        nroHijos: employee.nroHijos || 0,
        estadoCivil: employee.estadoCivil || "",
        valid: true,
      },
    });
  };

  const handleFieldChange = (field, updates) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...updates,
        valid: validateStep(field, { ...prev[field], ...updates }),
      },
    }));
  };

  const validateStep = (field, data) => {
    switch (field) {
      case "salary":
        return !!data.amount && !isNaN(data.amount) && data.cod_mes !== "";
      case "position":
        return !!data.title && !!data.cod_mes;
      case "familyAllowance":
        return data.cod_mes !== "";
      case "personalData":
        return (
          !!data.estadoCivil
        );
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedField) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!allStepsValid) return;
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      setEditOpen(false);
      setIsLoading(true)
      if (!selectedField || !formData[selectedField].valid) {
        alert("Por favor complete todos los campos correctamente");
        return;
      }

      // Datos comunes para todos los casos
      const basePayload = {
        idEmpleado: selectedEmployee.idEmpleado
      };

      let endpoint = "";
      let requestData = {};

      switch (selectedField) {
        case "salary":
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/empleados/modificarSueldo`
          requestData = {
            ...basePayload,
            sueldo: formData.salary.amount,
            mesInicio: formData.salary.cod_mes,
            usuario: "ADMIN",
          };
          break;

        case 'position':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/empleados/modificarPuestoTrabajo`
          requestData = {
            ...basePayload,
            cargo_puestotrabajo: formData.position.title,
            mesInicio: formData.position.cod_mes,
            usuario: "ADMIN"
          };
          break;

        case "familyAllowance":
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/empleados/modificarAsignacionFamiliar`
          requestData = {
            ...basePayload,
            asignacionfamiliar: formData.familyAllowance.hasAllowance ? "SI" : "NO",
            mesInicio: formData.familyAllowance.cod_mes,
            usuario: "ADMIN",
          };
          break;

        case "personalData":
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/empleados/modificarDatosPersonales`
          requestData = {
            ...basePayload,
            correo: formData.personalData.correo,
            telefono: formData.personalData.telefono,
            numero_hijos: formData.personalData.nroHijos,
            estadoCivil: formData.personalData.estadoCivil,
            direccion: formData.personalData.direccion.toUpperCase(),
            departamento: formData.personalData.dep === "" ? selectedEmployee.departamento : formData.personalData.dep.toUpperCase(),
            provincia: formData.personalData.prov === "" ? selectedEmployee.provincia : formData.personalData.prov.toUpperCase(),
            distrito: formData.personalData.dist === "" ? selectedEmployee.distrito : formData.personalData.dist.toUpperCase(),
            usuario: "ADMIN"
          };
          break;

        default:
          throw new Error("Campo no válido");
      }
      // Descomentar cuando el endpoint esté listo:
      console.log('Enviando datos:', requestData, endpoint);

      // Descomentar cuando el endpoint esté listo:
      const response = await axios.put(endpoint, requestData);
      if (response) {
        setIsLoading(false)
        setIsSuccess(true)
      }
      console.log('Respuesta:', response.data);

      const updatedEmpleados = empleados.map((emp) =>
        emp.idPersona === selectedEmployee.idPersona
          ? { ...emp, ...mapFormDataToEmployee(formData) }
          : emp
      );

      setEmpleados(updatedEmpleados);
      setFilteredEmpleados(updatedEmpleados);
      setEditOpen(false);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      alert("Ocurrió un error al guardar los cambios");
    } finally {
      setTimeout(() => {
        setIsSuccess(false)

      }, 2000)
    }
  };

  const mapFormDataToEmployee = (formData) => {
    return {
      ...(selectedField === "salary" && {
        sueldo: parseFloat(formData.salary.amount),
      }),
      ...(selectedField === "position" && {
        cargo: formData.position.title,
        fecIngreso: formData.position.cod_mes,
      }),
      ...(selectedField === "familyAllowance" && {
        asignacionfamiliar: formData.familyAllowance.hasAllowance ? "Sí" : "No",
      }),
      ...(selectedField === 'personalData' && {
        correo: formData.personalData.correo,
        telefono: formData.personalData.telefono,
        numero_hijos: formData.personalData.nroHijos,
        estadoCivil: formData.personalData.estadoCivil,
        ...(editarUbicacion && {
          direccion: formData.personalData.direccion.toUpperCase(),
          departamento: formData.personalData.dep.toUpperCase(),
          provincia: formData.personalData.prov.toUpperCase(),
          distrito: formData.personalData.dist.toUpperCase()
        })
      })
    };
  };
  const getFieldLabel = (selectedField) => {
    switch (selectedField) {
      case "salary":
        return "el sueldo";
      case "position":
        return "el puesto";
      case "familyAllowance":
        return "la asignación familiar";
      default:
        return "los datos personales";
    }
  };
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 py-4">
            <DialogDescription className="text-center">
              Seleccione el campo que desea modificar
            </DialogDescription>
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="salary"
                  checked={selectedField === "salary"}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? "salary" : null)
                  }
                />
                <Label htmlFor="salary" className="text-lg">
                  Sueldo
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="position"
                  checked={selectedField === "position"}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? "position" : null)
                  }
                />
                <Label htmlFor="position" className="text-lg">
                  Puesto
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="familyAllowance"
                  checked={selectedField === "familyAllowance"}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? "familyAllowance" : null)
                  }
                />
                <Label htmlFor="familyAllowance" className="text-lg">
                  Asignación Familiar
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personalData"
                  checked={selectedField === "personalData"}
                  onCheckedChange={(checked) =>
                    setSelectedField(checked ? "personalData" : null)
                  }
                />
                <Label htmlFor="personalData" className="text-lg">
                  Datos Personales
                </Label>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 py-4">
            <DialogDescription className="text-center">
              Complete los datos para modificar{" "}
              {getFieldLabel(selectedField)}
            </DialogDescription>

            {selectedField === "salary" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="amount">Nuevo Sueldo</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1200"
                      step="100"
                      value={formData.salary.amount}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        let isValid = false;

                        if (inputValue !== "") {
                          const numericValue = parseFloat(inputValue);
                          isValid =
                            !isNaN(numericValue) &&
                            numericValue >= 1200 &&
                            numericValue !== ultimoSueldo.sueldoFijo;
                        }

                        setFormData((prev) => ({
                          ...prev,
                          salary: {
                            ...prev.salary,
                            amount: inputValue,
                            valid: isValid && prev.salary.cod_mes !== "",
                          },
                        }));
                      }}
                      className={
                        !formData.salary.valid && formData.salary.amount !== ""
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formData.salary.amount !== "" &&
                      !formData.salary.valid && (
                        <p className="text-sm text-red-500">
                          {parseFloat(formData.salary.amount) ===
                            ultimoSueldo.sueldoFijo
                            ? "El sueldo que quiere ingresar es el mismo al sueldo actual"
                            : (parseFloat(formData.salary.amount) < 1200
                              ? "El monto mínimo permitido es 1200"
                              : "")}
                        </p>
                      )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Codigo Mes</Label>
                    <div className="flex flex-col">
                      <DatePickerFirstDay
                        mesInicio={ultimoSueldo.mesInicio}
                        handleDateChange={(date) => {
                          const hasDate = !!date;
                          setFormData((prev) => ({
                            ...prev,
                            salary: {
                              ...prev.salary,
                              cod_mes: date
                                ? date.toISOString().split("T")[0]
                                : "",
                              valid:
                                prev.salary.amount !== "" &&
                                parseFloat(prev.salary.amount) >= 1200 &&
                                parseFloat(prev.salary.amount) !==
                                ultimoSueldo.sueldoFijo &&
                                hasDate,
                            },
                          }));
                        }}
                      />
                      {formData.salary.cod_mes === "" && (
                        <p className="text-sm text-red-500">
                          Por favor seleccione una fecha válida
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedField === "position" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <SelectField
                    className="w-full"
                    label="CARGO*"
                    name="cargo"
                    value={formData.position.title}
                    onValueChange={(name, value) => {
                      if (value === ultimoPuesto.CARGO) {
                        alert("Se esta repitiendo el puesto que ya tenia");
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          position: {
                            ...prev.position,
                            title: value,
                            valid: !!value && !!prev.position.cod_mes,
                          },
                        }));
                      }
                    }}
                    options={cargos.map((c) => ({
                      value: c.CARGO,
                      label: c.CARGO,
                    }))}
                  />
                  <Button
                    variant="outline"
                    className="translate-y-3"
                    size="small"
                    onClick={() => setModalCargo(true)}
                  >
                    <PlusCircleOutlined className="text-white bg-green-700 p-1 rounded-md" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Codigo Mes Inicio</Label>
                  <DatePickerFirstDay
                    mesInicio={ultimoPuesto.mesInicio}
                    handleDateChange={(date) => {
                      const hasDate = !!date;
                      setFormData((prev) => ({
                        ...prev,
                        position: {
                          ...prev.position,
                          cod_mes: date ? date.toISOString().split("T")[0] : "",
                          valid: !!prev.position.title && hasDate,
                        },
                      }));
                    }}
                  />
                  {formData.position.cod_mes === "" && (
                    <p className="text-sm text-red-500">
                      Por favor seleccione una fecha válida
                    </p>
                  )}
                </div>

                {!formData.position.valid && (
                  <p className="text-sm text-red-500">
                    {!formData.position.title
                      ? "Por favor seleccione un cargo"
                      : (!formData.position.cod_mes
                        ? "Por favor seleccione una fecha"
                        : "Complete todos los campos requeridos")}
                  </p>
                )}
                <Dialog
                  open={modalCargo}
                  onOpenChange={() => setModalCargo(false)}
                >
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Agregar nuevo cargo
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                      <Label className="text-slate-800 mb-2 text-start w-full">
                        Nuevo Cargo*
                      </Label>
                      <Input
                        value={nuevoCargo}
                        onChange={(e) =>
                          setNuevoCargo(e.target.value.toUpperCase())
                        }
                        placeholder="Ingrese el nombre del cargo"
                      />
                      {!nuevoCargo.trim() && (
                        <p className="text-sm text-red-500 w-full mt-1">
                          Por favor ingrese un nombre de cargo
                        </p>
                      )}
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setModalCargo(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={AgregarNuevoCargo}
                        disabled={!nuevoCargo.trim()}
                      >
                        Agregar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {selectedField === "familyAllowance" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>¿Recibe asignación familiar?</Label>
                  <div className="flex gap-4">
                    {!ultimoAsigFam ? (
                      <div>
                        <Button
                          variant={
                            formData.familyAllowance.hasAllowance
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handleFieldChange("familyAllowance", {
                              hasAllowance: true,
                              valid: formData.familyAllowance.cod_mes !== "",
                            })
                          }
                        >
                          Sí
                        </Button>
                        <Button
                          variant={
                            !formData.familyAllowance.hasAllowance
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handleFieldChange("familyAllowance", {
                              hasAllowance: false,
                              valid: formData.familyAllowance.cod_mes !== "",
                            })
                          }
                        >
                          No
                        </Button>
                      </div>
                    ) : (ultimoAsigFam.asignacion === "SI" ? (
                      <div>
                        <Button
                          variant={
                            !formData.familyAllowance.hasAllowance
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handleFieldChange("familyAllowance", {
                              hasAllowance: false,
                              valid: formData.familyAllowance.cod_mes !== "",
                            })
                          }
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Button
                          variant={
                            formData.familyAllowance.hasAllowance
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handleFieldChange("familyAllowance", {
                              hasAllowance: true,
                              valid: formData.familyAllowance.cod_mes !== "",
                            })
                          }
                        >
                          Sí
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Código Mes*</Label>
                  <DatePickerFirstDay
                    mesInicio={
                      ultimoAsigFam
                        ? ultimoAsigFam.mesInicio
                        : "1990-01-01T00:00:00.000Z"
                    }
                    handleDateChange={(date) => {
                      const hasDate = !!date;
                      handleFieldChange("familyAllowance", {
                        cod_mes: date ? date.toISOString().split("T")[0] : "",
                        valid: hasDate,
                      });
                    }}
                  />
                  {!formData.familyAllowance.cod_mes && (
                    <p className="text-sm text-red-500">
                      Por favor seleccione una fecha
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedField === 'personalData' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo*</Label>
                    <Input
                      id="correo"
                      value={formData.personalData.correo}
                      onChange={(e) => handleFieldChange('personalData', { correo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono*</Label>
                    <Input
                      id="telefono"
                      value={formData.personalData.telefono}
                      onChange={(e) => handleFieldChange('personalData', { telefono: e.target.value })}
                    />
                  </div>

                  {/* Checkbox para editar ubicación */}
                  <div className="flex items-center space-x-2 pt-2 pb-4">
                    <Checkbox
                      id="editarUbicacion"
                      checked={editarUbicacion}
                      onCheckedChange={(checked) => setEditarUbicacion(checked)}
                    />
                    <Label htmlFor="editarUbicacion" className="text-sm font-bold">
                      Modificar dirección y ubicación
                    </Label>
                  </div>

                  {/* Dirección */}
                  {editarUbicacion ? (
                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección*</Label>
                      <Input
                        id="direccion"
                        value={formData.personalData.direccion}
                        onChange={(e) => handleFieldChange('personalData', { direccion: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Dirección actual:</Label>
                      <p className="text-sm">{selectedEmployee?.direccion || 'N/A'}</p>
                    </div>
                  )}

                  {/* Departamento */}
                  {editarUbicacion ? (
                    <div className="space-y-2">
                      <Label htmlFor="dep">Departamento*</Label>
                      <Select
                        value={formData.personalData.dep}
                        onValueChange={(value) => {
                          handleFieldChange('personalData', {
                            dep: value,
                            prov: '', // Resetear provincia al cambiar departamento
                            dist: ''  // Resetear distrito al cambiar departamento
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {deps.map((dep) => (
                            <SelectItem key={dep.id} value={dep.name}>{dep.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Departamento actual:</Label>
                      <p className="text-sm">{selectedEmployee?.departamento || 'N/A'}</p>
                    </div>
                  )}

                  {/* Provincia */}
                  {editarUbicacion && (
                    <div className="space-y-2">
                      <Label htmlFor="prov">Provincia*</Label>
                      <Select
                        value={formData.personalData.prov}
                        onValueChange={(value) => {
                          handleFieldChange('personalData', {
                            prov: value,
                            dist: '' // Resetear distrito al cambiar provincia
                          });
                        }}
                        disabled={!formData.personalData.dep}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            formData.personalData.dep
                              ? "Seleccione provincia"
                              : "Primero seleccione departamento"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {provincias.map((prov) => (
                            <SelectItem key={prov.id} value={prov.name}>{prov.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {!editarUbicacion && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Provincia actual:</Label>
                      <p className="text-sm">{selectedEmployee?.provincia || 'N/A'}</p>
                    </div>
                  )}

                  {/* Distrito */}
                  {editarUbicacion && (
                    <div className="space-y-2">
                      <Label htmlFor="dist">Distrito*</Label>
                      <Select
                        value={formData.personalData.dist}
                        onValueChange={(value) => handleFieldChange('personalData', { dist: value })}
                        disabled={!formData.personalData.prov}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            formData.personalData.prov
                              ? "Seleccione distrito"
                              : "Primero seleccione provincia"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {distritos.map((dist) => (
                            <SelectItem key={dist.id} value={dist.name}>{dist.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {!editarUbicacion && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Distrito actual:</Label>
                      <p className="text-sm">{selectedEmployee?.distrito || 'N/A'}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="nroHijos">Número de Hijos*</Label>
                    <Input
                      id="nroHijos"
                      type="number"
                      min="0"
                      value={formData.personalData.nroHijos}
                      onChange={(e) => handleFieldChange('personalData', {
                        nroHijos: Math.max(0, parseInt(e.target.value) || 0)
                      })}
                    />
                  </div>

                  {/* Select de Estado Civil - Versión corregida */}
                  <div className="space-y-2">
                    <Label>Estado Civil*</Label>
                    <Select
                      value={formData.personalData.estadoCivil}
                      onValueChange={(value) => handleFieldChange('personalData', { estadoCivil: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLTERO">Soltero</SelectItem>
                        <SelectItem value="CASADO">Casado</SelectItem>
                        <SelectItem value="DIVORCIADO">Divorciado</SelectItem>
                        <SelectItem value="VIUDO">Viudo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!formData.personalData.valid && (
                  <p className="text-sm text-red-500">Por favor complete todos los campos requeridos</p>
                )}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 py-4">
            <DialogDescription className="text-center">
              Revise los cambios antes de enviar
            </DialogDescription>

            <div className="border rounded-lg p-2">
              <h3 className="font-semibold text-center">Resumen de cambios:</h3>
              <hr className="py-1" />
              {selectedField === "salary" && (
                <>
                  <div className="flex justify-between w-full">
                    <p className="text-red-500">
                      <span className="font-medium text-black">Anterior sueldo:</span>{" "}
                      {ultimoSueldo.sueldoFijo}
                    </p>
                    <p className="text-green-500">
                      <span className="font-medium text-black">Nuevo sueldo:</span>{" "}
                      {formData.salary.amount}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Codigo Mes: </span>
                      {formData.salary.cod_mes.split("-").reverse().slice(1).join("-")}
                    </p>
                  </div>
                </>
              )}
              {selectedField === "position" && (
                <>
                  <p>
                    <span className="font-medium">Nuevo puesto:</span>{" "}
                    {formData.position.title}
                  </p>
                  <p>
                    <span className="font-medium">Codigo Mes:</span>{" "}
                    {formData.position.cod_mes.split("-").reverse().slice(1).join("-")}
                  </p>
                </>
              )}
              {selectedField === "familyAllowance" && (
                <>
                  <div className="flex justify-between pr-4">
                    <p className="text-red-500">
                      <span className="font-medium text-black">Anterior Asignacion Familiar:</span>{" "}
                      {selectedEmployee.asignacionFamiliar ? "Sí" : "No"}
                    </p>
                    <p className="text-green-500">
                      <span className="font-medium text-black">Nueva Asignacion Familiar:</span>{" "}
                      {formData.familyAllowance.hasAllowance ? "Sí" : "No"}
                    </p>
                  </div>
                  <p>
                    <span className="font-medium">Codigo Mes:</span>{" "}
                    {formData.familyAllowance.cod_mes.split("-").reverse().slice(1).join("-")}
                  </p>
                </>
              )}
              {selectedField === "personalData" && (
                <div className="text-sm flex flex-col gap-2">
                  <div className="bg-green-100 p-1 rounded-lg">
                    <p className="text-lg font-bold">Datos antiguos: </p>

                    <p>
                      <span className="font-medium">Correo:</span>{" "}
                      {selectedEmployee.correo}
                    </p>
                    <p>
                      <span className="font-medium">Teléfono:</span>{" "}
                      {selectedEmployee.telefono}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span>{" "}
                      {selectedEmployee.direccion}
                    </p>
                    <p>
                      <span className="font-medium">Departamento:</span>{" "}
                      {selectedEmployee.departamento}
                    </p>
                    <p>
                      <span className="font-medium">Provincia:</span>{" "}
                      {selectedEmployee.provincia}
                    </p>
                    <p>
                      <span className="font-medium">Distrito:</span>{" "}
                      {selectedEmployee.distrito}
                    </p>
                    <p>
                      <span className="font-medium">Número de hijos:</span>{" "}
                      {selectedEmployee.nroHijos}
                    </p>
                    <p>
                      <span className="font-medium">Estado civil:</span>{" "}
                      {selectedEmployee.estadoCivil}
                    </p>
                  </div>
                  <div className="bg-red-100">
                    <p className="text-lg font-bold">Datos nuevos:</p>
                    <p>
                      <span className="font-medium">Correo:</span>{" "}
                      {formData.personalData.correo}
                    </p>
                    <p>
                      <span className="font-medium">Teléfono:</span>{" "}
                      {formData.personalData.telefono}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span>{" "}
                      {formData.personalData.direccion}
                    </p>
                    <p>
                      <span className="font-medium">Departamento:</span>{" "}
                      {formData.personalData.dep !== "" ? formData.personalData.dep : selectedEmployee.departamento}
                    </p>
                    <p>
                      <span className="font-medium">Provincia:</span>{" "}
                      {formData.personalData.prov !== "" ? formData.personalData.prov : selectedEmployee.provincia}
                    </p>
                    <p>
                      <span className="font-medium">Distrito:</span>{" "}
                      {formData.personalData.dist !== "" ? formData.personalData.dist : selectedEmployee.distrito}
                    </p>
                    <p>
                      <span className="font-medium">Número de hijos:</span>{" "}
                      {formData.personalData.nroHijos}
                    </p>
                    <p>
                      <span className="font-medium">Estado civil:</span>{" "}
                      {formData.personalData.estadoCivil}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4">
      <h1 className="text-center text-2xl font-bold text-gray-800">
        LISTA DE EMPLEADOS
      </h1>

      <div className="flex flex-col md:flex-row gap-4 py-8 w-full animate-fade-in">
        {/* Fila de filtros */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">

          {/* Buscador */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar empleado</label>
            <div className="relative group">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="DNI, nombre o código"
                className="pl-10 pr-4 py-1 w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* Rango de fechas */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rango de fechas</label>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  dates = dates.map(date => date.format("YYYY-MM-DD"));
                  setFiltroDias(dates);
                }
              }}
              className="w-full py-1 border-gray-300 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gray-800 dark:border-gray-600 dark:[&_input]:bg-gray-800 dark:[&_input]:text-white"
              popupClassName="dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Estado del empleado */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <Select
              value={estadoEmpleado}
              onValueChange={(value) => setEstadoEmpleado(value)}
            >
              <SelectTrigger className="w-full border-gray-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-gray-200 shadow-lg animate-pop-in dark:bg-gray-800 dark:border-gray-600">
                <SelectItem
                  value="VIGENTE"
                  className="flex items-center hover:bg-indigo-50 focus:bg-indigo-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 transition-colors duration-200"
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-gray-800 dark:text-gray-200">VIGENTE</span>
                </SelectItem>
                <SelectItem
                  value="CESADO"
                  className="flex items-center hover:bg-indigo-50 focus:bg-indigo-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 transition-colors duration-200"
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-gray-800 dark:text-gray-200">CESADO</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón Limpiar */}
          <div className="flex items-end min-w-[100px]">
            <button
              onClick={() => {
                setSearchQuery("");
                setFiltroDias(null);
                setEstadoEmpleado("VIGENTE");
              }}
              className="cursor-pointer h-[35px] px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {!loading ? (
        <Card className="shadow-lg overflow-y-auto max-h-[70vh]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-gray-100">
                  <TableHead>CODIGO EMPLEADO</TableHead>
                  <TableHead>NOMBRE COMPLETO</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>FECHA INGRESO</TableHead>
                  <TableHead>ESTADO LABORAL</TableHead>
                  <TableHead>DETALLE</TableHead>
                  <TableHead>EDITAR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpleados.map((employee) => (
                  <TableRow
                    key={employee.idPersona}
                    className="border-t hover:bg-blue-50 transition-colors"
                  >
                    <TableCell>{employee.CODIGO}</TableCell>
                    <TableCell>{employee.nombreCompleto}</TableCell>
                    <TableCell>{employee.documento}</TableCell>
                    <TableCell>{employee.fecIngreso ? employee.fecIngreso.split("T")[0] : "N/A"}</TableCell>
                    <TableCell>{employee.estadoLaboral}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-300 cursor-pointer"
                        onClick={() => openDetails(employee)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {
                        employee.estadoLaboral === "CESADO" ?
                          (
                            <div></div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-800 hover:bg-green-300 cursor-pointer"
                              onClick={() => openEdit(employee)}
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                          )
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="font-semibold text-xl">Cargando los datos...</p>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-slate-800 border-b pb-2">
              DETALLES DEL EMPLEADO
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-blue-600 spin-reverse"></div>
              </div>
              <p className="mt-4 text-blue-600 font-medium">
                Cargando detalles del empleado...
              </p>
            </div>
          ) : (
            selectedEmployee && (
              <div className="space-y-2">
                <div className="border border-blue-200 rounded-lg p-2 bg-neutral-100">
                  <h3 className="font-bold text-center mb-2 text-slate-700">
                    DATOS GENERALES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold">Nombre:</span>{" "}
                        {selectedEmployee.nombreCompleto}
                      </p>
                      <p>
                        <span className="font-semibold">DNI:</span>{" "}
                        {selectedEmployee.documento}
                      </p>
                      <p>
                        <span className="font-semibold">Código:</span>{" "}
                        {selectedEmployee.CODIGO}
                      </p>
                      <p>
                        <span className="font-semibold">Edad:</span>{" "}
                        {selectedEmployee.Edad}
                      </p>
                      <p>
                        <span className="font-semibold">Correo:</span>{" "}
                        {selectedEmployee.correo}
                      </p>
                      <p>
                        <span className="font-semibold">Num.Hijos:</span>{" "}
                        {selectedEmployee.nroHijos}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold">Ingreso:</span>{" "}
                        {selectedEmployee.fecIngreso.split("T")[0]}
                      </p>
                      <p>
                        <span className="font-semibold">Telefono:</span>{" "}
                        {selectedEmployee.telefono}
                      </p>
                      <p>
                        <span className="font-semibold">Estado:</span>{" "}
                        {selectedEmployee.estadoLaboral}
                      </p>
                      <p>
                        <span className="font-semibold">Motivo Cese:</span>{" "}
                        {selectedEmployee.motivoCese || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Estado Civil:</span>{" "}
                        {selectedEmployee.estadoCivil}
                      </p>
                      <p>
                        <span className="font-semibold">Cant. Ingresos:</span>{" "}
                        {selectedEmployee.CantidadIngresos}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold">Dirección:</span>{" "}
                        {selectedEmployee.direccion || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Departamento:</span>{" "}
                        {selectedEmployee.departamento || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Provincia:</span>{" "}
                        {selectedEmployee.provincia || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Distrito:</span>{" "}
                        {selectedEmployee.distrito || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Fech. Nacimiento:</span>{" "}
                        {selectedEmployee.fecNacimiento ? selectedEmployee.fecNacimiento.split("T")[0] : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">
                      HISTÓRICO DE PUESTOS DE TRABAJO
                    </h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>CARGO</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosPuestos.map((puesto, index) => (
                            <TableRow
                              key={index}
                              className="border-t hover:bg-blue-50 transition-colors"
                            >
                              <TableCell>{puesto.CARGO}</TableCell>
                              <TableCell>
                                {formatDate(puesto.mesInicio)}
                              </TableCell>
                              <TableCell>{formatDate(puesto.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {datosPuestos.length === 0 && (
                        <div>
                          <p className="text-center text-sm text-gray-500">
                            No se encontraron datos de puestos para este
                            empleado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">
                      HISTÓRICO DE SISTEMA DE PENSIÓN
                    </h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SP</TableHead>
                            <TableHead>TIPO COMISION</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosAFP.map((afp, index) => (
                            <TableRow
                              key={index}
                              className="border-t hover:bg-blue-50 transition-colors"
                            >
                              <TableCell>{afp.SP}</TableCell>
                              <TableCell>{afp.tipoComision}</TableCell>
                              <TableCell>{formatDate(afp.mesInicio)}</TableCell>
                              <TableCell>{formatDate(afp.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {datosAFP.length === 0 && (
                        <div>
                          <p className="text-center text-sm text-gray-500">
                            No se encontraron datos de AFP para este empleado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">
                      HISTÓRICO DE SUELDOS
                    </h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SUELDO</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosSueldos.map((sueldo, index) => (
                            <TableRow
                              key={index}
                              className="border-t hover:bg-blue-50 transition-colors"
                            >
                              <TableCell>{sueldo.sueldoFijo}</TableCell>
                              <TableCell>
                                {formatDate(sueldo.mesInicio)}
                              </TableCell>
                              <TableCell>{formatDate(sueldo.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {datosSueldos.length === 0 && (
                        <div>
                          <p className="text-center text-sm text-gray-500">
                            No se encontraron datos de los sueldos
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">
                      HISTÓRICO DE ASIGNACIÓN FAMILIAR
                    </h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ASIGNACION</TableHead>
                            <TableHead>MES INICIO</TableHead>
                            <TableHead>MES FIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosAsigFam.map((asig, index) => (
                            <TableRow
                              key={index}
                              className="border-t hover:bg-blue-50 transition-colors"
                            >
                              <TableCell>{asig.asignacion}</TableCell>
                              <TableCell>
                                {formatDate(asig.mesInicio)}
                              </TableCell>
                              <TableCell>{formatDate(asig.mesFin)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {datosAsigFam.length === 0 && (
                        <div>
                          <p className="text-center text-sm text-gray-500">
                            No se encontraron datos de asignación familiar para
                            este empleado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">
                      HISTÓRICO DE CESES
                    </h3>
                    <div className="shadow-lg overflow-y-auto max-h-[40vh] overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>FECHA INGRESO</TableHead>
                            <TableHead>FECHA CESE</TableHead>
                            <TableHead>MOTIVO</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datosCese.map((cese, index) => (
                            <TableRow
                              key={index}
                              className="border-t hover:bg-blue-50 transition-colors"
                            >
                              <TableCell>
                                {formatDate(cese.fecIngreso)}
                              </TableCell>
                              <TableCell>{cese.fecCese.split("T")[0]}</TableCell>
                              <TableCell>{cese.motivo}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {datosCese.length === 0 && (
                        <div>
                          <p className="text-center text-sm text-gray-500">
                            No se encontraron datos de cese para este empleado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditOpen(false);
            setCurrentStep(1);
            setSelectedField(null);
          }
        }}
      >
        <DialogContent className="max-w-[30vw] max-h-[95vh] overflow-y-auto ">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-yellow-800">
              {currentStep === 1
                ? "¿QUÉ CAMPO REQUIERE MODIFICAR?"
                : (currentStep === 2
                  ? "MODIFICAR DATOS"
                  : "CONFIRMAR CAMBIOS")}

            </DialogTitle>
            <div className="py-2">
              <Progress value={(currentStep / 3) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Paso {currentStep} de 3</span>
                {currentStep === 2 &&
                  selectedField &&
                  formData[selectedField].valid && (
                    <span className="text-green-500 flex items-center">
                      <Check className="h-3 w-3 mr-1" /> Datos completos
                    </span>
                  )}
                {currentStep === 2 &&
                  selectedField &&
                  !formData[selectedField].valid && (
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
                  setSelectedField(null);
                  setEditOpen(false);
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
      {/* MODAL DE CARGA */}
      <Dialog open={isLoading}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center">Procesando actualizacion</DialogTitle>
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
      {/* MODAL DE SUCCES */}
      <Dialog open={isSuccess} >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Datos Actualizados</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-center">Los datos del empleado se han actualizado correctamente.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
