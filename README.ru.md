**[English](README.md)** | Русский

# DDD with Nuxt 4

Шаблон e-commerce приложения на **Nuxt 4** с архитектурой **Domain-Driven Design**.  
Framework-native подход: архитектура строится поверх [Nuxt Layers](https://nuxt.com/docs/4.x/directory-structure/layers), а не вопреки фреймворку.

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

## Правила связей

### Внутри контекста

```
app/            → знает про domain/ и infrastructure/
infrastructure/ → знает про domain/
domain/         → не знает ни про кого
```

Domain — ядро. Оно не импортирует ни Vue, ни $fetch, ни Nuxt. Чистый TypeScript.

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

**Дублирование типов.** `Product` описан и в `model.ts`, и переэкспортирован в `index.ts`, и используется в `port.ts`. Для TypeScript это нормально (типы стираются при компиляции), но визуально кажется избыточным.

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
- **Pinia** — (подключён как модуль, в примере state через `useState`)
- **Nuxt Layers** — изоляция bounded contexts
- **Nitro** — серверные роуты (mock API)
