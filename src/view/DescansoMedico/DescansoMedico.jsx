import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Search, Check, Plus, RefreshCw, Trash, Eye, SquarePen } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Table, Input, Modal, Form, DatePicker, AutoComplete, Select, Tag } from "antd";
import { Button } from "@/components/ui/button";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useData } from "@/provider/Provider";
import axios from "axios";
import { motion } from "framer-motion";

dayjs.locale("es");

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

  const columns = [
    {
      title: "Código Mes",
      dataIndex: "codMes",
      render: (valor) => valor?.split("T")[0] || "-",
      key: "codMes",
    },
    {
      title: "Empleado",
      dataIndex: "alias",
      key: "alias",
    },
    {
      title: "DNI",
      dataIndex: "documento",
      key: "documento",
    },
    {
      title: "Fecha Inicio",
      dataIndex: "fecInicio",
      render: (valor) => dayjs(valor?.split("T")[0]).format("DD/MM/YYYY") || "-",
      key: "fecInicio",
    },
    {
      title: "Fecha Fin",
      dataIndex: "fecFin",
      render: (valor) => dayjs(valor?.split("T")[0]).format("DD/MM/YYYY") || "-",
      key: "fecFin",
    },
    {
      title: "Días",
      dataIndex: "cantDias",
      key: "cantDias",
      render: (dias) => <Tag color={dias > 15 ? "red" : "green"}>{dias} días</Tag>,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="flex space-x-2 justify-center">
          <Button
            variant="ghost"
            size="icon"
            title="Ver"
          >
            <Eye className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
          >
            <SquarePen className="h-4 w-4 text-green-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Eliminar"
            onClick={() => handleDeleteClick(record)}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  // Estados para eliminación
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Obtener empleados y descansos médicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [empleadosRes, descansosRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dm/listarDM_Empleados`)
        ]);

        setEmpleados(empleadosRes.data.recordset.filter(empleado => empleado.estadoLaboral === "VIGENTE"));
        const sortedData = descansosRes.data.sort((a, b) => b.codMes?.localeCompare(a.codMes) || 0);
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
        item.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.documento?.includes(searchTerm)
      );
    }

    // Filtro por rango de fechas
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      result = result.filter(item => {
        const fechaInicio = dayjs(item.fecInicio?.split("T")[0]);
        return fechaInicio.isAfter(start) && fechaInicio.isBefore(end);
      });
    }

    // Filtro por días
    if (diasFilter) {
      result = result.filter(item => {
        const dias = parseInt(item.cantDias);
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
        documento: empleado.documento
      };

      setDataEnviar(newRecord);
      setIsModalVisible(false);
      setIsModalConfirmar(true);
      form.resetFields();
    }).catch(console.error);
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    setIsDeleteModalVisible(false);
    setIsLoading(true);

    try {
      const cuerpo = {
        idDescansosMedicos: recordToDelete.idDescansosMedicos,
        idEmpleado: recordToDelete.idEmpleado,
        usuario: nombre
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/dm/eliminarDM_Empleados`,
        cuerpo
      );

      // Actualizar la lista
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/dm/listarDM_Empleados`
      );
      const sortedData = response.data.sort((a, b) => b.codMes?.localeCompare(a.codMes) || 0);
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
    console.log("Datos a enviar:", dataEnviar);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/dm/registarDM_Empleados`,
        dataEnviar
      );

      if (response.status === 200) {
        // Actualizar la lista
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/dm/listarDM_Empleados`
        );
        const sortedData = updatedResponse.data.sort((a, b) => b.codMes?.localeCompare(a.codMes) || 0);
        setData(sortedData);

        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
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
  };

  const diasOptions = [
    { value: null, label: "Todos los días" },
    { value: "menos_5", label: "Menos de 5 días" },
    { value: "5_15", label: "5 a 15 días" },
    { value: "mas_15", label: "Más de 15 días" },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
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
        className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 mb-6"
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
              onClick={() => setIsModalVisible(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex items-center gap-2"
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
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={isLoading}
            className="rounded-lg"
          />
        </motion.div>
      </motion.div>

      {/* Modal de Registro */}
      <Modal
        title={
          <p className="text-center text-xl font-bold text-blue-600">
            Registrar Descanso Médico
          </p>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddRecord}
        okText="Continuar"
        cancelText="Cancelar"
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
                          <Form.Item name="TipoDM" label={<span className="font-medium">Tipo de Descanso Medico</span>} rules={[{ required: true, message: "Seleccione un tipo de descanso médico" }]}>
            <Select
              options={[
                { value: "Enfermedad", label: "Enfermedad" },
                { value: "Accidente Comun", label: "Accidente Comun" },
                { value: "Accidente Trabajo", label: "Accidente Trabajo" },
              ]}
              placeholder="Seleccione tipo de descanso médico"
              className="w-full rounded-lg"
              onChange={(value) => form.setFieldValue("TipoDM", value)}
            />
          </Form.Item>


          <Form.Item name="CITT" label={<span className="font-medium">Tiene CITT</span>} rules={[{ required: true, message: "Seleccione un tipo de descanso médico" }]}>
            <Select
              options={[
                { value: "Si", label: "Si" },
                { value: "No", label: "No" },
              ]}
              placeholder="Seleccione si tiene CITT"
              className="w-full rounded-lg"
              onChange={(value) => form.setFieldValue("CITT", value)}
            />
          </Form.Item>
        </div>

          <Form.Item
            name="rangoFechas"
            label={<span className="font-medium">Rango de Fechas</span>}
            rules={[{ required: true, message: "Seleccione un rango de fechas" }]}
          >
            <DatePicker.RangePicker
              className="w-full rounded-lg"
              onChange={(value) => form.setFieldValue("rangoFechas", value)}
            />
          </Form.Item>

          <Form.Item
            name="rangoFechas"
            label={<span className="font-medium">Rango de Fechas</span>}
            rules={[{ required: true, message: "Seleccione un rango de fechas" }]}
          >
            <DatePicker.RangePicker
              className="w-full rounded-lg"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Confirmación REGISTRAR */}
      <Modal
        title={
          <span className="text-xl font-bold text-green-600">
            Confirmar Registro
          </span>
        }
        open={isModalConfirmar}
        onCancel={() => setIsModalConfirmar(false)}
        onOk={Confirmar}
        okText="Confirmar"
        cancelText="Cancelar"
        okButtonProps={{ className: "bg-green-500 hover:bg-green-600" }}
        width={500}
      >
        <div className="space-y-3 mt-6">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold">Empleado:</span>
            <span>{dataEnviar.alias}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold">DNI:</span>
            <span>{dataEnviar.documento}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold">Fecha Inicio:</span>
            <span>{dayjs(dataEnviar.fecInicio).format("DD/MM/YYYY")}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold">Fecha Fin:</span>
            <span>{dayjs(dataEnviar.fecFin).format("DD/MM/YYYY")}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold">Días:</span>
            <Tag color={dataEnviar.cantDias > 15 ? "red" : "green"}>
              {dataEnviar.cantDias} días
            </Tag>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmación ELIMINAR */}
      <Modal
        title={
          <span className="text-xl font-bold text-red-600">
            Confirmar Eliminación
          </span>
        }
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={confirmDelete}
        okText="Eliminar"
        okButtonProps={{ danger: true }}
        cancelText="Cancelar"
        width={500}
      >
        {recordToDelete && (
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold">Empleado:</span>
              <span>{recordToDelete.alias}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold">DNI:</span>
              <span>{recordToDelete.documento}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold">Fecha Inicio:</span>
              <span>{dayjs(recordToDelete.fecInicio?.split("T")[0]).format("DD/MM/YYYY")}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold">Fecha Fin:</span>
              <span>{dayjs(recordToDelete.fecFin?.split("T")[0]).format("DD/MM/YYYY")}</span>
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-red-600 font-semibold text-center">
                ¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Carga */}
      <Dialog open={isLoading}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-blue-600">Obteniendo datos...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent"
            />
            <p className="mt-4 text-blue-600 font-medium animate-pulse">
              Cargando datos...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Éxito */}
      <Dialog open={isSuccess}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-green-600">¡Éxito!</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-700 text-center">
              La operación se completó correctamente.
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const DescansoMedico = () => {
  return <DescansoMedicoTable />;
};