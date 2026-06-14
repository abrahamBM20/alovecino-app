param(
    [Parameter(Mandatory = $false)]
    [string] $Candidate = "docs/skillopt/best_skill.md",

    [Parameter(Mandatory = $false)]
    [string] $Config = "docs/skillopt/config.json",

    [Parameter(Mandatory = $false)]
    [string] $ValidationSet = "docs/skillopt/validation-set.json"
)

if (-not (Test-Path -LiteralPath $Candidate)) {
    Write-Error "Candidate not found: $Candidate"
    exit 1
}

if (-not (Test-Path -LiteralPath $Config)) {
    Write-Error "Config not found: $Config"
    exit 1
}

if (-not (Test-Path -LiteralPath $ValidationSet)) {
    Write-Error "Validation set not found: $ValidationSet"
    exit 1
}

$content = Get-Content -LiteralPath $Candidate -Raw
$cfg = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
$items = Get-Content -LiteralPath $ValidationSet -Raw | ConvertFrom-Json

$estimatedTokens = [math]::Ceiling($content.Length / 4)
$score = 100
$findings = New-Object System.Collections.Generic.List[string]

if ($estimatedTokens -gt [int]$cfg.max_tokens) {
    $score -= 25
    $findings.Add("Excede presupuesto: $estimatedTokens > $($cfg.max_tokens)")
}

foreach ($section in $cfg.validation.required_sections) {
    if ($content -notmatch [regex]::Escape("## $section")) {
        $score -= 8
        $findings.Add("Falta sección requerida: $section")
    }
}

foreach ($pattern in $cfg.validation.required_patterns) {
    if ($content -notmatch [regex]::Escape($pattern)) {
        $score -= 5
        $findings.Add("Falta patrón requerido: $pattern")
    }
}

foreach ($pattern in $cfg.validation.forbidden_patterns) {
    if ($content -match [regex]::Escape($pattern)) {
        $score -= 15
        $findings.Add("Contiene patrón prohibido: $pattern")
    }
}

foreach ($item in $items) {
    foreach ($pattern in $item.must_include) {
        if ($content -notmatch [regex]::Escape($pattern)) {
            $score -= 4
            $findings.Add("Caso $($item.id) no cubre: $pattern")
        }
    }
}

if ($score -lt 0) {
    $score = 0
}

$passed = $score -ge [int]$cfg.min_score

[pscustomobject]@{
    Candidate = $Candidate
    EstimatedTokens = $estimatedTokens
    MaxTokens = [int]$cfg.max_tokens
    Score = $score
    MinScore = [int]$cfg.min_score
    Passed = $passed
    Findings = $findings
} | Format-List

if (-not $passed) {
    exit 2
}

