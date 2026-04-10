<!--
  Page / / — landing page.
  Lives in root app, not in a domain layer.
-->

<template>
  <div>
    <h1>DDD Store</h1>
    <p>An e-commerce example on Nuxt 4 with Domain-Driven Design via layers.</p>
    <div class="home-links">
      <NuxtLink to="/catalog">
        <UiButton>Browse Catalog</UiButton>
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
