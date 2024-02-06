import { State, VGG, type VGGProps } from "@verygoodgraphics/vgg-wasm"
import { useEffect, useRef, useState } from "react"

export interface Options extends Omit<VGGProps, "canvas"> {}

export function useVGG(options: Options) {
  const { src, runtime, ...restOpts } = options
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const vgg = useRef<VGG<string> | null>(null)
  const [state, setState] = useState(State.Loading)
  const isDestroyed = useRef(false)

  useEffect(() => {
    if (src && canvasRef.current) {
      // eslint-disable-next-line no-extra-semi
      ;(async () => {
        isDestroyed.current = false

        vgg.current = new VGG({
          src: src,
          runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
          canvas: canvasRef.current!,
          ...restOpts,
        })

        if (isDestroyed.current) {
          vgg.current.destroy()
          isDestroyed.current = false
          return
        }

        await vgg.current.load()

        if (vgg.current.state === State.Ready) {
          await vgg.current.render()
          setState(State.Ready)
        } else {
          setState(State.Error)
        }
      })()
    }

    return () => {
      if (vgg.current) {
        vgg.current.destroy()
      }
      isDestroyed.current = true
    }
  }, [src])

  return {
    canvasRef,
    vgg,
    isLoading: state === State.Loading,
    state,
  }
}
