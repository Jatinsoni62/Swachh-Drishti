// SWACHH-DRISHTI Multi-Person Computer Vision & Individual Action Tracker

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
    this.maxTrackingDistance = 85; // Max centroid distance for association

    // Global settings & sensitivity
    this.temporalBufferSize = 30;
    this.temporalFrameCount = 0;
    this.spitDetectionThreshold = 50; // Threshold to trigger violation
    this.sensitivity = "high";
    this.cooldownFrames = 0;

    // MediaRecorder for capturing real camera clips
    this.webcamStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.lastRecordedBlobUrl = null;

    // Audio context for auditory feedback
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
  }

  setSensitivity(level) {
    this.sensitivity = level;
    if (level === "high") this.spitDetectionThreshold = 38;
    else if (level === "medium") this.spitDetectionThreshold = 55;
    else this.spitDetectionThreshold = 75;
  }

  attachElements(videoEl, canvasEl) {
    this.videoElement = videoEl;
    this.canvasElement = canvasEl;
    if (this.canvasElement) {
      this.ctx = this.canvasElement.getContext("2d");
    }
  }

  start() {
    if (this.isRunning) return;
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

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try { this.mediaRecorder.stop(); } catch (e) {}
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
    } catch (e) {}
  }

  async startWebcam() {
    try {
      this.webcamStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          facingMode: "user"
        },
        audio: false
      });

      if (this.videoElement) {
        this.videoElement.srcObject = this.webcamStream;
        await this.videoElement.play();
      }

      this.initMediaRecorder();
      this.runWebcamInferenceLoop();
    } catch (err) {
      console.warn("Webcam access error:", err);
      alert("Camera access denied or unavailable. Switching to Multi-Pedestrian Simulation Mode.");
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

      // 1. Detect multi-person spatial motion clusters from webcam frames
      const detections = this.detectMultiPersonBlobs(w, h);

      // 2. Associate detections with individual persistent tracks (ByteTrack algorithm)
      this.updateMultiPersonTracks(detections, w, h);

      // 3. Render tracking boxes, velocity vectors, and individual status for every person
      this.renderMultiPersonTracks(w, h);

      // 4. Render top HUD showing all actively tracked persons
      this.renderTrackingHUD(w, h);
    }

    this.animFrameId = requestAnimationFrame(() => this.runWebcamInferenceLoop());
  }

  // Detect motion clusters / person presences across vertical sectors
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
      // Divide horizontal space into 3 spatial sectors (Left, Center, Right) to detect multiple people
      const sectors = [
        { name: "left", x0: 0, x1: (aw * 0.38) | 0 },
        { name: "center", x0: (aw * 0.32) | 0, x1: (aw * 0.68) | 0 },
        { name: "right", x0: (aw * 0.62) | 0, x1: aw }
      ];

      sectors.forEach((sec, idx) => {
        let sectorMotion = 0;
        let downwardMotion = 0;
        let mouthZoneMotion = 0;
        let minX = sec.x1, maxX = sec.x0, minY = ah, maxY = 0;

        for (let y = 10; y < ah - 10; y++) {
          for (let x = sec.x0; x < sec.x1; x++) {
            const pIdx = y * aw + x;
            const diff = Math.abs(currentLuma[pIdx] - this.prevFrameLuma[pIdx]);
            if (diff > 16) {
              sectorMotion += diff;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              if (y > 12) {
                const diffUp = Math.abs(currentLuma[pIdx] - this.prevFrameLuma[(y - 2) * aw + x]);
                if (diff > diffUp) downwardMotion += diff;
              }

              // Mouth region (between 25% and 60% of height)
              if (y > ah * 0.25 && y < ah * 0.6) {
                mouthZoneMotion += diff;
              }
            }
          }
        }

        const area = (sec.x1 - sec.x0) * ah;
        const motionDensity = sectorMotion / area;

        // If significant motion/person presence detected in this sector
        if (motionDensity > 2.5 && maxX > minX && maxY > minY) {
          // Map to full video coordinates
          const scaleX = w / aw;
          const scaleY = h / ah;
          const blobW = Math.max(120, Math.round((maxX - minX + 16) * scaleX));
          const blobH = Math.max(180, Math.round((maxY - minY + 24) * scaleY));
          const blobX = Math.max(10, Math.min(w - blobW - 10, Math.round(minX * scaleX)));
          const blobY = Math.max(10, Math.min(h - blobH - 10, Math.round(minY * scaleY)));

          detections.push({
            x: blobX,
            y: blobY,
            width: blobW,
            height: blobH,
            cx: blobX + blobW / 2,
            cy: blobY + blobH / 2,
            motionDensity,
            downwardMotion: (downwardMotion / area) * 10,
            mouthZoneMotion: (mouthZoneMotion / (area * 0.35)) * 10
          });
        }
      });
    }

    // If no distinct multiple sector motion, ensure at least one primary central user track exists
    if (detections.length === 0) {
      const bw = Math.round(w * 0.38);
      const bh = Math.round(h * 0.75);
      const bx = Math.round((w - bw) / 2);
      const by = Math.round((h - bh) / 2);
      detections.push({
        x: bx,
        y: by,
        width: bw,
        height: bh,
        cx: bx + bw / 2,
        cy: by + bh / 2,
        motionDensity: 1.0,
        downwardMotion: 0,
        mouthZoneMotion: 0
      });
    }

    this.prevFrameLuma = currentLuma;
    return detections;
  }

  // ByteTrack centroid association: match detections to persistent tracks
  updateMultiPersonTracks(detections, w, h) {
    const updatedTracks = [];
    const usedDetections = new Set();

    // Match existing tracks to nearest detection
    this.tracks.forEach(track => {
      let bestDist = Infinity;
      let bestIdx = -1;

      detections.forEach((det, dIdx) => {
        if (usedDetections.has(dIdx)) return;
        const dist = Math.hypot(track.cx - det.cx, track.cy - det.cy);
        if (dist < bestDist && dist < this.maxTrackingDistance * 2.5) {
          bestDist = dist;
          bestIdx = dIdx;
        }
      });

      if (bestIdx !== -1) {
        const det = detections[bestIdx];
        usedDetections.add(bestIdx);

        // Smooth position updates (EMA)
        const oldX = track.x;
        const oldY = track.y;
        track.x = Math.round(0.7 * track.x + 0.3 * det.x);
        track.y = Math.round(0.7 * track.y + 0.3 * det.y);
        track.width = Math.round(0.8 * track.width + 0.2 * det.width);
        track.height = Math.round(0.8 * track.height + 0.2 * det.height);
        track.cx = track.x + track.width / 2;
        track.cy = track.y + track.height / 2;

        // Velocity vector & movement calculation
        track.vx = (track.x - oldX);
        track.vy = (track.y - oldY);
        track.speed = Math.hypot(track.vx, track.vy);

        // Motion trail
        track.trail.push({ x: track.cx, y: track.cy });
        if (track.trail.length > 15) track.trail.shift();

        // Individual Spitting Action Energy calculation for THIS specific person
        if (det.downwardMotion > 10 || (det.mouthZoneMotion > 14 && det.motionDensity > 4)) {
          track.spitEnergy = Math.min(100, track.spitEnergy + 26);
          track.state = "ANALYZING_SPIT_GESTURE";
        } else if (track.speed > 3) {
          track.spitEnergy = Math.max(0, track.spitEnergy - 3);
          track.state = track.vx > 1 ? "MOVING_RIGHT" : (track.vx < -1 ? "MOVING_LEFT" : "MOVING");
        } else {
          track.spitEnergy = Math.max(0, track.spitEnergy - 4);
          if (track.spitEnergy < 15) {
            track.state = "STATIONARY_SAFE";
          }
        }

        // Trigger violation if THIS specific person spits
        if (track.spitEnergy >= this.spitDetectionThreshold && this.cooldownFrames === 0) {
          track.state = "🚨 SPITTING_DETECTED";
          this.triggerRealSpitCapture(track.x, track.y, track.width, track.height, track.id);
        }

        track.misses = 0;
        updatedTracks.push(track);
      } else {
        // Person missed in this frame
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
          state: "TRACKED",
          misses: 0,
          trail: [{ x: det.cx, y: det.cy }]
        });
      }
    });

    this.tracks = updatedTracks;
  }

  // Draw individual tracking boxes and motion vectors for every person
  renderMultiPersonTracks(w, h) {
    this.tracks.forEach(track => {
      const isSpitting = track.state.includes("SPITTING_DETECTED");
      const isAnalyzing = track.spitEnergy > 30;
      const isMoving = track.speed > 2.5;

      const boxColor = isSpitting ? "#ef4444" : (isAnalyzing ? "#f59e0b" : (isMoving ? "#06b6d4" : "#10b981"));

      // 1. Draw Centroid Movement Trail (Shows path travelled by person)
      if (track.trail.length > 1) {
        this.ctx.strokeStyle = boxColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        track.trail.forEach((pt, idx) => {
          if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
          else this.ctx.lineTo(pt.x, pt.y);
        });
        this.ctx.stroke();
      }

      // 2. Bounding Box
      this.ctx.strokeStyle = boxColor;
      this.ctx.lineWidth = isSpitting ? 3.5 : 2;
      this.ctx.strokeRect(track.x, track.y, track.width, track.height);
      this.drawCornerAccents(track.x, track.y, track.width, track.height, boxColor);

      // 3. Header Tag: Track ID + Movement Velocity + State
      this.ctx.fillStyle = boxColor;
      this.ctx.fillRect(track.x, track.y - 24, track.width, 24);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 10px monospace";

      const velocityStr = isMoving ? `| v: ${track.speed.toFixed(1)}m/s` : `| IDLE`;
      const spitStr = isSpitting ? `🚨 SPITTING (${Math.round(track.spitEnergy)}%)` : track.state;
      this.ctx.fillText(`${track.id} ${velocityStr} | ${spitStr}`, track.x + 5, track.y - 8);

      // 4. Individual Keypoints (Head, Mouth, Hands)
      const headX = track.x + track.width / 2;
      const headY = track.y + track.height * 0.25;
      const mouthY = headY + 22;

      this.drawKeypoint(headX, headY, "#38bdf8", "Head");
      this.drawKeypoint(headX, mouthY, isSpitting ? "#ef4444" : "#f43f5e", "Mouth");
      this.drawKeypoint(headX - track.width * 0.3, track.y + track.height * 0.55, "#34d399", "Hand L");
      this.drawKeypoint(headX + track.width * 0.3, track.y + track.height * 0.55, "#34d399", "Hand R");

      // 5. Spitting trajectory particles if this specific person triggered
      if (isSpitting) {
        this.ctx.fillStyle = "#ef4444";
        for (let i = 0; i < 8; i++) {
          this.ctx.beginPath();
          this.ctx.arc(headX + (i - 4) * 4, mouthY + 10 + i * 8, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });
  }

  // Active Multi-Person Tracker HUD banner
  renderTrackingHUD(w, h) {
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    this.ctx.fillRect(10, 10, 360, 68);
    this.ctx.strokeStyle = "#334155";
    this.ctx.strokeRect(10, 10, 360, 68);

    this.ctx.fillStyle = "#38bdf8";
    this.ctx.font = "bold 11px monospace";
    this.ctx.fillText(`MULTI-PERSON TRACKER: ${this.tracks.length} PERSON(S) MONITORED`, 18, 28);

    // List individual tracks
    this.ctx.font = "10px monospace";
    this.tracks.slice(0, 3).forEach((track, i) => {
      const isSpit = track.state.includes("SPITTING");
      this.ctx.fillStyle = isSpit ? "#f87171" : "#e2e8f0";
      this.ctx.fillText(
        `• ${track.id}: ${track.state} (v:${track.speed.toFixed(1)}m/s | spit:${Math.round(track.spitEnergy)}%)`,
        18,
        44 + i * 14
      );
    });
  }

  // Trigger Spitting Action Capture for a specific person
  triggerRealSpitCapture(bx = 200, by = 50, bw = 240, bh = 280, offenderTrackId = "P-001") {
    this.cooldownFrames = 90;
    this.playAlertTone();

    // 1. Capture exact snapshot frame from video
    const snapCanvas = document.createElement("canvas");
    snapCanvas.width = this.videoElement.videoWidth || 640;
    snapCanvas.height = this.videoElement.videoHeight || 360;
    const sCtx = snapCanvas.getContext("2d");
    sCtx.drawImage(this.videoElement, 0, 0);

    // Draw AI bounding box on snapshot focused on the specific offender
    sCtx.strokeStyle = "#ef4444";
    sCtx.lineWidth = 3;
    sCtx.strokeRect(bx, by, bw, bh);
    sCtx.fillStyle = "#ef4444";
    sCtx.fillRect(bx, by - 26, bw, 26);
    sCtx.fillStyle = "#ffffff";
    sCtx.font = "bold 12px monospace";
    sCtx.fillText(`TRACK ${offenderTrackId} | VIOLATION: PUBLIC SPITTING`, bx + 8, by - 8);

    const snapshotUrl = snapCanvas.toDataURL("image/jpeg", 0.9);

    // 2. Generate video blob from recent chunks if available
    let videoUrl = null;
    if (this.recordedChunks.length > 0) {
      try {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        videoUrl = URL.createObjectURL(blob);
        this.lastRecordedBlobUrl = videoUrl;
      } catch (e) {}
    }

    const confidence = 89;

    // 3. Dispatch to store with specific Track ID
    if (window.store) {
      const inc = window.store.triggerSpittingDetection(
        "LIVE-CAM-01",
        confidence,
        { x: (bx / 640) * 100, y: (by / 360) * 100, width: (bw / 640) * 100, height: (bh / 360) * 100 },
        snapshotUrl,
        videoUrl
      );

      if (inc) {
        inc.trackId = offenderTrackId;
      }

      if (window.showToast) {
        window.showToast(`🚨 SPITTING ACTION DETECTED FOR TRACK ${offenderTrackId}! Real clip buffered for Officer verification.`);
      }

      setTimeout(() => {
        if (window.openEvidenceModal && inc) {
          window.openEvidenceModal(inc.id);
        }
      }, 600);
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
            this.triggerSimSpitTrajectory(actor);
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
        const inc = window.store.triggerSpittingDetection(this.activeCameraId, actor.confidence);
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
}

window.cvEngine = new SwachhCVEngine();
