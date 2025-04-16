import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Modal, Table, Input, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const columnasEsperadas = [
  { key: 'ASESOR', tipo: 'string' },
  { key: 'DNI', tipo: 'string' },
  { key: 'COD MES', tipo: 'date' },
  { key: 'DM', tipo: 'string' },
  { key: 'Licencia sin GH', tipo: 'number' },
  { key: 'Licencia con GH', tipo: 'number' },
  { key: 'Maternidad', tipo: 'number' },
  { key: 'Minutos Tardanza', tipo: 'number' },
  { key: 'DESCUENTO BOLSA TARDANZA', tipo: 'number' },
  { key: 'PENALIDAD BOLSA TARDANZA', tipo: 'number' },
  { key: 'MINUTOS DE PERMISO', tipo: 'number' },
  { key: 'DESCUENTO PERMISO', tipo: 'number' },
  { key: 'DESCUENTO PERMISO PENALIDAD', tipo: 'number' },
  { key: 'DIAS FALTA', tipo: 'number' },
  { key: 'DESCUENTO FALTA POR TIEMPO', tipo: 'number' },
  { key: 'DESCUENTO FALTA PENALIDAD', tipo: 'number' },
  { key: 'DESCUENTO TOTAL', tipo: 'number' },
  { key: 'COD_EMPLEADO', tipo: 'string' },
  { key: 'DIAS_ADICIONAL', tipo: 'number' },
  { key: 'DESCUENTO_TEC', tipo: 'number' },
  { key: 'DESCUENTO_TOTAL_TOTAL', tipo: 'number' },
  { key: 'LARGO_DN', tipo: 'number' },
  { key: 'DIAS_SUBVENCION', tipo: 'number' },
  { key: 'SUBVENCION_VARIABLE', tipo: 'number' },
  { key: 'ID_ORDEN', tipo: 'string' },
  { key: 'MATERNIDAD_MONTO', tipo: 'number' },
  { key: 'PATERNIDAD', tipo: 'number' },
  { key: 'SUBVENCION_VAC_PRAC', tipo: 'number' }
];

const Descuentos = () => {
  const [datos, setDatos] = useState([]);
  const [visible, setVisible] = useState(false);

  const validarArchivo = (contenido) => {
    if (!contenido || contenido.length === 0) {
      alert('El archivo no contiene datos.');
      return false;
    }

    // Obtener todos los encabezados únicos de todas las filas
    const encabezados = new Set();
    contenido.forEach((fila) => {
      Object.keys(fila).forEach((key) => encabezados.add(key.trim()));
    });

    const columnasFaltantes = columnasEsperadas
      .filter((col) => !encabezados.has(col.key))
      .map((col) => col.key);

    if (columnasFaltantes.length > 0) {
      alert(`El archivo no contiene las siguientes columnas requeridas:\n${columnasFaltantes.join(', ')}`);
      return false;
    }

    const datosValidados = contenido.map((row, index) => {
      let esValido = true;

      columnasEsperadas.forEach((col) => {
        const valor = row[col.key];
        if (col.tipo === 'number') {
          if (valor === undefined || valor === null || valor === '') {
            esValido = false;
          } else if (isNaN(Number(valor))) {
            esValido = false;
          }
        }
        if (col.tipo === 'string') {
          if (valor === undefined || valor === null || valor === '') {
            esValido = false;
          } else if (typeof valor !== 'string' && typeof valor !== 'number') {
            esValido = false;
          }
        }
        if (col.tipo === 'date') {
          if (!valor || isNaN(Date.parse(valor))) {
            esValido = false;
          }
        }
      });

      return { ...row, key: index, valido: esValido };
    });

    return datosValidados;
  };

  const procesarArchivo = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const validado = validarArchivo(worksheet);
      if (validado) {
        setDatos(validado);
        setVisible(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns = columnasEsperadas.map((col) => ({
    title: <span className="text-xs">{col.key}</span>,
    dataIndex: col.key,
    width: 100, // Ajusta según lo angosto que quieras
    render: (text, record, index) => (
      <Input
        size="small"
        className="text-xs px-1 py-1"
        value={text}
        onChange={(e) => {
          const nuevosDatos = [...datos];
          nuevosDatos[index][col.key] = e.target.value;
          setDatos(nuevosDatos);
        }}
      />
    ),
  }));

  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      <Upload
        accept=".xlsx, .xls"
        showUploadList={false}
        customRequest={({ file }) => {
          procesarArchivo(file);
        }}
      >
        <Button icon={<UploadOutlined />}>Subir Archivo Excel</Button>
      </Upload>

      <Modal
        title="Previsualización del archivo"
        open={visible}
        onCancel={() => setVisible(false)}
        width={1000}
        footer={[
          <Button key="cancelar" onClick={() => setVisible(false)}>Cancelar</Button>,
          <Button key="cargar" type="primary" disabled={datos.some(d => !d.valido)}>
            Cargar Datos
          </Button>,
        ]}
      >
        <Table
          columns={columns}
          size='small'
          dataSource={datos}
          pagination={false}
          scroll={{ x: 'max-content' }}          
          rowClassName={(record) => record.valido ? '' : 'bg-red-100'}
        />
      </Modal>
    </div>
  );
};

export default Descuentos;
