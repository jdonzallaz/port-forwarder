import { ChildProcess, Command } from "@tauri-apps/api/shell";

// Execute a kubectl command with the given arguments
export function executeKubectlCommand(args: string[]): Promise<ChildProcess> {
  const command = new Command("kubectl", args);

  return command.execute();
}

// Get current default context used by kubectl
export async function getCurrentKubectlContext(): Promise<string | null> {
  const process = await executeKubectlCommand(["config", "current-context"]);

  if (process.code === 0) {
    return process.stdout.trim();
  }

  return null;
}

// Get current default namespace used by kubectl
export async function getCurrentKubectlNamespace(): Promise<string | null> {
  const process = await executeKubectlCommand([
    "config",
    "view",
    "--minify",
    "-o",
    "jsonpath='{..namespace}'",
  ]);

  if (process.code === 0) {
    return process.stdout.trim().replace(/["']/g, "");
  }

  return null;
}
