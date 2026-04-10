<!--
  Компонент / ProductCard — карточка товара в сетке.
  Часть контекста Catalog. Авторегистрируется Nuxt.
-->

<template>
  <div class="product-card">
    <img :src="product.image" :alt="product.name" />
    <div class="product-card__body">
      <h3>{{ product.name }}</h3>
      <p class="product-card__price">{{ formatMoney(money(product.price)) }}</p>
      <div class="product-card__actions">
        <NuxtLink :to="`/catalog/${product.id}`">Подробнее</NuxtLink>
        <UiButton @click="$emit('add-to-cart', product)">В корзину</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '../../domain/product.model'
import { money, formatMoney } from '~~/layers/shared/domain/money'

defineProps<{ product: Product }>()
defineEmits<{ 'add-to-cart': [product: Product] }>()
</script>

<style scoped>
.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.product-card__body {
  padding: 16px;
}
.product-card__body h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}
.product-card__price {
  font-weight: 700;
  color: #2563eb;
  margin: 0 0 12px;
}
.product-card__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-card__actions a {
  color: #2563eb;
  text-decoration: none;
}
</style>
