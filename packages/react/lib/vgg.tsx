import { useEffect, useRef, useState } from "react"

import {
  VGG,
  State,
  type VGGProps,
  type VGGEvent,
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
  onStateChange?: (event: VGGEvent, instance: VGG<T>) => Promise<void>
  onSelect?: (event: VGGEvent) => Promise<void>
}

// https://raw.githubusercontent.com/n3r4zzurr0/svg-spinners/main/svg/90-ring.svg
const spinner = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      margin: "auto",
      fill: "white",
      zIndex: 1,
    }}
  >
    <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
      <animateTransform
        attributeName="transform"
        type="rotate"
        dur="0.75s"
        values="0 12 12;360 12 12"
        repeatCount="indefinite"
      />
    </path>
  </svg>
)

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
  } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (canvasRef.current) {
      // eslint-disable-next-line no-extra-semi
      ;(async () => {
        const vgg = new VGG({
          src: src ?? "https://s3.vgg.cool/test/vgg.daruma",
          runtime: runtime ?? "https://s5.vgg.cool/runtime/latest",
          editMode,
          verbose,
          canvas: canvasRef.current!,
          customFonts,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onLoad,
          onLoadError,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onStateChange,
          onSelect,
        })

        await vgg.load()

        if (vgg.state === State.Ready) {
          await vgg.render()
          onLoad?.(
            {
              type: EventType.Load,
              data: "",
            },
            vgg
          )
        } else {
          onLoadError?.({
            type: EventType.LoadError,
            data: "",
          })
        }

        setLoading(false)
      })()
    }
  }, [])

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
          {loadingComponent ?? spinner}
        </div>
      )}
    </div>
  )
}
