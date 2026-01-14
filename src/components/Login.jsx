import React, { useState } from 'react';
import { Input } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/provider/Provider';
import axios from 'axios';
import { motion } from "framer-motion";
import { toast } from "sonner";
export const Login = () => {
    const { setNombre, setToken, setPlanEPS } = useData()
    const [credenciales, setCredenciales] = useState({
        usuario: "",
        contraseña: ""
    });
    const [loading, setLoading] = useState(false);
    const navegar = useNavigate()

    const getClientIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || "IP no disponible";
        } catch (error) {
            console.error("Error al obtener la IP:", error);
            return "Error al obtener IP";
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredenciales(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onFinish = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userIP = await getClientIP();
            const token = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
                { usuario: credenciales.usuario, contrasenia: credenciales.contraseña }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Forwarded-For': userIP
                }
            });
            const planes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/eps/listarPlanesEPS`)
            console.log("Respuesta de permisos:", planes.data);
            localStorage.setItem("planesEPS", JSON.stringify(planes.data)); // ✅ correcto
            if (token.data.token && planes.status === 200) {
                setNombre(credenciales.usuario);
                setToken(token.data.token);
                toast.success("¡Bienvenido!");
                setTimeout(() => {
                    navegar("/rrhh/empleados-listar");
                }, 1000);
            } else {
                toast.error("Credenciales incorrectas");
            }
        } catch (error) {
            console.error("Error cargando permisos:", error);
            toast.error("Credenciales incorrectas");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = credenciales.usuario && credenciales.contraseña;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-slate-800 via-slate-900 to-blue-900 relative overflow-hidden">
            {/* Fondo profesional con elementos sutiles */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Patrón geométrico sutil */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-400 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-full h-full bg-linear-to-tl from-slate-600 to-transparent"></div>
                </div>

                {/* Líneas decorativas sutiles */}
                <div className="absolute top-1/4 left-1/4 w-px h-32 bg-blue-500/20"></div>
                <div className="absolute bottom-1/3 right-1/3 w-32 h-px bg-slate-500/20"></div>
                <div className="absolute top-1/2 right-1/4 w-px h-24 bg-blue-400/15"></div>

                {/* Puntos decorativos */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full"></div>
                <div className="absolute bottom-40 right-32 w-1 h-1 bg-slate-400/40 rounded-full"></div>
                <div className="absolute top-60 left-1/2 w-3 h-3 bg-blue-500/20 rounded-full"></div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full relative z-10">
                {/* Tarjeta de Login */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full lg:w-96 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20"
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="relative mb-2"
                        >
                            <div className="w-16 h-16 bg-linear-to-br from-slate-700 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-slate-600/30">
                                <img
                                    className="w-12 h-12 filter brightness-0 invert"
                                    src="/icono-logo.png"
                                    alt="Logo Expertis"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                                    }}
                                />
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-slate-800 text-center mb-2"
                        >
                            Expertis RR.HH
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-600 text-center text-sm"
                        >
                            Ingresa tus credenciales para acceder
                        </motion.p>
                    </div>

                    {/* Formulario */}
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-2"
                        onSubmit={onFinish}
                    >
                        {/* Campo Usuario */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-2"
                        >
                            <label htmlFor='usuario' className="block text-sm font-medium text-slate-700">
                                Usuario
                            </label>
                            <div className="relative">
                                <Input
                                    name="usuario"
                                    size="large"
                                    placeholder="Ingresa tu usuario"
                                    prefix={<UserOutlined className="text-slate-400" />}
                                    value={credenciales.usuario}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-300 hover:border-slate-300"
                                />
                            </div>
                        </motion.div>

                        {/* Campo Contraseña */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-2"
                        >
                            <label htmlFor='contraseña' className="block text-sm font-medium text-slate-700">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Input.Password
                                    name="contraseña"
                                    size="large"
                                    placeholder="Ingresa tu contraseña"
                                    prefix={<LockOutlined className="text-slate-400" />}
                                    value={credenciales.contraseña}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-300 hover:border-slate-300"
                                />
                            </div>
                        </motion.div>

                        {/* Botón de Ingreso */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="pt-2"
                        >
                            <button
                                type="submit"
                                disabled={!isFormValid || loading}
                                className={`
                                    w-full py-2 rounded-xl text-base font-semibold transition-all duration-300
                                    ${!isFormValid || loading
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-2 border-slate-300'
                                        : 'cursor-pointer bg-linear-to-r from-slate-700 to-blue-600 hover:from-slate-800 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 border-2 border-transparent'
                                    }
                                    flex items-center justify-center gap-3
                                `}
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Ingresando...
                                    </>
                                ) : (
                                    <>
                                        Iniciar Sesión
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.form>

                    {/* Footer adicional */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-4 text-center"
                    >
                        <p className="text-xs text-slate-500">
                            ¿Problemas para ingresar?{" "}
                            <a
                                href="msteams:/l/chat/0/0?users=carlos.calderon@goexpertis.com&message=Hola Carlos, necesito ayuda con el acceso al sistema Expertis RR.HH"
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Contactar soporte
                            </a>
                        </p>
                    </motion.div>
                </motion.div>
                {/* Sección de Ilustración - Más sutil y profesional */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="hidden lg:block lg:w-96"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative z-10"
                        >
                            <img
                                src="/Robot3D.gif"
                                alt="Sistema Expertis RR.HH"
                                className="w-full h-auto max-h-80 object-contain drop-shadow-2xl"
                            />
                        </motion.div>

                        {/* Texto descriptivo */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="text-center mt-4"
                        >
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Gestión Profesional de RR.HH
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Sistema integral para la administración y optimización
                                de procesos de recursos humanos
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Footer global */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center"
            >
                <p className="text-slate-400 text-sm">
                    © 2025 EXPERTIS RR.HH - Todos los derechos reservados
                </p>
            </motion.footer>
        </div>
    );
};