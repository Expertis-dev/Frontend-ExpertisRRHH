import { useEffect, useState } from "react";
import axios from "axios";
import { Input, Modal, Select } from "antd";
import { PlusCircleOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { message } from "antd";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Check, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom"
const { Option } = Select;

export const CesarEmpleado = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const [idEmpleado, setIdEmpleado] = useState(0)
  const [messageApi, contextHolder] = message.useMessage();
  const key = "updatable";
  const [cargo, setCargo] = useState("STAFF");
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([])
  const [usuario, setUsuario] = useState("");
  const [fecCese, setFechaCese] = useState(hoy);
  const [modalMotivo, setModalMotivo] = useState(false);
  const [nuevoMotivo, setNuevoMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [motivo, setMotivo] = useState("NO SUPERO EL PERIODO DE PRUEBA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmacion, setIsConfirmacion] = useState(false);
  const navegar = useNavigate()
  const motivos = [
    "NO SUPERO EL PERIODO DE PRUEBA",
    "RENUNCIA",
    "NO RENOVACION",
    "ABANDONO DEL TRABAJO",
    "DESPIDO",
    "DESISTIO",
  ];
  const ObetenerEmpleados = async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`);
    const dataEmpleados = response.data.recordset.filter(dato => dato.nombreCompleto !== null)
    const datosFiltrados = dataEmpleados.filter((empleados) => empleados.estadoLaboral === "VIGENTE")
    //console.log(dataEmpleados)
    setEmpleados(datosFiltrados.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)));
  }
  useEffect(() => {
    ObetenerEmpleados()
  }, [])
  const CerrarModal = () => {
    if (!nuevoMotivo.trim()) {
      messageApi.open({
        key,
        type: "warning",
        content: "Debe ingresar un motivo",
        duration: 2,
      });
      return;
    }

    if (motivos.includes(nuevoMotivo.trim())) {
      messageApi.open({
        key,
        type: "warning",
        content: "El motivo ya existe",
        duration: 2,
      });
      return;
    }

    setMotivo(nuevoMotivo);
    setNuevoMotivo("");
    setModalMotivo(false);
    messageApi.open({
      key,
      type: "success",
      content: "Motivo agregado",
      duration: 2,
    });
  };

  const Limpiar = () => {
    setMotivo("NO SUPERO EL PERIODO DE PRUEBA");
    setDetalle("");
    setFechaCese(hoy);
  };

  const confirmarEliminacion = async () => {
    setIsSubmitting(true);
    setIsConfirmacion(false);
    try {
      const cuerpo = {
        idEmpleado,
        fecCese,
        motivo,
        detalle
      };
      console.log("Enviando:", cuerpo);

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/cesarEmpleado`, cuerpo);
      console.log("Respuesta:", response);

      if (response.status === 200) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error al cesar empleado:", error);
    } finally {
      setIsSubmitting(false); // Asegúrate de que también se apague en error
      setTimeout(() => {
        setIsSuccess(false);
        Limpiar();
        navegar("/finanzas/empleados-listar")
      }, 2000);
    }
  };

  // Estilos mejorados
  const inputClass =
    "bg-slate-100 dark:bg-slate-700 py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300";
  const cardClass =
    "dark:border-gray-500 h-auto w-full max-w-2xl flex flex-col gap-6 border-2 border-zinc-200 dark:border-zinc-700 py-6 px-8 rounded-2xl shadow-lg shadow-gray-200 dark:shadow-gray-900 dark:bg-slate-800 bg-white transition-all duration-300 hover:shadow-xl";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center justify-center gap-2"
    >
      {contextHolder}

      {/* Modal de confirmación */}
      <Dialog open={isConfirmacion} onOpenChange={setIsConfirmacion}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-center">Confirmar Cese</DialogTitle>
            <DialogDescription className="text-center">
              ¿Está seguro que desea cesar a este empleado?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">Empleado: <span className="font-light"> {usuario}</span></p>
            <p className="font-medium">Fecha de cese: <span className="font-light"> {fecCese}</span></p>
            <p className="font-medium">Motivo: <span className="font-light">  {motivo}</span></p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmacion(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
              onClick={confirmarEliminacion}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Cese"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de carga */}
      <Dialog open={isSubmitting}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Procesando cese...</DialogTitle>
            <DialogDescription className="text-center">
              Por favor espere mientras se procesa el cese...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={isSuccess} >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Cese completado</DialogTitle>
            <DialogDescription className="sr-only">
              Operación completada con éxito
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-center">
              El empleado ha sido cesado correctamente.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      {/* Titulo CesarEMPLEADO */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-full border border-red-200 dark:border-red-800"
      >
        <UserDeleteOutlined className="text-red-500 dark:text-red-400 text-2xl" />
        <h1 className="text-xl font-bold text-red-600 dark:text-red-300">
          CESE DE EMPLEADO
        </h1>
      </motion.div>
      {/* CONTENIDO DEL CESE */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={cardClass}
      >
        <div className="flex items-center justify-between gap-4">
          <Label>EMPLEADO :</Label>
          <Select
            value={usuario}
            onChange={(value) => {
              const empleadoSeleccionado = empleados.find((empleado) => empleado.nombreCompleto === value);
              console.log(empleadoSeleccionado?.idEmpleado);
              setIdEmpleado(empleadoSeleccionado?.idEmpleado); // solo el id
              setUsuario(value); // esto es el idEmpleado
            }}
            className="flex-1 min-w-0"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {empleados.map((item, index) => (
              <Option key={index} value={item.nombreCompleto}>
                {item.nombreCompleto}
              </Option>
            ))}
          </Select>

        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-black font-semibold dark:text-white">
            FECHA CESE:
          </label>
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

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => setModalMotivo(true)}
                aria-label="Agregar motivo"
              >
                <PlusCircleOutlined className="text-white bg-green-600 p-1 rounded-md hover:bg-green-700 transition-colors" />
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
              required
            />
          </motion.div>
        </div>

        <div className="w-full flex items-center justify-center">
          <motion.button
            onClick={() => setIsConfirmacion(true)}
            disabled={!detalle.trim() || isSubmitting}
            whileHover={!detalle.trim() ? {} : { scale: 1.05 }}
            whileTap={!detalle.trim() ? {} : { scale: 0.95 }}
            className={`rounded-xl text-base py-3 px-6 font-semibold transition-all duration-300 flex items-center gap-2
              ${!detalle.trim() || isSubmitting
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white shadow-lg hover:shadow-red-300/50 dark:hover:shadow-red-900/50 cursor-pointer"
              }`}
            aria-label="Confirmar cese"
          >
            {isSubmitting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
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