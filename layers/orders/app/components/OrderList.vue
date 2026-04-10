<!--
  Компонент / OrderList — список заказов.
  Часть контекста Orders.
-->

<template>
  <div>
    <div v-if="loading" class="order-list__status">Загрузка...</div>
    <div v-else-if="error" class="order-list__status order-list__error">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="order-list__status">
      Заказов пока нет
    </div>
    <div v-else class="order-list">
      <OrderCard v-for="order in orders" :key="order.id" :order="order" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { orders, loading, error, fetchAll } = useOrders()

await fetchAll()
</script>

<style scoped>
.order-list {
  display: grid;
  gap: 16px;
}
.order-list__status {
  text-align: center;
  padding: 40px;
  color: #64748b;
}
.order-list__error {
  color: #dc2626;
}
</style>
