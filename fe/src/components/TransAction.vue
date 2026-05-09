<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  createTransaction,
  editTransaction,
  fetchTransactions,
  deleteTransaction,
} from './services/transactionService.ts'
import type { CreateTransactionPayload, Transaction } from './services/transactionService.ts'
import TransactionList from './parts/transactionList.vue'
import TransactionModal from './parts/TransactionModal.vue'
import { showToast } from '@/utils/toast'

type ModalType = 'create' | 'edit' | 'delete'

const createEmptyTransaction = (): CreateTransactionPayload => ({
  title: '',
  amount: 0,
  type: 'expense',
  category: 'food',
})

const selectedTransactionId = ref<number | null>(null)
const showModal = ref(false)
const modalType = ref<ModalType>('create')
const form = ref<CreateTransactionPayload>(createEmptyTransaction())
const transactions = ref<Transaction[]>([])

const findTransactionIndexById = (id: number | null) => {
  if (id === null) return -1

  return transactions.value.findIndex((transaction) => transaction.id === id)
}

const resetForm = () => {
  form.value = createEmptyTransaction()
  selectedTransactionId.value = null
  modalType.value = 'create'
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const openCreate = () => {
  resetForm()
  showModal.value = true
}

const openEdit = (transaction: Transaction) => {
  selectedTransactionId.value = transaction.id
  form.value = {
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
  }
  modalType.value = 'edit'
  showModal.value = true
}

const openDelete = (transactionId: number) => {
  selectedTransactionId.value = transactionId
  modalType.value = 'delete'
  showModal.value = true
}

const loadTransactions = async () => {
  try {
    transactions.value = await fetchTransactions()
  } catch (err: unknown) {
    console.error('Error loading transactions:', err)
    showToast({
      type: 'error',
      title: 'Transactions unavailable',
      message: 'Transactions could not be loaded right now.',
    })
  }
}

const buildPayload = (): CreateTransactionPayload => ({
  title: form.value.title.trim(),
  amount: Number(form.value.amount),
  type: form.value.type,
  category: form.value.category,
})

const validatePayload = (payload: CreateTransactionPayload) => {
  return payload.title.length > 0 && payload.category.length > 0
}

const handleSubmit = async () => {
  const payload = buildPayload()

  if (!validatePayload(payload)) {
    return
  }

  if (modalType.value === 'edit') {
    const transactionIndex = findTransactionIndexById(selectedTransactionId.value)
    const existingTransaction = transactions.value[transactionIndex]

    if (!existingTransaction) {
      return
    }

    try {
      const { transaction: updatedTransaction } = await editTransaction(
        existingTransaction.id,
        payload,
      )
      transactions.value[transactionIndex] = updatedTransaction
      showToast({
        type: 'success',
        title: 'Transaction updated',
        message: `${updatedTransaction.title} was updated successfully.`,
      })
    } catch (err: unknown) {
      console.error('Error updating transaction:', err)
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err instanceof Error ? err.message : 'The transaction could not be updated.',
      })
      return
    }
  } else {
    try {
      const { transaction: createdTransaction } = await createTransaction(payload)
      transactions.value.unshift(createdTransaction)
      showToast({
        type: 'success',
        title: 'Transaction created',
        message: `${createdTransaction.title} was added successfully.`,
      })
    } catch (err: unknown) {
      console.error('Error saving transaction:', err)
      showToast({
        type: 'error',
        title: 'Create failed',
        message: err instanceof Error ? err.message : 'The transaction could not be created.',
      })
      return
    }
  }

  closeModal()
}

const confirmDelete = async () => {
  const transactionIndex = findTransactionIndexById(selectedTransactionId.value)

  if (transactionIndex === -1) return

  const transactionToDelete = transactions.value[transactionIndex]

  if (!transactionToDelete) {
    return
  }

  try {
    await deleteTransaction(transactionToDelete.id)
    transactions.value.splice(transactionIndex, 1)
    showToast({
      type: 'success',
      title: 'Transaction deleted',
      message: `${transactionToDelete.title} was deleted successfully.`,
    })
  } catch (err: unknown) {
    console.error('Error deleting transaction:', err)
    showToast({
      type: 'error',
      title: 'Delete failed',
      message: err instanceof Error ? err.message : 'The transaction could not be deleted.',
    })
    return
  }

  closeModal()
}

onMounted(() => {
  loadTransactions()
})
</script>

<template>
  <div class="transactions-page">
    <!-- HEADER -->
    <div class="header">
      <button class="btn primary" @click="openCreate">+ Add Transaction</button>
    </div>

    <div class="list-card">
      <h3>All Transactions</h3>

      <TransactionList
        :transactions="transactions"
        :edit="true"
        @edit="openEdit"
        @delete="openDelete"
      />
    </div>

    <TransactionModal
      :model-value="showModal"
      :modal-type="modalType"
      :form="form"
      @update:form="(nextForm) => (form = nextForm)"
      @cancel="closeModal"
      @submit="handleSubmit"
      @confirm-delete="confirmDelete"
    />
  </div>
</template>

<style scoped>
.transactions-page {
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.list-card {
  background: var(--surface-1);
  padding: 20px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px var(--shadow-color);
}

.list-card h3 {
  color: var(--heading-color);
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 24px;
}

/* BUTTON */
.btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.primary {
  background: var(--accent-color);
  color: var(--accent-contrast);
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
