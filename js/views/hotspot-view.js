// SWACHH-DRISHTI Cleanliness Hotspots & Ward Intelligence View

window.renderHotspotsView = function (container) {
  const store = window.store;
  let selectedWard = store.wards[0]; // Ward 12 New Market by default

  function render() {
    container.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-title-area">
          <h2>
            <span>Bhopal Civic Cleanliness Hotspot Map</span>
            <span class="status-badge status-verified">Actionable Intelligence</span>
          </h2>
          <p>Multi-Ward Spitting Density, Sanitation Enforcement & AI Hotspot Clustering</p>
        </div>

        <div class="dashboard-quick-actions">
          <button class="btn-primary" onclick="window.dispatchSanitationSquad('${selectedWard.name}')">
            <span>🧹</span> Deploy Sanitation Squad to ${selectedWard.name}
          </button>
        </div>
      </div>

      <div class="hotspot-container">
        
        <div class="hotspot-map-wrapper">
          
          <!-- Interactive Bhopal Wards SVG Map -->
          <svg class="map-svg-container" viewBox="0 0 900 540" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090d16" />
                <stop offset="100%" stop-color="#0f172a" />
              </linearGradient>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#bgGrad)" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            <!-- Upper Lake & Lower Lake Waterbody representation -->
            <path d="M 120 180 Q 220 140 280 220 T 360 260 Q 320 340 220 320 T 140 280 Z" fill="#0369a1" fill-opacity="0.35" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4" />
            <text x="210" y="240" fill="#38bdf8" font-size="12" font-weight="700" opacity="0.8">Bada Talab (Upper Lake)</text>

            <path d="M 380 270 Q 420 250 450 280 T 480 310 Q 440 330 400 310 Z" fill="#0369a1" fill-opacity="0.3" stroke="#0284c7" stroke-width="1.5" />
            <text x="405" y="295" fill="#38bdf8" font-size="9" opacity="0.7">Chhota Talab</text>

            <!-- WARD 5: Old Bhopal & VIP Road (Medium - Yellow) -->
            <polygon class="ward-polygon" id="poly-ward-5" points="160,110 320,100 360,200 240,210 170,170" 
              fill="#f59e0b" fill-opacity="0.25" stroke="#f59e0b" stroke-width="${selectedWard.id === 'ward-5' ? '3' : '1.5'}"
              onclick="window.selectWard('ward-5')" />
            <text x="250" y="150" class="ward-label-text">Ward 5 (Old Bhopal)</text>

            <!-- WARD 10: Bairagarh (Medium - Yellow) -->
            <polygon class="ward-polygon" id="poly-ward-10" points="40,80 140,80 150,160 50,150" 
              fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="${selectedWard.id === 'ward-10' ? '3' : '1.5'}"
              onclick="window.selectWard('ward-10')" />
            <text x="95" y="120" class="ward-label-text">Ward 10</text>

            <!-- WARD 12: New Market & MP Nagar (Critical - Red) -->
            <polygon class="ward-polygon" id="poly-ward-12" points="360,210 540,190 580,310 430,340 370,260" 
              fill="#ef4444" fill-opacity="0.35" stroke="#ef4444" stroke-width="${selectedWard.id === 'ward-12' ? '3.5' : '2'}"
              onclick="window.selectWard('ward-12')" />
            <circle cx="470" cy="265" r="16" fill="#ef4444" fill-opacity="0.4" />
            <circle cx="470" cy="265" r="8" fill="#ef4444" />
            <text x="470" y="245" class="ward-label-text" font-weight="900">Ward 12 (New Market)</text>
            <text x="470" y="295" fill="#fca5a5" font-size="10" text-anchor="middle" font-weight="700">23 Violations</text>

            <!-- WARD 18: Bittan Market (High - Orange) -->
            <polygon class="ward-polygon" id="poly-ward-18" points="550,320 690,300 730,420 580,440" 
              fill="#f97316" fill-opacity="0.3" stroke="#f97316" stroke-width="${selectedWard.id === 'ward-18' ? '3' : '1.5'}"
              onclick="window.selectWard('ward-18')" />
            <text x="635" y="375" class="ward-label-text">Ward 18 (Bittan Market)</text>

            <!-- WARD 7: Shahpura Lake (Low - Green) -->
            <polygon class="ward-polygon" id="poly-ward-7" points="430,360 560,340 570,470 420,460" 
              fill="#10b981" fill-opacity="0.25" stroke="#10b981" stroke-width="${selectedWard.id === 'ward-7' ? '3' : '1.5'}"
              onclick="window.selectWard('ward-7')" />
            <text x="495" y="415" class="ward-label-text">Ward 7 (Shahpura)</text>
          </svg>

          <!-- Hotspot Legend -->
          <div class="hotspot-legend">
            <div class="legend-title">Violation Hotspot Severity</div>
            <div class="legend-items">
              <div class="legend-item"><span class="legend-chip" style="background: #10b981;"></span> Low (0-5)</div>
              <div class="legend-item"><span class="legend-chip" style="background: #f59e0b;"></span> Medium (6-10)</div>
              <div class="legend-item"><span class="legend-chip" style="background: #f97316;"></span> High (11-20)</div>
              <div class="legend-item"><span class="legend-chip" style="background: #ef4444;"></span> Critical (20+)</div>
            </div>
          </div>

          <!-- Ward Details Floating Panel -->
          <div class="ward-details-floating">
            <div class="ward-floating-header">
              <div>
                <div class="ward-floating-title">${selectedWard.name}</div>
                <div style="font-size: 0.75rem; color: var(--slate-400);">${selectedWard.locality}</div>
              </div>
              <span class="status-badge" style="background: ${selectedWard.color}; color: #ffffff;">
                ${selectedWard.hotspotLevel.toUpperCase()}
              </span>
            </div>

            <div class="ward-metrics-grid">
              <div class="metric-box">
                <div class="metric-box-label">Incidents (7D)</div>
                <div class="metric-box-val">${selectedWard.incidentCount}</div>
              </div>
              <div class="metric-box">
                <div class="metric-box-label">Verified Violations</div>
                <div class="metric-box-val" style="color: #4ade80;">${selectedWard.verifiedCount}</div>
              </div>
              <div class="metric-box">
                <div class="metric-box-label">Challans Issued</div>
                <div class="metric-box-val" style="color: #60a5fa;">${selectedWard.challanCount}</div>
              </div>
              <div class="metric-box">
                <div class="metric-box-label">Active Cameras</div>
                <div class="metric-box-val">${selectedWard.cameraCount}</div>
              </div>
            </div>

            <div style="font-size: 0.75rem; color: var(--slate-300); margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
              📍 <strong>Sanitation Intelligence:</strong> High concentration observed along Top 'n Town pedestrian corner. Peak spitting window: 13:00 - 15:30.
            </div>

            <button class="btn-primary" style="width: 100%; justify-content: center; font-size: 0.8rem;" onclick="window.filterIncidentsByWard('${selectedWard.name}')">
              Filter Incidents for ${selectedWard.name} →
            </button>
          </div>

        </div>

      </div>
    `;
  }

  window.selectWard = function (wardId) {
    selectedWard = store.wards.find(w => w.id === wardId) || store.wards[0];
    render();
  };

  render();
};

window.dispatchSanitationSquad = function (wardName) {
  if (window.showToast) window.showToast(`🧹 BMC Sanitation Squad #04 dispatched to ${wardName} for deep sidewalk jet-wash.`);
};

window.filterIncidentsByWard = function (wardName) {
  window.store.setView("officer-dashboard");
};
