const apiUrl = import.meta.env.VITE_API_URL

import type { ExpenseCategory } from './transactionService'

type BudgetApiItem = {
  id: number
  category: ExpenseCategory
  limit_amount: number | string
  spent: number | string
  month: number
  year: number
}

export type Budget = {
  id: number
  category: ExpenseCategory
  limitAmount: number
  spent: number
  month: number
  year: number
}

export type SaveBudgetPayload = {
  category: ExpenseCategory
  limitAmount: number
}

const normalizeBudget = (budget: BudgetApiItem): Budget => ({
  id: budget.id,
  category: budget.category,
  limitAmount: Number(budget.limit_amount),
  spent: Number(budget.spent),
  month: budget.month,
  year: budget.year,
})

export async function fetchCurrentMonthBudgets(): Promise<{
  budgets: Budget[]
  month: number
  year: number
}> {
  const res = await fetch(`${apiUrl}/budgets/current-month`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch budgets')
  }

  const data: { budgets: BudgetApiItem[]; month: number; year: number } = await res.json()

  return {
    budgets: data.budgets.map(normalizeBudget),
    month: data.month,
    year: data.year,
  }
}

export async function saveBudget(payload: SaveBudgetPayload): Promise<Budget> {
  const res = await fetch(`${apiUrl}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to save budget')
  }

  const data: { budget: BudgetApiItem } = await res.json()

  return normalizeBudget({
    ...data.budget,
    spent: 0,
  })
}

export async function deleteBudget(id: number): Promise<void> {
  const res = await fetch(`${apiUrl}/budgets/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? 'Failed to delete budget')
  }
}
