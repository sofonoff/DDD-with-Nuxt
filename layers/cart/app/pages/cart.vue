<!--
  Страница / /cart — корзина.
  Часть контекста Cart.
  Межконтекстное взаимодействие: вызывает usePlaceOrder() из контекста Orders.
  Демонстрирует Command (CQRS) + Saga (автоочистка корзины после OrderPlaced).
-->

<template>
  <div>
    <h1>Корзина</h1>

    <div v-if="items.length === 0" class="cart-empty">
      <p>Корзина пуста</p>
      <NuxtLink to="/catalog">Перейти в каталог</NuxtLink>
    </div>

    <div v-else>
      <div v-for="item in items" :key="item.product.id" class="cart-item">
        <img :src="item.product.image" :alt="item.product.name" width="80" height="60" />
        <div class="cart-item__info">
          <h3>{{ item.product.name }}</h3>
          <p>{{ formatMoney(money(item.product.price)) }}</p>
        </div>
        <div class="cart-item__quantity">
          <button @click="updateQuantity(item.product.id, item.quantity - 1)">-</button>
          <span>{{ item.quantity }}</span>
          <button @click="updateQuantity(item.product.id, item.quantity + 1)">+</button>
        </div>
        <UiButton variant="danger" @click="removeItem(item.product.id)">Удалить</UiButton>
      </div>

      <div class="cart-footer">
        <div class="cart-total">
          Итого: <strong>{{ formatMoney(money(totalPrice)) }}</strong>
        </div>
        <div class="cart-footer__actions">
          <UiButton variant="secondary" @click="clear">Очистить</UiButton>
          <UiButton :disabled="orderLoading" @click="handlePlaceOrder">
            {{ orderLoading ? 'Оформляем...' : 'Оформить заказ' }}
          </UiButton>
        </div>
      </div>
      <p v-if="orderError" class="cart-error">{{ orderError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { money, formatMoney } from '~~/layers/shared/domain/money'

const { items, totalPrice, removeItem, updateQuantity, clear } = useCart()
const { execute: placeOrder, loading: orderLoading, error: orderError } = usePlaceOrder()

async function handlePlaceOrder() {
  const order = await placeOrder(items.value)
  if (order) {
    navigateTo(`/orders/${order.id}`)
  }
}
</script>

<style scoped>
.cart-empty {
  text-align: center;
  padding: 60px 0;
  color: #64748b;
}
.cart-empty a {
  color: #2563eb;
  text-decoration: none;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
}
.cart-item img {
  border-radius: 6px;
  object-fit: cover;
}
.cart-item__info {
  flex: 1;
}
.cart-item__info h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}
.cart-item__info p {
  margin: 0;
  color: #2563eb;
  font-weight: 600;
}
.cart-item__quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cart-item__quantity button {
  width: 28px;
  height: 28px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
}
.cart-total {
  font-size: 1.25rem;
}
.cart-footer__actions {
  display: flex;
  gap: 8px;
}
.cart-error {
  color: #dc2626;
  margin-top: 8px;
}
</style>
