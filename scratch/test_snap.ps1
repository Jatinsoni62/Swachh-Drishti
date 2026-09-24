$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$port = 9230
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

    function Take-Shot($filename) {
        $res = Send-Cdp "Page.captureScreenshot" @{ format = "png" }
        if ($res.result -and $res.result.data) {
            $outFile = "C:\Users\Shreyansh\.gemini\antigravity-ide\brain\60e616e1-c4e3-49eb-bc18-b1ed7c34ec77\$filename"
            [System.IO.File]::WriteAllBytes($outFile, [System.Convert]::FromBase64String($res.result.data))
            Write-Output "SUCCESS: Saved screenshot to $filename ($($res.result.data.Length) bytes)"
        } else {
            Write-Output "ERROR taking screenshot: $($res | ConvertTo-Json -Depth 2)"
        }
    }

    # 1. Navigate to citizen dashboard
    Write-Output "=== 1. Testing Citizen Dashboard Layout ==="
    $null = Send-Cdp "Runtime.evaluate" @{ expression = "window.enterCitizenDashboard('CIT-BPL-701');" }
    Start-Sleep -Milliseconds 900
    Take-Shot "citizen_dashboard_reordered.png"

    # 2. Open 3-Angle Face Scanner Modal
    Write-Output "=== 2. Opening 3-Angle Face Scanner Modal ==="
    $null = Send-Cdp "Runtime.evaluate" @{ expression = "document.getElementById('open-face-scanner-btn')?.click();" }
    Start-Sleep -Milliseconds 800
    Take-Shot "face_scanner_demo_modal.png"

    # 3. Trigger 3-angle auto sample / calibration
    Write-Output "=== 3. Running 3-Angle Auto-Scan and Verification ==="
    $null = Send-Cdp "Runtime.evaluate" @{ expression = "document.getElementById('auto-sample-btn')?.click();" }
    Start-Sleep -Milliseconds 2500
    Take-Shot "face_scanner_verified_3angles.png"

    # 4. Click Save & Enroll Biometrics
    Write-Output "=== 4. Saving 3-Angle Biometric Profile ==="
    $null = Send-Cdp "Runtime.evaluate" @{ expression = "document.getElementById('save-biometrics-btn')?.click();" }
    Start-Sleep -Milliseconds 900
    Take-Shot "citizen_dashboard_enrolled_3angles.png"

    # 5. Switch to Municipal Officer Dashboard to verify Public Portal removal
    Write-Output "=== 5. Checking Municipal Officer Dashboard Sidebar ==="
    $null = Send-Cdp "Runtime.evaluate" @{ expression = "store.setUserRole('MUNICIPAL_OFFICER'); store.setView('dashboard');" }
    Start-Sleep -Milliseconds 900
    Take-Shot "officer_dashboard_no_public_portal.png"

    # DOM Check for Public Portal in Officer Sidebar
    $sidebarCheck = Send-Cdp "Runtime.evaluate" @{ expression = "document.getElementById('app-sidebar-root')?.innerText;" }
    $sidebarText = $sidebarCheck.result.value
    Write-Output "`nSidebar Text in Officer View:"
    Write-Output $sidebarText
    Write-Output "`n[CHECK] Officer Sidebar contains 'Public Portal': $($sidebarText.Contains('Public Portal'))"

    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct).Wait()
} finally {
    if ($chromeProcess -and -not $chromeProcess.HasExited) {
        Stop-Process -Id $chromeProcess.Id -Force
    }
}
