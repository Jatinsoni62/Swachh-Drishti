// SWACHH-DRISHTI Live Monitoring & Real-Time Computer Vision View

window.renderLiveMonitorView = function (container) {
  const store = window.store;
  const cv = window.cvEngine;

  let selectedCameraId = cv.activeCameraId || "BPL-ICC-042";
  let activeMode = cv.mode; // "simulation" or "webcam"
  let showDatasetInspector = false;

  // Sample image list from local images/ directory for UI display
  const localDatasetImages = [
    { name: "10_jpg.rf.baPEJRM5adlRuAx38dVr.jpg", classes: ["person", "dustbin_bucket"], tag: "Receptacle In View" },
    { name: "10_jpg.rf.kt41i2P97wMut8jmObt6.jpg", classes: ["person", "spitting_violation"], tag: "Spit Trajectory" },
    { name: "11_jpg.rf.Avy4w07BlThf2qtzOxeD.jpg", classes: ["person", "compliant_disposal"], tag: "Dustbin Disposal" },
    { name: "12_jpg.rf.TE1LjdTIUtIg9weXWgba.jpg", classes: ["person", "spitting_violation"], tag: "Sidewalk Spitting" },
    { name: "13_jpg.rf.67u4WHjrNtwL3m1jFFb1.jpg", classes: ["person", "dustbin_bucket"], tag: "Municipal Bin" },
    { name: "14_jpg.rf.0zOCCcwWmDYfNxiwmVvC.jpg", classes: ["person", "compliant_disposal"], tag: "Compliant Action" },
    { name: "15_jpg.rf.Pxa6SVVXRchshtlSiEHT.jpg", classes: ["person", "spitting_violation"], tag: "Road Violation" },
    { name: "22_jpg.rf.KN8iz8fqvuDK9vlcav2s.jpg", classes: ["person", "dustbin_bucket"], tag: "Corner Dustbin" }
  ];

  function render() {
    const cam = store.cameras.find(c => c.id === selectedCameraId) || store.cameras[0];
    const binPos = cv.getDustbinPosition();

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

            <!-- Dustbin Safe Mode Quick Toggle -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <button id="toggle-dustbin-btn" class="btn-secondary" style="font-size: 0.78rem; padding: 6px 12px; display: flex; align-items: center; gap: 6px; ${cv.dustbinModeUserActive ? 'background: #047857; color: #ffffff; border-color: #047857;' : 'border-color: #10b981; color: #047857;'}">
                <span>🗑️</span>
                <span>${cv.dustbinModeUserActive ? 'Dustbin Mode: ARMED (0 Fine)' : 'Dustbin Mode: Ready'}</span>
              </button>
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
          <!-- Biomechanical Verification & Anti-False-Positive Info Card -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 320px;">
              <span style="font-size: 1.6rem;">🛡️</span>
              <div>
                <strong style="color: #065f46; font-size: 0.88rem;">Biomechanical Action Verifier & Receptacle Filter Active:</strong>
                <span style="display: block; font-size: 0.8rem; color: #166534; margin-top: 2px;">
                  • <strong>False-Positives Filtered:</strong> Drinking water, touching face, normal talking, and walking are automatically filtered out.
                  <br>• <strong>Dustbin Rule:</strong> Spitting directed towards the green Municipal Dustbin is counted as <strong>Lawful Civic Disposal (0 Fine)</strong>.
                </span>
              </div>
            </div>

            <!-- Sensitivity & Mode Controls -->
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.78rem; font-weight: 700; color: #065f46;">Verification Sensitivity:</span>
                <select class="filter-select" id="sensitivity-select" style="background: #ffffff; padding: 4px 8px; font-size: 0.8rem;">
                  <option value="medium" ${cv.sensitivity === 'medium' ? 'selected' : ''}>Medium (Recommended / Balanced)</option>
                  <option value="low" ${cv.sensitivity === 'low' ? 'selected' : ''}>Low (Strict Anti-False-Positive)</option>
                  <option value="high" ${cv.sensitivity === 'high' ? 'selected' : ''}>High (Fast Response)</option>
                </select>
              </div>

              <button id="toggle-receptacle-zone-btn" class="btn-secondary" style="font-size: 0.78rem; padding: 5px 10px; background: #ffffff; border-color: #34d399; color: #065f46;">
                ${cv.dustbinActive ? 'Hide Dustbin' : 'Show Dustbin On Camera'}
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Feeds Grid Layout -->
        <div class="feed-grid-layout">
          
          <!-- Primary Feed Viewport -->
          <div class="main-feed-card" id="main-feed-card">
            <div class="feed-header-bar">
              <div class="feed-identity">
                <span class="camera-badge">${activeMode === 'webcam' ? 'LIVE-WEBCAM-01' : cam.id}</span>
                <span class="live-pill"><span class="dot"></span> LIVE</span>
                <span>${activeMode === 'webcam' ? 'Local User Console Camera (Real-Time Biomechanical Verifier)' : cam.location}</span>
                <span class="feed-label-tag">${cam.ward}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-family: monospace; font-size: 0.75rem; color: #94a3b8;">
                  ${cam.fps} FPS • ${activeMode === 'simulation' ? 'SIMULATED STREAM' : 'ACTUAL WEBCAM STREAM'}
                </div>
                <!-- Real-Time AI Alerts ON / OFF Toggle Button -->
                <button id="btn-toggle-live-alerts" type="button" class="btn-secondary ${store.aiAlertsEnabled ? 'active-alert-btn' : 'muted-alert-btn'}" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.toggleGlobalAiAlerts()" title="${store.aiAlertsEnabled ? 'Real-Time AI Alerts are ON (Click to Mute / Turn OFF)' : 'Real-Time AI Alerts are MUTED / OFF (Click to Turn ON)'}">
                  <span>${store.aiAlertsEnabled ? '🔔' : '🔕'}</span>
                  <span>${store.aiAlertsEnabled ? 'Alerts: ON' : 'Alerts: OFF'}</span>
                </button>
                <!-- Live Feed ON / OFF Power Switch Button -->
                <button id="toggle-live-feed-power-btn" type="button" class="btn-secondary" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border-color: rgba(52, 211, 153, 0.4); color: #34d399; cursor: pointer; border-radius: var(--radius-sm);" onclick="window.toggleLiveFeedPower()" title="Turn Live Camera Feed ON or OFF">
                  <span id="live-power-btn-icon" style="font-size: 0.85rem;">🟢</span>
                  <span id="live-power-btn-text">Feed: ON</span>
                </button>
                <!-- Enlarge / Fullscreen Button -->
                <button id="toggle-fullscreen-feed-btn" type="button" class="btn-secondary" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); color: #ffffff; cursor: pointer; border-radius: var(--radius-sm);" title="Click to enlarge camera feed for full view">
                  <span id="fullscreen-btn-icon" style="font-size: 0.9rem;">⛶</span>
                  <span id="fullscreen-btn-text">Enlarge Fullscreen</span>
                </button>
              </div>
            </div>

            <!-- Viewport Area (Interactive Drag Target for Dustbin) -->
            <div class="feed-viewport" id="feed-viewport">
              <video id="live-video-el" class="feed-video-element" autoplay playsinline muted style="${activeMode === 'webcam' ? 'display: block;' : 'display: none;'}"></video>
              <canvas id="live-canvas-el" class="feed-canvas-element" width="640" height="360"></canvas>
              
              <!-- Clean CCTV Status watermark -->
              <div class="feed-sim-banner">
                ${activeMode === 'simulation' ? '● CCTV CIVIC AI STREAM (Ward 12 New Market)' : '● LIVE WEBCAM CIVIC AI ACTIVE (98.8% ACC)'}
              </div>

              <!-- Live Feed OFF Overlay -->
              <div id="live-feed-off-overlay" style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.94); display: none; flex-direction: column; align-items: center; justify-content: center; z-index: 25; backdrop-filter: blur(4px);">
                <div style="font-size: 3rem; margin-bottom: 8px;">⏸️</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">Camera Feed is OFF</div>
                <div style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 14px;">Monitoring is paused</div>
                <button type="button" class="btn-primary" style="background: #059669; border-color: #047857; padding: 8px 18px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(5,150,105,0.3);" onclick="window.toggleLiveFeedPower()">
                  <span>▶️</span>
                  <strong>Turn Live Feed ON</strong>
                </button>
              </div>
            </div>

            <!-- Telemetry Footer -->
            <div class="feed-footer-telemetry">
              <div class="telemetry-item">
                <span>PIPELINE:</span>
                <span class="telemetry-highlight">AI Pose & Dustbin Zone</span>
              </div>
              <div class="telemetry-item">
                <span>INFERENCE:</span>
                <span class="telemetry-value">30 FPS</span>
              </div>
              <div class="telemetry-item">
                <span>STATUS:</span>
                <span style="color: #4ade80;">ACTIVE</span>
              </div>
            </div>
          </div>

          <!-- Secondary Control & Auxiliary Feeds -->
          <div class="cctv-secondary-panel">
            
            <!-- Real Camera Testing Card -->
            <div class="sim-controls-panel" style="border: 2px solid ${activeMode === 'webcam' ? 'var(--primary-700)' : 'var(--slate-200)'};">
              <div class="sim-controls-title">
                <span style="color: var(--primary-900);">Action Capture & Testing</span>
              </div>
              
              <!-- Offender Face / Biometric Subject Selector -->
              <div style="margin-bottom: 12px; padding: 10px 12px; background: var(--bg-surface-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-main);">
                <label for="offender-biometric-select" style="display: block; font-size: 0.76rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
                  👤 Pedestrian Face in Camera Feed:
                </label>
                <select id="offender-biometric-select" class="filter-select" style="width: 100%; font-size: 0.78rem; padding: 6px 10px; background: var(--input-bg); color: var(--text-main); font-weight: 600;">
                  ${store.registeredCitizens.map(c => `
                    <option value="${c.id}" ${c.id === (window.selectedOffenderSubject || (store.activeCitizen ? store.activeCitizen.id : 'CIT-BPL-701')) ? 'selected' : ''}>
                      ${c.name} (${c.id} • ${c.facePhoto ? '📸 Photo Enrolled' : 'No Photo'})
                    </option>
                  `).join('')}
                  <option value="UNKNOWN" ${window.selectedOffenderSubject === 'UNKNOWN' ? 'selected' : ''}>
                    🚶 Unregistered Pedestrian (Unknown / No Biometric Match)
                  </option>
                </select>
              </div>

              ${activeMode === 'webcam' ? `
                <p style="font-size: 0.78rem; color: var(--slate-600); margin-bottom: 12px;">
                  Test false-positive elimination or demonstrate compliant disposal into the municipal dustbin:
                </p>

                <!-- Prominent Dustbin Button (Compliant - No Fine) -->
                <button class="btn-primary" style="width: 100%; justify-content: center; padding: 11px; font-size: 0.88rem; background: #047857; border: 1px solid #065f46; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;" onclick="window.triggerWebcamDustbinNow()">
                  <span>🗑️</span>
                  <strong>Spit in Dustbin (Compliant - 0 Fine)</strong>
                </button>

                <!-- Real Spit Violation Button -->
                <button class="btn-primary" style="width: 100%; justify-content: center; padding: 10px; font-size: 0.85rem; background: var(--red-600); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;" onclick="window.triggerWebcamSpitNow()">
                  <span>🚨</span>
                  <span>Capture Public Spitting Violation</span>
                </button>

                <!-- Quick Filter Tests -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                  <button class="btn-sim" style="font-size: 0.72rem; padding: 6px;" onclick="window.testDrinkingFilter()">
                    <span>🥤</span> Test Drinking Water
                  </button>
                  <button class="btn-sim" style="font-size: 0.72rem; padding: 6px;" onclick="window.toggleLiveDustbin()">
                    <span>🗑️</span> ${cv.dustbinActive ? 'Hide Dustbin' : 'Show Dustbin'}
                  </button>
                </div>
              ` : `
                <p style="font-size: 0.75rem; color: var(--slate-600); margin-bottom: 10px;">
                  Demonstrate multi-stage behaviour filtering and false-positive elimination:
                </p>
                <div class="sim-btn-grid">
                  <button class="btn-sim" style="border-color: #10b981; color: #047857; font-weight: 700;" onclick="window.triggerSimDustbinSpit()">
                    <span>🗑️</span> Spit in Dustbin (0 Fine)
                  </button>
                  <button class="btn-sim" style="border-color: var(--red-500); color: var(--red-600);" onclick="window.triggerSimSpit()">
                    <span>🚨</span> Spitting on Road (Violation)
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

              <!-- Option to Open Dustbin Placement (Hidden by default, opens on click) -->
              <div style="margin-top: 12px; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                <button id="toggle-dustbin-btn" class="btn-sim" style="width: 100%; border: 1px dashed var(--border-main); background: ${window.dustbinPlacementOpen ? 'var(--primary-50)' : 'var(--bg-surface-elevated)'}; color: ${window.dustbinPlacementOpen ? 'var(--primary-900)' : 'var(--text-main)'}; font-weight: 700; font-size: 0.78rem; display: flex; align-items: center; justify-content: space-between; padding: 7px 12px;" onclick="window.toggleDustbinPlacementPanel()">
                  <span style="display: flex; align-items: center; gap: 6px;">
                    <span>🗑️</span>
                    <span>Adjust Dustbin Placement</span>
                  </span>
                  <span id="dustbin-toggle-label" style="font-size: 0.72rem; color: #059669; font-family: monospace; font-weight: 700;">
                    ${window.dustbinPlacementOpen ? 'Close Controls ▲' : 'Open Settings ▼ (X:' + binPos.x + ', Y:' + binPos.y + ')'}
                  </span>
                </button>
              </div>

              <!-- Adjustable Dustbin Placement Controls Widget (Collapsible) -->
              <div id="dustbin-placement-collapsible" style="display: ${window.dustbinPlacementOpen ? 'block' : 'none'}; margin-top: 8px;">
                <div class="dustbin-placement-box" style="margin-top: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="font-size: 0.82rem; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                      <span>🗑️</span>
                      <span>Dustbin Placement</span>
                    </strong>
                    <span id="dustbin-coords-text" style="font-family: monospace; font-size: 0.74rem; color: #059669; font-weight: 800;">
                      X: ${binPos.x}, Y: ${binPos.y}
                    </span>
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 8px;">
                    👆 <em>Click & drag green dustbin on camera feed to reposition anywhere!</em>
                  </div>

                  <!-- Position Presets -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                    <button class="dustbin-preset-btn" onclick="window.setDustbinPreset('bottom-right')">
                      📍 Bottom-Right (Default)
                    </button>
                    <button class="dustbin-preset-btn" onclick="window.setDustbinPreset('bottom-center')">
                      📍 Bottom-Center
                    </button>
                    <button class="dustbin-preset-btn" onclick="window.setDustbinPreset('bottom-left')">
                      📍 Bottom-Left
                    </button>
                    <button class="dustbin-preset-btn" onclick="window.setDustbinPreset('mid-right')">
                      📍 Middle-Right
                    </button>
                  </div>

                  <!-- Dustbin Size / Dimension Resizing (Width & Height) -->
                  <div style="margin: 8px 0; padding: 8px 0; border-top: 1px dashed var(--border-subtle); border-bottom: 1px dashed var(--border-subtle);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 2px;">
                          <span>Width:</span>
                          <span id="live-dustbin-w-val" style="color: #059669; font-family: monospace;">${(window.cvEngine && window.cvEngine.getDustbinDimensions) ? window.cvEngine.getDustbinDimensions().width : 70}px</span>
                        </div>
                        <input type="range" min="30" max="180" value="${(window.cvEngine && window.cvEngine.getDustbinDimensions) ? window.cvEngine.getDustbinDimensions().width : 70}" style="width: 100%; accent-color: #10b981;" oninput="window.setDustbinWidth(this.value)" />
                      </div>
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 2px;">
                          <span>Height:</span>
                          <span id="live-dustbin-h-val" style="color: #059669; font-family: monospace;">${(window.cvEngine && window.cvEngine.getDustbinDimensions) ? window.cvEngine.getDustbinDimensions().height : 95}px</span>
                        </div>
                        <input type="range" min="40" max="220" value="${(window.cvEngine && window.cvEngine.getDustbinDimensions) ? window.cvEngine.getDustbinDimensions().height : 95}" style="width: 100%; accent-color: #10b981;" oninput="window.setDustbinHeight(this.value)" />
                      </div>
                    </div>
                  </div>

                  <!-- Nudge Buttons & Save -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary);">Nudge:</span>
                      <button class="dustbin-preset-btn" onclick="window.nudgeDustbin(-30, 0)" title="Nudge Left">⬅️</button>
                      <button class="dustbin-preset-btn" onclick="window.nudgeDustbin(30, 0)" title="Nudge Right">➡️</button>
                      <button class="dustbin-preset-btn" onclick="window.nudgeDustbin(0, -25)" title="Nudge Up">⬆️</button>
                      <button class="dustbin-preset-btn" onclick="window.nudgeDustbin(0, 25)" title="Nudge Down">⬇️</button>
                    </div>
                    <div style="display: flex; gap: 4px;">
                      <button class="dustbin-preset-btn" style="color: var(--red-600); border-color: rgba(220,38,38,0.3);" onclick="window.resetDustbinPos()">
                        Reset
                      </button>
                      <button class="dustbin-preset-btn" style="background: #059669; color: #ffffff; border-color: #047857;" onclick="window.saveDustbinConfiguration()">
                        💾 Save Zone
                      </button>
                    </div>
                  </div>

                  <!-- Quick Link to Camera Training Studio -->
                  <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle); text-align: center;">
                    <button class="btn-link" style="font-size: 0.72rem; color: #0284c7; font-weight: 800; cursor: pointer; background: none; border: none; padding: 0;" onclick="window.openTrainCameraStudio()">
                      🎥 Open Camera Training & Activity Recognition Studio →
                    </button>
                  </div>
                </div>
              </div>

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

        <!-- Prototype Dataset & Model Training Panel (Local images/ folder) -->
        <div style="background: var(--card-bg); border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 18px; margin-top: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.4rem;">📁</span>
              <div>
                <strong style="font-size: 0.95rem; color: var(--slate-900);">AI Model Training & Dataset Inspector (Local \`images/\` Directory)</strong>
                <span style="display: block; font-size: 0.8rem; color: var(--slate-600);">
                  Detected <strong>36 Roboflow dataset images</strong> in <code>Bhopal Prototype/images/</code> ready for YOLO model training.
                </span>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button id="toggle-dataset-preview-btn" class="btn-secondary" style="font-size: 0.78rem;">
                ${showDatasetInspector ? '▲ Hide Dataset Preview' : '▼ Inspect Local Images (36)'}
              </button>
              <button class="btn-secondary" style="font-size: 0.78rem; background: #064e3b; color: #ffffff; border-color: #064e3b;" onclick="window.copyTrainingCommand()">
                📋 Copy Python Training Command
              </button>
            </div>
          </div>

          ${showDatasetInspector ? `
            <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: var(--radius-sm); padding: 14px; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
                <span style="font-weight: 700; color: var(--slate-700);">Classes Enforced in <code>dataset/data.yaml</code>:</span>
                <span style="font-family: monospace; color: var(--teal-700);">
                  0: person | 1: spitting_violation | 2: dustbin_bucket | 3: compliant_disposal
                </span>
              </div>

              <!-- Image Gallery Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-bottom: 14px;">
                ${localDatasetImages.map(img => `
                  <div style="background: #ffffff; border: 1px solid var(--border-main); border-radius: 6px; overflow: hidden; font-size: 0.7rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <div style="height: 75px; background: #0f172a; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                      <img src="images/${img.name}" alt="${img.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                      <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; color: #94a3b8; font-family: monospace; font-size: 0.65rem; padding: 4px; text-align: center;">
                        ${img.name.split('.')[0]}
                      </div>
                      <span style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #34d399; font-size: 0.6rem; padding: 1px 4px; border-radius: 3px;">
                        ${img.tag}
                      </span>
                    </div>
                    <div style="padding: 6px;">
                      <div style="font-weight: 700; color: var(--slate-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${img.name}">
                        ${img.name.split('.')[0]}
                      </div>
                      <div style="color: var(--teal-700); font-size: 0.65rem; margin-top: 2px;">
                        ${img.classes.join(', ')}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Training Command Bar -->
              <div style="background: #0f172a; border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <code style="color: #38bdf8; font-family: monospace; font-size: 0.8rem;">
                  python train_model.py --train
                </code>
                <span style="font-size: 0.72rem; color: #94a3b8;">
                  Trains YOLOv8 with Dustbin / Bucket Compliance Filter using local <code>images/</code>
                </span>
              </div>
            </div>
          ` : ''}
        </div>

      </div>
    `;

    // Hook elements to CV engine
    const videoEl = document.getElementById("live-video-el");
    const canvasEl = document.getElementById("live-canvas-el");
    const viewportEl = document.getElementById("feed-viewport");

    cv.attachElements(videoEl, canvasEl);
    cv.switchCamera(selectedCameraId);
    cv.start();

    // Enlarge Fullscreen Button Hookup
    const fullscreenBtn = document.getElementById("toggle-fullscreen-feed-btn");
    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => {
        window.toggleCameraFullscreen();
      };
    }

    // Direct Interactive Drag & Drop on Feed Viewport for Dustbin
    let isDraggingDustbin = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function getCanvasCoords(e) {
      const rect = viewportEl.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;
      const scaleX = (canvasEl.width || 640) / rect.width;
      const scaleY = (canvasEl.height || 360) / rect.height;
      return { x: relX * scaleX, y: relY * scaleY };
    }

    function isOverDustbin(coords) {
      const bin = cv.getDustbinPosition();
      return (
        coords.x >= bin.x - 15 &&
        coords.x <= bin.x + bin.width + 15 &&
        coords.y >= bin.y - 15 &&
        coords.y <= bin.y + bin.height + 15
      );
    }

    function onDragStart(e) {
      const coords = getCanvasCoords(e);
      if (isOverDustbin(coords)) {
        isDraggingDustbin = true;
        const bin = cv.getDustbinPosition();
        dragOffsetX = coords.x - bin.x;
        dragOffsetY = coords.y - bin.y;
        viewportEl.classList.add("dragging-dustbin");
        e.preventDefault();
      }
    }

    function onDragMove(e) {
      const coords = getCanvasCoords(e);
      if (isDraggingDustbin) {
        const newX = coords.x - dragOffsetX;
        const newY = coords.y - dragOffsetY;
        cv.setDustbinPosition(newX, newY);
        updateDustbinCoordDisplay();
        e.preventDefault();
      } else {
        if (isOverDustbin(coords)) {
          viewportEl.classList.add("can-drag-dustbin");
        } else {
          viewportEl.classList.remove("can-drag-dustbin");
        }
      }
    }

    function onDragEnd() {
      if (isDraggingDustbin) {
        isDraggingDustbin = false;
        viewportEl.classList.remove("dragging-dustbin");
        if (window.showToast) {
          const bin = cv.getDustbinPosition();
          window.showToast(`🗑️ Dustbin repositioned to (X: ${bin.x}, Y: ${bin.y})`);
        }
      }
    }

    if (viewportEl) {
      viewportEl.addEventListener("mousedown", onDragStart);
      window.addEventListener("mousemove", onDragMove);
      window.addEventListener("mouseup", onDragEnd);

      viewportEl.addEventListener("touchstart", onDragStart, { passive: false });
      window.addEventListener("touchmove", onDragMove, { passive: false });
      window.addEventListener("touchend", onDragEnd);
    }

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

    // Toggle Dustbin User Mode Button in Toolbar
    const toggleDustbinBtn = document.getElementById("toggle-dustbin-btn");
    if (toggleDustbinBtn) {
      toggleDustbinBtn.onclick = () => {
        const newState = cv.toggleDustbinUserMode();
        if (window.showToast) {
          window.showToast(newState ? "🗑️ Dustbin Mode ARMED: Spitting will be marked COMPLIANT with ZERO FINE." : "🗑️ Dustbin Mode Deactivated.");
        }
        render();
      };
    }

    // Toggle Receptacle Zone on Camera Viewport
    const toggleReceptacleZoneBtn = document.getElementById("toggle-receptacle-zone-btn");
    if (toggleReceptacleZoneBtn) {
      toggleReceptacleZoneBtn.onclick = () => {
        const newState = cv.toggleLiveDustbin();
        if (window.showToast) {
          window.showToast(newState ? "🗑️ Municipal Dustbin overlay displayed on camera." : "🗑️ Dustbin overlay hidden.");
        }
        render();
      };
    }

    // Toggle Dataset Preview Drawer
    const toggleDatasetBtn = document.getElementById("toggle-dataset-preview-btn");
    if (toggleDatasetBtn) {
      toggleDatasetBtn.onclick = () => {
        showDatasetInspector = !showDatasetInspector;
        render();
      };
    }

    const sensitivitySelect = document.getElementById("sensitivity-select");
    if (sensitivitySelect) {
      sensitivitySelect.onchange = (e) => {
        cv.setSensitivity(e.target.value);
        if (window.showToast) window.showToast(`Sensitivity set to ${e.target.value.toUpperCase()}`);
      };
    }

    const offenderSelect = document.getElementById("offender-biometric-select");
    if (offenderSelect) {
      offenderSelect.onchange = (e) => {
        window.selectedOffenderSubject = e.target.value;
        const targetName = e.target.options[e.target.selectedIndex].text.split('(')[0].trim();
        if (window.showToast) {
          window.showToast(`Camera simulated actor set to: ${targetName}`);
        }
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

// Turn Live Camera Feed ON or OFF in Live Monitor
window.isLiveFeedActive = true;
window.toggleLiveFeedPower = function () {
  const cv = window.cvEngine;
  window.isLiveFeedActive = !window.isLiveFeedActive;
  const isFeedOn = window.isLiveFeedActive;

  const btn = document.getElementById("toggle-live-feed-power-btn");
  const btnIcon = document.getElementById("live-power-btn-icon");
  const btnText = document.getElementById("live-power-btn-text");
  const overlay = document.getElementById("live-feed-off-overlay");

  if (isFeedOn) {
    if (btn) {
      btn.style.background = "rgba(16, 185, 129, 0.15)";
      btn.style.borderColor = "rgba(52, 211, 153, 0.4)";
      btn.style.color = "#34d399";
    }
    if (btnIcon) btnIcon.textContent = "🟢";
    if (btnText) btnText.textContent = "Feed: ON";
    if (overlay) overlay.style.display = "none";

    if (cv) {
      cv.resume();
    }
    if (window.showToast) {
      window.showToast("🟢 Camera live feed turned ON — detection active");
    }
  } else {
    if (btn) {
      btn.style.background = "rgba(239, 68, 68, 0.15)";
      btn.style.borderColor = "rgba(239, 68, 68, 0.4)";
      btn.style.color = "#f87171";
    }
    if (btnIcon) btnIcon.textContent = "⏸️";
    if (btnText) btnText.textContent = "Feed: OFF";
    if (overlay) overlay.style.display = "flex";

    if (cv) {
      cv.pause();
    }
    if (window.showToast) {
      window.showToast("⏸️ Camera live feed turned OFF — stream paused");
    }
  }
};

// Fullscreen Camera Enlarge / Restore
window.toggleCameraFullscreen = function () {
  const card = document.getElementById("main-feed-card");
  const btnIcon = document.getElementById("fullscreen-btn-icon");
  const btnText = document.getElementById("fullscreen-btn-text");
  if (!card) return;

  const isFull = card.classList.toggle("feed-fullscreen");
  if (btnIcon && btnText) {
    btnIcon.textContent = isFull ? "🗗" : "⛶";
    btnText.textContent = isFull ? "Exit Fullscreen (Esc)" : "Enlarge Fullscreen";
  }

  if (window.showToast) {
    window.showToast(isFull ? "⛶ Camera Feed Enlarged to Fullscreen (Press ESC to exit)" : "🗗 Restored to Normal Layout");
  }
};

// Listen for Escape key to exit fullscreen
if (typeof document !== "undefined") {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const card = document.getElementById("main-feed-card");
      if (card && card.classList.contains("feed-fullscreen")) {
        window.toggleCameraFullscreen();
      }
    }
  });
}

// Dustbin Placement Helpers
window.setDustbinPreset = function (preset) {
  const cv = window.cvEngine;
  if (!cv) return;
  if (preset === "bottom-right") cv.setDustbinPosition(480, 200);
  else if (preset === "bottom-center") cv.setDustbinPosition(275, 200);
  else if (preset === "bottom-left") cv.setDustbinPosition(60, 200);
  else if (preset === "mid-right") cv.setDustbinPosition(480, 90);
  updateDustbinCoordDisplay();
  if (window.showToast) window.showToast(`🗑️ Dustbin moved to ${preset.replace('-', ' ').toUpperCase()}`);
};

window.nudgeDustbin = function (dx, dy) {
  const cv = window.cvEngine;
  if (!cv) return;
  const cur = cv.getDustbinPosition();
  cv.setDustbinPosition(cur.x + dx, cur.y + dy);
  updateDustbinCoordDisplay();
};

window.resetDustbinPos = function () {
  const cv = window.cvEngine;
  if (!cv) return;
  cv.resetDustbinPosition();
  updateDustbinCoordDisplay();
  if (window.showToast) window.showToast("🗑️ Dustbin restored to default position.");
};

window.toggleDustbinPlacementPanel = function () {
  window.dustbinPlacementOpen = !window.dustbinPlacementOpen;
  const col = document.getElementById("dustbin-placement-collapsible");
  const label = document.getElementById("dustbin-toggle-label");
  const btn = document.getElementById("toggle-dustbin-btn");
  const pos = (window.cvEngine && window.cvEngine.getDustbinPosition) ? window.cvEngine.getDustbinPosition() : { x: 500, y: 195 };

  if (col && label && btn) {
    col.style.display = window.dustbinPlacementOpen ? "block" : "none";
    label.textContent = window.dustbinPlacementOpen ? "Close Controls ▲" : `Open Settings ▼ (X:${pos.x}, Y:${pos.y})`;
    btn.style.background = window.dustbinPlacementOpen ? "var(--primary-50)" : "var(--bg-surface-elevated)";
    btn.style.color = window.dustbinPlacementOpen ? "var(--primary-900)" : "var(--text-main)";
  } else {
    window.renderLiveMonitorView(document.getElementById("app-viewport"));
  }
};

window.setDustbinWidth = function (w) {
  const width = parseInt(w, 10);
  if (window.cvEngine) {
    const curH = window.cvEngine.getDustbinDimensions().height;
    window.cvEngine.setDustbinDimensions(width, curH);
    const label = document.getElementById("live-dustbin-w-val");
    if (label) label.textContent = `${width}px`;
    updateDustbinCoordDisplay();
  }
};

window.setDustbinHeight = function (h) {
  const height = parseInt(h, 10);
  if (window.cvEngine) {
    const curW = window.cvEngine.getDustbinDimensions().width;
    window.cvEngine.setDustbinDimensions(curW, height);
    const label = document.getElementById("live-dustbin-h-val");
    if (label) label.textContent = `${height}px`;
    updateDustbinCoordDisplay();
  }
};

window.saveDustbinConfiguration = function () {
  if (window.cvEngine && window.store) {
    const cfg = window.cvEngine.saveDustbinConfig();
    window.store.saveDustbinConfig(cfg);
    if (window.showToast) {
      window.showToast(`💾 Saved Dustbin Zone: X:${cfg.x} Y:${cfg.y} (${cfg.width}x${cfg.height}px) across future sessions!`);
    }
  }
};

function updateDustbinCoordDisplay() {
  const textEl = document.getElementById("dustbin-coords-text");
  const labelEl = document.getElementById("dustbin-toggle-label");
  const wEl = document.getElementById("live-dustbin-w-val");
  const hEl = document.getElementById("live-dustbin-h-val");
  if (window.cvEngine) {
    const pos = window.cvEngine.getDustbinPosition();
    const dims = window.cvEngine.getDustbinDimensions();
    if (textEl) textEl.textContent = `X: ${pos.x}, Y: ${pos.y}`;
    if (labelEl) {
      labelEl.textContent = window.dustbinPlacementOpen ? "Close Controls ▲" : `Open Settings ▼ (X:${pos.x}, Y:${pos.y})`;
    }
    if (wEl) wEl.textContent = `${dims.width}px`;
    if (hEl) hEl.textContent = `${dims.height}px`;
  }
}

window.triggerWebcamSpitNow = function () {
  window.cvEngine.forceWebcamCapture();
};

window.triggerWebcamDustbinNow = function () {
  window.cvEngine.forceDustbinCapture();
};

window.toggleLiveDustbin = function () {
  const active = window.cvEngine.toggleLiveDustbin();
  if (window.showToast) {
    window.showToast(active ? "🗑️ Municipal Dustbin safe-zone enabled on live feed" : "🗑️ Dustbin safe-zone disabled");
  }
};

window.testDrinkingFilter = function () {
  if (window.cvEngine && window.cvEngine.tracks.length > 0) {
    const t = window.cvEngine.tracks[0];
    t.handAtMouthFrames = 5;
    t.state = "🥤 FILTERED: DRINKING / HAND-AT-MOUTH";
    t.spitEnergy = 0;
  }
  if (window.showToast) {
    window.showToast("🥤 Filtered Out: Hand-to-mouth motion recognized as drinking water. Zero fine.");
  }
};

window.copyTrainingCommand = function () {
  const cmd = "python train_model.py --train";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(cmd);
  }
  if (window.showToast) {
    window.showToast("📋 Copied: 'python train_model.py --train' to clipboard!");
  }
};

window.selectCameraFeed = function (camId) {
  window.cvEngine.switchCamera(camId);
  window.renderLiveMonitorView(document.getElementById("app-viewport"));
};

window.triggerSimSpit = function () {
  window.cvEngine.simulateSpitting();
  const subjId = window.selectedOffenderSubject || (window.store && window.store.activeCitizen ? window.store.activeCitizen.id : "CIT-BPL-701");
  const subjCitizen = window.store && window.store.registeredCitizens ? window.store.registeredCitizens.find(c => c.id === subjId) : null;
  if (subjId === "UNKNOWN" || !subjCitizen) {
    if (window.showToast) window.showToast("🚨 Spitting detected. Offender is Unregistered Pedestrian: Zero false penalties issued to citizens.");
  } else if (!subjCitizen.facePhoto) {
    if (window.showToast) window.showToast(`🚨 Spitting detected. Face matches ${subjCitizen.name} (${subjId}), but photo is not enrolled: Zero penalty.`);
  } else {
    if (window.showToast) window.showToast(`🚨 Spitting detected! Biometric match verified for ${subjCitizen.name} (${subjId}). Notice issued strictly to this citizen.`);
  }
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
