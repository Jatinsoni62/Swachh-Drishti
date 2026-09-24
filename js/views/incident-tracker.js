// SWACHH-DRISHTI Civic Violation Incident Tracker
// Real-time end-to-end incident lifecycle tracking by Track ID, Incident ID, or Challan ID

window.selectedTrackingId = window.selectedTrackingId || "P-014";

window.renderIncidentTrackerView = function (container) {
  const store = window.store;

  // Find incident based on selectedTrackingId (match by trackId, id, or challanId)
  const query = (window.selectedTrackingId || "P-014").trim().toUpperCase();

  let matchedIncident = store.incidents.find(i => 
    (i.trackId && i.trackId.toUpperCase() === query) ||
    (i.id && i.id.toUpperCase() === query)
  );

  let matchedChallan = null;
  let matchedReview = null;

  if (matchedIncident) {
    matchedChallan = store.challans.find(c => c.incidentId === matchedIncident.id);
  } else {
    // Try matching by Challan ID
    matchedChallan = store.challans.find(c => c.id && c.id.toUpperCase() === query);
    if (matchedChallan) {
      matchedIncident = store.incidents.find(i => i.id === matchedChallan.incidentId);
    }
  }

  // If still not matched, check reviews
  if (!matchedIncident) {
    matchedReview = store.reviews.find(r => 
      (r.id && r.id.toUpperCase() === query) ||
      (r.challanId && r.challanId.toUpperCase() === query) ||
      (r.incidentId && r.incidentId.toUpperCase() === query)
    );
    if (matchedReview) {
      matchedIncident = store.incidents.find(i => i.id === matchedReview.incidentId);
      matchedChallan = store.challans.find(c => c.id === matchedReview.challanId);
    }
  }

  if (matchedChallan) {
    matchedReview = store.reviews.find(r => r.challanId === matchedChallan.id);
  }

  // Fallback to primary demonstration incident if nothing matches
  const inc = matchedIncident || store.incidents[0];
  const ch = matchedChallan || (inc ? store.challans.find(c => c.incidentId === inc.id) : null);
  const rev = matchedReview || (ch ? store.reviews.find(r => r.challanId === ch.id) : null);

  // Determine stage progression (1 to 5)
  // Stage 1: Optical Detection (always done)
  // Stage 2: AI Inference (always done)
  // Stage 3: Biometric Match
  // Stage 4: Officer Verification (VERIFIED or REJECTED)
  // Stage 5: Challan / Dispute Resolution
  let currentStage = 2;
  if (inc) {
    if (inc.status === "PENDING") {
      currentStage = 3;
    } else if (inc.status === "REJECTED") {
      currentStage = 4; // Rejection completed at Stage 4
    } else if (inc.status === "VERIFIED" || inc.status === "CHALLAN_ISSUED") {
      currentStage = ch ? 5 : 4;
    }
  }

  container.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-title-area">
        <h2>
          <span>Civic Violation Incident Tracker</span>
          <span class="status-badge status-verified">Live Telemetry</span>
        </h2>
        <p>Bhopal Municipal Corporation • Real-time Traceability by Optical Track ID or Incident Ref</p>
      </div>

      <div class="dashboard-actions">
        <button class="btn-secondary" onclick="window.store.setView('analytics')">
          <span>🔁</span>
          <span>View Audit & AI Metrics</span>
        </button>
        <button class="btn-primary" onclick="window.store.setView('live-monitor')">
          <span>📹</span>
          <span>Live Camera Monitor</span>
        </button>
      </div>
    </div>

    <!-- Search / Track ID Query Card -->
    <div class="content-card" style="margin-bottom: 24px;">
      <div class="content-card-body" style="padding: 20px;">
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
          🔎 Track Civic Violation by Track ID, Incident ID, or Challan Ref:
        </div>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px; position: relative;">
            <input 
              type="text" 
              id="tracker-search-input" 
              class="filter-select" 
              style="width: 100%; font-size: 0.95rem; padding: 10px 14px; font-family: monospace; font-weight: 700; border: 2px solid var(--primary-500); border-radius: var(--radius-sm); background: var(--bg-surface-elevated);"
              placeholder="Enter Track ID (e.g. P-014, P-009, P-003, P-022) or Incident ID..."
              value="${window.selectedTrackingId || 'P-014'}"
            />
          </div>
          <button class="btn-primary" style="padding: 10px 22px; font-size: 0.9rem;" onclick="window.executeIncidentTrackSearch()">
            <span>📍</span>
            <span>Track Incident</span>
          </button>
        </div>

        <!-- Quick Demonstration Pills -->
        <div style="margin-top: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Demo Quick-Tracks:</span>
          
          <button class="btn-sim" style="font-size: 0.74rem; padding: 4px 10px; font-family: monospace;" onclick="window.setTrackIdAndSearch('P-014')">
            📍 Track ID: P-014 (Pending Review • New Market)
          </button>

          <button class="btn-sim" style="font-size: 0.74rem; padding: 4px 10px; font-family: monospace;" onclick="window.setTrackIdAndSearch('P-009')">
            📍 Track ID: P-009 (Challan Issued • VIP Road)
          </button>

          <button class="btn-sim" style="font-size: 0.74rem; padding: 4px 10px; font-family: monospace; border-color: #fca5a5; color: #b91c1c;" onclick="window.setTrackIdAndSearch('P-003')">
            📍 Track ID: P-003 (False-Positive Prevented • Bittan Market)
          </button>

          <button class="btn-sim" style="font-size: 0.74rem; padding: 4px 10px; font-family: monospace; border-color: #99f6e4; color: #0f766e;" onclick="window.setTrackIdAndSearch('P-022')">
            📍 Track ID: P-022 (Appealed with Doctor's Evidence)
          </button>

          <button class="btn-sim" style="font-size: 0.74rem; padding: 4px 10px; font-family: monospace;" onclick="window.setTrackIdAndSearch('SD-2026-001284')">
            📜 Challan: SD-2026-001284
          </button>
        </div>
      </div>
    </div>

    ${inc ? `
      <!-- Incident Overview Header Card -->
      <div class="content-card" style="margin-bottom: 24px; border-left: 5px solid ${inc.status === 'REJECTED' ? '#ef4444' : (inc.status === 'VERIFIED' || ch ? '#10b981' : '#f59e0b')};">
        <div class="content-card-body" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--text-main);">
                  Incident: <span style="font-family: monospace; color: var(--primary-700);">${inc.id}</span>
                </h3>
                <span class="status-badge" style="background: #e0f2fe; color: #0369a1; font-family: monospace; font-weight: 800; font-size: 0.8rem; padding: 4px 10px;">
                  Optical Track ID: ${inc.trackId || 'N/A'}
                </span>
                <span class="status-badge ${inc.status === 'VERIFIED' ? 'status-verified' : (inc.status === 'REJECTED' ? 'status-rejected' : 'status-pending')}" style="font-weight: 800; font-size: 0.8rem; padding: 4px 10px;">
                  ${inc.status === 'VERIFIED' ? '✓ STATUTORY VIOLATION CONFIRMED' : (inc.status === 'REJECTED' ? '✕ REJECTED AS FALSE-POSITIVE' : '⏳ PENDING OFFICER VERIFICATION')}
                </span>
              </div>

              <div style="display: flex; gap: 18px; margin-top: 8px; font-size: 0.82rem; color: var(--text-secondary); flex-wrap: wrap;">
                <span>📍 <strong>Location:</strong> ${inc.ward} • ${inc.cameraName || inc.cameraId}</span>
                <span>🕒 <strong>Timestamp:</strong> ${inc.date} ${inc.time}</span>
                <span>🧠 <strong>AI Confidence:</strong> ${inc.aiConfidence}%</span>
                <span>⚠️ <strong>Offense Type:</strong> ${inc.violationType || 'Public Spitting Violation'}</span>
              </div>
            </div>

            <!-- Action Buttons for this Incident -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn-primary" style="font-size: 0.82rem; padding: 8px 14px;" onclick="window.openEvidenceModal('${inc.id}')">
                <span>📹</span>
                <span>View CCTV Video Evidence</span>
              </button>

              ${rev && rev.attachmentName ? `
                <button class="btn-secondary" style="font-size: 0.82rem; padding: 8px 14px; color: var(--teal-800); border-color: var(--teal-400); background: #f0fdfa; font-weight: 700;" onclick="window.openCitizenEvidenceModal('${rev.id}')">
                  <span>📄</span>
                  <span>View Citizen Evidence Docket</span>
                </button>
              ` : ''}

              ${ch ? `
                <button class="btn-secondary" style="font-size: 0.82rem; padding: 8px 14px;" onclick="window.enterCitizenView('${ch.id}')">
                  <span>📜</span>
                  <span>View Challan (${ch.id})</span>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- 5-Stage Lifecycle Stepper -->
      <div class="content-card" style="margin-bottom: 24px;">
        <div class="content-card-header">
          <div class="content-card-title">
            <span>🗺️</span>
            <span>Civic Violation Incident Lifecycle Pipeline</span>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">Zero Auto-Fining Architecture</span>
        </div>

        <div class="content-card-body" style="padding: 24px 20px;">
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; position: relative;">
            
            <!-- Step 1: CCTV Optical Capture -->
            <div style="background: ${currentStage >= 1 ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)'}; border: 2px solid ${currentStage >= 1 ? '#10b981' : 'var(--border-main)'}; border-radius: 8px; padding: 14px; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 1.2rem;">📹</span>
                <span style="font-size: 0.7rem; font-weight: 800; color: #10b981; font-family: monospace;">STAGE 1</span>
              </div>
              <strong style="font-size: 0.82rem; color: var(--text-main); display: block;">Optical Capture</strong>
              <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px;">
                CCTV Pole ${inc.cameraId} locked on pedestrian. Optical Track <code>${inc.trackId || 'P-014'}</code> initialized.
              </div>
              <div style="margin-top: 8px; font-size: 0.68rem; color: #059669; font-weight: 700;">
                ✓ 30 FPS Stream Captured
              </div>
            </div>

            <!-- Step 2: AI Temporal Inference -->
            <div style="background: ${currentStage >= 2 ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)'}; border: 2px solid ${currentStage >= 2 ? '#10b981' : 'var(--border-main)'}; border-radius: 8px; padding: 14px; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 1.2rem;">🧠</span>
                <span style="font-size: 0.7rem; font-weight: 800; color: #10b981; font-family: monospace;">STAGE 2</span>
              </div>
              <strong style="font-size: 0.82rem; color: var(--text-main); display: block;">AI Filter Inference</strong>
              <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px;">
                30-frame sequence analyzed. Confidence: <strong>${inc.aiConfidence}%</strong>. Drinking filter passed.
              </div>
              <div style="margin-top: 8px; font-size: 0.68rem; color: #059669; font-weight: 700;">
                ✓ Behaviour Classified
              </div>
            </div>

            <!-- Step 3: Biometric Match -->
            <div style="background: ${currentStage >= 3 ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)'}; border: 2px solid ${currentStage >= 3 ? '#10b981' : 'var(--border-main)'}; border-radius: 8px; padding: 14px; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 1.2rem;">👤</span>
                <span style="font-size: 0.7rem; font-weight: 800; color: #10b981; font-family: monospace;">STAGE 3</span>
              </div>
              <strong style="font-size: 0.82rem; color: var(--text-main); display: block;">Biometric Face Match</strong>
              <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px;">
                Subject matched to Bhopal Citizen Registry. Enrolled photo ID verified.
              </div>
              <div style="margin-top: 8px; font-size: 0.68rem; color: #059669; font-weight: 700;">
                ✓ Citizen Linked (${ch ? ch.offenderName : (store.activeCitizen ? store.activeCitizen.name : 'Adarsh Patel')})
              </div>
            </div>

            <!-- Step 4: Officer Verification -->
            <div style="background: ${currentStage >= 4 ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)'}; border: 2px solid ${inc.status === 'REJECTED' ? '#ef4444' : (currentStage >= 4 ? '#10b981' : 'var(--border-main)')}; border-radius: 8px; padding: 14px; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 1.2rem;">⚖️</span>
                <span style="font-size: 0.7rem; font-weight: 800; color: ${inc.status === 'REJECTED' ? '#ef4444' : '#10b981'}; font-family: monospace;">STAGE 4</span>
              </div>
              <strong style="font-size: 0.82rem; color: var(--text-main); display: block;">Officer Verification</strong>
              <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px;">
                ${inc.status === 'REJECTED' 
                  ? 'Officer inspected keyframes: Misidentified drinking action. Zero fine issued.' 
                  : (currentStage >= 4 ? 'Municipal Inspector verified ground residue and oral trajectory.' : 'In queue for statutory human inspection.')}
              </div>
              <div style="margin-top: 8px; font-size: 0.68rem; color: ${inc.status === 'REJECTED' ? '#dc2626' : (currentStage >= 4 ? '#059669' : '#f59e0b')}; font-weight: 700;">
                ${inc.status === 'REJECTED' ? '✕ False-Positive Dismissed' : (currentStage >= 4 ? '✓ Human Verified' : '⏳ Awaiting Inspection')}
              </div>
            </div>

            <!-- Step 5: Challan & Dispute Resolution -->
            <div style="background: ${currentStage >= 5 ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)'}; border: 2px solid ${rev ? '#0ea5e9' : (currentStage >= 5 ? '#10b981' : 'var(--border-main)')}; border-radius: 8px; padding: 14px; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 1.2rem;">📜</span>
                <span style="font-size: 0.7rem; font-weight: 800; color: ${rev ? '#0284c7' : '#10b981'}; font-family: monospace;">STAGE 5</span>
              </div>
              <strong style="font-size: 0.82rem; color: var(--text-main); display: block;">Challan & Dispute</strong>
              <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px;">
                ${ch ? `Challan ${ch.id} (₹${ch.fineAmount}). ${rev ? 'Appeal & medical proof submitted.' : (ch.paymentStatus === 'PAID' ? 'Fine paid.' : 'Pending payment.')}` : 'No challan generated.'}
              </div>
              <div style="margin-top: 8px; font-size: 0.68rem; color: ${rev ? '#0284c7' : (ch && ch.paymentStatus === 'PAID' ? '#059669' : '#d97706')}; font-weight: 700;">
                ${rev ? '⚖️ Dispute / Evidence Under Review' : (ch ? (ch.paymentStatus === 'PAID' ? '✓ Resolved & Paid' : '⚠️ Payment Outstanding') : '—')}
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Detailed Telemetry & Forensic Audit Grid -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px;">
        
        <!-- Left: Incident Telemetry & Checklist -->
        <div class="content-card">
          <div class="content-card-header">
            <div class="content-card-title">
              <span>🔬</span>
              <span>Computer Vision Diagnostic Checklist</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">Track ID: ${inc.trackId || 'P-014'}</span>
          </div>

          <div class="content-card-body">
            <div style="display: flex; flex-direction: column; gap: 10px;">
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-subtle); border-radius: 4px; border: 1px solid var(--border-main);">
                <div>
                  <strong style="font-size: 0.8rem; color: var(--text-main);">1. Pedestrian Bounding Box Detection</strong>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">YOLOv8 Edge model on CCTV ${inc.cameraId}</div>
                </div>
                <span class="status-badge status-verified" style="font-size: 0.7rem;">96% CONF</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-subtle); border-radius: 4px; border: 1px solid var(--border-main);">
                <div>
                  <strong style="font-size: 0.8rem; color: var(--text-main);">2. Head & Mouth Landmark Tracking</strong>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">17-point skeletal pose estimation</div>
                </div>
                <span class="status-badge status-verified" style="font-size: 0.7rem;">92% CONF</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-subtle); border-radius: 4px; border: 1px solid var(--border-main);">
                <div>
                  <strong style="font-size: 0.8rem; color: var(--text-main);">3. Multi-Stage False-Positive Filter</strong>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">Drinking bottle / Cough handkerchief occlusion check</div>
                </div>
                <span class="status-badge ${inc.status === 'REJECTED' ? 'status-rejected' : 'status-verified'}" style="font-size: 0.7rem;">
                  ${inc.status === 'REJECTED' ? 'FALSE TRIGGER' : 'FILTER PASSED'}
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-subtle); border-radius: 4px; border: 1px solid var(--border-main);">
                <div>
                  <strong style="font-size: 0.8rem; color: var(--text-main);">4. Municipal Dustbin Spatial Intersection</strong>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">Zero-Fine rule applied if saliva/waste enters green dustbin safe-zone</div>
                </div>
                <span class="status-badge status-verified" style="font-size: 0.7rem; background: #ecfdf5; color: #047857;">SAFE ZONE ACTIVE</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-subtle); border-radius: 4px; border: 1px solid var(--border-main);">
                <div>
                  <strong style="font-size: 0.8rem; color: var(--text-main);">5. Temporal Frame Sequence Consensus</strong>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">30 continuous frames trajectory validation</div>
                </div>
                <span class="status-badge status-verified" style="font-size: 0.7rem;">${inc.aiConfidence}% SCORE</span>
              </div>

            </div>
          </div>
        </div>

        <!-- Right: Challan & Dispute Case Docket -->
        <div class="content-card">
          <div class="content-card-header">
            <div class="content-card-title">
              <span>🏛️</span>
              <span>Enforcement & Evidence Docket</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${ch ? ch.id : 'No Challan'}</span>
          </div>

          <div class="content-card-body">
            ${ch ? `
              <div style="margin-bottom: 14px; padding: 12px; background: var(--bg-surface-subtle); border-radius: 6px; border: 1px solid var(--border-main);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <strong style="font-size: 0.88rem; color: var(--text-main);">${ch.offenderName}</strong>
                  <span class="status-badge ${ch.paymentStatus === 'PAID' ? 'status-verified' : 'status-pending'}">
                    ₹${ch.fineAmount} (${ch.paymentStatus || 'UNPAID'})
                  </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                  Notice Sent via BMC SMS Gateway to registered mobile: <strong>${ch.offenderPhone || '+91 98260 •••••'}</strong>
                </div>
              </div>

              ${rev ? `
                <div style="padding: 12px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div style="font-size: 0.82rem; font-weight: 800; color: #0f766e;">
                      ⚖️ Citizen Dispute Appeal: ${rev.id}
                    </div>
                    ${rev.evidenceVerified ? `
                      <span class="status-badge status-verified" style="font-size: 0.68rem;">✓ Evidence Verified</span>
                    ` : `
                      <span class="status-badge status-pending" style="font-size: 0.68rem;">Evidence Attached</span>
                    `}
                  </div>
                  <div style="font-size: 0.78rem; color: #134e4a; font-style: italic; margin-bottom: 8px;">
                    "${rev.reason}"
                  </div>
                  
                  ${rev.attachmentName ? `
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; padding-top: 6px; border-top: 1px dashed #99f6e4;">
                      <span style="font-size: 0.75rem; color: #0f766e; font-weight: 700;">
                        📎 ${rev.attachmentName}
                      </span>
                      <button class="btn-secondary" style="font-size: 0.75rem; padding: 4px 10px; color: var(--teal-800); border-color: var(--teal-400); background: #ffffff; font-weight: 700;" onclick="window.openCitizenEvidenceModal('${rev.id}')">
                        👁️ View Evidence & Verify
                      </button>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px;">
                  No dispute appeal currently active for this challan. Citizen has statutory 15 days to dispute or pay online.
                </div>
              `}

              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn-secondary" style="flex: 1; justify-content: center; font-size: 0.8rem;" onclick="window.enterCitizenView('${ch.id}')">
                  Open Official e-Challan →
                </button>
                <button class="btn-secondary" style="flex: 1; justify-content: center; font-size: 0.8rem;" onclick="window.openEvidenceModal('${inc.id}')">
                  CCTV Clip Package →
                </button>
              </div>
            ` : `
              <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
                <span style="font-size: 2rem; display: block; margin-bottom: 8px;">📋</span>
                <strong style="color: var(--text-main); font-size: 0.88rem;">No Challan Issued for Track ${inc.trackId || 'N/A'}</strong>
                <p style="font-size: 0.78rem; margin-top: 4px;">
                  ${inc.status === 'REJECTED' ? 'Incident was dismissed as a false-positive by human verification. Zero penalty.' : 'Currently awaiting Municipal Officer verification before any notice is generated.'}
                </p>
                <button class="btn-primary" style="margin-top: 10px; font-size: 0.8rem;" onclick="window.openEvidenceModal('${inc.id}')">
                  Inspect Incident Footage
                </button>
              </div>
            `}
          </div>
        </div>

      </div>
    ` : `
      <div class="content-card">
        <div class="content-card-body" style="text-align: center; padding: 50px 20px;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🔍</span>
          <h3 style="margin: 0; color: var(--text-main);">No Incident Found for "${query}"</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
            Please check the Track ID (e.g. P-014, P-009, P-003, P-022) or Incident ID (e.g. INC-2026-0842).
          </p>
          <button class="btn-primary" style="margin-top: 14px;" onclick="window.setTrackIdAndSearch('P-014')">
            Reset to Sample Track P-014
          </button>
        </div>
      </div>
    `}
  `;
};

window.executeIncidentTrackSearch = function () {
  const input = document.getElementById("tracker-search-input");
  if (input) {
    window.selectedTrackingId = input.value.trim();
  }
  const viewport = document.getElementById("app-viewport");
  if (viewport) {
    window.renderIncidentTrackerView(viewport);
  }
};

window.setTrackIdAndSearch = function (trackId) {
  window.selectedTrackingId = trackId;
  const input = document.getElementById("tracker-search-input");
  if (input) input.value = trackId;
  const viewport = document.getElementById("app-viewport");
  if (viewport) {
    window.renderIncidentTrackerView(viewport);
  }
};
