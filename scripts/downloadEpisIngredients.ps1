param(
    [string]$OutputRoot = 'D:\ait-home\recipe-sources\epis',
    [string]$NodePath = ''
)
$ErrorActionPreference = 'Stop'
if (-not $NodePath) {
    $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $bundledNode) { $NodePath = $bundledNode }
    else { $NodePath = (Get-Command node -ErrorAction Stop).Source }
}
$majorVersion = [int]((& $NodePath --version).TrimStart('v').Split('.')[0])
if ($majorVersion -lt 22) { throw 'Node.js 22 or newer is required. Use -NodePath to select it.' }
$null = New-Item -ItemType Directory -Path $OutputRoot -Force
$outputDirectory = Join-Path $OutputRoot ('ingredients-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 6))
# ASCII prompts keep this script compatible with Windows PowerShell 5.1 encoding.
$secureKey = Read-Host 'EPIS API key (hidden input)' -AsSecureString
$pointer = [IntPtr]::Zero
$plainKey = $null
try {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    # Credential is not a command-line argument or an environment variable.
    $plainKey | & $NodePath (Join-Path $PSScriptRoot 'downloadEpisIngredients.mjs') $outputDirectory
    if ($LASTEXITCODE -ne 0) { throw 'Download failed. No complete export was confirmed.' }
} finally {
    $plainKey = $null
    if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
    $secureKey.Dispose()
}
