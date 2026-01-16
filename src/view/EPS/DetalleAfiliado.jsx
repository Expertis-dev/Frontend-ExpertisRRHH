import PropTypes from "prop-types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker, Input, Select } from "antd"
import { Pencil, Trash, User, Users, Calendar, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EditarDependiente } from "./EditarDependiente";
import { toast } from "sonner";
import axios from "axios";

export const DetalleAfiliado = ({ isVer, selectAfiliado, setIsVer }) => {
    const [historicoAfiliado, setHistoricoAfiliado] = useState([])
    const [dependientes, setDependientes] = useState([])
    const [selectDependiente, setSelectDependiente] = useState({})
    const [selectHistoricoAfi, setSelectHistoricoAfi] = useState(null)
    const [isEditarDep, setIsEditarDep] = useState(false)
    const [nuevoDependiente, setNuevoDependiente] = useState({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNacimiento: "",
        tipoDocumento: "",
        numeroDocumento: "",
        sexo: "",
        parentesco: ""
    })
    useEffect(() => {
        if (isVer) {
            const fetchHistorial = async () => {
                try {
                    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/historicoAfiliacionesPorIdAfiliado`, { idAfiliado: selectAfiliado.idAfiliadoTitular }); // Reemplaza con tu endpoint real
                    console.log("Respuesta del servidor:", response.data);
                    setHistoricoAfiliado(response.data); // Asume que la respuesta es un array de afiliados
                } catch (error) {
                    console.error("Error al obtener el historico:", error);
                    toast.error("Error al cargar el historico", {
                        description: "No se pudieron obtener los datos del servidor",
                    });
                }
            };
            fetchHistorial();
        } else {
            setHistoricoAfiliado([]);
            setDependientes([]);
            setSelectHistoricoAfi(null);
        }
    }, [isVer]);
    useEffect(() => {
        if (isVer && selectHistoricoAfi) {
            const fetchDependientes = async () => {
                try {
                    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/eps/obtenerDependientesPorIdMovEPS`,
                        {
                            idAfiliado: selectHistoricoAfi.idAfiliado,
                            idMovEPS: selectHistoricoAfi.idMovEPS
                        }); // Reemplaza con tu endpoint real
                    console.log("Respuesta del servidor:", response.data);
                    setDependientes(response.data); // Asume que la respuesta es un array de afiliados
                } catch (error) {
                    console.error("Error al obtener el historico:", error);
                    toast.error("Error al cargar el historico", {
                        description: "No se pudieron obtener los datos del servidor",
                    });
                }
            };
            fetchDependientes()
        }
    }, [selectHistoricoAfi, isVer]);
    return (
        <Dialog open={isVer} onOpenChange={setIsVer}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <DialogTitle className="text-start text-2xl flex items-center gap-3 text-gray-800 dark:text-white">
                        <User className="h-6 w-6 text-blue-600" />
                        Detalles del Afiliado
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Información completa del afiliado y sus dependientes
                    </p>
                </DialogHeader>

                {/* DATOS CABECERA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <InfoItem
                        label="Nombre Completo"
                        value={selectAfiliado.NombreCompleto}
                        icon={<User className="h-4 w-4" />}
                    />
                    <InfoItem
                        label="DNI"
                        value={selectAfiliado.Documento}
                        icon={<FileText className="h-4 w-4" />}
                    />
                    <InfoItem
                        label="Edad"
                        value={selectAfiliado.edad}
                        icon={<Calendar className="h-4 w-4" />}
                    />
                    <InfoItem
                        label="EPS"
                        value={selectAfiliado.Tipo}
                        icon={<Users className="h-4 w-4" />}
                    />
                    <InfoItem
                        label="Nº Dependientes"
                        value={selectAfiliado.totalDependientes}
                        icon={<Users className="h-4 w-4" />}
                    />
                    <InfoItem
                        label="Plan EPS"
                        value={selectAfiliado.Plan}
                        icon={<FileText className="h-4 w-4" />}
                    />
                </div>

                {/* HISTÓRICO DE AFILIACIONES */}
                <div className="">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Histórico de Afiliaciones
                        </h3>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-[200px]">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-700 text-white">
                                    <tr>
                                        <th className="p-1 text-left font-medium">Régimen de Salud</th>
                                        <th className="p-1 text-left font-medium">EPS</th>
                                        <th className="p-1 text-left font-medium">Plan</th>
                                        <th className="p-1 text-left font-medium">Monto Plan</th>
                                        <th className="p-1 text-left font-medium">Fecha Inicio</th>
                                        <th className="p-1 text-left font-medium">Fecha Fin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {historicoAfiliado && historicoAfiliado.length > 0 ?
                                        historicoAfiliado.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectHistoricoAfi(item)}>
                                                <td className="p-1">{item[""] || "-"}</td>
                                                <td className="p-1">{item.tipo || "-"}</td>
                                                <td className="p-1">{item.nombrePlan || "-"}</td>
                                                <td className="p-1">{item.costo ? `S/. ${item.costo}` : "-"}</td>
                                                <td className="p-1">{item.mesInicio.split("T")[0] || "-"}</td>
                                                <td className="p-1">{item.mesFin ? item.mesFin.split("T")[0] : "VIGENTE"}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p>No se encontró historial de afiliaciones</p>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* DEPENDIENTES */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Dependientes
                        </h3>
                    </div>
                    {/* Listar dependientes */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-[250px]">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="p-1 text-left font-medium">Nombre Completo</th>
                                        <th className="p-1 text-left font-medium">Parentesco</th>
                                        <th className="p-1 text-left font-medium">Sexo</th>
                                        <th className="p-1 text-left font-medium">Fecha Nac.</th>
                                        <th className="p-1 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {dependientes && dependientes.length > 0 ?
                                        dependientes.map((dep, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="p-1 font-medium">{dep.nombreAfiliado || "-"}</td>
                                                <td className="p-1">
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                                        {dep.parentesco || "-"}
                                                    </span>
                                                </td>
                                                <td className="p-1">{dep.sexo || "-"}</td>
                                                <td className="p-1">{dep.fecNacimiento.split("T")[0] || "-"}</td>
                                                <td className="p-1">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectDependiente(dep);
                                                                setIsEditarDep(true);
                                                            }}
                                                            className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                                        >
                                                            <Pencil className="h-3 w-3 text-green-700" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p>No se encontraron dependientes</p>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Registrar dependiente 
                            <form onSubmit={handleRegistrarDependiente} className="">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    <FormField
                                        label="Plan Asociado"
                                        value={selectAfiliado.plan}
                                        disabled
                                    />

                                    <FormField
                                        label="Nombre *"
                                        value={nuevoDependiente.nombre}
                                        onChange={(value) => handleInputChange('nombre', value)}
                                        required
                                    />

                                    <FormField
                                        label="Apellido Paterno"
                                        value={nuevoDependiente.apellidoPaterno}
                                        onChange={(value) => handleInputChange('apellidoPaterno', value)}
                                    />

                                    <FormField
                                        label="Apellido Materno"
                                        value={nuevoDependiente.apellidoMaterno}
                                        onChange={(value) => handleInputChange('apellidoMaterno', value)}
                                    />

                                    <DateField
                                        label="Fecha Nacimiento *"
                                        value={
                                            nuevoDependiente.fechaNacimiento
                                                ? dayjs(nuevoDependiente.fechaNacimiento, "DD/MM/YYYY")
                                                : null
                                        }
                                        onChange={(value) => handleInputChange('fechaNacimiento', value)}
                                    />

                                    <SelectField
                                        label="Tipo Documento"
                                        value={nuevoDependiente.tipoDocumento}
                                        onChange={(value) => handleInputChange('tipoDocumento', value)}
                                        options={[
                                            { label: "DNI", value: "DNI" },
                                            { label: "Carnet de Extranjería", value: "CARNET_EXTRANJERIA" },
                                        ]}
                                    />

                                    <FormField
                                        label="N° Documento"
                                        value={nuevoDependiente.numeroDocumento}
                                        onChange={(value) => handleInputChange('numeroDocumento', value)}
                                    />

                                    <SelectField
                                        label="Sexo *"
                                        value={nuevoDependiente.sexo}
                                        onChange={(value) => handleInputChange('sexo', value)}
                                        options={[
                                            { label: "Masculino", value: "MASCULINO" },
                                            { label: "Femenino", value: "FEMENINO" },
                                        ]}
                                        required
                                    />

                                    <SelectField
                                        label="Parentesco *"
                                        value={nuevoDependiente.parentesco}
                                        onChange={(value) => handleInputChange('parentesco', value)}
                                        options={[
                                            { label: "Cónyuge", value: "CONYUGUE" },
                                            { label: "Hijo/a", value: "HIJO" },
                                            { label: "Padre", value: "PADRE" },
                                            { label: "Madre", value: "MADRE" },
                                            { label: "Hermano/a", value: "HERMANO" },
                                            { label: "Otro", value: "OTRO" },
                                        ]}
                                        required
                                    />
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 px-8 py-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Registrar Dependiente
                                    </Button>
                                </div>
                            </form>
                            */}
                </div>
            </DialogContent>
            <EditarDependiente
                setSelectDependiente={setSelectDependiente}
                selectDependiente={selectDependiente}
                isEditarDep={isEditarDep}
                setIsEditarDep={setIsEditarDep}
            />
        </Dialog>
    )
}
// Componentes auxiliares
const InfoItem = ({ label, value, icon }) => (
    <div className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {value}
        </span>
    </div>
);

export const FormField = ({ label, value, onChange, disabled, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Input
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            className="w-full"
            placeholder={`Ingrese ${label.toLowerCase()}`}
        />
    </div>
);

export const SelectField = ({ label, value, onChange, options, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Select
            className="w-full"
            value={value}
            onChange={onChange}
            options={options}
            placeholder={`Seleccione ${label.toLowerCase()}`}
            getPopupContainer={(trigger) => trigger.parentNode}
            optionFilterProp="label"
            showSearch
            allowClear
        />
    </div>
);

export const DateField = ({ label, value, onChange, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            value={value}
            onChange={(date, dateString) => onChange && onChange(dateString)}
            placeholder="DD/MM/AAAA"
        />
    </div>
);

InfoItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    icon: PropTypes.element
};

DetalleAfiliado.propTypes = {
    isVer: PropTypes.bool.isRequired,
    selectAfiliado: PropTypes.object.isRequired,
    setIsVer: PropTypes.func.isRequired
};

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    required: PropTypes.bool
};

SelectField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    required: PropTypes.bool
};

DateField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool
};