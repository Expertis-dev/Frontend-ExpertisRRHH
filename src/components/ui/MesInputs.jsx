import React, { useState } from "react";
import PropTypes from 'prop-types';
import { DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Locale en español

dayjs.locale("es"); // Configura el idioma

export const DatePickerFirstDay = ({ handleDateChange, mesInicio }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Función para deshabilitar meses ANTERIORES a `mesInicio`
  const disabledDate = (current) => {
    if (!current || !mesInicio) return false;
    const minDate = dayjs(mesInicio).startOf("month");
    const nextMonth = minDate.add(1, "month");
    return (
      current.isBefore(minDate, "month") ||
      current.isSame(minDate, "month") ||
      current.isSame(nextMonth, "month")
    );
  };

  const handleChange = (date) => {
    if (date) {
      // Forzar el día 01 del mes seleccionado
      const dateWithFirstDay = date.startOf('month');
      setSelectedDate(dateWithFirstDay);
      handleDateChange(dateWithFirstDay);
    } else {
      setSelectedDate(null);
      handleDateChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <DatePicker
        picker="month"
        format="MMMM YYYY" // Ejemplo: "abril 2024"
        disabledDate={disabledDate}
        onChange={handleChange}
        style={{ width: "100%" }}
        placeholder="Selecciona el primer día del mes"
        allowClear={false}
      />

      {selectedDate && (
        <div className="text-sm mt-2 p-2 bg-gray-100 rounded">
          Fecha seleccionada: <strong>{selectedDate.format("MMMM YYYY")}</strong>
        </div>
      )}
    </div>
  );
};

DatePickerFirstDay.propTypes = {
  mesInicio: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.object
  ]),
  handleDateChange: PropTypes.func.isRequired,
};

DatePickerFirstDay.defaultProps = {
  mesInicio: null,
};