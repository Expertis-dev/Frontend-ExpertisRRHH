import { DatePicker, Input, Card, Tag, Tooltip, Empty, Select } from "antd";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, RefreshCw, Users, Filter, FileText, UserPlus } from "lucide-react";

import { DetalleAfiliado } from "./DetalleAfiliado";
import { ModalRegistroAfiliado } from "./ModalRegistroAfiliado";
import { ModalEditAfiliado } from "./ModalEditAfiliado";
import { exportToExcel } from "@/logic/ExportarDocumento";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.locale('es');
import isBetween from "dayjs/plugin/isBetween";
import axios from "axios";
import { toast } from "sonner";
import { useData } from "@/provider/Provider";
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Search: SearchInput } = Input;

export const ListarAfiliado = () => {
  const [planSeleccionado, setPlanSeleccionado] = useState(""); // siempre string
  const [isEdit, setIsEdit] = useState(false);
  const [dateRange, setDateRange] = useState([]); // guardamos [] o [dayjs, dayjs]
  const [isVer, setIsVer] = useState(false);
  const [selectAfiliado, setSelectAfiliado] = useState({});
  const [datosAfiliados2, setDatosAfiliados2] = useState([]); // Nuevo estado para los datos del backend
  const [searchTerm, setSearchTerm] = useState("");
  const [crearAfiliado, setCrearAfiliado] = useState(false);
  const [verEspeciales, setVerEspeciales] = useState(false)
  const { planEPS} = useData();
  useEffect(() => {
    const fetchAfiliados = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarAfiliadosEPS`); // Reemplaza con tu endpoint real
        const datosFiltrados = response.data.filter(afiliado => afiliado.mesFin === null);
        console.log("Respuesta del servidor:", datosFiltrados);
        setDatosAfiliados2(datosFiltrados); // Asume que la respuesta es un array de afiliados
      } catch (error) {
        console.error("Error al obtener los afiliados:", error);
        toast.error("Error al cargar la lista de afiliados", {
          description: "No se pudieron obtener los datos del servidor.",
        });
      }
    };
    const fetchEspeciales = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarAfiliadosEPS-especiales`); // Reemplaza con tu endpoint real
        const datosFiltrados = response.data.filter(afiliado => afiliado.mesFin === null);
        console.log("Respuesta del servidor:", datosFiltrados);
        setDatosAfiliados2(datosFiltrados); // Asume que la respuesta es un array de afiliados
      } catch (error) {
        console.error("Error al obtener los afiliados:", error);
        toast.error("Error al cargar la lista de afiliados", {
          description: "No se pudieron obtener los datos del servidor.",
        });
      }
    };
    verEspeciales ? fetchEspeciales() : fetchAfiliados();
  }, [verEspeciales]);


  // 1) Calcular filtrados sin estado derivado
  const datosFiltrados = useMemo(() => {
    let data = [...datosAfiliados2]; // Usa los datos del backend
    console.log("Datos originales:", data);
    // Buscar (nombre, documento, eps)
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      data = data.filter((a) =>
        [a.NombreCompleto, a.Documento, a.Plan ?? ""]
          .map((v) => String(v).toLowerCase())
          .some((v) => v.includes(q))
      );
    }

    // Plan (igualdad estricta normalizada)
    const plan = (planSeleccionado || "").trim().toLowerCase();
    if (plan) {
      data = data.filter((a) => (a.Plan ?? "").toLowerCase() === plan);
    }

    // Rango de fechas (opcional: usando fechaInicio en formato DD/MM/YYYY)
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange; // son objetos dayjs
      data = data.filter((a) => {
        const d = dayjs(a.fechaInicio, "DD/MM/YYYY", true);
        return d.isValid() && d.isBetween(start.startOf("day"), end.endOf("day"), null, "[]");
      });
    }

    return data; // Retorna los datos filtrados
  }, [searchTerm, planSeleccionado, dateRange, datosAfiliados2]); // Agrega datosAfiliados2 como dependencia

  // 2) Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setPlanSeleccionado("");
    setDateRange([]);
  };

  const getPlanColor = (plan) => {
    const planColors = {
      "PLANADICIONAL2": "blue",
      "PLANBASEPLUS": "purple",
      "PLANADICIONAL1": "green",
      "PLANBASEESENCIAL": "orange",
    };
    return planColors[plan] || "default";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">LISTA DE AFILIADOS</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Gestiona y consulta la información de los afiliados registrados</p>
      </motion.div>

      {/* Filtros y Controles */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card
          className="shadow-sm border-0"
          title={
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-semibold">Filtros y Acciones</span>
            </div>
          }
          extra={
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setVerEspeciales(!verEspeciales)}
                className="bg-amber-600 hover:bg-amber-700 text-white">
                <FileText className="h-4 w-4" />
                {verEspeciales ? "Ver Afiliados" : "Ver Especiales"}
              </Button>
              <Button
                disabled={datosFiltrados.length === 0}
                onClick={() => exportToExcel(datosFiltrados, "LISTA DE AFILIADOS")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4" />
                Descargar Excel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCrearAfiliado(true)} disabled={verEspeciales}>
                <UserPlus className="h-4 w-4" />
                Registrar Nuevo Afiliado
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div>
              <p className="block text-sm font-medium text-gray-700">Buscar afiliado</p>
              <SearchInput
                placeholder="Buscar por nombre o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-700">Rango de fechas</p>
              <RangePicker
                onChange={(vals) => setDateRange(vals ?? [])}
                value={dateRange.length ? dateRange : null} // null cuando está vacío
                format="DD/MM/YYYY"
                className="w-full"
                placeholder={["Fecha inicio", "Fecha fin"]}
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-700">Buscar Plan</p>
              <Select
                className="w-full"
                placeholder="Seleccione plan"
                value={planSeleccionado || undefined} // undefined para mostrar placeholder
                onChange={(value) => setPlanSeleccionado((value ?? "").toString())} // ← maneja allowClear
                options={
                  // Asegura que options.label y .value existan
                  (planEPS ?? []).map((p) => ({
                    label: p.label ?? p.value,
                    value: (p.value ?? "").toString().toLowerCase(), // normaliza a minúsculas
                  }))
                }
                getPopupContainer={(trigger) => trigger.parentNode}
                optionFilterProp="label"
                showSearch
                allowClear
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleClearFilters} variant="outline" className="flex-1 h-8">
                <RefreshCw className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabla de resultados */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card
          className="shadow-sm border-0"
          title={
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="font-semibold">{verEspeciales ? "Lista de Afiliados Especiales" : "Lista de Afiliados"}</span>
              <Tag color="blue">{datosFiltrados.length} registros</Tag>
            </div>
          }
        >
          {datosFiltrados.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No se encontraron afiliados">
              <Button onClick={handleClearFilters}>Limpiar filtros</Button>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[60vh] rounded-lg border">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Documento</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Nombre Completo</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">EPS</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Dependientes</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Fecha Inicio</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">Fecha Fin</th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosFiltrados.map((fila, index) => (
                      <motion.tr
                        key={`${fila.Documento}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="bg-white hover:bg-gray-50 border-b last:border-b-0 transition-colors cursor-pointer"
                      >
                        <td className="p-3 text-sm text-gray-900">{fila.Documento}</td>
                        <td className="p-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{fila.NombreCompleto}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Tag color={getPlanColor(fila.Plan?.split(' ').join(''))}>{fila.Plan}</Tag>
                        </td>
                        <td className="p-3 text-sm text-gray-700">{fila.Tipo}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${fila.totalDependientes > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"
                              }`}
                          >
                            {fila.totalDependientes}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{dayjs.utc(fila.mesInicio).format('DD/MM/YYYY')}</td>
                        <td className="p-3 text-sm text-gray-600">{fila.mesFin ? dayjs.utc(fila.mesFin).format('DD/MM/YYYY') : "VIGENTE"}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Tooltip title="Ver detalles">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Afiliado seleccionado para ver:", fila);
                                  setSelectAfiliado(fila);
                                  setIsVer(true);
                                }}
                                className="h-8 w-8 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Tooltip>

                            <Tooltip title="Editar">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectAfiliado(fila);
                                  setIsEdit(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 text-green-600" />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modales */}
      <DetalleAfiliado isVer={isVer} selectAfiliado={selectAfiliado} setIsVer={setIsVer} />
      <ModalRegistroAfiliado isCrear={crearAfiliado} setIsCrear={setCrearAfiliado} afiliados= {datosAfiliados2} />
      <ModalEditAfiliado isEdit={isEdit} setSelectAfiliado={setSelectAfiliado} selectAfiliado={selectAfiliado} setIsEdit={setIsEdit} />
    </div>
  );
};
