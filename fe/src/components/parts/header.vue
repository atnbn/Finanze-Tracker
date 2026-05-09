<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { fetchSettings } from '@/components/services/settingsService'
import { preferredDisplayName, storeUserPreferences } from '@/utils/appPreferences'

withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: 'Dashboard',
  },
)

const emit = defineEmits<{
  openSidebar: []
}>()

const openSidebar = () => {
  emit('openSidebar')
}

const displayName = computed(() => preferredDisplayName.value || 'User')

onMounted(async () => {
  if (preferredDisplayName.value) {
    return
  }

  try {
    const settings = await fetchSettings()
    storeUserPreferences(settings)
  } catch (error) {
    console.error('Failed to load display name:', error)
  }
})
</script>

<template>
  <header class="topbar">
    <button class="menu-btn" @click="openSidebar">☰</button>

    <h1>{{ title }}</h1>
  </header>
</template>

<style scoped>
.menu-btn {
  display: none;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
}
/* TOPBAR */
.topbar {
  background: var(--surface-1);
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-2);
}

@media (max-width: 768px) {
  .menu-btn {
    display: block;
  }
}
@media (min-width: 600px) {
  h1 {
    font-size: 21px;
  }
}
</style>
