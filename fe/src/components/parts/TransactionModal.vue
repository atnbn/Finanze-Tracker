<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/Modal.vue'
import type {
  CreateTransactionPayload,
  ExpenseCategory,
  IncomeCategory,
  TransactionCategory,
} from '../services/transactionService'

type ModalType = 'create' | 'edit' | 'delete'

const props = defineProps<{
  modelValue: boolean
  modalType: ModalType
  form: CreateTransactionPayload
}>()

const emit = defineEmits<{
  cancel: []
  submit: []
  confirmDelete: []
  'update:form': [form: CreateTransactionPayload]
}>()

type CategoryOption = {
  label: string
  value: TransactionCategory
}

const expenseOptions: Array<{ label: string; value: ExpenseCategory }> = [
  { label: 'Food', value: 'food' },
  { label: 'Transport', value: 'transport' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Other', value: 'other' },
]

const incomeOptions: Array<{ label: string; value: IncomeCategory }> = [
  { label: 'Salary', value: 'salary' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Investment', value: 'investment' },
  { label: 'Gift', value: 'gift' },
  { label: 'Other', value: 'other' },
]

const isDeleting = computed(() => props.modalType === 'delete')
const categoryOptions = computed<CategoryOption[]>(() => {
  return props.form.type === 'income' ? incomeOptions : expenseOptions
})

const modalTitle = computed(() => {
  if (props.modalType === 'edit') return 'Edit Transaction'
  if (props.modalType === 'delete') return 'Delete Transaction'
  return 'Add Transaction'
})

const submitButtonLabel = computed(() => (props.modalType === 'edit' ? 'Update' : 'Add'))

const updateForm = <K extends keyof CreateTransactionPayload>(
  key: K,
  value: CreateTransactionPayload[K],
) => {
  emit('update:form', {
    ...props.form,
    [key]: value,
  })
}

const handleTypeChange = (value: CreateTransactionPayload['type']) => {
  const nextOptions = value === 'income' ? incomeOptions : expenseOptions
  const fallbackCategory: TransactionCategory = value === 'income' ? 'salary' : 'food'
  const nextCategory = nextOptions.some((option) => option.value === props.form.category)
    ? props.form.category
    : (nextOptions[0]?.value ?? fallbackCategory)

  emit('update:form', {
    ...props.form,
    type: value,
    category: nextCategory,
  })
}

const handleVisibilityChange = (value: boolean) => {
  if (!value) {
    emit('cancel')
  }
}
</script>

<template>
  <Modal :model-value="modelValue" :title="modalTitle" @update:model-value="handleVisibilityChange">
    <form v-if="!isDeleting" class="form" @submit.prevent="emit('submit')">
      <input
        :value="form.title"
        placeholder="Title"
        required
        @input="updateForm('title', ($event.target as HTMLInputElement).value)"
      />

      <input
        :value="form.amount"
        type="number"
        placeholder="Amount"
        required
        @input="updateForm('amount', Number(($event.target as HTMLInputElement).value))"
      />

      <select
        :value="form.type"
        @change="
          handleTypeChange(
            ($event.target as HTMLSelectElement).value as CreateTransactionPayload['type'],
          )
        "
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <select
        :value="form.category"
        @change="
          updateForm('category', ($event.target as HTMLSelectElement).value as TransactionCategory)
        "
      >
        <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </form>

    <div v-else>
      <p>Are you sure you want to delete this transaction?</p>
    </div>

    <template #footer>
      <button class="btn secondary" @click="emit('cancel')">Cancel</button>

      <button v-if="!isDeleting" class="btn primary" @click="emit('submit')">
        {{ submitButtonLabel }}
      </button>

      <button v-else class="btn danger" @click="emit('confirmDelete')">Delete</button>
    </template>
  </Modal>
</template>

<style scoped>
.form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.form input,
.form select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 100%;
}

.btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.primary {
  background: #2563eb;
  color: white;
}

.secondary {
  background: #e5e7eb;
  color: #111827;
}

.danger {
  background: #dc2626;
  color: white;
}

@media (max-width: 600px) {
  .form {
    flex-direction: column;
  }
}
</style>
