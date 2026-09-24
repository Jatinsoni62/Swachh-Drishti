// SWACHH-DRISHTI Interactive Camera Training & Active Learning Studio
// Officer demonstration recording, ground-truth labeling, dustbin configuration, and model fine-tuning.

window.trainCameraState = {
  isRecording: false,
  recordStartTime: null,
  recordInterval: null,
  recordedDuration: 0,
  recordedFramesCount: 0,
  lastRecordedSession: null,
  showFeedbackModal: false,
  activeMode: "simulation", // "simulation" or "webcam"
  dustbinDragActive: false,
  isFeedOn: true,
  lastSubmittedSample: null
};

window.renderTrainCameraView = function (container) {
  const store = window.store;
  const cv = window.cvEngine;
  const state = window.trainCameraState;

  if (cv) {
    state.activeMode = cv.mode || "simulation";
  }

  const dustbin = store.getDustbinConfig();

  container.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-title-area">
        <h2>
          <span>Camera Training Studio</span>
          <span class="status-badge status-verified">Model Fine-Tuning v2.4</span>
        </h2>
        <p>Bhopal Municipal Corporation • Interactive Camera Training & Calibration</p>
      </div>

      <div class="dashboard-actions">
        <button class="btn-secondary" onclick="window.store.setView('live-monitor')">
          <span>📹</span>
          <span>Live Camera Monitor</span>
        </button>
        <button class="btn-secondary" onclick="window.store.setView('login')">
          <span>🔐</span>
          <span>Return to Login</span>
        </button>
      </div>
    </div>

    <!-- Main Studio Grid -->
    <div style="display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; margin-bottom: 24px;">
      
      <!-- Left Column: Camera Viewport & Live Recording Controls -->
      <div id="training-camera-card" class="content-card training-feed-card" style="margin-bottom: 0;">
        <div class="content-card-header" style="background: var(--bg-surface-elevated); display: flex; justify-content: space-between; align-items: center;">
          <div class="content-card-title">
            <span id="training-camera-mode-icon">${state.activeMode === 'webcam' ? '🎥' : '🏙️'}</span>
            <span id="training-camera-title">${state.activeMode === 'webcam' ? 'Live Physical Camera Feed' : 'CCTV Simulation Feed (Ward 12 New Market)'}</span>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <!-- Real-Time AI Alerts ON / OFF Toggle Button -->
            <button id="btn-toggle-train-alerts" type="button" class="btn-secondary ${store.aiAlertsEnabled ? 'active-alert-btn' : 'muted-alert-btn'}" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.toggleGlobalAiAlerts()" title="${store.aiAlertsEnabled ? 'Real-Time AI Alerts are ON (Click to Mute / Turn OFF)' : 'Real-Time AI Alerts are MUTED / OFF (Click to Turn ON)'}">
              <span>${store.aiAlertsEnabled ? '🔔' : '🔕'}</span>
              <span>${store.aiAlertsEnabled ? 'Alerts: ON' : 'Alerts: OFF'}</span>
            </button>

            <!-- Feed ON / OFF Power Switch Button -->
            <button id="toggle-training-feed-power-btn" type="button" class="btn-secondary" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; background: ${state.isFeedOn !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border-color: ${state.isFeedOn !== false ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; color: ${state.isFeedOn !== false ? '#34d399' : '#f87171'}; cursor: pointer; border-radius: var(--radius-sm);" onclick="window.toggleTrainingFeedPower()" title="Turn Live Camera Feed ON or OFF">
              <span id="training-power-btn-icon" style="font-size: 0.85rem;">${state.isFeedOn !== false ? '🟢' : '⏸️'}</span>
              <span id="training-power-btn-text">${state.isFeedOn !== false ? 'Feed: ON' : 'Feed: OFF'}</span>
            </button>

            <!-- Enlarge Fullscreen Button -->
            <button id="toggle-training-fullscreen-btn" type="button" class="btn-secondary" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); color: #ffffff; cursor: pointer; border-radius: var(--radius-sm);" onclick="window.toggleTrainingFullscreen()" title="Click to enlarge camera feed for full view">
              <span id="training-fullscreen-icon" style="font-size: 0.9rem;">⛶</span>
              <span id="training-fullscreen-text">Enlarge Fullscreen</span>
            </button>

            <button class="btn-secondary" style="font-size: 0.75rem; padding: 4px 10px;" onclick="window.toggleTrainingCameraFeedMode()">
              ${state.activeMode === 'webcam' ? 'Switch to CCTV Sim' : 'Switch to Live Webcam'}
            </button>
          </div>
        </div>

        <div class="content-card-body" style="padding: 14px;">
          
          <!-- Live Viewport Container -->
          <div id="training-viewport" style="position: relative; width: 100%; aspect-ratio: 16/9; background: #0f172a; border-radius: 8px; overflow: hidden; border: 2px solid ${state.isRecording ? '#ef4444' : 'var(--border-main)'}; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
            
            <video id="training-video-el" autoplay playsinline muted style="display: ${state.activeMode === 'webcam' ? 'block' : 'none'}; width: 100%; height: 100%; object-fit: cover;"></video>
            <canvas id="training-canvas-el" width="640" height="360" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"></canvas>

            <!-- Recording HUD Banner -->
            <div id="training-rec-banner" style="position: absolute; top: 12px; left: 12px; display: ${state.isRecording ? 'flex' : 'none'}; align-items: center; gap: 8px; background: rgba(220, 38, 38, 0.92); color: #ffffff; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;">
              <span style="font-size: 0.9rem;">●</span>
              <span>RECORDING</span>
              <span id="training-session-timer" style="font-family: monospace; font-size: 0.85rem; margin-left: 4px;">00:00</span>
            </div>

            <!-- Floating Start/Stop Recording Bar (Directly accessible in Fullscreen & Normal View) -->
            <div id="training-floating-rec-bar" style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 30; display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.25); box-shadow: 0 8px 24px rgba(0,0,0,0.55);">
              <button id="btn-floating-rec" type="button" class="btn-primary" style="padding: 7px 18px; font-size: 0.84rem; border-radius: 9999px; background: ${state.isRecording ? '#059669' : '#dc2626'}; border-color: ${state.isRecording ? '#047857' : '#b91c1c'}; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px ${state.isRecording ? 'rgba(5,150,105,0.4)' : 'rgba(220,38,38,0.4)'}; cursor: pointer;" onclick="${state.isRecording ? 'window.stopTrainingSession()' : 'window.startTrainingSession()'}">
                <span id="btn-floating-rec-icon" style="font-size: 0.95rem;">${state.isRecording ? '⏹️' : '🔴'}</span>
                <strong id="btn-floating-rec-label">${state.isRecording ? 'Stop Recording' : 'Start Recording'}</strong>
              </button>
              <span id="floating-rec-timer" style="font-family: monospace; font-size: 0.84rem; color: #ffffff; font-weight: 800; ${state.isRecording ? '' : 'display: none;'}">00:00</span>
            </div>

            <!-- Real-time Action Overlay -->
            <div id="training-realtime-action" style="position: absolute; top: 12px; right: 12px; background: rgba(15, 23, 42, 0.88); color: #e2e8f0; font-size: 0.72rem; font-family: monospace; padding: 4px 8px; border-radius: 4px; border: 1px solid #334155; z-index: 10;">
              <span id="training-action-text" style="color: #38bdf8; font-weight: 700;">Ready to Record</span>
            </div>

            <!-- Feed OFF Overlay -->
            <div id="training-feed-off-overlay" style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.94); display: ${state.isFeedOn !== false ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; z-index: 25; backdrop-filter: blur(4px);">
              <div style="font-size: 3rem; margin-bottom: 8px;">⏸️</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">Live Camera Feed is OFF</div>
              <div style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 14px;">Optical tracking is paused</div>
              <button type="button" class="btn-primary" style="background: #059669; border-color: #047857; padding: 8px 18px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(5,150,105,0.3);" onclick="window.toggleTrainingFeedPower()">
                <span>▶️</span>
                <strong>Turn Live Feed ON</strong>
              </button>
            </div>
          </div>

          <!-- Primary Recording Bar -->
          <div style="margin-top: 14px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button id="btn-toggle-training-rec" class="btn-primary" style="flex: 1.4; justify-content: center; padding: 12px 18px; font-size: 0.92rem; background: ${state.isRecording ? '#059669' : '#dc2626'}; border-color: ${state.isRecording ? '#047857' : '#b91c1c'}; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px ${state.isRecording ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'};" onclick="${state.isRecording ? 'window.stopTrainingSession()' : 'window.startTrainingSession()'}">
              <span id="btn-rec-icon" style="font-size: 1.1rem;">${state.isRecording ? '⏹️' : '🔴'}</span>
              <strong id="btn-rec-label">${state.isRecording ? 'Stop Recording & Analyze Activities →' : 'Start Recording Demonstration'}</strong>
            </button>

            <button class="btn-secondary" style="font-size: 0.8rem; padding: 10px 14px;" onclick="window.resetTrainingDemonstrations()">
              <span>🔄</span>
              <span>Reset Feed</span>
            </button>
          </div>

          <!-- Multi-Action Demonstration Quick Triggers -->
          <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <button class="btn-sim" style="font-size: 0.72rem; padding: 6px; border-color: #fca5a5; color: #dc2626; font-weight: 700;" onclick="window.triggerTrainingAction('spitting_road')">
              <span>🚨 Spitting (Road)</span>
            </button>

            <button class="btn-sim" style="font-size: 0.72rem; padding: 6px; border-color: #86efac; color: #047857; font-weight: 700;" onclick="window.triggerTrainingAction('spitting_dustbin')">
              <span>🗑️ Spit in Dustbin</span>
            </button>

            <button class="btn-sim" style="font-size: 0.72rem; padding: 6px; border-color: #93c5fd; color: #1d4ed8;" onclick="window.triggerTrainingAction('drinking_water')">
              <span>🥤 Drinking Water</span>
            </button>

            <button class="btn-sim" style="font-size: 0.72rem; padding: 6px; border-color: #fde68a; color: #b45309;" onclick="window.triggerTrainingAction('coughing')">
              <span>🤧 Coughing</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Right Column: Dustbin Position & Dimensions Configuration + Activity Feedback -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Adjustable Dustbin Position & Size Card -->
        <div class="content-card" style="margin-bottom: 0;">
          <div class="content-card-header" style="background: var(--bg-surface-elevated);">
            <div class="content-card-title">
              <span>🗑️</span>
              <span>Adjust Dustbin Zone</span>
            </div>
            <span id="training-dustbin-coords-badge" style="font-family: monospace; font-size: 0.74rem; color: #059669; font-weight: 800;">
              X:${dustbin.x} Y:${dustbin.y} • ${dustbin.width}x${dustbin.height}px
            </span>
          </div>

          <div class="content-card-body" style="padding: 14px;">
            <!-- Numeric / Slider Controls for Position & Size -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
              <div>
                <label style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">
                  <span>Width:</span>
                  <span id="dustbin-width-val" style="font-family: monospace; color: #059669;">${dustbin.width}px</span>
                </label>
                <input 
                  type="range" 
                  id="dustbin-width-slider" 
                  min="30" 
                  max="180" 
                  value="${dustbin.width}" 
                  style="width: 100%; accent-color: #10b981;" 
                  oninput="window.updateDustbinWidthFromSlider(this.value)"
                />
              </div>

              <div>
                <label style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">
                  <span>Height:</span>
                  <span id="dustbin-height-val" style="font-family: monospace; color: #059669;">${dustbin.height}px</span>
                </label>
                <input 
                  type="range" 
                  id="dustbin-height-slider" 
                  min="40" 
                  max="220" 
                  value="${dustbin.height}" 
                  style="width: 100%; accent-color: #10b981;" 
                  oninput="window.updateDustbinHeightFromSlider(this.value)"
                />
              </div>
            </div>

            <!-- Position Presets Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px;">
              <button class="dustbin-preset-btn" onclick="window.setTrainingDustbinPreset('bottom-right')">
                📍 Bottom-Right
              </button>
              <button class="dustbin-preset-btn" onclick="window.setTrainingDustbinPreset('bottom-center')">
                📍 Center
              </button>
              <button class="dustbin-preset-btn" onclick="window.setTrainingDustbinPreset('bottom-left')">
                📍 Bottom-Left
              </button>
              <button class="dustbin-preset-btn" onclick="window.setTrainingDustbinPreset('mid-right')">
                📍 Mid-Right
              </button>
            </div>

            <!-- Nudge and Size Presets -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary);">Nudge:</span>
                <button class="dustbin-preset-btn" onclick="window.nudgeTrainingDustbin(-25, 0)" title="Left">⬅️</button>
                <button class="dustbin-preset-btn" onclick="window.nudgeTrainingDustbin(25, 0)" title="Right">➡️</button>
                <button class="dustbin-preset-btn" onclick="window.nudgeTrainingDustbin(0, -20)" title="Up">⬆️</button>
                <button class="dustbin-preset-btn" onclick="window.nudgeTrainingDustbin(0, 20)" title="Down">⬇️</button>
              </div>

              <div style="display: flex; gap: 6px;">
                <button class="btn-secondary" style="font-size: 0.72rem; padding: 4px 8px;" onclick="window.resetTrainingDustbin()">
                  Reset
                </button>
                <button class="btn-primary" style="font-size: 0.75rem; padding: 5px 12px; background: #059669; border-color: #047857;" onclick="window.saveTrainingDustbinConfig()">
                  💾 Save Zone
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Activity Feedback & Ground-Truth Labeling Panel -->
        <div id="training-feedback-panel" class="content-card" style="margin-bottom: 0; border: 2px solid ${state.showFeedbackModal ? '#38bdf8' : 'var(--border-main)'}; background: ${state.showFeedbackModal ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)'};">
          <div class="content-card-header" style="background: ${state.showFeedbackModal ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-surface-elevated)'};">
            <div class="content-card-title">
              <span>📝</span>
              <span>Activity Feedback & Labeling</span>
            </div>
            <span id="training-feedback-badge-container">
              ${state.showFeedbackModal ? `
                <span class="status-badge" style="background: #38bdf8; color: #0c4a6e; font-weight: 800; font-size: 0.7rem;">
                  Awaiting Feedback
                </span>
              ` : `
                <span style="font-size: 0.72rem; color: var(--text-muted);">Ready</span>
              `}
            </span>
          </div>

          <div id="training-feedback-body" class="content-card-body" style="padding: 14px;">
            ${window.getTrainingFeedbackHtml()}
          </div>
        </div>

      </div>

    </div>

    <!-- Active Learning Performance & Stored Dataset Ledger Grid -->
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
      
      <!-- Left: Neural Model Retraining Metrics -->
      <div id="training-weights-card" class="content-card">
        ${window.getTrainingWeightsHtml()}
      </div>

      <!-- Right: Stored Labeled Demonstrations Database -->
      <div id="training-ledger-card" class="content-card">
        ${window.getTrainingLedgerHtml()}
      </div>

    </div>
  `;

  // Attach Video & Canvas to CV Engine
  setTimeout(() => {
    const videoEl = document.getElementById("training-video-el");
    const canvasEl = document.getElementById("training-canvas-el");

    if (cv && canvasEl) {
      cv.attachElements(videoEl, canvasEl);
      cv.start();
      window.setupTrainingCanvasInteractions(canvasEl);
    }
  }, 50);
};

// Fullscreen Camera Enlarge / Restore for Training Studio
window.toggleTrainingFullscreen = function () {
  const card = document.getElementById("training-camera-card");
  const btnIcon = document.getElementById("training-fullscreen-icon");
  const btnText = document.getElementById("training-fullscreen-text");
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

// Turn Training Camera Live Feed ON or OFF
window.toggleTrainingFeedPower = function () {
  const state = window.trainCameraState;
  const cv = window.cvEngine;
  state.isFeedOn = !state.isFeedOn;

  const btn = document.getElementById("toggle-training-feed-power-btn");
  const btnIcon = document.getElementById("training-power-btn-icon");
  const btnText = document.getElementById("training-power-btn-text");
  const overlay = document.getElementById("training-feed-off-overlay");

  if (state.isFeedOn) {
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
      window.showToast("🟢 Camera live feed turned ON");
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
      window.showToast("⏸️ Camera live feed turned OFF");
    }
  }
};

// Listen for Escape key to exit fullscreen in training studio
if (typeof document !== "undefined") {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const card = document.getElementById("training-camera-card");
      if (card && card.classList.contains("feed-fullscreen")) {
        window.toggleTrainingFullscreen();
      }
    }
  });
}

// Generate Feedback Form or Saved Demonstration Footage HTML
window.getTrainingFeedbackHtml = function () {
  const state = window.trainCameraState;
  
  // Case 1: Currently awaiting feedback on a recorded session
  if (state.showFeedbackModal && state.lastRecordedSession) {
    const s = state.lastRecordedSession;
    return `
      <!-- Session Summary -->
      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.78rem;">
        <div style="display: flex; justify-content: space-between;">
          <span>Duration: <strong>${s.durationSeconds}s</strong> (${s.totalFrames} frames)</span>
          <span style="font-weight: 700; color: ${s.isLikelyViolation ? '#dc2626' : '#059669'};">
            ${s.candidateCategory ? s.candidateCategory.replace('_', ' ').toUpperCase() : 'NORMAL'}
          </span>
        </div>
      </div>

      <!-- Required Feedback Questions Form -->
      <form id="training-feedback-form" onsubmit="window.submitActivityTrainingFeedback(event)">
        
        <!-- Question 1: Was spitting detected? -->
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 0.76rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
            1. Was spitting detected?
          </label>
          <div style="display: flex; gap: 8px;">
            <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: 4px; font-size: 0.76rem; cursor: pointer;">
              <input type="radio" name="fb_spitting" value="yes" ${s.autoSpitDetected ? 'checked' : ''} required />
              <span>Yes</span>
            </label>
            <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: 4px; font-size: 0.76rem; cursor: pointer;">
              <input type="radio" name="fb_spitting" value="no" ${!s.autoSpitDetected ? 'checked' : ''} />
              <span>No</span>
            </label>
          </div>
        </div>

        <!-- Question 2: Should a fine (challan) be issued? -->
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 0.76rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
            2. Should a fine (challan) be issued?
          </label>
          <div style="display: flex; gap: 8px;">
            <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: 4px; font-size: 0.76rem; cursor: pointer;">
              <input type="radio" name="fb_fine" value="yes" ${s.isLikelyViolation ? 'checked' : ''} required />
              <span>Yes (Fine ₹500)</span>
            </label>
            <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: 4px; font-size: 0.76rem; cursor: pointer;">
              <input type="radio" name="fb_fine" value="no" ${!s.isLikelyViolation ? 'checked' : ''} />
              <span>No (Zero Fine)</span>
            </label>
          </div>
        </div>

        <!-- Question 3: Was the activity correctly detected? -->
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 0.76rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
            3. Was the activity correctly detected?
          </label>
          <div style="display: flex; gap: 8px;">
            <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: 4px; font-size: 0.76rem; cursor: pointer;">
              <input type="radio" name="fb_correct" value="yes" checked required />
              <span>✓ Correct</span>
            </label>
            <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: 4px; font-size: 0.76rem; cursor: pointer;">
              <input type="radio" name="fb_correct" value="no" />
              <span>✕ Incorrect</span>
            </label>
          </div>
        </div>

        <!-- Question 4: Classification -->
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-size: 0.76rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
            4. Classification:
          </label>
          <select id="fb-violation-type" class="filter-select" style="width: 100%; font-size: 0.78rem; padding: 6px 8px; background: var(--input-bg); color: var(--text-main); font-weight: 600;">
            <option value="violation" ${s.isLikelyViolation ? 'selected' : ''}>🚨 Public Violation (Spitting on Ground)</option>
            <option value="non_violation" ${!s.isLikelyViolation ? 'selected' : ''}>✅ Non-Violation (Water / Coughing / Walking)</option>
            <option value="compliant_dustbin" ${s.candidateCategory === 'compliant_dustbin' ? 'selected' : ''}>♻️ Compliant Safe Disposal (Green Dustbin)</option>
          </select>
        </div>

        <!-- Activity Category Tag -->
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 0.74rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">
            Activity Category:
          </label>
          <select id="fb-activity-category" class="filter-select" style="width: 100%; font-size: 0.76rem; padding: 5px 8px; background: var(--input-bg); color: var(--text-main); font-weight: 600;">
            <option value="spitting_violation" ${s.candidateCategory === 'spitting_violation' ? 'selected' : ''}>Paan/Gutkha Spitting (Road Violation)</option>
            <option value="drinking_water" ${s.candidateCategory === 'drinking_water' ? 'selected' : ''}>Drinking Water from Bottle</option>
            <option value="coughing_sneezing" ${s.candidateCategory === 'coughing_sneezing' ? 'selected' : ''}>Coughing into Handkerchief</option>
            <option value="compliant_dustbin" ${s.candidateCategory === 'compliant_dustbin' ? 'selected' : ''}>Municipal Dustbin Disposal</option>
            <option value="normal_walking" ${s.candidateCategory === 'normal_walking' ? 'selected' : ''}>Normal Pedestrian Mobility</option>
          </select>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="submit" class="btn-primary" style="flex: 1; justify-content: center; font-size: 0.8rem; background: #0284c7; border-color: #0369a1; padding: 8px;">
            💾 Save Labeled Sample & Train
          </button>
          <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 6px 10px;" onclick="window.dismissTrainingFeedback()">
            Dismiss
          </button>
        </div>
      </form>
    `;
  }

  // Case 2: Just submitted a sample -> SHOW RECORDED DEMONSTRATION IN THIS SECTION!
  if (state.lastSubmittedSample) {
    const sm = state.lastSubmittedSample;
    return `
      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.76rem; font-weight: 800; color: #059669; text-transform: uppercase;">
            ✓ Recorded Footage Stored
          </span>
          <span class="status-badge ${sm.isViolation ? 'status-rejected' : 'status-verified'}" style="font-size: 0.68rem;">
            ${sm.isViolation ? '🚨 Violation' : '✅ Compliant'}
          </span>
        </div>

        ${sm.snapshotUrl ? `
          <div style="position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; margin-bottom: 10px; border: 1px solid var(--border-main); background: #000; cursor: pointer;" onclick="window.previewTrainingSample('${sm.id}')" title="Click to view enlarged evidence">
            <img src="${sm.snapshotUrl}" alt="Captured Footage" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; bottom: 6px; left: 8px; background: rgba(0,0,0,0.8); color: #fff; font-size: 0.68rem; font-family: monospace; padding: 2px 6px; border-radius: 3px;">
              ▶️ Play Clip • ${sm.id}
            </div>
          </div>
        ` : ''}

        <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-main); margin-bottom: 2px;">
          ${sm.label}
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 10px;">
          ${sm.timestamp} • Challan: ${sm.shouldFine ? '₹500 Issued' : '₹0 Fine'}
        </div>

        <button type="button" class="btn-primary" style="width: 100%; justify-content: center; font-size: 0.8rem; padding: 7px; background: #059669; border-color: #047857;" onclick="window.clearLastSubmittedPreview()">
          <span>➕</span>
          <span>Record Another Demonstration</span>
        </button>
      </div>
    `;
  }

  // Case 3: Empty / Ready state
  return `
    <div style="text-align: center; padding: 28px 10px; color: var(--text-muted);">
      <span style="font-size: 2rem; display: block; margin-bottom: 6px;">📹</span>
      <strong style="color: var(--text-main); font-size: 0.88rem;">Ready for Training Session</strong>
      <p style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">
        Click <strong>Start Recording</strong> to demonstrate actions
      </p>
    </div>
  `;
};

window.clearLastSubmittedPreview = function () {
  window.trainCameraState.lastSubmittedSample = null;
  window.renderTrainingFeedbackPanel();
};

// In-place Update for Feedback Panel
window.renderTrainingFeedbackPanel = function () {
  const state = window.trainCameraState;
  const panel = document.getElementById("training-feedback-panel");
  const badgeContainer = document.getElementById("training-feedback-badge-container");
  const body = document.getElementById("training-feedback-body");

  if (panel) {
    panel.style.border = state.showFeedbackModal ? "2px solid #38bdf8" : "2px solid var(--border-main)";
    panel.style.background = state.showFeedbackModal ? "var(--bg-surface)" : "var(--bg-surface-elevated)";
  }

  if (badgeContainer) {
    badgeContainer.innerHTML = state.showFeedbackModal ? `
      <span class="status-badge" style="background: #38bdf8; color: #0c4a6e; font-weight: 800; font-size: 0.7rem;">
        Awaiting Feedback
      </span>
    ` : (state.lastSubmittedSample ? `
      <span class="status-badge status-verified" style="font-size: 0.7rem;">
        Saved in Ledger
      </span>
    ` : `
      <span style="font-size: 0.72rem; color: var(--text-muted);">Ready</span>
    `);
  }

  if (body) {
    body.innerHTML = window.getTrainingFeedbackHtml();
  }
};

// In-place Update for Weights and Ledger Cards (Clean UI presentation without long rule explanations)
window.getTrainingWeightsHtml = function () {
  const store = window.store;
  if (!store) return "";
  const samples = store.trainingSamples || [];
  return `
    <div class="content-card-header">
      <div class="content-card-title">
        <span>🧠</span>
        <span>Learned Model Metrics</span>
      </div>
      <span class="status-badge status-verified">Online Active Learning</span>
    </div>

    <div class="content-card-body">
      <div style="text-align: center; padding: 14px 0; border-bottom: 1px solid var(--border-main); margin-bottom: 14px;">
        <div style="font-size: 2.2rem; font-weight: 900; color: #059669; line-height: 1;">
          ${store.learnedModel ? store.learnedModel.accuracy : 98.8}%
        </div>
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-top: 4px;">
          Cleanliness Verification Accuracy
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
        <div style="background: var(--bg-surface-subtle); padding: 8px; border-radius: 4px; border: 1px solid var(--border-main); text-align: center;">
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--teal-700);">${samples.length}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">Total Demonstrations</div>
        </div>

        <div style="background: var(--bg-surface-subtle); padding: 8px; border-radius: 4px; border: 1px solid var(--border-main); text-align: center;">
          <div style="font-size: 1.1rem; font-weight: 800; color: #059669;">98.4%</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">False-Alarm Suppression</div>
        </div>
      </div>

      <button class="btn-primary" style="width: 100%; justify-content: center; font-size: 0.82rem; background: #0d9488; border-color: #0f766e;" onclick="window.triggerImmediateModelRetrain()">
        <span>🚀</span>
        <span>Re-Optimize Weights Now</span>
      </button>
    </div>
  `;
};

window.getTrainingLedgerHtml = function () {
  const store = window.store;
  if (!store) return "";
  return `
    <div class="content-card-header">
      <div class="content-card-title">
        <span>💾</span>
        <span>Trained Demonstrations Database (${store.trainingSamples.length} Samples)</span>
      </div>
      <span style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">Municipal Ledger</span>
    </div>

    <div class="content-card-body" style="padding: 0;">
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Footage Preview</th>
              <th>Sample ID</th>
              <th>Activity Label</th>
              <th>Spitting?</th>
              <th>Challan</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${store.trainingSamples.map(sample => `
              <tr>
                <td style="width: 60px;">
                  ${sample.snapshotUrl ? `
                    <img src="${sample.snapshotUrl}" alt="Evidence" style="width: 52px; height: 30px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-main); cursor: pointer; display: block;" onclick="window.previewTrainingSample('${sample.id}')" title="Click to view recorded evidence" />
                  ` : `
                    <div style="width: 52px; height: 30px; background: #1e293b; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: #64748b;">Clip</div>
                  `}
                </td>
                <td style="font-family: monospace; font-weight: 700; color: var(--teal-700); font-size: 0.76rem;">
                  ${sample.id}
                </td>
                <td>
                  <div style="font-weight: 700; color: var(--text-main); font-size: 0.8rem;">${sample.label}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">${sample.timestamp}</div>
                </td>
                <td>
                  <span class="status-badge ${sample.wasSpitting ? 'status-pending' : 'status-verified'}" style="font-size: 0.68rem; padding: 2px 6px;">
                    ${sample.wasSpitting ? 'YES' : 'NO'}
                  </span>
                </td>
                <td>
                  <span class="status-badge ${sample.shouldFine ? 'status-rejected' : 'status-verified'}" style="font-size: 0.68rem; padding: 2px 6px;">
                    ${sample.shouldFine ? '₹500' : '₹0'}
                  </span>
                </td>
                <td>
                  <span style="font-size: 0.74rem; font-weight: 700; color: ${sample.isViolation ? '#dc2626' : '#059669'};">
                    ${sample.isViolation ? '🚨 Violation' : '✅ Compliant'}
                  </span>
                </td>
                <td>
                  <button class="btn-link" style="color: #dc2626; font-size: 0.72rem; padding: 0; background: none; border: none; cursor: pointer;" onclick="window.removeTrainingSample('${sample.id}')">
                    Delete
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

window.updateTrainingLedgerAndWeights = function () {
  const weightsCard = document.getElementById("training-weights-card");
  const ledgerCard = document.getElementById("training-ledger-card");
  if (weightsCard) weightsCard.innerHTML = window.getTrainingWeightsHtml();
  if (ledgerCard) ledgerCard.innerHTML = window.getTrainingLedgerHtml();
};

// Canvas Mouse Interactions: Drag Dustbin & Resize
window.setupTrainingCanvasInteractions = function (canvas) {
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const bin = (window.cvEngine && window.cvEngine.getDustbinPosition) 
      ? window.cvEngine.getDustbinPosition() 
      : { x: 480, y: 195, width: 70, height: 95 };

    if (
      mouseX >= bin.x - 10 && mouseX <= bin.x + bin.width + 10 &&
      mouseY >= bin.y - 10 && mouseY <= bin.y + bin.height + 10
    ) {
      isDragging = true;
      dragOffset.x = mouseX - bin.x;
      dragOffset.y = mouseY - bin.y;
      canvas.style.cursor = "grabbing";
    }
  };

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const bin = (window.cvEngine && window.cvEngine.getDustbinPosition) 
      ? window.cvEngine.getDustbinPosition() 
      : { x: 480, y: 195, width: 70, height: 95 };

    if (!isDragging) {
      if (
        mouseX >= bin.x - 10 && mouseX <= bin.x + bin.width + 10 &&
        mouseY >= bin.y - 10 && mouseY <= bin.y + bin.height + 10
      ) {
        canvas.style.cursor = "grab";
      } else {
        canvas.style.cursor = "default";
      }
    } else {
      const newX = Math.round(mouseX - dragOffset.x);
      const newY = Math.round(mouseY - dragOffset.y);
      if (window.cvEngine) {
        window.cvEngine.setDustbinPosition(newX, newY);
      }
      window.updateTrainingDustbinBadges();
    }
  };

  window.onmouseup = () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "grab";
      window.saveTrainingDustbinConfig(false);
    }
  };
};

window.updateTrainingDustbinBadges = function () {
  if (!window.cvEngine) return;
  const pos = window.cvEngine.getDustbinPosition();
  const dims = window.cvEngine.getDustbinDimensions();

  const badge = document.getElementById("training-dustbin-coords-badge");
  if (badge) {
    badge.textContent = `X:${pos.x} Y:${pos.y} • ${dims.width}x${dims.height}px`;
  }

  const wVal = document.getElementById("dustbin-width-val");
  const hVal = document.getElementById("dustbin-height-val");
  if (wVal) wVal.textContent = `${dims.width}px`;
  if (hVal) hVal.textContent = `${dims.height}px`;

  const wSlider = document.getElementById("dustbin-width-slider");
  const hSlider = document.getElementById("dustbin-height-slider");
  if (wSlider) wSlider.value = dims.width;
  if (hSlider) hSlider.value = dims.height;
};

// Slider Updates for Width and Height
window.updateDustbinWidthFromSlider = function (w) {
  const width = parseInt(w, 10);
  if (window.cvEngine) {
    const curH = window.cvEngine.getDustbinDimensions().height;
    window.cvEngine.setDustbinDimensions(width, curH);
    window.updateTrainingDustbinBadges();
  }
};

window.updateDustbinHeightFromSlider = function (h) {
  const height = parseInt(h, 10);
  if (window.cvEngine) {
    const curW = window.cvEngine.getDustbinDimensions().width;
    window.cvEngine.setDustbinDimensions(curW, height);
    window.updateTrainingDustbinBadges();
  }
};

window.setTrainingDustbinPreset = function (preset) {
  if (!window.cvEngine) return;
  if (preset === "bottom-right") window.cvEngine.setDustbinPosition(480, 195);
  else if (preset === "bottom-center") window.cvEngine.setDustbinPosition(280, 195);
  else if (preset === "bottom-left") window.cvEngine.setDustbinPosition(60, 195);
  else if (preset === "mid-right") window.cvEngine.setDustbinPosition(480, 90);
  window.updateTrainingDustbinBadges();
  if (window.showToast) window.showToast(`🗑️ Moved dustbin to ${preset.replace('-', ' ').toUpperCase()}`);
};

window.nudgeTrainingDustbin = function (dx, dy) {
  if (!window.cvEngine) return;
  const cur = window.cvEngine.getDustbinPosition();
  window.cvEngine.setDustbinPosition(cur.x + dx, cur.y + dy);
  window.updateTrainingDustbinBadges();
};

window.resetTrainingDustbin = function () {
  if (window.cvEngine) {
    window.cvEngine.resetDustbinPosition();
    window.updateTrainingDustbinBadges();
    if (window.showToast) window.showToast("🗑️ Reset dustbin to default position & dimensions.");
  }
};

window.saveTrainingDustbinConfig = function (notifyUser = true) {
  if (window.cvEngine && window.store) {
    const cfg = window.cvEngine.saveDustbinConfig();
    window.store.saveDustbinConfig(cfg);
    if (notifyUser && window.showToast) {
      window.showToast(`💾 Dustbin position (${cfg.x}, ${cfg.y}) & size (${cfg.width}x${cfg.height}px) saved.`);
    }
  }
};

// Camera Feed Toggle between Simulation and Webcam
window.toggleTrainingCameraFeedMode = function () {
  const cv = window.cvEngine;
  if (!cv) return;
  const newMode = cv.mode === "simulation" ? "webcam" : "simulation";
  cv.setMode(newMode);
  window.trainCameraState.activeMode = newMode;

  const modeIcon = document.getElementById("training-camera-mode-icon");
  const modeTitle = document.getElementById("training-camera-title");
  const videoEl = document.getElementById("training-video-el");
  const canvasEl = document.getElementById("training-canvas-el");

  if (modeIcon) modeIcon.textContent = newMode === "webcam" ? "🎥" : "🏙️";
  if (modeTitle) modeTitle.textContent = newMode === "webcam" ? "Live Physical Camera Feed" : "CCTV Simulation Feed (Ward 12 New Market)";
  if (videoEl) videoEl.style.display = newMode === "webcam" ? "block" : "none";

  if (cv && videoEl && canvasEl) {
    cv.attachElements(videoEl, canvasEl);
    cv.start();
  }

  if (window.showToast) {
    window.showToast(newMode === "webcam" ? "🎥 Switched to Live Physical Webcam" : "🏙️ Switched to CCTV Simulation Feed");
  }
};

// Recording Lifecycle: Start Recording Session WITHOUT wiping camera viewport
window.startTrainingSession = function () {
  const state = window.trainCameraState;
  const cv = window.cvEngine;

  if (state.isFeedOn === false) {
    window.toggleTrainingFeedPower();
  }

  state.isRecording = true;
  state.recordStartTime = Date.now();
  state.recordedFramesCount = 0;
  state.showFeedbackModal = false;

  if (cv) {
    cv.startTrainingRecording();
  }

  // Update Primary Bar Button
  const btn = document.getElementById("btn-toggle-training-rec");
  const icon = document.getElementById("btn-rec-icon");
  const label = document.getElementById("btn-rec-label");
  if (btn) {
    btn.style.background = "#059669";
    btn.style.borderColor = "#047857";
    btn.style.boxShadow = "0 4px 12px rgba(5,150,105,0.3)";
    btn.onclick = () => window.stopTrainingSession();
  }
  if (icon) icon.textContent = "⏹️";
  if (label) label.textContent = "Stop Recording & Analyze Activities →";

  // Update Floating Button in Viewport (Enlarged / Fullscreen View)
  const fBtn = document.getElementById("btn-floating-rec");
  const fIcon = document.getElementById("btn-floating-rec-icon");
  const fLabel = document.getElementById("btn-floating-rec-label");
  const fTimer = document.getElementById("floating-rec-timer");
  if (fBtn) {
    fBtn.style.background = "#059669";
    fBtn.style.borderColor = "#047857";
    fBtn.onclick = () => window.stopTrainingSession();
  }
  if (fIcon) fIcon.textContent = "⏹️";
  if (fLabel) fLabel.textContent = "Stop Recording";
  if (fTimer) {
    fTimer.style.display = "inline";
    fTimer.textContent = "00:00";
  }

  // Show recording banner
  const banner = document.getElementById("training-rec-banner");
  if (banner) banner.style.display = "flex";

  const timerEl = document.getElementById("training-session-timer");
  if (timerEl) timerEl.textContent = "00:00";

  // Highlight viewport border
  const vp = document.getElementById("training-viewport");
  if (vp) vp.style.borderColor = "#ef4444";

  // Update status text
  const statusText = document.getElementById("training-action-text");
  if (statusText) {
    statusText.textContent = "● RECORDING";
    statusText.style.color = "#ef4444";
  }

  // Clear previous interval if any
  clearInterval(state.recordInterval);
  state.recordInterval = setInterval(() => {
    if (!state.isRecording) return;
    const elapsed = Math.floor((Date.now() - state.recordStartTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    const tEl = document.getElementById("training-session-timer");
    if (tEl) tEl.textContent = `${mm}:${ss}`;
    const flTimer = document.getElementById("floating-rec-timer");
    if (flTimer) flTimer.textContent = `${mm}:${ss}`;

    if (cv) {
      cv.recordTrainingTelemetry({
        spittingDetected: false,
        drinkingDetected: false,
        coughingDetected: false
      });
    }
  }, 1000);

  if (window.showToast) {
    window.showToast("🔴 Recording started — demonstrate activities in front of camera");
  }
};

// Stop Recording Session WITHOUT wiping camera viewport
window.stopTrainingSession = function () {
  const state = window.trainCameraState;
  const cv = window.cvEngine;

  state.isRecording = false;
  clearInterval(state.recordInterval);

  let sessionResult = null;
  if (cv) {
    sessionResult = cv.stopTrainingRecording();
  } else {
    sessionResult = {
      durationSeconds: 6.2,
      totalFrames: 186,
      detectedGestures: [{ type: "spitting", label: "Spitting Detected", time: 3.2 }],
      candidateCategory: "spitting_violation",
      autoSpitDetected: true,
      isLikelyViolation: true,
      snapshotUrl: null
    };
  }

  state.lastRecordedSession = sessionResult;
  state.showFeedbackModal = true;

  // In-place Primary button update back to Start Recording
  const btn = document.getElementById("btn-toggle-training-rec");
  const icon = document.getElementById("btn-rec-icon");
  const label = document.getElementById("btn-rec-label");
  if (btn) {
    btn.style.background = "#dc2626";
    btn.style.borderColor = "#b91c1c";
    btn.style.boxShadow = "0 4px 12px rgba(220,38,38,0.3)";
    btn.onclick = () => window.startTrainingSession();
  }
  if (icon) icon.textContent = "🔴";
  if (label) label.textContent = "Start Recording Demonstration";

  // In-place Floating button update
  const fBtn = document.getElementById("btn-floating-rec");
  const fIcon = document.getElementById("btn-floating-rec-icon");
  const fLabel = document.getElementById("btn-floating-rec-label");
  const fTimer = document.getElementById("floating-rec-timer");
  if (fBtn) {
    fBtn.style.background = "#dc2626";
    fBtn.style.borderColor = "#b91c1c";
    fBtn.onclick = () => window.startTrainingSession();
  }
  if (fIcon) fIcon.textContent = "🔴";
  if (fLabel) fLabel.textContent = "Start Recording";
  if (fTimer) fTimer.style.display = "none";

  // Hide banner
  const banner = document.getElementById("training-rec-banner");
  if (banner) banner.style.display = "none";

  // Reset viewport border
  const vp = document.getElementById("training-viewport");
  if (vp) vp.style.borderColor = "var(--border-main)";

  // Update status text
  const statusText = document.getElementById("training-action-text");
  if (statusText) {
    statusText.textContent = "Awaiting Feedback";
    statusText.style.color = "#10b981";
  }

  // Render feedback panel in-place
  window.renderTrainingFeedbackPanel();

  if (window.showToast) {
    window.showToast("⏹️ Recording complete — review and submit feedback");
  }
};

// Action Trigger Demonstrations
window.triggerTrainingAction = function (actionType) {
  const cv = window.cvEngine;
  const statusText = document.getElementById("training-action-text");

  if (actionType === "spitting_road") {
    if (cv) {
      if (cv.mode === "webcam") cv.forceWebcamCapture();
      else cv.simulateSpitting();
      if (cv.isRecordingTraining) {
        cv.recordTrainingTelemetry({ spittingDetected: true, isDustbin: false, confidence: 91 });
      }
    }
    if (statusText) {
      statusText.textContent = "🚨 Spitting on Road (Violation)";
      statusText.style.color = "#ef4444";
    }
    if (window.showToast) window.showToast("🚨 Spitting on Road (Violation)");
  } else if (actionType === "spitting_dustbin") {
    if (cv) {
      if (cv.mode === "webcam") cv.forceDustbinCapture();
      else cv.simulateSpitInDustbin();
      if (cv.isRecordingTraining) {
        cv.recordTrainingTelemetry({ spittingDetected: true, isDustbin: true, confidence: 89 });
      }
    }
    if (statusText) {
      statusText.textContent = "🗑️ Compliant Dustbin Disposal (0 Fine)";
      statusText.style.color = "#10b981";
    }
    if (window.showToast) window.showToast("🗑️ Compliant Dustbin Disposal (0 Fine)");
  } else if (actionType === "drinking_water") {
    if (cv) {
      cv.simulateDrinking();
      if (cv.isRecordingTraining) {
        cv.recordTrainingTelemetry({ drinkingDetected: true, confidence: 93 });
      }
    }
    if (statusText) {
      statusText.textContent = "🥤 Drinking Water (Filtered)";
      statusText.style.color = "#38bdf8";
    }
    if (window.showToast) window.showToast("🥤 Drinking Water (Filtered Non-Violation)");
  } else if (actionType === "coughing") {
    if (cv) {
      if (cv.isRecordingTraining) {
        cv.recordTrainingTelemetry({ coughingDetected: true, confidence: 85 });
      }
    }
    if (statusText) {
      statusText.textContent = "🤧 Coughing (Filtered)";
      statusText.style.color = "#f59e0b";
    }
    if (window.showToast) window.showToast("🤧 Coughing (Filtered Non-Violation)");
  }
};

// Reset Demonstrations
window.resetTrainingDemonstrations = function () {
  const cv = window.cvEngine;
  if (cv && cv.mode === "simulation") {
    cv.simulationActors.forEach(actor => {
      actor.behaviorType = actor.id === "P-014" ? "spitting" : (actor.id === "P-022" ? "drinking" : "normal");
      actor.spitTriggered = false;
      actor.spitTrajectory = [];
    });
  }
  const statusText = document.getElementById("training-action-text");
  if (statusText) {
    statusText.textContent = "Ready to Record";
    statusText.style.color = "#38bdf8";
  }
  if (window.showToast) {
    window.showToast("🔄 Reset active demonstrations.");
  }
};

// Submit Ground-Truth Labeling & Retrain Model (WITHOUT wiping camera viewport)
window.submitActivityTrainingFeedback = function (e) {
  e.preventDefault();
  const store = window.store;
  const state = window.trainCameraState;
  const form = document.getElementById("training-feedback-form");
  if (!form) return;

  const wasSpitting = form.querySelector('input[name="fb_spitting"]:checked').value === "yes";
  const shouldFine = form.querySelector('input[name="fb_fine"]:checked').value === "yes";
  const wasCorrectlyDetected = form.querySelector('input[name="fb_correct"]:checked').value === "yes";
  const violationType = document.getElementById("fb-violation-type").value;
  const activityCategory = document.getElementById("fb-activity-category").value;

  const isViolation = violationType === "violation";

  const labelMap = {
    spitting_violation: "Demonstrated Paan Spitting (Road Violation)",
    drinking_water: "Demonstrated Drinking Water (Filtered)",
    coughing_sneezing: "Demonstrated Coughing into Barrier",
    compliant_dustbin: "Demonstrated Compliant Disposal in Dustbin",
    normal_walking: "Demonstrated Normal Pedestrian Mobility"
  };

  const sample = store.saveTrainingSample({
    label: labelMap[activityCategory] || "User Demonstrated Activity",
    activityCategory,
    wasSpitting,
    shouldFine,
    wasCorrectlyDetected,
    isViolation,
    confidence: wasSpitting ? 92 : 24,
    notes: `User feedback: ${wasSpitting ? 'Spitting' : 'No spitting'}. Fine: ${shouldFine ? '₹500' : '₹0'}.`,
    snapshotUrl: state.lastRecordedSession ? state.lastRecordedSession.snapshotUrl : null,
    features: {
      mouthImpulse: wasSpitting ? 0.85 : 0.25,
      handDistance: activityCategory === 'drinking_water' ? 10 : 80,
      dustbinDistance: activityCategory === 'compliant_dustbin' ? 15 : 220,
      durationFrames: state.lastRecordedSession ? state.lastRecordedSession.totalFrames : 120
    }
  });

  // Retrain model
  const updatedModel = store.retrainModel();

  state.showFeedbackModal = false;
  state.lastRecordedSession = null;
  state.lastSubmittedSample = sample; // KEEP RECORDING VISIBLE IN THE SECTION!

  // In-place updates so camera stream is NOT interrupted
  window.renderTrainingFeedbackPanel();
  window.updateTrainingLedgerAndWeights();

  if (window.showToast) {
    window.showToast(`🚀 Model retrained! New accuracy: ${updatedModel.accuracy}% (Sample ${sample.id} saved)`);
  }
};

window.dismissTrainingFeedback = function () {
  window.trainCameraState.showFeedbackModal = false;
  window.trainCameraState.lastRecordedSession = null;
  window.renderTrainingFeedbackPanel();
};

window.triggerImmediateModelRetrain = function () {
  const store = window.store;
  if (!store) return;
  const updated = store.retrainModel();
  window.updateTrainingLedgerAndWeights();
  if (window.showToast) {
    window.showToast(`🚀 Model weights re-optimized! Cleanliness accuracy: ${updated.accuracy}%`);
  }
};

window.removeTrainingSample = function (sampleId) {
  if (confirm(`Remove training sample ${sampleId} from learned database?`)) {
    window.store.deleteTrainingSample(sampleId);
    if (window.trainCameraState.lastSubmittedSample && window.trainCameraState.lastSubmittedSample.id === sampleId) {
      window.trainCameraState.lastSubmittedSample = null;
      window.renderTrainingFeedbackPanel();
    }
    window.updateTrainingLedgerAndWeights();
    if (window.showToast) {
      window.showToast(`🗑️ Removed training sample ${sampleId}`);
    }
  }
};

// Preview Recorded Demonstration Modal
window.previewTrainingSample = function (sampleId) {
  const store = window.store;
  if (!store) return;
  const sample = store.trainingSamples.find(s => s.id === sampleId);
  if (!sample) return;

  const existing = document.getElementById("training-preview-modal");
  if (existing) existing.remove();

  const modalEl = document.createElement("div");
  modalEl.id = "training-preview-modal";
  modalEl.className = "evidence-modal-backdrop";
  modalEl.style.display = "flex";
  modalEl.innerHTML = `
    <div class="evidence-modal-card" style="max-width: 650px;">
      <div class="evidence-modal-header">
        <div class="evidence-modal-title">
          <span>🎬</span>
          <span>Recorded Footage — ${sample.id}</span>
        </div>
        <button class="modal-close-btn" onclick="document.getElementById('training-preview-modal').remove()">✕</button>
      </div>
      <div class="evidence-modal-body" style="padding: 16px;">
        <div style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-main);">
          ${sample.snapshotUrl ? `
            <img src="${sample.snapshotUrl}" alt="Demonstration Footage" style="width: 100%; height: 100%; object-fit: contain;" />
          ` : `
            <div style="color: #94a3b8; font-size: 0.85rem;">[Live Gesture Captured Footage]</div>
          `}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">${sample.label}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${sample.timestamp} • Challan: ${sample.shouldFine ? '₹500 Fine' : '₹0 Fine'}</div>
          </div>
          <span class="status-badge ${sample.isViolation ? 'status-rejected' : 'status-verified'}" style="font-size: 0.75rem; padding: 4px 10px;">
            ${sample.isViolation ? '🚨 VIOLATION' : '✅ NON-VIOLATION'}
          </span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);
};

window.openTrainCameraStudio = function () {
  if (window.store) {
    window.store.setView("train-camera");
  }
};
