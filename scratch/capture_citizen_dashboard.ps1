$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

$port = 9225
$chromeProcess = Start-Process -FilePath $chromePath -ArgumentList @(
    "--headless=new",
    "--remote-debugging-port=$port",
    "--disable-gpu",
    "--window-size=1280,1200",
    "http://localhost:8080/"
) -PassThru

Start-Sleep -Seconds 2

try {
    $targets = Invoke-RestMethod -Uri "http://localhost:$port/json"
    $page = $targets | Where-Object { $_.type -eq "page" } | Select-Object -First 1

    $wsUri = [System.Uri]$page.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ct = [System.Threading.CancellationToken]::None
    $ws.ConnectAsync($wsUri, $ct).Wait()

    # 1. Switch to Citizen Dashboard
    $evalMsg = @{
        id = 1
        method = "Runtime.evaluate"
        params = @{
            expression = "window.enterCitizenDashboard('CIT-BPL-701');"
        }
    } | ConvertTo-Json -Compress

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($evalMsg)
    $ws.SendAsync((New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

    Start-Sleep -Milliseconds 600

    # 2. Capture Screenshot
    $shotMsg = @{
        id = 2
        method = "Page.captureScreenshot"
        params = @{
            format = "png"
        }
    } | ConvertTo-Json -Compress

    $shotBytes = [System.Text.Encoding]::UTF8.GetBytes($shotMsg)
    $ws.SendAsync((New-Object System.ArraySegment[byte] -ArgumentList @(,$shotBytes)), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

    $buffer = New-Object byte[] 2097152
    $recvResult = $ws.ReceiveAsync((New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)), $ct).Result
    $responseStr = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $recvResult.Count)

    $shotJson = $responseStr | ConvertFrom-Json
    if ($shotJson.result -and $shotJson.result.data) {
        $base64 = $shotJson.result.data
        $outFile = "C:\Users\Shreyansh\.gemini\antigravity-ide\brain\60e616e1-c4e3-49eb-bc18-b1ed7c34ec77\citizen_dashboard_preview.png"
        [System.IO.File]::WriteAllBytes($outFile, [System.Convert]::FromBase64String($base64))
        Write-Output "Captured screenshot to $outFile"
    }

    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct).Wait()
} finally {
    if ($chromeProcess -and -not $chromeProcess.HasExited) {
        Stop-Process -Id $chromeProcess.Id -Force
    }
}
