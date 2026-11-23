/**
 * SignBridge Live - Complete Application Controller
 * Features:
 * - Local Webcam and ESP32-CAM MJPEG Streaming with Live Switching
 * - Real-Time MediaPipe Hand Skeleton Overlay & ISL Gesture Recognition
 * - ESP32-CAM IP Configuration & Built-in Stream Proxy Support
 * - Clean Large-Text Display with Clickable Speech Audio Output
 * - Sidebar Navigation (Home, History, Settings, About)
 */

document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------------------------------------------
  // 1. Module Instances & Settings State
  // -----------------------------------------------------------------
  const classifier = new ISLClassifier();
  const visualizer = new SignVisualizer("signCanvas");

  // Settings from localStorage
  let espCamUrl = localStorage.getItem("signbridge_esp_url") || "http://192.168.1.100:81/stream";
  let espProxyEnabled = localStorage.getItem("signbridge_esp_proxy") !== "false";
  let primaryCamera = localStorage.getItem("signbridge_primary_cam") || "webcam";
  let audioEnabled = true;
  let currentDialect = "isl-te"; // Default: ISL <-> English / Telugu

  // Camera State
  let cameraSource = "webcam"; // "webcam" or "espcam"
  let isCameraActive = false;
  let cameraInstance = null;
  let espStreamAnimFrame = null;

  // History Log Storage
  const communicationHistory = [];

  // -----------------------------------------------------------------
  // 2. DOM Elements
  // -----------------------------------------------------------------
  // Video Elements
  const webcamVideo = document.getElementById("webcamVideo");
  const espCamImg = document.getElementById("espCamImg");
  const outputCanvas = document.getElementById("outputCanvas");
  const canvasCtx = outputCanvas.getContext("2d");
  const cameraViewportContainer = document.getElementById("cameraViewportContainer");
  const camStartOverlay = document.getElementById("camStartOverlay");
  const startCamBtn = document.getElementById("startCamBtn");

  // Camera Controls
  const switchCameraBtn = document.getElementById("switchCameraBtn");
  const switchCamLabel = document.getElementById("switchCamLabel");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const stopCameraBtn = document.getElementById("stopCameraBtn");
  const stopCamLabel = document.getElementById("stopCamLabel");
  const camStatusText = document.getElementById("camStatusText");
  const postureFeedbackLabel = document.getElementById("postureFeedbackLabel");

  // Display Box & Audio
  const largeDisplayText = document.getElementById("largeDisplayText");
  const largeDisplaySubtitle = document.getElementById("largeDisplaySubtitle");
  const boxSpeechBtn = document.getElementById("boxSpeechBtn");
  const boxSpeechText = document.getElementById("boxSpeechText");
  const audioToggleSelect = document.getElementById("audioToggleSelect");
  const transcriptionLangLabel = document.getElementById("transcriptionLangLabel");
  const avatarSignLabel = document.getElementById("avatarSignLabel");
  const signPrevBtn = document.getElementById("signPrevBtn");
  const signPlayPauseBtn = document.getElementById("signPlayPauseBtn");
  const signPlayPauseIcon = document.getElementById("signPlayPauseIcon");
  const signNextBtn = document.getElementById("signNextBtn");
  const signReplayBtn = document.getElementById("signReplayBtn");
  const signSpeedBtn = document.getElementById("signSpeedBtn");
  const signSequencePillsContainer = document.getElementById("signSequencePillsContainer");

  // Tabs
  const tabLiveMessage = document.getElementById("tabLiveMessage");
  const tabHistory = document.getElementById("tabHistory");
  const liveMessageCard = document.getElementById("liveMessageCard");
  const historyViewPanel = document.getElementById("historyViewPanel");
  const historyLogsList = document.getElementById("historyLogsList");

  // Messaging Input & Microphone
  const messageInput = document.getElementById("messageInput");
  const inputMicBtn = document.getElementById("inputMicBtn");
  const sendBtn = document.getElementById("sendBtn");

  // Header & Sidebar Nav
  const dialectSelect = document.getElementById("dialectSelect");
  const sessionTimerText = document.getElementById("sessionTimerText");
  const navHomeBtn = document.getElementById("navHomeBtn");
  const navHistoryBtn = document.getElementById("navHistoryBtn");
  const navSettingsBtn = document.getElementById("navSettingsBtn");
  const navAboutBtn = document.getElementById("navAboutBtn");

  // Settings Modal Elements
  const settingsModal = document.getElementById("settingsModal");
  const closeSettingsModalBtn = document.getElementById("closeSettingsModalBtn");
  const espCamUrlInput = document.getElementById("espCamUrlInput");
  const espProxyToggle = document.getElementById("espProxyToggle");
  const primaryCameraSelect = document.getElementById("primaryCameraSelect");
  const testEspBtn = document.getElementById("testEspBtn");
  const espPingStatus = document.getElementById("espPingStatus");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");

  // -----------------------------------------------------------------
  // 3. Live Session Stopwatch Timer (Matches 14:46)
  // -----------------------------------------------------------------
  let sessionSeconds = 14 * 60 + 46;
  setInterval(() => {
    sessionSeconds++;
    const mins = Math.floor(sessionSeconds / 60).toString().padStart(2, "0");
    const secs = (sessionSeconds % 60).toString().padStart(2, "0");
    if (sessionTimerText) sessionTimerText.textContent = `${mins}:${secs}`;
  }, 1000);

  // -----------------------------------------------------------------
  // 4. Speech Engine (STT & TTS)
  // -----------------------------------------------------------------
  const speechEngine = new SpeechEngine({
    lang: "en-IN",
    onStatusChange: (statusObj) => {
      if (!inputMicBtn) return;
      if (statusObj.status === "listening") {
        inputMicBtn.classList.add("bg-rose-100", "text-rose-600", "animate-pulse");
        messageInput.placeholder = "Listening... Speak now";
      } else {
        inputMicBtn.classList.remove("bg-rose-100", "text-rose-600", "animate-pulse");
        messageInput.placeholder = "Type message or click...";
      }
    },
    onTranscript: (t) => {
      const text = t.final || t.interim;
      if (text) {
        messageInput.value = text;
        if (t.final) {
          displayMessage(t.final, "speech");
          messageInput.value = "";
        }
      }
    }
  });

  if (inputMicBtn) {
    inputMicBtn.addEventListener("click", () => {
      speechEngine.toggleListening();
    });
  }

  audioToggleSelect.addEventListener("change", (e) => {
    audioEnabled = e.target.value === "on";
  });

  dialectSelect.addEventListener("change", (e) => {
    currentDialect = e.target.value;
    if (currentDialect === "isl-te") {
      speechEngine.setLanguage("te-IN");
      transcriptionLangLabel.textContent = "English / Telugu";
    } else if (currentDialect === "isl-hi") {
      speechEngine.setLanguage("hi-IN");
      transcriptionLangLabel.textContent = "English / Hindi";
    } else if (currentDialect === "isl-ta") {
      speechEngine.setLanguage("ta-IN");
      transcriptionLangLabel.textContent = "English / Tamil";
    } else {
      speechEngine.setLanguage("en-IN");
      transcriptionLangLabel.textContent = "English Only";
    }
    updateDisplaySubtitle(largeDisplayText.textContent);
  });

  // -----------------------------------------------------------------
  // 5. MediaPipe Hands Tracking Pipeline
  // -----------------------------------------------------------------
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.65
  });

  hands.onResults(onHandResults);

  // -----------------------------------------------------------------
  // 6. Camera Management (Webcam & ESP32-CAM)
  // -----------------------------------------------------------------
  function getEffectiveEspStreamUrl() {
    if (espProxyEnabled) {
      return `/api/esp-stream?url=${encodeURIComponent(espCamUrl)}`;
    }
    return espCamUrl;
  }

  function startWebcam() {
    cameraSource = "webcam";
    cameraViewportContainer.classList.add("mirrored");
    outputCanvas.classList.add("mirrored");

    if (espStreamAnimFrame) {
      cancelAnimationFrame(espStreamAnimFrame);
      espStreamAnimFrame = null;
    }
    espCamImg.src = "";

    camStartOverlay.classList.add("opacity-0", "pointer-events-none");
    camStatusText.textContent = "Camera Active";
    switchCamLabel.textContent = "Switch Camera (ESP)";
    stopCamLabel.textContent = "Stop Camera";

    cameraInstance = new Camera(webcamVideo, {
      onFrame: async () => {
        if (!isCameraActive || cameraSource !== "webcam") return;
        await hands.send({ image: webcamVideo });
      },
      width: 640,
      height: 480
    });

    cameraInstance.start()
      .then(() => {
        isCameraActive = true;
      })
      .catch((err) => {
        console.warn("Webcam error:", err);
        camStartOverlay.classList.remove("opacity-0", "pointer-events-none");
      });
  }

  function startEspCamStream() {
    cameraSource = "espcam";
    cameraViewportContainer.classList.remove("mirrored");
    outputCanvas.classList.remove("mirrored");

    if (cameraInstance) {
      try { cameraInstance.stop(); } catch(e) {}
    }

    const streamUrl = getEffectiveEspStreamUrl();
    camStartOverlay.classList.add("opacity-0", "pointer-events-none");
    camStatusText.textContent = `ESP-CAM Active (${new URL(espCamUrl).hostname || 'ESP'})`;
    switchCamLabel.textContent = "Switch to Webcam";
    stopCamLabel.textContent = "Stop Camera";
    isCameraActive = true;

    // Load stream into image element
    espCamImg.src = streamUrl;

    espCamImg.onload = () => {
      // Loop frames from ESP-CAM image to MediaPipe
      const processEspFrame = async () => {
        if (!isCameraActive || cameraSource !== "espcam") return;
        if (espCamImg.naturalWidth && espCamImg.naturalHeight) {
          await hands.send({ image: espCamImg });
        }
        espStreamAnimFrame = requestAnimationFrame(processEspFrame);
      };
      processEspFrame();
    };

    espCamImg.onerror = () => {
      console.warn("Could not connect to ESP32-CAM stream at:", streamUrl);
      camStatusText.textContent = "ESP-CAM Offline";
      alert(`Could not connect to ESP32-CAM at:\n${espCamUrl}\n\nPlease check your ESP-CAM IP in Settings and ensure it is powered on.`);
      openSettingsModal();
    };
  }

  function toggleCameraSource() {
    if (cameraSource === "webcam") {
      // Switching to ESP32-CAM
      if (!espCamUrl || espCamUrl.includes("192.168.1.100")) {
        // Not configured yet
        openSettingsModal();
        alert("Please confirm or update your ESP32-CAM IP address in Settings first.");
      } else {
        startEspCamStream();
      }
    } else {
      // Switching back to local webcam
      startWebcam();
    }
  }

  function stopCurrentCamera() {
    isCameraActive = false;
    if (cameraInstance) {
      try { cameraInstance.stop(); } catch(e) {}
    }
    if (espStreamAnimFrame) {
      cancelAnimationFrame(espStreamAnimFrame);
      espStreamAnimFrame = null;
    }
    espCamImg.src = "";
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    camStartOverlay.classList.remove("opacity-0", "pointer-events-none");
    camStatusText.textContent = "Camera Stopped";
    stopCamLabel.textContent = "Start Camera";
  }

  startCamBtn.addEventListener("click", () => {
    if (primaryCamera === "espcam") startEspCamStream();
    else startWebcam();
  });

  switchCameraBtn.addEventListener("click", toggleCameraSource);

  stopCameraBtn.addEventListener("click", () => {
    if (isCameraActive) {
      stopCurrentCamera();
    } else {
      if (cameraSource === "espcam") startEspCamStream();
      else startWebcam();
    }
  });

  // Fullscreen Viewport
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      cameraViewportContainer.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  });

  // Boot primary camera
  if (primaryCamera === "espcam") {
    startEspCamStream();
  } else {
    startWebcam();
  }

  // -----------------------------------------------------------------
  // 7. Hand Landmark Rendering & Recognition Output
  // -----------------------------------------------------------------
  function onHandResults(results) {
    if (!isCameraActive) return;

    if (outputCanvas.width !== results.image.width) {
      outputCanvas.width = results.image.width;
      outputCanvas.height = results.image.height;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Draw the image frame (Webcam or ESP-CAM)
    canvasCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);

    // Draw MediaPipe Hand Landmark skeleton
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#38bdf8",
          lineWidth: 3.5
        });

        drawLandmarks(canvasCtx, landmarks, {
          color: "#ffffff",
          fillColor: "#2563eb",
          lineWidth: 1.5,
          radius: 3.5
        });
      }

      const prediction = classifier.classify(results.multiHandLandmarks, results.multiHandedness);
      if (prediction) {
        postureFeedbackLabel.textContent = prediction.label;
        if (prediction.confirmed) {
          onSignConfirmed(prediction);
        }
      }
    } else {
      postureFeedbackLabel.textContent = "Hold Posture to Camera";
    }

    canvasCtx.restore();
  }

  function onSignConfirmed(prediction) {
    speechEngine.playChime("confirm");

    let caption = "";
    switch (prediction.sign) {
      case "eat":
      case "food":
        caption = "I want to eat food / Need meals.";
        break;
      case "drink":
      case "water":
        caption = "I need drinking water.";
        break;
      case "sleep":
        caption = "I need to sleep and rest.";
        break;
      case "book":
      case "read":
        caption = "Please provide the book / reading material.";
        break;
      case "write":
        caption = "Please write it down for me.";
        break;
      case "stand":
        caption = "Please stand up.";
        break;
      case "sit":
        caption = "Please have a seat.";
        break;
      case "wash":
        caption = "Where can I wash my hands?";
        break;
      case "listen":
        caption = "Please listen to me.";
        break;
      case "open hands":
        caption = "Hello, how can I help you?";
        break;
      case "namaste":
        caption = "Namaste! Welcome.";
        break;
      case "railway":
        caption = "I need information about the railway timings.";
        break;
      case "time":
        caption = "What are the departure timings for the train?";
        break;
      case "ok":
        caption = "Everything is okay and confirmed.";
        break;
      case "doctor":
        caption = "I need urgent medical / doctor assistance.";
        break;
      case "money":
        caption = "How much is the ticket fare?";
        break;
      case "help":
        caption = "Can you please help me?";
        break;
      case "thank you":
        caption = "Thank you very much.";
        break;
      case "where":
        caption = "Where is the station platform?";
        break;
      case "toilet":
      case "bathroom":
        caption = "Where is the toilet / washroom?";
        break;
      case "look":
      case "see":
        caption = "Please look and see here.";
        break;
      case "tea":
      case "chai":
        caption = "I want hot tea / chai.";
        break;
      case "call":
      case "phone":
        caption = "Please call me on phone.";
        break;
      case "good":
        caption = "Good, everything is great.";
        break;
      case "bad":
        caption = "Bad, this is not good.";
        break;
      case "yes":
        caption = "Yes, I agree and confirm.";
        break;
      case "no":
        caption = "No, I do not want.";
        break;
      case "peace":
        caption = "Peace and victory.";
        break;
      case "love":
        caption = "I love you / Warm regards.";
        break;
      case "stop":
      case "wait":
        caption = "Please stop and wait.";
        break;
      case "welcome":
        caption = "Welcome! You are welcome.";
        break;
      case "please":
        caption = "Please, I request you.";
        break;
      case "sorry":
        caption = "I am very sorry.";
        break;
      default:
        caption = prediction.label;
        break;
    }

    displayMessage(caption, "sign");
  }

  // -----------------------------------------------------------------
  // 8. Large Display Message & Speech Audio Handling (High-Clarity ISL Output)
  // -----------------------------------------------------------------
  function displayMessage(mainText, source = "sign") {
    largeDisplayText.textContent = mainText;
    largeDisplayText.className = "text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug";

    updateDisplaySubtitle(mainText);

    // Convert text into Indian Sign Language (ISL) Gloss Sequence
    if (window.englishToISLGloss && visualizer) {
      const glossSequence = window.englishToISLGloss(mainText);
      visualizer.loadSequence(glossSequence);

      if (avatarSignLabel && glossSequence.length > 0) {
        avatarSignLabel.textContent = glossSequence[0].gloss;
      }

      // Populate interactive sequence word chips
      if (signSequencePillsContainer) {
        signSequencePillsContainer.innerHTML = "";
        glossSequence.forEach((item, idx) => {
          const chip = document.createElement("button");
          chip.className = "sign-sequence-chip" + (idx === 0 ? " active" : "");
          chip.textContent = `${idx + 1}. ${item.type === "word" ? item.gloss : item.word}`;
          chip.title = `Click to view sign: ${item.english || item.gloss}`;
          chip.addEventListener("click", () => {
            visualizer.goToIndex(idx);
            highlightActiveChip(idx);
          });
          signSequencePillsContainer.appendChild(chip);
        });
      }
    }

    // Add to session history
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    communicationHistory.push({ text: mainText, source, timestamp });
    renderHistoryLogs();

    // Auto-speak if enabled
    if (audioEnabled) {
      speakAloud(mainText);
    }
  }

  function highlightActiveChip(activeIdx) {
    if (!signSequencePillsContainer) return;
    const chips = signSequencePillsContainer.querySelectorAll(".sign-sequence-chip");
    chips.forEach((c, idx) => {
      c.classList.toggle("active", idx === activeIdx);
      if (idx === activeIdx) {
        c.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    });
  }

  // Hook up visualizer progress to active badge & word chips
  visualizer.onProgress = ({ currentIndex, currentItem, finished }) => {
    if (avatarSignLabel) {
      if (currentItem && !finished) {
        avatarSignLabel.textContent = currentItem.gloss;
      } else if (finished) {
        avatarSignLabel.textContent = "Sequence Completed";
        if (signPlayPauseIcon) signPlayPauseIcon.setAttribute("data-lucide", "play");
        lucide.createIcons();
      }
    }
    highlightActiveChip(currentIndex);
  };

  // Playback Controls
  if (signPlayPauseBtn) {
    signPlayPauseBtn.addEventListener("click", () => {
      if (visualizer.isPlaying) {
        visualizer.pause();
        if (signPlayPauseIcon) signPlayPauseIcon.setAttribute("data-lucide", "play");
      } else {
        visualizer.play();
        if (signPlayPauseIcon) signPlayPauseIcon.setAttribute("data-lucide", "pause");
      }
      lucide.createIcons();
    });
  }

  if (signPrevBtn) {
    signPrevBtn.addEventListener("click", () => {
      visualizer.prev();
      highlightActiveChip(visualizer.currentIndex);
    });
  }

  if (signNextBtn) {
    signNextBtn.addEventListener("click", () => {
      visualizer.next();
      highlightActiveChip(visualizer.currentIndex);
    });
  }

  if (signReplayBtn) {
    signReplayBtn.addEventListener("click", () => {
      visualizer.replay();
      if (signPlayPauseIcon) signPlayPauseIcon.setAttribute("data-lucide", "pause");
      lucide.createIcons();
    });
  }

  let currentSpeedIdx = 0;
  const speedOptions = [1.0, 0.75, 0.5];
  if (signSpeedBtn) {
    signSpeedBtn.addEventListener("click", () => {
      currentSpeedIdx = (currentSpeedIdx + 1) % speedOptions.length;
      const spd = speedOptions[currentSpeedIdx];
      visualizer.setSpeed(spd);
      signSpeedBtn.textContent = `${spd}x`;
    });
  }

  function updateDisplaySubtitle(text) {
    if (!text || text.includes("Waiting for signs")) {
      largeDisplaySubtitle.textContent = "Start signing in front of the camera";
      return;
    }

    const lower = text.toLowerCase();
    let subtitle = "";

    if (currentDialect === "isl-te") {
      if (lower.includes("eat") || lower.includes("food")) subtitle = "నాకు ఆహారం / భోజనం కావాలి.";
      else if (lower.includes("drink") || lower.includes("water")) subtitle = "నాకు తాగడానికి మంచినీళ్లు కావాలి.";
      else if (lower.includes("sleep") || lower.includes("rest")) subtitle = "నేను నిద్రపోవాలి / విశ్రాంతి కావాలి.";
      else if (lower.includes("book") || lower.includes("read")) subtitle = "దయచేసి పుస్తకం / సమాచారం ఇవ్వండి.";
      else if (lower.includes("write")) subtitle = "దయచేసి నా కోసం రాసివ్వండి.";
      else if (lower.includes("stand")) subtitle = "దయచేసి నిలబడండి.";
      else if (lower.includes("railway") || lower.includes("train")) subtitle = "నాకు రైలు సమయాల సమాచారం కావాలి.";
      else if (lower.includes("hello") || lower.includes("namaste")) subtitle = "నమస్కారం, నేను మీకు ఎలా సహాయపడగలను?";
      else if (lower.includes("station")) subtitle = "సరే, మీరు ఏ స్టేషన్‌కు ప్రయాణిస్తున్నారు?";
      else if (lower.includes("thank")) subtitle = "మీకు చాలా ధన్యవాదాలు.";
      else if (lower.includes("ok")) subtitle = "అంతా సరే మరియు నిర్ధారించబడింది.";
      else if (lower.includes("doctor")) subtitle = "నాకు అత్యవసర వైద్య సహాయం కావాలి.";
      else if (lower.includes("money")) subtitle = "టిక్కెట్ ధర ఎంత?";
      else if (lower.includes("toilet") || lower.includes("washroom")) subtitle = "మరుగుదొడ్డి / వాష్‌రూమ్ ఎక్కడ ఉంది?";
      else if (lower.includes("wash")) subtitle = "చేతులు శుభ్రంగా కడుక్కోవడం.";
      else if (lower.includes("sit")) subtitle = "దయచేసి కూర్చోండి.";
      else if (lower.includes("tea") || lower.includes("chai")) subtitle = "నాకు వేడి టీ / చాయ్ కావాలి.";
      else if (lower.includes("call")) subtitle = "దయచేసి నాకు ఫోన్ కాల్ చేయండి.";
      else if (lower.includes("good")) subtitle = "మంచిది, అంతా బాగుంది.";
      else if (lower.includes("bad")) subtitle = "చెడ్డది, ఇది బాగాలేదు.";
      else if (lower.includes("yes")) subtitle = "అవును, నేను అంగీకరిస్తున్నాను.";
      else if (lower.includes("no")) subtitle = "లేదు / వద్దు.";
      else if (lower.includes("help")) subtitle = "దయచేసి నాకు సహాయం చేయండి.";
      else if (lower.includes("peace")) subtitle = "శాంతి మరియు విజయం.";
      else if (lower.includes("welcome")) subtitle = "మీకు హృదయపూర్వక స్వాగతం.";
      else if (lower.includes("please")) subtitle = "దయచేసి, నేను మిమ్మల్ని అభ్యర్థిస్తున్నాను.";
      else if (lower.includes("sorry")) subtitle = "నన్ను క్షమించండి.";
      else {
        // Fallback: Combine regional words from dictionary
        if (window.englishToISLGloss) {
          const glosses = window.englishToISLGloss(text);
          const teWords = glosses.map(g => (g.data && g.data.telugu ? g.data.telugu.split("/")[0].trim() : "")).filter(Boolean);
          if (teWords.length > 0) subtitle = teWords.join(" ");
        }
      }
    } else if (currentDialect === "isl-hi") {
      if (lower.includes("eat") || lower.includes("food")) subtitle = "मुझे खाना चाहिए।";
      else if (lower.includes("drink") || lower.includes("water")) subtitle = "मुझे पीने का पानी चाहिए।";
      else if (lower.includes("sleep")) subtitle = "मुझे सोना है / आराम चाहिए।";
      else if (lower.includes("book")) subtitle = "कृपया किताब दें।";
      else if (lower.includes("write")) subtitle = "कृपया लिख दें।";
      else if (lower.includes("railway") || lower.includes("train")) subtitle = "मुझे रेलवे समय की जानकारी चाहिए।";
      else if (lower.includes("hello")) subtitle = "नमस्ते, मैं आपकी क्या मदद कर सकता हूँ?";
      else if (lower.includes("thank")) subtitle = "आपका बहुत-बहुत धन्यवाद।";
      else if (lower.includes("toilet") || lower.includes("washroom")) subtitle = "शौचालय / वॉशरूम कहाँ है?";
      else if (lower.includes("wash")) subtitle = "हाथ धोना।";
      else if (lower.includes("sit")) subtitle = "कृपया बैठिए।";
      else if (lower.includes("tea") || lower.includes("chai")) subtitle = "मुझे गरम चाय चाहिए।";
      else if (lower.includes("call")) subtitle = "कृपया मुझे फोन करें।";
      else if (lower.includes("good")) subtitle = "अच्छा, सब बढ़िया है।";
      else if (lower.includes("bad")) subtitle = "खराब, यह ठीक नहीं है।";
      else if (lower.includes("yes")) subtitle = "हाँ, मुझे मंज़ूर है।";
      else if (lower.includes("no")) subtitle = "नहीं, मुझे नहीं चाहिए।";
      else if (lower.includes("help")) subtitle = "कृपया मेरी मदद करें।";
      else if (lower.includes("peace")) subtitle = "शांति और विजय।";
      else if (lower.includes("welcome")) subtitle = "आपका स्वागत है।";
      else if (lower.includes("please")) subtitle = "कृपया, मेरा अनुरोध है।";
      else if (lower.includes("sorry")) subtitle = "मुझे बहुत खेद है / माफ़ कीजिए।";
      else {
        if (window.englishToISLGloss) {
          const glosses = window.englishToISLGloss(text);
          const hiWords = glosses.map(g => (g.data && g.data.hindi ? g.data.hindi.split("/")[0].trim() : "")).filter(Boolean);
          if (hiWords.length > 0) subtitle = hiWords.join(" ");
        }
      }
    } else {
      subtitle = "";
    }

    largeDisplaySubtitle.textContent = subtitle || "Recognized from Indian Sign Language";
  }

  function speakAloud(text) {
    if (!text || text.includes("Waiting for signs")) return;

    boxSpeechBtn.classList.add("speaking-pulse");
    boxSpeechText.textContent = "Speaking...";

    speechEngine.speak(text, () => {
      boxSpeechBtn.classList.remove("speaking-pulse");
      boxSpeechText.textContent = "Speak Aloud";
    });
  }

  boxSpeechBtn.addEventListener("click", () => {
    speakAloud(largeDisplayText.textContent.trim());
  });

  // -----------------------------------------------------------------
  // 9. Quick Action Cards (Try Postures)
  // -----------------------------------------------------------------
  document.querySelectorAll(".quick-action-card").forEach((card) => {
    card.addEventListener("click", () => {
      const signKey = card.dataset.sign;
      const dictItem = window.resolveDictionaryItem ? window.resolveDictionaryItem(signKey) : null;
      if (dictItem) {
        onSignConfirmed({
          sign: signKey,
          label: dictItem.english || dictItem.gloss,
          confidence: 0.98,
          confirmed: true
        });
      }
    });
  });

  // -----------------------------------------------------------------
  // 10. Chat Message Sending
  // -----------------------------------------------------------------
  function handleSendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    displayMessage(text, "user");
    messageInput.value = "";
  }

  sendBtn.addEventListener("click", handleSendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });

  // -----------------------------------------------------------------
  // 11. Tabs: Live Message vs History
  // -----------------------------------------------------------------
  tabLiveMessage.addEventListener("click", () => {
    tabLiveMessage.className = "px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition";
    tabHistory.className = "px-5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs flex items-center gap-2 transition";
    liveMessageCard.classList.remove("hidden");
    historyViewPanel.classList.add("hidden");
  });

  tabHistory.addEventListener("click", () => {
    tabHistory.className = "px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition";
    tabLiveMessage.className = "px-5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs flex items-center gap-2 transition";
    liveMessageCard.classList.add("hidden");
    historyViewPanel.classList.remove("hidden");
    renderHistoryLogs();
  });

  function renderHistoryLogs() {
    if (communicationHistory.length === 0) {
      historyLogsList.innerHTML = `<span class="text-xs text-slate-400 italic">No communication logs recorded yet in this session.</span>`;
      return;
    }

    historyLogsList.innerHTML = communicationHistory
      .slice()
      .reverse()
      .map(item => `
        <div class="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${item.source === 'sign' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
              ${item.source === 'sign' ? 'ISL Sign' : 'User Text'}
            </span>
            <span class="text-xs font-semibold text-slate-800">${item.text}</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">${item.timestamp}</span>
        </div>
      `)
      .join("");
  }

  // -----------------------------------------------------------------
  // 12. Settings Modal & ESP32-CAM IP Configuration
  // -----------------------------------------------------------------
  function openSettingsModal() {
    espCamUrlInput.value = espCamUrl;
    espProxyToggle.checked = espProxyEnabled;
    primaryCameraSelect.value = primaryCamera;
    settingsModal.classList.remove("hidden");
  }

  function closeSettingsModal() {
    settingsModal.classList.add("hidden");
  }

  navSettingsBtn.addEventListener("click", openSettingsModal);
  closeSettingsModalBtn.addEventListener("click", closeSettingsModal);

  // Preset buttons
  document.querySelectorAll(".esp-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      espCamUrlInput.value = btn.dataset.url;
    });
  });

  // Test ESP-CAM Connection
  testEspBtn.addEventListener("click", () => {
    const testUrl = espCamUrlInput.value.trim();
    if (!testUrl) {
      espPingStatus.textContent = "Enter URL first";
      espPingStatus.className = "text-[10px] text-rose-500 font-bold";
      return;
    }

    espPingStatus.textContent = "Testing connection...";
    espPingStatus.className = "text-[10px] text-blue-500 font-bold";

    // Test through Node proxy or direct fetch
    const proxyTestUrl = `/api/esp-stream?url=${encodeURIComponent(testUrl)}`;
    const testImg = new Image();
    testImg.src = proxyTestUrl;

    const timeoutTimer = setTimeout(() => {
      espPingStatus.textContent = "Timed out (Offline)";
      espPingStatus.className = "text-[10px] text-rose-500 font-bold";
      testImg.src = "";
    }, 4500);

    testImg.onload = () => {
      clearTimeout(timeoutTimer);
      espPingStatus.textContent = "Online (Stream Reachable)";
      espPingStatus.className = "text-[10px] text-emerald-600 font-bold";
      testImg.src = "";
    };

    testImg.onerror = () => {
      clearTimeout(timeoutTimer);
      espPingStatus.textContent = "Offline or Unreachable";
      espPingStatus.className = "text-[10px] text-rose-500 font-bold";
    };
  });

  // Save Settings
  saveSettingsBtn.addEventListener("click", () => {
    espCamUrl = espCamUrlInput.value.trim();
    espProxyEnabled = espProxyToggle.checked;
    primaryCamera = primaryCameraSelect.value;

    localStorage.setItem("signbridge_esp_url", espCamUrl);
    localStorage.setItem("signbridge_esp_proxy", espProxyEnabled);
    localStorage.setItem("signbridge_primary_cam", primaryCamera);

    speechEngine.playChime("confirm");
    closeSettingsModal();

    if (cameraSource === "espcam") {
      startEspCamStream();
    }
  });

  // Sidebar other buttons
  navHomeBtn.addEventListener("click", () => {
    tabLiveMessage.click();
  });
  navHistoryBtn.addEventListener("click", () => {
    tabHistory.click();
  });
  navAboutBtn.addEventListener("click", () => {
    alert("SignBridge Live\nReal-Time Indian Sign Language & ESP32-CAM Translator\nBuilt with Google MediaPipe Hands & Web Speech API.");
  });
});
