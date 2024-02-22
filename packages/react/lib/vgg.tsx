import { useEffect, useRef, useState } from "react"

import {
  VGG,
  State,
  type VGGProps,
  type VGGEvent,
  type EventCallback,
  EventType,
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
          vggInstanceCache.current.destroy()
        }

        vggInstanceCache.current = new VGG({
          src: src ?? "https://s3.vgg.cool/test/vgg.daruma",
          runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
          editMode,
          verbose,
          canvas: canvasRef.current!,
          customFonts,
          onStateChange,
          onSelect,
          onRendered: async () => {
            setLoading(false)
            onRendered?.({
              type: EventType.FirstRender,
              data: "",
            })
          },
        })

        await vggInstanceCache.current.load()

        if (vggInstanceCache.current.state === State.Ready) {
          await vggInstanceCache.current.render()
          onLoad?.(
            {
              type: EventType.Load,
              data: "",
            },
            vggInstanceCache.current
          )
        } else {
          onLoadError?.({
            type: EventType.LoadError,
            data: "",
          })
        }
      })()
    }

    return () => {
      if (vggInstanceCache.current) {
        vggInstanceCache.current.destroy()
      }
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
        >
          {loadingComponent ?? <div>Loading...</div>}
        </div>
      )}
    </div>
  )
}
