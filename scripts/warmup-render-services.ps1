param(
    [ValidateSet("all", "dev", "qa")]
    [string]$Environment = "all",

    [switch]$GenerateOnly,

    [int]$TimeoutSeconds = 90
)

$ErrorActionPreference = "Stop"

$services = @(
    @{
        Environment = "dev"
        Name = "api-gateway"
        Url = "https://alovecino-api-gateway-dev.onrender.com/actuator/health"
    },
    @{
        Environment = "dev"
        Name = "auth-service"
        Url = "https://alovecino-auth-service-dev.onrender.com/actuator/health"
    },
    @{
        Environment = "dev"
        Name = "usuarios-service"
        Url = "https://alovecino-usuarios-service-dev.onrender.com/actuator/health"
    },
    @{
        Environment = "dev"
        Name = "geo-service"
        Url = "https://alovecino-geo-service-dev.onrender.com/actuator/health"
    },
    @{
        Environment = "qa"
        Name = "api-gateway"
        Url = "https://alovecino-api-gateway-qa.onrender.com/actuator/health"
    },
    @{
        Environment = "qa"
        Name = "auth-service"
        Url = "https://alovecino-auth-service-qa.onrender.com/actuator/health"
    },
    @{
        Environment = "qa"
        Name = "usuarios-service"
        Url = "https://alovecino-usuarios-service-qa.onrender.com/actuator/health"
    },
    @{
        Environment = "qa"
        Name = "geo-service"
        Url = "https://alovecino-geo-service-qa.onrender.com/actuator/health"
    }
)

if ($Environment -ne "all") {
    $services = $services | Where-Object { $_.Environment -eq $Environment }
}

function Get-CurlCommand($Service) {
    return "curl.exe -L --connect-timeout 15 --max-time $TimeoutSeconds -sS -w `"[$($Service.Environment)/$($Service.Name)] HTTP %{http_code} | total %{time_total}s\n`" `"$($Service.Url)`""
}

foreach ($service in $services) {
    $command = Get-CurlCommand $service

    if ($GenerateOnly) {
        Write-Output $command
        continue
    }

    Write-Host "Warming $($service.Environment)/$($service.Name): $($service.Url)"
    & curl.exe -L --connect-timeout 15 --max-time $TimeoutSeconds -sS -w "[$($service.Environment)/$($service.Name)] HTTP %{http_code} | total %{time_total}s`n" $service.Url
    Write-Host ""
}
