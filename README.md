

 <img width="100" height="100" alt="Diseño sin título (2)" src="https://github.com/user-attachments/assets/2cadcd57-e138-47f3-8a0b-64f05ef7aa66" />
# Sistema de Gestion - Betel Laboratorio Clinico

Plataforma web para administrar la operacion del Laboratorio Clinico Betel. Centraliza inventario, configuracion de examenes, costos y una vista operativa con indicadores clave.

<img width="1915" height="943" alt="image" src="https://github.com/user-attachments/assets/bc7f0ce1-9df5-4bb1-b9a9-bed98f515309" />


## Descripcion General

El sistema permite a administradores y bioanalistas gestionar el flujo de trabajo del laboratorio. Su eje principal es vincular inventario (reactivos e insumos) con la definicion de examenes para calcular costos y descontar stock al crear un examen. Incluye un modulo de creacion de examenes por pasos, edicion de examenes y un dashboard con KPIs.

## Caracteristicas Principales (Confirmadas en el codigo)

* **Dashboard Operativo:** KPIs (examenes totales, creados hoy, en proceso, archivados) y alertas de stock bajo.
* **Gestion de Inventario:** Alta y listado de productos con control de stock minimo y categorias.
* **Configurador de Examenes (Workbench):** Flujo por pasos para crear examenes con rangos de referencia por edad y genero, y componentes del inventario.
* **Edicion y Resultados:** Edicion de metadatos del examen y plantilla de resultados/interpretacion.
* **Busqueda de Examenes:** Filtro por codigo o nombre desde la vista de examenes.

## Tecnologias Utilizadas

Arquitectura Full Stack basada en JavaScript/TypeScript.

### Frontend

* **Framework:** Next.js 16.1.6 (App Router)
* **Lenguaje:** TypeScript / JavaScript
* **Estilos:** Tailwind CSS
* **Iconografia:** Google Material Symbols (Outlined)
* **UI:** React 19

### Backend

* **API:** Next.js Route Handlers (App Router)
* **Base de Datos:** MongoDB
* **ODM:** Mongoose
* **Autenticacion:** NextAuth.js (Credentials)

## Requisitos Previos

* Node.js 18 o superior
* npm
* MongoDB (local o Atlas)

## Instalacion y Configuracion

1. **Clonar el repositorio**
```bash
git clone https://github.com/CarlosMedinaRangel/betel-laboratorio-next.git
cd betel-laboratorio
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crea un archivo `.env` en la raiz del proyecto:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/beteldb
NEXTAUTH_SECRET=tu_clave_secreta_para_sesiones
NEXTAUTH_URL=http://localhost:3000
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicacion estara disponible en `http://localhost:3000`.

## Estructura del Proyecto

Estructura real basada en el App Router de Next.js:

```text
app/
  (auth)/
    login/                 # Vista de autenticacion
  (dashboard)/
    page.tsx               # Dashboard
    examenes/              # Modulo de examenes
    productos/             # Modulo de inventario
  api/
    auth/[...nextauth]/    # NextAuth
    dashboard/             # KPIs y alertas
    examenes/              # CRUD de examenes
    examenes/[id]/         # Detalle/edicion por codigo
    product/               # CRUD de inventario
    users/                 # Creacion de usuarios
lib/
  mongoose.ts              # Conexion a MongoDB
models/
  exam.js
  product.js
  users.js
```

## Modelos de Datos (MongoDB)

### Product (Inventario)

* **serial:** identificador unico
* **name:** nombre del producto
* **unit:** unidad de medida (numero)
* **stock:** cantidad disponible
* **minStock:** umbral de alerta
* **price:** costo unitario
* **category:** categoria del insumo

### Exam (Examenes)

* **code:** codigo interno unico (se usa como identificador)
* **name, category, sampleType, methodology, tat, price**
* **status:** `activo`, `En proceso`, `archivado`
* **resultados:** plantilla o interpretacion
* **ranges:** rangos de referencia (edad, genero, min, max, unidad)
* **components:** insumos utilizados (productId -> referencia a Product, name, cost, quantity, usagePhase)

### Relaciones (Entidad-Relacion)

* **Exam.components.productId** referencia a **Product** (ObjectId). Se conserva `name` y `cost` como snapshot.

### User (Usuarios)

* **name, email, password, role**

## API Endpoints

* `GET /api/dashboard` - KPIs y productos con stock bajo
* `GET /api/product` - listado de inventario
* `POST /api/product` - crear producto
* `GET /api/examenes?search=...` - listado/filtrado de examenes
* `POST /api/examenes` - crear examen (descuenta stock)
* `GET /api/examenes/[code]` - obtener examen por codigo
* `PUT /api/examenes/[code]` - actualizar examen
* `POST /api/users` - crear usuario
* `POST /api/auth/[...nextauth]` - login (Credentials)

## Scripts Utiles

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Despliegue

El proyecto esta optimizado para Vercel, pero puede ejecutarse en cualquier host con Node.js.

```bash
npm run build
npm start
```
