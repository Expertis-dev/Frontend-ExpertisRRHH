import React, { useState } from "react";
import { Table, Typography, Upload, message, Modal,Tag } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useData } from "@/provider/Provider";

const { Title } = Typography;
const { Dragger } = Upload;

export const CambiosAFP = () => {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [cambios, setCambios] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [messageA, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { nombre } = useData()
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
      title: "Mes nuevo Registro",
      dataIndex: "codMesInicio",
      key: "codMesInicio",
    },
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
      render: (_, { afpAnterior }) => (
        <Tag color="blue" style={{ fontSize: "14px"}}>{afpAnterior}</Tag>
      )
    },
    {
      title: "SP nuevo",
      dataIndex: "afpNueva",
      key: "afpNueva",
      render: (_, { afpNueva }) => (
        <Tag color="green" style={{ fontSize: "14px"}}>{afpNueva}</Tag>
      )
    },
    {
      title: "Tipo Comisión actual",
      dataIndex: "tipoComisionAnterior",
      key: "tipoComisionAnterior",
      render: (_, { tipoComisionAnterior }) => (
        <Tag color="blue" style={{ fontSize: "14px"}}>{tipoComisionAnterior}</Tag>
      )
    },
    {
      title: "Tipo Comisión nuevo",
      dataIndex: "tipoComisionNuevo",
      key: "tipoComisionNuevo",
      render: (_, { tipoComisionNuevo }) => (
        <Tag color="green" style={{ fontSize: "14px"}}>{tipoComisionNuevo}</Tag>
      )
    },
  ];
  const EnviarCambios = async () => {
    try {
      console.log({ cambios, nombre });
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/afp/registrarCambiosSPempleado`,
        { cambios, nombre }
      );
      console.log(res);
      if (res.status === 200) {
        messageA.success("Cambios enviados correctamente");
        setMostrarTabla(false);
        setFile(null);
        setFileList([]);
      } else {
        messageA.error("Error al enviar cambios");
      }
    } catch (err) {
      console.error(err);
      messageA.error("Error al enviar cambios");
    }
  }

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
      <div className="mt-5 flex flex-row gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!file}
          className={` px-4 py-1 rounded cursor-pointer ${file
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
          Comparar
        </Button>
        {
          mostrarTabla && (
            <Button onClick={EnviarCambios}
              className="bg-green-500 text-white hover:bg-green-600 ">
              Enviar Cambios
            </Button>
          )
        }
      </div>


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
