// SWACHH-DRISHTI Municipal Officer Dashboard

window.renderOfficerDashboardView = function (container) {
  const store = window.store;
  let statusFilter = "ALL";

  function render() {
    const pendingCount = store.incidents.filter(i => i.status === "PENDING").length;
    const verifiedCount = store.incidents.filter(i => i.status === "VERIFIED").length;
    const alertIncident = store.incidents.find(i => i.isAlertActive && i.status === "PENDING");

    let filteredIncidents = store.incidents;
    if (statusFilter !== "ALL") {
      filteredIncidents = store.incidents.filter(i => i.status === statusFilter);
    }

    container.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-title-area">
          <h2>
            <span>Municipal Officer Workspace</span>
            <span class="status-badge status-verified">Live Operations</span>
          </h2>
          <p>Jurisdiction: Ward 12 (New Market, MP Nagar Zone-1) • Bhopal Municipal Corporation</p>
        </div>

        <div class="dashboard-quick-actions">
          <button class="btn-primary" onclick="window.store.setView('live-monitor')">
            <span>●</span> Open Live CCTV Monitor
          </button>
          <button class="btn-secondary" onclick="window.openCameraSimulation()">
            <span>⚡</span> Test Spitting Event
          </button>
        </div>
      </div>

      <!-- Top Statistics Row -->
      <div class="stats-grid">
        <!-- Stat 1: Live Cameras -->
        <div class="stat-card info">
          <div class="stat-header">
            <span class="stat-label">Live Cameras</span>
            <span class="stat-icon">📹</span>
          </div>
          <div class="stat-value">24</div>
          <div class="stat-subtext highlight">
            <span>●</span> 21 Online • 1 Degraded • 2 Offline
          </div>
        </div>

        <!-- Stat 2: AI Detections Today -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">AI Detections Today</span>
            <span class="stat-icon">🧠</span>
          </div>
          <div class="stat-value">${store.stats.detectedTotal}</div>
          <div class="stat-subtext">
            <span>YOLO + 30-Frame Temporal Analysis</span>
          </div>
        </div>

        <!-- Stat 3: Pending Verification -->
        <div class="stat-card ${pendingCount > 0 ? 'alert' : ''}">
          <div class="stat-header">
            <span class="stat-label">Pending Verification</span>
            <span class="stat-icon">⏱️</span>
          </div>
          <div class="stat-value" style="${pendingCount > 0 ? 'color: var(--red-600);' : ''}">
            0${pendingCount}
          </div>
          <div class="stat-subtext" style="${pendingCount > 0 ? 'color: var(--red-600); font-weight: 700;' : ''}">
            ⚠️ Requires Human Officer Decision
          </div>
        </div>

        <!-- Stat 4: Challans Issued -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Challans Issued</span>
            <span class="stat-icon">📜</span>
          </div>
          <div class="stat-value">${store.stats.challansIssued}</div>
          <div class="stat-subtext highlight">
            <span>₹9,500 civic fines levied</span>
          </div>
        </div>

        <!-- Stat 5: Review Requests -->
        <div class="stat-card warning">
          <div class="stat-header">
            <span class="stat-label">Review Requests</span>
            <span class="stat-icon">⚖️</span>
          </div>
          <div class="stat-value">0${store.reviews.length}</div>
          <div class="stat-subtext">
            <span>Citizen dispute appeals</span>
          </div>
        </div>
      </div>

      <!-- Live AI Alert Card (If pending detection active) -->
      ${alertIncident ? `
        <div class="ai-alert-card">
          <div class="ai-alert-header">
            <div class="alert-title">
              <span class="pulse-dot" style="background: var(--red-600);"></span>
              <span>LIVE AI ALERT — Suspected Public Gutkha/Paan Spitting</span>
            </div>
            <span class="confidence-chip">AI Confidence: ${alertIncident.aiConfidence}% (30 frames validated)</span>
          </div>

          <div class="alert-metadata">
            <div><strong>Camera:</strong> ${alertIncident.cameraId} (${alertIncident.cameraName})</div>
            <div><strong>Location:</strong> ${alertIncident.ward} • Public Sidewalk</div>
            <div><strong>Event Time:</strong> ${alertIncident.time} (Today)</div>
            <div><strong>Pedestrian Track ID:</strong> ${alertIncident.trackId} (YOLO Pose Estimated)</div>
          </div>

          <div style="font-size: 0.82rem; color: var(--slate-700); margin-bottom: 14px; background: #fff1f2; padding: 8px 12px; border-radius: 4px; border-left: 3px solid var(--red-500);">
            🛡️ <strong>Zero Auto-Fining Guarantee:</strong> AI has flagged this incident and buffered 10s pre/post footage. Fine cannot be issued without your manual review.
          </div>

          <div class="alert-actions">
            <button class="btn-primary" onclick="window.openEvidenceModal('${alertIncident.id}')">
              🔍 Open Complete Evidence Package & Verify
            </button>
            <button class="btn-secondary" onclick="window.dismissAlert('${alertIncident.id}')">
              Dismiss Notification
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Main Incidents Table Card -->
      <div class="content-card" style="margin-top: 20px;">
        <div class="content-card-header">
          <div class="content-card-title">
            <span>📋</span>
            <span>Civic Violation Incidents Queue</span>
            <span class="status-badge" style="background: var(--slate-100); color: var(--slate-700);">${filteredIncidents.length} Records</span>
          </div>

          <!-- Filters -->
          <div class="filter-group">
            <span class="filter-label">Filter Status:</span>
            <select class="filter-select" id="officer-status-filter">
              <option value="ALL" ${statusFilter === 'ALL' ? 'selected' : ''}>All Incidents</option>
              <option value="PENDING" ${statusFilter === 'PENDING' ? 'selected' : ''}>Pending Verification</option>
              <option value="VERIFIED" ${statusFilter === 'VERIFIED' ? 'selected' : ''}>Verified by Officer</option>
              <option value="CHALLAN_ISSUED" ${statusFilter === 'CHALLAN_ISSUED' ? 'selected' : ''}>Challan Issued</option>
              <option value="REJECTED" ${statusFilter === 'REJECTED' ? 'selected' : ''}>Rejected (False Positive)</option>
            </select>
          </div>
        </div>

        <div class="content-card-body" style="padding: 0;">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Detected Time</th>
                  <th>Camera & Ward</th>
                  <th>Violation Type</th>
                  <th>AI Confidence</th>
                  <th>Human Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredIncidents.length === 0 ? `
                  <tr>
                    <td colspan="7">
                      <div class="empty-state">
                        <div class="empty-state-icon">✅</div>
                        <h3>No Incidents in this filter</h3>
                        <p>All suspected detections have been processed or none match the selected criteria.</p>
                      </div>
                    </td>
                  </tr>
                ` : filteredIncidents.map(inc => {
                  let statusHtml = '';
                  if (inc.status === 'PENDING') statusHtml = '<span class="status-badge status-pending">⏱️ Pending Verification</span>';
                  else if (inc.status === 'VERIFIED') statusHtml = '<span class="status-badge status-verified">✓ Verified</span>';
                  else if (inc.status === 'CHALLAN_ISSUED') statusHtml = '<span class="status-badge status-challan">📜 Challan Issued</span>';
                  else if (inc.status === 'REJECTED') statusHtml = '<span class="status-badge status-rejected">✕ Rejected</span>';

                  return `
                    <tr>
                      <td>${statusHtml}</td>
                      <td>
                        <strong style="font-family: monospace;">${inc.time}</strong>
                        <div style="font-size: 0.72rem; color: var(--slate-400);">${inc.date}</div>
                      </td>
                      <td>
                        <div style="font-weight: 700; color: var(--slate-900); font-family: monospace;">${inc.cameraId}</div>
                        <div style="font-size: 0.75rem; color: var(--slate-500);">${inc.ward} (${inc.cameraName})</div>
                      </td>
                      <td>
                        <span style="font-weight: 600;">${inc.violationType}</span>
                        <div style="font-size: 0.72rem; color: var(--slate-400); font-family: monospace;">Track: ${inc.trackId}</div>
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <strong style="font-size: 0.95rem; color: ${inc.aiConfidence >= 80 ? 'var(--red-600)' : 'var(--amber-600)'};">${inc.aiConfidence}%</strong>
                          <span style="font-size: 0.7rem; color: var(--slate-500);">(30-f)</span>
                        </div>
                      </td>
                      <td>
                        ${inc.officerVerification ? `
                          <div style="font-size: 0.8rem; font-weight: 600; color: #15803d;">
                            ${inc.officerVerification.verifiedBy}
                          </div>
                          <div style="font-size: 0.7rem; color: var(--slate-400);">${inc.officerVerification.verifiedAt}</div>
                        ` : (inc.rejectionDetails ? `
                          <div style="font-size: 0.8rem; font-weight: 600; color: var(--red-600);">
                            Rejected: ${inc.rejectionDetails.reason}
                          </div>
                          <div style="font-size: 0.7rem; color: var(--slate-400);">${inc.rejectionDetails.rejectedAt}</div>
                        ` : `
                          <span style="color: var(--amber-600); font-size: 0.8rem; font-weight: 700;">Awaiting Inspection</span>
                        `)}
                      </td>
                      <td>
                        <div style="display: flex; gap: 6px;">
                          <button class="btn-secondary" style="padding: 5px 10px; font-size: 0.78rem;" onclick="window.openEvidenceModal('${inc.id}')">
                            Evidence
                          </button>
                          ${inc.status === 'VERIFIED' ? `
                            <button class="btn-primary" style="padding: 5px 10px; font-size: 0.78rem;" onclick="window.openChallanModal('${inc.id}')">
                              Issue Challan
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- False-Positive Training Feedback Badge -->
      <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: var(--slate-600);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.25rem;">🔁</span>
          <div>
            <strong>Continuous Edge AI Feedback Loop:</strong>
            Rejected false-positives (${store.stats.rejectedTotal} cases today) are automatically categorized (eating, drinking, coughing) and synced to the model retraining buffer.
          </div>
        </div>
        <button class="btn-secondary" style="font-size: 0.78rem;" onclick="window.store.setView('analytics')">
          View Model Performance →
        </button>
      </div>
    `;

    document.getElementById("officer-status-filter").onchange = (e) => {
      statusFilter = e.target.value;
      render();
    };
  }

  render();
};

window.dismissAlert = function (incidentId) {
  const inc = window.store.incidents.find(i => i.id === incidentId);
  if (inc) {
    inc.isAlertActive = false;
    window.store.notify("incident_updated", inc);
  }
};
