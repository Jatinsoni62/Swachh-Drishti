# SWACHH-DRISHTI (स्वच्छ-दृष्टि)
> **AI-Powered Public Cleanliness Monitoring & Evidence-Assisted Municipal Enforcement Platform**  
> *"See the Violation. Verify the Evidence. Improve the City."*

---

## 🏛️ Executive Summary

**SWACHH-DRISHTI** is a computer vision civic cleanliness platform built for urban municipal corporations (Bhopal Municipal Corporation / Swachh Bharat Mission). The prototype focuses on **Gutkha / Paan Spitting Detection** with a strict **Zero Auto-Fining / Human-in-the-Loop** civic enforcement architecture.

```
Live Camera / CCTV 
       ↓
Multi-Person Tracking (ByteTrack)
       ↓
Pose & Behaviour Filter (Eating/Drinking/Coughing Rejected)
       ↓
30-Frame Temporal Trajectory Analysis
       ↓
Evidence Package (Buffered Clip + Snapshot)
       ↓
Municipal Officer Verification
       ↓
Challan Issuance (Section 268)
       ↓
Citizen Notice & Dispute Link
       ↓
Municipal Head Supervisory Adjudication (Approve / Reject / More Info)
```

---

## ✨ Star Features

1. **Multi-Person Real-Time Tracking**:
   - Detects and tracks multiple persons simultaneously in video feeds with individual persistent IDs (`Track P-001`, `Track P-002`, `Track P-003`).
   - Dynamically follows moving individuals, computing velocity vectors (`v: 1.2 m/s`) and centroid movement trails.

2. **Real-Time Webcam Spitting Action Detection**:
   - Directly processes live video frames from the browser camera at 30 FPS.
   - Computes vertical velocity vectors and mouth/chin motion energy to isolate spitting gestures from normal actions.
   - Live **Spit Motion Energy Progress Bar** (`0% - 100%`) with audio-visual chime alerts.

3. **Zero Auto-Fining Guarantee**:
   - The AI never levies financial fines or legal challans directly.
   - It generates a multi-stage **Evidence Package** (clip, snapshot, checklist, timeline).
   - Mandatory sign-off by a human Municipal Officer is required.

4. **Municipal Head Supervisory Role & Role Switching**:
   - Municipal Head has statutory appeal authority over citizen disputes (Approve Challan / Cancel Challan / Request More Info).
   - Prominent **"Switch to Officer Dashboard"** button allowing seamless supervisory inspection with a persistent banner:
     `Viewing as Municipal Officer | Return to Head Dashboard`.

5. **Citizen Violation Notice & Fair Dispute Portal**:
   - Clean public notice displaying Challan ID, violation particulars, location, and keyframe evidence.
   - Citizens can pay online (simulated receipt) or submit a formal **Review Request** (`#REV-2026-0021`) with grounds and attachments.

6. **Civic Cleanliness Hotspots & AI Feedback Loop**:
   - Interactive SVG map of Bhopal wards (Ward 12 New Market, Ward 5 Old Bhopal, Ward 18 Bittan Market, Ward 7 Shahpura, Ward 10 Bairagarh).
   - False-positive analytics and continuous edge model retraining feedback.
   - Immutable chronological audit trail.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas, MediaRecorder API, Web Audio API
- **Styling**: Modern GovTech Design System (Deep Green `#064e3b`, Teal `#0d9488`, Slate `#f8fafc`)
- **Computer Vision**: Frame Differencing & Optical Motion Vector Analysis, Centroid Multi-Person Tracker
- **Backend / Server**: Lightweight native static HTTP server (`server.ps1`)

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox, Brave)
- PowerShell (Windows) or any static HTTP server

### Running Locally

```powershell
# Clone the repository
git clone https://github.com/Jatinsoni62/Swachh-Drishti.git
cd Swachh-Drishti

# Launch the native server
powershell -ExecutionPolicy Bypass -File server.ps1 -Port 8080
```

Open your browser at:
```
http://localhost:8080/
```

---

## 📂 Repository Structure

```
Swachh-Drishti/
├── index.html                    # Single Page Application entry
├── server.ps1                    # Native local HTTP server
├── css/
│   ├── main.css                  # Core design tokens, GovTech theme
│   ├── dashboard.css             # Stats grid, cards, and tables
│   ├── live-monitor.css          # CCTV viewer, bounding boxes, telemetry
│   ├── evidence.css              # Evidence player, timeline, decision actions
│   └── hotspot.css               # Interactive Bhopal SVG ward map
└── js/
    ├── data/mock-data.js         # Bhopal civic config & initial state
    ├── store.js                  # Central reactive store & audit logger
    ├── cv-engine.js              # Real-time multi-person optical CV engine
    ├── app.js                    # Router, supervisory banner, global search
    └── views/
        ├── landing.js            # Public homepage & portal selector
        ├── login.js              # Role-based login (Officer / Head)
        ├── officer-dashboard.js  # Main Officer workspace
        ├── head-dashboard.js     # Supervisory Head view & appeals docket
        ├── live-monitor.js       # Live camera & simulation monitor
        ├── evidence-modal.js     # Evidence package viewer & verification
        ├── challan-view.js       # Citizen public notice & payment
        ├── review-workflow.js    # Appeals management & Head adjudication
        ├── hotspot-view.js       # Ward-level cleanliness intelligence
        └── audit-log.js          # Audit trail & AI retraining metrics
```

---

## 📜 License
Developed for Bhopal Municipal Corporation civic innovation. Open for public municipal research and demonstration.
