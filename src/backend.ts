// Backend client for Quick Settings.
//   * call(...)  -> Decky Python backend (main.py)
//   * fetch(...) -> bundled local agent on 127.0.0.1:47992 (volume + dimmer)

import { call } from "@decky/api";

export const API_BASE = "http://127.0.0.1:47992";

let ensureAgentPromise: Promise<boolean> | undefined;
export function resetAgentPromise(): void {
  ensureAgentPromise = undefined;
}
// Auto path: respects a manual stop (won't relaunch if the user pressed Stop).
export async function ensureAgent(): Promise<boolean> {
  if (!ensureAgentPromise) {
    ensureAgentPromise = call<[], any>("ensure_agent").then((r: any) => Boolean(r?.running ?? r)).catch(() => false);
  }
  return ensureAgentPromise;
}

// ----------------------------- Agent (HTTP) ---------------------------- //
export interface QuickSettingsStatus {
  volume: { available: boolean; level: number; muted: boolean };
  dimmer: { available: boolean; level: number };
}
export async function getQuickSettings(): Promise<QuickSettingsStatus> {
  await ensureAgent();
  const response = await fetch(`${API_BASE}/quick-settings`);
  if (!response.ok) throw new Error(`${response.status}`);
  return (await response.json()) as QuickSettingsStatus;
}
export async function postAgent(path: string, body: unknown): Promise<any> {
  await ensureAgent();
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${response.status}`);
  return await response.json();
}
export const setVolumeLevel = (level: number) => postAgent("/quick-settings/volume", { level });
export const setDimmerLevel = (level: number) => postAgent("/quick-settings/dimmer", { level });

// ----------------------- Agent lifecycle (Python) --------------------- //
export interface AgentStatus { running: boolean }
export const getAgentStatus = () => call<[], AgentStatus>("get_agent_status");
export const ensureAgentNow = () => call<[], any>("ensure_agent");
export const startAgentNow = () => call<[], { ok: boolean; running: boolean }>("start_agent");
export const stopAgentNow = () => call<[], { ok: boolean; running: boolean }>("stop_agent");
export const stopAgentAuto = () => call<[], { ok: boolean; running: boolean }>("stop_agent_auto");

// ---------------------------- Types ----------------------------------- //
export interface Capabilities {
  ok: boolean;
  platform: string;
  cpu: string;
  is_amd: boolean;
  performance: boolean;
  power_mode: boolean;
  display: boolean;
  tdp: boolean;
  tdp_message: string;
  lossless: boolean;
  amd_radeon: boolean;
  amd_build_needed: boolean;
  amd_path?: string;
}
export interface HdrStatus {
  available: boolean;
  supported: boolean;
  enabled: boolean;
  shortcut_only: boolean;
  real_state: boolean;
  message: string;
}
export interface AudioDevices {
  ok: boolean;
  message: string;
  outputs: { id: string; name: string }[];
  inputs: { id: string; name: string }[];
  default_output_id: string;
  default_input_id: string;
  input_volume: number;
}
export interface DisplayStatus {
  ok: boolean;
  message: string;
  current: { width?: number; height?: number; hz?: number };
  modes: { width: number; height: number; hz: number }[];
  resolutions: { width: number; height: number }[];
  refresh_rates: number[];
}
export interface TdpStatus {
  ok: boolean;
  available: boolean;
  message: string;
  stapm: number;
  fast: number;
  slow: number;
}
export interface LosslessStatus {
  ok: boolean;
  available: boolean;
  installed: boolean;
  running: boolean;
  path?: string;
  message: string;
  frame_gen?: string;
  multiplier?: number;
  hotkey?: string;
  scaling_active?: boolean;
  settings_found?: boolean;
}

// HDR
export const getHdrStatus = () => call<[], any>("get_hdr_status");
export const setHdrEnabled = (enabled: boolean) => call<[{ enabled: boolean }], any>("set_hdr_enabled", { enabled });

// Audio
export const getAudioDevices = () => call<[], AudioDevices>("get_audio_devices");
export const setAudioOutput = (id: string) => call<[{ id: string }], any>("set_audio_output", { id });
export const setAudioInput = (id: string) => call<[{ id: string }], any>("set_audio_input", { id });
export const setMicrophoneVolumeLevel = (level: number) => call<[{ level: number }], any>("set_microphone_volume", { level });

// Capabilities
export const getCapabilities = () => call<[], Capabilities>("get_capabilities");

// Display
export const getDisplayStatus = () => call<[], DisplayStatus>("get_display_status");
export const setDisplayMode = (width: number, height: number, hz: number) =>
  call<[{ width: number; height: number; hz: number }], any>("set_display_mode", { width, height, hz });
export const setRefreshRate = (hz: number) => call<[{ hz: number }], any>("set_refresh_rate", { hz });

// TDP
export const getTdpStatus = () => call<[], TdpStatus>("get_tdp_status");
export const setTdp = (watts: number) => call<[{ watts: number }], any>("set_tdp", { watts });

// Lossless Scaling
export const getLosslessStatus = () => call<[], LosslessStatus>("get_lossless_status");
export const launchLossless = () => call<[], { ok: boolean; running: boolean; message: string }>("launch_lossless");
export const setLosslessScaling = (enabled: boolean) =>
  call<[{ enabled: boolean }], { ok: boolean; active: boolean; message: string }>("set_lossless_scaling", { enabled });
export const setLosslessSetting = (key: string, value: string | number) =>
  call<[{ key: string; value: string | number }], any>("set_lossless_setting", { key, value });

// AMD Radeon (ADLX helper)
export interface AmdToggle { supported: boolean; enabled?: boolean }
export interface AmdStatus {
  ok: boolean;
  available: boolean;
  built: boolean;
  source: boolean;
  message?: string;
  gpu?: boolean;
  rsr?: { supported: boolean; enabled?: boolean; sharpness?: number; smin?: number; smax?: number };
  afmf?: AmdToggle;
  antilag?: AmdToggle;
  chill?: { supported: boolean; enabled?: boolean; min?: number; max?: number; fmin?: number; fmax?: number };
  sharpening?: { supported: boolean; enabled?: boolean; value?: number; smin?: number; smax?: number };
}
export const getAmdStatus = () => call<[], AmdStatus>("get_amd_status");
export const setAmd = (feature: string, value: string | number) =>
  call<[{ feature: string; value: string | number }], any>("set_amd", { feature, value });
