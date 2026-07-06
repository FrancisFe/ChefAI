# ChefAI — Agent Guide

## Structure

Monorepo with two top-level packages:

- **`backend/`** — .NET 10 Clean Architecture solution (`backend.slnx`)
  - `ChefAI.API` — Web API entrypoint (Controllers, Middleware, Program.cs). Starts on `http://localhost:5010` / `https://localhost:7176`
  - `ChefAI.Application` — Services, DTOs, Mappers, Interfaces
  - `ChefAI.Domain` — Entities, Enums (no deps)
  - `ChefAI.Infraestructure` — EF Core DbContext, Repositories, Cloudinary, Gemini, Migrations
- **`frontend/`** — React 19 + TypeScript + Vite

## Commands

| Area | Command | Notes |
|------|---------|-------|
| Frontend dev | `npm run dev` | Vite dev server, default `http://localhost:5173` |
| Frontend build | `npm run build` | Runs `tsc -b` then `vite build` |
| Frontend lint | `npm run lint` | ESLint flat config (`eslint.config.js`) |
| Backend run | `dotnet run --project backend\ChefAI.API` | |
| Backend build | `dotnet build backend\backend.slnx` | |
| EF migration | `dotnet ef migrations add <Name> --project backend\ChefAI.Infraestructure --startup-project backend\ChefAI.API` | |
| EF update DB | `dotnet ef database update --project backend\ChefAI.Infraestructure --startup-project backend\ChefAI.API` | |

No tests exist anywhere in the repo.

## DB schema (PostgreSQL, EF Core)

All tables use snake_case names via `[EntityTypeConfiguration]` in `ChefAI.Infraestructure/Configs/`. Key tables and relationships:

| Table | Notes |
|-------|-------|
| `users` | `Email` unique index, `UserName` unique index (max 50, required), `Role` stored as string (`User`/`Admin`), cascade-deletes to profile, points, recipes, challenge entries, badges |
| `user_profiles` | 1:1 with `users` via `UserId`, stores `PreferredDifficulty`, `MaxCookingTime`, `DefaultServings`. M:N with `dietary_restrictions` via `user_profile_dietary_restriction` |
| `user_points` | 1:1 with `users`, tracks `TotalPoints`, `UserStreak`, `LastActivityDate` |
| `recipes` | `Steps` stored as a single string (max 8000 chars, newline-delimited). `HasAwardedFavoritePoints` boolean column. M:N with `dietary_restrictions` via `recipe_dietary_restriction` |
| `recipe_ingredients` | `Quantity` is nullable `decimal(10,2)` — null means "al gusto". `Unit` defaults to empty string. Cascade-deletes with recipe |
| `dietary_restrictions` | Pre-seeded with 9 rows (Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Pescatarian, Keto, No-Pork, Low-Carb) |
| `badges` | Has `Condition` (string, e.g. `TotalRecipes`, `CurrentStreak`, `TotalFavorites`) and `ConditionValue` (int?) for evaluating unlocks. Pre-seeded with 8 badges |
| `user_badges` | Composite PK (`UserId`, `BadgeId`) |
| `challenges` | FK to `recipe_ingredients` as `StarIngredientId` (Restrict delete) |
| `challenge_entries` | FKs to challenge, user, recipe. `VoteCount` columna con default 0, se incrementa/decrementa con cada voto |
| `votes` | FK a `UserId` y `ChallengeEntryId`, índice único compuesto, cascade delete en ambas. `CreatedAt` con default `CURRENT_TIMESTAMP` |
| `recipe_dietary_restriction` | Join table (recipes M:N dietary_restrictions) |
| `user_profile_dietary_restriction` | Join table (user_profiles M:N dietary_restrictions) |

Migration history (10 existing): InitialMigration → CambiosRecipe → QuantityAcceptNullValue → IncreaseStepsColumnSize → DietaryRestrictionsAdded → BadgeSystem → AddHasAwardedFavoritePoints → AddVotesTable → AddUserNameToUser.

## API endpoints

All routes are under `api/[controller]` with `[ApiController]` attribute.

| Endpoint | Auth | Behavior |
|----------|------|----------|
| `POST /api/auth/login` | No | Returns `{ token, expiresAt, refreshToken }`. Frontend stores in localStorage + Zustand |
| `POST /api/auth/register` | No | Requires `UserName` (3-50 chars), `Email`, `Password`, `ConfirmPassword` (validated on DTO). Auto-creates default `UserProfile` (`Medium` difficulty, 30min, 4 servings). Returns `{ email, userName, role }` |
| `POST /api/auth/refresh-token` | No | Expects `{ refreshToken }`. Rotates refresh token (7-day expiry). Throws `UnauthorizedAccessException` if expired |
| `POST /api/auth/logout` | Yes | Clears `RefreshToken`/`TokenExpires` on user record |
| `GET /api/auth/is-admin` | Yes | Returns `bool` based on `User.IsInRole("Admin")` |
| `POST /api/recipe/generate` | Yes | **SSE streaming endpoint**. Accepts `{ ingredients[], userId, servings?, maxCookingTimeMinutes?, difficulty? }`. Returns `data:` SSE lines then `data: [DONE]`. Parses Gemini response and auto-saves to DB. Throws on parse failure |
| `GET /api/recipe/user` | Yes | Returns all recipes for the authenticated user (from JWT claim), ordered by `CreatedAt` desc. Includes ingredients |
| `POST /api/image/detect-ingredients` | Yes | Accepts `multipart/form-data` file. Uploads to Cloudinary AND sends to Gemini Vision in parallel. Returns `{ imageURL, ingredients }` (comma-separated string) |
| `GET /api/dietaryrestrictions` | No | Returns all pre-seeded dietary restrictions |
| `GET /api/dietaryrestrictions/{id}` | No | Returns single restriction |
| `GET /api/userprofiles/{userId}` | Yes | Returns `{ id, preferredDifficulty, maxCookingTime, defaultServings, dietaryRestrictions[] }` |
| `PUT /api/userprofiles/{userId}` | Yes | Updates profile fields |
| `POST /api/userprofiles/{userId}/dietary-restrictions/{dietaryRestrictionId}` | Yes | Adds restriction to profile (idempotent — skips if already exists) |
| `GET /api/gamification/points` | Yes | Returns `{ totalPoints, currentStreak, currentLevel }` |
| `GET /api/gamification/badges` | Yes | Returns all badges with `isUnlocked` status for the authenticated user |
| `POST /api/challenge` | Admin | Creates a challenge. Body: `{ starIngredientId, startDate, endDate }`. Returns `ChallengeResultDto` |
| `POST /api/challenge/{challengeId}/activate` | Admin | Sets challenge status to `Active`. Returns `204` |
| `POST /api/challenge/{challengeId}/close` | Admin | Sets challenge status to `Completed`. Returns `204` |
| `POST /api/challenge/{challengeId}/participate` | Yes | Body `{ recipeId }`. Calls `ParticipateAsync` (validates ownership, prevents double participation, awards `ParticipateInChallenge` points, updates streak, evaluates badges). Returns `PointsResult` |
| `GET /api/challenge/active` | Yes | Returns the currently active challenge (`ChallengeResultDto` with `Id`, `StarIngredientName`, `HasParticipated`) or `404` if none |
| `GET /api/challenge/ingredients` | Admin | Returns distinct ingredients from `recipe_ingredients` grouped by name |
| `POST /api/challenge/entries/{entryId}/vote` | Yes | Vota una entrada del desafío. Valida: desafío activo → no es dueño → no votó antes. Crea `Vote`, incrementa `VoteCount`, suma 2 puntos (`ReceiveVote`) al dueño de la receta y evalúa sus badges. Devuelve `{ points, badges }` |
| `DELETE /api/challenge/entries/{entryId}/vote` | Yes | Quita el voto (solo si desafío activo). Elimina `Vote`, decrementa `VoteCount`, resta 2 puntos al dueño. Devuelve `{ points }` |
| `GET /api/challenge/{id}/feed` | Yes | Devuelve las entries del desafío ordenadas por `VoteCount` desc, con paginación (`page`, `pageSize` query params, default 20). Respuesta `PagedResponse<ChallengeFeedEntryDto>` con `items`, `totalCount`, `page`, `pageSize`, `hasNextPage`. Cada item incluye `entryId`, `recipeId`, `recipeTitle`, `ownerUserId`, `ownerName`, `voteCount`, `hasVoted` |
| `GET /api/challenge/history` | Yes | Devuelve lista de desafíos completados (`ChallengeHistoryDto` con `id`, `starIngredientName`, `startDate`, `endDate`, `participationCount`), ordenados por `endDate` desc |

## Auth flow

- JWT (HmacSha512), 1-day expiry. Refresh token (random 64 bytes, Base64), 7-day expiry.
- Claims: `nameidentifier` (userId), `email`, `role`, `sub` (userId), `jti`.
- Token stored in `localStorage` key `token`. Also stores `refreshToken`, `expiresAt`, `userId`.
- Frontend axios interceptor in `lib/api-client.tsx` auto-attaches `Bearer` header and retries once on 401 via `/api/auth/refresh-token`. Falls back to logout.
- Frontend `<ProtectedRoute>` wraps authenticated routes; redirects to `/login` if not logged in.
- Frontend `<AdminRoute>` wraps admin routes; extracts role from JWT (`payload.role === "Admin"`) and redirects to `/` if not admin. No API call needed.
- `LoginForm` has a "Registrate" link to `/register`.

## Recipe generation (SSE streaming flow)

1. Frontend `useRecipeStream` hook sends `POST` with `fetch()` (not axios, to handle SSE natively) to `/api/recipe/generate`
2. Backend `RecipeController` sets `Content-Type: text/event-stream` with `DisableBuffering()`
3. `RecipeService` streams chunks from `GeminiRecipeService` (Gemini Flash model, SSE from Gemini API), yielding each chunk
4. Controller writes `data: {chunk}\n\n` SSE frames, flushing after each
5. Frontend accumulates chunks, parses via `parseRecipeFromText()` (regex-based section detection)
6. After Gemini finishes, backend saves the recipe to DB via `RecipeTextParser` → `RecipeMapper` → `RecipeRepository.SaveAsync`
7. Backend yields `data: [DONE]` then yields a JSON payload containing `{ recipeId, pointsEarned, totalPoints, currentLevel, leveledUp, badges }`
8. Frontend reads the `[DONE]` frame, parses the recipe, then reads the next frame (the JSON payload) and extracts `recipeId`
9. Parsed recipe is displayed via `<RecipeDisplay>` (staggered fade-in animation)
10. If in challenge mode (`isChallengeMode`), frontend auto-calls `POST /challenge/{id}/participate { recipeId }` after stream completes

## Recipe text format (Gemini → parse contract)

Gemini prompt enforces this exact format:

```
# [Title]
[Description]
⏱ Tiempo: [XX] min | 🍽 Porciones: [X]

## Ingredientes
- [CANTIDAD] [UNIDAD] - [NOMBRE]
- a gusto - [NOMBRE]

## Pasos
1. [Step text]
2. [Step text]
```

Both frontend and backend have **duplicated parsing logic** in:
- Frontend: `useRecipeStream.ts:parseRecipeFromText()`
- Backend: `RecipeTextParser.cs:ParseRecipeFromText()`

If you change one, you must update the other.

## External services (dev values in `appsettings.json`, override via User Secrets)

- **Cloudinary**: `Cloudinary` config section (`CloudName`, `ApiKey`, `ApiSecret`). Uploads to folder `chefaiUploads`. Max file size 5MB enforced server-side.
- **Gemini**: `GeminiSettings` section (`ApiKey`). Uses `gemini-flash-latest` model. Two services:
  - `GeminiVisionService` — POST to `:generateContent` endpoint (non-streaming), expects JSON array response
  - `GeminiRecipeService` — POST to `:streamGenerateContent?alt=sse` endpoint (SSE streaming), with `systemInstruction` support

Both Gemini services are registered as `HttpClient` in DI. Vision service reads `ApiKey` from `IOptions<GeminiSettings>`. Recipe service reads directly from `IConfiguration["GeminiSettings:ApiKey"]`.

## Frontend patterns

- **State**: Zustand (persisted to localStorage key `userLoginStatus`) for auth; TanStack React Query v5 for server state (5min stale time, retry: 1, no refetch on focus).
- **Feature-based structure**: No flat `hooks/` or `pages/` dirs. Code lives in `src/features/{auth,challenges,gamification,recipes}/` with co-located `hooks/` and `components/`.
- **API client**: Axios instance with base URL `${VITE_API_URL}/api` (from `.env`: `https://localhost:7176`). Typed helper functions + interfaces in `api-client.tsx`.
- **Routing**: React Router v7 (`createBrowserRouter`). Routes: `/` (home), `/login`, `/register`, `/generate-recipe`, `/recipe-history` `/favorites`, `/recipe/:id`, `/profile` `/challenge`, `/challenge/leaderboard`, `/challenge/ranking`, `/challenge/history`, `/admin`. Protected routes via `<ProtectedRoute>` wrapper; admin routes via `<AdminRoute>` wrapper.
- **Navbar**: Persistent navbar (`components/Navbar.tsx`) rendered in `ProtectedRoute`. Toggle Personal/Social mode via `uiStore` (Zustand, not persisted). Personal links: Generar Receta, Mi Historial, Mis Favoritos, Mi Perfil. Social links: Desafío Activo, Feed, Ranking, Historial. Admin link shown in both modes if `isAdmin`.
- **TS strictness**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly` enabled.
- **Styling**: No shadcn/ui, no Tailwind. All components use inline `style` props + CSS variables from `index.css` (`--text`, `--bg`, `--border`, `--accent`, `--accent-bg`, `--shadow`, etc.).
- **Recipe hooks**: `useRecipeStream` (raw fetch for SSE, exposes `recipeId`), `useRecipeHistory` (TanStack Query), `useDetectIngredients` (plain state).
- **Challenge hooks**: `useActiveChallenge` (TanStack Query over `GET /challenge/active`, no retry on 404), `useParticipate` (mutation over `POST /challenge/{id}/participate`, invalidates `["gamification","points","badges","challenge"]`), `useChallengeFeed` (`useInfiniteQuery` over `GET /challenge/{id}/feed` with pagination, helper `flattenFeedPages` to merge pages), `useVote` (optimistic mutation for vote/unvote, adapted for infinite query cache structure), `useChallengeHistory` (TanStack Query over `GET /challenge/history`, 5min stale time), `useCountdown` (extracted hook, returns `Xd Xh Xm` string, ticks every second).
- **Profile in generator**: `RecipeGeneratorPage` loads `defaultServings`, `maxCookingTime`, `preferredDifficulty` from the user profile on mount (via `useProfile`), so saved preferences are reflected.
- **`useToggleFavorite`** uses `sonner` `toast` for error feedback. `<Toaster position="bottom-right" richColors />` is mounted in `main.tsx`.
- **`tsc -b`** is used in build (project references: `tsconfig.app.json` + `tsconfig.node.json`).
- **`useVote`** patrón de mutación optimista idéntico a `useToggleFavorite`: `onMutate` actualiza el cache de `["challenge", "feed", challengeId]` (estructura de infinite query con `pages`), `onError` hace rollback, `onSettled` invalida. Sin estado local.
- **`useParticipate`** ya NO muestra toast de éxito — el overlay `ParticipationSuccessOverlay` reemplaza el toast. El hook solo invalida queries. Exporta `PointsResult` type.

## Reusable UI components (inline styles, no shadcn)

| Component | File | What it does / Reusable for |
|-----------|------|----------------------------|
| **RecipeList** | `features/recipes/components/RecipeList.tsx` | Generic list wrapper with loading/error/empty states, title, CSS grid of RecipeCards |
| **RecipeCard** | `features/recipes/components/RecipeCard.tsx` | Card with title, date, metadata, ingredients, favorite heart toggle (uses `useToggleFavorite`) |
| **BadgeGrid** | `features/gamification/components/BadgeGrid.tsx` | CSS grid of cards with locked/unlocked styling, hover tooltip |
| **PointsBar** | `features/gamification/components/PointsBar.tsx` | Top bar showing level/points/streak, used inside ProtectedRoute |
| **RestrictionsChips** | `features/recipes/components/RestrictionsChips.tsx` | Pill-shaped blue tags (borderRadius 16px) for dietary restrictions |
| **RecipeDisplay** | `features/recipes/components/RecipeDisplay.tsx` | Structured recipe view with staggered fade-in CSS animation (`.fade-section`) |
| **ChallengeEntryCard** | `features/challenges/components/ChallengeEntryCard.tsx` | Feed entry card: ranking medal, title (clickable → recipe detail), author name, vote count, ▲ button. Shows "Tu receta" label for own entries. Vote button disabled when challenge closed |
| **ChallengeFeed** | `features/challenges/components/ChallengeFeed.tsx` | Filterable list of ChallengeEntryCards with search input, "Cargar más" pagination button |
| **ChallengeRankingTable** | `features/challenges/components/ChallengeRankingTable.tsx` | Table with columns Posición/Autor/Receta/Votos, medals for top 3, rows clickable to recipe detail |
| **ChallengeHistoryCard** | `features/challenges/components/ChallengeHistoryCard.tsx` | Expandable card for completed challenges, lazy-loads ranking on expand |
| **ParticipationSuccessOverlay** | `features/challenges/components/ParticipationSuccessOverlay.tsx` | Modal overlay after successful participation: shows points, level, button to feed |
| **Navbar** | `components/Navbar.tsx` | Persistent nav bar with Personal/Social toggle, dynamic links, logout |
| *No Button/Input/Card/Dialog primitives exist* | — | Build from `<button>` / `<input>` / `<div>` with inline `style` + CSS variables |

## Error handling

- Global `ExceptionHandlingMiddleware` catches all unhandled exceptions and maps them to HTTP status codes:
  - `ArgumentNullException` / `InvalidOperationException` → 400 with Spanish message
  - `UnauthorizedAccessException` → 401
  - `KeyNotFoundException` → 404
  - Everything else → 500 with `traceId`
- Backend controllers return `BadRequest` on invalid `ModelState`.
- Recipe streaming catches `OperationCanceledException` gracefully (client disconnect).

## Notable quirks

- `ChefAI.API/Middleware/` has a typo ("Middleware" not "Middleware") but namespace is correct: `ChefAI.API.Middleware`.
- Two controllers (`DietaryRestrictionsController`, `UserProfilesController`) use namespace `ChefAI.Api.Controllers` (capital A in "Api") instead of `ChefAI.API.Controllers`. Works because .NET merges assemblies but may confuse tooling.
- `Npgsql.EnableLegacyTimestampBehavior` enabled in `Program.cs` (`DateTime` with Npgsql).
- `appsettings.json` contains dev-only secrets (JWT, Cloudinary, Gemini). In development, `AddUserSecrets<Program>()` overrides these values.
- Frontend has a `public/icons.svg` sprite file and `public/favicon.svg`.
- Backend `ChefAI.API.http` still has a stale `/weatherforecast/` endpoint reference from the template.
- `ProfilePage`, `BadgeGrid`, `RecipeCard`, `RecipeList`, `FavoritesPage`, `RecipeDetailPage` are imported and wired in the router.
- `useToggleFavorite` uses `sonner` `toast` for errors (sonner is installed and `<Toaster />` is mounted in `main.tsx`).
- `sonner` `<Toaster position="bottom-right" richColors />` is mounted in `main.tsx` and used by `useToggleFavorite`, `useVote`, and `useUpdateProfile`. `useParticipate` NO usa toast (usa overlay).

## Vote system (backend)

- **Tabla `votes`**: FK compuesto único a `(UserId, ChallengeEntryId)`, cascade delete en ambas relaciones.
- **`IVoteRepository`**: `GetByUserAndEntryAsync` (busca por userId+entryId con AnyAsync, NO FindAsync por PK), `AddAsync`/`RemoveAsync` sin SaveChanges, `GetUserVotedEntryIdsAsync` (batch query para feed), `SaveChangesAsync`.
- **`VoteService`** en Application: inyecta `IVoteRepository`, `IChallengeEntryRepository`, `IGamificacionService`.
  - `VoteAsync(userId, entryId)`: valida en orden: entry existe → challenge activo → no es dueño (`entry.UserId == userId`, NO `entry.Recipe.UserId`) → no votó antes → crea Vote → incrementa `VoteCount` → SaveChanges atómico → suma 2 puntos (`ReceiveVote`) al `entry.UserId` → evalúa badges.
  - `RemoveVoteAsync(userId, entryId)`: busca vote por IDs, valida challenge activo, borra, decrementa `VoteCount`, resta 2 puntos via `DeductPoints` al `entry.UserId`, evalúa badges.
- **`IGamificacionService`**: se agregó `DeductPoints(int userId, int points)` para restar puntos (con mínimo 0).
- **`ChallengeEntryRepository`**: se agregó `GetByIdAsync(id)` con includes de `Challenge` y `Recipe`, `GetByChallengeIdAsync` con includes de `Recipe` y `User` ordenado por `VoteCount` desc.
- **`ChallengeController`**: los endpoints de voto viven en `ChallengeController.cs` con las rutas `entries/{entryId}/vote` (POST/DELETE) y `{id}/feed` (GET).

## Challenge mode flow

1. User visits `/challenge` → `GET /api/challenge/active` fetches the active challenge (or 404 → "No hay desafío activo esta semana").
2. If active challenge is found, it shows the star ingredient ⭐, a countdown (`Xd Xh Xm`, ticking each second), and a "Participar" button.
3. The button is **disabled** if `hasParticipated: true` (greyed out, text "Ya participaste").
4. When "Participar" is clicked, the Zustand store `challengeStore.ts` sets `isChallengeMode = true`, `activeChallengeId`, `starIngredientName`. Then navigates to `/generate-recipe`.
5. On `/generate-recipe`:
   - A toggle chip (pill-shaped, same style as `RestrictionsChips`) shows the challenge status:
     - Blue + clickable: "⭐ Participar en desafío: {name}" (not participating yet)
     - Gold + clickable: "⭐ Participando: {name} (click para salir)" (actively participating)
     - Grey + disabled: "✓ Ya participaste: {name}" (already participated)
   - When toggled ON, the input is pre-filled with the star ingredient name.
   - An ✕ is available on the gold chip to exit challenge mode at any time.
6. When the recipe stream completes and `recipeId` is available:
   - If `isChallengeMode && activeChallengeId && !participatedRef` → auto-calls `POST /challenge/{id}/participate { recipeId }`.
   - On success: shows `ParticipationSuccessOverlay` with points earned, current level, and button to navigate to feed. Invalidates gamification + challenge queries. Calls `exitChallenge()` on overlay close.
   - On error: toast with the server message (e.g., "Ya participaste en este desafío.").
7. Toggling challenge mode OFF before generating prevents the auto-participate call entirely.

## Challenge leaderboard flow

1. User navigates to `/challenge/leaderboard` (link from navbar or `/challenge` page).
2. Page fetches active challenge via `useActiveChallenge`, then its entries via `useChallengeFeed(challenge.id)` → `GET /api/challenge/{id}/feed` (paginated via `useInfiniteQuery`).
3. Displays a card with the star ingredient + participation count (from `totalCount`).
4. A search/filter input lets users filter entries by recipe title or author name.
5. Entries are displayed as cards ordered by `VoteCount` desc (already sorted by backend):
   - Top 3 show 🥇🥈🥉 medals with gold/silver/bronze borders.
   - Each card shows: rank icon, recipe title (clickable → recipe detail), author name, vote count, ▲ vote button.
   - Vote button is **optimistic** (via `useVote` hook, adapted for infinite query cache structure).
   - Own entries show a "Tu receta" label instead of the vote button.
   - Vote button disabled when challenge is closed (`challengeOpen` prop).
6. Vote button flips instantly (▲ active = blue, inactive = grey), `voteCount` updates immediately.
7. On error: toast + rollback. On success: invalidates feed + gamification queries.
8. "Cargar más" button at bottom for pagination (`fetchNextPage`).

## Challenge ranking flow

1. User navigates to `/challenge/ranking` (link from navbar or leaderboard page).
2. Page fetches active challenge via `useActiveChallenge`, then entries via `useChallengeFeed`.
3. Displays `ChallengeRankingTable` — a table with columns: Posición, Autor, Receta, Votos.
4. Top 3 rows show 🥇🥈🥉 medals with gold/silver/bronze colors.
5. Rows are clickable → navigate to `/recipe/:id` (recipe detail).
6. No vote buttons — ranking is read-only. Voting happens in the feed.
7. "Cargar más" button for pagination.

## Challenge history flow

1. User navigates to `/challenge/history` (link from navbar).
2. Page fetches completed challenges via `useChallengeHistory` → `GET /api/challenge/history`.
3. Each challenge is displayed as a `ChallengeHistoryCard` — collapsible card showing star ingredient, date range, participation count.
4. Clicking a card expands it and lazy-loads the final ranking via `useChallengeFeed(challengeId)`.
5. Expanded view shows `ChallengeRankingTable` with the final results (read-only, no voting).
6. Empty state: "No hay desafíos anteriores" with 📜 icon.

## Admin challenge management

- Admin-only page at `/admin` (wrapped by `<AdminRoute>`).
- `GET /api/challenge/ingredients` fetches distinct ingredients from `recipe_ingredients` (dropdown).
- Admin selects ingredient, sets start/end dates, clicks "Crear desafío" → `POST /api/challenge`.
- After creation, the challenge appears with an "Activar" button → `POST /api/challenge/{id}/activate`.
- `useAdmin` hook extracts role directly from the JWT (`payload.role === "Admin"`), no API call. Used by `AdminRoute` wrapper and `App.tsx` (conditional button rendering).
