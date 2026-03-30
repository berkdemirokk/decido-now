param(
  [string]$RepoName = "decido-now",
  [string]$Visibility = "public"
)

$git = "C:\Program Files\Git\cmd\git.exe"
$gh = "C:\Program Files\GitHub CLI\gh.exe"

if (-not (Test-Path $git)) {
  throw "Git is not installed at $git"
}

if (-not (Test-Path $gh)) {
  throw "GitHub CLI is not installed at $gh"
}

$repoStatus = & $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "GitHub CLI is not authenticated. Run 'gh auth login --web' first."
}

$remoteUrl = (& $gh repo view $RepoName --json url -q .url 2>$null)

if (-not $remoteUrl) {
  & $gh repo create $RepoName --$Visibility --source . --remote origin --push
  exit $LASTEXITCODE
}

& $git remote remove origin 2>$null
& $git remote add origin $remoteUrl
& $git push -u origin main
