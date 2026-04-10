<!--
  UI / Input — базовый текстовый инпут.
  Часть shared layer, доступна во всех доменах как <UiInput>.
-->

<template>
  <input
    class="ui-input"
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  type?: string
  placeholder?: string
}>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.ui-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.ui-input:focus {
  border-color: #2563eb;
}
</style>
