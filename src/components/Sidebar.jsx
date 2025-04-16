import React, { Children } from 'react';
import {
    TeamOutlined,
    IdcardOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
    BankOutlined,
    DollarOutlined,
    PercentageOutlined,
    ReconciliationOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

export const Sidebar = ({ collapsed, onCollapse }) => {
    const items = [
        {
            key: 'sub2',
            icon: <TeamOutlined />,
            label: "Empleados",
            children: [
                {
                    key: 'empleados-listar',
                    label: <Link to="/finanzas/empleados-listar">Listar Empleados</Link>,
                },
                {
                    key: 'empleados-crear',
                    label: <Link to="/finanzas/empleados-crear">Registro Empleado</Link>,
                },
                {
                    key: 'empleados-cesar',
                    label: <Link to="/finanzas/empleados-cesar">Cesar Empleado</Link>,
                },
            ]
        },
        {
            key: 'contrato',
            icon: <FileTextOutlined />,
            label: <Link to="/finanzas/contrato">Contratos</Link>,
        },
        {
            key: 'eps',
            icon: <MedicineBoxOutlined />,
            label: <Link to="/finanzas/eps">EPS</Link>,
        },
        {
            key: 'horas-extra',
            icon: <ClockCircleOutlined />,
            label: <Link to="/finanzas/horas-extra">Horas Extra</Link>,
        },
        {
            key: 'retencion-judicial',
            icon: <BankOutlined />,
            label: <Link to="/finanzas/retencion-judicial">Retención Judicial</Link>,
        },
        {
            key: 'sub1',
            icon: <ReconciliationOutlined />,
            label: "AFP",
            children: [
                {
                    key: 'empleados-afp',
                    label: <Link to="/finanzas/empleados-afp">AFP Empleados</Link>,
                },
                {
                    key: 'cambios-afp',
                    label: <Link to="/finanzas/cambios-afp">Cambios AFP</Link>,
                },
                {
                    key: 'historico-afp',
                    label: <Link to="/finanzas/info-afp">Info. AFP</Link>,
                },
            ],
        },
        {
            key: 'descanso-medicos',
            icon: <MedicineBoxOutlined />,
            label: <Link to="/finanzas/descanso-medicos">Descanso Médicos</Link>,
        },
        {
            key: 'sub3',
            icon: <DollarOutlined />,
            label: "Descuentos",
            children: [

                {
                    key: 'historico-afp',
                    label: <Link to="/finanzas/historialDescuentos">Histórico</Link>,
                },
                {
                    key: 'empleados-afp',
                    label: <Link to="/finanzas/cargarDescuentos">Cargar Datos</Link>,
                },                
                
            ],
        },
        
        {
            key: 'comisiones',
            icon: <PercentageOutlined />,
            label: <Link to="/finanzas/comisiones">Comisiones</Link>,
        },
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
                        <h2 className='roboto font-bold '>CARLOS CALDERON</h2>
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
                style={{ borderRight: 0 }}
                mode="inline"
                items={items}
            />
        </Sider>
    );
};