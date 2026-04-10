**[English](README.md)** | Русский

# DDD with Nuxt 4

Шаблон **DDD + Clean Architecture** для масштабных приложений на **Nuxt 4**.  
Framework-native подход: архитектура строится поверх [Nuxt Layers](https://nuxt.com/docs/4.x/directory-structure/layers), а не вопреки фреймворку.

DDD определяет **что** где лежит (entities, ports, events, bounded contexts).  
Clean Architecture определяет **как** слои связаны (зависимости направлены внутрь, domain не знает про внешний мир).

E-commerce используется как пример домена — паттерны применимы к любому сложному фронтенд-проекту.

Если ты знаешь что такое Bounded Context, Aggregate и Port — но не понимаешь как это ложится на фронтенд — этот репозиторий для тебя.

---

## Зачем DDD на фронтенде?

Фронтенд вырос. Это уже не "формочки и кнопочки". Современный SPA/SSR — это:
- Десятки доменов (каталог, корзина, заказы, пользователь, оплата...)
- Бизнес-логика на клиенте (валидация, расчёты, состояния)
- Несколько источников данных (REST, WebSocket, localStorage, IndexedDB)
- Команда из 5+ фронтендеров, которые не должны ломать код друг друга

Классический подход "pages + components + composables в одной куче" перестаёт работать на масштабе. DDD даёт чёткие границы и правила, кто с кем общается.

---

## Структура проекта

Каждый **layer** — это один **Bounded Context**. Внутри три чётких слоя:

```
layers/
  catalog/                          # Bounded Context: каталог товаров
    domain/                         # ЧТО это такое
      product.model.ts              #   Entity, Value Objects, бизнес-правила
      product.port.ts               #   Контракт репозитория (интерфейс)
      product.events.ts             #   Domain Events
    infrastructure/                 # ОТКУДА данные
      product.adapter.ts            #   Реализация через $fetch (проd)
      product.fake.ts               #   Фейк для разработки и тестов
    app/                            # КАК выглядит (Nuxt auto-scan)
      composables/useProducts.ts    #   Query (CQRS)
      components/                   #   ProductCard, ProductList
      pages/catalog/                #   /catalog, /catalog/:id
    server/api/products/            # BFF (mock API)
    index.ts                        # Публичное API контекста

  cart/                             # Bounded Context: корзина
    domain/
      cart.model.ts                 #   Aggregate + чистые функции
      cart.port.ts                  #   Контракт (localStorage)
      cart.events.ts                #   ItemAdded, CartCleared
    infrastructure/
      cart.adapter.ts               #   localStorage
      cart.fake.ts                  #   In-memory для тестов
    app/
      composables/useCart.ts        #   Aggregate + Saga
      components/CartButton.vue
      pages/cart.vue
    index.ts

  orders/                           # Bounded Context: заказы
    domain/
      order.model.ts                #   Entity, createOrder(), canCancel()
      order.port.ts                 #   Контракт
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

  shared/                           # Общий код между контекстами
    domain/
      money.ts                      #   Value Object
    app/
      composables/useEvents.ts      #   Шина событий
      components/ui/                #   UiButton, UiInput, UiModal

app/                                # Корневое приложение (тонкое)
  plugins/providers.ts              #   DI: provide всех адаптеров
  app.vue                           #   Layout
  pages/index.vue                   #   Лендинг
```

---

## Context Map

Как bounded contexts связаны между собой. Стрелки показывают направление зависимости — кто знает о ком.

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
        (прямой вызов)      (saga → cart.clear)
```

**Зависимости:**
- `cart` -> `catalog`: импортирует тип `Product` через index.ts
- `cart` -> `orders`: слушает событие `OrderPlaced` (Saga)
- `orders` -> `cart`: импортирует тип `CartItem` через index.ts
- `catalog` -> `cart`: вызывает `useCart().addItem()` в UI-компонентах (прямой вызов)
- Все -> `shared`: value objects, шина событий, UI-кит

**Правила:**
- Стрелки указывают **на зависимость** (от кого импортируешь)
- Прямые вызовы — для UI-инициированных действий
- События — для побочных эффектов между контекстами
- `shared` не зависит от других контекстов

---

## Маппинг DDD на фронтенд

Главная боль — DDD придумали для бэкенда на Java/C#. На фронте нет ORM, нет транзакций, нет middleware. Вот как паттерны адаптируются:

| DDD-паттерн | Бэкенд | Фронтенд (Nuxt) |
|---|---|---|
| **Bounded Context** | Микросервис | Nuxt Layer |
| **Entity / Aggregate** | Класс с методами | `*.model.ts` — интерфейс + чистые функции |
| **Value Object** | Immutable class | `money.ts` — frozen object + хелперы |
| **Repository (порт)** | Interface | `*.port.ts` — TypeScript interface |
| **Repository (адаптер)** | Impl с ORM | `*.adapter.ts` — $fetch / localStorage |
| **Domain Service** | Stateless class | Чистая функция в model |
| **Domain Event** | Message broker | `useEvents()` — простая шина |
| **Use Case / Command** | Application Service | Composable (`usePlaceOrder`) |
| **Query** | Read model | Composable (`useOrders`) |
| **Saga** | Orchestrator | Event listener в composable |
| **DI Container** | Spring / DI framework | Nuxt plugin (`providers.ts`) |
| **Фейк / Мок** | Test double | `*.fake.ts` — подменяется в providers |

---

## Ключевые паттерны в действии

### Ports & Adapters (Hexagonal Architecture)

Domain определяет **что** нужно (порт), infrastructure определяет **как** (адаптер):

```ts
// domain/product.port.ts — контракт
export interface ProductRepository {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product>
}

// infrastructure/product.adapter.ts — реализация (прод)
export function createProductAdapter(): ProductRepository {
  return {
    async getAll() { return $fetch('/api/products') },
    async getById(id) { return $fetch(`/api/products/${id}`) },
  }
}

// infrastructure/product.fake.ts — реализация (dev/тесты)
export function createProductFake(): ProductRepository {
  return {
    async getAll() { return fakeProducts },
    async getById(id) { return fakeProducts.find(p => p.id === id)! },
  }
}
```

Переключение между реальным API и фейком — одна строка в `providers.ts`.

### CQRS (Command Query Responsibility Segregation)

Чтение и запись — разные composables:

```ts
// useOrders.ts — Query: только читает
export function useOrders() {
  async function fetchAll() { /* ... */ }
  return { orders, loading, error, fetchAll }
}

// usePlaceOrder.ts — Command: только пишет
export function usePlaceOrder() {
  async function execute(items: CartItem[]) { /* ... */ }
  return { execute, loading, error }
}
```

**Зачем разделять?** Query можно кэшировать, дедуплицировать, SSR'ить. Command — нет. Разные жизненные циклы, разные оптимизации.

### Domain Events + Saga

Контексты не вызывают друг друга напрямую. Они общаются через события:

```ts
// usePlaceOrder.ts — эмитит событие после успеха
const order = await $orderRepo.place(orderItems)
events.emit(OrderEvents.OrderPlaced, order)

// useCart.ts — слушает и реагирует (Saga)
events.on(OrderEvents.OrderPlaced, () => clear())
```

**Поток:** Пользователь жмёт "Оформить заказ" → `usePlaceOrder` создаёт заказ → эмитит `OrderPlaced` → `useCart` слышит событие → очищает корзину. Домены не знают друг о друге.

### Dependency Injection

Все адаптеры подключаются в одном месте:

```ts
// app/plugins/providers.ts
export default defineNuxtPlugin(() => ({
  provide: {
    productRepo: createProductAdapter(),  // ← замени на createProductFake() для dev
    cartRepo:    createCartAdapter(),
    orderRepo:   createOrderAdapter(),
  },
}))
```

Composables получают зависимости через `useNuxtApp().$productRepo` — не импортируют адаптер напрямую.

---

## Shared layer (Shared Kernel)

Nuxt авто-импортирует компоненты из **всех** layers. Это значит что `ProductCard` из catalog технически доступен в orders. Это нарушает границы DDD.

**Правило: доменные компоненты остаются в своём домене. Если компонент нужен нескольким доменам — он переезжает в shared.**

`shared/` — это **Shared Kernel** в терминах DDD. Там живёт всё, что используется несколькими контекстами:

```
layers/shared/
  domain/
    money.ts                    # Value Object — типы + чистые функции
  app/
    composables/
      useEvents.ts              # Шина событий
    components/ui/
      Button.vue                # <UiButton>
      Input.vue                 # <UiInput>
      Modal.vue                 # <UiModal>
      PriceTag.vue              # <UiPriceTag> — используется в catalog, cart, orders
```

Пример: `PriceTag` начинался как `<span>` с копипастой `formatMoney()` в каждом домене. Три домена отображали цену → вынесли в shared как `<UiPriceTag>`:

```vue
<!-- До: копипаста в каждом домене -->
<span>{{ formatMoney(money(product.price)) }}</span>

<!-- После: shared-компонент, авто-импортируется везде -->
<UiPriceTag :amount="product.price" />
```

**Что идёт в shared:**
- UI-примитивы (кнопки, инпуты, модалки) — нужны везде
- Value Objects (Money) — используются разными доменами
- Кросс-доменные composables (шина событий) — инфраструктура для связи доменов

**Что остаётся в домене (но может использоваться другими):**
- `ProductCard` — принадлежит catalog, но Nuxt авто-импортирует его глобально
- `CartButton` — принадлежит cart, используется в корневом `app.vue`
- Доменные composables — `useCart`, `useProducts`

Это нормально. Как и composables, авто-импортируемые компоненты — это **публичное UI API** домена. Компонент `CartItem` семантически принадлежит cart — выносить его в shared только потому что orders хочет его использовать было бы неправильно. Он остаётся в cart, другие используют через авто-импорт.

**Когда реально выносить в shared:**
- Компонент **не содержит доменной логики** (чистый UI-примитив: Button, Input, PriceTag)
- Нужен нескольким доменам И не принадлежит ни одному конкретному домену

---

## Правила связей (Onion Architecture)

### Внутри контекста

Каждый контекст следует принципу **Onion / Clean Architecture** — зависимости направлены внутрь:

```
┌──────────────────────────────────────────┐
│              app/ (внешнее кольцо)        │
│   components, composables, pages         │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │  infrastructure/ (среднее кольцо)│   │
│   │    adapters, fakes, mappers      │   │
│   │                                  │   │
│   │   ┌──────────────────────────┐   │   │
│   │   │    domain/ (ядро)        │   │   │
│   │   │    model, port, events   │   │   │
│   │   │                          │   │   │
│   │   │    чистый TypeScript     │   │   │
│   │   │    не импортирует ничего │   │   │
│   │   │    из внешних колец      │   │   │
│   │   └──────────────────────────┘   │   │
│   │                                  │   │
│   │   знает про: domain/             │   │
│   └──────────────────────────────────┘   │
│                                          │
│   знает про: domain/, infrastructure/    │
└──────────────────────────────────────────┘
```

**Главное правило: зависимости направлены только внутрь, никогда наружу.**

- **domain/** — ядро. Не импортирует Vue, $fetch, Nuxt и ничего из внешних колец. Чистый TypeScript. Если удалить `app/` и `infrastructure/` — domain всё ещё компилируется.
- **infrastructure/** — знает про domain (реализует его порты). Не знает про app/ (компоненты, composables, страницы).
- **app/** — внешнее кольцо. Знает про всё внутри. Здесь живёт Nuxt — компоненты, composables, страницы.

Зачем это нужно: можно заменить `infrastructure/` (поменять REST на GraphQL) не трогая `domain/` и `app/`. Можно переделать `app/` (новый UI) не трогая `domain/` и `infrastructure/`. Бизнес-логика защищена от изменений фреймворка и API.

### Между контекстами

На фронтенде контексты общаются **двумя способами** — и оба легальны:

**1. Прямой вызов** — когда UI явно инициирует действие:

```ts
// ProductList.vue — пользователь нажал "В корзину"
const { addItem } = useCart()       // composable из другого контекста
addItem(product)                    // прямой, синхронный вызов
```

Composables автоимпортируются Nuxt из каждого layer — это и есть публичное API контекста на уровне UI. Здесь события были бы оверинжинирингом: пользователь нажал кнопку → товар добавлен. Точка.

**2. События** — когда вызывающий не должен знать о последствиях:

```ts
// usePlaceOrder.ts — заказ оформлен, что дальше — не его дело
events.emit(OrderEvents.OrderPlaced, order)

// useCart.ts — сам решает реагировать
events.on(OrderEvents.OrderPlaced, () => clear())
```

Заказ не знает про корзину. Корзина сама подписалась. Завтра на `OrderPlaced` подпишется ещё и аналитика — orders не трогаем.

**Когда что использовать:**

| Ситуация | Подход | Пример |
|---|---|---|
| UI-действие: "сделай X прямо сейчас" | Прямой вызов composable | `useCart().addItem(product)` |
| Побочный эффект: "X случилось, реагируйте кто хочет" | Событие | `OrderPlaced → cart.clear()` |
| Общие утилиты, UI-компоненты | Shared layer | `UiButton`, `formatMoney()` |

**Что запрещено** — лезть внутрь чужого контекста:

```ts
// НЕПРАВИЛЬНО — импорт из чужого infrastructure/
import { orderAdapter } from '../orders/infrastructure/order.adapter'

// НЕПРАВИЛЬНО — импорт из чужого domain/ напрямую (в обход index.ts)
import { createOrder } from '../orders/domain/order.model'

// ПРАВИЛЬНО — через публичное API
import type { Order } from '../orders'           // index.ts
import { OrderEvents } from '../orders'           // index.ts
const { fetchAll } = useOrders()                  // авто-импорт composable
```

`index.ts` — публичное API для типов и констант. Composables — публичное API для логики (через авто-импорт Nuxt). `domain/` и `infrastructure/` — приватные.

---

## Плюсы

**Масштабируемость команды.** Два фронтендера могут параллельно работать над `catalog/` и `orders/` — они физически не могут сломать код друг друга, если соблюдают границы.

**Тестируемость.** Domain — чистые функции без фреймворков. Тестируются простым `assert`:

```ts
import { addToCart, emptyCart, cartTotal } from './cart.model'

const cart = addToCart(emptyCart(), product)
assert(cartTotal(cart) === 299.99)
```

Никаких `mount()`, `wrapper.find()`, `mockNuxtApp()`.

**Заменяемость.** Сегодня данные из REST API, завтра из GraphQL, послезавтра из gRPC — меняется только адаптер. Domain и UI не трогаются.

**Понятность.** Новый разработчик открывает `layers/` — видит бизнес-домены. Открывает `domain/` — видит модель. Не нужно искать "где тут логика корзины" среди 200 файлов в `composables/`.

**SSR / Vercel.** Каждый layer может иметь свой `server/api/` — BFF прямо рядом с фронтом. Деплоится как единое Nuxt-приложение.

---

## Минусы

**Бойлерплейт.** Для простого CRUD с двумя страницами — это оверинжиниринг. Если у тебя лендинг + форма обратной связи, DDD не нужен.

**Кривая обучения.** Команда должна понимать зачем port отделён от adapter, зачем event bus вместо прямого вызова. Без buy-in от команды — превратится в карго-культ.

**Реэкспорты.** `Product` определён в `model.ts`, реэкспортирован в `index.ts`, используется в `port.ts`. Это не настоящее дублирование (единый источник правды), но выглядит многословно. Компромисс ради явных границ публичного API.

**Event bus — слабое место.** В продакшене `useEvents()` — это простой pub/sub в памяти. Нет гарантии доставки, нет replay, нет порядка. Для сложных сценариев нужно что-то серьёзнее.

**Не всё ложится на фронт.** Aggregate root из DDD — про консистентность при concurrent writes. На фронте один пользователь, один поток. Паттерн полезен для инкапсуляции, но "aggregate boundary" тут скорее организационная, а не техническая.

---

## Когда использовать

| Ситуация | Подход |
|---|---|
| Лендинг, блог, простой сайт | Обычная структура Nuxt |
| 3-5 страниц, один разработчик | Обычная структура Nuxt |
| 10+ страниц, 2-3 разработчика | Nuxt Layers без DDD (просто разбить по фичам) |
| Много доменов, 5+ разработчиков, сложная бизнес-логика | **DDD + Layers** |
| Микрофронтенд / несколько команд | DDD + Layers + возможно отдельные репозитории |

Правило: **если ты не можешь назвать хотя бы 3 bounded context'а в своём проекте — DDD тебе не нужен.**

---

## А что насчёт FSD?

[Feature-Sliced Design](https://feature-sliced.design/) — популярная методология структуры фронтенда. Частый вопрос: "почему не FSD?"

Короткий ответ: **FSD и DDD решают разные задачи, и FSD плохо ложится на Nuxt.**

### FSD не учитывает фреймворк

FSD — framework-agnostic методология. Она предлагает фиксированные слои: `shared → entities → features → widgets → pages → app`. Проблема в том, что Nuxt **уже имеет** конвенции для `pages/`, `components/`, `composables/`, `server/` с авто-сканированием и авто-импортом.

Попытка натянуть FSD на Nuxt приводит к конфликтам:

```
# FSD хочет так:
src/
  entities/product/ui/ProductCard.vue
  features/add-to-cart/ui/AddToCartButton.vue
  pages/catalog/ui/CatalogPage.vue

# Nuxt хочет так:
app/
  components/ProductCard.vue     ← авто-импорт
  pages/catalog/index.vue        ← file-based routing
  composables/useCart.ts         ← авто-импорт
```

Либо ты следуешь FSD и теряешь авто-импорт, file-based routing и server routes. Либо следуешь Nuxt и ломаешь FSD. Третьего не дано.

### DDD + Nuxt Layers — framework-native

В этом шаблоне архитектура **не борется** с Nuxt, а использует его встроенный механизм Layers:

```
layers/catalog/
  app/
    components/    ← авто-импорт работает
    composables/   ← авто-импорт работает
    pages/         ← file-based routing работает
  server/api/      ← серверные роуты работают
  domain/          ← чистый TS, вне авто-скана
  infrastructure/  ← чистый TS, вне авто-скана
```

`app/` внутри каждого layer — стандартная Nuxt-структура. `domain/` и `infrastructure/` — обычные TypeScript-папки вне авто-сканирования. Никаких хаков.

### Разные уровни абстракции

FSD отвечает на вопрос **"как нарезать UI на слои?"** — это про организацию компонентов и фич.

DDD отвечает на вопрос **"как отразить бизнес-домен в коде?"** — это про модель, контракты и границы между доменами.

| | FSD | DDD + Layers |
|---|---|---|
| Уровень | Организация файлов | Архитектура бизнес-логики |
| Группировка | По техническому слою | По бизнес-домену |
| Фреймворк | Agnostic (и в этом проблема) | Native для Nuxt |
| Связи | Strict import rules по слоям | Через index.ts и события |
| Server routes | Не предусмотрены | В каждом layer |
| Подходит для | React CRA/Vite без конвенций | Nuxt, возможно Next.js |

FSD — хорошая методология для React-проектов на Vite, где фреймворк не навязывает структуру. Для Nuxt — лучше использовать то, что фреймворк уже предлагает.

---

## ACL (Anti-Corruption Layer)

В реальном проекте формат ответа API редко совпадает с доменной моделью. API может отдавать `image_url`, а домен использует `image`, или использовать `snake_case` вместо `camelCase`.

Маппер конвертирует между ними:

```ts
// infrastructure/product.mapper.ts

interface ProductApiDTO {
  id: string
  name: string
  image_url: string       // формат API
  category_name: string
}

function toDomain(dto: ProductApiDTO): Product {
  return {
    ...dto,
    image: dto.image_url,          // маппинг: image_url → image
    category: dto.category_name,   // маппинг: category_name → category
  }
}
```

**Без маппера:** переименование поля в API ломает domain, composables и все компоненты.  
**С маппером:** переименование поля в API ломает только `product.mapper.ts`.

Полный пример: [`layers/catalog/infrastructure/product.mapper.ts`](layers/catalog/infrastructure/product.mapper.ts).

---

## Тестирование

Domain — чистые функции, тестируются без Vue, Nuxt и моков:

```bash
npm run test        # watch mode
npm run test:run    # один прогон
```

```ts
// cart.model.test.ts
import { addToCart, emptyCart, cartTotal } from '../cart.model'

it('считает итог корректно', () => {
  let cart = addToCart(emptyCart(), headphones)  // $299.99
  cart = addToCart(cart, keyboard)                // + $149.99
  expect(cartTotal(cart)).toBeCloseTo(449.98)
})

it('операции иммутабельны', () => {
  const original = emptyCart()
  const withItem = addToCart(original, headphones)
  expect(original.items).toHaveLength(0)  // оригинал не изменён
})
```

25 тестов по всем доменам — выполняются за ~200мс. Без браузера, без DOM, без загрузки фреймворка.

Тест-файлы живут рядом с кодом: `domain/__tests__/cart.model.test.ts`.

---

## Переключение адаптеров

Адаптеры переключаются через переменную окружения — без изменений в коде:

```bash
# Реальные адаптеры (по умолчанию) — вызывают серверное API
npm run dev

# Фейковые адаптеры — in-memory, сервер не нужен
NUXT_PUBLIC_ADAPTER_MODE=fake npm run dev
```

Или добавь в `.env`:
```
NUXT_PUBLIC_ADAPTER_MODE=fake
```

Настраивается в [`app/plugins/providers.ts`](app/plugins/providers.ts) — единственная точка DI.

---

## ESLint-границы

ESLint-правило запрещает разработчикам нарушать границы контекстов:

```ts
// ❌ ESLint ошибка: не импортируй из чужого domain/
import { createOrder } from '../orders/domain/order.model'

// ❌ ESLint ошибка: не импортируй из чужого infrastructure/
import { orderAdapter } from '../orders/infrastructure/order.adapter'

// ✅ Разрешено: импорт из публичного API
import type { Order } from '../orders'
```

Внутри своего контекста — импорты не ограничены. Правило работает только при пересечении границ.

---

## Быстрый старт

```bash
git clone https://github.com/sofonoff/DDD-with-Nuxt.git
cd DDD-with-Nuxt
npm install
npm run dev
```

Откроется на `http://localhost:3000`.

Роуты:
- `/` — лендинг
- `/catalog` — каталог товаров
- `/catalog/:id` — детальная страница
- `/cart` — корзина с оформлением заказа
- `/orders` — список заказов

---

## Как добавить новый Bounded Context

1. Создай `layers/payment/`
2. Внутри — `domain/`, `infrastructure/`, `app/`, `index.ts`, `nuxt.config.ts`
3. Опиши модель в `domain/payment.model.ts`
4. Определи порт в `domain/payment.port.ts`
5. Реализуй адаптер в `infrastructure/payment.adapter.ts`
6. Зарегистрируй адаптер в `app/plugins/providers.ts`
7. Создай composable в `app/composables/`
8. Экспортируй публичное API в `index.ts`

Nuxt подхватит новый layer автоматически — pages, components, composables зарегистрируются без конфигурации.

---

## Стек

- **Nuxt 4** — фреймворк
- **TypeScript** — типизация
- **Vitest** — тестирование domain-логики
- **ESLint** — контроль границ между контекстами
- **Nuxt Layers** — изоляция bounded contexts
- **Nitro** — серверные роуты (mock API)
