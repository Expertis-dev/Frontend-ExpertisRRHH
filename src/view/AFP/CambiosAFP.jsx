import React, { useState } from "react";
import { Table, Typography, Upload, message, Modal } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Dragger } = Upload;

export const CambiosAFP = () => {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [cambios, setCambios] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [messageA, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return messageA.warning("Selecciona un archivo Excel");

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/afp/comparar`,
        formData
      );

      const data = res.data;
      console.log(data);

      if (!data || data.length === 0) {
        setMostrarTabla(false);
        setIsModalVisible(true); // Mostrar modal clásico
        return;
      } else {
        setCambios(data);
        setMostrarTabla(true);
        messageA.success("Cambios encontrados");
      }
    } catch (err) {
      console.error(err);
      messageA.error("Error al comparar");
    }
  };

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
        messageA.error("Solo se permiten archivos Excel (.xls, .xlsx)");
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

  const columns = [
    {
      title: "Documento",
      dataIndex: "documento",
      key: "documento",
    },
    {
      title: "Nombre Completo",
      dataIndex: "nombreCompleto",
      key: "nombreCompleto",
    },
    {
      title: "SP Actual",
      dataIndex: "afpAnterior",
      key: "afpAnterior",
    },
    {
      title: "Tipo Comisión actual",
      dataIndex: "tipoComisionAnterior",
      key: "tipoComisionAnterior",
    },
    {
      title: "SP nuevo",
      dataIndex: "afpNueva",
      key: "afpNueva",
    },
    {
      title: "Tipo Comisión nuevo",
      dataIndex: "tipoComisionNuevo",
      key: "tipoComisionNuevo",
    },
  ];

  return (
    <div className="flex flex-col justify-between items-center p-4 bg-gray-100 border-b border-gray-300">
      {contextHolder}
      <Title level={4}>Cambios en SP / Ficha de Empleados</Title>
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

      <button
        onClick={handleSubmit}
        disabled={!file}
        className={`ml-2 mt-5 px-4 py-1 rounded cursor-pointer ${file
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
      >
        Comparar
      </button>

      {mostrarTabla && (
        <div className="p-4 w-full">
          <Table
            columns={columns}
            dataSource={cambios}
            rowKey="idEmpleado"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}
      <Modal
        title="Sin cambios detectados"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <button
            key="ok"
            onClick={() => setIsModalVisible(false)}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Aceptar
          </button>,
        ]}
      >
        <p>No se encontraron cambios en el archivo cargado.</p>
      </Modal>
    </div>
  );
};
