param(
    [string]$ProjectId = "super-poetry-34181860",
    [string]$Branch = "qa",
    [string]$Database = "neondb",
    [string]$Role = "neondb_owner",
    [string]$AuthServiceId = "srv-d7unku3tqb8s73coavd0",
    [string]$UsuariosServiceId = "srv-d7unl4n7f7vs73cqrmi0",
    [string]$ApiGatewayServiceId = "srv-d7unl3rtqb8s73cob4hg"
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

function ConvertTo-Pem([string]$Label, [byte[]]$Bytes) {
    $base64 = [Convert]::ToBase64String($Bytes)
    $lines = $base64 -split "(.{1,64})" | Where-Object { $_ }
    return "-----BEGIN $Label-----`n$($lines -join "`n")`n-----END $Label-----"
}

function Set-RenderEnvVar($ServiceId, $Key, $Value, $ApiKey) {
    $uri = "https://api.render.com/v1/services/$ServiceId/env-vars/$Key"
    $body = @{ value = $Value } | ConvertTo-Json -Compress
    Invoke-RestMethod `
        -Method Put `
        -Uri $uri `
        -Headers @{
            "Authorization" = "Bearer $ApiKey"
            "Accept" = "application/json"
            "Content-Type" = "application/json"
        } `
        -Body $body | Out-Null
}

function Set-ManyRenderEnvVars($ServiceId, $Values, $ApiKey) {
    foreach ($entry in $Values.GetEnumerator()) {
        Write-Host "Setting $($entry.Key) on $ServiceId"
        Set-RenderEnvVar -ServiceId $ServiceId -Key $entry.Key -Value $entry.Value -ApiKey $ApiKey
    }
}

Assert-Command npx

$renderApiKey = $env:RENDER_API_KEY
if ([string]::IsNullOrWhiteSpace($renderApiKey)) {
    $renderApiKey = Read-PlainSecret "Render API key"
}

Write-Host "Reading Neon pooled connection string for branch '$Branch'..."
$connectionStringOutput = npx neonctl connection-string $Branch `
    --project-id $ProjectId `
    --pooled `
    --database-name $Database `
    --role-name $Role 2>$null

$connectionString = ($connectionStringOutput | Select-Object -First 1).Trim()
if ([string]::IsNullOrWhiteSpace($connectionString)) {
    throw "Could not read Neon connection string."
}

$uri = [Uri]$connectionString
$userinfo = $uri.UserInfo.Split(":", 2)
$databaseUsername = [Uri]::UnescapeDataString($userinfo[0])
$databasePassword = [Uri]::UnescapeDataString($userinfo[1])
$jdbcUrl = "jdbc:postgresql://$($uri.Host)$($uri.AbsolutePath)$($uri.Query)"

$rsa = [System.Security.Cryptography.RSA]::Create(2048)
try {
    $privateKey = ConvertTo-Pem "PRIVATE KEY" $rsa.ExportPkcs8PrivateKey()
    $publicKey = ConvertTo-Pem "PUBLIC KEY" $rsa.ExportSubjectPublicKeyInfo()
}
finally {
    $rsa.Dispose()
}

$commonBackendVars = @{
    "SERVER_PORT" = "10000"
    "SPRING_PROFILES_ACTIVE" = "qa"
    "SPRING_DATASOURCE_URL" = $jdbcUrl
    "SPRING_DATASOURCE_USERNAME" = $databaseUsername
    "SPRING_DATASOURCE_PASSWORD" = $databasePassword
    "AUTH_JWT_ISSUER" = "alovecino-auth"
    "AUTH_JWT_AUDIENCE" = "alovecino-api"
}

$authVars = $commonBackendVars.Clone()
$authVars["APP_JWT_PRIVATE_KEY"] = $privateKey
$authVars["APP_JWT_PUBLIC_KEY"] = $publicKey
$authVars["APP_JWT_REFRESH_COOKIE_SECURE"] = "true"
$authVars["APP_JWT_REFRESH_COOKIE_SAME_SITE"] = "None"

$usuariosVars = $commonBackendVars.Clone()
$usuariosVars["AUTH_JWK_SET_URI"] = "https://alovecino-auth-service-qa.onrender.com/.well-known/jwks.json"

$gatewayVars = @{
    "SERVER_PORT" = "10000"
    "SPRING_PROFILES_ACTIVE" = "qa"
    "AUTH_SERVICE_URL" = "https://alovecino-auth-service-qa.onrender.com"
    "USUARIOS_SERVICE_URL" = "https://alovecino-usuarios-service-qa.onrender.com"
    "AUTH_JWK_SET_URI" = "https://alovecino-auth-service-qa.onrender.com/.well-known/jwks.json"
    "AUTH_JWT_ISSUER" = "alovecino-auth"
    "AUTH_JWT_AUDIENCE" = "alovecino-api"
    "GATEWAY_CORS_ALLOWED_ORIGINS" = "http://localhost:19006,http://localhost:3000"
}

Set-ManyRenderEnvVars -ServiceId $AuthServiceId -Values $authVars -ApiKey $renderApiKey
Set-ManyRenderEnvVars -ServiceId $UsuariosServiceId -Values $usuariosVars -ApiKey $renderApiKey
Set-ManyRenderEnvVars -ServiceId $ApiGatewayServiceId -Values $gatewayVars -ApiKey $renderApiKey

Write-Host "Render QA environment variables were updated."
Write-Host "Trigger a deploy from Render or merge dev -> qa so the services use the new values."
