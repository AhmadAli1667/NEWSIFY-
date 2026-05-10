$ErrorActionPreference = "Stop"
# Runs the program with Ctrl+Alt+N by calling this script directly.
Set-Location $PSScriptRoot

$sourceDir = Join-Path $PSScriptRoot "src/main/java/com/example/newssummarizer"
$outDir = Join-Path $PSScriptRoot "out"
$jsonJar = Join-Path $PSScriptRoot "lib/json-20231013.jar"

# JavaFX SDK location (optional). If missing, the script can attempt to download it.
$javafxVersion = "21.0.5"
$javafxDir = Join-Path $PSScriptRoot "lib\javafx-sdk-$javafxVersion\lib"


function Import-DotEnvFile {
    param(
        [string]$filePath
    )

    if (-not (Test-Path $filePath)) {
        return
    }

    Get-Content -Path $filePath | ForEach-Object {
        $line = $_.Trim()

        if ([string]::IsNullOrWhiteSpace($line)) {
            return
        }

        if ($line.StartsWith("#")) {
            return
        }

        $separatorIndex = $line.IndexOf("=")
        if ($separatorIndex -le 0) {
            return
        }

        $key = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()

        if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        } elseif ($value.Length -ge 2 -and $value.StartsWith("'") -and $value.EndsWith("'")) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$rootEnvPath = Join-Path $PSScriptRoot ".env"
$sourceEnvPath = Join-Path $sourceDir ".env"

if (Test-Path $rootEnvPath) {
    Import-DotEnvFile -filePath $rootEnvPath
} elseif (Test-Path $sourceEnvPath) {
    Import-DotEnvFile -filePath $sourceEnvPath
}

if (-not (Test-Path $jsonJar)) {
    Write-Error "Missing dependency jar: $jsonJar"
    exit 1
}

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$javaSources = @(Get-ChildItem -Path $sourceDir -Filter "*.java" -File | Select-Object -ExpandProperty FullName)

if ($javaSources.Count -eq 0) {
    Write-Error "No Java source files found in $sourceDir"
    exit 1
}

# Build classpath including optional JavaFX jars
$cpList = @($jsonJar)
if (Test-Path $javafxDir) {
    $fxJars = Get-ChildItem -Path $javafxDir -Filter "*.jar" -File | ForEach-Object { $_.FullName }
    if ($fxJars) { $cpList += $fxJars }
} else {
    Write-Host "JavaFX SDK not found in lib/javafx-sdk-$javafxVersion. To auto-download, run .\download-javafx.ps1 or install JavaFX manually."
}

$cpForJavac = ($cpList -join ";")
javac -encoding UTF-8 -cp $cpForJavac -d $outDir $javaSources

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

# Run with JavaFX on the classpath if available
$cpForJava = "$outDir;" + ($cpList -join ";")

# Add opens option for compatibility with Java module encapsulation
$javaOpts = "--add-opens=java.base/java.util=ALL-UNNAMED"

java $javaOpts -cp $cpForJava com.example.newssummarizer.Main
exit $LASTEXITCODE