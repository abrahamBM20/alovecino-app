$ErrorActionPreference = "Stop"

Write-Host "Checking local QA tooling..."

$commands = @("git", "gh", "render", "node", "npm", "npx", "mvn", "docker")
foreach ($command in $commands) {
    $found = Get-Command $command -ErrorAction SilentlyContinue
    if ($found) {
        Write-Host "[OK] $command -> $($found.Source)"
    }
    else {
        Write-Host "[MISSING] $command"
    }
}

Write-Host ""
Write-Host "GitHub CLI auth:"
gh auth status

Write-Host ""
Write-Host "Render CLI user:"
render whoami

Write-Host ""
Write-Host "Neon CLI through npx:"
npx neonctl --version
