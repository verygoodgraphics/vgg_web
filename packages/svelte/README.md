# VGG Svelte

## Environment

Create a `.env` file and set the VGG runtime URL if you want to use a specific version, otherwise it will use the latest version.

```bash
# Open your terminal and goto the root directory of your project
cp /packages/svelte/.env.example /packages/svelte/.env
```

## Usage

### `<VGGRender />`

```svelte
<script lang="ts">
	import VGGRender from '@verygoodgraphics/vgg-svelte';
</script>

<VGGRender
	src="https://raw.githubusercontent.com/verygoodgraphics/vgg_docs/main/static/example/docs__example__vgg_homepage_v1.daruma"
	canvasStyle="width: 50vw; height: 100vh"
	onLoad={async (event, instance) => {
		console.log(event, instance);
		instance?.$('#vgg_home').on(EventType.Click, async () => {
			window.alert('Hello, VGG!');
		});
	}}
/>
```

## API

### Props for `<VGGRender />`

| Option               | Type                                                   | Required | Default                            |
| -------------------- | ------------------------------------------------------ | -------- | ---------------------------------- |
| src                  | `string` \| `Int8Array`                                | -        | -                                  |
| runtime              | `string`                                               | -        | https://s5.vgg.cool/runtime/latest |
| canvasStyle          | `string`                                               | -        | -                                  |
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
