import { useEffect, useState } from "react";
import axios from "axios";
import { Input, Modal, Select } from "antd";
import { PlusCircleOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { message } from 'antd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Check,Loader2 } from "lucide-react"
const { Option } = Select;

export const CesarEmpleado = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const [messageApi, contextHolder] = message.useMessage();
  const key = 'updatable';
  const [cargo, setCargo] = useState("STAFF");
  const [data, setData] = useState([]);
  const [usuario, setUsuario] = useState("");
  const [fecCese, setFechaCese] = useState(hoy);
  const [modalMotivo, setModalMotivo] = useState(false);
  const [nuevoMotivo, setNuevoMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [motivo, setMotivo] = useState("NO SUPERO EL PERIODO DE PRUEBA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false)
  const motivos = [
    "NO SUPERO EL PERIODO DE PRUEBA",
    "RENUNCIA",
    "NO RENOVACION",
    "ABANDONO DEL TRABAJO",
    "DESPIDO",
    "DESISTIO"
  ];

  useEffect(() => {
    const obtenerData = async () => {
      const cuerpo = { funcion: cargo === "STAFF" ? "2" : "1" };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/mostrarEmpleado`,
        cuerpo
      );
      setData(response.data.data);
      setUsuario(response.data.data[0]?.USUARIO || "");
    };
    obtenerData();
  }, [cargo]);

  const CerrarModal = () => {
    messageApi.open({
      key,
      type: 'loading',
      content: "Loading",
      duration: 2,
    });
    const repetido = motivos.includes(nuevoMotivo.trim());
    if (repetido || nuevoMotivo.trim() === "") {
      messageApi.open({
        key,
        type: 'warning',
        content: "El motivo ya existe",
        duration: 2,
      });
      setMotivo(nuevoMotivo);
      setNuevoMotivo("");
      setModalMotivo(false);
      return;
    }
    setMotivo(nuevoMotivo);
    setNuevoMotivo("");
    setModalMotivo(false);
    messageApi.open({
      key,
      type: 'success',
      content: "Motivo Agregado",
      duration: 2,
    });
  };

  const Limpiar = () => {
    setMotivo("NO SUPERO EL PERIODO DE PRUEBA");
    setDetalle("");
    setFechaCese(hoy);
  };

  const Eliminar = async () => {
    setIsSubmitting(true);

    const cuerpo = { usuario, fecCese };
    const cuerpo_02 = { usuario, fecCese, motivo, detalle };
    console.log(cuerpo_02);
    console.log(cuerpo);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        Limpiar();
      }, 2000);
    }, 5000);
    /*
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/adminUsuarios/eliminarUsuario`,
            cuerpo
          );
    
          if (response.status === 200) {
            const response_02 = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/adminUsuarios/registrarCese`,
              cuerpo_02
            );
    
            if (response_02.status === 200) {
              messageApi.open({
                key,
                type: 'success',
                content: "Empleado cesado correctamente",
                duration: 2,
              });
              Limpiar();
            }
          }
        } catch (error) {
          console.log(error);
          messageApi.open({
            key,
            type: 'error',
            content: "Error al procesar el cese",
            duration: 2,
          });
        } finally {
          setIsSubmitting(false);
        }*/
  };

  // Estilos mejorados
  const inputClass = "bg-slate-100 dark:bg-slate-700 py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300";
  const cardClass = "dark:border-gray-500 h-auto w-full max-w-2xl flex flex-col gap-6 border-2 border-zinc-200 dark:border-zinc-700 py-6 px-8 rounded-2xl shadow-lg shadow-gray-200 dark:shadow-gray-900 dark:bg-slate-800 bg-white transition-all duration-300 hover:shadow-xl";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center justify-center gap-2"
    >
      {contextHolder}


      {/* Modal de carga */}
      <Dialog open={isSubmitting}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Eliminando..</DialogTitle>
            <DialogDescription className="text-center">
              Por favor espera mientras se eliminan los datos...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={isSuccess}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Usuario Cesado</DialogTitle>
            <DialogDescription className="sr-only">
              Operación completada con éxito
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-center">El empleado ha sido Eliminado.</p>
          </div>
        </DialogContent>
      </Dialog>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-full border border-red-200 dark:border-red-800"
      >
        <UserDeleteOutlined className="text-red-500 dark:text-red-400 text-2xl" />
        <h1 className="text-xl font-bold text-red-600 dark:text-red-300">CESAR EMPLEADO</h1>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={cardClass}
      >
        <div className="flex items-center justify-between gap-4">
          <Select
            value={cargo}
            onChange={(value) => setCargo(value)}
            className="w-32"
          >
            <Option value="STAFF">STAFF</Option>
            <Option value="ASESOR">ASESOR</Option>
          </Select>

          <Select
            value={usuario}
            onChange={(value) => setUsuario(value)}
            className="flex-1 min-w-0"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {data.map((item, index) => (
              <Option key={index} value={item.USUARIO}>
                {item.USUARIO}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-black font-semibold dark:text-white">FECHA CESE:</label>
          <motion.div whileHover={{ scale: 1.05 }}>
            <input
              type="date"
              className={`${inputClass} h-10 w-40 cursor-pointer`}
              onChange={(e) => setFechaCese(e.target.value)}
              value={fecCese}
            />
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold">MOTIVO:</label>
          <div className="flex items-center gap-2">
            <Select
              value={motivo}
              onChange={setMotivo}
              className="flex-1 min-w-0"
              dropdownStyle={{ zIndex: 2000 }}
            >
              {motivos.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setModalMotivo(true)}
              >
                <PlusCircleOutlined className="cursor-pointer bg-green-600 p-1 rounded-md hover:bg-green-700 transition-colors" />
              </button>
            </motion.div>
          </div>
          <Modal
            title="Agregar otro motivo"
            open={modalMotivo}
            width={400}
            onOk={CerrarModal}
            onCancel={() => setModalMotivo(false)}
            okText="Agregar"
            cancelText="Cancelar"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-2"
            >
              <Input
                value={nuevoMotivo}
                onChange={(e) => setNuevoMotivo(e.target.value.toUpperCase())}
                placeholder="Escriba el nuevo motivo"
                autoFocus
              />
            </motion.div>
          </Modal>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold">DETALLE:</label>
          <motion.div whileHover={{ scale: 1.01 }}>
            <textarea
              placeholder="Ingrese los detalles del cese aquí..."
              className={`${inputClass} w-full h-24 resize-none`}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />
          </motion.div>
        </div>

        <div className="w-full flex items-center justify-center ">
          <motion.button
            onClick={Eliminar}
            disabled={detalle.trim() === "" || isSubmitting}
            whileHover={detalle.trim() === "" ? {} : { scale: 1.05 }}
            whileTap={detalle.trim() === "" ? {} : { scale: 0.95 }}
            className={`rounded-xl text-base py-3 px-6 font-semibold transition-all duration-300 flex items-center gap-2
              ${detalle.trim() === "" || isSubmitting
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white shadow-lg hover:shadow-red-300/50 dark:hover:shadow-red-900/50 cursor-pointer"
              }`}
          >
            {isSubmitting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full cursor-pointer"
                />
                PROCESANDO...
              </>
            ) : (
              "CONFIRMAR CESE"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};