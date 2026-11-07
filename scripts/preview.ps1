[CmdletBinding()]
param(
    [switch]$PrepareOnly,
    [switch]$InstallOnly,
    [switch]$SkipInstall,
    [ValidateRange(1024, 65535)][int]$Port = 4000
)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$localRoot = [IO.Path]::GetFullPath((Join-Path $repoRoot 'local'))
$rubyBin = 'C:\Ruby33-x64\bin'
if (Test-Path (Join-Path $rubyBin 'ruby.exe')) { $env:Path = "$rubyBin;$env:Path" }
$stageRoot = [IO.Path]::GetFullPath((Join-Path $localRoot 'preview-source'))
# /MIR deletes stale files; verify the exact local destination before copying.
if ((Split-Path $PSScriptRoot -Leaf) -ne 'scripts' -or
    (Split-Path $localRoot -Leaf) -ne 'local' -or
    $stageRoot -ne (Join-Path $repoRoot 'local\preview-source') -or
    (Test-Path $stageRoot -PathType Leaf)) {
    throw 'Unexpected preview path. Keep this script in the repository scripts directory.'
}
foreach ($path in @($localRoot, $stageRoot)) {
    if ((Test-Path $path) -and ((Get-Item -LiteralPath $path).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw 'The preview directories must not be junctions or symbolic links.'
    }
}
if (-not $PrepareOnly) {
    foreach ($command in @('ruby', 'bundle')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
            throw "Missing prerequisite: $command. Install Ruby with Bundler first; a shared Windows install at C:\Ruby33-x64 is picked up automatically."
        }
    }
}

New-Item -ItemType Directory -Force -Path $stageRoot | Out-Null
& robocopy $repoRoot $stageRoot /MIR /XJ /R:1 /W:1 /NFL /NDL /NJH /NJS /NP `
    /XD local .git node_modules .bundle (Join-Path $repoRoot 'vendor') (Join-Path $stageRoot 'vendor') _site .jekyll-cache .sass-cache `
    /XF Gemfile.lock package-lock.json main.min.js .jekyll-metadata
if ($LASTEXITCODE -ge 8) { throw "Source copy failed: $LASTEXITCODE" }

$configPath = Join-Path $localRoot 'preview.yml'
$previewConfig = 'url: "http://localhost"' + "`n" + 'baseurl: ""' + "`n" + 'disable_disk_cache: true' + "`n" + 'incremental: false'
[IO.File]::WriteAllText($configPath, $previewConfig, (New-Object Text.UTF8Encoding($false)))
if ($PrepareOnly) {
    Write-Host "Preview source prepared at $stageRoot (dependencies not installed)."
    exit 0
}
$environment = @{
    BUNDLE_APP_CONFIG = (Join-Path $localRoot 'bundle-config')
    BUNDLE_USER_HOME = (Join-Path $localRoot 'bundle-user')
    BUNDLE_GEMFILE = (Join-Path $stageRoot 'Gemfile')
    GEM_SPEC_CACHE = (Join-Path $localRoot 'gem-spec-cache')
    npm_config_cache = (Join-Path $localRoot 'npm-cache')
    TEMP = (Join-Path $localRoot 'tmp')
    TMP = (Join-Path $localRoot 'tmp')
    JEKYLL_ENV = 'development'
}
$previous = @{}
foreach ($key in $environment.Keys) {
    $previous[$key] = [Environment]::GetEnvironmentVariable($key, 'Process')
    [Environment]::SetEnvironmentVariable($key, $environment[$key], 'Process')
}
New-Item -ItemType Directory -Force -Path $environment.TEMP | Out-Null
Push-Location $stageRoot
try {
    if (-not $SkipInstall) {
    & bundle install
    if ($LASTEXITCODE -ne 0) { throw 'bundle install failed.' }
    }
    if ($InstallOnly) { Write-Host 'Dependencies installed successfully.'; return }
    Write-Host "Preview: http://localhost:$Port ; stop with Ctrl+C or scripts/stop-preview.ps1."
    Write-Host 'After editing repository sources, stop and rerun the start script to copy the updates.'
    & bundle exec jekyll serve --host localhost --port $Port --livereload `
        --config "_config.yml,$configPath" --destination (Join-Path $localRoot 'site') --disable-disk-cache
    if ($LASTEXITCODE -ne 0) { throw 'Jekyll exited with an error.' }
} finally {
    Pop-Location
    foreach ($key in $environment.Keys) {
        [Environment]::SetEnvironmentVariable($key, $previous[$key], 'Process')
    }
}
