$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
    $chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
}
$url = "file:///C:/Users/Shreyansh/Desktop/Bhopal%20Prototype/test_runner.html"

$outFile = [System.IO.Path]::GetTempFileName()
$pinfo = New-Object System.Diagnostics.ProcessStartInfo
$pinfo.FileName = $chrome
$pinfo.Arguments = "--headless=new --no-sandbox --allow-file-access-from-files --virtual-time-budget=5000 --dump-dom `"$url`""
$pinfo.RedirectStandardOutput = $true
$pinfo.RedirectStandardError = $true
$pinfo.UseShellExecute = $false

$p = [System.Diagnostics.Process]::Start($pinfo)
$stdout = $p.StandardOutput.ReadToEnd()
$p.WaitForExit()

$passes = [regex]::Matches($stdout, '<div class="pass">\s*(.*?)\s*</div>')
$fails = [regex]::Matches($stdout, '<div class="fail">\s*(.*?)\s*</div>')

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "   SWACHH-DRISHTI AUTOMATED FUNCTION & SYSTEM TEST REPORT" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " TOTAL PASSED: $($passes.Count)" -ForegroundColor Green
$failColor = if ($fails.Count -eq 0) { "Green" } else { "Red" }
Write-Host " TOTAL FAILED: $($fails.Count)" -ForegroundColor $failColor
Write-Host "-------------------------------------------------------"

foreach ($item in $passes) {
    Write-Host "  $($item.Groups[1].Value)" -ForegroundColor DarkGreen
}

if ($fails.Count -gt 0) {
    Write-Host "`nFailures detected:" -ForegroundColor Red
    foreach ($item in $fails) {
        Write-Host "  $($item.Groups[1].Value)" -ForegroundColor Red
    }
} else {
    Write-Host "`n>> ALL $($passes.Count) TESTS PASSED WITH 0 FAILURES! <<" -ForegroundColor Green
}
Write-Host "=======================================================`n"
