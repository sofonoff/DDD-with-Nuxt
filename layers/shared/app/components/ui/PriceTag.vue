<!--
  UI / PriceTag — price display.
  Lives in shared because it is needed by multiple domains (catalog, cart, orders).
  If a component is needed by only one domain, it stays in that domain.
-->

<template>
  <span class="price-tag" :class="{ 'price-tag--large': large }">
    {{ formatMoney(money(amount)) }}
  </span>
</template>

<script setup lang="ts">
import { money, formatMoney } from '~~/layers/shared/domain/money'

withDefaults(defineProps<{
  amount: number
  large?: boolean
}>(), {
  large: false,
})
</script>

<style scoped>
.price-tag {
  font-weight: 700;
  color: #2563eb;
}
.price-tag--large {
  font-size: 1.5rem;
}
</style>
