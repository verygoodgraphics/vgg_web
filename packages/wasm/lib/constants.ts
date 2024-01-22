/**
 * Supported event types triggered in VGG
 */
export enum EventType {
  Load = "load",
  LoadError = "loaderror",
  StateChange = "statechange",
  Click = "click",
}

export enum State {
  Loading = "loading",
  Ready = "ready",
  Error = "error",
}

export enum LoadingState {
  StartLoading = "Start loading",
  DownloadVGGRuntimeJS = "Download VGG Runtime JS",
  CreateVGGWasmInstance = "Create VGG Wasm Instance",
  VGGWasmInstanceReady = "VGG Wasm Instance Ready",
  DownloadSourceFile = "Download Source File",
  LoadSourceFile = "Load Source File",
}
