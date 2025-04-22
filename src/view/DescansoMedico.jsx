// DescansoMedico.jsx
import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, DatePicker } from "antd";
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
    Asesor: "Juan Perez2",
    DNI: "12345699",
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

const DescansoMedicoTable = () => {
  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleSearch = (value) => {
    const filtered = data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleAddRecord = () => {
    form.validateFields().then((values) => {
      const { FechaInicio, FechaFin } = values;
      const CantidadDias = FechaFin.diff(FechaInicio, "day");
      const newRecord = {
        key: Date.now().toString(),
        ...values,
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
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          style={{ backgroundColor: "green" }}
          onClick={() => setIsModalVisible(true)}
        >
          Registrar Descanso Médico
        </Button>
      </div>
      <br />
      <Table columns={columns} dataSource={filteredData} />
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
            <Input />
          </Form.Item>
          <Form.Item
            name="DNI"
            label="DNI"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="FechaInicio"
            label="Fecha Inicio"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="FechaFin"
            label="Fecha Fin"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <DatePicker />
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
