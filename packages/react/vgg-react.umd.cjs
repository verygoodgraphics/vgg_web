;(function (O, S) {
  typeof exports == "object" && typeof module < "u"
    ? S(exports, require("react"))
    : typeof define == "function" && define.amd
      ? define(["exports", "react"], S)
      : ((O = typeof globalThis < "u" ? globalThis : O || self),
        S((O["vgg-react"] = {}), O.React))
})(this, function (O, S) {
  "use strict"
  var Fe = Object.defineProperty,
    Ie = (u, r, a) =>
      r in u
        ? Fe(u, r, { enumerable: !0, configurable: !0, writable: !0, value: a })
        : (u[r] = a),
    p = (u, r, a) => (Ie(u, typeof r != "symbol" ? r + "" : r, a), a),
    T = ((u) => (
      (u.Load = "load"),
      (u.LoadError = "loaderror"),
      (u.StateChange = "statechange"),
      (u.Click = "click"),
      u
    ))(T || {}),
    C = ((u) => (
      (u.Loading = "loading"), (u.Ready = "ready"), (u.Error = "error"), u
    ))(C || {})
  class Ae {
    constructor(r = []) {
      this.listeners = r
    }
    getListeners(r) {
      return this.listeners.filter((a) => a.type === r)
    }
    add(r) {
      this.listeners.includes(r) || this.listeners.push(r)
    }
    remove(r) {
      for (let a = 0; a < this.listeners.length; a++) {
        const l = this.listeners[a]
        if (l.type === r.type && l.callback === r.callback) {
          this.listeners.splice(a, 1)
          break
        }
      }
    }
    removeAll(r) {
      r
        ? this.listeners
            .filter((a) => a.type === r)
            .forEach((a) => this.remove(a))
        : this.listeners.splice(0, this.listeners.length)
    }
    fire(r, a) {
      this.getListeners(r.type).forEach((l) => l.callback(r, a))
    }
  }
  const De = (u = 21) =>
    crypto
      .getRandomValues(new Uint8Array(u))
      .reduce(
        (r, a) =>
          (r +=
            (a &= 63) < 36
              ? a.toString(36)
              : a < 62
                ? (a - 26).toString(36).toUpperCase()
                : a > 62
                  ? "-"
                  : "_"),
        ""
      )
  class Le {
    constructor(r, a) {
      p(this, "selector"),
        p(this, "vggSdk"),
        (this.selector = r),
        (this.vggSdk = a)
    }
    on(r, a) {
      return this.addEventListener(this.selector, r, a), this
    }
    update(r) {
      if (!this.vggSdk) throw new Error("VGG SDK not ready")
      this.vggSdk.updateElement(this.selector, r)
    }
    addEventListener(r, a, l) {
      if (!this.vggSdk) throw new Error("VGG SDK not ready")
      const h = (y) => l(this, y),
        d = De(7),
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
      this.vggSdk.addEventListener(r, a, b)
      const v = globalThis.vggInstances[this.vggSdk.getEnv()]
      return (
        v && v.listeners.set(d, h),
        {
          selector: r,
          removeEventListener: () => {
            this.vggSdk.removeEventListener(r, a, b), v.listeners.delete(d)
          },
        }
      )
    }
  }
  class Me {
    constructor(r) {
      this.debug = r
    }
    logEvent(r) {
      this.debug &&
        console.log(
          `%cVGGEvent::${r.type}`,
          "background: #f59e0b; color: #78350f; font-weight: bold; border-radius: 2px; padding: 0 2.5px;",
          r.id ? `${r.id} → ${r.path}` : ""
        )
    }
  }
  const ne = class xe {
    constructor(r) {
      p(this, "props"),
        p(this, "defaultRuntime", "https://s5.vgg.cool/runtime/latest"),
        p(this, "canvas"),
        p(this, "width", 0),
        p(this, "height", 0),
        p(this, "editMode", !1),
        p(this, "verbose"),
        p(this, "src"),
        p(this, "runtime"),
        p(this, "vggInstanceKey", ""),
        p(this, "eventManager"),
        p(this, "state", C.Loading),
        p(this, "vggWasmInstance", null),
        p(this, "vggSdk", null),
        p(this, "observables", new Map()),
        p(this, "requestAnimationFrame"),
        p(this, "logger")
      var a, l
      ;(this.props = r),
        (this.canvas = r.canvas),
        (this.src = r.src),
        (this.runtime = r.runtime || this.defaultRuntime),
        (this.width = ((a = this.canvas) == null ? void 0 : a.width) ?? 0),
        (this.height = ((l = this.canvas) == null ? void 0 : l.height) ?? 0),
        (this.editMode = r.editMode ?? !1),
        (this.verbose = r.verbose ?? !1),
        (this.logger = new Me(this.verbose)),
        (this.eventManager = new Ae()),
        r.onLoad && this.on(T.Load, r.onLoad),
        r.onLoadError && this.on(T.LoadError, r.onLoadError),
        r.onStateChange && this.on(T.StateChange, r.onStateChange),
        r.onSelect && this.on(T.Click, r.onSelect)
    }
    async load() {
      try {
        await this.init({ ...this.props })
      } catch (r) {
        this.eventManager.fire({ type: T.LoadError, data: r.message })
      }
    }
    async init({ src: r }) {
      if (
        ((this.src = r),
        this.insertScript(this.runtime + "/vgg_runtime.js"),
        !this.canvas)
      )
        throw new Error("Canvas element required")
      if (!this.src) throw new Error(xe.missingErrorMessage)
      return new Promise((a) => {
        this.requestAnimationFrame = requestAnimationFrame(() =>
          this.checkState(a)
        )
      })
    }
    async checkState(r) {
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
                          this.eventManager.fire({ type: T.Click, data: v }))
                    },
                  },
                })
              : Object.assign(h, {
                  [this.vggInstanceKey]: { instance: l, listeners: new Map() },
                }),
            (globalThis.vggInstances = h),
            (this.state = C.Ready),
            this.eventManager.fire({ type: T.Load })
        } else
          (this.state = C.Error), this.eventManager.fire({ type: T.LoadError })
        cancelAnimationFrame(this.requestAnimationFrame), r(!0)
      } else
        this.requestAnimationFrame = requestAnimationFrame(() =>
          this.checkState(r)
        )
    }
    insertScript(r) {
      const a = document.createElement("script")
      ;(a.src = r), document.head.appendChild(a)
    }
    on(r, a) {
      return this.eventManager.add({ type: r, callback: a }), this
    }
    async render(r, a) {
      if (
        ((this.width = (a == null ? void 0 : a.width) ?? this.width),
        (this.height = (a == null ? void 0 : a.height) ?? this.height),
        (this.editMode = (a == null ? void 0 : a.editMode) ?? this.editMode),
        !this.vggWasmInstance)
      )
        throw new Error("VGG Wasm instance not ready")
      const l = await fetch(r ?? this.src)
      if (!l.ok) throw new Error("Failed to fetch Daruma file")
      const h = await l.arrayBuffer(),
        d = new Int8Array(h)
      if (
        !this.vggWasmInstance.ccall(
          "load_file_from_mem",
          "boolean",
          ["string", "array", "number"],
          ["name", d, d.length]
        )
      )
        throw new Error("Failed to load Daruma file")
    }
    $(r) {
      if (!this.vggSdk) throw new Error("VGG SDK not ready")
      const a = this.observables.get(r)
      if (!a) {
        const l = new Le(String(r), this.vggSdk)
        return this.observables.set(r, l), l
      }
      return a
    }
  }
  p(ne, "missingErrorMessage", "Daruma source file required")
  let J = ne
  typeof globalThis < "u" && (globalThis.VGG = J)
  function We(u) {
    const { src: r, runtime: a, ...l } = u,
      h = S.useRef(null),
      d = S.useRef(null),
      [b, v] = S.useState(C.Loading)
    return (
      S.useEffect(() => {
        h.current &&
          (async () => (
            (d.current = new J({
              src: r,
              runtime: a ?? "https://s5.vgg.cool/runtime/latest",
              canvas: h.current,
              ...l,
            })),
            await d.current.load(),
            d.current.state === C.Ready
              ? (await d.current.render(), v(C.Ready))
              : v(C.Error)
          ))()
      }, []),
      { canvasRef: h, vgg: d, isLoading: b === C.Loading, state: b }
    )
  }
  var q = { exports: {} },
    M = {}
  /**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */ var ae
  function Ve() {
    return (
      ae ||
        ((ae = 1),
        process.env.NODE_ENV !== "production" &&
          (function () {
            var u = S,
              r = Symbol.for("react.element"),
              a = Symbol.for("react.portal"),
              l = Symbol.for("react.fragment"),
              h = Symbol.for("react.strict_mode"),
              d = Symbol.for("react.profiler"),
              b = Symbol.for("react.provider"),
              v = Symbol.for("react.context"),
              y = Symbol.for("react.forward_ref"),
              x = Symbol.for("react.suspense"),
              E = Symbol.for("react.suspense_list"),
              w = Symbol.for("react.memo"),
              F = Symbol.for("react.lazy"),
              Y = Symbol.for("react.offscreen"),
              se = Symbol.iterator,
              Ue = "@@iterator"
            function $e(e) {
              if (e === null || typeof e != "object") return null
              var t = (se && e[se]) || e[Ue]
              return typeof t == "function" ? t : null
            }
            var A = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            function R(e) {
              {
                for (
                  var t = arguments.length,
                    n = new Array(t > 1 ? t - 1 : 0),
                    i = 1;
                  i < t;
                  i++
                )
                  n[i - 1] = arguments[i]
                Ke("error", e, n)
              }
            }
            function Ke(e, t, n) {
              {
                var i = A.ReactDebugCurrentFrame,
                  c = i.getStackAddendum()
                c !== "" && ((t += "%s"), (n = n.concat([c])))
                var f = n.map(function (o) {
                  return String(o)
                })
                f.unshift("Warning: " + t),
                  Function.prototype.apply.call(console[e], console, f)
              }
            }
            var Be = !1,
              Je = !1,
              qe = !1,
              ze = !1,
              He = !1,
              oe
            oe = Symbol.for("react.module.reference")
            function Xe(e) {
              return !!(
                typeof e == "string" ||
                typeof e == "function" ||
                e === l ||
                e === d ||
                He ||
                e === h ||
                e === x ||
                e === E ||
                ze ||
                e === Y ||
                Be ||
                Je ||
                qe ||
                (typeof e == "object" &&
                  e !== null &&
                  (e.$$typeof === F ||
                    e.$$typeof === w ||
                    e.$$typeof === b ||
                    e.$$typeof === v ||
                    e.$$typeof === y ||
                    e.$$typeof === oe ||
                    e.getModuleId !== void 0))
              )
            }
            function Ze(e, t, n) {
              var i = e.displayName
              if (i) return i
              var c = t.displayName || t.name || ""
              return c !== "" ? n + "(" + c + ")" : n
            }
            function le(e) {
              return e.displayName || "Context"
            }
            function P(e) {
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
                case x:
                  return "Suspense"
                case E:
                  return "SuspenseList"
              }
              if (typeof e == "object")
                switch (e.$$typeof) {
                  case v:
                    var t = e
                    return le(t) + ".Consumer"
                  case b:
                    var n = e
                    return le(n._context) + ".Provider"
                  case y:
                    return Ze(e, e.render, "ForwardRef")
                  case w:
                    var i = e.displayName || null
                    return i !== null ? i : P(e.type) || "Memo"
                  case F: {
                    var c = e,
                      f = c._payload,
                      o = c._init
                    try {
                      return P(o(f))
                    } catch {
                      return null
                    }
                  }
                }
              return null
            }
            var I = Object.assign,
              V = 0,
              ce,
              ue,
              fe,
              de,
              ve,
              he,
              ge
            function pe() {}
            pe.__reactDisabledLog = !0
            function Qe() {
              {
                if (V === 0) {
                  ;(ce = console.log),
                    (ue = console.info),
                    (fe = console.warn),
                    (de = console.error),
                    (ve = console.group),
                    (he = console.groupCollapsed),
                    (ge = console.groupEnd)
                  var e = {
                    configurable: !0,
                    enumerable: !0,
                    value: pe,
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
                V++
              }
            }
            function et() {
              {
                if ((V--, V === 0)) {
                  var e = { configurable: !0, enumerable: !0, writable: !0 }
                  Object.defineProperties(console, {
                    log: I({}, e, { value: ce }),
                    info: I({}, e, { value: ue }),
                    warn: I({}, e, { value: fe }),
                    error: I({}, e, { value: de }),
                    group: I({}, e, { value: ve }),
                    groupCollapsed: I({}, e, { value: he }),
                    groupEnd: I({}, e, { value: ge }),
                  })
                }
                V < 0 &&
                  R(
                    "disabledDepth fell below zero. This is a bug in React. Please file an issue."
                  )
              }
            }
            var z = A.ReactCurrentDispatcher,
              H
            function N(e, t, n) {
              {
                if (H === void 0)
                  try {
                    throw Error()
                  } catch (c) {
                    var i = c.stack.trim().match(/\n( *(at )?)/)
                    H = (i && i[1]) || ""
                  }
                return (
                  `
` +
                  H +
                  e
                )
              }
            }
            var X = !1,
              U
            {
              var tt = typeof WeakMap == "function" ? WeakMap : Map
              U = new tt()
            }
            function me(e, t) {
              if (!e || X) return ""
              {
                var n = U.get(e)
                if (n !== void 0) return n
              }
              var i
              X = !0
              var c = Error.prepareStackTrace
              Error.prepareStackTrace = void 0
              var f
              ;(f = z.current), (z.current = null), Qe()
              try {
                if (t) {
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
                    } catch (j) {
                      i = j
                    }
                    Reflect.construct(e, [], o)
                  } else {
                    try {
                      o.call()
                    } catch (j) {
                      i = j
                    }
                    e.call(o.prototype)
                  }
                } else {
                  try {
                    throw Error()
                  } catch (j) {
                    i = j
                  }
                  e()
                }
              } catch (j) {
                if (j && i && typeof j.stack == "string") {
                  for (
                    var s = j.stack.split(`
`),
                      _ = i.stack.split(`
`),
                      g = s.length - 1,
                      m = _.length - 1;
                    g >= 1 && m >= 0 && s[g] !== _[m];

                  )
                    m--
                  for (; g >= 1 && m >= 0; g--, m--)
                    if (s[g] !== _[m]) {
                      if (g !== 1 || m !== 1)
                        do
                          if ((g--, m--, m < 0 || s[g] !== _[m])) {
                            var k =
                              `
` + s[g].replace(" at new ", " at ")
                            return (
                              e.displayName &&
                                k.includes("<anonymous>") &&
                                (k = k.replace("<anonymous>", e.displayName)),
                              typeof e == "function" && U.set(e, k),
                              k
                            )
                          }
                        while (g >= 1 && m >= 0)
                      break
                    }
                }
              } finally {
                ;(X = !1), (z.current = f), et(), (Error.prepareStackTrace = c)
              }
              var L = e ? e.displayName || e.name : "",
                je = L ? N(L) : ""
              return typeof e == "function" && U.set(e, je), je
            }
            function rt(e, t, n) {
              return me(e, !1)
            }
            function nt(e) {
              var t = e.prototype
              return !!(t && t.isReactComponent)
            }
            function $(e, t, n) {
              if (e == null) return ""
              if (typeof e == "function") return me(e, nt(e))
              if (typeof e == "string") return N(e)
              switch (e) {
                case x:
                  return N("Suspense")
                case E:
                  return N("SuspenseList")
              }
              if (typeof e == "object")
                switch (e.$$typeof) {
                  case y:
                    return rt(e.render)
                  case w:
                    return $(e.type, t, n)
                  case F: {
                    var i = e,
                      c = i._payload,
                      f = i._init
                    try {
                      return $(f(c), t, n)
                    } catch {}
                  }
                }
              return ""
            }
            var K = Object.prototype.hasOwnProperty,
              be = {},
              ye = A.ReactDebugCurrentFrame
            function B(e) {
              if (e) {
                var t = e._owner,
                  n = $(e.type, e._source, t ? t.type : null)
                ye.setExtraStackFrame(n)
              } else ye.setExtraStackFrame(null)
            }
            function at(e, t, n, i, c) {
              {
                var f = Function.call.bind(K)
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
                        t,
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
                      (B(c),
                      R(
                        "%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).",
                        i || "React class",
                        n,
                        o,
                        typeof s
                      ),
                      B(null)),
                      s instanceof Error &&
                        !(s.message in be) &&
                        ((be[s.message] = !0),
                        B(c),
                        R("Failed %s type: %s", n, s.message),
                        B(null))
                  }
              }
            }
            var it = Array.isArray
            function Z(e) {
              return it(e)
            }
            function st(e) {
              {
                var t = typeof Symbol == "function" && Symbol.toStringTag,
                  n =
                    (t && e[Symbol.toStringTag]) ||
                    e.constructor.name ||
                    "Object"
                return n
              }
            }
            function ot(e) {
              try {
                return Ee(e), !1
              } catch {
                return !0
              }
            }
            function Ee(e) {
              return "" + e
            }
            function Re(e) {
              if (ot(e))
                return (
                  R(
                    "The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.",
                    st(e)
                  ),
                  Ee(e)
                )
            }
            var G = A.ReactCurrentOwner,
              lt = { key: !0, ref: !0, __self: !0, __source: !0 },
              _e,
              we,
              Q
            Q = {}
            function ct(e) {
              if (K.call(e, "ref")) {
                var t = Object.getOwnPropertyDescriptor(e, "ref").get
                if (t && t.isReactWarning) return !1
              }
              return e.ref !== void 0
            }
            function ut(e) {
              if (K.call(e, "key")) {
                var t = Object.getOwnPropertyDescriptor(e, "key").get
                if (t && t.isReactWarning) return !1
              }
              return e.key !== void 0
            }
            function ft(e, t) {
              if (
                typeof e.ref == "string" &&
                G.current &&
                t &&
                G.current.stateNode !== t
              ) {
                var n = P(G.current.type)
                Q[n] ||
                  (R(
                    'Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref',
                    P(G.current.type),
                    e.ref
                  ),
                  (Q[n] = !0))
              }
            }
            function dt(e, t) {
              {
                var n = function () {
                  _e ||
                    ((_e = !0),
                    R(
                      "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                      t
                    ))
                }
                ;(n.isReactWarning = !0),
                  Object.defineProperty(e, "key", { get: n, configurable: !0 })
              }
            }
            function vt(e, t) {
              {
                var n = function () {
                  we ||
                    ((we = !0),
                    R(
                      "%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                      t
                    ))
                }
                ;(n.isReactWarning = !0),
                  Object.defineProperty(e, "ref", { get: n, configurable: !0 })
              }
            }
            var ht = function (e, t, n, i, c, f, o) {
              var s = {
                $$typeof: r,
                type: e,
                key: t,
                ref: n,
                props: o,
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
            function gt(e, t, n, i, c) {
              {
                var f,
                  o = {},
                  s = null,
                  _ = null
                n !== void 0 && (Re(n), (s = "" + n)),
                  ut(t) && (Re(t.key), (s = "" + t.key)),
                  ct(t) && ((_ = t.ref), ft(t, c))
                for (f in t)
                  K.call(t, f) && !lt.hasOwnProperty(f) && (o[f] = t[f])
                if (e && e.defaultProps) {
                  var g = e.defaultProps
                  for (f in g) o[f] === void 0 && (o[f] = g[f])
                }
                if (s || _) {
                  var m =
                    typeof e == "function"
                      ? e.displayName || e.name || "Unknown"
                      : e
                  s && dt(o, m), _ && vt(o, m)
                }
                return ht(e, s, _, c, i, G.current, o)
              }
            }
            var ee = A.ReactCurrentOwner,
              Se = A.ReactDebugCurrentFrame
            function D(e) {
              if (e) {
                var t = e._owner,
                  n = $(e.type, e._source, t ? t.type : null)
                Se.setExtraStackFrame(n)
              } else Se.setExtraStackFrame(null)
            }
            var te
            te = !1
            function re(e) {
              return typeof e == "object" && e !== null && e.$$typeof === r
            }
            function Te() {
              {
                if (ee.current) {
                  var e = P(ee.current.type)
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
            function pt(e) {
              {
                if (e !== void 0) {
                  var t = e.fileName.replace(/^.*[\\\/]/, ""),
                    n = e.lineNumber
                  return (
                    `

Check your code at ` +
                    t +
                    ":" +
                    n +
                    "."
                  )
                }
                return ""
              }
            }
            var ke = {}
            function mt(e) {
              {
                var t = Te()
                if (!t) {
                  var n = typeof e == "string" ? e : e.displayName || e.name
                  n &&
                    (t =
                      `

Check the top-level render call using <` +
                      n +
                      ">.")
                }
                return t
              }
            }
            function Ce(e, t) {
              {
                if (!e._store || e._store.validated || e.key != null) return
                e._store.validated = !0
                var n = mt(t)
                if (ke[n]) return
                ke[n] = !0
                var i = ""
                e &&
                  e._owner &&
                  e._owner !== ee.current &&
                  (i = " It was passed a child from " + P(e._owner.type) + "."),
                  D(e),
                  R(
                    'Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.',
                    n,
                    i
                  ),
                  D(null)
              }
            }
            function Oe(e, t) {
              {
                if (typeof e != "object") return
                if (Z(e))
                  for (var n = 0; n < e.length; n++) {
                    var i = e[n]
                    re(i) && Ce(i, t)
                  }
                else if (re(e)) e._store && (e._store.validated = !0)
                else if (e) {
                  var c = $e(e)
                  if (typeof c == "function" && c !== e.entries)
                    for (var f = c.call(e), o; !(o = f.next()).done; )
                      re(o.value) && Ce(o.value, t)
                }
              }
            }
            function bt(e) {
              {
                var t = e.type
                if (t == null || typeof t == "string") return
                var n
                if (typeof t == "function") n = t.propTypes
                else if (
                  typeof t == "object" &&
                  (t.$$typeof === y || t.$$typeof === w)
                )
                  n = t.propTypes
                else return
                if (n) {
                  var i = P(t)
                  at(n, e.props, "prop", i, e)
                } else if (t.PropTypes !== void 0 && !te) {
                  te = !0
                  var c = P(t)
                  R(
                    "Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?",
                    c || "Unknown"
                  )
                }
                typeof t.getDefaultProps == "function" &&
                  !t.getDefaultProps.isReactClassApproved &&
                  R(
                    "getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead."
                  )
              }
            }
            function yt(e) {
              {
                for (var t = Object.keys(e.props), n = 0; n < t.length; n++) {
                  var i = t[n]
                  if (i !== "children" && i !== "key") {
                    D(e),
                      R(
                        "Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.",
                        i
                      ),
                      D(null)
                    break
                  }
                }
                e.ref !== null &&
                  (D(e),
                  R("Invalid attribute `ref` supplied to `React.Fragment`."),
                  D(null))
              }
            }
            function Pe(e, t, n, i, c, f) {
              {
                var o = Xe(e)
                if (!o) {
                  var s = ""
                  ;(e === void 0 ||
                    (typeof e == "object" &&
                      e !== null &&
                      Object.keys(e).length === 0)) &&
                    (s +=
                      " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.")
                  var _ = pt(c)
                  _ ? (s += _) : (s += Te())
                  var g
                  e === null
                    ? (g = "null")
                    : Z(e)
                      ? (g = "array")
                      : e !== void 0 && e.$$typeof === r
                        ? ((g = "<" + (P(e.type) || "Unknown") + " />"),
                          (s =
                            " Did you accidentally export a JSX literal instead of a component?"))
                        : (g = typeof e),
                    R(
                      "React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",
                      g,
                      s
                    )
                }
                var m = gt(e, t, n, c, f)
                if (m == null) return m
                if (o) {
                  var k = t.children
                  if (k !== void 0)
                    if (i)
                      if (Z(k)) {
                        for (var L = 0; L < k.length; L++) Oe(k[L], e)
                        Object.freeze && Object.freeze(k)
                      } else
                        R(
                          "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
                        )
                    else Oe(k, e)
                }
                return e === l ? yt(m) : bt(m), m
              }
            }
            function Et(e, t, n) {
              return Pe(e, t, n, !0)
            }
            function Rt(e, t, n) {
              return Pe(e, t, n, !1)
            }
            var _t = Rt,
              wt = Et
            ;(M.Fragment = l), (M.jsx = _t), (M.jsxs = wt)
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
   */ var ie
  function Ge() {
    if (ie) return W
    ie = 1
    var u = S,
      r = Symbol.for("react.element"),
      a = Symbol.for("react.fragment"),
      l = Object.prototype.hasOwnProperty,
      h =
        u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
      d = { key: !0, ref: !0, __self: !0, __source: !0 }
    function b(v, y, x) {
      var E,
        w = {},
        F = null,
        Y = null
      x !== void 0 && (F = "" + x),
        y.key !== void 0 && (F = "" + y.key),
        y.ref !== void 0 && (Y = y.ref)
      for (E in y) l.call(y, E) && !d.hasOwnProperty(E) && (w[E] = y[E])
      if (v && v.defaultProps)
        for (E in ((y = v.defaultProps), y)) w[E] === void 0 && (w[E] = y[E])
      return {
        $$typeof: r,
        type: v,
        key: F,
        ref: Y,
        props: w,
        _owner: h.current,
      }
    }
    return (W.Fragment = a), (W.jsx = b), (W.jsxs = b), W
  }
  process.env.NODE_ENV === "production"
    ? (q.exports = Ge())
    : (q.exports = Ve())
  var Ye = q.exports
  function Ne(u) {
    const {
        src: r,
        canvasStyle: a,
        runtime: l,
        editMode: h,
        verbose: d,
        onLoad: b,
        onLoadError: v,
        onStateChange: y,
        onSelect: x,
      } = u,
      E = S.useRef(null)
    return (
      S.useEffect(() => {
        E.current &&
          (async () => {
            const w = new J({
              src: r ?? "https://s5.vgg.cool/vgg.daruma",
              runtime: l ?? "https://s5.vgg.cool/runtime/latest",
              editMode: h,
              verbose: d,
              canvas: E.current,
              onLoad: b,
              onLoadError: v,
              onStateChange: y,
              onSelect: x,
            })
            await w.load(),
              w.state === C.Ready
                ? (await w.render(),
                  b == null || b({ type: T.Load, data: "" }, w))
                : v == null || v({ type: T.LoadError, data: "" })
          })()
      }, []),
      Ye.jsx("canvas", { style: a, ref: E })
    )
  }
  ;(O.EventType = T),
    (O.State = C),
    (O.VGGRender = Ne),
    (O.useVGG = We),
    Object.defineProperty(O, Symbol.toStringTag, { value: "Module" })
})
