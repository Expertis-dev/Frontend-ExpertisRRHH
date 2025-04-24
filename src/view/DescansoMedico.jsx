// DescansoMedico.jsx
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, DatePicker } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { AutoComplete } from "antd";
import dayjs from "dayjs";

const { Search } = Input;

const initialData = [
  {
    key: "1",
    CodMes: "01",
    Asesor: "Juan Perez",
    DNI: "12345678",
    FechaInicio: "2023-01-01",
    FechaFin: "2023-01-05",
    CantidadDias: 4,
  },
  {
    key: "2",
    CodMes: "02",
    Asesor: "Manuel Piedra",
    DNI: "45454545",
    FechaInicio: "2023-01-01",
    FechaFin: "2023-01-03",
    CantidadDias: 3,
  },
];

const columns = [
  {
    title: "CodMes",
    dataIndex: "CodMes",
    key: "CodMes",
  },
  {
    title: "Asesor",
    dataIndex: "Asesor",
    key: "Asesor",
  },
  {
    title: "DNI",
    dataIndex: "DNI",
    key: "DNI",
  },
  {
    title: "Fecha Inicio",
    dataIndex: "FechaInicio",
    key: "FechaInicio",
  },
  {
    title: "Fecha Fin",
    dataIndex: "FechaFin",
    key: "FechaFin",
  },
  {
    title: "Cantidad de Días",
    dataIndex: "CantidadDias",
    key: "CantidadDias",
  },
  {
    title: "Acción",
    key: "accion",
    render: (_, record) => <Button type="link">Modificar</Button>,
  },
];

dayjs.locale("es"); // 👈 establece el idioma global en dayjs
const DescansoMedicoTable = () => {
  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [empleados, setEmpleados] = useState([]);
  const [opciones, setOpciones] = useState([]);

  // Obtener empleados desde tu API
  useEffect(() => {
    fetch(
      "https://p9zzp66h-4000.brs.devtunnels.ms/api/empleados/listarEmpleados"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Empleados:", data.recordset); // Log de los empleados
        setEmpleados(data.recordset);
      })
      .catch((err) => console.error("Error al cargar empleados:", err));
  }, []);

  // Función para filtrar opciones según lo que el usuario escribe
  const handleBuscarEmpleado = (value) => {
    // Filtrar nombres no vacíos
    const nombresValidos = empleados
      .filter((emp) => emp.nombreCompleto && emp.nombreCompleto.trim() !== "")
      .map((emp) => emp.nombreCompleto.trim());

    // Eliminar duplicados y ordenar alfabéticamente
    const nombresUnicosOrdenados = [...new Set(nombresValidos)].sort((a, b) =>
      a.localeCompare(b)
    );

    // Filtrar por lo que escribe el usuario
    const filtrados = nombresUnicosOrdenados
      .filter((nombre) => nombre.toLowerCase().includes(value.toLowerCase()))
      .map((nombre) => ({
        value: nombre,
      }));

    setOpciones(filtrados);
  };

  const handleSearch = (value) => {
    const filtered = data.filter((item) =>
      item.Asesor.toLowerCase().includes(value.toLowerCase())
    );
    console.log("Filtered Data:", filtered); // Log the filtered data
    setFilteredData(filtered);
  };

  const handleAddRecord = () => {
    form.validateFields().then((values) => {
      // Verificamos si el asesor seleccionado está en las opciones válidas
      const nombreValido = opciones.some((op) => op.value === values.Asesor);

      if (!nombreValido) {
        form.setFields([
          {
            name: "Asesor",
            errors: ["Debes seleccionar un asesor válido de la lista"],
          },
        ]);
        return;
      }
      const { FechaInicio, FechaFin, CodMes } = values;
      const CantidadDias = FechaFin.diff(FechaInicio, "day");

      const newRecord = {
        key: Date.now().toString(),
        ...values,
        CodMes: CodMes.format("YYYY-MM") + "-01", // <- Aquí agregamos "-01"
        CantidadDias,
        FechaInicio: FechaInicio.format("YYYY-MM-DD"),
        FechaFin: FechaFin.format("YYYY-MM-DD"),
      };

      const updatedData = [...data, newRecord];
      setData(updatedData);
      setFilteredData(updatedData);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <>
      <div className=" w-full mb-4 flex justify-between">
        <Search
          placeholder="Buscar..."
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          style={{ backgroundColor: "#17a589" }}
          onClick={() => setIsModalVisible(true)}
          icon={<FileAddOutlined />}
        >
          Registrar Descanso Médico
        </Button>
      </div>
      <br />
      <Table
        columns={columns}
        dataSource={filteredData}
        className="w-full"
        pagination={false}
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                style={{
                  backgroundColor: "#154360",
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: "4px",

                  borderBottom: "2px solid #e0e0e0",
                }}
              />
            ),
          },
          body: {
            row: (props) => (
              <tr
                {...props}
                style={{
                  backgroundColor: "#fffff0",
                  textAlign: "center",
                  margin: "0",
                }}
              />
            ),
            cell: (props) => (
              <td
                {...props}
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e0e0e0",
                  textAlign: "center",
                }}
              />
            ),
          },
        }}
      />
      {/* Modal Parael Registro */}
      <Modal
        title="Registrar Descanso Médico"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddRecord}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="CodMes"
            label="CodMes"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <DatePicker
              format="YYYY-MM"
              picker="month"
              style={{ width: "100%" }}
              placeholder="Selecciona el primer día del mes"
            />
          </Form.Item>
          <Form.Item
            name="Asesor"
            label="Asesor"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <AutoComplete
              options={opciones}
              onSearch={handleBuscarEmpleado}
              onSelect={(value) => {
                form.setFieldValue("Asesor", value);
                const empleado = empleados.find(
                  (emp) => emp.nombreCompleto === value
                );
                if (empleado) {
                  form.setFieldValue("DNI", empleado.documento);
                } else {
                  form.setFieldValue("DNI", ""); // Por si no encuentra coincidencia
                }
              }}
              placeholder="Escribe un nombre"
              filterOption={false}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="DNI" label="DNI">
            <Input disabled placeholder="DNI del asesor" />
          </Form.Item>

          <Form.Item
            name="rangoFechas"
            label="Rango de Fechas"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <DatePicker.RangePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const DescansoMedico = () => {
  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">Descansos Médicos</h1>
      <DescansoMedicoTable />
    </div>
  );
};
