import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { FinanzasLayout } from './components/FinanzasLayout.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/finanzas" element={<FinanzasLayout />}>
        <Route path="empleados" element={<div>Empleados</div>} />
        <Route path="afp-empleados" element={<div>AFP Empleados</div>} />
        <Route path="contrato" element={<div>Contrato</div>} />
        <Route path="eps" element={<div>EPS</div>} />
        <Route path="horas-extra" element={<div>Horas extra</div>} />
        <Route path="retencion-judicial" element={<div>Retención judicial</div>} />
        <Route path="afp" element={<div>AFP</div>} />
        <Route path="descanso-medicos" element={<div>Descanso médicos</div>} />
        <Route path="comisiones" element={<div>Comisiones</div>} />
      </Route>
    </Routes>
  </BrowserRouter>
)