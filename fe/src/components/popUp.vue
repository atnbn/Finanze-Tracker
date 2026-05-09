<template>
  <div class="notification-container">
    <div :class="['toast', props.type]">
      <div class="toast-icon">
        <span v-if="props.type === 'success'">✓</span>
        <span v-else-if="props.type === 'error'">!</span>
        <span v-else-if="props.type === 'info'">i</span>
        <span v-else-if="props.type === 'warning'">!</span>
      </div>
      <div class="toast-content">
        <span class="toast-title">{{ props.title }}</span>
        <span class="toast-msg">{{ props.message }}</span>
      </div>
      <button
        class="toast-close"
        type="button"
        aria-label="Close notification"
        @click="emit('close')"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  type: 'error' | 'success' | 'info' | 'warning'
  title: string
  message: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
/* Container für die Ausrichtung oben rechts */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 15px;
  pointer-events: none; /* Klicks gehen durch den leeren Container */
}

/* Basis-Design des Toasts */
.toast {
  pointer-events: auto; /* Reaktiviert Klicks für die Toasts */
  width: 320px;
  padding: 15px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: #fff;
  animation: slideIn 0.5s ease forwards;
  position: relative;
  overflow: hidden;
}

/* Linker Farbakzent */
.toast::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 6px;
}

/* Status-Farben & Glüheffekte */
.toast.success::before {
  background: #00ff88;
}
.toast.success {
  border-left: 2px solid #00ff88;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
}

.toast.error::before {
  background: #ff4d4d;
}
.toast.error {
  border-left: 2px solid #ff4d4d;
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.2);
}

.toast.warning::before {
  background: #ffa500;
}
.toast.warning {
  border-left: 2px solid #ffa500;
  box-shadow: 0 0 15px rgba(255, 165, 0, 0.2);
}

.toast.info::before {
  background: #00d4ff;
}
.toast.info {
  border-left: 2px solid #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
}

/* Icons */
.toast-icon {
  font-size: 1.2rem;
  margin-right: 15px;
  font-weight: bold;
  min-width: 24px;
}

.toast.success .toast-icon {
  color: #00ff88;
}
.toast.error .toast-icon {
  color: #ff4d4d;
}
.toast.warning .toast-icon {
  color: #ffa500;
}
.toast.info .toast-icon {
  color: #00d4ff;
}

/* Text-Inhalt */
.toast-content {
  display: flex;
  flex-direction: column;
}

.toast-title {
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 2px;
}

.toast-msg {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Schließen-Button */
.toast-close {
  margin-left: auto;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.5;
  transition: 0.3s;
  border: none;
  background: transparent;
  color: inherit;
}

.toast-close:hover {
  opacity: 1;
}

/* Animationen */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsiv */
@media (max-width: 400px) {
  .notification-container {
    width: 100%;
    right: 0;
    top: 10px;
    align-items: center;
  }
  .toast {
    width: 90%;
  }
}
</style>
