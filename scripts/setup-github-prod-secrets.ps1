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
Write-Host "Configuring GitHub Actions production variables for $Repo"
Set-GitHubVariable "PROD_API_BASE_URL" "Production API Gateway URL used by EAS, for example http://ec2-public-dns or https://api.example.com"
Set-GitHubVariable "PROD_CORS_ALLOWED_ORIGINS" "Allowed origins for production Gateway CORS" "https://app.example.com"

Write-Host ""
Write-Host "Configuring GitHub Actions production secrets for $Repo"
Set-GitHubSecret "PROD_EC2_HOST" "EC2 public DNS or public IPv4"
Set-GitHubSecret "PROD_EC2_USER" "EC2 SSH user, usually ec2-user"
Set-GitHubSecret "PROD_EC2_SSH_KEY" "Private SSH key for GitHub Actions to access EC2"
Set-GitHubSecret "PROD_NEON_DATABASE_URL" "Neon production JDBC URL"
Set-GitHubSecret "PROD_NEON_DATABASE_USERNAME" "Neon production database username"
Set-GitHubSecret "PROD_NEON_DATABASE_PASSWORD" "Neon production database password"
Set-GitHubSecret "PROD_APP_JWT_PRIVATE_KEY" "Production auth-service RSA private key"
Set-GitHubSecret "PROD_APP_JWT_PUBLIC_KEY" "Production auth-service RSA public key"
Set-GitHubSecret "EXPO_TOKEN" "Expo/EAS token"

Write-Host ""
Write-Host "Done. GitHub Actions production configuration has been updated."
