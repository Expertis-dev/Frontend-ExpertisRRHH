import { Search, Plus, RefreshCw, Trash, Eye, Pencil, CalendarDays, Clock, User, Download } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Input, Modal, Form, DatePicker, AutoComplete, Select, Checkbox } from "antd";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useData } from "@/provider/Provider";
import axios from "axios";
import { motion } from "framer-motion";
import { CompResultado } from "@/components/CompSucces";
import { DiffOutlined } from "@ant-design/icons";
import { exportToExcel } from "@/logic/ExportarDocumento";
dayjs.locale("es");
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const hoverEffect = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

const DescansoMedicoTable = () => {
  const [data, setData] = useState([]);
  const [dataEnviar, setDataEnviar] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalConfirmar, setIsModalConfirmar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form] = Form.useForm();
  const [empleados, setEmpleados] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const { nombre } = useData();
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [diasFilter, setDiasFilter] = useState(null);
  const [tieneCITT, setTieneCITT] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  // Estados para eliminación
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordToView, setRecordToView] = useState(null);
  const [editForm] = Form.useForm();

  // Inicializar valores del formulario
  useEffect(() => {
    form.setFieldsValue({
      TIENE_CITT: false,
      CITT: undefined
    });
    setTieneCITT(false);
  }, [form]);

  // Obtener empleados y descansos médicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [empleadosRes, descansosRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarEmpleadosParaDM`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarDescansosMedicos`)
        ]);
        console.log("Datos de descansos médicos:", descansosRes.data.data);
        console.log("Datos de empleados:", empleadosRes.data.data);
        setEmpleados(empleadosRes.data.data);
        const sortedData = descansosRes.data.data.sort((a, b) => b.fecha_inicio?.localeCompare(a.fecha_inicio) || 0);
        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = [...data];

    // Filtro por búsqueda
    if (searchTerm) {
      result = result.filter(item =>
        item.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.documento?.includes(searchTerm))
    }

    // Filtro por rango de fechas
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      result = result.filter(item => {
        const fechaInicio = dayjs(item.fecha_inicio?.split("T")[0]);
        return fechaInicio.isAfter(start) && fechaInicio.isBefore(end);
      });
    }

    // Filtro por días
    if (diasFilter) {
      result = result.filter(item => {
        const dias = parseInt(item.numDias);
        switch (diasFilter) {
          case 'menos_5': return dias < 5;
          case '5_15': return dias >= 5 && dias <= 15;
          case 'mas_15': return dias > 15;
          default: return true;
        }
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, dateRange, diasFilter]);

  const handleBuscarEmpleado = (value) => {
    const nombresValidos = empleados
      .filter((emp) => emp.nombreCompleto?.trim())
      .map((emp) => emp.nombreCompleto.trim());

    const nombresUnicos = [...new Set(nombresValidos)].sort((a, b) => a.localeCompare(b));

    const filtrados = nombresUnicos
      .filter((nombre) => nombre.toLowerCase().includes(value.toLowerCase()))
      .map((nombre) => ({ value: nombre }));

    setOpciones(filtrados);
  };

  const handleAddRecord = () => {
    form.validateFields().then(async (values) => {
      // Buscar empleado por nombre
      const empleado = empleados.find((emp) => emp.nombreCompleto === values.Asesor);
      if (!empleado) {
        form.setFields([{ name: "Asesor", errors: ["Asesor no válido"] }]);
        return;
      }

      // Validar rango de fechas
      if (!values.rangoFechas || values.rangoFechas.length !== 2) {
        form.setFields([{ name: "rangoFechas", errors: ["Rango de fechas inválido"] }]);
        return;
      }

      const [fechaInicio, fechaFin] = values.rangoFechas;

      // Validar que fechas sean válidas
      if (!fechaInicio.isValid() || !fechaFin.isValid()) {
        form.setFields([{ name: "rangoFechas", errors: ["Fechas inválidas"] }]);
        return;
      }

      const cantDias = fechaFin.diff(fechaInicio, "day") + 1;
      if (cantDias > 30) {
        form.setFields([{ name: "rangoFechas", errors: ["Cantidad maxima de dias 30"] }]);
        return;
      }
      const newRecord = {
        fecInicio: fechaInicio.format("YYYY-MM-DD"),
        fecFin: fechaFin.format("YYYY-MM-DD"),
        idEmpleado: empleado.idEmpleado,
        usuario: nombre,
        alias: empleado.nombreCompleto,
        documento: empleado.documento,
        tipoDM: values.TipoDM,
        tieneCITT: values.TIENE_CITT,
        citt: values.CITT,
        diagnostico: values.diagnostico,
        totalDiasDescansoMedico: empleado.totalDiasDescansoMedico,
        cantDias: cantDias
      };
      console.log("Nuevo registro:", newRecord);
      setDataEnviar(newRecord);
      setIsModalVisible(false);
      setIsModalConfirmar(true);
    }).catch(err => {
      console.error("Error al validar:", err);
    });
  };

  const confirmDelete = async () => {
    setIsDeleteModalVisible(false);
    setIsLoading(true);

    try {
      const cuerpo = {
        id: recordToDelete.idAusenciasLaborables,
        idEmpleado: recordToDelete.idEmpleado,
        usuario: nombre
      };
      console.log("Cuerpo de la solicitud de eliminación:", cuerpo);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/eliminarDescansoMedico`,
        cuerpo
      );

      // Actualizar la lista
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarDescansosMedicos`
      );
      const sortedData = response.data.data.sort((a, b) => b.fecha_inicio?.localeCompare(a.fecha_inicio) || 0);
      setData(sortedData);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const Confirmar = async () => {
    setIsModalConfirmar(false);
    setIsLoading(true);

    try {
      const sumaDias = dataEnviar.totalDiasDescansoMedico + dataEnviar.cantDias;
      console.log("Valor total de días:", sumaDias);

      const cuerpoBase = {
        idEmpleado: dataEnviar.idEmpleado,
        fecInicio: dataEnviar.fecInicio,
        fecFin: dataEnviar.fecFin,
        usuario: dataEnviar.usuario,
        texto_json: {
          Tipo: dataEnviar.tipoDM,
          TipoAtencion: dataEnviar.tieneCITT ? "CITT" : "Particular",
          NroCITT: dataEnviar.citt,
          Diagnostico: dataEnviar.diagnostico,
        },
      };

      // Función para formatear fecha a YYYY-MM-DD
      function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // Función para generar el codMes (01-MM-YYYY)
      function generateCodMes(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `01-${month}-${year}`;
      }

      // Función para dividir un período en múltiples registros por mes
      // Función para dividir un período en múltiples registros por mes
      function splitPeriodByMonth(startDate, endDate, tipo) {
        const result = [];
        let currentStart = new Date(startDate);
        const finalEnd = new Date(endDate);

        while (currentStart <= finalEnd) {
          const currentMonth = currentStart.getMonth();
          const currentYear = currentStart.getFullYear();

          // Encontrar el último día del mes actual
          const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
          const periodEnd = new Date(Math.min(lastDayOfMonth, finalEnd));

          // Calcular días del período
          const diffTime = periodEnd - currentStart;
          let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días

          // Verificar si el periodo termina en el último día del mes
          const isLastDayOfMonth = periodEnd.getDate() === lastDayOfMonth.getDate();

          // Si es el último día del mes, sumamos 1 día adicional
          if (isLastDayOfMonth) {
            diffDays += 1;
          }

          // Crear registro
          const registro = {
            idEmpleado: dataEnviar.idEmpleado,
            fecInicio: formatDate(currentStart),
            fecFin: formatDate(periodEnd),
            numDias: diffDays,
            usuario: dataEnviar.usuario,
            codMes: generateCodMes(currentStart),
            texto_json: {
              ...cuerpoBase.texto_json,
              ...(tipo === 'subsidio' ? { TipoSubsidio: dataEnviar.tipoDM } : {})
            }
          };

          result.push(registro);

          // Mover al primer día del siguiente mes
          currentStart = new Date(currentYear, currentMonth + 1, 1);
        }

        return result;
      }

      if (sumaDias > 20) {
        // Caso cuando excede los 20 días (parte a DM y parte a subsidio)
        const diasDM = 20 - dataEnviar.totalDiasDescansoMedico;
        // Convertir fechas a objetos Date para manipulación
        const fechaInicioDM = new Date(dataEnviar.fecInicio);
        fechaInicioDM.setDate(fechaInicioDM.getDate() + 1);
        const fechaFinDM = new Date(fechaInicioDM);
        fechaFinDM.setDate(fechaInicioDM.getDate() + diasDM - 1);
        console.log("Fecha inicio DM:", fechaInicioDM);
        console.log("Fecha fin DM:", fechaFinDM);
        // Fechas para el subsidio (empieza al día siguiente del fin del DM)
        const fechaInicioSubsidio = new Date(fechaFinDM);
        fechaInicioSubsidio.setDate(fechaFinDM.getDate() + 1);
        const fechaFinSubsidio = new Date(dataEnviar.fecFin);
        fechaFinSubsidio.setDate(fechaFinSubsidio.getDate() + 1);

        // Dividir períodos por mes
        const registrosDM = splitPeriodByMonth(fechaInicioDM, fechaFinDM, 'dm');
        const registrosSubsidio = splitPeriodByMonth(fechaInicioSubsidio, fechaFinSubsidio, 'subsidio');

        console.log("Registros DM:", registrosDM);
        console.log("Registros Subsidio:", registrosSubsidio);

        // Ejecutar peticiones para todos los registros
        const requestsDM = registrosDM.map(registro =>
          axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/registrarDescansoMedico`,
            {
              ...registro,
              texto_json: JSON.stringify(registro.texto_json)
            }
          )
        );

        const requestsSubsidio = registrosSubsidio.map(registro =>
          axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/registrarSubsidio`,
            {
              ...registro,
              texto_json: JSON.stringify(registro.texto_json)
            }
          )
        );

        const responses = await Promise.all([...requestsDM, ...requestsSubsidio]);

        // Verificar todas las respuestas
        const allSuccess = responses.every(response => response.status === 200);
        if (allSuccess) {
          await actualizarListado();
        } else {
          throw new Error("Error en una de las respuestas");
        }
      } else {
        // Caso cuando no excede los 20 días (solo DM)
        const fechaInicioDM = new Date(dataEnviar.fecInicio);
        fechaInicioDM.setDate(fechaInicioDM.getDate() + 1);
        const fechaFinDM = new Date(dataEnviar.fecFin);
        fechaFinDM.setDate(fechaFinDM.getDate() + 1);

        // Dividir período por mes
        const registrosDM = splitPeriodByMonth(fechaInicioDM, fechaFinDM, 'dm');
        console.log("Registros DM:", registrosDM);

        // Ejecutar peticiones para todos los registros
        const requests = registrosDM.map(registro =>
          axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/registrarDescansoMedico`,
            {
              ...registro,
              texto_json: JSON.stringify(registro.texto_json)
            }
          )
        );
        const responses = await Promise.all(requests);
        // Verificar todas las respuestas
        const allSuccess = responses.every(response => response.status === 200);
        if (allSuccess) {
          await actualizarListado();
        } else {
          throw new Error("Error en una de las respuestas");
        }
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función auxiliar para actualizar el listado
  const actualizarListado = async () => {
    try {
      const updatedResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarDescansosMedicos`
      );
      const sortedData = updatedResponse.data.data.sort((a, b) => b.fecha_inicio?.localeCompare(a.fecha_inicio) || 0);
      const updateEmpleados = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarEmpleadosParaDM`
      );
      setData(sortedData);
      setEmpleados(updateEmpleados.data.data);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      form.resetFields();
      setTieneCITT(false);
    } catch (error) {
      console.error("Error al actualizar listado:", error);
      throw error; // Relanzamos el error para manejarlo en el catch principal
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateRange([]);
    setDiasFilter(null);
  };

  const Limpieza = () => {
    setSearchTerm("");
    setDateRange([]);
    setDiasFilter(null);
    form.resetFields();
    setTieneCITT(false);
    setIsModalVisible(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const diasOptions = [
    { value: null, label: "Todos los días" },
    { value: "menos_5", label: "Menos de 5 días" },
    { value: "5_15", label: "5 a 15 días" },
    { value: "mas_15", label: "Más de 15 días" },
  ];

  // Manejo del checkbox
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setTieneCITT(isChecked);
    form.setFieldsValue({
      TIENE_CITT: isChecked,
      CITT: isChecked ? form.getFieldValue('CITT') : undefined
    });
  };

  const prepareDeleteLicense = (license) => {
    setRecordToDelete(license);
    setIsDeleteModalVisible(true);
  };

  const prepareEditLicense = (license) => {
    setRecordToDelete(license);
    editForm.setFieldsValue({
      TipoAtencion: license.TipoAtencion,
      NroCITT: license.NroCITT
    });
    console.log("Datos para editar:", license);
    setIsEditModalVisible(true);
  };

  const prepareViewLicense = (license) => {
    setRecordToView(license);
    setIsViewModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setIsEditModalVisible(false);
      setIsLoading(true);

      const cuerpo = {
        id: recordToDelete.idAusenciasLaborables,
        idEmpleado: recordToDelete.idEmpleado,
        usuario: nombre,
        tipoAtencion: values.TipoAtencion,
        nroCITT: values.TipoAtencion === "CITT" ? values.NroCITT : null
      };
      console.log("Datos para actualizar:", cuerpo);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/editarDescansoMedico`, cuerpo)
        .then(response => {
          if (response.status === 200) {
            // Actualizar la lista
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarDescansosMedicos`)
              .then(res => {
                const sortedData = res.data.data;
                setData(sortedData);
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);
              });
          }
        })
        .catch(error => {
          console.error("Error al actualizar:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (err) {
      console.error("Error al validar:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-3xl font-semibold mb-6 bg-clip-text text-black"
      >
        Descansos Médicos
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-8xl mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="relative flex items-center">
              <Input
                placeholder="Buscar por nombre o DNI"
                prefix={<Search className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <DatePicker.RangePicker
              onChange={setDateRange}
              value={dateRange}
              format="DD/MM/YYYY"
              className="w-full rounded-lg"
              placeholder={["Fecha inicio", "Fecha fin"]}
            />

            <Select
              placeholder="Filtrar por días"
              options={diasOptions}
              value={diasFilter}
              onChange={setDiasFilter}
              className="w-full rounded-lg"
            />
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar
            </Button>
            <Button
              disabled={filteredData.length === 0}
              onClick={() => {
                const nuevaData = filteredData.map(({ idAusenciasLaborables, idEmpleado, dias_acoplados, Flag_ultimo, ...rest }) => {
                  return {
                    ...rest,
                    fecha_inicio: rest.fecha_inicio.split("T")[0],
                    fecha_fin: rest.fecha_fin.split("T")[0],
                  }
                });
                exportToExcel(nuevaData, "LISTA DE DESCANSOS MÉDICOS")
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4" />
              Descargar Excel
            </Button>
            <Button
              onClick={() => setIsModalVisible(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </Button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full overflow-x-auto"
        >
          <div className="overflow-y-auto max-h-[70vh] rounded-lg border border-gray-200 dark:border-gray-700 shadow">
            <table className="min-w-full border-collapse">
              <thead >
                <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                  <th className="w-60 text-center text-sm font-medium">NOMBRE COMPLETO</th>
                  <th className="p-2 text-center text-sm font-medium">DOCUMENTO</th>
                  <th className="p-1 text-center text-sm font-medium">TIPO D.M.</th>
                  <th className="px-1 text-center text-sm font-medium">TIPO ATENCION</th>
                  <th className="px-4 text-center text-sm font-medium">NUM. CITT</th>
                  <th className="p-1 text-center text-sm font-medium">FECHA INICIO</th>
                  <th className="p-1 text-center text-sm font-medium">FECHA FIN</th>
                  <th className="p-1 text-center text-sm font-medium">NUM. DIAS</th>
                  <th className="p-1 text-center text-sm font-medium">DIAS ACOPLADOS</th>
                  <th className="text-center text-sm font-medium">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <motion.tr
                      key={`${item.documento}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.nombreCompleto || "---"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.documento || "---"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.Tipo || "---"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.TipoAtencion || "----"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.NroCITT || "----"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.fecha_inicio.split("T")[0].split("-").reverse().join("/") || "SN"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.fecha_fin.split("T")[0].split("-").reverse().join("/") || "SN"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.numDias || "---"} DIAS</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center text-sm">{item.dias_acoplados || "0"}</td>
                      <td className="p-1 border-b border-gray-200 dark:border-gray-700 text-center">
                        <div className="grid grid-cols-3 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver"
                            onClick={() => prepareViewLicense(item)}
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            disabled={true}
                            onClick={() => prepareEditLicense(item)}
                          >
                            <Pencil className="h-4 w-4 text-green-500" />
                          </Button>
                          {item.Flag_ultimo === 1 ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar"
                              disabled={true}
                              onClick={() => prepareDeleteLicense(item)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <div> </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-4 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
      {/* Modal de Registro */}
      <Modal
        title={
          <p className="text-center text-xl font-bold text-slate-600">
            Registrar Descanso Médico
          </p>
        }
        open={isModalVisible}
        onCancel={Limpieza}
        onOk={handleAddRecord}
        okText="Confirmar"
        cancelText="Cancelar"
        className="-translate-y-10"
        okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Form.Item
            name="Asesor"
            label={<span className="font-medium">Empleado</span>}
            rules={[{ required: true, message: "Seleccione un empleado" }]}
          >
            <AutoComplete
              options={opciones}
              onSearch={handleBuscarEmpleado}
              onSelect={(value) => {
                form.setFieldValue("Asesor", value);
                const empleado = empleados.find((emp) => emp.nombreCompleto === value);
                if (empleado) {
                  form.setFieldValue("DNI", empleado.documento);
                  form.setFieldValue("totalDias", empleado.totalDiasDescansoMedico);
                }
              }}
              placeholder="Buscar empleado"
              className="rounded-lg"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="TipoDM"
              label={<span className="font-medium">Tipo De Descanso Médico</span>}
              rules={[{ required: true, message: "Seleccione un tipo de descanso médico" }]}
            >
              <Select
                options={[
                  { value: "Enfermedad", label: "Enfermedad" },
                  { value: "Accidente común", label: "Accidente común" },
                  { value: "Accidente trabajo", label: "Accidente trabajo" },
                ]}
                placeholder="Seleccione tipo de descanso médico"
                className="w-full rounded-lg"
              />
            </Form.Item>

            <div className="flex flex-col">
              <Form.Item
                name="CITT"
                label={
                  <Checkbox
                    checked={tieneCITT}
                    onChange={handleCheckboxChange}
                  >
                    <span className="font-medium">Tiene CITT</span>
                  </Checkbox>
                }
                rules={[
                  {
                    validator: (_, value) => {
                      if (tieneCITT && !value) {
                        return Promise.reject('Ingrese el CITT');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input
                  placeholder="Ingrese el CITT"
                  className="rounded-lg mt-2"
                  disabled={!tieneCITT}
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="rangoFechas"
            label={<span className="font-medium">Rango de Fechas</span>}
            rules={[{ required: true, message: "Seleccione un rango de fechas" }]}
          >
            <DatePicker.RangePicker
              className="w-full rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="diagnostico"
            label={<span className="font-medium">Diagnóstico Médico</span>}
            rules={[{ required: true, message: "Ingrese el diagnóstico médico" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Ingrese el diagnóstico médico"
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Confirmación REGISTRAR */}
      <Modal
        title={
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl text-center pb-4 font-bold text-slate-700"
          >
            Confirmar Registro
          </motion.p>
        }
        open={isModalConfirmar}
        onCancel={() => {
          setIsModalConfirmar(false);
          setIsModalVisible(true);
        }}
        onOk={Confirmar}
        okText="Confirmar"
        cancelText="Cancelar"
        okButtonProps={{
          className: "bg-green-500 hover:bg-green-600 h-10 px-6",
          style: { transition: "all 0.3s" }
        }}
        cancelButtonProps={{
          className: "h-10 px-6",
          style: { transition: "all 0.3s" }
        }}
        width={800}
        bodyStyle={{ padding: "24px" }}
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="grid grid-cols-3 gap-4"
        >
          {/* Empleado */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Empleado</span>
            <motion.span
              whileHover={hoverEffect}
              className="text-base font-medium text-slate-600 "
            >
              {dataEnviar.alias}
            </motion.span>
          </motion.div>
          {/* Tipo DM */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Tipo DM</span>
            <motion.span
              whileHover={hoverEffect}
              className="text-base font-medium text-slate-600"
            >
              {dataEnviar.tipoDM}
            </motion.span>
            {/* Fechas */}
          </motion.div>
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Fecha Inicio</span>
            <motion.span
              whileHover={{ x: 5 }}
              className="text-base font-bold text-cyan-500"
            >
              {dayjs(dataEnviar.fecInicio).format("DD/MM/YYYY")}
            </motion.span>
          </motion.div>
          {/* DNI */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">DNI</span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-base font-mono text-gray-700"
            >
              {dataEnviar.documento}
            </motion.span>
          </motion.div>



          {/* Tipo atención */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Tipo atención</span>
            <motion.span
              whileHover={{ scale: 1.03 }}
              className={`text-base font-semibold ${dataEnviar.citt ? "text-green-600" : "text-red-600"
                }`}
            >
              {dataEnviar.citt ? `CITT - ${dataEnviar.citt}` : "PARTICULAR"}
            </motion.span>
          </motion.div>
          {/* Fecha Fin */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Fecha Fin</span>
            <motion.span
              whileHover={{ x: 5 }}
              className="text-base font-bold text-cyan-500"
            >
              {dayjs(dataEnviar.fecFin).format("DD/MM/YYYY")}
            </motion.span>
          </motion.div>
          {/* Días */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Días Totales </span>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className=" rounded-lg"
            >
              {dataEnviar.cantDias + dataEnviar.totalDiasDescansoMedico > 20 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <motion.span className="flex items-center text-orange-800">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {dataEnviar.cantDias} días Totales
                  </motion.span>
                  <motion.span className="flex items-center text-blue-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {20 - dataEnviar.totalDiasDescansoMedico} días de Descanso Médico
                  </motion.span>
                  <motion.span className="flex items-center text-red-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {dataEnviar.cantDias - (20 - dataEnviar.totalDiasDescansoMedico)} días de Subsidios
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <motion.span className="flex items-center text-neutral-700">
                    <span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>
                    {dataEnviar.cantDias} días de Descanso Médico
                  </motion.span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          {/* Diagnóstico */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Total de días pre Registrados</span>
            <motion.div
              whileHover={{ backgroundColor: "#EFF6FF" }}
              className="rounded-lg"
            >
              <span className="text-gray-700 italic">{dataEnviar.totalDiasDescansoMedico} días Registrados</span>
            </motion.div>
          </motion.div>
          {/* Diagnóstico */}
          <motion.div variants={item} className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">Diagnóstico</span>
            <motion.div
              whileHover={{ backgroundColor: "#EFF6FF" }}
              className="rounded-lg"
            >
              <span className="text-gray-700 italic">{dataEnviar.diagnostico}</span>
            </motion.div>
          </motion.div>

        </motion.div>
      </Modal>

      {/* Modal de Confirmación ELIMINAR */}
      <Modal
        title={
          <p className="text-center text-xl font-bold text-red-600">
            Confirmar Eliminación
          </p>
        }
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={confirmDelete}
        className="-translate-y-16"
        okText="Eliminar"
        okButtonProps={{ danger: true }}
        cancelText="Cancelar"
        width={500}
      >
        <div className="space-y-4">
          <p className="text-center text-sm mb-4">¿Estás seguro de que deseas eliminar este Descanso Médico?</p>

          {recordToDelete && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="Empleado" className="block text-sm font-medium text-gray-500">Empleado</label>
                  <p className="text-sm font-semibold">{recordToDelete.nombreCompleto}</p>
                </div>
                <div>
                  <label htmlFor="Documento" className="block text-sm font-medium text-gray-500">Documento</label>
                  <p className="text-sm font-semibold">{recordToDelete.documento}</p>
                </div>
                <div>
                  <label htmlFor="TipoDescanso" className="block text-sm font-medium text-gray-500">Tipo de Descanso</label>
                  <p className="text-sm font-semibold">{recordToDelete.Tipo || '---'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tipo de Atención</label>
                  <p className="text-sm font-semibold">{recordToDelete.TipoAtencion || "---"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha Inicio</label>
                  <p className="text-sm font-semibold">{formatDate(recordToDelete.fecha_inicio)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha Fin</label>
                  <p className="text-sm font-semibold">{formatDate(recordToDelete.fecha_fin)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Días</label>
                  <p className="text-sm font-semibold text-red-600">{recordToDelete.numDias} días</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Diagnóstico</label>
                  <p className="text-sm font-semibold">{recordToDelete.Diagnostico || '---'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-red-50 rounded">
            <p className="text-sm text-red-700">
              <strong>Advertencia:</strong> Esta acción no se puede deshacer. El descanso médico será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title={
          <p className="text-center text-xl font-bold text-blue-600">
            EDITAR TIPO DE ATENCIÓN
          </p>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Guardar Cambios"
        cancelText="Cancelar"
        okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
        width={500}
      >
        <Form form={editForm} layout="vertical" className="mt-6">
          <Form.Item
            name="TipoAtencion"
            label={<span className="font-medium">Tipo de Atención</span>}
            rules={[{ required: true, message: "Seleccione un tipo de atención" }]}
          >
            <Select
              options={[
                {
                  value: "CITT",
                  label: "CITT",
                  disabled: false
                },
                {
                  value: "Particular",
                  label: "Particular",
                  disabled: recordToDelete?.TipoAtencion !== "CITT"
                }
              ]}
              placeholder="Seleccione tipo de atención"
              className="w-full rounded-lg"
              defaultValue={recordToDelete?.TipoAtencion || "CITT"}
              onChange={(value) => {
                console.log("Tipo de atención seleccionado:", value);
              }}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.TipoAtencion !== currentValues.TipoAtencion}
          >
            {({ getFieldValue }) => (
              getFieldValue("TipoAtencion") === "CITT" ? (
                <Form.Item
                  name="NroCITT"
                  label={<span className="font-medium">Número CITT</span>}
                  rules={[{ required: true, message: "Ingrese el número CITT" }]}
                >
                  <Input
                    placeholder="Ingrese el número CITT"
                    className="rounded-lg"
                  />
                </Form.Item>
              ) : null
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Visualización */}
      <Modal
        title={
          <p className="text-center text-xl font-bold text-slate-600">
            Detalle del Descanso Médico
          </p>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        className="-translate-y-10 dark:[&_.ant-modal-content]:bg-gray-800"
        footer={null}
        width={800}
      >
        {recordToView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Columna 1 - Datos personales */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Empleado</label>
                  <p className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {recordToView.nombreCompleto}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Documento</label>
                  <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    {recordToView.documento}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Días Acoplados</label>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {recordToView.dias_acoplados || '0'}
                  </p>
                </div>
              </motion.div>

              {/* Columna 2 - Detalles médicos */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Tipo de Descanso</label>
                  <p className="text-md font-semibold ">
                    {recordToView.Tipo}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Tipo de Atención</label>
                  <div className="mt-1">
                    {recordToView.TipoAtencion === "CITT" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        <DiffOutlined className="h-4 w-4 mr-1" /> CITT
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        <User className="h-4 w-4 mr-1" /> PARTICULAR
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Número CITT</label>
                  <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    {recordToView.NroCITT || (
                      <span className="text-gray-400 dark:text-gray-400 italic">No aplica</span>
                    )}
                  </p>
                </div>
              </motion.div>

              {/* Columna 3 - Fechas y duración */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Fecha Inicio</label>
                  <div className="flex items-center text-cyan-600 ">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    <span className="text-md font-semibold">{recordToView.fecha_inicio.split("T")[0].split("-").reverse().join("/")}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Fecha Fin</label>
                  <div className="flex items-center text-cyan-600">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    <span className="text-md font-semibold">{recordToView.fecha_fin.split("T")[0].split("-").reverse().join("/")}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Duración Total</label>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400 animate-pulse">
                      {recordToView.numDias} días
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Diagnóstico - Full width debajo de las columnas */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-2"
            >
              <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-2">Diagnóstico Médico</label>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {recordToView.Diagnostico || (
                      <span className="text-gray-400 dark:text-gray-400 italic">No se registró diagnóstico médico</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </Modal>
      {/*
      <Dialog open={isLoading}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-blue-600">Procesando...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent"
            />
            <p className="mt-4 text-blue-600 font-medium animate-pulse">
              Por favor espere...
            </p>
          </div>
        </DialogContent>
      </Dialog>*/}

      {/* Modal de Éxito */}
      <Modal
        title={null}
        open={isSuccess}
        width={400}
        footer={null}
      >
        <CompResultado tipo="success" titulo={<span>Operación exitosa</span>} mensaje={<span>Descanso médico actualizado correctamente.</span>} />
      </Modal>
    </div>
  );
};

export const DescansoMedico = () => {
  return <DescansoMedicoTable />;
};