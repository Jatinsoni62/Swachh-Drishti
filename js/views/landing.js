// SWACHH-DRISHTI Public Landing Page & Portal Selector

window.renderLandingView = function (container) {
  container.innerHTML = `
    <div style="background: linear-gradient(180deg, #022c22 0%, #064e3b 60%, #047857 100%); color: #ffffff; padding: 60px 24px 80px; text-align: center;">
      <div style="max-width: 900px; margin: 0 auto;">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.12); padding: 6px 16px; border-radius: var(--radius-full); margin-bottom: 20px; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">
          <span>🏛️ Bhopal Municipal Corporation</span>
          <span style="opacity: 0.5;">|</span>
          <span>Swachh Bharat Mission AI Initiative</span>
        </div>
        
        <h1 style="font-size: 2.8rem; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 16px;">
          SWACHH-DRISHTI
        </h1>
        <p style="font-size: 1.35rem; color: #a7f3d0; font-weight: 600; margin-bottom: 12px;">
          AI-Powered Public Cleanliness Monitoring & Evidence-Assisted Enforcement
        </p>
        <p style="font-size: 1.1rem; color: #d1fae5; max-width: 680px; margin: 0 auto 32px; font-style: italic;">
          "See the Violation. Verify the Evidence. Improve the City."
        </p>

        <!-- Zero Auto-Fining GovTech Principle Badge -->
        <div style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(20, 184, 166, 0.4); border-radius: var(--radius-md); padding: 14px 20px; display: inline-flex; align-items: center; gap: 12px; font-size: 0.9rem; text-align: left; max-width: 620px; margin-bottom: 36px;">
          <span style="font-size: 1.5rem;">🛡️</span>
          <div>
            <strong style="color: #5eead4;">Guaranteed Zero Auto-Fining Architecture:</strong>
            <span style="color: #e2e8f0; display: block; font-size: 0.82rem; margin-top: 2px;">
              The AI never fines citizens directly. It generates an Evidence Package with temporal frame verification for human Municipal Officer adjudication.
            </span>
          </div>
        </div>

        <!-- 4-Stage Civic Pipeline -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 40px; text-align: left;">
          <div style="background: rgba(255, 255, 255, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">📹</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 1</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px;">CAPTURE</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">Existing 24 CCTV feeds & live browser cameras stream in real time.</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🧠</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 2</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px;">ANALYZE</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">YOLO tracking, pose mapping & 30-frame temporal spitting classifier.</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🧑‍⚖️</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 3</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px;">VERIFY</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">Municipal Officer inspects evidence frame & confirms or rejects violation.</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">📜</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #5eead4; font-weight: 800;">Stage 4</div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px;">ENFORCE</div>
            <p style="font-size: 0.78rem; color: #cbd5e1; margin-top: 4px;">Challan issuance, citizen review appeals & Municipal Head supervisory decisions.</p>
          </div>
        </div>

        <!-- Quick Access Portals -->
        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: #ffffff;">Select Application Portal</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 860px; margin: 0 auto;">
          
          <!-- Portal 1: Officer -->
          <div style="background: #ffffff; color: var(--slate-900); padding: 24px; border-radius: var(--radius-lg); text-align: left; box-shadow: var(--shadow-lg); border-top: 5px solid var(--primary-700);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 1.75rem;">👮‍♂️</span>
              <span class="status-badge status-verified">Operational</span>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--primary-900);">Municipal Officer</h3>
            <p style="font-size: 0.85rem; color: var(--slate-600); margin: 8px 0 18px;">
              Monitor live CCTV feeds, evaluate AI evidence packages, verify incidents & issue challans.
            </p>
            <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="window.enterPortal('MUNICIPAL_OFFICER')">
              Enter Officer Portal →
            </button>
          </div>

          <!-- Portal 2: Head -->
          <div style="background: #ffffff; color: var(--slate-900); padding: 24px; border-radius: var(--radius-lg); text-align: left; box-shadow: var(--shadow-lg); border-top: 5px solid #b45309;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 1.75rem;">🏛️</span>
              <span class="status-badge" style="background: #fef3c7; color: #b45309;">Supervisory</span>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: #92400e;">Municipal Head</h3>
            <p style="font-size: 0.85rem; color: var(--slate-600); margin: 8px 0 18px;">
              Supervise all wards, adjudicate citizen appeals, review analytics & switch to Officer view.
            </p>
            <button class="btn-primary" style="width: 100%; justify-content: center; background: #b45309;" onclick="window.enterPortal('MUNICIPAL_HEAD')">
              Enter Head Portal →
            </button>
          </div>

          <!-- Portal 3: Citizen -->
          <div style="background: #ffffff; color: var(--slate-900); padding: 24px; border-radius: var(--radius-lg); text-align: left; box-shadow: var(--shadow-lg); border-top: 5px solid var(--teal-600);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 1.75rem;">📱</span>
              <span class="status-badge" style="background: var(--teal-100); color: var(--teal-700);">Public Service</span>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--teal-700);">Citizen Challan View</h3>
            <p style="font-size: 0.85rem; color: var(--slate-600); margin: 8px 0 18px;">
              Inspect violation evidence, pay civic fine online, or submit a formal review appeal.
            </p>
            <button class="btn-secondary" style="width: 100%; justify-content: center; color: var(--teal-700); border-color: var(--teal-600);" onclick="window.enterCitizenView('SD-2026-001284')">
              View Sample Notice →
            </button>
          </div>

        </div>

      </div>
    </div>
  `;
};
