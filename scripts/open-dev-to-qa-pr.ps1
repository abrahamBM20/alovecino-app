param(
    [string]$Repo = "abrahamBM20/alovecino-app"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI is not available in PATH."
}

gh auth status | Out-Host
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login -h github.com"
}

$title = "Promover dev a qa"
$body = @"
## Objetivo

Promover la rama `dev` hacia `qa` para validar el candidato QA antes de produccion.

## Evidencia esperada

El workflow `QA Release Candidate` debe publicar artefactos con:

- cobertura JUnit/Jacoco;
- cobertura Jest/lcov;
- reporte Newman;
- resumen K6;
- evidencia Appium si existe `APPIUM_APK_URL`.

## Checklist

- [ ] GitHub Actions `QA Release Candidate` aprobado.
- [ ] Quality Gate revisado en SonarQube QA.
- [ ] API QA responde en `QA_BASE_URL`.
- [ ] Evidencias descargadas desde los artefactos del workflow.
"@

$bodyFile = New-TemporaryFile
Set-Content -Path $bodyFile -Value $body -Encoding UTF8

try {
    gh pr create --repo $Repo --base qa --head dev --title $title --body-file $bodyFile
}
finally {
    Remove-Item -LiteralPath $bodyFile -Force
}
