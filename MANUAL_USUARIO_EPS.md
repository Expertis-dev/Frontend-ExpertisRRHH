# 📘 MANUAL DE USUARIO - MÓDULO EPS
## Sistema de Gestión de Recursos Humanos - ExpertisRRHH

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Módulo EPS - Visión General](#módulo-eps---visión-general)
4. [Lista de Afiliados](#1-lista-de-afiliados)
5. [Registro de Nuevo Afiliado](#2-registro-de-nuevo-afiliado)
6. [Editar Afiliado / Cambio de Plan](#3-editar-afiliado--cambio-de-plan)
7. [Ver Detalles de Afiliado](#4-ver-detalles-de-afiliado)
8. [Dar de Baja Afiliación](#5-dar-de-baja-afiliación)
9. [Lista de Dependientes](#6-lista-de-dependientes)
10. [Registro Especial](#7-registro-especial)
11. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Introducción

El **Módulo EPS** (Entidad Prestadora de Salud) es una herramienta integral para la gestión de afiliaciones de salud de los empleados y sus dependientes. Este módulo permite:

- ✅ Registrar nuevos afiliados al sistema EPS
- ✅ Gestionar planes de salud (cambios, actualizaciones)
- ✅ Administrar dependientes asociados a cada titular
- ✅ Dar de baja afiliaciones
- ✅ Consultar históricos y reportes
- ✅ Realizar registros especiales para personas sin vínculo laboral

---

## 🔐 Acceso al Sistema

### Pantalla de Login

**Ubicación:** Página principal del sistema (`http://localhost:5173/`)

**Descripción:**
- Interfaz moderna con diseño corporativo
- Logo de la empresa centrado
- Campos de entrada para credenciales

**Campos requeridos:**
- **Usuario:** Nombre de usuario o correo electrónico
- **Contraseña:** Contraseña del usuario

**Proceso:**
1. Ingrese sus credenciales en los campos correspondientes
2. Haga clic en el botón "Iniciar Sesión"
3. El sistema validará sus credenciales
4. Si son correctas, será redirigido al panel principal

**Nota:** Las credenciales son proporcionadas por el administrador del sistema.

---

## 🏥 Módulo EPS - Visión General

### Acceso al Módulo

**Ubicación en el menú lateral:**
```
📋 Menú Principal
  └── 🏥 EPS
      ├── Lista Afiliado
      ├── Lista Dependiente
      └── Registro Especial
```

### Submódulos Disponibles

1. **Lista Afiliado** - Gestión principal de afiliados titulares
2. **Lista Dependiente** - Administración de dependientes
3. **Registro Especial** - Registro de personas sin vínculo laboral

---

## 1. 📊 Lista de Afiliados

### Descripción General

Esta es la pantalla principal del módulo EPS donde se visualizan todos los afiliados titulares registrados en el sistema.

**Ruta:** `/rrhh/eps/listar-afiliado`

### Componentes de la Pantalla

#### 1.1 Encabezado
- **Título:** "LISTA DE AFILIADOS"
- **Subtítulo:** "Gestiona y consulta la información de los afiliados registrados"
- **Icono:** 👥 (Usuarios)

#### 1.2 Panel de Filtros y Acciones

**Ubicación:** Parte superior de la pantalla

**Filtros Disponibles:**

1. **Buscar afiliado**
   - Campo de búsqueda de texto libre
   - Permite buscar por:
     - Nombre completo
     - Número de documento
   - Búsqueda en tiempo real
   - Botón de limpiar búsqueda (X)

2. **Rango de fechas**
   - Selector de rango de fechas
   - Formato: DD/MM/YYYY
   - Filtra por fecha de inicio de afiliación
   - Placeholders: "Fecha inicio" - "Fecha fin"

3. **Buscar Plan**
   - Selector desplegable de planes EPS
   - Opciones disponibles:
     - PLAN BASE ESENCIAL
     - PLAN BASE PLUS
     - PLAN ADICIONAL 1
     - PLAN ADICIONAL 2
   - Búsqueda con autocompletado
   - Opción de limpiar selección

4. **Botón Limpiar**
   - Icono: 🔄 (Refresh)
   - Función: Resetea todos los filtros aplicados
   - Estilo: Botón outline

**Acciones Principales:**

1. **Ver Especiales / Ver Afiliados**
   - Icono: 📄 (FileText)
   - Color: Ámbar
   - Función: Alterna entre vista de afiliados normales y especiales
   - Texto dinámico según el estado actual

2. **Descargar Excel**
   - Icono: ⬇️ (Download)
   - Color: Verde
   - Función: Exporta la lista filtrada a formato Excel
   - Se deshabilita si no hay registros
   - Nombre del archivo: "LISTA DE AFILIADOS.xlsx"

3. **Registrar Nuevo Afiliado**
   - Icono: ➕👤 (UserPlus)
   - Color: Azul
   - Función: Abre el modal de registro de nuevo afiliado
   - Se deshabilita en vista de "Especiales"

#### 1.3 Tabla de Resultados

**Columnas de la tabla:**

| Columna | Descripción | Formato |
|---------|-------------|---------|
| **Documento** | Número de DNI o documento del titular | Texto |
| **Nombre Completo** | Nombre completo del afiliado | Texto en negrita |
| **Plan** | Nombre del plan EPS contratado | Tag con color |
| **EPS** | Tipo de plan (TITULAR SOLO, TITULAR + 1, etc.) | Texto |
| **Dependientes** | Cantidad de dependientes asociados | Badge circular |
| **Fecha Inicio** | Fecha de inicio de la afiliación | DD/MM/YYYY |
| **Fecha Fin** | Fecha de fin o "VIGENTE" | DD/MM/YYYY o texto |
| **Acciones** | Botones de acción | Iconos |

**Códigos de Color para Planes:**
- 🔵 **Azul:** PLAN ADICIONAL 2
- 🟣 **Morado:** PLAN BASE PLUS
- 🟢 **Verde:** PLAN ADICIONAL 1
- 🟠 **Naranja:** PLAN BASE ESENCIAL

**Indicador de Dependientes:**
- 🟢 **Verde:** Tiene dependientes (número > 0)
- 🔴 **Rojo:** Sin dependientes (número = 0)

**Acciones por Registro:**

1. **👁️ Ver Detalles** (Azul)
   - Tooltip: "Ver detalles"
   - Abre modal con información completa del afiliado

2. **✏️ Editar** (Verde)
   - Tooltip: "Editar"
   - Abre modal para cambio de plan y gestión de dependientes

3. **🗑️ Dar de Baja** (Rojo)
   - Tooltip: "Dar de Baja"
   - Abre modal para finalizar la afiliación

#### 1.4 Características Adicionales

- **Contador de registros:** Badge azul que muestra el total de registros filtrados
- **Scroll vertical:** Altura máxima de 60vh con scroll automático
- **Animaciones:** Transiciones suaves al cargar y filtrar datos
- **Hover effects:** Resaltado de filas al pasar el mouse
- **Responsive:** Adaptable a diferentes tamaños de pantalla

---

## 2. ➕ Registro de Nuevo Afiliado

### Descripción General

Modal wizard de múltiples pasos para registrar un nuevo afiliado titular y sus dependientes en el sistema EPS.

**Activación:** Botón "Registrar Nuevo Afiliado" en Lista de Afiliados

### Estructura del Wizard

El proceso de registro se divide en **3 pasos principales:**

#### PASO 1: Selección de Empleado y Plan

**Componentes:**

1. **Búsqueda de Empleado**
   - Campo de búsqueda con autocompletado
   - Busca por:
     - Nombre del empleado
     - Número de documento
     - Alias
   - Muestra sugerencias en tiempo real
   - Selección única

2. **Información del Empleado Seleccionado**
   - Tarjeta informativa con:
     - Nombre completo
     - Documento
     - Cargo/Puesto
     - Estado laboral

3. **Selección de Plan EPS**
   - Selector desplegable con todos los planes disponibles
   - Formato: "NOMBRE DEL PLAN - TIPO"
   - Ejemplo: "PLAN BASE ESENCIAL - TITULAR SOLO"
   - Búsqueda con filtro
   - Opción de limpiar selección

4. **Visualización del Plan Seleccionado**
   - Tags informativos:
     - Nombre del plan (azul)
     - Tipo de plan (morado/verde según dependientes)
   - Monto del plan:
     - Formato: S/ X,XXX.XX
     - Fondo degradado verde
     - Texto grande y destacado

5. **Período de Aplicación**
   - Selector de mes y año
   - Formato: "MMMM YYYY" (Ejemplo: "Enero 2026")
   - Campo obligatorio (*)
   - Valor guardado: YYYY-MM-DD (primer día del mes)

**Validaciones:**
- ✅ Empleado debe estar seleccionado
- ✅ Plan debe estar seleccionado
- ✅ Período debe estar definido

**Navegación:**
- Botón "Siguiente" (habilitado solo si las validaciones pasan)

---

#### PASO 2: Gestión de Dependientes

**Nota:** Este paso solo aparece si el plan seleccionado requiere dependientes (ej: TITULAR + 1, TITULAR + 2, etc.)

**Componentes:**

1. **Indicador de Requerimiento**
   - Tag morado destacado
   - Texto: "Debe seleccionar X dependiente(s)"
   - Contador dinámico

2. **Pestañas de Gestión**

   **Pestaña 1: Seleccionar Previos**
   - Lista de dependientes ya registrados en el sistema
   - Selector múltiple con búsqueda
   - Muestra:
     - Nombre completo
     - Parentesco (si está registrado)
   - Límite: Según el plan seleccionado
   - Contador: "X / Y" (seleccionados / requeridos)

   **Pestaña 2: Agregar Nuevo**
   - Formulario completo para registrar nuevo dependiente
   - Campos organizados en grid responsive (3 columnas)

   **Campos del Formulario:**
   
   | Campo | Tipo | Obligatorio | Opciones |
   |-------|------|-------------|----------|
   | Plan Asociado | Texto (deshabilitado) | - | Muestra el plan seleccionado |
   | Nombre | Texto | ✅ Sí | - |
   | Apellido Paterno | Texto | No | - |
   | Apellido Materno | Texto | No | - |
   | Fecha Nacimiento | Fecha | ✅ Sí | Selector de calendario |
   | Tipo Documento | Select | No | DNI, Carnet de Extranjería |
   | N° Documento | Texto | ✅ Sí | - |
   | Sexo | Select | ✅ Sí | Masculino, Femenino |
   | Parentesco | Select | No | Cónyuge, Hijo/a, Padre, Madre, Hermano/a, Otro |

   **Botón de Acción:**
   - Texto: "Registrar y Añadir"
   - Icono: ➕ (Plus)
   - Color: Azul
   - Función:
     1. Valida los campos obligatorios
     2. Registra el dependiente en el backend
     3. Lo agrega a la lista de disponibles
     4. Lo selecciona automáticamente (si hay cupo)
     5. Cambia a la pestaña "Seleccionar Previos"
     6. Limpia el formulario

3. **Alerta de Dependientes Previos Vacíos**
   - Tipo: Warning
   - Mensaje: "No hay dependientes previos"
   - Descripción: "Registra un nuevo dependiente en la pestaña siguiente para poder continuar."
   - Se muestra solo si no hay dependientes disponibles

**Validaciones:**
- ✅ Debe seleccionar exactamente el número de dependientes requeridos
- ✅ No puede seleccionar más dependientes de los permitidos
- ✅ Campos obligatorios del formulario deben estar completos

**Navegación:**
- Botón "Atrás" (vuelve al Paso 1)
- Botón "Siguiente" (habilitado solo si se seleccionaron todos los dependientes)

---

#### PASO 3: Resumen y Confirmación

**Componentes:**

1. **Icono de Confirmación**
   - Escudo verde (✓)
   - Fondo degradado verde esmeralda

2. **Información del Plan**
   - Nombre completo del plan
   - Tipo de plan
   - Presentación centrada y destacada

3. **Costo del Plan**
   - Formato: S/ X,XXX.XX
   - Texto grande en verde esmeralda
   - Etiqueta: "Costo"

4. **Sección de Dependientes**

   **Si no requiere dependientes:**
   - Tag verde: "Titular solo (sin dependientes)"

   **Si requiere dependientes:**
   - Tags informativos:
     - Requeridos: X (morado)
     - Seleccionados: Y (azul)
   
   - **Lista de Dependientes Seleccionados:**
     - Tarjetas individuales para cada dependiente
     - Información mostrada:
       - Nombre completo
       - Tag "Nuevo" (verde) si fue recién registrado
     - **Selector de Parentesco** (obligatorio):
       - Desplegable individual por dependiente
       - Opciones: Cónyuge, Hijo/a, Padre, Madre, Hermano/a, Otro
       - Placeholder: "Seleccionar..."
       - Tamaño: Small
       - Etiqueta: "Parentesco *"

5. **Validación Final**
   - Verifica que todos los dependientes tengan parentesco asignado
   - Muestra error si falta algún parentesco

**Navegación:**
- Botón "Atrás" (vuelve al paso anterior)
- Botón "Confirmar Registro" (verde, con icono de guardado)
  - Habilitado solo si todas las validaciones pasan
  - Muestra loader durante el proceso

---

### Proceso de Registro Completo

**Flujo del Backend:**

1. **Registro del Titular:**
   - Endpoint: `/api/eps/registrarAfiliadoEPS`
   - Payload:
     ```json
     {
       "Documento": "12345678",
       "idPlan": 5,
       "mesInicio": "2026-01-01"
     }
     ```

2. **Asociación de Dependientes** (si aplica):
   - Endpoint: `/api/eps/asosciarDependiente`
   - Se ejecuta por cada dependiente seleccionado
   - Payload:
     ```json
     {
       "DOCUMENTO_TITULAR": "12345678",
       "idPlan": 5,
       "mesInicio": "2026-01-01",
       "idAfiliadoDependiente": "87654321",
       "parentesco": "HIJO",
       "tipoRegistro": "R"
     }
     ```

**Mensajes del Sistema:**

- ⏳ **Cargando:** "Registrando afiliación y dependientes..."
- ✅ **Éxito:** "Afiliación registrada exitosamente"
  - Descripción: "El titular y sus dependientes han sido registrados correctamente"
- ❌ **Error:** "Error al registrar"
  - Descripción: Mensaje específico del error

**Cierre del Modal:**
- Se cierra automáticamente después de 800ms del registro exitoso
- Recarga la lista de afiliados
- Limpia todos los campos del formulario

---

## 3. ✏️ Editar Afiliado / Cambio de Plan

### Descripción General

Modal wizard para modificar el plan de un afiliado existente y gestionar sus dependientes.

**Activación:** Botón "Editar" (✏️) en la tabla de afiliados

### Diferencias con Registro Nuevo

- ❌ **No permite** seleccionar empleado (ya está definido)
- ✅ **Muestra** el plan actual del afiliado
- ✅ **Filtra** planes disponibles según reglas de jerarquía
- ✅ **Permite** cambiar a planes de igual o mayor nivel

### Estructura del Wizard

#### PASO 1: Cambio de Plan

**Componentes:**

1. **Información del Plan Actual**
   - Tarjeta destacada con fondo azul degradado
   - Icono: Escudo (🛡️)
   - Etiqueta: "Plan Actual del Afiliado"
   - Información mostrada:
     - Nombre del plan
     - Tipo de plan
   - Tag: "ACTIVO" (azul)
   - **No editable**

2. **Selección de Nuevo Plan**
   - Etiqueta: "Seleccione Nuevo Plan *"
   - Selector desplegable con búsqueda
   - **Planes Filtrados:**
     - Misma marca/EPS que el plan actual
     - Jerarquía igual o superior al plan original
     - Ejemplo: Si tiene "TITULAR SOLO", puede cambiar a "TITULAR + 1" o superior
   - Marca el plan actual con: "⭐ [NOMBRE] (Actual)"

3. **Visualización del Nuevo Plan**
   - Tags informativos (nombre y tipo)
   - Monto del plan destacado
   - Formato: S/ X,XXX.XX

4. **Período de Aplicación**
   - Selector de mes de inicio
   - Campo obligatorio
   - Formato: MMMM YYYY

**Reglas de Filtrado:**

```
Plan Actual: PLAN BASE - TITULAR SOLO
Planes Permitidos:
  ✅ PLAN BASE - TITULAR SOLO (actual)
  ✅ PLAN BASE - TITULAR + 1
  ✅ PLAN BASE - TITULAR + 2
  ❌ PLAN ADICIONAL - TITULAR SOLO (diferente marca)
```

**Validaciones:**
- ✅ Debe seleccionar un plan
- ✅ Debe seleccionar período de inicio

---

#### PASO 2: Gestión de Dependientes (si aplica)

**Idéntico al Paso 2 del Registro Nuevo**, con las siguientes particularidades:

- Muestra dependientes previamente asociados al titular
- Permite agregar nuevos dependientes
- Permite cambiar la selección de dependientes
- Valida que la cantidad coincida con el nuevo plan

**Carga de Dependientes Previos:**
- Endpoint: `/api/eps/listarHistoricoAfiliadosEPS`
- Filtra dependientes del titular actual
- Los marca como disponibles para selección

---

#### PASO 3: Resumen y Confirmación

**Similar al Paso 3 del Registro Nuevo**, con:

- Muestra el nuevo plan seleccionado
- Lista los dependientes que quedarán asociados
- Requiere asignación de parentesco para cada dependiente
- Muestra advertencia si hay cambios significativos

---

### Proceso de Actualización

**Flujo del Backend:**

1. **Actualización del Titular:**
   - Endpoint: `/api/eps/registrarAfiliadoEPS`
   - Crea un nuevo movimiento con el nuevo plan
   - Payload:
     ```json
     {
       "Documento": "12345678",
       "idPlan": 7,
       "mesInicio": "2026-02-01"
     }
     ```

2. **Reasociación de Dependientes:**
   - Endpoint: `/api/eps/asosciarDependiente`
   - Se ejecuta para cada dependiente seleccionado
   - Asocia al nuevo movimiento del titular

**Mensajes del Sistema:**

- ⏳ **Cargando:** "Actualizando afiliación y dependientes..."
- ✅ **Éxito:** "Plan y dependientes actualizados"
  - Descripción: "La información se ha procesado correctamente"
- ❌ **Error:** "Error al actualizar"

---

## 4. 👁️ Ver Detalles de Afiliado

### Descripción General

Modal de solo lectura que muestra toda la información detallada del afiliado seleccionado.

**Activación:** Botón "Ver detalles" (👁️) en la tabla de afiliados

### Secciones del Modal

#### 4.1 Encabezado
- Icono: Ojo (👁️) en círculo azul
- Título: "Detalles del Afiliado"
- Nombre del afiliado como subtítulo

#### 4.2 Información Personal

**Campos mostrados:**

| Campo | Descripción |
|-------|-------------|
| Documento | Número de DNI o documento de identidad |
| Nombre Completo | Nombre completo del titular |
| Tipo de Afiliado | Empleado / Especial |

#### 4.3 Información del Plan

**Campos mostrados:**

| Campo | Descripción |
|-------|-------------|
| Plan EPS | Nombre del plan contratado |
| Tipo de Plan | TITULAR SOLO, TITULAR + 1, etc. |
| Costo Mensual | Monto en soles (S/) |
| Fecha de Inicio | Fecha de inicio de la afiliación |
| Fecha de Fin | Fecha de fin o "VIGENTE" |
| Estado | ACTIVO / INACTIVO |

#### 4.4 Dependientes Asociados

**Si tiene dependientes:**
- Lista de dependientes con:
  - Nombre completo
  - Parentesco
  - Documento
  - Fecha de nacimiento
  - Sexo

**Si no tiene dependientes:**
- Mensaje: "Este afiliado no tiene dependientes asociados"
- Icono informativo

#### 4.5 Historial de Cambios (si aplica)

- Muestra cambios de plan anteriores
- Fechas de cada cambio
- Planes anteriores

### Características

- ✅ **Solo lectura** - No permite ediciones
- ✅ **Información completa** - Todos los datos del afiliado
- ✅ **Diseño limpio** - Organización clara por secciones
- ✅ **Responsive** - Adaptable a diferentes pantallas

**Navegación:**
- Botón "Cerrar" (cierra el modal)

---

## 5. 🗑️ Dar de Baja Afiliación

### Descripción General

Modal para finalizar la vigencia de un plan EPS, dando de baja al titular y todos sus dependientes asociados.

**Activación:** Botón "Dar de Baja" (🗑️) en la tabla de afiliados

### Componentes del Modal

#### 5.1 Encabezado
- Icono: Papelera (🗑️) en rojo
- Título: "Dar de Baja Afiliación"
- Color: Rojo (indica acción destructiva)

#### 5.2 Alerta de Advertencia

**Tipo:** Warning (⚠️)

**Mensaje:**
- Título: "Atención"
- Descripción: "Esta acción finalizará la vigencia del plan para el titular y TODOS sus dependientes asociados. Esta acción no se puede deshacer fácilmente."

**Estilo:**
- Fondo amarillo/naranja
- Icono de advertencia
- Borde destacado

#### 5.3 Información del Afiliado

**Tarjeta informativa con:**
- Fondo gris claro
- Borde redondeado

**Datos mostrados:**
- **Afiliado:** Nombre completo del titular
- **Plan Actual:** Nombre del plan que se dará de baja

#### 5.4 Selección de Fecha de Baja

**Campo:**
- Etiqueta: "Seleccione Mes de Fin de Suscripción *"
- Tipo: Selector de mes
- Formato: MMMM YYYY (Ejemplo: "Enero 2026")
- Placeholder: "Seleccione mes de baja"
- Obligatorio: Sí

**Valor guardado:**
- Formato: YYYY-MM-DD
- Primer día del mes seleccionado

#### 5.5 Botones de Acción

**Botón Cancelar:**
- Estilo: Outline (borde)
- Función: Cierra el modal sin realizar cambios
- Posición: Izquierda

**Botón Confirmar Baja:**
- Color: Rojo
- Texto: "Confirmar Baja"
- Estado: Deshabilitado hasta que se seleccione la fecha
- Función: Ejecuta la baja del afiliado

---

### Proceso de Baja

**Flujo del Backend:**

1. **Llamada al Endpoint:**
   - Endpoint: `/api/eps/eliminarAfiliadoEPS`
   - Método: POST
   - Payload:
     ```json
     {
       "DOCUMENTO_TITULAR": "12345678",
       "mesFin": "2026-01-01"
     }
     ```

2. **Procesamiento:**
   - El backend actualiza el registro del titular
   - Actualiza automáticamente todos los dependientes asociados
   - Establece la fecha de fin de vigencia

**Mensajes del Sistema:**

- ⏳ **Procesando:** "Procesando baja del afiliado..."
- ✅ **Éxito:** "Afiliación finalizada correctamente"
  - Descripción: "El titular y sus dependientes han sido dados de baja."
- ❌ **Error:** "Error al procesar la baja"

**Después de la Baja:**
- El modal se cierra automáticamente
- La lista de afiliados se recarga
- El registro ya no aparece en la lista de activos
- Se puede consultar en el histórico

---

## 6. 👨‍👩‍👧‍👦 Lista de Dependientes

### Descripción General

Pantalla dedicada a la gestión y consulta de todos los dependientes registrados en el sistema EPS.

**Ruta:** `/rrhh/eps/listar-dependiente`

### Componentes de la Pantalla

#### 6.1 Encabezado
- Título: "LISTA DE DEPENDIENTES"
- Subtítulo: "Gestiona y consulta la información de los dependientes registrados"
- Icono: 👨‍👩‍👧‍👦 (Familia)

#### 6.2 Panel de Filtros

**Filtros Disponibles:**

1. **Buscar dependiente**
   - Búsqueda por:
     - Nombre del dependiente
     - Nombre del titular
     - Número de documento

2. **Filtro por Parentesco**
   - Opciones:
     - Todos
     - Cónyuge
     - Hijo/a
     - Padre
     - Madre
     - Hermano/a
     - Otro

3. **Filtro por Estado**
   - Activos
   - Inactivos
   - Todos

**Acciones:**
- Botón "Descargar Excel"
- Botón "Limpiar Filtros"

#### 6.3 Tabla de Dependientes

**Columnas:**

| Columna | Descripción |
|---------|-------------|
| Documento | DNI del dependiente |
| Nombre Completo | Nombre del dependiente |
| Titular | Nombre del afiliado titular |
| Parentesco | Relación con el titular |
| Plan | Plan EPS asociado |
| Fecha Nacimiento | Fecha de nacimiento |
| Estado | Activo / Inactivo |
| Acciones | Botones de acción |

**Acciones por Registro:**

1. **👁️ Ver Detalles**
   - Muestra información completa del dependiente

2. **✏️ Editar**
   - Permite modificar datos del dependiente
   - Cambiar parentesco
   - Actualizar información personal

3. **🗑️ Eliminar Asociación**
   - Desvincula al dependiente del titular
   - No elimina el registro del dependiente
   - Solo termina la asociación

---

### Modal de Edición de Dependiente

**Campos editables:**

- Nombre
- Apellidos
- Fecha de nacimiento
- Tipo de documento
- Número de documento
- Sexo
- Parentesco

**Validaciones:**
- Campos obligatorios marcados con (*)
- Formato de fecha válido
- Documento único

**Proceso de Actualización:**
- Endpoint: `/api/eps/actualizarDependiente`
- Valida datos antes de enviar
- Muestra confirmación de éxito

---

### Modal de Eliminar Asociación

**Advertencia:**
- Mensaje: "Esta acción eliminará la asociación del dependiente con el titular. El dependiente permanecerá en el sistema pero no estará vinculado a este plan."

**Confirmación:**
- Requiere confirmación explícita
- Botón rojo "Confirmar Eliminación"

**Proceso:**
- Endpoint: `/api/eps/eliminarAsociacionDependiente`
- Actualiza el estado de la asociación
- No elimina el registro del dependiente

---

## 7. 📝 Registro Especial

### Descripción General

Módulo para registrar personas en el sistema EPS que no tienen vínculo laboral con la empresa (familiares, externos, etc.).

**Ruta:** `/rrhh/eps/registrar`

### Diferencias con Registro Normal

- ❌ **No requiere** selección de empleado
- ✅ **Requiere** ingreso manual de todos los datos personales
- ✅ **Permite** registrar personas sin documento de empleado
- ✅ **Mismo flujo** de selección de plan y dependientes

### Estructura del Formulario

#### Sección 1: Datos Personales del Titular

**Campos del Formulario:**

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| Tipo de Documento | Select | ✅ Sí | DNI, Carnet de Extranjería, Pasaporte |
| Número de Documento | Texto | ✅ Sí | Único en el sistema |
| Nombres | Texto | ✅ Sí | Solo letras |
| Apellido Paterno | Texto | ✅ Sí | Solo letras |
| Apellido Materno | Texto | No | Solo letras |
| Fecha de Nacimiento | Fecha | ✅ Sí | Debe ser mayor de edad |
| Sexo | Select | ✅ Sí | Masculino, Femenino |
| Correo Electrónico | Email | No | Formato válido |
| Teléfono | Texto | No | Solo números |
| Dirección | Texto | No | - |

#### Sección 2: Selección de Plan

**Idéntico al registro normal:**
- Selector de plan EPS
- Visualización de costo
- Selección de período de inicio

#### Sección 3: Dependientes (si aplica)

**Mismo proceso que registro normal:**
- Selección de dependientes previos
- Registro de nuevos dependientes
- Asignación de parentescos

#### Sección 4: Resumen y Confirmación

**Muestra:**
- Datos del titular especial
- Plan seleccionado
- Dependientes asociados
- Costo total

---

### Proceso de Registro Especial

**Flujo del Backend:**

1. **Registro de Persona:**
   - Endpoint: `/api/eps/registrarDependiente`
   - Crea el registro de la persona en el sistema
   - Payload incluye todos los datos personales

2. **Registro de Afiliación:**
   - Endpoint: `/api/eps/registrarAfiliadoEPS`
   - Asocia a la persona con el plan EPS
   - Marca como "Registro Especial"

3. **Asociación de Dependientes:**
   - Mismo proceso que registro normal
   - Endpoint: `/api/eps/asosciarDependiente`

**Validaciones Especiales:**
- Verifica que el documento no esté duplicado
- Valida que sea mayor de edad (18+ años)
- Confirma que el correo sea único (si se proporciona)

**Mensajes del Sistema:**
- ⏳ "Registrando persona y afiliación..."
- ✅ "Registro especial completado exitosamente"
- ❌ "Error: El documento ya está registrado en el sistema"

---

## ❓ Preguntas Frecuentes

### Sobre Afiliaciones

**P: ¿Puedo cambiar de un plan superior a uno inferior?**
R: No, el sistema solo permite cambios a planes de igual o mayor jerarquía para mantener los beneficios del afiliado.

**P: ¿Qué pasa con los dependientes al cambiar de plan?**
R: Debes reasignar los dependientes según la capacidad del nuevo plan. Si el nuevo plan permite menos dependientes, deberás seleccionar cuáles mantener.

**P: ¿Puedo reactivar una afiliación dada de baja?**
R: No directamente. Deberás crear un nuevo registro de afiliación con una nueva fecha de inicio.

### Sobre Dependientes

**P: ¿Puedo asociar un mismo dependiente a múltiples titulares?**
R: No, cada dependiente solo puede estar asociado a un titular a la vez.

**P: ¿Cómo agrego más dependientes si mi plan lo permite?**
R: Usa la función "Editar" del afiliado y en el paso de dependientes, agrega los nuevos o selecciona de los existentes.

**P: ¿Qué pasa con los dependientes al dar de baja al titular?**
R: Todos los dependientes asociados se dan de baja automáticamente junto con el titular.

### Sobre Registros Especiales

**P: ¿Cuál es la diferencia entre un afiliado normal y uno especial?**
R: Los afiliados normales son empleados de la empresa. Los especiales son personas sin vínculo laboral (familiares, externos, etc.).

**P: ¿Los registros especiales tienen las mismas opciones de planes?**
R: Sí, tienen acceso a los mismos planes EPS disponibles.

### Sobre Reportes

**P: ¿Qué información incluye el Excel exportado?**
R: Incluye todos los campos visibles en la tabla más algunos campos adicionales como fechas completas y códigos internos.

**P: ¿Los filtros afectan la exportación?**
R: Sí, solo se exportan los registros que cumplen con los filtros aplicados.

---

## 📞 Soporte Técnico

Para asistencia adicional o reportar problemas:

- **Email:** soporte@expertisrrhh.com
- **Teléfono:** (01) XXX-XXXX
- **Horario:** Lunes a Viernes, 9:00 AM - 6:00 PM

---

## 📌 Notas Importantes

1. ✅ Todos los cambios en el sistema son registrados con fecha y usuario
2. ✅ Los datos son validados antes de ser guardados
3. ✅ Las fechas se manejan en formato peruano (DD/MM/YYYY)
4. ✅ Los montos se muestran en soles peruanos (S/)
5. ✅ El sistema requiere conexión a internet para funcionar
6. ✅ Se recomienda usar navegadores modernos (Chrome, Firefox, Edge)

---

**Versión del Manual:** 1.0  
**Fecha de Actualización:** Enero 2026  
**Sistema:** ExpertisRRHH - Módulo EPS

---

*Este manual es un documento vivo y será actualizado conforme se agreguen nuevas funcionalidades al sistema.*
