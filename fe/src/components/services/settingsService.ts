const apiUrl = import.meta.env.VITE_API_URL

import type { ExpenseCategory } from './transactionService'

export type Currency = 'USD' | 'EUR' | 'CHF'
export type Theme = 'light' | 'dark' | 'system'
export type StartPage = 'home' | 'transaction' | 'analytics' | 'budget'

export type ProfileSettings = {
  displayName: string
  email: string
}

export type PreferenceSettings = {
  currency: Currency
  theme: Theme
  startPage: StartPage
  defaultExpenseCategory: ExpenseCategory
}

export type BudgetSettings = {
  warningThreshold: number
  resetDay: number
  alertsEnabled: boolean
}

export type SecuritySettings = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type UserSettings = {
  profile: ProfileSettings
  preferences: PreferenceSettings
  budgetSettings: BudgetSettings
}

export type UpdateSettingsPayload = UserSettings & {
  security: SecuritySettings
}

type SettingsApiResponse = {
  settings: UserSettings
}

export const createEmptySecuritySettings = (): SecuritySettings => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

export async function fetchSettings(): Promise<UserSettings> {
  const res = await fetch(`${apiUrl}/settings`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch settings')
  }

  const data: SettingsApiResponse = await res.json()
  return data.settings
}

export async function updateSettings(payload: UpdateSettingsPayload): Promise<UserSettings> {
  const res = await fetch(`${apiUrl}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? 'Failed to update settings')
  }

  return (data as SettingsApiResponse).settings
}

export async function deleteAccount(password: string): Promise<void> {
  const res = await fetch(`${apiUrl}/settings/account`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? 'Failed to delete account')
  }
}
