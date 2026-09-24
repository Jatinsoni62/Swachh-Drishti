# Execute test script via Chrome DevTools Protocol WebSocket in PowerShell
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

$port = 9224
$chromeProcess = Start-Process -FilePath $chromePath -ArgumentList @(
    "--headless=new",
    "--remote-debugging-port=$port",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:8080/"
) -PassThru

Start-Sleep -Seconds 2

try {
    $targets = Invoke-RestMethod -Uri "http://localhost:$port/json"
    $page = $targets | Where-Object { $_.type -eq "page" } | Select-Object -First 1
    if (-not $page) {
        Write-Error "No page target found on CDP port $port"
        exit 1
    }

    $wsUri = [System.Uri]$page.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ct = [System.Threading.CancellationToken]::None
    $ws.ConnectAsync($wsUri, $ct).Wait()

    # JS test code
    $jsExpression = @"
    (function() {
      const results = [];
      const store = window.store;
      if (!store) return ['FAIL: window.store not found'];

      // 1. Initial citizen checks
      results.push('Citizen 1: ' + store.registeredCitizens[0].name + ' (' + store.registeredCitizens[0].id + ')');
      results.push('Citizen 2: ' + store.registeredCitizens[1].name + ' (' + store.registeredCitizens[1].id + ')');
      results.push('Citizen 3: ' + store.registeredCitizens[2].name + ' (' + store.registeredCitizens[2].id + ')');

      // 2. Photo update isolation
      const photo1 = 'data:image/png;base64,TESTPHOTO_CIT1';
      store.updateCitizenDetails('CIT-BPL-701', { facePhoto: photo1, faceRegistered: true });
      results.push('C1 Photo set: ' + (store.registeredCitizens[0].facePhoto === photo1));
      results.push('C2 Photo isolated: ' + (store.registeredCitizens[1].facePhoto === null));
      results.push('C3 Photo isolated: ' + (store.registeredCitizens[2].facePhoto === null));

      // 3. Update personal details on Citizen 2
      store.updateCitizenDetails('CIT-BPL-702', {
        address: 'House 55, VIP Road, Karbala, Bhopal',
        vehicleNumber: 'MP-04-ZZ-9999',
        emergencyContact: '+91 94250 99999'
      });
      results.push('C2 address: ' + store.registeredCitizens[1].address);
      results.push('C2 vehicle: ' + store.registeredCitizens[1].vehicleNumber);
      results.push('C1 vehicle unchanged: ' + (store.registeredCitizens[0].vehicleNumber !== 'MP-04-ZZ-9999'));

      // 4. Biometric matching: Person matching C1 photo spits
      const c1CountBefore = store.challans.filter(c => c.citizenId === 'CIT-BPL-701').length;
      const c2CountBefore = store.challans.filter(c => c.citizenId === 'CIT-BPL-702').length;
      const c3CountBefore = store.challans.filter(c => c.citizenId === 'CIT-BPL-703').length;

      const inc = store.triggerSpittingDetection('BPL-ICC-042', 96, null, photo1, null, 'CIT-BPL-701');
      results.push('Targeted incident citizenId: ' + inc.citizenId);

      const c1CountAfter = store.challans.filter(c => c.citizenId === 'CIT-BPL-701').length;
      const c2CountAfter = store.challans.filter(c => c.citizenId === 'CIT-BPL-702').length;
      const c3CountAfter = store.challans.filter(c => c.citizenId === 'CIT-BPL-703').length;

      results.push('Citizen 1 notices: ' + c1CountBefore + ' -> ' + c1CountAfter + ' (+1 received)');
      results.push('Citizen 2 notices: ' + c2CountBefore + ' -> ' + c2CountAfter + ' (0 received)');
      results.push('Citizen 3 notices: ' + c3CountBefore + ' -> ' + c3CountAfter + ' (0 received)');

      // 5. Unknown pedestrian spitting
      const unkInc = store.triggerSpittingDetection('BPL-ICC-042', 88, null, null, null, 'UNKNOWN');
      results.push('Unknown offender citizenId: ' + unkInc.citizenId);
      const c1AfterUnk = store.challans.filter(c => c.citizenId === 'CIT-BPL-701').length;
      results.push('Citizen 1 notices after unknown: ' + c1AfterUnk + ' (Unchanged, 0 false fining)');

      // 6. View rendering check
      store.setActiveCitizen('CIT-BPL-701');
      store.setView('citizen-dashboard');
      const vp = document.getElementById('app-viewport');
      results.push('Personal Details card rendered: ' + vp.innerHTML.includes('Personal Details & Civic Profile'));
      results.push('Active Profile Switcher rendered: ' + vp.innerHTML.includes('citizen-account-switcher'));
      results.push('Edit Details button rendered: ' + vp.innerHTML.includes('edit-details-btn'));

      return JSON.stringify(results, null, 2);
    })()
"@

    $msg = @{
        id = 1
        method = "Runtime.evaluate"
        params = @{
            expression = $jsExpression
            returnByValue = $true
        }
    } | ConvertTo-Json -Compress

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
    $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
    $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

    # Read response
    $buffer = New-Object byte[] 65536
    $recvSegment = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)
    $recvResult = $ws.ReceiveAsync($recvSegment, $ct).Result
    $responseStr = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $recvResult.Count)

    $jsonResp = $responseStr | ConvertFrom-Json
    Write-Output "--- TEST RESULTS ---"
    Write-Output $jsonResp.result.result.value

    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct).Wait()
} finally {
    if ($chromeProcess -and -not $chromeProcess.HasExited) {
        Stop-Process -Id $chromeProcess.Id -Force
    }
}
