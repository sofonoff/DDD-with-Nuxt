<!--
  UI / Modal — модальное окно.
  Часть shared layer, доступна во всех доменах как <UiModal>.
-->

<template>
  <Teleport to="body">
    <div v-if="open" class="ui-modal__overlay" @click.self="$emit('close')">
      <div class="ui-modal">
        <div class="ui-modal__header">
          <slot name="header" />
          <button class="ui-modal__close" @click="$emit('close')">X</button>
        </div>
        <div class="ui-modal__body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.ui-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.ui-modal {
  background: white;
  border-radius: 10px;
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
}
.ui-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.ui-modal__close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #64748b;
}
</style>
