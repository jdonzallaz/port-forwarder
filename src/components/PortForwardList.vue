<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { PortForward } from "../types/port-forward.ts";
import { usePortForwardsStore } from "../stores/port-forwards.ts";
import Input from "./Input.vue";
import PortForwardForm from "./PortForwardForm.vue";
import StatusTag from "./StatusTag.vue";

/**
 * The component displaying the list of port-forwards.
 */

const portForwardsStore = usePortForwardsStore();

const selectedPortForward = ref<PortForward | null>(null);

// Currently edited port-forward
const editId = ref<string | null>(null);
const editObject = ref<PortForward | null>(null);

onMounted(() => {
  window.addEventListener("keyup", unselectOnEscape);
});
onUnmounted(() => {
  window.removeEventListener("keyup", unselectOnEscape);
});

function unselectOnEscape(event: KeyboardEvent) {
  if (event.key !== "Escape") {
    return;
  }

  selectedPortForward.value = null;
  event.preventDefault();
}

// Enter edit mode of a port-forward
function edit(portForward: PortForward): void {
  editId.value = portForward.id;
  editObject.value = Object.assign({}, portForward);

  nextTick(() => document.getElementById("firstEditInput")?.focus());
}

// Save a port-forward when in edit mode
function save(): void {
  editId.value = null;
  if (editObject.value !== null) {
    portForwardsStore.save(editObject.value);
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <PortForwardForm @submit="portForwardsStore.add" />

    <div class="my-4 overflow-y-auto">
      <table class="w-full table-auto border border-slate-500 dark:border-stone-700">
        <colgroup>
          <!-- context -->
          <col style="width: 10%" />
          <!-- namespace -->
          <col style="width: 16%" />
          <!-- name -->
          <col style="width: 22%" />
          <!-- local port -->
          <col style="width: 12%" />
          <!-- remote port -->
          <col style="width: 12%" />
          <!-- status -->
          <col style="width: 10%" />
          <!-- actions -->
          <col style="width: 18%" />
        </colgroup>
        <thead>
          <tr class="bg-slate-50 dark:bg-stone-700 text-slate-500 dark:text-stone-300 text-sm">
            <th>Context</th>
            <th>Namespace</th>
            <th>Name</th>
            <th>Local port</th>
            <th>Remote port</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in portForwardsStore.portForwards"
            @click="selectedPortForward = p"
            :class="{
              'hover:bg-slate-100 dark:hover:bg-stone-900 cursor-pointer':
                selectedPortForward?.id !== p.id,
              'bg-slate-100 dark:bg-stone-900': selectedPortForward?.id === p.id,
            }">
            <template v-if="p.id !== editId || editObject === null">
              <td>{{ p.context }}</td>
              <td>{{ p.namespace }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.localPort }}</td>
              <td>{{ p.remotePort }}</td>
            </template>
            <template v-else>
              <td><Input v-model="editObject.context" class="w-full" id="firstEditInput" /></td>
              <td><Input v-model="editObject.namespace" class="w-full" /></td>
              <td><Input v-model="editObject.name" class="w-full" /></td>
              <td><Input v-model="editObject.localPort" class="w-full" /></td>
              <td><Input v-model="editObject.remotePort" class="w-full" /></td>
            </template>
            <td>
              <StatusTag :status="portForwardsStore.portForwardsCommands[p.id]?.status" />
            </td>
            <td @click.stop>
              <template v-if="p.id !== editId">
                <button class="btn-link" v-if="!p.enabled" @click="edit(p)">Edit</button>
                <button class="btn-link" v-if="p.enabled" @click="portForwardsStore.stop(p)">
                  Stop
                </button>
                <button class="btn-link" v-else @click="portForwardsStore.start(p)">Start</button>
              </template>
              <button class="btn-link" v-else @click="save()">Save</button>
              <button class="btn-link" @click="portForwardsStore.remove(p)">Delete</button>
            </td>
          </tr>

          <tr v-if="portForwardsStore.portForwards.length === 0">
            <td colspan="7" class="text-center">No port-forward</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Logs of selected port-forward -->
    <div
      v-if="selectedPortForward"
      class="logs w-full overflow-auto mt-auto p-2 font-mono text-sm bg-slate-100 dark:bg-stone-900">
      <div v-for="log in portForwardsStore.portForwardsCommands[selectedPortForward.id]?.logs">
        {{ log }}
      </div>
      <div
        v-if="portForwardsStore.portForwardsCommands[selectedPortForward.id]?.logs.length === 0"
        class="italic">
        No logs
      </div>
    </div>
  </div>
</template>

<style scoped>
.logs {
  min-height: 100px;
  max-height: 200px;
}

th {
  text-align: left;
}

tr {
  @apply border border-slate-200 dark:border-stone-600;
}

th,
td {
  padding: 0.25rem 0.25rem;
}
</style>
