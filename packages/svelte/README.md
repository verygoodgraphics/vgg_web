# VGG Svelte

## Usage

### `<VGGRender />`

```svelte
<script lang="ts">
	import VGGRender from '@verygoodgraphics/vgg-svelte';
</script>

<VGGRender
	src="https://s3.vgg.cool/test/vgg.daruma"
	runtime="https://s3.vgg.cool/test/runtime/latest"
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

| Option        | Type                                                   | Required | Default                            |
| ------------- | ------------------------------------------------------ | -------- | ---------------------------------- |
| src           | `string`                                               | -        | -                                  |
| runtime       | `string`                                               | -        | https://s5.vgg.cool/runtime/latest |
| canvasStyle   | `string`                                               | -        | -                                  |
| editMode      | `boolean`                                              | -        | false                              |
| verbose       | `boolean`                                              | -        | false                              |
| onLoad        | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
| onLoadError   | `(event: VGGEvent) => Promise<void>`                   | -        | -                                  |
| onStateChange | `(event: VGGEvent, instance: VGG<T>) => Promise<void>` | -        | -                                  |
