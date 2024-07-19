import { emit, Event, listen } from "@tauri-apps/api/event";
import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir } from "@tauri-apps/api/path";
import { Child, Command } from "@tauri-apps/api/shell";
import { PortForward } from "../types/port-forward.ts";
import { usePortForwardsStore } from "../stores/port-forwards.ts";

const PORT_FORWARDS_FILE = "port-forwards.json";

// Save the port-forwards config to filesystem
export async function savePortForwards(portForwards: PortForward[]): Promise<void> {
  // Find and create user application directory
  const appDir = await appDataDir();
  if (!(await exists(appDir))) {
    await createDir(appDir);
  }

  const data = JSON.stringify(portForwards);

  await writeTextFile(PORT_FORWARDS_FILE, data, { dir: BaseDirectory.AppData });
}

// Retrieve existing port-forwards config from filesystem
export async function readPortForwards(): Promise<PortForward[]> {
  if (!(await exists(PORT_FORWARDS_FILE, { dir: BaseDirectory.AppData }))) {
    return [];
  }
  return JSON.parse(await readTextFile(PORT_FORWARDS_FILE, { dir: BaseDirectory.AppData }));
}

// Start and observe the process of a port-forward
async function _runPortForward(portForward: PortForward): Promise<Child> {
  const store = usePortForwardsStore();

  // Set kubectl port-forward command arguments
  const port = portForward.localPort
    ? `${portForward.localPort}:${portForward.remotePort}`
    : portForward.remotePort.toString();
  const args = ["port-forward", portForward.name, port];

  if (portForward.context) {
    args.push(`--context=${portForward.context}`);
  }

  if (portForward.namespace) {
    args.push(`--namespace=${portForward.namespace}`);
  }

  const command = new Command("kubectl", args);

  // Save the last log to determine the cause of failed processes
  let lastLog = "";

  // Attach event listeners
  command.on("close", (data) => {
    const currentPortForward = store.portForwards.find((p) => p.id === portForward.id);
    // We analyze closed process only in case of error
    if (currentPortForward && currentPortForward.enabled && data.code === 1) {
      // When process is closed, we restart it if the cause is a lost connection
      if (lastLog.trim().toLowerCase().includes("lost connection to pod")) {
        emit("runPortForward", currentPortForward);
      } else {
        store.setFailed(portForward.id);
      }
    }
  });
  command.on("error", () => {
    store.setFailed(portForward.id);
  });
  command.stdout.on("data", (line) => {
    lastLog = line;
    store.addLog(portForward.id, line);
  });
  command.stderr.on("data", (line) => {
    lastLog = line;
    store.addLog(portForward.id, line);
  });

  // Start the process, save the reference and set the new status
  const child = await command.spawn();
  store.setProcess(portForward.id, child);
  store.setStatus(portForward.id, "active");

  return child;
}

// Init listening to events to start port-forward
export async function initRunPortForward() {
  await listen("runPortForward", (event: Event<PortForward>) => _runPortForward(event.payload));
}

// Start a port-forward process by emitting the event
export function runPortForward(portForward: PortForward) {
  emit("runPortForward", portForward);
}
