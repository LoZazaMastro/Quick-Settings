import asyncio
import copy
import ctypes
import json
import os
import subprocess
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

    async def _main(self):
        await self.ensure_agent()

    async def _unload(self):
        self._stop_agent()

    async def _uninstall(self):
        self._stop_agent()

    async def _migration(self):
        pass

    async def ensure_agent(self):
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

        for _ in range(40):
            if self._is_agent_ready():
                decky.logger.info("Quick Settings agent started")
                return True

            if self._agent_process and self._agent_process.poll() is not None:
                decky.logger.error(
                    f"Quick Settings agent exited with code {self._agent_process.returncode}"
                )
                self._agent_process = None
                return False

            time.sleep(0.25)

        decky.logger.error("Quick Settings agent did not answer in time")
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
    topology_id = UINT32(0)
    status = query(
        QDC_ONLY_ACTIVE_PATHS,
        ctypes.byref(path_count),
        paths,
        ctypes.byref(mode_count),
        modes,
        ctypes.byref(topology_id),
    )
    if status != ERROR_SUCCESS:
        return []

    return list(paths)[: path_count.value]


def _get_advanced_color_targets():
    if os.name != "nt":
        return []

    user32 = ctypes.windll.user32
    get_device_info = user32.DisplayConfigGetDeviceInfo
    get_device_info.restype = wintypes.LONG

    targets = []
    for path in _active_display_paths():
        target = path.targetInfo
        info = DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO()
        info.header.type = DISPLAYCONFIG_DEVICE_INFO_GET_ADVANCED_COLOR_INFO
        info.header.size = ctypes.sizeof(DISPLAYCONFIG_GET_ADVANCED_COLOR_INFO)
        info.header.adapterId = _copy_luid(target.adapterId)
        info.header.id = target.id

        status = get_device_info(ctypes.byref(info))
        if status != ERROR_SUCCESS:
            continue

        value = int(info.value)
        supported = bool(value & 0x1)
        enabled = bool(value & 0x2)
        targets.append({
            "id": int(target.id),
            "supported": supported,
            "enabled": enabled,
            "wide_color_enforced": bool(value & 0x4),
            "force_disabled": bool(value & 0x8),
            "bits_per_color_channel": int(info.bitsPerColorChannel),
            "color_encoding": int(info.colorEncoding),
        })

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


def _send_windows_hdr_toggle_shortcut():
    if os.name != "nt":
        return False

    user32 = ctypes.windll.user32
    keybd_event = user32.keybd_event
    keybd_event.argtypes = [wintypes.BYTE, wintypes.BYTE, wintypes.DWORD, ctypes.c_void_p]
    keybd_event.restype = None

    VK_LWIN = 0x5B
    VK_MENU = 0x12
    VK_B = 0x42
    KEYEVENTF_KEYUP = 0x0002

    for key in (VK_LWIN, VK_MENU, VK_B):
        keybd_event(key, 0, 0, None)
        time.sleep(0.035)
    for key in (VK_B, VK_MENU, VK_LWIN):
        keybd_event(key, 0, KEYEVENTF_KEYUP, None)
        time.sleep(0.035)
    return True


def _set_advanced_color_enabled(enabled):
    if os.name != "nt":
        return False

    user32 = ctypes.windll.user32
    set_device_info = user32.DisplayConfigSetDeviceInfo
    set_device_info.restype = wintypes.LONG

    changed = False
    for path in _active_display_paths():
        target = path.targetInfo
        state = DISPLAYCONFIG_SET_ADVANCED_COLOR_STATE()
        state.header.type = DISPLAYCONFIG_DEVICE_INFO_SET_ADVANCED_COLOR_STATE
        state.header.size = ctypes.sizeof(DISPLAYCONFIG_SET_ADVANCED_COLOR_STATE)
        state.header.adapterId = _copy_luid(target.adapterId)
        state.header.id = target.id
        state.value = 1 if enabled else 0
        status = set_device_info(ctypes.byref(state))
        if status == ERROR_SUCCESS:
            changed = True

    return changed


def _set_hdr_enabled_sync(enabled):
    enabled = bool(enabled)
    if os.name != "nt":
        hdr = _read_real_hdr_status()
        return {"ok": False, "message": hdr.get("message", "HDR is only available on Windows."), "hdr": hdr, "status": {"hdr": hdr}}

    previous = _read_real_hdr_status()
    previous_enabled = bool(previous.get("enabled"))
    if previous.get("real_state") and previous_enabled == enabled:
        return {"ok": True, "message": "", "hdr": previous, "status": {"hdr": previous}}

    errors = []
    try:
        if _set_advanced_color_enabled(enabled):
            time.sleep(0.8)
            hdr = _read_real_hdr_status()
            if hdr.get("real_state") and bool(hdr.get("enabled")) == enabled:
                return {"ok": True, "message": "", "hdr": hdr, "status": {"hdr": hdr}}
    except Exception as error:
        errors.append(str(error))

    try:
        # Fallback for systems where DisplayConfig can read HDR but refuses direct writes.
        # Because Win+Alt+B is only a toggle, send it only when the real state is known
        # to be different from the requested state, or when direct state is unavailable.
        if (not previous.get("real_state")) or previous_enabled != enabled:
            _send_windows_hdr_toggle_shortcut()
            time.sleep(1.2)
        hdr = _read_real_hdr_status()
        ok = bool(hdr.get("real_state")) and bool(hdr.get("enabled")) == enabled
        message = "" if ok else (hdr.get("message") or "; ".join(errors) or "Could not verify HDR state.")
        return {"ok": ok, "message": message, "hdr": hdr, "status": {"hdr": hdr}}
    except Exception as error:
        message = str(error)
        decky.logger.error(f"Quick Settings HDR change failed: {message}")
        hdr = _read_real_hdr_status()
        if not hdr.get("message"):
            hdr["message"] = message
        return {"ok": False, "message": message, "hdr": hdr, "status": {"hdr": hdr}}


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


