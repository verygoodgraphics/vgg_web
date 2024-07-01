import { useEffect } from "react"
import { EventType, useVGG } from "../lib"
import { VGGRender } from "../lib/vgg"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// import { useVGG, VGGRender, EventType } from "../dist/vgg-react.js"

import "./App.css"

function App() {
  const { canvasRef, vgg, isRendered } = useVGG({
    src: "https://s3.vgg.cool/test/vgg.daruma",
    runtime: "https://s3.vgg.cool/test/runtime/latest",
  })

  useEffect(() => {
    if (!isRendered || !vgg.current) return
    vgg.current?.$("#vgg-btn-get-started").on(EventType.Click, async () => {
      window.alert("Hello World from useVGG hook!")
    })
  }, [isRendered])

  return (
    <div className="grid grid-cols-2">
      <div className="relative">
        <div className="absolute top-2 w-full flex justify-center item-center">
          <h2 className="bg-violet-500 rounded-md px-2 py-1 text-white text-sm font-semibold z-50">
            VGGRender Component
          </h2>
        </div>
        <VGGRender
          src="https://s3.vgg.cool/test/vgg.daruma"
          runtime="https://s3.vgg.cool/test/runtime/latest"
          canvasStyle={{
            width: "50vw",
            height: "100vh",
          }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          onLoad={async (_, instance) => {
            // instance.$("#vgg-btn-get-started").on(EventType.Click, async () => {
            //   window.alert("Hello World from VGGRender Component!")
            // })
          }}
        />
      </div>
      <div className="relative">
        <div className="absolute top-2 w-full flex justify-center item-center">
          <h2 className="bg-blue-500 rounded-md px-2 py-1 text-white text-sm font-semibold">
            useVGG Hook
          </h2>
        </div>
        <VGGRender
          src="https://s3.vgg.cool/test/vgg.daruma"
          runtime="https://s3.vgg.cool/test/runtime/latest"
          canvasStyle={{
            width: "50vw",
            height: "100vh",
          }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          onLoad={async (_, instance) => {
            // instance.$("#vgg-btn-get-started").on(EventType.Click, async () => {
            //   window.alert("Hello World from VGGRender Component!")
            // })
          }}
        />
      </div>
      {/* <div className="relative">
        <div className="absolute top-2 w-full flex justify-center item-center">
          <h2 className="bg-blue-500 rounded-md px-2 py-1 text-white text-sm font-semibold">
            useVGG Hook
          </h2>
        </div>
        <canvas
          ref={canvasRef}
          style={{
            width: "50vw",
            height: "100vh",
          }}
        />
      </div> */}
    </div>
  )
}

export default App
