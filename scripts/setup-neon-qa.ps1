param(
    [string]$Repo = "abrahamBM20/alovecino-app",
    [string]$ProjectId = "",
    [string]$Branch = "qa",
    [string]$Database = "neondb",
    [string]$Role = "neondb_owner"
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

Assert-Command gh
Assert-Command npx

gh auth status | Out-Host
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login -h github.com"
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    $ProjectId = Read-Host "Neon project id"
}

$apiKey = Read-PlainSecret "Neon API key"

Write-Host "Ensuring Neon branch '$Branch' exists..."
$branchesJson = npx neonctl branches list --project-id $ProjectId --api-key $apiKey --output json
$branches = $branchesJson | ConvertFrom-Json
$existing = $branches | Where-Object { $_.name -eq $Branch }

if (-not $existing) {
    npx neonctl branches create --project-id $ProjectId --name $Branch --api-key $apiKey --output json | Out-Host
}

Write-Host "Reading pooled Neon connection string..."
$connectionString = npx neonctl connection-string $Branch --project-id $ProjectId --database-name $Database --role-name $Role --pooled --api-key $apiKey
$connectionString = ($connectionString | Select-Object -Last 1).Trim()

if ($connectionString -notmatch "^postgres") {
    throw "Could not parse Neon connection string from neonctl output."
}

$uri = [Uri]$connectionString
$userInfo = $uri.UserInfo.Split(":", 2)
$username = [Uri]::UnescapeDataString($userInfo[0])
$password = [Uri]::UnescapeDataString($userInfo[1])
$jdbcUrl = $connectionString -replace "^postgresql://", "jdbc:postgresql://"
$jdbcUrl = $jdbcUrl -replace "^postgres://", "jdbc:postgresql://"

Write-Host "Writing Neon QA connection values to GitHub Actions secrets..."
$jdbcUrl | gh secret set NEON_DATABASE_URL --repo $Repo
$username | gh secret set NEON_DATABASE_USERNAME --repo $Repo
$password | gh secret set NEON_DATABASE_PASSWORD --repo $Repo

Write-Host "Done. Neon QA secrets were updated for $Repo."
