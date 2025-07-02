import { Search, RefreshCw, Trash, Eye, SquarePen, Pencil, CalendarDays, Clock, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Input, Modal, Form, DatePicker, AutoComplete, Select, Tag, Checkbox } from "antd";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useData } from "@/provider/Provider";
import axios from "axios";
import { motion } from "framer-motion";
import { CompResultado } from "@/components/CompSucces";
import { DiffOutlined } from "@ant-design/icons";
dayjs.locale("es");

export const ListarSubsidios = () => {
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
  const [tiposAtencion, setTiposAtencion] = useState(null);
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
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarEmpleadosParaSubsidios`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarSubsidios`)
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
    console.log(diasFilter)
    // Filtro por días
    if (diasFilter) {
      result = result.filter(item => item.Tipo === diasFilter);
    }

    // Filtro por tipos de atención
    if (tiposAtencion) {
      result = result.filter(item => item.TipoAtencion === tiposAtencion);
    }

    setFilteredData(result);
  }, [data, searchTerm, dateRange, diasFilter, tiposAtencion]);

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
      const empleado = empleados.find((emp) => emp.nombreCompleto === values.Asesor);
      if (!empleado) {
        form.setFields([{ name: "Asesor", errors: ["Asesor no válido"] }]);
        return;
      }

      const [fechaInicio, fechaFin] = values.rangoFechas;
      const cantDias = fechaFin.diff(fechaInicio, "day") + 1;

      const newRecord = {
        fecInicio: fechaInicio.format("YYYY-MM-DD"),
        fecFin: fechaFin.format("YYYY-MM-DD"),
        cantDias: cantDias.toString(),
        idEmpleado: empleado.idEmpleado,
        usuario: nombre,
        alias: empleado.nombreCompleto,
        documento: empleado.documento,
        tipoDM: values.TipoDM,
        tieneCITT: values.TIENE_CITT,
        citt: values.CITT,
        diagnostico: values.diagnostico
      };

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
        `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarSubsidios`
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
    const cuerpo = {
      idEmpleado: dataEnviar.idEmpleado,
      fecInicio: dataEnviar.fecInicio,
      fecFin: dataEnviar.fecFin,
      numDias: dataEnviar.cantDias,
      usuario: dataEnviar.usuario,
      texto_json: {
        Tipo: dataEnviar.tipoDM,
        TipoAtencion: dataEnviar.tieneCITT ? "CITT" : "PARTICULAR",
        NroCITT: dataEnviar.citt,
        Diagnostico: dataEnviar.diagnostico,
      },
    }
    console.log("Cuerpo de la solicitud:", cuerpo);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/registrarDescansoMedico`,
        {
          ...cuerpo,
          texto_json: JSON.stringify(cuerpo.texto_json)
        }
      );

      if (response.status === 200) {
        // Actualizar la lista
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarSubsidios`
        );
        const sortedData = updatedResponse.data.data.sort((a, b) => b.fecha_inicio?.localeCompare(a.fecha_inicio) || 0);
        setData(sortedData);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
        form.resetFields();
        setTieneCITT(false);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateRange([]);
    setDiasFilter(null);
    setTiposAtencion(null);
  };

  const Limpieza = () => {
    setSearchTerm("");
    setDateRange([]);
    setTiposAtencion(null);
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
    { value: null, label: "Todos los tipos de subsidios" },
    { value: "Maternidad", label: "Maternidad" },
    { value: "Enfermedad", label: "Enfermedad" },
    { value: "Accidente común", label: "Accidente común" },
    { value: "Accidente trabajo", label: "Accidente trabajo" },
  ];
  const TiposAtencion = [
    { value: null, label: "Todos los tipos de atención" },
    { value: "Particular", label: "Particular" },
    { value: "CITT", label: "CITT" },
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
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarSubsidios`)
              .then(res => {
                const sortedData = res.data.data.sort((a, b) => b.fecha_inicio?.localeCompare(a.fecha_inicio) || 0);
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
        className="text-center text-2xl font-semibold mb-6 bg-clip-text text-black"
      >
        LISTAR SUBSIDIOS
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-8xl mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
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
              placeholder="Filtrar por tipo de subsidio"
              options={diasOptions}
              value={diasFilter}
              onChange={setDiasFilter}
              className="w-full rounded-lg"
            />

            <Select
              placeholder="Filtrar por tipo de atención"
              options={TiposAtencion}
              value={tiposAtencion}
              onChange={setTiposAtencion}
              className="w-full rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar
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
                  <th className="p-1 text-center text-sm font-medium">TIPO SUB.</th>
                  <th className="px-1 text-center text-sm font-medium">TIPO ATENCIÓN</th>
                  <th className="px-4 text-center text-sm font-medium">NUM. CITT</th>
                  <th className="p-1 text-center text-sm font-medium">FECHA INICIO</th>
                  <th className="p-1 text-center text-sm font-medium">FECHA FIN</th>
                  <th className="p-1 text-center text-sm font-medium">NUM. DIAS</th>
                  <th className="p-1 text-center text-sm font-medium">DIAS ACOPLADOS</th>
                  <th className="text-center text-sm font-medium">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
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
                            onClick={() => prepareEditLicense(item)}
                          >
                            <Pencil className="h-4 w-4 text-green-500" />
                          </Button>
                          {
                            item.Flag_ultimo === 1 ? (<Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar"
                              onClick={() => prepareDeleteLicense(item)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>) : (<div></div>)
                          }

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
                  { value: "Accidente Común", label: "Accidente Común" },
                  { value: "Accidente Trabajo", label: "Accidente de Trabajo" },
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
          <p className="text-xl text-center pb-4 font-bold text-slate-600">
            Confirmar Registro
          </p>
        }
        open={isModalConfirmar}
        onCancel={() => {
          setIsModalConfirmar(false)
          setIsModalVisible(true);
        }}
        onOk={Confirmar}
        okText="Confirmar"
        cancelText="Cancelar"
        okButtonProps={{ className: "bg-green-500 hover:bg-green-600" }}
        width={500}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col ">
            <span className="font-semibold">Empleado:</span>
            <span>{dataEnviar.alias}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">DNI:</span>
            <span>{dataEnviar.documento}</span>
          </div>
          <div className="flex flex-col ">
            <span className="font-semibold">Fecha Inicio:</span>
            <span>{dayjs(dataEnviar.fecInicio).format("DD/MM/YYYY")}</span>
          </div>
          <div className="flex flex-col ">
            <span className="font-semibold">Fecha Fin:</span>
            <span>{dayjs(dataEnviar.fecFin).format("DD/MM/YYYY")}</span>
          </div>
          <div className="flex flex-col ">
            <span className="font-semibold">Tipo de Descanso Medico:</span>
            <span>{dataEnviar.tipoDM}</span>
          </div>
          <div className="flex flex-col ">
            <span className="font-semibold">Tipo atención</span>
            <span>{dataEnviar.tieneCITT ? "CITT" : "PARTICULAR"}</span>
          </div>
          <div className="flex flex-col ">
            <span className="font-semibold text-red-500">Días:</span>
            <span className="text-red-500">{dataEnviar.cantDias} días</span>
          </div>
          {dataEnviar.tieneCITT && (
            <div className="flex flex-col ">
              <span className="font-semibold">CITT:</span>
              <span>{dataEnviar.citt}</span>
            </div>
          )}
          <div className="flex flex-col ">
            <span className="font-semibold">Diagnostico Medico:</span>
            <span>{dataEnviar.diagnostico}</span>
          </div>
        </div>
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
                  <label className="block text-sm font-medium text-gray-500">Empleado</label>
                  <p className="text-sm font-semibold">{recordToDelete.nombreCompleto}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Documento</label>
                  <p className="text-sm font-semibold">{recordToDelete.documento}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tipo de Descanso</label>
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
                  value: "PARTICULAR",
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
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Diagnóstico Médico</label>
                  <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    {recordToView.Diagnostico || (
                      <span className="text-gray-400 dark:text-gray-400 italic">No se registró diagnóstico médico</span>
                    )}
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
                      <span className="text-gray-400 dark:text-gray-400 italic">No tiene</span>
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
                    <span className="text-md font-semibold">{formatDate(recordToView.fecha_inicio)}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Fecha Fin</label>
                  <div className="flex items-center text-cyan-600">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    <span className="text-md font-semibold">{formatDate(recordToView.fecha_fin)}</span>
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
      {/* Overlay de carga */}
      <Modal
        title={null}
        open={isLoading}
        width={400}
        footer={null}
      >
        <CompResultado tipo="loading" titulo={<span>Procesando solicitud</span>} mensaje={<span>Por favor espere...</span>} />
      </Modal>
    </div>
  );
};
