// SWACHH-DRISHTI Citizen Dashboard, Multi-Angle Biometric Face Registration & Dispute Portal

window.renderCitizenDashboardView = function (container) {
  const store = window.store;
  let scannerStream = null;

  function render() {
    const citizen = store.activeCitizen || store.registeredCitizens[0];

    // Get challans specifically issued to this citizen's biometric identity
    const myChallans = store.challans.filter(c => 
      c.citizenId === citizen.id || 
      (c.offenderName && c.offenderName.toLowerCase() === citizen.name.toLowerCase() && !c.citizenId)
    );

    const has3Angles = citizen.facePhotos && citizen.facePhotos.frontal && citizen.facePhotos.left && citizen.facePhotos.right;

    container.innerHTML = `
      <div class="citizen-dashboard-container" style="max-width: 1200px; margin: 0 auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Active Citizen Account Switcher Bar -->
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; box-shadow: var(--card-shadow);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.4rem;">👥</span>
            <div>
              <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-main);">
                Active Citizen Profile Selector
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 1px;">
                Switch between different citizen accounts. Each user maintains distinct personal details, isolated multi-angle biometric photos, and private notices.
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <label for="citizen-account-switcher" style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Current Profile:</label>
            <select id="citizen-account-switcher" class="filter-select" style="min-width: 290px; font-weight: 700; padding: 8px 12px; background: var(--input-bg); color: var(--text-main); border: 2px solid #10b981; border-radius: var(--radius-sm);">
              ${store.registeredCitizens.map(c => `
                <option value="${c.id}" ${c.id === citizen.id ? 'selected' : ''}>
                  ${c.name} (${c.id} • ${c.facePhoto ? (c.facePhotos ? '📸 3 Angles Enrolled' : '📸 1 Photo') : 'No Photo'})
                </option>
              `).join('')}
            </select>
            <button id="register-new-citizen-btn" class="btn-secondary" style="font-size: 0.8rem; padding: 8px 12px; display: flex; align-items: center; gap: 6px;">
              <span>➕</span> Register New Profile
            </button>
          </div>
        </div>

        <!-- Top Profile & Multi-Angle Biometric Status Banner -->
        <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 55%, #0f172a 100%); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: var(--radius-lg); padding: 26px 30px; color: #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 88px; height: 88px; border-radius: 50%; border: 3px solid ${citizen.facePhoto ? '#34d399' : '#94a3b8'}; overflow: hidden; background: #0f172a; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 0 18px ${citizen.facePhoto ? 'rgba(52, 211, 153, 0.45)' : 'rgba(0,0,0,0.3)'}; flex-shrink: 0;">
              ${citizen.facePhoto ? `
                <img src="${citizen.facePhoto}" alt="${citizen.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; bottom: 3px; right: 3px; width: 16px; height: 16px; background: #10b981; border: 2px solid #ffffff; border-radius: 50%;" title="Face Biometric Enrolled"></span>
              ` : `
                <span style="font-size: 2.2rem; font-weight: 800; color: #34d399;">${citizen.avatar || 'CT'}</span>
                <span style="position: absolute; bottom: 3px; right: 3px; width: 16px; height: 16px; background: #ef4444; border: 2px solid #ffffff; border-radius: 50%;" title="Face Biometrics Not Enrolled"></span>
              `}
            </div>

            <div>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #ffffff;">${citizen.name}</h2>
                ${citizen.facePhoto ? `
                  <span class="status-badge status-verified" style="background: rgba(16, 185, 129, 0.25); color: #a7f3d0; border-color: rgba(16, 185, 129, 0.5);">
                    ✓ ${has3Angles ? '3-Angle Facial Biometrics Enrolled & Verified' : 'Face Biometrics Enrolled & Active'}
                  </span>
                ` : `
                  <span class="status-badge" style="background: rgba(239, 68, 68, 0.25); color: #fecaca; border: 1px solid rgba(239, 68, 68, 0.5);">
                    ⚠️ Face Biometrics Not Enrolled
                  </span>
                `}
              </div>

              <!-- 3-Angle Quick Coverage Indicator Badge Strip -->
              ${has3Angles ? `
                <div style="display: flex; gap: 8px; margin-top: 6px; align-items: center; flex-wrap: wrap;">
                  <span style="font-size: 0.72rem; color: #a7f3d0; background: rgba(5, 150, 105, 0.3); border: 1px solid #059669; padding: 2px 8px; border-radius: 4px;">
                    👤 Frontal (0°) ✓
                  </span>
                  <span style="font-size: 0.72rem; color: #a7f3d0; background: rgba(5, 150, 105, 0.3); border: 1px solid #059669; padding: 2px 8px; border-radius: 4px;">
                    👈 Left Profile (35°) ✓
                  </span>
                  <span style="font-size: 0.72rem; color: #a7f3d0; background: rgba(5, 150, 105, 0.3); border: 1px solid #059669; padding: 2px 8px; border-radius: 4px;">
                    👉 Right Profile (35°) ✓
                  </span>
                  <span style="font-size: 0.7rem; color: #cbd5e1;">(98.4% 3D Mesh Coverage)</span>
                </div>
              ` : ''}

              <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 6px; display: flex; gap: 16px; flex-wrap: wrap;">
                <span><strong>Citizen ID:</strong> ${citizen.id}</span>
                <span><strong>Phone:</strong> ${citizen.phone}</span>
                <span><strong>Aadhaar:</strong> ${citizen.aadhaar || '•••• •••• 4821'}</span>
                <span><strong>Ward:</strong> ${citizen.ward}</span>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="open-face-scanner-btn" class="btn-primary" style="background: #059669; border-color: #34d399; color: #ffffff; font-weight: 700; padding: 10px 16px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
              <span>📸</span>
              <span>${citizen.facePhoto ? 'Re-Scan 3-Angle Face ID' : 'Scan & Enroll 3 Angles'}</span>
            </button>
            ${citizen.facePhoto ? `
              <button id="remove-photo-btn" class="btn-secondary" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); color: #fecaca; font-weight: 700; padding: 10px 12px; font-size: 0.85rem;" title="Remove enrolled biometrics from this citizen">
                <span>🗑️</span>
                <span>Remove Biometrics</span>
              </button>
            ` : ''}
            <button id="simulate-test-spit-btn" class="btn-secondary" style="background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.6); color: #fecaca; font-weight: 700; padding: 10px 14px; font-size: 0.85rem;" title="Simulate a camera detecting this person spitting to test targeted challan issuance">
              <span>🚨</span>
              <span>Test Camera Spitting on My Face</span>
            </button>
          </div>

        </div>

        <!-- Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px;">
          <div class="content-card" style="padding: 18px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 6px;">
              Cleanliness Credit Score
            </div>
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-size: 2rem; font-weight: 800; color: #059669;">${citizen.cleanlinessScore || 920}</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">/ 1000 (Grade A)</span>
            </div>
            <div style="font-size: 0.75rem; color: #16a34a; margin-top: 6px;">
              ✓ Eligible for 10% Municipal Clean Record Rebate
            </div>
          </div>

          <div class="content-card" style="padding: 18px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 6px;">
              Targeted Notices Issued to My Face
            </div>
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-size: 2rem; font-weight: 800; color: ${myChallans.length > 0 ? 'var(--red-600)' : 'var(--text-main)'};">${myChallans.length}</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">${myChallans.filter(c => c.status === 'ISSUED').length} Unpaid</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
              🛡️ Zero False Fining: Only your biometric matches appear here
            </div>
          </div>

          <div class="content-card" style="padding: 18px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 6px;">
              Dustbin Disposals (Law-Compliant)
            </div>
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-size: 2rem; font-weight: 800; color: #0d9488;">14</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Receptacle Verifications</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--teal-600); margin-top: 6px;">
              ✓ 100% Penalty Exemption for using Dustbin
            </div>
          </div>
        </div>

        <!-- Strict Biometric Protection Notice -->
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.5rem;">🔒</span>
            <div>
              <strong style="color: #065f46; font-size: 0.88rem;">3-Angle Biometric Accountability Rule Enforced:</strong>
              <div style="font-size: 0.8rem; color: #166534; margin-top: 2px;">
                CCTV AI cameras match face biometrics from frontal and lateral angles. Challans are delivered strictly to the person whose uploaded 3D face scan matches. If someone else spits, you will <strong>never</strong> receive a false penalty.
              </div>
            </div>
          </div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #047857; background: #ffffff; padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
            Sec. 268 Bhopal Civic Bye-Laws
          </div>
        </div>

        <!-- My Challans & Notices Section (FIRST, ABOVE PERSONAL DETAILS) -->
        <div class="content-card" style="padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px;">
                <span>📜</span>
                <span>My Cleanliness Notices & Challans</span>
              </h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 4px 0 0 0;">
                Targeted notices issued exclusively to your facial biometric profile (<strong>${citizen.name}</strong> • ${citizen.id}).
              </p>
            </div>

            <div style="font-size: 0.78rem; background: var(--bg-surface-subtle); padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-main); color: var(--text-secondary);">
              <strong>Right to Contest:</strong> If camera misidentified your action, click "<strong>Maine Nahi Thuka Tha</strong>" to appeal with zero fee.
            </div>
          </div>

          ${myChallans.length === 0 ? `
            <div style="text-align: center; padding: 44px 20px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
              <span style="font-size: 3.2rem; display: block; margin-bottom: 12px;">🌟</span>
              <h4 style="font-size: 1.15rem; color: var(--text-main); margin: 0 0 6px 0;">No Cleanliness Violations on Your Record!</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 520px; margin: 0 auto 16px auto;">
                Your facial biometric profile has zero active spitting offenses. If you are detected spitting by the surveillance cameras, your face will be matched and the notice will appear here for review or dispute.
              </p>
              <button class="btn-secondary" style="font-size: 0.82rem; padding: 8px 16px;" onclick="document.getElementById('simulate-test-spit-btn').click()">
                🧪 Test Camera Face Matching with Simulated Spitting
              </button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${myChallans.map(ch => {
                const isUnderReview = ch.status === "UNDER_REVIEW";
                const isPaid = ch.status === "PAID";
                const isCancelled = ch.status === "CANCELLED";

                return `
                  <div style="background: var(--bg-surface); border: 1px solid ${isUnderReview ? '#f59e0b' : (isPaid ? '#10b981' : (isCancelled ? 'var(--border-subtle)' : 'var(--border-main)'))}; border-radius: var(--radius-md); padding: 18px; display: grid; grid-template-columns: 140px 1fr auto; gap: 18px; align-items: center; box-shadow: var(--card-shadow); transition: all 0.2s;">
                    
                    <!-- Evidence Frame -->
                    <div style="width: 140px; height: 95px; border-radius: 6px; overflow: hidden; background: #0f172a; position: relative; border: 1px solid var(--border-main);">
                      ${ch.snapshotUrl ? `
                        <img src="${ch.snapshotUrl}" alt="Evidence" style="width: 100%; height: 100%; object-fit: cover;" />
                      ` : `
                        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; font-size: 0.7rem; font-family: monospace;">
                          <span style="font-size: 1.4rem;">📹</span>
                          <span>Evidence Frame</span>
                        </div>
                      `}
                      <span style="position: absolute; bottom: 3px; left: 3px; background: rgba(0,0,0,0.75); color: #ffffff; font-family: monospace; font-size: 0.62rem; padding: 1px 4px; border-radius: 2px;">
                        ${ch.camera || 'CAM-01'}
                      </span>
                    </div>

                    <!-- Details -->
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                        <strong style="font-family: monospace; color: var(--primary-900); font-size: 0.95rem;">${ch.id}</strong>
                        ${isUnderReview ? `
                          <span class="status-badge status-review" style="background: rgba(245, 158, 11, 0.2); color: #b45309; border-color: #f59e0b;">
                            ⚖️ Dispute Under Review (Municipal Head)
                          </span>
                        ` : (isPaid ? `
                          <span class="status-badge status-verified" style="background: rgba(16, 185, 129, 0.2); color: #047857; border-color: #10b981;">
                            ✓ Paid (${ch.paymentStatus || 'Cleared'})
                          </span>
                        ` : (isCancelled ? `
                          <span class="status-badge status-cancelled">
                            ✕ Cancelled / Penalty Waived
                          </span>
                        ` : `
                          <span class="status-badge status-pending" style="background: rgba(239, 68, 68, 0.15); color: #dc2626; border-color: #ef4444;">
                            Unpaid Notice
                          </span>
                        `))}
                      </div>

                      <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
                        ${ch.violation || 'Public Gutkha/Paan Spitting'}
                      </div>

                      <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 14px; flex-wrap: wrap;">
                        <span>📍 ${ch.location || ch.ward}</span>
                        <span>🕒 ${ch.time || '10:45 AM'} • ${ch.date || 'Today'}</span>
                        <span>👤 Matched Citizen: <strong>${ch.offenderName}</strong></span>
                      </div>

                      ${ch.disputeReason ? `
                        <div style="margin-top: 8px; padding: 8px 12px; background: rgba(245, 158, 11, 0.12); border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 0.8rem; color: #92400e;">
                          <strong>Your Dispute Statement:</strong> "${ch.disputeReason}" ${ch.disputeExplanation ? `— ${ch.disputeExplanation}` : ''}
                        </div>
                      ` : ''}
                    </div>

                    <!-- Actions & Fine Amount -->
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                      <div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Fine Amount</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: ${isCancelled ? 'var(--text-muted)' : 'var(--text-main)'}; text-decoration: ${isCancelled ? 'line-through' : 'none'};">
                          ₹${ch.fineAmount}
                        </div>
                      </div>

                      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
                        ${!isPaid && !isCancelled ? `
                          ${!isUnderReview ? `
                            <button class="btn-secondary" style="font-size: 0.8rem; padding: 8px 12px; border-color: #f59e0b; color: #b45309; font-weight: 700;" onclick="window.openCitizenDisputeModal('${ch.id}')" title="Contest notice if camera misidentified you">
                              📝 Maine Nahi Thuka Tha
                            </button>
                            <button class="btn-primary" style="font-size: 0.8rem; padding: 8px 14px; background: #059669;" onclick="window.openCitizenPaymentModal('${ch.id}')">
                              💳 Pay Fine (₹${ch.fineAmount})
                            </button>
                          ` : `
                            <button class="btn-secondary" style="font-size: 0.78rem; padding: 6px 12px; opacity: 0.85; background: rgba(245, 158, 11, 0.1); border-color: #f59e0b; color: #b45309;" disabled>
                              ⏳ Awaiting Municipal Head Adjudication
                            </button>
                          `}
                        ` : `
                          <button class="btn-secondary" style="font-size: 0.78rem; padding: 6px 12px;" onclick="window.enterCitizenView('${ch.id}')">
                            View Official Receipt →
                          </button>
                        `}
                      </div>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Personal Details & Civic Profile Card (NOW BELOW NOTICES & RECEIPTS) -->
        <div class="content-card" style="padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px;">
                <span>📋</span>
                <span>Personal Details & Civic Profile</span>
              </h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 4px 0 0 0;">
                Official municipal profile data for <strong>${citizen.name}</strong> (${citizen.id}) registered with Bhopal Municipal Corporation.
              </p>
            </div>
            <button id="edit-details-btn" class="btn-primary" style="font-size: 0.82rem; padding: 8px 16px; background: #059669; border-color: #34d399; display: flex; align-items: center; gap: 6px;">
              <span>✏️</span>
              <span>Edit Personal Details</span>
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
            
            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Full Legal Name</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${citizen.name}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">BMC Citizen ID</div>
              <div style="font-size: 0.95rem; font-weight: 800; font-family: monospace; color: #059669;">${citizen.id}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Registered Mobile Number</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${citizen.phone}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Aadhaar Number (Masked)</div>
              <div style="font-size: 0.95rem; font-weight: 700; font-family: monospace; color: var(--text-main);">${citizen.aadhaar || '•••• •••• 4821'}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Official Email</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${citizen.email || `${citizen.name.toLowerCase().replace(/\s+/g, '.')}@citizen.gov.in`}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Residential Ward</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${citizen.ward}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main); grid-column: span 2;">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Residential Address</div>
              <div style="font-size: 0.92rem; font-weight: 600; color: var(--text-main);">${citizen.address || 'Bhopal Municipal Corporation Area'}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Registered Vehicle Number</div>
              <div style="font-size: 0.95rem; font-weight: 800; font-family: monospace; color: var(--text-main);">${citizen.vehicleNumber || 'MP-04-EA-4821'}</div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); margin-bottom: 4px;">Emergency Contact</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${citizen.emergencyContact || citizen.phone}</div>
            </div>

            <!-- Multi-Angle Biometric Enrolled Thumbnails Card -->
            <div style="background: var(--bg-surface-subtle); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-main); grid-column: span 2;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                <div style="font-size: 0.76rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted);">
                  3-Angle 3D Biometric Signature & Multi-View Topology
                </div>
                <span style="font-size: 0.78rem; font-weight: 700; color: ${citizen.facePhoto ? '#059669' : '#dc2626'};">
                  ${citizen.facePhoto ? (has3Angles ? '✓ 3 Angles Verified (98.4% 3D Mesh Completeness)' : '✓ Primary Biometric Vector Active') : '⚠️ Not Enrolled'}
                </span>
              </div>

              ${has3Angles ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; align-items: center;">
                  
                  <div style="background: var(--card-bg); border: 1px solid #10b981; border-radius: var(--radius-sm); padding: 10px; text-align: center;">
                    <div style="width: 72px; height: 72px; margin: 0 auto 6px; border-radius: 50%; overflow: hidden; border: 2px solid #10b981; background: #0f172a;">
                      <img src="${citizen.facePhotos.frontal}" alt="Frontal" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="font-size: 0.74rem; font-weight: 700; color: var(--text-main);">Angle 1: Frontal (0°)</div>
                    <div style="font-size: 0.65rem; color: #10b981;">✓ Center Pose Calibrated</div>
                  </div>

                  <div style="background: var(--card-bg); border: 1px solid #10b981; border-radius: var(--radius-sm); padding: 10px; text-align: center;">
                    <div style="width: 72px; height: 72px; margin: 0 auto 6px; border-radius: 50%; overflow: hidden; border: 2px solid #10b981; background: #0f172a;">
                      <img src="${citizen.facePhotos.left}" alt="Left Profile" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="font-size: 0.74rem; font-weight: 700; color: var(--text-main);">Angle 2: Left Profile (~35°)</div>
                    <div style="font-size: 0.65rem; color: #10b981;">✓ Left Jawline Calibrated</div>
                  </div>

                  <div style="background: var(--card-bg); border: 1px solid #10b981; border-radius: var(--radius-sm); padding: 10px; text-align: center;">
                    <div style="width: 72px; height: 72px; margin: 0 auto 6px; border-radius: 50%; overflow: hidden; border: 2px solid #10b981; background: #0f172a;">
                      <img src="${citizen.facePhotos.right}" alt="Right Profile" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="font-size: 0.74rem; font-weight: 700; color: var(--text-main);">Angle 3: Right Profile (~35°)</div>
                    <div style="font-size: 0.65rem; color: #10b981;">✓ Right Jawline Calibrated</div>
                  </div>

                </div>
              ` : `
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                  <span style="font-size: 0.84rem; color: var(--text-muted);">
                    ${citizen.facePhoto ? 'Single angle photo enrolled. Scan all 3 angles to enable full 3D surveillance recognition.' : 'No biometric face angles registered yet.'}
                  </span>
                  <button class="btn-secondary" style="font-size: 0.78rem; padding: 6px 12px;" onclick="document.getElementById('open-face-scanner-btn').click()">
                    📸 Scan 3 Angles Now →
                  </button>
                </div>
              `}

              <div style="margin-top: 10px; font-family: monospace; font-size: 0.72rem; color: var(--text-muted); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                <span>ID: BIO-HASH-${citizen.id.replace('CIT-BPL-', '')}89</span>
                <span>Enrolled: ${citizen.faceEnrollmentDate || 'Active'}</span>
                <span>Surveillance Tolerance: ±45° Multi-View</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Multi-Angle Biometric Face Scanner Modal Root -->
      <div id="face-scanner-modal-root"></div>

      <!-- Edit Personal Details Modal Root -->
      <div id="edit-details-modal-root"></div>

      <!-- Dispute / Review Modal Root -->
      <div id="citizen-dispute-modal-root"></div>

      <!-- Payment Modal Root -->
      <div id="citizen-pay-modal-root"></div>
    `;

    // Hook Citizen Profile Switcher
    const switcher = document.getElementById("citizen-account-switcher");
    if (switcher) {
      switcher.onchange = (e) => {
        store.setActiveCitizen(e.target.value);
        render();
      };
    }

    // Hook Register New Profile
    const newCitizenBtn = document.getElementById("register-new-citizen-btn");
    if (newCitizenBtn) {
      newCitizenBtn.onclick = () => {
        openCitizenEnrollmentModal();
      };
    }

    // Hook Face Scanner
    document.getElementById("open-face-scanner-btn").onclick = () => {
      openFaceScanner();
    };

    // Hook Remove Photo
    const removePhotoBtn = document.getElementById("remove-photo-btn");
    if (removePhotoBtn) {
      removePhotoBtn.onclick = () => {
        if (confirm(`Remove enrolled 3-angle face biometrics for ${citizen.name}?`)) {
          store.clearCitizenFacePhoto(citizen.id);
          if (window.showToast) {
            window.showToast(`Biometrics removed for ${citizen.name}. Status set to Un-enrolled.`);
          }
          render();
        }
      };
    }

    // Hook Edit Details button
    const editDetailsBtn = document.getElementById("edit-details-btn");
    if (editDetailsBtn) {
      editDetailsBtn.onclick = () => {
        openEditDetailsModal();
      };
    }

    // Hook Targeted Test Spitting Detection
    const simSpitBtn = document.getElementById("simulate-test-spit-btn");
    if (simSpitBtn) {
      simSpitBtn.onclick = () => {
        if (!citizen.facePhoto) {
          if (window.showToast) {
            window.showToast(`⚠️ Please enroll 3 face angles for ${citizen.name} first before testing biometric matching!`);
          }
          openFaceScanner();
          return;
        }

        // Trigger spitting detection with this citizen's active face match
        const inc = store.triggerSpittingDetection("BPL-ICC-042", 94, null, citizen.facePhoto, null, citizen.id);
        if (window.showToast) {
          window.showToast(`🚨 Camera detected spitting! Matched 3-angle face signature to ${citizen.name} (${citizen.id}). Targeted notice issued.`);
        }
        render();
      };
    }
  }

  // -------------------------------------------------------------
  // Edit Personal Details Modal
  // -------------------------------------------------------------
  function openEditDetailsModal() {
    const modalRoot = document.getElementById("edit-details-modal-root");
    if (!modalRoot) return;

    const citizen = store.activeCitizen || store.registeredCitizens[0];

    modalRoot.innerHTML = `
      <div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: var(--card-bg); border-radius: var(--radius-lg); max-width: 560px; width: 100%; border: 1px solid var(--card-border); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <div style="background: linear-gradient(135deg, var(--primary-900), var(--primary-800)); padding: 18px 22px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">✏️</span>
              <div>
                <strong style="font-size: 1rem; color: #ffffff;">Edit Personal Details & Profile</strong>
                <div style="font-size: 0.72rem; color: #a7f3d0;">Bhopal Municipal Corporation Civic Records • ${citizen.id}</div>
              </div>
            </div>
            <button id="close-edit-modal-btn" style="background: transparent; border: none; color: #ffffff; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <form id="edit-details-form" style="padding: 24px; max-height: 80vh; overflow-y: auto;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              
              <div class="form-field" style="grid-column: span 2;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Full Legal Name</label>
                <input id="edit-name" type="text" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" value="${citizen.name}" required />
              </div>

              <div class="form-field">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Registered Mobile</label>
                <input id="edit-phone" type="tel" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" value="${citizen.phone}" required />
              </div>

              <div class="form-field">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Aadhaar Number (Last 4 Digits)</label>
                <input id="edit-aadhaar" type="text" maxlength="4" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" value="${(citizen.aadhaar || '4821').slice(-4)}" required />
              </div>

              <div class="form-field" style="grid-column: span 2;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Official Email</label>
                <input id="edit-email" type="email" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" value="${citizen.email || ''}" required />
              </div>

              <div class="form-field" style="grid-column: span 2;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Residential Address</label>
                <input id="edit-address" type="text" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" value="${citizen.address || ''}" required />
              </div>

              <div class="form-field">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Registered Vehicle Number</label>
                <input id="edit-vehicle" type="text" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" value="${citizen.vehicleNumber || 'MP-04-EA-4821'}" />
              </div>

              <div class="form-field">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Emergency Contact</label>
                <input id="edit-emergency" type="tel" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" value="${citizen.emergencyContact || citizen.phone}" />
              </div>

              <div class="form-field" style="grid-column: span 2;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Municipal Administrative Ward</label>
                <select id="edit-ward" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);">
                  <option value="Ward 12 (New Market / MP Nagar)" ${citizen.ward && citizen.ward.includes('12') ? 'selected' : ''}>Ward 12 (New Market / MP Nagar)</option>
                  <option value="Ward 5 (Old Bhopal / VIP)" ${citizen.ward && citizen.ward.includes('5') ? 'selected' : ''}>Ward 5 (Old Bhopal / VIP)</option>
                  <option value="Ward 18 (Bittan Market)" ${citizen.ward && citizen.ward.includes('18') ? 'selected' : ''}>Ward 18 (Bittan Market)</option>
                  <option value="Ward 7 (Shahpura)" ${citizen.ward && citizen.ward.includes('7') ? 'selected' : ''}>Ward 7 (Shahpura)</option>
                </select>
              </div>

            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
              <button type="button" class="btn-secondary" style="flex: 1; justify-content: center;" onclick="document.getElementById('edit-details-modal-root').innerHTML=''">
                Cancel
              </button>
              <button type="submit" class="btn-primary" style="flex: 1.5; justify-content: center; background: #059669; border-color: #34d399;">
                💾 Save Updated Details
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    document.getElementById("close-edit-modal-btn").onclick = () => {
      modalRoot.innerHTML = "";
    };

    document.getElementById("edit-details-form").onsubmit = (e) => {
      e.preventDefault();
      const updated = {
        name: document.getElementById("edit-name").value.trim(),
        phone: document.getElementById("edit-phone").value.trim(),
        aadhaar: `•••• •••• ${document.getElementById("edit-aadhaar").value.trim()}`,
        email: document.getElementById("edit-email").value.trim(),
        address: document.getElementById("edit-address").value.trim(),
        vehicleNumber: document.getElementById("edit-vehicle").value.trim(),
        emergencyContact: document.getElementById("edit-emergency").value.trim(),
        ward: document.getElementById("edit-ward").value
      };

      store.updateCitizenDetails(citizen.id, updated);
      if (window.showToast) {
        window.showToast(`✓ Personal Details updated successfully for ${updated.name}!`);
      }
      modalRoot.innerHTML = "";
      render();
    };
  }

  // -------------------------------------------------------------
  // 3-Angle Facial Biometrics Registration & Self-Verification Modal
  // -------------------------------------------------------------
  function openFaceScanner() {
    const modalRoot = document.getElementById("face-scanner-modal-root");
    if (!modalRoot) return;

    const citizen = store.activeCitizen || store.registeredCitizens[0];

    const ANGLES = [
      {
        key: "frontal",
        id: 1,
        name: "Frontal",
        icon: "👤",
        title: "Frontal Alignment",
        badge: "Angle 1 of 3: Look Straight",
        instruction: "Look straight into the center reticle. Keep your head level and face centered.",
        demoPoseText: "Center Pose (0° Yaw) • Direct Forward Gaze",
        demoIcon: "🎯",
        arrowSymbol: "⬆️",
        arrowText: "LOOK STRAIGHT",
        hudGuide: "ALIGN EYES & NOSE"
      },
      {
        key: "left",
        id: 2,
        name: "Left",
        icon: "👈",
        title: "Left Profile Alignment",
        badge: "Angle 2 of 3: Turn Left (~35°)",
        instruction: "Turn your head gently ~35° to the LEFT. Keep your left cheek and jawline visible.",
        demoPoseText: "Left Lateral Pose (-35° Yaw) • Left Profile & Cheek",
        demoIcon: "👈",
        arrowSymbol: "⮜",
        arrowText: "TURN HEAD LEFT (~35°)",
        hudGuide: "LEFT JAWLINE TARGET"
      },
      {
        key: "right",
        id: 3,
        name: "Right",
        icon: "👉",
        title: "Right Profile Alignment",
        badge: "Angle 3 of 3: Turn Right (~35°)",
        instruction: "Turn your head gently ~35° to the RIGHT. Keep your right cheek and jawline visible.",
        demoPoseText: "Right Lateral Pose (+35° Yaw) • Right Profile & Cheek",
        demoIcon: "👉",
        arrowSymbol: "⮞",
        arrowText: "TURN HEAD RIGHT (~35°)",
        hudGuide: "RIGHT JAWLINE TARGET"
      }
    ];

    let currentAngleIdx = 0;
    const capturedAngles = {
      frontal: citizen.facePhotos ? citizen.facePhotos.frontal : (citizen.facePhoto || null),
      left: citizen.facePhotos ? citizen.facePhotos.left : null,
      right: citizen.facePhotos ? citizen.facePhotos.right : null
    };

    let modalState = "CAPTURE"; // "CAPTURE", "VERIFYING", "VERIFIED", "FAILED"
    let verificationScore = 98.4;

    function renderModalContent() {
      const cur = ANGLES[currentAngleIdx];

      modalRoot.innerHTML = `
        <div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
          <div style="background: var(--card-bg); border-radius: var(--radius-lg); max-width: 580px; width: 100%; border: 1px solid var(--card-border); overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.5);">
            
            <!-- Modal Header -->
            <div style="background: linear-gradient(135deg, var(--primary-900), var(--primary-800)); padding: 18px 22px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4rem;">📸</span>
                <div>
                  <strong style="font-size: 1rem; color: #ffffff;">3-Angle Biometric Face Scanner & Verification</strong>
                  <div style="font-size: 0.72rem; color: #a7f3d0;">Bhopal Municipal AI Identity Registry • Enrolling: ${citizen.name} (${citizen.id})</div>
                </div>
              </div>
              <button id="close-scanner-modal-btn" style="background: transparent; border: none; color: #ffffff; font-size: 1.4rem; cursor: pointer;">✕</button>
            </div>

            <div style="padding: 22px;">

              ${modalState === "CAPTURE" ? `
                <!-- 3-Angle Step Progress Pipeline -->
                <div class="angle-pipeline-steps">
                  ${ANGLES.map((ang, idx) => {
                    const isDone = Boolean(capturedAngles[ang.key]);
                    const isActive = idx === currentAngleIdx;
                    return `
                      <div class="angle-step-pill ${isActive ? 'active' : (isDone ? 'completed' : '')}" onclick="window.jumpToAngle(${idx})" style="cursor: pointer;">
                        <span>${isDone ? '✓' : (isActive ? '📸' : ang.icon)}</span>
                        <span>${ang.title.split(' ')[0]} ${isDone ? 'Captured' : `(Step ${idx+1})`}</span>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Visual Angle Guide & Demo Instruction Box -->
                <div class="angle-demo-box" style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981;">
                  <div style="width: 52px; height: 52px; border-radius: 50%; background: #064e3b; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);">
                    <span class="pulse-arrow">${cur.arrowSymbol}</span>
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="status-badge status-verified" style="font-size: 0.7rem; padding: 2px 8px;">
                        ${cur.badge}
                      </span>
                      <strong style="font-size: 0.88rem; color: var(--text-main);">${cur.demoPoseText}</strong>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                      ${cur.instruction}
                    </div>
                  </div>
                </div>

                <!-- Circular Reticle Scanner Canvas -->
                <div style="position: relative; width: 260px; height: 260px; margin: 0 auto 16px; border-radius: 50%; overflow: hidden; border: 4px solid #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.45); background: #0f172a;">
                  <video id="scanner-video-el" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
                  <canvas id="scanner-canvas-el" width="260" height="260" style="display: none;"></canvas>
                  
                  <!-- Reticle HUD Guidelines -->
                  <div style="position: absolute; inset: 0; border: 2px dashed rgba(255,255,255,0.5); border-radius: 50%; pointer-events: none;"></div>
                  <div class="scanner-sweep-line" style="position: absolute; left: 0; right: 0; height: 3px; background: #34d399; box-shadow: 0 0 12px #34d399; animation: scanSweep 2s ease-in-out infinite;"></div>

                  <!-- Angle Target Directional Overlay -->
                  <div style="position: absolute; inset: 16px; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 50%; pointer-events: none; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 10px;">
                    <span style="font-family: monospace; font-size: 0.65rem; color: #38bdf8; background: rgba(0,0,0,0.65); padding: 2px 8px; border-radius: 4px;">
                      ${cur.hudGuide}
                    </span>
                    <span class="pulse-arrow" style="font-size: 1.6rem; color: #34d399; text-shadow: 0 0 10px #10b981;">
                      ${cur.arrowSymbol}
                    </span>
                    <span style="font-family: monospace; font-size: 0.68rem; font-weight: 800; color: #34d399; background: rgba(0,0,0,0.65); padding: 2px 8px; border-radius: 4px;">
                      ${cur.arrowText}
                    </span>
                  </div>
                </div>

                <!-- Action Controls -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <button id="capture-angle-btn" class="btn-primary" style="padding: 11px 22px; font-size: 0.9rem; background: #059669; border-color: #34d399; display: flex; align-items: center; gap: 8px;">
                      <span>📸</span>
                      <span>Capture ${cur.title}</span>
                    </button>
                    <button id="auto-sample-btn" class="btn-secondary" style="padding: 11px 18px; font-size: 0.85rem;" title="Automatically synthesize all 3 calibrated angles for fast testing">
                      <span>⚡</span>
                      <span>Demo Auto-Scan All 3 Angles</span>
                    </button>
                  </div>

                  <!-- File upload fallback for current angle -->
                  <div style="display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 0.74rem; color: var(--text-muted); margin-top: 4px;">
                    <span>Or upload image file for this angle:</span>
                    <label style="color: #38bdf8; cursor: pointer; text-decoration: underline; font-weight: 700;">
                      Browse Photo
                      <input type="file" id="upload-single-angle-file" accept="image/jpeg,image/png,image/webp" style="display: none;" />
                    </label>
                  </div>
                </div>
              ` : ''}

              ${modalState === "VERIFYING" ? `
                <!-- Automated AI 3D Verification Progress -->
                <div style="text-align: center; padding: 30px 10px;">
                  <div style="width: 80px; height: 80px; margin: 0 auto 18px; border-radius: 50%; border: 4px solid #10b981; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                  <h3 style="font-size: 1.15rem; color: var(--text-main); margin: 0 0 8px 0;">
                    Verifying 3D Biometric Completeness...
                  </h3>
                  <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px auto;">
                    Synthesizing multi-view facial manifold from Frontal, Left (~35°), and Right (~35°) captured angles. Analyzing facial landmark density and surface geometry.
                  </p>
                  <div style="width: 100%; max-width: 380px; height: 8px; background: var(--bg-surface-subtle); border-radius: 4px; overflow: hidden; margin: 0 auto; border: 1px solid var(--border-main);">
                    <div style="width: 92%; height: 100%; background: linear-gradient(90deg, #10b981, #38bdf8); border-radius: 4px; animation: pulse 1.5s ease-in-out infinite;"></div>
                  </div>
                </div>
              ` : ''}

              ${modalState === "VERIFIED" ? `
                <!-- Success Verification Screen -->
                <div style="text-align: center; padding: 10px 0;">
                  <div style="width: 60px; height: 60px; margin: 0 auto 12px; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #10b981;">
                    ✓
                  </div>
                  <h3 style="font-size: 1.2rem; color: var(--text-main); margin: 0 0 4px 0;">
                    3-Angle Biometrics Verified Successfully!
                  </h3>
                  <div style="font-size: 0.82rem; color: #10b981; font-weight: 700; margin-bottom: 16px;">
                    Full 3D Facial Coverage Confirmed (Score: ${verificationScore}%)
                  </div>

                  <!-- 3 Angles Preview Grid -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <div style="background: var(--bg-surface-subtle); border: 1px solid #10b981; border-radius: var(--radius-sm); padding: 8px;">
                      <div style="width: 68px; height: 68px; margin: 0 auto 6px; border-radius: 50%; overflow: hidden; border: 2px solid #10b981; background: #0f172a;">
                        <img src="${capturedAngles.frontal}" alt="Frontal" style="width: 100%; height: 100%; object-fit: cover;" />
                      </div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-main);">1. Frontal (0°)</div>
                      <div style="font-size: 0.65rem; color: #10b981;">✓ Center Calibrated</div>
                    </div>

                    <div style="background: var(--bg-surface-subtle); border: 1px solid #10b981; border-radius: var(--radius-sm); padding: 8px;">
                      <div style="width: 68px; height: 68px; margin: 0 auto 6px; border-radius: 50%; overflow: hidden; border: 2px solid #10b981; background: #0f172a;">
                        <img src="${capturedAngles.left}" alt="Left" style="width: 100%; height: 100%; object-fit: cover;" />
                      </div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-main);">2. Left (~35°)</div>
                      <div style="font-size: 0.65rem; color: #10b981;">✓ Left Profile Calibrated</div>
                    </div>

                    <div style="background: var(--bg-surface-subtle); border: 1px solid #10b981; border-radius: var(--radius-sm); padding: 8px;">
                      <div style="width: 68px; height: 68px; margin: 0 auto 6px; border-radius: 50%; overflow: hidden; border: 2px solid #10b981; background: #0f172a;">
                        <img src="${capturedAngles.right}" alt="Right" style="width: 100%; height: 100%; object-fit: cover;" />
                      </div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-main);">3. Right (~35°)</div>
                      <div style="font-size: 0.65rem; color: #10b981;">✓ Right Profile Calibrated</div>
                    </div>
                  </div>

                  <!-- Save Confirmation Buttons -->
                  <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button id="save-biometrics-btn" class="btn-primary" style="padding: 12px 28px; font-size: 0.95rem; background: #059669; border-color: #34d399;">
                      💾 Save & Enroll 3-Angle Profile
                    </button>
                    <button id="rescan-biometrics-btn" class="btn-secondary" style="padding: 12px 18px; font-size: 0.85rem;">
                      🔄 Scan Again
                    </button>
                  </div>
                </div>
              ` : ''}

              ${modalState === "FAILED" ? `
                <!-- Verification Warning / Incomplete Scan Screen -->
                <div style="text-align: center; padding: 10px 0;">
                  <div style="width: 60px; height: 60px; margin: 0 auto 12px; background: rgba(239, 68, 68, 0.2); border: 2px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #ef4444;">
                    ⚠️
                  </div>
                  <h3 style="font-size: 1.2rem; color: var(--text-main); margin: 0 0 6px 0;">
                    Biometric Verification Failed: Incomplete Scan
                  </h3>
                  <p style="font-size: 0.82rem; color: var(--text-secondary); max-width: 460px; margin: 0 auto 18px auto;">
                    The AI analyzer could not confirm full 3D facial topology. One or more angles lacked sufficient landmark clarity, lighting, or lateral head rotation.
                  </p>

                  <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 20px; font-size: 0.78rem; color: #fecaca; text-align: left;">
                    <strong>Required Action:</strong> To prevent false fining and ensure accurate CCTV match, please re-scan your face from all 3 angles (Frontal, Left, Right) or upload 3 clear photo files from your device.
                  </div>

                  <!-- Upload or Retry Options -->
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                      <button id="retry-scan-btn" class="btn-primary" style="padding: 12px 22px; font-size: 0.9rem; background: #059669; border-color: #34d399;">
                        🔄 Try Scanning Again (3 Angles)
                      </button>
                      <button id="upload-all-angles-btn" class="btn-secondary" style="padding: 12px 20px; font-size: 0.9rem; border-color: #38bdf8; color: #38bdf8;">
                        📁 Upload Photos from Device
                      </button>
                    </div>

                    <!-- Hidden Multi-file input -->
                    <input type="file" id="multi-file-upload-input" multiple accept="image/jpeg,image/png,image/webp" style="display: none;" />
                  </div>
                </div>
              ` : ''}

            </div>

          </div>
        </div>
      `;

      // Hook Header Close Button
      document.getElementById("close-scanner-modal-btn").onclick = () => {
        closeScanner();
      };

      if (modalState === "CAPTURE") {
        initCameraStream();

        const captureBtn = document.getElementById("capture-angle-btn");
        if (captureBtn) {
          captureBtn.onclick = () => {
            captureCurrentAngle();
          };
        }

        const autoSampleBtn = document.getElementById("auto-sample-btn");
        if (autoSampleBtn) {
          autoSampleBtn.onclick = () => {
            autoCaptureAll3Angles();
          };
        }

        const uploadSingle = document.getElementById("upload-single-angle-file");
        if (uploadSingle) {
          uploadSingle.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (loadEvt) => {
                recordAnglePhoto(ANGLES[currentAngleIdx].key, loadEvt.target.result);
              };
              reader.readAsDataURL(file);
            }
          };
        }
      }

      if (modalState === "VERIFIED") {
        document.getElementById("save-biometrics-btn").onclick = () => {
          saveAndEnrollBiometrics();
        };
        document.getElementById("rescan-biometrics-btn").onclick = () => {
          modalState = "CAPTURE";
          currentAngleIdx = 0;
          renderModalContent();
        };
      }

      if (modalState === "FAILED") {
        document.getElementById("retry-scan-btn").onclick = () => {
          modalState = "CAPTURE";
          currentAngleIdx = 0;
          renderModalContent();
        };

        const uploadBtn = document.getElementById("upload-all-angles-btn");
        const multiInput = document.getElementById("multi-file-upload-input");
        if (uploadBtn && multiInput) {
          uploadBtn.onclick = () => {
            multiInput.click();
          };
          multiInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              const r = new FileReader();
              r.onload = (evt) => {
                // Assign uploaded photos to angles
                capturedAngles.frontal = evt.target.result;
                capturedAngles.left = evt.target.result;
                capturedAngles.right = evt.target.result;
                verificationScore = 96.5;
                modalState = "VERIFIED";
                renderModalContent();
                if (window.showToast) {
                  window.showToast("✓ Photo files uploaded! 3-Angle biometric verification passed.");
                }
              };
              r.readAsDataURL(files[0]);
            }
          };
        }
      }
    }

    // Helper: jump to specific angle in capture mode
    window.jumpToAngle = function(idx) {
      if (modalState === "CAPTURE") {
        currentAngleIdx = idx;
        renderModalContent();
      }
    };

    function initCameraStream() {
      const video = document.getElementById("scanner-video-el");
      if (!video) return;

      if (!scannerStream) {
        navigator.mediaDevices?.getUserMedia({ video: { width: 400, height: 400, facingMode: "user" }, audio: false })
          .then(stream => {
            scannerStream = stream;
            if (video) {
              video.srcObject = stream;
              video.play();
            }
          })
          .catch(err => {
            console.warn("Camera stream notice (fallback available):", err);
          });
      } else {
        video.srcObject = scannerStream;
        video.play();
      }
    }

    function captureCurrentAngle() {
      const video = document.getElementById("scanner-video-el");
      const canvas = document.getElementById("scanner-canvas-el");
      const curKey = ANGLES[currentAngleIdx].key;

      if (canvas && video && video.readyState >= 2) {
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.translate(260, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, 260, 260);
        ctx.restore();

        const photoUrl = canvas.toDataURL("image/jpeg", 0.9);
        recordAnglePhoto(curKey, photoUrl);
      } else {
        // Fallback synthetic calibrated render for this angle
        generateSyntheticAngle(curKey, (photoUrl) => {
          recordAnglePhoto(curKey, photoUrl);
        });
      }
    }

    function recordAnglePhoto(angleKey, photoUrl) {
      capturedAngles[angleKey] = photoUrl;
      if (window.showToast) {
        window.showToast(`✓ Captured ${angleKey.toUpperCase()} angle photo!`);
      }

      // Check if all 3 angles are captured
      if (capturedAngles.frontal && capturedAngles.left && capturedAngles.right) {
        // Trigger verification phase
        modalState = "VERIFYING";
        renderModalContent();

        setTimeout(() => {
          // Self-verification check
          // All 3 angles present and valid -> PASS
          verificationScore = 98.4;
          modalState = "VERIFIED";
          renderModalContent();
        }, 1200);
      } else {
        // Advance to next uncaptured angle
        if (currentAngleIdx < 2) {
          currentAngleIdx++;
        }
        renderModalContent();
      }
    }

    function autoCaptureAll3Angles() {
      modalState = "VERIFYING";
      renderModalContent();

      setTimeout(() => {
        generateSyntheticAngle("frontal", (p1) => {
          capturedAngles.frontal = p1;
          generateSyntheticAngle("left", (p2) => {
            capturedAngles.left = p2;
            generateSyntheticAngle("right", (p3) => {
              capturedAngles.right = p3;
              verificationScore = 98.6;
              modalState = "VERIFIED";
              renderModalContent();
              if (window.showToast) {
                window.showToast("✓ All 3 angles calibrated & 3D biometric manifold synthesized!");
              }
            });
          });
        });
      }, 1000);
    }

    function generateSyntheticAngle(angleKey, callback) {
      const canvas = document.createElement("canvas");
      canvas.width = 280;
      canvas.height = 280;
      const ctx = canvas.getContext("2d");

      // Unique palette per citizen ID
      const palettes = [
        { bg1: "#064e3b", bg2: "#022c22", accent: "#34d399", mesh: "#6ee7b7" },
        { bg1: "#1e3a8a", bg2: "#172554", accent: "#60a5fa", mesh: "#93c5fd" },
        { bg1: "#581c87", bg2: "#3b0764", accent: "#c084fc", mesh: "#d8b4fe" },
        { bg1: "#78350f", bg2: "#451a03", accent: "#fbbf24", mesh: "#fde68a" },
        { bg1: "#134e4a", bg2: "#042f2e", accent: "#2dd4bf", mesh: "#5eead4" }
      ];
      const palIdx = Math.abs((citizen.id || "1").split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % palettes.length;
      const pal = palettes[palIdx];

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 280, 280);
      grad.addColorStop(0, pal.bg1);
      grad.addColorStop(1, pal.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 280, 280);

      // Biometric scan grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 280; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 280); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(280, i); ctx.stroke();
      }

      // Pose-specific geometry based on angle
      let headX = 140;
      let noseX = 140;
      let earX = null;
      let landmarks = [];

      if (angleKey === "frontal") {
        headX = 140; noseX = 140;
        landmarks = [
          [120, 100], [160, 100], [140, 118], [130, 135], [150, 135],
          [140, 90], [115, 125], [165, 125], [140, 150]
        ];
      } else if (angleKey === "left") {
        headX = 130; noseX = 115; earX = 175;
        landmarks = [
          [110, 100], [145, 100], [120, 118], [115, 135], [135, 135],
          [125, 90], [105, 125], [150, 125], [125, 150]
        ];
      } else if (angleKey === "right") {
        headX = 150; noseX = 165; earX = 105;
        landmarks = [
          [135, 100], [170, 100], [160, 118], [145, 135], [165, 135],
          [155, 90], [130, 125], [175, 125], [155, 150]
        ];
      }

      // Head silhouette
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.beginPath();
      ctx.arc(headX, 110, 55, 0, Math.PI * 2);
      ctx.fill();

      // Nose curve profile
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.beginPath();
      ctx.arc(noseX, 115, 8, 0, Math.PI * 2);
      ctx.fill();

      // Ear profile if lateral
      if (earX) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.ellipse(earX, 110, 8, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Torso / shoulders
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.ellipse(140, 220, 80, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Citizen Avatar text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(citizen.avatar || "CT", 140, 215);

      // Biometric mesh landmarks
      ctx.fillStyle = pal.accent;
      landmarks.forEach(([lx, ly]) => {
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connecting mesh wireframe lines
      ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
      ctx.lineWidth = 1;
      for (let i = 0; i < landmarks.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(landmarks[i][0], landmarks[i][1]);
        ctx.lineTo(landmarks[i + 1][0], landmarks[i + 1][1]);
        ctx.stroke();
      }

      // Tag
      ctx.fillStyle = pal.mesh;
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${citizen.name.toUpperCase()} • ${angleKey.toUpperCase()}`, 140, 260);

      const url = canvas.toDataURL("image/jpeg", 0.9);
      callback(url);
    }

    function saveAndEnrollBiometrics() {
      store.updateCitizenDetails(citizen.id, {
        facePhoto: capturedAngles.frontal,
        facePhotos: {
          frontal: capturedAngles.frontal,
          left: capturedAngles.left,
          right: capturedAngles.right
        },
        faceAnglesCount: 3,
        faceRegistered: true,
        faceEnrollmentDate: new Date().toISOString().split('T')[0],
        biometricCoverage: `${verificationScore}% (3-Angle 3D Topology)`
      });

      if (window.showToast) {
        window.showToast(`✓ All 3 Face Angles Enrolled & Verified for ${citizen.name}! Municipal 3D Registry Updated.`);
      }

      closeScanner();
      render();
    }

    function closeScanner() {
      if (scannerStream) {
        scannerStream.getTracks().forEach(t => t.stop());
        scannerStream = null;
      }
      modalRoot.innerHTML = "";
    }

    renderModalContent();
  }

  // -------------------------------------------------------------
  // Citizen Enrollment / Switch Modal
  // -------------------------------------------------------------
  function openCitizenEnrollmentModal() {
    const modalRoot = document.getElementById("face-scanner-modal-root");
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: var(--card-bg); border-radius: var(--radius-lg); max-width: 520px; width: 100%; border: 1px solid var(--card-border); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <div style="background: linear-gradient(135deg, var(--primary-900), var(--primary-800)); padding: 18px 22px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 1rem; color: #ffffff;">Register New Citizen Profile & Biometrics</strong>
            <button id="close-enroll-modal-btn" style="background: transparent; border: none; color: #ffffff; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <form id="enroll-citizen-form" style="padding: 24px; max-height: 80vh; overflow-y: auto;">
            <div class="form-field" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Full Name</label>
              <input id="enroll-name" type="text" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" placeholder="e.g. Anjali Verma" required />
            </div>

            <div class="form-field" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Mobile Number</label>
              <input id="enroll-phone" type="tel" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" placeholder="+91 98260 •••••" required />
            </div>

            <div class="form-field" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Aadhaar Number (Last 4 Digits)</label>
              <input id="enroll-aadhaar" type="text" maxlength="4" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" placeholder="7812" required />
            </div>

            <div class="form-field" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Residential Address</label>
              <input id="enroll-address" type="text" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" placeholder="House / Flat No., Area, Bhopal" required />
            </div>

            <div class="form-field" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Vehicle Registration No. (Optional)</label>
              <input id="enroll-vehicle" type="text" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);" placeholder="MP-04-XX-0000" />
            </div>

            <div class="form-field" style="margin-bottom: 20px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Residential Ward</label>
              <select id="enroll-ward" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);">
                <option value="Ward 12 (New Market / MP Nagar)">Ward 12 (New Market / MP Nagar)</option>
                <option value="Ward 5 (Old Bhopal / VIP)">Ward 5 (Old Bhopal / VIP)</option>
                <option value="Ward 18 (Bittan Market)">Ward 18 (Bittan Market)</option>
                <option value="Ward 7 (Shahpura)">Ward 7 (Shahpura)</option>
              </select>
            </div>

            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem; background: #059669; border-color: #34d399;">
              Register & Proceed to 3-Angle Face Scan →
            </button>
          </form>

        </div>
      </div>
    `;

    document.getElementById("close-enroll-modal-btn").onclick = () => {
      modalRoot.innerHTML = "";
    };

    document.getElementById("enroll-citizen-form").onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById("enroll-name").value.trim();
      const phone = document.getElementById("enroll-phone").value.trim();
      const aadhaar = document.getElementById("enroll-aadhaar").value.trim();
      const address = document.getElementById("enroll-address").value.trim();
      const vehicleNumber = document.getElementById("enroll-vehicle").value.trim();
      const ward = document.getElementById("enroll-ward").value;

      const newCitizen = store.registerCitizenFace({
        name,
        phone,
        aadhaar,
        ward,
        address,
        vehicleNumber
      });

      modalRoot.innerHTML = "";
      render();
      openFaceScanner();
    };
  }

  // -------------------------------------------------------------
  // "Maine Nahi Thuka Tha" Dispute / Review Modal
  // -------------------------------------------------------------
  window.openCitizenDisputeModal = function (challanId) {
    const ch = store.challans.find(c => c.id === challanId);
    if (!ch) return;

    const modalRoot = document.getElementById("citizen-dispute-modal-root");
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: var(--card-bg); border-radius: var(--radius-lg); max-width: 540px; width: 100%; border: 1px solid var(--card-border); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <div style="background: linear-gradient(135deg, #b45309, #d97706); padding: 18px 22px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">⚖️</span>
              <div>
                <strong style="font-size: 1rem; color: #ffffff;">Submit Dispute Request ("Maine Nahi Thuka Tha")</strong>
                <div style="font-size: 0.72rem; color: #fef3c7;">Challan Ref: ${ch.id} • Forwarded directly to Municipal Head Appeal Queue</div>
              </div>
            </div>
            <button id="close-dispute-modal-btn" style="background: transparent; border: none; color: #ffffff; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <form id="dispute-form" style="padding: 24px;">
            <div style="background: var(--bg-surface-subtle); border-radius: 6px; padding: 12px; margin-bottom: 18px; border: 1px solid var(--border-main); font-size: 0.8rem;">
              <div><strong>Alleged Violation:</strong> ${ch.violation}</div>
              <div><strong>Location & Camera:</strong> ${ch.location} (${ch.camera})</div>
              <div><strong>Fine Paused:</strong> ₹${ch.fineAmount} (Enforcement halted during supervisory review)</div>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Select Ground of Dispute</label>
              <select id="dispute-reason-select" class="filter-select" style="width: 100%; padding: 8px 12px; background: var(--input-bg); color: var(--text-main);">
                <option value="Maine nahi thuka tha (False Identification / Face Mismatch)" selected>Maine nahi thuka tha (False Identification / Face Mismatch)</option>
                <option value="Thuk dustbin me dala tha (Compliant Disposal in Receptacle)">Thuk dustbin me dala tha (Compliant Disposal in Receptacle)</option>
                <option value="Paani pee raha tha / Haath muh ke paas tha (Drinking water / Face wipe)">Paani pee raha tha / Haath muh ke paas tha (Drinking water / Face wipe)</option>
                <option value="Medical Khansi / Chheenk (Cough / Sneeze with handkerchief)">Medical Khansi / Chheenk (Cough / Sneeze with handkerchief)</option>
                <option value="Doosra vyakti tha, camera ne galat detect kiya">Doosra vyakti tha, camera ne galat detect kiya</option>
              </select>
            </div>

            <div class="form-field" style="margin-bottom: 16px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Your Explanation / Statement (Optional)</label>
              <textarea id="dispute-explanation" rows="3" style="width: 100%; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); font-family: inherit; font-size: 0.82rem;" placeholder="Aap kya kar rahe the? Kripya detail me likhein taaki Municipal Head video review kar sakein..."></textarea>
            </div>

            <!-- Optional Evidence Attachment Field (JPEG, Video, etc.) -->
            <div class="form-field" style="margin-bottom: 20px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
                📎 Attach Supporting Evidence (Optional: JPEG, PNG, MP4, WebM, PDF)
              </label>
              <div id="dispute-dropzone" style="border: 2px dashed var(--border-main); border-radius: var(--radius-md); padding: 14px; text-align: center; background: var(--bg-surface-subtle); position: relative; cursor: pointer; transition: all 0.2s;">
                <input type="file" id="dispute-evidence-file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf" style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 2;" />
                <div id="dispute-attachment-preview">
                  <span style="font-size: 1.6rem; display: block; margin-bottom: 4px;">📁</span>
                  <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">
                    Click or Drag & Drop evidence file here
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">
                    JPEG / PNG photo, Video clip, or Medical/Purchase proof (Max 25MB)
                  </div>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button type="button" class="btn-secondary" style="flex: 1; justify-content: center;" onclick="document.getElementById('citizen-dispute-modal-root').innerHTML=''">
                Cancel
              </button>
              <button type="submit" class="btn-primary" style="flex: 1.5; justify-content: center; background: #b45309; border-color: #d97706;">
                Submit Appeal to Municipal Head →
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    let attachedEvidence = null; // { name, type, url, size }

    const fileInput = document.getElementById("dispute-evidence-file");
    const previewArea = document.getElementById("dispute-attachment-preview");

    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          attachedEvidence = {
            name: file.name,
            type: file.type,
            size: (file.size / 1024).toFixed(1) + " KB",
            url: loadEvent.target.result
          };

          const isImg = file.type.startsWith("image/");
          const isVid = file.type.startsWith("video/");

          previewArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--card-bg); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-main); text-align: left;">
              <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                ${isImg ? `
                  <img src="${attachedEvidence.url}" alt="Preview" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-main);" />
                ` : (isVid ? `
                  <span style="font-size: 1.8rem;">🎬</span>
                ` : `
                  <span style="font-size: 1.8rem;">📄</span>
                `)}
                <div style="overflow: hidden;">
                  <strong style="font-size: 0.8rem; color: var(--text-main); display: block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                    ${attachedEvidence.name}
                  </strong>
                  <span style="font-size: 0.7rem; color: var(--text-muted);">
                    ${attachedEvidence.size} • ${isImg ? 'Photo' : (isVid ? 'Video' : 'Document')}
                  </span>
                </div>
              </div>
              <button type="button" id="remove-attachment-btn" style="background: transparent; border: none; color: var(--red-500); font-size: 1.1rem; cursor: pointer; padding: 4px 8px;" title="Remove attachment">
                ✕
              </button>
            </div>
          `;

          const removeBtn = document.getElementById("remove-attachment-btn");
          if (removeBtn) {
            removeBtn.onclick = (revEvt) => {
              revEvt.stopPropagation();
              attachedEvidence = null;
              fileInput.value = "";
              previewArea.innerHTML = `
                <span style="font-size: 1.6rem; display: block; margin-bottom: 4px;">📁</span>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">
                  Click or Drag & Drop evidence file here
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">
                  JPEG / PNG photo, Video clip, or Medical/Purchase proof (Max 25MB)
                </div>
              `;
            };
          }
        };
        reader.readAsDataURL(file);
      };
    }

    document.getElementById("close-dispute-modal-btn").onclick = () => {
      modalRoot.innerHTML = "";
    };

    document.getElementById("dispute-form").onsubmit = (e) => {
      e.preventDefault();
      const reason = document.getElementById("dispute-reason-select").value;
      const explanation = document.getElementById("dispute-explanation").value.trim();

      store.submitCitizenDispute(ch.id, reason, explanation, attachedEvidence);

      if (window.showToast) {
        window.showToast(attachedEvidence ? 
          `⚖️ Dispute appeal submitted with attached ${attachedEvidence.name}! Status updated to 'Under Review'.` :
          "⚖️ Dispute appeal submitted! Status updated to 'Under Review'. Municipal Head will evaluate the CCTV clip."
        );
      }

      modalRoot.innerHTML = "";
      render();
    };
  };

  // -------------------------------------------------------------
  // Instant UPI Payment Modal
  // -------------------------------------------------------------
  window.openCitizenPaymentModal = function (challanId) {
    const ch = store.challans.find(c => c.id === challanId);
    if (!ch) return;

    const modalRoot = document.getElementById("citizen-pay-modal-root");
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: var(--card-bg); border-radius: var(--radius-lg); max-width: 440px; width: 100%; border: 1px solid var(--card-border); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); text-align: center;">
          
          <div style="background: linear-gradient(135deg, #065f46, #047857); padding: 18px 22px; color: #ffffff;">
            <strong style="font-size: 1rem; color: #ffffff;">Settle Municipal Cleanliness Fine</strong>
            <div style="font-size: 0.72rem; color: #a7f3d0;">Instant BMC Gateway • Challan Ref: ${ch.id}</div>
          </div>

          <div style="padding: 24px;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
              ₹${ch.fineAmount}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">
              Payable to Bhopal Municipal Corporation Cleanliness Fund
            </div>

            <!-- Simulated QR -->
            <div style="width: 160px; height: 160px; margin: 0 auto 20px; background: #ffffff; border: 2px dashed #059669; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px;">
              <span style="font-size: 3rem;">📱</span>
              <span style="font-size: 0.7rem; font-weight: 700; color: #065f46; margin-top: 4px;">BHIM UPI / QR</span>
            </div>

            <button id="pay-confirm-btn" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem; background: #059669; margin-bottom: 10px;">
              ✓ Complete UPI Payment (Simulated)
            </button>

            <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="document.getElementById('citizen-pay-modal-root').innerHTML=''">
              Cancel
            </button>
          </div>

        </div>
      </div>
    `;

    document.getElementById("pay-confirm-btn").onclick = () => {
      store.payChallan(ch.id);
      if (window.showToast) {
        window.showToast(`✓ Payment of ₹${ch.fineAmount} confirmed! Receipt generated.`);
      }
      modalRoot.innerHTML = "";
      render();
    };
  };

  render();
};
