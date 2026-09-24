// SWACHH-DRISHTI Municipal Head Supervisory Dashboard

window.renderHeadDashboardView = function (container) {
  const store = window.store;

  function render() {
    const pendingReviews = store.reviews.filter(r => r.status === "PENDING_HEAD" || r.status === "PENDING_FORWARD");
    const activeCameras = store.cameras.filter(c => c.status === "ONLINE").length;
    const totalCollected = store.challans.filter(c => c.status === "PAID").length * 500;

    container.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-title-area">
          <h2>
            <span>Municipal Head Supervisory Authority</span>
            <span class="status-badge" style="background: #fef3c7; color: #b45309; border-color: #fde68a;">Executive Portal</span>
          </h2>
          <p>Jurisdiction: Bhopal Municipal Corporation (BMC Central Command) • All 85 Administrative Wards</p>
        </div>

        <div class="dashboard-quick-actions">
          <button class="btn-primary" style="background: #b45309; border: 1px solid #78350f;" onclick="window.confirmSwitchToOfficer()">
            <span>⇄</span> Switch to Officer Dashboard
          </button>
          <button class="btn-secondary" onclick="window.store.setView('hotspots')">
            <span>🗺️</span> Ward Cleanliness Hotspots
          </button>
        </div>
      </div>

      <!-- Executive Top Statistics -->
      <div class="stats-grid">
        <div class="stat-card info">
          <div class="stat-header">
            <span class="stat-label">Citywide Active Cameras</span>
            <span class="stat-icon">📹</span>
          </div>
          <div class="stat-value">24</div>
          <div class="stat-subtext highlight">
            <span>● ${activeCameras} Cameras Streaming (92% Uptime)</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Today's Violations Flagged</span>
            <span class="stat-icon">🚨</span>
          </div>
          <div class="stat-value">${store.stats.detectedTotal}</div>
          <div class="stat-subtext">
            <span>${store.stats.verifiedTotal} verified by officers</span>
          </div>
        </div>

        <div class="stat-card ${pendingReviews.length > 0 ? 'alert' : ''}">
          <div class="stat-header">
            <span class="stat-label">Pending Appeal Reviews</span>
            <span class="stat-icon">⚖️</span>
          </div>
          <div class="stat-value" style="${pendingReviews.length > 0 ? 'color: #b45309;' : ''}">
            0${pendingReviews.length}
          </div>
          <div class="stat-subtext" style="${pendingReviews.length > 0 ? 'color: #b45309; font-weight: 700;' : ''}">
            Requires Head Adjudication
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Challans Enforced</span>
            <span class="stat-icon">📜</span>
          </div>
          <div class="stat-value">${store.stats.challansIssued}</div>
          <div class="stat-subtext highlight">
            <span>Zero auto-fined; 100% human-verified</span>
          </div>
        </div>

        <div class="stat-card purple">
          <div class="stat-header">
            <span class="stat-label">Civic Revenue Realized</span>
            <span class="stat-icon">₹</span>
          </div>
          <div class="stat-value">₹${totalCollected.toLocaleString()}</div>
          <div class="stat-subtext">
            <span>Credited to Ward Sanitation Fund</span>
          </div>
        </div>
      </div>

      <!-- Main Supervisory Content Layout -->
      <div class="head-hero-grid">
        
        <!-- Left: Citizen Review Appeals Awaiting Head Decision -->
        <div class="content-card">
          <div class="content-card-header">
            <div class="content-card-title">
              <span>⚖️</span>
              <span>Citizen Dispute Appeals (Head Review Docket)</span>
              <span class="status-badge" style="background: #fef3c7; color: #b45309;">${pendingReviews.length} Pending</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--slate-500);">Statutory Authority: BMC Section 32(A)</span>
          </div>

          <div class="content-card-body" style="padding: 0;">
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Appeal Ref</th>
                    <th>Challan ID</th>
                    <th>Citizen & Grounds</th>
                    <th>Officer Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${store.reviews.length === 0 ? `
                    <tr>
                      <td colspan="5">
                        <div class="empty-state">
                          <div class="empty-state-icon">⚖️</div>
                          <h3>No Citizen Review Appeals</h3>
                          <p>All citizen appeals have been adjudicated.</p>
                        </div>
                      </td>
                    </tr>
                  ` : store.reviews.map(rev => {
                    const ch = store.challans.find(c => c.id === rev.challanId);
                    let statusBadge = '';
                    if (rev.status === 'PENDING_HEAD') statusBadge = '<span class="status-badge" style="background: #fef3c7; color: #b45309;">Awaiting Head Decision</span>';
                    else if (rev.status === 'CONFIRMED') statusBadge = '<span class="status-badge status-confirmed">✓ Challan Upheld</span>';
                    else if (rev.status === 'CANCELLED') statusBadge = '<span class="status-badge status-cancelled">✕ Challan Waived</span>';
                    else if (rev.status === 'MORE_INFO') statusBadge = '<span class="status-badge status-pending">More Info Requested</span>';
                    else statusBadge = '<span class="status-badge status-review">With Officer</span>';

                    return `
                      <tr>
                        <td>
                          <strong style="font-family: monospace; color: #b45309;">${rev.id}</strong>
                          <div style="font-size: 0.72rem; color: var(--slate-400);">${rev.submittedAt}</div>
                        </td>
                        <td>
                          <span style="font-family: monospace; font-weight: 700;">${rev.challanId}</span>
                          <div style="font-size: 0.72rem; color: var(--slate-500);">${ch ? ch.ward : ''}</div>
                        </td>
                        <td style="max-width: 260px;">
                          <div style="font-weight: 700; color: var(--slate-900); font-size: 0.82rem;">${rev.submittedBy}</div>
                          <div style="font-size: 0.75rem; color: var(--slate-600); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            "${rev.reason}"
                          </div>
                          ${rev.attachmentName ? `
                            <div style="font-size: 0.72rem; color: var(--teal-700); margin-top: 3px; display: flex; align-items: center; gap: 6px;">
                              <span>📎 ${rev.attachmentName}</span>
                              <button class="btn-link" style="font-size: 0.72rem; color: var(--teal-800); font-weight: 800; text-decoration: underline; background: none; border: none; padding: 0; cursor: pointer;" onclick="window.openCitizenEvidenceModal('${rev.id}')">
                                👁️ View Evidence
                              </button>
                            </div>
                          ` : ''}
                        </td>
                        <td>
                          ${statusBadge}
                          ${rev.officerNote ? `
                            <div style="font-size: 0.7rem; color: var(--slate-500); margin-top: 2px;">
                              Note: ${rev.officerNote}
                            </div>
                          ` : ''}
                        </td>
                        <td>
                          <button class="btn-primary" style="padding: 6px 12px; font-size: 0.78rem; background: #b45309;" onclick="window.openReviewAdjudicationModal('${rev.id}')">
                            Adjudicate Appeal
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Ward-Level Sanitation Performance -->
        <div class="content-card">
          <div class="content-card-header">
            <div class="content-card-title">
              <span>📊</span>
              <span>Ward Performance Index</span>
            </div>
            <button class="btn-secondary" style="font-size: 0.75rem; padding: 4px 8px;" onclick="window.store.setView('hotspots')">
              Full Map →
            </button>
          </div>

          <div class="content-card-body">
            <p style="font-size: 0.8rem; color: var(--slate-500); margin-bottom: 16px;">
              Violations flagged vs Officer verification compliance:
            </p>

            ${store.wards.map(ward => {
              const pct = Math.round((ward.verifiedCount / ward.incidentCount) * 100) || 0;
              return `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                    <span style="font-weight: 700; color: var(--slate-800);">${ward.name} (${ward.locality.split(',')[0]})</span>
                    <span style="font-weight: 700; color: ${ward.color};">${ward.incidentCount} Violations (${pct}% Verified)</span>
                  </div>
                  <div style="height: 8px; background: var(--slate-100); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${ward.color}; border-radius: 4px;"></div>
                  </div>
                </div>
              `;
            }).join('')}

            <div style="margin-top: 20px; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 12px; font-size: 0.78rem; color: var(--slate-600);">
              📍 <strong>Supervisory Note:</strong> Ward 12 (New Market) shows elevated spitting density along pedestrian corridors. Additional sanitation squad patrols recommended.
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Switch Confirmation Modal Container will be inserted if triggered -->
    `;
  }

  render();
};

window.confirmSwitchToOfficer = function () {
  const modalHtml = `
    <div class="modal-overlay" id="switch-modal">
      <div class="modal-card" style="max-width: 480px;">
        <div class="modal-header">
          <h2>Switch to Officer Dashboard?</h2>
          <button class="modal-close-btn" onclick="document.getElementById('switch-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.9rem; color: var(--slate-600); margin-bottom: 16px;">
            As <strong>Municipal Head</strong>, you are switching to the operational <strong>Municipal Officer View</strong> to inspect live camera streams and field-level evidence packages.
          </p>
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: #92400e; margin-bottom: 20px;">
            ℹ️ A persistent banner will remain visible at the top so you can return to the Head Dashboard at any time without logging out.
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn-secondary" onclick="document.getElementById('switch-modal').remove()">Cancel</button>
            <button class="btn-primary" style="background: #b45309;" onclick="window.proceedSwitchToOfficer()">Continue to Officer View →</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.proceedSwitchToOfficer = function () {
  const modal = document.getElementById('switch-modal');
  if (modal) modal.remove();
  window.store.switchHeadToOfficer();
  window.store.setView('dashboard');
};
