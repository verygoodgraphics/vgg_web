# VGG React

## Usage

### `<VGGRender />`

```js
import { VGGRender } from "@verygoodgraphics/vgg-react"

return (
  <VGGRender
    src="https://s3.vgg.cool/test/vgg.daruma"
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
  src: "https://s3.vgg.cool/test/vgg.daruma",
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

| Option        | Type            | Required | Default                            |
| ------------- | --------------- | -------- | ---------------------------------- |
| src           | `string`        | -        | -                                  |
| runtime       | `string`        | -        | https://s5.vgg.cool/runtime/latest |
| editMode      | `boolean`       | -        | false                              |
| verbose       | `boolean`       | -        | false                              |
| onLoad        | `EventCallback` | -        | -                                  |
| onLoadError   | `EventCallback` | -        | -                                  |
| onStateChange | `EventCallback` | -        | -                                  |

### Props for `<VGGRender />`

| Option        | Type                                                   | Required | Default                            |
| ------------- | ------------------------------------------------------ | -------- | ---------------------------------- |
| src           | `string`                                               | -        | -                                  |
| runtime       | `string`                                               | -        | https://s5.vgg.cool/runtime/latest |
| canvasStyle   | `React.CSSProperties`                                  | -        | -                                  |
| editMode      | `boolean`                                              | -        | false                              |
| verbose       | `boolean`                                              | -        | false                              |
| onLoad        | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
| onLoadError   | `(event: VGGEvent) => Promise<void>`                   | -        | -                                  |
| onStateChange | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
