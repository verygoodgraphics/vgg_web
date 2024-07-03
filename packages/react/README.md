# VGG React

## Usage

### `<VGGRender />`

```js
import { VGGRender } from "@verygoodgraphics/vgg-react"

return (
  <VGGRender
    src="https://raw.githubusercontent.com/verygoodgraphics/vgg_docs/main/static/example/docs__example__vgg_homepage_v1.daruma"
    canvasStyle={{
      width: "50vw",
      height: "100vh",
    }}
    onLoad={async (_, instance) => {
      instance.$("2:94").on(EventType.Click, async () => {
        window.alert("Hello, VGG!")
      })
    }}
  />
)
```

### `useVGG()`

```js
import { useVGG } from "@verygoodgraphics/vgg-react"

const { canvasRef, vgg, isLoading } = useVGG({
  src: "https://raw.githubusercontent.com/verygoodgraphics/vgg_docs/main/static/example/docs__example__vgg_homepage_v1.daruma",
})

useEffect(() => {
  if (isLoading || !vgg.current) return
  vgg.current?.$("2:94").on(EventType.Click, async () => {
    window.alert("Hello, VGG!")
  })
}, [isLoading])

return (
  <canvas
    ref={canvasRef}
    style={{
      width: "50vw",
      height: "100vh",
    }}
  />
)
```

## API

### Options for `useVGG()`

| Option               | Type                                                   | Required | Default                            |
| -------------------- | ------------------------------------------------------ | -------- | ---------------------------------- |
| src                  | `string` \| `Int8Array`                                | ✅       | -                                  |
| runtime              | `string`                                               | -        | https://s5.vgg.cool/runtime/latest |
| editMode             | `boolean`                                              | -        | `false`                            |
| verbose              | `boolean`                                              | -        | `false`                            |
| disableLoader        | `boolean`                                              | -        | `false`                            |
| customFonts          | `string[]`                                             | -        | `[]`                               |
| onLoad               | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
| onLoadError          | `(event: VGGEvent) => Promise<void>`                   | -        | -                                  |
| onReady              | `EventCallback`                                        | -        | -                                  |
| onRendered           | `EventCallback`                                        | -        | -                                  |
| onStateChange        | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
| onSelect             | `EventCallback`                                        | -        | -                                  |
| onLoadingStateUpdate | `(state: LoadingState) => void`                        | -        | -                                  |

### Props for `<VGGRender />`

| Option               | Type                                                   | Required | Default                            |
| -------------------- | ------------------------------------------------------ | -------- | ---------------------------------- |
| src                  | `string` \| `Int8Array`                                | ✅       | -                                  |
| runtime              | `string`                                               | -        | https://s5.vgg.cool/runtime/latest |
| canvasStyle          | `React.CSSProperties`                                  | -        | -                                  |
| editMode             | `boolean`                                              | -        | `false`                            |
| verbose              | `boolean`                                              | -        | `false`                            |
| disableLoader        | `boolean`                                              | -        | `false`                            |
| customFonts          | `string[]`                                             | -        | `[]`                               |
| onLoad               | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
| onLoadError          | `(event: VGGEvent) => Promise<void>`                   | -        | -                                  |
| onReady              | `EventCallback`                                        | -        | -                                  |
| onRendered           | `EventCallback`                                        | -        | -                                  |
| onStateChange        | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
| onSelect             | `EventCallback`                                        | -        | -                                  |
| onLoadingStateUpdate | `(state: LoadingState) => void`                        | -        | -                                  |
