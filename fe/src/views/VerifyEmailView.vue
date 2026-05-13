<template>
  <main class="verify-layout">
    <section class="verify-card">
      <p class="eyebrow">Email verification</p>
      <h1>{{ title }}</h1>
      <LoadingSpinner v-if="isLoading" centered label="Verifying your email..." />
      <p class="message">{{ message }}</p>

      <div class="actions">
        <RouterLink class="btn primary" to="/login">Go to login</RouterLink>
        <RouterLink class="btn secondary" to="/signup">Back to signup</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { verifyEmail } from '@/components/services/authService'

const route = useRoute()
const isLoading = ref(true)
const isSuccess = ref(false)
const message = ref('Checking your verification link...')

const title = computed(() => {
  if (isLoading.value) {
    return 'Verifying your email'
  }

  return isSuccess.value ? 'Email verified' : 'Verification failed'
})

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!token) {
    isLoading.value = false
    message.value = 'The verification link is missing a token. Please use the link from your email.'
    return
  }

  try {
    message.value = await verifyEmail(token)
    isSuccess.value = true
  } catch (error) {
    message.value =
      error instanceof Error
        ? error.message
        : 'We could not verify your email. Please request a new verification link.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.verify-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--app-bg);
  color: var(--app-text);
}

.verify-card {
  width: min(100%, 520px);
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px var(--shadow-color);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-color);
}

h1 {
  margin: 0;
  color: var(--heading-color);
}

.message {
  margin: 16px 0 0;
  line-height: 1.6;
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
}

.primary {
  background: var(--accent-color);
  color: var(--accent-contrast);
}

.secondary {
  border: 1px solid var(--border-color);
  background: var(--surface-2);
  color: var(--app-text);
}
</style>
