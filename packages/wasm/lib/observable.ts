import { EventType } from "./constants"
import { VggSdkType, CallbackHandlers, VGGEventCallback } from "./types"
import { nanoid } from "./util"

export class Observable {
  private selector: string
  private vggSdk: VggSdkType

  constructor(selector: string, vggSdk: VggSdkType) {
    this.selector = selector
    this.vggSdk = vggSdk
  }

  public on(eventType: EventType, callback: VGGEventCallback): Observable {
    this.addEventListener(this.selector, eventType, callback)

    return this
  }

  public update(data: string) {
    if (!this.vggSdk) {
      throw new Error("VGG SDK not ready")
    }
    this.vggSdk.updateElement(this.selector, data)
  }

  private addEventListener(
    id: string,
    type: string,
    callback: VGGEventCallback
  ) {
    if (!this.vggSdk) {
      throw new Error("VGG SDK not ready")
    }
    const curriedCallback = (handlers: CallbackHandlers) => {
      return callback(this, handlers)
    }
    const uniqueId = nanoid(7)
    const code = `export default (event, opts) => {
      const sdk = new opts.instance.VggSdk()

      const get = (selector) => {
        const element = sdk.getElement(selector)
        try {
          const parsedElement = JSON.parse(element)
          return parsedElement
        } catch (err) {
          return element
        }
      }
      
      const set = (selector, data) => {
        const dataString = JSON.stringify(data)
        sdk.updateElement(selector, dataString)
      }

      const listenersMapInGlobal = globalThis["vggInstances"][sdk.getEnv()].listeners
      const clientCallback = listenersMapInGlobal.get("${uniqueId}")

      if (clientCallback) {
        clientCallback({ get, set })
      }
    }`

    this.vggSdk.addEventListener(id, type, code)

    const currentInstance = globalThis["vggInstances"][this.vggSdk.getEnv()]
    if (currentInstance) {
      // Set the callback to the listenersMap in current instance
      currentInstance.listeners.set(uniqueId, curriedCallback)
    }

    return {
      selector: id,
      removeEventListener: () => {
        this.vggSdk.removeEventListener(id, type, code)
        currentInstance.listeners.delete(uniqueId)
      },
    }
  }
}
