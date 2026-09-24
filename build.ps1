# SWACHH-DRISHTI Build Script
# Inlines all modular CSS and JavaScript files into a self-contained index.html
# This ensures zero 404 asset failures on Vercel, Netlify, or GitHub Pages.

$ErrorActionPreference = "Stop"

$cssFiles = @(
    "css/main.css",
    "css/dashboard.css",
    "css/live-monitor.css",
    "css/evidence.css",
    "css/hotspot.css"
)

$jsFiles = @(
    "js/data/mock-data.js",
    "js/logo-data.js",
    "js/store.js",
    "js/cv-engine.js",
    "js/views/landing.js",
    "js/views/login.js",
    "js/views/officer-dashboard.js",
    "js/views/head-dashboard.js",
    "js/views/live-monitor.js",
    "js/views/evidence-modal.js",
    "js/views/citizen-dashboard.js",
    "js/views/challan-view.js",
    "js/views/review-workflow.js",
    "js/views/hotspot-view.js",
    "js/views/audit-log.js",
    "js/views/incident-tracker.js",
    "js/views/train-camera.js",
    "js/app.js"
)

$cssContent = ""
foreach ($file in $cssFiles) {
    if (Test-Path $file) {
        $content = Get-Content -Raw -Encoding UTF8 $file
        $cssContent += "`n/* === File: $file === */`n" + $content + "`n"
    } else {
        Write-Warning "CSS file not found: $file"
    }
}

$jsContent = ""
foreach ($file in $jsFiles) {
    if (Test-Path $file) {
        $content = Get-Content -Raw -Encoding UTF8 $file
        $jsContent += "`n/* === File: $file === */`n" + $content + "`n"
    } else {
        Write-Warning "JS file not found: $file"
    }
}

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWACHH-DRISHTI — AI-Powered Civic Cleanliness Monitoring & Evidence-Assisted Enforcement</title>
  <meta name="description" content="AI-powered public cleanliness enforcement platform for Bhopal Municipal Corporation. Automated spitting detection, evidence packages, human verification, and zero auto-fining.">

  <!-- Typography: Inter font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <style>
$cssContent
  </style>
</head>
<body>

  <!-- Root Application Container -->
  <div id="app">
    <!-- Persistent Head Supervisory Banner (Visible when Head switches to Officer view) -->
    <div id="supervisory-banner-root"></div>

    <!-- Official Government Header -->
    <div id="gov-header-root"></div>

    <!-- Main Application Shell -->
    <div class="app-shell">
      <!-- Operational Navigation Sidebar -->
      <div id="app-sidebar-root"></div>

      <!-- Active Viewport Content Area -->
      <main id="app-viewport" class="app-viewport" role="main"></main>
    </div>

    <!-- Floating Toast Notification System -->
    <div id="toast-container" class="toast-container"></div>
  </div>

  <script>
$jsContent
  </script>
</body>
</html>
"@

Set-Content -Path "index.html" -Value $html -Encoding UTF8
Write-Host "Successfully compiled self-contained index.html"
