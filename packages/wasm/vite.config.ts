import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

const pkgName = "vgg-wasm"

const fileName = {
  es: `${pkgName}.mjs`,
  cjs: `${pkgName}.cjs`,
  iife: `${pkgName}.iife.js`,
}

const formats = Object.keys(fileName) as Array<keyof typeof fileName>

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "vggWasm",
      // @ts-expect-error
      fileName: (format) => fileName[format],
      formats,
    },
  },
  plugins: [dts({ rollupTypes: true })],
})
