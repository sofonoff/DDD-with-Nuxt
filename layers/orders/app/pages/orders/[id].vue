<!--
  Страница / /orders/:id — детальная страница заказа.
  Часть контекста Orders. Использует бизнес-правило canCancel из модели.
-->

<template>
  <div>
    <div v-if="loading" class="order-detail__status">Загрузка...</div>
    <div v-else-if="error" class="order-detail__status">{{ error }}</div>
    <div v-else-if="current" class="order-detail">
      <div class="order-detail__header">
        <h1>Заказ #{{ current.id }}</h1>
        <span class="order-detail__status-badge">{{ current.status }}</span>
      </div>

      <div class="order-detail__items">
        <div v-for="item in current.items" :key="item.productId" class="order-detail__item">
          <span>{{ item.productName }}</span>
          <span>{{ item.quantity }} x {{ formatMoney(money(item.price)) }}</span>
        </div>
      </div>

      <div class="order-detail__total">
        Итого: <strong>{{ formatMoney(money(current.total)) }}</strong>
      </div>

      <div class="order-detail__actions">
        <NuxtLink to="/orders">Все заказы</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { money, formatMoney } from '~~/layers/shared/domain/money'

const route = useRoute()
const { current, loading, error, fetchById } = useOrders()

await fetchById(route.params.id as string)
</script>

<style scoped>
.order-detail__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.order-detail__status-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
}
.order-detail__items {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.order-detail__item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}
.order-detail__item:last-child {
  border-bottom: none;
}
.order-detail__total {
  text-align: right;
  font-size: 1.25rem;
  padding: 16px 0;
}
.order-detail__actions {
  padding-top: 8px;
}
.order-detail__actions a {
  color: #64748b;
  text-decoration: none;
}
.order-detail__status {
  text-align: center;
  padding: 40px;
  color: #64748b;
}
</style>
