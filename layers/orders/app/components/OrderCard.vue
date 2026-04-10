<!--
  Компонент / OrderCard — карточка заказа в списке.
  Часть контекста Orders.
-->

<template>
  <div class="order-card">
    <div class="order-card__header">
      <span class="order-card__id">Заказ #{{ order.id }}</span>
      <span class="order-card__status" :class="`order-card__status--${order.status}`">
        {{ statusLabel }}
      </span>
    </div>
    <p class="order-card__items">{{ order.items.length }} позиций</p>
    <div class="order-card__footer">
      <span class="order-card__total">{{ formatMoney(money(order.total)) }}</span>
      <NuxtLink :to="`/orders/${order.id}`">Подробнее</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '../../domain/order.model'
import { money, formatMoney } from '~~/layers/shared/domain/money'

const props = defineProps<{ order: Order }>()

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const statusLabel = computed(() => statusLabels[props.order.status] ?? props.order.status)
</script>

<style scoped>
.order-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}
.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.order-card__id {
  font-weight: 600;
}
.order-card__status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
}
.order-card__status--pending {
  background: #fef3c7;
  color: #92400e;
}
.order-card__status--confirmed {
  background: #dbeafe;
  color: #1e40af;
}
.order-card__status--shipped {
  background: #e0e7ff;
  color: #3730a3;
}
.order-card__status--delivered {
  background: #d1fae5;
  color: #065f46;
}
.order-card__status--cancelled {
  background: #fee2e2;
  color: #991b1b;
}
.order-card__items {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 12px;
}
.order-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-card__total {
  font-weight: 700;
  color: #2563eb;
}
.order-card__footer a {
  color: #2563eb;
  text-decoration: none;
}
</style>
