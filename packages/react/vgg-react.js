import Pe, { useRef as Q, useState as hr, useEffect as xe } from "react"
var gr = Object.defineProperty,
  pr = (u, t, a) =>
    t in u
      ? gr(u, t, { enumerable: !0, configurable: !0, writable: !0, value: a })
      : (u[t] = a),
  m = (u, t, a) => (pr(u, typeof t != "symbol" ? t + "" : t, a), a),
  k = /* @__PURE__ */ ((u) => (
    (u.Load = "load"),
    (u.LoadError = "loaderror"),
    (u.StateChange = "statechange"),
    (u.Click = "click"),
    u
  ))(k || {}),
  T = /* @__PURE__ */ ((u) => (
    (u.Loading = "loading"), (u.Ready = "ready"), (u.Error = "error"), u
  ))(T || {})
class mr {
  constructor(t = []) {
    this.listeners = t
  }
  // Gets listeners of specified type
  getListeners(t) {
    return this.listeners.filter((a) => a.type === t)
  }
  // Adds a listener
  add(t) {
    this.listeners.includes(t) || this.listeners.push(t)
  }
  /**
   * Removes a listener
   * @param listener the listener with the callback to be removed
   */
  remove(t) {
    for (let a = 0; a < this.listeners.length; a++) {
      const l = this.listeners[a]
      if (l.type === t.type && l.callback === t.callback) {
        this.listeners.splice(a, 1)
        break
      }
    }
  }
  /**
   * Clears all listeners of specified type, or every listener if no type is
   * specified
   * @param type the type of listeners to clear, or all listeners if not
   * specified
   */
  removeAll(t) {
    t
      ? this.listeners
          .filter((a) => a.type === t)
          .forEach((a) => this.remove(a))
      : this.listeners.splice(0, this.listeners.length)
  }
  // Fires an event
  fire(t, a) {
    this.getListeners(t.type).forEach((l) => l.callback(t, a))
  }
}
const br = (u = 21) =>
  crypto
    .getRandomValues(new Uint8Array(u))
    .reduce(
      (t, a) =>
        (t +=
          (a &= 63) < 36
            ? a.toString(36)
            : a < 62
              ? (a - 26).toString(36).toUpperCase()
              : a > 62
                ? "-"
                : "_"),
      ""
    )
class yr {
  constructor(t, a) {
    m(this, "selector"),
      m(this, "vggSdk"),
      (this.selector = t),
      (this.vggSdk = a)
  }
  on(t, a) {
    return this.addEventListener(this.selector, t, a), this
  }
  update(t) {
    if (!this.vggSdk) throw new Error("VGG SDK not ready")
    this.vggSdk.updateElement(this.selector, t)
  }
  addEventListener(t, a, l) {
    if (!this.vggSdk) throw new Error("VGG SDK not ready")
    const h = (y) => l(this, y),
      d = br(7),
      b = `export default (event, opts) => {
      const sdk = new opts.instance.VggSdk()

      const get = (selector) => {
        const element = sdk.getElement(selector)
        try {
          const parsedElement = JSON.parse(element)
          return parsedElement
        } catch (err) {
          return element
        }
      }
      
      const set = (selector, data) => {
        const dataString = JSON.stringify(data)
        sdk.updateElement(selector, dataString)
      }

      const listenersMapInGlobal = globalThis["vggInstances"][sdk.getEnv()].listeners
      const clientCallback = listenersMapInGlobal.get("${d}")

      if (clientCallback) {
        clientCallback({ get, set })
      }
    }`
    this.vggSdk.addEventListener(t, a, b)
    const v = globalThis.vggInstances[this.vggSdk.getEnv()]
    return (
      v && v.listeners.set(d, h),
      {
        selector: t,
        removeEventListener: () => {
          this.vggSdk.removeEventListener(t, a, b), v.listeners.delete(d)
        },
      }
    )
  }
}
class Er {
  constructor(t) {
    this.debug = t
  }
  logEvent(t) {
    this.debug &&
      console.log(
        `%cVGGEvent::${t.type}`,
        "background: #f59e0b; color: #78350f; font-weight: bold; border-radius: 2px; padding: 0 2.5px;",
        t.id ? `${t.id} → ${t.path}` : ""
      )
  }
}
const je = class Fe {
  // private VGGNodes = {} as Record<T, VGGNode>
  constructor(t) {
    m(this, "props"),
      m(this, "defaultRuntime", "https://s5.vgg.cool/runtime/latest"),
      m(this, "canvas"),
      m(this, "width", 0),
      m(this, "height", 0),
      m(this, "editMode", !1),
      m(this, "verbose"),
      m(this, "src"),
      m(this, "runtime"),
      m(this, "vggInstanceKey", ""),
      m(this, "eventManager"),
      m(this, "state", T.Loading),
      m(this, "vggWasmInstance", null),
      m(this, "vggSdk", null),
      m(this, "observables", /* @__PURE__ */ new Map()),
      m(this, "requestAnimationFrame"),
      m(this, "logger")
    var a, l
    ;(this.props = t),
      (this.canvas = t.canvas),
      (this.src = t.src),
      (this.runtime = t.runtime || this.defaultRuntime),
      (this.width = ((a = this.canvas) == null ? void 0 : a.width) ?? 0),
      (this.height = ((l = this.canvas) == null ? void 0 : l.height) ?? 0),
      (this.editMode = t.editMode ?? !1),
      (this.verbose = t.verbose ?? !1),
      (this.logger = new Er(this.verbose)),
      (this.eventManager = new mr()),
      t.onLoad && this.on(k.Load, t.onLoad),
      t.onLoadError && this.on(k.LoadError, t.onLoadError),
      t.onStateChange && this.on(k.StateChange, t.onStateChange),
      t.onSelect && this.on(k.Click, t.onSelect)
  }
  async load() {
    try {
      await this.init({ ...this.props })
    } catch (t) {
      this.eventManager.fire({ type: k.LoadError, data: t.message })
    }
  }
  async init({ src: t }) {
    if (
      ((this.src = t),
      this.insertScript(this.runtime + "/vgg_runtime.js"),
      !this.canvas)
    )
      throw new Error("Canvas element required")
    if (!this.src) throw new Error(Fe.missingErrorMessage)
    return new Promise((a) => {
      this.requestAnimationFrame = requestAnimationFrame(() =>
        this.checkState(a)
      )
    })
  }
  async checkState(t) {
    const a = this.runtime
    if (window._vgg_createWasmInstance) {
      const l = await window._vgg_createWasmInstance({
        noInitialRun: !0,
        canvas: this.canvas,
        locateFile: function (h, d) {
          return h.endsWith(".data") ? a + "/" + h : d + h
        },
      })
      if (l) {
        this.vggWasmInstance = l
        try {
          this.vggWasmInstance.ccall(
            "emscripten_main",
            "void",
            ["number", "number", "boolean"],
            [this.width, this.height, this.editMode]
          )
        } catch (d) {
          console.error(d)
        }
        this.vggSdk = new l.VggSdk()
        const h = globalThis.vggInstances ?? {}
        ;(this.vggInstanceKey = this.vggSdk.getEnv()),
          this.editMode
            ? Object.assign(h, {
                [this.vggInstanceKey]: {
                  instance: l,
                  listener: (d) => {
                    var b
                    const v = JSON.parse(d)
                    this.verbose && this.logger.logEvent(v),
                      v.type === "select" &&
                        ((b = this.observables.get(v.path)) == null ||
                          b.next("click"),
                        this.eventManager.fire({
                          type: k.Click,
                          data: v,
                        }))
                  },
                },
              })
            : Object.assign(h, {
                [this.vggInstanceKey]: {
                  instance: l,
                  listeners: /* @__PURE__ */ new Map(),
                  // Here we store the client's listeners, which will be mapped to the uniqueId and consumed in wasmInstance.
                },
              }),
          (globalThis.vggInstances = h),
          (this.state = T.Ready),
          this.eventManager.fire({ type: k.Load })
      } else
        (this.state = T.Error), this.eventManager.fire({ type: k.LoadError })
      cancelAnimationFrame(this.requestAnimationFrame), t(!0)
    } else
      this.requestAnimationFrame = requestAnimationFrame(() =>
        this.checkState(t)
      )
  }
  insertScript(t) {
    const a = document.createElement("script")
    ;(a.src = t), document.head.appendChild(a)
  }
  /**
   * Subscribe to VGG-generated events
   * @param type the type of event to subscribe to
   * @param callback callback to fire when the event occurs
   */
  on(t, a) {
    return (
      this.eventManager.add({
        type: t,
        callback: a,
      }),
      this
    )
  }
  /**
   * Render the Daruma file
   * @param darumaUrl
   * @param opts
   */
  async render(t, a) {
    if (
      ((this.width = (a == null ? void 0 : a.width) ?? this.width),
      (this.height = (a == null ? void 0 : a.height) ?? this.height),
      (this.editMode = (a == null ? void 0 : a.editMode) ?? this.editMode),
      !this.vggWasmInstance)
    )
      throw new Error("VGG Wasm instance not ready")
    const l = await fetch(t ?? this.src)
    if (!l.ok) throw new Error("Failed to fetch Daruma file")
    const h = await l.arrayBuffer(),
      d = new Int8Array(h)
    if (
      !this.vggWasmInstance.ccall(
        "load_file_from_mem",
        "boolean",
        // return type
        ["string", "array", "number"],
        // argument types
        ["name", d, d.length]
      )
    )
      throw new Error("Failed to load Daruma file")
  }
  $(t) {
    if (!this.vggSdk) throw new Error("VGG SDK not ready")
    const a = this.observables.get(t)
    if (!a) {
      const l = new yr(String(t), this.vggSdk)
      return this.observables.set(t, l), l
    }
    return a
  }
}
m(je, "missingErrorMessage", "Daruma source file required")
let re = je
typeof globalThis < "u" && (globalThis.VGG = re)
function kr(u) {
  const { src: t, runtime: a, ...l } = u,
    h = Q(null),
    d = Q(null),
    [b, v] = hr(T.Loading)
  return (
    xe(() => {
      h.current &&
        (async () => (
          (d.current = new re({
            src: t,
            runtime: a ?? "https://s5.vgg.cool/runtime/latest",
            canvas: h.current,
            ...l,
          })),
          await d.current.load(),
          d.current.state === T.Ready
            ? (await d.current.render(), v(T.Ready))
            : v(T.Error)
        ))()
    }, []),
    {
      canvasRef: h,
      vgg: d,
      isLoading: b === T.Loading,
      state: b,
    }
  )
}
var ee = { exports: {} },
  M = {}
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ce
function Rr() {
  return (
    Ce ||
      ((Ce = 1),
      process.env.NODE_ENV !== "production" &&
        (function () {
          var u = Pe,
            t = Symbol.for("react.element"),
            a = Symbol.for("react.portal"),
            l = Symbol.for("react.fragment"),
            h = Symbol.for("react.strict_mode"),
            d = Symbol.for("react.profiler"),
            b = Symbol.for("react.provider"),
            v = Symbol.for("react.context"),
            y = Symbol.for("react.forward_ref"),
            P = Symbol.for("react.suspense"),
            E = Symbol.for("react.suspense_list"),
            w = Symbol.for("react.memo"),
            x = Symbol.for("react.lazy"),
            $ = Symbol.for("react.offscreen"),
            te = Symbol.iterator,
            Ie = "@@iterator"
          function Ae(e) {
            if (e === null || typeof e != "object") return null
            var r = (te && e[te]) || e[Ie]
            return typeof r == "function" ? r : null
          }
          var F = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
          function R(e) {
            {
              for (
                var r = arguments.length,
                  n = new Array(r > 1 ? r - 1 : 0),
                  i = 1;
                i < r;
                i++
              )
                n[i - 1] = arguments[i]
              De("error", e, n)
            }
          }
          function De(e, r, n) {
            {
              var i = F.ReactDebugCurrentFrame,
                c = i.getStackAddendum()
              c !== "" && ((r += "%s"), (n = n.concat([c])))
              var f = n.map(function (o) {
                return String(o)
              })
              f.unshift("Warning: " + r),
                Function.prototype.apply.call(console[e], console, f)
            }
          }
          var Le = !1,
            Me = !1,
            We = !1,
            $e = !1,
            Ve = !1,
            ne
          ne = Symbol.for("react.module.reference")
          function Ge(e) {
            return !!(
              typeof e == "string" ||
              typeof e == "function" ||
              e === l ||
              e === d ||
              Ve ||
              e === h ||
              e === P ||
              e === E ||
              $e ||
              e === $ ||
              Le ||
              Me ||
              We ||
              (typeof e == "object" &&
                e !== null &&
                (e.$$typeof === x ||
                  e.$$typeof === w ||
                  e.$$typeof === b ||
                  e.$$typeof === v ||
                  e.$$typeof === y || // This needs to include all possible module reference object
                  // types supported by any Flight configuration anywhere since
                  // we don't know which Flight build this will end up being used
                  // with.
                  e.$$typeof === ne ||
                  e.getModuleId !== void 0))
            )
          }
          function Ye(e, r, n) {
            var i = e.displayName
            if (i) return i
            var c = r.displayName || r.name || ""
            return c !== "" ? n + "(" + c + ")" : n
          }
          function ae(e) {
            return e.displayName || "Context"
          }
          function C(e) {
            if (e == null) return null
            if (
              (typeof e.tag == "number" &&
                R(
                  "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
                ),
              typeof e == "function")
            )
              return e.displayName || e.name || null
            if (typeof e == "string") return e
            switch (e) {
              case l:
                return "Fragment"
              case a:
                return "Portal"
              case d:
                return "Profiler"
              case h:
                return "StrictMode"
              case P:
                return "Suspense"
              case E:
                return "SuspenseList"
            }
            if (typeof e == "object")
              switch (e.$$typeof) {
                case v:
                  var r = e
                  return ae(r) + ".Consumer"
                case b:
                  var n = e
                  return ae(n._context) + ".Provider"
                case y:
                  return Ye(e, e.render, "ForwardRef")
                case w:
                  var i = e.displayName || null
                  return i !== null ? i : C(e.type) || "Memo"
                case x: {
                  var c = e,
                    f = c._payload,
                    o = c._init
                  try {
                    return C(o(f))
                  } catch {
                    return null
                  }
                }
              }
            return null
          }
          var j = Object.assign,
            D = 0,
            ie,
            se,
            oe,
            le,
            ce,
            ue,
            fe
          function de() {}
          de.__reactDisabledLog = !0
          function Ne() {
            {
              if (D === 0) {
                ;(ie = console.log),
                  (se = console.info),
                  (oe = console.warn),
                  (le = console.error),
                  (ce = console.group),
                  (ue = console.groupCollapsed),
                  (fe = console.groupEnd)
                var e = {
                  configurable: !0,
                  enumerable: !0,
                  value: de,
                  writable: !0,
                }
                Object.defineProperties(console, {
                  info: e,
                  log: e,
                  warn: e,
                  error: e,
                  group: e,
                  groupCollapsed: e,
                  groupEnd: e,
                })
              }
              D++
            }
          }
          function Ue() {
            {
              if ((D--, D === 0)) {
                var e = {
                  configurable: !0,
                  enumerable: !0,
                  writable: !0,
                }
                Object.defineProperties(console, {
                  log: j({}, e, {
                    value: ie,
                  }),
                  info: j({}, e, {
                    value: se,
                  }),
                  warn: j({}, e, {
                    value: oe,
                  }),
                  error: j({}, e, {
                    value: le,
                  }),
                  group: j({}, e, {
                    value: ce,
                  }),
                  groupCollapsed: j({}, e, {
                    value: ue,
                  }),
                  groupEnd: j({}, e, {
                    value: fe,
                  }),
                })
              }
              D < 0 &&
                R(
                  "disabledDepth fell below zero. This is a bug in React. Please file an issue."
                )
            }
          }
          var q = F.ReactCurrentDispatcher,
            K
          function V(e, r, n) {
            {
              if (K === void 0)
                try {
                  throw Error()
                } catch (c) {
                  var i = c.stack.trim().match(/\n( *(at )?)/)
                  K = (i && i[1]) || ""
                }
              return (
                `
` +
                K +
                e
              )
            }
          }
          var B = !1,
            G
          {
            var qe = typeof WeakMap == "function" ? WeakMap : Map
            G = new qe()
          }
          function ve(e, r) {
            if (!e || B) return ""
            {
              var n = G.get(e)
              if (n !== void 0) return n
            }
            var i
            B = !0
            var c = Error.prepareStackTrace
            Error.prepareStackTrace = void 0
            var f
            ;(f = q.current), (q.current = null), Ne()
            try {
              if (r) {
                var o = function () {
                  throw Error()
                }
                if (
                  (Object.defineProperty(o.prototype, "props", {
                    set: function () {
                      throw Error()
                    },
                  }),
                  typeof Reflect == "object" && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(o, [])
                  } catch (O) {
                    i = O
                  }
                  Reflect.construct(e, [], o)
                } else {
                  try {
                    o.call()
                  } catch (O) {
                    i = O
                  }
                  e.call(o.prototype)
                }
              } else {
                try {
                  throw Error()
                } catch (O) {
                  i = O
                }
                e()
              }
            } catch (O) {
              if (O && i && typeof O.stack == "string") {
                for (
                  var s = O.stack.split(`
`),
                    _ = i.stack.split(`
`),
                    g = s.length - 1,
                    p = _.length - 1;
                  g >= 1 && p >= 0 && s[g] !== _[p];

                )
                  p--
                for (; g >= 1 && p >= 0; g--, p--)
                  if (s[g] !== _[p]) {
                    if (g !== 1 || p !== 1)
                      do
                        if ((g--, p--, p < 0 || s[g] !== _[p])) {
                          var S =
                            `
` + s[g].replace(" at new ", " at ")
                          return (
                            e.displayName &&
                              S.includes("<anonymous>") &&
                              (S = S.replace("<anonymous>", e.displayName)),
                            typeof e == "function" && G.set(e, S),
                            S
                          )
                        }
                      while (g >= 1 && p >= 0)
                    break
                  }
              }
            } finally {
              ;(B = !1), (q.current = f), Ue(), (Error.prepareStackTrace = c)
            }
            var A = e ? e.displayName || e.name : "",
              Te = A ? V(A) : ""
            return typeof e == "function" && G.set(e, Te), Te
          }
          function Ke(e, r, n) {
            return ve(e, !1)
          }
          function Be(e) {
            var r = e.prototype
            return !!(r && r.isReactComponent)
          }
          function Y(e, r, n) {
            if (e == null) return ""
            if (typeof e == "function") return ve(e, Be(e))
            if (typeof e == "string") return V(e)
            switch (e) {
              case P:
                return V("Suspense")
              case E:
                return V("SuspenseList")
            }
            if (typeof e == "object")
              switch (e.$$typeof) {
                case y:
                  return Ke(e.render)
                case w:
                  return Y(e.type, r, n)
                case x: {
                  var i = e,
                    c = i._payload,
                    f = i._init
                  try {
                    return Y(f(c), r, n)
                  } catch {}
                }
              }
            return ""
          }
          var N = Object.prototype.hasOwnProperty,
            he = {},
            ge = F.ReactDebugCurrentFrame
          function U(e) {
            if (e) {
              var r = e._owner,
                n = Y(e.type, e._source, r ? r.type : null)
              ge.setExtraStackFrame(n)
            } else ge.setExtraStackFrame(null)
          }
          function Je(e, r, n, i, c) {
            {
              var f = Function.call.bind(N)
              for (var o in e)
                if (f(e, o)) {
                  var s = void 0
                  try {
                    if (typeof e[o] != "function") {
                      var _ = Error(
                        (i || "React class") +
                          ": " +
                          n +
                          " type `" +
                          o +
                          "` is invalid; it must be a function, usually from the `prop-types` package, but received `" +
                          typeof e[o] +
                          "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                      )
                      throw ((_.name = "Invariant Violation"), _)
                    }
                    s = e[o](
                      r,
                      o,
                      i,
                      n,
                      null,
                      "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"
                    )
                  } catch (g) {
                    s = g
                  }
                  s &&
                    !(s instanceof Error) &&
                    (U(c),
                    R(
                      "%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).",
                      i || "React class",
                      n,
                      o,
                      typeof s
                    ),
                    U(null)),
                    s instanceof Error &&
                      !(s.message in he) &&
                      ((he[s.message] = !0),
                      U(c),
                      R("Failed %s type: %s", n, s.message),
                      U(null))
                }
            }
          }
          var ze = Array.isArray
          function J(e) {
            return ze(e)
          }
          function He(e) {
            {
              var r = typeof Symbol == "function" && Symbol.toStringTag,
                n =
                  (r && e[Symbol.toStringTag]) || e.constructor.name || "Object"
              return n
            }
          }
          function Xe(e) {
            try {
              return pe(e), !1
            } catch {
              return !0
            }
          }
          function pe(e) {
            return "" + e
          }
          function me(e) {
            if (Xe(e))
              return (
                R(
                  "The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.",
                  He(e)
                ),
                pe(e)
              )
          }
          var L = F.ReactCurrentOwner,
            Ze = {
              key: !0,
              ref: !0,
              __self: !0,
              __source: !0,
            },
            be,
            ye,
            z
          z = {}
          function Qe(e) {
            if (N.call(e, "ref")) {
              var r = Object.getOwnPropertyDescriptor(e, "ref").get
              if (r && r.isReactWarning) return !1
            }
            return e.ref !== void 0
          }
          function er(e) {
            if (N.call(e, "key")) {
              var r = Object.getOwnPropertyDescriptor(e, "key").get
              if (r && r.isReactWarning) return !1
            }
            return e.key !== void 0
          }
          function rr(e, r) {
            if (
              typeof e.ref == "string" &&
              L.current &&
              r &&
              L.current.stateNode !== r
            ) {
              var n = C(L.current.type)
              z[n] ||
                (R(
                  'Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref',
                  C(L.current.type),
                  e.ref
                ),
                (z[n] = !0))
            }
          }
          function tr(e, r) {
            {
              var n = function () {
                be ||
                  ((be = !0),
                  R(
                    "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                    r
                  ))
              }
              ;(n.isReactWarning = !0),
                Object.defineProperty(e, "key", {
                  get: n,
                  configurable: !0,
                })
            }
          }
          function nr(e, r) {
            {
              var n = function () {
                ye ||
                  ((ye = !0),
                  R(
                    "%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                    r
                  ))
              }
              ;(n.isReactWarning = !0),
                Object.defineProperty(e, "ref", {
                  get: n,
                  configurable: !0,
                })
            }
          }
          var ar = function (e, r, n, i, c, f, o) {
            var s = {
              // This tag allows us to uniquely identify this as a React Element
              $$typeof: t,
              // Built-in properties that belong on the element
              type: e,
              key: r,
              ref: n,
              props: o,
              // Record the component responsible for creating this element.
              _owner: f,
            }
            return (
              (s._store = {}),
              Object.defineProperty(s._store, "validated", {
                configurable: !1,
                enumerable: !1,
                writable: !0,
                value: !1,
              }),
              Object.defineProperty(s, "_self", {
                configurable: !1,
                enumerable: !1,
                writable: !1,
                value: i,
              }),
              Object.defineProperty(s, "_source", {
                configurable: !1,
                enumerable: !1,
                writable: !1,
                value: c,
              }),
              Object.freeze && (Object.freeze(s.props), Object.freeze(s)),
              s
            )
          }
          function ir(e, r, n, i, c) {
            {
              var f,
                o = {},
                s = null,
                _ = null
              n !== void 0 && (me(n), (s = "" + n)),
                er(r) && (me(r.key), (s = "" + r.key)),
                Qe(r) && ((_ = r.ref), rr(r, c))
              for (f in r)
                N.call(r, f) && !Ze.hasOwnProperty(f) && (o[f] = r[f])
              if (e && e.defaultProps) {
                var g = e.defaultProps
                for (f in g) o[f] === void 0 && (o[f] = g[f])
              }
              if (s || _) {
                var p =
                  typeof e == "function"
                    ? e.displayName || e.name || "Unknown"
                    : e
                s && tr(o, p), _ && nr(o, p)
              }
              return ar(e, s, _, c, i, L.current, o)
            }
          }
          var H = F.ReactCurrentOwner,
            Ee = F.ReactDebugCurrentFrame
          function I(e) {
            if (e) {
              var r = e._owner,
                n = Y(e.type, e._source, r ? r.type : null)
              Ee.setExtraStackFrame(n)
            } else Ee.setExtraStackFrame(null)
          }
          var X
          X = !1
          function Z(e) {
            return typeof e == "object" && e !== null && e.$$typeof === t
          }
          function Re() {
            {
              if (H.current) {
                var e = C(H.current.type)
                if (e)
                  return (
                    `

Check the render method of \`` +
                    e +
                    "`."
                  )
              }
              return ""
            }
          }
          function sr(e) {
            {
              if (e !== void 0) {
                var r = e.fileName.replace(/^.*[\\\/]/, ""),
                  n = e.lineNumber
                return (
                  `

Check your code at ` +
                  r +
                  ":" +
                  n +
                  "."
                )
              }
              return ""
            }
          }
          var _e = {}
          function or(e) {
            {
              var r = Re()
              if (!r) {
                var n = typeof e == "string" ? e : e.displayName || e.name
                n &&
                  (r =
                    `

Check the top-level render call using <` +
                    n +
                    ">.")
              }
              return r
            }
          }
          function we(e, r) {
            {
              if (!e._store || e._store.validated || e.key != null) return
              e._store.validated = !0
              var n = or(r)
              if (_e[n]) return
              _e[n] = !0
              var i = ""
              e &&
                e._owner &&
                e._owner !== H.current &&
                (i = " It was passed a child from " + C(e._owner.type) + "."),
                I(e),
                R(
                  'Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.',
                  n,
                  i
                ),
                I(null)
            }
          }
          function Se(e, r) {
            {
              if (typeof e != "object") return
              if (J(e))
                for (var n = 0; n < e.length; n++) {
                  var i = e[n]
                  Z(i) && we(i, r)
                }
              else if (Z(e)) e._store && (e._store.validated = !0)
              else if (e) {
                var c = Ae(e)
                if (typeof c == "function" && c !== e.entries)
                  for (var f = c.call(e), o; !(o = f.next()).done; )
                    Z(o.value) && we(o.value, r)
              }
            }
          }
          function lr(e) {
            {
              var r = e.type
              if (r == null || typeof r == "string") return
              var n
              if (typeof r == "function") n = r.propTypes
              else if (
                typeof r == "object" &&
                (r.$$typeof === y || // Note: Memo only checks outer props here.
                  // Inner props are checked in the reconciler.
                  r.$$typeof === w)
              )
                n = r.propTypes
              else return
              if (n) {
                var i = C(r)
                Je(n, e.props, "prop", i, e)
              } else if (r.PropTypes !== void 0 && !X) {
                X = !0
                var c = C(r)
                R(
                  "Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?",
                  c || "Unknown"
                )
              }
              typeof r.getDefaultProps == "function" &&
                !r.getDefaultProps.isReactClassApproved &&
                R(
                  "getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead."
                )
            }
          }
          function cr(e) {
            {
              for (var r = Object.keys(e.props), n = 0; n < r.length; n++) {
                var i = r[n]
                if (i !== "children" && i !== "key") {
                  I(e),
                    R(
                      "Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.",
                      i
                    ),
                    I(null)
                  break
                }
              }
              e.ref !== null &&
                (I(e),
                R("Invalid attribute `ref` supplied to `React.Fragment`."),
                I(null))
            }
          }
          function ke(e, r, n, i, c, f) {
            {
              var o = Ge(e)
              if (!o) {
                var s = ""
                ;(e === void 0 ||
                  (typeof e == "object" &&
                    e !== null &&
                    Object.keys(e).length === 0)) &&
                  (s +=
                    " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.")
                var _ = sr(c)
                _ ? (s += _) : (s += Re())
                var g
                e === null
                  ? (g = "null")
                  : J(e)
                    ? (g = "array")
                    : e !== void 0 && e.$$typeof === t
                      ? ((g = "<" + (C(e.type) || "Unknown") + " />"),
                        (s =
                          " Did you accidentally export a JSX literal instead of a component?"))
                      : (g = typeof e),
                  R(
                    "React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",
                    g,
                    s
                  )
              }
              var p = ir(e, r, n, c, f)
              if (p == null) return p
              if (o) {
                var S = r.children
                if (S !== void 0)
                  if (i)
                    if (J(S)) {
                      for (var A = 0; A < S.length; A++) Se(S[A], e)
                      Object.freeze && Object.freeze(S)
                    } else
                      R(
                        "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
                      )
                  else Se(S, e)
              }
              return e === l ? cr(p) : lr(p), p
            }
          }
          function ur(e, r, n) {
            return ke(e, r, n, !0)
          }
          function fr(e, r, n) {
            return ke(e, r, n, !1)
          }
          var dr = fr,
            vr = ur
          ;(M.Fragment = l), (M.jsx = dr), (M.jsxs = vr)
        })()),
    M
  )
}
var W = {}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Oe
function _r() {
  if (Oe) return W
  Oe = 1
  var u = Pe,
    t = Symbol.for("react.element"),
    a = Symbol.for("react.fragment"),
    l = Object.prototype.hasOwnProperty,
    h = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    d = { key: !0, ref: !0, __self: !0, __source: !0 }
  function b(v, y, P) {
    var E,
      w = {},
      x = null,
      $ = null
    P !== void 0 && (x = "" + P),
      y.key !== void 0 && (x = "" + y.key),
      y.ref !== void 0 && ($ = y.ref)
    for (E in y) l.call(y, E) && !d.hasOwnProperty(E) && (w[E] = y[E])
    if (v && v.defaultProps)
      for (E in ((y = v.defaultProps), y)) w[E] === void 0 && (w[E] = y[E])
    return { $$typeof: t, type: v, key: x, ref: $, props: w, _owner: h.current }
  }
  return (W.Fragment = a), (W.jsx = b), (W.jsxs = b), W
}
process.env.NODE_ENV === "production"
  ? (ee.exports = _r())
  : (ee.exports = Rr())
var wr = ee.exports
function Tr(u) {
  const {
      src: t,
      canvasStyle: a,
      runtime: l,
      editMode: h,
      verbose: d,
      onLoad: b,
      onLoadError: v,
      onStateChange: y,
      onSelect: P,
    } = u,
    E = Q(null)
  return (
    xe(() => {
      E.current &&
        (async () => {
          const w = new re({
            src: t ?? "https://s5.vgg.cool/vgg.daruma",
            runtime: l ?? "https://s5.vgg.cool/runtime/latest",
            editMode: h,
            verbose: d,
            canvas: E.current,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onLoad: b,
            onLoadError: v,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onStateChange: y,
            onSelect: P,
          })
          await w.load(),
            w.state === T.Ready
              ? (await w.render(),
                b == null ||
                  b(
                    {
                      type: k.Load,
                      data: "",
                    },
                    w
                  ))
              : v == null ||
                v({
                  type: k.LoadError,
                  data: "",
                })
        })()
    }, []),
    /* @__PURE__ */ wr.jsx("canvas", { style: a, ref: E })
  )
}
export { k as EventType, T as State, Tr as VGGRender, kr as useVGG }
