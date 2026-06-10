# Quick Settings

Decky plugin for Windows quick settings in Steam Big Picture.

It exposes Windows quick settings through a bundled local agent started by the
plugin backend.

Current controls:

- Device volume.
- Microphone volume.
- Screen dimmer overlay.
- Audio output and microphone input selectors.
- HDR toggle with a 10-second confirmation dialog.
- HDR visual state is read from Windows DisplayConfig / Advanced Color state when available, instead of relying on plugin-side saved state.