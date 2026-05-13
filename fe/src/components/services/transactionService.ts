import { apiFetch, readErrorMessage } from '@/utils/apiClient'

export type ExpenseCategory = 'food' | 'transport' | 'entertainment' | 'shopping' | 'other'
export type IncomeCategory = 'salary' | 'freelance' | 'investment' | 'gift' | 'other'
export type TransactionCategory = ExpenseCategory | IncomeCategory

export type Transaction = {
  id: number
  title: string
  amount: number
  type: 'income' | 'expense'
  category: TransactionCategory
}

export type CreateTransactionPayload = {
  title: string
  amount: number
  type: 'income' | 'expense'
  category: TransactionCategory | IncomeCategory
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<{ transaction: Transaction }> {
  const res = await apiFetch('/addTransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to create transaction'))
  }

  return res.json()
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await apiFetch('/getTransactions', {
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to fetch transactions'))
  }

  const data: { transactions: Transaction[] } = await res.json()
  return data.transactions
}

export async function editTransaction(
  id: number,
  payload: CreateTransactionPayload,
): Promise<{ transaction: Transaction }> {
  const res = await apiFetch(`/editTransaction/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to edit transaction'))
  }

  return res.json()
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await apiFetch(`/deleteTransaction/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to delete transaction'))
  }
}
