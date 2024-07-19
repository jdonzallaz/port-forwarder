<script setup lang="ts">
import PortForwardList from "./components/PortForwardList.vue";
import { executeKubectlCommand } from "./utils/commands.ts";
import { onMounted, ref } from "vue";

const kubectlFound = ref(false);
const loading = ref(true);

onMounted(() => {
  // Check if `kubectl` CLI is available, or show an error
  executeKubectlCommand(["version"])
    .then(() => (kubectlFound.value = true))
    .finally(() => (loading.value = false));
});
</script>

<template>
  <div class="p-4 h-screen">
    <div v-if="loading">Loading...</div>
    <PortForwardList v-else-if="kubectlFound" />
    <div v-else><code>kubectl</code> CLI not found.</div>
  </div>
</template>

<style scoped></style>
