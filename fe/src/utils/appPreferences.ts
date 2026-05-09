import { computed, ref } from 'vue'
import type {
  Currency,
  PreferenceSettings,
  ProfileSettings,
  StartPage,
  Theme,
  UserSettings,
} from '@/components/services/settingsService'

const SETTINGS_STORAGE_KEY = 'fintrack-user-settings'

type StoredSettings = Pick<UserSettings, 'profile' | 'preferences'>

const isBrowser = typeof window !== 'undefined'
const DEFAULT_PROFILE: ProfileSettings = {
  displayName: '',
  email: '',
}
const DEFAULT_PREFERENCES: PreferenceSettings = {
  currency: 'USD',
  theme: 'system',
  startPage: 'home',
  defaultExpenseCategory: 'food',
}

const CURRENCY_LOCALE_MAP: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  CHF: 'de-CH',
}

const storedProfile = ref<ProfileSettings>({ ...DEFAULT_PROFILE })
const storedPreferences = ref<PreferenceSettings>({ ...DEFAULT_PREFERENCES })

const syncStoredSettings = (): void => {
  const storedSettings = getStoredUserPreferences()

  storedProfile.value = storedSettings?.profile ?? { ...DEFAULT_PROFILE }
  storedPreferences.value = storedSettings?.preferences ?? { ...DEFAULT_PREFERENCES }
}

syncStoredSettings()

if (isBrowser) {
  window.addEventListener('storage', (event) => {
    if (event.key === SETTINGS_STORAGE_KEY) {
      syncStoredSettings()
    }
  })
}

export const preferredDisplayName = computed(() => storedProfile.value.displayName.trim())
export const preferredCurrency = computed(() => storedPreferences.value.currency)

const normalizeAmount = (value: number): number => (Number.isFinite(value) ? value : 0)

export function formatCurrencyAmount(
  value: number,
  options: Intl.NumberFormatOptions = {},
): string {
  const currency = preferredCurrency.value

  return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(normalizeAmount(value))
}

export function applyTheme(theme: Theme): void {
  if (!isBrowser) {
    return
  }

  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  document.documentElement.dataset.theme = resolvedTheme
  document.documentElement.dataset.themePreference = theme
}

export function storeUserPreferences(settings: UserSettings): void {
  if (!isBrowser) {
    return
  }

  storedProfile.value = { ...settings.profile }
  storedPreferences.value = { ...settings.preferences }

  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify({
      profile: settings.profile,
      preferences: settings.preferences,
    } satisfies StoredSettings),
  )
}

export function clearStoredUserPreferences(): void {
  if (!isBrowser) {
    return
  }

  localStorage.removeItem(SETTINGS_STORAGE_KEY)
  storedProfile.value = { ...DEFAULT_PROFILE }
  storedPreferences.value = { ...DEFAULT_PREFERENCES }
}

export function getStoredUserPreferences(): StoredSettings | null {
  if (!isBrowser) {
    return null
  }

  const rawValue = localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as StoredSettings
  } catch {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
    return null
  }
}

export function initializeStoredPreferences(): void {
  syncStoredSettings()
  applyTheme(storedPreferences.value.theme)
}

export function getPreferredStartPage(): StartPage {
  return storedPreferences.value.startPage
}

export function getPreferredStartRoute(): string {
  return `/${getPreferredStartPage()}`
}
