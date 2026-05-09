<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Welcome Back!</h2>
      <p>Login to your account</p>

      <div class="input-group">
        <input v-model="username" id="username" type="email" required />
        <label>Email</label>
      </div>

      <div class="input-group">
        <input v-model="password" type="password" required />
        <label>Password</label>
      </div>

      <div class="options">
        <label><input v-model="rememberMe" type="checkbox" /> Remember me</label>
        <RouterLink to="/forgot-password">Forgot password?</RouterLink>
      </div>

      <button type="submit" class="login-btn">LOGIN</button>

      <div class="footer">Don't have an account? <a href="/signup">Sign Up</a></div>
    </form>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchSettings } from '@/components/services/settingsService'
import { applyTheme, getPreferredStartRoute, storeUserPreferences } from '@/utils/appPreferences'
import { showToast } from '@/utils/toast'

const apiUrl = import.meta.env.VITE_API_URL

const REMEMBER_ME_KEY = 'rememberMe'
const REMEMBERED_USERNAME_KEY = 'username'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)

onMounted(() => {
  rememberMe.value = localStorage.getItem(REMEMBER_ME_KEY) === 'true'

  if (rememberMe.value) {
    username.value = localStorage.getItem(REMEMBERED_USERNAME_KEY) ?? ''
  }
})

function handleLogin(): void {
  fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: username.value,
      password: password.value,
      rememberMe: rememberMe.value,
    }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error ?? 'Login failed')
      }

      return data
    })
    .then(async (data) => {
      if (data.success) {
        try {
          const settings = await fetchSettings()
          storeUserPreferences(settings)
          applyTheme(settings.preferences.theme)
          if (rememberMe.value) {
            localStorage.setItem(REMEMBER_ME_KEY, 'true')
            localStorage.setItem(REMEMBERED_USERNAME_KEY, username.value)
          } else {
            localStorage.removeItem(REMEMBER_ME_KEY)
            localStorage.removeItem(REMEMBERED_USERNAME_KEY)
          }

          password.value = ''
        } catch (error) {
          console.error('Failed to preload settings:', error)
        }

        showToast({
          type: 'success',
          title: 'Login successful',
          message: 'Welcome back.',
        })
        router.push(getPreferredStartRoute())
      }
    })
    .catch((err) => {
      console.error('Login error:', err)
      password.value = ''
      showToast({
        type: 'error',
        title: 'Login failed',
        message: err instanceof Error ? err.message : 'An error occurred during login.',
      })
    })
}
</script>

<style scoped>
/* ========== CONTAINER ========== */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-bg);
  padding: 20px;
  min-height: 100vh;
}

/* ========== FORM ========== */
.login-form {
  width: 100%;
  max-width: 400px;
  background: var(--app-bg);
  padding: 40px 30px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

/* ========== HEADER ========== */
.login-form h2 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 6px;
}

.login-form p {
  color: var(--app-text);
  margin-bottom: 24px;
  font-size: 14px;
}

/* ========== INPUT GROUP ========== */
.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 14px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  outline: none;
  font-size: 14px;
  transition: 0.2s;
  background: transparent;
}

/* Focus */
.input-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Label */
.input-group label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--app-bg);
  padding: 0 4px;
  color: var(--app-text);
  font-size: 14px;
  pointer-events: none;
  transition: 0.2s;
}

/* Float label */
.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -8px;
  font-size: 12px;
  color: #2563eb;
}

/* ========== OPTIONS ========== */
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 20px;
  color: #555;
}

.options a {
  text-decoration: none;
  color: #2563eb;
}

.options a:hover {
  text-decoration: underline;
}

/* ========== BUTTON ========== */
.login-btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: var(--app-text);
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover {
  background: #1e4fd8;
}

.login-btn:active {
  transform: scale(0.98);
}

/* ========== FOOTER ========== */
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
</style>
