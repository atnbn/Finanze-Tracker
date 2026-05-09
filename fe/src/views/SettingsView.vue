<template>
  <div class="settings-layout">
    <Sidebar :is-open="isSidebarOpen" @close-sidebar="handleCloseSidebar" />

    <div class="main-area">
      <Header title="Settings" @open-sidebar="handleOpenSidebar" />

      <main class="content-area">
        <section class="hero-card">
          <div>
            <p class="eyebrow">Preferences</p>
            <h2>Customize your workspace</h2>
            <p class="hero-copy">
              Adjust profile information, choose how budgets behave, and set app preferences that
              match your workflow.
            </p>
          </div>

          <div class="hero-status" :class="saveStateClass">
            {{ saveMessage }}
          </div>
        </section>

        <section class="settings-grid">
          <article class="settings-card">
            <div class="card-header">
              <div>
                <p class="section-label">Profile</p>
                <h3>Account information</h3>
              </div>
            </div>

            <div class="field-grid">
              <label class="field">
                <span>Display name</span>
                <input v-model="profile.displayName" type="text" placeholder="John Doe" />
              </label>

              <label class="field">
                <span>Email</span>
                <input v-model="profile.email" type="email" placeholder="john@example.com" />
              </label>
            </div>
          </article>

          <article class="settings-card">
            <div class="card-header">
              <div>
                <p class="section-label">App preferences</p>
                <h3>Personalize the dashboard</h3>
              </div>
            </div>

            <div class="field-grid">
              <label class="field">
                <span>Currency</span>
                <select v-model="preferences.currency">
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="CHF">Swiss Franc (CHF)</option>
                </select>
              </label>

              <label class="field">
                <span>Theme</span>
                <select v-model="preferences.theme">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>

              <label class="field">
                <span>Start page</span>
                <select v-model="preferences.startPage">
                  <option value="home">Dashboard</option>
                  <option value="transaction">Transactions</option>
                  <option value="analytics">Analytics</option>
                  <option value="budget">Budgets</option>
                </select>
              </label>

              <label class="field">
                <span>Default expense category</span>
                <select v-model="preferences.defaultExpenseCategory">
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
          </article>

          <article class="settings-card">
            <div class="card-header">
              <div>
                <p class="section-label">Budget settings</p>
                <h3>Control budget alerts</h3>
              </div>
            </div>

            <div class="field-grid">
              <label class="field">
                <span>Warning threshold</span>
                <select v-model="budgetSettings.warningThreshold">
                  <option :value="70">70%</option>
                  <option :value="80">80%</option>
                  <option :value="90">90%</option>
                </select>
              </label>

              <label class="field">
                <span>Monthly reset day</span>
                <select v-model="budgetSettings.resetDay">
                  <option v-for="day in resetDayOptions" :key="day" :value="day">
                    Day {{ day }}
                  </option>
                </select>
              </label>

              <label class="toggle-row">
                <div>
                  <strong>Budget alerts</strong>
                  <p>Show alerts when a category approaches its limit.</p>
                </div>
                <input v-model="budgetSettings.alertsEnabled" type="checkbox" />
              </label>
            </div>
          </article>

          <article class="settings-card">
            <div class="card-header">
              <div>
                <p class="section-label">Security</p>
                <h3>Password</h3>
                <p class="section-copy">
                  Leave these fields blank if you do not want to change your password.
                </p>
              </div>
            </div>

            <div class="field-grid">
              <label class="field">
                <span>Current password</span>
                <input
                  v-model="security.currentPassword"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </label>

              <label class="field">
                <span>New password</span>
                <input
                  v-model="security.newPassword"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
              </label>

              <label class="field">
                <span>Confirm password</span>
                <input
                  v-model="security.confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
              </label>
            </div>
          </article>

          <article class="settings-card danger-card">
            <div class="card-header">
              <div>
                <p class="section-label danger-label">Danger zone</p>
                <h3>Delete account</h3>
                <p class="section-copy">
                  Permanently remove your account, transactions, budgets, and saved settings. This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <div class="danger-actions">
              <button class="btn danger" :disabled="isDeletingAccount" @click="openDeleteModal">
                {{ isDeletingAccount ? 'Deleting...' : 'Delete account' }}
              </button>
            </div>
          </article>
        </section>

        <div class="action-row">
          <button class="btn secondary" :disabled="isSaveDisabled" @click="resetSettings">
            Reset
          </button>
          <button class="btn primary" :disabled="isSaveDisabled" @click="saveSettings">
            Save changes
          </button>
        </div>
      </main>
    </div>

    <Modal v-model="isDeleteModalOpen" title="Delete account">
      <div class="delete-modal-copy">
        <p>
          This will permanently delete your account and all related data. Enter your current
          password to confirm.
        </p>

        <label class="field delete-field">
          <span>Current password</span>
          <input
            v-model="deletePassword"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="isDeletingAccount"
          />
        </label>

        <p v-if="deleteAccountError" class="delete-feedback error-text">{{ deleteAccountError }}</p>
      </div>

      <template #footer>
        <button class="btn secondary" :disabled="isDeletingAccount" @click="closeDeleteModal">
          Cancel
        </button>
        <button class="btn danger" :disabled="isDeletingAccount" @click="confirmDeleteAccount">
          {{ isDeletingAccount ? 'Deleting...' : 'Delete permanently' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Header from '@/components/parts/header.vue'
import Sidebar from '@/components/parts/sidebar.vue'
import {
  createEmptySecuritySettings,
  deleteAccount,
  fetchSettings,
  updateSettings,
  type BudgetSettings,
  type PreferenceSettings,
  type ProfileSettings,
  type SecuritySettings,
  type UserSettings,
} from '@/components/services/settingsService'
import {
  applyTheme,
  clearStoredUserPreferences,
  storeUserPreferences,
} from '@/utils/appPreferences'
import { showToast } from '@/utils/toast'

type SaveState = 'idle' | 'saved' | 'error' | 'loading'

const createDefaultProfile = (): ProfileSettings => ({
  displayName: '',
  email: '',
})

const createDefaultPreferences = (): PreferenceSettings => ({
  currency: 'USD',
  theme: 'system',
  startPage: 'home',
  defaultExpenseCategory: 'food',
})

const createDefaultBudgetSettings = (): BudgetSettings => ({
  warningThreshold: 80,
  resetDay: 1,
  alertsEnabled: true,
})

const createDefaultSecurity = (): SecuritySettings => ({
  ...createEmptySecuritySettings(),
})

const cloneSettings = (settings: UserSettings): UserSettings => ({
  profile: { ...settings.profile },
  preferences: { ...settings.preferences },
  budgetSettings: { ...settings.budgetSettings },
})

const router = useRouter()
const isSidebarOpen = ref(false)
const isLoading = ref(true)
const saveState = ref<SaveState>('loading')
const feedbackMessage = ref('Loading your settings...')
const profile = ref<ProfileSettings>(createDefaultProfile())
const preferences = ref<PreferenceSettings>(createDefaultPreferences())
const budgetSettings = ref<BudgetSettings>(createDefaultBudgetSettings())
const security = ref<SecuritySettings>(createDefaultSecurity())
const lastSavedSettings = ref<UserSettings | null>(null)
const isDeleteModalOpen = ref(false)
const isDeletingAccount = ref(false)
const deletePassword = ref('')
const deleteAccountError = ref('')

const resetDayOptions = Array.from({ length: 28 }, (_, index) => index + 1)

const normalizeSecurity = (value: SecuritySettings): SecuritySettings => ({
  currentPassword: value.currentPassword.trim(),
  newPassword: value.newPassword.trim(),
  confirmPassword: value.confirmPassword.trim(),
})

const saveMessage = computed(() => feedbackMessage.value)

const saveStateClass = computed(() => ({
  error: saveState.value === 'error',
  loading: saveState.value === 'loading',
  saved: saveState.value === 'saved',
}))

const hasPasswordChanges = computed(() => {
  const normalizedSecurity = normalizeSecurity(security.value)

  return Boolean(normalizedSecurity.newPassword || normalizedSecurity.confirmPassword)
})

const hasSettingsChanges = computed(() => {
  if (!lastSavedSettings.value) {
    return false
  }

  return (
    JSON.stringify({
      profile: profile.value,
      preferences: preferences.value,
      budgetSettings: budgetSettings.value,
    }) !== JSON.stringify(lastSavedSettings.value)
  )
})

const hasUnsavedChanges = computed(() => hasSettingsChanges.value || hasPasswordChanges.value)

const isSaveDisabled = computed(
  () => isLoading.value || saveState.value === 'loading' || !hasUnsavedChanges.value,
)

const loadSettings = async () => {
  try {
    isLoading.value = true
    saveState.value = 'loading'
    feedbackMessage.value = 'Loading your settings...'

    const settings = await fetchSettings()

    profile.value = { ...settings.profile }
    preferences.value = { ...settings.preferences }
    budgetSettings.value = { ...settings.budgetSettings }
    security.value = createDefaultSecurity()
    lastSavedSettings.value = cloneSettings(settings)

    storeUserPreferences(settings)
    applyTheme(settings.preferences.theme)

    saveState.value = 'idle'
    feedbackMessage.value = 'Your preferences are up to date'
  } catch (error) {
    console.error('Failed to load settings:', error)
    saveState.value = 'error'
    feedbackMessage.value = 'Could not load settings'
    showToast({
      type: 'error',
      title: 'Settings unavailable',
      message: 'Your settings could not be loaded right now.',
    })
  } finally {
    isLoading.value = false
  }
}

const handleOpenSidebar = () => {
  isSidebarOpen.value = true
}

const handleCloseSidebar = () => {
  isSidebarOpen.value = false
}

const openDeleteModal = () => {
  deletePassword.value = ''
  deleteAccountError.value = ''
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeletingAccount.value) {
    return
  }

  isDeleteModalOpen.value = false
  deletePassword.value = ''
  deleteAccountError.value = ''
}

const resetSettings = () => {
  if (lastSavedSettings.value) {
    profile.value = { ...lastSavedSettings.value.profile }
    preferences.value = { ...lastSavedSettings.value.preferences }
    budgetSettings.value = { ...lastSavedSettings.value.budgetSettings }
  } else {
    profile.value = createDefaultProfile()
    preferences.value = createDefaultPreferences()
    budgetSettings.value = createDefaultBudgetSettings()
  }

  security.value = createDefaultSecurity()
  saveState.value = 'idle'
  feedbackMessage.value = 'Unsaved changes were cleared'
}

const saveSettings = async () => {
  const normalizedSecurity = normalizeSecurity(security.value)
  const shouldChangePassword = Boolean(
    normalizedSecurity.newPassword || normalizedSecurity.confirmPassword,
  )
  const securityPayload = shouldChangePassword ? normalizedSecurity : createEmptySecuritySettings()

  if (!hasUnsavedChanges.value) {
    saveState.value = 'idle'
    feedbackMessage.value = 'There are no changes to save'
    return
  }

  if (shouldChangePassword) {
    if (
      !normalizedSecurity.currentPassword ||
      !normalizedSecurity.newPassword ||
      !normalizedSecurity.confirmPassword
    ) {
      saveState.value = 'error'
      feedbackMessage.value = 'Fill out all password fields to change your password'
      return
    }
  }

  if (
    normalizedSecurity.newPassword &&
    normalizedSecurity.newPassword !== normalizedSecurity.confirmPassword
  ) {
    saveState.value = 'error'
    feedbackMessage.value = 'New password and confirmation must match'
    return
  }

  try {
    saveState.value = 'loading'
    feedbackMessage.value = 'Saving changes...'

    const settings = await updateSettings({
      profile: profile.value,
      preferences: preferences.value,
      budgetSettings: budgetSettings.value,
      security: securityPayload,
    })

    profile.value = { ...settings.profile }
    preferences.value = { ...settings.preferences }
    budgetSettings.value = { ...settings.budgetSettings }
    security.value = createDefaultSecurity()
    lastSavedSettings.value = cloneSettings(settings)

    storeUserPreferences(settings)
    applyTheme(settings.preferences.theme)

    saveState.value = 'saved'
    feedbackMessage.value = 'Changes saved successfully'
    showToast({
      type: 'success',
      title: 'Settings saved',
      message: 'Your changes were saved successfully.',
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    saveState.value = 'error'
    feedbackMessage.value = error instanceof Error ? error.message : 'Failed to save settings'
    showToast({
      type: 'error',
      title: 'Save failed',
      message: error instanceof Error ? error.message : 'Your settings could not be saved.',
    })
  }
}

const confirmDeleteAccount = async () => {
  const password = deletePassword.value.trim()

  if (!password) {
    deleteAccountError.value = 'Please enter your current password to confirm.'
    return
  }

  try {
    isDeletingAccount.value = true
    deleteAccountError.value = ''

    await deleteAccount(password)

    localStorage.removeItem('rememberMe')
    localStorage.removeItem('username')
    clearStoredUserPreferences()
    isDeleteModalOpen.value = false
    deletePassword.value = ''
    showToast({
      type: 'success',
      title: 'Account deleted',
      message: 'Your account was deleted successfully.',
    })
    await router.push('/signup')
  } catch (error) {
    deleteAccountError.value = error instanceof Error ? error.message : 'Failed to delete account'
    showToast({
      type: 'error',
      title: 'Delete failed',
      message: error instanceof Error ? error.message : 'Your account could not be deleted.',
    })
  } finally {
    isDeletingAccount.value = false
  }
}

onMounted(() => {
  void loadSettings()
})
</script>

<style scoped>
.settings-layout {
  display: flex;
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--app-text);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.hero-card,
.settings-card {
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: 0 10px 30px var(--shadow-color);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  margin-bottom: 24px;
}

.eyebrow,
.section-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-color);
}

.hero-card h2,
.settings-card h3 {
  margin: 0;
}

.hero-copy {
  max-width: 560px;
  margin: 12px 0 0;
  line-height: 1.5;
  color: var(--text-muted);
}

.section-copy {
  margin: 8px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.hero-status {
  align-self: flex-start;
  padding: 12px 16px;
  border-radius: 999px;
  background: var(--info-bg);
  color: var(--info-text);
  font-weight: 600;
}

.hero-status.saved {
  background: var(--success-bg);
  color: var(--success-text);
}

.hero-status.error {
  background: var(--danger-bg);
  color: var(--danger-text);
}

.hero-status.loading {
  background: var(--warning-bg);
  color: var(--warning-text);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.settings-card {
  padding: 24px;
}

.danger-card {
  border-color: rgba(239, 68, 68, 0.3);
}

.card-header {
  margin-bottom: 20px;
}

.danger-label {
  color: #ef4444;
}

.field-grid {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span,
.toggle-row strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--heading-color);
}

.field input,
.field select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--app-text);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: var(--surface-2);
}

.toggle-row p {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-muted);
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.danger-actions {
  display: flex;
  justify-content: flex-start;
}

.delete-modal-copy {
  display: grid;
  gap: 16px;
}

.delete-modal-copy p {
  color: var(--text-muted);
  line-height: 1.5;
}

.delete-field {
  margin-top: 4px;
}

.error-text {
  color: var(--danger-text);
  background: var(--danger-bg);
  padding: 12px 14px;
  border-radius: 10px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.primary {
  background: var(--accent-color);
  color: var(--accent-contrast);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary {
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  color: var(--app-text);
}

.danger {
  background: #dc2626;
  color: #fff;
}

@media (max-width: 1024px) {
  .hero-card,
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .settings-layout {
    display: block;
  }

  .content-area {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .action-row,
  .toggle-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
