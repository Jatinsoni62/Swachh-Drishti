$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$port = 9227
$chromeProcess = Start-Process -FilePath $chromePath -ArgumentList @(
    "--headless=new",
    "--remote-debugging-port=$port",
    "--disable-gpu",
    "--window-size=1280,1400",
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

    function Send-Cdp($method, $params = @{}) {
        $id = [System.Random]::new().Next(1000, 9999)
        $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $ws.SendAsync((New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

        $mem = New-Object System.IO.MemoryStream
        $buffer = New-Object byte[] 65536
        do {
            $recv = $ws.ReceiveAsync((New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)), $ct).Result
            $mem.Write($buffer, 0, $recv.Count)
        } while (-not $recv.EndOfMessage)

        $respStr = [System.Text.Encoding]::UTF8.GetString($mem.ToArray())
        return $respStr | ConvertFrom-Json
    }

    # Navigate to citizen dashboard and open edit details modal
    Send-Cdp "Runtime.evaluate" @{ expression = "window.enterCitizenDashboard('CIT-BPL-701');" }
    Start-Sleep -Milliseconds 600
    Send-Cdp "Runtime.evaluate" @{ expression = "document.getElementById('edit-details-btn').click();" }
    Start-Sleep -Milliseconds 600

    # Capture screenshot
    $res = Send-Cdp "Page.captureScreenshot" @{ format = "png" }
    if ($res.result -and $res.result.data) {
        $outFile = "C:\Users\Shreyansh\.gemini\antigravity-ide\brain\60e616e1-c4e3-49eb-bc18-b1ed7c34ec77\edit_details_modal.png"
        [System.IO.File]::WriteAllBytes($outFile, [System.Convert]::FromBase64String($res.result.data))
        Write-Output "SUCCESS: Saved screenshot to $outFile"
    }

    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct).Wait()
} finally {
    if ($chromeProcess -and -not $chromeProcess.HasExited) {
        Stop-Process -Id $chromeProcess.Id -Force
    }
}
