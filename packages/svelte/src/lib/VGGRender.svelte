<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { VGG, State, type VGGEvent, EventType } from '@verygoodgraphics/vgg-wasm';

	export let canvasStyle = '';
	export let src = '';
	// @ts-expect-error
	export let runtime = import.meta.env.VITE_VGG_RUNTIME;
	export let editMode = false;
	export let verbose = false;
	export let customFonts = [] as string[];
	export let onLoad = async (event: VGGEvent, instance: VGG<any>) => {};
	export let onLoadError = async (event: VGGEvent) => {};
	export let onStateChange = async (event: VGGEvent, instance: VGG<any>) => {};
	export let onSelect = async (event: VGGEvent) => {};

	export { State, VGG, EventType, type VGGProps, type VGGEvent };

	let canvasElement: HTMLCanvasElement;
	let isLoading = true;

	const init = function init(src: string | Int8Array) {
		if (!src || !canvasElement) {
			return;
		}

		const vggInstance = new VGG({
			src: src,
			runtime: runtime,
			editMode,
			verbose,
			canvas: canvasElement,
			customFonts,
			// onLoad,
			// onLoadError,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			onStateChange,
			onSelect
		});

		(async () => {
			await vggInstance.load();

			if (vggInstance.state === State.Ready) {
				await vggInstance.render();
				onLoad(
					{
						type: EventType.Load,
						data: ''
					},
					vggInstance
				);
			} else {
				onLoadError({
					type: EventType.LoadError,
					data: ''
				});
			}

			isLoading = false;
		})();

		return vggInstance;
	};

	$: vgg = init(src);

	onMount(() => {
		vgg = init(src);
	});

	onDestroy(() => {
		if (vgg) {
			vgg.destroy();
		}
	});
</script>

<div class="vgg-render-wrapper">
	<canvas bind:this={canvasElement} style={canvasStyle} />
	{#if isLoading}
		<div class="vgg-render-loading-mask">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				style="
					position: absolute;
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					margin: auto;
					fill: white;
					zIndex: 1;
				"
			>
				<path
					d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
				>
					<animateTransform
						attributeName="transform"
						type="rotate"
						dur="0.75s"
						values="0 12 12;360 12 12"
						repeatCount="indefinite"
					/>
				</path>
			</svg>
		</div>
	{/if}
</div>

<style>
	.vgg-render-wrapper {
		position: relative;
	}

	.vgg-render-loading-mask {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100%;
		background: #000;
	}
</style>
