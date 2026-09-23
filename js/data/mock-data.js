// SWACHH-DRISHTI Mock Data & Bhopal City Configuration

window.SWACHH_DATA = {
  city: "Bhopal",
  corporation: "Bhopal Municipal Corporation (BMC)",
  wards: [
    {
      id: "ward-12",
      name: "Ward 12",
      zone: "Zone 4",
      locality: "New Market & MP Nagar Zone-1",
      cameraCount: 8,
      hotspotLevel: "critical", // red
      incidentCount: 23,
      verifiedCount: 18,
      challanCount: 12,
      coordinates: { lat: 23.2332, lng: 77.4042 },
      color: "#ef4444"
    },
    {
      id: "ward-5",
      name: "Ward 5",
      zone: "Zone 2",
      locality: "Old Bhopal, VIP Road & Peera Gate",
      cameraCount: 5,
      hotspotLevel: "medium", // yellow
      incidentCount: 8,
      verifiedCount: 6,
      challanCount: 4,
      coordinates: { lat: 23.2599, lng: 77.3985 },
      color: "#f59e0b"
    },
    {
      id: "ward-18",
      name: "Ward 18",
      zone: "Zone 6",
      locality: "Bittan Market & 10 No. Market Area",
      cameraCount: 6,
      hotspotLevel: "high", // orange
      incidentCount: 11,
      verifiedCount: 9,
      challanCount: 7,
      coordinates: { lat: 23.2185, lng: 77.4285 },
      color: "#f97316"
    },
    {
      id: "ward-7",
      name: "Ward 7",
      zone: "Zone 3",
      locality: "Shahpura Lake Promenade",
      cameraCount: 3,
      hotspotLevel: "low", // green
      incidentCount: 3,
      verifiedCount: 2,
      challanCount: 1,
      coordinates: { lat: 23.1950, lng: 77.4220 },
      color: "#10b981"
    },
    {
      id: "ward-10",
      name: "Ward 10",
      zone: "Zone 4",
      locality: "Bairagarh Main Commercial Market",
      cameraCount: 2,
      hotspotLevel: "medium", // yellow
      incidentCount: 6,
      verifiedCount: 4,
      challanCount: 3,
      coordinates: { lat: 23.2680, lng: 77.3420 },
      color: "#f59e0b"
    }
  ],

  cameras: [
    {
      id: "BPL-ICC-042",
      name: "CCTV Pole #42 - New Market Top 'n Town Junction",
      wardId: "ward-12",
      ward: "Ward 12",
      location: "New Market Commercial Pedestrian Plaza",
      status: "ONLINE",
      fps: 24,
      resolution: "1080p FHD",
      type: "PTZ Dome Optical",
      detectionActive: true,
      lastFrame: "Just now"
    },
    {
      id: "BPL-ICC-018",
      name: "CCTV Pole #18 - VIP Road Viewpoint Promenade",
      wardId: "ward-5",
      ward: "Ward 5",
      location: "Upper Lake VIP Waterfront",
      status: "ONLINE",
      fps: 25,
      resolution: "1080p FHD",
      type: "Fixed Bullet",
      detectionActive: true,
      lastFrame: "Just now"
    },
    {
      id: "BPL-ICC-009",
      name: "CCTV Pole #09 - Bittan Market Sabzi Mandi Entrance",
      wardId: "ward-18",
      ward: "Ward 18",
      location: "Bittan Market Gate #2",
      status: "ONLINE",
      fps: 22,
      resolution: "1080p FHD",
      type: "PTZ Dome",
      detectionActive: true,
      lastFrame: "Just now"
    },
    {
      id: "BPL-ICC-021",
      name: "CCTV Pole #21 - MP Nagar Zone-1 Chetak Bridge Side",
      wardId: "ward-12",
      ward: "Ward 12",
      location: "MP Nagar City Bus Stop #4",
      status: "DEGRADED",
      fps: 14,
      resolution: "720p HD",
      type: "Fixed Dome",
      detectionActive: true,
      lastFrame: "15s ago"
    },
    {
      id: "BPL-ICC-033",
      name: "CCTV Pole #33 - Shahpura Lake Park Walkway",
      wardId: "ward-7",
      ward: "Ward 7",
      location: "Shahpura Lake Jogging Track",
      status: "ONLINE",
      fps: 25,
      resolution: "1080p FHD",
      type: "Fixed Bullet",
      detectionActive: true,
      lastFrame: "Just now"
    },
    {
      id: "BPL-ICC-015",
      name: "CCTV Pole #15 - Peera Gate Chauraha",
      wardId: "ward-5",
      ward: "Ward 5",
      location: "Peera Gate Traffic Island",
      status: "OFFLINE",
      fps: 0,
      resolution: "1080p FHD",
      type: "Fixed Bullet",
      detectionActive: false,
      lastFrame: "18m ago"
    }
  ],

  initialIncidents: [
    {
      id: "INC-2026-0842",
      cameraId: "BPL-ICC-042",
      cameraName: "New Market Junction",
      ward: "Ward 12",
      time: "14:32:18",
      date: "12 Sep 2026",
      violationType: "Public Gutkha/Paan Spitting",
      aiConfidence: 87,
      status: "PENDING", // PENDING, VERIFIED, REJECTED, CHALLAN_ISSUED
      trackId: "P-014",
      personBoundingBox: { x: 42, y: 35, width: 22, height: 50 },
      isAlertActive: true,
      evidenceClip: "sim_spit_42.mp4",
      checklist: {
        personDetected: { passed: true, score: 96 },
        poseEstimated: { passed: true, score: 91 },
        behaviourFiltered: { passed: true, score: 88, detail: "Eating/Drinking/Coughing rejected" },
        temporalPattern: { passed: true, score: 89, detail: "30 consecutive frames verified" },
        spittingSuspected: { passed: true, score: 87, detail: "High downward saliva trajectory" }
      },
      timeline: [
        { time: "14:32:12", text: "Pedestrian detected entering camera FOV", critical: false },
        { time: "14:32:15", text: "Track ID P-014 initiated; head/mouth pose tracked", critical: false },
        { time: "14:32:17", text: "Hand-to-mouth motion isolated; behaviour filter engaged", critical: false },
        { time: "14:32:18", text: "Spitting trajectory confirmed across 30 temporal frames", critical: true },
        { time: "14:32:19", text: "Evidence buffer captured; flagged for Municipal Officer verification", critical: false }
      ]
    },
    {
      id: "INC-2026-0839",
      cameraId: "BPL-ICC-018",
      cameraName: "VIP Road Promenade",
      ward: "Ward 5",
      time: "14:25:04",
      date: "12 Sep 2026",
      violationType: "Public Gutkha/Paan Spitting",
      aiConfidence: 92,
      status: "VERIFIED",
      trackId: "P-009",
      personBoundingBox: { x: 30, y: 28, width: 24, height: 52 },
      isAlertActive: false,
      evidenceClip: "sim_spit_18.mp4",
      officerVerification: {
        verifiedBy: "Inspector R. K. Sharma (Officer #104)",
        verifiedAt: "14:28:40",
        notes: "Clear red residue spitting against public promenade railing."
      },
      checklist: {
        personDetected: { passed: true, score: 98 },
        poseEstimated: { passed: true, score: 94 },
        behaviourFiltered: { passed: true, score: 92, detail: "No bottle/food present" },
        temporalPattern: { passed: true, score: 95, detail: "30 frames analyzed" },
        spittingSuspected: { passed: true, score: 92, detail: "Ground stain impact detected" }
      },
      timeline: [
        { time: "14:24:58", text: "Pedestrian stationary near promenade railing", critical: false },
        { time: "14:25:04", text: "Spitting event detected (92% confidence)", critical: true },
        { time: "14:28:40", text: "Verified by Municipal Officer #104", critical: false }
      ]
    },
    {
      id: "INC-2026-0831",
      cameraId: "BPL-ICC-009",
      cameraName: "Bittan Market Gate",
      ward: "Ward 18",
      time: "14:10:15",
      date: "12 Sep 2026",
      violationType: "Public Gutkha/Paan Spitting",
      aiConfidence: 61,
      status: "REJECTED",
      trackId: "P-003",
      personBoundingBox: { x: 55, y: 40, width: 20, height: 45 },
      isAlertActive: false,
      evidenceClip: "sim_spit_09.mp4",
      rejectionDetails: {
        rejectedBy: "Inspector R. K. Sharma (Officer #104)",
        rejectedAt: "14:12:30",
        reason: "Eating/drinking",
        notes: "Subject was drinking bottled water with straw, hand motion misled classifier."
      },
      checklist: {
        personDetected: { passed: true, score: 92 },
        poseEstimated: { passed: true, score: 84 },
        behaviourFiltered: { passed: false, score: 48, detail: "High probability water drinking" },
        temporalPattern: { passed: true, score: 65, detail: "Inconclusive projection" },
        spittingSuspected: { passed: false, score: 61, detail: "Potential false positive" }
      },
      timeline: [
        { time: "14:10:10", text: "Track ID P-003 initiated", critical: false },
        { time: "14:10:15", text: "Low-confidence spitting flag triggered (61%)", critical: false },
        { time: "14:12:30", text: "Officer inspection: Rejected as Eating/Drinking", critical: false }
      ]
    },
    {
      id: "INC-2026-0810",
      cameraId: "BPL-ICC-042",
      cameraName: "New Market Junction",
      ward: "Ward 12",
      time: "12:15:30",
      date: "12 Sep 2026",
      violationType: "Public Gutkha/Paan Spitting",
      aiConfidence: 89,
      status: "CHALLAN_ISSUED",
      challanId: "SD-2026-001284",
      trackId: "P-022",
      personBoundingBox: { x: 38, y: 32, width: 20, height: 48 },
      isAlertActive: false,
      evidenceClip: "sim_spit_1284.mp4",
      officerVerification: {
        verifiedBy: "Inspector R. K. Sharma (Officer #104)",
        verifiedAt: "12:18:10",
        notes: "Direct spitting on pedestrian sidewalk."
      }
    }
  ],

  initialChallans: [
    {
      id: "SD-2026-001284",
      incidentId: "INC-2026-0810",
      violation: "Public Gutkha/Paan Spitting",
      date: "12 Sep 2026",
      time: "12:15:30",
      ward: "Ward 12",
      location: "New Market Commercial Pedestrian Plaza",
      camera: "BPL-ICC-042",
      fineAmount: 500,
      issuedBy: "Inspector R. K. Sharma (Officer #104)",
      issuedAt: "12:20:45",
      status: "ISSUED", // ISSUED, PAID, UNDER_REVIEW, CONFIRMED, CANCELLED
      paymentStatus: "UNPAID",
      citizenPhone: "+91 98260 •••••",
      offenderName: "A. K. Verma (Registered Citizen)",
      reviewRequested: true,
      reviewRef: "REV-2026-0021"
    },
    {
      id: "SD-2026-001280",
      incidentId: "INC-2026-0795",
      violation: "Public Gutkha/Paan Spitting",
      date: "12 Sep 2026",
      time: "10:40:12",
      ward: "Ward 5",
      location: "VIP Road Promenade",
      camera: "BPL-ICC-018",
      fineAmount: 500,
      issuedBy: "Inspector R. K. Sharma (Officer #104)",
      issuedAt: "10:45:00",
      status: "PAID",
      paymentStatus: "PAID (UPI Trans #BMC-884920)",
      citizenPhone: "+91 94250 •••••",
      offenderName: "Deepak S.",
      reviewRequested: false
    }
  ],

  initialReviews: [
    {
      id: "REV-2026-0021",
      challanId: "SD-2026-001284",
      incidentId: "INC-2026-0810",
      submittedAt: "13:05:22",
      submittedBy: "A. K. Verma",
      reason: "I was carrying an inhaler for allergic cough and covered my face with a handkerchief. I did not spit any tobacco or paan. Please re-evaluate the temporal camera angle.",
      attachmentName: "doctor_prescription_respiratory.pdf",
      status: "PENDING_FORWARD", // PENDING_FORWARD (with Officer), PENDING_HEAD (forwarded to Head), CONFIRMED, CANCELLED, MORE_INFO
      officerForwarded: false,
      headDecision: null,
      headDecisionNotes: null
    }
  ],

  initialAuditLogs: [
    { time: "12:15:30", user: "AI Vision Pipeline", role: "SYSTEM", action: "Detected spitting violation (Track P-022, 89% conf)", entity: "Incident", entityId: "INC-2026-0810" },
    { time: "12:18:10", user: "Inspector R. K. Sharma", role: "MUNICIPAL_OFFICER", action: "Verified violation evidence", entity: "Incident", entityId: "INC-2026-0810" },
    { time: "12:20:45", user: "Inspector R. K. Sharma", role: "MUNICIPAL_OFFICER", action: "Issued Challan ₹500", entity: "Challan", entityId: "SD-2026-001284" },
    { time: "12:21:00", user: "BMC SMS Gateway", role: "NOTIFICATION", action: "Sent violation notice with secure link to citizen", entity: "Notice", entityId: "SD-2026-001284" },
    { time: "13:05:22", user: "Citizen (A. K. Verma)", role: "CITIZEN", action: "Submitted review appeal with medical attachment", entity: "Review", entityId: "REV-2026-0021" }
  ]
};
