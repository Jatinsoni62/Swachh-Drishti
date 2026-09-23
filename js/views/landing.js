// SWACHH-DRISHTI Public Landing Page & Portal Selector

window.renderLandingView = function (container) {
  const isDark = (document.documentElement.getAttribute("data-theme") || "dark") === "dark";
  
  container.innerHTML = `
    <div style="background: linear-gradient(180deg, var(--primary-900) 0%, var(--primary-800) 50%, var(--bg-app) 100%); color: var(--text-main); padding: 40px 24px 80px; text-align: center; transition: all 0.3s ease;">
      
      <!-- Top Utility Nav -->
      <div style="max-width: 960px; margin: 0 auto 30px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(6px); padding: 6px 16px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff;">
          <span>🏛️ Bhopal Municipal Corporation</span>
          <span style="opacity: 0.5;">|</span>
          <span>Swachh Bharat Mission AI</span>
        </div>

        <button class="theme-toggle-btn" onclick="window.toggleTheme()" style="background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.25); color: #ffffff;" title="Toggle Light / Dark Theme">
          <span class="theme-toggle-icon">${isDark ? '☀️' : '🌙'}</span>
          <span class="theme-toggle-text">${isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div style="max-width: 900px; margin: 0 auto;">
        
        <!-- Hero Logo Display -->
        <div style="display: flex; justify-content: center; margin-bottom: 24px;">
          <div style="width: 110px; height: 110px; padding: 10px; border-radius: 28px; background: rgba(16, 185, 129, 0.15); border: 2px solid rgba(56, 189, 248, 0.4); box-shadow: 0 0 35px rgba(56, 189, 248, 0.35); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
            <img src="${window.getLogoUrl()}" alt="SWACHH-DRISHTI Emblem" class="landing-brand-logo" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));" />
          </div>
        </div>

        <h1 style="font-size: 3rem; font-weight: 900; letter-spacing: -0.5px; line-height: 1.15; margin-bottom: 14px; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
          SWACHH-DRISHTI
        </h1>
        <p style="font-size: 1.35rem; color: #a7f3d0; font-weight: 700; margin-bottom: 12px;">
          AI-Powered Public Cleanliness Monitoring & Evidence-Assisted Enforcement
        </p>
        <p style="font-size: 1.1rem; color: #d1fae5; max-width: 680px; margin: 0 auto 32px; font-style: italic; opacity: 0.95;">
          "See the Violation. Verify the Evidence. Improve the City."
        </p>

        <!-- Zero Auto-Fining GovTech Principle Badge -->
        <div style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: var(--radius-md); padding: 14px 20px; display: inline-flex; align-items: center; gap: 14px; font-size: 0.9rem; text-align: left; max-width: 640px; margin-bottom: 40px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
          <span style="font-size: 1.8rem;">🛡️</span>
          <div>
            <strong style="color: #5eead4; font-size: 0.95rem;">Guaranteed Zero Auto-Fining Architecture:</strong>
            <span style="color: #e2e8f0; display: block; font-size: 0.82rem; margin-top: 3px; line-height: 1.45;">
              The AI never fines citizens directly. It generates an Evidence Package with temporal frame verification for mandatory human Municipal Officer review.
            </span>
          </div>
        </div>

        <!-- 4-Stage Civic Pipeline -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 44px; text-align: left;">
          <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">📹</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 1</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px; color: #ffffff;">CAPTURE</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">Existing 24 CCTV feeds & live browser cameras stream in real time.</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🧠</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 2</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px; color: #ffffff;">ANALYZE</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">YOLO tracking, pose mapping & 30-frame temporal spitting classifier.</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🧑‍⚖️</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 3</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px; color: #ffffff;">VERIFY</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">Municipal Officer inspects evidence frame & confirms or rejects violation.</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">📜</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 4</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px; color: #ffffff;">ENFORCE</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">Challan issuance, citizen review appeals & Municipal Head supervisory decisions.</p>
          </div>
        </div>

        <!-- Quick Access Portals -->
        <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 20px; color: var(--text-main); letter-spacing: 0.5px;">Select Official Operational Portal</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto;">
          
          <!-- Portal 1: Officer -->
          <div style="background: var(--card-bg); color: var(--text-main); border: 1px solid var(--card-border); padding: 24px; border-radius: var(--radius-lg); text-align: left; box-shadow: var(--card-shadow); border-top: 5px solid var(--primary-500); transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 1.75rem;">👮‍♂️</span>
              <span class="status-badge status-verified">Operational</span>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main);">Municipal Officer</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 8px 0 18px; line-height: 1.5;">
              Monitor live CCTV feeds, evaluate AI evidence packages, verify incidents & issue challans.
            </p>
            <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="window.enterPortal('MUNICIPAL_OFFICER')">
              Enter Officer Portal →
            </button>
          </div>

          <!-- Portal 2: Head -->
          <div style="background: var(--card-bg); color: var(--text-main); border: 1px solid var(--card-border); padding: 24px; border-radius: var(--radius-lg); text-align: left; box-shadow: var(--card-shadow); border-top: 5px solid #b45309; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 1.75rem;">🏛️</span>
              <span class="status-badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);">Supervisory</span>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main);">Municipal Head</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 8px 0 18px; line-height: 1.5;">
              Supervise all wards, adjudicate citizen appeals, review analytics & switch to Officer view.
            </p>
            <button class="btn-primary" style="width: 100%; justify-content: center; background: #b45309;" onclick="window.enterPortal('MUNICIPAL_HEAD')">
              Enter Head Portal →
            </button>
          </div>

          <!-- Portal 3: Citizen -->
          <div style="background: var(--card-bg); color: var(--text-main); border: 1px solid var(--card-border); padding: 24px; border-radius: var(--radius-lg); text-align: left; box-shadow: var(--card-shadow); border-top: 5px solid var(--teal-500); transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 1.75rem;">📱</span>
              <span class="status-badge" style="background: var(--teal-100); color: var(--teal-600); border: 1px solid rgba(20, 184, 166, 0.4);">Public Service</span>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main);">Citizen Notice View</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 8px 0 18px; line-height: 1.5;">
              Inspect violation evidence, pay civic fine online, or submit a formal review appeal.
            </p>
            <button class="btn-secondary" style="width: 100%; justify-content: center; color: var(--teal-600); border-color: var(--teal-600);" onclick="window.enterCitizenView('SD-2026-001284')">
              View Sample Notice →
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
};
