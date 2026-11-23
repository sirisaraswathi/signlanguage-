/**
 * ISL Gesture Classifier
 * Processes 21 3D hand landmarks from MediaPipe Hands.
 * Enhanced with:
 * - Both Hands Open (10 Fingers - matching SignBridge live photo)
 * - OK / Perfect Mudra
 * - Railway / Train
 * - Time / Railway Timings
 * - Doctor / Pulse
 * - Money / Cost
 * - Namaste, Help, House, Good, Bad, Peace, Love, Stop, Water, Food, Call Me, Yes, No
 */

class ISLClassifier {
  constructor() {
    this.history = [];
    this.historySize = 5;

    this.currentGesture = null;
    this.holdStartTime = null;
    this.holdDurationNeeded = 700; // ms to confirm
    this.lastConfirmedGesture = null;
    this.lastConfirmTime = 0;
    this.debounceTime = 1100;

    this.customGestures = this.loadCustomGestures();
  }

  loadCustomGestures() {
    try {
      const data = localStorage.getItem("isl_custom_gestures");
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveCustomGesture(name, featureVector) {
    this.customGestures[name] = featureVector;
    try {
      localStorage.setItem("isl_custom_gestures", JSON.stringify(this.customGestures));
    } catch (e) {}
  }

  deleteCustomGesture(name) {
    if (this.customGestures[name]) {
      delete this.customGestures[name];
      try {
        localStorage.setItem("isl_custom_gestures", JSON.stringify(this.customGestures));
      } catch (e) {}
    }
  }

  dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  analyzeHand(landmarks, handedness = "Right") {
    const wrist = landmarks[0];
    const handScale = this.dist(wrist, landmarks[9]) || 0.1;

    const fingerTips = [4, 8, 12, 16, 20];
    const fingerPips = [2, 6, 10, 14, 18];
    const fingerMcps = [1, 5, 9, 13, 17];
    const extended = [0, 0, 0, 0, 0];

    // Thumb extension
    const thumbTipDist = this.dist(landmarks[4], landmarks[17]);
    const thumbIpDist = this.dist(landmarks[3], landmarks[17]);
    const thumbWristDist = this.dist(landmarks[4], wrist);
    const thumbMcpDist = this.dist(landmarks[2], wrist);
    extended[0] = (thumbTipDist > thumbIpDist && thumbWristDist > thumbMcpDist * 1.05) ? 1 : 0;

    // Fingers extension
    for (let i = 1; i < 5; i++) {
      const tipDist = this.dist(landmarks[fingerTips[i]], wrist);
      const pipDist = this.dist(landmarks[fingerPips[i]], wrist);
      const mcpDist = this.dist(landmarks[fingerMcps[i]], wrist);
      extended[i] = (tipDist > pipDist && tipDist > mcpDist) ? 1 : 0;
    }

    const dirX = (landmarks[9].x - wrist.x) / handScale;
    const dirY = (landmarks[9].y - wrist.y) / handScale; // -Y is pointing up

    const thumbUp = landmarks[4].y < landmarks[3].y && landmarks[3].y < landmarks[2].y;
    const thumbDown = landmarks[4].y > landmarks[3].y && landmarks[3].y > landmarks[2].y;

    const indexMiddleSpread = this.dist(landmarks[8], landmarks[12]) / handScale;
    const thumbIndexDist = this.dist(landmarks[4], landmarks[8]) / handScale;
    const thumbMiddleDist = this.dist(landmarks[4], landmarks[12]) / handScale;

    return {
      landmarks,
      handedness,
      wrist,
      handScale,
      extended, // [T, I, M, R, P]
      dirX,
      dirY,
      thumbUp,
      thumbDown,
      indexMiddleSpread,
      thumbIndexDist,
      thumbMiddleDist,
      isFist: extended.every(v => v === 0),
      isOpen: extended.every(v => v === 1)
    };
  }

  classify(multiHandLandmarks, multiHandedness = []) {
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      this.resetHold();
      return null;
    }

    const handsCount = multiHandLandmarks.length;
    const hands = [];
    for (let i = 0; i < handsCount; i++) {
      const label = multiHandedness[i] ? multiHandedness[i].label : (i === 0 ? "Right" : "Left");
      hands.push(this.analyzeHand(multiHandLandmarks[i], label));
    }

    let prediction = null;

    // 1. Two-Handed Gestures
    if (handsCount >= 2) {
      prediction = this.classifyTwoHands(hands[0], hands[1]);
    }

    // 2. Single-Handed Gestures
    if (!prediction) {
      prediction = this.classifySingleHand(hands[0]);
    }

    // 3. Custom gestures check
    if (!prediction || prediction.confidence < 0.8) {
      const customMatch = this.matchCustomGestures(hands);
      if (customMatch && customMatch.confidence > (prediction ? prediction.confidence : 0.6)) {
        prediction = customMatch;
      }
    }

    return this.processHoldConfirmation(prediction);
  }

  classifyTwoHands(h1, h2) {
    const avgScale = (h1.handScale + h2.handScale) / 2;
    const wristDist = this.dist(h1.wrist, h2.wrist) / avgScale;
    const indexTipsDist = this.dist(h1.landmarks[8], h2.landmarks[8]) / avgScale;

    // 1. BOTH HANDS OPEN (10 FINGERS) - As featured on SignBridge Camera Feed!
    // Both hands open, facing camera with fingers pointing upward and palms spread
    if (
      h1.isOpen && h2.isOpen &&
      h1.dirY < -0.4 && h2.dirY < -0.4 &&
      wristDist > 1.8 && wristDist < 4.5
    ) {
      return {
        sign: "open hands",
        label: "Hello / All (10 Fingers)",
        telugu: "నమస్కారం / అందరూ",
        hindi: "नमस्ते / सब",
        confidence: 0.96,
        type: "phrase"
      };
    }

    // 2. NAMASTE (Palms together vertical in pranam)
    if (
      h1.extended.slice(1).every(v => v === 1) &&
      h2.extended.slice(1).every(v => v === 1) &&
      wristDist < 2.0 &&
      indexTipsDist < 1.3 &&
      h1.dirY < -0.4 && h2.dirY < -0.4
    ) {
      return {
        sign: "namaste",
        label: "Namaste (Hello)",
        telugu: "నమస్తే",
        hindi: "नमस्ते",
        confidence: 0.98,
        type: "phrase"
      };
    }

    // 3. RAILWAY / TRAIN (Tracks posture)
    // Both hands have index and middle extended together (other fingers folded)
    // One sliding over the other like a train on tracks
    const h1Track = (h1.extended[1] === 1 && h1.extended[2] === 1 && h1.extended[3] === 0 && h1.extended[4] === 0);
    const h2Track = (h2.extended[1] === 1 && h2.extended[2] === 1 && h2.extended[3] === 0 && h2.extended[4] === 0);
    if (h1Track && h2Track) {
      const midDist = this.dist(h1.landmarks[9], h2.landmarks[9]) / avgScale;
      if (midDist < 2.2) {
        return {
          sign: "railway",
          label: "Railway / Train",
          telugu: "రైల్వే / రైలు",
          hindi: "रेलवे / ट्रेन",
          confidence: 0.94,
          type: "phrase"
        };
      }
    }

    // 4. TIME / TIMINGS (Index finger tapping opposite wrist)
    const pointingH = (h1.extended[1] === 1 && h1.extended[2] === 0) ? h1 :
                      ((h2.extended[1] === 1 && h2.extended[2] === 0) ? h2 : null);
    const baseH = pointingH === h1 ? h2 : h1;

    if (pointingH && baseH) {
      const indexToWristDist = this.dist(pointingH.landmarks[8], baseH.wrist) / avgScale;
      if (indexToWristDist < 1.0) {
        return {
          sign: "time",
          label: "Railway Timings / Time",
          telugu: "రైలు సమయం",
          hindi: "समय",
          confidence: 0.95,
          type: "phrase"
        };
      }
    }

    // 5. DOCTOR / HOSPITAL (Pulse check on wrist)
    const twoFingerH = (h1.extended[1] === 1 && h1.extended[2] === 1 && h1.extended[3] === 0 && h1.extended[4] === 0) ? h1 :
                       ((h2.extended[1] === 1 && h2.extended[2] === 1 && h2.extended[3] === 0 && h2.extended[4] === 0) ? h2 : null);
    if (twoFingerH) {
      const otherH = twoFingerH === h1 ? h2 : h1;
      const pulseDist = this.dist(twoFingerH.landmarks[8], otherH.wrist) / avgScale;
      if (pulseDist < 1.1) {
        return {
          sign: "doctor",
          label: "Doctor / Hospital",
          telugu: "వైద్యుడు / ఆసుపత్రి",
          hindi: "डॉक्टर / अस्पताल",
          confidence: 0.93,
          type: "phrase"
        };
      }
    }

    // 6. HELP (Fist on flat open palm)
    const flatH = h1.isOpen ? h1 : (h2.isOpen ? h2 : null);
    const fistH = (h1.isFist || (h1.extended[0] === 1 && h1.extended.slice(1).every(v => v === 0))) ? h1 :
                  ((h2.isFist || (h2.extended[0] === 1 && h2.extended.slice(1).every(v => v === 0))) ? h2 : null);

    if (flatH && fistH && flatH !== fistH && wristDist < 2.3) {
      return {
        sign: "help",
        label: "Help / Assistance",
        telugu: "సహాయం",
        hindi: "मदद",
        confidence: 0.94,
        type: "phrase"
      };
    }

    // 7. HOUSE / HOME (Inverted V roof)
    if (
      h1.extended.slice(1).every(v => v === 1) &&
      h2.extended.slice(1).every(v => v === 1) &&
      indexTipsDist < 1.0 &&
      wristDist > 1.8
    ) {
      return {
        sign: "house",
        label: "House / Home",
        telugu: "ఇల్లు",
        hindi: "घर",
        confidence: 0.92,
        type: "phrase"
      };
    }

    // 8. BOOK / READ (Both open flat palms opening side-by-side)
    if (
      h1.isOpen && h2.isOpen &&
      h1.dirY < 0.2 && h2.dirY < 0.2 &&
      wristDist < 1.8 && indexTipsDist < 2.0
    ) {
      return {
        sign: "book",
        label: "Book / Read",
        telugu: "పుస్తకం / చదవడం",
        hindi: "किताब / पढ़ना",
        confidence: 0.94,
        type: "phrase"
      };
    }

    // 9. WRITE (Pen scribbling on flat palm)
    const writingH = (h1.thumbIndexDist < 0.5 && h1.extended[3] === 0) ? h1 :
                     ((h2.thumbIndexDist < 0.5 && h2.extended[3] === 0) ? h2 : null);
    const paperH = writingH === h1 ? h2 : (writingH === h2 ? h1 : null);
    if (writingH && paperH && paperH.isOpen) {
      const penToPaperDist = this.dist(writingH.landmarks[8], paperH.landmarks[9]) / avgScale;
      if (penToPaperDist < 1.2) {
        return {
          sign: "write",
          label: "Write / Note",
          telugu: "రాయడం",
          hindi: "लिखना",
          confidence: 0.93,
          type: "phrase"
        };
      }
    }

    // 10. STAND (Two fingers standing upright on flat opposite palm)
    const standingH = (h1.extended[1] === 1 && h1.extended[2] === 1 && h1.extended[3] === 0 && h1.extended[4] === 0 && h1.dirY > 0.2) ? h1 :
                      ((h2.extended[1] === 1 && h2.extended[2] === 1 && h2.extended[3] === 0 && h2.extended[4] === 0 && h2.dirY > 0.2) ? h2 : null);
    const standBaseH = standingH === h1 ? h2 : (standingH === h2 ? h1 : null);
    if (standingH && standBaseH && standBaseH.isOpen) {
      const feetToPalmDist = this.dist(standingH.landmarks[8], standBaseH.landmarks[9]) / avgScale;
      if (feetToPalmDist < 1.1) {
        return {
          sign: "stand",
          label: "Stand Up",
          telugu: "నిలబడండి",
          hindi: "खड़े हो जाओ",
          confidence: 0.92,
          type: "phrase"
        };
      }
    }

    // 11. WASH (Palms rubbing together)
    if (h1.isOpen && h2.isOpen && wristDist < 1.5 && indexTipsDist < 1.0) {
      return {
        sign: "wash",
        label: "Wash Hands / Clean",
        telugu: "కడుక్కోవడం",
        hindi: "धोना",
        confidence: 0.90,
        type: "phrase"
      };
    }

    // 12. WHERE (Both open palms facing up)
    if (h1.isOpen && h2.isOpen && h1.dirY > -0.2 && h2.dirY > -0.2 && wristDist > 1.6) {
      return {
        sign: "where",
        label: "Where / Which Station?",
        telugu: "ఎక్కడ / ఏ స్టేషన్?",
        hindi: "कहाँ?",
        confidence: 0.89,
        type: "phrase"
      };
    }

    // 13. SIT (Two fingers resting over opposite two fingers)
    if (h1Track && h2Track) {
      const vertDist = Math.abs(h1.wrist.y - h2.wrist.y) / avgScale;
      const horizDist = Math.abs(h1.wrist.x - h2.wrist.x) / avgScale;
      if (vertDist > 0.3 && vertDist < 2.0 && horizDist < 1.6) {
        return {
          sign: "sit",
          label: "Sit / Have a seat",
          telugu: "కూర్చోండి",
          hindi: "बैठिए",
          confidence: 0.91,
          type: "phrase"
        };
      }
    }

    // 14. TEA / CHAI (Saucer and dipped cup)
    const saucerH = h1.isOpen ? h1 : (h2.isOpen ? h2 : null);
    const cupH = (h1.thumbIndexDist < 0.48 && h1.extended[3] === 0) ? h1 :
                 ((h2.thumbIndexDist < 0.48 && h2.extended[3] === 0) ? h2 : null);
    if (saucerH && cupH && saucerH !== cupH && wristDist < 2.0 && cupH.wrist.y < saucerH.wrist.y) {
      return {
        sign: "tea",
        label: "Tea / Chai",
        telugu: "టీ / చాయ్",
        hindi: "चाय",
        confidence: 0.90,
        type: "phrase"
      };
    }

    return null;
  }

  classifySingleHand(h) {
    const ext = h.extended;

    // 1. EAT / FOOD (Fingertips bunched together in eating gesture)
    if (h.thumbIndexDist < 0.45 && h.thumbMiddleDist < 0.55 && (ext.every(v => v === 0) || (ext[0] === 0 && ext[1] === 0 && ext[2] === 0))) {
      return {
        sign: "eat",
        label: "Eat / Food",
        telugu: "ఆహారం / భోజనం",
        hindi: "खाना",
        confidence: 0.95,
        type: "phrase"
      };
    }

    // 2. SLEEP / REST (Flat hand tilted against cheek/ear)
    if (ext.every(v => v === 1) && Math.abs(h.dirX) > 0.5) {
      return {
        sign: "sleep",
        label: "Sleep / Rest",
        telugu: "నిద్ర / విశ్రాంతి",
        hindi: "सोना / आराम",
        confidence: 0.92,
        type: "phrase"
      };
    }

    // 3. LISTEN / HEAR (Hand or index near ear)
    if (ext[1] === 1 && ext[2] === 0 && ext[3] === 0 && ext[4] === 0 && h.wrist.y < 0.5) {
      return {
        sign: "listen",
        label: "Listen / Hear",
        telugu: "వినండి",
        hindi: "सुनो",
        confidence: 0.91,
        type: "phrase"
      };
    }

    // 1. OK / PERFECT MUDRA (Thumb and index touching in circle, other 3 extended)
    if (h.thumbIndexDist < 0.4 && ext[2] === 1 && ext[3] === 1 && ext[4] === 1) {
      return {
        sign: "ok",
        label: "OK / All Good / Fine",
        telugu: "సరే / బాగుంది",
        hindi: "ठीक है",
        confidence: 0.96,
        type: "phrase"
      };
    }

    // 2. GOOD (Thumbs Up)
    if (ext[0] === 1 && ext[1] === 0 && ext[2] === 0 && ext[3] === 0 && ext[4] === 0 && h.thumbUp) {
      return {
        sign: "good",
        label: "Good / Superb",
        telugu: "బాగుంది",
        hindi: "अच्छा",
        confidence: 0.96,
        type: "phrase"
      };
    }

    // 3. BAD (Thumbs Down)
    if (ext[0] === 1 && ext[1] === 0 && ext[2] === 0 && ext[3] === 0 && ext[4] === 0 && h.thumbDown) {
      return {
        sign: "bad",
        label: "Bad / Not Good",
        telugu: "బాగాలేదు",
        hindi: "खराब",
        confidence: 0.95,
        type: "phrase"
      };
    }

    // 4. PEACE / VICTORY (V sign)
    if (ext[0] === 0 && ext[1] === 1 && ext[2] === 1 && ext[3] === 0 && ext[4] === 0 && h.indexMiddleSpread > 0.4) {
      return {
        sign: "peace",
        label: "Peace / Victory (V)",
        telugu: "శాంతి",
        hindi: "शांति",
        confidence: 0.96,
        type: "phrase"
      };
    }

    // 5. I LOVE YOU
    if (ext[0] === 1 && ext[1] === 1 && ext[2] === 0 && ext[3] === 0 && ext[4] === 1) {
      return {
        sign: "love",
        label: "I Love You",
        telugu: "ఐ లవ్ యు",
        hindi: "आई लव यू",
        confidence: 0.97,
        type: "phrase"
      };
    }

    // 6. CALL ME / PHONE
    if (ext[0] === 1 && ext[1] === 0 && ext[2] === 0 && ext[3] === 0 && ext[4] === 1) {
      return {
        sign: "call",
        label: "Call Me",
        telugu: "కాల్ చేయండి",
        hindi: "कॉल करें",
        confidence: 0.96,
        type: "phrase"
      };
    }

    // 7. STOP / WAIT (Open palm forward)
    if (ext.every(v => v === 1) && h.dirY < -0.4) {
      return {
        sign: "stop",
        label: "Stop / Wait",
        telugu: "ఆగండి",
        hindi: "रुको",
        confidence: 0.93,
        type: "phrase"
      };
    }

    // 8. WATER (W shape)
    if (ext[0] === 0 && ext[1] === 1 && ext[2] === 1 && ext[3] === 1 && ext[4] === 0) {
      return {
        sign: "water",
        label: "Water / Drink",
        telugu: "మంచినీళ్లు",
        hindi: "पानी",
        confidence: 0.94,
        type: "phrase"
      };
    }

    // 9. MONEY / COST (Thumb rubbing index & middle)
    if (ext[0] === 1 && ext[1] === 1 && ext[2] === 1 && ext[3] === 0 && ext[4] === 0 && h.thumbIndexDist < 0.45) {
      return {
        sign: "money",
        label: "Money / Ticket Fare",
        telugu: "డబ్బు / ధర",
        hindi: "किराया / पैसे",
        confidence: 0.91,
        type: "phrase"
      };
    }

    // 10. YES (Closed fist)
    if (h.isFist) {
      return {
        sign: "yes",
        label: "Yes / Agreed",
        telugu: "అవును",
        hindi: "हाँ",
        confidence: 0.88,
        type: "phrase"
      };
    }

    // 11. YOU / 1
    if (ext[0] === 0 && ext[1] === 1 && ext[2] === 0 && ext[3] === 0 && ext[4] === 0 && h.dirY <= 0.4) {
      return {
        sign: "you",
        label: "You",
        telugu: "మీరు",
        hindi: "आप",
        confidence: 0.88,
        type: "phrase"
      };
    }

    // 12. LOOK / SEE (V sign pointing forward near eye level)
    if (ext[0] === 0 && ext[1] === 1 && ext[2] === 1 && ext[3] === 0 && ext[4] === 0 && h.wrist.y < 0.55 && h.dirY > -0.3) {
      return {
        sign: "look",
        label: "Look / See",
        telugu: "చూడండి",
        hindi: "देखिए",
        confidence: 0.91,
        type: "phrase"
      };
    }

    // 13. ME / I (Index pointing toward chest)
    if (ext[0] === 0 && ext[1] === 1 && ext[2] === 0 && ext[3] === 0 && ext[4] === 0 && h.dirY > 0.4) {
      return {
        sign: "me",
        label: "Me / I",
        telugu: "నేను",
        hindi: "मैं",
        confidence: 0.89,
        type: "phrase"
      };
    }

    // 14. TOILET / RESTROOM
    if (ext[0] === 1 && ext[1] === 0 && ext[2] === 0 && ext[3] === 0 && ext[4] === 0 && !h.thumbUp && !h.thumbDown) {
      return {
        sign: "toilet",
        label: "Toilet / Restroom",
        telugu: "మరుగుదొడ్డి / వాష్‌రూమ్",
        hindi: "शौचालय",
        confidence: 0.90,
        type: "phrase"
      };
    }

    return null;
  }

  matchCustomGestures(hands) {
    if (Object.keys(this.customGestures).length === 0) return null;
    const currentVector = this.extractFeatureVector(hands);
    let bestMatch = null;
    let highestSim = -1;

    for (const [name, targetVector] of Object.entries(this.customGestures)) {
      const sim = this.cosineSimilarity(currentVector, targetVector);
      if (sim > highestSim && sim > 0.82) {
        highestSim = sim;
        bestMatch = {
          sign: name,
          label: name,
          confidence: Math.min(0.99, sim),
          type: "custom"
        };
      }
    }
    return bestMatch;
  }

  extractFeatureVector(hands) {
    const vector = [];
    for (let h = 0; h < 2; h++) {
      if (hands[h]) {
        vector.push(...hands[h].extended);
        vector.push(hands[h].dirX, hands[h].dirY);
        for (let i = 1; i < 21; i++) {
          vector.push(
            (hands[h].landmarks[i].x - hands[h].wrist.x) / hands[h].handScale,
            (hands[h].landmarks[i].y - hands[h].wrist.y) / hands[h].handScale
          );
        }
      } else {
        for (let i = 0; i < 47; i++) vector.push(0);
      }
    }
    return vector;
  }

  cosineSimilarity(v1, v2) {
    if (v1.length !== v2.length) return 0;
    let dot = 0, mag1 = 0, mag2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      mag1 += v1[i] * v1[i];
      mag2 += v2[i] * v2[i];
    }
    if (mag1 === 0 || mag2 === 0) return 0;
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  processHoldConfirmation(prediction) {
    const now = Date.now();
    if (!prediction) {
      this.resetHold();
      return null;
    }

    this.history.push(prediction.sign);
    if (this.history.length > this.historySize) this.history.shift();

    const counts = {};
    for (const s of this.history) counts[s] = (counts[s] || 0) + 1;
    const dominantSign = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    if (counts[dominantSign] < Math.floor(this.historySize * 0.6)) {
      return { ...prediction, isHolding: false, holdProgress: 0, confirmed: false };
    }

    if (this.currentGesture !== dominantSign) {
      this.currentGesture = dominantSign;
      this.holdStartTime = now;
    }

    const elapsed = now - this.holdStartTime;
    const holdProgress = Math.min(1.0, elapsed / this.holdDurationNeeded);

    let confirmed = false;
    if (
      holdProgress >= 1.0 &&
      (this.lastConfirmedGesture !== dominantSign || (now - this.lastConfirmTime > this.debounceTime))
    ) {
      confirmed = true;
      this.lastConfirmedGesture = dominantSign;
      this.lastConfirmTime = now;
      this.resetHold();
    }

    return { ...prediction, isHolding: true, holdProgress, confirmed };
  }

  resetHold() {
    this.currentGesture = null;
    this.holdStartTime = null;
  }
}

if (typeof window !== "undefined") {
  window.ISLClassifier = ISLClassifier;
}
