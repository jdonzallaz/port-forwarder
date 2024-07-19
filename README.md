# Port-forwarder

Port-forwarder is a simple GUI app designed to replace the `kubectl port-forward` command. It provides a user-friendly
interface to manage your port-forward connections efficiently, and automatically reconnects when the connection is lost.

Built using [Tauri](https://tauri.app/).

## Getting started

Make sure `kubectl` and Node.js are installed and configured.

```sh
npm i
npm run tauri build
```

## Development

```sh
npm run tauri dev
```
