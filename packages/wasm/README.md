# VGG WASM

## Usage

### Import through CDN

```html
<script src="https://www.unpkg.com/@verygoodgraphics/vgg-wasm"></script>
<script>
  const vgg = new VGG({
    src: "https://s5.vgg.cool/vgg.daruma",
    canvas: document.querySelector("#canvas"),
  })

  ;(async () => {
    await vgg.load()

    if (vgg.state === "ready") {
      await vgg.render()

      vgg.$("#vgg_home").on("click", async () => {
        window.alert("Hello, VGG!")
      })
    }
  })()
</script>
```

### Import through NPM

```bash
npm install @verygoodgraphics/vgg-wasm
```

```ts
import { VGG } from "@verygoodgraphics/vgg-wasm"

const vgg = await new VGG({
  src: "https://s5.vgg.cool/vgg.daruma",
  canvas: document.querySelector("#canvas") as HTMLCanvasElement,
}).load()

if (vgg.state === State.Ready) await vgg.render()
```

## API

### Props for creating a new instance

| Option               | Type                                     | Required | Default                            |
| -------------------- | ---------------------------------------- | -------- | ---------------------------------- |
| canvas               | `HTMLCanvasElement` \| `OffscreenCanvas` | ✅       | -                                  |
| runtime              | `string`                                 | -        | https://s5.vgg.cool/runtime/latest |
| editMode             | `boolean`                                | -        | `false`                            |
| verbose              | `boolean`                                | -        | `false`                            |
| disableLoader        | `boolean`                                | -        | `false`                            |
| customFonts          | `string[]`                               | -        | `[]`                               |
| onLoad               | `EventCallback`                          | -        | -                                  |
| onLoadError          | `EventCallback`                          | -        | -                                  |
| onStateChange        | `EventCallback`                          | -        | -                                  |
| onRendered           | `EventCallback`                          | -        | -                                  |
| onSelect             | `EventCallback`                          | -        | -                                  |
| onLoadingStateUpdate | `(state: LoadingState) => void`          | -        | -                                  |

### VGG instance methods and properties

| Method                  | Description                            | Return          | Arguments                                                                                                     |
| ----------------------- | -------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| vggInstanceKey          | The unique key of current instance     | `string`        | -                                                                                                             |
| state                   | Current state of the rendering process | `State`         | -                                                                                                             |
| load                    | Initialize the render                  | `Promise<void>` | -                                                                                                             |
| loadFontFile            | Load fonts                             | `void`          | `(font: Uint8Array, name: string): void`                                                                      |
| on                      | Subscribe to VGG-generated events      | `VGG`           | `(type: VGGEventType, callback: EventCallback): VGG<T>`                                                       |
| render                  | Render the Daruma file                 | `Promise<void>` | `(darumaSource: string &#124; Int8Array, opts?: {width: number, height: number, editMode?: boolean}): VGG<T>` |
| $                       | Element selector                       | `Observable`    | `(selector: T): Observable`                                                                                   |
| destroy                 | Destroy VGG instance                   | `VGG`           | -                                                                                                             |
| getTextContent          | Extract all the text content           | `string[]`      | -                                                                                                             |
| snapshot                | Export current frame as image          | `Uint8Array`    | `(opts: {type: "png" &#124; "jpg" &#124; "webp", quality: number}): Uint8Array`                               |
| setContentMode          | Render Mode                            | `void`          | `(mode: "fig" &#124; "fill" &#124; "original" &#124; "autoFill"): void`                                       |
| setFitToViewportEnabled | Turn on/off the breakpoint mode        | `void`          | `(bool: boolean): void`                                                                                       |
| getAllFrames            | Get all the frames's data              | `Frame[]`       | -                                                                                                             |
| setCurrentFrame         | Update render frame                    | `void`          | `(id: string, preserveScrollHeight: boolean): void`                                                           |
| nextFrame               | Render the next frame                  | `void`          | -                                                                                                             |
| prevFrame               | Render the previous frame              | `void`          | -                                                                                                             |
| currentFrameId          | Get current frame id                   | `string`        | -                                                                                                             |
| getFontsInUse           | Get the fonts used in the file         | `Font[]`        | -                                                                                                             |

### `.load()`

After loading, the state will be `State.Ready` or `State.Error`.

### `.render()`

When the state is `State.Ready`, we can call this method to render the canvas.

### `$(selector: string)`

Get the element by selector.

## FAQ

1. How to get the element selector?\
   set `editMode` and `verbose` to `true`, then you can see the selector in the console when select specific element in the canvas.
