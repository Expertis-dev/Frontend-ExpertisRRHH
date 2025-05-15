import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";

import {
    TeamOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
    BankOutlined,
    ReconciliationOutlined,
    LogoutOutlined,
    EuroCircleOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useData } from '@/provider/Provider';
const { Sider } = Layout;

export const Sidebar = ({ collapsed, onCollapse }) => {
    const { nombre } = useData()
    const navigate = useNavigate();
    const CerrarSesion = () => {
        localStorage.clear()
        navigate("/")
    }
    const items = [
        {
            key: 'sub1',
            icon: <TeamOutlined />,
            label: "Empleados",
            children: [
                {
                    key: 'empleados-listar',
                    label: <Link to="/rrhh/empleados-listar">Lista Empleados</Link>,
                },
                {
                    key: 'empleados-crear',
                    label: <Link to="/rrhh/empleados-crear">Registro Empleado</Link>,
                },
                {
                    key: 'empleados-cesar',
                    label: <Link to="/rrhh/empleados-cesar">Cese de Empleado</Link>,
                },

                {
                    key: 'cambiar-fecha-cese',
                    label: <Link to="/rrhh/cambiar-fecha-cese">Cambiar Fec. Cese</Link>,
                },
            ]
        },
        {
            key: 'sub2',
            icon: <ReconciliationOutlined />,
            label: "Sist. Pensiones",
            children: [
                {
                    key: 'empleados-afp',
                    label: <Link to="/rrhh/empleados-afp">SP Empleados</Link>,
                },
                {
                    key: 'cambios-afp',
                    label: <Link to="/rrhh/cambios-afp">Cambios SP</Link>,
                },
                {
                    key: 'info-afp',
                    label: <Link to="/rrhh/info-afp">Info. SP</Link>,
                },
            ],
        },/*
        {
            key: 'eps',
            icon: <MedicineBoxOutlined />,
            label: <Link to="/rrhh/eps">EPS</Link>,
        },*/
        {
            key: 'sueldo-minimo',
            icon: <EuroCircleOutlined />,
            label: <Link to="/rrhh/sueldo-minimo">Sueldo Minimo</Link>,
        },

        {
            key: 'horas-extra',
            icon: <ClockCircleOutlined />,
            label: <Link to="/rrhh/horas-extra">Horas Extras</Link>,
        },
        {
            key: 'contrato',
            icon: <FileTextOutlined />,
            label: <Link to="/rrhh/contrato">Régimen Laboral</Link>,
        },/*
        {
            key: 'retencion-judicial',
            icon: <BankOutlined />,
            label: <Link to="/rrhh/retencion-judicial">Retención Judicial</Link>,
        },*/

        // {
        //     key: 'sub3',
        //     icon: <DollarOutlined />,
        //     label: "Descuentos",
        //     children: [

        //         {
        //             key: 'historico-descuento',
        //             label: <Link to="/rrhh/historialDescuentos">Histórico</Link>,
        //         },
        //         {
        //             key: 'carga-descuentos',
        //             label: <Link to="/rrhh/cargarDescuentos">Cargar Datos</Link>,
        //         },                

        //     ],
        // },

        // {
        //     key: 'comisiones',
        //     icon: <PercentageOutlined />,
        //     label: <Link to="/rrhh/comisiones">Comisiones</Link>,
        // },
        // {
        //     key: 'descanso-medicos',
        //     icon: <MedicineBoxOutlined />,
        //     label: <Link to="/rrhh/descanso-medicos">Descanso Médicos</Link>,
        // },

        {
            key: "cerrar-sesion",
            icon: <LogoutOutlined />,
            label: <button className='cursor-pointer' onClick={CerrarSesion}>Cerrar Sesion</button>
        }
    ];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            width={180}
        >
            <div style={{
                height: "auto",
                padding: '50px 0px 20px 0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {!collapsed ? (
                    <div className='text-white flex flex-col items-center justify-center gap-4'>
                        <img
                            className="w-15 h-15"
                            src="/icono-logo.png"
                            alt="Logo"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80" }}
                        />
                        <h2 className='roboto font-bold text-center text-sm'>{nombre} </h2>
                    </div>
                ) : (
                    <img
                        className="w-12 h-12"
                        src="/icono-logo.png"
                        alt="Logo"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80" }}
                    />
                )}
            </div>
            <Menu
                theme="dark"
                defaultSelectedKeys={['empleados']}
                style={{ borderRight: 0, cursor: "pointer" }}
                mode="inline"
                items={items}
            />
        </Sider>
    );
};

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
    onCollapse: PropTypes.func,
};