param(
    [string]$Repo = "abrahamBM20/alovecino-app"
)

$ErrorActionPreference = "Stop"

function Assert-Command($Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Command '$Name' is not available in PATH."
    }
}

function Read-PlainSecret($Prompt) {
    $secure = Read-Host $Prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Set-GitHubSecret($Name, $Prompt, [switch]$Optional) {
    $value = Read-PlainSecret $Prompt
    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($Optional) {
            Write-Host "Skipping optional secret $Name"
            return
        }
        throw "Secret $Name is required."
    }

    $value | gh secret set $Name --repo $Repo
}

function Set-GitHubVariable($Name, $Prompt, [string]$Default = "") {
    if ($Default) {
        $value = Read-Host "$Prompt [$Default]"
        if ([string]::IsNullOrWhiteSpace($value)) {
            $value = $Default
        }
    }
    else {
        $value = Read-Host $Prompt
    }

    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Variable $Name is required."
    }

    gh variable set $Name --body $value --repo $Repo
}

Assert-Command gh

gh auth status | Out-Host
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login -h github.com"
}

Write-Host ""
Write-Host "Configuring GitHub Actions variables for $Repo"
Set-GitHubVariable "QA_BASE_URL" "QA API Gateway URL, for example https://alovecino-api-gateway-qa.onrender.com"

$configureSonar = Read-Host "Configure optional SonarQube/SonarCloud values? (y/N)"
if ($configureSonar -match '^(y|Y|yes|YES|s|S|si|SI)$') {
    Set-GitHubVariable "SONAR_HOST_URL" "SonarQube/SonarCloud URL"
    Set-GitHubVariable "SONAR_PROJECT_KEY" "SonarQube project key" "alovecino-app"
}

Write-Host ""
Write-Host "Configuring GitHub Actions secrets for $Repo"
Set-GitHubSecret "NEON_DATABASE_URL" "Neon QA JDBC URL"
Set-GitHubSecret "NEON_DATABASE_USERNAME" "Neon QA database username"
Set-GitHubSecret "NEON_DATABASE_PASSWORD" "Neon QA database password"
Set-GitHubSecret "APP_JWT_PRIVATE_KEY" "Auth-service RSA private key"
Set-GitHubSecret "APP_JWT_PUBLIC_KEY" "Auth-service RSA public key"
Set-GitHubSecret "APPIUM_APK_URL" "APK URL for Appium E2E (optional)" -Optional
Set-GitHubSecret "EXPO_TOKEN" "Expo/EAS token (optional)" -Optional
if ($configureSonar -match '^(y|Y|yes|YES|s|S|si|SI)$') {
    Set-GitHubSecret "SONAR_TOKEN" "SonarQube/SonarCloud token"
}

Write-Host ""
Write-Host "Done. GitHub Actions QA configuration has been updated."
