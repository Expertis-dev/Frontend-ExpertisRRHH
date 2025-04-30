"use client";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AutoComplete, Modal } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePickerFirstDay } from "@/components/ui/MesInputs";

export const EPS = () => {
  const [isModalEPS, setIsModalEPS] = useState(false);
  const [isConfirmar, setIsConfirmar] = useState(false);
  const [isSucces, setIsSucces] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [mesInicio, setMesInicio] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [opcionSelect, setOpcionSelect] = useState("");
  const [numeDepen, setNumeDepen] = useState(0);
  const [planEps, setPlanEps] = useState("");
  // Datos de ejemplo para la tabla
  const epsData = [
    {
      dni: "48413516",
      employeeCode: "111111",
      planEps: "154",
      dependiente: "1",
      descuento: "SI",
      epsPotestativo: "",
      mesInicio: "01/01/2025",
      mesFin: "01/02/2025",
    },
    {
      dni: "48413516",
      employeeCode: "111111",
      planEps: "273",
      dependiente: "1",
      descuento: "SI",
      epsPotestativo: "",
      mesInicio: "01/03/2025",
      mesFin: "",
    },
    {
      dni: "84784578",
      employeeCode: "1234563",
      planEps: "308",
      dependiente: "2",
      descuento: "NO",
      epsPotestativo: "",
      mesInicio: "01/01/2025",
      mesFin: "",
    },
    {
      dni: "48521259",
      employeeCode: "5845455",
      planEps: "165",
      dependiente: "1",
      descuento: "SI",
      epsPotestativo: "",
      mesInicio: "01/01/2025",
      mesFin: "",
    },
  ];

  // Inicializar datos filtrados
  useEffect(() => {
    setFilteredData(epsData);
  }, []);

  // Filtrar datos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredData(epsData);
    } else {
      const results = epsData.filter((item) => item.dni.includes(searchQuery));
      setFilteredData(results);
    }
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Validar que solo sean números y máximo 8 dígitos
    if (/^\d*$/.test(value) && value.length <= 8) {
      setSearchQuery(value);
    }
  };
  const handleBuscarEmpleado = (value) => {
    if (!value) {
      setEmpleadosFiltrados(
        empleados.map((emp) => ({
          value: emp.nombreCompleto,
          label: emp.nombreCompleto,
          ...emp,
        }))
      );
      return;
    }

    const normalizeText = (text) => {
      return text
        .normalize("NFD")  // Normaliza a forma de descomposición (letra + diacríticos)
        .replace(/[\u0300-\u036f]/g, "");  // Elimina los caracteres diacríticos
    };

    const filtrados = empleados
      .filter(
        (empleado) =>
          empleado.nombreCompleto &&
          normalizeText(empleado.nombreCompleto.toLowerCase()).includes(
            normalizeText(value.toLowerCase())
          )
      )
      .map((empleado) => ({
        label: empleado.nombreCompleto,
        value: empleado.nombreCompleto,
        ...empleado,
      }));

    setEmpleadosFiltrados(filtrados);
  };
  const ObtenerEmpleados = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`
      );
      if (response.status === 200) {
        const empleadosActivos = response.data.recordset
          .filter(
            (empleado) =>
              empleado.estadoLaboral === "VIGENTE" &&
              empleado.nombreCompleto != null
          )
          .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

        setEmpleados(empleadosActivos);
        setEmpleadosFiltrados(
          empleadosActivos.map((emp) => ({
            value: emp.nombreCompleto,
            label: emp.nombreCompleto,
            ...emp, // Incluir todos los datos del empleado
          }))
        );
      }
    } catch (err) {
      console.error("Error al obtener empleados:", err);
      setError("No se pudieron cargar los empleados");
    }
  };
  useEffect(() => {
    ObtenerEmpleados();
  }, []);
  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString("es-ES");
  };

  const handleAddSubmit = () => {
    setIsConfirmar(false);
    setIsLoading(true);

    // Simular una petición asíncrona
    setTimeout(() => {
      setIsLoading(false);
      setIsSucces(true);

      // Cerrar automáticamente después de 2 segundos
      setTimeout(() => {
        setIsSucces(false);
        setIsModalEPS(false); // También cerramos el modal principal
        // Resetear formulario
        setEmpleadoSeleccionado(null);
        setOpcionSelect("");
        setNumeDepen(0);
        setPlanEps("");
      }, 2000);
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Modal para agregar nuevo EPS */}
      <Modal
        open={isModalEPS}
        title="Registrar nuevo EPS"
        style={{ top: "10vh", paddingBottom: 0 }}
        onCancel={() => setIsModalEPS(false)}
        onOk={() => {
          setIsModalEPS(false);
          setIsConfirmar(true);
        }}
        okText="Confirmar"
        cancelText="Cancelar"
        width={600}
        footer={[
          <Button key="back" onClick={() => setIsModalEPS(false)} variant="outline">
            Cancelar
          </Button>,
          <Button
            key="submit"
            onClick={() => {
              setIsModalEPS(false);
              setIsConfirmar(true);
            }}
            disabled={!empleadoSeleccionado || !opcionSelect || !planEps}
          >
            Confirmar
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <Label>EMPLEADO:</Label>
            <AutoComplete
              style={{ width: "100%", marginTop: 8 }}
              options={empleadosFiltrados}
              onSelect={(value, option) => {
                setEmpleadoSeleccionado(option);
              }}
              onSearch={handleBuscarEmpleado}
              placeholder="Seleccione un empleado"
            />
          </div>

          <div>
            <Label>DESCUENTO EPS</Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="descuento-si"
                  checked={opcionSelect === "AFP"}
                  onCheckedChange={(checked) =>
                    setOpcionSelect(checked ? "AFP" : "")
                  }
                />
                <Label htmlFor="descuento-si">SI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="descuento-no"
                  checked={opcionSelect === "ONP"}
                  onCheckedChange={(checked) =>
                    setOpcionSelect(checked ? "ONP" : "")
                  }
                />
                <Label htmlFor="descuento-no">NO</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>DEPENDIENTE</Label>
            <Input
              type="number"
              placeholder="Cantidad de dependientes"
              onChange={(e) => setNumeDepen(Number(e.target.value))}
              value={numeDepen}
              min={0}
              className="mt-2"
            />
          </div>

          <div>
            <Label>MES INICIO</Label>
            <DatePickerFirstDay
              mesInicio={new Date(new Date().setMonth(new Date().getMonth() - 1))}
              handleDateChange={(option) => {
                setMesInicio(option.toISOString());
              }}
              className="mt-2"
            />
          </div>

          <div>
            <Label>PLAN EPS</Label>
            <Input
              type="text"
              placeholder="Plan EPS seleccionado"
              onChange={(e) => setPlanEps(e.target.value)}
              value={planEps}
              className="mt-2"
            />
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación */}
      <Modal
        open={isConfirmar}
        title="Confirmar registro EPS"
        onCancel={() => {
          setIsConfirmar(false)
          setIsModalEPS(true)
        }}
        onOk={handleAddSubmit}
        okText="Registrar"
        cancelText="Atras"
        width={600}
      >
        <div className="flex">
          <div className="flex flex-col gap-8 w-52">
            <Label>Empleado:</Label>
            <Label>Descuento EPS:</Label>
            <Label>Dependientes:</Label>
            <Label>Mes Inicio:</Label>
            <Label>Plan EPS:</Label>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <p className="font-medium p-1 bg-gray-100 rounded-lg text-center w-full">{empleadoSeleccionado?.nombreCompleto || "-"}</p>
            <p className="font-medium p-1 bg-gray-100 rounded-lg text-center w-full">{opcionSelect || "-"}</p>
            <p className="font-medium p-1 bg-gray-100 rounded-lg text-center w-full">{numeDepen}</p>
            <p className="font-medium p-1 bg-gray-100 rounded-lg text-center w-full">
              {mesInicio ? new Date(mesInicio).toLocaleDateString("es-ES") : "-"}
            </p>
            <p className="font-medium p-1 bg-gray-100 rounded-lg text-center w-full">{planEps || "-"}</p>
          </div>
        </div>
      </Modal>

      {/* Modal de loading - Sin botones y se cierra automáticamente */}
      <Modal
        open={isLoading}
        closable={false}
        footer={null}
        width={400}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Procesando registro</h3>
          <p className="text-gray-500 mt-2">Por favor espere un momento...</p>
        </div>
      </Modal>

      {/* Modal de éxito - Sin botones y se cierra automáticamente */}
      <Modal
        open={isSucces}
        closable={false}
        footer={null}
        width={400}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">¡Registro exitoso!</h3>
          <p className="text-gray-500 mt-2">Los datos se han guardado correctamente.</p>
        </div>
      </Modal>

      {/* Resto del componente... */}
      <h1 className="text-center text-2xl font-semibold mb-6 text-gray-800">
        Administración de EPS
      </h1>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-1/3">
          <Label className="font-medium text-gray-700 whitespace-nowrap min-w-[90px]">
            Documento:
          </Label>
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Ingrese DNI (8 dígitos)"
            maxLength={8}
            inputMode="numeric"
            pattern="\d*"
            className="w-full"
          />
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setIsModalEPS(true)}
        >
          <PlusCircleOutlined /> Agregar nuevo EPS
        </Button>
      </div>

      {/* Tabla de EPS */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                DNI
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                COD. EMPLEADO
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                PLAN EPS
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                DEPENDIENTE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                DESCUENTO
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                EPS POTESTATIVO
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                INICIO
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                FIN
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((eps, index) => (
                <tr key={`${eps.dni}-${eps.employeeCode}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {eps.dni}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {eps.employeeCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {eps.planEps}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {eps.dependiente}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-medium ${eps.descuento === "SI" ? "text-green-600" : "text-red-600"}`}>
                    {eps.descuento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {eps.epsPotestativo || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {formatDate(eps.mesInicio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {eps.mesFin ? formatDate(eps.mesFin) : "Actual"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron resultados para el DNI: {searchQuery}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};