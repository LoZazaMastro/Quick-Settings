# Third-Party Notices

Quick Settings is distributed under the MIT License (see `LICENSE`). It also
distributes or builds upon the following third-party components.

## RyzenAdj — `bin/libryzenadj.dll` (LGPL-3.0-or-later)

Copyright (c) Jiaxun Yang and the RyzenAdj contributors.
Source: https://github.com/FlyGoat/RyzenAdj

`libryzenadj.dll` is a separately licensed, dynamically loaded shared library
used for AMD TDP control. It is loaded at runtime via ctypes and is not
statically linked. Quick Settings' own code is not a derivative work of
RyzenAdj. Full notice, the written offer of corresponding source, and the
license texts are in `licenses/RyzenAdj-LGPL-3.0.txt` and `licenses/GPL-3.0.txt`.
You may replace the DLL with your own build of the same library.

## GoTweaks — techniques and MIT source (MIT)

Copyright (c) Microsoft Corporation and the GoTweaks contributors.
Source: https://github.com/corando98/GoTweaks

Some performance/display/TDP control techniques were reimplemented from
GoTweaks' MIT-licensed source files. No GoTweaks binaries and no
VIIPER/`libviiper.dll` (GPL-3.0) code are included. See `LEGAL.md`.

## Decky Plugin Template (BSD 3-Clause)

Copyright (c) 2022-2024, Steam Deck Homebrew.
Source: https://github.com/SteamDeckHomebrew/decky-plugin-template

The plugin's build/runtime scaffolding is based on this template.

---

For the full reasoning on what is and is not included (and why this project
stays MIT), see `LEGAL.md`.
