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

const API_BASE = "http://127.0.0.1:47992";
const SLIDER_COMMIT_DELAY = 220;
const SLIDER_APPLY_THROTTLE = 70;
const REFRESH_INTERVAL = 15000;
const REFRESH_GRACE_PERIOD = 1500;
let ensureAgentPromise;
function sleep(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
async function ensureAgent() {
    if (!ensureAgentPromise) {
        ensureAgentPromise = call("ensure_agent").catch(() => false);
    }
    return ensureAgentPromise;
}
const strings = {
    en: {
        title: "Quick Settings",
        audio: "Audio",
        volume: "Device volume",
        microphoneVolume: "Microphone volume",
        display: "Display",
        brightness: "Brightness",
        hdr: "HDR",
        hdrUnavailable: "Could not toggle HDR",
        hdrConfirmTitle: "Keep HDR change?",
        hdrConfirmBody: "If the image looks correct, press OK. Otherwise the HDR toggle will be reverted automatically in",
        ok: "OK",
        cancel: "Cancel",
        audioOutput: "Audio output",
        microphoneInput: "Microphone input",
        audioDevicesUnavailable: "Audio devices unavailable",
        notConnected: "Quick Settings agent is not connected",
    },
    it: {
        title: "Quick Settings",
        audio: "Audio",
        volume: "Volume dispositivo",
        microphoneVolume: "Volume microfono",
        display: "Schermo",
        brightness: "Luminosita",
        hdr: "HDR",
        hdrUnavailable: "Impossibile attivare/disattivare HDR",
        hdrConfirmTitle: "Mantenere la modifica HDR?",
        hdrConfirmBody: "Se l'immagine e corretta, premi OK. Altrimenti l'HDR verra ripristinato automaticamente tra",
        ok: "OK",
        cancel: "Annulla",
        audioOutput: "Uscita audio",
        microphoneInput: "Ingresso microfono",
        audioDevicesUnavailable: "Dispositivi audio non disponibili",
        notConnected: "Agent Quick Settings non collegato",
    },
};
function t() {
    const language = navigator.language.split("-")[0];
    return strings[language] ?? strings.en;
}
function defaultStatus() {
    return {
        volume: { available: true, level: 50, muted: false },
        dimmer: { available: true, level: 0 },
        hdr: { available: true, supported: true, enabled: false, shortcut_only: true, real_state: false, message: "" },
        audioDevices: { ok: true, message: "", outputs: [], inputs: [], default_output_id: "", default_input_id: "", input_volume: 0 },
    };
}
function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
function dimmerToBrightness(dimmerLevel) {
    return clampPercent(100 - dimmerLevel);
}
function brightnessToDimmer(brightness) {
    return clampPercent(100 - brightness);
}
async function getQuickSettings() {
    await ensureAgent();
    const response = await fetch(`${API_BASE}/quick-settings`);
    if (!response.ok) {
        throw new Error(`${response.status}`);
    }
    return await response.json();
}
async function post(path, body) {
    await ensureAgent();
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`${response.status}`);
    }
    return await response.json();
}
async function getHdrStatus() {
    return await call("get_hdr_status");
}
async function setHdrEnabled(enabled) {
    return await call("set_hdr_enabled", { enabled });
}
async function getAudioDevices() {
    return await call("get_audio_devices");
}
async function setAudioOutput(id) {
    return await call("set_audio_output", { id });
}
async function setAudioInput(id) {
    return await call("set_audio_input", { id });
}
async function setMicrophoneVolumeLevel(level) {
    return await call("set_microphone_volume", { level });
}
async function getCombinedStatus() {
    const quickSettings = await getQuickSettings();
    let hdr = {
        available: true,
        supported: true,
        enabled: false,
        shortcut_only: true,
        real_state: false,
        message: "",
    };
    let audioDevices = {
        ok: false,
        message: "Audio devices unavailable",
        outputs: [],
        inputs: [],
        default_output_id: "",
        default_input_id: "",
        input_volume: 0,
    };
    try {
        const result = await getHdrStatus();
        hdr = result?.hdr ?? result ?? hdr;
    }
    catch (error) {
        hdr = { ...hdr, message: error instanceof Error ? error.message : "" };
    }
    try {
        const result = await getAudioDevices();
        audioDevices = result ?? audioDevices;
    }
    catch (error) {
        audioDevices = { ...audioDevices, message: error instanceof Error ? error.message : "Audio devices unavailable" };
    }
    return { ...quickSettings, hdr, audioDevices };
}
function HdrConfirmModal({ closeModal, onKeep, onRevert, label }) {
    const [seconds, setSeconds] = SP_REACT.useState(10);
    const finishedRef = SP_REACT.useRef(false);
    const finishKeep = () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        onKeep?.();
        closeModal?.();
    };
    const finishRevert = () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        onRevert?.();
        closeModal?.();
    };
    SP_REACT.useEffect(() => {
        const timer = window.setInterval(() => {
            setSeconds((current) => {
                if (current <= 1) {
                    window.clearInterval(timer);
                    window.setTimeout(finishRevert, 0);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, []);
    return SP_JSX.jsxs(DFL.ModalRoot, { closeModal: finishRevert, children: [
        SP_JSX.jsx("div", { style: { fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.65rem" }, children: label?.hdrConfirmTitle ?? "Keep HDR change?" }),
        SP_JSX.jsx("div", { style: { fontSize: "0.85rem", lineHeight: "1.25rem", opacity: 0.82, marginBottom: "0.9rem" }, children: `${label?.hdrConfirmBody ?? "If the image looks correct, press OK. Otherwise the HDR toggle will be reverted automatically in"} ${seconds}s` }),
        SP_JSX.jsxs(DFL.Focusable, { "flow-children": "row", noFocusRing: true, style: { display: "flex", gap: "0.5rem", justifyContent: "flex-end" }, children: [
            SP_JSX.jsx(DFL.DialogButton, { focusable: true, onClick: finishRevert, style: { minWidth: "7rem" }, children: label?.cancel ?? "Cancel" }),
            SP_JSX.jsx(DFL.DialogButton, { focusable: true, onClick: finishKeep, style: { minWidth: "7rem" }, children: label?.ok ?? "OK" })
        ] })
    ] });
}
function Content() {
    const local = t();
    const [status, setStatus] = SP_REACT.useState(() => defaultStatus());
    const [hdrBusy, setHdrBusy] = SP_REACT.useState(false);
    const [audioOutputBusy, setAudioOutputBusy] = SP_REACT.useState(false);
    const [audioInputBusy, setAudioInputBusy] = SP_REACT.useState(false);
    const lastInteractionRef = SP_REACT.useRef(0);
    const volumeApplyRef = SP_REACT.useRef({ timer: undefined, inFlight: false, pending: null, lastSent: 0 });
    const microphoneVolumeApplyRef = SP_REACT.useRef({ timer: undefined, inFlight: false, pending: null, lastSent: 0 });
    const dimmerApplyRef = SP_REACT.useRef({ timer: undefined, inFlight: false, pending: null, lastSent: 0 });
    const volumeSeqRef = SP_REACT.useRef(0);
    const microphoneVolumeSeqRef = SP_REACT.useRef(0);
    const brightnessSeqRef = SP_REACT.useRef(0);
    const markInteraction = () => { lastInteractionRef.current = Date.now(); };
    const refresh = async () => {
        const startedAt = Date.now();
        if (startedAt - lastInteractionRef.current < REFRESH_GRACE_PERIOD) return;
        try {
            const nextStatus = await getCombinedStatus();
            if (lastInteractionRef.current > startedAt || Date.now() - lastInteractionRef.current < REFRESH_GRACE_PERIOD) return;
            setStatus((current) => ({ ...(current ?? defaultStatus()), ...nextStatus }));
        }
        catch (error) {
            try {
                ensureAgentPromise = undefined;
                await ensureAgent();
                await sleep(750);
                const nextStatus = await getCombinedStatus();
                if (lastInteractionRef.current > startedAt || Date.now() - lastInteractionRef.current < REFRESH_GRACE_PERIOD) return;
                setStatus((current) => ({ ...(current ?? defaultStatus()), ...nextStatus }));
            }
            catch {
                setStatus((current) => current ?? defaultStatus());
                toaster.toast({ title: local.title, body: error instanceof Error ? `${local.notConnected}: ${error.message}` : local.notConnected });
            }
        }
    };
    const scheduleSliderApply = (stateRef, item, apply) => {
        const state = stateRef.current;
        state.pending = item;
        const run = async () => {
            const currentState = stateRef.current;
            if (currentState.inFlight) return;
            const now = Date.now();
            const wait = Math.max(0, SLIDER_APPLY_THROTTLE - (now - (currentState.lastSent || 0)));
            if (wait > 0) {
                window.clearTimeout(currentState.timer);
                currentState.timer = window.setTimeout(run, wait);
                return;
            }
            const next = currentState.pending;
            if (!next) return;
            currentState.pending = null;
            currentState.inFlight = true;
            currentState.lastSent = Date.now();
            try {
                await apply(next);
            }
            finally {
                currentState.inFlight = false;
                if (currentState.pending) {
                    void run();
                }
            }
        };
        void run();
    };
    const commitVolume = (level, seq) => {
        scheduleSliderApply(volumeApplyRef, { level, seq }, async (item) => {
            try {
                const result = await post("/quick-settings/volume", { level: item.level });
                if (item.seq === volumeSeqRef.current) {
                    setStatus((current) => current ? { ...current, volume: { ...(result.status?.volume ?? current.volume), level: item.level } } : result.status);
                }
                if (!result.ok) toaster.toast({ title: local.title, body: result.message });
            }
            catch (error) {
                toaster.toast({ title: local.title, body: error instanceof Error ? `${local.notConnected}: ${error.message}` : local.notConnected });
                await refresh();
            }
        });
    };
    const commitMicrophoneVolume = (level, seq) => {
        scheduleSliderApply(microphoneVolumeApplyRef, { level, seq }, async (item) => {
            try {
                const result = await setMicrophoneVolumeLevel(item.level);
                if (result?.ok) {
                    if (item.seq === microphoneVolumeSeqRef.current) {
                        setStatus((current) => current ? { ...current, audioDevices: { ...current.audioDevices, ...result, input_volume: item.level } } : current);
                    }
                }
                else toaster.toast({ title: local.title, body: result?.message ?? local.audioDevicesUnavailable });
            }
            catch (error) {
                toaster.toast({ title: local.title, body: error instanceof Error ? error.message : local.audioDevicesUnavailable });
                await refresh();
            }
        });
    };
    const commitBrightness = (brightness, seq) => {
        scheduleSliderApply(dimmerApplyRef, { brightness, seq }, async (item) => {
            const dimmerLevel = brightnessToDimmer(item.brightness);
            try {
                const result = await post("/quick-settings/dimmer", { level: dimmerLevel });
                if (item.seq === brightnessSeqRef.current) {
                    setStatus((current) => current ? { ...current, dimmer: { ...(result.status?.dimmer ?? current.dimmer), level: dimmerLevel } } : result.status);
                }
                if (!result.ok) toaster.toast({ title: local.title, body: result.message });
            }
            catch (error) {
                toaster.toast({ title: local.title, body: error instanceof Error ? `${local.notConnected}: ${error.message}` : local.notConnected });
                await refresh();
            }
        });
    };
    const setVolume = (rawLevel) => {
        const level = clampPercent(rawLevel);
        markInteraction();
        const seq = ++volumeSeqRef.current;
        setStatus((current) => current ? { ...current, volume: { ...current.volume, level } } : current);
        commitVolume(level, seq);
    };
    const setMicrophoneVolume = (rawLevel) => {
        const level = clampPercent(rawLevel);
        markInteraction();
        const seq = ++microphoneVolumeSeqRef.current;
        setStatus((current) => current ? { ...current, audioDevices: { ...current.audioDevices, input_volume: level } } : current);
        commitMicrophoneVolume(level, seq);
    };
    const setBrightness = (rawBrightness) => {
        const brightness = clampPercent(rawBrightness);
        const dimmerLevel = brightnessToDimmer(brightness);
        markInteraction();
        const seq = ++brightnessSeqRef.current;
        setStatus((current) => current ? { ...current, dimmer: { ...current.dimmer, level: dimmerLevel } } : current);
        commitBrightness(brightness, seq);
    };
    const showHdrConfirmation = (nextEnabled, previousEnabled) => {
        let modal;
        const closeModal = () => modal?.Close?.();
        const revert = async () => {
            setHdrBusy(true);
            try {
                const result = await setHdrEnabled(previousEnabled);
                const hdr = result?.hdr ?? result?.status?.hdr;
                if (hdr) setStatus((current) => current ? { ...current, hdr } : current);
                await refresh();
            }
            catch (error) {
                toaster.toast({ title: local.title, body: error instanceof Error ? error.message : "Could not revert HDR." });
            }
            finally { setHdrBusy(false); }
        };
        modal = DFL.showModal?.(SP_JSX.jsx(HdrConfirmModal, { closeModal, label: local, onKeep: () => {
                void refresh();
            }, onRevert: () => { void revert(); } }), undefined, { strTitle: local.hdrConfirmTitle ?? "Keep HDR change?" });
        if (!modal) toaster.toast({ title: local.title, body: local.hdrConfirmBody ?? "HDR shortcut sent." });
    };
    const setHdr = async (enabled) => {
        markInteraction();
        const previousEnabled = Boolean(status?.hdr?.enabled);
        setHdrBusy(true);
        setStatus((current) => current ? { ...current, hdr: { ...current.hdr, enabled, message: "" } } : current);
        try {
            const result = await setHdrEnabled(enabled);
            const hdr = result?.hdr ?? result?.status?.hdr;
            if (hdr) setStatus((current) => current ? { ...current, hdr } : current);
            if (!result?.ok) {
                toaster.toast({ title: local.title, body: result?.message ?? local.hdrUnavailable });
                await refresh();
            }
            else showHdrConfirmation(enabled, previousEnabled);
        }
        catch (error) {
            toaster.toast({ title: local.title, body: error instanceof Error ? `${local.notConnected}: ${error.message}` : local.notConnected });
            await refresh();
        }
        finally { setHdrBusy(false); }
    };
    const setOutputDevice = async (id) => {
        if (!id) return;
        markInteraction();
        setAudioOutputBusy(true);
        setStatus((current) => current ? { ...current, audioDevices: { ...current.audioDevices, default_output_id: id } } : current);
        try {
            const result = await setAudioOutput(id);
            if (result?.ok) setStatus((current) => current ? { ...current, audioDevices: result } : current);
            else { toaster.toast({ title: local.title, body: result?.message ?? local.audioDevicesUnavailable }); await refresh(); }
        }
        catch (error) { toaster.toast({ title: local.title, body: error instanceof Error ? error.message : local.audioDevicesUnavailable }); await refresh(); }
        finally { setAudioOutputBusy(false); }
    };
    const setInputDevice = async (id) => {
        if (!id) return;
        markInteraction();
        setAudioInputBusy(true);
        setStatus((current) => current ? { ...current, audioDevices: { ...current.audioDevices, default_input_id: id } } : current);
        try {
            const result = await setAudioInput(id);
            if (result?.ok) setStatus((current) => current ? { ...current, audioDevices: result } : current);
            else { toaster.toast({ title: local.title, body: result?.message ?? local.audioDevicesUnavailable }); await refresh(); }
        }
        catch (error) { toaster.toast({ title: local.title, body: error instanceof Error ? error.message : local.audioDevicesUnavailable }); await refresh(); }
        finally { setAudioInputBusy(false); }
    };
    SP_REACT.useEffect(() => {
        refresh();
        const timer = window.setInterval(refresh, REFRESH_INTERVAL);
        return () => {
            window.clearInterval(timer);
            window.clearTimeout(volumeApplyRef.current.timer);
            window.clearTimeout(microphoneVolumeApplyRef.current.timer);
            window.clearTimeout(dimmerApplyRef.current.timer);
        };
    }, []);
    const volume = status?.volume ?? { available: false, level: 0, muted: false };
    const dimmer = status?.dimmer ?? { available: true, level: 0 };
    const hdr = status?.hdr ?? { available: true, supported: true, shortcut_only: true, real_state: false, enabled: false, message: "" };
    const audioDevices = status?.audioDevices ?? { outputs: [], inputs: [], default_output_id: "", default_input_id: "", input_volume: 0, ok: false };
    const rawOutputOptions = (audioDevices.outputs ?? []).map((device) => ({ data: device.id, label: device.name || local.audioOutput }));
    const rawInputOptions = (audioDevices.inputs ?? []).map((device) => ({ data: device.id, label: device.name || local.microphoneInput }));
    const outputOptions = rawOutputOptions.length > 0 ? rawOutputOptions : [{ data: "", label: local.audioDevicesUnavailable }];
    const inputOptions = rawInputOptions.length > 0 ? rawInputOptions : [{ data: "", label: local.audioDevicesUnavailable }];
    const selectedOutput = audioDevices.default_output_id || rawOutputOptions[0]?.data || "";
    const selectedInput = audioDevices.default_input_id || rawInputOptions[0]?.data || "";
    const microphoneVolume = clampPercent(audioDevices.input_volume ?? 0);
    const brightness = dimmerToBrightness(dimmer.level);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [
        SP_JSX.jsxs(DFL.PanelSection, { title: local.audio, children: [
            SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.volume, disabled: false, value: volume.level, min: 0, max: 100, step: 1, showValue: true, valueSuffix: "%", onChange: setVolume }) }),
            SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.microphoneVolume, disabled: false, value: microphoneVolume, min: 0, max: 100, step: 1, showValue: true, valueSuffix: "%", onChange: setMicrophoneVolume }) }),
            SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: local.audioOutput, rgOptions: outputOptions, selectedOption: selectedOutput, disabled: false, onChange: (option) => { void setOutputDevice(option?.data ?? option); } }) }),
            SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: local.microphoneInput, rgOptions: inputOptions, selectedOption: selectedInput, disabled: false, onChange: (option) => { void setInputDevice(option?.data ?? option); } }) }),
            !audioDevices.ok ? SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "12px", lineHeight: "16px", opacity: 0.72 }, children: audioDevices.message || local.audioDevicesUnavailable }) }) : null
        ] }),
        SP_JSX.jsxs(DFL.PanelSection, { title: local.display, children: [
            SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: local.brightness, disabled: false, value: brightness, min: 0, max: 100, step: 1, showValue: true, valueSuffix: "%", onChange: setBrightness }) }),
            SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: local.hdr, disabled: false, checked: Boolean(hdr.enabled), onChange: setHdr }) })
        ] })
    ] }));
}
var index = definePlugin(() => {
    return {
        name: "Quick Settings",
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Quick Settings" }),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaSlidersH, {}),
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
