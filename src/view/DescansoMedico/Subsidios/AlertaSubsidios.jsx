import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tag } from 'antd';
import { Search, RefreshCw, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import dayjs from 'dayjs';

export const AlertaSubsidios = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([]);

  // Obtener datos de subsidios
  const obtenerSubsidios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarAlertaSubsidios`);

      let dataSubsidios = response.data;

      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(response.data)) {
        dataSubsidios = response.data;
      } else if (response.data.data) {
        dataSubsidios = response.data.data;
      } else if (response.data.recordset) {
        dataSubsidios = response.data.recordset;
      }
      // Filtrar y ordenar datos
      dataSubsidios = dataSubsidios
        .filter(dato => dato.nombreCompleto !== null)
        .sort((a, b) => a.totalDiasDescansoMedico - b.totalDiasDescansoMedico);
      setData(dataSubsidios);

    } catch (error) {
      console.error("Error al obtener subsidios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerSubsidios();
  }, []);

  // Filtrar datos
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filtro por búsqueda
    if (searchTerm) {
      result = result.filter(item =>
        item.documento?.includes(searchTerm) ||
        item.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    return result;
  }, [data, searchTerm]);
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  return (
    <div className="w-full max-w-8xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center text-2xl font-bold mb-6 text-gray-800"
      >
        ALERTA SUBSIDIOS
      </motion.h1>

      {/* Filtros */}
      <div className="flex items-center gap-4 mb-4 p-4 rounded-lg">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Buscar por DNI o nombre"
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Tabla de subsidios */}
      <div className="overflow-y-auto max-h-[65vh] rounded-lg border border-gray-200 shadow">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
              <th className="p-1 text-center text-sm font-medium">NOMBRE COMPLETO</th>
              <th className="p-2 text-center text-sm font-medium">DOCUMENTO</th>
              <th className="p-1 text-center text-sm font-medium">NUM. DIAS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => {
                const tagColor = item.totalDiasDescansoMedico <= 14 ? "green" :
                  item.totalDiasDescansoMedico <= 17 ? "gold" : "red";

                return (
                  <motion.tr
                    key={`${item.documento}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-white hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-1 border-b border-gray-200 text-center text-sm">
                      {item.nombreCompleto || "---"}
                    </td>
                    <td className="p-1 border-b border-gray-200 text-center text-sm">
                      {item.documento || "---"}
                    </td>
                    <td className="p-1 border-b border-gray-200 text-center text-sm">
                      {item.totalDiasDescansoMedico !== undefined && item.totalDiasDescansoMedico !== null ? (
                        <Tag color={tagColor} style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {item.totalDiasDescansoMedico}
                        </Tag>
                      ) : (
                        "---"
                      )}
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};