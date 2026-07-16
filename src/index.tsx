import { definePlugin, toaster } from "@decky/api";
import {
  ButtonItem,
  DialogButton,
  DropdownItem,
  Focusable,
  ModalRoot,
  PanelSection,
  PanelSectionRow,
  showModal,
  SliderField,
  staticClasses,
  ToggleField,
} from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { FaSlidersH } from "react-icons/fa";

import {
  AudioDevices,
  Capabilities,
  DisplayStatus,
  ensureAgent,
  ensureAgentNow,
  getAgentStatus,
  getAudioDevices,
  getCapabilities,
  getDisplayStatus,
  getHdrStatus,
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
    if (isBigPicture()) await ensureAgentNow();
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
    } catch {
      resetAgentPromise();
      await ensureAgent();
      await sleep(600);
      try {
        const qs = await getQuickSettings();
        if (qs.volume) setVolume(qs.volume);
        if (qs.dimmer) setDimmer(qs.dimmer);
      } catch {
        /* agent may be intentionally stopped outside Big Picture */
      }
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
    let timer: number | undefined;
    (async () => {
      let c: Capabilities | null = null;
      try {
        c = await getCapabilities();
        setCaps(c);
      } catch { /* ignore */ }
      await loadAgentStatus();
      await loadHdr();
      await loadAudio();
      await refreshAgentRunning();
      if (c?.display) await loadDisplay();
      if (c?.tdp) await loadTdp();
      if (c?.lossless) await loadLossless();
      if (c?.amd_radeon) await loadAmd();
      timer = window.setInterval(() => {
        void loadAgentStatus();
        void loadHdr();
        void refreshAgentRunning();
        if (c?.lossless) void loadLossless();
        if (c?.amd_radeon && Date.now() - lastAmdTouch.current > 6000) void loadAmd();
      }, REFRESH_INTERVAL);
    })();
    return () => window.clearInterval(timer);
  }, []);

  // ---------------------------- handlers ----------------------------- //
  const onVolume = (level: number) => {
    const n = clampPercent(level);
    setVolume((c) => ({ ...c, level: n }));
    void setVolumeLevel(n).catch(() => notify(local.notConnected));
  };
  const onBrightness = (b: number) => {
    const level = brightnessToDimmer(clampPercent(b));
    setDimmer((c) => ({ ...c, level }));
    void setDimmerLevel(level).catch(() => notify(local.notConnected));
  };
  const onMicVolume = (level: number) => {
    const n = clampPercent(level);
    setAudio((c) => ({ ...c, input_volume: n }));
    void setMicrophoneVolumeLevel(n).catch(() => notify(local.audioDevicesUnavailable));
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

  return (
    <>
      <PanelSection title={local.audio}>
        <PanelSectionRow>
          <SliderField label={local.volume} value={volume.level} min={0} max={100} step={1} showValue valueSuffix="%" onChange={onVolume} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField label={local.microphoneVolume} value={clampPercent(audio.input_volume)} min={0} max={100} step={1} showValue valueSuffix="%" onChange={onMicVolume} />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem label={local.audioOutput} rgOptions={outputOptions} selectedOption={audio.default_output_id || outputOptions[0]?.data || ""} onChange={(o: any) => onOutput(o?.data ?? o)} />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem label={local.microphoneInput} rgOptions={inputOptions} selectedOption={audio.default_input_id || inputOptions[0]?.data || ""} onChange={(o: any) => onInput(o?.data ?? o)} />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={local.display}>
        <PanelSectionRow>
          <SliderField label={local.brightness} value={dimmerToBrightness(dimmer.level)} min={0} max={100} step={1} showValue valueSuffix="%" onChange={onBrightness} />
        </PanelSectionRow>
        {caps?.display && resolutionOptions.length > 0 && (
          <PanelSectionRow>
            <DropdownItem key={`res-${currentResolution}`} label={local.resolution} rgOptions={resolutionOptions} selectedOption={currentResolution} onChange={(o: any) => onResolution(o?.data ?? o)} />
          </PanelSectionRow>
        )}
        {caps?.display && refreshOptions.length > 0 && (
          <PanelSectionRow>
            <DropdownItem key={`hz-${currentRefresh}`} label={local.refreshRate} rgOptions={refreshOptions} selectedOption={currentRefresh} onChange={(o: any) => onRefresh(o?.data ?? o)} />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ToggleField label={local.hdr} checked={Boolean(hdr.enabled)} onChange={onHdr} />
        </PanelSectionRow>
      </PanelSection>

      {caps?.tdp && tdp?.available && (
        <PanelSection title={local.tdp}>
          <PanelSectionRow>
            <SliderField label={local.tdpLimit} value={tdpWatts || 15} min={4} max={40} step={1} showValue valueSuffix=" W" onChange={onTdp} />
          </PanelSectionRow>
        </PanelSection>
      )}

      {caps?.lossless && (
        <PanelSection title={local.lossless}>
          <PanelSectionRow>
            <ButtonItem layout="below" disabled={Boolean(lossless?.running)} onClick={onLaunchLossless}>
              {local.losslessLaunch}
            </ButtonItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <ToggleField label={local.losslessScaling} disabled={!lossless?.running} checked={Boolean(lossless?.scaling_active)} onChange={onScalingToggle} />
          </PanelSectionRow>
          <PanelSectionRow>
            <DropdownItem key={`fg-${lossless?.frame_gen ?? "Off"}`} label={local.losslessFrameGen} rgOptions={frameGenOptions} selectedOption={lossless?.frame_gen ?? "Off"} onChange={(o: any) => onFrameGen(o?.data ?? o)} />
          </PanelSectionRow>
          <PanelSectionRow>
            <SliderField label={local.losslessMultiplier} value={Math.max(2, Math.min(4, lossless?.multiplier ?? 2))} min={2} max={4} step={1} showValue valueSuffix="x" onChange={onMultiplier} />
          </PanelSectionRow>
          <PanelSectionRow>
            <div style={{ fontSize: "0.78rem", opacity: 0.6 }}>
              {local.losslessApplyNote}
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {caps?.amd_radeon && amd?.available && (
        <PanelSection title={local.amd}>
          {amd.rsr?.supported && (
            <PanelSectionRow>
              <ToggleField label={local.amdRsr} description={local.amdRsrHint} checked={Boolean(amd.rsr.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, enabled: v } } : c)); onAmdToggle("rsr", v); }} />
            </PanelSectionRow>
          )}
          {amd.rsr?.supported && amd.rsr.enabled && (
            <PanelSectionRow>
              <SliderField label={local.amdRsrSharpness} value={amd.rsr.sharpness ?? 0} min={amd.rsr.smin ?? 0} max={amd.rsr.smax ?? 100} step={1} showValue onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.rsr ? { ...c, rsr: { ...c.rsr, sharpness: v } } : c)); commitRsrSharp(v); }} />
            </PanelSectionRow>
          )}
          {amd.afmf?.supported && (
            <PanelSectionRow>
              <ToggleField label={local.amdAfmf} description={local.amdAfmfHint} checked={Boolean(amd.afmf.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.afmf ? { ...c, afmf: { ...c.afmf, enabled: v } } : c)); onAmdToggle("afmf", v); }} />
            </PanelSectionRow>
          )}
          {amd.antilag?.supported && (
            <PanelSectionRow>
              <ToggleField label={local.amdAntilag} description={local.amdAntilagHint} checked={Boolean(amd.antilag.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.antilag ? { ...c, antilag: { ...c.antilag, enabled: v } } : c)); onAmdToggle("antilag", v); }} />
            </PanelSectionRow>
          )}
          {amd.chill?.supported && (
            <PanelSectionRow>
              <ToggleField label={local.amdChill} description={local.amdChillHint} checked={Boolean(amd.chill.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, enabled: v } } : c)); onAmdToggle("chill", v); }} />
            </PanelSectionRow>
          )}
          {amd.chill?.supported && amd.chill.enabled && (
            <PanelSectionRow>
              <SliderField label={local.amdChillMin} value={amd.chill.min ?? 0} min={amd.chill.fmin ?? 0} max={amd.chill.fmax ?? 240} step={1} showValue onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, min: v } } : c)); commitChillMin(v); }} />
            </PanelSectionRow>
          )}
          {amd.chill?.supported && amd.chill.enabled && (
            <PanelSectionRow>
              <SliderField label={local.amdChillMax} value={amd.chill.max ?? 0} min={amd.chill.fmin ?? 0} max={amd.chill.fmax ?? 240} step={1} showValue onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.chill ? { ...c, chill: { ...c.chill, max: v } } : c)); commitChillMax(v); }} />
            </PanelSectionRow>
          )}
          {amd.sharpening?.supported && (
            <PanelSectionRow>
              <ToggleField label={local.amdSharpening} description={local.amdSharpeningHint} checked={Boolean(amd.sharpening.enabled)} onChange={(v: boolean) => { setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, enabled: v } } : c)); onAmdToggle("sharpening", v); }} />
            </PanelSectionRow>
          )}
          {amd.sharpening?.supported && amd.sharpening.enabled && (
            <PanelSectionRow>
              <SliderField label={local.amdSharpeningValue} value={amd.sharpening.value ?? 0} min={amd.sharpening.smin ?? 0} max={amd.sharpening.smax ?? 100} step={1} showValue onChange={(v: number) => { markAmdTouch(); setAmdState((c) => (c && c.sharpening ? { ...c, sharpening: { ...c.sharpening, value: v } } : c)); commitSharpVal(v); }} />
            </PanelSectionRow>
          )}
        </PanelSection>
      )}

      <PanelSection title={local.advanced}>
        <PanelSectionRow>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            {`${local.agentLabel}: ${agentRunning ? local.agentRunning : local.agentStopped}`}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={agentRunning} onClick={onStartAgent}>
            {local.startAgent}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={!agentRunning} onClick={onStopAgent}>
            {local.stopAgent}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "0.78rem", opacity: 0.6 }}>{local.agentHint}</div>
        </PanelSectionRow>
      </PanelSection>
    </>
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
    titleView: <div className={staticClasses.Title}>Quick Settings</div>,
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
