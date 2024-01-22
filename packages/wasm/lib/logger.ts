enum Colors {
  Red = "#EB0013",
  Green = "#1BA353",
  Yellow5 = "#f59e0b",
  Yellow8 = "#78350f",
}

export class Logger {
  constructor(private debug: boolean) {}

  public logEvent(event: { type: string; id?: string; path?: string }): void {
    if (this.debug) {
      console.log(
        `%cVGGEvent::${event.type}`,
        `background: ${Colors.Yellow5}; color: ${Colors.Yellow8}; font-weight: bold; border-radius: 2px; padding: 0 2.5px;`,
        event.id ? `${event.id} → ${event.path}` : ""
      )
    }
  }
}
