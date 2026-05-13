<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { signup } from './services/authService.ts'
import { showToast } from '@/utils/toast'

type SignupStep = 1 | 2 | 3

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const currentStep = ref<SignupStep>(1)
const isSubmitting = ref(false)

const emailInput = ref<HTMLInputElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

const isEmailValid = computed(() => EMAIL_PATTERN.test(email.value.trim()))
const isNameValid = computed(() => name.value.trim().length >= 2)
const isPasswordLongEnough = computed(() => password.value.length >= MIN_PASSWORD_LENGTH)
const doPasswordsMatch = computed(
  () => password.value.length > 0 && password.value === confirmPassword.value,
)

const passwordHint = computed(() => {
  if (!password.value && !confirmPassword.value) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (!isPasswordLongEnough.value) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (confirmPassword.value && !doPasswordsMatch.value) {
    return 'Passwords do not match yet.'
  }

  return 'Looks good. You are ready to create your account.'
})

const progressWidth = computed(() => `${(currentStep.value / 3) * 100}%`)

const currentStepTitle = computed(() => {
  if (currentStep.value === 1) {
    return 'Start with your email'
  }

  if (currentStep.value === 2) {
    return 'How should we call you?'
  }

  return 'Secure your account'
})

const currentStepSubtitle = computed(() => {
  if (currentStep.value === 1) {
    return 'Enter the email address you want to use for your new account.'
  }

  if (currentStep.value === 2) {
    return 'Nice. Now add the name that should appear in your profile.'
  }

  return 'Choose a strong password and confirm it before signing up.'
})

function focusCurrentInput(): void {
  nextTick(() => {
    if (currentStep.value === 1) {
      emailInput.value?.focus()
      return
    }

    if (currentStep.value === 2) {
      nameInput.value?.focus()
      return
    }

    passwordInput.value?.focus()
  })
}

function nextStep(): void {
  if (currentStep.value === 1 && !isEmailValid.value) {
    showToast({
      type: 'error',
      title: 'Invalid email',
      message: 'Please enter a valid email address before continuing.',
    })
    return
  }

  if (currentStep.value === 2 && !isNameValid.value) {
    showToast({
      type: 'error',
      title: 'Name missing',
      message: 'Please enter your name before continuing.',
    })
    return
  }

  if (currentStep.value < 3) {
    currentStep.value = (currentStep.value + 1) as SignupStep
    focusCurrentInput()
  }
}

function previousStep(): void {
  if (currentStep.value > 1) {
    currentStep.value = (currentStep.value - 1) as SignupStep
    focusCurrentInput()
  }
}

async function handleSignup(): Promise<void> {
  if (currentStep.value < 3) {
    nextStep()
    return
  }

  if (!isPasswordLongEnough.value) {
    showToast({
      type: 'error',
      title: 'Weak password',
      message: `Your password must contain at least ${MIN_PASSWORD_LENGTH} characters.`,
    })
    return
  }

  if (!doPasswordsMatch.value) {
    showToast({
      type: 'error',
      title: 'Passwords do not match',
      message: 'Please make sure both password fields match.',
    })
    return
  }

  isSubmitting.value = true

  try {
    await signup({
      email: email.value.trim(),
      password: password.value,
      username: name.value.trim(),
    })

    showToast({
      type: 'success',
      title: 'Check your inbox',
      message: 'Your account was created. Please verify your email address before logging in.',
    })

    setTimeout(() => {
      window.location.href = '/login'
    }, 2200)
  } catch (error) {
    const signupError = error as { message?: string; type?: string }

    showToast({
      type: 'error',
      title: 'Signup failed',
      message: signupError.message || 'An error occurred during signup.',
    })

    if (signupError.type) {
      console.error(`Signup error of type ${signupError.type}: ${signupError.message}`)
    } else {
      console.error(`Signup error: ${signupError.message}`)
    }
  } finally {
    isSubmitting.value = false
  }
}

focusCurrentInput()
</script>
<template>
  <div class="signup-container">
    <form @submit.prevent="handleSignup" class="signup-form">
      <div class="form-progress">
        <div class="progress-meta">
          <span>Step {{ currentStep }} of 3</span>
          <span>{{ Math.round((currentStep / 3) * 100) }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: progressWidth }"></div>
        </div>
      </div>

      <h2>{{ currentStepTitle }}</h2>
      <p>{{ currentStepSubtitle }}</p>

      <div v-if="currentStep > 1" class="signup-summary">
        <span class="summary-pill">{{ email }}</span>
        <span v-if="currentStep > 2" class="summary-pill secondary">{{ name }}</span>
      </div>

      <Transition name="step-card" mode="out-in">
        <div :key="currentStep" class="step-panel">
          <div v-if="currentStep === 1" class="step-fields">
            <div class="input-group">
              <input
                ref="emailInput"
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder=" "
                required
              />
              <label>Email</label>
            </div>
            <p class="step-hint" :class="{ valid: isEmailValid }">
              {{
                isEmailValid
                  ? 'Great, that email looks valid.'
                  : 'We will use this email for login and verification.'
              }}
            </p>
          </div>

          <div v-else-if="currentStep === 2" class="step-fields">
            <div class="input-group">
              <input
                ref="nameInput"
                v-model="name"
                type="text"
                autocomplete="name"
                placeholder=" "
                required
              />
              <label>Name</label>
            </div>
            <p class="step-hint" :class="{ valid: isNameValid }">
              {{
                isNameValid
                  ? 'Perfect. This name will be shown in your account.'
                  : 'Add at least 2 characters for your display name.'
              }}
            </p>
          </div>

          <div v-else class="step-fields">
            <div class="input-group">
              <input
                ref="passwordInput"
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder=" "
                required
              />
              <label>Password</label>
            </div>

            <div class="input-group">
              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder=" "
                required
              />
              <label>Confirm password</label>
            </div>

            <p class="step-hint" :class="{ valid: isPasswordLongEnough && doPasswordsMatch }">
              {{ passwordHint }}
            </p>
          </div>
        </div>
      </Transition>

      <div class="actions-row">
        <button
          v-if="currentStep > 1"
          type="button"
          class="back-btn"
          @click="previousStep"
          :disabled="isSubmitting"
        >
          Back
        </button>

        <button type="submit" class="signup-btn" :disabled="isSubmitting">
          <LoadingSpinner
            v-if="isSubmitting"
            size="sm"
            :label="currentStep === 3 ? 'Creating account...' : 'Loading...'"
          />
          <span v-else>
            {{ currentStep === 3 ? 'Sign Up' : 'Continue' }}
          </span>
        </button>
      </div>

      <div class="footer">Already have an account? <a href="/login">Login</a></div>
    </form>
  </div>
</template>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    radial-gradient(circle at top, rgba(37, 99, 235, 0.16), transparent 35%), var(--app-bg);
}

.signup-form {
  width: 100%;
  max-width: 460px;
  background: var(--surface-1);
  padding: 40px 30px;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 50px var(--shadow-color);
}

.signup-form h2 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--heading-color);
}

.signup-form p {
  color: var(--app-text);
  margin-bottom: 20px;
  font-size: 14px;
}

.form-progress {
  margin-bottom: 24px;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  transition: width 0.35s ease;
}

.signup-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: var(--accent-color);
  font-size: 12px;
  font-weight: 600;
}

.summary-pill.secondary {
  background: var(--surface-2);
  color: var(--text-muted);
}

.step-panel {
  min-height: 192px;
}

.step-fields {
  display: flex;
  flex-direction: column;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 16px 14px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  outline: none;
  font-size: 14px;
  transition: 0.2s;
  background: var(--surface-2);
}

.input-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-group label {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--surface-1);
  padding: 0 4px;
  color: #888;
  font-size: 14px;
  pointer-events: none;
  transition: 0.2s;
}

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -8px;
  font-size: 12px;
  color: #2563eb;
}

.step-hint {
  min-height: 22px;
  margin-top: -6px;
  margin-bottom: 6px;
  color: var(--text-muted);
  font-size: 13px;
  transition: color 0.2s ease;
}

.step-hint.valid {
  color: var(--success-text);
}

.actions-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.back-btn,
.signup-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background 0.2s ease;
}

.back-btn {
  max-width: 110px;
  background: var(--surface-2);
  border: 1px solid var(--border-color);
  color: var(--app-text);
}

.signup-btn {
  background: #2563eb;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.signup-btn:hover {
  background: #1e4fd8;
}

.back-btn:hover,
.signup-btn:active {
  transform: scale(0.98);
}

.back-btn:disabled,
.signup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.footer {
  margin-top: 20px;
  font-size: 13px;
  text-align: center;
  color: var(--app-text);
}

.footer a {
  color: var(--primary-color);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.step-card-enter-active,
.step-card-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.step-card-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}

.step-card-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

@media (max-width: 540px) {
  .signup-form {
    padding: 28px 20px;
  }

  .actions-row {
    flex-direction: column;
  }

  .back-btn,
  .signup-btn {
    width: 100%;
    max-width: none;
  }
}
</style>
