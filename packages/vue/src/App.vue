<script setup lang="ts">
// import { EventType, VGG, VGGEvent } from '@verygoodgraphics/vgg-wasm';
// import VGGRender from '../lib/VGGRender.vue'
// import VGGRender, { EventType, VGG, VGGEvent } from '@verygoodgraphics/vgg-wasm'
import VGGRender, { EventType, VGG, VGGEvent } from '../lib/index'

function handleLoad(event: VGGEvent, instance: VGG<'#vgg_home'>) {
  console.log(event, instance)
  // @ts-expect-error
  instance.$("#vgg-btn-get-started").on(EventType.Click, async (_, { get, set }) => {
    window.alert("Hello World from VGGRender Component!")
    console.log(get, set)
  })
}
</script>

<template>
  <div class="flex">
    <div class="relative">
      <div class="absolute top-2 w-full flex justify-center item-center">
        <h2 class="bg-violet-500 rounded-md px-2 py-1 text-white text-sm font-semibold">
          VGGRender Component
        </h2>
      </div>
      <VGGRender
        src="https://raw.githubusercontent.com/verygoodgraphics/vgg_docs/main/static/example/docs__example__vgg_homepage_v1.daruma"
        :canvasStyle="{ width: '50vw', height: '100vh' }" @onLoad="handleLoad" />
    </div>
  </div>
</template>

<style scoped></style>
