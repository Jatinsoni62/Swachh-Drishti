// SWACHH-DRISHTI Live Monitoring & Real-Time Computer Vision View

window.renderLiveMonitorView = function (container) {
  const store = window.store;
  const cv = window.cvEngine;

  let selectedCameraId = cv.activeCameraId || "BPL-ICC-042";
  let activeMode = cv.mode; // "simulation" or "webcam"

  function render() {
    const cam = store.cameras.find(c => c.id === selectedCameraId) || store.cameras[0];

    container.innerHTML = `
      <div class="live-monitor-container">
        
        <!-- Toolbar -->
        <div class="monitor-toolbar">
          <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="pulse-dot"></span>
              <strong style="font-size: 1.1rem; color: var(--slate-900);">Live Cleanliness Monitoring Feed</strong>
            </div>

            <!-- Ward & Camera Filters -->
            <div class="filter-group">
              <label class="filter-label">Ward:</label>
              <select class="filter-select" id="ward-filter-select">
                <option value="ALL">All Wards (Bhopal)</option>
                <option value="ward-12" selected>Ward 12 (New Market)</option>
                <option value="ward-5">Ward 5 (Old Bhopal / VIP)</option>
                <option value="ward-18">Ward 18 (Bittan Market)</option>
                <option value="ward-7">Ward 7 (Shahpura)</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Camera:</label>
              <select class="filter-select" id="camera-filter-select">
                ${store.cameras.map(c => `
                  <option value="${c.id}" ${c.id === selectedCameraId ? 'selected' : ''}>
                    ${c.id} - ${c.name.split('-')[1] || c.location} (${c.status})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Violation:</label>
              <select class="filter-select">
                <option value="spitting" selected>Gutkha/Paan Spitting</option>
                <option value="littering" disabled>Garbage Dumping (v2.0)</option>
              </select>
            </div>
          </div>

          <!-- Input Mode Switcher (Webcam vs Simulation) -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="monitor-mode-selector">
              <button class="mode-btn ${activeMode === 'simulation' ? 'active' : ''}" id="mode-btn-sim">
                CCTV Simulation Feed
              </button>
              <button class="mode-btn ${activeMode === 'webcam' ? 'active' : ''}" id="mode-btn-webcam" style="${activeMode === 'webcam' ? 'background: #047857; color: #ffffff;' : ''}">
                📹 Live Browser Webcam AI
              </button>
            </div>
          </div>
        </div>

        ${activeMode === 'webcam' ? `
          <!-- Helpful guidance card for real webcam testing -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">🎯</span>
              <div>
                <strong style="color: #065f46; font-size: 0.88rem;">Real-Time Webcam Spitting Detection Active:</strong>
                <span style="display: block; font-size: 0.8rem; color: #166534;">
                  Position your face in view. Lean forward or make a downward spitting gesture. When the <strong>Spit Motion Energy</strong> crosses the threshold, your real camera clip will be buffered and added to the Officer evidence docket!
                </span>
              </div>
            </div>

            <!-- Sensitivity selector -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #065f46;">Detection Sensitivity:</span>
              <select class="filter-select" id="sensitivity-select" style="background: #ffffff;">
                <option value="high" ${cv.sensitivity === 'high' ? 'selected' : ''}>High (Fast Response)</option>
                <option value="medium" ${cv.sensitivity === 'medium' ? 'selected' : ''}>Medium (Balanced)</option>
                <option value="low" ${cv.sensitivity === 'low' ? 'selected' : ''}>Low (Strict)</option>
              </select>
            </div>
          </div>
        ` : ''}

        <!-- Feeds Grid Layout -->
        <div class="feed-grid-layout">
          
          <!-- Primary Feed Viewport -->
          <div class="main-feed-card">
            <div class="feed-header-bar">
              <div class="feed-identity">
                <span class="camera-badge">${activeMode === 'webcam' ? 'LIVE-WEBCAM-01' : cam.id}</span>
                <span class="live-pill"><span class="dot"></span> LIVE</span>
                <span>${activeMode === 'webcam' ? 'Local User Console Camera (Real-Time)' : cam.location}</span>
                <span class="feed-label-tag">${cam.ward}</span>
              </div>
              <div style="font-family: monospace; font-size: 0.75rem; color: #94a3b8;">
                ${cam.fps} FPS • ${activeMode === 'simulation' ? 'SIMULATED STREAM' : 'ACTUAL WEBCAM STREAM'}
              </div>
            </div>

            <!-- Viewport Area -->
            <div class="feed-viewport" id="feed-viewport">
              <video id="live-video-el" class="feed-video-element" autoplay playsinline muted style="${activeMode === 'webcam' ? 'display: block;' : 'display: none;'}"></video>
              <canvas id="live-canvas-el" class="feed-canvas-element" width="640" height="360"></canvas>
              
              <!-- Feed mode watermark -->
              <div class="feed-sim-banner">
                ${activeMode === 'simulation' ? '● CCTV SIMULATION FEED (Ward 12 New Market)' : '● REAL-TIME OPTICAL MOTION SPITTING INFERENCE'}
              </div>
            </div>

            <!-- Telemetry Footer -->
            <div class="feed-footer-telemetry">
              <div class="telemetry-item">
                <span>PIPELINE:</span>
                <span class="telemetry-highlight">Luminance Grayscale → Vertical Velocity Vector → Spitting Classifier</span>
              </div>
              <div class="telemetry-item">
                <span>INFERENCE:</span>
                <span class="telemetry-value">30 FPS Smooth</span>
              </div>
              <div class="telemetry-item">
                <span>EVIDENCE:</span>
                <span style="color: #4ade80;">AUTO-BUFFERED ON DETECTION</span>
              </div>
            </div>
          </div>

          <!-- Secondary Control & Auxiliary Feeds -->
          <div class="cctv-secondary-panel">
            
            <!-- Real Camera Testing Card -->
            <div class="sim-controls-panel" style="border: 2px solid ${activeMode === 'webcam' ? 'var(--primary-700)' : 'var(--slate-200)'};">
              <div class="sim-controls-title">
                <span style="color: var(--primary-900);">Real Action Capture Controls</span>
                <span class="status-badge status-verified" style="font-size: 0.65rem;">Active</span>
              </div>

              ${activeMode === 'webcam' ? `
                <p style="font-size: 0.78rem; color: var(--slate-600); margin-bottom: 12px;">
                  Test live detection by leaning forward / spitting in front of your camera, or press the button below to immediately capture and buffer the current video frame as evidence:
                </p>

                <button class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.9rem; background: var(--red-600); margin-bottom: 10px;" onclick="window.triggerWebcamSpitNow()">
                  📸 Capture Real Spit Evidence Now
                </button>
              ` : `
                <p style="font-size: 0.75rem; color: var(--slate-600); margin-bottom: 10px;">
                  Demonstrate multi-stage behaviour filtering and false-positive elimination:
                </p>
                <div class="sim-btn-grid">
                  <button class="btn-sim" style="border-color: var(--red-500); color: var(--red-600);" onclick="window.triggerSimSpit()">
                    <span>🚨</span> Spitting on Road (Violation)
                  </button>
                  <button class="btn-sim" style="border-color: #10b981; color: #047857;" onclick="window.triggerSimDustbinSpit()">
                    <span>🗑️</span> Spit in Dustbin (Compliant - No Fine)
                  </button>
                  <button class="btn-sim" onclick="window.triggerSimDrinking()">
                    <span>🥤</span> Test Drinking Water
                  </button>
                  <button class="btn-sim" onclick="window.triggerSimNormal()">
                    <span>🚶</span> Normal Walking
                  </button>
                  <button class="btn-sim" onclick="window.openEvidenceModal('INC-2026-0842')">
                    <span>🔍</span> View Evidence #842
                  </button>
                </div>
              `}
            </div>

            <!-- Auxiliary Bhopal CCTV Thumbnails -->
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--slate-500); text-transform: uppercase; margin-top: 4px;">
              Auxiliary Cameras (Bhopal City)
            </div>

            ${store.cameras.filter(c => c.id !== selectedCameraId).slice(0, 3).map(aux => `
              <div class="cctv-sub-card" onclick="window.selectCameraFeed('${aux.id}')">
                <div class="cctv-sub-header">
                  <span style="font-family: monospace; color: var(--teal-700);">${aux.id}</span>
                  <span class="status-badge ${aux.status === 'ONLINE' ? 'status-verified' : (aux.status === 'DEGRADED' ? 'status-pending' : 'status-rejected')}">
                    ${aux.status}
                  </span>
                </div>
                <div class="cctv-sub-preview">
                  <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 0.75rem; font-family: monospace;">
                    <span>📹 ${aux.location}</span>
                  </div>
                </div>
              </div>
            `).join('')}

          </div>

        </div>

      </div>
    `;

    // Hook elements to CV engine
    const videoEl = document.getElementById("live-video-el");
    const canvasEl = document.getElementById("live-canvas-el");
    cv.attachElements(videoEl, canvasEl);
    cv.switchCamera(selectedCameraId);
    cv.start();

    // Mode Switchers
    document.getElementById("mode-btn-sim").onclick = () => {
      activeMode = "simulation";
      cv.setMode("simulation");
      render();
    };

    document.getElementById("mode-btn-webcam").onclick = () => {
      activeMode = "webcam";
      cv.setMode("webcam");
      render();
    };

    const sensitivitySelect = document.getElementById("sensitivity-select");
    if (sensitivitySelect) {
      sensitivitySelect.onchange = (e) => {
        cv.setSensitivity(e.target.value);
        if (window.showToast) window.showToast(`Sensitivity set to ${e.target.value.toUpperCase()}`);
      };
    }

    document.getElementById("camera-filter-select").onchange = (e) => {
      selectedCameraId = e.target.value;
      cv.switchCamera(selectedCameraId);
      render();
    };
  }

  render();
};

window.triggerWebcamSpitNow = function () {
  window.cvEngine.forceWebcamCapture();
};

window.selectCameraFeed = function (camId) {
  window.cvEngine.switchCamera(camId);
  window.renderLiveMonitorView(document.getElementById("app-viewport"));
};

window.triggerSimSpit = function () {
  window.cvEngine.simulateSpitting();
  if (window.showToast) window.showToast("🚨 Spitting gesture on pavement detected (87% confidence) - Violation Pending");
};

window.triggerSimDustbinSpit = function () {
  window.cvEngine.simulateSpitInDustbin();
};

window.triggerSimDrinking = function () {
  window.cvEngine.simulateDrinking();
  if (window.showToast) window.showToast("🥤 Filtered out: Hand near mouth detected as Drinking Water (False-Positive Prevented)");
};

window.triggerSimNormal = function () {
  window.cvEngine.simulateNormalWalk();
  if (window.showToast) window.showToast("🚶 Normal pedestrian movement tracked");
};

window.openCameraSimulation = function () {
  window.store.setView("live-monitor");
  setTimeout(() => window.triggerSimSpit(), 500);
};
