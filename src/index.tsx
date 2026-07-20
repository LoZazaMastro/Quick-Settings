import { definePlugin, toaster } from "@decky/api";
import {
  DialogButton,
  Dropdown,
  Focusable,
  GamepadButton,
  ModalRoot,
  ScrollPanel,
  showModal,
  staticClasses,
  ToggleField,
} from "@decky/ui";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { FaBolt, FaDesktop, FaMicrochip, FaPlay, FaSlidersH, FaTools, FaVolumeUp } from "react-icons/fa";

import {
  AudioDevices,
  Capabilities,
  DisplayStatus,
  ensureAgent,
  getAgentStatus,
  getAudioDevices,
  getCapabilities,
  getDisplayStatus,
  getHdrStatus,
  getInitialState,
  getLosslessStatus,
  getQuickSettings,
  getTdpStatus,
  HdrStatus,
  launchLossless,
  LosslessStatus,
  AmdStatus,
  getAmdStatus,
  setAmd,
  resetAgentPromise,
  setAudioInput,
  setAudioOutput,
  setDimmerLevel,
  setDisplayMode,
  setHdrEnabled,
  setLosslessSetting,
  setMicrophoneVolumeLevel,
  setRefreshRate,
  setTdp,
  setVolumeLevel,
  startAgentNow,
  stopAgentAuto,
  stopAgentNow,
  TdpStatus,
  setLosslessScaling,
} from "./backend";
import { Strings, t } from "./translations";

const REFRESH_INTERVAL = 15000;
const SLIDER_DEBOUNCE = 260;

const clampPercent = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const dimmerToBrightness = (d: number) => clampPercent(100 - d);
const brightnessToDimmer = (b: number) => clampPercent(100 - b);
const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function directionFromKey(key: string) {
  if (key === "ArrowLeft" || key === "Left") return -1;
  if (key === "ArrowRight" || key === "Right") return 1;
  return 0;
}

function directionFromGamepadButton(button: unknown) {
  if (button === GamepadButton.DIR_LEFT) return -1;
  if (button === GamepadButton.DIR_RIGHT) return 1;
  return 0;
}

function QuickSlider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);
  const setNext = (next: number) => {
    if (disabled) return;
    const clamped = Math.max(min, Math.min(max, Math.round(next / step) * step));
    valueRef.current = clamped;
    onChange(clamped);
  };
  const nudge = (direction: number) => setNext(valueRef.current + direction * step);
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <Focusable
      className="qsSlider"
      focusClassName="qsSliderFocused"
      noFocusRing
      onActivate={() => undefined}
      onButtonDown={(event: any) => {
        const direction = directionFromGamepadButton(event?.detail?.button);
        if (!direction) return;
        event.preventDefault?.();
        event.stopPropagation?.();
        nudge(direction);
      }}
      onKeyDown={(event: any) => {
        const direction = directionFromKey(event.key);
        if (!direction) return;
        event.preventDefault();
        event.stopPropagation();
        nudge(direction);
      }}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <div className="qsSliderHeader"><span>{label}</span><strong>{`${value}${suffix}`}</strong></div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        tabIndex={-1}
        style={{ "--qs-slider-fill": `${fill}%` } as any}
        onChange={(event) => setNext(Number(event.currentTarget.value))}
      />
    </Focusable>
  );
}

function QuickDropdown({ label, options, value, disabled = false, onChange }: {
  label: string;
  options: any[];
  value: any;
  disabled?: boolean;
  onChange: (value: any) => void;
}) {
  return (
    <div className="qsDropdownBlock">
      <div className="qsControlLabel">{label}</div>
      <div className="qsDropdownControl">
        <Dropdown
          focusable
          disabled={disabled}
          menuLabel={label}
          rgOptions={options}
          selectedOption={value}
          onChange={(option: any) => onChange(option?.data ?? option)}
        />
      </div>
    </div>
  );
}

// ---- Steam UI mode (agent runs only in Big Picture) ---- //
function getUIMode(): number {
  try {
    return (window as any).SteamClient?.UI?.GetUIMode?.() ?? -1;
  } catch {
    return -1;
  }
}
function isBigPicture(): boolean {
  const m = getUIMode();
  return m === 4 || m === 7 || m === -1; // 4/7 gamepad; -1 unknown -> assume BPM
}
async function syncAgentToMode(): Promise<void> {
  try {
    if (isBigPicture()) await ensureAgent();
    else await stopAgentAuto();
  } catch {
    /* ignore */
  }
}

function softRestartSteamUI(): void {
  try {
    const sc: any = (window as any).SteamClient;
    if (sc?.Browser?.RestartJSContext) {
      sc.Browser.RestartJSContext();
      return;
    }
    if (sc?.User?.StartRestart) sc.User.StartRestart(false);
  } catch {
    /* ignore */
  }
}

function useDebounced<T>(fn: (value: T) => void, delay = SLIDER_DEBOUNCE) {
  const timer = useRef<number | undefined>(undefined);
  return (value: T) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => fn(value), delay);
  };
}

function HdrConfirmModal({
  closeModal,
  onKeep,
  onRevert,
  label,
}: {
  closeModal?: () => void;
  onKeep?: () => void;
  onRevert?: () => void;
  label: Strings;
}) {
  const [seconds, setSeconds] = useState(10);
  const finished = useRef(false);
  const finishKeep = () => {
    if (finished.current) return;
    finished.current = true;
    onKeep?.();
    closeModal?.();
  };
  const finishRevert = () => {
    if (finished.current) return;
    finished.current = true;
    onRevert?.();
    closeModal?.();
  };
  useEffect(() => {
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
  return (
    <ModalRoot closeModal={finishRevert}>
      <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.65rem" }}>{label.hdrConfirmTitle}</div>
      <div style={{ fontSize: "0.85rem", lineHeight: "1.25rem", opacity: 0.82, marginBottom: "0.9rem" }}>
        {`${label.hdrConfirmBody} ${seconds}s`}
      </div>
      <Focusable flow-children="row" noFocusRing style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <DialogButton focusable onClick={finishRevert} style={{ minWidth: "7rem" }}>
          {label.cancel}
        </DialogButton>
        <DialogButton focusable onClick={finishKeep} style={{ minWidth: "7rem" }}>
          {label.ok}
        </DialogButton>
      </Focusable>
    </ModalRoot>
  );
}

function Content() {
  const local = t();

  const [volume, setVolume] = useState({ available: true, level: 50, muted: false });
  const [dimmer, setDimmer] = useState({ available: true, level: 0 });
  const [hdr, setHdr] = useState<HdrStatus>({
    available: true, supported: true, enabled: false, shortcut_only: true, real_state: false, message: "",
  });
  const [audio, setAudio] = useState<AudioDevices>({
    ok: false, message: "", outputs: [], inputs: [], default_output_id: "", default_input_id: "", input_volume: 0,
  });
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [display, setDisplay] = useState<DisplayStatus | null>(null);
  const [tdp, setTdpState] = useState<TdpStatus | null>(null);
  const [agentRunning, setAgentRunning] = useState(false);
  const [lossless, setLossless] = useState<LosslessStatus | null>(null);
  const [amd, setAmdState] = useState<AmdStatus | null>(null);

  const notify = (body: string) => toaster.toast({ title: local.title, body });

  // ----------------------------- loaders ----------------------------- //
  const loadAgentStatus = async () => {
    try {
      const qs = await getQuickSettings();
      if (qs.volume) setVolume(qs.volume);
      if (qs.dimmer) setDimmer(qs.dimmer);
      setAgentRunning(true);
    } catch {
      resetAgentPromise();
      void ensureAgent().then(async (running) => {
        setAgentRunning(running);
        if (!running) return;
        await sleep(120);
        try {
          const qs = await getQuickSettings();
          if (qs.volume) setVolume(qs.volume);
          if (qs.dimmer) setDimmer(qs.dimmer);
        } catch { /* keep the immediately rendered controls */ }
      });
    }
  };
  const loadHdr = async () => {
    try {
      const r: any = await getHdrStatus();
      setHdr(r?.hdr ?? r);
    } catch { /* keep */ }
  };
  const loadAudio = async () => {
    try {
      const r = await getAudioDevices();
      if (r) setAudio(r);
    } catch { /* keep */ }
  };
  const loadDisplay = async () => {
    try {
      const r = await getDisplayStatus();
      if (r?.ok) setDisplay(r);
    } catch { /* ignore */ }
  };
  const loadTdp = async () => {
    try {
      const r = await getTdpStatus();
      if (r) setTdpState(r);
    } catch { /* ignore */ }
  };
  const loadLossless = async () => {
    try {
      const r = await getLosslessStatus();
      if (r) setLossless(r);
    } catch { /* ignore */ }
  };
  const loadAmd = async () => {
    try {
      const r = await getAmdStatus();
      if (r) setAmdState(r);
    } catch { /* ignore */ }
  };
  const refreshAgentRunning = async () => {
    try {
      const r = await getAgentStatus();
      setAgentRunning(Boolean(r?.running));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    (async () => {
      void loadAgentStatus();
      let c: Capabilities | null = null;
      try {
        const initial = await getInitialState();
        if (cancelled) return;
        c = initial.capabilities;
        setCaps(c);
        if (initial.audio) setAudio(initial.audio);
        if (initial.hdr) setHdr((initial.hdr as any)?.hdr ?? initial.hdr as HdrStatus);
        if (initial.display?.ok) setDisplay(initial.display);
        if (initial.tdp) setTdpState(initial.tdp);
        if (initial.lossless) setLossless(initial.lossless);
        if (initial.amd) setAmdState(initial.amd);
      } catch { /* ignore */ }
      if (cancelled) return;
      timer = window.setInterval(() => {
        void loadAgentStatus();
        void loadHdr();
        void refreshAgentRunning();
        if (c?.lossless) void loadLossless();
        if (c?.amd_radeon && Date.now() - lastAmdTouch.current > 6000) void loadAmd();
      }, REFRESH_INTERVAL);
    })();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // ---------------------------- handlers ----------------------------- //
  const commitVolume = useDebounced<number>((level) => void setVolumeLevel(level).catch(() => notify(local.notConnected)), 35);
  const commitBrightness = useDebounced<number>((level) => void setDimmerLevel(level).catch(() => notify(local.notConnected)), 35);
  const commitMicVolume = useDebounced<number>((level) => void setMicrophoneVolumeLevel(level).catch(() => notify(local.audioDevicesUnavailable)), 180);
  const onVolume = (level: number) => {
    const n = clampPercent(level);
    setVolume((c) => ({ ...c, level: n }));
    commitVolume(n);
  };
  const onBrightness = (b: number) => {
    const level = brightnessToDimmer(clampPercent(b));
    setDimmer((c) => ({ ...c, level }));
    commitBrightness(level);
  };
  const onMicVolume = (level: number) => {
    const n = clampPercent(level);
    setAudio((c) => ({ ...c, input_volume: n }));
    commitMicVolume(n);
  };
  const onOutput = (id: string) => {
    if (!id) return;
    setAudio((c) => ({ ...c, default_output_id: id }));
    void setAudioOutput(id).then((r: any) => r?.ok && setAudio(r)).catch(() => notify(local.audioDevicesUnavailable));
  };
  const onInput = (id: string) => {
    if (!id) return;
    setAudio((c) => ({ ...c, default_input_id: id }));
    void setAudioInput(id).then((r: any) => r?.ok && setAudio(r)).catch(() => notify(local.audioDevicesUnavailable));
  };
  const onHdr = async (enabled: boolean) => {
    const previous = Boolean(hdr.enabled);
    setHdr((c) => ({ ...c, enabled, message: "" }));
    try {
      const r: any = await setHdrEnabled(enabled);
      const next = r?.hdr ?? r?.status?.hdr;
      if (next) setHdr(next);
      if (!r?.ok) {
        notify(r?.message || local.hdrUnavailable);
        await loadHdr();
        return;
      }
      const modal: any = showModal(
        <HdrConfirmModal
          label={local}
          closeModal={() => modal?.Close?.()}
          onKeep={() => void loadHdr()}
          onRevert={async () => {
            try {
              const back: any = await setHdrEnabled(previous);
              const b = back?.hdr ?? back?.status?.hdr;
              if (b) setHdr(b);
            } catch {
              notify(local.hdrUnavailable);
            }
          }}
        />
      );
    } catch {
      notify(local.notConnected);
      await loadHdr();
    }
  };

  // Display: the user's selection is authoritative for the dropdown — we never
  // overwrite it with the backend read-back, so the number updates instantly.
  const onResolution = async (value: string) => {
    const [w, h] = value.split("x").map((n) => parseInt(n, 10));
    const hz = display?.current?.hz ?? 0;
    setDisplay((c) => (c ? { ...c, current: { ...c.current, width: w, height: h } } : c));
    try {
      const r: any = await setDisplayMode(w, h, hz);
      if (r?.ok) {
        notify(local.adaptingUi);
        window.setTimeout(softRestartSteamUI, 1200);
      } else if (r?.message) {
        notify(r.message);
      }
    } catch {
      /* keep optimistic selection */
    }
  };
  const onRefresh = async (value: string) => {
    const hz = parseInt(value, 10);
    setDisplay((c) => (c ? { ...c, current: { ...c.current, hz } } : c));
    try {
      const r: any = await setRefreshRate(hz);
      if (r?.ok) {
        // Same trick that makes resolution correct: reload the Steam UI so the
        // dropdown remounts and shows the value that was actually applied.
        notify(local.adaptingUi);
        window.setTimeout(softRestartSteamUI, 1200);
      } else if (r?.message) {
        notify(r.message);
      }
    } catch {
      /* keep optimistic selection */
    }
  };

  const commitTdp = useDebounced<number>((v) => void setTdp(v).then(() => loadTdp()));
  const onTdp = (watts: number) => {
    setTdpState((c) => (c ? { ...c, stapm: watts, fast: watts, slow: watts } : c));
    commitTdp(watts);
  };

  const onStartAgent = () => void startAgentNow().then((r: any) => setAgentRunning(Boolean(r?.running))).catch(() => {});
  const onStopAgent = () => void stopAgentNow().then((r: any) => setAgentRunning(Boolean(r?.running))).catch(() => {});

  // Lossless Scaling
  const onLaunchLossless = () =>
    void launchLossless().then((r: any) => { if (r?.message) notify(r.message); }).catch(() => {}).finally(() => void loadLossless());
  const onScalingToggle = (enabled: boolean) => {
    setLossless((c) => (c ? { ...c, scaling_active: enabled } : c));
    void setLosslessScaling(enabled).then((r: any) => {
      if (r) setLossless((c) => (c ? { ...c, scaling_active: Boolean(r.active) } : c));
      if (r && r.ok === false && r.message) notify(r.message);
    }).catch(() => {});
  };
  const onFrameGen = (value: string) => {
    setLossless((c) => (c ? { ...c, frame_gen: value } : c));
    void setLosslessSetting("frame_gen", value).then((r: any) => { if (r && r.ok === false && r.message) notify(r.message); }).finally(() => window.setTimeout(() => void loadLossless(), 1500));
  };
  const commitMultiplier = useDebounced<number>((v) => void setLosslessSetting("multiplier", v).finally(() => window.setTimeout(() => void loadLossless(), 1500)));
  const onMultiplier = (value: number) => {
    const n = Math.max(2, Math.min(4, Math.round(value)));
    setLossless((c) => (c ? { ...c, multiplier: n } : c));
    commitMultiplier(n);
  };

  // AMD Radeon (via the ADLX helper). Sliders behave exactly like the volume /
  // brightness ones: optimistic value, a throttled write, and NO read-back that
  // could make the handle jump. A short grace window also keeps the periodic
  // refresh from overwriting a value you just set.
  const lastAmdTouch = useRef(0);
  const markAmdTouch = () => { lastAmdTouch.current = Date.now(); };
  const onAmd = (feature: string, value: string | number) => {
    markAmdTouch();
    void setAmd(feature, value)
      .then((r: any) => { if (r && r.ok === false && r.message) notify(r.message); })
      .catch(() => {});
  };
  const onAmdToggle = (feature: string, enabled: boolean) => onAmd(feature, enabled ? "on" : "off");
  const commitRsrSharp = useDebounced<number>((v) => onAmd("rsr_sharpness", v));
  const commitChillMin = useDebounced<number>((v) => onAmd("chill_min", v));
  const commitChillMax = useDebounced<number>((v) => onAmd("chill_max", v));
  const commitSharpVal = useDebounced<number>((v) => onAmd("sharpening_value", v));

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

  const section = (icon: ReactNode, title: string, children: ReactNode) => (
    <Focusable flow-children="column" className="qsCard">
      <div className="qsCardHeader">{icon}<span>{title}</span></div>
      <Focusable flow-children="column" className="qsCardBody">{children}</Focusable>
    </Focusable>
  );

  return (
    <ScrollPanel>
      <Focusable flow-children="column" className="qsRedesign">
        <style>{`
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
        `}</style>

        {section(<FaVolumeUp />, local.audio, <>
          <QuickSlider label={local.volume} value={volume.level} min={0} max={100} suffix="%" onChange={onVolume} />
          <QuickSlider label={local.microphoneVolume} value={clampPercent(audio.input_volume)} min={0} max={100} suffix="%" onChange={onMicVolume} />
          <QuickDropdown label={local.audioOutput} options={outputOptions} value={audio.default_output_id || outputOptions[0]?.data || ""} onChange={onOutput} />
          <QuickDropdown label={local.microphoneInput} options={inputOptions} value={audio.default_input_id || inputOptions[0]?.data || ""} onChange={onInput} />
        </>)}

        {section(<FaDesktop />, local.display, <>
          <QuickSlider label={local.brightness} value={dimmerToBrightness(dimmer.level)} min={0} max={100} suffix="%" onChange={onBrightness} />
          {caps?.display && resolutionOptions.length > 0 && <QuickDropdown key={`res-${currentResolution}`} label={local.resolution} options={resolutionOptions} value={currentResolution} onChange={onResolution} />}
          {caps?.display && refreshOptions.length > 0 && <QuickDropdown key={`hz-${currentRefresh}`} label={local.refreshRate} options={refreshOptions} value={currentRefresh} onChange={onRefresh} />}
          <ToggleField label={local.hdr} checked={Boolean(hdr.enabled)} onChange={onHdr} />
        </>)}

        {caps?.tdp && tdp?.available && section(<FaBolt />, local.tdp,
          <QuickSlider label={local.tdpLimit} value={tdpWatts || 15} min={4} max={40} suffix=" W" onChange={onTdp} />
        )}

        {caps?.lossless && section(<FaPlay />, local.lossless, <>
          <DialogButton disabled={Boolean(lossless?.running)} onClick={onLaunchLossless}><span className="qsButtonInner"><FaPlay /><span>{local.losslessLaunch}</span></span></DialogButton>
          <ToggleField label={local.losslessScaling} disabled={!lossless?.running} checked={Boolean(lossless?.scaling_active)} onChange={onScalingToggle} />
          <QuickDropdown key={`fg-${lossless?.frame_gen ?? "Off"}`} label={local.losslessFrameGen} options={frameGenOptions} value={lossless?.frame_gen ?? "Off"} onChange={onFrameGen} />
          <QuickSlider label={local.losslessMultiplier} value={Math.max(2, Math.min(4, lossless?.multiplier ?? 2))} min={2} max={4} suffix="x" onChange={onMultiplier} />
          <div className="qsMeta">{local.losslessApplyNote}</div>
        </>)}

        {caps?.amd_radeon && amd?.available && section(<FaMicrochip />, local.amd, <>
          {amd.rsr?.supported && <ToggleField label={local.amdRsr} description={local.amdRsrHint} checked={Boolean(amd.rsr.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, enabled: v } } : c)); onAmdToggle("rsr", v); }} />}
          {amd.rsr?.supported && amd.rsr.enabled && <QuickSlider label={local.amdRsrSharpness} value={amd.rsr.sharpness ?? 0} min={amd.rsr.smin ?? 0} max={amd.rsr.smax ?? 100} onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, sharpness: v } } : c)); commitRsrSharp(v); }} />}
          {amd.afmf?.supported && <ToggleField label={local.amdAfmf} description={local.amdAfmfHint} checked={Boolean(amd.afmf.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.afmf ? { ...c, afmf: { ...c.afmf, enabled: v } } : c)); onAmdToggle("afmf", v); }} />}
          {amd.antilag?.supported && <ToggleField label={local.amdAntilag} description={local.amdAntilagHint} checked={Boolean(amd.antilag.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.antilag ? { ...c, antilag: { ...c.antilag, enabled: v } } : c)); onAmdToggle("antilag", v); }} />}
          {amd.chill?.supported && <ToggleField label={local.amdChill} description={local.amdChillHint} checked={Boolean(amd.chill.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, enabled: v } } : c)); onAmdToggle("chill", v); }} />}
          {amd.chill?.supported && amd.chill.enabled && <QuickSlider label={local.amdChillMin} value={amd.chill.min ?? 0} min={amd.chill.fmin ?? 0} max={amd.chill.fmax ?? 240} onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, min: v } } : c)); commitChillMin(v); }} />}
          {amd.chill?.supported && amd.chill.enabled && <QuickSlider label={local.amdChillMax} value={amd.chill.max ?? 0} min={amd.chill.fmin ?? 0} max={amd.chill.fmax ?? 240} onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, max: v } } : c)); commitChillMax(v); }} />}
          {amd.sharpening?.supported && <ToggleField label={local.amdSharpening} description={local.amdSharpeningHint} checked={Boolean(amd.sharpening.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, enabled: v } } : c)); onAmdToggle("sharpening", v); }} />}
          {amd.sharpening?.supported && amd.sharpening.enabled && <QuickSlider label={local.amdSharpeningValue} value={amd.sharpening.value ?? 0} min={amd.sharpening.smin ?? 0} max={amd.sharpening.smax ?? 100} onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, value: v } } : c)); commitSharpVal(v); }} />}
        </>)}

        {section(<FaTools />, local.advanced, <>
          <div className="qsStatus">{`${local.agentLabel}: ${agentRunning ? local.agentRunning : local.agentStopped}`}</div>
          <DialogButton disabled={agentRunning} onClick={onStartAgent}><span className="qsButtonInner"><FaPlay /><span>{local.startAgent}</span></span></DialogButton>
          <DialogButton disabled={!agentRunning} onClick={onStopAgent}><span className="qsButtonInner"><FaTools /><span>{local.stopAgent}</span></span></DialogButton>
          <div className="qsMeta">{local.agentHint}</div>
        </>)}
      </Focusable>
    </ScrollPanel>
  );
}

export default definePlugin(() => {
  void syncAgentToMode();
  let registration: any;
  try {
    registration = (window as any).SteamClient?.UI?.RegisterForUIModeChanged?.(() => void syncAgentToMode());
  } catch {
    /* ignore */
  }
  return {
    name: "Quick Settings",
    titleView: <div className={staticClasses.Title} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.45rem", width: "100%", marginLeft: "auto", paddingRight: 8 }}><FaSlidersH size={19} /><span>Quick Settings</span></div>,
    content: <Content />,
    icon: <FaSlidersH />,
    onDismount() {
      try {
        registration?.unregister?.();
      } catch {
        /* ignore */
      }
    },
  };
});
