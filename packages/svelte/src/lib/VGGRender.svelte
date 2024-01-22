<script lang="ts">
	import { onMount } from 'svelte';
	import { VGG, State, type VGGProps, type VGGEvent, EventType } from '@verygoodgraphics/vgg-wasm';

	export let canvasStyle = '';
	export let src = '';
	export let runtime = 'https://s5.vgg.cool/runtime/latest';
	export let editMode = false;
	export let verbose = false;
	export let onLoad = async (event: VGGEvent, instance: VGG<any>) => {};
	export let onLoadError = async (event: VGGEvent) => {};
	export let onStateChange = async (event: VGGEvent, instance: VGG<any>) => {};
	export let onSelect = async (event: VGGEvent) => {};

	export { State, VGG, EventType, type VGGProps, type VGGEvent };

	let canvasElement: HTMLCanvasElement;

	onMount(() => {
		if (canvasElement) {
			// eslint-disable-next-line no-extra-semi
			(async () => {
				const vgg = new VGG({
					src: src ?? 'https://s3.vgg.cool/test/vgg.daruma',
					runtime: runtime ?? 'https://s5.vgg.cool/runtime/latest',
					editMode,
					verbose,
					canvas: canvasElement,
					// onLoad,
					// onLoadError,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					onStateChange,
					onSelect
				});

				await vgg.load();

				if (vgg.state === State.Ready) {
					await vgg.render();
					onLoad(
						{
							type: EventType.Load,
							data: ''
						},
						vgg
					);
				} else {
					onLoadError({
						type: EventType.LoadError,
						data: ''
					});
				}
			})();
		}
	});
</script>

<canvas bind:this={canvasElement} style={canvasStyle} />
