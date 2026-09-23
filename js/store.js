// SWACHH-DRISHTI Central Reactive Store & State Controller

class SwachhStore {
  constructor() {
    this.currentUser = {
      name: "Inspector R. K. Sharma",
      role: "MUNICIPAL_OFFICER", // MUNICIPAL_OFFICER, MUNICIPAL_HEAD, CITIZEN
      badgeNumber: "BMC-104",
      ward: "Ward 12 (New Market / MP Nagar)",
      avatar: "RS"
    };

    this.isHeadViewingAsOfficer = false;
    this.currentView = "dashboard"; // dashboard, live-monitor, incidents, evidence, challans, reviews, hotspots, analytics, citizen-challan
    this.selectedIncidentId = "INC-2026-0842";
    this.selectedChallanId = "SD-2026-001284";

    // Load from mock data
    const data = window.SWACHH_DATA;
    this.cameras = [...data.cameras];
    this.incidents = [...data.initialIncidents];
    this.challans = [...data.initialChallans];
    this.reviews = [...data.initialReviews];
    this.auditLogs = [...data.initialAuditLogs];
    this.wards = [...data.wards];

    // AI performance stats
    this.stats = {
      detectedTotal: 37,
      verifiedTotal: 24,
      rejectedTotal: 13,
      challansIssued: 19,
      reviewRequests: 3,
      liveCamerasOnline: 21,
      liveCamerasTotal: 24,
      rejectionBreakdown: {
        "Eating/drinking": 6,
        "Coughing/sneezing": 4,
        "Touching face": 2,
        "Insufficient evidence": 1
      }
    };

    // Theme Management (Light / Dark, defaults to dark)
    this.theme = localStorage.getItem("swachh_theme") || "dark";
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", this.theme);
    }

    this.listeners = [];
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem("swachh_theme", theme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      // Update any theme-specific images
      document.querySelectorAll(".app-brand-logo, .landing-brand-logo, .login-brand-logo, .seal-logo-img").forEach(img => {
        img.src = window.getLogoUrl();
      });
      // Update theme toggle buttons
      document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
        const isDark = theme === "dark";
        btn.innerHTML = `<span class="theme-toggle-icon">${isDark ? "☀️" : "🌙"}</span><span class="theme-toggle-text">${isDark ? "Light" : "Dark"}</span>`;
        btn.title = isDark ? "Switch to Light Theme" : "Switch to Dark Theme";
      });
    }
    this.notify("theme_change", { theme });
  }

  toggleTheme() {
    const next = this.theme === "dark" ? "light" : "dark";
    this.setTheme(next);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(eventType, payload) {
    this.listeners.forEach(cb => cb(eventType, payload, this));
  }

  // Authentication & Role Management
  setUserRole(role) {
    if (role === "MUNICIPAL_HEAD") {
      this.currentUser = {
        name: "Dr. Vinay Verma, IAS",
        role: "MUNICIPAL_HEAD",
        badgeNumber: "BMC-COMM-01",
        ward: "BMC Central Administration (All Zones)",
        avatar: "VV"
      };
      this.isHeadViewingAsOfficer = false;
    } else if (role === "MUNICIPAL_OFFICER") {
      this.currentUser = {
        name: "Inspector R. K. Sharma",
        role: "MUNICIPAL_OFFICER",
        badgeNumber: "BMC-104",
        ward: "Ward 12 (New Market / MP Nagar)",
        avatar: "RS"
      };
      this.isHeadViewingAsOfficer = false;
    } else {
      this.currentUser = {
        name: "Citizen Portal User",
        role: "CITIZEN",
        badgeNumber: "PUBLIC",
        ward: "Ward 12",
        avatar: "CP"
      };
    }
    this.notify("role_changed", this.currentUser);
  }

  switchHeadToOfficer() {
    if (this.currentUser.role === "MUNICIPAL_HEAD" || this.isHeadViewingAsOfficer) {
      this.isHeadViewingAsOfficer = true;
      this.addAuditLog(
        this.currentUser.name,
        "MUNICIPAL_HEAD",
        "Switched to operational Municipal Officer Dashboard view",
        "SecuritySession",
        "SESSION-HEAD"
      );
      this.notify("head_switched_view", { isHeadViewingAsOfficer: true });
    }
  }

  returnToHeadDashboard() {
    this.isHeadViewingAsOfficer = false;
    this.addAuditLog(
      this.currentUser.name,
      "MUNICIPAL_HEAD",
      "Returned to Municipal Head Supervisory Dashboard",
      "SecuritySession",
      "SESSION-HEAD"
    );
    this.notify("head_returned_view", { isHeadViewingAsOfficer: false });
  }

  setView(viewName, params = {}) {
    this.currentView = viewName;
    if (params.incidentId) this.selectedIncidentId = params.incidentId;
    if (params.challanId) this.selectedChallanId = params.challanId;
    this.notify("view_changed", { view: viewName, params });
  }

  // Audit Logging
  addAuditLog(user, role, action, entity, entityId) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const log = {
      time: timeStr,
      user,
      role,
      action,
      entity,
      entityId
    };
    this.auditLogs.unshift(log);
    this.notify("audit_logged", log);
  }

  // Incident Verification Flow
  verifyIncident(incidentId, officerNotes = "Verified by Municipal Officer on duty") {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) return false;

    inc.status = "VERIFIED";
    inc.isAlertActive = false;
    inc.officerVerification = {
      verifiedBy: `${this.currentUser.name} (${this.currentUser.badgeNumber})`,
      verifiedAt: new Date().toTimeString().split(' ')[0],
      notes: officerNotes
    };

    inc.timeline.push({
      time: new Date().toTimeString().split(' ')[0],
      text: `Verified by ${this.currentUser.name} (Violation Confirmed)`,
      critical: true
    });

    this.stats.verifiedTotal++;
    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      `Verified spitting violation on ${inc.cameraId} (${inc.ward})`,
      "Incident",
      inc.id
    );

    this.notify("incident_updated", inc);
    return true;
  }

  rejectIncident(incidentId, reason = "False positive", notes = "") {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) return false;

    inc.status = "REJECTED";
    inc.isAlertActive = false;
    inc.rejectionDetails = {
      rejectedBy: `${this.currentUser.name} (${this.currentUser.badgeNumber})`,
      rejectedAt: new Date().toTimeString().split(' ')[0],
      reason,
      notes: notes || `Rejected as ${reason}`
    };

    inc.timeline.push({
      time: new Date().toTimeString().split(' ')[0],
      text: `Detection rejected by Officer: ${reason}`,
      critical: false
    });

    this.stats.rejectedTotal++;
    if (!this.stats.rejectionBreakdown[reason]) {
      this.stats.rejectionBreakdown[reason] = 0;
    }
    this.stats.rejectionBreakdown[reason]++;

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      `Rejected detection on ${inc.cameraId}: ${reason} (Feedback logged to training buffer)`,
      "Incident",
      inc.id
    );

    this.notify("incident_updated", inc);
    return true;
  }

  // Challan Generation
  issueChallan(incidentId, fineAmount = 500, offenderName = "Pedestrian Offender") {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) return null;

    const challanNum = 1285 + this.challans.length;
    const challanId = `SD-2026-00${challanNum}`;

    const newChallan = {
      id: challanId,
      incidentId: inc.id,
      violation: inc.violationType,
      date: inc.date,
      time: inc.time,
      ward: inc.ward,
      location: inc.cameraName || `${inc.ward} Civic Zone`,
      camera: inc.cameraId,
      fineAmount: Number(fineAmount),
      issuedBy: `${this.currentUser.name} (${this.currentUser.badgeNumber})`,
      issuedAt: new Date().toTimeString().split(' ')[0],
      status: "ISSUED",
      paymentStatus: "UNPAID",
      citizenPhone: "+91 98260 •••••",
      offenderName,
      reviewRequested: false
    };

    inc.status = "CHALLAN_ISSUED";
    inc.challanId = challanId;
    inc.timeline.push({
      time: new Date().toTimeString().split(' ')[0],
      text: `Challan ${challanId} issued (Fine: ₹${fineAmount})`,
      critical: true
    });

    this.challans.unshift(newChallan);
    this.stats.challansIssued++;

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      `Issued Challan ₹${fineAmount} under Section 268/Bhopal Municipal Swachhta Bye-Laws`,
      "Challan",
      challanId
    );

    // Simulated SMS dispatch
    this.addAuditLog(
      "BMC Notification Engine",
      "SYSTEM",
      `Dispatched Challan SMS notice with secure review link to citizen`,
      "Notice",
      challanId
    );

    this.notify("challan_issued", newChallan);
    return newChallan;
  }

  // Citizen Review Request
  submitCitizenReview(challanId, reason, attachmentName = null) {
    const challan = this.challans.find(c => c.id === challanId);
    if (!challan) return null;

    const revNum = 22 + this.reviews.length;
    const reviewId = `REV-2026-00${revNum}`;

    const newReview = {
      id: reviewId,
      challanId: challan.id,
      incidentId: challan.incidentId,
      submittedAt: new Date().toTimeString().split(' ')[0],
      submittedBy: challan.offenderName,
      reason,
      attachmentName: attachmentName || "supporting_statement.pdf",
      status: "PENDING_FORWARD", // with Officer
      officerForwarded: false,
      headDecision: null,
      headDecisionNotes: null
    };

    challan.status = "UNDER_REVIEW";
    challan.reviewRequested = true;
    challan.reviewRef = reviewId;

    this.reviews.unshift(newReview);
    this.stats.reviewRequests++;

    this.addAuditLog(
      challan.offenderName,
      "CITIZEN",
      `Requested municipal review for Challan ${challanId}`,
      "Review",
      reviewId
    );

    this.notify("review_submitted", newReview);
    return newReview;
  }

  // Settle / Pay Challan via UPI
  payChallan(challanId, paymentMethod = "PhonePe UPI QR") {
    const challan = this.challans.find(c => c.id === challanId);
    if (!challan) return null;

    challan.status = "PAID";
    challan.paymentStatus = "PAID";
    challan.paidAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    challan.paidDate = new Date().toISOString().split('T')[0];
    challan.transactionId = "UPI/TXN/" + Math.floor(10000000 + Math.random() * 90000000);
    challan.paymentMethod = paymentMethod;

    const inc = this.incidents.find(i => i.id === challan.incidentId);
    if (inc) {
      inc.status = "RESOLVED";
      inc.timeline.push({
        time: challan.paidAt,
        text: `Civic fine ₹${challan.fineAmount} paid via ${paymentMethod} (Txn: ${challan.transactionId})`,
        critical: false
      });
    }

    this.addAuditLog(
      challan.offenderName || "Citizen",
      "CITIZEN",
      `Paid fine ₹${challan.fineAmount} for ${challanId} via ${paymentMethod} (Txn: ${challan.transactionId})`,
      "Payment",
      challanId
    );

    this.notify("challan_paid", challan);
    return challan;
  }

  // Officer forwards review to Municipal Head
  forwardReviewToHead(reviewId, officerNote = "Forwarded for supervisory adjudication") {
    const rev = this.reviews.find(r => r.id === reviewId);
    if (!rev) return false;

    rev.status = "PENDING_HEAD";
    rev.officerForwarded = true;
    rev.officerNote = officerNote;
    rev.forwardedAt = new Date().toTimeString().split(' ')[0];

    this.addAuditLog(
      this.currentUser.name,
      this.currentUser.role,
      `Forwarded Citizen Review ${reviewId} to Municipal Head with evidence package`,
      "Review",
      reviewId
    );

    this.notify("review_forwarded", rev);
    return true;
  }

  // Municipal Head Adjudicates Review
  headAdjudicateReview(reviewId, decision, notes = "") {
    // decision: "APPROVE", "REJECT", "MORE_INFO"
    const rev = this.reviews.find(r => r.id === reviewId);
    if (!rev) return false;

    const challan = this.challans.find(c => c.id === rev.challanId);
    const nowStr = new Date().toTimeString().split(' ')[0];

    rev.headDecision = decision;
    rev.headDecisionNotes = notes;
    rev.decidedAt = nowStr;

    if (decision === "APPROVE") {
      // Head approves officer challan (rejects citizen appeal)
      rev.status = "CONFIRMED";
      if (challan) {
        challan.status = "CONFIRMED";
      }
      this.addAuditLog(
        this.currentUser.name,
        "MUNICIPAL_HEAD",
        `Upheld and Confirmed Challan ${rev.challanId} after evidentiary review`,
        "Review",
        reviewId
      );
      this.addAuditLog(
        "BMC Notification Engine",
        "SYSTEM",
        `Sent notice to citizen: Review evaluated by Municipal Head. Challan confirmed, payment due.`,
        "Notice",
        rev.challanId
      );
    } else if (decision === "REJECT") {
      // Head rejects/cancels challan (accepts citizen appeal)
      rev.status = "CANCELLED";
      if (challan) {
        challan.status = "CANCELLED";
        challan.paymentStatus = "WAIVED / CANCELLED";
      }
      this.addAuditLog(
        this.currentUser.name,
        "MUNICIPAL_HEAD",
        `Cancelled Challan ${rev.challanId} based on citizen evidence appeal`,
        "Review",
        reviewId
      );
      this.addAuditLog(
        "BMC Notification Engine",
        "SYSTEM",
        `Sent notice to citizen: Review accepted by Municipal Head. Challan cancelled, penalty waived.`,
        "Notice",
        rev.challanId
      );
    } else if (decision === "MORE_INFO") {
      rev.status = "MORE_INFO";
      if (challan) {
        challan.status = "UNDER_FURTHER_REVIEW";
      }
      this.addAuditLog(
        this.currentUser.name,
        "MUNICIPAL_HEAD",
        `Requested additional camera angle footage and inquiry for Review ${reviewId}`,
        "Review",
        reviewId
      );
    }

    this.notify("review_adjudicated", { review: rev, challan });
    return true;
  }

  // Citizen Simulated Payment
  payChallan(challanId) {
    const challan = this.challans.find(c => c.id === challanId);
    if (!challan) return false;

    challan.paymentStatus = `PAID (Ref #BMC-${Math.floor(100000 + Math.random() * 900000)})`;
    challan.status = "PAID";
    challan.paidAt = new Date().toTimeString().split(' ')[0];

    this.addAuditLog(
      challan.offenderName,
      "CITIZEN",
      `Paid fine ₹${challan.fineAmount} via Swachh-Drishti Online Portal`,
      "Challan",
      challanId
    );

    this.notify("challan_paid", challan);
    return true;
  }

  // Trigger simulated or real spitting event from CCTV or Webcam
  triggerSpittingDetection(cameraId = "BPL-ICC-042", confidence = 87, personBox = null, snapshotUrl = null, videoUrl = null) {
    const cam = this.cameras.find(c => c.id === cameraId) || {
      id: "LIVE-CAM-01",
      name: "Desk Live Monitoring Camera (Webcam)",
      ward: "Ward 12",
      location: "Municipal Operational Console"
    };
    const incNum = 843 + this.incidents.length;
    const incId = `INC-2026-0${incNum}`;
    const nowStr = new Date().toTimeString().split(' ')[0];

    const newInc = {
      id: incId,
      cameraId: cam.id,
      cameraName: cam.name,
      ward: cam.ward,
      time: nowStr,
      date: "12 Sep 2026",
      violationType: "Public Gutkha/Paan Spitting",
      aiConfidence: confidence,
      status: "PENDING",
      trackId: `P-0${Math.floor(10 + Math.random() * 80)}`,
      personBoundingBox: personBox || { x: 30, y: 20, width: 40, height: 60 },
      isAlertActive: true,
      snapshotUrl: snapshotUrl || null,
      videoUrl: videoUrl || null,
      isWebcamCapture: Boolean(snapshotUrl || videoUrl),
      evidenceClip: snapshotUrl ? "webcam_live_buffered_clip.webm" : "live_captured_event.mp4",
      checklist: {
        personDetected: { passed: true, score: 98 },
        poseEstimated: { passed: true, score: 95 },
        behaviourFiltered: { passed: true, score: 91, detail: "Mouth trajectory & downward projectile detected" },
        temporalPattern: { passed: true, score: 94, detail: "30 consecutive frames verified in real time" },
        spittingSuspected: { passed: true, score: confidence, detail: "Real webcam optical motion triggered" }
      },
      timeline: [
        { time: nowStr, text: "Live camera motion stream initiated", critical: false },
        { time: nowStr, text: "Head pose & mouth gesture mapped by optical analyzer", critical: false },
        { time: nowStr, text: "Downward projection detected (Not drinking/talking)", critical: false },
        { time: nowStr, text: `Real spitting action detected (${confidence}% confidence, 30-frame temporal analysis)`, critical: true },
        { time: nowStr, text: "Real webcam evidence buffered; awaiting Municipal Officer verification", critical: false }
      ]
    };

    this.incidents.unshift(newInc);
    this.selectedIncidentId = incId;
    this.stats.detectedTotal++;

    this.addAuditLog(
      "Live Camera CV Pipeline",
      "SYSTEM",
      `Flagged real camera spitting action (${confidence}%) on ${cam.id}`,
      "Incident",
      incId
    );

    this.notify("ai_alert", newInc);
    return newInc;
  }
}

window.store = new SwachhStore();

window.getLogoUrl = function () {
  const currentTheme = document.documentElement.getAttribute("data-theme") || (window.store && window.store.theme) || "dark";
  if (currentTheme === "dark") {
    return window.LOGO_DARK || "assets/logo-dark.png";
  } else {
    return window.LOGO_LIGHT || "assets/logo-light.png";
  }
};

window.toggleTheme = function () {
  if (window.store) {
    window.store.toggleTheme();
  }
};
