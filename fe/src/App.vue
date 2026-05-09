<script setup lang="ts">
import PopUp from '@/components/popUp.vue'
import { useToast } from '@/utils/toast'

const { toast, hideToast } = useToast()
</script>

<template>
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
