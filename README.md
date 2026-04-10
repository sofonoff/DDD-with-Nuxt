English | **[Русский](README.ru.md)**

# DDD with Nuxt 4

**DDD + Clean Architecture** template for large-scale **Nuxt 4** applications.  
Framework-native approach: the architecture is built on top of [Nuxt Layers](https://nuxt.com/docs/4.x/directory-structure/layers), not against the framework.

DDD defines **what** goes where (entities, ports, events, bounded contexts).  
Clean Architecture defines **how** layers relate (dependencies point inward, domain knows nothing about the outside).

E-commerce is used as an example domain — the patterns apply to any complex frontend project.

If you know what Bounded Context, Aggregate and Port are — but don't understand how they map to the frontend — this repo is for you.

---

## Why DDD on the frontend?

Frontend has grown up. It's no longer just "forms and buttons". A modern SPA/SSR is:
- Dozens of domains (catalog, cart, orders, user, payment...)
- Business logic on the client (validation, calculations, state machines)
- Multiple data sources (REST, WebSocket, localStorage, IndexedDB)
- A team of 5+ frontend developers who shouldn't break each other's code

The classic "pages + components + composables in one pile" approach stops working at scale. DDD provides clear boundaries and rules for who talks to whom.

---

## Project structure

Each **layer** is one **Bounded Context**. Inside — three clear layers:

```
layers/
  catalog/                          # Bounded Context: product catalog
    domain/                         # WHAT it is
      product.model.ts              #   Entity, Value Objects, business rules
      product.port.ts               #   Repository contract (interface)
      product.events.ts             #   Domain Events
    infrastructure/                 # WHERE data comes from
      product.adapter.ts            #   Implementation via $fetch (prod)
      product.fake.ts               #   Fake for development and tests
    app/                            # HOW it looks (Nuxt auto-scan)
      composables/useProducts.ts    #   Query (CQRS)
      components/                   #   ProductCard, ProductList
      pages/catalog/                #   /catalog, /catalog/:id
    server/api/products/            # BFF (mock API)
    index.ts                        # Public API of the context

  cart/                             # Bounded Context: shopping cart
    domain/
      cart.model.ts                 #   Aggregate + pure functions
      cart.port.ts                  #   Contract (localStorage)
      cart.events.ts                #   ItemAdded, CartCleared
    infrastructure/
      cart.adapter.ts               #   localStorage
      cart.fake.ts                  #   In-memory for tests
    app/
      composables/useCart.ts        #   Aggregate + Saga
      components/CartButton.vue
      pages/cart.vue
    index.ts

  orders/                           # Bounded Context: orders
    domain/
      order.model.ts                #   Entity, createOrder(), canCancel()
      order.port.ts                 #   Contract
      order.events.ts               #   OrderPlaced, OrderCancelled
    infrastructure/
      order.adapter.ts              #   HTTP
      order.fake.ts                 #   In-memory
    app/
      composables/
        useOrders.ts                #   Query (CQRS)
        usePlaceOrder.ts            #   Command (CQRS) + Saga
      components/                   #   OrderCard, OrderList
      pages/orders/
    index.ts

  shared/                           # Shared code across contexts
    domain/
      money.ts                      #   Value Object
    app/
      composables/useEvents.ts      #   Event bus
      components/ui/                #   UiButton, UiInput, UiModal

app/                                # Root application (thin)
  plugins/providers.ts              #   DI: provide all adapters
  app.vue                           #   Layout
  pages/index.vue                   #   Landing
```

---

## Context Map

How bounded contexts relate to each other. Arrows show dependency direction — who knows about whom.

```
┌─────────────────────────────────────────────────────┐
│                       shared                        │
│            money.ts · useEvents · UiButton           │
└──────────▲──────────▲──────────▲────────────────────┘
           │          │          │
           │ imports   │ imports   │ imports
           │          │          │
┌──────────┴───┐ ┌────┴─────┐ ┌──┴──────────┐
│   catalog    │ │   cart   │ │   orders    │
│              │ │          │ │             │
│ Product      │ │ CartItem │ │ Order       │
│ useProducts  │ │ useCart   │ │ useOrders   │
│              │ │          │ │ usePlaceOrder│
└──────────────┘ └──────────┘ └─────────────┘
       │              ▲  ▲           │
       │              │  │           │
       └──────────────┘  └───────────┘
        useCart().addItem()  events: OrderPlaced
        (direct call)       (saga → cart.clear)
```

**Dependencies:**
- `cart` -> `catalog`: imports `Product` type via index.ts
- `cart` -> `orders`: listens to `OrderPlaced` event (Saga)
- `orders` -> `cart`: imports `CartItem` type via index.ts
- `catalog` -> `cart`: calls `useCart().addItem()` in UI components (direct)
- Everyone -> `shared`: value objects, event bus, UI kit

**Rules:**
- Arrows point **toward the dependency** (who you import from)
- Direct calls — for UI-initiated actions
- Events — for side effects across contexts
- `shared` has no dependencies on other contexts

---

## Mapping DDD to the frontend

The main pain point — DDD was invented for backend in Java/C#. On the frontend there's no ORM, no transactions, no middleware. Here's how patterns adapt:

| DDD pattern | Backend | Frontend (Nuxt) |
|---|---|---|
| **Bounded Context** | Microservice | Nuxt Layer |
| **Entity / Aggregate** | Class with methods | `*.model.ts` — interface + pure functions |
| **Value Object** | Immutable class | `money.ts` — frozen object + helpers |
| **Repository (port)** | Interface | `*.port.ts` — TypeScript interface |
| **Repository (adapter)** | Impl with ORM | `*.adapter.ts` — $fetch / localStorage |
| **Domain Service** | Stateless class | Pure function in model |
| **Domain Event** | Message broker | `useEvents()` — simple bus |
| **Use Case / Command** | Application Service | Composable (`usePlaceOrder`) |
| **Query** | Read model | Composable (`useOrders`) |
| **Saga** | Orchestrator | Event listener in composable |
| **DI Container** | Spring / DI framework | Nuxt plugin (`providers.ts`) |
| **Fake / Mock** | Test double | `*.fake.ts` — swapped in providers |

---

## Key patterns in action

### Ports & Adapters (Hexagonal Architecture)

Domain defines **what** is needed (port), infrastructure defines **how** (adapter):

```ts
// domain/product.port.ts — contract
export interface ProductRepository {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product>
}

// infrastructure/product.adapter.ts — implementation (prod)
export function createProductAdapter(): ProductRepository {
  return {
    async getAll() { return $fetch('/api/products') },
    async getById(id) { return $fetch(`/api/products/${id}`) },
  }
}

// infrastructure/product.fake.ts — implementation (dev/tests)
export function createProductFake(): ProductRepository {
  return {
    async getAll() { return fakeProducts },
    async getById(id) { return fakeProducts.find(p => p.id === id)! },
  }
}
```

Switching between real API and fake — one line in `providers.ts`.

### CQRS (Command Query Responsibility Segregation)

Reading and writing — separate composables:

```ts
// useOrders.ts — Query: read only
export function useOrders() {
  async function fetchAll() { /* ... */ }
  return { orders, loading, error, fetchAll }
}

// usePlaceOrder.ts — Command: write only
export function usePlaceOrder() {
  async function execute(items: CartItem[]) { /* ... */ }
  return { execute, loading, error }
}
```

**Why separate?** Queries can be cached, deduplicated, SSR'd. Commands can't. Different lifecycles, different optimizations.

### Domain Events + Saga

```ts
// usePlaceOrder.ts — emits event after success
const order = await $orderRepo.place(orderItems)
events.emit(OrderEvents.OrderPlaced, order)

// useCart.ts — listens and reacts (Saga)
events.on(OrderEvents.OrderPlaced, () => clear())
```

**Flow:** User clicks "Place Order" -> `usePlaceOrder` creates the order -> emits `OrderPlaced` -> `useCart` hears the event -> clears the cart. Domains don't know about each other.

### Dependency Injection

All adapters are wired in one place:

```ts
// app/plugins/providers.ts
export default defineNuxtPlugin(() => ({
  provide: {
    productRepo: createProductAdapter(),  // ← swap with createProductFake() for dev
    cartRepo:    createCartAdapter(),
    orderRepo:   createOrderAdapter(),
  },
}))
```

Composables get dependencies via `useNuxtApp().$productRepo` — they don't import the adapter directly.

---

## Shared layer (Shared Kernel)

Nuxt auto-imports components from **all** layers. This means `ProductCard` from catalog is technically available in orders. This breaks DDD boundaries.

**Rule: domain components stay in their domain. If a component is needed by multiple domains — it moves to shared.**

`shared/` is the **Shared Kernel** in DDD terms. It contains everything used across multiple contexts:

```
layers/shared/
  domain/
    money.ts                    # Value Object — types + pure functions
  app/
    composables/
      useEvents.ts              # Event bus
    components/ui/
      Button.vue                # <UiButton>
      Input.vue                 # <UiInput>
      Modal.vue                 # <UiModal>
      PriceTag.vue              # <UiPriceTag> — used in catalog, cart, orders
```

Example: `PriceTag` started as a `<span>` with `formatMoney()` copy-pasted in every domain. Three domains needed price display → moved to shared as `<UiPriceTag>`:

```vue
<!-- Before: copy-pasted in every domain -->
<span>{{ formatMoney(money(product.price)) }}</span>

<!-- After: shared component, auto-imported everywhere -->
<UiPriceTag :amount="product.price" />
```

**What goes to shared:**
- UI primitives (buttons, inputs, modals) — needed everywhere
- Value Objects (Money) — used across domains
- Cross-cutting composables (event bus) — infrastructure for domain communication

**What stays in the domain (but may be used by others):**
- `ProductCard` — belongs to catalog, but Nuxt auto-imports it globally
- `CartButton` — belongs to cart, used in root `app.vue`
- Domain composables — `useCart`, `useProducts`

This is fine. Just like composables, Nuxt auto-imported components **are** the domain's public UI API. `CartItem` component belongs to cart semantically — moving it to shared just because orders needs it would be wrong. It stays in cart, others use it via auto-import.

**When to actually move to shared:**
- The component has **no domain logic** (pure UI primitive like Button, Input, PriceTag)
- Multiple domains need it AND it doesn't belong to any specific domain

---

## Dependency rules (Onion Architecture)

### Within a context

Each context follows the **Onion / Clean Architecture** principle — dependencies point inward:

```
┌──────────────────────────────────────────┐
│              app/ (outer ring)           │
│   components, composables, pages         │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │    infrastructure/ (middle ring) │   │
│   │    adapters, fakes, mappers      │   │
│   │                                  │   │
│   │   ┌──────────────────────────┐   │   │
│   │   │    domain/ (core)        │   │   │
│   │   │    model, port, events   │   │   │
│   │   │                          │   │   │
│   │   │    pure TypeScript       │   │   │
│   │   │    no imports from       │   │   │
│   │   │    outer rings           │   │   │
│   │   └──────────────────────────┘   │   │
│   │                                  │   │
│   │   knows about: domain/           │   │
│   └──────────────────────────────────┘   │
│                                          │
│   knows about: domain/, infrastructure/  │
└──────────────────────────────────────────┘
```

**Key rule: dependencies only point inward, never outward.**

- **domain/** — the core. Doesn't import Vue, $fetch, Nuxt, or anything from outer rings. Pure TypeScript. If you delete `app/` and `infrastructure/` — domain still compiles.
- **infrastructure/** — knows about domain (implements its ports). Doesn't know about app/ (components, composables, pages).
- **app/** — the outer ring. Knows about everything inside. This is where Nuxt lives — components, composables, pages.

Why this matters: you can replace `infrastructure/` (swap REST for GraphQL) without touching `domain/` or `app/`. You can redesign `app/` (new UI) without touching `domain/` or `infrastructure/`. The core business logic is protected from framework and API changes.

### Between contexts

On the frontend, contexts communicate in **two ways** — both are legitimate:

**1. Direct call** — when the UI explicitly initiates an action:

```ts
// ProductList.vue — user clicked "Add to Cart"
const { addItem } = useCart()       // composable from another context
addItem(product)                    // direct, synchronous call
```

Composables are auto-imported by Nuxt from each layer — this is the context's public API at the UI level. Events here would be overengineering: user clicked a button -> item added. Period.

**2. Events** — when the caller shouldn't know about consequences:

```ts
// usePlaceOrder.ts — order placed, what happens next is not its concern
events.emit(OrderEvents.OrderPlaced, order)

// useCart.ts — decides to react on its own
events.on(OrderEvents.OrderPlaced, () => clear())
```

The order doesn't know about the cart. The cart subscribed itself. Tomorrow analytics will also subscribe to `OrderPlaced` — orders stay untouched.

**When to use what:**

| Situation | Approach | Example |
|---|---|---|
| UI action: "do X right now" | Direct composable call | `useCart().addItem(product)` |
| Side effect: "X happened, react if you want" | Event | `OrderPlaced -> cart.clear()` |
| Shared utilities, UI components | Shared layer | `UiButton`, `formatMoney()` |

**What's forbidden** — reaching into another context's internals:

```ts
// WRONG — import from another's infrastructure/
import { orderAdapter } from '../orders/infrastructure/order.adapter'

// WRONG — import from another's domain/ directly (bypassing index.ts)
import { createOrder } from '../orders/domain/order.model'

// CORRECT — via public API
import type { Order } from '../orders'           // index.ts
import { OrderEvents } from '../orders'           // index.ts
const { fetchAll } = useOrders()                  // auto-imported composable
```

`index.ts` — public API for types and constants. Composables — public API for logic (via Nuxt auto-import). `domain/` and `infrastructure/` are private.

---

## What you get

**Parallel team work.** Two frontend devs work on `catalog/` and `orders/` simultaneously. ESLint enforces boundaries — they physically can't break each other's code. No merge conflicts on shared files.

**Instant domain testing.** Business logic is pure functions — 25 tests run in 200ms. No browser, no DOM, no framework bootstrap. Test cart logic without mounting a single component:

```ts
const cart = addToCart(emptyCart(), headphones)
expect(cartTotal(cart)).toBeCloseTo(299.99)
```

**Swap anything without fear.** REST → GraphQL? Change one adapter file. Redesign the UI? Domain stays untouched. Switch from localStorage to IndexedDB? One file. The onion layers protect each other.

**Onboarding in minutes.** New developer opens `layers/` — sees business domains, not technical folders. Opens `domain/cart.model.ts` — reads the business rules in pure TypeScript. No framework knowledge needed to understand the logic.

**Full-stack layers.** Each context can have its own `server/api/` — BFF lives next to the frontend. Mock API in development, real API in production. Deploys as a single Nuxt app to Vercel/Netlify.

**Production-ready DI.** One env variable switches all adapters to fakes — offline development, demos, E2E tests without a backend. `NUXT_PUBLIC_ADAPTER_MODE=fake npm run dev` and you're done.

**Future-proof.** If you outgrow a monolith — each layer already has clean boundaries. Extract to a separate repo or micro-frontend with minimal refactoring.

---

## Trade-offs

> These are conscious trade-offs, not problems. Every architecture decision has a cost.

**Needs scale to justify.** For a landing page or a simple CRUD — use standard Nuxt structure. This template pays off when you have 3+ bounded contexts and 3+ developers. Below that threshold, the structure adds overhead without enough benefit.

**Team alignment required.** The team must understand why port is separated from adapter, why events instead of direct calls in some cases. Document conventions in your project's CLAUDE.md or ADR. Without shared understanding, any architecture degrades.

**More files per feature.** A new entity means `model.ts` + `port.ts` + `events.ts` + `adapter.ts` + `fake.ts` + `index.ts` + composable + tests. This is deliberate: each file has one responsibility. The trade-off is navigability vs explicitness.

**Event bus is intentionally simple.** `useEvents()` is an in-memory pub/sub — no delivery guarantees, no replay. This is fine for UI side-effects (clear cart after order). For complex event sourcing — replace with a robust solution, the interface stays the same.

---

## When to use

| Project scale | Recommended approach |
|---|---|
| Landing page, blog, marketing site | Standard Nuxt structure |
| 3-5 pages, solo developer | Standard Nuxt structure |
| 10+ pages, 2-3 developers | Nuxt Layers without DDD (split by features) |
| Complex business logic, 3+ developers | **DDD + Layers (this template)** |
| Multiple teams, independent deploy cycles | DDD + Layers → extract to micro-frontends later |

**Start simple, evolve when needed.** You can adopt this incrementally: begin with Nuxt Layers for code organization, add `domain/` when business logic appears, add `infrastructure/` when you need adapter swapping.

---

## What about FSD?

[Feature-Sliced Design](https://feature-sliced.design/) is a popular frontend structure methodology. Common question: "why not FSD?"

Short answer: **FSD and DDD solve different problems, and FSD doesn't fit Nuxt well.**

### FSD doesn't account for the framework

FSD is a framework-agnostic methodology. It proposes fixed layers: `shared -> entities -> features -> widgets -> pages -> app`. The problem is that Nuxt **already has** conventions for `pages/`, `components/`, `composables/`, `server/` with auto-scanning and auto-import.

Trying to force FSD onto Nuxt leads to conflicts:

```
# FSD wants this:
src/
  entities/product/ui/ProductCard.vue
  features/add-to-cart/ui/AddToCartButton.vue
  pages/catalog/ui/CatalogPage.vue

# Nuxt wants this:
app/
  components/ProductCard.vue     ← auto-import
  pages/catalog/index.vue        ← file-based routing
  composables/useCart.ts         ← auto-import
```

Either you follow FSD and lose auto-import, file-based routing and server routes. Or you follow Nuxt and break FSD. There's no middle ground.

### DDD + Nuxt Layers — framework-native

In this template the architecture **doesn't fight** Nuxt, it uses its built-in Layers mechanism:

```
layers/catalog/
  app/
    components/    ← auto-import works
    composables/   ← auto-import works
    pages/         ← file-based routing works
  server/api/      ← server routes work
  domain/          ← pure TS, outside auto-scan
  infrastructure/  ← pure TS, outside auto-scan
```

`app/` inside each layer is standard Nuxt structure. `domain/` and `infrastructure/` are plain TypeScript folders outside auto-scanning. No hacks.

### Different levels of abstraction

FSD answers the question **"how to slice UI into layers?"** — it's about organizing components and features.

DDD answers the question **"how to reflect the business domain in code?"** — it's about models, contracts and boundaries between domains.

| | FSD | DDD + Layers |
|---|---|---|
| Level | File organization | Business logic architecture |
| Grouping | By technical layer | By business domain |
| Framework | Agnostic (and that's the problem) | Native to Nuxt |
| Dependencies | Strict import rules by layers | Via index.ts and events |
| Server routes | Not accounted for | In each layer |
| Best for | React CRA/Vite without conventions | Nuxt, possibly Next.js |

FSD is a good methodology for React projects on Vite where the framework doesn't dictate structure. For Nuxt — better to use what the framework already provides.

---

## This is not micro-frontends (and not just "folders")

A common reaction: "So these are micro-frontends?" or "This is just splitting by folders."

Neither. These are three different things:

| | Folder split | DDD + Nuxt Layers | Micro-frontends |
|---|---|---|---|
| **What it is** | `features/cart/`, `features/catalog/` in one app | Each layer = bounded context with domain/infra/app | Separate apps, separate builds, separate deploys |
| **Build** | One build | One build | Multiple builds |
| **Deploy** | One deploy | One deploy | Independent deploys |
| **Runtime** | One Vue instance | One Vue instance | Multiple frameworks possible |
| **Boundaries** | Convention (nothing enforces them) | Enforced: ESLint rules, index.ts, events | Enforced: separate repos/processes |
| **Shared state** | Global store, easy to couple | Via composables + events, explicit contracts | Via custom events / postMessage |
| **Complexity** | Low | Medium | High |

**Folder split** — you create `features/cart/` and `features/catalog/`, but nothing prevents `cart/` from importing `catalog/`'s internals. Boundaries exist only in your head.

**DDD + Layers** — boundaries are enforced: ESLint blocks cross-context imports, `index.ts` defines the public API, events decouple side effects. But it's still **one application** — one build, one deploy, one Vue instance. The `layers/` directory is a Nuxt mechanism for code organization, not separate apps.

**Micro-frontends** — truly separate applications. Different repos, different builds, possibly different frameworks. Communication via `postMessage` or custom events. Necessary when teams need independent deploy cycles. Overkill for most projects.

**This template is the middle ground:** stronger boundaries than folders, simpler than micro-frontends. If you outgrow it — each layer can be extracted into a separate repo/micro-frontend later, because the boundaries are already clean.

---

## ACL (Anti-Corruption Layer)

In a real project, the API response format rarely matches the domain model. The API might return `image_url` while the domain uses `image`, or use `snake_case` while the domain uses `camelCase`.

The mapper converts between them:

```ts
// infrastructure/product.mapper.ts

interface ProductApiDTO {
  id: string
  name: string
  image_url: string       // API format
  category_name: string
}

function toDomain(dto: ProductApiDTO): Product {
  return {
    ...dto,
    image: dto.image_url,          // mapping: image_url → image
    category: dto.category_name,   // mapping: category_name → category
  }
}
```

**Without mapper:** API field rename breaks domain, composables, and all components.  
**With mapper:** API field rename breaks only `product.mapper.ts`.

See [`layers/catalog/infrastructure/product.mapper.ts`](layers/catalog/infrastructure/product.mapper.ts) for the full example.

---

## Testing

Domain is pure functions — tested without Vue, Nuxt, or mocks:

```bash
npm run test        # watch mode
npm run test:run    # single run
```

```ts
// cart.model.test.ts
import { addToCart, emptyCart, cartTotal } from '../cart.model'

it('calculates total correctly', () => {
  let cart = addToCart(emptyCart(), headphones)  // $299.99
  cart = addToCart(cart, keyboard)                // + $149.99
  expect(cartTotal(cart)).toBeCloseTo(449.98)
})

it('operations are immutable', () => {
  const original = emptyCart()
  const withItem = addToCart(original, headphones)
  expect(original.items).toHaveLength(0)  // original untouched
})
```

25 tests across all domains — run in ~200ms. No browser, no DOM, no framework bootstrap.

Test files live next to the code they test: `domain/__tests__/cart.model.test.ts`.

---

## Switching adapters

Adapters can be swapped via environment variable — no code changes needed:

```bash
# Real adapters (default) — calls server API
npm run dev

# Fake adapters — in-memory, no server needed
NUXT_PUBLIC_ADAPTER_MODE=fake npm run dev
```

Or add to `.env`:
```
NUXT_PUBLIC_ADAPTER_MODE=fake
```

This is configured in [`app/plugins/providers.ts`](app/plugins/providers.ts) — the single DI entry point.

---

## ESLint boundaries

ESLint rule prevents developers from bypassing context boundaries:

```ts
// ❌ ESLint error: don't import from another context's domain/
import { createOrder } from '../orders/domain/order.model'

// ❌ ESLint error: don't import from another context's infrastructure/
import { orderAdapter } from '../orders/infrastructure/order.adapter'

// ✅ Allowed: import from public API
import type { Order } from '../orders'
```

Within your own context — imports are unrestricted. The rule only applies when crossing boundaries.

---

## Quick start

```bash
git clone https://github.com/sofonoff/DDD-with-Nuxt.git
cd DDD-with-Nuxt
npm install
npm run dev
```

Opens at `http://localhost:3000`.

Routes:
- `/` — landing
- `/catalog` — product catalog
- `/catalog/:id` — product detail page
- `/cart` — cart with order placement
- `/orders` — order list

---

## Adding a new Bounded Context

1. Create `layers/payment/`
2. Inside — `domain/`, `infrastructure/`, `app/`, `index.ts`, `nuxt.config.ts`
3. Describe the model in `domain/payment.model.ts`
4. Define the port in `domain/payment.port.ts`
5. Implement the adapter in `infrastructure/payment.adapter.ts`
6. Register the adapter in `app/plugins/providers.ts`
7. Create a composable in `app/composables/`
8. Export the public API in `index.ts`

Nuxt will pick up the new layer automatically — pages, components, composables will register without configuration.

---

## Stack

- **Nuxt 4** — framework
- **TypeScript** — type safety
- **Vitest** — domain testing
- **ESLint** — boundary enforcement
- **Nuxt Layers** — bounded context isolation
- **Nitro** — server routes (mock API)
