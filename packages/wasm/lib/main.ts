import { EventCallback, VGGWasmInstance, VggSdkType } from "./types"
import { EventType, LoadingState, State } from "./constants"
import { EventManager } from "./events"
import { Observable } from "./observable"
import { Logger } from "./logger"
export { EventType, State } from "./constants"
export type { VGGEvent } from "./types"

export interface VGGProps {
  canvas: HTMLCanvasElement | OffscreenCanvas
  src: string | Int8Array
  runtime?: string
  editMode?: boolean
  verbose?: boolean
  disableLoader?: boolean
  customFonts?: string[]
  onLoad?: EventCallback
  onLoadError?: EventCallback
  onStateChange?: EventCallback
  onSelect?: EventCallback
  onLoadingStateUpdate?: (state: LoadingState) => void
}

export type VGGNode = {
  id: string
  path: string
}

// Canvas renderer
export class VGG<T extends string> {
  readonly props: VGGProps

  private defaultRuntime: string = "https://s5.vgg.cool/runtime/latest"

  // Canvas for rendering
  private readonly canvas: HTMLCanvasElement | OffscreenCanvas

  private width: number = 0
  private height: number = 0
  private editMode: boolean = false

  private disableLoader = false

  // Verbose logging
  private verbose: boolean

  // A url to a Daruma file
  private src: string | Int8Array

  // The Wasm runtime
  private runtime: string

  // Key to store the wasm instance in globalThis
  public vggInstanceKey: string = ""

  // Holds event listeners
  private eventManager: EventManager

  public state: State = State.Loading

  private onLoadingStateUpdate: (state: LoadingState) => void

  // The VGG Wasm instance
  private vggWasmInstance: VGGWasmInstance | null = null

  // The VGG SDK
  private vggSdk: VggSdkType | null = null

  // Error message for missing source
  private static readonly missingErrorMessage: string =
    "Daruma source file required"

  private customFonts: string[] = []

  private observables: Map<string, Observable> = new Map()

  private checkStateFrame: number = 0

  private logger: Logger

  constructor(props: VGGProps) {
    this.props = props
    this.canvas = props.canvas
    this.src = props.src
    this.runtime = props.runtime || this.defaultRuntime
    this.width = this.canvas?.width ?? 0
    this.height = this.canvas?.height ?? 0
    this.customFonts = props.customFonts ?? []
    this.editMode = props.editMode ?? false
    this.verbose = props.verbose ?? false
    this.logger = new Logger(this.verbose)
    this.disableLoader = props.disableLoader ?? false
    this.onLoadingStateUpdate = props.onLoadingStateUpdate ?? (() => {})

    // New event management system
    this.eventManager = new EventManager()
    if (props.onLoad) this.on(EventType.Load, props.onLoad)
    if (props.onLoadError) this.on(EventType.LoadError, props.onLoadError)
    if (props.onStateChange) this.on(EventType.StateChange, props.onStateChange)
    if (props.onSelect) this.on(EventType.Click, props.onSelect)
  }

  public async load() {
    try {
      this.updateLoader(LoadingState.StartLoading)
      await this.init({ ...this.props })
    } catch (err: any) {
      this.eventManager.fire({ type: EventType.LoadError, data: err.message })
    }
  }

  private updateLoader(text: LoadingState) {
    if (this.disableLoader) return
    this.onLoadingStateUpdate?.(text)
  }

  private async init({ src }: VGGProps) {
    this.updateLoader(LoadingState.DownloadVGGRuntimeJS)

    this.src = src

    {
      // check if the vgg_runtime.js is already loaded
      const isRuntimeScriptExist = Array.from(document.scripts).some((script) =>
        script.src.includes("vgg_runtime.js")
      )

      if (!isRuntimeScriptExist) {
        // load vgg_runtime.js
        await this.loadScript(this.runtime + "/vgg_runtime.js")
      }

      // check if the vgg_runtime.js is already loaded
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (window._vgg_createWasmInstance) {
            clearInterval(interval)
            resolve(true)
          }
        }, 100)
      })
    }

    // check if canvas is a valid element
    if (!this.canvas) {
      throw new Error("Canvas element required")
    }

    if (!this.src) {
      throw new Error(VGG.missingErrorMessage)
    }

    await new Promise((resolve) => {
      this.checkStateFrame = requestAnimationFrame(() =>
        this.checkState(resolve)
      )
    })

    // load fonts
    await this.loadFonts()

    this.logger.logLifeCycle({
      phase: "init",
      status: "end",
    })
  }

  /**
   * Create the VGG Wasm instance
   * @returns VGGWasmInstance
   */
  private async createVggWasmInstance(): Promise<VGGWasmInstance | null> {
    const runtime = this.runtime
    try {
      const timer = setTimeout(() => {
        throw new Error("VGG Wasm instance creation timeout")
      }, 1000 * 30)

      const instance = await window._vgg_createWasmInstance({
        noInitialRun: true,
        canvas: this.canvas,
        locateFile: function (path: string, prefix: string) {
          if (path.endsWith(".data")) {
            return runtime + "/" + path
          }
          return prefix + path
        },
      })

      clearTimeout(timer)
      return instance
    } catch (err) {
      // console.error(err)
      return null
    }
  }

  /**
   * Check if the wasm instance is ready
   * @param resolve
   */
  private async checkState(resolve: (value: unknown) => void) {
    this.updateLoader(LoadingState.CreateVGGWasmInstance)

    if (window._vgg_createWasmInstance) {
      const wasmInstance = await this.createVggWasmInstance()

      if (wasmInstance) {
        this.vggWasmInstance = wasmInstance

        try {
          // TODO: caused unwind error when calling emscripten_main
          this.vggWasmInstance.ccall(
            "emscripten_main",
            "void",
            ["number", "number", "boolean"],
            [this.width, this.height, this.editMode]
          )
        } catch (err) {
          console.error(err)
        }

        // Bind the VGG SDK
        this.vggSdk = new wasmInstance.VggSdk()

        // Mount the wasmInstance to GlobalThis
        const globalVggInstances = globalThis["vggInstances"] ?? {}
        this.vggInstanceKey = this.vggSdk.getEnv()

        if (this.editMode) {
          // if onClick is defined, add event listener
          Object.assign(globalVggInstances, {
            [this.vggInstanceKey]: {
              instance: wasmInstance,
              listener: (event: any) => {
                const parsedEvent = JSON.parse(event)
                this.logger.logEvent(parsedEvent)

                if (parsedEvent.type === "select") {
                  this.eventManager.fire({
                    type: EventType.Click,
                    data: parsedEvent,
                  })
                }
              },
            },
          })
        } else {
          Object.assign(globalVggInstances, {
            [this.vggInstanceKey]: {
              instance: wasmInstance,
              listeners: new Map(), // Here we store the client's listeners, which will be mapped to the uniqueId and consumed in wasmInstance.
            },
          })
        }

        globalThis["vggInstances"] = globalVggInstances

        this.state = State.Ready
        this.eventManager.fire({ type: EventType.Load })
      } else {
        this.state = State.Error
        this.eventManager.fire({ type: EventType.LoadError })
      }

      // clear requestAnimationFrame
      cancelAnimationFrame(this.checkStateFrame)
      resolve(true)

      this.updateLoader(LoadingState.VGGWasmInstanceReady)
    } else {
      this.checkStateFrame = requestAnimationFrame(() =>
        this.checkState(resolve)
      )
    }
  }

  private async loadScript(src: string) {
    const script = document.createElement("script")
    script.src = src
    document.head.appendChild(script)

    return new Promise((resolve) => {
      script.onload = () => {
        resolve(true)
      }
    })
  }

  private async loadFonts() {
    const fonts = this.customFonts
    for (const font of fonts) {
      await fetch(font)
        .then((res) => {
          if (res.ok) {
            return res.arrayBuffer()
          }
          throw new Error(res.statusText)
        })
        .then((buf) => {
          const data = new Uint8Array(buf)
          const fontName = font.split("/").pop()?.split(".")[0] ?? ""
          if (!this.vggSdk?.addFont(data, fontName)) {
            throw new Error("add font failed!")
          }
        })
        .catch((err) => {
          console.error(`Failed to add font: ${err.message}`)
        })
    }
  }

  /**
   * Subscribe to VGG-generated events
   * @param type the type of event to subscribe to
   * @param callback callback to fire when the event occurs
   */
  public on(type: EventType, callback: EventCallback): VGG<T> {
    this.eventManager.add({
      type: type,
      callback: callback,
    })

    return this
  }

  /**
   * Render the Daruma file
   * @param darumaUrl
   * @param opts
   */
  public async render(
    darumaUrl?: string,
    opts?: {
      width: number
      height: number
      editMode?: boolean
    }
  ): Promise<void> {
    this.width = opts?.width ?? this.width
    this.height = opts?.height ?? this.height
    this.editMode = opts?.editMode ?? this.editMode

    if (!this.vggWasmInstance) {
      throw new Error("VGG Wasm instance not ready")
    }

    const source = darumaUrl ?? this.src
    let buffer: Int8Array

    // check if source is a valid url or an Int8Array buffer
    if (typeof source === "string" && source.startsWith("http")) {
      this.updateLoader(LoadingState.DownloadSourceFile)
      const res = await fetch(source)
      if (!res.ok) throw new Error("Failed to fetch Daruma file")
      const arrayBuffer = await res.arrayBuffer()
      buffer = new Int8Array(arrayBuffer)
    } else if (source instanceof Int8Array) {
      buffer = source
    } else {
      throw new Error("Invalid source file")
    }

    this.updateLoader(LoadingState.LoadSourceFile)

    if (!this.vggWasmInstance) {
      // this might happen when the user destroys the VGG instance before calling render
      return
    }

    // load the daruma file
    const isLoaded = this.vggWasmInstance.ccall(
      "load_file_from_mem",
      "boolean", // return type
      ["string", "array", "number"], // argument types
      ["name", buffer, buffer.length]
    )

    if (!isLoaded) {
      throw new Error("Failed to load Daruma file")
    }
  }

  public $(selector: T): Observable {
    if (!this.vggSdk) {
      throw new Error("VGG SDK not ready")
    }

    const isExist = this.observables.get(selector)

    if (!isExist) {
      const newObservable = new Observable(String(selector), this.vggSdk)
      this.observables.set(selector, newObservable)
      return newObservable
    }

    return isExist
  }

  public destroy() {
    const globalVggInstances = globalThis["vggInstances"] ?? {}
    delete globalVggInstances[this.vggInstanceKey]
    this.eventManager.removeAll()
    this.vggWasmInstance = null
  }
}

if (typeof globalThis !== "undefined") {
  // @ts-expect-error
  globalThis.VGG = VGG
}
