<script setup lang="ts">
import { InputTypeHTMLAttribute } from "vue";

/**
 * A simple input with default styling.
 */

withDefaults(defineProps<{ type?: InputTypeHTMLAttribute; placeholder?: string }>(), {
  type: "text",
});

const model = defineModel();
</script>

<template>
  <input
    :type="type"
    :placeholder="placeholder"
    class="px-1 outline-0 min-w-0 max-w-none basis-full border border-gray-200 hover:border-gray-300 focus:border-green-600 dark:border-stone-700 dark:bg-stone-900 dark:focus:border-green-800"
    v-model="model" />
</template>

<style scoped></style>
