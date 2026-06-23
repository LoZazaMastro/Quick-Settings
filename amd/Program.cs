using System;
using System.Globalization;
using System.Text;
using XboxGamingBarHelper.AMD.Settings;

// Standalone ADLX helper for Quick Settings.
//   adlx_helper.exe status                  -> prints JSON of all features
//   adlx_helper.exe set rsr on|off
//   adlx_helper.exe set rsr_sharpness <0-100>
//   adlx_helper.exe set afmf on|off
//   adlx_helper.exe set antilag on|off
//   adlx_helper.exe set chill on|off
//   adlx_helper.exe set chill_min <fps>
//   adlx_helper.exe set chill_max <fps>
//   adlx_helper.exe set sharpening on|off
//   adlx_helper.exe set sharpening_value <0-100>
//
// stdout is JSON only; diagnostics go to stderr.

namespace QuickSettingsAdlx
{
    internal static class Program
    {
        [System.Runtime.InteropServices.DllImport("kernel32", CharSet = System.Runtime.InteropServices.CharSet.Unicode, SetLastError = true)]
        private static extern bool SetDllDirectory(string lpPathName);

        private static string B(bool v) { return v ? "true" : "false"; }
        private static string I(int v) { return v.ToString(CultureInfo.InvariantCulture); }

        private static int Main(string[] args)
        {
            try
            {
                var exeDir = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
                if (!string.IsNullOrEmpty(exeDir)) SetDllDirectory(exeDir);
            }
            catch { }

            ADLXHelper helper = null;
            try
            {
                helper = new ADLXHelper();
                var init = helper.Initialize();
                if (init != ADLX_RESULT.ADLX_OK)
                {
                    Console.WriteLine("{\"ok\":false,\"message\":\"ADLX initialize failed (" + init + "). Update AMD Adrenalin and ensure a Radeon GPU.\"}");
                    return 1;
                }
                var system = helper.GetSystemServices();
                if (system == null)
                {
                    Console.WriteLine("{\"ok\":false,\"message\":\"ADLX system services unavailable.\"}");
                    return 1;
                }

                // First GPU.
                IADLXGPU gpu = null;
                try
                {
                    var gpuListPtr = ADLX.new_gpuListP_Ptr();
                    system.GetGPUs(gpuListPtr);
                    var gpuList = ADLX.gpuListP_Ptr_value(gpuListPtr);
                    if (gpuList != null && gpuList.Size() > 0)
                    {
                        var gpuPtr = ADLX.new_gpuP_Ptr();
                        gpuList.At(gpuList.Begin(), gpuPtr);
                        gpu = ADLX.gpuP_Ptr_value(gpuPtr);
                    }
                }
                catch (Exception ex) { Console.Error.WriteLine("GPU enum: " + ex.Message); }

                // 3D settings services.
                var sp = ADLX.new_threeDSettingsSerP_Ptr();
                system.Get3DSettingsServices(sp);
                var services = new IADLX3DSettingsServices2(
                    ADLXPINVOKE.threeDSettingsSerP_Ptr_value(SWIGTYPE_p_p_adlx__IADLX3DSettingsServices.getCPtr(sp)), false);

                // Global features.
                AMDRadeonSuperResolutionSetting rsr = null;
                AMDFluidMotionFrameSetting afmf = null;
                try
                {
                    var rsrPtr = ADLX.new_threeDRadeonSuperResolutionP_Ptr();
                    services.GetRadeonSuperResolution(rsrPtr);
                    rsr = new AMDRadeonSuperResolutionSetting(ADLX.threeDRadeonSuperResolutionP_Ptr_value(rsrPtr));
                }
                catch (Exception ex) { Console.Error.WriteLine("RSR: " + ex.Message); }
                try
                {
                    var afmfPtr = ADLX.new_threeDAMDFluidMotionFramesP_Ptr();
                    services.GetAMDFluidMotionFrames(afmfPtr);
                    afmf = new AMDFluidMotionFrameSetting(ADLX.threeDAMDFluidMotionFramesP_Ptr_value(afmfPtr));
                }
                catch (Exception ex) { Console.Error.WriteLine("AFMF: " + ex.Message); }

                // Per-GPU features.
                AMDRadeonAntiLagSetting antilag = null;
                AMDRadeonChillSetting chill = null;
                AMDImageSharpeningSetting sharp = null;
                if (gpu != null)
                {
                    try
                    {
                        var alPtr = ADLX.new_threeDAntiLagP_Ptr();
                        services.GetAntiLag(gpu, alPtr);
                        antilag = new AMDRadeonAntiLagSetting(ADLX.threeDAntiLagP_Ptr_value(alPtr));
                    }
                    catch (Exception ex) { Console.Error.WriteLine("AntiLag: " + ex.Message); }
                    try
                    {
                        var chPtr = ADLX.new_threeDChillP_Ptr();
                        services.GetChill(gpu, chPtr);
                        chill = new AMDRadeonChillSetting(ADLX.threeDChillP_Ptr_value(chPtr));
                    }
                    catch (Exception ex) { Console.Error.WriteLine("Chill: " + ex.Message); }
                    try
                    {
                        var isPtr = ADLX.new_threeDImageSharpeningP_Ptr();
                        services.GetImageSharpening(gpu, isPtr);
                        sharp = new AMDImageSharpeningSetting(ADLX.threeDImageSharpeningP_Ptr_value(isPtr));
                    }
                    catch (Exception ex) { Console.Error.WriteLine("Sharpening: " + ex.Message); }
                }

                string action = args.Length > 0 ? args[0].ToLowerInvariant() : "status";

                if (action == "set" && args.Length >= 3)
                {
                    string feature = args[1].ToLowerInvariant();
                    string value = args[2];
                    bool on = value == "on" || value == "1" || value == "true";
                    int num;
                    int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out num);

                    switch (feature)
                    {
                        case "rsr": if (rsr != null) rsr.SetEnabled(on); break;
                        case "rsr_sharpness": if (rsr != null) rsr.SetSharpness(num); break;
                        case "afmf": if (afmf != null) afmf.SetEnabled(on); break;
                        case "antilag": if (antilag != null) antilag.SetEnabled(on); break;
                        case "chill": if (chill != null) chill.SetEnabled(on); break;
                        case "chill_min": if (chill != null) chill.SetMinFPS(num); break;
                        case "chill_max": if (chill != null) chill.SetMaxFPS(num); break;
                        case "sharpening": if (sharp != null) sharp.SetEnabled(on); break;
                        case "sharpening_value": if (sharp != null) sharp.SetSharpness(num); break;
                        default:
                            Console.WriteLine("{\"ok\":false,\"message\":\"Unknown feature: " + feature + "\"}");
                            return 1;
                    }
                    Console.WriteLine("{\"ok\":true}");
                    return 0;
                }

                // status
                var sb = new StringBuilder();
                sb.Append("{\"ok\":true,\"gpu\":").Append(B(gpu != null));

                // RSR
                sb.Append(",\"rsr\":{");
                if (rsr != null)
                {
                    var rr = rsr.GetSharpnessRange();
                    sb.Append("\"supported\":").Append(B(rsr.IsSupported()))
                      .Append(",\"enabled\":").Append(B(rsr.IsEnabled()))
                      .Append(",\"sharpness\":").Append(I(rsr.GetSharpness()))
                      .Append(",\"smin\":").Append(I(rr.Item1))
                      .Append(",\"smax\":").Append(I(rr.Item2));
                }
                else sb.Append("\"supported\":false");
                sb.Append("}");

                // AFMF
                sb.Append(",\"afmf\":{");
                if (afmf != null)
                    sb.Append("\"supported\":").Append(B(afmf.IsSupported())).Append(",\"enabled\":").Append(B(afmf.IsEnabled()));
                else sb.Append("\"supported\":false");
                sb.Append("}");

                // Anti-Lag
                sb.Append(",\"antilag\":{");
                if (antilag != null)
                    sb.Append("\"supported\":").Append(B(antilag.IsSupported())).Append(",\"enabled\":").Append(B(antilag.IsEnabled()));
                else sb.Append("\"supported\":false");
                sb.Append("}");

                // Chill
                sb.Append(",\"chill\":{");
                if (chill != null)
                {
                    var cr = chill.GetFPSRange();
                    sb.Append("\"supported\":").Append(B(chill.IsSupported()))
                      .Append(",\"enabled\":").Append(B(chill.IsEnabled()))
                      .Append(",\"min\":").Append(I(chill.GetMinFPS()))
                      .Append(",\"max\":").Append(I(chill.GetMaxFPS()))
                      .Append(",\"fmin\":").Append(I(cr.Item1))
                      .Append(",\"fmax\":").Append(I(cr.Item2));
                }
                else sb.Append("\"supported\":false");
                sb.Append("}");

                // Image Sharpening
                sb.Append(",\"sharpening\":{");
                if (sharp != null)
                {
                    var sr = sharp.GetSharpnessRange();
                    sb.Append("\"supported\":").Append(B(sharp.IsSupported()))
                      .Append(",\"enabled\":").Append(B(sharp.IsEnabled()))
                      .Append(",\"value\":").Append(I(sharp.GetSharpness()))
                      .Append(",\"smin\":").Append(I(sr.Item1))
                      .Append(",\"smax\":").Append(I(sr.Item2));
                }
                else sb.Append("\"supported\":false");
                sb.Append("}}");

                Console.WriteLine(sb.ToString());
                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("{\"ok\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                return 1;
            }
        }
    }
}
