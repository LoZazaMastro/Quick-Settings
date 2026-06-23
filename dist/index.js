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
    var {
        attr,
        size,
        title
      } = props,
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
function FaSlidersH (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"},"child":[]}]})(props);
}

// Backend client for Quick Settings.
//   * call(...)  -> Decky Python backend (main.py)
//   * fetch(...) -> bundled local agent on 127.0.0.1:47992 (volume + dimmer)
const API_BASE = "http://127.0.0.1:47992";
let ensureAgentPromise;
function resetAgentPromise() {
    ensureAgentPromise = undefined;
}
// Auto path: respects a manual stop (won't relaunch if the user pressed Stop).
async function ensureAgent() {
    if (!ensureAgentPromise) {
        ensureAgentPromise = call("ensure_agent").then((r) => Boolean(r?.running ?? r)).catch(() => false);
    }
    return ensureAgentPromise;
}
async function getQuickSettings() {
    await ensureAgent();
    const response = await fetch(`${API_BASE}/quick-settings`);
    if (!response.ok)
        throw new Error(`${response.status}`);
    return (await response.json());
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
const ensureAgentNow = () => call("ensure_agent");
const startAgentNow = () => call("start_agent");
const stopAgentNow = () => call("stop_agent");
const stopAgentAuto = () => call("stop_agent_auto");
// HDR
const getHdrStatus = () => call("get_hdr_status");
const setHdrEnabled = (enabled) => call("set_hdr_enabled", { enabled });
// Audio
const getAudioDevices = () => call("get_audio_devices");
const setAudioOutput = (id) => call("set_audio_output", { id });
const setAudioInput = (id) => call("set_audio_input", { id });
const setMicrophoneVolumeLevel = (level) => call("set_microphone_volume", { level });
// Capabilities
const getCapabilities = () => call("get_capabilities");
// Display
const getDisplayStatus = () => call("get_display_status");
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
            await ensureAgentNow();
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
        }
        catch {
            resetAgentPromise();
            await ensureAgent();
            await sleep(600);
            try {
                const qs = await getQuickSettings();
                if (qs.volume)
                    setVolume(qs.volume);
                if (qs.dimmer)
                    setDimmer(qs.dimmer);
            }
            catch {
                /* agent may be intentionally stopped outside Big Picture */
            }
        }
    };
    const loadHdr = async () => {
        try {
            const r = await getHdrStatus();
            setHdr(r?.hdr ?? r);
        }
        catch { /* keep */ }
    };
    const loadAudio = async () => {
        try {
            const r = await getAudioDevices();
            if (r)
                setAudio(r);
        }
        catch { /* keep */ }
    };
    const loadDisplay = async () => {
        try {
            const r = await getDisplayStatus();
            if (r?.ok)
                setDisplay(r);
        }
        catch { /* ignore */ }
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
        let timer;
        (async () => {
            let c = null;
            try {
                c = await getCapabilities();
                setCaps(c);
            }
            catch { /* ignore */ }
            await Promise.all([
                loadAgentStatus(),
                loadHdr(),
                loadAudio(),
                refreshAgentRunning(),
                c?.display ? loadDisplay() : Promise.resolve(),
                c?.tdp ? loadTdp() : Promise.resolve(),
                c?.lossless ? loadLossless() : Promise.resolve(),
                c?.amd_radeon ? loadAmd() : Promise.resolve(),
            ]);
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
        return () => window.clearInterval(timer);
    }, []);
    // ---------------------------- handlers ----------------------------- //
    const onVolume = (level) => {
        const n = clampPercent(level);
        setVolume((c) => ({ ...c, level: n }));
        void setVolumeLevel(n).catch(() => notify(local.notConnected));
    };
    const onBrightness = (b) => {
        const level = brightnessToDimmer(clampPercent(b));
        setDimmer((c) => ({ ...c, level }));
        void setDimmerLevel(level).catch(() => notify(local.notConnected));
    };
    const onMicVolume = (level) => {
        const n = clampPercent(level);
        setAudio((c) => ({ ...c, input_volume: n }));
        void setMicrophoneVolumeLevel(n).catch(() => notify(local.audioDevicesUnavailable));
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
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: local.audio, children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.volume, value: volume.level, min: 0, max: 100, step: 1, showValue: true, valueSuffix: "%", onChange: onVolume }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.microphoneVolume, value: clampPercent(audio.input_volume), min: 0, max: 100, step: 1, showValue: true, valueSuffix: "%", onChange: onMicVolume }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: local.audioOutput, rgOptions: outputOptions, selectedOption: audio.default_output_id || outputOptions[0]?.data || "", onChange: (o) => onOutput(o?.data ?? o) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: local.microphoneInput, rgOptions: inputOptions, selectedOption: audio.default_input_id || inputOptions[0]?.data || "", onChange: (o) => onInput(o?.data ?? o) }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: local.display, children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.brightness, value: dimmerToBrightness(dimmer.level), min: 0, max: 100, step: 1, showValue: true, valueSuffix: "%", onChange: onBrightness }) }), caps?.display && resolutionOptions.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: local.resolution, rgOptions: resolutionOptions, selectedOption: currentResolution, onChange: (o) => onResolution(o?.data ?? o) }, `res-${currentResolution}`) })), caps?.display && refreshOptions.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: local.refreshRate, rgOptions: refreshOptions, selectedOption: currentRefresh, onChange: (o) => onRefresh(o?.data ?? o) }, `hz-${currentRefresh}`) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.hdr, checked: Boolean(hdr.enabled), onChange: onHdr }) })] }), caps?.tdp && tdp?.available && (SP_JSX.jsx(DFL.PanelSection, { title: local.tdp, children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.tdpLimit, value: tdpWatts || 15, min: 4, max: 40, step: 1, showValue: true, valueSuffix: " W", onChange: onTdp }) }) })), caps?.lossless && (SP_JSX.jsxs(DFL.PanelSection, { title: local.lossless, children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: Boolean(lossless?.running), onClick: onLaunchLossless, children: local.losslessLaunch }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.losslessScaling, disabled: !lossless?.running, checked: Boolean(lossless?.scaling_active), onChange: onScalingToggle }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: local.losslessFrameGen, rgOptions: frameGenOptions, selectedOption: lossless?.frame_gen ?? "Off", onChange: (o) => onFrameGen(o?.data ?? o) }, `fg-${lossless?.frame_gen ?? "Off"}`) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.losslessMultiplier, value: Math.max(2, Math.min(4, lossless?.multiplier ?? 2)), min: 2, max: 4, step: 1, showValue: true, valueSuffix: "x", onChange: onMultiplier }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "0.78rem", opacity: 0.6 }, children: local.losslessApplyNote }) })] })), caps?.amd_radeon && amd?.available && (SP_JSX.jsxs(DFL.PanelSection, { title: local.amd, children: [amd.rsr?.supported && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.amdRsr, description: local.amdRsrHint, checked: Boolean(amd.rsr.enabled), onChange: (v) => { setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, enabled: v } } : c)); onAmdToggle("rsr", v); } }) })), amd.rsr?.supported && amd.rsr.enabled && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.amdRsrSharpness, value: amd.rsr.sharpness ?? 0, min: amd.rsr.smin ?? 0, max: amd.rsr.smax ?? 100, step: 1, showValue: true, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, sharpness: v } } : c)); commitRsrSharp(v); } }) })), amd.afmf?.supported && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.amdAfmf, description: local.amdAfmfHint, checked: Boolean(amd.afmf.enabled), onChange: (v) => { setAmdState((c) => (c && c.afmf ? { ...c, afmf: { ...c.afmf, enabled: v } } : c)); onAmdToggle("afmf", v); } }) })), amd.antilag?.supported && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.amdAntilag, description: local.amdAntilagHint, checked: Boolean(amd.antilag.enabled), onChange: (v) => { setAmdState((c) => (c && c.antilag ? { ...c, antilag: { ...c.antilag, enabled: v } } : c)); onAmdToggle("antilag", v); } }) })), amd.chill?.supported && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.amdChill, description: local.amdChillHint, checked: Boolean(amd.chill.enabled), onChange: (v) => { setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, enabled: v } } : c)); onAmdToggle("chill", v); } }) })), amd.chill?.supported && amd.chill.enabled && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.amdChillMin, value: amd.chill.min ?? 0, min: amd.chill.fmin ?? 0, max: amd.chill.fmax ?? 240, step: 1, showValue: true, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, min: v } } : c)); commitChillMin(v); } }) })), amd.chill?.supported && amd.chill.enabled && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.amdChillMax, value: amd.chill.max ?? 0, min: amd.chill.fmin ?? 0, max: amd.chill.fmax ?? 240, step: 1, showValue: true, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, max: v } } : c)); commitChillMax(v); } }) })), amd.sharpening?.supported && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.amdSharpening, description: local.amdSharpeningHint, checked: Boolean(amd.sharpening.enabled), onChange: (v) => { setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, enabled: v } } : c)); onAmdToggle("sharpening", v); } }) })), amd.sharpening?.supported && amd.sharpening.enabled && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.amdSharpeningValue, value: amd.sharpening.value ?? 0, min: amd.sharpening.smin ?? 0, max: amd.sharpening.smax ?? 100, step: 1, showValue: true, onChange: (v) => { markAmdTouch(); setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, value: v } } : c)); commitSharpVal(v); } }) }))] })), SP_JSX.jsxs(DFL.PanelSection, { title: local.advanced, children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "0.85rem", opacity: 0.85 }, children: `${local.agentLabel}: ${agentRunning ? local.agentRunning : local.agentStopped}` }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: agentRunning, onClick: onStartAgent, children: local.startAgent }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: !agentRunning, onClick: onStopAgent, children: local.stopAgent }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "0.78rem", opacity: 0.6 }, children: local.agentHint }) })] })] }));
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
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Quick Settings" }),
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
