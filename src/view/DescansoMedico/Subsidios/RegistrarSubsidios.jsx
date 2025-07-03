import React, { useState, useEffect } from 'react';
import { Select, DatePicker, AutoComplete, Input, Checkbox, Modal, Button, Card, Divider, Typography, Form } from 'antd';
import dayjs from 'dayjs';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/provider/Provider';
import { CompResultado } from '@/components/CompSucces';
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;
const DIAGNOSTICOS = {
  ENFERMEDAD: [
    "Acidez",
    "Amigdalitis aguda",
    "Asma",
    "Bronquiolitis aguda",
    "Bronquitis aguda",
    "Cálculo de las vías urinarias",
    "Caries de la dentina",
    "Cefalea",
    "Cervicalgia",
    "Chalacio",
    "Ciática",
    "Cistitis aguda",
    "Cólera",
    "Conjuntivitis",
    "Dermatitis debida a ingestión de alimentos",
    "Dermatitis debida a otras sustancias ingeridas",
    "Dermatitis infecciosa",
    "Diarrea",
    "Diarrea y gastroenteritis",
    "Disfagia",
    "Dispepsia",
    "Displasia del cuello uterino",
    "Displasia mamaria benigna",
    "Dolor en la columna dorsal",
    "Duodenitis",
    "Epilepsia",
    "Esofagitis",
    "Faringitis aguda",
    "Fibroadenosis de mama",
    "Fiebre persistente",
    "Fiebre tifoidea",
    "Flatulencia y afecciones afines",
    "Gastritis aguda hemorrágica",
    "Gastritis y duodenitis",
    "Gingivitis aguda",
    "Glaucoma",
    "Hemorragia postmenopáusica",
    "Hepatitis aguda tipo A",
    "Hernia inguinal",
    "Hernia umbilical",
    "Hiperplasia benigna de la próstata",
    "Laringofaringitis aguda",
    "Lesiones de la encía",
    "Lumbago con ciática",
    "Náusea y vómito",
    "Otitis externa",
    "Otitis externa aguda, no infecciosa",
    "Otras anemias nutricionales",
    "Otras caries dentales",
    "Otras conjuntivitis agudas",
    "Otras dermatitis",
    "Otras enteritis virales",
    "Otras gastritis agudas",
    "Otras rinitis alérgicas",
    "Prolapso genital femenino",
    "Prostatitis aguda",
    "Prurito",
    "Quemadura solar de primer grado",
    "Rinitis alérgica",
    "Rinofaringitis aguda [resfriado común]",
    "Sindrome del colón irritable",
    "Sinovitis y tenosinovitis",
    "Sospecha de glaucoma",
    "Trastornos de disco lumbar y otros, con radiculopatía",
    "Ulcera péptica, de sitio no especificado",
    "Urticaria",
    "Vaginitis aguda",
    "Varicela sin complicaciones",
    "Vulvitis aguda"
  ],
  ACCIDENTE: [
    "Fractura de brazo",
    "Fractura de pierna",
    "Esguince de tobillo",
    "Luxación de hombro",
    "Herida cortante",
    "Quemadura térmica",
    "Traumatismo craneoencefálico",
    "Lesión por esfuerzo repetitivo",
    "Accidente de tránsito",
    "Caída de altura"
  ]
};

export const RegistrarSubsidios = () => {
  const [form] = Form.useForm();
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
    CITT: '',
    diasAcoplados: 0 // Nuevo estado para días acoplados
  });

  // Estados para UI
  const [tieneCITT, setTieneCITT] = useState(false);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs(), null]);
  const [listadoSubsidios, setListadoSubsidios] = useState([]);
  // Estados para empleados
  const [empleados, setEmpleados] = useState([]);
  const [empleadosParaSubsidios, setEmpleadosParaSubsidios] = useState([]);
  const { nombre } = useData();
  // Cargar empleados según el tipo de subsidio
  useEffect(() => {
    const fetchEmpleados = async () => {
      //setIsLoading(true);
      try {
        // Cargar todos los empleados
        const responseTodos = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/empleados/listarEmpleados`);
        const dataTodos = responseTodos.data.recordset.filter(dato => dato.nombreCompleto !== null);
        const datosFiltradosTodos = dataTodos.filter((empleados) => empleados.estadoLaboral === "VIGENTE");

        // Cargar empleados para subsidios
        const responseSubsidios = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarEmpleadosParaSubsidios`);
        const responseListaSubsidios = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/listarSubsidios`);
        setListadoSubsidios(responseListaSubsidios.data.data || []);
        setEmpleados(datosFiltradosTodos.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)));
        setEmpleadosParaSubsidios(responseSubsidios.data.data || []);

        // Mostrar todos los empleados inicialmente
        setEmpleadosFiltrados(datosFiltradosTodos.map(emp => ({
          value: emp.nombreCompleto,
          label: `${emp.nombreCompleto} (${emp.documento})`,
          empleado: emp
        })));
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        Modal.error({
          title: 'Error',
          content: 'Error al cargar los empleados. Por favor intente nuevamente.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpleados();
  }, []);

  // Filtrar empleados según tipo de subsidio
  useEffect(() => {
    if (subsidio.tipo === 'Maternidad') {
      setEmpleadosFiltrados(empleados.map(emp => ({
        value: emp.nombreCompleto,
        label: `${emp.nombreCompleto} (${emp.documento})`,
        empleado: emp
      })));
    } else {
      setEmpleadosFiltrados(empleadosParaSubsidios.map(emp => ({
        value: emp.nombreCompleto,
        label: `${emp.nombreCompleto} (${emp.documento})`,
        empleado: emp
      })));
    }
  }, [subsidio.tipo, empleados, empleadosParaSubsidios]);

  // Calcular fechas para Maternidad
  useEffect(() => {
    if (subsidio.tipo === 'Maternidad' && subsidio.diagnostico && subsidio.fechaInicio) {
      const dias = subsidio.diagnostico === 'PARTO_NORMAL' ? 98 : 128;
      const fechaFin = dayjs(subsidio.fechaInicio).add(dias - 1, 'day').format('YYYY-MM-DD');

      setSubsidio(prev => ({
        ...prev,
        fechaFin,
        dias
      }));

      // Actualizar el rango de fechas
      setDateRange([dayjs(subsidio.fechaInicio), dayjs(fechaFin)]);
    }
  }, [subsidio.tipo, subsidio.diagnostico, subsidio.fechaInicio]);

  // Función para calcular días acoplados
  const calcularDiasAcoplados = () => {
    const { empleado, fechaInicio, fechaFin } = subsidio;
    let diasAcoplados = 0;
    console.log("Calculando días acoplados...");
    if (empleado) {
      const empleadoEncontrado = listadoSubsidios.find(emp => emp.documento === empleado.documento && emp.Flag_ultimo === 1);

      console.log("Empleado encontrado:", empleadoEncontrado);
      if (empleadoEncontrado && empleadoEncontrado.fecha_inicio && empleadoEncontrado.fecha_fin) {
        const inicioExistente = dayjs(empleadoEncontrado.fecha_inicio).add(1, 'day'); // Sumar un día al inicio existente
        const finExistente = dayjs(empleadoEncontrado.fecha_fin).add(1, 'day'); // Sumar un día al fin existente
        const inicioNuevo = dayjs(fechaInicio);
        const finNuevo = dayjs(fechaFin);

        // Calcular la superposición de fechas
        const inicioSuperposicion = inicioNuevo.isAfter(inicioExistente) ? inicioNuevo : inicioExistente;
        const finSuperposicion = finNuevo.isBefore(finExistente) ? finNuevo : finExistente;

        // Calcular días de superposición (incluyendo el caso de mismo día)
        if (inicioSuperposicion.isSame(finSuperposicion, 'day')) {
          diasAcoplados = 1; // Caso cuando las fechas son iguales
        } else if (inicioSuperposicion.isBefore(finSuperposicion)) {
          diasAcoplados = finSuperposicion.diff(inicioSuperposicion, "day") + 1;
        }

        console.log("Rango existente:", inicioExistente.format("DD-MM-YYYY"), "al", finExistente.format("DD-MM-YYYY"));
        console.log("Nuevo rango:", inicioNuevo.format("DD-MM-YYYY"), "al", finNuevo.format("DD-MM-YYYY"));
        console.log("Superposición calculada:", inicioSuperposicion.format("DD-MM-YYYY"), "al", finSuperposicion.format("DD-MM-YYYY"));
        console.log("Días acoplados:", diasAcoplados);
      }
    }

    setSubsidio(prev => ({
      ...prev,
      diasAcoplados
    }));
  };

  // Manejar cambio en el rango de fechas
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);

    if (dates && dates[0] && dates[1]) {
      const fechaInicio = dates[0].format('YYYY-MM-DD');
      const fechaFin = dates[1].format('YYYY-MM-DD');
      const dias = dates[1].diff(dates[0], 'day') + 1;

      setSubsidio(prev => ({
        ...prev,
        fechaInicio,
        fechaFin,
        dias
      }));
    }
  };

  // Manejar búsqueda de empleados
  const handleBuscarEmpleado = (value) => {
    setInputValue(value);
    if (value.length > 2) {
      const empleadosDisponibles = subsidio.tipo === 'Maternidad' ? empleados : empleadosParaSubsidios;
      const filtrados = empleadosDisponibles.filter(emp =>
        emp.nombreCompleto.toLowerCase().includes(value.toLowerCase()) ||
        emp.documento.includes(value))
        .map(emp => ({
          value: emp.nombreCompleto,
          label: `${emp.nombreCompleto} (${emp.documento})`,
          empleado: emp
        }));
      setEmpleadosFiltrados(filtrados);
    } else {
      const empleadosDisponibles = subsidio.tipo === 'Maternidad' ? empleados : empleadosParaSubsidios;
      setEmpleadosFiltrados(empleadosDisponibles.map(emp => ({
        value: emp.nombreCompleto,
        label: `${emp.nombreCompleto} (${emp.documento})`,
        empleado: emp
      })));
    }
  };

  // Manejar selección de empleado
  const handleSelectEmpleado = (value, option) => {
    setSubsidio(prev => ({
      ...prev,
      empleado: option.empleado
    }));
    setInputValue(option.empleado.nombreCompleto);
    form.setFieldsValue({ empleado: option.empleado.nombreCompleto });
  };

  // Manejar cambio de tipo de subsidio
  const handleTipoChange = (value) => {
    setSubsidio(prev => ({
      ...prev,
      tipo: value,
      diagnostico: '',
      fechaFin: '',
      dias: 0,
      empleado: null,
      diasAcoplados: 0
    }));
    setInputValue('');
    setDateRange([dayjs(), null]);
    form.setFieldsValue({
      tipo: value,
      diagnostico: undefined,
      empleado: undefined,
      fechaInicio: dayjs(),
      fechaFin: undefined,
      dias: 0
    });
  };

  // Manejar cambio de checkbox CITT
  const handleCITTChange = (e) => {
    const isChecked = e.target.checked;
    setTieneCITT(isChecked);
    setSubsidio(prev => ({
      ...prev,
      tieneCITT: e.target.checked,
      numeroCITT: e.target.checked ? prev.numeroCITT : ''
    }));
    form.setFieldsValue({ tieneCITT: e.target.checked, numeroCITT: e.target.checked ? form.getFieldValue('numeroCITT') : '' });
  };

  // Confirmar y enviar datos
  const confirmSubmit = async () => {
    setIsConfirmModalVisible(false);
    setIsLoading(true);
    try {
      console.log("Enviando datos del subsidio:", subsidio);
      const cuerpo = {
        idEmpleado: subsidio.empleado?.idEmpleado,
        fecInicio: subsidio.fechaInicio,
        fecFin: subsidio.fechaFin,
        usuario: nombre,
        numDias: subsidio.dias - subsidio.diasAcoplados,
        texto_json: {
          TipoSubsidio: subsidio.tipo,
          TipoAtencion: subsidio.tieneCITT ? "CITT" : "Particular",
          NroCITT: subsidio.numeroCITT,
          Diagnostico: subsidio.diagnostico,
        },
      }
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ausenciasLaborales/registrarSubsidio`, {
        ...cuerpo,
        texto_json: JSON.stringify(cuerpo.texto_json)
      })
      if (response.status !== 200) {
        throw new Error('Error al registrar subsidio');
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      setIsSuccessModalVisible(true);
      form.resetFields();
      setSubsidio({
        tipo: '',
        diagnostico: '',
        fechaInicio: dayjs().format('YYYY-MM-DD'),
        fechaFin: '',
        dias: 0,
        tieneCITT: false,
        numeroCITT: '',
        empleado: null,
        diasAcoplados: 0
      });
      setInputValue('');
      setDateRange([dayjs(), null]);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      Modal.error({
        title: 'Error',
        content: 'Error al registrar el subsidio. Por favor intente nuevamente.',
      });
    } finally {
      setIsSuccessModalVisible(false);
    }
  };

  const onFinish = () => {
    setIsConfirmModalVisible(true);
    calcularDiasAcoplados();
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-gray-100">
      <Card className="w-4xl  mx-auto shadow-lg">
        <Title level={3} className="text-center mb-4">
          <UserOutlined className="mr-2" />
          Registro de Subsidio
        </Title>
        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            fechaInicio: dayjs(),
            tieneCITT: false
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Tipo de Subsidio */}
            <Form.Item
              name="tipo"
              label="Tipo de Subsidio"
              rules={[{ required: true, message: 'Seleccione el tipo de subsidio' }]}
            >
              <Select
                placeholder="Seleccione tipo de subsidio"
                onChange={handleTipoChange}
              >
                <Option value="Maternidad">Maternidad</Option>
                <Option value="Enfermedad">Enfermedad</Option>
                <Option value="Accidente común">Accidente común</Option>
                <Option value="Accidente trabajo">Accidente trabajo</Option>
              </Select>
            </Form.Item>

            {/* Empleado */}
            <Form.Item
              name="empleado"
              label="Empleado"
              rules={[{ required: true, message: 'Seleccione un empleado' }]}
            >
              <AutoComplete
                options={empleadosFiltrados}
                onSearch={handleBuscarEmpleado}
                onSelect={handleSelectEmpleado}
                value={inputValue}
                placeholder="Buscar por nombre o documento"
                disabled={!subsidio.tipo}
              >
              </AutoComplete>
              {subsidio.tipo != '' && subsidio.tipo != 'Maternidad' ? (
                <Text type="secondary" className="text-xs">
                  Solo se muestran empleados que tienen mas de 20 días DM
                </Text>
              ) : null}
            </Form.Item>

            {/* Diagnóstico */}

            <Form.Item
              name="diagnostico"
              label="Diagnóstico"
              rules={[{ required: true, message: 'Seleccione un diagnóstico' }]}
            >
              <Select
                placeholder="Seleccione diagnóstico"
                onChange={(value) => setSubsidio(prev => ({ ...prev, diagnostico: value }))}
                disabled={subsidio.tipo === ''}
              >
                {subsidio.tipo === 'Maternidad' ? (
                  <>
                    <Option value="PARTO_NORMAL">Parto Normal (98 días)</Option>
                    <Option value="PARTO_MULTIPLE">Parto Múltiple (128 días)</Option>
                    <Option value="DISCAPACIDAD">Parto con Discapacidad (128 días)</Option>
                  </>
                ) : subsidio.tipo === 'Enfermedad' ? (
                  DIAGNOSTICOS["ENFERMEDAD"]?.map(diagnostico => (
                    <Option key={diagnostico} value={diagnostico}>{diagnostico}</Option>
                  ))) : (
                  DIAGNOSTICOS["ACCIDENTE"]?.map(diagnostico => (
                    <Option key={diagnostico} value={diagnostico}>{diagnostico}</Option>
                  )))
                }
              </Select>
            </Form.Item>
            {/* CITT */}
            <Form.Item
              name="numeroCITT"
              label={
                <Checkbox
                  checked={tieneCITT}
                  onChange={handleCITTChange}
                >
                  <span className="font-medium">Tiene CITT</span>
                </Checkbox>
              }
              rules={[
                {
                  validator: (_, value) => {
                    if (tieneCITT && !value) {
                      return Promise.reject('Ingrese el CITT');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                placeholder="Ingrese el CITT"
                className="rounded-lg mt-2"
                disabled={!tieneCITT}
                value={subsidio.numeroCITT}
                onChange={(e) => setSubsidio(prev => ({ ...prev, numeroCITT: e.target.value }))}
              />
            </Form.Item>

            {/* Rango de fechas */}
            <Form.Item
              name="fechaInicio"
              label={subsidio.tipo === 'Maternidad' ? 'Fecha Inicio' : 'Rango de Fechas'}
              rules={[
                {
                  validator: (_, value) => {
                    // Validación básica de que existe el valor
                    if (!value) {
                      return Promise.reject(new Error('Por favor seleccione las fechas'));
                    }

                    // Validación específica para rangos (no Maternidad)
                    if (subsidio.tipo !== 'Maternidad') {
                      // Verificar que ambas fechas están completas
                      if (!value[0] || !value[1]) {
                        return Promise.reject(new Error('Debe seleccionar ambas fechas'));
                      }

                      // Validar rango máximo de 30 días
                      const diffDays = value[1].diff(value[0], 'days') + 1;
                      if (diffDays > 30) {
                        return Promise.reject(new Error('El rango no puede exceder 30 días'));
                      }
                    }

                    // Validación para Maternidad (solo fecha de inicio)
                    if (subsidio.tipo === 'Maternidad' && !value) {
                      return Promise.reject(new Error('Por favor seleccione la fecha de inicio'));
                    }

                    return Promise.resolve();
                  }
                }
              ]}
              className={subsidio.tipo === 'Maternidad' ? '' : 'md:col-span-2'}
            >
              {subsidio.tipo === 'Maternidad' ? (
                <DatePicker
                  style={{ width: '100%' }}
                  value={subsidio.fechaInicio ? dayjs(subsidio.fechaInicio) : null}
                  onChange={(date) => {
                    const fechaInicio = date ? date.format('YYYY-MM-DD') : '';
                    setSubsidio(prev => ({ ...prev, fechaInicio }));
                    setDateRange([date, date ? dayjs(date).add(subsidio.dias - 1, 'day') : null]);
                  }}
                />
              ) : (
                <RangePicker
                  onChange={(dates, dateStrings) => {
                    handleDateRangeChange(dates);

                    // Validación en tiempo real
                    if (dates) {
                      if (!dates[0] || !dates[1]) {
                        message.warning('Debe seleccionar ambas fechas');
                      } else {
                        const diffDays = dates[1].diff(dates[0], 'days') + 1;
                        if (diffDays > 30) {
                          notification.warning({
                            message: 'Rango excedido',
                            description: 'El período seleccionado supera los 30 días permitidos',
                            duration: 4.5,
                          });
                        }
                      }
                    }
                  }}
                  value={dateRange}
                  format="DD/MM/YYYY"
                  className="w-full rounded-lg"
                  placeholder={["Fecha inicio", "Fecha fin"]}
                />
              )}
            </Form.Item>

          </div>
          {/* Botón de enviar */}
          <div className="mt-6 flex justify-center">
            <Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                disabled={isLoading}
                className="min-w-40"
              >
                {isLoading ? <LoadingOutlined /> : 'Registrar Subsidio'}
              </Button>
            </Form.Item>
          </div>
        </Form>

        {/* Modal de Confirmación */}
        <AnimatePresence>
          {isConfirmModalVisible && (
            <Modal
              title={<div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Confirmar Registro de Subsidio</h3>
              </div>}
              visible={isConfirmModalVisible}
              onOk={confirmSubmit}
              onCancel={() => setIsConfirmModalVisible(false)}
              footer={[
                <Button
                  key="back"
                  onClick={() => setIsConfirmModalVisible(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={confirmSubmit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Confirmar Registro
                </Button>
              ]}
              width={750}
              closable={false}
              centered
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}

              >
                <div className="bg-blue-50 p-2 rounded-lg mb-2 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-800">Por favor revise cuidadosamente los datos antes de confirmar el registro.</p>
                </div>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-500 mb-2">Información del Empleado</h4>
                    <div className="space-y-2">
                      <p><span className="font-semibold text-gray-700">Nombre:</span> {subsidio.empleado?.nombreCompleto}</p>
                      <p><span className="font-semibold text-gray-700">Documento:</span> {subsidio.empleado?.documento}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-500 mb-2">Detalles del Subsidio</h4>
                    <div className="space-y-2">
                      <p><span className="font-semibold text-gray-700">Tipo:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${subsidio.tipo === 'Maternidad' ? 'bg-pink-100 text-pink-800' :
                          subsidio.tipo === 'ENFERMEDAD' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                          {subsidio.tipo}
                        </span>
                      </p>
                      <p><span className="font-semibold text-gray-700">Diagnóstico:</span> {subsidio.diagnostico === 'PARTO_NORMAL' ? 'Parto Normal' :
                        subsidio.diagnostico === 'PARTO_MULTIPLE' ? 'Parto Múltiple' :
                          subsidio.diagnostico === 'DISCAPACIDAD' ? 'Parto con Discapacidad' : subsidio.diagnostico}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-500 mb-2">Periodo</h4>
                    <div className="space-y-2">
                      <p><span className="font-semibold text-gray-700">Fecha Inicio:</span> {dayjs(subsidio.fechaInicio).format('DD/MM/YYYY')}</p>
                      <p><span className="font-semibold text-gray-700">Fecha Fin:</span> {dayjs(subsidio.fechaFin).format('DD/MM/YYYY')}</p>
                      <p><span className="font-semibold text-gray-700">Días:</span>
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {subsidio.dias} días
                        </span>
                      </p>
                      {/* Mostrar días acoplados si existen */}
                      {subsidio.diasAcoplados > 0 && (
                        <p><span className="font-semibold text-gray-700">Días acoplados:</span>
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                            {subsidio.diasAcoplados} días
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {subsidio.tieneCITT && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-500 mb-2">Información CITT</h4>
                      <div className="space-y-2">
                        <p><span className="font-semibold text-gray-700">Número CITT:</span>
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                            {subsidio.numeroCITT}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
        {/* Modal de Éxito */}
        <Modal
          title={null}
          open={isSuccessModalVisible}
          width={400}
          footer={null}
        >
          <CompResultado tipo="success" titulo={<span>¡Registro exitoso!</span>} mensaje={<span>El subsidio ha sido registrado correctamente.</span>} />
        </Modal>



        {/* Overlay de carga */}
        <Modal
          title={null}
          open={isLoading}
          width={400}
          footer={null}
        >
          <CompResultado tipo="loading" titulo={<span>Procesando solicitud</span>} mensaje={<span>Por favor espere...</span>} />
        </Modal>
      </Card>
    </div>
  );
};