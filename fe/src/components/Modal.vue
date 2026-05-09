<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <!-- CONTENT -->
      <div class="modal-body">
        <slot />
      </div>

      <!-- FOOTER (optional slot) -->
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue' 
defineOptions({
  name: 'AppModal',
})

defineProps({
  modelValue: Boolean,
  title: String,
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* OVERLAY */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* MODAL */
.modal {
  background: var(--surface-1);
  border-radius: 14px;
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

/* HEADER */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

/* BODY */
.modal-body {
  padding: 20px;
}

/* FOOTER */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* MOBILE */
@media (max-width: 500px) {
  .modal {
    margin: 0 10px;
  }
}
</style>
