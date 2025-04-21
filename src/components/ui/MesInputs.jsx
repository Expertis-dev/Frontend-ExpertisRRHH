import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const DatePickerFirstDay = ({ handleDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectDate = (date) => {
    if (date && date.getDate() === 1) {
      setSelectedDate(date);
      handleDateChange(date);
    }
  };

  const disableDays = (date) => {
    return date.getDate() !== 1;
  };

  const formatFecha = (date) => {
    // Formato: 01-Ene-25
    return format(date, "dd-MMM-yy", { locale: es });
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelectDate}
        disabled={disableDays}
        className="rounded-md border"
        fromYear={2000}
        toYear={2300}
        initialFocus
      />

      {selectedDate && (
        <div className="text-sm mt-2 p-2 bg-gray-100 rounded">
          Fecha seleccionada: {formatFecha(selectedDate)}
        </div>
      )}
    </div>
  );
};
