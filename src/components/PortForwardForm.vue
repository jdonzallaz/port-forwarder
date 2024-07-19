<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { PortForward } from "../types/port-forward.ts";
import { getCurrentKubectlContext, getCurrentKubectlNamespace } from "../utils/commands.ts";
import Input from "./Input.vue";
import ReturnIcon from "./icons/ReturnIcon.vue";

/**
 * An inline form to fill and submit data about a port-forward.
 */

// Port-forward data
const name = ref("");
const localPort = ref("");
const remotePort = ref("");
const context = ref("");
const namespace = ref("");

// Default context and namespace defined in kubectl configuration
const currentContext = ref<string | null>(null);
const currentNamespace = ref<string | null>(null);

const emit = defineEmits<{ (e: "submit", portForward: PortForward): void }>();

onMounted(() => {
  window.addEventListener("keypress", focusOnCtrlSpace);

  // Get current default context and namespace defined in kubectl configuration
  refreshCurrentContext();
  refreshCurrentNamespace();
});

onUnmounted(() => {
  window.removeEventListener("keypress", focusOnCtrlSpace);
});

function focusOnCtrlSpace(event: KeyboardEvent) {
  if (!event.ctrlKey || event.code !== "Space") {
    return;
  }

  document.getElementById("first-input")?.focus();
  event.preventDefault();
}

// Create a port-forward and emit it on enter/button click.
function submit() {
  const portForward: PortForward = {
    id: crypto.randomUUID(),
    context: context.value || currentContext.value,
    namespace: namespace.value || currentNamespace.value,
    name: name.value,
    localPort: localPort.value || remotePort.value,
    remotePort: remotePort.value,
    enabled: true,
  };
  emit("submit", portForward);
}

function refreshCurrentContext() {
  getCurrentKubectlContext().then((context) => (currentContext.value = context));
}

function refreshCurrentNamespace() {
  getCurrentKubectlNamespace().then((namespace) => (currentNamespace.value = namespace));
}
</script>

<template>
  <form @submit.prevent="submit" class="flex gap-x-1">
    <!-- Context -->
    <Input
      :placeholder="'Context' + (currentContext ? ` (${currentContext})` : '')"
      v-model="context"
      id="first-input"
      @focus="refreshCurrentContext" />

    <!-- Namespace -->
    <Input
      :placeholder="'Namespace' + (currentNamespace ? ` (${currentNamespace})` : '')"
      v-model="namespace"
      pattern="^[a-z0-9]([\-a-z0-9]*[a-z0-9])?$"
      maxlength="253"
      @focus="refreshCurrentNamespace" />

    <!-- Name -->
    <Input
      placeholder="Name*"
      v-model="name"
      required
      pattern="^([a-z]+\/)?[a-z0-9]([\-a-z0-9]{0,61}[a-z0-9])?$" />

    <!-- Local port -->
    <Input
      type="number"
      min="1000"
      max="99999"
      step="1"
      :placeholder="remotePort || 'Local port'"
      v-model="localPort" />

    <!-- Remote port -->
    <Input
      type="number"
      min="1000"
      max="99999"
      step="1"
      placeholder="Remote port*"
      v-model="remotePort"
      required />

    <!-- Submit button -->
    <button type="submit" class="btn">
      <ReturnIcon />
    </button>
  </form>
</template>

<style scoped></style>
