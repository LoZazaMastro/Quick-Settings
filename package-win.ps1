$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$Root = [IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path)).TrimEnd("\")
$Parent = Split-Path -Parent $Root
$Version = (Get-Content (Join-Path $Root "package.json") -Raw | ConvertFrom-Json).version
$InstallerZip = Join-Path $Parent "Quick-Settings_Installer-$Version.zip"
$LegacyZip = Join-Path $Parent "quick-settings-decky_Installer.zip"
$ProjectZip = Join-Path $Parent "quick-settings-project-$Version.zip"

function New-PrefixedZip {
  param(
    [Parameter(Mandatory=$true)][string]$Destination,
    [Parameter(Mandatory=$true)][string]$Prefix,
    [Parameter(Mandatory=$true)][object[]]$Items
  )

  $resolvedDestination = [IO.Path]::GetFullPath($Destination)
  if (-not ([IO.Path]::GetDirectoryName($resolvedDestination)).Equals($Parent, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to create a package outside the Quick Settings release directory"
  }
  if ([IO.File]::Exists($resolvedDestination)) {
    [IO.File]::Delete($resolvedDestination)
  }

  $archive = [IO.Compression.ZipFile]::Open($resolvedDestination, [IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach ($item in $Items) {
      $files = if ($item.PSIsContainer) {
        Get-ChildItem -LiteralPath $item.FullName -Recurse -File -Force
      } else {
        @($item)
      }
      foreach ($file in $files) {
        $relative = $file.FullName.Substring($Root.Length).TrimStart("\").Replace("\", "/")
        $entry = "$Prefix/$relative"
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
          $archive,
          $file.FullName,
          $entry,
          [IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
      }
    }
  } finally {
    $archive.Dispose()
  }
}

$RuntimeNames = @(
  "amd", "bin", "dist", "licenses",
  "LEGAL.md", "LICENSE", "NOTICE", "package.json", "plugin.json",
  "THIRD-PARTY-NOTICES.md", "README.md", "main.py"
)
$RuntimeItems = foreach ($name in $RuntimeNames) {
  Get-Item -LiteralPath (Join-Path $Root $name)
}

$ProjectExclude = @("node_modules", "__pycache__")
$ProjectItems = Get-ChildItem -LiteralPath $Root -Force | Where-Object {
  $ProjectExclude -notcontains $_.Name
}

New-PrefixedZip -Destination $InstallerZip -Prefix "quick-settings" -Items $RuntimeItems
New-PrefixedZip -Destination $ProjectZip -Prefix "quick-settings" -Items $ProjectItems
Copy-Item -LiteralPath $InstallerZip -Destination $LegacyZip -Force

Write-Host "Created $InstallerZip"
Write-Host "Created $ProjectZip"
Write-Host "Updated $LegacyZip"
