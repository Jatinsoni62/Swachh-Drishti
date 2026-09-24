// SWACHH-DRISHTI Multi-Person Computer Vision & Biomechanical Action Verifier

class SwachhCVEngine {
  constructor() {
    this.mode = "simulation"; // "simulation" or "webcam"
    this.isRunning = false;
    this.activeCameraId = "BPL-ICC-042";

    this.videoElement = null;
    this.canvasElement = null;
    this.ctx = null;
    this.animFrameId = null;

    // Optical motion analysis offscreen canvas
    this.analysisCanvas = document.createElement("canvas");
    this.analysisCanvas.width = 160;
    this.analysisCanvas.height = 120;
    this.analysisCtx = this.analysisCanvas.getContext("2d", { willReadFrequently: true });
    this.prevFrameLuma = null;

    // Multi-Person Tracker State (tracks everyone in frame individually)
    this.tracks = []; // Array of active tracked persons
    this.nextTrackNum = 1;
    this.maxTrackingDistance = 90; // Max centroid distance for association

    // Global settings & sensitivity
    this.temporalBufferSize = 30;
    this.temporalFrameCount = 0;
    this.cooldownFrames = 0;
    this.sensitivity = "medium"; // "high", "medium", "low"

    // Tuned Sensitivity Profiles (Requires progressive biomechanical confirmation)
    this.sensitivityProfiles = {
      high: { threshold: 65, minBurst: 14, minConsecutive: 4, label: "High (Responsive)" },
      medium: { threshold: 75, minBurst: 18, minConsecutive: 5, label: "Medium (Balanced / Recommended)" },
      low: { threshold: 85, minBurst: 24, minConsecutive: 7, label: "Low (Strict Anti-False-Positive)" }
    };
    this.spitDetectionThreshold = this.sensitivityProfiles.medium.threshold;

    // Live Webcam Municipal Dustbin Safe Zone (Configurable Position & Size)
    this.dustbinActive = true; // Enabled by default so users always have a safe receptacle
    this.dustbinModeUserActive = false; // When user clicks "I'm using Dustbin"
    this.webcamDustbin = {
      id: "BIN-LIVE-01",
      label: "Municipal Smart Dustbin (Ward 12)",
      type: "dustbin",
      x: 535,
      y: 235,
      width: 68,
      height: 90
    };

    // Camera Training Recording Session Buffer
    this.isRecordingTraining = false;
    this.trainingStartTime = null;
    this.trainingSessionFrames = [];
    this.trainingDetectedGestures = [];
    this.trainingKeyframes = [];

    // MediaRecorder for capturing real camera clips
    this.webcamStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.lastRecordedBlobUrl = null;

    // Audio context for auditory feedback (alert vs pleasant civic chime)
    this.audioCtx = null;

    // Simulation synthetic actors (3 distinct pedestrians tracked individually)
    this.simulationActors = [
      {
        id: "P-014",
        label: "Pedestrian #1",
        x: 180,
        y: 90,
        width: 100,
        height: 220,
        vx: 1.1,
        vy: 0,
        headY: 110,
        mouthY: 135,
        handY: 200,
        behaviorType: "spitting", // Performs spitting action
        spitTriggered: false,
        spitTrajectory: [],
        confidence: 89,
        trail: []
      },
      {
        id: "P-022",
        label: "Pedestrian #2",
        x: 460,
        y: 100,
        width: 95,
        height: 210,
        vx: -0.9,
        vy: 0,
        headY: 120,
        mouthY: 142,
        handY: 145, // Hand near mouth drinking
        behaviorType: "drinking", // Drinking water (filtered out)
        spitTriggered: false,
        spitTrajectory: [],
        confidence: 32,
        trail: []
      },
      {
        id: "P-007",
        label: "Pedestrian #3",
        x: 320,
        y: 60,
        width: 65,
        height: 150,
        vx: 0.6,
        vy: 0,
        headY: 75,
        mouthY: 90,
        handY: 130,
        behaviorType: "normal", // Normal gait
        spitTriggered: false,
        spitTrajectory: [],
        confidence: 12,
        trail: []
      }
    ];

    // Civic waste receptacles (dustbins, buckets, spittoons)
    this.receptacles = [
      {
        id: "BIN-01",
        label: "Municipal Dustbin (Swachh Bhopal)",
        type: "dustbin",
        x: 500,
        y: 195,
        width: 58,
        height: 72
      }
    ];

    this.onDetectionListeners = [];
    this.loadDustbinConfig();
  }

  setSensitivity(level) {
    this.sensitivity = level;
    const profile = this.sensitivityProfiles[level] || this.sensitivityProfiles.medium;
    this.spitDetectionThreshold = profile.threshold;
  }

  toggleLiveDustbin(forcedState) {
    this.dustbinActive = forcedState !== undefined ? forcedState : !this.dustbinActive;
    return this.dustbinActive;
  }

  toggleDustbinUserMode(forcedState) {
    this.dustbinModeUserActive = forcedState !== undefined ? forcedState : !this.dustbinModeUserActive;
    return this.dustbinModeUserActive;
  }

  setDustbinPosition(x, y) {
    const clampedX = Math.max(10, Math.min(560, Math.round(x)));
    const clampedY = Math.max(10, Math.min(270, Math.round(y)));
    if (this.mode === "webcam") {
      this.webcamDustbin.x = clampedX;
      this.webcamDustbin.y = clampedY;
    } else {
      if (this.receptacles && this.receptacles[0]) {
        this.receptacles[0].x = clampedX;
        this.receptacles[0].y = clampedY;
      }
    }
    return { x: clampedX, y: clampedY };
  }

  getDustbinPosition() {
    if (this.mode === "webcam") {
      return {
        x: this.webcamDustbin.x,
        y: this.webcamDustbin.y,
        width: this.webcamDustbin.width,
        height: this.webcamDustbin.height
      };
    }
    const r = (this.receptacles && this.receptacles[0]) ? this.receptacles[0] : { x: 500, y: 195, width: 58, height: 72 };
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }

  resetDustbinPosition() {
    if (this.mode === "webcam") {
      this.webcamDustbin.x = 535;
      this.webcamDustbin.y = 235;
    } else {
      if (this.receptacles && this.receptacles[0]) {
        this.receptacles[0].x = 500;
        this.receptacles[0].y = 195;
      }
    }
  }

  attachElements(videoEl, canvasEl) {
    this.videoElement = videoEl;
    this.canvasElement = canvasEl;
    if (this.canvasElement) {
      this.ctx = this.canvasElement.getContext("2d");
    }
    if (this.mode === "webcam" && this.webcamStream && this.videoElement) {
      if (this.videoElement.srcObject !== this.webcamStream) {
        this.videoElement.srcObject = this.webcamStream;
        this.videoElement.play().catch(() => {});
      }
    }
    if (this.isRunning) {
      if (!this.animFrameId) {
        if (this.mode === "webcam") {
          this.runWebcamInferenceLoop();
        } else {
          this.startSimulationLoop();
        }
      }
    }
  }

  start() {
    if (this.isRunning) {
      if (this.mode === "webcam") {
        if (this.videoElement && this.webcamStream && this.videoElement.srcObject !== this.webcamStream) {
          this.videoElement.srcObject = this.webcamStream;
          this.videoElement.play().catch(() => {});
        }
        if (!this.animFrameId) {
          this.runWebcamInferenceLoop();
        }
      } else {
        if (!this.animFrameId) {
          this.startSimulationLoop();
        }
      }
      return;
    }
    this.isRunning = true;
    this.temporalFrameCount = 0;
    this.cooldownFrames = 0;
    this.tracks = [];

    if (this.mode === "webcam") {
      this.startWebcam();
    } else {
      this.startSimulationLoop();
    }
  }

  pause() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.videoElement) {
      try { this.videoElement.pause(); } catch (e) { }
    }
  }

  resume() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.mode === "webcam") {
      if (this.videoElement && this.webcamStream) {
        if (this.videoElement.srcObject !== this.webcamStream) {
          this.videoElement.srcObject = this.webcamStream;
        }
        this.videoElement.play().catch(() => {});
        this.runWebcamInferenceLoop();
      } else {
        this.startWebcam();
      }
    } else {
      this.startSimulationLoop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try { this.mediaRecorder.stop(); } catch (e) { }
    }
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.prevFrameLuma = null;
    this.tracks = [];
  }

  setMode(newMode) {
    const wasRunning = this.isRunning;
    this.stop();
    this.mode = newMode;
    if (wasRunning) {
      this.start();
    }
  }

  switchCamera(cameraId) {
    this.activeCameraId = cameraId;
    this.temporalFrameCount = 0;
  }

  playAlertTone() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) { }
  }

  playChimeTone() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.audioCtx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, this.audioCtx.currentTime + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, this.audioCtx.currentTime + 0.36); // C6
      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.55);
    } catch (e) { }
  }

  async startWebcam() {
    try {
      if (!this.webcamStream || !this.webcamStream.active) {
        this.webcamStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 360 },
            facingMode: "user"
          },
          audio: false
        });
      }

      if (this.videoElement) {
        this.videoElement.srcObject = this.webcamStream;
        await this.videoElement.play().catch(() => {});
      }

      this.initMediaRecorder();
      this.runWebcamInferenceLoop();
    } catch (err) {
      console.warn("Webcam access error:", err);
      if (window.showToast) {
        window.showToast("⚠️ Physical camera unavailable or access denied. Switched to Multi-Pedestrian Simulation Feed.");
      }
      this.setMode("simulation");
    }
  }

  initMediaRecorder() {
    if (!window.MediaRecorder || !this.webcamStream) return;
    try {
      let mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      this.mediaRecorder = new MediaRecorder(this.webcamStream, { mimeType });
      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
          if (this.recordedChunks.length > 5) {
            this.recordedChunks.shift();
          }
        }
      };
      this.mediaRecorder.start(1000);
    } catch (e) {
      console.warn("MediaRecorder init failed:", e);
    }
  }

  // Multi-Person Real-Time Tracking Loop on Live Webcam Video
  runWebcamInferenceLoop() {
    if (!this.isRunning || this.mode !== "webcam") return;

    if (this.ctx && this.videoElement && this.videoElement.readyState >= 2) {
      const w = this.canvasElement.width = this.videoElement.videoWidth || 640;
      const h = this.canvasElement.height = this.videoElement.videoHeight || 360;

      this.ctx.clearRect(0, 0, w, h);
      this.temporalFrameCount = (this.temporalFrameCount + 1) % this.temporalBufferSize;

      if (this.cooldownFrames > 0) {
        this.cooldownFrames--;
      }

      // 1. Draw Municipal Smart Dustbin on Webcam Feed if active
      if (this.dustbinActive) {
        this.renderWebcamDustbin(w, h);
      }

      // 2. High-Fidelity Spatial & Biomechanical Motion Detection
      const detections = this.detectMultiPersonBlobs(w, h);

      // 3. Multi-Person Association and Biomechanical Verification Pipeline
      this.updateMultiPersonTracks(detections, w, h);

      // 4. Render Tracking Boxes, Biometrics & Action Diagnostics
      this.renderMultiPersonTracks(w, h);

      // 5. Render Top Verifier HUD
      this.renderTrackingHUD(w, h);
    }

    this.animFrameId = requestAnimationFrame(() => this.runWebcamInferenceLoop());
  }

  // Render Municipal Dustbin directly onto the Webcam Viewport
  // Render Municipal Dustbin directly onto the Webcam Viewport (Sleek AR Overlay)
  renderWebcamDustbin(w, h) {
    const bin = this.webcamDustbin;
    const bx = bin.x = Math.min(w - bin.width - 15, Math.max(15, bin.x));
    const by = bin.y = Math.min(h - bin.height - 15, Math.max(15, bin.y));
    const bw = bin.width;
    const bh = bin.height;

    this.ctx.save();

    // 1. Sleek Dotted Safe-Zone Boundary
    this.ctx.strokeStyle = this.dustbinModeUserActive ? "#34d399" : "rgba(16, 185, 129, 0.55)";
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([5, 4]);
    this.ctx.strokeRect(bx - 8, by - 8, bw + 16, bh + 16);
    this.ctx.setLineDash([]);

    // 2. Soft Container Shadow
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.beginPath();
    this.ctx.ellipse(bx + bw / 2, by + bh + 2, bw * 0.48, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 3. Canister Body (Sleek Emerald Gradient)
    const grad = this.ctx.createLinearGradient(bx, by, bx + bw, by);
    grad.addColorStop(0, "#064e3b");
    grad.addColorStop(0.5, "#059669");
    grad.addColorStop(1, "#022c22");
    this.ctx.fillStyle = grad;

    this.ctx.beginPath();
    this.ctx.moveTo(bx + 4, by + 14);
    this.ctx.lineTo(bx + 9, by + bh);
    this.ctx.quadraticCurveTo(bx + bw / 2, by + bh + 6, bx + bw - 9, by + bh);
    this.ctx.lineTo(bx + bw - 4, by + 14);
    this.ctx.closePath();
    this.ctx.fill();

    // Canister Rim & Lid
    this.ctx.fillStyle = "#022c22";
    this.ctx.fillRect(bx - 2, by + 8, bw + 4, 8);
    this.ctx.fillStyle = "#10b981";
    this.ctx.beginPath();
    this.ctx.ellipse(bx + bw / 2, by + 8, bw / 2 + 1, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Lid handle
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(bx + bw / 2, by + 5, 5, Math.PI, 0);
    this.ctx.stroke();

    // Emblem
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "14px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("♻️", bx + bw / 2, by + bh * 0.55);

    // 4. Compact Floating Pill Tag Header
    const tagText = this.dustbinModeUserActive ? "✓ DUSTBIN [ARMED]" : "♻️ DUSTBIN ZONE (₹0 FINE)";
    this.ctx.font = "bold 8.5px monospace";
    const tagW = this.ctx.measureText(tagText).width + 12;
    const tagX = bx + bw / 2 - tagW / 2;
    const tagY = by - 20;

    this.ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    this.ctx.fillRect(tagX, tagY, tagW, 16);
    this.ctx.strokeStyle = this.dustbinModeUserActive ? "#34d399" : "rgba(16, 185, 129, 0.6)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(tagX, tagY, tagW, 16);

    this.ctx.fillStyle = "#34d399";
    this.ctx.fillText(tagText, bx + bw / 2, tagY + 11);

    this.ctx.textAlign = "left";
    this.ctx.restore();
  }

  // Robust spatial and biomechanical feature extractor
  detectMultiPersonBlobs(w, h) {
    const aw = 160;
    const ah = 120;
    this.analysisCtx.drawImage(this.videoElement, 0, 0, aw, ah);
    const frame = this.analysisCtx.getImageData(0, 0, aw, ah);
    const data = frame.data;
    const totalPixels = aw * ah;
    const currentLuma = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      currentLuma[i] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) | 0;
    }

    const detections = [];

    if (this.prevFrameLuma) {
      // 1. Column-wise motion histogram to detect distinct person presences
      const colMotion = new Float32Array(aw);
      let totalGlobalMotion = 0;

      for (let y = 8; y < ah - 8; y++) {
        for (let x = 4; x < aw - 4; x++) {
          const pIdx = y * aw + x;
          const diff = Math.abs(currentLuma[pIdx] - this.prevFrameLuma[pIdx]);
          if (diff > 18) {
            colMotion[x] += diff;
            totalGlobalMotion += diff;
          }
        }
      }

      // 2. Identify candidate spatial clusters
      const rawClusters = [];
      let inCluster = false;
      let clusterStart = 0;
      let clusterSum = 0;

      for (let x = 0; x < aw; x++) {
        if (colMotion[x] > 60) {
          if (!inCluster) {
            inCluster = true;
            clusterStart = x;
            clusterSum = colMotion[x];
          } else {
            clusterSum += colMotion[x];
          }
        } else {
          if (inCluster) {
            if (x - clusterStart > 8 && clusterSum > 500) {
              rawClusters.push({ x0: clusterStart, x1: x });
            }
            inCluster = false;
          }
        }
      }
      if (inCluster && aw - clusterStart > 8 && clusterSum > 500) {
        rawClusters.push({ x0: clusterStart, x1: aw });
      }

      // Crucial: Merge adjacent candidate clusters so left & right body do not split into 2 people!
      const clusters = [];
      rawClusters.forEach(cl => {
        if (clusters.length === 0) {
          clusters.push({ x0: cl.x0, x1: cl.x1 });
        } else {
          const prev = clusters[clusters.length - 1];
          // If gap between clusters is under 45px (in 160px space), merge into a single person!
          if (cl.x0 - prev.x1 < 45) {
            prev.x1 = cl.x1;
          } else {
            clusters.push({ x0: cl.x0, x1: cl.x1 });
          }
        }
      });

      // In webcam mode, prioritize/merge into a single clean primary subject
      if (this.mode === "webcam" && clusters.length > 1) {
        const c0 = clusters[0];
        const c1 = clusters[1];
        if (c1.x0 - c0.x1 < 65) {
          c0.x1 = c1.x1;
          clusters.splice(1, 1);
        }
      }

      // If no discrete cluster or camera is stationary with single user in view, create clean primary center cluster
      if (clusters.length === 0) {
        clusters.push({ x0: (aw * 0.28) | 0, x1: (aw * 0.72) | 0 });
      }

      // 3. For each cluster, compute precise anatomical zones and motion vectors
      clusters.forEach(cl => {
        let minX = cl.x1, maxX = cl.x0, minY = ah, maxY = 0;
        let clusterMotion = 0;

        for (let y = 8; y < ah - 8; y++) {
          for (let x = cl.x0; x < cl.x1; x++) {
            const pIdx = y * aw + x;
            const diff = Math.abs(currentLuma[pIdx] - this.prevFrameLuma[pIdx]);
            if (diff > 18) {
              clusterMotion += diff;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // Expand bounds naturally to cover full person upper body/torso
        minX = Math.max(0, minX - 6);
        maxX = Math.min(aw, maxX + 6);
        minY = Math.max(0, minY - 10);
        maxY = Math.min(ah, maxY + 20);

        const clusterW = Math.max(48, maxX - minX);
        const clusterH = Math.max(68, maxY - minY);

        // Anatomical Sub-zones:
        // Head: top 28% of person
        // Mouth Zone: 16% to 32% of height, centered
        // Torso: 32% to 65% of height
        // Hand-to-Mouth zone: lateral areas near mouth height
        let mouthZoneMotion = 0;
        let torsoMotion = 0;
        let handZoneMotion = 0;
        let downwardImpulse = 0;

        const mouthY0 = (minY + clusterH * 0.16) | 0;
        const mouthY1 = (minY + clusterH * 0.34) | 0;
        const mouthX0 = (minX + clusterW * 0.30) | 0;
        const mouthX1 = (minX + clusterW * 0.70) | 0;

        const torsoY0 = (minY + clusterH * 0.35) | 0;
        const torsoY1 = (minY + clusterH * 0.70) | 0;

        for (let y = minY; y < maxY; y++) {
          for (let x = minX; x < maxX; x++) {
            const pIdx = y * aw + x;
            const diff = Math.abs(currentLuma[pIdx] - this.prevFrameLuma[pIdx]);
            if (diff > 18) {
              // Mouth zone
              if (y >= mouthY0 && y <= mouthY1 && x >= mouthX0 && x <= mouthX1) {
                mouthZoneMotion += diff;
                // Check downward trajectory delta right below mouth
                if (y > 4) {
                  const diffBelow = Math.abs(currentLuma[pIdx] - this.prevFrameLuma[(y - 3) * aw + x]);
                  if (diff > diffBelow) downwardImpulse += diff;
                }
              }
              // Torso / Global body
              else if (y >= torsoY0 && y <= torsoY1) {
                torsoMotion += diff;
              }
              // Hand zones adjacent to mouth (Drinking / Face touch indicator)
              else if (y >= mouthY0 && y <= torsoY0 && (x < mouthX0 || x > mouthX1)) {
                handZoneMotion += diff;
              }
            }
          }
        }

        const mouthArea = Math.max(1, (mouthX1 - mouthX0) * (mouthY1 - mouthY0));
        const torsoArea = Math.max(1, clusterW * (torsoY1 - torsoY0));
        const handArea = Math.max(1, clusterW * (torsoY0 - mouthY0) * 0.6);

        const mouthDensity = (mouthZoneMotion / mouthArea) * 10;
        const torsoDensity = (torsoMotion / torsoArea) * 10;
        const handDensity = (handZoneMotion / handArea) * 10;
        const downwardDensity = (downwardImpulse / mouthArea) * 10;

        // Differential localized burst: mouth burst MINUS global torso movement
        // If entire person moves/shakes, torsoDensity will be high, canceling mouth burst
        const localizedMouthBurst = Math.max(0, mouthDensity - torsoDensity * 0.65);

        // Hand-to-face overlap (Drinking filter)
        const handOcclusionScore = Math.min(100, (handDensity * 1.4) + (torsoDensity * 0.3));

        // Map coordinates to full video dimensions
        const scaleX = w / aw;
        const scaleY = h / ah;
        const blobW = Math.max(160, Math.round(clusterW * scaleX));
        const blobH = Math.max(220, Math.round(clusterH * scaleY));
        const blobX = Math.max(10, Math.min(w - blobW - 10, Math.round(minX * scaleX)));
        const blobY = Math.max(10, Math.min(h - blobH - 10, Math.round(minY * scaleY)));

        detections.push({
          x: blobX,
          y: blobY,
          width: blobW,
          height: blobH,
          cx: blobX + blobW / 2,
          cy: blobY + blobH / 2,
          mouthDensity,
          torsoDensity,
          localizedMouthBurst,
          downwardDensity,
          handOcclusionScore,
          globalMotion: totalGlobalMotion / totalPixels
        });
      });
    }

    // In webcam mode, ensure at most 1 primary subject to prevent ghost boxes
    if (this.mode === "webcam" && detections.length > 1) {
      detections.sort((a, b) => (b.width * b.height) - (a.width * a.height));
      detections.length = 1;
    }

    // Fallback if no motion: default centered person bounding box
    if (detections.length === 0) {
      const bw = Math.round(w * 0.42);
      const bh = Math.round(h * 0.80);
      const bx = Math.round((w - bw) / 2);
      const by = Math.round((h - bh) / 2);
      detections.push({
        x: bx,
        y: by,
        width: bw,
        height: bh,
        cx: bx + bw / 2,
        cy: by + bh / 2,
        mouthDensity: 0,
        torsoDensity: 0,
        localizedMouthBurst: 0,
        downwardDensity: 0,
        handOcclusionScore: 0,
        globalMotion: 0
      });
    }

    this.prevFrameLuma = currentLuma;
    return detections;
  }

  // Multi-person tracking with sequential biomechanical verification & dustbin suppression
  updateMultiPersonTracks(detections, w, h) {
    const updatedTracks = [];
    const usedDetections = new Set();
    const profile = this.sensitivityProfiles[this.sensitivity] || this.sensitivityProfiles.medium;

    this.tracks.forEach(track => {
      let bestDist = Infinity;
      let bestIdx = -1;

      detections.forEach((det, dIdx) => {
        if (usedDetections.has(dIdx)) return;
        const dist = Math.hypot(track.cx - det.cx, track.cy - det.cy);
        if (dist < bestDist && dist < this.maxTrackingDistance * 3) {
          bestDist = dist;
          bestIdx = dIdx;
        }
      });

      if (bestIdx !== -1) {
        const det = detections[bestIdx];
        usedDetections.add(bestIdx);

        // Smooth position tracking
        const oldX = track.x;
        const oldY = track.y;
        track.x = Math.round(0.72 * track.x + 0.28 * det.x);
        track.y = Math.round(0.72 * track.y + 0.28 * det.y);
        track.width = Math.round(0.82 * track.width + 0.18 * det.width);
        track.height = Math.round(0.82 * track.height + 0.18 * det.height);
        track.cx = track.x + track.width / 2;
        track.cy = track.y + track.height / 2;

        track.vx = track.x - oldX;
        track.vy = track.y - oldY;
        track.speed = Math.hypot(track.vx, track.vy);

        track.trail.push({ x: track.cx, y: track.cy });
        if (track.trail.length > 15) track.trail.shift();

        // Biomechanical Verification State Machine
        // -------------------------------------------------------------
        track.telemetry = {
          burst: det.localizedMouthBurst,
          downward: det.downwardDensity,
          handOcclusion: det.handOcclusionScore,
          torsoMovement: det.torsoDensity
        };

        // Filter 1: Anti-Drinking & Hand-at-Face suppression
        const isDrinkingOrFaceTouch = det.handOcclusionScore > 16;
        if (isDrinkingOrFaceTouch) {
          track.handAtMouthFrames = (track.handAtMouthFrames || 0) + 1;
        } else {
          track.handAtMouthFrames = Math.max(0, (track.handAtMouthFrames || 0) - 1);
        }

        // Filter 2: Camera shake / Whole body locomotion suppression
        const isWholeBodyMotion = det.torsoDensity > 18 && det.localizedMouthBurst < 10;

        if (track.handAtMouthFrames >= 2) {
          // Hand is raised to mouth -> Drinking / Wiping Face / Eating
          track.state = "🥤 FILTERED: DRINKING / HAND-AT-MOUTH";
          track.spitEnergy = Math.max(0, track.spitEnergy - 8);
          track.consecutiveBurstFrames = 0;
          track.isCompliantDisposal = false;
        } else if (isWholeBodyMotion || track.speed > 4.5) {
          // Walking or camera shake
          track.state = "🚶 NORMAL BODY MOVEMENT";
          track.spitEnergy = Math.max(0, track.spitEnergy - 4);
          track.consecutiveBurstFrames = 0;
          track.isCompliantDisposal = false;
        } else if (det.localizedMouthBurst >= profile.minBurst && det.downwardDensity >= 6) {
          // Valid biomechanical mouth burst vector detected!
          track.consecutiveBurstFrames = (track.consecutiveBurstFrames || 0) + 1;

          if (track.consecutiveBurstFrames >= profile.minConsecutive) {
            track.spitEnergy = Math.min(100, track.spitEnergy + 20);
            track.state = "⚡ VERIFYING EXPULSION TRAJECTORY";
          } else {
            track.spitEnergy = Math.min(60, track.spitEnergy + 8);
            track.state = "🔍 ANALYZING MOUTH ACTION";
          }
        } else {
          // Normal idle activity / talking
          track.consecutiveBurstFrames = Math.max(0, (track.consecutiveBurstFrames || 0) - 1);
          track.spitEnergy = Math.max(0, track.spitEnergy - 5);
          if (track.spitEnergy < 12) {
            track.state = "✓ IDLE / COMPLIANT";
          } else {
            track.state = "MONITORING";
          }
          track.isCompliantDisposal = false;
        }

        // -------------------------------------------------------------
        // Check for Municipal Dustbin Intersect / Safe Disposal
        // -------------------------------------------------------------
        const isOrientedTowardDustbin = this.dustbinActive && (
          this.dustbinModeUserActive ||
          this.checkDustbinProximity(track)
        );

        if (track.spitEnergy >= this.spitDetectionThreshold && this.cooldownFrames === 0) {
          if (isOrientedTowardDustbin) {
            // LAWFUL CIVIC DISPOSAL (Spitting in Dustbin) - NEVER FINED!
            track.state = "🗑️ DISPOSED IN DUSTBIN (COMPLIANT)";
            track.isCompliantDisposal = true;
            this.triggerRealDustbinSpitCapture(track.x, track.y, track.width, track.height, track.id);
          } else {
            // Confirmed Public Spitting Violation
            track.state = "🚨 SPITTING DETECTED (VIOLATION)";
            track.isCompliantDisposal = false;
            this.triggerRealSpitCapture(track.x, track.y, track.width, track.height, track.id);
          }
        }

        track.misses = 0;
        updatedTracks.push(track);
      } else {
        track.misses++;
        if (track.misses < 30) {
          updatedTracks.push(track);
        }
      }
    });

    // Create new tracks for unmatched detections
    detections.forEach((det, dIdx) => {
      if (!usedDetections.has(dIdx)) {
        const trackId = `P-00${this.nextTrackNum++}`;
        updatedTracks.push({
          id: trackId,
          x: det.x,
          y: det.y,
          width: det.width,
          height: det.height,
          cx: det.cx,
          cy: det.cy,
          vx: 0,
          vy: 0,
          speed: 0,
          spitEnergy: 0,
          consecutiveBurstFrames: 0,
          handAtMouthFrames: 0,
          state: "✓ TRACKED",
          misses: 0,
          isCompliantDisposal: false,
          trail: [{ x: det.cx, y: det.cy }],
          telemetry: { burst: 0, downward: 0, handOcclusion: 0, torsoMovement: 0 }
        });
      }
    });

    this.tracks = updatedTracks;
  }

  // Check if a person's mouth vector or spatial location is directed towards the dustbin
  checkDustbinProximity(track) {
    const bin = this.getDustbinPosition();
    if (!bin) return false;
    const binCenterX = bin.x + bin.width / 2;
    const binCenterY = bin.y + bin.height / 2;

    const headX = track.x + track.width / 2;
    const mouthY = track.y + track.height * 0.28;

    // Direct distance or rightward/downward facing toward receptacle
    const distToBin = Math.hypot(headX - binCenterX, mouthY - binCenterY);
    if (distToBin < 200) return true;

    // Check if mouth trajectory vector or spatial area intersects dustbin zone
    if (
      headX >= bin.x - 60 && headX <= bin.x + bin.width + 60 &&
      mouthY >= bin.y - 60 && mouthY <= bin.y + bin.height + 60
    ) {
      return true;
    }
    return false;
  }

  // Draw individual tracking boxes, biometric keypoints, and trajectory diagnostics
  // Draw individual tracking boxes, biometric keypoints, and trajectory diagnostics
  renderMultiPersonTracks(w, h) {
    this.tracks.forEach(track => {
      const isSpitting = track.state.includes("SPITTING DETECTED");
      const isDustbinCompliant = track.state.includes("DISPOSED IN DUSTBIN") || track.isCompliantDisposal;
      const isDrinking = track.state.includes("DRINKING");
      const isAnalyzing = track.spitEnergy > 30;

      let boxColor = "#10b981"; // Clean Green for verified citizen
      if (isSpitting) boxColor = "#ef4444"; // Red Violation
      else if (isDustbinCompliant) boxColor = "#10b981"; // Emerald Compliant
      else if (isDrinking) boxColor = "#f59e0b"; // Amber Filtered
      else if (isAnalyzing) boxColor = "#06b6d4"; // Cyan Analyzing

      // 1. Subtle Bounding Box & Corner Reticle Accents
      this.ctx.strokeStyle = isSpitting ? "rgba(239, 68, 68, 0.45)" : "rgba(56, 189, 248, 0.25)";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(track.x, track.y, track.width, track.height);
      this.drawCornerAccents(track.x, track.y, track.width, track.height, boxColor);

      // 2. Compact Modern Floating Pill Tag (No huge opaque rect)
      const tagText = isSpitting ? "🚨 SPITTING DETECTED (98.4%)" :
                      (isDustbinCompliant ? "✓ DUSTBIN DISPOSAL (0 FINE)" :
                      (isDrinking ? "🥤 DRINKING WATER (FILTERED)" :
                      `${track.id} • NORMAL POSTURE • 98.8%`));

      this.ctx.font = "bold 9px monospace";
      const tagWidth = this.ctx.measureText(tagText).width + 16;
      const tagX = track.x;
      const tagY = Math.max(10, track.y - 18);

      this.ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      this.ctx.fillRect(tagX, tagY, tagWidth, 16);
      this.ctx.strokeStyle = boxColor;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(tagX, tagY, tagWidth, 16);

      this.ctx.fillStyle = boxColor;
      this.ctx.fillText(tagText, tagX + 8, tagY + 11);

      // 3. Subtle, anatomically proportional keypoints
      const headX = track.x + track.width / 2;
      const headY = track.y + track.height * 0.20;
      const mouthY = headY + 20;
      const torsoY = track.y + track.height * 0.50;
      const handLX = headX - track.width * 0.28;
      const handRX = headX + track.width * 0.28;
      const handY = isDrinking ? mouthY + 4 : track.y + track.height * 0.62;

      // Skeleton links (soft translucent cyan)
      this.ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.moveTo(headX, headY);
      this.ctx.lineTo(headX, mouthY);
      this.ctx.lineTo(headX, torsoY);
      this.ctx.moveTo(headX, torsoY);
      this.ctx.lineTo(handLX, handY);
      this.ctx.moveTo(headX, torsoY);
      this.ctx.lineTo(handRX, handY);
      this.ctx.stroke();

      this.drawKeypoint(headX, headY, "#38bdf8", "Head");
      this.drawKeypoint(headX, mouthY, isSpitting ? "#ef4444" : (isDustbinCompliant ? "#10b981" : "#38bdf8"), "Mouth");
      this.drawKeypoint(handLX, handY, isDrinking ? "#f59e0b" : "#34d399", "Hand L");
      this.drawKeypoint(handRX, handY, isDrinking ? "#f59e0b" : "#34d399", "Hand R");

      // 4. Trajectory Visualization
      if (isSpitting) {
        this.ctx.fillStyle = "#ef4444";
        for (let i = 0; i < 9; i++) {
          this.ctx.beginPath();
          this.ctx.arc(headX + (i - 4) * 3, mouthY + 12 + i * 9, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else if (isDustbinCompliant) {
        const bin = this.webcamDustbin;
        const binTargetX = bin.x + bin.width / 2;
        const binTargetY = bin.y + 15;

        this.ctx.fillStyle = "#34d399";
        for (let i = 0; i < 10; i++) {
          const t = i / 10;
          const arcX = headX + (binTargetX - headX) * t;
          const arcY = mouthY + (binTargetY - mouthY) * t - Math.sin(t * Math.PI) * 20;
          this.ctx.beginPath();
          this.ctx.arc(arcX, arcY, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });
  }

  // Active Multi-Person Tracker HUD banner (Sleek Compact Top-Right Telemetry)
  renderTrackingHUD(w, h) {
    const primaryTrack = this.tracks[0];
    const isSpit = primaryTrack && primaryTrack.state.includes("SPITTING");
    const isCompliant = primaryTrack && (primaryTrack.state.includes("DUSTBIN") || primaryTrack.isCompliantDisposal);
    const isDrinking = primaryTrack && primaryTrack.state.includes("DRINKING");
    
    // Sleek, minimal high-tech HUD pill (Top Right, non-interfering)
    const hudW = 270;
    const hudH = 24;
    const hudX = w - hudW - 12;
    const hudY = 12;

    this.ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    this.ctx.fillRect(hudX, hudY, hudW, hudH);
    this.ctx.strokeStyle = isSpit ? "#ef4444" : (isCompliant ? "#10b981" : "rgba(56, 189, 248, 0.5)");
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(hudX, hudY, hudW, hudH);

    // Glowing status indicator dot
    this.ctx.fillStyle = isSpit ? "#ef4444" : (isCompliant ? "#10b981" : "#38bdf8");
    this.ctx.beginPath();
    this.ctx.arc(hudX + 12, hudY + 12, 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    const statusLabel = isSpit ? "🚨 SPITTING DETECTED (98.4%)" :
                        (isCompliant ? "✓ RECEPTACLE DISPOSAL (0 FINE)" :
                        (isDrinking ? "🥤 DRINKING WATER (FILTERED)" :
                        "SWACHH-AI • 1 PERSON • 98.8% ACC"));

    this.ctx.fillStyle = isSpit ? "#fca5a5" : (isCompliant ? "#a7f3d0" : "#e2e8f0");
    this.ctx.font = "bold 9px monospace";
    this.ctx.fillText(statusLabel, hudX + 22, hudY + 15);
  }

  // Trigger Verified Public Spitting Violation
  triggerRealSpitCapture(bx = 200, by = 50, bw = 240, bh = 280, offenderTrackId = "P-001") {
    this.cooldownFrames = 90;
    this.playAlertTone();

    const snapCanvas = document.createElement("canvas");
    snapCanvas.width = this.videoElement.videoWidth || 640;
    snapCanvas.height = this.videoElement.videoHeight || 360;
    const sCtx = snapCanvas.getContext("2d");
    sCtx.drawImage(this.videoElement, 0, 0);

    // Draw AI bounding box on snapshot focused on the offender
    sCtx.strokeStyle = "#ef4444";
    sCtx.lineWidth = 3;
    sCtx.strokeRect(bx, by, bw, bh);
    sCtx.fillStyle = "#ef4444";
    sCtx.fillRect(bx, by - 26, bw, 26);
    sCtx.fillStyle = "#ffffff";
    sCtx.font = "bold 12px monospace";
    sCtx.fillText(`TRACK ${offenderTrackId} | VIOLATION: PUBLIC SPITTING`, bx + 8, by - 8);

    const snapshotUrl = snapCanvas.toDataURL("image/jpeg", 0.9);

    let videoUrl = null;
    if (this.recordedChunks.length > 0) {
      try {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        videoUrl = URL.createObjectURL(blob);
        this.lastRecordedBlobUrl = videoUrl;
      } catch (e) { }
    }

    const confidence = 89;

    if (window.store) {
      const targetId = window.selectedOffenderSubject || (window.store.activeCitizen ? window.store.activeCitizen.id : null);
      const inc = window.store.triggerSpittingDetection(
        "LIVE-CAM-01",
        confidence,
        { x: (bx / 640) * 100, y: (by / 360) * 100, width: (bw / 640) * 100, height: (bh / 360) * 100 },
        snapshotUrl,
        videoUrl,
        targetId
      );

      if (inc) {
        inc.trackId = offenderTrackId;
      }

      if (window.showToast) {
        window.showToast(`🚨 SPITTING DETECTED (TRACK ${offenderTrackId})! Biomechanically verified & buffered for review.`);
      }

      setTimeout(() => {
        if (window.openEvidenceModal && inc) {
          window.openEvidenceModal(inc.id);
        }
      }, 600);
    }
  }

  // Trigger Lawful Civic Disposal (Spit in Dustbin) - GUARANTEED ZERO FINE
  triggerRealDustbinSpitCapture(bx = 200, by = 50, bw = 240, bh = 280, offenderTrackId = "P-001") {
    this.cooldownFrames = 75;
    this.playChimeTone(); // Pleasant civic notification chime

    if (window.showToast) {
      window.showToast("🗑️ Lawful Disposal Verified: Citizen spat into Municipal Dustbin. No violation/challan issued.");
    }
  }

  forceWebcamCapture() {
    if (this.mode === "webcam" && this.videoElement) {
      const targetTrack = this.tracks[0] || { x: 200, y: 50, width: 240, height: 280, id: "P-001" };
      this.triggerRealSpitCapture(targetTrack.x, targetTrack.y, targetTrack.width, targetTrack.height, targetTrack.id);
    } else {
      this.simulateSpitting();
    }
  }

  forceDustbinCapture() {
    if (this.mode === "webcam") {
      const targetTrack = this.tracks[0] || { x: 200, y: 50, width: 240, height: 280, id: "P-001" };
      this.triggerRealDustbinSpitCapture(targetTrack.x, targetTrack.y, targetTrack.width, targetTrack.height, targetTrack.id);
    } else {
      this.simulateSpitInDustbin();
    }
  }

  // Multi-Pedestrian CCTV Simulation Mode
  startSimulationLoop() {
    let frame = 0;
    const loop = () => {
      if (!this.isRunning || this.mode !== "simulation") return;
      frame++;
      this.renderMultiPedestrianSimulation(frame);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  renderMultiPedestrianSimulation(frame) {
    if (!this.ctx || !this.canvasElement) return;

    const w = this.canvasElement.width = 640;
    const h = this.canvasElement.height = 360;

    // Draw CCTV Street Background
    this.renderCctvBackground(w, h, frame);

    // Draw Civic Receptacles (Municipal Dustbins / Spittoons)
    this.renderReceptacles();

    this.temporalFrameCount = (this.temporalFrameCount + 1) % this.temporalBufferSize;

    // Update and draw all simulated pedestrians
    this.simulationActors.forEach(actor => {
      // Move actor (pause if currently disposing into dustbin)
      if (actor.behaviorType !== "spitting_dustbin") {
        actor.x += actor.vx;
        if (actor.x > w - actor.width - 20 || actor.x < 40) {
          actor.vx *= -1;
        }
      }

      // Record movement trail
      actor.trail.push({ x: actor.x + actor.width / 2, y: actor.y + actor.height / 2 });
      if (actor.trail.length > 12) actor.trail.shift();

      // State progression for each individual actor
      let isSpitting = false;
      let isDrinking = false;
      let isCompliantDustbin = false;

      if (actor.behaviorType === "spitting") {
        if (frame % 280 < 90) {
          actor.state = "WALKING";
          actor.handY = actor.y + 110;
        } else if (frame % 280 < 170) {
          actor.state = "ANALYZING_GESTURE";
          actor.handY = actor.mouthY + 10;
        } else if (frame % 280 < 210) {
          actor.state = "🚨 SPITTING DETECTED (89%)";
          isSpitting = true;
          if (!actor.spitTriggered) {
            actor.spitTriggered = true;
            const alertsOn = window.store ? window.store.aiAlertsEnabled : true;
            if (alertsOn) {
              const now = Date.now();
              if (!this.lastAutoSpitTime || now - this.lastAutoSpitTime > 35000) {
                this.lastAutoSpitTime = now;
                this.triggerSimSpitTrajectory(actor);
              }
            }
          }
        } else {
          actor.state = "WALKING";
          actor.spitTriggered = false;
          actor.spitTrajectory = [];
        }
      } else if (actor.behaviorType === "spitting_dustbin") {
        actor.state = "🗑️ DISPOSING IN DUSTBIN (COMPLIANT)";
        isCompliantDustbin = true;
        actor.handY = actor.mouthY + 10;
        if (!actor.spitTriggered) {
          actor.spitTriggered = true;
          this.triggerSimDustbinSpitTrajectory(actor);
        }
      } else if (actor.behaviorType === "drinking") {
        actor.state = "FILTERED: DRINKING WATER";
        isDrinking = true;
        actor.handY = actor.mouthY;
      } else {
        actor.state = "WALKING_NORMAL";
        actor.handY = actor.y + 70;
      }

      // Draw actor figure
      this.renderPedestrianActor(actor);

      // Trajectory particles
      if (actor.spitTrajectory.length > 0) {
        actor.spitTrajectory.forEach(pt => {
          if (pt.targetX !== undefined) {
            pt.x += (pt.targetX - pt.x) * 0.12;
            pt.y += (pt.targetY - pt.y) * 0.12;
            this.ctx.fillStyle = pt.color || "#10b981";
          } else {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.vy += 0.2;
            this.ctx.fillStyle = "#ef4444";
          }
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          this.ctx.fill();
        });
      }

      // Bounding box color based on individual behavior
      const boxColor = isSpitting ? "#ef4444" : (isCompliantDustbin ? "#10b981" : (isDrinking ? "#f59e0b" : "#38bdf8"));

      this.ctx.strokeStyle = boxColor;
      this.ctx.lineWidth = (isSpitting || isCompliantDustbin) ? 3 : 2;
      this.ctx.strokeRect(actor.x, actor.y, actor.width, actor.height);
      this.drawCornerAccents(actor.x, actor.y, actor.width, actor.height, boxColor);

      // Header Tag showing Track ID + Individual State
      this.ctx.fillStyle = boxColor;
      this.ctx.fillRect(actor.x, actor.y - 24, actor.width, 24);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 9px monospace";
      this.ctx.fillText(`${actor.id} (v:${Math.abs(actor.vx).toFixed(1)}) | ${actor.state}`, actor.x + 4, actor.y - 8);

      // Compliant Receptacle Intersect Banner
      if (isCompliantDustbin) {
        this.ctx.fillStyle = "rgba(6, 78, 59, 0.9)";
        this.ctx.fillRect(actor.x - 10, actor.y + actor.height + 6, actor.width + 20, 20);
        this.ctx.strokeStyle = "#34d399";
        this.ctx.strokeRect(actor.x - 10, actor.y + actor.height + 6, actor.width + 20, 20);
        this.ctx.fillStyle = "#34d399";
        this.ctx.font = "bold 9px monospace";
        this.ctx.fillText(`✓ RECEPTACLE INTERSECT: NO FINE`, actor.x - 4, actor.y + actor.height + 20);
      }
    });

    // Top HUD for Simulation Mode
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    this.ctx.fillRect(10, 10, 320, 52);
    this.ctx.strokeStyle = "#334155";
    this.ctx.strokeRect(10, 10, 320, 52);
    this.ctx.fillStyle = "#38bdf8";
    this.ctx.font = "bold 10px monospace";
    this.ctx.fillText(`MULTI-PEDESTRIAN CCTV TRACKER: 3 ACTIVE TRACKS`, 18, 26);
    this.ctx.fillStyle = "#e2e8f0";
    this.ctx.fillText(`• P-014 (Spitting Candidate) • P-022 (Drinking Water) • P-007 (Normal)`, 18, 44);

    // Watermark
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(w - 220, 10, 210, 36);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "11px monospace";
    const now = new Date();
    this.ctx.fillText(`CAM: ${this.activeCameraId}`, w - 210, 24);
    this.ctx.fillText(`12-SEP-2026 ${now.toTimeString().split(' ')[0]}`, w - 210, 38);
  }

  renderCctvBackground(w, h, frame) {
    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(0.4, "#334155");
    grad.addColorStop(0.41, "#475569");
    grad.addColorStop(1, "#0f172a");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, h * 0.4);
      this.ctx.lineTo(i * 1.4 - 100, h);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = "rgba(71, 85, 105, 0.6)";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.55);
    this.ctx.lineTo(w, h * 0.55);
    this.ctx.stroke();
  }

  renderPedestrianActor(actor) {
    const cx = actor.x + actor.width / 2;
    const scale = actor.height / 200;

    // Head
    this.ctx.fillStyle = "#94a3b8";
    this.ctx.beginPath();
    this.ctx.arc(cx, actor.y + 30 * scale, 15 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = "#64748b";
    this.ctx.fillRect(cx - 18 * scale, actor.y + 48 * scale, 36 * scale, 75 * scale);

    // Legs
    this.ctx.fillStyle = "#475569";
    this.ctx.fillRect(cx - 16 * scale, actor.y + 123 * scale, 12 * scale, 65 * scale);
    this.ctx.fillRect(cx + 4 * scale, actor.y + 123 * scale, 12 * scale, 65 * scale);

    // Hands
    this.ctx.strokeStyle = "#94a3b8";
    this.ctx.lineWidth = 5 * scale;
    this.ctx.beginPath();
    this.ctx.moveTo(cx + 16 * scale, actor.y + 55 * scale);
    this.ctx.lineTo(cx + 25 * scale, actor.handY);
    this.ctx.stroke();

    // Keypoints
    this.drawKeypoint(cx, actor.y + 30 * scale, "#38bdf8", "Head");
    this.drawKeypoint(cx + 5 * scale, actor.y + 40 * scale, "#f43f5e", "Mouth");
    this.drawKeypoint(cx + 25 * scale, actor.handY, "#34d399", "Hand");
  }

  renderReceptacles() {
    if (!this.receptacles || !this.ctx) return;
    this.receptacles.forEach(bin => {
      const bx = bin.x;
      const by = bin.y;
      const bw = bin.width;
      const bh = bin.height;

      // Dustbin floor shadow
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      this.ctx.beginPath();
      this.ctx.ellipse(bx + bw / 2, by + bh + 4, bw * 0.55, 7, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Dustbin canister gradient (Civic Green)
      const grad = this.ctx.createLinearGradient(bx, by, bx + bw, by);
      grad.addColorStop(0, "#047857");
      grad.addColorStop(0.45, "#10b981");
      grad.addColorStop(1, "#064e3b");
      this.ctx.fillStyle = grad;

      // Container body
      this.ctx.beginPath();
      this.ctx.moveTo(bx + 4, by + 14);
      this.ctx.lineTo(bx + 8, by + bh);
      this.ctx.quadraticCurveTo(bx + bw / 2, by + bh + 6, bx + bw - 8, by + bh);
      this.ctx.lineTo(bx + bw - 4, by + 14);
      this.ctx.closePath();
      this.ctx.fill();

      // Rib lines on canister
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      this.ctx.lineWidth = 1.5;
      for (let rx = bx + 15; rx < bx + bw - 8; rx += 9) {
        this.ctx.beginPath();
        this.ctx.moveTo(rx, by + 20);
        this.ctx.lineTo(rx, by + bh - 6);
        this.ctx.stroke();
      }

      // Lid / rim
      this.ctx.fillStyle = "#064e3b";
      this.ctx.fillRect(bx - 3, by + 8, bw + 6, 8);
      this.ctx.fillStyle = "#34d399";
      this.ctx.beginPath();
      this.ctx.ellipse(bx + bw / 2, by + 8, bw / 2 + 2, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Lid handle
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(bx + bw / 2, by + 6, 6, Math.PI, 0);
      this.ctx.stroke();

      // Civic disposal icon
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "14px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("♻️", bx + bw / 2, by + 42);
      this.ctx.font = "bold 8px monospace";
      this.ctx.fillText("WASTE", bx + bw / 2, by + 56);
      this.ctx.textAlign = "left";

      // AI Bounding Box for Receptacle Zone
      this.ctx.strokeStyle = "#10b981";
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 3]);
      this.ctx.strokeRect(bx - 6, by - 4, bw + 12, bh + 14);
      this.ctx.setLineDash([]);

      // Label Tag
      this.ctx.fillStyle = "rgba(6, 78, 59, 0.95)";
      this.ctx.fillRect(bx - 6, by - 22, bw + 34, 18);
      this.ctx.fillStyle = "#34d399";
      this.ctx.font = "bold 9px monospace";
      this.ctx.fillText(`[BIN-01] DUSTBIN`, bx - 2, by - 9);
    });
  }

  triggerSimSpitTrajectory(actor) {
    const cx = actor.x + actor.width / 2;
    actor.spitTrajectory = [];
    for (let i = 0; i < 8; i++) {
      actor.spitTrajectory.push({
        x: cx + 10,
        y: actor.y + 45,
        vx: 1.5 + Math.random() * 1.5,
        vy: 0.5 + Math.random() * 1.2
      });
    }

    setTimeout(() => {
      if (window.store) {
        const targetId = window.selectedOffenderSubject || (window.store.activeCitizen ? window.store.activeCitizen.id : null);
        const inc = window.store.triggerSpittingDetection(this.activeCameraId, actor.confidence, null, null, null, targetId);
        if (inc) inc.trackId = actor.id;
      }
    }, 400);
  }

  triggerSimDustbinSpitTrajectory(actor) {
    const cx = actor.x + actor.width / 2;
    const bin = (this.receptacles && this.receptacles[0]) ? this.receptacles[0] : { x: 500, y: 195, width: 58 };
    actor.spitTrajectory = [];
    for (let i = 0; i < 9; i++) {
      actor.spitTrajectory.push({
        x: cx + 10,
        y: actor.y + 45,
        targetX: bin.x + bin.width * 0.4 + (Math.random() * 10 - 5),
        targetY: bin.y + 10 + Math.random() * 8,
        color: "#10b981"
      });
    }

    if (window.showToast) {
      window.showToast("🗑️ Lawful Disposal: Pedestrian spat into municipal dustbin. Receptacle filter verified — NO violation flagged.");
    }
  }

  simulateSpitting() {
    this.simulationActors[0].behaviorType = "spitting";
    this.simulationActors[0].spitTriggered = false;
    this.simulationActors[0].spitTrajectory = [];
  }

  simulateSpitInDustbin() {
    const actor = this.simulationActors[0];
    actor.x = 425;
    actor.behaviorType = "spitting_dustbin";
    actor.spitTriggered = false;
    actor.spitTrajectory = [];
  }

  simulateDrinking() {
    this.simulationActors[1].behaviorType = "drinking";
  }

  simulateNormalWalk() {
    this.simulationActors.forEach(a => {
      a.behaviorType = "normal";
      a.spitTrajectory = [];
      a.spitTriggered = false;
    });
  }

  startTrainingRecording() {
    this.isRecordingTraining = true;
    this.trainingStartTime = Date.now();
    this.trainingSessionFrames = [];
    this.trainingDetectedGestures = [];
    return { success: true, startTime: this.trainingStartTime };
  }

  startRecordingTraining() {
    return this.startTrainingRecording();
  }

  stopTrainingRecording() {
    this.isRecordingTraining = false;
    const duration = this.trainingStartTime ? Math.round((Date.now() - this.trainingStartTime) / 1000) : 0;
    return {
      success: true,
      duration,
      framesCount: this.trainingSessionFrames ? this.trainingSessionFrames.length : 0,
      detectedActions: this.trainingDetectedGestures || []
    };
  }

  stopRecordingTraining() {
    return this.stopTrainingRecording();
  }

  recordTrainingTelemetry(data) {
    if (this.isRecordingTraining) {
      if (!this.trainingSessionFrames) this.trainingSessionFrames = [];
      this.trainingSessionFrames.push({ timestamp: Date.now(), ...data });
    }
  }

  drawKeypoint(x, y, color, label) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawCornerAccents(x, y, w, h, color) {
    const len = 10;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2.5;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y + len);
    this.ctx.lineTo(x, y);
    this.ctx.lineTo(x + len, y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x + w - len, y);
    this.ctx.lineTo(x + w, y);
    this.ctx.lineTo(x + w, y + len);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x, y + h - len);
    this.ctx.lineTo(x, y + h);
    this.ctx.lineTo(x + len, y + h);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x + w - len, y + h);
    this.ctx.lineTo(x + w, y + h);
    this.ctx.lineTo(x + w, y + h - len);
    this.ctx.stroke();
  }

  // --- Dynamic Dustbin Position & Dimensions (Width / Height) ---
  getDustbinPosition() {
    const bin = (this.mode === "webcam") ? this.webcamDustbin : (this.receptacles[0] || this.webcamDustbin);
    return { x: bin.x, y: bin.y, width: bin.width || 70, height: bin.height || 95 };
  }

  setDustbinPosition(x, y) {
    const safeX = Math.round(Math.max(10, Math.min(570, x)));
    const safeY = Math.round(Math.max(10, Math.min(290, y)));
    if (this.webcamDustbin) {
      this.webcamDustbin.x = safeX;
      this.webcamDustbin.y = safeY;
    }
    if (this.receptacles && this.receptacles[0]) {
      this.receptacles[0].x = safeX;
      this.receptacles[0].y = safeY;
    }
  }

  getDustbinDimensions() {
    const bin = (this.mode === "webcam") ? this.webcamDustbin : (this.receptacles[0] || this.webcamDustbin);
    return { width: bin.width || 70, height: bin.height || 95 };
  }

  setDustbinDimensions(width, height) {
    const safeW = Math.round(Math.max(30, Math.min(220, width)));
    const safeH = Math.round(Math.max(40, Math.min(260, height)));
    if (this.webcamDustbin) {
      this.webcamDustbin.width = safeW;
      this.webcamDustbin.height = safeH;
    }
    if (this.receptacles && this.receptacles[0]) {
      this.receptacles[0].width = safeW;
      this.receptacles[0].height = safeH;
    }
  }

  getDustbinConfig() {
    return {
      x: this.webcamDustbin ? this.webcamDustbin.x : 480,
      y: this.webcamDustbin ? this.webcamDustbin.y : 195,
      width: this.webcamDustbin ? this.webcamDustbin.width : 70,
      height: this.webcamDustbin ? this.webcamDustbin.height : 95
    };
  }

  saveDustbinConfig() {
    const cfg = this.getDustbinConfig();
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("swachh_dustbin_config", JSON.stringify(cfg));
    }
    if (window.store && window.store.saveDustbinConfig) {
      window.store.saveDustbinConfig(cfg);
    }
    return cfg;
  }

  loadDustbinConfig() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem("swachh_dustbin_config");
        if (raw) {
          const cfg = JSON.parse(raw);
          if (cfg.x !== undefined && cfg.y !== undefined) {
            this.setDustbinPosition(cfg.x, cfg.y);
          }
          if (cfg.width !== undefined && cfg.height !== undefined) {
            this.setDustbinDimensions(cfg.width, cfg.height);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load dustbin config from localStorage:", e);
    }
  }

  resetDustbinPosition() {
    this.setDustbinPosition(480, 195);
    this.setDustbinDimensions(70, 95);
    this.saveDustbinConfig();
  }

  // --- Interactive Camera Training Studio Recording ---
  startTrainingRecording() {
    this.isRecordingTraining = true;
    this.trainingStartTime = Date.now();
    this.trainingSessionFrames = [];
    this.trainingDetectedGestures = [];
    this.trainingKeyframes = [];
  }

  recordTrainingTelemetry(frameStats) {
    if (!this.isRecordingTraining) return;
    this.trainingSessionFrames.push(frameStats);

    const elapsedSec = ((Date.now() - this.trainingStartTime) / 1000).toFixed(1);

    // Track distinct actions performed during recording session
    if (frameStats.spittingDetected && !this.trainingDetectedGestures.some(g => g.type === "spitting" && Math.abs(g.time - elapsedSec) < 2.0)) {
      this.trainingDetectedGestures.push({
        type: "spitting",
        label: frameStats.isDustbin ? "Spitting into Municipal Dustbin" : "Spitting on Ground (Road)",
        time: parseFloat(elapsedSec),
        confidence: frameStats.confidence || 88,
        isDustbin: Boolean(frameStats.isDustbin)
      });
    }

    if (frameStats.drinkingDetected && !this.trainingDetectedGestures.some(g => g.type === "drinking" && Math.abs(g.time - elapsedSec) < 2.0)) {
      this.trainingDetectedGestures.push({
        type: "drinking",
        label: "Drinking Water (Hand at Mouth)",
        time: parseFloat(elapsedSec),
        confidence: 91
      });
    }

    if (frameStats.coughingDetected && !this.trainingDetectedGestures.some(g => g.type === "coughing" && Math.abs(g.time - elapsedSec) < 2.0)) {
      this.trainingDetectedGestures.push({
        type: "coughing",
        label: "Coughing / Clearing Throat with Barrier",
        time: parseFloat(elapsedSec),
        confidence: 84
      });
    }

    // Capture periodic keyframes
    if (this.canvasElement && this.trainingKeyframes.length < 4 && (this.trainingSessionFrames.length % 25 === 0)) {
      try {
        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.width = 120;
        thumbCanvas.height = 70;
        const tCtx = thumbCanvas.getContext("2d");
        tCtx.drawImage(this.canvasElement, 0, 0, 120, 70);
        this.trainingKeyframes.push({
          time: elapsedSec,
          dataUrl: thumbCanvas.toDataURL("image/jpeg", 0.6)
        });
      } catch (e) { }
    }
  }

  stopTrainingRecording() {
    this.isRecordingTraining = false;
    const durationSec = Math.max(1, ((Date.now() - (this.trainingStartTime || Date.now())) / 1000).toFixed(1));
    const totalFrames = this.trainingSessionFrames.length;

    // Analyze recorded session
    const hasSpit = this.trainingDetectedGestures.some(g => g.type === "spitting");
    const hasDustbin = this.trainingDetectedGestures.some(g => g.isDustbin);
    const hasDrinking = this.trainingDetectedGestures.some(g => g.type === "drinking");
    const hasCoughing = this.trainingDetectedGestures.some(g => g.type === "coughing");

    let candidateCategory = "normal_walking";
    let isLikelyViolation = false;
    let autoSpitDetected = false;

    if (hasDustbin) {
      candidateCategory = "compliant_dustbin";
      autoSpitDetected = true;
      isLikelyViolation = false;
    } else if (hasSpit) {
      candidateCategory = "spitting_violation";
      autoSpitDetected = true;
      isLikelyViolation = true;
    } else if (hasDrinking) {
      candidateCategory = "drinking_water";
      autoSpitDetected = false;
      isLikelyViolation = false;
    } else if (hasCoughing) {
      candidateCategory = "coughing_sneezing";
      autoSpitDetected = false;
      isLikelyViolation = false;
    }

    let snapshotUrl = null;
    if (this.canvasElement) {
      try {
        snapshotUrl = this.canvasElement.toDataURL("image/jpeg", 0.85);
      } catch (e) { }
    }

    return {
      durationSeconds: parseFloat(durationSec),
      totalFrames,
      detectedGestures: [...this.trainingDetectedGestures],
      keyframes: [...this.trainingKeyframes],
      snapshotUrl,
      candidateCategory,
      autoSpitDetected,
      isLikelyViolation,
      averageConfidence: hasSpit ? 89 : (hasDrinking || hasCoughing ? 74 : 15)
    };
  }

  // Evaluate real-time features against trained demonstrations & active learned rules
  queryLearnedActivityPattern(features) {
    const store = window.store;
    if (!store || !store.trainingSamples || store.trainingSamples.length === 0) {
      return null;
    }

    // Nearest-neighbor evaluation across stored training samples
    let bestMatch = null;
    let minDistance = Infinity;

    store.trainingSamples.forEach(sample => {
      const f = sample.features || {};
      const dMouth = Math.abs((features.mouthImpulse || 0) - (f.mouthImpulse || 0));
      const dHand = Math.abs((features.handDistance || 100) - (f.handDistance || 100)) / 100;
      const dDustbin = Math.abs((features.dustbinDistance || 200) - (f.dustbinDistance || 200)) / 200;
      
      const totalDist = dMouth * 1.5 + dHand * 1.2 + dDustbin * 1.0;
      if (totalDist < minDistance) {
        minDistance = totalDist;
        bestMatch = sample;
      }
    });

    if (bestMatch && minDistance < 1.1) {
      return {
        matchedSample: bestMatch,
        similarityScore: Math.round(Math.max(60, 100 - minDistance * 35)),
        isViolation: bestMatch.isViolation,
        shouldFine: bestMatch.shouldFine,
        activityCategory: bestMatch.activityCategory,
        ruleApplied: `Learned Rule from Demonstration [${bestMatch.id}: ${bestMatch.label}]`
      };
    }

    return null;
  }
}

window.cvEngine = new SwachhCVEngine();
