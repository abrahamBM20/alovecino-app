param(
    [Parameter(Mandatory = $false)]
    [string] $Path = "docs/skillopt/best_skill.md",

    [Parameter(Mandatory = $false)]
    [int] $MaxTokens = 1200
)

if (-not (Test-Path -LiteralPath $Path)) {
    Write-Error "Skill file not found: $Path"
    exit 1
}

$content = Get-Content -LiteralPath $Path -Raw
$chars = $content.Length
$words = ([regex]::Matches($content, "\S+")).Count

# Approximation: English/Spanish technical Markdown is usually near 3.5-4 chars/token.
$estimatedTokens = [math]::Ceiling($chars / 4)

[pscustomobject]@{
    Path = $Path
    Characters = $chars
    Words = $words
    EstimatedTokens = $estimatedTokens
    MaxTokens = $MaxTokens
    WithinBudget = ($estimatedTokens -le $MaxTokens)
} | Format-List

if ($estimatedTokens -gt $MaxTokens) {
    Write-Error "Estimated token budget exceeded: $estimatedTokens > $MaxTokens"
    exit 2
}

