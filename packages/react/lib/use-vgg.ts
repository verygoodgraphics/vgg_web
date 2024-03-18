import {
  EventType,
  State,
  VGG,
  type VGGProps,
} from "@verygoodgraphics/vgg-wasm"
import { useEffect, useRef, useState } from "react"

export interface Options extends Omit<VGGProps, "canvas"> {}

export function useVGG(options: Options) {
  const { src, runtime, onRendered, ...restOpts } = options
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const vgg = useRef<VGG<string> | null>(null)
  const [state, setState] = useState(State.Loading)

  useEffect(() => {
    if (src && canvasRef.current) {
      // eslint-disable-next-line no-extra-semi
      ;(async () => {
        if (vgg.current) {
          vgg.current.render(src)
          return
        }

        vgg.current = new VGG({
          src: src,
          runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
          canvas: canvasRef.current!,
          onRendered: async () => {
            setState(State.Rendered)
            onRendered?.({
              type: EventType.FirstRender,
              data: "",
            })
          },
          ...restOpts,
        })

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
      // if (vgg.current) {
      //   vgg.current.destroy()
      // }
    }
  }, [src])

  return {
    canvasRef,
    vgg,
    isLoading: state === State.Loading,
    isRendered: state === State.Rendered,
    state,
  }
}
