$content = Get-Content -Raw -Encoding UTF8 index.html

$test1 = $content.Contains("btn-train-camera-login")
$test2 = $content.Contains("renderTrainCameraView")
$test3 = $content.Contains("Start Recording Demonstration")
$test4 = $content.Contains("Stop Recording & Analyze Activities")
$test5 = $content.Contains("Was spitting detected during this recording?")
$test6 = $content.Contains("Should a fine (challan) be issued for this activity?")
$test7 = $content.Contains("Was the activity correctly detected by the system?")
$test8 = $content.Contains("Violation Classification:")
$test9 = $content.Contains("dustbin-width-slider")
$test10 = $content.Contains("dustbin-height-slider")
$test11 = $content.Contains("saveTrainingDustbinConfig")
$test12 = $content.Contains("saveTrainingSample")
$test13 = $content.Contains("retrainModel")
$test14 = $content.Contains("openTrainCameraStudio")

Write-Host "1. Train Camera Button on Login Page: $test1"
Write-Host "2. Train Camera View Function: $test2"
Write-Host "3. Start Recording Button: $test3"
Write-Host "4. Stop Recording & Analyze Button: $test4"
Write-Host "5. Feedback Q1 (Was Spitting Detected): $test5"
Write-Host "6. Feedback Q2 (Should Fine be Issued): $test6"
Write-Host "7. Feedback Q3 (Was Correctly Detected): $test7"
Write-Host "8. Feedback Q4 (Violation Classification): $test8"
Write-Host "9. Dustbin Width Slider: $test9"
Write-Host "10. Dustbin Height Slider: $test10"
Write-Host "11. Save Dustbin Config Function: $test11"
Write-Host "12. Save Training Sample Function: $test12"
Write-Host "13. Retrain Model Function: $test13"
Write-Host "14. Open Train Camera Studio Action: $test14"
