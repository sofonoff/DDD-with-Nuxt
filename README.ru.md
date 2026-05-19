**[English](README.md)** | Русский

# DDD with Nuxt 4

Шаблон **DDD + Clean Architecture** для масштабных приложений на **Nuxt 4**.  
Framework-native подход: архитектура строится поверх [Nuxt Layers](https://nuxt.com/docs/4.x/directory-structure/layers), а не вопреки фреймворку.

DDD определяет **что** где лежит (entities, ports, events, bounded contexts).  
Clean Architecture определяет **как** слои связаны (зависимости направлены внутрь, domain не знает про внешний мир).

E-commerce используется как пример домена — паттерны применимы к любому сложному фронтенд-проекту.

Если ты знаешь что такое Bounded Context, Aggregate и Port — но не понимаешь как это ложится на фронтенд — этот репозиторий для тебя.

---

## Быстрый старт

```bash
git clone https://github.com/sofonoff/DDD-with-Nuxt.git
cd DDD-with-Nuxt
npm install
npm run dev
```

Откроется на `http://localhost:3000`.

| Роут | Описание |
|---|---|
| `/` | Лендинг |
| `/catalog` | Каталог товаров |
| `/catalog/:id` | Детальная страница товара |
| `/cart` | Корзина + оформление заказа |
| `/orders` | Список заказов |

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

Каждый **layer** — это один **Bounded Context**. Внутри — три слоя по принципу луковицы:

```
layers/
  catalog/                          # Bounded Context: каталог товаров
    domain/                         #   ЧТО — model, port, events (чистый TS)
    infrastructure/                 #   ОТКУДА — adapters, fakes, mappers
    app/                            #   КАК — components, composables, pages
    server/api/products/            #   BFF (mock API)
    index.ts                        #   Публичное API контекста

  cart/                             # Bounded Context: корзина
    domain/ · infrastructure/ · app/ · index.ts

  orders/                           # Bounded Context: заказы
    domain/ · infrastructure/ · app/ · server/ · index.ts

  shared/                           # Shared Kernel: money, events, UI-кит
    domain/ · app/

app/                                # Корневое приложение (тонкое)
  plugins/providers.ts              #   DI: provide всех адаптеров
  app.vue · pages/index.vue
```

---

## Context Map

<p align="center">
  <img src="docs/context-map.svg" alt="Context Map" width="800" />
</p>

---

## Onion Architecture

Каждый контекст следует принципу **Onion / Clean Architecture** — зависимости направлены внутрь:

<p align="center">
  <img src="docs/onion-architecture.svg" alt="Onion Architecture" width="650" />
</p>

- **domain/** — ядро. Чистый TypeScript. Без Vue, $fetch, Nuxt. Если удалить `app/` и `infrastructure/` — domain всё ещё компилируется.
- **infrastructure/** — реализует порты домена. Не знает про `app/`.
- **app/** — внешнее кольцо. Компоненты, composables, страницы. Здесь живёт Nuxt.

Зачем это нужно: поменять REST на GraphQL — один адаптер. Переделать UI — domain не трогается. Слои луковицы защищают друг друга.

### Между контекстами

На фронтенде контексты общаются **двумя способами** — и оба легальны:

**1. Прямой вызов** — когда UI явно инициирует действие:

```ts
// ProductList.vue — пользователь нажал "В корзину"
const { addItem } = useCart()       // composable из другого контекста
addItem(product)                    // прямой, синхронный вызов
```

**2. События** — когда вызывающий не должен знать о последствиях:

```ts
// usePlaceOrder.ts — заказ оформлен, что дальше — не его дело
events.emit(OrderEvents.OrderPlaced, order)

// плагин cart-saga.ts — реагирует ровно один раз на весь app
events.on(OrderEvents.OrderPlaced, () => { cart.value = emptyCart(); $cartRepo.save(emptyCart()) })
```

| Ситуация | Подход | Пример |
|---|---|---|
| UI-действие: "сделай X прямо сейчас" | Прямой вызов composable | `useCart().addItem(product)` |
| Побочный эффект: "X случилось, реагируйте кто хочет" | Событие | `OrderPlaced → cart.clear()` |
| Общие утилиты, UI-компоненты | Shared layer | `UiButton`, `formatMoney()` |

**Что запрещено** — лезть внутрь чужого контекста:

```ts
// ❌ импорт из чужого domain/ или infrastructure/
import { createOrder } from '../orders/domain/order.model'

// ✅ через публичное API
import type { Order } from '../orders'           // index.ts
const { fetchAll } = useOrders()                  // авто-импорт composable
```

---

## Ключевые паттерны

### Маппинг DDD на фронтенд

| DDD-паттерн | Бэкенд | Фронтенд (Nuxt) |
|---|---|---|
| **Bounded Context** | Микросервис | Nuxt Layer |
| **Entity / Aggregate** | Класс с методами | `*.model.ts` — интерфейс + чистые функции |
| **Value Object** | Immutable class | `money.ts` — frozen object + хелперы |
| **Repository (порт)** | Interface | `*.port.ts` — TypeScript interface |
| **Repository (адаптер)** | Impl с ORM | `*.adapter.ts` — $fetch / localStorage |
| **Domain Event** | Message broker | `useEvents()` — простая шина событий |
| **Use Case / Command** | Application Service | Composable (`usePlaceOrder`) |
| **Query** | Read model | Composable (`useOrders`) |
| **Saga** | Orchestrator | Event listener в плагине (`cart-saga.ts`) |
| **DI (Dependency Injection)** | Spring / DI framework | Nuxt plugin (`providers.ts`) |

### Ports & Adapters

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

### CQRS

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

Зачем разделять? Query можно кэшировать, дедуплицировать, SSR'ить. Command — нет.

### Domain Events + Saga

<p align="center">
  <img src="docs/saga-flow.svg" alt="Saga Flow" width="780" />
</p>

Домены не знают друг о друге — `usePlaceOrder` эмитит событие, плагин `cart-saga.ts` независимо реагирует. Сага живёт в плагине, а не в composable — подписка регистрируется ровно один раз на весь app, сколько бы компонентов ни вызвали `useCart()`.

### Dependency Injection (DI)

Все адаптеры подключаются в одном месте — Nuxt-плагин работает как DI-контейнер:

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

Composables получают зависимости через `useNuxtApp().$productRepo` — не импортируют адаптер напрямую. Это инверсия зависимостей: domain определяет интерфейс, infrastructure реализует, а плагин связывает их вместе.

---

## Что ты получаешь

**Параллельная работа команды.** Два фронтендера работают над `catalog/` и `orders/` одновременно. ESLint контролирует границы — они физически не могут сломать код друг друга.

**Мгновенные тесты домена.** Бизнес-логика — чистые функции, 36 тестов за 200мс. Без браузера, DOM и фреймворка:

```ts
const cart = addToCart(emptyCart(), headphones)
expect(cartTotal(cart)).toBeCloseTo(299.99)
```

**Заменяй что угодно без страха.** REST → GraphQL? Один файл адаптера. Редизайн UI? Domain не трогается. Слои луковицы защищают друг друга.

**Онбординг за минуты.** Новый разработчик открывает `layers/` — видит бизнес-домены, а не технические папки. Открывает `domain/cart.model.ts` — читает бизнес-правила на чистом TypeScript.

**Full-stack layers.** У каждого контекста свой `server/api/` — BFF рядом с фронтом. Деплоится как одно Nuxt-приложение.

**Готовый DI из коробки.** Одна env-переменная переключает все адаптеры на фейки: `NUXT_PUBLIC_ADAPTER_MODE=fake npm run dev`.

**Готовность к росту.** Если перерастёшь монолит — у каждого layer уже чистые границы. Извлеки в отдельный репо или микрофронтенд с минимальным рефакторингом.

---

## Компромиссы

> Это осознанные компромиссы, а не проблемы. У каждого архитектурного решения есть цена.

**Нужен масштаб чтобы оправдать.** Этот шаблон окупается при 3+ bounded contexts и 3+ разработчиках. Ниже этого порога — используй стандартную структуру Nuxt.

**Нужна согласованность команды.** Команда должна понимать зачем port отделён от adapter. Документируй конвенции в wiki проекта или ADR (Architecture Decision Records). Без общего понимания любая архитектура деградирует.

**Больше файлов на фичу.** Новая entity — это `model.ts` + `port.ts` + `events.ts` + `adapter.ts` + `fake.ts` + `index.ts` + composable + тесты. Это намеренно — у каждого файла одна ответственность.

**Event bus намеренно простой.** `useEvents()` — in-memory pub/sub, без гарантий доставки. Для UI-побочных эффектов этого достаточно. Шина создаётся один раз на инстанс приложения через Nuxt-плагин (`$eventBus`) — SSR-безопасна, не течёт между запросами. Для сложного event sourcing — замени на robust-решение, интерфейс останется тем же.

---

## Когда использовать

| Масштаб проекта | Рекомендуемый подход |
|---|---|
| Лендинг, блог, маркетинговый сайт | Стандартная структура Nuxt |
| 3-5 страниц, один разработчик | Стандартная структура Nuxt |
| 10+ страниц, 2-3 разработчика | Nuxt Layers без DDD (разбить по фичам) |
| Сложная бизнес-логика, 3+ разработчика | **DDD + Layers (этот шаблон)** |
| Несколько команд, независимые циклы деплоя | DDD + Layers → извлечь в микрофронтенды позже |

**Начни просто, усложняй по мере необходимости.** Начни с Nuxt Layers для организации кода, добавь `domain/` когда появится бизнес-логика, добавь `infrastructure/` когда понадобится подмена адаптеров.

---

## Developer experience

### Тестирование + TDD

Domain — чистые функции, тестируются без Vue, Nuxt и моков:

```bash
npm run test        # watch mode
npm run test:run    # один прогон
```

36 тестов по всем доменам — за ~200мс. Тест-файлы рядом с кодом: `domain/__tests__/cart.model.test.ts`, `app/__tests__/useEvents.test.ts`.

Эта архитектура идеальна для **TDD (Test-Driven Development)** — цикл Red → Green → Refactor занимает секунды. У domain нет зависимостей — не нужна БД, HTTP-моки, конфигурация DI. Пишешь тест, реализуешь правило, идёшь дальше.

### Переключение адаптеров

```bash
# Реальные адаптеры (по умолчанию) — вызывают серверное API
npm run dev

# Фейковые адаптеры — in-memory, сервер не нужен
NUXT_PUBLIC_ADAPTER_MODE=fake npm run dev
```

Настраивается в [`app/plugins/providers.ts`](app/plugins/providers.ts) — единственная точка DI.

### ESLint-границы

ESLint-правило запрещает нарушать границы контекстов:

```ts
// ❌ ESLint ошибка: не импортируй из чужого domain/ или infrastructure/
import { createOrder } from '../orders/domain/order.model'

// ✅ Разрешено: импорт из публичного API
import type { Order } from '../orders'
```

Внутри своего контекста — импорты из собственных `domain/` и `infrastructure/` разрешены. Импорты из чужих внутренностей запрещены, даже из файлов своего контекста.

### ACL (Anti-Corruption Layer)

В реальном проекте формат API редко совпадает с доменной моделью. Маппер конвертирует между ними:

```ts
// infrastructure/product.mapper.ts
function toDomain(dto: ProductApiDTO): Product {
  return {
    ...dto,
    image: dto.image_url,          // маппинг: image_url → image
    category: dto.category_name,   // маппинг: category_name → category
  }
}
```

**Без маппера:** переименование поля в API ломает domain и все компоненты.  
**С маппером:** ломается только `product.mapper.ts`.

---

## Shared layer (Shared Kernel)

Nuxt авто-импортирует компоненты из **всех** layers — `ProductCard` из catalog технически доступен в orders.

**Правило: доменные компоненты остаются в своём домене. В shared — только framework-agnostic примитивы.**

```
layers/shared/
  domain/money.ts              # Value Object
  app/composables/useEvents.ts # Шина событий
  app/components/ui/           # UiButton, UiInput, UiModal, UiPriceTag
```

**Что в shared:** UI-примитивы без доменной логики, Value Objects для всех доменов, кросс-доменные composables.

**Что в домене (но глобально доступно через авто-импорт Nuxt):** `ProductCard`, `CartButton`, `useCart`, `useProducts`. Это публичное UI API домена. Выносить `CartItem` в shared только потому что orders его использует — неправильно. Он остаётся в cart.

---

## Добавление нового Bounded Context

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

## Сравнения

### vs FSD (Feature-Sliced Design)

FSD предлагает фиксированные слои: `shared → entities → features → widgets → pages → app`. Проблема: Nuxt **уже имеет** конвенции для `pages/`, `components/`, `composables/` с авто-импортом. FSD борется с фреймворком, DDD + Layers использует его.

| | FSD | DDD + Layers |
|---|---|---|
| Группировка | По техническому слою | По бизнес-домену |
| Фреймворк | Agnostic (конфликтует с Nuxt) | Native для Nuxt |
| Server routes | Не предусмотрены | В каждом layer |
| Подходит для | React/Vite без конвенций | Nuxt, возможно Next.js |

### vs Микрофронтенды

| | Разбивка по папкам | DDD + Layers | Микрофронтенды |
|---|---|---|---|
| Сборка и деплой | Один | Один | Несколько, независимых |
| Границы | Только конвенция | Контролируются (ESLint, index.ts) | Контролируются (отдельные репо) |
| Сложность | Низкая | Средняя | Высокая |

Этот шаблон — **золотая середина**: границы крепче чем у папок, проще чем у микрофронтов. Если перерастёшь — каждый layer можно извлечь, потому что границы уже чистые.

---

## Глоссарий

| Термин | Что это значит |
|---|---|
| **Bounded Context** | Изолированная часть системы со своей моделью, правилами и языком. В этом шаблоне — Nuxt Layer. |
| **Aggregate** | Кластер доменных объектов, обрабатываемых как единое целое. Корзина с её элементами — aggregate. |
| **Entity** | Объект с идентичностью (есть `id`). Product, Order. |
| **Value Object** | Объект, определяемый значением, а не идентичностью. Money(100, "USD") — два экземпляра с одинаковым значением равны. |
| **Port** | Интерфейс, который domain определяет для внешнего мира. "Мне нужен `ProductRepository`" — без указания как. |
| **Adapter** | Реализация порта. `product.adapter.ts` реализует `ProductRepository` через `$fetch`. |
| **CQRS** | Command Query Responsibility Segregation — разделение операций чтения (Query) и записи (Command) в разные composables. |
| **Saga** | Реакция на доменное событие, координирующая побочный эффект между контекстами. OrderPlaced → cart.clear(). |
| **ACL** | Anti-Corruption Layer — маппер, конвертирующий внешние форматы API в доменную модель, защищая domain от внешних изменений. |
| **DI** | Dependency Injection — передача зависимостей снаружи, а не создание их внутри. `providers.ts` инжектирует адаптеры в composables через `useNuxtApp()`. |
| **Shared Kernel** | Код, разделяемый между bounded contexts по договорённости. Layer `shared/` с Money, шиной событий и UI-примитивами. |
| **TDD** | Test-Driven Development — сначала пишешь тест, потом код чтобы тест прошёл. Цикл Red → Green → Refactor. |

---

## Стек

- **Nuxt 4** — фреймворк
- **TypeScript** — типизация
- **Vitest** — тестирование domain-логики
- **ESLint** — контроль границ между контекстами
- **Nuxt Layers** — изоляция bounded contexts
- **Nitro** — серверные роуты (mock API)
