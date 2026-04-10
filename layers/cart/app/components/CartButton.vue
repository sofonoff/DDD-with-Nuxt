<!--
  Component / CartButton — cart button in navbar with badge.
  Part of the Cart context. Used in root app.vue.
-->

<template>
  <NuxtLink to="/cart" class="cart-button">
    Cart<span v-if="totalItems > 0" class="cart-button__badge">{{ totalItems }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const { totalItems } = useCart()
</script>

<style scoped>
.cart-button {
  position: relative;
  text-decoration: none;
  color: #1e293b;
  font-weight: 500;
}
.cart-button__badge {
  position: absolute;
  top: -8px;
  right: -14px;
  background: #2563eb;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
