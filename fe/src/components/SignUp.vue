<script setup lang="ts">
import { ref } from 'vue'
import { signup } from './services/authService.ts'
import { showToast } from '@/utils/toast'
const email = ref('')
const password = ref('')
const name = ref('')

function handleSignup(): void {
  signup({ email: email.value, password: password.value, username: name.value })
    .then(() => {
      showToast({
        type: 'success',
        title: 'Check your inbox',
        message: 'Your account was created. Please verify your email address before logging in.',
      })
      setTimeout(() => {
        window.location.href = '/login'
      }, 2200)
    })
    .catch((error: { message: string; type?: string }) => {
      showToast({
        type: 'error',
        title: 'Signup failed',
        message: error.message || 'An error occurred during signup.',
      })
      if (error.type) {
        console.error(`Signup error of type ${error.type}: ${error.message}`)
      } else {
        console.error(`Signup error: ${error.message}`)
      }
    })
}
</script>
<template>
  <div class="signup-container">
    <form @submit.prevent="handleSignup" class="signup-form">
      <h2>Welcome!</h2>
      <p>Create your account</p>

      <div class="input-group">
        <span class="error-message">{{}}</span>
        <input v-model="email" type="text" required />
        <label>Email</label>
      </div>
      <div class="input-group">
        <input v-model="name" type="text" required />
        <label>Name</label>
      </div>

      <div class="input-group">
        <input v-model="password" type="password" required />
        <label>Password</label>
      </div>

      <button type="submit" class="signup-btn">Sign Up</button>

      <div class="footer">Already have an account? <a href="/login">Login</a></div>
    </form>
  </div>
</template>

<style scoped>
/* ========== CONTAINER ========== */
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* ========== FORM ========== */
.signup-form {
  width: 100%;
  max-width: 400px;
  background: var(--surface-1);
  padding: 40px 30px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

/* ========== HEADER ========== */
.signup-form h2 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 6px;
}

.signup-form p {
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

/* Focus state (important for UX) */
.input-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Floating label */
.input-group label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--surface-1);
  padding: 0 4px;
  color: #888;
  font-size: 14px;
  pointer-events: none;
  transition: 0.2s;
}

/* Float up */
.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -8px;
  font-size: 12px;
  color: #2563eb;
}

/* ========== OPTIONS ROW ========== */
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 20px;
  color: var(--app-text);
}

.options a {
  text-decoration: none;
  color: #2563eb;
}

.options a:hover {
  text-decoration: underline;
}

/* ========== BUTTON ========== */
.signup-btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.signup-btn:hover {
  background: #1e4fd8;
}

.signup-btn:active {
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
