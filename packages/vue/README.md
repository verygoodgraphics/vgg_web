# VGG Vue

## Environment

Create a `.env` file and set the VGG runtime URL if you want to use a specific version, otherwise it will use the latest version.

```bash
# Open your terminal and goto the root directory of your project
cp /packages/vue/.env.example /packages/vue/.env
```

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
    src="https://raw.githubusercontent.com/verygoodgraphics/vgg_docs/main/static/example/docs__example__vgg_homepage_v1.daruma"
    :canvasStyle="{ width: '50vw', height: '100vh' }"
    @onLoad="handleLoad"
  />
</template>
```

## API

### Props for `<VGGRender />`

| Option               | Type                                                   | Required | Default                            |
| -------------------- | ------------------------------------------------------ | -------- | ---------------------------------- |
| src                  | `string` \| `Int8Array`                                | -        | -                                  |
| runtime              | `string`                                               | -        | https://s5.vgg.cool/runtime/latest |
| canvasStyle          | `StyleValue`                                           | -        | -                                  |
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
