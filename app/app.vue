<!--
  Root application shell.
  Thin layer: navigation and NuxtPage slot.
  CartButton is auto-imported from the Cart context.
-->

<template>
  <div id="app">
    <header class="header">
      <nav class="nav">
        <NuxtLink to="/" class="nav__logo">DDD Store</NuxtLink>
        <div class="nav__links">
          <NuxtLink to="/catalog">Catalog</NuxtLink>
          <NuxtLink to="/orders">Orders</NuxtLink>
          <CartButton />
        </div>
      </nav>
    </header>
    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}
.header {
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
}
.nav {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.nav__logo {
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  color: #1e293b;
}
.nav__links {
  display: flex;
  gap: 24px;
  align-items: center;
}
.nav__links a {
  text-decoration: none;
  color: #1e293b;
}
.main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}
</style>
