# Quick Settings 2.2.0 handover

Updated: 2026-07-20

## Scope

- Rebuilt the QAM layout with Playhub-style section cards and right-aligned branding.
- Replaced every Decky `SliderField` with a custom focusable slider based on the Now Playing volume control.
- Moved every dropdown below its label and made the control use the full card width.
- Updated QAM navigation containers to Steam's current `column` flow value, removing repeated navigation errors from the Steam log.
- Added one bounded backend snapshot for the first render instead of a serial chain of Decky calls.
- Started audio endpoint discovery in parallel with agent startup and retained the audio cache.
- Kept the direct localhost fast path for volume and brightness.
- Debounced slider writes so repeated gamepad input cannot leave late requests behind.
- Preserved audio, display, HDR, TDP, Lossless Scaling, AMD Radeon, and agent functions.
- Kept Lossless Scaling launches and restarts hidden and its settings writes atomic.

## Files changed

- `main.py`
- `src/index.tsx`
- `src/backend.ts`
- `dist/index.js`
- `dist/index.js.map`

## Live verification

- TypeScript check and Rollup build: passed.
- `python -m py_compile main.py`: passed.
- Backend hot reload through Decky: passed.
- Initial snapshot: 143 ms total on the test PC; audio came from the warmed cache in 1 ms.
- Local agent response: 39 ms, bound to `127.0.0.1:47993` in the same Windows session as Steam.
- QAM render: passed with five custom sliders and five full-width dropdowns.
- Measured card control width: 261 px for sliders and dropdown buttons; no horizontal overflow found.
- Slider input path: passed. Device volume changed `100 -> 99 -> 100`, and UI and agent values matched each step.
- Launch, display, audio, Lossless Scaling, AMD, and advanced sections rendered without a Decky error boundary.
- Consecutive Quick Settings and Launch Curtain QAM openings produced no new Steam error lines.

## Remaining device tests

- A real Lossless Scaling restart was not triggered because it would interrupt the running application.
- HDR, resolution, refresh rate, audio-device switching, and microphone writes were not changed during the live pass to avoid disrupting the current Gaming Mode session.

The protected `Quick-Settings` GitHub folder was not modified.

## GitHub large-file policy

- `Reference/` is local development material and is ignored by Git.
- The decompiled 213 MB `QuickSettingsAgent.exe` is not tracked and will not be uploaded.
- Runtime and installer packages continue to use the release binaries already handled by the project build/package flow.
