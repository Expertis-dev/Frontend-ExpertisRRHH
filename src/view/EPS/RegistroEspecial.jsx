import { UbigeoPicker } from "@/components/Direccion";
import { Input, DatePicker, Select } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Planes } from "../../../public/Info";

export const RegistroEspecial = () => {
    const [ubigeo, setUbigeo] = useState({}); // {departamentoId, provinciaId, distritoId, ...nombres si tu picker los envía}
    const [data, setData] = useState({
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNac: null, // dayjs | null
        edad: "",
        sexo: "",
        tipoDocumento: "DNI",
        numeroDocumento: "",
        plan: "BASE PEAS",
        montoPlan: 500,
        celular: "",
        email: "",
        estadoCivil: "",
        direccion: "",
    });

    const computeAge = (d) => {
        if (!d || !dayjs.isDayjs(d)) return "";
        const now = dayjs();
        let age = now.year() - d.year();
        if (now.month() < d.month() || (now.month() === d.month() && now.date() < d.date())) {
            age -= 1;
        }
        return String(Math.max(age, 0));
    };

    const cleanOnlyDigits = (v) => (v || "").replace(/\D/g, "");
    const cleanAlphaNum = (v) => (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cleanNames = (v) => (v || "").replace(/\s+/g, " ").trim();

    const validar = () => {
        const errs = [];
        // Nombres y apellidos
        if (!data.nombres.trim()) errs.push("Nombres es requerido.");
        if (!data.apellidoPaterno.trim()) errs.push("Apellido paterno es requerido.");
        if (!data.apellidoMaterno.trim()) errs.push("Apellido materno es requerido.");

        // Fecha de nacimiento y edad
        if (!data.fechaNac) {
            errs.push("Fecha de nacimiento es requerida.");
        } else {
            const edadCalc = computeAge(data.fechaNac);
            if (edadCalc === "" || Number.isNaN(Number(edadCalc))) {
                errs.push("Fecha de nacimiento no es válida.");
            } else if (data.edad && String(data.edad) !== edadCalc) {
                errs.push(`Edad inconsistente. Según la fecha debería ser ${edadCalc}.`);
            }
        }
        // Sexo
        if (!data.sexo) errs.push("Sexo es requerido.");
        // Documento
        if (!data.tipoDocumento) errs.push("Tipo de documento es requerido.");
        if (!data.numeroDocumento) {
            errs.push(`Número de ${data.tipoDocumento} es requerido.`);
        } else {
            if (data.tipoDocumento === "DNI" && !/^\d{8}$/.test(data.numeroDocumento)) {
                errs.push("DNI debe tener exactamente 8 dígitos.");
            }
            if (data.tipoDocumento === "CE" && !/^[A-Z0-9]{9,12}$/i.test(data.numeroDocumento)) {
                errs.push("CE debe ser alfanumérico de 9 a 12 caracteres.");
            }
            if (data.tipoDocumento === "PASAPORTE" && !/^[A-Z0-9]{6,12}$/i.test(data.numeroDocumento)) {
                errs.push("Pasaporte debe ser alfanumérico de 6 a 12 caracteres.");
            }
        }
        // Plan y monto
        if (!data.plan) errs.push("Plan es requerido.");
        // Ubigeo (IDs)
        if (!ubigeo?.departamentoId) errs.push("Departamento es requerido.");
        if (!ubigeo?.provinciaId) errs.push("Provincia es requerida.");
        if (!ubigeo?.distritoId) errs.push("Distrito es requerido.");

        // Celular Perú (9 dígitos)
        if (!/^\d{9}$/.test(data.celular)) {
            errs.push("Celular debe tener 9 dígitos.");
        }
        if (!/^9\d{8}$/.test(data.celular)) {
            errs.push("Celular debe iniciar con 9.");
        }
        // Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errs.push("Email no es válido.");
        }

        // Dirección
        if (!data.direccion || data.direccion.trim().length < 5) {
            errs.push("Dirección es requerida (mínimo 5 caracteres).");
        }

        return errs;
    };

    const handleSubmit = () => {
        const errors = validar();
        if (errors.length) {
            toast.error("Revisa los campos requeridos", {
                description: errors[0],
            });
            return;
        }
        toast.success("Afiliado registrado correctamente");
        console.log({
            ...data,
            fechaNac: data.fechaNac ? data.fechaNac.format("YYYY-MM-DD") : null,
            edad: data.edad || computeAge(data.fechaNac),
            departamento: ubigeo?.departamento,
            provincia: ubigeo?.provincia,
            distrito: ubigeo?.distrito,
        });
    };

    return (
        <div className="p-4 border rounded-lg">
            <p className="text-left text-2xl font-bold mb-6 text-blue-900">
                REGISTRO ESPECIAL
            </p>

            <div className="grid grid-cols-7 gap-4">
                {/* Columna izquierda */}
                <div className="col-span-7 lg:col-span-3 space-y-1">
                    <div>
                        <p className="mb-1">Nombres</p>
                        <Input
                            value={data.nombres}
                            onChange={(e) => setData((s) => ({ ...s, nombres: e.target.value.toUpperCase() }))}
                            onBlur={(e) =>
                                setData((s) => ({ ...s, nombres: cleanNames(e.target.value) }))
                            }
                        />
                    </div>

                    <div>
                        <p className="mb-1">Apellido Paterno</p>
                        <Input
                            value={data.apellidoPaterno}
                            onChange={(e) => setData((s) => ({ ...s, apellidoPaterno: e.target.value.toUpperCase() }))}
                            onBlur={(e) =>
                                setData((s) => ({ ...s, apellidoPaterno: cleanNames(e.target.value) }))
                            }
                        />
                    </div>

                    <div>
                        <p className="mb-1">Apellido Materno</p>
                        <Input
                            value={data.apellidoMaterno}
                            onChange={(e) => setData((s) => ({ ...s, apellidoMaterno: e.target.value.toUpperCase() }))}
                            onBlur={(e) =>
                                setData((s) => ({ ...s, apellidoMaterno: cleanNames(e.target.value) }))
                            }
                        />
                    </div>

                    <div>
                        <p className="mb-1">Fecha Nac.</p>
                        <DatePicker
                            className="w-full"
                            format="DD/MM/YYYY"
                            value={data.fechaNac}
                            onChange={(d) =>
                                setData((s) => ({
                                    ...s,
                                    fechaNac: d,
                                    edad: d ? computeAge(d) : "",
                                }))
                            }
                        />
                    </div>

                    <div>
                        <p className="mb-1">Edad</p>
                        <Input
                            type="number"
                            min={0}
                            value={data.edad}
                            onChange={(e) => setData((s) => ({ ...s, edad: cleanOnlyDigits(e.target.value) }))}
                        />
                    </div>

                    <div>
                        <p className="mb-1">Sexo</p>
                        <Select
                            className="w-full"
                            placeholder="Seleccione"
                            value={data.sexo}
                            onChange={(value) => setData((s) => ({ ...s, sexo: value }))}
                        >
                            <Select.Option value="MASCULINO">Masculino</Select.Option>
                            <Select.Option value="FEMENINO">Femenino</Select.Option>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1">Tipo Documento</p>
                        <Select
                            className="w-full"
                            value={data.tipoDocumento}
                            onChange={(value) =>
                                setData((s) => ({
                                    ...s,
                                    tipoDocumento: value,
                                    numeroDocumento: "", // limpia para evitar mismatch
                                }))
                            }
                        >
                            <Select.Option value="DNI">DNI</Select.Option>
                            <Select.Option value="CE">Carnet Extranjería</Select.Option>
                            <Select.Option value="PASAPORTE">Pasaporte</Select.Option>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1">N° {data.tipoDocumento}</p>
                        <Input
                            value={data.numeroDocumento}
                            onChange={(e) =>
                                setData((s) => ({
                                    ...s,
                                    numeroDocumento:
                                        s.tipoDocumento === "DNI" ? cleanOnlyDigits(e.target.value) : cleanAlphaNum(e.target.value),
                                }))
                            }
                            maxLength={data.tipoDocumento === "DNI" ? 8 : 12}
                        />
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="col-span-7 lg:col-span-4 space-y-1">
                    <div>
                        <p className="mb-1">Seleccione Plan</p>
                        <Select
                            className="w-full"
                            value={data.plan}
                            onChange={(value) =>
                                setData((s) => ({
                                    ...s,
                                    plan: value,
                                    montoPlan: Planes.find((p) => p.value === value)?.monto ?? s.montoPlan,
                                }))
                            }
                        >
                            {Planes.map((plan) => (
                                <Select.Option key={plan.value} value={plan.value}>
                                    {plan.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1">Monto Plan</p>
                        <Input disabled value={data.montoPlan} />
                    </div>

                    <UbigeoPicker
                        value={ubigeo}
                        onChange={setUbigeo}
                        dataUrl="/data.json"
                        className="!grid-cols-1 gap-1"
                    />

                    <div>
                        <p className="mb-1">Celular</p>
                        <Input
                            value={data.celular}
                            onChange={(e) => setData((s) => ({ ...s, celular: cleanOnlyDigits(e.target.value) }))}
                            maxLength={9}
                            inputMode="numeric"
                        />
                    </div>
                    <div>
                        <p className="mb-1">Email</p>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData((s) => ({ ...s, email: e.target.value.trim() }))}
                        />
                    </div>
                    <div>
                        <p className="mb-1">Estado Civil</p>
                        <Select
                            className="w-full"
                            placeholder="Seleccione"
                            value={data.estadoCivil}
                            onChange={(value) => setData((s) => ({ ...s, estadoCivil: value }))}
                        >
                            <Select.Option value="SOLTERO">Soltero</Select.Option>
                            <Select.Option value="CASADO">Casado</Select.Option>
                            <Select.Option value="DIVORCIADO">Divorciado</Select.Option>
                            <Select.Option value="VIUDO">Viudo</Select.Option>
                            <Select.Option value="CONVIVIENTE">Conviviente</Select.Option>
                        </Select>
                    </div>
                </div>

                <div className="col-span-7">
                    <p className="mb-1">Dirección</p>
                    <Input
                        value={data.direccion}
                        onChange={(e) => setData((s) => ({ ...s, direccion: e.target.value.trimStart().toUpperCase() }))}
                    />
                </div>
            </div>

            {/* Botón */}
            <div className="flex justify-center mt-4">
                <button
                    className="cursor-pointer px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded"
                    onClick={handleSubmit}
                >
                    REGISTRAR AFILIADO
                </button>
            </div>
        </div>
    );
};
