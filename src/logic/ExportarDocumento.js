import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
export const exportToExcel = (data, nombreDocumento) => {
    // 1. Convertir datos a hoja
    const worksheet = XLSX.utils.json_to_sheet(data);
    // 2. Crear un libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    // 3. Generar buffer Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    // 4. Descargar archivo
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${nombreDocumento}.xlsx`);
};