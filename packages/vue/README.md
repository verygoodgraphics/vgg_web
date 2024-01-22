# VGG Vue

## Usage

### `<VGGRender />`

```vue
<script setup lang="ts">
import VGGRender from "@verygoodgraphics/vgg-vue"

function handleLoad(event: VGGEvent, instance: VGG<"#vgg_home">) {
  console.log(event, instance)
  instance?.$("#vgg_home").on(EventType.Click, async () => {
    window.alert("Hello, VGG!")
  })
}
</script>

<template>
  <VGGRender
    src="https://s3.vgg.cool/test/vgg.daruma"
    runtime="https://s3.vgg.cool/test/runtime/latest"
    :canvasStyle="{ width: '50vw', height: '100vh' }"
    @onLoad="handleLoad"
  />
</template>
```

## API

### Props for `<VGGRender />`

| Option        | Type                                                   | Required | Default                            |
| ------------- | ------------------------------------------------------ | -------- | ---------------------------------- |
| src           | `string`                                               | -        | -                                  |
| runtime       | `string`                                               | -        | https://s5.vgg.cool/runtime/latest |
| canvasStyle   | `StyleValue`                                           | -        | -                                  |
| editMode      | `boolean`                                              | -        | false                              |
| verbose       | `boolean`                                              | -        | false                              |
| onLoad        | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
| onLoadError   | `(event: VGGEvent) => Promise<void>`                   | -        | -                                  |
| onStateChange | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
