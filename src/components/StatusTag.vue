<script setup lang="ts">
import { PortForwardsStatus } from "../types/port-forward.ts";

/**
 * A tag to display port-forward status.
 */

defineProps<{ status: PortForwardsStatus }>();
</script>

<template>
  <span
    v-if="status === 'active'"
    class="bg-green-200 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
    >Active</span
  >
  <span
    v-if="status === 'disabled'"
    class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-stone-700 dark:text-stone-300"
    >Disabled</span
  >
  <span
    v-if="status === 'failed'"
    class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300"
    >Failed</span
  >
</template>

<style scoped></style>
