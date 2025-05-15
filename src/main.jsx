import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");
import "./index.css";
import { FinanzasLayout } from "./components/FinanzasLayout.jsx";
import { AFPempleado } from "./view/AFP/AFPempleado.jsx";
import { CambiosAFP } from "./view/AFP/CambiosAFP.jsx";
import { InfoAFP } from "./view/AFP/InfoAFP.jsx";
import { Contratos } from "./view/Contratos.jsx";
import { Eps } from "./view/EPS.jsx";
import { HorasExtra } from "./view/HorasExtra.jsx";
import { RetencionJudicial } from "./view/RetencionJudicial.jsx";
import { DescansoMedico } from "./view/DescansoMedico.jsx";
import { Comisiones } from "./view/Comisiones.jsx";
import { ListarEmpleados } from "./view/Empleado/ListarEmpleados.jsx";
import { CrearEmpleado } from "./view/Empleado/CrearEmpleado.jsx";
import { CesarEmpleado } from "./view/Empleado/CesarEmpleado.jsx";
import Descuentos from "./view/Descuentos/Descuentos";
import HistorialDescuentos from "./view/Descuentos/HistorialDescuentos";
import { DataProvider } from './provider/Provider';
import { SueldoMinimo } from './view/SueldoMinimo';
import { CambiarFecCese } from "./view/Empleado/CambiarFecCese";
import { Login } from "./components/Login";
import { RutaProtegida } from "./middleware/RutaProtegida";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <DataProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/rrhh" element={
          <RutaProtegida>
            <FinanzasLayout />
          </RutaProtegida>
        }>
          <Route path="empleados-listar" element={<ListarEmpleados />} />
          <Route path="empleados-crear" element={<CrearEmpleado />} />
          <Route path="empleados-cesar" element={<CesarEmpleado />} />
          <Route path="empleados-afp" element={<AFPempleado />} />
          <Route path="cambios-afp" element={<CambiosAFP />} />
          <Route path="info-afp" element={<InfoAFP />} />
          <Route path="contrato" element={<Contratos />} />
          <Route path="eps" element={<Eps />} />
          <Route path="horas-extra" element={<HorasExtra />} />
          <Route path="retencion-judicial" element={<RetencionJudicial />} />
          <Route path="descanso-medicos" element={<DescansoMedico />} />
          <Route path="comisiones" element={<Comisiones />} />
          <Route path="cargarDescuentos" element={<Descuentos />} />
          <Route path="historialDescuentos" element={<HistorialDescuentos />} />
          <Route path="sueldo-minimo" element={<SueldoMinimo />} />
          <Route path="cambiar-fecha-cese" element={<CambiarFecCese />} />
        </Route>
      </Routes>
    </DataProvider>
  </BrowserRouter>
);
