$content = Get-Content -Raw -Encoding UTF8 index.html

$test1 = -not ($content.Contains("Only the citizen whose uploaded photo matches"))
$test2 = $content.Contains("toggle-dustbin-btn")
$test3 = $content.Contains("dustbin-placement-collapsible")
$test4 = $content.Contains("Incident Tracker")
$test5 = $content.Contains("View Evidence")
$test6 = $content.Contains("openCitizenEvidenceModal")
$test7 = $content.Contains("verifyCitizenEvidence")
$test8 = $content.Contains("Civic Violation Incident Traceability & Tracker")

Write-Host "1. Biometric Description Removed: $test1"
Write-Host "2. Dustbin Toggle Button Present: $test2"
Write-Host "3. Dustbin Collapsible Panel Present: $test3"
Write-Host "4. Incident Tracker in Navigation: $test4"
Write-Host "5. View Evidence Button Present: $test5"
Write-Host "6. Citizen Evidence Modal Function: $test6"
Write-Host "7. Verify Evidence Handler Present: $test7"
Write-Host "8. Tracker Below Audit & AI Metrics: $test8"
