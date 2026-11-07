[CmdletBinding()]
param([ValidateRange(1024, 65535)][int]$Port = 4000)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
New-Item -ItemType Directory -Force -Path (Join-Path $repoRoot 'local') | Out-Null
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listener) { throw "Port $Port is already in use. Open http://localhost:$Port or stop its existing server first." }
$script = Join-Path $PSScriptRoot 'preview.ps1'
$arguments = @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"' + $script + '"'),'-SkipInstall','-Port',$Port)
$process = Start-Process -FilePath powershell.exe -ArgumentList $arguments -WorkingDirectory $repoRoot -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $repoRoot 'local\preview.stdout.log') `
    -RedirectStandardError (Join-Path $repoRoot 'local\preview.stderr.log')
@{ launcherPid = $process.Id; port = $Port; projectRoot = $repoRoot; startedAt = (Get-Date).ToString('o') } |
    ConvertTo-Json | Set-Content -LiteralPath (Join-Path $repoRoot 'local\preview-process.json') -Encoding UTF8
Write-Host "Starting http://localhost:$Port ; logs are in local/preview.*.log."
