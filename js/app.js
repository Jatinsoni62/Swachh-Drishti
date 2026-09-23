// SWACHH-DRISHTI Main Application Controller & View Orchestrator

document.addEventListener("DOMContentLoaded", () => {
  const store = window.store;

  // Global Toast function
  window.showToast = function (message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <span>🔔</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Global Portals & Navigation Launchers
  window.enterPortal = function (role) {
    store.setUserRole(role);
    store.setView(role === "MUNICIPAL_HEAD" ? "head-dashboard" : "dashboard");
  };

  window.enterCitizenView = function (challanId = "SD-2026-001284") {
    store.setView("citizen-challan", { challanId });
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
    const isCitizen = store.currentView === "citizen-challan" || store.currentView === "landing";

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
                ${store.isHeadViewingAsOfficer ? 'Officer Mode (Head)' : (isHead ? 'Municipal Head (Central)' : 'Municipal Officer')}
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

    const isHead = store.currentUser.role === "MUNICIPAL_HEAD" && !store.isHeadViewingAsOfficer;
    const view = store.currentView;
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
          </ul>

          <div class="nav-group-title">Public Portal</div>
          <ul class="nav-links">
            <li class="nav-item ${view === 'citizen-challan' ? 'active' : ''}" onclick="window.enterCitizenView('SD-2026-001284')">
              <div class="nav-item-left">
                <span>📱</span>
                <span>Citizen Notice View</span>
              </div>
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
      case "citizen-challan":
        window.renderCitizenChallanView(viewport, store.selectedChallanId);
        break;
      default:
        window.renderOfficerDashboardView(viewport);
    }
  }

  // Subscribe to store mutations
  store.subscribe((eventType, payload) => {
    if (eventType === "ai_alert") {
      if (window.showToast) {
        window.showToast(`🚨 New AI Alert on ${payload.cameraId}: Suspected Spitting (${payload.aiConfidence}% conf)`);
      }
    }
    renderView();
  });

  // Initial View Rendering (Officer Dashboard as primary operational screen)
  store.setView("dashboard");
});
