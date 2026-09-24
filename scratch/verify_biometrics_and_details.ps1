# Verify Biometric Isolation, Personal Details & Targeted Challan Routing in headless Chrome
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

$testScript = @"
(function() {
  const results = [];
  const log = (msg, pass) => results.push((pass ? 'PASS: ' : 'FAIL: ') + msg);

  try {
    const store = window.store;
    if (!store) {
      return ['FAIL: window.store not found'];
    }

    // 1. Verify default citizens are distinct
    const c1 = store.registeredCitizens[0];
    const c2 = store.registeredCitizens[1];
    const c3 = store.registeredCitizens[2];

    log('Citizen 1 is ' + c1.name + ' (' + c1.id + ')', c1.id === 'CIT-BPL-701');
    log('Citizen 2 is ' + c2.name + ' (' + c2.id + ')', c2.id === 'CIT-BPL-702');
    log('Citizen 3 is ' + c3.name + ' (' + c3.id + ')', c3.id === 'CIT-BPL-703');

    // 2. Test isolated photo update
    const samplePhoto1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    store.updateCitizenDetails('CIT-BPL-701', { facePhoto: samplePhoto1, faceRegistered: true });

    log('Citizen 1 photo updated', store.registeredCitizens[0].facePhoto === samplePhoto1);
    log('Citizen 2 photo remains null (ISOLATION CHECK)', store.registeredCitizens[1].facePhoto === null);
    log('Citizen 3 photo remains null (ISOLATION CHECK)', store.registeredCitizens[2].facePhoto === null);

    // 3. Test Personal Details update on Citizen 2
    store.updateCitizenDetails('CIT-BPL-702', {
      address: 'House No. 55, VIP Road, Karbala, Bhopal',
      vehicleNumber: 'MP-04-ZZ-9999',
      emergencyContact: '+91 94250 99999'
    });
    log('Citizen 2 address updated', store.registeredCitizens[1].address.includes('House No. 55'));
    log('Citizen 2 vehicle updated', store.registeredCitizens[1].vehicleNumber === 'MP-04-ZZ-9999');
    log('Citizen 1 vehicle unchanged', store.registeredCitizens[0].vehicleNumber !== 'MP-04-ZZ-9999');

    // 4. Test Strict Facial Biometric Matching & Targeted Challan Routing
    // Count initial challans for C1 and C2
    const initC1Challans = store.challans.filter(c => c.citizenId === 'CIT-BPL-701').length;
    const initC2Challans = store.challans.filter(c => c.citizenId === 'CIT-BPL-702').length;
    const initC3Challans = store.challans.filter(c => c.citizenId === 'CIT-BPL-703').length;

    // Spitting event where Person matching Citizen 1's photo spits
    const inc1 = store.triggerSpittingDetection('BPL-ICC-042', 95, null, samplePhoto1, null, 'CIT-BPL-701');
    log('Spitting inc1 issued challan to Citizen 1', inc1.citizenId === 'CIT-BPL-701');

    const newC1Challans = store.challans.filter(c => c.citizenId === 'CIT-BPL-701').length;
    const newC2Challans = store.challans.filter(c => c.citizenId === 'CIT-BPL-702').length;
    const newC3Challans = store.challans.filter(c => c.citizenId === 'CIT-BPL-703').length;

    log('Citizen 1 received exactly +1 challan', newC1Challans === initC1Challans + 1);
    log('Citizen 2 received 0 challans (STRICT ZERO FALSE FINING)', newC2Challans === initC2Challans);
    log('Citizen 3 received 0 challans (STRICT ZERO FALSE FINING)', newC3Challans === initC3Challans);

    // Test Unregistered Pedestrian spitting
    const incUnknown = store.triggerSpittingDetection('BPL-ICC-042', 88, null, null, null, 'UNKNOWN');
    log('Unknown pedestrian incident has null citizenId', incUnknown.citizenId === null);
    log('Unknown pedestrian incident flagged as Unregistered Pedestrian', incUnknown.offenderName === 'Unregistered Pedestrian');

    const afterUnknownC1 = store.challans.filter(c => c.citizenId === 'CIT-BPL-701').length;
    log('Citizen 1 received ZERO fines from unknown pedestrian', afterUnknownC1 === newC1Challans);

    // 5. Test Citizen Dashboard View rendering
    store.setActiveCitizen('CIT-BPL-701');
    store.setView('citizen-dashboard');
    const viewport = document.getElementById('app-viewport');
    log('Citizen dashboard rendered', viewport.innerHTML.includes('Personal Details & Civic Profile'));
    log('Citizen dashboard shows active switcher', viewport.innerHTML.includes('citizen-account-switcher'));
    log('Citizen dashboard shows edit button', viewport.innerHTML.includes('edit-details-btn'));

    // Switch to Citizen 2 and check rendered details
    store.setActiveCitizen('CIT-BPL-702');
    window.renderCitizenDashboardView(viewport);
    log('Citizen dashboard switched to Citizen 2', viewport.innerHTML.includes('Rajesh Kumar Verma'));
    log('Citizen 2 shows updated vehicle MP-04-ZZ-9999', viewport.innerHTML.includes('MP-04-ZZ-9999'));

    return results;
  } catch (err) {
    return ['ERROR: ' + err.message + '\n' + err.stack];
  }
})()
"@

$encodedScript = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($testScript))

# Run chrome headless with remote debugging to execute the script
$chromeProcess = Start-Process -FilePath $chromePath -ArgumentList @(
    "--headless=new",
    "--remote-debugging-port=9223",
    "--disable-gpu",
    "http://localhost:8080/"
) -PassThru

Start-Sleep -Seconds 2

try {
    # Query DevTools HTTP endpoint for page target
    $targets = Invoke-RestMethod -Uri "http://localhost:9223/json"
    $page = $targets | Where-Object { $_.type -eq "page" } | Select-Object -First 1

    if ($page) {
        # Connect via WebSocket and evaluate
        # Using a quick node or powershell script to evaluate
        Write-Output "Page found: $($page.url)"
    }
} finally {
    if ($chromeProcess -and -not $chromeProcess.HasExited) {
        Stop-Process -Id $chromeProcess.Id -Force
    }
}
