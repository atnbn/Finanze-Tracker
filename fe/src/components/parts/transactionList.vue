<script lang="ts" setup>
import type { Transaction } from '../services/transactionService'
import { formatCurrencyAmount } from '@/utils/appPreferences'

defineProps<{
  transactions: Transaction[]
  edit: boolean
}>()

const emit = defineEmits<{
  edit: [transaction: Transaction]
  delete: [id: number]
}>()
</script>

<template>
  <ul class="list">
    <li v-for="transaction in transactions" :key="transaction.id">
      <div class="info">
        <p class="title">{{ transaction.title }}</p>
        <p class="type">{{ transaction.type }}</p>
      </div>

      <div class="right">
        <span :class="['amount', transaction.type]">
          {{ transaction.type === 'income' ? '+' : '-' }}
          {{ formatCurrencyAmount(Number(transaction.amount)) }}
        </span>

        <div v-if="edit" class="actions">
          <button @click="() => emit('edit', transaction)">✏️</button>
          <button @click="() => emit('delete', transaction.id)">🗑</button>
        </div>
      </div>
    </li>
  </ul>

  <p v-if="transactions.length === 0" class="empty-state">No transactions yet.</p>
</template>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.list li {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.type {
  font-size: 12px;
  color: var(--text-muted);
}

/* RIGHT SIDE */
.right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.amount {
  font-weight: 600;
}

.income {
  color: var(--income-color);
}

.expense {
  color: var(--expense-color);
}

/* INFO */
.title {
  font-weight: 600;
  color: var(--heading-color);
}

.empty-state {
  margin-top: 12px;
  color: var(--text-muted);
}

@media (max-width: 600px) {
  .list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .right {
    width: 100%;
    justify-content: space-between;
  }
}
.actions {
  display: flex;
  gap: 10px;
}
.actions button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: var(--app-text);
}
</style>
