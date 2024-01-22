import "./style.css"
// import '../dist/index.d.ts'
// import { VGG, EventType } from "../dist/vgg-wasm.js"
import { VGG, EventType } from "../lib/main"
import { State } from "../lib/constants"
// import { Generated_Nodes_Type } from "./main.d"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>VGG Wasm</h1>
    <canvas id="canvas"></canvas>
  </div>
`

const vgg = new VGG({
  // src: "https://s3.vgg.cool/test/vgg.daruma",
  src: "https://verygoodgraphics.com/d/clqywc8tu002bo9mn8bctgekn",
  runtime:
    "https://s3.vgg.cool/test/runtime/58c4b139c59abf843cde477eb04de0dcb7b0ed82/",
  // editMode: true,
  verbose: true,
  canvas: document.querySelector("#canvas") as HTMLCanvasElement,
  onSelect: async (event) => console.log("Select", event),
  // onLoad: async (event) => console.log("Load", event),
  // onLoadError: async (event) => console.log("Load Error", event),
  // onStateChange: async (state) => console.log("State Change", state),
})

await vgg.load()

if (vgg.state === State.Ready) {
  await vgg.render()

  vgg.$("#increase").on(EventType.Click, async (_, { get, set }) => {
    const count = get("#counter").content
    set("#counter", {
      content: (Number(count) + 1).toString(),
    })
  })
  vgg.$("#decrease").on(EventType.Click, async (_, { get, set }) => {
    const count = get("#counter").content
    set("#counter", {
      content: (Number(count) - 1).toString(),
    })
  })
}
