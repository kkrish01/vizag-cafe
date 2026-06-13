# Vizag Cafe — GitHub deploy script
# Run after: gh auth login

$ErrorActionPreference = "Stop"
$repoName = "vizag-cafe"
$username = "kkrish01"

# Refresh PATH for gh
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "`n=== Vizag Cafe Deploy ===" -ForegroundColor Cyan

# Check GitHub login
try {
    gh auth status 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "not logged in" }
} catch {
    Write-Host "GitHub login required. Run this first:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor White
    Write-Host "Then run this script again.`n"
    exit 1
}

$username = gh api user -q .login
if (-not $username) { $username = "kkrish01" }
Write-Host "Deploying for: $username" -ForegroundColor Green

# Create repo and push (skip if remote exists)
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "Creating public repo: $repoName ..." -ForegroundColor Cyan
    gh repo create $repoName --public --source=. --remote=origin --description "Vizag Cafe - Premium South Indian restaurant website, Raipur" --push
} else {
    Write-Host "Pushing to existing remote..." -ForegroundColor Cyan
    git push -u origin main
}

# Enable GitHub Pages (GitHub Actions)
Write-Host "Enabling GitHub Pages..." -ForegroundColor Cyan
gh api "repos/$username/$repoName/pages" -X POST -f build_type=workflow 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Pages may already be enabled — continuing." -ForegroundColor Yellow
}

$liveUrl = "https://$username.github.io/$repoName/"
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  LIVE URL (1-2 min me ready hoga):" -ForegroundColor Green
Write-Host "  $liveUrl" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green
Write-Host "Repo: https://github.com/$username/$repoName" -ForegroundColor Cyan
