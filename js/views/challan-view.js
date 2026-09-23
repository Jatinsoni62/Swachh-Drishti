// SWACHH-DRISHTI Challan Management & Public Citizen Notice View

window.renderChallansView = function (container) {
  const store = window.store;

  container.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-title-area">
        <h2>
          <span>Municipal Cleanliness Challans</span>
          <span class="status-badge status-challan">${store.challans.length} Total Issued</span>
        </h2>
        <p>Bhopal Municipal Corporation • Civic Sanitation Bye-Law Enforcement</p>
      </div>

      <div class="dashboard-quick-actions">
        <button class="btn-secondary" onclick="window.enterCitizenView('SD-2026-001284')">
          <span>📱</span> Open Citizen Notice Portal
        </button>
      </div>
    </div>

    <!-- Challans Table Card -->
    <div class="content-card">
      <div class="content-card-header">
        <div class="content-card-title">
          <span>📜</span>
          <span>Issued Challan Registry</span>
        </div>
      </div>

      <div class="content-card-body" style="padding: 0;">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Challan ID</th>
                <th>Issue Date & Time</th>
                <th>Ward & Location</th>
                <th>Violation</th>
                <th>Fine Amount</th>
                <th>Payment / Review Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.challans.map(ch => {
                let statusBadge = '';
                if (ch.status === 'PAID') statusBadge = '<span class="status-badge status-verified">✓ Paid</span>';
                else if (ch.status === 'UNDER_REVIEW') statusBadge = '<span class="status-badge status-review">⚖️ Under Review</span>';
                else if (ch.status === 'CONFIRMED') statusBadge = '<span class="status-badge status-confirmed">✓ Head Confirmed</span>';
                else if (ch.status === 'CANCELLED') statusBadge = '<span class="status-badge status-cancelled">✕ Waived / Cancelled</span>';
                else statusBadge = '<span class="status-badge status-pending">Unpaid (Notice Sent)</span>';

                return `
                  <tr>
                    <td>
                      <strong style="font-family: monospace; color: var(--primary-800);">${ch.id}</strong>
                      <div style="font-size: 0.72rem; color: var(--slate-400);">Ref: ${ch.incidentId}</div>
                    </td>
                    <td>
                      <div style="font-family: monospace; font-weight: 600;">${ch.time}</div>
                      <div style="font-size: 0.72rem; color: var(--slate-500);">${ch.date}</div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--slate-800);">${ch.ward}</div>
                      <div style="font-size: 0.75rem; color: var(--slate-500);">${ch.location}</div>
                    </td>
                    <td>
                      <span>${ch.violation}</span>
                      <div style="font-size: 0.72rem; color: var(--slate-400);">${ch.offenderName}</div>
                    </td>
                    <td>
                      <strong style="font-size: 1rem; color: var(--slate-900);">₹${ch.fineAmount}</strong>
                    </td>
                    <td>
                      ${statusBadge}
                      <div style="font-size: 0.72rem; color: var(--slate-500); margin-top: 2px;">${ch.paymentStatus}</div>
                    </td>
                    <td>
                      <button class="btn-secondary" style="padding: 5px 10px; font-size: 0.78rem;" onclick="window.enterCitizenView('${ch.id}')">
                        Citizen View →
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
  `;
};

// Public Citizen Challan View
window.renderCitizenChallanView = function (container, challanId = "SD-2026-001284") {
  const store = window.store;
  const ch = store.challans.find(c => c.id === challanId) || store.challans[0];
  const inc = store.incidents.find(i => i.id === ch.incidentId) || store.incidents[0];

  container.innerHTML = `
    <div style="background: var(--bg-app); min-height: calc(100vh - 65px); padding: 30px 16px; transition: all 0.25s;">
      
      <!-- Public Notice Card -->
      <div class="citizen-portal-card" style="background: var(--card-bg); border: 1px solid var(--card-border); box-shadow: var(--card-shadow); border-radius: var(--radius-lg); overflow: hidden; max-width: 860px; margin: 0 auto;">
        
        <div class="citizen-portal-header" style="background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%); color: #ffffff; padding: 22px 28px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.15); border-radius: 10px; padding: 4px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <img src="${window.getLogoUrl()}" alt="Emblem" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
              <div>
                <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; opacity: 0.9;">
                  Bhopal Municipal Corporation • Civic Cleanliness Enforcement
                </div>
                <h1 style="font-size: 1.4rem; font-weight: 800; margin-top: 2px; color: #ffffff;">Municipal Violation Notice</h1>
              </div>
            </div>
            <span class="status-badge" style="background: rgba(255,255,255,0.2); color: #ffffff; border: 1px solid rgba(255,255,255,0.4); font-size: 0.8rem;">
              Challan ID: ${ch.id}
            </span>
          </div>
        </div>

        <div class="citizen-portal-body">
          
          <!-- Summary Table -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div>
              <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Violation Alleged</div>
              <div style="font-size: 1.05rem; font-weight: 800; color: var(--slate-900); margin-top: 2px;">${ch.violation}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Timestamp of Event</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--slate-800); margin-top: 2px;">${ch.date} • ${ch.time}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Location & CCTV Unit</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: var(--slate-800); margin-top: 2px;">${ch.ward}, ${ch.location} (${ch.camera})</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Issuing Authority</div>
              <div style="font-size: 0.9rem; font-weight: 600; color: var(--slate-700); margin-top: 2px;">${ch.issuedBy}</div>
            </div>
          </div>

          <!-- Video Evidence Snapshot Box -->
          <div style="border: 1px solid var(--slate-200); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 20px;">
            <div style="background: var(--slate-100); padding: 10px 14px; font-size: 0.8rem; font-weight: 700; color: var(--slate-700); display: flex; justify-content: space-between;">
              <span>Attached Evidence Snapshot (Human-Officer Verified)</span>
              <span style="color: var(--teal-700);">AI Confidence: ${inc.aiConfidence}%</span>
            </div>
            <div style="background: #020617; padding: 20px; text-align: center;">
              <canvas id="citizen-evidence-canvas" width="460" height="220" style="max-width: 100%; border-radius: 6px;"></canvas>
            </div>
          </div>

          <!-- Fine Amount Box -->
          <div class="challan-amount-box">
            <div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-800); text-transform: uppercase;">
                Penal Fine Levied
              </div>
              <div style="font-size: 0.75rem; color: var(--slate-500);">
                Under Section 268 of MP Municipal Corporation Act
              </div>
            </div>
            <div class="amount-text">₹${ch.fineAmount}</div>
          </div>

          <!-- Current Status Banner & Receipt -->
          ${ch.status === 'PAID' ? `
            <div style="background: rgba(16, 185, 129, 0.12); border: 2px solid #10b981; border-radius: var(--radius-md); padding: 18px 22px; margin-bottom: 24px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.5rem;">✅</span>
                  <div>
                    <strong style="color: #10b981; font-size: 1.1rem;">Challan Settled & Paid in Full</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Official Digital Receipt • Bhopal Municipal Swachhta Bye-Laws</div>
                  </div>
                </div>
                <span class="status-badge status-verified" style="font-size: 0.8rem; padding: 4px 12px;">✓ UPI Confirmed</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; padding: 12px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-main); font-size: 0.82rem;">
                <div>
                  <span style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">Amount Paid</span>
                  <div style="font-weight: 800; color: #10b981; font-size: 1.15rem;">₹${ch.fineAmount}.00</div>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">Transaction ID</span>
                  <div style="font-weight: 700; font-family: monospace; color: var(--text-main);">${ch.transactionId || 'UPI/TXN/84910294'}</div>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">Payment Gateway</span>
                  <div style="font-weight: 700; color: var(--text-main);">${ch.paymentMethod || 'PhonePe UPI QR'}</div>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">Settlement Time</span>
                  <div style="font-weight: 700; color: var(--text-main);">${ch.paidDate || ch.date} ${ch.paidAt || ch.time}</div>
                </div>
              </div>
            </div>
          ` : `
            <div style="margin-bottom: 24px; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; ${
              ch.status === 'UNDER_REVIEW' ? 'background: #fae8ff; color: #86198f; border: 1px solid #f5d0fe;' :
              (ch.status === 'CONFIRMED' ? 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;' :
              (ch.status === 'CANCELLED' ? 'background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;' :
              'background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35);'))}">
              ${ch.status === 'UNDER_REVIEW' ? `⚖️ Under Municipal Review (Ref: ${ch.reviewRef || 'REV-2026-0021'}). Awaiting Municipal Head decision.` :
                (ch.status === 'CONFIRMED' ? `⚠️ Challan Confirmed by Municipal Head after evidentiary review. Payment is required.` :
                (ch.status === 'CANCELLED' ? `✓ Challan Cancelled & Fine Waived by Municipal Head.` :
                `⚠️ Payment Pending: Please pay your civic fine of ₹${ch.fineAmount} or submit a formal review request if you contest this violation.`))}
            </div>
          `}

          <!-- Action Buttons -->
          ${ch.status !== 'PAID' && ch.status !== 'CANCELLED' ? `
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              <button class="btn-primary" style="flex: 1; justify-content: center; padding: 14px; font-size: 1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);" onclick="window.openPaymentQrModal('${ch.id}')">
                <span>📱</span> Pay Your Challan ₹${ch.fineAmount} (UPI QR)
              </button>
              ${ch.status !== 'UNDER_REVIEW' ? `
                <button class="btn-secondary" style="flex: 1; justify-content: center; padding: 14px; font-size: 1rem;" onclick="window.openReviewRequestModal('${ch.id}')">
                  ⚖️ Request Formal Review
                </button>
              ` : ''}
            </div>
          ` : `
            <div style="display: flex; gap: 14px; justify-content: flex-end;">
              <button class="btn-secondary" style="padding: 10px 18px;" onclick="window.openPaymentQrModal('${ch.id}', true)">
                <span>🧾</span> View Payment QR / Details
              </button>
            </div>
          `}

        </div>

      </div>

    </div>
  `;

  // Draw citizen evidence preview
  setTimeout(() => {
    const canvas = document.getElementById("citizen-evidence-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (inc && inc.snapshotUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 460, 220);
        };
        img.src = inc.snapshotUrl;
        return;
      }

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 460, 220);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.fillText(`CCTV CAM: ${ch.camera} | ${ch.date} ${ch.time}`, 15, 25);
      
      // Box
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(170, 40, 110, 150);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(170, 18, 110, 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`VIOLATION DETECTED`, 174, 32);

      // Trajectory
      ctx.fillStyle = "#ef4444";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(240 + i * 8, 80 + i * 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, 100);
};

window.enterCitizenView = function (challanId) {
  window.store.setView("citizen-challan", { challanId });
};

// UPI Payment Modal Popup with QR Code and Demo Payment Button
window.openPaymentQrModal = function (challanId, viewOnly = false) {
  const store = window.store;
  const ch = store.challans.find(c => c.id === challanId) || store.challans[0];

  const existing = document.getElementById("payment-qr-modal");
  if (existing) existing.remove();

  const qrSrc = window.PAYMENT_QR || "assets/payment-qr.jpg";

  const modalHtml = `
    <div class="modal-overlay" id="payment-qr-modal">
      <div class="modal-card payment-modal-card">
        
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 1.2rem;">💳</span>
            </div>
            <div style="text-align: left;">
              <h2 style="font-size: 1.15rem; margin: 0; color: var(--text-main);">Pay Civic Challan via UPI</h2>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Bhopal Municipal Corporation • Swachh Bharat</div>
            </div>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('payment-qr-modal').remove()">×</button>
        </div>

        <div class="modal-body" style="padding: 24px 20px;">
          
          <!-- Amount Banner -->
          <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px;">
              Total Fine Amount Due
            </div>
            <div style="font-size: 2.2rem; font-weight: 900; color: #10b981; margin: 4px 0;">
              ₹${ch.fineAmount}.00
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">
              Notice ID: <strong>${ch.id}</strong> • Violation: <strong>${ch.violation}</strong>
            </div>
          </div>

          <!-- Official PhonePe QR Box -->
          <div class="qr-frame-box">
            <img src="${qrSrc}" alt="PhonePe UPI QR Code" class="payment-qr-image" />
          </div>

          <!-- Scan instructions -->
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">
            Scan QR Code with any UPI App
          </div>
          
          <div class="upi-apps-row">
            <span class="upi-chip">📱 PhonePe</span>
            <span class="upi-chip">🔵 Google Pay</span>
            <span class="upi-chip">🔷 Paytm</span>
            <span class="upi-chip">🇮🇳 BHIM UPI</span>
          </div>

          <div class="upi-merchant-badge">
            Official Beneficiary: <strong>Bhopal Municipal Cleanliness Enforcement Fund</strong>
          </div>

          <!-- Demo Payment Action Button -->
          ${ch.status !== 'PAID' && !viewOnly ? `
            <div style="margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--border-main);">
              <button id="btn-demo-pay" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px; font-size: 1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);" onclick="window.simulateDemoPayment('${ch.id}')">
                ⚡ Simulate Instant Payment (Demo ₹${ch.fineAmount})
              </button>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 8px;">
                Demo Mode: Click to simulate instant UPI confirmation & settle this challan.
              </div>
            </div>
          ` : `
            <div style="margin-top: 20px; padding: 12px; background: rgba(16, 185, 129, 0.12); border-radius: var(--radius-sm); border: 1px solid #10b981; color: #10b981; font-weight: 700; font-size: 0.88rem;">
              ✓ Challan Already Settled (${ch.transactionId || 'UPI Confirmed'})
            </div>
          `}

        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

window.simulateDemoPayment = function (challanId) {
  const btn = document.getElementById("btn-demo-pay");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Verifying UPI Transaction with Bank Gateway...</span>`;
  }

  setTimeout(() => {
    const paidChallan = window.store.payChallan(challanId, "PhonePe UPI QR");
    const modal = document.getElementById("payment-qr-modal");
    if (modal) modal.remove();

    if (window.showToast) {
      window.showToast(`🎉 Payment of ₹${paidChallan.fineAmount} received via PhonePe UPI! Challan ${challanId} settled.`);
    }

    const viewport = document.getElementById("app-viewport");
    if (viewport) {
      window.renderCitizenChallanView(viewport, challanId);
    }
  }, 700);
};

window.processCitizenPayment = function (challanId) {
  window.openPaymentQrModal(challanId);
};


// Citizen Review Request Modal
window.openReviewRequestModal = function (challanId) {
  const store = window.store;
  const ch = store.challans.find(c => c.id === challanId) || store.challans[0];

  const existing = document.getElementById("review-request-modal");
  if (existing) existing.remove();

  const modalHtml = `
    <div class="modal-overlay" id="review-request-modal">
      <div class="modal-card" style="max-width: 580px;">
        <div class="modal-header">
          <h2>Request Challan Review</h2>
          <button class="modal-close-btn" onclick="document.getElementById('review-request-modal').remove()">×</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--slate-600); margin-bottom: 16px;">
            Under BMC Civic Fair Adjudication Rules, citizens may dispute AI-assisted cleanliness notices with the Municipal Officer and Municipal Head.
          </p>

          <form id="citizen-review-form">
            <div class="form-field" style="margin-bottom: 14px;">
              <label>Challan Reference Number</label>
              <input type="text" value="${ch.id} (${ch.violation})" readonly />
            </div>

            <div class="form-field" style="margin-bottom: 14px;">
              <label>Reason for Dispute / Review</label>
              <textarea id="review-reason-text" rows="4" placeholder="Explain why the detection was incorrect (e.g. coughing into cloth, medical condition, false positive)..." required>I was carrying an inhaler for allergic cough and covered my face with a handkerchief. I did not spit any tobacco or paan. Please re-evaluate the camera sequence.</textarea>
            </div>

            <div class="form-field" style="margin-bottom: 20px;">
              <label>Supporting Evidence / Document (Optional)</label>
              <input type="text" id="review-attachment-input" value="medical_prescription_cough.pdf" />
              <span style="font-size: 0.72rem; color: var(--slate-500); margin-top: 4px;">Attach medical certificate, witness statement, or shop invoice.</span>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="btn-secondary" onclick="document.getElementById('review-request-modal').remove()">Cancel</button>
              <button type="submit" class="btn-primary">Submit Review Request →</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById("citizen-review-form").onsubmit = (e) => {
    e.preventDefault();
    const reason = document.getElementById("review-reason-text").value;
    const attachment = document.getElementById("review-attachment-input").value;
    const newRev = store.submitCitizenReview(ch.id, reason, attachment);

    document.getElementById("review-request-modal").remove();
    if (window.showToast) window.showToast(`⚖️ Review request ${newRev.id} submitted successfully to Municipal Officer.`);
    window.renderCitizenChallanView(document.getElementById("app-viewport"), ch.id);
  };
};
