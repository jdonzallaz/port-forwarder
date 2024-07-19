import { Child } from "@tauri-apps/api/shell";

export type PortForward = {
  id: string;
  context?: string | null;
  namespace?: string | null;
  name: string;
  localPort?: string | null;
  remotePort: string;
  enabled: boolean;
};

export type PortForwardsStatus = "active" | "disabled" | "failed";

export type PortForwardCommand = {
  process: Child | null;
  logs: string[];
  status: PortForwardsStatus;
};
