# 🏥 Diagnóstico por Imágenes - Hospital ERP

Microservicio del Servicio de Diagnóstico por Imágenes del Hospital. Gestiona órdenes médicas de imagen, estudios realizados, informes radiológicos y se integra con todos los módulos del ERP hospitalario.

**Responsable:** Joel David Cerrogrande Ortega

## 🚀 Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | .NET 8 Web API (ASP.NET Core) |
| Frontend | React 19 + Vite |
| Base de Datos | PostgreSQL (Entity Framework Core 8) |
| Documentación | Swagger / OpenAPI |
| Despliegue | Railway.app / Docker |

## 📁 Estructura del Proyecto

```
ImagenDiagnostico/
├── Controllers/          # API Controllers
│   ├── OrdenesImagenController.cs      # Gestión de órdenes
│   ├── EstudiosRealizadosController.cs # Estudios y estadísticas
│   ├── InformesRadiologicosController.cs # Informes
│   ├── TiposEstudioController.cs       # Catálogo tipos
│   ├── EquiposController.cs            # Catálogo equipos
│   ├── TecnicosEjecutoresController.cs # Catálogo técnicos
│   └── IntegracionesController.cs      # Endpoints para compañeros
├── Models/               # Entidades EF Core
├── DTOs/                 # Objetos de transferencia
├── Data/                 # DbContext
├── Migrations/           # Migraciones PostgreSQL
├── frontend/             # React + Vite Dashboard
│   ├── src/
│   │   ├── api/          # Servicios API
│   │   ├── pages/        # Páginas del dashboard
│   │   ├── components/   # Componentes reutilizables
│   │   ├── App.jsx       # Router principal
│   │   └── App.css       # Estilos
│   └── vite.config.js    # Vite + proxy
├── Dockerfile            # Docker para Railway
└── Program.cs            # Configuración CORS + Swagger
```

## 🔗 API Endpoints

### Para tu equipo (Imágenes)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| CRUD | `/api/ordenesimagen` | Gestión de órdenes |
| CRUD | `/api/estudiosrealizados` | Estudios realizados |
| CRUD | `/api/informes` | Informes radiológicos |
| GET | `/api/estudiosrealizados/pendientes-informe` | Estudios sin informe |
| GET | `/api/estudiosrealizados/contar-por-modalidad` | Stats por modalidad |

### Para tus compañeros
| Área | Responsable | Endpoint |
|------|-------------|----------|
| **Consultas Externas** | Wilson Yucra | `POST /api/ordenesimagen/orden-examen` |
| **Hospitalización** | Juan Cruz | `POST /api/ordenesimagen/orden-examen` |
| **Emergencias** | Alfredo Herbas | `PATCH /api/integraciones/emergencias/priorizar/{orden}` |
| **Farmacia** | Sergio Villarrubia | `GET /api/integraciones/farmacia/contrastes-pendientes` |
| **Facturación** | Carlos Balcazar | `GET /api/integraciones/facturacion/estudios-finalizados` |
| **Atención Paciente** | Enny Lopez | `GET /api/integraciones/atencion/informes-listos` |
| **Telemedicina** | Ricardo Valencia | `GET /api/integraciones/telemedicina/estudios-compartibles` |
| **RRHH** | Rodrigo Porcel | `GET /api/integraciones/rrhh/tecnicos-activos` |
| **Inventarios** | Juan Reyes | `GET /api/integraciones/inventarios/resumen-insumos` |

## 🛠️ Ejecución Local

### Backend
```bash
cd ImagenDiagnostico
dotnet restore
dotnet run
```
API disponible en: `http://localhost:5211`
Swagger: `http://localhost:5211/swagger`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend disponible en: `http://localhost:5173`

### Base de datos
```bash
# Crear base de datos PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres

# Aplicar migraciones
dotnet ef database update
```

## ☁️ Despliegue en Railway

### Backend
1. Ve a [Railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Selecciona este repositorio
3. Añade las variables de entorno:
   - `ConnectionStrings__DefaultConnection`: `Host=<host>;Database=ImagenDiagnosticoDB;Username=<user>;Password=<pass>`
   - `ASPNETCORE_ENVIRONMENT`: `Production`
4. Railway detectará automáticamente el Dockerfile

### Frontend
1. New Project → Deploy from GitHub
2. Selecciona el repositorio y setea el root directory a `frontend`
3. Railway detectará Node.js y hará `npm run build`
4. Setea la variable `VITE_API_URL` a la URL de tu backend en Railway

### PostgreSQL en Railway
1. En el mismo proyecto → Add Database → PostgreSQL
2. Copia la connection string y configúrala en el servicio backend

## 📊 Swagger Documentation

La API está documentada con Swagger. Una vez desplegada, accede a:
```
https://tu-backend.railway.app/swagger
```

Allí tus compañeros pueden:
- Ver todos los endpoints organizados por categoría
- Probar las requests directamente
- Ver el formato de request/response
- Copiar el código de ejemplo

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│                FRONTEND (React)                  │
│           Dashboard - Tu equipo de Imágenes      │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────┐
│            BACKEND API (.NET 8)                  │
│  ┌───────────┬───────────┬──────────────────┐   │
│  │  Órdenes  │ Estudios  │   Informes       │   │
│  │           │           │                  │   │
│  └───────────┴───────────┴──────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │       Integraciones (Compañeros)          │   │
│  │  Emergencias │ Farmacia │ Facturación     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │ SQL
              ┌───────▼────────┐
              │   PostgreSQL   │
              │   (Railway)    │
              └────────────────┘
```

## 📝 Licencia

Proyecto académico - Hospital ERP Module
