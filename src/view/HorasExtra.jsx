"use client"
import { AutoComplete, Modal } from 'antd';
import { useState, useEffect } from "react"
import axios from 'axios';
import { PlusCircleOutlined } from "@ant-design/icons";
import { Check, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export const HorasExtra = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
  })

  // Datos de ejemplo para la tabla
  const [overtimeData, setOvertimeData] = useState([
    {
      nombreCompleto: "Juan Pérez",
      fecha: "21/05/2024",
      horaInicio: "17:00",
      cantidadHoras: "2",
      horaFin: "19:00",
      codEmpleado: "EMP-001",
    },
    {
      nombreCompleto: "María García",
      fecha: "22/05/2024",
      horaInicio: "18:00",
      cantidadHoras: "3",
      horaFin: "21:00",
      codEmpleado: "EMP-002",
    }
  ])

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

  useEffect(() => {
    ObtenerEmpleados();
  }, []);

  // Inicializar datos filtrados
  useEffect(() => {
    setFilteredData(overtimeData)
  }, [overtimeData])

  // Filtrar datos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredData(overtimeData)
    } else {
      const results = overtimeData.filter(item =>
        item.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.codEmpleado.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredData(results)
    }
  }, [searchQuery, overtimeData])

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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
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

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false)
    setIsLoadingModalOpen(true)

    // Simular proceso de carga
    setTimeout(() => {
      setIsLoadingModalOpen(false)

      // Calcular cantidad de horas
      const inicio = new Date(`2000-01-01T${formData.horaInicio}`)
      const fin = new Date(`2000-01-01T${formData.horaFin}`)
      const diffHours = Math.round((fin - inicio) / (1000 * 60 * 60))

      // Formatear fecha
      const fechaFormateada = new Date(formData.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      // Buscar empleado seleccionado para obtener su código
      const empleado = empleados.find(e => e.nombreCompleto === formData.nombreCompleto);
      const codEmpleado = empleado ? empleado.codEmpleado : `-----`;

      // Agregar nuevo registro
      const newRecord = {
        nombreCompleto: formData.nombreCompleto,
        fecha: fechaFormateada,
        horaInicio: formData.horaInicio,
        cantidadHoras: diffHours.toString(),
        horaFin: formData.horaFin,
        codEmpleado: codEmpleado,
      }

      setOvertimeData([newRecord, ...overtimeData])
      setIsSuccessModalOpen(true)

      // Limpiar formulario
      setFormData({
        nombreCompleto: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
      })
    }, 1500)
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
        empleado.nombreCompleto?.toLowerCase().includes(value.toLowerCase())
      )
      .map(empleado => ({
        label: empleado.nombreCompleto,
        value: empleado.nombreCompleto,
        ...empleado
      }));

    setEmpleadosFiltrados(filtrados);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-2xl font-bold mb-8 text-gray-800"
      >
        GESTIÓN DE HORAS EXTRA
      </motion.h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="relative w-full md:w-auto">
          <div className="relative flex items-center">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o código"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleAddClick}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg cursor-pointer"
          >
            <PlusCircleOutlined className="h-4 w-4 mr-2" />
            Agregar Horas Extra
          </Button>
        </motion.div>
      </div>

      {/* Tabla de Horas Extra */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto rounded-xl shadow-lg border border-gray-200"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-700 to-gray-800">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">NOMBRE</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">FECHA</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">INICIO</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">HORAS</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">FIN</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">CÓDIGO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((overtime, index) => (
                <motion.tr
                  key={`${overtime.codEmpleado}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">{overtime.nombreCompleto}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{overtime.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-medium">{overtime.horaInicio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {overtime.cantidadHoras} hrs
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">{overtime.horaFin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{overtime.codEmpleado}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Modal para agregar nueva hora extra - Usando Modal de Ant Design */}
      <Modal
        title="REGISTRAR HORAS EXTRA"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={handleAddSubmit}
        okButtonProps={{ disabled: !formIsValid }}
        okText="Continuar"
        cancelText="Cancelar"
        width={600}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="empleado" className="block text-sm font-medium text-gray-700">
              Empleado
            </label>
            <AutoComplete
              style={{ width: '100%' }}
              options={empleadosFiltrados}
              value={formData.nombreCompleto}
              onSelect={(value, option) => {
                setFormData(prev => ({ ...prev, nombreCompleto: value }));
                
              }}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, nombreCompleto: value }));
              }}
              onSearch={handleBuscarEmpleado}
              placeholder="Seleccione un empleado"
              filterOption={(inputValue, option) =>
                option.value.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleInputChange}
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700">
                Hora Inicio
              </label>
              <Input
                id="horaInicio"
                name="horaInicio"
                type="time"
                value={formData.horaInicio}
                onChange={handleInputChange}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700">
                Hora Fin
              </label>
              <Input
                id="horaFin"
                name="horaFin"
                type="time"
                value={formData.horaFin}
                onChange={handleInputChange}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                required
              />
            </div>
          </div>

          {formData.horaInicio && formData.horaFin && new Date(`2000-01-01T${formData.horaFin}`) <= new Date(`2000-01-01T${formData.horaInicio}`) && (
            <Alert variant="destructive" className="text-sm flex text-center">
              La hora de fin debe ser mayor a la hora de inicio
            </Alert>
          )}
        </div>
      </Modal>

      {/* Modal de confirmación - Usando Modal de Ant Design */}
      <Modal
        title="Confirmar Registro"
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={handleConfirmSubmit}
        okText="Confirmar Registro"
        cancelText="Volver"
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700 text-white" }}
        width={600}
      >
        <div className="py-4 space-y-4">
          <p className="text-center text-gray-600">
            ¿Está seguro de registrar las siguientes horas extra?
          </p>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Empleado:</span>
                <span className="font-semibold">{formData.nombreCompleto}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Fecha:</span>
                <span>{formData.fecha ? new Date(formData.fecha).toLocaleDateString('es-ES') : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Horario:</span>
                <span>
                  {formData.horaInicio} - {formData.horaFin}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Total Horas:</span>
                <span className="font-semibold text-blue-600">
                  {formData.horaInicio && formData.horaFin ?
                    Math.round(
                      (new Date(`2000-01-01T${formData.horaFin}`) -
                        new Date(`2000-01-01T${formData.horaInicio}`)
                      ) / (1000 * 60 * 60)) : 0} horas
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* Modal de carga - Usando Modal de Ant Design */}
      <Modal
        open={isLoadingModalOpen}
        onCancel={() => setIsLoadingModalOpen(false)}
        footer={null}
        closable={false}
        width={400}
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
            <Loader2 className="h-10 w-10 text-blue-600" />
          </motion.div>
          <p className="text-center text-gray-600 font-medium">Procesando registro...</p>
          <p className="text-center text-sm text-gray-500">Por favor espere un momento</p>
        </motion.div>
      </Modal>

      {/* Modal de éxito - Usando Modal de Ant Design */}
      <Modal
        title="¡Registro Exitoso!"
        open={isSuccessModalOpen}
        onOk={() => setIsSuccessModalOpen(false)}
        okText="Aceptar"
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700 text-white" }}
        width={500}
      >
        <div className="py-4">
          <Alert className="bg-green-50 border-green-200 flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <AlertDescription className="text-green-700 font-medium">
              Las horas extra se registraron correctamente.
            </AlertDescription>
          </Alert>
        </div>
      </Modal>
    </div>
  )
}