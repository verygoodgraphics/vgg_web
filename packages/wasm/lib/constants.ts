/**
 * Supported event types triggered in VGG
 */
export enum EventType {
  Load = "load",
  FirstRender = "firstrender",
  LoadError = "loaderror",
  StateChange = "statechange",
  Click = "click",
  Ready = "ready",
}

export enum State {
  Loading = "loading",
  Ready = "ready",
  Rendered = "rendered",
  Error = "error",
  Destroyed = "destroyed",
}

export enum LoadingState {
  StartLoading = "Start loading",
  DownloadVGGRuntimeJS = "Download VGG Runtime JS",
  CreateVGGWasmInstance = "Create VGG Wasm Instance",
  VGGWasmInstanceReady = "VGG Wasm Instance Ready",
  DownloadSourceFile = "Download Source File",
  LoadSourceFile = "Load Source File",
}
