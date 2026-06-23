# Licensing & legal notes

Quick Settings is licensed under the **MIT License** (see `LICENSE`). This file
explains how features inspired by **GoTweaks** were integrated while keeping the
project under MIT, and which components were deliberately excluded.

## Can GoTweaks features be reused? Yes - with conditions

GoTweaks has a **layered license**:

- GoTweaks' **own source files** are **MIT**. They may be reused and ported with
  attribution.
- GoTweaks' **shipped binaries** are **GPL-3.0**, because they link
  `libviiper.dll` (VIIPER). Linking a GPL-3.0 library produces a *combined work*
  that must itself be conveyed under GPL-3.0.

### The golden rule we followed
**We never include, link, or derive from `libviiper.dll` or any VIIPER /
controller-emulation code.** Therefore Quick Settings is *not* a combined work
with VIIPER and is *not* forced to GPL-3.0. It stays MIT.

VIIPER in GoTweaks only powers controller emulation (button remapping,
joystick-to-mouse, gyro-to-stick) - all of which is Legion Go / handheld
controller functionality that this project intentionally drops anyway.

## What was actually ported

Only **techniques and logic** from GoTweaks' MIT source were reimplemented in
Python/TypeScript for the Decky stack (the two projects share no code -
GoTweaks is C#/.NET for the Xbox Game Bar):

- CPU power-plan controls (boost, EPP, min/max processor state) via `powercfg`.
- Windows power-mode overlay via `powrprof`.
- Display resolution / refresh-rate via `ChangeDisplaySettingsEx`.
- AMD TDP via the RyzenAdj library (see below).

These are credited in `NOTICE`.

## Bundled third-party library: RyzenAdj (LGPL-3.0)

AMD TDP control uses `bin/libryzenadj.dll` (RyzenAdj), which is **LGPL-3.0**.
The LGPL permits shipping it as a **separate, dynamically loaded DLL** from an
MIT program, provided we (a) give notice, (b) include the license, (c) provide
the corresponding source or a written offer, and (d) let users replace the DLL.
All four are satisfied - see `licenses/RyzenAdj-LGPL-3.0.txt`. Quick Settings'
own code remains MIT.

## Components deliberately excluded

| Component | License / issue | Why excluded |
|---|---|---|
| `libviiper.dll` (VIIPER) | GPL-3.0 | Would force the whole project to GPL-3.0. Only needed for controller emulation (Legion Go). |
| Controller / gyro / RGB / fan / battery-limit code | Legion Go / GPD specific | Out of scope: the goal is "works on any Windows PC". |
| `WinRing0x64.dll`, `inpoutx64.dll` | ring0 drivers, flagged by Windows Defender | Not safe to ship broadly; need elevation and trip antivirus. |
| `GamepadMotion.dll` | MIT but controller-only | Not needed without controller features. |
| ADLX (AMD Radeon features) | AMD SDK + heavy SWIG/.NET binding | Cannot be bound from the Python/Decky stack without a compiled native helper; see README "Roadmap". |
| RTSS / OSD overlay | RTSS is proprietary freeware | Not redistributable; would require the user's own RTSS install + a native helper. |

## Feature portability summary

- **Any Windows PC:** audio, volume, brightness (dimmer), HDR, CPU power-plan
  controls, power mode, resolution, refresh rate.
- **AMD only (auto-detected, hidden otherwise):** TDP. (The UI hides controls
  the machine does not support via `get_capabilities`.)

## Disclaimer

This is a good-faith analysis, not legal advice. If you intend to distribute
commercially, consider having the licensing reviewed by a professional.
