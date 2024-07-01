import { EventType } from "./constants"
import { Observable } from "./observable"

export type CallbackHandlers = {
  get: (selector: string) => any
  set: (selector: string, value: any) => any
}

export type VGGEventCallback = (
  element: Observable,
  handlers: CallbackHandlers
) => Promise<void>

export type EventCallback = (
  event: VGGEvent,
  handlers?: CallbackHandlers
) => Promise<void>

export type CurriedCallback = (handlers: CallbackHandlers) => Promise<void>

export type VGGEventType = `${EventType}`

/**
 * Event listeners registered with the event manager
 */
export interface VGGEventListener {
  type: VGGEventType
  callback: EventCallback
}

export interface VGGEvent {
  type: VGGEventType
  data?: string | string[] | number
}

export interface VGGWasmInstance {
  ccall: (
    ident: string,
    returnType: string,
    argTypes: string[],
    args: any[]
  ) => any
  VggSdk: {
    new (): VggSdkType
  }
  _vggExit: () => void
}

/**
 * Dependency Injector Container
 */
export interface DIContainer {
  vggSetObject(key: string, value: object): void
  vggGetObject(key: string): object | undefined
}

type NativeEventType =
  | "keydown"
  | "keyup"
  | "auxclick"
  | "click"
  | "contextmenu"
  | "dblclick"
  | "mousedown"
  | "mouseenter"
  | "mouseleave"
  | "mousemove"
  | "mouseout"
  | "mouseover"
  | "mouseup"
  | "touchcancel"
  | "touchend"
  | "touchmove"
  | "touchstart"
type EventListenerItem = {
  type: NativeEventType
  listener: string
}
interface EventListeners {
  EventType?: Array<EventListenerItem>
}

export type Frame = {
  id: string
  name: string
  width: number
  height: number
}

export interface VggSdkType {
  // addObserver(observer: VggSdkObserver): void;
  listeners: Map<string, CurriedCallback>

  getEnv(): string
  getDesignDocument(): string

  addEventListener(path: string, type: string, code: string): void
  removeEventListener(path: string, type: string, code: string): void
  getEventListeners(path: string): EventListeners

  getElement(id: string): string
  updateElement(id: string, value: string): void

  addFont(font: Uint8Array, name: string): boolean

  texts(): string[]

  makeImageSnapshot(opts: {
    type: "png" | "jpg" | "webp"
    quality: number // 0 - 100
  }): Uint8Array

  getFramesInfo(): string
  setCurrentFrameById(frameName: string, preserveScrollHeight: boolean): void
  currentFrameId(): string

  requiredFonts(): string

  setFitToViewportEnabled(enabled: boolean): void
  setContentMode(
    mode:
      | "topLeft"
      | "scaleAspectFill"
      | "scaleAspectFit"
      | "scaleAspectFillTopCenter"
  ): void
}

declare global {
  interface Window {
    _vgg_createWasmInstance: any
  }
  var vggInstances: Record<string, VggSdkType>
}
