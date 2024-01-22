import { EventType } from "./constants"
import { VGGEventListener, VGGEvent } from "./types"

// Manages VGG events and listeners
export class EventManager {
  constructor(private listeners: VGGEventListener[] = []) {}

  // Gets listeners of specified type
  private getListeners(type: EventType): VGGEventListener[] {
    return this.listeners.filter((e) => e.type === type)
  }

  // Adds a listener
  public add(listener: VGGEventListener): void {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener)
    }
  }

  /**
   * Removes a listener
   * @param listener the listener with the callback to be removed
   */
  public remove(listener: VGGEventListener): void {
    // We can't simply look for the listener as it'll be a different instance to
    // one originally subscribed. Find all the listeners of the right type and
    // then check their callbacks which should match.
    for (let i = 0; i < this.listeners.length; i++) {
      const currentListener = this.listeners[i]
      if (currentListener.type === listener.type) {
        if (currentListener.callback === listener.callback) {
          this.listeners.splice(i, 1)
          break
        }
      }
    }
  }

  /**
   * Clears all listeners of specified type, or every listener if no type is
   * specified
   * @param type the type of listeners to clear, or all listeners if not
   * specified
   */
  public removeAll(type?: EventType) {
    if (!type) {
      this.listeners.splice(0, this.listeners.length)
    } else {
      this.listeners
        .filter((l) => l.type === type)
        .forEach((l) => this.remove(l))
    }
  }

  // Fires an event
  public fire(event: VGGEvent, opts?: any): void {
    const eventListeners = this.getListeners(event.type)
    eventListeners.forEach((listener) => listener.callback(event, opts))
  }
}
