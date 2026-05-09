const apiUrl = import.meta.env.VITE_API_URL

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
  try {
    const res = await fetch(`${apiUrl}/addTransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    if (res.ok) {
      return await res.json()
    } else {
      throw new Error('Failed to fetch transactions')
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${apiUrl}/getTransactions`, {
      method: 'GET',
      credentials: 'include',
    })

    if (res.ok) {
      const data: { transactions: Transaction[] } = await res.json()
      return data.transactions
    } else {
      throw new Error('Failed to fetch transactions')
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function editTransaction(
  id: number,
  payload: CreateTransactionPayload,
): Promise<{ transaction: Transaction }> {
  try {
    const res = await fetch(`${apiUrl}/editTransaction/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    if (res.ok) {
      return await res.json()
    } else {
      throw new Error('Failed to edit transaction')
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  try {
    const res = await fetch(`${apiUrl}/deleteTransaction/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!res.ok) {
      throw new Error('Failed to delete transaction')
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
