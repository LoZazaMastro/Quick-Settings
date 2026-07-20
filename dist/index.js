const manifest = {"name":"Quick Settings"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const call = api.call;
const toaster = api.toaster;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaVolumeUp (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"},"child":[]}]})(props);
}function FaTools (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M501.1 395.7L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7zM331.7 225c28.3 0 54.9 11 74.9 31l19.4 19.4c15.8-6.9 30.8-16.5 43.8-29.5 37.1-37.1 49.7-89.3 37.9-136.7-2.2-9-13.5-12.1-20.1-5.5l-74.4 74.4-67.9-11.3L334 98.9l74.4-74.4c6.6-6.6 3.4-17.9-5.7-20.2-47.4-11.7-99.6.9-136.6 37.9-28.5 28.5-41.9 66.1-41.2 103.6l82.1 82.1c8.1-1.9 16.5-2.9 24.7-2.9zm-103.9 82l-56.7-56.7L18.7 402.8c-25 25-25 65.5 0 90.5s65.5 25 90.5 0l123.6-123.6c-7.6-19.9-9.9-41.6-5-62.7zM64 472c-13.2 0-24-10.8-24-24 0-13.3 10.7-24 24-24s24 10.7 24 24c0 13.2-10.7 24-24 24z"},"child":[]}]})(props);
}function FaSlidersH (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"},"child":[]}]})(props);
}function FaPlay (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"},"child":[]}]})(props);
}function FaMicrochip (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M416 48v416c0 26.51-21.49 48-48 48H144c-26.51 0-48-21.49-48-48V48c0-26.51 21.49-48 48-48h224c26.51 0 48 21.49 48 48zm96 58v12a6 6 0 0 1-6 6h-18v6a6 6 0 0 1-6 6h-42V88h42a6 6 0 0 1 6 6v6h18a6 6 0 0 1 6 6zm0 96v12a6 6 0 0 1-6 6h-18v6a6 6 0 0 1-6 6h-42v-48h42a6 6 0 0 1 6 6v6h18a6 6 0 0 1 6 6zm0 96v12a6 6 0 0 1-6 6h-18v6a6 6 0 0 1-6 6h-42v-48h42a6 6 0 0 1 6 6v6h18a6 6 0 0 1 6 6zm0 96v12a6 6 0 0 1-6 6h-18v6a6 6 0 0 1-6 6h-42v-48h42a6 6 0 0 1 6 6v6h18a6 6 0 0 1 6 6zM30 376h42v48H30a6 6 0 0 1-6-6v-6H6a6 6 0 0 1-6-6v-12a6 6 0 0 1 6-6h18v-6a6 6 0 0 1 6-6zm0-96h42v48H30a6 6 0 0 1-6-6v-6H6a6 6 0 0 1-6-6v-12a6 6 0 0 1 6-6h18v-6a6 6 0 0 1 6-6zm0-96h42v48H30a6 6 0 0 1-6-6v-6H6a6 6 0 0 1-6-6v-12a6 6 0 0 1 6-6h18v-6a6 6 0 0 1 6-6zm0-96h42v48H30a6 6 0 0 1-6-6v-6H6a6 6 0 0 1-6-6v-12a6 6 0 0 1 6-6h18v-6a6 6 0 0 1 6-6z"},"child":[]}]})(props);
}function FaDesktop (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M528 0H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h192l-16 48h-72c-13.3 0-24 10.7-24 24s10.7 24 24 24h272c13.3 0 24-10.7 24-24s-10.7-24-24-24h-72l-16-48h192c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm-16 352H64V64h448v288z"},"child":[]}]})(props);
}function FaBolt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 320 512"},"child":[{"tag":"path","attr":{"d":"M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"},"child":[]}]})(props);
}

// Backend client for Quick Settings.
//   * call(...)  -> Decky Python backend (main.py)
//   * fetch(...) -> bundled local agent on 127.0.0.1:47993 (volume + dimmer)
const API_BASE = "http://127.0.0.1:47993";
let ensureAgentPromise;
function resetAgentPromise() {
    ensureAgentPromise = undefined;
}
// Auto path: respects a manual stop (won't relaunch if the user pressed Stop).
async function ensureAgent() {
    if (!ensureAgentPromise) {
        ensureAgentPromise = call("ensure_agent")
            .then((r) => {
            const running = Boolean(r?.running ?? r);
            if (!running)
                ensureAgentPromise = undefined;
            return running;
        })
            .catch(() => {
            ensureAgentPromise = undefined;
            return false;
        });
    }
    return ensureAgentPromise;
}
async function fetchQuickSettings(timeoutMs = 1200) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(`${API_BASE}/quick-settings`, { signal: controller.signal });
        if (!response.ok)
            throw new Error(`${response.status}`);
        return (await response.json());
    }
    finally {
        window.clearTimeout(timer);
    }
}
async function getQuickSettings() {
    try {
        return await fetchQuickSettings();
    }
    catch {
        await ensureAgent();
        return await fetchQuickSettings(2200);
    }
}
async function postAgent(path, body) {
    await ensureAgent();
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!response.ok)
        throw new Error(`${response.status}`);
    return await response.json();
}
const setVolumeLevel = (level) => postAgent("/quick-settings/volume", { level });
const setDimmerLevel = (level) => postAgent("/quick-settings/dimmer", { level });
const getAgentStatus = () => call("get_agent_status");
const startAgentNow = () => call("start_agent");
const stopAgentNow = () => call("stop_agent");
const stopAgentAuto = () => call("stop_agent_auto");
// HDR
const getHdrStatus = () => call("get_hdr_status");
const setHdrEnabled = (enabled) => call("set_hdr_enabled", { enabled });
const setAudioOutput = (id) => call("set_audio_output", { id });
const setAudioInput = (id) => call("set_audio_input", { id });
const setMicrophoneVolumeLevel = (level) => call("set_microphone_volume", { level });
const getInitialState = () => call("get_initial_state");
const setDisplayMode = (width, height, hz) => call("set_display_mode", { width, height, hz });
const setRefreshRate = (hz) => call("set_refresh_rate", { hz });
// TDP
const getTdpStatus = () => call("get_tdp_status");
const setTdp = (watts) => call("set_tdp", { watts });
// Lossless Scaling
const getLosslessStatus = () => call("get_lossless_status");
const launchLossless = () => call("launch_lossless");
const setLosslessScaling = (enabled) => call("set_lossless_scaling", { enabled });
const setLosslessSetting = (key, value) => call("set_lossless_setting", { key, value });
const getAmdStatus = () => call("get_amd_status");
const setAmd = (feature, value) => call("set_amd", { feature, value });

// Localised UI strings. English is the fallback; Italian is also provided.
const amdEn = {
    amd: "AMD Radeon",
    amdBuildNeeded: "Radeon helper missing. If it does not appear, reinstall the plugin (it ships pre-built).",
    amdRsr: "Radeon Super Resolution",
    amdRsrHint: "Runs the game at a lower resolution and upscales it sharply — more FPS in almost any game.",
    amdRsrSharpness: "RSR sharpness",
    amdAfmf: "Fluid Motion Frames (AFMF)",
    amdAfmfHint: "Inserts AI-generated frames between real ones — smoother motion, with a little added lag.",
    amdAntilag: "Anti-Lag",
    amdAntilagHint: "Shortens the delay between your input and the screen — controls feel snappier.",
    amdChill: "Radeon Chill",
    amdChillHint: "Lowers FPS when you are idle to save power and heat, raising them when the action resumes.",
    amdChillMin: "Chill min FPS",
    amdChillMax: "Chill max FPS",
    amdSharpening: "Image Sharpening",
    amdSharpeningHint: "A light filter that makes details crisper, at no performance cost.",
    amdSharpeningValue: "Sharpening amount",
};
const amdIt = {
    amd: "AMD Radeon",
    amdBuildNeeded: "Helper Radeon mancante. Se non compare, reinstalla il plugin (viene fornito gi\u00e0 compilato).",
    amdRsr: "Radeon Super Resolution",
    amdRsrHint: "Esegue il gioco a risoluzione più bassa e lo ingrandisce restando nitido — più FPS quasi ovunque.",
    amdRsrSharpness: "Nitidezza RSR",
    amdAfmf: "Fluid Motion Frames (AFMF)",
    amdAfmfHint: "Inserisce fotogrammi generati tra quelli reali — più fluido, con un filo di ritardo.",
    amdAntilag: "Anti-Lag",
    amdAntilagHint: "Accorcia il ritardo tra il tuo comando e lo schermo — i controlli sembrano più immediati.",
    amdChill: "Radeon Chill",
    amdChillHint: "Abbassa gli FPS quando sei fermo per consumare e scaldare meno, e li rialza quando riprende l'azione.",
    amdChillMin: "Chill FPS min",
    amdChillMax: "Chill FPS max",
    amdSharpening: "Nitidezza immagine",
    amdSharpeningHint: "Un filtro leggero che rende i dettagli più definiti, senza costi di prestazioni.",
    amdSharpeningValue: "Intensità nitidezza",
};
const en = {
    title: "Quick Settings",
    audio: "Audio",
    volume: "Device volume",
    microphoneVolume: "Microphone volume",
    audioOutput: "Audio output",
    microphoneInput: "Microphone input",
    audioDevicesUnavailable: "Audio devices unavailable",
    display: "Display",
    brightness: "Brightness",
    hdr: "HDR",
    hdrUnavailable: "Could not toggle HDR",
    hdrConfirmTitle: "Keep HDR change?",
    hdrConfirmBody: "If the image looks correct, press OK. Otherwise the HDR toggle will be reverted automatically in",
    resolution: "Resolution",
    refreshRate: "Refresh rate",
    adaptingUi: "Adapting the interface to the new resolution…",
    tdp: "TDP (AMD)",
    tdpLimit: "Power limit",
    lossless: "Lossless Scaling",
    losslessLaunch: "Launch Lossless Scaling",
    losslessScaling: "Scaling",
    losslessFrameGen: "Frame generation",
    losslessMultiplier: "Frame gen multiplier",
    losslessHotkeyHint: "Scaling hotkey:",
    losslessApplyNote: "Changing frame generation restarts Lossless Scaling.",
    off: "Off",
    ...amdEn,
    advanced: "Advanced",
    agentLabel: "Quick Settings agent",
    agentRunning: "Running",
    agentStopped: "Stopped",
    startAgent: "Start agent",
    stopAgent: "Stop agent",
    agentHint: "Stop the agent before uninstalling or updating the plugin. It only runs in Big Picture.",
    ok: "OK",
    cancel: "Cancel",
    notConnected: "Quick Settings agent is not connected",
};
const it = {
    title: "Quick Settings",
    audio: "Audio",
    volume: "Volume dispositivo",
    microphoneVolume: "Volume microfono",
    audioOutput: "Uscita audio",
    microphoneInput: "Ingresso microfono",
    audioDevicesUnavailable: "Dispositivi audio non disponibili",
    display: "Schermo",
    brightness: "Luminosità",
    hdr: "HDR",
    hdrUnavailable: "Impossibile attivare/disattivare HDR",
    hdrConfirmTitle: "Mantenere la modifica HDR?",
    hdrConfirmBody: "Se l'immagine è corretta, premi OK. Altrimenti l'HDR verrà ripristinato automaticamente tra",
    resolution: "Risoluzione",
    refreshRate: "Frequenza di aggiornamento",
    adaptingUi: "Adatto l'interfaccia alla nuova risoluzione…",
    tdp: "TDP (AMD)",
    tdpLimit: "Limite di potenza",
    lossless: "Lossless Scaling",
    losslessLaunch: "Avvia Lossless Scaling",
    losslessScaling: "Scaling",
    losslessFrameGen: "Generazione fotogrammi",
    losslessMultiplier: "Moltiplicatore generazione",
    losslessHotkeyHint: "Scorciatoia scaling:",
    losslessApplyNote: "Cambiare la generazione fotogrammi riavvia Lossless Scaling.",
    off: "Off",
    ...amdIt,
    advanced: "Avanzate",
    agentLabel: "Agent Quick Settings",
    agentRunning: "In esecuzione",
    agentStopped: "Fermo",
    startAgent: "Avvia agent",
    stopAgent: "Ferma agent",
    agentHint: "Ferma l'agent prima di disinstallare o aggiornare il plugin. Si avvia solo in Big Picture.",
    ok: "OK",
    cancel: "Annulla",
    notConnected: "Agent Quick Settings non collegato",
};
const strings = { en, it };
function t() {
    const language = navigator.language.split("-")[0];
    return strings[language] ?? strings.en;
}

const REFRESH_INTERVAL = 15000;
const SLIDER_DEBOUNCE = 260;
const clampPercent = (v) => Math.max(0, Math.min(100, Math.round(v)));
const dimmerToBrightness = (d) => clampPercent(100 - d);
const brightnessToDimmer = (b) => clampPercent(100 - b);
const sleep = (ms) => new Promise((r) => window.setTimeout(r, ms));
function directionFromKey(key) {
    if (key === "ArrowLeft" || key === "Left")
        return -1;
    if (key === "ArrowRight" || key === "Right")
        return 1;
    return 0;
}
function directionFromGamepadButton(button) {
    if (button === DFL.GamepadButton.DIR_LEFT)
        return -1;
    if (button === DFL.GamepadButton.DIR_RIGHT)
        return 1;
    return 0;
}
function QuickSlider({ label, value, min, max, step = 1, suffix = "", disabled = false, onChange, }) {
    const valueRef = SP_REACT.useRef(value);
    SP_REACT.useEffect(() => { valueRef.current = value; }, [value]);
    const setNext = (next) => {
        if (disabled)
            return;
        const clamped = Math.max(min, Math.min(max, Math.round(next / step) * step));
        valueRef.current = clamped;
        onChange(clamped);
    };
    const nudge = (direction) => setNext(valueRef.current + direction * step);
    const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
    return (SP_JSX.jsxs(DFL.Focusable, { className: "qsSlider", focusClassName: "qsSliderFocused", noFocusRing: true, onActivate: () => undefined, onButtonDown: (event) => {
            const direction = directionFromGamepadButton(event?.detail?.button);
            if (!direction)
                return;
            event.preventDefault?.();
            event.stopPropagation?.();
            nudge(direction);
        }, onKeyDown: (event) => {
            const direction = directionFromKey(event.key);
            if (!direction)
                return;
            event.preventDefault();
            event.stopPropagation();
            nudge(direction);
        }, role: "slider", tabIndex: 0, "aria-label": label, "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, style: { opacity: disabled ? 0.45 : 1 }, children: [SP_JSX.jsxs("div", { className: "qsSliderHeader", children: [SP_JSX.jsx("span", { children: label }), SP_JSX.jsx("strong", { children: `${value}${suffix}` })] }), SP_JSX.jsx("input", { type: "range", min: min, max: max, step: step, value: value, disabled: disabled, tabIndex: -1, style: { "--qs-slider-fill": `${fill}%` }, onChange: (event) => setNext(Number(event.currentTarget.value)) })] }));
}
function QuickDropdown({ label, options, value, disabled = false, onChange }) {
    return (SP_JSX.jsxs("div", { className: "qsDropdownBlock", children: [SP_JSX.jsx("div", { className: "qsControlLabel", children: label }), SP_JSX.jsx("div", { className: "qsDropdownControl", children: SP_JSX.jsx(DFL.Dropdown, { focusable: true, disabled: disabled, menuLabel: label, rgOptions: options, selectedOption: value, onChange: (option) => onChange(option?.data ?? option) }) })] }));
}
// ---- Steam UI mode (agent runs only in Big Picture) ---- //
function getUIMode() {
    try {
        return window.SteamClient?.UI?.GetUIMode?.() ?? -1;
    }
    catch {
        return -1;
    }
}
function isBigPicture() {
    const m = getUIMode();
    return m === 4 || m === 7 || m === -1; // 4/7 gamepad; -1 unknown -> assume BPM
}
async function syncAgentToMode() {
    try {
        if (isBigPicture())
            await ensureAgent();
        else
            await stopAgentAuto();
    }
    catch {
        /* ignore */
    }
}
function softRestartSteamUI() {
    try {
        const sc = window.SteamClient;
        if (sc?.Browser?.RestartJSContext) {
            sc.Browser.RestartJSContext();
            return;
        }
        if (sc?.User?.StartRestart)
            sc.User.StartRestart(false);
    }
    catch {
        /* ignore */
    }
}
function useDebounced(fn, delay = SLIDER_DEBOUNCE) {
    const timer = SP_REACT.useRef(undefined);
    return (value) => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => fn(value), delay);
    };
}
function HdrConfirmModal({ closeModal, onKeep, onRevert, label, }) {
    const [seconds, setSeconds] = SP_REACT.useState(10);
    const finished = SP_REACT.useRef(false);
    const finishKeep = () => {
        if (finished.current)
            return;
        finished.current = true;
        onKeep?.();
        closeModal?.();
    };
    const finishRevert = () => {
        if (finished.current)
            return;
        finished.current = true;
        onRevert?.();
        closeModal?.();
    };
    SP_REACT.useEffect(() => {
        const timer = window.setInterval(() => {
            setSeconds((c) => {
                if (c <= 1) {
                    window.clearInterval(timer);
                    window.setTimeout(finishRevert, 0);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, []);
    return (SP_JSX.jsxs(DFL.ModalRoot, { closeModal: finishRevert, children: [SP_JSX.jsx("div", { style: { fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.65rem" }, children: label.hdrConfirmTitle }), SP_JSX.jsx("div", { style: { fontSize: "0.85rem", lineHeight: "1.25rem", opacity: 0.82, marginBottom: "0.9rem" }, children: `${label.hdrConfirmBody} ${seconds}s` }), SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", noFocusRing: true, style: { display: "flex", gap: "0.5rem", justifyContent: "flex-end" }, children: [SP_JSX.jsx(DFL.DialogButton, { focusable: true, onClick: finishRevert, style: { minWidth: "7rem" }, children: label.cancel }), SP_JSX.jsx(DFL.DialogButton, { focusable: true, onClick: finishKeep, style: { minWidth: "7rem" }, children: label.ok })] })] }));
}
function Content() {
    const local = t();
    const [volume, setVolume] = SP_REACT.useState({ available: true, level: 50, muted: false });
    const [dimmer, setDimmer] = SP_REACT.useState({ available: true, level: 0 });
    const [hdr, setHdr] = SP_REACT.useState({
        available: true, supported: true, enabled: false, shortcut_only: true, real_state: false, message: "",
    });
    const [audio, setAudio] = SP_REACT.useState({
        ok: false, message: "", outputs: [], inputs: [], default_output_id: "", default_input_id: "", input_volume: 0,
    });
    const [caps, setCaps] = SP_REACT.useState(null);
    const [display, setDisplay] = SP_REACT.useState(null);
    const [tdp, setTdpState] = SP_REACT.useState(null);
    const [agentRunning, setAgentRunning] = SP_REACT.useState(false);
    const [lossless, setLossless] = SP_REACT.useState(null);
    const [amd, setAmdState] = SP_REACT.useState(null);
    const notify = (body) => toaster.toast({ title: local.title, body });
    // ----------------------------- loaders ----------------------------- //
    const loadAgentStatus = async () => {
        try {
            const qs = await getQuickSettings();
            if (qs.volume)
                setVolume(qs.volume);
            if (qs.dimmer)
                setDimmer(qs.dimmer);
            setAgentRunning(true);
        }
        catch {
            resetAgentPromise();
            void ensureAgent().then(async (running) => {
                setAgentRunning(running);
                if (!running)
                    return;
                await sleep(120);
                try {
                    const qs = await getQuickSettings();
                    if (qs.volume)
                        setVolume(qs.volume);
                    if (qs.dimmer)
                        setDimmer(qs.dimmer);
                }
                catch { /* keep the immediately rendered controls */ }
            });
        }
    };
    const loadHdr = async () => {
        try {
            const r = await getHdrStatus();
            setHdr(r?.hdr ?? r);
        }
        catch { /* keep */ }
    };
    const loadTdp = async () => {
        try {
            const r = await getTdpStatus();
            if (r)
                setTdpState(r);
        }
        catch { /* ignore */ }
    };
    const loadLossless = async () => {
        try {
            const r = await getLosslessStatus();
            if (r)
                setLossless(r);
        }
        catch { /* ignore */ }
    };
    const loadAmd = async () => {
        try {
            const r = await getAmdStatus();
            if (r)
                setAmdState(r);
        }
        catch { /* ignore */ }
    };
    const refreshAgentRunning = async () => {
        try {
            const r = await getAgentStatus();
            setAgentRunning(Boolean(r?.running));
        }
        catch { /* ignore */ }
    };
    SP_REACT.useEffect(() => {
        let cancelled = false;
        let timer;
        (async () => {
            void loadAgentStatus();
            let c = null;
            try {
                const initial = await getInitialState();
                if (cancelled)
                    return;
                c = initial.capabilities;
                setCaps(c);
                if (initial.audio)
                    setAudio(initial.audio);
                if (initial.hdr)
                    setHdr(initial.hdr?.hdr ?? initial.hdr);
                if (initial.display?.ok)
                    setDisplay(initial.display);
                if (initial.tdp)
                    setTdpState(initial.tdp);
                if (initial.lossless)
                    setLossless(initial.lossless);
                if (initial.amd)
                    setAmdState(initial.amd);
            }
            catch { /* ignore */ }
            if (cancelled)
                return;
            timer = window.setInterval(() => {
                void loadAgentStatus();
                void loadHdr();
                void refreshAgentRunning();
                if (c?.lossless)
                    void loadLossless();
                if (c?.amd_radeon && Date.now() - lastAmdTouch.current > 6000)
                    void loadAmd();
            }, REFRESH_INTERVAL);
        })();
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, []);
    // ---------------------------- handlers ----------------------------- //
    const commitVolume = useDebounced((level) => void setVolumeLevel(level).catch(() => notify(local.notConnected)), 35);
    const commitBrightness = useDebounced((level) => void setDimmerLevel(level).catch(() => notify(local.notConnected)), 35);
    const commitMicVolume = useDebounced((level) => void setMicrophoneVolumeLevel(level).catch(() => notify(local.audioDevicesUnavailable)), 180);
    const onVolume = (level) => {
        const n = clampPercent(level);
        setVolume((c) => ({ ...c, level: n }));
        commitVolume(n);
    };
    const onBrightness = (b) => {
        const level = brightnessToDimmer(clampPercent(b));
        setDimmer((c) => ({ ...c, level }));
        commitBrightness(level);
    };
    const onMicVolume = (level) => {
        const n = clampPercent(level);
        setAudio((c) => ({ ...c, input_volume: n }));
        commitMicVolume(n);
    };
    const onOutput = (id) => {
        if (!id)
            return;
        setAudio((c) => ({ ...c, default_output_id: id }));
        void setAudioOutput(id).then((r) => r?.ok && setAudio(r)).catch(() => notify(local.audioDevicesUnavailable));
    };
    const onInput = (id) => {
        if (!id)
            return;
        setAudio((c) => ({ ...c, default_input_id: id }));
        void setAudioInput(id).then((r) => r?.ok && setAudio(r)).catch(() => notify(local.audioDevicesUnavailable));
    };
    const onHdr = async (enabled) => {
        const previous = Boolean(hdr.enabled);
        setHdr((c) => ({ ...c, enabled, message: "" }));
        try {
            const r = await setHdrEnabled(enabled);
            const next = r?.hdr ?? r?.status?.hdr;
            if (next)
                setHdr(next);
            if (!r?.ok) {
                notify(r?.message || local.hdrUnavailable);
                await loadHdr();
                return;
            }
            const modal = DFL.showModal(SP_JSX.jsx(HdrConfirmModal, { label: local, closeModal: () => modal?.Close?.(), onKeep: () => void loadHdr(), onRevert: async () => {
                    try {
                        const back = await setHdrEnabled(previous);
                        const b = back?.hdr ?? back?.status?.hdr;
                        if (b)
                            setHdr(b);
                    }
                    catch {
                        notify(local.hdrUnavailable);
                    }
                } }));
        }
        catch {
            notify(local.notConnected);
            await loadHdr();
        }
    };
    // Display: the user's selection is authoritative for the dropdown — we never
    // overwrite it with the backend read-back, so the number updates instantly.
    const onResolution = async (value) => {
        const [w, h] = value.split("x").map((n) => parseInt(n, 10));
        const hz = display?.current?.hz ?? 0;
        setDisplay((c) => (c ? { ...c, current: { ...c.current, width: w, height: h } } : c));
        try {
            const r = await setDisplayMode(w, h, hz);
            if (r?.ok) {
                notify(local.adaptingUi);
                window.setTimeout(softRestartSteamUI, 1200);
            }
            else if (r?.message) {
                notify(r.message);
            }
        }
        catch {
            /* keep optimistic selection */
        }
    };
    const onRefresh = async (value) => {
        const hz = parseInt(value, 10);
        setDisplay((c) => (c ? { ...c, current: { ...c.current, hz } } : c));
        try {
            const r = await setRefreshRate(hz);
            if (r?.ok) {
                // Same trick that makes resolution correct: reload the Steam UI so the
                // dropdown remounts and shows the value that was actually applied.
                notify(local.adaptingUi);
                window.setTimeout(softRestartSteamUI, 1200);
            }
            else if (r?.message) {
                notify(r.message);
            }
        }
        catch {
            /* keep optimistic selection */
        }
    };
    const commitTdp = useDebounced((v) => void setTdp(v).then(() => loadTdp()));
    const onTdp = (watts) => {
        setTdpState((c) => (c ? { ...c, stapm: watts, fast: watts, slow: watts } : c));
        commitTdp(watts);
    };
    const onStartAgent = () => void startAgentNow().then((r) => setAgentRunning(Boolean(r?.running))).catch(() => { });
    const onStopAgent = () => void stopAgentNow().then((r) => setAgentRunning(Boolean(r?.running))).catch(() => { });
    // Lossless Scaling
    const onLaunchLossless = () => void launchLossless().then((r) => { if (r?.message)
        notify(r.message); }).catch(() => { }).finally(() => void loadLossless());
    const onScalingToggle = (enabled) => {
        setLossless((c) => (c ? { ...c, scaling_active: enabled } : c));
        void setLosslessScaling(enabled).then((r) => {
            if (r)
                setLossless((c) => (c ? { ...c, scaling_active: Boolean(r.active) } : c));
            if (r && r.ok === false && r.message)
                notify(r.message);
        }).catch(() => { });
    };
    const onFrameGen = (value) => {
        setLossless((c) => (c ? { ...c, frame_gen: value } : c));
        void setLosslessSetting("frame_gen", value).then((r) => { if (r && r.ok === false && r.message)
            notify(r.message); }).finally(() => window.setTimeout(() => void loadLossless(), 1500));
    };
    const commitMultiplier = useDebounced((v) => void setLosslessSetting("multiplier", v).finally(() => window.setTimeout(() => void loadLossless(), 1500)));
    const onMultiplier = (value) => {
        const n = Math.max(2, Math.min(4, Math.round(value)));
        setLossless((c) => (c ? { ...c, multiplier: n } : c));
        commitMultiplier(n);
    };
    // AMD Radeon (via the ADLX helper). Sliders behave exactly like the volume /
    // brightness ones: optimistic value, a throttled write, and NO read-back that
    // could make the handle jump. A short grace window also keeps the periodic
    // refresh from overwriting a value you just set.
    const lastAmdTouch = SP_REACT.useRef(0);
    const markAmdTouch = () => { lastAmdTouch.current = Date.now(); };
    const onAmd = (feature, value) => {
        markAmdTouch();
        void setAmd(feature, value)
            .then((r) => { if (r && r.ok === false && r.message)
            notify(r.message); })
            .catch(() => { });
    };
    const onAmdToggle = (feature, enabled) => onAmd(feature, enabled ? "on" : "off");
    const commitRsrSharp = useDebounced((v) => onAmd("rsr_sharpness", v));
    const commitChillMin = useDebounced((v) => onAmd("chill_min", v));
    const commitChillMax = useDebounced((v) => onAmd("chill_max", v));
    const commitSharpVal = useDebounced((v) => onAmd("sharpening_value", v));
    // ----------------------------- render ------------------------------ //
    const outputOptions = audio.outputs.length > 0
        ? audio.outputs.map((d) => ({ data: d.id, label: d.name || local.audioOutput }))
        : [{ data: "", label: local.audioDevicesUnavailable }];
    const inputOptions = audio.inputs.length > 0
        ? audio.inputs.map((d) => ({ data: d.id, label: d.name || local.microphoneInput }))
        : [{ data: "", label: local.audioDevicesUnavailable }];
    const resolutionOptions = (display?.resolutions ?? []).map((r) => ({ data: `${r.width}x${r.height}`, label: `${r.width} × ${r.height}` }));
    const refreshOptions = (display?.refresh_rates ?? []).map((hz) => ({ data: `${hz}`, label: `${hz} Hz` }));
    const currentResolution = display?.current?.width ? `${display.current.width}x${display.current.height}` : resolutionOptions[0]?.data ?? "";
    const currentRefresh = display?.current?.hz ? `${display.current.hz}` : refreshOptions[0]?.data ?? "";
    const tdpWatts = tdp ? Math.round(tdp.stapm) : 0;
    const frameGenOptions = [
        { data: "Off", label: local.off },
        { data: "LSFG3", label: "LSFG 3.1" },
        { data: "LSFG2", label: "LSFG 2.3" },
        { data: "LSFG1", label: "LSFG 1.1" },
    ];
    const section = (icon, title, children) => (SP_JSX.jsxs(DFL.Focusable, { "flow-children": "column", className: "qsCard", children: [SP_JSX.jsxs("div", { className: "qsCardHeader", children: [icon, SP_JSX.jsx("span", { children: title })] }), SP_JSX.jsx(DFL.Focusable, { "flow-children": "column", className: "qsCardBody", children: children })] }));
    return (SP_JSX.jsx(DFL.ScrollPanel, { children: SP_JSX.jsxs(DFL.Focusable, { "flow-children": "column", className: "qsRedesign", children: [SP_JSX.jsx("style", { children: `
          .qsRedesign,.qsRedesign *{box-sizing:border-box;min-width:0;letter-spacing:0}
          .qsRedesign{--qs-accent:#66c0f4;width:100%;padding:8px 12px 28px 4px;overflow-x:hidden;color:#fff}
          .qsCard{display:flex;flex-direction:column;gap:0;width:100%;margin:0 0 11px;border:1px solid rgba(255,255,255,.09);border-radius:6px;background:rgba(255,255,255,.035);overflow:hidden}
          .qsCardHeader{display:flex;align-items:center;gap:9px;width:100%;padding:11px 12px 9px;border-bottom:1px solid rgba(255,255,255,.07);font-size:13px;font-weight:750;color:rgba(255,255,255,.76)}
          .qsCardHeader svg{width:15px;height:15px;flex:none;color:var(--qs-accent)}
          .qsCardBody{display:flex;flex-direction:column;gap:8px;width:100%;padding:11px}
          .qsCardBody>div{width:100%;max-width:100%;min-width:0}
          .qsCard [class*="PanelSectionRow"]{width:100%!important;max-width:100%!important;padding-left:0!important;padding-right:0!important;margin:0!important}
          .qsSlider{display:grid;grid-template-rows:auto 18px;gap:7px;width:100%;padding:8px 9px;border:1px solid transparent;border-radius:6px;background:rgba(255,255,255,.04);outline:none}
          .qsSlider.qsSliderFocused,.qsSlider:focus-visible{border-color:color-mix(in srgb,var(--qs-accent) 62%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--qs-accent) 20%,transparent),0 0 18px color-mix(in srgb,var(--qs-accent) 20%,transparent)}
          .qsSliderHeader{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;font-size:14px;line-height:1.15;color:rgba(255,255,255,.82)}
          .qsSliderHeader span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
          .qsSliderHeader strong{font-size:13px;font-weight:700;color:#fff}
          .qsSlider input[type="range"]{width:100%;height:18px;margin:0;padding:0;accent-color:var(--qs-accent);background:transparent}
          .qsSlider input[type="range"]::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(90deg,var(--qs-accent) 0 var(--qs-slider-fill),rgba(255,255,255,.18) var(--qs-slider-fill) 100%)}
          .qsSlider input[type="range"]::-webkit-slider-thumb{width:14px;height:14px;margin-top:-4px;border-radius:999px;background:#fff;box-shadow:0 1px 5px rgba(0,0,0,.45)}
          .qsDropdownBlock{display:flex;flex-direction:column;gap:6px;width:100%;padding:1px 0}
          .qsControlLabel{font-size:12px;font-weight:650;line-height:1.2;color:rgba(255,255,255,.58)}
          .qsDropdownControl,.qsDropdownControl>div,.qsDropdownControl button,.qsDropdownControl .DialogDropDown{width:100%!important;max-width:100%!important;min-width:0!important}
          .qsDropdownControl button,.qsDropdownControl .DialogDropDown{min-height:40px!important;padding:0 11px!important;border-radius:5px!important;text-align:left!important;color:#fff!important;background:rgba(255,255,255,.10)!important}
          .qsDropdownControl button:hover,.qsDropdownControl button:focus,.qsDropdownControl button.gpfocus,.qsDropdownControl .DialogDropDown.gpfocus{color:#fff!important;background:rgba(102,192,244,.16)!important;box-shadow:inset 0 0 0 1px rgba(102,192,244,.78),0 0 0 2px rgba(102,192,244,.17)!important}
          .qsDropdownControl button *,.qsDropdownControl .DialogDropDown *{color:inherit!important}
          .qsCard .DialogButton{width:100%;min-height:38px!important;padding:0 10px!important;border-radius:5px!important;color:#fff!important;font-size:14px!important}
          .qsCard .DialogButton:hover,.qsCard .DialogButton:focus,.qsCard .DialogButton.gpfocus{background:rgba(102,192,244,.16)!important;color:#fff!important;border-color:rgba(102,192,244,.92)!important;box-shadow:0 0 0 2px rgba(102,192,244,.22)!important}
          .qsCard .DialogButton:hover *,.qsCard .DialogButton:focus *,.qsCard .DialogButton.gpfocus *{color:inherit!important}
          .qsButtonInner{display:grid;grid-template-columns:18px minmax(0,1fr);align-items:center;gap:9px;width:100%;text-align:left}
          .qsButtonInner svg{width:14px;height:14px;justify-self:center}
          .qsMeta{font-size:12px;line-height:1.35;opacity:.58;overflow-wrap:anywhere}
          .qsStatus{padding:9px 10px;border-radius:5px;background:rgba(102,192,244,.08);font-size:13px;font-weight:650}
          .qsDivider{height:1px;margin:5px 0;background:rgba(255,255,255,.07)}
        ` }), section(SP_JSX.jsx(FaVolumeUp, {}), local.audio, SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(QuickSlider, { label: local.volume, value: volume.level, min: 0, max: 100, suffix: "%", onChange: onVolume }), SP_JSX.jsx(QuickSlider, { label: local.microphoneVolume, value: clampPercent(audio.input_volume), min: 0, max: 100, suffix: "%", onChange: onMicVolume }), SP_JSX.jsx(QuickDropdown, { label: local.audioOutput, options: outputOptions, value: audio.default_output_id || outputOptions[0]?.data || "", onChange: onOutput }), SP_JSX.jsx(QuickDropdown, { label: local.microphoneInput, options: inputOptions, value: audio.default_input_id || inputOptions[0]?.data || "", onChange: onInput })] })), section(SP_JSX.jsx(FaDesktop, {}), local.display, SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(QuickSlider, { label: local.brightness, value: dimmerToBrightness(dimmer.level), min: 0, max: 100, suffix: "%", onChange: onBrightness }), caps?.display && resolutionOptions.length > 0 && SP_JSX.jsx(QuickDropdown, { label: local.resolution, options: resolutionOptions, value: currentResolution, onChange: onResolution }, `res-${currentResolution}`), caps?.display && refreshOptions.length > 0 && SP_JSX.jsx(QuickDropdown, { label: local.refreshRate, options: refreshOptions, value: currentRefresh, onChange: onRefresh }, `hz-${currentRefresh}`), SP_JSX.jsx(DFL.ToggleField, { label: local.hdr, checked: Boolean(hdr.enabled), onChange: onHdr })] })), caps?.tdp && tdp?.available && section(SP_JSX.jsx(FaBolt, {}), local.tdp, SP_JSX.jsx(QuickSlider, { label: local.tdpLimit, value: tdpWatts || 15, min: 4, max: 40, suffix: " W", onChange: onTdp })), caps?.lossless && section(SP_JSX.jsx(FaPlay, {}), local.lossless, SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.DialogButton, { disabled: Boolean(lossless?.running), onClick: onLaunchLossless, children: SP_JSX.jsxs("span", { className: "qsButtonInner", children: [SP_JSX.jsx(FaPlay, {}), SP_JSX.jsx("span", { children: local.losslessLaunch })] }) }), SP_JSX.jsx(DFL.ToggleField, { label: local.losslessScaling, disabled: !lossless?.running, checked: Boolean(lossless?.scaling_active), onChange: onScalingToggle }), SP_JSX.jsx(QuickDropdown, { label: local.losslessFrameGen, options: frameGenOptions, value: lossless?.frame_gen ?? "Off", onChange: onFrameGen }, `fg-${lossless?.frame_gen ?? "Off"}`), SP_JSX.jsx(QuickSlider, { label: local.losslessMultiplier, value: Math.max(2, Math.min(4, lossless?.multiplier ?? 2)), min: 2, max: 4, suffix: "x", onChange: onMultiplier }), SP_JSX.jsx("div", { className: "qsMeta", children: local.losslessApplyNote })] })), caps?.amd_radeon && amd?.available && section(SP_JSX.jsx(FaMicrochip, {}), local.amd, SP_JSX.jsxs(SP_JSX.Fragment, { children: [amd.rsr?.supported && SP_JSX.jsx(DFL.ToggleField, { label: local.amdRsr, description: local.amdRsrHint, checked: Boolean(amd.rsr.enabled), onChange: (v) => { setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, enabled: v } } : c)); onAmdToggle("rsr", v); } }), amd.rsr?.supported && amd.rsr.enabled && SP_JSX.jsx(QuickSlider, { label: local.amdRsrSharpness, value: amd.rsr.sharpness ?? 0, min: amd.rsr.smin ?? 0, max: amd.rsr.smax ?? 100, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, sharpness: v } } : c)); commitRsrSharp(v); } }), amd.afmf?.supported && SP_JSX.jsx(DFL.ToggleField, { label: local.amdAfmf, description: local.amdAfmfHint, checked: Boolean(amd.afmf.enabled), onChange: (v) => { setAmdState((c) => (c && c.afmf ? { ...c, afmf: { ...c.afmf, enabled: v } } : c)); onAmdToggle("afmf", v); } }), amd.antilag?.supported && SP_JSX.jsx(DFL.ToggleField, { label: local.amdAntilag, description: local.amdAntilagHint, checked: Boolean(amd.antilag.enabled), onChange: (v) => { setAmdState((c) => (c && c.antilag ? { ...c, antilag: { ...c.antilag, enabled: v } } : c)); onAmdToggle("antilag", v); } }), amd.chill?.supported && SP_JSX.jsx(DFL.ToggleField, { label: local.amdChill, description: local.amdChillHint, checked: Boolean(amd.chill.enabled), onChange: (v) => { setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, enabled: v } } : c)); onAmdToggle("chill", v); } }), amd.chill?.supported && amd.chill.enabled && SP_JSX.jsx(QuickSlider, { label: local.amdChillMin, value: amd.chill.min ?? 0, min: amd.chill.fmin ?? 0, max: amd.chill.fmax ?? 240, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, min: v } } : c)); commitChillMin(v); } }), amd.chill?.supported && amd.chill.enabled && SP_JSX.jsx(QuickSlider, { label: local.amdChillMax, value: amd.chill.max ?? 0, min: amd.chill.fmin ?? 0, max: amd.chill.fmax ?? 240, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, max: v } } : c)); commitChillMax(v); } }), amd.sharpening?.supported && SP_JSX.jsx(DFL.ToggleField, { label: local.amdSharpening, description: local.amdSharpeningHint, checked: Boolean(amd.sharpening.enabled), onChange: (v) => { setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, enabled: v } } : c)); onAmdToggle("sharpening", v); } }), amd.sharpening?.supported && amd.sharpening.enabled && SP_JSX.jsx(QuickSlider, { label: local.amdSharpeningValue, value: amd.sharpening.value ?? 0, min: amd.sharpening.smin ?? 0, max: amd.sharpening.smax ?? 100, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, value: v } } : c)); commitSharpVal(v); } })] })), section(SP_JSX.jsx(FaTools, {}), local.advanced, SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx("div", { className: "qsStatus", children: `${local.agentLabel}: ${agentRunning ? local.agentRunning : local.agentStopped}` }), SP_JSX.jsx(DFL.DialogButton, { disabled: agentRunning, onClick: onStartAgent, children: SP_JSX.jsxs("span", { className: "qsButtonInner", children: [SP_JSX.jsx(FaPlay, {}), SP_JSX.jsx("span", { children: local.startAgent })] }) }), SP_JSX.jsx(DFL.DialogButton, { disabled: !agentRunning, onClick: onStopAgent, children: SP_JSX.jsxs("span", { className: "qsButtonInner", children: [SP_JSX.jsx(FaTools, {}), SP_JSX.jsx("span", { children: local.stopAgent })] }) }), SP_JSX.jsx("div", { className: "qsMeta", children: local.agentHint })] }))] }) }));
}
var index = definePlugin(() => {
    void syncAgentToMode();
    let registration;
    try {
        registration = window.SteamClient?.UI?.RegisterForUIModeChanged?.(() => void syncAgentToMode());
    }
    catch {
        /* ignore */
    }
    return {
        name: "Quick Settings",
        titleView: SP_JSX.jsxs("div", { className: DFL.staticClasses.Title, style: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.45rem", width: "100%", marginLeft: "auto", paddingRight: 8 }, children: [SP_JSX.jsx(FaSlidersH, { size: 19 }), SP_JSX.jsx("span", { children: "Quick Settings" })] }),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaSlidersH, {}),
        onDismount() {
            try {
                registration?.unregister?.();
            }
            catch {
                /* ignore */
            }
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
