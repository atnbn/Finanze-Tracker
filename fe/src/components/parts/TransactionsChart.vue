<template>
  <div class="card large">
    <h3>Spending Overview</h3>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Transaction } from '../services/transactionService'
import { formatCurrencyAmount, preferredCurrency } from '@/utils/appPreferences'

const props = defineProps<{
  transactions: Transaction[]
}>()

Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let transactionsChart: Chart<'bar'> | null = null
let themeObserver: MutationObserver | null = null

const getThemeValue = (variableName: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
  return value || fallback
}

const renderTransactionsChart = () => {
  const canvas = chartCanvas.value

  if (!canvas) {
    return
  }

  const recentTransactions = [...props.transactions].slice(0, 6).reverse()
  const labels = recentTransactions.map((transaction) => transaction.title)
  const data = recentTransactions.map((transaction) => Number(transaction.amount))
  const incomeColor = getThemeValue('--income-color', '#16a34a')
  const expenseColor = getThemeValue('--expense-color', '#dc2626')
  const gridColor = getThemeValue('--chart-grid-color', 'rgba(148, 163, 184, 0.25)')
  const textColor = getThemeValue('--text-muted', '#475569')
  const headingColor = getThemeValue('--heading-color', '#0f172a')
  const backgroundColor = recentTransactions.map((transaction) =>
    transaction.type === 'income' ? `${incomeColor}bf` : `${expenseColor}bf`,
  )
  const borderColor = recentTransactions.map((transaction) =>
    transaction.type === 'income' ? incomeColor : expenseColor,
  )

  transactionsChart?.destroy()

  transactionsChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Amount',
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: headingColor,
          titleColor: getThemeValue('--surface-1', '#ffffff'),
          bodyColor: getThemeValue('--surface-1', '#ffffff'),
          callbacks: {
            label: (context) => formatCurrencyAmount(Number(context.parsed.y)),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
            callback: (value) => formatCurrencyAmount(Number(value)),
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
          },
        },
      },
    },
  })
}

onMounted(() => {
  renderTransactionsChart()

  if (typeof window !== 'undefined') {
    themeObserver = new MutationObserver(() => {
      renderTransactionsChart()
    })

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
  }
})

watch([() => props.transactions, preferredCurrency], renderTransactionsChart, { deep: true })

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  transactionsChart?.destroy()
})
</script>

<style scoped>
.card {
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 10px 30px var(--shadow-color);
}

.card h3 {
  color: var(--heading-color);
}

.large {
  min-height: 300px;
}

.chart-wrapper {
  position: relative;
  height: 260px;
  margin-top: 15px;
  border-radius: 10px;
  background: var(--surface-2);
  padding: 12px;
}
</style>
