Param(
  [string]$WorkspacePath = $env:GITHUB_WORKSPACE,
  [string]$NginxPath = "C:\Users\ksj\nginx-1.29.2",
  [string]$WebRoot = "C:\Users\ksj\nginx-1.29.2\html\gorani.me"
)

$ErrorActionPreference = "Stop"

Write-Host "[1/6] Validate paths"
if ([string]::IsNullOrWhiteSpace($WorkspacePath)) {
  throw "Workspace path is empty. Expected GITHUB_WORKSPACE or -WorkspacePath."
}
if (!(Test-Path $WorkspacePath)) { throw "Workspace path not found: $WorkspacePath" }
if (!(Test-Path $NginxPath)) { throw "Nginx path not found: $NginxPath" }

$rnPath = Join-Path $WorkspacePath "react-native"
if (!(Test-Path $rnPath)) { throw "react-native path not found: $rnPath" }

Write-Host "[2/6] Move to react-native project"
Set-Location $rnPath

Write-Host "[3/6] Install dependencies"
if (Test-Path (Join-Path $rnPath "package-lock.json")) {
  npm ci
} else {
  npm install
}

Write-Host "[4/6] Build static web"
npx expo export --platform web --output-dir dist

$distPath = Join-Path $rnPath "dist"
if (!(Test-Path $distPath)) { throw "Build output not found: $distPath" }

Write-Host "[5/6] Sync build files to web root: $WebRoot"
if (!(Test-Path $WebRoot)) {
  New-Item -Path $WebRoot -ItemType Directory -Force | Out-Null
}

# Clean old files for deterministic deploy
Get-ChildItem -Path $WebRoot -Force | Remove-Item -Recurse -Force
Copy-Item -Path (Join-Path $distPath "*") -Destination $WebRoot -Recurse -Force

Write-Host "[6/6] Validate nginx config and reload"
$nginxExe = Join-Path $NginxPath "nginx.exe"
if (!(Test-Path $nginxExe)) { throw "nginx.exe not found: $nginxExe" }

Push-Location $NginxPath
& $nginxExe -t
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  throw "nginx -t failed"
}

& $nginxExe -s reload
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  throw "nginx reload failed"
}
Pop-Location

Write-Host "Deploy completed successfully."
