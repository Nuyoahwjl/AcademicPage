$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$record = Get-Content -LiteralPath (Join-Path $repoRoot 'local\preview-process.json') | ConvertFrom-Json
$listeners = Get-NetTCPConnection -LocalPort $record.port -State Listen -ErrorAction SilentlyContinue
foreach ($serverPid in @($listeners.OwningProcess | Select-Object -Unique)) {
    if (-not $serverPid) { continue }
    $serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$serverPid"
    if ($serverProcess.Name -ne 'ruby.exe' -or -not $serverProcess.CommandLine.Contains((Join-Path $repoRoot 'local'))) {
        throw 'The port belongs to another process; refusing to stop it.'
    }
    Stop-Process -Id $serverPid
}
Write-Host 'Local preview stopped.'
