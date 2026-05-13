<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    size?: 'sm' | 'md' | 'lg'
    overlay?: boolean
    centered?: boolean
  }>(),
  {
    label: '',
    size: 'md',
    overlay: false,
    centered: false,
  },
)

const spinnerSize = computed(() => {
  if (props.size === 'sm') {
    return '16px'
  }

  if (props.size === 'lg') {
    return '40px'
  }

  return '24px'
})
</script>

<template>
  <div :class="['spinner-wrapper', { overlay, centered }]" role="status" aria-live="polite">
    <span class="spinner" :style="{ width: spinnerSize, height: spinnerSize }" aria-hidden="true" />
    <span v-if="label" class="spinner-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
}

.spinner-wrapper.centered {
  width: 100%;
}

.spinner-wrapper.overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(15, 23, 42, 0.26);
  backdrop-filter: blur(3px);
}

.spinner {
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: var(--accent-color);
  border-right-color: var(--accent-color);
  animation: spinner-rotate 0.75s linear infinite;
}

.overlay .spinner {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-right-color: #ffffff;
}

.spinner-label {
  font-size: 14px;
  font-weight: 600;
}

.overlay .spinner-label {
  color: #ffffff;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
