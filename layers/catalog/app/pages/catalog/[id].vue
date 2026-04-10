<!--
  Страница / /catalog/:id — детальная страница товара.
  Межконтекстное взаимодействие: useProducts() + useCart().addItem().
-->

<template>
  <div>
    <div v-if="loading" class="detail__status">Загрузка...</div>
    <div v-else-if="error" class="detail__status">{{ error }}</div>
    <div v-else-if="current" class="detail">
      <img :src="current.image" :alt="current.name" />
      <div class="detail__info">
        <span class="detail__category">{{ current.category }}</span>
        <h1>{{ current.name }}</h1>
        <UiPriceTag :amount="current.price" large />
        <p>{{ current.description }}</p>
        <UiButton @click="handleAddToCart">В корзину</UiButton>
        <NuxtLink to="/catalog" class="detail__back">Назад к каталогу</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { current, loading, error, fetchById } = useProducts()
const { addItem } = useCart()

await fetchById(route.params.id as string)

function handleAddToCart() {
  if (current.value) addItem(current.value)
}
</script>

<style scoped>
.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 900px;
}
.detail img {
  width: 100%;
  border-radius: 8px;
}
.detail__category {
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #64748b;
  letter-spacing: 0.05em;
}
.detail h1 {
  margin: 8px 0 12px;
}
.detail__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}
.detail__back {
  display: inline-block;
  margin-top: 12px;
  color: #64748b;
  text-decoration: none;
}
.detail__status {
  padding: 40px;
  text-align: center;
  color: #64748b;
}
</style>
