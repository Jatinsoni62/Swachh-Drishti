// SWACHH-DRISHTI Dedicated Evidence Package & Verification Flow

window.openEvidenceModal = function (incidentId) {
  const store = window.store;
  const inc = store.incidents.find(i => i.id === incidentId) || store.incidents[0];

  const existing = document.getElementById("evidence-modal-root");
  if (existing) existing.remove();

  const modalHtml = `
    <div class="modal-overlay" id="evidence-modal-root">
      <div class="modal-card">
        
        <div class="modal-header">
          <div>
            <h2>Evidence Package: ${inc.id}</h2>
            <div style="font-size: 0.8rem; color: var(--slate-500); margin-top: 2px;">
              Camera ${inc.cameraId} • ${inc.ward} (${inc.cameraName}) • Captured: ${inc.date} ${inc.time}
            </div>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('evidence-modal-root').remove()">×</button>
        </div>

        <div class="modal-body">
          
          <div class="evidence-grid">
            
            <!-- Left Column: Video Evidence & Frame Selector -->
            <div>
              <div class="evidence-player-container">
                ${inc.videoUrl ? `
                  <video src="${inc.videoUrl}" controls autoplay loop playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                ` : `
                  <canvas id="evidence-canvas" width="500" height="280" style="width: 100%; height: 100%; object-fit: cover;"></canvas>
                `}
                
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.75); color: #ffffff; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 0.72rem;">
                  ${inc.isWebcamCapture ? 'REAL WEBCAM CAPTURED EVIDENCE' : 'EVENT CLIP (10s PRE → 5s POST BUFFER)'}
                </div>

                <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(220, 38, 38, 0.9); color: #ffffff; font-weight: 700; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px;">
                  KEY EVIDENCE SNAPSHOT (${inc.aiConfidence}% CONF)
                </div>
              </div>

              <!-- Multi-Frame Strip -->
              <div class="evidence-frame-selector">
                <div class="frame-thumb" onclick="window.selectEvidenceFrame(0)">
                  <canvas id="thumb-0" width="72" height="48"></canvas>
                  <span class="frame-label">t-3.0s</span>
                </div>
                <div class="frame-thumb" onclick="window.selectEvidenceFrame(1)">
                  <canvas id="thumb-1" width="72" height="48"></canvas>
                  <span class="frame-label">t-1.5s</span>
                </div>
                <div class="frame-thumb active" onclick="window.selectEvidenceFrame(2)">
                  <canvas id="thumb-2" width="72" height="48"></canvas>
                  <span class="frame-label">EVENT</span>
                </div>
                <div class="frame-thumb" onclick="window.selectEvidenceFrame(3)">
                  <canvas id="thumb-3" width="72" height="48"></canvas>
                  <span class="frame-label">t+1.0s</span>
                </div>
                <div class="frame-thumb" onclick="window.selectEvidenceFrame(4)">
                  <canvas id="thumb-4" width="72" height="48"></canvas>
                  <span class="frame-label">t+2.5s</span>
                </div>
              </div>

              <!-- AI Analysis Checklist -->
              <div class="ai-checklist">
                <div class="checklist-title">
                  <span>AI Detection Pipeline Audit</span>
                  <span style="color: var(--teal-700); font-family: monospace;">Overall: ${inc.aiConfidence}%</span>
                </div>
                <ul class="checklist-items">
                  <li class="checklist-item passed">
                    <div class="item-left">
                      <span class="check-icon">✓</span>
                      <span>Person Detection (YOLOv8 Edge)</span>
                    </div>
                    <span class="confidence-val">96% Conf</span>
                  </li>
                  <li class="checklist-item passed">
                    <div class="item-left">
                      <span class="check-icon">✓</span>
                      <span>Pose Landmark Estimation (Head/Mouth/Hands)</span>
                    </div>
                    <span class="confidence-val">92% Conf</span>
                  </li>
                  <li class="checklist-item passed">
                    <div class="item-left">
                      <span class="check-icon">✓</span>
                      <span>Behaviour Filter (Eating/Drinking/Coughing Ruled Out)</span>
                    </div>
                    <span class="confidence-val">89% Conf</span>
                  </li>
                  <li class="checklist-item passed">
                    <div class="item-left">
                      <span class="check-icon">✓</span>
                      <span>Temporal Sequence Analysis (30 Consecutive Frames)</span>
                    </div>
                    <span class="confidence-val">88% Conf</span>
                  </li>
                  <li class="checklist-item passed">
                    <div class="item-left">
                      <span class="check-icon">✓</span>
                      <span>Spitting Trajectory & Sidewalk Contact</span>
                    </div>
                    <span class="confidence-val">${inc.aiConfidence}% Conf</span>
                  </li>
                  <li class="checklist-item passed">
                    <div class="item-left">
                      <span class="check-icon">✓</span>
                      <span>Receptacle Spatial Check (Dustbin / Bucket Proximity)</span>
                    </div>
                    <span class="confidence-val" style="color: var(--teal-700); font-weight: 700;">Zero Intersect (Road Confirmed)</span>
                  </li>
                </ul>
              </div>

            </div>

            <!-- Right Column: Chronological Timeline & Decision Action -->
            <div>
              <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 16px;">
                <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--slate-500); margin-bottom: 6px;">
                  Civic Violation Particulars
                </div>
                <div style="font-size: 1.05rem; font-weight: 800; color: var(--slate-900);">
                  ${inc.violationType}
                </div>
                <div style="font-size: 0.8rem; color: var(--slate-600); margin-top: 4px;">
                  Track ID: <strong style="font-family: monospace;">${inc.trackId}</strong> • Ward 12 Pedestrian Zone
                </div>
              </div>

              <!-- Chronological Timeline -->
              <div style="font-size: 0.78rem; font-weight: 800; color: var(--slate-700); text-transform: uppercase; margin-bottom: 8px;">
                Incident Event Timeline
              </div>
              <div class="incident-timeline">
                ${inc.timeline.map(t => `
                  <div class="timeline-entry ${t.critical ? 'critical' : ''}">
                    <div class="timeline-time">${t.time}</div>
                    <div class="timeline-desc">${t.text}</div>
                  </div>
                `).join('')}
              </div>

              <!-- Municipal Officer Decision Area -->
              <div class="decision-action-box" id="decision-box">
                ${inc.status === 'PENDING' ? `
                  <div class="decision-heading">
                    <span>🧑‍⚖️</span>
                    <span>Officer Adjudication (Mandatory Human Decision)</span>
                  </div>
                  <p style="font-size: 0.8rem; color: var(--slate-600); margin-bottom: 14px;">
                    Under Bhopal Municipal Cleanliness Bye-Laws, the AI cannot issue fines automatically. Please inspect the video evidence above:
                  </p>

                  <div class="decision-button-row">
                    <button class="btn-primary" onclick="window.confirmVerification('${inc.id}')">
                      ✓ Verify Violation
                    </button>
                    <button class="btn-danger" onclick="window.toggleRejectionForm()">
                      ✕ Reject Detection
                    </button>
                  </div>

                  <!-- Rejection Reason Dropdown / Box -->
                  <div class="rejection-form" id="rejection-form-container">
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--red-600); margin-bottom: 8px;">
                      Select Rejection Reason (Logs to AI Feedback Loop):
                    </div>
                    <select id="rejection-reason-select" class="filter-select" style="width: 100%; margin-bottom: 8px;">
                      <option value="Spit in dustbin/bucket">Disposed in dustbin / bucket / spittoon (Compliant - Lawful)</option>
                      <option value="Eating/drinking">Eating / Drinking liquid</option>
                      <option value="Coughing/sneezing">Coughing / Sneezing into handkerchief</option>
                      <option value="Touching face">Touching face / Wiping mouth</option>
                      <option value="Insufficient evidence">Insufficient camera clarity / Angle obscured</option>
                      <option value="False positive">Other false positive</option>
                    </select>
                    <button class="btn-danger" style="width: 100%; font-size: 0.8rem;" onclick="window.submitRejection('${inc.id}')">
                      Confirm Rejection & Send Model Feedback
                    </button>
                  </div>
                ` : (inc.status === 'VERIFIED' ? `
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
                    <div style="font-weight: 800; color: #15803d; font-size: 0.88rem;">
                      ✓ Violation Confirmed by Municipal Officer
                    </div>
                    <div style="font-size: 0.75rem; color: #166534; margin-top: 4px;">
                      Verified by ${inc.officerVerification ? inc.officerVerification.verifiedBy : 'Officer'}. Ready for statutory Challan issuance.
                    </div>
                  </div>
                  <button class="btn-primary" style="width: 100%; justify-content: center; padding: 12px;" onclick="window.openChallanModal('${inc.id}')">
                    📜 Issue Municipal Challan (₹500) →
                  </button>
                ` : (inc.status === 'CHALLAN_ISSUED' ? `
                  <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: var(--radius-sm); padding: 12px;">
                    <div style="font-weight: 800; color: #4338ca; font-size: 0.88rem;">
                      📜 Challan Issued: ${inc.challanId}
                    </div>
                    <div style="font-size: 0.75rem; color: #3730a3; margin-top: 4px;">
                      Notice and digital payment link dispatched to citizen.
                    </div>
                    <button class="btn-secondary" style="width: 100%; margin-top: 10px; font-size: 0.8rem;" onclick="window.enterCitizenView('${inc.challanId}')">
                      Inspect Citizen View →
                    </button>
                  </div>
                ` : `
                  <div style="background: var(--red-50); border: 1px solid var(--red-100); border-radius: var(--radius-sm); padding: 12px;">
                    <div style="font-weight: 800; color: var(--red-600); font-size: 0.88rem;">
                      ✕ Detection Rejected
                    </div>
                    <div style="font-size: 0.75rem; color: #991b1b; margin-top: 4px;">
                      Reason: ${inc.rejectionDetails ? inc.rejectionDetails.reason : 'False positive'}. Synced to training loop.
                    </div>
                  </div>
                `))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  window.drawEvidenceFrame(inc);
};

window.drawEvidenceFrame = function (inc) {
  const canvas = document.getElementById("evidence-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  // If this incident has a real webcam snapshot, draw the real captured image!
  if (inc.snapshotUrl) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      [0, 1, 2, 3, 4].forEach(idx => {
        const tCanvas = document.getElementById(`thumb-${idx}`);
        if (tCanvas) {
          const tCtx = tCanvas.getContext("2d");
          tCtx.drawImage(img, 0, 0, 72, 48);
        }
      });
    };
    img.src = inc.snapshotUrl;
    return;
  }

  // Background street scene
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#1e293b");
  grad.addColorStop(0.5, "#334155");
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Sidewalk
  ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6);
  ctx.lineTo(w, h * 0.6);
  ctx.stroke();

  // Pedestrian actor
  const px = 200;
  const py = 50;
  const pw = 90;
  const ph = 180;

  // Head
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.arc(px + pw / 2, py + 30, 16, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = "#64748b";
  ctx.fillRect(px + 25, py + 48, 40, 70);

  // Legs
  ctx.fillStyle = "#475569";
  ctx.fillRect(px + 28, py + 118, 14, 60);
  ctx.fillRect(px + 48, py + 118, 14, 60);

  // Bounding Box
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(px, py, pw, ph);

  // Tag
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(px, py - 22, pw, 22);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 9px monospace";
  ctx.fillText(`${inc.trackId} | SPITTING ${inc.aiConfidence}%`, px + 4, py - 7);

  // Red spitting projectile trajectory
  ctx.fillStyle = "#ef4444";
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(px + 60 + i * 8, py + 40 + i * 9, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw thumbnails
  [0, 1, 2, 3, 4].forEach(idx => {
    const tCanvas = document.getElementById(`thumb-${idx}`);
    if (tCanvas) {
      const tCtx = tCanvas.getContext("2d");
      tCtx.fillStyle = "#1e293b";
      tCtx.fillRect(0, 0, 72, 48);
      tCtx.fillStyle = idx === 2 ? "#ef4444" : "#64748b";
      tCtx.fillRect(20, 10, 32, 28);
    }
  });
};

window.selectEvidenceFrame = function (index) {
  document.querySelectorAll(".frame-thumb").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });
};

window.toggleRejectionForm = function () {
  const form = document.getElementById("rejection-form-container");
  if (form) {
    form.classList.toggle("active");
  }
};

window.confirmVerification = function (incidentId) {
  window.store.verifyIncident(incidentId);
  const modal = document.getElementById("evidence-modal-root");
  if (modal) modal.remove();
  window.openEvidenceModal(incidentId);
  if (window.showToast) window.showToast("✓ Violation verified by Municipal Officer. Challan issuance unlocked.");
};

window.submitRejection = function (incidentId) {
  const reason = document.getElementById("rejection-reason-select").value;
  window.store.rejectIncident(incidentId, reason);
  const modal = document.getElementById("evidence-modal-root");
  if (modal) modal.remove();
  window.openEvidenceModal(incidentId);
  if (window.showToast) window.showToast(`✕ Detection rejected (${reason}). Synced to AI feedback model.`);
};

// Auto-populated Challan Modal
window.openChallanModal = function (incidentId) {
  const store = window.store;
  const inc = store.incidents.find(i => i.id === incidentId) || store.incidents[0];

  const existing = document.getElementById("challan-modal-root");
  if (existing) existing.remove();

  const challanHtml = `
    <div class="modal-overlay" id="challan-modal-root">
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Issue Municipal Cleanliness Challan</h2>
          <button class="modal-close-btn" onclick="document.getElementById('challan-modal-root').remove()">×</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.82rem; color: var(--slate-600); margin-bottom: 16px;">
            Auto-populated from Verified Incident <strong>${inc.id}</strong> (Under Section 268/Bhopal Municipal Corporation Public Health Act).
          </p>

          <form id="issue-challan-form">
            <div class="challan-form-grid">
              <div class="form-field">
                <label>Violation Type</label>
                <input type="text" value="${inc.violationType}" readonly />
              </div>
              <div class="form-field">
                <label>Statutory Fine Amount (INR)</label>
                <input type="number" id="challan-fine-input" value="500" required />
              </div>
              <div class="form-field">
                <label>Incident Date & Time</label>
                <input type="text" value="${inc.date} • ${inc.time}" readonly />
              </div>
              <div class="form-field">
                <label>Ward & Location</label>
                <input type="text" value="${inc.ward} (${inc.cameraName})" readonly />
              </div>
              <div class="form-field">
                <label>CCTV Unit Pole</label>
                <input type="text" value="${inc.cameraId}" readonly />
              </div>
              <div class="form-field">
                <label>Offender Name / ID</label>
                <input type="text" id="challan-offender-input" value="Pedestrian (Track ${inc.trackId})" required />
              </div>
            </div>

            <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 18px; font-size: 0.78rem; color: var(--slate-600);">
              📎 <strong>Attached Evidence:</strong> Keyframe snapshot #42, 30-frame temporal trajectory analysis, and Officer verification signature will be cryptographically bound to the notice.
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="btn-secondary" onclick="document.getElementById('challan-modal-root').remove()">Cancel</button>
              <button type="submit" class="btn-primary">Confirm & Issue Challan →</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', challanHtml);

  document.getElementById("issue-challan-form").onsubmit = (e) => {
    e.preventDefault();
    const fine = document.getElementById("challan-fine-input").value;
    const offender = document.getElementById("challan-offender-input").value;
    const newChallan = store.issueChallan(inc.id, fine, offender);

    document.getElementById("challan-modal-root").remove();
    const evModal = document.getElementById("evidence-modal-root");
    if (evModal) evModal.remove();

    if (window.showToast) window.showToast(`📜 Challan ${newChallan.id} successfully issued and notified to citizen.`);
    store.setView("challans");
  };
};
