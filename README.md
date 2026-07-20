# Quick Settings (Decky, Windows) — v2.2.0

A Decky plugin that exposes Windows quick settings inside Steam Big Picture.
Works on **any Windows PC** and does **not require the Xbox Game Bar**.

## Features

**Audio** — device volume, microphone volume, output/input selectors.

**Display** — brightness (dimmer overlay), resolution, refresh rate, HDR toggle
(native DisplayConfig: `SET_HDR_STATE` on Win11 24H2+, `SET_ADVANCED_COLOR_STATE`
on older builds — no Game Bar). Changing resolution soft-restarts the Steam UI so
Big Picture re-fits.

**Performance** — Windows power mode (Best efficiency / Balanced / Better / Best).
No administrator rights required. (CPU Boost / EPP / CPU-state controls were
removed: they need an elevated `powercfg` that Decky can't reliably provide.)

**TDP (AMD only, auto-detected)** — power-limit slider via the RyzenAdj library.

**Lossless Scaling (auto-detected)** — launch the app and toggle scaling with its
default Ctrl+Alt+S hotkey, when Lossless Scaling is installed.

**Advanced** — start/stop the bundled agent. It starts with the plugin backend,
then follows Steam's Big Picture lifecycle without showing a console window.

Controls the machine cannot use are hidden automatically (`get_capabilities`).

## Architecture

- `main.py` — Decky Python backend (HDR, audio, capabilities, power mode,
  display modes, TDP, Lossless Scaling, agent lifecycle). Pure Python + ctypes.
- `bin/QuickSettingsAgent.exe` — bundled local agent (HTTP 127.0.0.1:47993) for
  device volume and the brightness dimmer overlay.
- `bin/libryzenadj.dll` — RyzenAdj (LGPL-3.0), loaded for AMD TDP.
- `src/` — TypeScript/React frontend, built to `dist/index.js`.

## Build

```
npm install
npm run build
```

**AMD Radeon (Radeon GPU)** — Radeon Super Resolution, Fluid Motion Frames
(AFMF), Anti-Lag, Radeon Chill and Image Sharpening, via AMD's ADLX SDK. A small
C# helper (`amd/`) must be compiled once by double-clicking `amd/build_amd.bat`
(uses the in-box Windows .NET compiler — no Visual Studio). The section then
shows only the features your GPU supports.

## Roadmap

- **RTSS performance OSD** (FPS/CPU/GPU overlay) — next iteration.

## Licensing

MIT (see `LICENSE`). Reuses techniques from the MIT-licensed parts of GoTweaks,
excluding its GPL-3.0 `libviiper.dll` and all controller-emulation code. See
`LEGAL.md`, `NOTICE`, `THIRD-PARTY-NOTICES.md`.
