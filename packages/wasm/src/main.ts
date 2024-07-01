import "./style.css"
// import '../dist/index.d.ts'
// import { VGG, EventType } from "../dist/vgg-wasm.js"
import { VGG } from "../lib/main"
// import { Generated_Nodes_Type } from "./main.d"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>VGG Wasm</h1>
    <canvas id="canvas"></canvas>
    <div id="frames"></div>
    <button id="snapshot">Snapshot</button>
    <div id="prev">Prev</div>
    <div id="next">Next</div>
  </div>
`

const vgg = new VGG({
  src: "https://s3.vgg.cool/test/vgg.daruma",
  // src: "https://raw.githubusercontent.com/verygoodgraphics/resource/main/feature/geometry/geometry__transform__rotation.daruma",
  runtime: "https://s3.vgg.cool/test/runtime/latest",
  // editMode: true,
  verbose: true,
  // disableLoader: true,
  canvas: document.querySelector("#canvas") as HTMLCanvasElement,
  onSelect: async (event) => console.log("Select", event),
  onLoadingStateUpdate: (state) => console.log("Loading State", state),
  customFonts: ["./Roboto-Black.ttf"],
  onReady: async () => console.log("Ready"),
  // onLoad: async (event) => console.log("Load", event),
  // onLoadError: async (event) => console.log("Load Error", event),
  // onStateChange: async (state) => console.log("State Change", state),
})

await vgg.load()

if (vgg.state === "ready") {
  await vgg.render()

  const fontsInUse = vgg.getFontsInUse()

  console.log({ fontsInUse })

  vgg.$("#increase").on("click", async (_, { get, set }) => {
    const count = get("#counter").content
    set("#counter", {
      content: (Number(count) + 1).toString(),
    })
  })
  vgg.$("#decrease").on("click", async (_, { get, set }) => {
    const count = get("#counter").content
    set("#counter", {
      content: (Number(count) - 1).toString(),
    })
  })

  const frames = vgg.getAllFrames()
  console.log({ frames })
  document.querySelector("#frames")!.innerHTML = frames
    .map((frame) => {
      return `<div data-id="${frame.id}">${frame.name}</div>`
    })
    .join("")

  document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement
    if (target.dataset.id) {
      vgg.setCurrentFrame(target.dataset.id)
      console.log("Current Frame Id: ", vgg.currentFrameId)
    }
  })

  document.querySelector("#snapshot")!.addEventListener("click", async () => {
    const snapshot = vgg.snapshot()
    if (snapshot) {
      console.log("Snapshot", snapshot)
      const blob = new Blob([snapshot], { type: "image/png" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "snapshot.png"
      a.click()
    }
  })

  document.querySelector("#prev")!.addEventListener("click", async () => {
    vgg.prevFrame()
    console.log("Current Frame Id: ", vgg.currentFrameId)
  })

  document.querySelector("#next")!.addEventListener("click", async () => {
    vgg.nextFrame()
    console.log("Current Frame Id: ", vgg.currentFrameId)
  })
}
