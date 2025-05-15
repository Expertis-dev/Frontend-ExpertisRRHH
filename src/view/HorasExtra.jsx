"use client"
import { Upload, AutoComplete, Modal, DatePicker, TimePicker, notification, Spin } from 'antd';
import { ToTopOutlined, InboxOutlined, PlusCircleOutlined, InfoCircleOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Check, Loader2, Search, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from 'dayjs';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from 'react';
import { useData } from '@/provider/Provider';
import axios from 'axios';
const { Dragger } = Upload;
export const HorasExtra = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [isCargaMaziva, setIsCargaMaziva] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [error, setError] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState({})
  const { nombre } = useData()
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
  })

  // Datos de ejemplo para la tabla
  const [overtimeData, setOvertimeData] = useState([])
  const formatTime = (timeString) => {
    if (!timeString) return "---";
    return timeString.split("T")[1].substring(0, 5);
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  // Obtener empleados desde el API
  const ObtenerEmpleados = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`);
      if (response.status === 200) {
        const empleadosActivos = response.data.recordset
          .filter(empleado => empleado.estadoLaboral === "VIGENTE")
          .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

        setEmpleados(empleadosActivos);
        setEmpleadosFiltrados(empleadosActivos.map(emp => ({
          value: emp.nombreCompleto,
          label: emp.nombreCompleto,
          ...emp // Incluir todos los datos del empleado
        })));
      }
    } catch (err) {
      console.error("Error al obtener empleados:", err);
      setError("No se pudieron cargar los empleados");
    }
  };
  const ObtenerHorasExtra = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/horasExtra/mostrarHorasExtra`);
      if (response.status === 200) {
        const horasExtra = response.data.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
        console.log(horasExtra)

        setFilteredData(horasExtra);
        setOvertimeData(horasExtra);
      }
    } catch (err) {
      console.error("Error al obtener horas extra:", err);
      setError("No se pudieron cargar las horas extra");
    }
  }

  useEffect(() => {
    ObtenerEmpleados();
    ObtenerHorasExtra();
  }, []);

  // Validar formulario cuando cambian los datos
  useEffect(() => {
    const { nombreCompleto, fecha, horaInicio, horaFin } = formData
    setFormIsValid(
      nombreCompleto !== "" &&
      fecha !== "" &&
      horaInicio !== "" &&
      horaFin !== "" &&
      new Date(`2000-01-01T${horaFin}`) > new Date(`2000-01-01T${horaInicio}`)
    )
  }, [formData])

  const props = {
    name: "file",
    multiple: false,
    accept: ".xls,.xlsx",
    fileList: fileList,
    beforeUpload(file) {
      const isExcel =
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        console.log("Solo se permiten archivos Excel (.xls, .xlsx)");
      } else {
        setFile(file);
        setFileList([file]); // solo un archivo
      }
      return false; // Evita la subida automática
    },
    onRemove() {
      setFile(null);
      setFileList([]);
    },
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    if (searchQuery === "") {
      setFilteredData(overtimeData)
    } else {
      const results = overtimeData.filter(item =>
        item.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.documento.toLowerCase().includes(searchQuery)
      )
      setFilteredData(results)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddClick = () => {
    setFormData({
      nombreCompleto: "",
      fecha: "",
      horaInicio: "",
      horaFin: "",
    });
    setIsAddModalOpen(true)
  }

  const handleAddSubmit = () => {
    setIsAddModalOpen(false)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false)
    setIsLoadingModalOpen(true)

    const inicio = new Date(`2000-01-01T${formData.horaInicio}`);
    const fin = new Date(`2000-01-01T${formData.horaFin}`);
    const diffMs = fin - inicio;
    const diffHoras = diffMs / (1000 * 60 * 60);
    const cuerpo = {
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      cantHoras: parseFloat(diffHoras.toFixed(2)),
      horaFin: formData.horaFin,
      idEmpleado: empleadoSeleccionado.idEmpleado,
      usuario: nombre,
    };
    console.log(cuerpo);
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/horasExtra/registrarHorasExtra`, cuerpo)
    console.log(response)
    if (response.status === 200) {
      console.log("Registro exitoso")
      setIsLoadingModalOpen(false)
      setIsSuccessModalOpen(true)
      setFormData({
        nombreCompleto: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
      })
      setTimeout(() => {
        setIsSuccessModalOpen(false)
        ObtenerHorasExtra()
      }, 1500)
    }
  }

  const handleBuscarEmpleado = (value) => {
    if (!value) {
      setEmpleadosFiltrados(empleados.map(emp => ({
        value: emp.nombreCompleto,
        label: emp.nombreCompleto,
        ...emp
      })));
      return;
    }

    const filtrados = empleados
      .filter(empleado =>
        empleado.nombreCompleto?.toLowerCase().includes(value.toLowerCase()) ||
        empleado.documento?.toLowerCase().includes(value.toLowerCase())
      )
      .map(empleado => ({
        label: empleado.nombreCompleto,
        value: empleado.nombreCompleto,
        ...empleado
      }));

    setEmpleadosFiltrados(filtrados);
  };

  const handleCargaMaziva = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/horasExtra/registrarMazivo`,
        formData
      );

      const data = res.data;
      console.log(data);

    } catch (err) {
      console.error(err);
      messageA.error("Error al comparar");
    }

  }


  return (
    <div className="w-full p-6 max-w-7xl mx-auto">
      {/* Header mejorado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          HORAS EXTRAS REGISTRADAS
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Gestión y registro de horas extras del personal
        </p>
      </motion.div>

      {/* Barra de búsqueda y acciones mejorada */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="relative w-full md:w-96">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o documento"
              className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        </motion.div>


        <motion.div variants={itemVariants} className="relative w-full md:w-96">
          <div className="relative flex items-center justify-end gap-8">
            {/**
             * <Button
              onClick={() => setIsCargaMaziva(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
              <PaperClipOutlined />
              <span>Carga Masiva</span>
            </Button>
             */}
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
            >
              <PlusCircleOutlined className="h-4 w-4" />
              <span>Registrar Horas Extra</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Tabla mejorada */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="overflow-y-auto max-h-[65vh]">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                {['Documento', 'Nombre Completo', 'Fecha', 'Hora Inicio', 'Horas', 'Hora Fin'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((overtime, index) => (
                    <motion.tr
                      key={`${overtime.codEmpleado}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {overtime.documento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {overtime.nombreCompleto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {overtime.fecha?.split("T")[0] || "---"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 dark:text-blue-400 font-medium">
                        {formatTime(overtime.horaInicio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {overtime.cantidadHoras} hrs
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 dark:text-red-400 font-medium">
                        {formatTime(overtime.horaFin)}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No se encontraron resultados
                        </p>
                        <Button
                          variant="ghost"
                          className="mt-2 text-blue-600 dark:text-blue-400"
                          onClick={() => setSearchQuery("")}
                        >
                          Limpiar búsqueda
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal de carga maziva */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <PlusCircleOutlined className="text-blue-500 text-xl" />
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              Registrar Carga Masiva
            </span>
          </div>
        }
        open={isCargaMaziva}
        onCancel={() => setIsCargaMaziva(false)}
        width={650}
        footer={null}
        className="[&_.ant-modal-content]:p-0 dark:[&_.ant-modal-content]:bg-gray-800"
      >
        <div className="p-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* Campos del formulario con animaciones */}
            {[
              {
                label: "Cargar el Archivo *",
                component: (
                  <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Haga clic o arrastre el archivo a esta área para cargarlo
                    </p>
                    <p className="ant-upload-hint">
                      Solo se aceptan archivos Excel (.xls, .xlsx)
                    </p>
                  </Dragger>
                ),
                helpText: "Suba el archivo de Excel con los datos de horas extra"
              }
            ].map((field, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>
                  {field.helpText && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {field.helpText}
                    </span>
                  )}
                </div>
                {field.component}
              </motion.div>
            ))}
            {/* Botones del modal */}
            <motion.div
              variants={itemVariants}
              className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCargaMaziva}
                disabled={!file}
                className={`px-4 py-1 rounded-lg cursor-pointer ${file
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
              >
                <ToTopOutlined className="h-4 w-4" />

                Cargar
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Modal>




      {/* Modal de registro mejorado */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <PlusCircleOutlined className="text-blue-500 text-xl" />
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              Registrar Horas Extra
            </span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        width={650}
        footer={null}
        className="[&_.ant-modal-content]:p-0 dark:[&_.ant-modal-content]:bg-gray-800 -translate-y-14"
      >
        <div className="p-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* Campos del formulario con animaciones */}
            {[
              {
                label: "Empleado *",
                component: (
                  <AutoComplete
                    options={empleadosFiltrados}
                    value={formData.nombreCompleto}
                    onSelect={(value, option) => {
                      setEmpleadoSeleccionado(option);
                      setFormData(prev => ({ ...prev, nombreCompleto: value }));
                    }}
                    onChange={(value) => setFormData(prev => ({ ...prev, nombreCompleto: value }))}
                    onSearch={handleBuscarEmpleado}
                    placeholder="Buscar empleado..."
                    className="w-full"
                    popupClassName="[&_.ant-select-item]:px-4 [&_.ant-select-item]:py-3"
                    notFoundContent={
                      <div className="p-3 text-center text-gray-500">
                        No se encontraron empleados
                      </div>
                    }
                  />
                ),
                helpText: "Busque por nombre completo"
              },
              {
                label: "Fecha *",
                component: (
                  <DatePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    value={formData.fecha ? dayjs(formData.fecha) : null}
                    onChange={(date, dateString) =>
                      setFormData(prev => ({ ...prev, fecha: dateString }))
                    }
                  />
                )
              },
              {
                label: "Hora Inicio *",
                component: (
                  <TimePicker
                    className="w-full"
                    format="HH:mm"
                    minuteStep={10}
                    value={formData.horaInicio ? dayjs(formData.horaInicio, 'HH:mm') : null}
                    onChange={(time, timeString) =>
                      setFormData(prev => ({ ...prev, horaInicio: timeString }))
                    }
                  />
                )
              },
              {
                label: "Hora Fin *",
                component: (
                  <TimePicker
                    className="w-full"
                    format="HH:mm"
                    minuteStep={10}
                    disabled={!formData.horaInicio}
                    value={formData.horaFin ? dayjs(formData.horaFin, 'HH:mm') : null}
                    onChange={(time, timeString) =>
                      setFormData(prev => ({ ...prev, horaFin: timeString }))
                    }
                    disabledTime={() => ({
                      disabledHours: () => {
                        if (!formData.horaInicio) return [];
                        const startHour = parseInt(formData.horaInicio.split(':')[0]);
                        return Array.from({ length: startHour }, (_, i) => i);
                      }
                    })}
                  />
                )
              }
            ].map((field, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>
                  {field.helpText && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {field.helpText}
                    </span>
                  )}
                </div>
                {field.component}
              </motion.div>
            ))}

            {/* Validación de horas */}
            <AnimatePresence>
              {formData.horaInicio && formData.horaFin &&
                new Date(`2000-01-01T${formData.horaFin}`) <= new Date(`2000-01-01T${formData.horaInicio}`) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <Alert
                      variant="destructive"
                      icon={<InfoCircleOutlined />}
                      className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    >
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        La hora de fin debe ser mayor a la hora de inicio
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Botones del modal */}
            <motion.div
              variants={itemVariants}
              className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                disabled={!formIsValid}
                onClick={handleAddSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4" />
                Continuar
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Modal>

      {/* Modal de confirmación */}
      <Modal
        title={<span className="text-xl font-semibold text-gray-800 dark:text-white">Confirmar Registro</span>}
        open={isConfirmModalOpen}
        onCancel={() => {
          setIsConfirmModalOpen(false)
          setIsAddModalOpen(true)
        }}
        onOk={handleConfirmSubmit}
        okText="Confirmar Registro"
        cancelText="Volver"
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700 text-white" }}
        width={600}
        className="dark:[&_.ant-modal-content]:bg-gray-800"
      >
        <div className="py-4 space-y-6">
          <p className="text-center text-gray-600 dark:text-gray-300">
            ¿Está seguro de registrar las siguientes horas extra?
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Empleado:</span>
                <span className="font-semibold dark:text-white">{formData.nombreCompleto}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Fecha:</span>
                <span className="dark:text-gray-200">
                  {formData.fecha ? formData.fecha : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Horario:</span>
                <span className="dark:text-gray-200">
                  {formData.horaInicio} - {formData.horaFin}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Horas:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formData.horaInicio && formData.horaFin ?
                    ((new Date(`2000-01-01T${formData.horaFin}`) - new Date(`2000-01-01T${formData.horaInicio}`)) / (1000 * 60 * 60)).toFixed(2) : 0} horas
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de carga */}
      <Modal
        open={isLoadingModalOpen}
        onCancel={() => setIsLoadingModalOpen(false)}
        footer={null}
        closable={false}
        width={400}
        className="dark:[&_.ant-modal-content]:bg-gray-800"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 flex flex-col items-center justify-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <p className="text-center text-gray-600 dark:text-gray-300 font-medium">Procesando registro...</p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Por favor espere un momento</p>
        </motion.div>
      </Modal>

      {/* Modal de éxito */}
      <Modal
        title={<span className="text-xl font-semibold text-gray-800 dark:text-white">¡Registro Exitoso!</span>}
        open={isSuccessModalOpen}
        onOk={() => setIsSuccessModalOpen(false)}
        okText="Aceptar"
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700 text-white" }}
        width={500}
        className="dark:[&_.ant-modal-content]:bg-gray-800"
      >
        <div className="py-4">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800 flex items-center">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <AlertDescription className="text-green-700 dark:text-green-200 font-medium">
              Las horas extra se registraron correctamente.
            </AlertDescription>
          </Alert>
        </div>
      </Modal>
    </div>
  )
}