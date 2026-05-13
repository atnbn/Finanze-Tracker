const apiUrl = import.meta.env.VITE_API_URL

import { apiFetch, readErrorMessage } from '@/utils/apiClient'

type SignupPayload = {
  username: string
  email: string
  password: string
}

type LoginPayload = {
  email: string
  password: string
}

export async function signup(payload: SignupPayload): Promise<void> {
  const res = await apiFetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to sign up'))
  }
}

export async function verifyEmail(token: string): Promise<string> {
  const res = await apiFetch('/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? 'Failed to verify email')
  }

  return data?.message ?? 'Your email has been verified.'
}

export async function requestPasswordReset(email: string): Promise<string> {
  const res = await apiFetch('/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? 'Failed to request password reset')
  }

  return (
    data?.message ?? 'If an account with that email exists, a password reset link has been sent.'
  )
}

type ResetPasswordPayload = {
  token: string
  password: string
  confirmPassword: string
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  const res = await apiFetch('/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? 'Failed to reset password')
  }

  return data?.message ?? 'Your password has been reset.'
}
