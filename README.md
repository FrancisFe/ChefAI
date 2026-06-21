# ChefAI

Generador de recetas impulsado por inteligencia artificial. El usuario ingresa ingredientes (por texto o subiendo una imagen) y recibe una receta personalizada con instrucciones paso a paso, generada por Gemini AI.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript, Vite, TanStack Query, Zustand, React Router, `sonner` |
| Backend | .NET 10, ASP.NET Core, Entity Framework Core 10 |
| Base de datos | PostgreSQL 16+ |
| AI | Google Gemini (`google-flash-lite-latest`) |
| Imágenes | Cloudinary |

## Arquitectura

Clean Architecture con 4 proyectos:

```
ChefAI.Domain       → Entidades, enums
ChefAI.Application  → Servicios, DTOs, interfaces
ChefAI.Infraestructure → EF Core, repositorios, Gemini, Cloudinary
ChefAI.API          → Controllers, middleware, Swagger
```

Las dependencias apuntan hacia adentro (Domain no conoce a nadie).

## Requisitos

- Node.js 20+
- .NET 10 SDK
- PostgreSQL 16+
- Cuenta de Google Gemini (API key)
- (Opcional) Cuenta de Cloudinary

## Configuración

### Base de datos

Crear la base de datos en PostgreSQL:

```bash
createdb chefai_dev
```

### Backend

Clonar el repo y configurar User Secrets (no commitees keys reales):

```bash
cd backend/ChefAI.API
dotnet user-secrets set "GeminiSettings:ApiKey" "tu-api-key-de-gemini"
dotnet user-secrets set "Cloudinary:CloudName" "tu-cloud-name"
dotnet user-secrets set "Cloudinary:ApiKey" "tu-api-key"
dotnet user-secrets set "Cloudinary:ApiSecret" "tu-api-secret"
dotnet user-secrets set "AppSettings:Token" "clave-jwt-de-al-menos-64-caracteres"
```

Correr migraciones:

```bash
dotnet ef database update --project ../ChefAI.Infraestructure
```

### Frontend

```bash
cd frontend/chefai-frontend
npm install
```

Crear `.env`:

```
VITE_API_URL=https://localhost:7176
```

## Ejecución

### Backend

```bash
cd backend/ChefAI.API
dotnet run
```

Arranca en `http://localhost:5010` — Swagger en `/swagger`.

### Frontend

```bash
cd frontend/chefai-frontend
npm run dev
```

Arranca en `http://localhost:5173`.

## Rutas del frontend

| Ruta | Pantalla |
|---|---|
| `/` | Home con navegación |
| `/generate-recipe` | Generar receta (texto o imagen) |
| `/recipe-history` | Historial de recetas generadas |
| `/favorites` | Recetas favoritas |
| `/recipe/:id` | Detalle de receta |
| `/profile` | Perfil (restricciones, preferencias) |
| `/login` | Inicio de sesión |
| `/register` | Registro |

## Funcionalidades principales

- **Generación por texto**: ingresás ingredientes separados por coma y la IA genera una receta.
- **Detección por imagen**: subís una foto de ingredientes y la IA los reconoce automáticamente.
- **Streaming SSE**: la receta se muestra en tiempo real mientras se genera.
- **Favoritos**: marcá recetas como favoritas con actualización optimista (TanStack Query `onMutate`).
- **Perfil personalizado**: restricciones dietéticas, porciones por defecto, tiempo máximo de cocción y dificultad preferida.
- **Autenticación JWT** con refresh token rotation.
