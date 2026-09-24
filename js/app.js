// SWACHH-DRISHTI Main Application Controller & View Orchestrator

document.addEventListener("DOMContentLoaded", () => {
  const store = window.store;

  // Global Toast Notification System with Max Cap & Dismiss Controls
  window.clearAllToasts = function () {
    const container = document.getElementById("toast-container");
    if (container) {
      container.innerHTML = "";
    }
  };

  window.showToast = function (message, options = {}) {
    // If real-time AI alerts are disabled and this is an alert toast, do not show
    const isAiAlert = typeof message === "string" && (
      message.includes("🚨") ||
      message.includes("AI Alert") ||
      message.includes("SPITTING DETECTED") ||
      message.includes("Suspected Spitting")
    );

    if (isAiAlert && store && !store.aiAlertsEnabled && !options.isSystemNotice) {
      return;
    }

    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    // Limit active toasts to max 2 to prevent screen clutter
    while (container.children.length >= 2) {
      container.removeChild(container.firstChild);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${options.isSystemNotice ? 'toast-system' : ''}`;
    
    let icon = "🔔";
    if (isAiAlert) icon = "🚨";
    else if (message.includes("🔕")) icon = "🔕";
    else if (message.includes("🗑️")) icon = "🗑️";
    else if (message.includes("🟢")) icon = "🟢";
    else if (message.includes("⏸️")) icon = "⏸️";
    else if (message.includes("🎥")) icon = "🎥";
    else if (message.includes("🔴")) icon = "🔴";
    else if (message.includes("⏹️")) icon = "⏹️";

    const cleanMsg = typeof message === "string" ? message.replace(/^[🚨🔔🔕🗑️🟢⏸️🎥🔴⏹️]\s*/, "") : message;

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${cleanMsg}</span>
      <button type="button" class="toast-close-btn" title="Dismiss notification" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 250);
    }, 3800);
  };

  // Synchronize Alert Toggle State across all UI components
  window.updateAlertToggleButtons = function (enabled) {
    const headerBtn = document.getElementById("btn-toggle-global-alerts");
    if (headerBtn) {
      headerBtn.className = `alerts-toggle-btn ${enabled ? 'active' : 'muted'}`;
      headerBtn.innerHTML = `
        <span class="alerts-toggle-icon">${enabled ? '🔔' : '🔕'}</span>
        <span class="alerts-toggle-text">${enabled ? 'Alerts: ON' : 'Alerts: OFF'}</span>
      `;
      headerBtn.title = enabled ? "Real-Time AI Alerts are ON (Click to Mute / Turn OFF)" : "Real-Time AI Alerts are MUTED / OFF (Click to Turn ON)";
    }

    const liveBtn = document.getElementById("btn-toggle-live-alerts");
    if (liveBtn) {
      liveBtn.className = `btn-secondary ${enabled ? 'active-alert-btn' : 'muted-alert-btn'}`;
      liveBtn.innerHTML = `<span>${enabled ? '🔔' : '🔕'}</span><span>${enabled ? 'Alerts: ON' : 'Alerts: OFF'}</span>`;
      liveBtn.title = enabled ? "Real-Time AI Alerts are ON (Click to Mute)" : "Real-Time AI Alerts are MUTED (Click to Turn ON)";
    }

    const trainBtn = document.getElementById("btn-toggle-train-alerts");
    if (trainBtn) {
      trainBtn.className = `btn-secondary ${enabled ? 'active-alert-btn' : 'muted-alert-btn'}`;
      trainBtn.innerHTML = `<span>${enabled ? '🔔' : '🔕'}</span><span>${enabled ? 'Alerts: ON' : 'Alerts: OFF'}</span>`;
      trainBtn.title = enabled ? "Real-Time AI Alerts are ON (Click to Mute)" : "Real-Time AI Alerts are MUTED (Click to Turn ON)";
    }
  };

  // Global Toggle Action
  window.toggleGlobalAiAlerts = function () {
    const newState = store.toggleAiAlerts();
    if (!newState) {
      window.clearAllToasts();
    }
    window.updateAlertToggleButtons(newState);
    if (window.showToast) {
      window.showToast(
        newState ? "🔔 Real-Time AI Alert Popups ENABLED" : "🔕 Real-Time AI Alert Popups MUTED / OFF",
        { isSystemNotice: true }
      );
    }
  };

  // Global Portals & Navigation Launchers
  window.enterPortal = function (role) {
    store.setUserRole(role);
    if (role === "MUNICIPAL_HEAD") {
      store.setView("head-dashboard");
    } else if (role === "CITIZEN") {
      store.setView("citizen-dashboard");
    } else {
      store.setView("dashboard");
    }
  };

  window.enterCitizenDashboard = function (citizenId) {
    if (citizenId) {
      store.loginCitizen(citizenId);
    } else {
      store.setUserRole("CITIZEN");
      store.setView("citizen-dashboard");
    }
  };

  window.enterCitizenView = function (challanId = "SD-2026-001284") {
    store.setView("citizen-challan", { challanId });
  };

  window.openTrainCameraStudio = function () {
    store.setView("train-camera");
  };

  // Render Persistent Supervisory Banner
  function renderSupervisoryBanner() {
    const bannerContainer = document.getElementById("supervisory-banner-root");
    if (!bannerContainer) return;

    if (store.isHeadViewingAsOfficer) {
      bannerContainer.innerHTML = `
        <div class="supervisory-banner">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>👁️</span>
            <span>Viewing as Municipal Officer (Operational Mode)</span>
            <span style="opacity: 0.8; font-weight: 500;">| Dr. Vinay Verma (Municipal Head)</span>
          </div>
          <button onclick="window.store.returnToHeadDashboard()">
            Return to Head Dashboard →
          </button>
        </div>
      `;
    } else {
      bannerContainer.innerHTML = "";
    }
  }

  // Render Top Header
  function renderHeader() {
    const headerContainer = document.getElementById("gov-header-root");
    if (!headerContainer) return;

    const isHead = store.currentUser.role === "MUNICIPAL_HEAD";
    const isCitizenRole = store.currentUser.role === "CITIZEN";
    const isCitizen = isCitizenRole || store.currentView === "citizen-dashboard" || store.currentView === "citizen-challan" || store.currentView === "landing";

    headerContainer.innerHTML = `
      <header class="gov-header">
        
        <!-- Brand / Logo -->
        <div class="brand-section" onclick="window.store.setView('landing')">
          <div class="brand-logo-container">
            <img src="${window.getLogoUrl()}" alt="SWACHH-DRISHTI Emblem" class="app-brand-logo" />
          </div>
          <div class="brand-titles">
            <h1>
              <span>SWACHH-DRISHTI</span>
              <span class="badge">BMC Civic AI</span>
            </h1>
            <p>Public Cleanliness & Evidence-Assisted Enforcement</p>
          </div>
        </div>

        <!-- Global Search Bar -->
        ${!isCitizen ? `
          <div class="header-center">
            <div class="global-search">
              <span class="search-icon">🔍</span>
              <input type="text" id="global-search-input" placeholder="Search Challan ID, Incident ID, Camera (e.g. SD-2026-001284)..." />
            </div>
          </div>
        ` : '<div style="flex: 1;"></div>'}

        <!-- Header Actions & Profile -->
        <div class="header-actions">
          <!-- Real-Time AI Alerts ON / OFF Toggle Button -->
          <button 
            id="btn-toggle-global-alerts" 
            class="alerts-toggle-btn ${store.aiAlertsEnabled ? 'active' : 'muted'}" 
            onclick="window.toggleGlobalAiAlerts()" 
            title="${store.aiAlertsEnabled ? 'Real-Time AI Alerts are ON (Click to Mute / Turn OFF)' : 'Real-Time AI Alerts are MUTED / OFF (Click to Turn ON)'}"
          >
            <span class="alerts-toggle-icon">${store.aiAlertsEnabled ? '🔔' : '🔕'}</span>
            <span class="alerts-toggle-text">${store.aiAlertsEnabled ? 'Alerts: ON' : 'Alerts: OFF'}</span>
          </button>

          <!-- Light / Dark Theme Toggle Button -->
          <button class="theme-toggle-btn" onclick="window.toggleTheme()" title="${store.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}">
            <span class="theme-toggle-icon">${store.theme === 'dark' ? '☀️' : '🌙'}</span>
            <span class="theme-toggle-text">${store.theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <div class="live-indicator-badge">
            <span class="pulse-dot"></span>
            <span>21/24 Cameras Active</span>
          </div>

          <!-- Role Switching / Profile -->
          <div class="user-profile-menu">
            <div class="user-avatar">${store.currentUser.avatar}</div>
            <div class="user-info">
              <span class="user-name">${store.currentUser.name}</span>
              <span class="user-role-badge">
                ${store.isHeadViewingAsOfficer ? 'Officer Mode (Head)' : (isHead ? 'Municipal Head (Central)' : (isCitizenRole ? 'Verified Citizen' : 'Municipal Officer'))}
              </span>
            </div>

            <!-- Head prominent switch button or Role Switcher -->
            ${isHead && !store.isHeadViewingAsOfficer ? `
              <button class="btn-switch-role" style="background: var(--bg-surface-subtle); border-color: var(--border-main); color: var(--text-main);" onclick="window.confirmSwitchToOfficer()">
                <span>⇄</span> Switch to Officer View
              </button>
            ` : ''}

            <button class="btn-secondary" style="padding: 6px 10px; font-size: 0.75rem;" onclick="window.store.setView('login')">
              Switch Role / Login
            </button>
          </div>
        </div>

      </header>
    `;

    // Hook search
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
      searchInput.onkeydown = (e) => {
        if (e.key === "Enter") {
          const val = searchInput.value.trim().toUpperCase();
          if (val.startsWith("SD-")) {
            store.setView("citizen-challan", { challanId: val });
          } else if (val.startsWith("INC-")) {
            window.openEvidenceModal(val);
          } else if (val.startsWith("REV-")) {
            store.setView("reviews");
          } else {
            store.setView("dashboard");
          }
        }
      };
    }
  }

  // Render Sidebar
  function renderSidebar() {
    const sidebarContainer = document.getElementById("app-sidebar-root");
    if (!sidebarContainer) return;

    if (store.currentView === "landing" || store.currentView === "login") {
      sidebarContainer.style.display = "none";
      return;
    }
    sidebarContainer.style.display = "flex";

    const view = store.currentView;
    const isCitizenMode = store.currentUser.role === "CITIZEN" || view === "citizen-dashboard" || view === "citizen-challan";
    if (isCitizenMode) {
      const citizen = store.activeCitizen || store.registeredCitizens[0];
      const citizenChallans = store.challans.filter(c => c.citizenId === citizen.id || (c.offenderName && c.offenderName.toLowerCase() === citizen.name.toLowerCase()));
      const unpaidCount = citizenChallans.filter(c => c.status === "ISSUED").length;

      sidebarContainer.innerHTML = `
        <aside class="app-sidebar">
          <div>
            <!-- Citizen Identity Badge -->
            <div style="padding: 12px 14px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.25); margin-bottom: 16px;">
              <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; color: #047857; letter-spacing: 0.5px;">
                Civic Portal • आम नागरिक
              </div>
              <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-top: 2px;">
                ${citizen.name}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace; margin-top: 1px;">
                ID: ${citizen.id} • ${citizen.ward}
              </div>
            </div>

            <div class="nav-group-title">Citizen Services</div>
            <ul class="nav-links">
              <li class="nav-item ${view === 'citizen-dashboard' ? 'active' : ''}" onclick="window.enterCitizenDashboard()">
                <div class="nav-item-left">
                  <span>👤</span>
                  <span>My Dashboard & Face ID</span>
                </div>
                ${unpaidCount > 0 ? `<span class="nav-badge" style="background: #ef4444; color: #ffffff;">${unpaidCount} Due</span>` : `<span class="nav-badge" style="background: #10b981; color: #ffffff;">Clean</span>`}
              </li>

              <li class="nav-item ${view === 'citizen-challan' ? 'active' : ''}" onclick="window.enterCitizenView('SD-2026-001284')">
                <div class="nav-item-left">
                  <span>📜</span>
                  <span>My Notices & Receipts</span>
                </div>
                <span class="nav-badge blue">${citizenChallans.length}</span>
              </li>
            </ul>

            <div class="nav-group-title" style="margin-top: 22px;">Official Login</div>
            <ul class="nav-links">
              <li class="nav-item" onclick="window.store.setView('login')">
                <div class="nav-item-left">
                  <span>⇄</span>
                  <span>Switch to Officer / Head Portal</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="sidebar-footer">
            <div class="bmc-seal">
              <img src="${window.getLogoUrl()}" class="seal-logo-img" alt="Emblem" style="width: 24px; height: 24px; object-fit: contain;" />
              <div>
                <strong>Bhopal Municipal Corp</strong>
                <div>Public Citizen Fair Portal</div>
              </div>
            </div>
          </div>
        </aside>
      `;
      return;
    }

    const isHead = store.currentUser.role === "MUNICIPAL_HEAD" && !store.isHeadViewingAsOfficer;
    const pendingIncidents = store.incidents.filter(i => i.status === "PENDING").length;
    const pendingReviews = store.reviews.filter(r => r.status === "PENDING_HEAD" || r.status === "PENDING_FORWARD").length;

    sidebarContainer.innerHTML = `
      <aside class="app-sidebar">
        <div>
          <div class="nav-group-title">Operations & Feeds</div>
          <ul class="nav-links">
            <li class="nav-item ${view === 'dashboard' || view === 'head-dashboard' ? 'active' : ''}" onclick="window.store.setView(window.store.currentUser.role === 'MUNICIPAL_HEAD' && !window.store.isHeadViewingAsOfficer ? 'head-dashboard' : 'dashboard')">
              <div class="nav-item-left">
                <span>📊</span>
                <span>${isHead ? 'Head Dashboard' : 'Dashboard'}</span>
              </div>
            </li>

            <li class="nav-item ${view === 'live-monitor' ? 'active' : ''}" onclick="window.store.setView('live-monitor')">
              <div class="nav-item-left">
                <span>📹</span>
                <span>Live Monitoring</span>
              </div>
              <span class="pulse-dot"></span>
            </li>

            ${!isHead ? `
              <li class="nav-item ${view === 'incidents' ? 'active' : ''}" onclick="window.store.setView('dashboard')">
                <div class="nav-item-left">
                  <span>🚨</span>
                  <span>Incidents Queue</span>
                </div>
                ${pendingIncidents > 0 ? `<span class="nav-badge">0${pendingIncidents}</span>` : ''}
              </li>
            ` : ''}
          </ul>

          <div class="nav-group-title">Enforcement & Appeals</div>
          <ul class="nav-links">
            <li class="nav-item ${view === 'challans' ? 'active' : ''}" onclick="window.store.setView('challans')">
              <div class="nav-item-left">
                <span>📜</span>
                <span>Challans Issued</span>
              </div>
              <span class="nav-badge blue">${store.challans.length}</span>
            </li>

            <li class="nav-item ${view === 'reviews' ? 'active' : ''}" onclick="window.store.setView('reviews')">
              <div class="nav-item-left">
                <span>⚖️</span>
                <span>Review Appeals</span>
              </div>
              ${pendingReviews > 0 ? `<span class="nav-badge">${pendingReviews}</span>` : ''}
            </li>

            <li class="nav-item ${view === 'hotspots' ? 'active' : ''}" onclick="window.store.setView('hotspots')">
              <div class="nav-item-left">
                <span>🗺️</span>
                <span>Hotspot Map</span>
              </div>
            </li>

            <li class="nav-item ${view === 'analytics' ? 'active' : ''}" onclick="window.store.setView('analytics')">
              <div class="nav-item-left">
                <span>🔁</span>
                <span>Audit & AI Metrics</span>
              </div>
            </li>

            <li class="nav-item ${view === 'incident-tracker' ? 'active' : ''}" onclick="window.store.setView('incident-tracker')" title="Trace civic violations by optical Track ID or Incident Ref">
              <div class="nav-item-left">
                <span>📍</span>
                <span>Incident Tracker</span>
              </div>
              <span class="nav-badge track-id">Track ID</span>
            </li>

            <li class="nav-item ${view === 'train-camera' ? 'active' : ''}" onclick="window.store.setView('train-camera')" title="Interactive Camera Training Studio">
              <div class="nav-item-left">
                <span>🎥</span>
                <span>Train Camera</span>
              </div>
              <span class="nav-badge" style="background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.35); font-size: 0.65rem; font-weight: 800; padding: 2px 7px;">Studio</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="bmc-seal">
            <img src="${window.getLogoUrl()}" class="seal-logo-img" alt="Emblem" style="width: 24px; height: 24px; object-fit: contain;" />
            <div>
              <strong>Bhopal Municipal Corp</strong>
              <div>Swachh Bharat 2026</div>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  // Main View Router
  function renderView() {
    renderSupervisoryBanner();
    renderHeader();
    renderSidebar();

    const viewport = document.getElementById("app-viewport");
    if (!viewport) return;

    // Clean any prior canvas/animation loop if switching from live monitor
    if (store.currentView !== "live-monitor" && window.cvEngine) {
      window.cvEngine.stop();
    }

    switch (store.currentView) {
      case "landing":
        window.renderLandingView(viewport);
        break;
      case "login":
        window.renderLoginView(viewport);
        break;
      case "dashboard":
        window.renderOfficerDashboardView(viewport);
        break;
      case "head-dashboard":
        window.renderHeadDashboardView(viewport);
        break;
      case "live-monitor":
        window.renderLiveMonitorView(viewport);
        break;
      case "challans":
        window.renderChallansView(viewport);
        break;
      case "reviews":
        window.renderReviewsView(viewport);
        break;
      case "hotspots":
        window.renderHotspotsView(viewport);
        break;
      case "analytics":
        window.renderAuditView(viewport);
        break;
      case "incident-tracker":
        window.renderIncidentTrackerView(viewport);
        break;
      case "train-camera":
        window.renderTrainCameraView(viewport);
        break;
      case "citizen-dashboard":
        window.renderCitizenDashboardView(viewport);
        break;
      case "citizen-challan":
        window.renderCitizenChallanView(viewport, store.selectedChallanId);
        break;
      default:
        window.renderOfficerDashboardView(viewport);
    }
  }

  // Subscribe to store mutations
  store.subscribe((eventType, payload) => {
    if (eventType === "ai_alerts_toggled") {
      if (window.updateAlertToggleButtons) {
        window.updateAlertToggleButtons(payload.enabled);
      }
    }
    if (eventType === "ai_alert") {
      // Don't disturb active officer training session with background CCTV toasts, and verify alerts are enabled
      if (store.aiAlertsEnabled && store.currentView !== "train-camera" && window.showToast) {
        window.showToast(`🚨 New AI Alert on ${payload.cameraId}: Suspected Spitting (${payload.aiConfidence}% conf)`);
      }
    }
    // Don't interrupt active camera training view when background events occur
    if (store.currentView !== "train-camera") {
      renderView();
    }
  });

  // Initial View Rendering (Officer Dashboard as primary operational screen)
  store.setView("dashboard");
});
