<!--
  UI / Button — базовая кнопка.
  Часть shared layer, доступна во всех доменах как <UiButton>.
-->

<template>
  <button class="ui-button" :class="`ui-button--${variant}`" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>(), {
  variant: 'primary',
  disabled: false,
})
</script>

<style scoped>
.ui-button {
  padding: 8px 18px;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}
.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ui-button--primary {
  background: #2563eb;
  color: white;
}
.ui-button--primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.ui-button--secondary {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}
.ui-button--secondary:hover:not(:disabled) {
  background: #f8fafc;
}
.ui-button--danger {
  background: white;
  color: #dc2626;
  border: 1px solid #dc2626;
}
.ui-button--danger:hover:not(:disabled) {
  background: #fef2f2;
}
</style>
