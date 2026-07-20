# ChefAI

Generador de recetas impulsado por inteligencia artificial. El usuario ingresa ingredientes (por texto o subiendo una imagen) y recibe una receta personalizada con instrucciones paso a paso, generada por Gemini AI. Incluye sistema de gamificación, desafíos semanales y ranking en tiempo real.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript, Vite, TanStack Query v5, Zustand, React Router v7, `sonner` |
| Backend | .NET 10, ASP.NET Core, Entity Framework Core 10 |
| Base de datos | PostgreSQL 16+ |
| AI | Google Gemini (`gemini-flash-latest`) — recetas (SSE streaming) + visión (detección de ingredientes) |
| Imágenes | Cloudinary |
| Tiempo real | SignalR (ranking live + notificaciones de badges) |

## Arquitectura

Monorepo con Clean Architecture en el backend:

```
backend/
  ChefAI.Domain          → Entidades, enums (sin dependencias)
  ChefAI.Application     → Servicios, DTOs, interfaces
  ChefAI.Infraestructure → EF Core, repositorios, Gemini, Cloudinary
  ChefAI.API             → Controllers, middleware, SignalR hubs

frontend/
  src/features/
    auth/                → Login, registro, perfil, rutas protegidas
    recipes/             → Generación, historial, favoritos, detalle
    challenges/          → Desafíos, feed, ranking, votación
    gamification/        → Puntos, badges, nivel
```

Las dependencias del backend apuntan hacia adentro (Domain no conoce a nadie).

## Requisitos

- Node.js 20+
- .NET 10 SDK
- PostgreSQL 16+
- Cuenta de Google Gemini (API key)
- (Opcional) Cuenta de Cloudinary

## Configuración

### Base de datos

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
dotnet ef database update --project ../ChefAI.Infraestructure --startup-project .
```

### Frontend

```bash
cd frontend
npm install
```

Crear `.env`:

```
VITE_API_URL=https://localhost:7176
```

## Ejecución

### Backend

```bash
dotnet run --project backend/ChefAI.API
```

Arranca en `http://localhost:5010`.

### Frontend

```bash
cd frontend
npm run dev
```

Arranca en `http://localhost:5173`.

## Rutas del frontend

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Home con grid de acciones | Protected |
| `/generate-recipe` | Generar receta (texto o imagen) | Protected |
| `/recipe-history` | Historial de recetas generadas | Protected |
| `/favorites` | Recetas favoritas | Protected |
| `/recipe/:id` | Detalle de receta | Protected |
| `/profile` | Perfil (restricciones, preferencias) | Protected |
| `/challenge` | Desafío activo, participar | Protected |
| `/challenge/leaderboard` | Feed del desafío con votación | Protected |
| `/challenge/ranking` | Ranking del desafío activo | Protected |
| `/challenge/ranking/total` | Ranking global acumulado | Protected |
| `/challenge/history` | Historial de desafíos completados | Protected |
| `/admin` | Panel de administración de desafíos | Admin |
| `/login` | Inicio de sesión | Public |
| `/register` | Registro | Public |

La navbar tiene un **toggle Personal/Social** para alternar entre las funciones individuales y las sociales (desafíos, ranking).

## Funcionalidades

### Generación de recetas

- **Por texto**: ingresás ingredientes separados por coma y la IA genera una receta.
- **Por imagen**: subís una foto de ingredientes, Cloudinary la almacena y Gemini Vision los reconoce automáticamente.
- **Streaming SSE**: la receta se muestra en tiempo real mientras se genera (texto + pasos con animación staggered).
- **Persiste en BD**: cada receta generada se guarda con ingredientes, pasos y metadata.

### Sistema de gamificación

- **Puntos**: se acumulan por generar recetas, marcar favoritos, participar en desafíos y recibir votos.
- **Racha (streak)**: mantiene registro de días consecutivos de actividad.
- **Nivel**: se calcula en base a los puntos totales.
- **Badges**: 8 insignias desbloqueables con condiciones variadas (TotalRecipes, CurrentStreak, TotalFavorites, etc.).

### Desafíos semanales

- **Creación admin**: un admin selecciona un ingrediente estrella, define fechas y activa el desafío.
- **Participación**: el usuario genera una receta que incluya el ingrediente estrella y la participa automáticamente.
- **Feed y votación**: las participaciones se muestran en un feed ordenado por votos, con votación optimista (actualización instantánea en UI).
- **Ranking**: tabla con posición, autor, receta y votos. Top 3 con medallas 🥇🥈🥉.
- **Historial**: desafíos completados consultables con ranking final expandible.
- **Countdown**: muestra tiempo restante del desafío activo, tics cada segundo.

### Tiempo real (SignalR)

- **Ranking live**: el ranking del desafío se actualiza en tiempo real cuando otros usuarios votan.
- **Notificaciones**: toast emergente cuando se desbloquea un badge.
- **Indicador de conexión**: muestra estado de la conexión WebSocket (conectado, reconectando, desconectado).

### Perfil y preferencias

- **Restricciones dietéticas**: vegetariano, vegano, sin gluten, sin lactosa, keto, etc. (9 pre-cargadas).
- **Preferencias**: dificultad preferida, tiempo máximo de cocción, porciones por defecto.
- Se reflejan automáticamente al generar recetas.

### Autenticación

- JWT con refresh token rotation (7 días).
- Roles: `User` y `Admin`.
- Axios interceptor que renueva el token automáticamente en 401.
- Rutas protegidas (`ProtectedRoute`) y rutas admin (`AdminRoute`).

## API endpoints principales

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/auth/login` | POST | No | Login, devuelve token |
| `/api/auth/register` | POST | No | Registro de usuario |
| `/api/recipe/generate` | POST | Si | Genera receta con SSE streaming |
| `/api/recipe/user/history` | GET | Si | Historial del usuario |
| `/api/recipe/{id}/favorite` | POST/DELETE | Si | Toggle favorito |
| `/api/image/detect-ingredients` | POST | Si | Detectar ingredientes desde foto |
| `/api/challenge/active` | GET | Si | Desafío activo actual |
| `/api/challenge/{id}/participate` | POST | Si | Participar en desafío |
| `/api/challenge/{id}/feed` | GET | Si | Feed paginado del desafío |
| `/api/challenge/entries/{id}/vote` | POST/DELETE | Si | Votar / quitar voto |
| `/api/challenge/history` | GET | Si | Historial de desafíos |
| `/api/challenge/ranking/total` | GET | Si | Ranking global |
| `/api/gamification/points` | GET | Si | Puntos, racha y nivel |
| `/api/gamification/badges` | GET | Si | Badges con estado |
| `/api/userprofiles/{userId}` | GET/PUT | Si | Ver / editar perfil |
| `/api/dietaryrestrictions` | GET | No | Lista de restricciones |
