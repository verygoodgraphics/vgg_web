<script setup lang='ts'>
import { StyleValue, ref, onMounted } from 'vue';
import {
  VGG,
  State,
  type VGGProps,
  type VGGEvent,
  EventType,
} from "@verygoodgraphics/vgg-wasm"

export interface VGGRenderProps
  extends Omit<
    VGGProps,
    "canvas" | "onLoad" | "onLoadError" | "onStateChange"
  > {
  canvasStyle?: StyleValue
}

export interface VGGEventProps<T extends string> {
  onLoad?: (event: VGGEvent, instance: VGG<T>) => Promise<void>
  onLoadError?: (event: VGGEvent) => Promise<void>
  onStateChange?: (event: VGGEvent, instance: VGG<T>) => Promise<void>
  onSelect?: (event: VGGEvent) => Promise<void>
}



const canvasRef = ref<HTMLCanvasElement | null>(null)

const { src, runtime, editMode, verbose } = defineProps<VGGRenderProps>()
const emit = defineEmits(['onLoad', 'onLoadError', 'onStateChange', 'onSelect'])

onMounted(() => {
  if (canvasRef.value) {
    // eslint-disable-next-line no-extra-semi
    ; (async () => {
      const vgg = new VGG({
        src: src ?? "https://s3.vgg.cool/test/vgg.daruma",
        runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
        editMode,
        verbose,
        canvas: canvasRef.value!,
        // onLoad: (...args) => emit('onLoad', ...args),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onLoadError: (...args) => emit('onLoadError', ...args),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onStateChange: (...args) => emit('onStateChange', ...args),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onSelect: (...args) => emit('onSelect', ...args)
      })

      await vgg.load()

      if (vgg.state === State.Ready) {
        await vgg.render()
        emit('onLoad',
          {
            type: EventType.Load,
            data: "",
          },
          vgg
        )
      } else {
        emit('onLoadError', {
          type: EventType.LoadError,
          data: "",
        })
      }
    })()
  }
})
</script>

<template>
  <canvas ref="canvasRef" :style="canvasStyle" />
</template>