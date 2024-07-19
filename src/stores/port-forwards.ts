import { Child } from "@tauri-apps/api/shell";
import { ref, watch } from "vue";
import { acceptHMRUpdate, defineStore } from "pinia";
import { PortForward, PortForwardCommand, PortForwardsStatus } from "../types/port-forward.ts";
import { readPortForwards, runPortForward, savePortForwards } from "../services/port-forward.ts";

// Store to manage port-forwards state
export const usePortForwardsStore = defineStore("port-forwards", () => {
  // List of existing port-forwards
  const portForwards = ref<PortForward[]>([]);

  // ID->command of existing port-forwards - manages status, logs and process reference
  const portForwardsCommands = ref<{ [key: string]: PortForwardCommand }>({});

  // Save all created subprocess to clean them correctly on app close
  const processes = ref<Child[]>([]);

  // Save config to filesystem when the store is modified
  watch(
    () => portForwards.value,
    (newValue) => savePortForwards(newValue),
    { deep: true },
  );

  // Create port-forwards in store on app start
  readPortForwards().then((value) => {
    portForwards.value = value;
    portForwards.value.forEach((p) => {
      portForwardsCommands.value[p.id] = { process: null, logs: [], status: "disabled" };
      if (p.enabled) {
        void start(p);
      }
    });
  });

  // Create a new port-forward
  async function add(portForward: PortForward): Promise<void> {
    portForwards.value.push(portForward);

    portForwardsCommands.value[portForward.id] = { process: null, logs: [], status: "disabled" };
    void start(portForward);
  }

  // Update a port-forward with new values
  function save(portForward: PortForward): void {
    const portForwardEntry = portForwards.value.find((p) => p.id === portForward.id);
    if (portForwardEntry) {
      Object.assign(portForwardEntry, portForward);
    }
  }

  // Stop and delete a port-forward
  function remove(portForward: PortForward): void {
    stop(portForward);
    portForwards.value = portForwards.value.filter((p) => p.id !== portForward.id);
    delete portForwardsCommands.value[portForward.id];
  }

  // Start the process of a port-forward
  async function start(portForward: PortForward) {
    const portForwardEntry = portForwards.value.find((p) => p.id === portForward.id);
    if (portForwardEntry && portForwardsCommands.value[portForward.id].process === null) {
      portForwardEntry.enabled = true;
      runPortForward(portForward);
    }
  }

  // Stop the process of a port-forward
  function stop(portForward: PortForward): void {
    const portForwardEntry = portForwards.value.find((p) => p.id === portForward.id);
    if (portForwardEntry && portForwardEntry.enabled) {
      portForwardEntry.enabled = false;
      const process = portForwardsCommands.value[portForward.id].process;
      if (process) {
        void process.kill();
        processes.value = processes.value.filter(({ pid }) => pid !== process.pid);
      }
      portForwardsCommands.value[portForward.id].process = null;
      portForwardsCommands.value[portForward.id].logs = [];
      setStatus(portForward.id, "disabled");
    }
  }

  // Save the reference of a subprocess
  function setProcess(id: string, process: Child): void {
    portForwardsCommands.value[id].process = process;
    processes.value.push(process);
  }

  // Set the status of a port-forward to "failed"
  function setFailed(id: string): void {
    const portForwardEntry = portForwards.value.find((p) => p.id === id);
    if (portForwardEntry) {
      portForwardEntry.enabled = false;
    }
    portForwardsCommands.value[id].process = null;
    portForwardsCommands.value[id].status = "failed";
  }

  // Add a new log entry to a port-forward
  function addLog(id: string, log: string): void {
    portForwardsCommands.value[id].logs.push(log);
  }

  // Change the status of a port-forward
  function setStatus(id: string, newStatus: PortForwardsStatus): void {
    portForwardsCommands.value[id].status = newStatus;
  }

  return {
    portForwards,
    portForwardsCommands,
    processes,
    add,
    remove,
    save,
    start,
    stop,
    setProcess,
    setFailed,
    addLog,
    setStatus,
  };
});

// Add hot reload for store in development
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePortForwardsStore, import.meta.hot));
}
