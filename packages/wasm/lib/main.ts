import type {
  EventCallback,
  VGGWasmInstance,
  VggSdkType,
  VGGEventType,
  Frame,
} from "./types"
import { EventType, LoadingState, State } from "./constants"
import { EventManager } from "./events"
import { Observable } from "./observable"
import { Logger } from "./logger"
export { EventType, State } from "./constants"
export type { VGGEvent, EventCallback, VGGEventType, Frame } from "./types"

export interface VGGProps {
  canvas: HTMLCanvasElement | OffscreenCanvas
  src: string | Int8Array
  runtime?: string
  editMode?: boolean
  verbose?: boolean
  disableLoader?: boolean
  customFonts?: string[]
  /**
   * On vgg instance load
   */
  onLoad?: EventCallback
  onLoadError?: EventCallback
  /**
   * On Daruma file load
   */
  onReady?: EventCallback
  onStateChange?: EventCallback
  /**
   * On first render
   */
  onRendered?: EventCallback
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

  public state: `${State}` = State.Loading

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
    if (props.onReady) this.on(EventType.Ready, props.onReady)
    if (props.onRendered) this.on(EventType.FirstRender, props.onRendered)
    if (props.onStateChange) this.on(EventType.StateChange, props.onStateChange)
    if (props.onSelect) this.on(EventType.Click, props.onSelect)
  }

  public async load() {
    try {
      this.updateLoader(LoadingState.StartLoading)
      await this.init({ ...this.props })
    } catch (err: any) {
      this.eventManager.fire({ type: "loaderror", data: err.message })
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

    console.log("VGG SDK ready", this.vggSdk)

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
      console.error(err)
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

        // bind the VGG SDK
        this.vggSdk = new wasmInstance.VggSdk()

        // mount the wasmInstance to GlobalThis
        const globalVggInstances = globalThis["vggInstances"] ?? {}
        this.vggInstanceKey = this.vggSdk.getEnv()

        if (this.editMode) {
          // if onClick is defined, add event listener
          Object.assign(globalVggInstances, {
            [this.vggInstanceKey]: {
              instance: wasmInstance,
              listener: (event: any) => {
                try {
                  const parsedEvent = JSON.parse(event)
                  this.logger.logEvent(parsedEvent)

                  if (parsedEvent.type === "select") {
                    this.eventManager.fire({
                      type: EventType.Click,
                      data: parsedEvent,
                    })
                  } else if (parsedEvent.type === "firstRender") {
                    this.state = State.Rendered
                    this.eventManager.fire({ type: EventType.FirstRender })
                  }
                } catch (err) {
                  console.error(err)
                }
              },
            },
          })
        } else {
          Object.assign(globalVggInstances, {
            [this.vggInstanceKey]: {
              instance: wasmInstance,
              listeners: new Map(), // Here we store the client's listeners, which will be mapped to the uniqueId and consumed in wasmInstance.
              listener: (event: any) => {
                try {
                  const parsedEvent = JSON.parse(event)

                  if (parsedEvent.type === "firstRender") {
                    this.state = State.Rendered
                    this.eventManager.fire({ type: EventType.FirstRender })
                  }
                } catch (err) {
                  console.error(err)
                }
              },
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
          this.loadFontFile(data, fontName)
        })
        .catch((err) => {
          console.error(`Failed to add font: ${err.message}`)
        })
    }
  }

  public loadFontFile(font: Uint8Array, name: string) {
    if (!this.vggSdk) {
      throw new Error("VGG SDK not ready")
    }

    if (!this.vggSdk.addFont(font, name)) {
      throw new Error("add font failed!")
    }
  }

  /**
   * Subscribe to VGG-generated events
   * @param type the type of event to subscribe to
   * @param callback callback to fire when the event occurs
   */
  public on(type: VGGEventType, callback: EventCallback): VGG<T> {
    this.eventManager.add({
      type: type,
      callback: callback,
    })

    return this
  }

  /**
   * Render the Daruma file
   * @param darumaSource
   * @param opts
   */
  public async render(
    darumaSource?: string | Int8Array,
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

    const source = darumaSource ?? this.src
    let buffer: Int8Array

    // check if source is a valid url or an Int8Array buffer
    if (typeof source === "string") {
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

    this.eventManager.fire({ type: EventType.Ready }, this.vggSdk)

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
    try {
      this.vggWasmInstance?._vggExit()
    } catch (error) {}

    const globalVggInstances = globalThis["vggInstances"] ?? {}
    delete globalVggInstances[this.vggInstanceKey]

    this.eventManager.removeAll()
    this.vggWasmInstance = null
    this.src = ""
    this.vggSdk = null
    this.state = State.Destroyed

    this.logger.logLifeCycle({
      phase: "destroy",
      status: "end",
    })

    this.observables.clear()

    return this
  }

  public getTextContent() {
    const text = this.vggSdk?.texts()
    return text ?? []
  }

  public snapshot(
    opts: {
      type: "png" | "jpg" | "webp"
      quality: number
    } = {
      type: "png",
      quality: 100,
    }
  ) {
    const snapshot = this.vggSdk?.makeImageSnapshot(opts)
    return snapshot
  }

  public setContentMode(
    mode: "fit" | "fill" | "original" | "autoFill" = "fit"
  ) {
    if (!this.vggSdk) {
      throw new Error("VGG SDK not ready")
    }

    if (mode === "original") {
      this.vggSdk.setContentMode("topLeft")
    } else if (mode === "fit") {
      this.vggSdk.setContentMode("scaleAspectFit")
    } else if (mode === "fill") {
      this.vggSdk.setContentMode("scaleAspectFill")
    } else if (mode === "autoFill") {
      this.vggSdk.setContentMode("scaleAspectFillTopCenter")
    } else {
      throw new Error("Invalid content mode")
    }
  }

  // turn on/off the breakpoint mode
  public setFitToViewportEnabled(bool: boolean) {
    this.vggSdk?.setFitToViewportEnabled(bool)
  }

  public getAllFrames() {
    const frames = this.vggSdk?.getFramesInfo()
    if (frames) {
      return JSON.parse(frames) as Frame[]
    }

    return []
  }

  public setCurrentFrame(id: string, preserveScrollHeight = true) {
    // console.log(
    //   111,
    //   id,
    //   this.vggSdk?.getEnv(),
    //   this.vggSdk?.setCurrentFrameById
    // )
    this.vggSdk?.setCurrentFrameById(id, preserveScrollHeight)
  }

  public nextFrame() {
    const frames = this.getAllFrames()
    const currentFrameIndex = frames.findIndex(
      (frame) => frame.id === this.currentFrameId
    )
    const nextFrameIndex = (currentFrameIndex + 1) % frames.length
    this.setCurrentFrame(frames[nextFrameIndex].id)
  }

  public prevFrame() {
    const frames = this.getAllFrames()
    const currentFrameIndex = frames.findIndex(
      (frame) => frame.id === this.currentFrameId
    )
    const prevFrameIndex =
      (currentFrameIndex - 1 + frames.length) % frames.length
    this.setCurrentFrame(frames[prevFrameIndex].id)
  }

  public get currentFrameId() {
    return this.vggSdk?.currentFrameId()
  }

  public getFontsInUse() {
    const fonts = this.vggSdk?.requiredFonts()

    if (!fonts) return []

    try {
      const _parsedFonts = JSON.parse(fonts)
      return _parsedFonts
    } catch (err) {
      console.error(err)
      return []
    }
  }
}

if (typeof globalThis !== "undefined") {
  // @ts-expect-error
  globalThis.VGG = VGG
}
