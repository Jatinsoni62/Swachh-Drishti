// SWACHH-DRISHTI Login Screen (Option B - Role Selection + Credentials)

window.renderLoginView = function (container) {
  let selectedRole = "MUNICIPAL_OFFICER";

  function renderForm() {
    container.innerHTML = `
      <div style="min-height: calc(100vh - 65px); display: flex; align-items: center; justify-content: center; padding: 30px 20px; background: var(--bg-app); transition: all 0.25s;">
        <div style="background: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--card-shadow); width: 100%; max-width: 520px; border: 1px solid var(--card-border); overflow: hidden; transition: all 0.25s;">
          
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
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Select Official Portal
            </div>

            <!-- Role Selector Tabs -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
              <button id="role-btn-officer" type="button" style="padding: 14px 12px; border-radius: var(--radius-md); border: 2px solid ${selectedRole === 'MUNICIPAL_OFFICER' ? 'var(--primary-500)' : 'var(--border-main)'}; background: ${selectedRole === 'MUNICIPAL_OFFICER' ? 'var(--primary-50)' : 'var(--bg-surface-elevated)'}; cursor: pointer; text-align: left; transition: all 0.2s;">
                <div style="font-size: 1.2rem; margin-bottom: 4px;">👮‍♂️</div>
                <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-main);">Municipal Officer</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Ward Operations & Live CCTV</div>
              </button>

              <button id="role-btn-head" type="button" style="padding: 14px 12px; border-radius: var(--radius-md); border: 2px solid ${selectedRole === 'MUNICIPAL_HEAD' ? '#f59e0b' : 'var(--border-main)'}; background: ${selectedRole === 'MUNICIPAL_HEAD' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface-elevated)'}; cursor: pointer; text-align: left; transition: all 0.2s;">
                <div style="font-size: 1.2rem; margin-bottom: 4px;">🏛️</div>
                <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-main);">Municipal Head</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Supervisory & Appeal Authority</div>
              </button>
            </div>

            <!-- Login Credentials Form -->
            <form id="login-form">
              <div class="form-field" style="margin-bottom: 16px;">
                <label for="login-username" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Government Officer ID / Email</label>
                <input id="login-username" type="text" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main);" value="${selectedRole === 'MUNICIPAL_OFFICER' ? 'officer.sharma@bhopalcorp.gov.in' : 'commissioner@bhopalcorp.gov.in'}" required />
              </div>

              <div class="form-field" style="margin-bottom: 20px;">
                <label for="login-password" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Official Secure Password / Token</label>
                <input id="login-password" type="password" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main);" value="••••••••••••" required />
              </div>

              <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem;">
                Authenticate & Enter System →
              </button>
            </form>

            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-main); text-align: center;">
              <button class="btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;" onclick="window.enterCitizenView('SD-2026-001284')">
                📱 Switch to Public Citizen Notice View
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    // Hook buttons
    document.getElementById("role-btn-officer").onclick = () => {
      selectedRole = "MUNICIPAL_OFFICER";
      renderForm();
    };

    document.getElementById("role-btn-head").onclick = () => {
      selectedRole = "MUNICIPAL_HEAD";
      renderForm();
    };

    document.getElementById("login-form").onsubmit = (e) => {
      e.preventDefault();
      window.enterPortal(selectedRole);
      if (window.showToast) {
        window.showToast(`Logged in successfully as ${selectedRole === 'MUNICIPAL_HEAD' ? 'Dr. Vinay Verma (Municipal Head)' : 'Inspector R. K. Sharma (Municipal Officer)'}`);
      }
    };
  }

  renderForm();
};
