<script setup lang='ts'>
import { StyleValue, ref, onMounted, onBeforeUnmount, watch } from 'vue';
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
const isLoading = ref(true)
const vggInstance = ref<VGG<any> | null>(null)

const { src, runtime, editMode, verbose, customFonts } = defineProps<VGGRenderProps>()
const emit = defineEmits(['onLoad', 'onLoadError', 'onStateChange', 'onSelect'])

watch(() => src, (newSrc) => {
  if (vggInstance.value && newSrc !== src) {
    vggInstance.value = init(newSrc)
  }
})

function init(src: string | Int8Array) {
  const vggInstance = new VGG({
    src: src ?? "https://s3.vgg.cool/test/vgg.daruma",
    runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
    editMode,
    verbose,
    canvas: canvasRef.value!,
    customFonts,
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

    ; (async () => {
      if (!vggInstance) return

      await vggInstance.load()

      if (vggInstance.state === State.Ready) {
        await vggInstance.render()
        emit('onLoad',
          {
            type: EventType.Load,
            data: "",
          },
          vggInstance
        )
      } else {
        emit('onLoadError', {
          type: EventType.LoadError,
          data: "",
        })
      }

      isLoading.value = false
    })()

  return vggInstance
}

onMounted(() => {
  if (canvasRef.value) {
    vggInstance.value = init(src)
  }
})

onBeforeUnmount(() => {
  if (vggInstance.value) {
    vggInstance.value.destroy()
  }
})
</script>

<template>
  <div class="vgg-render-wrapper">
    <canvas ref="canvasRef" :style="canvasStyle" />
    <div class="vgg-render-loading-mask" v-if="isLoading">
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" :style="{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: 'auto',
        fill: 'white',
        zIndex: 1,
      }">
        <path
          d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
          <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12"
            repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  </div>
</template>

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