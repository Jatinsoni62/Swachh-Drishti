// SWACHH-DRISHTI Login Screen (Option B - Role Selection + Credentials)

window.renderLoginView = function (container) {
  let selectedRole = "MUNICIPAL_OFFICER";

  function renderForm() {
    container.innerHTML = `
      <div style="min-height: calc(100vh - 65px); display: flex; align-items: center; justify-content: center; padding: 30px 20px; background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0fdfa 100%);">
        <div style="background: #ffffff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); width: 100%; max-width: 520px; border: 1px solid var(--slate-200); overflow: hidden;">
          
          <!-- Header Branding -->
          <div style="background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%); color: #ffffff; padding: 28px; text-align: center;">
            <div style="width: 54px; height: 54px; margin: 0 auto 12px; background: var(--teal-600); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
              👁️
            </div>
            <h1 style="font-size: 1.6rem; font-weight: 800; letter-spacing: 0.5px;">SWACHH-DRISHTI</h1>
            <p style="font-size: 0.82rem; color: #a7f3d0; margin-top: 4px; font-weight: 500;">
              AI-Powered Public Cleanliness Monitoring & Evidence-Assisted Enforcement
            </p>
          </div>

          <div style="padding: 28px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--slate-700); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Select Official Portal
            </div>

            <!-- Role Selector Tabs -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
              <button id="role-btn-officer" type="button" style="padding: 14px 12px; border-radius: var(--radius-md); border: 2px solid ${selectedRole === 'MUNICIPAL_OFFICER' ? 'var(--primary-700)' : 'var(--slate-200)'}; background: ${selectedRole === 'MUNICIPAL_OFFICER' ? 'var(--primary-50)' : '#ffffff'}; cursor: pointer; text-align: left; transition: all 0.2s;">
                <div style="font-size: 1.2rem; margin-bottom: 4px;">👮‍♂️</div>
                <div style="font-size: 0.9rem; font-weight: 800; color: ${selectedRole === 'MUNICIPAL_OFFICER' ? 'var(--primary-900)' : 'var(--slate-800)'};">Municipal Officer</div>
                <div style="font-size: 0.72rem; color: var(--slate-500); margin-top: 2px;">Ward Operations & Live CCTV</div>
              </button>

              <button id="role-btn-head" type="button" style="padding: 14px 12px; border-radius: var(--radius-md); border: 2px solid ${selectedRole === 'MUNICIPAL_HEAD' ? '#b45309' : 'var(--slate-200)'}; background: ${selectedRole === 'MUNICIPAL_HEAD' ? '#fef3c7' : '#ffffff'}; cursor: pointer; text-align: left; transition: all 0.2s;">
                <div style="font-size: 1.2rem; margin-bottom: 4px;">🏛️</div>
                <div style="font-size: 0.9rem; font-weight: 800; color: ${selectedRole === 'MUNICIPAL_HEAD' ? '#78350f' : 'var(--slate-800)'};">Municipal Head</div>
                <div style="font-size: 0.72rem; color: var(--slate-500); margin-top: 2px;">Supervisory & Appeal Authority</div>
              </button>
            </div>

            <!-- Login Credentials Form -->
            <form id="login-form">
              <div class="form-field" style="margin-bottom: 16px;">
                <label for="login-username">Government Officer ID / Email</label>
                <input id="login-username" type="text" value="${selectedRole === 'MUNICIPAL_OFFICER' ? 'officer.sharma@bhopalcorp.gov.in' : 'commissioner@bhopalcorp.gov.in'}" required />
              </div>

              <div class="form-field" style="margin-bottom: 20px;">
                <label for="login-password">Official Secure Password / Token</label>
                <input id="login-password" type="password" value="••••••••••••" required />
              </div>

              <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem; ${selectedRole === 'MUNICIPAL_HEAD' ? 'background: #b45309;' : ''}">
                Authenticate & Enter ${selectedRole === 'MUNICIPAL_OFFICER' ? 'Officer Portal' : 'Head Dashboard'} →
              </button>
            </form>

            <div style="margin-top: 18px; text-align: center; border-top: 1px solid var(--slate-200); padding-top: 16px;">
              <p style="font-size: 0.75rem; color: var(--slate-500);">
                🔒 <strong>Authorized municipal personnel only.</strong>
                All visual accesses and evidence verifications are cryptographically audited under BMC Bye-Laws.
              </p>
            </div>
          </div>

        </div>
      </div>
    `;

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
      window.store.setUserRole(selectedRole);
      window.store.setView(selectedRole === "MUNICIPAL_HEAD" ? "head-dashboard" : "dashboard");
    };
  }

  renderForm();
};
