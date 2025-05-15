import React, { useState } from 'react';
import { Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/provider/Provider';
import axios from 'axios';

export const Login = () => {
    const {setNombre, setToken} = useData()
    const [messageApi, contextHolder] = message.useMessage();
    const [credenciales, setCredenciales] = useState({
        usuario: "",
        contraseña: ""
    });
    const [loading, setLoading] = useState(false);
    const navegar = useNavigate()
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredenciales(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onFinish = async () => {
        setLoading(true);

        try {
            const response = await fetch("./permisos.json");
            const datos = await response.json();
            console.log(datos)
            const usuarioValido = datos.find(
                (empleado) =>
                    empleado.usuario.toUpperCase() === credenciales.usuario.toUpperCase() && empleado.contraseña.toUpperCase() === credenciales.contraseña.toUpperCase()
            );
            console.log(usuarioValido)
            
            if (usuarioValido) {
                const token = await axios.post( `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { usuario: credenciales.usuario })
                setNombre(usuarioValido.nombreCompleto)
                setToken(token.data.token)
                messageApi.success("¡Bienvenido!");
                setTimeout(() => {
                    navegar("/rrhh/empleados-listar");
                }, 1000);
            } else {
                messageApi.error("Credenciales incorrectas");
            }
        } catch (error) {
            console.error("Error cargando permisos:", error);
            messageApi.error("Hubo un problema con la autenticación.");
        } finally {
            setLoading(false);
        }
    };


    const isFormValid = credenciales.usuario && credenciales.contraseña;

    return (
        <div className="min-h-screen flex flex-col gap-12 md:flex-row items-center justify-center p-10 bg-gradient-to-br from-[#001529] to-blue-900">
            {contextHolder}

            <div className="w-full md:w-1/2 lg:w-1/3 xl:w-2/6 bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-500 ">
                <div className="flex flex-col items-center mb-8">
                    <img
                        className="w-20 h-20 mb-4"
                        src="/icono-logo.png"
                        alt="Logo"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80" }}
                    />
                    <h1 className="text-2xl font-bold text-gray-800 font-sans text-center">
                        EXPERTIS RR.HH
                    </h1>
                    <p className="text-gray-500 mt-2">Ingrese sus credenciales</p>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <Input
                            name="usuario"
                            size="large"
                            placeholder="Ingrese su usuario"
                            prefix={<UserOutlined className="text-gray-400" />}
                            value={credenciales.usuario}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <Input.Password
                            name="contraseña"
                            size="large"
                            placeholder="Ingrese su contraseña"
                            prefix={<LockOutlined className="text-gray-400" />}
                            value={credenciales.contraseña}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button
                            type="primary"
                            size="large"
                            loading={loading}
                            onClick={onFinish}
                            disabled={!isFormValid}
                            className={`w-full ${!isFormValid ? 'cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="hidden md:block md:w-1/3 lg:w-1/3 xl:w-1/4">
                <img
                    src="/Robot3D.gif"
                    alt="Robot"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400" }}
                />
            </div>
        </div>
    );
};