<script lang="ts">
	import VGGRender, { EventType } from '../../dist/index';
	// import VGGRender, { EventType } from '../lib/index';
</script>

<main>
	<div class="flex">
		<div class="relative">
			<div class="absolute top-2 w-full flex justify-center item-center">
				<h2 class="bg-violet-500 rounded-md px-2 py-1 text-white text-sm font-semibold">
					VGGRender Component
				</h2>
			</div>
			<VGGRender
				src="https://raw.githubusercontent.com/verygoodgraphics/vgg_docs/main/static/example/docs__example__vgg_homepage_v1.daruma"
				canvasStyle="width: 100vw; height: 100vh"
				onLoad={async (event, instance) => {
					console.log('onLoad', event, instance);
					instance.$('#vgg-btn-get-started').on(EventType.Click, async (_, { get, set }) => {
						window.alert('Hello World from VGGRender Component!');
						console.log(get, set);
					});
				}}
			/>
		</div>
	</div>
</main>

<style>
</style>
