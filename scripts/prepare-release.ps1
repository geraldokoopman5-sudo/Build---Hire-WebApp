param(
    [string]$PostgresConfig,
    [switch]$PostgresEnvironment
)
$ErrorActionPreference = 'Stop'
if ($PostgresConfig -and $PostgresEnvironment) { throw 'Choose one PostgreSQL configuration source.' }
$repoRoot = Split-Path $PSScriptRoot -Parent
Push-Location $repoRoot
try {
    $regressionProject = './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj'
    $apiProject = './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj'
    dotnet build $regressionProject --configuration Release
    if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' }
    $checkArgs = @()
    if ($PostgresConfig) { $checkArgs = @('--postgres-config', (Resolve-Path -LiteralPath $PostgresConfig).Path) }
    if ($PostgresEnvironment) { $checkArgs = @('--postgres') }
    dotnet run --project $regressionProject --configuration Release --no-build -- @checkArgs
    if ($LASTEXITCODE -ne 0) { throw 'Backend verification failed.' }
    # A unique package directory avoids mixing new output with an old release.
    $package = Join-Path $repoRoot ('.artifacts/api-' + [guid]::NewGuid().ToString('N'))
    dotnet publish $apiProject --configuration Release --no-restore --output $package
    if ($LASTEXITCODE -ne 0) { throw 'Backend publish failed.' }
    if (Get-ChildItem -LiteralPath $package -Recurse -File | Where-Object {
        $_.Name -like 'appsettings.Local*.json' -or $_.Name -eq 'appsettings.Development.json' -or $_.Name -like '.env*'
    }) { throw 'Private/development settings were found in the release package.' }
    $settings = Get-Content -LiteralPath (Join-Path $package 'appsettings.json') -Raw | ConvertFrom-Json
    if ($settings.JwtConfig.Key -or $settings.ConnectionStrings.DefaultConnection) {
        throw 'Release defaults must not contain JWT keys or database credentials.'
    }
    if (!$PostgresConfig -and !$PostgresEnvironment) {
        Write-Warning 'Only standalone regression checks ran. Run with PostgreSQL before releasing.'
    }
    Write-Output "Backend package prepared: $package"
}
finally { Pop-Location }
