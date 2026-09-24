// SWACHH-DRISHTI Login Screen (Option B - Role Selection + Credentials)

window.renderLoginView = function (container) {
  const store = window.store;
  let selectedRole = "MUNICIPAL_OFFICER"; // MUNICIPAL_OFFICER, MUNICIPAL_HEAD, CITIZEN
  let selectedCitizenId = store.activeCitizen ? store.activeCitizen.id : (store.registeredCitizens[0] ? store.registeredCitizens[0].id : "CIT-BPL-701");

  function renderForm() {
    const isOfficer = selectedRole === "MUNICIPAL_OFFICER";
    const isHead = selectedRole === "MUNICIPAL_HEAD";
    const isCitizen = selectedRole === "CITIZEN";

    container.innerHTML = `
      <div style="min-height: calc(100vh - 65px); display: flex; align-items: center; justify-content: center; padding: 30px 20px; background: var(--bg-app); transition: all 0.25s;">
        <div style="background: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--card-shadow); width: 100%; max-width: 540px; border: 1px solid var(--card-border); overflow: hidden; transition: all 0.25s;">
          
          <!-- Header Branding -->
          <div style="background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%); color: #ffffff; padding: 28px; text-align: center; position: relative;">
            <div style="width: 64px; height: 64px; margin: 0 auto 12px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 16px; display: flex; align-items: center; justify-content: center; padding: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); backdrop-filter: blur(8px);">
              <img src="${window.getLogoUrl()}" alt="Logo" class="login-brand-logo" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <h1 style="font-size: 1.6rem; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">SWACHH-DRISHTI</h1>
            <p style="font-size: 0.82rem; color: #a7f3d0; margin-top: 4px; font-weight: 500;">
              AI-Powered Public Cleanliness Monitoring & Evidence-Assisted Enforcement
            </p>
          </div>

          <div style="padding: 28px;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Select Official Portal / Profile
            </div>

            <!-- Role Selector Tabs (3 Roles: Officer, Head, Citizen) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 24px;">
              <button id="role-btn-officer" type="button" style="padding: 12px 8px; border-radius: var(--radius-md); border: 2px solid ${isOfficer ? 'var(--primary-500)' : 'var(--border-main)'}; background: ${isOfficer ? 'var(--primary-50)' : 'var(--bg-surface-elevated)'}; cursor: pointer; text-align: left; transition: all 0.2s;">
                <div style="font-size: 1.15rem; margin-bottom: 2px;">👮‍♂️</div>
                <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-main);">Officer</div>
                <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">Ward Operations</div>
              </button>

              <button id="role-btn-head" type="button" style="padding: 12px 8px; border-radius: var(--radius-md); border: 2px solid ${isHead ? '#f59e0b' : 'var(--border-main)'}; background: ${isHead ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface-elevated)'}; cursor: pointer; text-align: left; transition: all 0.2s;">
                <div style="font-size: 1.15rem; margin-bottom: 2px;">🏛️</div>
                <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-main);">Municipal Head</div>
                <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">Appeals & Head</div>
              </button>

              <button id="role-btn-citizen" type="button" style="padding: 12px 8px; border-radius: var(--radius-md); border: 2px solid ${isCitizen ? '#10b981' : 'var(--border-main)'}; background: ${isCitizen ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)'}; cursor: pointer; text-align: left; transition: all 0.2s;">
                <div style="font-size: 1.15rem; margin-bottom: 2px;">👤</div>
                <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-main);">Citizen Portal</div>
                <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">Face ID & Notices</div>
              </button>
            </div>

            <!-- Login Credentials Form -->
            <form id="login-form">
              ${isCitizen ? `
                <div class="form-field" style="margin-bottom: 16px;">
                  <label for="citizen-selector" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
                    Select Enrolled Citizen Profile
                  </label>
                  <select id="citizen-selector" class="filter-select" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); font-weight: 600;">
                    ${store.registeredCitizens.map(c => `
                      <option value="${c.id}" ${c.id === selectedCitizenId ? 'selected' : ''}>
                        ${c.name} (${c.phone} • ${c.id})
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-field" style="margin-bottom: 16px;">
                  <label for="login-citizen-mobile" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
                    Registered Mobile Number / Aadhaar
                  </label>
                  <input id="login-citizen-mobile" type="text" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main);" value="+91 98260 44821" required />
                </div>

                <div class="form-field" style="margin-bottom: 20px;">
                  <label for="login-citizen-otp" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
                    Biometric Token / Mobile OTP
                  </label>
                  <input id="login-citizen-otp" type="password" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main);" value="482109" required />
                </div>

                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem; background: #059669; border-color: #34d399;">
                  Login to Citizen Dashboard →
                </button>
              ` : `
                <div class="form-field" style="margin-bottom: 16px;">
                  <label for="login-username" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
                    Government Officer ID / Email
                  </label>
                  <input id="login-username" type="text" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main);" value="${isOfficer ? 'officer.sharma@bhopalcorp.gov.in' : 'commissioner@bhopalcorp.gov.in'}" required />
                </div>

                <div class="form-field" style="margin-bottom: 20px;">
                  <label for="login-password" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
                    Official Secure Password / Token
                  </label>
                  <input id="login-password" type="password" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main);" value="••••••••••••" required />
                </div>

                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem;">
                  Authenticate & Enter System →
                </button>
              `}
            </form>

            <!-- Train Camera Quick Studio Button -->
            <button id="btn-train-camera-login" type="button" class="btn-primary" style="width: 100%; margin-top: 14px; justify-content: center; background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%); border: none; font-weight: 800; font-size: 0.92rem; padding: 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3); cursor: pointer;" onclick="window.openTrainCameraStudio()">
              <span>🎥</span>
              <span>Train Camera — Live Demonstration Studio →</span>
            </button>

            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-main); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <button class="btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;" onclick="window.enterCitizenDashboard()">
                📸 Open Citizen Face ID & Dashboard
              </button>
              <button class="btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;" onclick="window.enterCitizenView('SD-2026-001284')">
                📱 Public Notice View
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    // Hook role buttons
    document.getElementById("role-btn-officer").onclick = () => {
      selectedRole = "MUNICIPAL_OFFICER";
      renderForm();
    };

    document.getElementById("role-btn-head").onclick = () => {
      selectedRole = "MUNICIPAL_HEAD";
      renderForm();
    };

    document.getElementById("role-btn-citizen").onclick = () => {
      selectedRole = "CITIZEN";
      renderForm();
    };

    const citizenSelector = document.getElementById("citizen-selector");
    if (citizenSelector) {
      citizenSelector.onchange = (e) => {
        selectedCitizenId = e.target.value;
        const c = store.registeredCitizens.find(item => item.id === selectedCitizenId);
        if (c) {
          const phoneInput = document.getElementById("login-citizen-mobile");
          if (phoneInput) phoneInput.value = c.phone;
        }
      };
    }

    document.getElementById("login-form").onsubmit = (e) => {
      e.preventDefault();
      if (selectedRole === "CITIZEN") {
        const citizen = store.registeredCitizens.find(c => c.id === selectedCitizenId) || store.registeredCitizens[0];
        store.loginCitizen(citizen.id);
        if (window.showToast) {
          window.showToast(`Logged in successfully as ${citizen.name} (Citizen ID: ${citizen.id})`);
        }
      } else {
        window.enterPortal(selectedRole);
        if (window.showToast) {
          window.showToast(`Logged in successfully as ${selectedRole === 'MUNICIPAL_HEAD' ? 'Dr. Vinay Verma (Municipal Head)' : 'Inspector R. K. Sharma (Municipal Officer)'}`);
        }
      }
    };
  }

  renderForm();
};
