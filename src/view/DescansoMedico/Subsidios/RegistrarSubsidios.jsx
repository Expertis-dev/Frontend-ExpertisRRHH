import React, { useState, useEffect } from 'react';
import { Select, DatePicker, AutoComplete, Input, Checkbox, Modal, Button } from 'antd';
import dayjs from 'dayjs';
import { LoadingOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

export const RegistrarSubsidios = () => {
  // Estados principales
  const [subsidio, setSubsidio] = useState({
    tipo: '',
    diagnostico: '',
    fechaInicio: dayjs().format('YYYY-MM-DD'),
    fechaFin: '',
    dias: 0,
    tieneCITT: false,
    numeroCITT: '',
    empleado: null,
    observaciones: ''
  });

  // Estados para UI
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulación de datos de empleados (deberías reemplazar con tu API real)
  const [empleados] = useState([
    { id: 1, nombreCompleto: 'Juan Pérez', documento: '12345678' },
    { id: 2, nombreCompleto: 'María García', documento: '87654321' },
    // ... más empleados
  ]);

  // Efecto para calcular fecha fin y días cuando cambia el tipo de subsidio o fecha inicio
  useEffect(() => {
    if (subsidio.tipo === 'MATERNIDAD' && subsidio.diagnostico && subsidio.fechaInicio) {
      const dias = subsidio.diagnostico === 'PARTO_NORMAL' ? 98 : 128;
      const fechaFin = dayjs(subsidio.fechaInicio).add(dias - 1, 'day').format('YYYY-MM-DD');

      setSubsidio(prev => ({
        ...prev,
        fechaFin,
        dias
      }));
    }
  }, [subsidio.tipo, subsidio.diagnostico, subsidio.fechaInicio]);

  // Manejar búsqueda de empleados
  const handleBuscarEmpleado = (value) => {
    setInputValue(value);
    if (value.length > 2) {
      const filtrados = empleados.filter(emp =>
        emp.nombreCompleto.toLowerCase().includes(value.toLowerCase()) ||
        emp.documento.includes(value))
        .map(emp => ({
          value: emp.nombreCompleto,
          label: `${emp.nombreCompleto} (${emp.documento})`,
          empleado: emp
        }));
      setEmpleadosFiltrados(filtrados);
    } else {
      setEmpleadosFiltrados([]);
    }
  };

  // Manejar selección de empleado
  const handleSelectEmpleado = (value, option) => {
    setSubsidio(prev => ({
      ...prev,
      empleado: option.empleado
    }));
    setInputValue(option.empleado.nombreCompleto);
  };

  // Manejar cambio de tipo de subsidio
  const handleTipoChange = (value) => {
    setSubsidio(prev => ({
      ...prev,
      tipo: value,
      diagnostico: '',
      fechaFin: '',
      dias: 0
    }));
  };

  // Manejar cambio de fecha inicio
  const handleFechaInicioChange = (date) => {
    const fechaInicio = date ? date.format('YYYY-MM-DD') : '';

    if (subsidio.tipo === 'MATERNIDAD' && subsidio.diagnostico) {
      const dias = subsidio.diagnostico === 'PARTO_NORMAL' ? 98 : 128;
      const fechaFin = date ? date.add(dias - 1, 'day').format('YYYY-MM-DD') : '';

      setSubsidio(prev => ({
        ...prev,
        fechaInicio,
        fechaFin,
        dias
      }));
    } else {
      setSubsidio(prev => ({
        ...prev,
        fechaInicio,
        dias: prev.fechaFin ? dayjs(prev.fechaFin).diff(date, 'day') + 1 : 0
      }));
    }
  };

  // Manejar cambio de fecha fin (solo para no maternidad)
  const handleFechaFinChange = (date) => {
    const fechaFin = date ? date.format('YYYY-MM-DD') : '';
    const dias = date ? date.diff(dayjs(subsidio.fechaInicio), 'day') + 1 : 0;

    setSubsidio(prev => ({
      ...prev,
      fechaFin,
      dias
    }));
  };

  // Manejar cambio de checkbox CITT
  const handleCITTChange = (e) => {
    setSubsidio(prev => ({
      ...prev,
      tieneCITT: e.target.checked,
      numeroCITT: e.target.checked ? prev.numeroCITT : ''
    }));
  };

  // Validar formulario antes de confirmar
  const validateForm = () => {
    if (!subsidio.empleado) {
      return 'Debe seleccionar un empleado';
    }
    if (!subsidio.tipo) {
      return 'Debe seleccionar un tipo de subsidio';
    }
    if (subsidio.tipo === 'MATERNIDAD' && !subsidio.diagnostico) {
      return 'Debe seleccionar un diagnóstico para maternidad';
    }
    if (!subsidio.fechaInicio) {
      return 'Debe seleccionar una fecha de inicio';
    }
    if (subsidio.tipo !== 'MATERNIDAD' && !subsidio.fechaFin) {
      return 'Debe seleccionar una fecha de fin';
    }
    if (subsidio.tieneCITT && !subsidio.numeroCITT) {
      return 'Debe ingresar el número CITT';
    }
    return null;
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      setIsErrorModalVisible(true);
      return;
    }
    setIsConfirmModalVisible(true);
  };

  // Confirmar y enviar datos
  const confirmSubmit = async () => {
    setIsConfirmModalVisible(false);
    setIsLoading(true);

    try {
      // Aquí iría la llamada a tu API para registrar el subsidio
      // await axios.post('/api/subsidios', subsidio);

      // Simulamos un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSuccessModalVisible(true);
      // Resetear formulario después de éxito
      setSubsidio({
        tipo: '',
        diagnostico: '',
        fechaInicio: dayjs().format('YYYY-MM-DD'),
        fechaFin: '',
        dias: 0,
        tieneCITT: false,
        numeroCITT: '',
        empleado: null,
        observaciones: ''
      });
      setInputValue('');
    } catch (error) {
      setErrorMessage('Error al registrar el subsidio. Por favor intente nuevamente.');
      setIsErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Registro de Subsidio</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Empleado */}
        <div>
          <label className="block text-sm font-medium mb-1">Empleado</label>
          <AutoComplete
            options={empleadosFiltrados}
            onSearch={handleBuscarEmpleado}
            onSelect={handleSelectEmpleado}
            value={inputValue}
            placeholder="Buscar empleado"
            style={{ width: '100%' }}
          />
        </div>

        {/* Tipo de Subsidio */}
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Subsidio</label>
          <Select
            style={{ width: '100%' }}
            options={[
              { value: 'MATERNIDAD', label: 'Maternidad' },
              { value: 'ENFERMEDAD', label: 'Enfermedad' },
              { value: 'ACCIDENTE', label: 'Accidente' }
            ]}
            value={subsidio.tipo}
            onChange={handleTipoChange}
            placeholder="Seleccione tipo de subsidio"
          />
        </div>

        {/* Diagnóstico (solo para maternidad) */}
        {subsidio.tipo === 'MATERNIDAD' && (
          <div>
            <label className="block text-sm font-medium mb-1">Diagnóstico</label>
            <Select
              style={{ width: '100%' }}
              options={[
                { value: 'PARTO_NORMAL', label: 'Parto Normal (98 días)' },
                { value: 'PARTO_MULTIPLE', label: 'Parto Múltiple (128 días)' },
                { value: 'DISCAPACIDAD', label: 'Parto con Discapacidad (128 días)' }
              ]}
              value={subsidio.diagnostico}
              onChange={(value) => setSubsidio(prev => ({ ...prev, diagnostico: value }))}
              placeholder="Seleccione diagnóstico"
            />
          </div>
        )}

        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
          <DatePicker
            style={{ width: '100%' }}
            value={subsidio.fechaInicio ? dayjs(subsidio.fechaInicio) : null}
            onChange={handleFechaInicioChange}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </div>

        {/* Fecha Fin (no para maternidad) */}
        {subsidio.tipo !== 'MATERNIDAD' && (
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <DatePicker
              style={{ width: '100%' }}
              value={subsidio.fechaFin ? dayjs(subsidio.fechaFin) : null}
              onChange={handleFechaFinChange}
              disabledDate={(current) => {
                return current && current < dayjs(subsidio.fechaInicio).startOf('day');
              }}
              disabled={!subsidio.fechaInicio}
            />
          </div>
        )}

        {/* Días calculados */}
        <div>
          <label className="block text-sm font-medium mb-1">Días</label>
          <Input
            value={subsidio.dias}
            readOnly
            suffix="días"
          />
        </div>

        {/* CITT */}
        <div className="flex items-center">
          <Checkbox
            checked={subsidio.tieneCITT}
            onChange={handleCITTChange}
            className="mr-2"
          >
            Tiene CITT
          </Checkbox>
          {subsidio.tieneCITT && (
            <Input
              placeholder="Número CITT"
              value={subsidio.numeroCITT}
              onChange={(e) => setSubsidio(prev => ({ ...prev, numeroCITT: e.target.value }))}
              style={{ width: '60%' }}
            />
          )}
        </div>

        {/* Observaciones */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Observaciones</label>
          <Input.TextArea
            value={subsidio.observaciones}
            onChange={(e) => setSubsidio(prev => ({ ...prev, observaciones: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      {/* Botón de enviar */}
      <div className="mt-6 flex justify-center">
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? <LoadingOutlined /> : 'Registrar Subsidio'}
        </Button>
      </div>

      {/* Modal de Confirmación */}
      <Modal
        title="Confirmar Registro"
        visible={isConfirmModalVisible}
        onOk={confirmSubmit}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <div className="space-y-4">
          <p>¿Está seguro que desea registrar este subsidio con los siguientes datos?</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Empleado:</label>
              <p>{subsidio.empleado?.nombreCompleto}</p>
            </div>
            <div>
              <label className="font-semibold">Documento:</label>
              <p>{subsidio.empleado?.documento}</p>
            </div>
            <div>
              <label className="font-semibold">Tipo:</label>
              <p>{subsidio.tipo}</p>
            </div>
            {subsidio.tipo === 'MATERNIDAD' && (
              <div>
                <label className="font-semibold">Diagnóstico:</label>
                <p>
                  {subsidio.diagnostico === 'PARTO_NORMAL' ? 'Parto Normal' :
                    subsidio.diagnostico === 'PARTO_MULTIPLE' ? 'Parto Múltiple' : 'Parto con Discapacidad'}
                </p>
              </div>
            )}
            <div>
              <label className="font-semibold">Fecha Inicio:</label>
              <p>{dayjs(subsidio.fechaInicio).format('DD/MM/YYYY')}</p>
            </div>
            <div>
              <label className="font-semibold">Fecha Fin:</label>
              <p>{dayjs(subsidio.fechaFin).format('DD/MM/YYYY')}</p>
            </div>
            <div>
              <label className="font-semibold">Días:</label>
              <p>{subsidio.dias}</p>
            </div>
            {subsidio.tieneCITT && (
              <div>
                <label className="font-semibold">Número CITT:</label>
                <p>{subsidio.numeroCITT}</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        title={null}
        visible={isSuccessModalVisible}
        onOk={() => setIsSuccessModalVisible(false)}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
            Aceptar
          </Button>
        ]}
        centered
      >
        <div className="text-center py-6">
          <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          <h3 className="text-xl font-semibold mt-4">¡Registro exitoso!</h3>
          <p className="mt-2">El subsidio ha sido registrado correctamente.</p>
        </div>
      </Modal>

      {/* Modal de Error */}
      <Modal
        title={null}
        visible={isErrorModalVisible}
        onOk={() => setIsErrorModalVisible(false)}
        onCancel={() => setIsErrorModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsErrorModalVisible(false)}>
            Aceptar
          </Button>
        ]}
        centered
      >
        <div className="text-center py-6">
          <CloseCircleFilled style={{ fontSize: '48px', color: '#ff4d4f' }} />
          <h3 className="text-xl font-semibold mt-4">Error en el registro</h3>
          <p className="mt-2">{errorMessage}</p>
        </div>
      </Modal>

      {/* Overlay de carga */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p className="mt-4 text-lg">Registrando subsidio...</p>
          </div>
        </div>
      )}
    </div>
  );
};