<!--
  UI / PriceTag — отображение цены.
  Живёт в shared, потому что нужен нескольким доменам (catalog, cart, orders).
  Если компонент нужен только одному домену — он остаётся в том домене.
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
