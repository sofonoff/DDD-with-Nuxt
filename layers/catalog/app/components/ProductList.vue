<!--
  Component / ProductList — product grid.
  Part of the Catalog context. Cross-context interaction: calls useCart().addItem().
-->

<template>
  <div>
    <div v-if="loading" class="product-list__status">Loading...</div>
    <div v-else-if="error" class="product-list__status product-list__error">{{ error }}</div>
    <div v-else class="product-list">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @add-to-cart="addItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { products, loading, error, fetchAll } = useProducts()
const { addItem } = useCart()

await fetchAll()
</script>

<style scoped>
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.product-list__status {
  text-align: center;
  padding: 40px;
  color: #64748b;
}
.product-list__error {
  color: #dc2626;
}
</style>
