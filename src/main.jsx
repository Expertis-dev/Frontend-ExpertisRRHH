import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { FinanzasLayout } from './components/FinanzasLayout.jsx';
import { Empleado } from './view/Empleado.jsx';
import { AFPempleado } from './view/AFP/AFPempleado.jsx';
import { CambiosAFP } from './view/AFP/CambiosAFP.JSX';
import { InfoAFP } from './view/AFP/InfoAFP.jsx';
import { Contratos } from './view/Contratos.jsx';
import { EPS } from './view/EPS.jsx';
import { HorasExtra } from './view/HorasExtra.jsx';
import { RetencionJudicial } from './view/RetencionJudicial.jsx';
import { DescansoMedico } from './view/DescansoMedico.jsx';
import { Comisiones } from './view/Comisiones.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/finanzas" element={<FinanzasLayout />}>
        <Route path="empleados" element={<Empleado/>} />
        <Route path="empleados-afp" element={<AFPempleado/>} />
        <Route path="cambios-afp" element={<CambiosAFP/>} />
        <Route path="info-afp" element={<InfoAFP/>} />
        <Route path="contrato" element={<Contratos/>} />
        <Route path="eps" element={<EPS/>} />
        <Route path="horas-extra" element={<HorasExtra/>} />
        <Route path="retencion-judicial" element={ <RetencionJudicial/> } />
        <Route path="descanso-medicos" element={<DescansoMedico/>} />
        <Route path="comisiones" element={<Comisiones/>} />
      </Route>
    </Routes>
  </BrowserRouter>
)