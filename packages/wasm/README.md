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

### Options

| Option        | Type                                     | Required | Default                            |
| ------------- | ---------------------------------------- | -------- | ---------------------------------- |
| canvas        | `HTMLCanvasElement` \| `OffscreenCanvas` | ✅       | -                                  |
| runtime       | `string`                                 | -        | https://s5.vgg.cool/runtime/latest |
| editMode      | `boolean`                                | -        | false                              |
| verbose       | `boolean`                                | -        | false                              |
| onLoad        | `EventCallback`                          | -        | -                                  |
| onLoadError   | `EventCallback`                          | -        | -                                  |
| onStateChange | `EventCallback`                          | -        | -                                  |
| onSelect      | `EventCallback`                          | -        | -                                  |

### `.load()`

After loading, the state will be `State.Ready` or `State.Error`.

### `.render()`

When the state is `State.Ready`, we can call this method to render the canvas.

### `$(selector: string)`

Get the element by selector.

## FAQ

1. How to get the element selector?\
   set `editMode` and `verbose` to `true`, then you can see the selector in the console when select specific element in the canvas.
