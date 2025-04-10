import React, { useState } from 'react';
import { Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
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

    const onFinish = () => {
        setLoading(true);
        // Simulando una llamada a API
        setTimeout(() => {
            setLoading(false);
            if (credenciales.usuario === "admin" && credenciales.contraseña === "admin123") {
                messageApi.success("Bienvenido!");
                setTimeout(() => {
                    navegar("/finanzas/empleados");
                  }, 1000)
            } else {
                messageApi.error("Credenciales incorrectas");
            }
        }, 1500);
    };

    const isFormValid = credenciales.usuario && credenciales.contraseña;

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 bg-gradient-to-br from-cyan-900 to-blue-900 perspective">
            {contextHolder}

            <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
                <div className="flex flex-col items-center mb-8">
                    <img 
                        className="w-20 h-20 mb-4" 
                        src="/icono-logo.png" 
                        alt="Logo" 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80" }}
                    />
                    <h1 className="text-2xl font-bold text-gray-800 font-sans text-center">
                        DATA ENTRY - FINANZAS
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

            <div className="hidden md:block md:w-1/3 lg:w-1/4 xl:w-1/5 ml-12">
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