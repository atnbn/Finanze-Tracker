<template>
  <aside :class="['sidebar', { open: isOpen }]">
    <h2 class="logo">FinTrack</h2>

    <nav class="menu">
      <RouterLink to="/home" exact-active-class="active">🏠 Dashboard</RouterLink>
      <RouterLink to="/transaction" exact-active-class="active">💸 Transactions</RouterLink>
      <RouterLink to="/analytics" exact-active-class="active">📊 Analytics</RouterLink>
      <RouterLink to="/budget" exact-active-class="active">🎯 Budgets</RouterLink>
      <RouterLink to="/settings" exact-active-class="active">⚙️ Settings</RouterLink>
    </nav>

    <button v-on:click="logout()" class="logout">Logout</button>
    <button class="close-btn" @click="closeSidebar">✕</button>
  </aside>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/utils/apiClient'
import { clearStoredUserPreferences } from '@/utils/appPreferences'

const router = useRouter()
defineProps<{
  isOpen: boolean
}>()
const emit = defineEmits<{
  closeSidebar: []
}>()

const logout = async () => {
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('username')
  clearStoredUserPreferences()

  try {
    await apiFetch('/logout', {
      method: 'POST',
    })
  } catch (error) {
    console.error('Logout failed:', error)
  }

  await router.push('/login')
}

const closeSidebar = () => {
  emit('closeSidebar')
}

onMounted(() => {
  router.afterEach(() => {
    emit('closeSidebar')
  })
})
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #111827;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  transition: transform 0.3s ease;
  position: relative;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
}

/* MENU */
.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu a {
  padding: 10px 12px;
  border-radius: 8px;
  color: #ccc;
  text-decoration: none;
  cursor: pointer;
}

.menu a:hover {
  background: #1f2937;
  color: white;
}

.menu .active {
  background: #2563eb;
  color: white;
}

.logout {
  margin-top: auto;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #ef4444;
  color: white;
  cursor: pointer;
}

.close-btn {
  display: none;
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .menu-btn {
    display: block;
  }
  .close-btn {
    display: block;
  }
}
</style>
