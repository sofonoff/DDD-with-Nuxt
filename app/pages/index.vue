<!--
  Страница / / — лендинг.
  Живёт в корневом app, не в доменном layer.
-->

<template>
  <div>
    <h1>DDD Store</h1>
    <p>Пример e-commerce на Nuxt 4 с Domain-Driven Design через layers.</p>
    <div class="home-links">
      <NuxtLink to="/catalog">
        <UiButton>Перейти в каталог</UiButton>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 12px;
}
p {
  color: #64748b;
  margin-bottom: 24px;
}
.home-links {
  display: flex;
  gap: 12px;
}
</style>
