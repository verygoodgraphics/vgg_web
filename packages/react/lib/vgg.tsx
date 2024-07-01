import { useEffect, useRef, useState } from "react"

import {
  VGG,
  State,
  type VGGProps,
  type VGGEvent,
  type EventCallback,
} from "@verygoodgraphics/vgg-wasm"

export interface Props<T extends string>
  extends Omit<
    VGGProps,
    "canvas" | "onLoad" | "onLoadError" | "onStateChange"
  > {
  className?: string
  canvasStyle?: React.CSSProperties
  loadingMaskStyle?: React.CSSProperties
  loadingComponent?: React.ReactNode
  customFonts?: string[]
  onLoad?: (event: VGGEvent, instance: VGG<T>) => Promise<void>
  onLoadError?: (event: VGGEvent) => Promise<void>
  onStateChange?: EventCallback
  onSelect?: EventCallback
}

export function VGGRender<T extends string>(props: Props<T>) {
  const {
    className,
    src,
    canvasStyle,
    runtime,
    editMode,
    verbose,
    loadingMaskStyle,
    loadingComponent,
    customFonts,
    onLoad,
    onLoadError,
    onStateChange,
    onSelect,
    onReady,
    onRendered,
  } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setLoading] = useState(true)
  const vggInstanceCache = useRef<VGG<T> | null>(null)

  useEffect(() => {
    if (src && canvasRef.current) {
      // eslint-disable-next-line no-extra-semi
      ;(async () => {
        if (vggInstanceCache.current) {
          vggInstanceCache.current.render(src)
          return
        }

        vggInstanceCache.current = new VGG({
          src: src,
          runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
          editMode,
          verbose,
          canvas: canvasRef.current!,
          customFonts,
          onStateChange,
          onSelect,
          onRendered: async (e) => {
            setTimeout(() => setLoading(false))
            onRendered?.(e)
          },
          onReady,
          onLoadError: async (event) => {
            setLoading(false)
            onLoadError?.(event)
          },
        })

        await vggInstanceCache.current.load()

        if (vggInstanceCache.current.state === State.Ready) {
          await vggInstanceCache.current.render()
          onLoad?.(
            {
              type: "load",
              data: "",
            },
            vggInstanceCache.current
          )
        } else {
          onLoadError?.({
            type: "loaderror",
            data: "",
          })
        }
      })()
    }

    return () => {
      // if (vggInstanceCache.current) {
      //   vggInstanceCache.current.destroy()
      // }
    }
  }, [src])

  return (
    <div className={className} style={{ position: "relative" }}>
      <canvas style={canvasStyle} ref={canvasRef} />
      {isLoading && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#000",
            color: "#fff",
            ...loadingMaskStyle,
          }}
          className={isLoading ? "visible" : "hidden"}
        >
          {loadingComponent ?? <div>Loading...</div>}
        </div>
      )}
    </div>
  )
}
