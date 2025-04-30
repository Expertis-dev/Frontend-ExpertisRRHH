// DescansoMedico.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Table, Input, Modal, Form, DatePicker } from "antd";
import { Button } from "@/components/ui/button";
import { FileAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { AutoComplete } from "antd";
import dayjs from "dayjs";
import { useData } from "@/provider/Provider";
import axios from "axios";

const { Search } = Input;

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
  const columns = [
    {
      title: "CodMes",
      dataIndex: "codMes",
      render: (valor) => valor.split("T")[0],
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
      render: (valor) => valor.split("T")[0],
      key: "fecInicio",
    },
    {
      title: "Fecha Fin",
      dataIndex: "fecFin",
      render: (valor) => valor.split("T")[0],
      key: "fecFin",
    },
    {
      title: "Cantidad de Días",
      dataIndex: "cantDias",
      key: "cantDias",
    },
    {
      title: "Eliminar",
      key: "eliminar",
      render: (_, record) => (
        <Button
          variant="destructive"
          className="bg-red-400 p-[6px]"
          size="small"
          onClick={() => handleDeleteClick(record)}
        >
          <DeleteOutlined className="text-white" />
        </Button>
      ),
    },
  ];
  // Estados adicionales necesarios
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Función handleDelete modificada
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

      console.log("Datos enviados para eliminar:", cuerpo);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/dm/eliminarDM_Empleados`,
        cuerpo
      );

      // Actualizar la lista después de eliminar
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/dm/listarDM_Empleados`
      );
      const sortedData = response.data.sort((a, b) => b.codMes.localeCompare(a.codMes));
      setData(sortedData);
      setFilteredData(sortedData);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Obtener empleados y descansos médicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empleadosRes, descansosRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dm/listarDM_Empleados`)
        ]);

        setEmpleados(empleadosRes.data.recordset.filter(empleado => empleado.estadoLaboral === "VIGENTE"));
        const sortedData = descansosRes.data.sort((a, b) => b.codMes.localeCompare(a.codMes));
        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };

    fetchData();
  }, []);

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

  const handleSearch = (value) => {
    const filtered = data.filter(
      (item) =>
        item.alias?.toLowerCase().includes(value.toLowerCase()) ||
        item.documento?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
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
        // codMes: values.CodMes.format("YYYY-MM") + "-01",
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

  const Confirmar = async () => {
    setIsModalConfirmar(false);
    setIsLoading(true);
    console.log(dataEnviar)
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/dm/registarDM_Empleados`, dataEnviar);
      if (response.status === 200) {
        // Actualizar la lista después de éxito
        const updatedResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/dm/listarDM_Empleados`
        );
        const sortedData = updatedResponse.data.sort((a, b) => b.codMes.localeCompare(a.codMes));
        setData(sortedData);
        setFilteredData(sortedData);

        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">Descansos Médicos</h1>

      <div className="w-full mb-4 flex justify-between">
        <Search
          placeholder="Buscar por DNI o nombre"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 350 }}
        />
        <Button
          style={{ backgroundColor: "#17a589" }}
          onClick={() => setIsModalVisible(true)}
        >
          <FileAddOutlined />
          Registrar Descanso Médico
        </Button>
      </div>

      <div className="w-full max-h-[80vh] overflow-y-auto">
        <Table
          columns={columns}
          dataSource={filteredData}
          className="w-full"
          pagination={false}
          rowKey={(record, index) => `${record.idEmpleado}-${index}`}
        />
      </div>

      {/* Modal de Registro */}
      <Modal
        title="Registrar Descanso Médico"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddRecord}
      >
        <Form form={form} layout="vertical">         

          <Form.Item
            name="Asesor"
            label="Asesor"
            rules={[{ required: true }]}
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
              placeholder="Buscar asesor"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="DNI" label="DNI">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="rangoFechas"
            label="Rango de Fechas"
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Confirmación REGISTRAR */}
      <Modal
        title="CONFIRMAR REGISTRO"
        width={450}
        open={isModalConfirmar}
        onCancel={() => setIsModalConfirmar(false)}
        onOk={Confirmar}
      >
        <p className="font-bold text-base flex  items-center justify-between">DNI: <span className="text-sm font-medium">{dataEnviar.documento}</span> </p>
        <p className="font-bold text-base flex  items-center justify-between">Empleado: <span className="text-sm font-medium">{dataEnviar.alias}</span> </p>
        <p className="font-bold text-base flex  items-center justify-between">Fecha Inicio: <span className="text-sm font-medium">{dataEnviar.fecInicio}</span> </p>
        <p className="font-bold text-base flex  items-center justify-between">Fecha Fin: <span className="text-sm font-medium">{dataEnviar.fecFin}</span> </p>
        <p className="font-bold text-base flex  items-center justify-between">Cantidad de Días: <span className="text-sm font-medium">{dataEnviar.cantDias}</span> </p>
      </Modal>
      {/* Modal de Confirmación ELIMINAR */}
      <Modal
        title="CONFIRMAR ELIMINACIÓN"
        width={450}
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={confirmDelete}
        okText="Eliminar"
        okButtonProps={{ danger: true }}
        cancelText="Cancelar"
      >
        {recordToDelete && (
          <>
            <p className="font-bold text-base flex items-center justify-between">
              Empleado: <span className="text-sm font-medium">{recordToDelete.alias}</span>
            </p>
            <p className="font-bold text-base flex items-center justify-between">
              DNI: <span className="text-sm font-medium">{recordToDelete.documento}</span>
            </p>
            <p className="font-bold text-base flex items-center justify-between">
              Fecha Inicio: <span className="text-sm font-medium">
                {recordToDelete.fecInicio?.split("T")[0]}
              </span>
            </p>
            <p className="font-bold text-base flex items-center justify-between">
              Fecha Fin: <span className="text-sm font-medium">
                {recordToDelete.fecFin?.split("T")[0]}
              </span>
            </p>
            <p className="font-bold text-red-600 mt-4 text-center">
              ¿Está seguro que desea eliminar este registro?
            </p>
          </>
        )}
      </Modal>

      {/* Modal de Carga (existente) */}
      <Dialog open={isLoading}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Procesando</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-blue-600 spin-reverse"></div>
            </div>
            <p className="mt-4 text-blue-600 font-medium">
              Procesando solicitud...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Éxito (existente) */}
      <Dialog open={isSuccess}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Proceso Exitoso</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-center">
              El registro se ha ejecutado correctamente.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const DescansoMedico = () => {
  return <DescansoMedicoTable />;
};