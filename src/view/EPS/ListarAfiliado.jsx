import { DatePicker, Input, Card, Tag, Tooltip, Empty, Select } from "antd";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, RefreshCw, Users, Filter, FileText, UserPlus } from "lucide-react";
import { datosAfiliados, Planes } from "../../data/Info";
import { DetalleAfiliado } from "./DetalleAfiliado";
import { ModalRegistroAfiliado } from "./ModalRegistroAfiliado";
import { ModalEditAfiliado } from "./ModalEditAfiliado";
import { exportToExcel } from "@/logic/ExportarDocumento";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Search: SearchInput } = Input;

export const ListarAfiliado = () => {
  const [planSeleccionado, setPlanSeleccionado] = useState(""); // siempre string
  const [isEdit, setIsEdit] = useState(false);
  const [dateRange, setDateRange] = useState([]); // guardamos [] o [dayjs, dayjs]
  const [isVer, setIsVer] = useState(false);
  const [selectAfiliado, setSelectAfiliado] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [crearAfiliado, setCrearAfiliado] = useState(false);

  // 1) Calcular filtrados sin estado derivado
  const datosFiltrados = useMemo(() => {
    let data = [...datosAfiliados];

    // Buscar (nombre, documento, eps)
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      data = data.filter((a) =>
        [a.nombreCompleto, a.documento, a.eps ?? ""]
          .map((v) => String(v).toLowerCase())
          .some((v) => v.includes(q))
      );
    }

    // Plan (igualdad estricta normalizada)
    const plan = (planSeleccionado || "").trim().toLowerCase();
    if (plan) {
      data = data.filter((a) => (a.plan ?? "").toLowerCase() === plan);
    }

    // Rango de fechas (opcional: usando fechaInicio en formato DD/MM/YYYY)
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange; // son objetos dayjs
      data = data.filter((a) => {
        const d = dayjs(a.fechaInicio, "DD/MM/YYYY", true);
        return d.isValid() && d.isBetween(start.startOf("day"), end.endOf("day"), null, "[]");
      });
    }

    return data;
  }, [searchTerm, planSeleccionado, dateRange]);

  // 2) Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setPlanSeleccionado("");
    setDateRange([]);
  };

  const getPlanColor = (plan) => {
    const planColors = {
      Integral: "blue",
      "Red Preferente": "purple",
      "Total Salud": "green",
      Clásico: "orange",
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
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <FileText className="h-4 w-4" />
                Ver Especiales
              </Button>
              <Button
                disabled={datosFiltrados.length === 0}
                onClick={() => exportToExcel(datosFiltrados, "LISTA DE AFILIADOS")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4" />
                Descargar Excel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCrearAfiliado(true)}>
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
                  (Planes ?? []).map((p) => ({
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
              <span className="font-semibold">Lista de Afiliados</span>
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
                        key={`${fila.documento}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="bg-white hover:bg-gray-50 border-b last:border-b-0 transition-colors cursor-pointer"
                      >
                        <td className="p-3 text-sm font-medium text-gray-900">{fila.documento}</td>
                        <td className="p-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{fila.nombreCompleto}</div>
                            <div className="text-xs text-gray-500">{fila.regimenSalud}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Tag color={getPlanColor(fila.plan)}>{fila.plan}</Tag>
                        </td>
                        <td className="p-3 text-sm text-gray-700">{fila.eps}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              fila.nroDependientes > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {fila.nroDependientes}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{fila.fechaInicio}</td>
                        <td className="p-3 text-sm text-gray-600">{fila.fechaFin || "Indefinido"}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Tooltip title="Ver detalles">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
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
      <ModalRegistroAfiliado isCrear={crearAfiliado} setIsCrear={setCrearAfiliado} />
      <ModalEditAfiliado isEdit={isEdit} setSelectAfiliado={setSelectAfiliado} selectAfiliado={selectAfiliado} setIsEdit={setIsEdit} />
    </div>
  );
};
