// SWACHH-DRISHTI Audit Log & Continuous AI Model Feedback Analytics

window.renderAuditView = function (container) {
  const store = window.store;

  container.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-title-area">
        <h2>
          <span>Statutory Audit Trail & AI Governance</span>
          <span class="status-badge status-verified">Immutable Log</span>
        </h2>
        <p>Bhopal Municipal Corporation • Civic Traceability & Edge Model Retraining Metrics</p>
      </div>
    </div>

    <!-- AI False Positive Feedback & Analytics Grid -->
    <div class="stats-grid" style="margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Total AI Flagged Events</span>
          <span class="stat-icon">🧠</span>
        </div>
        <div class="stat-value">100</div>
        <div class="stat-subtext">30-frame temporal evaluations</div>
      </div>

      <div class="stat-card info">
        <div class="stat-header">
          <span class="stat-label">Human Verified (True Positive)</span>
          <span class="stat-icon">✓</span>
        </div>
        <div class="stat-value" style="color: #15803d;">72</div>
        <div class="stat-subtext highlight">72% Initial Edge Accuracy</div>
      </div>

      <div class="stat-card alert">
        <div class="stat-header">
          <span class="stat-label">Human Rejected (False Positive)</span>
          <span class="stat-icon">✕</span>
        </div>
        <div class="stat-value" style="color: var(--red-600);">28</div>
        <div class="stat-subtext" style="color: var(--red-600); font-weight: 700;">Zero auto-fining prevented error</div>
      </div>

      <div class="stat-card purple">
        <div class="stat-header">
          <span class="stat-label">Appeals Confirmed by Head</span>
          <span class="stat-icon">⚖️</span>
        </div>
        <div class="stat-value">85%</div>
        <div class="stat-subtext">High evidentiary standard</div>
      </div>
    </div>

    <!-- Rejection Categories Feedback Card -->
    <div class="content-card">
      <div class="content-card-header">
        <div class="content-card-title">
          <span>🔁</span>
          <span>AI False-Positive Feedback Dataset (Continuous Retraining)</span>
        </div>
        <span style="font-size: 0.75rem; color: var(--slate-500);">Synced to YOLO / Pose Weight Optimizer</span>
      </div>

      <div class="content-card-body">
        <p style="font-size: 0.82rem; color: var(--slate-600); margin-bottom: 16px;">
          When a Municipal Officer rejects a suspected detection, the classified error is stored with keyframe landmarks to refine the behaviour classifier:
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
              <span><strong>Drinking / Sipping Water from Bottle</strong> (Hand to mouth false trigger)</span>
              <strong>12 cases (43%)</strong>
            </div>
            <div style="height: 10px; background: var(--slate-100); border-radius: 5px; overflow: hidden;">
              <div style="width: 43%; height: 100%; background: #0d9488; border-radius: 5px;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
              <span><strong>Coughing / Sneezing into Handkerchief</strong> (Rapid head nod)</span>
              <strong>8 cases (29%)</strong>
            </div>
            <div style="height: 10px; background: var(--slate-100); border-radius: 5px; overflow: hidden;">
              <div style="width: 29%; height: 100%; background: #f59e0b; border-radius: 5px;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
              <span><strong>Touching Face / Wiping Mouth / Talking</strong></span>
              <strong>5 cases (18%)</strong>
            </div>
            <div style="height: 10px; background: var(--slate-100); border-radius: 5px; overflow: hidden;">
              <div style="width: 18%; height: 100%; background: #3b82f6; border-radius: 5px;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
              <span><strong>Insufficient Camera Lighting / Obscured Angle</strong></span>
              <strong>3 cases (10%)</strong>
            </div>
            <div style="height: 10px; background: var(--slate-100); border-radius: 5px; overflow: hidden;">
              <div style="width: 10%; height: 100%; background: #94a3b8; border-radius: 5px;"></div>
            </div>
          </div>
        </div>

        <div style="margin-top: 18px; padding: 10px 14px; background: var(--primary-50); border: 1px solid var(--primary-100); border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--primary-900);">
          💡 <em>"False-positive feedback is automatically compiled to fine-tune edge neural model weights every 48 hours without compromising civic privacy."</em>
        </div>
      </div>
    </div>

    <!-- Chronological Audit Log Table -->
    <div class="content-card">
      <div class="content-card-header">
        <div class="content-card-title">
          <span>📜</span>
          <span>Chronological Enforcement Audit Trail</span>
        </div>
        <span style="font-family: monospace; font-size: 0.75rem; color: var(--slate-500);">SHA-256 Ledger Signed</span>
      </div>

      <div class="content-card-body" style="padding: 0;">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator / System</th>
                <th>Role</th>
                <th>Action Performed</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
              </tr>
            </thead>
            <tbody>
              ${store.auditLogs.map(log => `
                <tr>
                  <td style="font-family: monospace; font-weight: 700; color: var(--slate-600);">${log.time}</td>
                  <td style="font-weight: 700; color: var(--slate-900); font-size: 0.82rem;">${log.user}</td>
                  <td>
                    <span class="status-badge" style="${
                      log.role === 'SYSTEM' ? 'background: #e0f2fe; color: #0369a1;' :
                      (log.role === 'MUNICIPAL_HEAD' ? 'background: #fef3c7; color: #b45309;' :
                      (log.role === 'MUNICIPAL_OFFICER' ? 'background: #dcfce7; color: #15803d;' :
                      'background: var(--slate-100); color: var(--slate-700);'))
                    }">
                      ${log.role}
                    </span>
                  </td>
                  <td style="font-size: 0.82rem; color: var(--slate-800);">${log.action}</td>
                  <td style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase;">${log.entity}</td>
                  <td style="font-family: monospace; font-size: 0.78rem; font-weight: 700; color: var(--teal-700);">${log.entityId}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Civic Violation Incident Tracker (Below Audit & AI Metrics) -->
    <div class="content-card" style="margin-top: 24px; border: 2px solid var(--primary-500);">
      <div class="content-card-header" style="background: var(--bg-surface-elevated);">
        <div class="content-card-title">
          <span>📍</span>
          <span>Civic Violation Incident Traceability & Tracker</span>
        </div>
        <span class="status-badge status-verified">Track ID Search</span>
      </div>

      <div class="content-card-body">
        <p style="font-size: 0.82rem; color: var(--slate-600); margin-bottom: 14px;">
          Track any detected municipal spitting event from raw CCTV optical tracking, neural behaviour filtering, biometric verification, to e-Challan generation & citizen dispute resolution:
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px;">
          <input 
            type="text" 
            id="audit-tracker-input" 
            placeholder="Enter Optical Track ID (e.g. P-014, P-009, P-003, P-022) or Incident ID..."
            value="P-014"
            style="flex: 1; min-width: 250px; padding: 10px 14px; font-family: monospace; font-size: 0.88rem; font-weight: 700; border: 1px solid var(--border-main); border-radius: var(--radius-sm); background: var(--bg-surface-elevated); color: var(--text-main);"
          />
          <button class="btn-primary" style="padding: 10px 20px; font-size: 0.85rem;" onclick="window.trackFromAuditView()">
            <span>🔍</span>
            <span>Track Incident Details →</span>
          </button>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: 0.74rem; color: var(--text-muted); font-weight: 700;">Fast Tracker Presets:</span>
          
          <button class="btn-sim" style="font-size: 0.72rem; padding: 4px 8px; font-family: monospace;" onclick="window.trackPresetFromAudit('P-014')">
            Track P-014 (Pending Review)
          </button>
          <button class="btn-sim" style="font-size: 0.72rem; padding: 4px 8px; font-family: monospace;" onclick="window.trackPresetFromAudit('P-009')">
            Track P-009 (Challan Issued)
          </button>
          <button class="btn-sim" style="font-size: 0.72rem; padding: 4px 8px; font-family: monospace; color: #dc2626; border-color: #fca5a5;" onclick="window.trackPresetFromAudit('P-003')">
            Track P-003 (False Positive Rejection)
          </button>
          <button class="btn-sim" style="font-size: 0.72rem; padding: 4px 8px; font-family: monospace; color: #0f766e; border-color: #99f6e4;" onclick="window.trackPresetFromAudit('P-022')">
            Track P-022 (Citizen Medical Appeal)
          </button>
        </div>
      </div>
    </div>
  `;
};

window.trackFromAuditView = function () {
  const input = document.getElementById("audit-tracker-input");
  const trackId = input ? input.value.trim() : "P-014";
  window.selectedTrackingId = trackId;
  window.store.setView("incident-tracker");
};

window.trackPresetFromAudit = function (trackId) {
  window.selectedTrackingId = trackId;
  window.store.setView("incident-tracker");
};
