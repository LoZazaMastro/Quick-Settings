import asyncio
import copy
import ctypes
import json
import os
import subprocess
import tempfile
import threading
import time
import urllib.request
from ctypes import wintypes

import decky


PORT = 47992
HEALTH_URL = f"http://127.0.0.1:{PORT}/health"
AUDIO_CACHE_SECONDS = 600
_AUDIO_CACHE_LOCK = threading.Lock()
_AUDIO_CACHE_VALUE = None
_AUDIO_CACHE_EXPIRES_AT = 0.0



class Plugin:
    def __init__(self):
        self._agent_process = None
        self._agent_user_stopped = False

    async def _main(self):
        # The agent is started/stopped by the frontend based on the Steam UI
        # mode (only while Big Picture is active), so it is not auto-started here.
        return

    async def _unload(self):
        self._stop_agent()

    async def _uninstall(self):
        self._stop_agent()

    async def _migration(self):
        pass

    async def ensure_agent(self):
        # Auto path (loaders / Big Picture): respect a manual stop.
        if self._agent_user_stopped:
            return False
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._ensure_agent_sync)

    def _ensure_agent_sync(self):
        if self._is_agent_ready():
            return True

        agent_path = self._agent_path()
        if not os.path.exists(agent_path):
            decky.logger.error(f"Quick Settings agent not found: {agent_path}")
            return False

        creation_flags = 0
        if os.name == "nt":
            creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

        for attempt in range(3):
            try:
                self._agent_process = subprocess.Popen(
                    [agent_path],
                    cwd=os.path.dirname(agent_path),
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    creationflags=creation_flags,
                    close_fds=True,
                )
            except Exception as error:
                decky.logger.error(f"Cannot start Quick Settings agent: {error}")
                return False

            exited = False
            for _ in range(40):
                if self._is_agent_ready():
                    decky.logger.info("Quick Settings agent started")
                    return True
                if self._agent_process and self._agent_process.poll() is not None:
                    exited = True
                    break
                time.sleep(0.25)

            # Exited (e.g. the HTTP port is still held right after a kill) or
            # never answered: drop it, let the port free, and retry.
            self._agent_process = None
            if not exited:
                break
            time.sleep(1.2)

        decky.logger.error("Quick Settings agent did not start")
        return False

    def _stop_agent(self):
        if not self._agent_process:
            return

        if self._agent_process.poll() is None:
            try:
                self._agent_process.terminate()
                self._agent_process.wait(timeout=3)
            except Exception:
                try:
                    self._agent_process.kill()
                except Exception:
                    pass

        self._agent_process = None

    def _is_agent_ready(self):
        try:
            with urllib.request.urlopen(HEALTH_URL, timeout=1) as response:
                return response.status == 200
        except Exception:
            return False

    def _agent_path(self):
        return os.path.join(os.path.dirname(__file__), "bin", "QuickSettingsAgent.exe")

    async def get_hdr_status(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_hdr_status_sync)

    async def set_hdr_enabled(self, request):
        enabled = False
        if isinstance(request, dict):
            enabled = bool(request.get("enabled"))
        else:
            enabled = bool(request)

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_hdr_enabled_sync, enabled)

    async def get_audio_devices(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_audio_devices_sync)

    async def set_audio_output(self, request):
        device_id = ""
        if isinstance(request, dict):
            device_id = str(request.get("id", request.get("device_id", "")) or "")
        else:
            device_id = str(request or "")
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_audio_device_sync, "output", device_id)

    async def set_audio_input(self, request):
        device_id = ""
        if isinstance(request, dict):
            device_id = str(request.get("id", request.get("device_id", "")) or "")
        else:
            device_id = str(request or "")
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_audio_device_sync, "input", device_id)

    async def set_microphone_volume(self, request):
        level = 0
        if isinstance(request, dict):
            level = request.get("level", request.get("volume", 0))
        else:
            level = request
        try:
            level = int(round(float(level)))
        except Exception:
            level = 0
        level = max(0, min(100, level))
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_microphone_volume_sync, level)

    # ----------------------------------------------------------------- #
    #  Capabilities (let the UI hide controls the machine cannot use)   #
    # ----------------------------------------------------------------- #

    async def get_capabilities(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_capabilities_sync)

    # ----------------------------------------------------------------- #
    #  Performance / CPU power-plan controls (any Windows PC)           #
    # ----------------------------------------------------------------- #

    async def get_performance_status(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_performance_status_sync)

    async def set_power_mode(self, request):
        mode = str(_arg(request, "mode", "balanced"))
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_power_overlay_sync, mode)

    async def get_lossless_status(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_lossless_status_sync)

    async def launch_lossless(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _launch_lossless_sync)

    async def set_lossless_scaling(self, request):
        enabled = bool(_arg(request, "enabled", False))
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_lossless_scaling_sync, enabled)

    async def set_lossless_setting(self, request):
        key = str(_arg(request, "key", ""))
        value = _arg(request, "value", "")
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_lossless_setting_sync, key, value)

    async def get_amd_status(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_amd_status_sync)

    async def set_amd(self, request):
        feature = str(_arg(request, "feature", ""))
        value = _arg(request, "value", "")
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_amd_sync, feature, value)

    # ----------------------------------------------------------------- #
    #  Display resolution / refresh-rate controls (any Windows PC)      #
    # ----------------------------------------------------------------- #

    async def get_display_status(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_display_status_sync)

    async def set_display_mode(self, request):
        width = int(_arg(request, "width", 0) or 0)
        height = int(_arg(request, "height", 0) or 0)
        hz = int(_arg(request, "hz", _arg(request, "refresh", 0)) or 0)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_display_mode_sync, width, height, hz)

    async def set_refresh_rate(self, request):
        hz = int(_arg(request, "hz", _arg(request, "refresh", 0)) or 0)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_display_mode_sync, 0, 0, hz)

    # ----------------------------------------------------------------- #
    #  TDP control via libryzenadj.dll (AMD Ryzen APUs only)           #
    # ----------------------------------------------------------------- #

    async def get_tdp_status(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_tdp_status_sync)

    async def set_tdp(self, request):
        watts = _arg(request, "watts", None)
        stapm = _arg(request, "stapm", watts)
        fast = _arg(request, "fast", watts)
        slow = _arg(request, "slow", watts)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _set_tdp_sync, stapm, fast, slow)

    # ----------------------------------------------------------------- #
    #  Agent lifecycle (manual buttons + Big Picture mode control)      #
    # ----------------------------------------------------------------- #

    async def get_agent_status(self):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: {"running": self._is_agent_ready()})

    async def start_agent(self):
        # Explicit start: clear the manual-stop latch and (re)spawn.
        self._agent_user_stopped = False
        loop = asyncio.get_event_loop()
        running = await loop.run_in_executor(None, self._ensure_agent_sync)
        return {"ok": bool(running), "running": bool(running)}

    async def stop_agent(self):
        # Explicit stop: latch so auto-start won't immediately undo it.
        self._agent_user_stopped = True
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._stop_agent_fully)

    async def stop_agent_auto(self):
        # Leaving Big Picture: stop without latching the manual flag.
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._stop_agent_fully)

    def _stop_agent_fully(self):
        self._stop_agent()
        self._kill_agent_processes()
        return {"ok": True, "running": self._is_agent_ready()}

    def _kill_agent_processes(self):
        if os.name != "nt":
            return
        try:
            subprocess.run(
                ["taskkill", "/F", "/IM", "QuickSettingsAgent.exe"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                timeout=5,
            )
        except Exception:
            pass

# HDR and Windows audio device helpers.

def _hdr_status_payload(enabled=False, available=False, supported=False, targets=None, message="", real_state=False):
    return {
        "available": bool(available),
        "supported": bool(supported),
        "enabled": bool(enabled),
        "shortcut_only": not bool(real_state),
        "real_state": bool(real_state),
        "targets": targets or [],
        "message": message,
    }


# Minimal DisplayConfig / Advanced Color definitions.
# The HDR toggle must mirror Windows' actual HDR state instead of a plugin-side saved value.
UINT32 = ctypes.c_uint32
UINT64 = ctypes.c_uint64
INT32 = ctypes.c_int32


class LUID(ctypes.Structure):
    _fields_ = [("LowPart", UINT32), ("HighPart", INT32)]


class DISPLAYCONFIG_RATIONAL(ctypes.Structure):
    _fields_ = [("Numerator", UINT32), ("Denominator", UINT32)]


class DISPLAYCONFIG_2DREGION(ctypes.Structure):
    _fields_ = [("cx", UINT32), ("cy", UINT32)]


class POINTL(ctypes.Structure):
    _fields_ = [("x", INT32), ("y", INT32)]


class DISPLAYCONFIG_VIDEO_SIGNAL_INFO(ctypes.Structure):
    _fields_ = [
        ("pixelRate", UINT64),
        ("hSyncFreq", DISPLAYCONFIG_RATIONAL),
        ("vSyncFreq", DISPLAYCONFIG_RATIONAL),
        ("activeSize", DISPLAYCONFIG_2DREGION),
        ("totalSize", DISPLAYCONFIG_2DREGION),
        ("videoStandard", UINT32),
        ("scanLineOrdering", UINT32),
    ]


class DISPLAYCONFIG_TARGET_MODE(ctypes.Structure):
    _fields_ = [("targetVideoSignalInfo", DISPLAYCONFIG_VIDEO_SIGNAL_INFO)]


class DISPLAYCONFIG_SOURCE_MODE(ctypes.Structure):
    _fields_ = [("width", UINT32), ("height", UINT32), ("pixelFormat", UINT32), ("position", POINTL)]


class DISPLAYCONFIG_DESKTOP_IMAGE_INFO(ctypes.Structure):
    _fields_ = [
        ("PathSourceSize", DISPLAYCONFIG_2DREGION),
        ("DesktopImageRegion", wintypes.RECT),
        ("DesktopImageClip", wintypes.RECT),
    ]


class DISPLAYCONFIG_MODE_INFO_UNION(ctypes.Union):
    _fields_ = [
        ("targetMode", DISPLAYCONFIG_TARGET_MODE),
        ("sourceMode", DISPLAYCONFIG_SOURCE_MODE),
        ("desktopImageInfo", DISPLAYCONFIG_DESKTOP_IMAGE_INFO),
    ]


class DISPLAYCONFIG_MODE_INFO(ctypes.Structure):
    _fields_ = [("infoType", UINT32), ("id", UINT32), ("adapterId", LUID), ("modeInfo", DISPLAYCONFIG_MODE_INFO_UNION)]


class DISPLAYCONFIG_PATH_SOURCE_INFO(ctypes.Structure):
    _fields_ = [("adapterId", LUID), ("id", UINT32), ("modeInfoIdx", UINT32), ("statusFlags", UINT32)]


class DISPLAYCONFIG_PATH_TARGET_INFO(ctypes.Structure):
    _fields_ = [
        ("adapterId", LUID),
        ("id", UINT32),
        ("modeInfoIdx", UINT32),
        ("outputTechnology", UINT32),
        ("rotation", UINT32),
        ("scaling", UINT32),
        ("refreshRate", DISPLAYCONFIG_RATIONAL),
        ("scanLineOrdering", UINT32),
        ("targetAvailable", wintypes.BOOL),
        ("statusFlags", UINT32),
    ]


class DISPLAYCONFIG_PATH_INFO(ctypes.Structure):
    _fields_ = [("sourceInfo", DISPLAYCONFIG_PATH_SOURCE_INFO), ("targetInfo", DISPLAYCONFIG_PATH_TARGET_INFO), ("flags", UINT32)]


class DISPLAYCONFIG_DEVICE_INFO_HEADER(ctypes.Structure):
    _fields_ = [("type", UINT32), ("size", UINT32), ("adapterId", LUID), ("id", UINT32)]


class DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO(ctypes.Structure):
    _fields_ = [("header", DISPLAYCONFIG_DEVICE_INFO_HEADER), ("value", UINT32), ("colorEncoding", UINT32), ("bitsPerColorChannel", UINT32)]


class DISPLAYCONFIG_SET_ADVANCED_COLOR_STATE(ctypes.Structure):
    _fields_ = [("header", DISPLAYCONFIG_DEVICE_INFO_HEADER), ("value", UINT32)]


QDC_ONLY_ACTIVE_PATHS = 0x00000002
DISPLAYCONFIG_DEVICE_INFO_GET_ADVANCED_COLOR_INFO = 9
DISPLAYCONFIG_DEVICE_INFO_SET_ADVANCED_COLOR_STATE = 10
ERROR_SUCCESS = 0


def _copy_luid(value):
    copied = LUID()
    copied.LowPart = value.LowPart
    copied.HighPart = value.HighPart
    return copied


def _active_display_paths():
    if os.name != "nt":
        return []

    user32 = ctypes.windll.user32
    get_sizes = user32.GetDisplayConfigBufferSizes
    query = user32.QueryDisplayConfig

    get_sizes.argtypes = [UINT32, ctypes.POINTER(UINT32), ctypes.POINTER(UINT32)]
    get_sizes.restype = wintypes.LONG
    query.restype = wintypes.LONG

    path_count = UINT32(0)
    mode_count = UINT32(0)
    status = get_sizes(QDC_ONLY_ACTIVE_PATHS, ctypes.byref(path_count), ctypes.byref(mode_count))
    if status != ERROR_SUCCESS or path_count.value <= 0:
        return []

    paths = (DISPLAYCONFIG_PATH_INFO * path_count.value)()
    modes = (DISPLAYCONFIG_MODE_INFO * max(1, mode_count.value))()
    # With QDC_ONLY_ACTIVE_PATHS the topology pointer MUST be NULL; passing a
    # non-NULL pointer makes QueryDisplayConfig fail and report zero displays
    # (this is exactly what broke HDR: the diagnostic showed "paths=0/0").
    status = query(
        QDC_ONLY_ACTIVE_PATHS,
        ctypes.byref(path_count),
        paths,
        ctypes.byref(mode_count),
        modes,
        None,
    )
    if status != ERROR_SUCCESS:
        return []

    return list(paths)[: path_count.value]


# Windows 11 24H2+ reports HDR through GET_ADVANCED_COLOR_INFO_2 (type 13).
DISPLAYCONFIG_DEVICE_INFO_GET_ADVANCED_COLOR_INFO_2 = 15


class DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO_2(ctypes.Structure):
    _fields_ = [
        ("header", DISPLAYCONFIG_DEVICE_INFO_HEADER),
        ("value", UINT32),
        ("activeColorMode", UINT32),
    ]


def _query_advanced_color(get_device_info, target):
    """Read HDR/advanced-colour info for one target, trying the modern API
    (GET_ADVANCED_COLOR_INFO_2, Win11 24H2+) then the classic one."""
    # Modern API first: it is the reliable one on current Windows builds.
    info2 = DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO_2()
    info2.header.type = DISPLAYCONFIG_DEVICE_INFO_GET_ADVANCED_COLOR_INFO_2
    info2.header.size = ctypes.sizeof(DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO_2)
    info2.header.adapterId = _copy_luid(target.adapterId)
    info2.header.id = target.id
    if get_device_info(ctypes.byref(info2)) == ERROR_SUCCESS:
        value = int(info2.value)
        # bit0 advancedColorSupported, bit1 advancedColorActive,
        # bit4 highDynamicRangeSupported, bit5 highDynamicRangeUserEnabled.
        return {
            "id": int(target.id),
            "supported": bool(value & 0x10) or bool(value & 0x1),
            "enabled": bool(value & 0x20) or bool(value & 0x2),
            "wide_color_enforced": bool(value & 0x80),
            "force_disabled": False,
            "bits_per_color_channel": 0,
            "color_encoding": 0,
        }

    # Classic API (Win10 / Win11 < 24H2).
    info = DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO()
    info.header.type = DISPLAYCONFIG_DEVICE_INFO_GET_ADVANCED_COLOR_INFO
    info.header.size = ctypes.sizeof(DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO)
    info.header.adapterId = _copy_luid(target.adapterId)
    info.header.id = target.id
    if get_device_info(ctypes.byref(info)) == ERROR_SUCCESS:
        value = int(info.value)
        return {
            "id": int(target.id),
            "supported": bool(value & 0x1),
            "enabled": bool(value & 0x2),
            "wide_color_enforced": bool(value & 0x4),
            "force_disabled": bool(value & 0x8),
            "bits_per_color_channel": int(info.bitsPerColorChannel),
            "color_encoding": int(info.colorEncoding),
        }
    return None


def _get_advanced_color_targets():
    if os.name != "nt":
        return []

    user32 = ctypes.windll.user32
    get_device_info = user32.DisplayConfigGetDeviceInfo
    get_device_info.restype = wintypes.LONG

    targets = []
    for path in _active_display_paths():
        result = _query_advanced_color(get_device_info, path.targetInfo)
        if result:
            targets.append(result)

    return targets


def _read_real_hdr_status():
    if os.name != "nt":
        return _hdr_status_payload(False, False, False, [], "HDR is only available on Windows.", False)

    try:
        targets = _get_advanced_color_targets()
    except Exception as error:
        return _hdr_status_payload(False, False, False, [], f"Could not read HDR state: {error}", False)

    if not targets:
        return _hdr_status_payload(False, False, False, [], "Could not read HDR state from Windows.", False)

    supported = any(target.get("supported") for target in targets)
    enabled = any(target.get("enabled") for target in targets if target.get("supported"))
    if not supported:
        enabled = any(target.get("enabled") for target in targets)

    message = "" if supported else "No active HDR-capable display found."
    return _hdr_status_payload(enabled, supported, supported, targets, message, True)


def _get_hdr_status_sync():
    hdr = _read_real_hdr_status()
    return {"ok": os.name == "nt" and bool(hdr.get("real_state")), "hdr": hdr, **hdr}


def _target_supports_hdr(target):
    """Query a single display target and report whether it advertises HDR."""
    user32 = ctypes.windll.user32
    get_device_info = user32.DisplayConfigGetDeviceInfo
    get_device_info.restype = wintypes.LONG
    result = _query_advanced_color(get_device_info, target)
    return bool(result and result.get("supported"))


DISPLAYCONFIG_DEVICE_INFO_SET_HDR_STATE = 16


def _write_color_state(target, enabled, info_type):
    """Write one HDR / advanced-colour state to a target; returns Win32 status."""
    user32 = ctypes.windll.user32
    set_device_info = user32.DisplayConfigSetDeviceInfo
    set_device_info.restype = wintypes.LONG
    state = DISPLAYCONFIG_SET_ADVANCED_COLOR_STATE()
    state.header.type = info_type
    state.header.size = ctypes.sizeof(DISPLAYCONFIG_SET_ADVANCED_COLOR_STATE)
    state.header.adapterId = _copy_luid(target.adapterId)
    state.header.id = target.id
    state.value = 1 if enabled else 0
    return int(set_device_info(ctypes.byref(state)))


def _set_advanced_color_enabled(enabled):
    # Returns (changed, detail) where detail is a short diagnostic string with
    # the Win32 status codes per display target, so failures can be reported.
    if os.name != "nt":
        return False, "not-windows"

    paths = _active_display_paths()
    supported_paths = [p for p in paths if _target_supports_hdr(p.targetInfo)]
    target_paths = supported_paths or paths

    changed = False
    notes = []
    for index, path in enumerate(target_paths):
        target = path.targetInfo
        hdr_rc = _write_color_state(target, enabled, DISPLAYCONFIG_DEVICE_INFO_SET_HDR_STATE)
        if hdr_rc == ERROR_SUCCESS:
            changed = True
            notes.append("t%d:hdr=OK" % index)
            continue
        acs_rc = _write_color_state(target, enabled, DISPLAYCONFIG_DEVICE_INFO_SET_ADVANCED_COLOR_STATE)
        if acs_rc == ERROR_SUCCESS:
            changed = True
        notes.append("t%d:hdr=0x%X,acs=0x%X" % (index, hdr_rc & 0xFFFFFFFF, acs_rc & 0xFFFFFFFF))
    detail = "paths=%d/%d %s" % (len(target_paths), len(paths), " ".join(notes))
    return changed, detail


def _set_hdr_enabled_sync(enabled):
    enabled = bool(enabled)
    if os.name != "nt":
        hdr = _read_real_hdr_status()
        return {"ok": False, "message": hdr.get("message", "HDR is only available on Windows."), "hdr": hdr, "status": {"hdr": hdr}}

    previous = _read_real_hdr_status()
    previous_enabled = bool(previous.get("enabled"))
    if previous.get("real_state") and previous_enabled == enabled:
        return {"ok": True, "message": "", "hdr": previous, "status": {"hdr": previous}}

    # Issue the DisplayConfig write (SET_HDR_STATE on 24H2+, else
    # SET_ADVANCED_COLOR_STATE). "accepted" means Windows accepted the call.
    # No Xbox Game Bar / Win+Alt+B is involved.
    accepted = False
    error = ""
    detail = ""
    try:
        accepted, detail = _set_advanced_color_enabled(enabled)
    except Exception as exc:
        error = str(exc)

    time.sleep(0.8)
    hdr = _read_real_hdr_status()
    verified = bool(hdr.get("real_state")) and bool(hdr.get("enabled")) == enabled

    # Treat an accepted API call as success even when the state cannot be read
    # back: some builds refuse the read but still apply the change.
    ok = verified or accepted
    if ok:
        message = ""
    elif error:
        message = error
    else:
        base = hdr.get("message") or "Windows refused the HDR change (this display may not support HDR)."
        message = (base + " [" + detail + "]") if detail else base

    if not hdr.get("real_state"):
        if accepted:
            hdr["enabled"] = enabled
            hdr["supported"] = True
        if message and not hdr.get("message"):
            hdr["message"] = message
    return {"ok": ok, "message": message, "hdr": hdr, "status": {"hdr": hdr}}


def _powershell_path():
    if os.name == "nt":
        candidate = os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "System32", "WindowsPowerShell", "v1.0", "powershell.exe")
        if os.path.exists(candidate):
            return candidate
    return "powershell"


_AUDIO_HELPER_SCRIPT = r'''
$ErrorActionPreference = 'Stop'
Add-Type -Language CSharp -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

namespace QuickSettingsAudio
{
    public enum EDataFlow { eRender = 0, eCapture = 1, eAll = 2 }
    public enum ERole { eConsole = 0, eMultimedia = 1, eCommunications = 2 }

    [ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
    public class MMDeviceEnumeratorComObject { }

    [ComImport, Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IMMDeviceEnumerator
    {
        [PreserveSig] int EnumAudioEndpoints(EDataFlow dataFlow, uint dwStateMask, out IntPtr ppDevices);
        [PreserveSig] int GetDefaultAudioEndpoint(EDataFlow dataFlow, ERole role, out IMMDevice ppEndpoint);
        [PreserveSig] int GetDevice([MarshalAs(UnmanagedType.LPWStr)] string pwstrId, out IMMDevice ppDevice);
        [PreserveSig] int RegisterEndpointNotificationCallback(IntPtr pClient);
        [PreserveSig] int UnregisterEndpointNotificationCallback(IntPtr pClient);
    }

    [ComImport, Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IMMDevice
    {
        [PreserveSig] int Activate(ref Guid iid, uint dwClsCtx, IntPtr pActivationParams, out IntPtr ppInterface);
        [PreserveSig] int OpenPropertyStore(uint stgmAccess, out IntPtr ppProperties);
        [PreserveSig] int GetId([MarshalAs(UnmanagedType.LPWStr)] out string ppstrId);
        [PreserveSig] int GetState(out uint pdwState);
    }

    [ComImport, Guid("5CDF2C82-841E-4546-9722-0CF74078229D"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IAudioEndpointVolume
    {
        [PreserveSig] int RegisterControlChangeNotify(IntPtr pNotify);
        [PreserveSig] int UnregisterControlChangeNotify(IntPtr pNotify);
        [PreserveSig] int GetChannelCount(out uint pnChannelCount);
        [PreserveSig] int SetMasterVolumeLevel(float fLevelDB, ref Guid pguidEventContext);
        [PreserveSig] int SetMasterVolumeLevelScalar(float fLevel, ref Guid pguidEventContext);
        [PreserveSig] int GetMasterVolumeLevel(out float pfLevelDB);
        [PreserveSig] int GetMasterVolumeLevelScalar(out float pfLevel);
        [PreserveSig] int SetChannelVolumeLevel(uint nChannel, float fLevelDB, ref Guid pguidEventContext);
        [PreserveSig] int SetChannelVolumeLevelScalar(uint nChannel, float fLevel, ref Guid pguidEventContext);
        [PreserveSig] int GetChannelVolumeLevel(uint nChannel, out float pfLevelDB);
        [PreserveSig] int GetChannelVolumeLevelScalar(uint nChannel, out float pfLevel);
        [PreserveSig] int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, ref Guid pguidEventContext);
        [PreserveSig] int GetMute(out bool pbMute);
        [PreserveSig] int GetVolumeStepInfo(out uint pnStep, out uint pnStepCount);
        [PreserveSig] int VolumeStepUp(ref Guid pguidEventContext);
        [PreserveSig] int VolumeStepDown(ref Guid pguidEventContext);
        [PreserveSig] int QueryHardwareSupport(out uint pdwHardwareSupportMask);
        [PreserveSig] int GetVolumeRange(out float pflVolumeMindB, out float pflVolumeMaxdB, out float pflVolumeIncrementdB);
    }

    [ComImport, Guid("870af99c-171d-4f9e-af0d-e63df40c2bc9")]
    public class PolicyConfigClient { }

    [ComImport, Guid("f8679f50-850a-41cf-9c72-430f290290c8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IPolicyConfig
    {
        [PreserveSig] int GetMixFormat([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, out IntPtr ppFormat);
        [PreserveSig] int GetDeviceFormat([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, int bDefault, out IntPtr ppFormat);
        [PreserveSig] int ResetDeviceFormat([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName);
        [PreserveSig] int SetDeviceFormat([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, IntPtr pEndpointFormat, IntPtr pMixFormat);
        [PreserveSig] int GetProcessingPeriod([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, int bDefault, out long pmftDefaultPeriod, out long pmftMinimumPeriod);
        [PreserveSig] int SetProcessingPeriod([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, ref long pmftPeriod);
        [PreserveSig] int GetShareMode([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, IntPtr pMode);
        [PreserveSig] int SetShareMode([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, IntPtr mode);
        [PreserveSig] int GetPropertyValue([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, IntPtr key, out IntPtr pv);
        [PreserveSig] int SetPropertyValue([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, IntPtr key, IntPtr pv);
        [PreserveSig] int SetDefaultEndpoint([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, ERole role);
        [PreserveSig] int SetEndpointVisibility([MarshalAs(UnmanagedType.LPWStr)] string pszDeviceName, int visible);
    }

    public static class Audio
    {
        private static IMMDeviceEnumerator Enumerator() { return (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject()); }

        public static string DefaultId(int flow)
        {
            try
            {
                IMMDevice device;
                int hr = Enumerator().GetDefaultAudioEndpoint((EDataFlow)flow, ERole.eMultimedia, out device);
                if (hr != 0 || device == null) return String.Empty;
                string id;
                hr = device.GetId(out id);
                return hr == 0 ? id : String.Empty;
            }
            catch { return String.Empty; }
        }

        public static void SetDefault(string id)
        {
            if (String.IsNullOrWhiteSpace(id)) return;
            var policy = (IPolicyConfig)(new PolicyConfigClient());
            policy.SetDefaultEndpoint(id, ERole.eConsole);
            policy.SetDefaultEndpoint(id, ERole.eMultimedia);
            policy.SetDefaultEndpoint(id, ERole.eCommunications);
        }

        public static float EndpointVolume(int flow)
        {
            try
            {
                IMMDevice device;
                int hr = Enumerator().GetDefaultAudioEndpoint((EDataFlow)flow, ERole.eMultimedia, out device);
                if (hr != 0 || device == null) return -1;
                Guid iid = typeof(IAudioEndpointVolume).GUID;
                IntPtr ptr;
                hr = device.Activate(ref iid, 23, IntPtr.Zero, out ptr);
                if (hr != 0 || ptr == IntPtr.Zero) return -1;
                try
                {
                    var endpoint = (IAudioEndpointVolume)Marshal.GetObjectForIUnknown(ptr);
                    float scalar;
                    hr = endpoint.GetMasterVolumeLevelScalar(out scalar);
                    if (hr != 0) return -1;
                    return scalar * 100.0f;
                }
                finally { Marshal.Release(ptr); }
            }
            catch { return -1; }
        }

        public static void SetEndpointVolume(int flow, float level)
        {
            if (level < 0) level = 0;
            if (level > 100) level = 100;
            IMMDevice device;
            int hr = Enumerator().GetDefaultAudioEndpoint((EDataFlow)flow, ERole.eMultimedia, out device);
            if (hr != 0 || device == null) return;
            Guid iid = typeof(IAudioEndpointVolume).GUID;
            IntPtr ptr;
            hr = device.Activate(ref iid, 23, IntPtr.Zero, out ptr);
            if (hr != 0 || ptr == IntPtr.Zero) return;
            try
            {
                var endpoint = (IAudioEndpointVolume)Marshal.GetObjectForIUnknown(ptr);
                Guid eventContext = Guid.Empty;
                endpoint.SetMasterVolumeLevelScalar(level / 100.0f, ref eventContext);
            }
            finally { Marshal.Release(ptr); }
        }
    }
}
"@

function Get-QSAudioDevices {
    param(
        [Parameter(Mandatory=$true)][ValidateSet('Render','Capture')][string]$Kind,
        [Parameter(Mandatory=$false)][string]$DefaultId = ''
    )

    $basePath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\$Kind"
    $prefix = if ($Kind -eq 'Render') { '{0.0.0.00000000}.' } else { '{0.0.1.00000000}.' }
    $devices = @()

    if (-not (Test-Path $basePath)) { return $devices }

    foreach ($endpoint in Get-ChildItem -Path $basePath -ErrorAction SilentlyContinue) {
        $state = 0
        try { $state = [int](Get-ItemProperty -Path $endpoint.PSPath -Name 'DeviceState' -ErrorAction Stop).DeviceState } catch { $state = 0 }
        if ($state -ne 1) { continue }

        $name = ''
        $propertiesPath = Join-Path $endpoint.PSPath 'Properties'
        if (Test-Path $propertiesPath) {
            try {
                $props = Get-ItemProperty -Path $propertiesPath -ErrorAction Stop
                foreach ($propName in @('{a45c254e-df1c-4efd-8020-67d146a850e0},14', '{a45c254e-df1c-4efd-8020-67d146a850e0},2')) {
                    $value = $props.$propName
                    if ($null -ne $value -and -not [String]::IsNullOrWhiteSpace([string]$value)) {
                        $name = [string]$value
                        break
                    }
                }
            } catch { }
        }

        if ([String]::IsNullOrWhiteSpace($name)) { $name = $endpoint.PSChildName }
        $id = "$prefix$($endpoint.PSChildName)"
        $devices += [PSCustomObject]@{
            id = $id
            name = $name
            is_default = [String]::Equals($id, $DefaultId, [StringComparison]::OrdinalIgnoreCase)
        }
    }

    return $devices
}

if ($env:QS_AUDIO_ACTION -eq 'set' -and -not [String]::IsNullOrWhiteSpace($env:QS_AUDIO_DEVICE_ID)) {
    [QuickSettingsAudio.Audio]::SetDefault($env:QS_AUDIO_DEVICE_ID)
    Start-Sleep -Milliseconds 150
}

if ($env:QS_AUDIO_ACTION -eq 'set_input_volume' -and -not [String]::IsNullOrWhiteSpace($env:QS_AUDIO_LEVEL)) {
    [QuickSettingsAudio.Audio]::SetEndpointVolume(1, [float]$env:QS_AUDIO_LEVEL)
    Start-Sleep -Milliseconds 80
    $volume = [QuickSettingsAudio.Audio]::EndpointVolume(1)
    if ($volume -lt 0) { $volume = [float]$env:QS_AUDIO_LEVEL }
    $result = [PSCustomObject]@{
        ok = $true
        message = 'Microphone volume updated.'
        input_volume = [int][Math]::Round($volume)
    }
    $result | ConvertTo-Json -Depth 8 -Compress
    return
}

$outputDefault = [QuickSettingsAudio.Audio]::DefaultId(0)
$inputDefault = [QuickSettingsAudio.Audio]::DefaultId(1)
$inputVolume = [QuickSettingsAudio.Audio]::EndpointVolume(1)
if ($inputVolume -lt 0) { $inputVolume = 0 }
$result = [PSCustomObject]@{
    ok = $true
    message = 'Audio devices loaded.'
    default_output_id = $outputDefault
    default_input_id = $inputDefault
    input_volume = [int][Math]::Round($inputVolume)
    outputs = @(Get-QSAudioDevices -Kind 'Render' -DefaultId $outputDefault)
    inputs = @(Get-QSAudioDevices -Kind 'Capture' -DefaultId $inputDefault)
}
$result | ConvertTo-Json -Depth 8 -Compress
'''



def _empty_audio_result(message="Audio devices unavailable"):
    return {
        "ok": False,
        "message": message,
        "outputs": [],
        "inputs": [],
        "default_output_id": "",
        "default_input_id": "",
        "input_volume": 0,
    }


def _normalize_audio_result(data):
    if not isinstance(data, dict):
        return _empty_audio_result("Could not read audio devices.")
    data.setdefault("ok", True)
    data.setdefault("message", "Audio devices loaded.")
    data.setdefault("outputs", [])
    data.setdefault("inputs", [])
    data.setdefault("default_output_id", "")
    data.setdefault("default_input_id", "")
    try:
        data["input_volume"] = max(0, min(100, int(round(float(data.get("input_volume", 0))))))
    except Exception:
        data["input_volume"] = 0
    return data


def _run_audio_powershell(action="get", device_id="", level=None):
    if os.name != "nt":
        return _empty_audio_result("Audio device selection is only available on Windows.")

    env = os.environ.copy()
    env["QS_AUDIO_ACTION"] = action
    env["QS_AUDIO_DEVICE_ID"] = device_id or ""
    env["QS_AUDIO_LEVEL"] = "" if level is None else str(level)
    try:
        completed = subprocess.run(
            [_powershell_path(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", _AUDIO_HELPER_SCRIPT],
            cwd=os.path.dirname(__file__),
            env=env,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=12,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
    except Exception as error:
        return _empty_audio_result(str(error))

    if completed.returncode != 0:
        message = (completed.stderr or completed.stdout or "PowerShell audio helper failed.").strip()
        decky.logger.warning(f"Quick Settings audio helper failed: {message}")
        return _empty_audio_result(message)

    try:
        data = json.loads((completed.stdout or "{}").strip())
        return _normalize_audio_result(data)
    except Exception as error:
        decky.logger.warning(f"Quick Settings audio JSON parse failed: {error}")

    return _empty_audio_result("Could not read audio devices.")


def _audio_cache_get():
    global _AUDIO_CACHE_VALUE, _AUDIO_CACHE_EXPIRES_AT
    with _AUDIO_CACHE_LOCK:
        if _AUDIO_CACHE_VALUE is not None and time.time() < _AUDIO_CACHE_EXPIRES_AT:
            return copy.deepcopy(_AUDIO_CACHE_VALUE)
    return None


def _audio_cache_set(value):
    global _AUDIO_CACHE_VALUE, _AUDIO_CACHE_EXPIRES_AT
    if not isinstance(value, dict) or not value.get("ok"):
        return
    with _AUDIO_CACHE_LOCK:
        _AUDIO_CACHE_VALUE = copy.deepcopy(value)
        _AUDIO_CACHE_EXPIRES_AT = time.time() + AUDIO_CACHE_SECONDS


def _audio_cache_update(updates):
    global _AUDIO_CACHE_VALUE, _AUDIO_CACHE_EXPIRES_AT
    if not isinstance(updates, dict):
        return
    with _AUDIO_CACHE_LOCK:
        if _AUDIO_CACHE_VALUE is None or time.time() >= _AUDIO_CACHE_EXPIRES_AT:
            return
        _AUDIO_CACHE_VALUE.update(copy.deepcopy(updates))


def _audio_cache_clear():
    global _AUDIO_CACHE_VALUE, _AUDIO_CACHE_EXPIRES_AT
    with _AUDIO_CACHE_LOCK:
        _AUDIO_CACHE_VALUE = None
        _AUDIO_CACHE_EXPIRES_AT = 0.0


def _get_audio_devices_sync():
    cached = _audio_cache_get()
    if cached is not None:
        cached["cached"] = True
        return cached
    result = _run_audio_powershell("get", "")
    _audio_cache_set(result)
    return result


def _set_audio_device_sync(kind, device_id):
    if not device_id:
        return _empty_audio_result("No audio device selected.")
    result = _run_audio_powershell("set", device_id)
    if result.get("ok"):
        result["message"] = "Audio output updated." if kind == "output" else "Microphone input updated."
        _audio_cache_set(result)
    else:
        _audio_cache_clear()
    return result


def _set_microphone_volume_sync(level):
    level = max(0, min(100, int(level)))
    result = _run_audio_powershell("set_input_volume", "", level)
    if result.get("ok"):
        try:
            input_volume = max(0, min(100, int(round(float(result.get("input_volume", level))))))
        except Exception:
            input_volume = level
        _audio_cache_update({"input_volume": input_volume})
        result["input_volume"] = input_volume
    return result




# ===================================================================== #
#  Capabilities, performance, display and TDP helpers                   #
#                                                                       #
#  Everything below is cross-platform-safe at import time: Windows-only  #
#  APIs (ctypes.windll, winreg, powercfg) are only touched inside the    #
#  functions, guarded by an os.name == "nt" check, so the module still   #
#  imports on non-Windows hosts.                                         #
# ===================================================================== #

_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

# Processor power-management power-plan setting GUIDs (stable across Windows).
SUB_PROCESSOR = "54533251-82be-4824-96c1-47b60b740d00"
PERF_BOOST_MODE = "be337238-0d82-4146-a960-4f3749d470c7"
PROC_THROTTLE_MIN = "893dee8e-2bef-41e0-89c6-b55d0929964c"
PROC_THROTTLE_MAX = "bc5038f7-23e0-4960-96da-33abaf5935ec"
PERF_EPP = "36687f9e-e3a5-4dbf-b1dc-15eb381c6863"

BOOST_MODES = {
    "disabled": 0,
    "enabled": 1,
    "aggressive": 2,
    "efficient_enabled": 3,
    "efficient_aggressive": 4,
}

# Windows power-mode ("overlay") scheme GUIDs. Balanced == GUID_NULL (default).
POWER_OVERLAYS = {
    "efficiency": "961cc777-2547-4f9d-8174-7d86181b8a7a",
    "balanced": "00000000-0000-0000-0000-000000000000",
    "better": "3af9b8d9-7c97-431d-ad78-34a8bfea439f",
    "best": "ded574b5-45a0-4f42-8737-46345c09c238",
}


def _arg(request, key, default=None):
    if isinstance(request, dict):
        return request.get(key, default)
    return request if default is None else default


def _coerce_percent(value):
    try:
        return max(0, min(100, int(round(float(value)))))
    except Exception:
        return 0


# --------------------------- CPU identity ---------------------------- #

def _cpu_brand_string():
    if os.name != "nt":
        return ""
    try:
        import winreg
        with winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"HARDWARE\DESCRIPTION\System\CentralProcessor\0",
        ) as key:
            return str(winreg.QueryValueEx(key, "ProcessorNameString")[0]).strip()
    except Exception:
        return os.environ.get("PROCESSOR_IDENTIFIER", "")


def _is_amd_cpu():
    name = _cpu_brand_string().lower()
    return "amd" in name or "ryzen" in name


def _is_admin():
    if os.name != "nt":
        return False
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def _get_capabilities_sync():
    is_windows = os.name == "nt"
    tdp = _tdp_probe()
    return {
        "ok": is_windows,
        "platform": "windows" if is_windows else os.name,
        "cpu": _cpu_brand_string(),
        "is_amd": _is_amd_cpu(),
        "performance": is_windows,
        "power_mode": is_windows,
        "display": is_windows,
        "tdp": bool(tdp.get("available")),
        "tdp_message": tdp.get("message", ""),
        "lossless": bool(_find_lossless()) if is_windows else False,
        "amd_radeon": is_windows and os.path.exists(_adlx_exe()),
        "amd_build_needed": is_windows and (not os.path.exists(_adlx_exe())) and _adlx_source_present(),
        "amd_path": _adlx_dir() if is_windows else "",
    }


# ----------------------- powercfg (CPU) helpers ---------------------- #

def _powercfg_path():
    if os.name == "nt":
        candidate = os.path.join(
            os.environ.get("WINDIR", "C:\\Windows"), "System32", "powercfg.exe"
        )
        if os.path.exists(candidate):
            return candidate
    return "powercfg"


def _run_powercfg(args, timeout=10):
    try:
        completed = subprocess.run(
            [_powercfg_path()] + args,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            creationflags=_NO_WINDOW,
        )
        return completed.returncode, completed.stdout or "", completed.stderr or ""
    except Exception as error:
        return -1, "", str(error)


def _parse_hex_index(line):
    try:
        return int(line.split(":")[-1].strip(), 16)
    except Exception:
        return None


def _powercfg_query(sub, setting):
    rc, out, _err = _run_powercfg(["/query", "SCHEME_CURRENT", sub, setting])
    if rc != 0:
        return None
    ac = dc = None
    for line in out.splitlines():
        low = line.strip().lower()
        if low.startswith("current ac power setting index"):
            ac = _parse_hex_index(line)
        elif low.startswith("current dc power setting index"):
            dc = _parse_hex_index(line)
    return {"ac": ac, "dc": dc}


def _powercfg_set(sub, setting, value):
    value = int(value)
    rc1, _o1, e1 = _run_powercfg(["/setacvalueindex", "SCHEME_CURRENT", sub, setting, str(value)])
    _rc2, _o2, _e2 = _run_powercfg(["/setdcvalueindex", "SCHEME_CURRENT", sub, setting, str(value)])
    rc3, _o3, e3 = _run_powercfg(["/setactive", "SCHEME_CURRENT"])
    ok = rc1 == 0 and rc3 == 0
    message = "" if ok else (e1 or e3 or "powercfg failed (administrator rights may be required).").strip()
    return ok, message


def _acval(query, default):
    if query and query.get("ac") is not None:
        return query["ac"]
    if query and query.get("dc") is not None:
        return query["dc"]
    return default


# ----------------- elevated apply for CPU power-plan settings --------- #
# powercfg writes need administrator rights. When Decky is not elevated we
# route them through a pre-registered scheduled task that runs the bundled
# helper/apply_perf.ps1 with highest privileges (set up once, via one UAC
# prompt). Power mode and read-back do not need this.

PERF_TASK_NAME = "QuickSettings_ApplyPerf"
PERF_SETTING_GUID = {
    "boost": PERF_BOOST_MODE,
    "epp": PERF_EPP,
    "min": PROC_THROTTLE_MIN,
    "max": PROC_THROTTLE_MAX,
}


def _run_cmd(args, timeout=20):
    try:
        completed = subprocess.run(
            args, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            timeout=timeout, creationflags=_NO_WINDOW,
        )
        return completed.returncode, completed.stdout or "", completed.stderr or ""
    except Exception as error:
        return -1, "", str(error)


def _perf_helper_dir():
    return os.path.join(os.path.dirname(__file__), "helper")


def _perf_cfg_path():
    return os.path.join(tempfile.gettempdir(), "quick_settings_perf.json")


def _perf_task_exists():
    rc, _o, _e = _run_cmd(["schtasks", "/query", "/tn", PERF_TASK_NAME])
    return rc == 0


def _apply_via_task(settings):
    try:
        with open(_perf_cfg_path(), "w", encoding="utf-8") as handle:
            json.dump(settings, handle)
    except Exception as error:
        return False, str(error)
    rc, out, err = _run_cmd(["schtasks", "/run", "/tn", PERF_TASK_NAME])
    if rc == 0:
        return True, ""
    return False, (err or out or "Could not trigger the elevated helper task.").strip()


def _apply_perf(settings):
    if os.name != "nt":
        return False, "Performance controls are only available on Windows."
    if _is_admin():
        ok = True
        message = ""
        for key, value in settings.items():
            applied, msg = _powercfg_set(SUB_PROCESSOR, PERF_SETTING_GUID[key], value)
            ok = ok and applied
            if msg and not message:
                message = msg
        return ok, message
    if _perf_task_exists():
        return _apply_via_task(settings)
    return False, "needs_setup"


def _setup_perf_elevation_sync():
    if os.name != "nt":
        return {"ok": False, "message": "Performance controls are only available on Windows."}
    setup = os.path.join(_perf_helper_dir(), "setup_perf.ps1")
    if not os.path.exists(setup):
        return {"ok": False, "message": "Helper script not found in the plugin."}
    command = (
        "Start-Process -FilePath 'powershell.exe' -Verb RunAs -WindowStyle Hidden -Wait "
        "-ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-WindowStyle','Hidden','-File','"
        + setup + "'"
    )
    _run_cmd([_powershell_path(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command], timeout=120)
    if _perf_task_exists():
        return {"ok": True, "message": ""}
    return {"ok": False, "message": "Elevation was cancelled or the helper task could not be created."}


def _get_perf_elevation_status_sync():
    return {
        "ok": True,
        "elevated_ready": _is_admin() or _perf_task_exists(),
        "is_admin": _is_admin(),
        "task": _perf_task_exists(),
    }


def _get_performance_status_sync():
    if os.name != "nt":
        return {"ok": False, "message": "Performance controls are only available on Windows."}
    return {"ok": True, "message": "", "power_mode": _get_power_overlay()}


def _set_cpu_boost_sync(mode):
    key = str(mode).lower()
    if key in ("true", "on", "1", "yes"):
        key = "enabled"
    elif key in ("false", "off", "0", "no"):
        key = "disabled"
    value = BOOST_MODES.get(key, 1)
    ok, message = _apply_perf({"boost": value})
    return {"ok": ok, "message": message, "boost_mode": value, "boost_enabled": bool(value)}


def _set_cpu_epp_sync(value):
    value = max(0, min(100, int(value)))
    ok, message = _apply_perf({"epp": value})
    return {"ok": ok, "message": message, "epp": value}


def _set_processor_state_sync(which, value):
    value = max(0, min(100, int(value)))
    ok, message = _apply_perf({("min" if which == "min" else "max"): value})
    field = "min_processor_state" if which == "min" else "max_processor_state"
    return {"ok": ok, "message": message, field: value}


# ------------------- Windows power-mode overlay ---------------------- #

class _GUID(ctypes.Structure):
    _fields_ = [
        ("Data1", ctypes.c_uint32),
        ("Data2", ctypes.c_uint16),
        ("Data3", ctypes.c_uint16),
        ("Data4", ctypes.c_ubyte * 8),
    ]


def _guid_from_string(text):
    text = text.strip("{}")
    parts = text.split("-")
    guid = _GUID()
    guid.Data1 = int(parts[0], 16)
    guid.Data2 = int(parts[1], 16)
    guid.Data3 = int(parts[2], 16)
    tail = bytes.fromhex(parts[3] + parts[4])
    for i in range(8):
        guid.Data4[i] = tail[i]
    return guid


def _guid_to_string(guid):
    tail = bytes(guid.Data4)
    return "%08x-%04x-%04x-%02x%02x-%02x%02x%02x%02x%02x%02x" % (
        guid.Data1, guid.Data2, guid.Data3,
        tail[0], tail[1], tail[2], tail[3], tail[4], tail[5], tail[6], tail[7],
    )


def _get_power_overlay():
    if os.name != "nt":
        return "balanced"
    try:
        powrprof = ctypes.windll.powrprof
        current = _GUID()
        powrprof.PowerGetActualOverlayScheme.argtypes = [ctypes.POINTER(_GUID)]
        powrprof.PowerGetActualOverlayScheme.restype = wintypes.DWORD
        if powrprof.PowerGetActualOverlayScheme(ctypes.byref(current)) == 0:
            value = _guid_to_string(current).lower()
            for name, guid in POWER_OVERLAYS.items():
                if guid.lower() == value:
                    return name
            return "balanced"
    except Exception:
        pass
    return "balanced"


def _set_power_overlay_sync(mode):
    if os.name != "nt":
        return {"ok": False, "message": "Power mode is only available on Windows."}
    guid_str = POWER_OVERLAYS.get(str(mode).lower())
    if guid_str is None:
        return {"ok": False, "message": f"Unknown power mode '{mode}'."}
    try:
        powrprof = ctypes.windll.powrprof
        powrprof.PowerSetActiveOverlayScheme.argtypes = [_GUID]
        powrprof.PowerSetActiveOverlayScheme.restype = wintypes.DWORD
        result = powrprof.PowerSetActiveOverlayScheme(_guid_from_string(guid_str))
        ok = result == 0
        return {
            "ok": ok,
            "message": "" if ok else f"PowerSetActiveOverlayScheme failed (code {result}).",
            "power_mode": str(mode).lower(),
        }
    except Exception as error:
        return {"ok": False, "message": str(error)}


# --------------------- Display resolution / refresh ------------------ #

_CCHDEVICENAME = 32
_CCHFORMNAME = 32
_ENUM_CURRENT_SETTINGS = 0xFFFFFFFF
_DM_BITSPERPEL = 0x00040000
_DM_PELSWIDTH = 0x00080000
_DM_PELSHEIGHT = 0x00100000
_DM_DISPLAYFREQUENCY = 0x00400000
_CDS_UPDATEREGISTRY = 0x00000001
_CDS_TEST = 0x00000002
_DISP_CHANGE_SUCCESSFUL = 0


class _DEVMODE(ctypes.Structure):
    _fields_ = [
        ("dmDeviceName", ctypes.c_wchar * _CCHDEVICENAME),
        ("dmSpecVersion", ctypes.c_uint16),
        ("dmDriverVersion", ctypes.c_uint16),
        ("dmSize", ctypes.c_uint16),
        ("dmDriverExtra", ctypes.c_uint16),
        ("dmFields", ctypes.c_uint32),
        ("dmPositionX", ctypes.c_int32),
        ("dmPositionY", ctypes.c_int32),
        ("dmDisplayOrientation", ctypes.c_uint32),
        ("dmDisplayFixedOutput", ctypes.c_uint32),
        ("dmColor", ctypes.c_int16),
        ("dmDuplex", ctypes.c_int16),
        ("dmYResolution", ctypes.c_int16),
        ("dmTTOption", ctypes.c_int16),
        ("dmCollate", ctypes.c_int16),
        ("dmFormName", ctypes.c_wchar * _CCHFORMNAME),
        ("dmLogPixels", ctypes.c_uint16),
        ("dmBitsPerPel", ctypes.c_uint32),
        ("dmPelsWidth", ctypes.c_uint32),
        ("dmPelsHeight", ctypes.c_uint32),
        ("dmDisplayFlags", ctypes.c_uint32),
        ("dmDisplayFrequency", ctypes.c_uint32),
        ("dmICMMethod", ctypes.c_uint32),
        ("dmICMIntent", ctypes.c_uint32),
        ("dmMediaType", ctypes.c_uint32),
        ("dmDitherType", ctypes.c_uint32),
        ("dmReserved1", ctypes.c_uint32),
        ("dmReserved2", ctypes.c_uint32),
        ("dmPanningWidth", ctypes.c_uint32),
        ("dmPanningHeight", ctypes.c_uint32),
    ]


def _read_current_devmode():
    user32 = ctypes.windll.user32
    dm = _DEVMODE()
    dm.dmSize = ctypes.sizeof(_DEVMODE)
    if not user32.EnumDisplaySettingsW(None, _ENUM_CURRENT_SETTINGS, ctypes.byref(dm)):
        return None
    return dm


def _enum_display_modes():
    user32 = ctypes.windll.user32
    modes = []
    seen = set()
    index = 0
    while True:
        dm = _DEVMODE()
        dm.dmSize = ctypes.sizeof(_DEVMODE)
        if not user32.EnumDisplaySettingsW(None, index, ctypes.byref(dm)):
            break
        index += 1
        if dm.dmBitsPerPel and dm.dmBitsPerPel < 32:
            continue
        key = (int(dm.dmPelsWidth), int(dm.dmPelsHeight), int(dm.dmDisplayFrequency))
        if key in seen:
            continue
        seen.add(key)
        modes.append({"width": key[0], "height": key[1], "hz": key[2]})
    return modes


def _get_display_status_sync():
    empty = {"ok": False, "message": "", "current": {}, "modes": [], "resolutions": [], "refresh_rates": []}
    if os.name != "nt":
        empty["message"] = "Display controls are only available on Windows."
        return empty
    try:
        cur = _read_current_devmode()
        current = (
            {"width": int(cur.dmPelsWidth), "height": int(cur.dmPelsHeight), "hz": int(cur.dmDisplayFrequency)}
            if cur else {}
        )
        modes = _enum_display_modes()
        resolutions = sorted(
            {(m["width"], m["height"]) for m in modes}, key=lambda r: r[0] * r[1], reverse=True
        )
        resolutions = [{"width": w, "height": h} for (w, h) in resolutions]
        refresh = sorted(
            {
                m["hz"] for m in modes
                if not current or (m["width"] == current.get("width") and m["height"] == current.get("height"))
            },
            reverse=True,
        )
        return {
            "ok": True,
            "message": "",
            "current": current,
            "modes": modes,
            "resolutions": resolutions,
            "refresh_rates": refresh,
        }
    except Exception as error:
        empty["message"] = str(error)
        return empty


def _set_display_mode_sync(width, height, hz):
    if os.name != "nt":
        return {"ok": False, "message": "Display controls are only available on Windows."}
    try:
        user32 = ctypes.windll.user32
        cur = _read_current_devmode()
        if cur is None:
            return {"ok": False, "message": "Could not read the current display mode."}
        dm = _DEVMODE()
        ctypes.memmove(ctypes.byref(dm), ctypes.byref(cur), ctypes.sizeof(_DEVMODE))
        dm.dmSize = ctypes.sizeof(_DEVMODE)
        fields = 0
        if width > 0 and height > 0:
            dm.dmPelsWidth = width
            dm.dmPelsHeight = height
            fields |= _DM_PELSWIDTH | _DM_PELSHEIGHT
        if hz > 0:
            dm.dmDisplayFrequency = hz
            fields |= _DM_DISPLAYFREQUENCY
        if fields == 0:
            return {"ok": False, "message": "No display change requested."}
        dm.dmFields = fields
        test = user32.ChangeDisplaySettingsExW(None, ctypes.byref(dm), None, _CDS_TEST, None)
        if test != _DISP_CHANGE_SUCCESSFUL:
            return {"ok": False, "message": f"Display mode not supported (code {test})."}
        applied = user32.ChangeDisplaySettingsExW(None, ctypes.byref(dm), None, _CDS_UPDATEREGISTRY, None)
        ok = applied == _DISP_CHANGE_SUCCESSFUL
        result = {"ok": ok, "message": "" if ok else f"Could not apply display mode (code {applied})."}
        if ok:
            time.sleep(0.4)  # let Windows settle before reading the applied mode
            result["current"] = _get_display_status_sync().get("current", {})
        return result
    except Exception as error:
        return {"ok": False, "message": str(error)}


# ------------------------- TDP (RyzenAdj) ---------------------------- #

_RYZENADJ_LOCK = threading.Lock()
_RYZENADJ = {"lib": None, "handle": None, "loaded": False, "error": ""}


def _ryzenadj_dll_path():
    return os.path.join(os.path.dirname(__file__), "bin", "libryzenadj.dll")


def _load_ryzenadj():
    if _RYZENADJ["loaded"]:
        return _RYZENADJ
    _RYZENADJ["loaded"] = True
    if os.name != "nt":
        _RYZENADJ["error"] = "TDP control is only available on Windows."
        return _RYZENADJ
    if not _is_amd_cpu():
        _RYZENADJ["error"] = "TDP control requires an AMD Ryzen processor."
        return _RYZENADJ
    path = _ryzenadj_dll_path()
    if not os.path.exists(path):
        _RYZENADJ["error"] = "libryzenadj.dll not found in the plugin bin folder."
        return _RYZENADJ
    try:
        lib = ctypes.CDLL(path)
        lib.init_ryzenadj.restype = ctypes.c_void_p
        lib.cleanup_ryzenadj.argtypes = [ctypes.c_void_p]
        for name in ("set_stapm_limit", "set_fast_limit", "set_slow_limit"):
            fn = getattr(lib, name)
            fn.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
            fn.restype = ctypes.c_int
        for name in ("get_stapm_limit", "get_fast_limit", "get_slow_limit"):
            fn = getattr(lib, name)
            fn.argtypes = [ctypes.c_void_p]
            fn.restype = ctypes.c_float
        lib.refresh_table.argtypes = [ctypes.c_void_p]
        lib.refresh_table.restype = ctypes.c_int
        handle = lib.init_ryzenadj()
        if not handle:
            _RYZENADJ["error"] = "init_ryzenadj failed - run elevated; a ring0 driver is required."
            return _RYZENADJ
        _RYZENADJ["lib"] = lib
        _RYZENADJ["handle"] = handle
        _RYZENADJ["error"] = ""
    except Exception as error:
        _RYZENADJ["error"] = str(error)
    return _RYZENADJ


def _tdp_probe():
    with _RYZENADJ_LOCK:
        ry = _load_ryzenadj()
        return {"available": bool(ry.get("handle")), "message": ry.get("error", "")}


def _clean_watts(value):
    try:
        value = float(value)
    except Exception:
        return 0
    if value != value or value <= 0 or value > 200:  # NaN / nonsense guard
        return 0
    return round(value, 1)


def _get_tdp_status_sync():
    with _RYZENADJ_LOCK:
        ry = _load_ryzenadj()
        if not ry.get("handle"):
            return {"ok": False, "available": False, "message": ry.get("error", ""),
                    "stapm": 0, "fast": 0, "slow": 0}
        lib, handle = ry["lib"], ry["handle"]
        try:
            lib.refresh_table(handle)
            time.sleep(0.05)
            return {
                "ok": True,
                "available": True,
                "message": "",
                "stapm": _clean_watts(lib.get_stapm_limit(handle)),
                "fast": _clean_watts(lib.get_fast_limit(handle)),
                "slow": _clean_watts(lib.get_slow_limit(handle)),
            }
        except Exception as error:
            return {"ok": False, "available": True, "message": str(error),
                    "stapm": 0, "fast": 0, "slow": 0}


def _set_tdp_sync(stapm, fast, slow):
    with _RYZENADJ_LOCK:
        ry = _load_ryzenadj()
        if not ry.get("handle"):
            return {"ok": False, "available": False, "message": ry.get("error", "")}
        lib, handle = ry["lib"], ry["handle"]

        def to_mw(value):
            if value is None:
                return None
            try:
                watts = float(value)
            except Exception:
                return None
            return max(4000, min(60000, int(round(watts * 1000))))

        try:
            codes = []
            for name, value in (("set_stapm_limit", stapm), ("set_fast_limit", fast), ("set_slow_limit", slow)):
                mw = to_mw(value)
                if mw is None:
                    continue
                codes.append(getattr(lib, name)(handle, mw))
            ok = bool(codes) and all(code == 0 for code in codes)
            message = "" if ok else "RyzenAdj returned an error (administrator rights required)."
            return {"ok": ok, "available": True, "message": message}
        except Exception as error:
            return {"ok": False, "available": True, "message": str(error)}


# ===================== Lossless Scaling integration ================== #

LOSSLESS_APPID = "993090"
# Live scaling on/off is not exposed by LS, so we track it ourselves (like
# GoTweaks). Survives within a backend session; flipped by the toggle.
_LS_SCALING_ACTIVE = {"on": False}

_MODIFIER_VK = {"control": 0x11, "ctrl": 0x11, "alt": 0x12, "menu": 0x12, "shift": 0x10, "win": 0x5B}


def _key_to_vk(name):
    name = (name or "").strip()
    if len(name) == 1:
        ch = name.upper()
        if "A" <= ch <= "Z" or "0" <= ch <= "9":
            return ord(ch)
    if len(name) >= 2 and name[0].upper() == "F" and name[1:].isdigit():
        n = int(name[1:])
        if 1 <= n <= 24:
            return 0x70 + (n - 1)
    return None


def _send_key_combo(vks):
    if os.name != "nt" or not vks:
        return False
    try:
        user32 = ctypes.windll.user32
        for vk in vks:
            user32.keybd_event(vk, 0, 0, 0)
            time.sleep(0.02)
        for vk in reversed(vks):
            user32.keybd_event(vk, 0, 2, 0)  # KEYEVENTF_KEYUP
            time.sleep(0.02)
        return True
    except Exception:
        return False


def _steam_path():
    if os.name != "nt":
        return ""
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as key:
            return str(winreg.QueryValueEx(key, "SteamPath")[0])
    except Exception:
        return ""


def _steam_library_dirs():
    import re
    dirs = []
    base = _steam_path()
    if base:
        dirs.append(base.replace("/", "\\"))
    vdf = os.path.join(base, "steamapps", "libraryfolders.vdf") if base else ""
    if vdf and os.path.exists(vdf):
        try:
            text = open(vdf, encoding="utf-8", errors="ignore").read()
            for match in re.findall(r'"path"\s*"([^"]+)"', text):
                dirs.append(match.replace("\\\\", "\\"))
        except Exception:
            pass
    return dirs


def _find_lossless():
    for directory in _steam_library_dirs():
        candidate = os.path.join(directory, "steamapps", "common", "Lossless Scaling", "LosslessScaling.exe")
        if os.path.exists(candidate):
            return candidate
    return ""


def _lossless_running():
    rc, out, _e = _run_cmd(["tasklist", "/FI", "IMAGENAME eq LosslessScaling.exe", "/NH"])
    return "LosslessScaling.exe" in (out or "")


def _lossless_settings_path():
    base = os.environ.get("LOCALAPPDATA", "")
    if not base:
        return ""
    return os.path.join(base, "Lossless Scaling", "Settings.xml")


def _ls_read_text():
    path = _lossless_settings_path()
    if not path or not os.path.exists(path):
        return path, ""
    try:
        return path, open(path, encoding="utf-8-sig", errors="ignore").read()
    except Exception:
        return path, ""


def _ls_default_block_span(text):
    # The settings file has one <Profile> per app plus a "Default" profile we
    # edit. Parsed by hand (the Decky Python has no xml module).
    import re
    for m in re.finditer(r"<Profile\b[^>]*>.*?</Profile>", text, re.DOTALL):
        if re.search(r"<Title>\s*Default\s*</Title>", m.group(0)):
            return m.start(), m.end()
    m = re.search(r"<Profile\b[^>]*>.*?</Profile>", text, re.DOTALL)
    return (m.start(), m.end()) if m else None


def _ls_get(block, name, default=""):
    import re
    m = re.search(r"<%s>(.*?)</%s>" % (name, name), block, re.DOTALL)
    return m.group(1).strip() if m else default


def _read_lossless_settings():
    import re
    result = {"frame_gen": "Off", "multiplier": 2, "hotkey": "Ctrl+Alt+S",
              "scaling_active": _LS_SCALING_ACTIVE["on"], "settings_found": False}
    path, text = _ls_read_text()
    if not text:
        return result
    key_m = re.search(r"<Hotkey>(.*?)</Hotkey>", text, re.DOTALL)
    key = (key_m.group(1).strip() if key_m else "S")
    mod_m = re.search(r"<HotkeyModifierKeys>(.*?)</HotkeyModifierKeys>", text, re.DOTALL)
    mods = (mod_m.group(1).strip() if mod_m else "Alt Control")
    pretty = []
    for token in mods.split():
        low = token.lower()
        if low in ("control", "ctrl"):
            pretty.append("Ctrl")
        elif low in ("alt", "menu"):
            pretty.append("Alt")
        elif low == "shift":
            pretty.append("Shift")
    result["hotkey"] = "+".join(pretty + [key]) if key else "+".join(pretty)
    span = _ls_default_block_span(text)
    if span:
        block = text[span[0]:span[1]]
        result["frame_gen"] = _ls_get(block, "FrameGeneration", "Off") or "Off"
        try:
            result["multiplier"] = int(_ls_get(block, "LSFG3Multiplier", "2"))
        except Exception:
            result["multiplier"] = 2
        result["settings_found"] = True
    return result


def _lossless_hotkey_vks():
    import re
    path, text = _ls_read_text()
    key, mods = "S", "Alt Control"
    if text:
        km = re.search(r"<Hotkey>(.*?)</Hotkey>", text, re.DOTALL)
        if km:
            key = km.group(1).strip()
        mm = re.search(r"<HotkeyModifierKeys>(.*?)</HotkeyModifierKeys>", text, re.DOTALL)
        if mm:
            mods = mm.group(1).strip()
    vks = []
    for token in mods.split():
        vk = _MODIFIER_VK.get(token.lower())
        if vk and vk not in vks:
            vks.append(vk)
    key_vk = _key_to_vk(key)
    if key_vk:
        vks.append(key_vk)
    return vks or [0x11, 0x12, 0x53]


def _get_lossless_status_sync():
    if os.name != "nt":
        return {"ok": False, "available": False, "installed": False, "running": False, "message": "Windows only."}
    path = _find_lossless()
    installed = bool(path)
    data = {"ok": True, "available": installed, "installed": installed,
            "running": _lossless_running(), "path": path, "message": ""}
    data.update(_read_lossless_settings())
    return data


def _launch_lossless_sync():
    if os.name != "nt":
        return {"ok": False, "running": False, "message": "Windows only."}
    if _lossless_running():
        return {"ok": True, "running": True, "message": ""}
    path = _find_lossless()
    try:
        if path:
            subprocess.Popen([path], cwd=os.path.dirname(path), creationflags=_NO_WINDOW, close_fds=True)
        else:
            os.startfile("steam://rungameid/" + LOSSLESS_APPID)
        return {"ok": True, "running": True, "message": ""}
    except Exception as error:
        return {"ok": False, "running": False, "message": str(error)}


def _restart_lossless():
    _run_cmd(["taskkill", "/F", "/IM", "LosslessScaling.exe"])
    time.sleep(1.0)
    path = _find_lossless()
    try:
        if path:
            subprocess.Popen([path], cwd=os.path.dirname(path), creationflags=_NO_WINDOW, close_fds=True)
        else:
            os.startfile("steam://rungameid/" + LOSSLESS_APPID)
    except Exception:
        pass


def _set_lossless_setting_sync(key, value):
    import re
    if os.name != "nt":
        return {"ok": False, "message": "Windows only."}
    element_map = {"frame_gen": "FrameGeneration", "multiplier": "LSFG3Multiplier"}
    name = element_map.get(key)
    if not name:
        return {"ok": False, "message": "Unknown Lossless Scaling setting."}
    path, text = _ls_read_text()
    if not text:
        return {"ok": False, "message": "Lossless Scaling settings file not found."}
    span = _ls_default_block_span(text)
    if not span:
        return {"ok": False, "message": "No Lossless Scaling profile found."}
    block = text[span[0]:span[1]]
    new_val = str(value)
    pattern = r"<%s>.*?</%s>" % (name, name)
    if re.search(pattern, block, re.DOTALL):
        block = re.sub(pattern, "<%s>%s</%s>" % (name, new_val, name), block, count=1, flags=re.DOTALL)
    else:
        block = block.replace("</Profile>", "<%s>%s</%s></Profile>" % (name, new_val, name), 1)
    text = text[:span[0]] + block + text[span[1]:]
    try:
        open(path, "w", encoding="utf-8-sig").write(text)
    except Exception as error:
        return {"ok": False, "message": str(error)}
    if _lossless_running():
        _restart_lossless()
    return {"ok": True, "message": ""}


def _set_lossless_scaling_sync(enabled):
    if os.name != "nt":
        return {"ok": False, "active": False, "message": "Windows only."}
    if not _lossless_running():
        _LS_SCALING_ACTIVE["on"] = False
        return {"ok": False, "active": False, "message": "Lossless Scaling is not running - launch it first."}
    enabled = bool(enabled)
    if enabled != _LS_SCALING_ACTIVE["on"]:
        if not _send_key_combo(_lossless_hotkey_vks()):
            return {"ok": False, "active": _LS_SCALING_ACTIVE["on"], "message": "Could not send the scaling hotkey."}
        _LS_SCALING_ACTIVE["on"] = enabled
    return {"ok": True, "active": _LS_SCALING_ACTIVE["on"], "message": ""}


# ===================== AMD Radeon (ADLX helper) ====================== #
# Radeon features (RSR, AFMF, Anti-Lag, Chill, Image Sharpening) are driven by
# AMD's ADLX SDK, which is C++/COM. We ship a small C# helper (amd/Program.cs +
# the ADLX C# binding) that the user compiles once with amd/build_amd.bat using
# the in-box .NET Framework compiler - no Visual Studio. We then invoke
# adlx_helper.exe and parse its JSON.

def _adlx_dir():
    return os.path.join(os.path.dirname(__file__), "amd")


def _adlx_exe():
    return os.path.join(_adlx_dir(), "adlx_helper.exe")


def _adlx_source_present():
    return os.path.exists(os.path.join(_adlx_dir(), "Program.cs"))


def _run_adlx(args, timeout=25):
    exe = _adlx_exe()
    if os.name != "nt" or not os.path.exists(exe):
        return None
    try:
        completed = subprocess.run(
            [exe] + [str(a) for a in args],
            cwd=_adlx_dir(),
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            creationflags=_NO_WINDOW,
        )
        out = (completed.stdout or "").strip()
        if not out:
            return None
        # The JSON is the last non-empty stdout line.
        line = [ln for ln in out.splitlines() if ln.strip()][-1]
        return json.loads(line)
    except Exception as error:
        return {"ok": False, "message": str(error)}


def _get_amd_status_sync():
    if os.name != "nt":
        return {"ok": False, "available": False, "built": False, "source": False, "message": "Windows only."}
    if not os.path.exists(_adlx_exe()):
        return {"ok": False, "available": False, "built": False,
                "source": _adlx_source_present(),
                "message": "Run amd/build_amd.bat once to enable Radeon features."}
    data = _run_adlx(["status"])
    if not isinstance(data, dict):
        return {"ok": False, "available": False, "built": True, "source": True,
                "message": "ADLX helper returned no data."}
    data["available"] = bool(data.get("ok"))
    data["built"] = True
    data["source"] = True
    return data


def _set_amd_sync(feature, value):
    if os.name != "nt":
        return {"ok": False, "message": "Windows only."}
    if not os.path.exists(_adlx_exe()):
        return {"ok": False, "message": "Radeon helper not built (run amd/build_amd.bat)."}
    data = _run_adlx(["set", feature, value])
    if not isinstance(data, dict):
        return {"ok": False, "message": "ADLX helper failed."}
    return data
