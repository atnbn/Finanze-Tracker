<template>
  <main class="auth-layout">
    <section class="auth-card">
      <p class="eyebrow">Password reset</p>
      <h1>{{ title }}</h1>
      <p class="message">{{ helperText }}</p>

      <form v-if="!isSuccess" class="auth-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>New password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <label class="field">
          <span>Confirm new password</span>
          <input
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <p v-if="errorMessage" class="feedback error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="feedback success">{{ successMessage }}</p>

        <button class="btn primary" type="submit" :disabled="isSubmitting || !token">
          <LoadingSpinner v-if="isSubmitting" size="sm" label="Resetting..." />
          <span v-else>Reset password</span>
        </button>
      </form>

      <div class="actions">
        <RouterLink class="btn secondary" to="/login">Go to login</RouterLink>
        <RouterLink class="btn tertiary" to="/forgot-password">Request new link</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { resetPassword } from '@/components/services/authService'

const route = useRoute()
const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const title = computed(() => {
  if (isSuccess.value) {
    return 'Password updated'
  }

  return token.value ? 'Choose a new password' : 'Reset link missing'
})

const helperText = computed(() => {
  if (isSuccess.value) {
    return successMessage.value
  }

  if (!token.value) {
    return 'This reset link is missing a token. Open the full link from your email or request a new one.'
  }

  return 'Enter your new password below. Your reset link will expire automatically for security.'
})

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  successMessage.value = ''

  if (!token.value) {
    errorMessage.value = 'The reset link is invalid. Please request a new password reset email.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true

  try {
    successMessage.value = await resetPassword({
      token: token.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    })
    isSuccess.value = true
    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to reset password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--app-bg);
  color: var(--app-text);
}

.auth-card {
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

.auth-form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.field {
  display: grid;
  gap: 8px;
  font-weight: 600;
}

.field span {
  color: var(--heading-color);
}

.field input {
  width: 100%;
  padding: 14px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  outline: none;
  font-size: 14px;
  transition: 0.2s;
  background: transparent;
}

.field input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.feedback {
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.success {
  background: var(--success-bg);
  color: var(--success-text);
}

.error {
  background: var(--danger-bg);
  color: var(--danger-text);
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
  border: none;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.tertiary {
  color: var(--accent-color);
}
</style>
