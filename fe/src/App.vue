<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PopUp from '@/components/popUp.vue'
import { useLoadingIndicator } from '@/composables/useLoadingIndicator'
import { useToast } from '@/utils/toast'

const { toast, hideToast } = useToast()
const { isLoading } = useLoadingIndicator()
</script>

<template>
  <LoadingSpinner v-if="isLoading" overlay label="Loading..." />
  <PopUp
    v-if="toast"
    :key="toast.id"
    :type="toast.type"
    :title="toast.title"
    :message="toast.message"
    @close="hideToast"
  />
  <RouterView />
</template>

<style scoped></style>
