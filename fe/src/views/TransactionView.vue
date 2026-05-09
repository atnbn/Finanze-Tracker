<template>
  <div class="transaction-layout">
    <Sidebar :is-open="isModalOpen" @close-sidebar="handleCloseSidebar" />

    <div class="main-area">
      <Header title="Transactions" @open-sidebar="handleOpenSidebar" />

      <main class="content-area">
        <TransAction class="transaction-content" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/parts/sidebar.vue'
import TransAction from '../components/TransAction.vue'
import Header from '@/components/parts/header.vue'
import { ref } from 'vue'
const isModalOpen = ref(false)

const handleOpenSidebar = () => {
  isModalOpen.value = true
}
const handleCloseSidebar = () => {
  isModalOpen.value = false
}
</script>

<style scoped>
.transaction-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background: var(--app-bg);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-area {
  flex: 1;
  overflow-y: auto;
}

.transaction-content {
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .transaction-layout {
    display: block;
  }
}
</style>
