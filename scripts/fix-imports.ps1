param([string]$Root = "C:\Users\ddonnell\OneDrive - Capgemini\source\now-sdk-ext-core")

$exclude = Join-Path $Root "src\sn\IServiceNowInstance.ts"

$files = Get-ChildItem -Path $Root -Recurse -Include "*.ts","*.mjs" |
    Where-Object { $_.FullName -ne $exclude }

$updated = @()

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -notmatch "new ServiceNowInstance\(") { continue }

    # Step 1: replace constructor calls
    $newContent = $content -replace "new ServiceNowInstance\(", "ServiceNowInstanceFactory.createInstance("

    # Step 2: add ServiceNowInstanceFactory import if not already present
    if ($newContent -notmatch "ServiceNowInstanceFactory") {
        # Match import line(s) with ServiceNowInstance.js - may span braces
        $importMatch = [regex]::Match($newContent, "import \{[^}]*\} from (['\"])(.*?ServiceNowInstance\.js)\1;")
        if ($importMatch.Success) {
            $quote     = $importMatch.Groups[1].Value
            $origPath  = $importMatch.Groups[2].Value
            $iPath     = $origPath -replace "ServiceNowInstance\.js$", "IServiceNowInstance.js"
            $importLine = "import { ServiceNowInstanceFactory } from $quote$iPath$quote;"

            # Insert after the matched import line
            $insertAfter = $importMatch.Value
            $newContent  = $newContent.Replace($insertAfter, "$insertAfter`n$importLine")
        }
    }

    [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.UTF8Encoding]::new($false))
    $updated += $file.Name
}

Write-Output "Updated $($updated.Count) files:"
$updated | ForEach-Object { Write-Output "  $_" }
