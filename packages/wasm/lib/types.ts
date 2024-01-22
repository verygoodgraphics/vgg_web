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
  handlers: CallbackHandlers
) => Promise<void>

export type CurriedCallback = (handlers: CallbackHandlers) => Promise<void>

/**
 * Event listeners registered with the event manager
 */
export interface VGGEventListener {
  type: EventType
  callback: EventCallback
}

export interface VGGEvent {
  type: EventType
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

export interface VggSdkType {
  // addObserver(observer: VggSdkObserver): void;
  listeners: Map<string, CurriedCallback>

  getEnv(): string
  getDesignDocument(): string

  addAt(path: string, value: string): void
  deleteAt(path: string): void
  updateAt(path: string, value: string): void

  addEventListener(path: string, type: string, code: string): void
  removeEventListener(path: string, type: string, code: string): void
  getEventListeners(path: string): EventListeners

  getElement(id: string): string
  updateElement(id: string, value: string): void
}

declare global {
  interface Window {
    _vgg_createWasmInstance: any
  }
  var vggInstances: Record<string, VggSdkType>
}
