// SWACHH-DRISHTI Review Appeals & Head Adjudication Workflow

window.renderReviewsView = function (container) {
  const store = window.store;

  container.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-title-area">
        <h2>
          <span>Citizen Review Appeals Docket</span>
          <span class="status-badge status-review">${store.reviews.length} Active Appeals</span>
        </h2>
        <p>Bhopal Municipal Corporation • Civic Dispute Resolution & Fair Hearing Mechanism</p>
      </div>
    </div>

    <!-- Review Requests Card List -->
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${store.reviews.map(rev => {
        const ch = store.challans.find(c => c.id === rev.challanId);
        const inc = ch ? store.incidents.find(i => i.id === ch.incidentId) : null;

        let statusColor = '#86198f';
        let statusText = 'Pending Officer Evaluation';
        if (rev.status === 'PENDING_HEAD') {
          statusColor = '#b45309';
          statusText = 'Forwarded to Municipal Head';
        } else if (rev.status === 'CONFIRMED') {
          statusColor = '#15803d';
          statusText = 'Confirmed by Head (Payment Required)';
        } else if (rev.status === 'CANCELLED') {
          statusColor = '#475569';
          statusText = 'Cancelled by Head (Penalty Waived)';
        } else if (rev.status === 'MORE_INFO') {
          statusColor = '#d97706';
          statusText = 'Under Further Municipal Inquiry';
        }

        return `
          <div class="content-card" style="border-left: 4px solid ${statusColor};">
            <div class="content-card-header">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 800; font-size: 1.05rem; font-family: monospace; color: var(--slate-900);">
                  Appeal #${rev.id}
                </span>
                <span class="status-badge" style="background: var(--slate-100); color: ${statusColor};">
                  ${statusText}
                </span>
              </div>
              <div style="font-size: 0.78rem; color: var(--slate-500); font-family: monospace;">
                Challan Ref: <strong>${rev.challanId}</strong> • Logged: ${rev.submittedAt}
              </div>
            </div>

            <div class="content-card-body">
              <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px;">
                
                <div>
                  <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--slate-500); margin-bottom: 4px;">
                    Citizen Statement of Dispute
                  </div>
                  <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 12px; font-size: 0.88rem; color: var(--slate-800); line-height: 1.5; margin-bottom: 12px;">
                    "${rev.reason}"
                  </div>

                  ${rev.attachmentName ? `
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--teal-700); background: var(--teal-50); border: 1px solid var(--teal-100); padding: 5px 10px; border-radius: var(--radius-sm); width: fit-content;">
                          <span>📎 Citizen Attached Evidence:</span>
                          <strong>${rev.attachmentName}</strong>
                        </div>
                        <button class="btn-secondary" style="font-size: 0.78rem; padding: 5px 12px; display: inline-flex; align-items: center; gap: 6px; color: var(--teal-800); border-color: var(--teal-400); background: #f0fdfa; font-weight: 700; cursor: pointer; border-radius: 4px;" onclick="window.openCitizenEvidenceModal('${rev.id}')">
                          <span>👁️</span>
                          <span>View Evidence</span>
                        </button>
                        ${rev.evidenceVerified ? `
                          <span class="status-badge status-verified" style="font-size: 0.72rem; padding: 3px 8px;">
                            ✓ Evidence Verified
                          </span>
                        ` : ''}
                      </div>
                      ${rev.attachmentUrl && rev.attachmentType && rev.attachmentType.startsWith('image/') ? `
                        <div style="max-width: 260px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-main); margin-top: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
                          <img src="${rev.attachmentUrl}" alt="Citizen Attached Proof" style="width: 100%; height: auto; display: block;" />
                        </div>
                      ` : (rev.attachmentUrl && rev.attachmentType && rev.attachmentType.startsWith('video/') ? `
                        <div style="max-width: 320px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-main); margin-top: 4px;">
                          <video src="${rev.attachmentUrl}" controls style="width: 100%; display: block;"></video>
                        </div>
                      ` : '')}
                    </div>
                  ` : ''}
                </div>

                <!-- Case Particulars & Actions -->
                <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--slate-500);">Original Violation</div>
                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--slate-800); margin-top: 2px;">
                      ${ch ? ch.violation : 'Public Spitting'} (₹${ch ? ch.fineAmount : 500})
                    </div>
                    <div style="font-size: 0.75rem; color: var(--slate-500); margin-top: 2px;">
                      Location: ${ch ? ch.ward : ''} • Cam ${ch ? ch.camera : ''}
                    </div>
                  </div>

                  <div style="margin-top: 14px;">
                    ${rev.status === 'PENDING_FORWARD' ? `
                      <button class="btn-primary" style="width: 100%; justify-content: center; font-size: 0.82rem;" onclick="window.forwardToHead('${rev.id}')">
                        ⚡ Forward to Municipal Head for Adjudication →
                      </button>
                    ` : (store.currentUser.role === 'MUNICIPAL_HEAD' ? `
                      <button class="btn-primary" style="width: 100%; justify-content: center; font-size: 0.82rem; background: #b45309;" onclick="window.openReviewAdjudicationModal('${rev.id}')">
                        ⚖️ Adjudicate as Municipal Head →
                      </button>
                    ` : `
                      <button class="btn-secondary" style="width: 100%; justify-content: center; font-size: 0.82rem;" onclick="window.openReviewAdjudicationModal('${rev.id}')">
                        View Complete Case Docket →
                      </button>
                    `)}
                  </div>
                </div>

              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

window.forwardToHead = function (reviewId) {
  window.store.forwardReviewToHead(reviewId);
  if (window.showToast) window.showToast(`📤 Review case ${reviewId} forwarded to Municipal Head.`);
  window.renderReviewsView(document.getElementById("app-viewport"));
};

// Municipal Head 3-Way Adjudication Modal
window.openReviewAdjudicationModal = function (reviewId) {
  const store = window.store;
  const rev = store.reviews.find(r => r.id === reviewId) || store.reviews[0];
  const ch = store.challans.find(c => c.id === rev.challanId) || store.challans[0];
  const inc = store.incidents.find(i => i.id === ch.incidentId) || store.incidents[0];

  const existing = document.getElementById("review-adjudication-modal");
  if (existing) existing.remove();

  const isHead = store.currentUser.role === "MUNICIPAL_HEAD";

  const modalHtml = `
    <div class="modal-overlay" id="review-adjudication-modal">
      <div class="modal-card" style="max-width: 960px;">
        <div class="modal-header">
          <div>
            <h2>Supervisory Review Case: ${rev.id}</h2>
            <div style="font-size: 0.8rem; color: var(--slate-500);">
              Challan ${rev.challanId} • Citizen: ${rev.submittedBy} • Authority: Municipal Head
            </div>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('review-adjudication-modal').remove()">×</button>
        </div>

        <div class="modal-body">
          <div class="case-split-view">
            
            <!-- Left Side: Original CCTV Evidence & AI Pipeline -->
            <div>
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--slate-700); text-transform: uppercase; margin-bottom: 8px;">
                Original CCTV & AI Evidence Package
              </div>
              <div style="background: #020617; border-radius: var(--radius-md); overflow: hidden; padding: 14px; text-align: center; margin-bottom: 12px;">
                <canvas id="head-review-canvas" width="400" height="200" style="max-width: 100%; border-radius: 4px;"></canvas>
                <div style="font-family: monospace; font-size: 0.72rem; color: #94a3b8; margin-top: 6px;">
                  30-FRAME TEMPORAL TRAJECTORY MAPPING • 87% CONFIDENCE
                </div>
              </div>

              <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 12px; font-size: 0.8rem; color: var(--slate-700);">
                <div><strong>Officer Verification:</strong> Verified by Inspector R. K. Sharma (#104)</div>
                <div style="margin-top: 4px;"><strong>Location:</strong> ${ch.ward} • ${ch.camera}</div>
                <div style="margin-top: 4px;"><strong>AI Behaviour Filter:</strong> Eating & drinking ruled out by 30-frame sequence analysis.</div>
              </div>
            </div>

            <!-- Right Side: Citizen Claim & Head Decisions -->
            <div>
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--slate-700); text-transform: uppercase; margin-bottom: 8px;">
                Citizen Dispute Appeal Grounds
              </div>
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 14px; font-size: 0.88rem; color: #92400e; margin-bottom: 14px; line-height: 1.5;">
                "${rev.reason}"
              </div>

              ${rev.attachmentName ? `
                <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 10px; font-size: 0.8rem; color: var(--slate-700); margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                      📎 <strong>Submitted Material:</strong> ${rev.attachmentName}
                      <div style="font-size: 0.72rem; color: var(--teal-700); margin-top: 2px;">(Official Evidence Docket)</div>
                    </div>
                    <button class="btn-secondary" style="font-size: 0.75rem; padding: 4px 10px; color: var(--teal-800); border-color: var(--teal-400); background: #f0fdfa; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;" onclick="window.openCitizenEvidenceModal('${rev.id}')">
                      <span>👁️</span>
                      <span>View Evidence & Verify</span>
                    </button>
                  </div>
                </div>
              ` : ''}

              <!-- Head Decision Section -->
              <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 16px;">
                <div style="font-size: 0.85rem; font-weight: 800; color: #f59e0b; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <span>🏛️</span> Municipal Head Statutory Adjudication
                </div>
                <p style="font-size: 0.78rem; color: var(--slate-500); margin-bottom: 14px;">
                  As Municipal Head, choose the appropriate administrative determination under Section 32(A):
                </p>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <!-- Option 1: Approve Challan -->
                  <button class="btn-primary" style="background: #047857; justify-content: center;" onclick="window.submitHeadDecision('${rev.id}', 'APPROVE')">
                    ✓ Approve Challan (Uphold Fine ₹${ch.fineAmount})
                  </button>

                  <!-- Option 2: Reject / Cancel Challan -->
                  <button class="btn-danger" style="background: #dc2626; justify-content: center;" onclick="window.submitHeadDecision('${rev.id}', 'REJECT')">
                    ✕ Reject / Cancel Challan (Waive Fine)
                  </button>

                  <!-- Option 3: Request More Information -->
                  <button class="btn-secondary" style="justify-content: center; color: #b45309; border-color: #fde68a;" onclick="window.submitHeadDecision('${rev.id}', 'MORE_INFO')">
                    ❓ Request More Information / Additional Footage
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Draw head canvas
  setTimeout(() => {
    const canvas = document.getElementById("head-review-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 400, 200);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(150, 30, 90, 140);
      ctx.fillStyle = "#ef4444";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(200 + i * 8, 65 + i * 9, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.fillText(`CAM ${ch.camera} - EVENT BUFFER`, 10, 20);
    }
  }, 100);
};

window.submitHeadDecision = function (reviewId, decision) {
  window.store.headAdjudicateReview(reviewId, decision);
  const modal = document.getElementById("review-adjudication-modal");
  if (modal) modal.remove();

  if (decision === 'APPROVE') {
    if (window.showToast) window.showToast("✓ Challan confirmed by Municipal Head. Citizen notice updated.");
  } else if (decision === 'REJECT') {
    if (window.showToast) window.showToast("✕ Challan cancelled and fine waived by Municipal Head.");
  } else {
    if (window.showToast) window.showToast("❓ Additional inquiry requested. Officer notified.");
  }

  // Refresh current view
  if (window.store.currentView === 'head-dashboard') {
    window.renderHeadDashboardView(document.getElementById("app-viewport"));
  } else {
    window.renderReviewsView(document.getElementById("app-viewport"));
  }
};
