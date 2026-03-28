[CmdletBinding()]
param(
    [switch]$WithTestData,
    [switch]$WithCompute
)

function Write-Step { param($msg) Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "   $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "   ERROR: $msg" -ForegroundColor Red }

Write-Step "Stopping all containers and removing volumes..."
docker compose down -v
if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose down failed"; exit 1 }

Write-Step "Starting PostgreSQL..."
docker compose up -d postgres
if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to start postgres"; exit 1 }

Write-Step "Waiting for PostgreSQL to be healthy..."
$timeout = 60; $elapsed = 0
do {
    Start-Sleep -Seconds 2
    $elapsed += 2
    $health = docker inspect --format "{{.State.Health.Status}}" jarvis-postgres 2>$null
} while ($health -ne "healthy" -and $elapsed -lt $timeout)

if ($health -ne "healthy") {
    Write-Fail "PostgreSQL did not become healthy within ${timeout}s"
    exit 1
}
Write-Ok "PostgreSQL is healthy."

Write-Step "Running schema migrations..."
docker compose run --rm --no-deps flyway
if ($LASTEXITCODE -ne 0) { Write-Fail "Schema migration failed"; exit 1 }
Write-Ok "Schema migrations complete."

if ($WithTestData) {
    Write-Step "Seeding test data..."
    docker compose --profile seed run --rm --no-deps flyway-seed
    if ($LASTEXITCODE -ne 0) { Write-Fail "Test data seed failed"; exit 1 }
    Write-Ok "Test data seeded."
}

if ($WithCompute) {
    Write-Step "Starting compute services (backend, web)..."
    docker compose up -d backend web
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to start compute services"; exit 1 }
    Write-Ok "Compute services started."
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
