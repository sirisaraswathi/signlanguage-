/**
 * High-Clarity Indian Sign Language (ISL) Visualizer Engine
 * Replaces blurry 3D character avatars with razor-sharp, high-contrast,
 * anatomical vector hand graphics, explicit Left vs Right hand color coding,
 * joint articulation, animated motion trajectories, contact points,
 * and comprehensive coverage for words and all A-Z manual alphabet letters.
 */

class SignVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    this.sequence = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.speed = 1.0;
    this.animationFrameId = null;

    this.startTime = 0;
    this.durationPerWord = 2200; // ms per sign for clear, readable comprehension
    this.durationPerLetter = 1200; // ms per fingerspelled letter

    // Active visual state
    this.stageState = {
      title: "Sign Language Stage",
      subtitle: "Waiting for text, voice, or sign input...",
      tip: "Type a message below or use camera feed to see ISL signs clearly.",
      left: { visible: false, x: 0.35, y: 0.52, rot: 0, scale: 1.15, shape: "open_palm_forward" },
      right: { visible: true, x: 0.50, y: 0.52, rot: 0, scale: 1.25, shape: "open_palm_forward" },
      arrows: [],
      ripples: [],
      effects: [],
      contactPoints: []
    };

    this.onProgress = null;

    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());

    this.renderNeutral();
    this.startLoop();
  }

  handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(2, window.devicePixelRatio || 1);
    const w = rect.width || 560;
    const h = rect.height || 360;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    if (this.ctx) {
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    }
  }

  loadSequence(glossItems) {
    this.sequence = [];
    if (!glossItems || glossItems.length === 0) {
      this.currentIndex = 0;
      this.isPlaying = false;
      this.renderNeutral();
      return;
    }

    for (const item of glossItems) {
      if (item.type === "word") {
        this.sequence.push({
          type: "word",
          key: item.key,
          gloss: item.gloss,
          english: item.english,
          telugu: item.telugu || "",
          hindi: item.hindi || "",
          description: item.data ? item.data.description : "",
          tips: item.data ? item.data.tips : "",
          hands: item.data ? item.data.hands : 1,
          poseData: item.data ? item.data.poseData : null,
          duration: this.durationPerWord
        });
      } else if (item.type === "fingerspell") {
        for (const char of item.letters) {
          const letterInfo = window.ISL_ALPHABET ? window.ISL_ALPHABET[char] : null;
          this.sequence.push({
            type: "letter",
            char: char,
            word: item.word,
            gloss: `LETTER ${char}`,
            english: `Letter ${char} (in "${item.word}")`,
            description: letterInfo ? letterInfo.description : `Fingerspell letter ${char}`,
            tips: letterInfo ? letterInfo.tips : "",
            hands: letterInfo ? letterInfo.hands : 1,
            letterInfo: letterInfo,
            duration: this.durationPerLetter
          });
        }
      }
    }

    this.currentIndex = 0;
    this.isPlaying = true;
    this.startTime = performance.now();
  }

  play() {
    if (this.sequence.length === 0) return;
    this.isPlaying = true;
    this.startTime = performance.now();
  }

  pause() {
    this.isPlaying = false;
  }

  replay() {
    if (this.sequence.length === 0) return;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.startTime = performance.now();
  }

  setSpeed(s) {
    this.speed = Math.max(0.4, Math.min(2.0, s));
  }

  next() {
    if (this.currentIndex < this.sequence.length - 1) {
      this.currentIndex++;
      this.startTime = performance.now();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.startTime = performance.now();
    }
  }

  goToIndex(idx) {
    if (idx >= 0 && idx < this.sequence.length) {
      this.currentIndex = idx;
      this.startTime = performance.now();
      this.isPlaying = true;
    }
  }

  startLoop() {
    const loop = () => {
      const now = performance.now();

      if (this.isPlaying && this.sequence.length > 0) {
        const currentItem = this.sequence[this.currentIndex];
        const effectiveDuration = (currentItem ? currentItem.duration : 2000) / this.speed;
        const elapsed = now - this.startTime;
        const progress = Math.min(1.0, elapsed / effectiveDuration);

        this.computePose(currentItem, progress);
        this.render(currentItem, progress);

        if (this.onProgress) {
          this.onProgress({
            currentIndex: this.currentIndex,
            totalItems: this.sequence.length,
            currentItem,
            progress,
            finished: false,
            sequence: this.sequence
          });
        }

        if (progress >= 1.0) {
          if (this.currentIndex < this.sequence.length - 1) {
            this.currentIndex++;
            this.startTime = performance.now();
          } else {
            this.isPlaying = false;
            if (this.onProgress) {
              this.onProgress({
                currentIndex: this.currentIndex,
                totalItems: this.sequence.length,
                currentItem,
                progress: 1.0,
                finished: true,
                sequence: this.sequence
              });
            }
          }
        }
      } else {
        this.render();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  computePose(item, progress) {
    if (!item) {
      this.renderNeutral();
      return;
    }

    const key = (item.key || "").toLowerCase();
    const isLetter = item.type === "letter";
    const wave = Math.sin(progress * Math.PI);
    const bounce = Math.sin(progress * Math.PI * 4);
    const progressLoop = Math.sin(progress * Math.PI * 2);

    let left = { visible: false, x: 0.35, y: 0.52, rot: 0, scale: 1.15, shape: "open_palm_forward" };
    let right = { visible: true, x: 0.50, y: 0.52, rot: 0, scale: 1.25, shape: "open_palm_forward" };
    let arrows = [];
    let ripples = [];
    let effects = [];
    let contactPoints = [];

    let title = item.gloss || "ISL Sign";
    let subtitle = item.english || "";
    if (item.telugu) subtitle += ` | ${item.telugu}`;
    let tip = item.tips || item.description || "";

    // -------------------------------------------------------------
    // A. Alphabet Letters (A - Z)
    // -------------------------------------------------------------
    if (isLetter) {
      const char = item.char;
      const letterData = item.letterInfo || (window.ISL_ALPHABET ? window.ISL_ALPHABET[char] : null);
      title = `ALPHABET: LETTER "${char}"`;
      subtitle = `Fingerspelling in "${item.word}" (ISL Manual Alphabet)`;
      tip = letterData ? letterData.description : `Form letter ${char} with hand posture.`;

      if (letterData && letterData.hands === 2) {
        left = {
          visible: true,
          x: letterData.left.x,
          y: letterData.left.y,
          rot: letterData.left.rot || 0,
          scale: 1.15,
          shape: letterData.left.shape
        };
        right = {
          visible: true,
          x: letterData.right.x,
          y: letterData.right.y + 0.02 * bounce,
          rot: letterData.right.rot || 0,
          scale: 1.15,
          shape: letterData.right.shape
        };
        contactPoints = [{ x: (left.x + right.x) / 2, y: (left.y + right.y) / 2, r: 12 + 6 * wave }];
      } else if (letterData) {
        left.visible = false;
        right = {
          visible: true,
          x: letterData.right.x,
          y: letterData.right.y + 0.02 * bounce,
          rot: letterData.right.rot || 0,
          scale: 1.25,
          shape: letterData.right.shape
        };
      }
    }
    // -------------------------------------------------------------
    // B. Word Signs
    // -------------------------------------------------------------
    else {
      switch (key) {
        // 1. EAT / FOOD
        case "eat":
        case "food":
        case "meal":
        case "meals":
        case "hungry":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50,
            y: 0.62 - 0.20 * progress, // Hand moves upward towards mouth
            rot: -12 * (Math.PI / 180),
            scale: 1.25,
            shape: "pinched_food"
          };
          arrows = [{ from: { x: 0.50, y: 0.65 }, to: { x: 0.50, y: 0.38 }, label: "Bring food to mouth" }];
          effects = [{ type: "mouth_target", x: 0.50, y: 0.32, label: "Mouth / Lips" }];
          contactPoints = [{ x: 0.50, y: 0.38, r: 14 * progress }];
          break;

        // 2. DRINK / WATER
        case "drink":
        case "water":
        case "thirsty":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52,
            y: 0.60 - 0.18 * progress,
            rot: -35 * (Math.PI / 180) * progress, // Cup tilts upward toward lips
            scale: 1.25,
            shape: "cup_drink"
          };
          arrows = [{ from: { x: 0.52, y: 0.62 }, to: { x: 0.50, y: 0.38 }, label: "Tilt glass to lips" }];
          effects = [{ type: "water_wave", x: 0.50, y: 0.34 }];
          break;

        // 3. TEA / COFFEE
        case "tea":
        case "chai":
        case "coffee":
          left = { visible: true, x: 0.44, y: 0.58, rot: 0, scale: 1.15, shape: "flat_horizontal" };
          right = {
            visible: true,
            x: 0.54,
            y: 0.46 + 0.06 * bounce, // Dipping/stirring tea motion
            rot: 0,
            scale: 1.2,
            shape: "pinched_food"
          };
          arrows = [{ from: { x: 0.54, y: 0.42 }, to: { x: 0.54, y: 0.54 }, label: "Stir / Dip tea" }];
          ripples = [{ x: 0.44, y: 0.58, r: 16 + 8 * Math.abs(bounce) }];
          break;

        // 4. NAMASTE / HELLO / PRANAM
        case "namaste":
        case "hello":
        case "hi":
        case "greetings":
          // Two palms pressed flat together vertically in front of chest
          left = {
            visible: true,
            x: 0.50 - 0.16 * (1 - progress * 0.85),
            y: 0.52,
            rot: 8 * (Math.PI / 180),
            scale: 1.2,
            shape: "flat_vertical"
          };
          right = {
            visible: true,
            x: 0.50 + 0.16 * (1 - progress * 0.85),
            y: 0.52,
            rot: -8 * (Math.PI / 180),
            scale: 1.2,
            shape: "flat_vertical"
          };
          arrows = [
            { from: { x: 0.32, y: 0.52 }, to: { x: 0.44, y: 0.52 }, label: "Press palms" },
            { from: { x: 0.68, y: 0.52 }, to: { x: 0.56, y: 0.52 }, label: "Together" }
          ];
          contactPoints = [{ x: 0.50, y: 0.52, r: 16 * wave }];
          break;

        // 5. RAILWAY / TRAIN
        case "railway":
        case "train":
          // Left hand stationary tracks, right hand gliding forward
          left = {
            visible: true,
            x: 0.44,
            y: 0.58,
            rot: 0,
            scale: 1.2,
            shape: "track_horizontal"
          };
          right = {
            visible: true,
            x: 0.32 + 0.38 * progress, // Glides forward along tracks
            y: 0.54,
            rot: -12 * (Math.PI / 180),
            scale: 1.2,
            shape: "track_horizontal"
          };
          arrows = [{ from: { x: 0.32, y: 0.48 }, to: { x: 0.70, y: 0.48 }, label: "Train gliding on tracks" }];
          effects = [{ type: "track_line", x1: 0.25, y1: 0.58, x2: 0.75, y2: 0.58 }];
          contactPoints = [{ x: right.x, y: 0.56, r: 10 }];
          break;

        // 6. STATION / PLATFORM
        case "station":
        case "platform":
          left = { visible: true, x: 0.44, y: 0.60, rot: 0, scale: 1.2, shape: "flat_horizontal" };
          right = {
            visible: true,
            x: 0.52,
            y: 0.38 + 0.16 * progress, // Bringing feet/legs down onto platform
            rot: 0,
            scale: 1.2,
            shape: "stand_legs"
          };
          arrows = [{ from: { x: 0.52, y: 0.38 }, to: { x: 0.52, y: 0.56 }, label: "Stop at platform" }];
          contactPoints = [{ x: 0.48, y: 0.58, r: 16 * progress }];
          break;

        // 7. TIME / TIMINGS
        case "time":
        case "timings":
        case "clock":
        case "schedule":
          left = { visible: true, x: 0.44, y: 0.58, rot: 15 * (Math.PI / 180), scale: 1.2, shape: "flat_horizontal" };
          right = {
            visible: true,
            x: 0.54,
            y: 0.50 + 0.05 * bounce, // Index finger tapping wrist
            rot: -45 * (Math.PI / 180),
            scale: 1.2,
            shape: "pointing_down"
          };
          arrows = [{ from: { x: 0.56, y: 0.40 }, to: { x: 0.46, y: 0.56 }, label: "Tap wrist (watch)" }];
          ripples = [{ x: 0.45, y: 0.58, r: 18 + 12 * Math.abs(bounce) }];
          contactPoints = [{ x: 0.45, y: 0.58, r: 14 }];
          break;

        // 8. TICKET
        case "ticket":
          left = { visible: true, x: 0.42, y: 0.55, rot: 0, scale: 1.2, shape: "flat_vertical" };
          right = {
            visible: true,
            x: 0.56 - 0.08 * wave,
            y: 0.55,
            rot: -25 * (Math.PI / 180),
            scale: 1.2,
            shape: "track_horizontal"
          };
          arrows = [{ from: { x: 0.60, y: 0.55 }, to: { x: 0.48, y: 0.55 }, label: "Clip / Punch ticket" }];
          contactPoints = [{ x: 0.46, y: 0.55, r: 14 * wave }];
          break;

        // 9. TRAVEL / GO
        case "travel":
        case "traveling":
        case "go":
        case "going":
        case "journey":
          left.visible = false;
          right = {
            visible: true,
            x: 0.35 + 0.30 * progress, // Walking fingers moving forward
            y: 0.52 + 0.04 * bounce,
            rot: -15 * (Math.PI / 180),
            scale: 1.25,
            shape: "stand_legs"
          };
          arrows = [{ from: { x: 0.35, y: 0.45 }, to: { x: 0.68, y: 0.45 }, label: "Travel forward" }];
          break;

        // 10. WHERE
        case "where":
          left = {
            visible: true,
            x: 0.36 + 0.04 * progressLoop,
            y: 0.54,
            rot: 10 * (Math.PI / 180),
            scale: 1.2,
            shape: "flat_horizontal"
          };
          right = {
            visible: true,
            x: 0.64 - 0.04 * progressLoop,
            y: 0.54,
            rot: -10 * (Math.PI / 180),
            scale: 1.2,
            shape: "flat_horizontal"
          };
          arrows = [
            { from: { x: 0.34, y: 0.48 }, to: { x: 0.40, y: 0.48 }, label: "Palms up" },
            { from: { x: 0.66, y: 0.48 }, to: { x: 0.60, y: 0.48 }, label: "Inquire" }
          ];
          break;

        // 11. WHICH
        case "which":
          left = {
            visible: true,
            x: 0.38,
            y: 0.52 - 0.05 * Math.sin(progress * Math.PI * 2),
            rot: 0,
            scale: 1.2,
            shape: "thumbs_up"
          };
          right = {
            visible: true,
            x: 0.62,
            y: 0.52 + 0.05 * Math.sin(progress * Math.PI * 2),
            rot: 0,
            scale: 1.2,
            shape: "thumbs_up"
          };
          arrows = [{ from: { x: 0.50, y: 0.44 }, to: { x: 0.50, y: 0.58 }, label: "Weigh options" }];
          break;

        // 12. WHAT
        case "what":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52 + 0.05 * Math.sin(progress * Math.PI * 6), // Quick shake
            y: 0.50,
            rot: 0,
            scale: 1.25,
            shape: "pointing_index"
          };
          arrows = [{ from: { x: 0.46, y: 0.44 }, to: { x: 0.58, y: 0.44 }, label: "Questioning shake" }];
          break;

        // 13. INFORMATION / NEWS
        case "information":
        case "info":
          left = {
            visible: true,
            x: 0.46 - 0.15 * progress,
            y: 0.45 + 0.08 * progress,
            rot: -20 * (Math.PI / 180) * progress,
            scale: 1.2,
            shape: "open_palm_forward"
          };
          right = {
            visible: true,
            x: 0.54 + 0.15 * progress,
            y: 0.45 + 0.08 * progress,
            rot: 20 * (Math.PI / 180) * progress,
            scale: 1.2,
            shape: "open_palm_forward"
          };
          arrows = [{ from: { x: 0.50, y: 0.42 }, to: { x: 0.68, y: 0.54 }, label: "Share knowledge outward" }];
          break;

        // 14. WANT / NEED
        case "want":
        case "need":
        case "like":
          left = {
            visible: true,
            x: 0.40,
            y: 0.52 + 0.06 * progress, // Pulling towards chest
            rot: 15 * (Math.PI / 180),
            scale: 1.2,
            shape: "cup_drink"
          };
          right = {
            visible: true,
            x: 0.60,
            y: 0.52 + 0.06 * progress,
            rot: -15 * (Math.PI / 180),
            scale: 1.2,
            shape: "cup_drink"
          };
          arrows = [
            { from: { x: 0.40, y: 0.48 }, to: { x: 0.40, y: 0.58 }, label: "Pull towards you" },
            { from: { x: 0.60, y: 0.48 }, to: { x: 0.60, y: 0.58 }, label: "Want" }
          ];
          break;

        // 15. SLEEP / REST
        case "sleep":
        case "rest":
        case "tired":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52,
            y: 0.46,
            rot: -35 * (Math.PI / 180), // Tilted against cheek
            scale: 1.25,
            shape: "flat_vertical"
          };
          arrows = [{ from: { x: 0.46, y: 0.58 }, to: { x: 0.52, y: 0.44 }, label: "Rest on cheek" }];
          effects = [{ type: "zzz", x: 0.66, y: 0.35 + 0.03 * wave }];
          break;

        // 16. BOOK / READ
        case "book":
        case "read":
        case "study":
          left = {
            visible: true,
            x: 0.44 - 0.08 * progress,
            y: 0.55,
            rot: -25 * (Math.PI / 180) * progress,
            scale: 1.2,
            shape: "flat_vertical"
          };
          right = {
            visible: true,
            x: 0.56 + 0.08 * progress,
            y: 0.55,
            rot: 25 * (Math.PI / 180) * progress,
            scale: 1.2,
            shape: "flat_vertical"
          };
          arrows = [
            { from: { x: 0.48, y: 0.55 }, to: { x: 0.34, y: 0.52 }, label: "Open pages" },
            { from: { x: 0.52, y: 0.55 }, to: { x: 0.66, y: 0.52 }, label: "Open pages" }
          ];
          contactPoints = [{ x: 0.50, y: 0.58, r: 8 }];
          break;

        // 17. WRITE / NOTE
        case "write":
        case "note":
        case "pen":
          left = { visible: true, x: 0.42, y: 0.58, rot: 10 * (Math.PI / 180), scale: 1.2, shape: "flat_horizontal" };
          right = {
            visible: true,
            x: 0.36 + 0.16 * Math.sin(progress * Math.PI * 3), // Scribbling motion
            y: 0.54,
            rot: -30 * (Math.PI / 180),
            scale: 1.2,
            shape: "pen_grip"
          };
          arrows = [{ from: { x: 0.36, y: 0.46 }, to: { x: 0.54, y: 0.46 }, label: "Scribble on palm" }];
          contactPoints = [{ x: right.x, y: 0.56, r: 8 }];
          break;

        // 18. STAND
        case "stand":
          left = { visible: true, x: 0.48, y: 0.62, rot: 0, scale: 1.2, shape: "flat_horizontal" };
          right = {
            visible: true,
            x: 0.48,
            y: 0.58 - 0.10 * progress, // Standing upright
            rot: 0,
            scale: 1.2,
            shape: "stand_legs"
          };
          arrows = [{ from: { x: 0.48, y: 0.62 }, to: { x: 0.48, y: 0.44 }, label: "Stand upright" }];
          break;

        // 19. SIT
        case "sit":
        case "seat":
          left = { visible: true, x: 0.44, y: 0.58, rot: 0, scale: 1.2, shape: "track_horizontal" };
          right = {
            visible: true,
            x: 0.52,
            y: 0.46 + 0.08 * progress, // Lowering onto chair
            rot: 0,
            scale: 1.2,
            shape: "track_horizontal"
          };
          arrows = [{ from: { x: 0.52, y: 0.44 }, to: { x: 0.52, y: 0.56 }, label: "Have a seat" }];
          break;

        // 20. WASH / CLEAN
        case "wash":
        case "clean":
        case "bath":
          left = {
            visible: true,
            x: 0.44 + 0.05 * Math.sin(progress * Math.PI * 4),
            y: 0.54,
            rot: 15 * (Math.PI / 180),
            scale: 1.2,
            shape: "flat_vertical"
          };
          right = {
            visible: true,
            x: 0.56 - 0.05 * Math.sin(progress * Math.PI * 4),
            y: 0.54,
            rot: -15 * (Math.PI / 180),
            scale: 1.2,
            shape: "flat_vertical"
          };
          arrows = [{ from: { x: 0.40, y: 0.46 }, to: { x: 0.60, y: 0.46 }, label: "Rub hands together" }];
          ripples = [{ x: 0.50, y: 0.54, r: 18 + 10 * wave }];
          break;

        // 21. DOCTOR / HOSPITAL
        case "doctor":
        case "hospital":
        case "medicine":
        case "sick":
          left = { visible: true, x: 0.42, y: 0.58, rot: 15 * (Math.PI / 180), scale: 1.2, shape: "flat_horizontal" };
          right = {
            visible: true,
            x: 0.54,
            y: 0.52 + 0.04 * bounce,
            rot: -45 * (Math.PI / 180),
            scale: 1.2,
            shape: "track_horizontal"
          };
          arrows = [{ from: { x: 0.56, y: 0.42 }, to: { x: 0.46, y: 0.56 }, label: "Check wrist pulse" }];
          ripples = [{ x: 0.45, y: 0.58, r: 16 + 10 * Math.abs(bounce) }];
          contactPoints = [{ x: 0.45, y: 0.58, r: 12 }];
          break;

        // 22. MONEY / FARE / PRICE
        case "money":
        case "cash":
        case "fare":
        case "price":
        case "cost":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52,
            y: 0.52 + 0.03 * bounce,
            rot: 0,
            scale: 1.25,
            shape: "pen_grip"
          };
          arrows = [{ from: { x: 0.46, y: 0.52 }, to: { x: 0.58, y: 0.52 }, label: "Rub thumb on fingers" }];
          break;

        // 23. OK / PERFECT / FINE
        case "ok":
        case "okay":
        case "perfect":
        case "fine":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50,
            y: 0.52,
            rot: 0,
            scale: 1.3,
            shape: "ok_circle"
          };
          effects = [{ type: "ok_glow", x: 0.48, y: 0.52 }];
          break;

        // 24. GOOD
        case "good":
        case "great":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52,
            y: 0.52 - 0.04 * wave,
            rot: 0,
            scale: 1.3,
            shape: "thumbs_up"
          };
          arrows = [{ from: { x: 0.52, y: 0.60 }, to: { x: 0.52, y: 0.46 }, label: "Thumbs up (Good)" }];
          break;

        // 25. BAD
        case "bad":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52,
            y: 0.50 + 0.04 * wave,
            rot: Math.PI,
            scale: 1.3,
            shape: "thumbs_up"
          };
          arrows = [{ from: { x: 0.52, y: 0.44 }, to: { x: 0.52, y: 0.58 }, label: "Thumbs down (Bad)" }];
          break;

        // 26. YES
        case "yes":
        case "agree":
        case "correct":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52,
            y: 0.50 + 0.05 * bounce,
            rot: 0,
            scale: 1.25,
            shape: "fist"
          };
          arrows = [{ from: { x: 0.52, y: 0.42 }, to: { x: 0.52, y: 0.58 }, label: "Nod fist like head" }];
          break;

        // 27. NO
        case "no":
        case "not":
        case "dont":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52 + 0.04 * progressLoop,
            y: 0.50,
            rot: -15 * (Math.PI / 180),
            scale: 1.25,
            shape: "open_palm_forward"
          };
          arrows = [{ from: { x: 0.46, y: 0.48 }, to: { x: 0.58, y: 0.48 }, label: "Wave hand side-to-side" }];
          break;

        // 28. HELP / ASSIST
        case "help":
        case "assist":
        case "support":
          left = {
            visible: true,
            x: 0.48,
            y: 0.62 - 0.12 * progress,
            rot: 0,
            scale: 1.2,
            shape: "flat_horizontal"
          };
          right = {
            visible: true,
            x: 0.50,
            y: 0.52 - 0.12 * progress,
            rot: 0,
            scale: 1.2,
            shape: "thumbs_up"
          };
          arrows = [{ from: { x: 0.50, y: 0.68 }, to: { x: 0.50, y: 0.42 }, label: "Lift upward together" }];
          contactPoints = [{ x: 0.48, y: 0.58 - 0.12 * progress, r: 14 }];
          break;

        // 29. THANK YOU
        case "thank you":
        case "thanks":
        case "thank":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50 + 0.06 * progress,
            y: 0.44 + 0.16 * progress,
            rot: -20 * (Math.PI / 180) * progress,
            scale: 1.25,
            shape: "flat_vertical"
          };
          arrows = [{ from: { x: 0.50, y: 0.40 }, to: { x: 0.56, y: 0.62 }, label: "Extend forward from lips" }];
          break;

        // 30. STOP / WAIT
        case "stop":
        case "wait":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50,
            y: 0.50,
            rot: 0,
            scale: 1.35,
            shape: "open_palm_forward"
          };
          arrows = [{ from: { x: 0.50, y: 0.58 }, to: { x: 0.50, y: 0.46 }, label: "Hold palm forward firmly" }];
          break;

        // 31. YOU
        case "you":
        case "your":
          left.visible = false;
          right = {
            visible: true,
            x: 0.52 + 0.05 * progress,
            y: 0.50,
            rot: -15 * (Math.PI / 180),
            scale: 1.25,
            shape: "pointing_index"
          };
          arrows = [{ from: { x: 0.48, y: 0.50 }, to: { x: 0.60, y: 0.50 }, label: "Point toward opposite person" }];
          break;

        // 32. ME / I
        case "me":
        case "i":
        case "my":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50,
            y: 0.52 + 0.04 * wave,
            rot: 1.5, // Pointing towards body
            scale: 1.25,
            shape: "pointing_index"
          };
          arrows = [{ from: { x: 0.50, y: 0.42 }, to: { x: 0.50, y: 0.56 }, label: "Point towards own chest" }];
          break;

        // 33. HOUSE / HOME
        case "house":
        case "home":
          left = { visible: true, x: 0.42, y: 0.48, rot: 25 * (Math.PI / 180), scale: 1.2, shape: "roof_shape" };
          right = { visible: true, x: 0.58, y: 0.48, rot: -25 * (Math.PI / 180), scale: 1.2, shape: "roof_shape" };
          contactPoints = [{ x: 0.50, y: 0.40, r: 12 }];
          arrows = [
            { from: { x: 0.36, y: 0.55 }, to: { x: 0.48, y: 0.42 }, label: "Roof peak" },
            { from: { x: 0.64, y: 0.55 }, to: { x: 0.52, y: 0.42 }, label: "Roof peak" }
          ];
          break;

        // 34. LISTEN / HEAR
        case "listen":
        case "hear":
          left.visible = false;
          right = { visible: true, x: 0.54, y: 0.42, rot: 0, scale: 1.25, shape: "cup_ear" };
          effects = [{ type: "ear_target", x: 0.54, y: 0.38, label: "Ear" }];
          break;

        // 35. LOOK / SEE
        case "look":
        case "see":
        case "watch":
          left.visible = false;
          right = {
            visible: true,
            x: 0.48 + 0.12 * progress,
            y: 0.46,
            rot: -20 * (Math.PI / 180),
            scale: 1.25,
            shape: "track_horizontal"
          };
          arrows = [{ from: { x: 0.44, y: 0.46 }, to: { x: 0.64, y: 0.46 }, label: "Point 'V' from eyes forward" }];
          break;

        // 36. CALL / PHONE
        case "call":
        case "phone":
        case "mobile":
          left.visible = false;
          right = { visible: true, x: 0.54, y: 0.42, rot: -15 * (Math.PI / 180), scale: 1.25, shape: "phone_sign" };
          arrows = [{ from: { x: 0.54, y: 0.52 }, to: { x: 0.54, y: 0.42 }, label: "Hold phone to ear" }];
          break;

        // 37. TOILET / RESTROOM
        case "toilet":
        case "bathroom":
        case "washroom":
        case "restroom":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50 + 0.04 * Math.sin(progress * Math.PI * 6), // Gentle shake
            y: 0.50,
            rot: 0,
            scale: 1.25,
            shape: "fist"
          };
          arrows = [{ from: { x: 0.45, y: 0.50 }, to: { x: 0.55, y: 0.50 }, label: "Shake 'T' handshape gently" }];
          break;

        // 38. PEACE / VICTORY
        case "peace":
        case "victory":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50,
            y: 0.48 - 0.04 * wave,
            rot: 0,
            scale: 1.3,
            shape: "track_horizontal"
          };
          arrows = [{ from: { x: 0.50, y: 0.58 }, to: { x: 0.50, y: 0.44 }, label: "Raise 'V' for peace" }];
          break;

        // 39. LOVE / I LOVE YOU
        case "love":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50,
            y: 0.48 - 0.04 * wave,
            rot: 0,
            scale: 1.3,
            shape: "phone_sign"
          };
          effects = [{ type: "zzz", x: 0.50, y: 0.36 }]; // heart or warmth
          arrows = [{ from: { x: 0.50, y: 0.58 }, to: { x: 0.50, y: 0.44 }, label: "I Love You sign" }];
          break;

        // 40. WELCOME
        case "welcome":
          left.visible = false;
          right = {
            visible: true,
            x: 0.62 - 0.16 * progress,
            y: 0.50,
            rot: 15 * (Math.PI / 180) * progress,
            scale: 1.25,
            shape: "flat_vertical"
          };
          arrows = [{ from: { x: 0.64, y: 0.50 }, to: { x: 0.46, y: 0.50 }, label: "Sweep inward to welcome" }];
          break;

        // 41. PLEASE
        case "please":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50 + 0.06 * Math.sin(progress * Math.PI * 3),
            y: 0.52 + 0.06 * Math.cos(progress * Math.PI * 3),
            rot: 0,
            scale: 1.25,
            shape: "flat_vertical"
          };
          arrows = [{ from: { x: 0.44, y: 0.46 }, to: { x: 0.56, y: 0.58 }, label: "Rub chest in polite circle" }];
          break;

        // 42. SORRY
        case "sorry":
          left.visible = false;
          right = {
            visible: true,
            x: 0.50 + 0.06 * Math.sin(progress * Math.PI * 3),
            y: 0.52 + 0.06 * Math.cos(progress * Math.PI * 3),
            rot: 0,
            scale: 1.25,
            shape: "fist"
          };
          arrows = [{ from: { x: 0.44, y: 0.46 }, to: { x: 0.56, y: 0.58 }, label: "Rub fist on chest" }];
          break;

        // 43. OPEN HANDS / ATTENTION
        case "open hands":
        case "attention":
        case "all":
        default:
          left = { visible: true, x: 0.36, y: 0.50, rot: 0, scale: 1.25, shape: "open_palm_forward" };
          right = { visible: true, x: 0.64, y: 0.50, rot: 0, scale: 1.25, shape: "open_palm_forward" };
          break;
      }
    }

    this.stageState = {
      title,
      subtitle,
      tip,
      left,
      right,
      arrows,
      ripples,
      effects,
      contactPoints
    };
  }

  renderNeutral() {
    this.stageState = {
      title: "Sign Language Stage",
      subtitle: "Waiting for text, speech or signs...",
      tip: "Type in the input bar or use camera feed to see crystal-clear ISL postures.",
      left: { visible: false, x: 0.35, y: 0.52, rot: 0, scale: 1.15, shape: "open_palm_forward" },
      right: { visible: true, x: 0.50, y: 0.50, rot: 0, scale: 1.3, shape: "open_palm_forward" },
      arrows: [],
      ripples: [],
      effects: [],
      contactPoints: []
    };
  }

  render(item = null, progress = 0) {
    if (!this.ctx || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // High-contrast clean dark canvas backdrop (maximizes contrast for colored hands)
    const bgGrad = this.ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#070e24"); // Deep midnight navy
    bgGrad.addColorStop(1, "#0d1b3e");
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Subtle alignment grid
    this.drawDepthGrid(w, h);

    const { left, right, arrows, ripples, effects, contactPoints } = this.stageState;

    // Contact Points & Touch Highlights
    for (const cp of contactPoints) {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(251, 191, 36, 0.35)";
      this.ctx.strokeStyle = "#fbbf24";
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(cp.x * w, cp.y * h, cp.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Ripples
    for (const rip of ripples) {
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(rip.x * w, rip.y * h, rip.r, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // High-Clarity Vector Hands
    if (left && left.visible) {
      this.drawClearHand(left.x * w, left.y * h, left.scale, left.rot, left.shape, "left");
    }

    if (right && right.visible) {
      this.drawClearHand(right.x * w, right.y * h, right.scale, right.rot, right.shape, "right");
    }

    // Effects
    for (const eff of effects) {
      this.drawEffect(eff, w, h);
    }

    // Directional Trajectory Arrows
    for (const arr of arrows) {
      this.drawTrajectoryArrow(arr.from.x * w, arr.from.y * h, arr.to.x * w, arr.to.y * h, arr.label);
    }

    // Stage Top Header & Bottom Tip Pill
    this.drawStageHeader(w, h, item, progress);
  }

  drawDepthGrid(w, h) {
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
    this.ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Anatomical High-Clarity Vector Hand Renderer
   * Renders bold palms, individual articulated fingers, glowing knuckles,
   * wrist cuffs, and distinct Left (Cyan) vs Right (Blue) colors.
   */
  drawClearHand(cx, cy, scale, rot, shape, handSide) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    const s = 46 * scale;
    const isLeft = handSide === "left";

    // Palette:
    // Left Hand = Electric Cyan (#06b6d4)
    // Right Hand = Vibrant Royal Blue (#3b82f6)
    const primaryColor = isLeft ? "#06b6d4" : "#3b82f6";
    const lightColor = isLeft ? "#67e8f9" : "#93c5fd";
    const darkColor = isLeft ? "#083344" : "#1e1b4b";
    const fillColor = isLeft ? "rgba(6, 182, 212, 0.28)" : "rgba(59, 130, 246, 0.28)";
    const glowColor = isLeft ? "rgba(6, 182, 212, 0.9)" : "rgba(59, 130, 246, 0.9)";

    // Hand Glow
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;

    // Forearm & Wrist cuff
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-s * 0.35, s * 0.45, s * 0.7, s * 0.45, [4, 4, 8, 8]);
    ctx.fill();
    ctx.stroke();

    // Wrist watch / band indicator
    ctx.fillStyle = isLeft ? "#0891b2" : "#2563eb";
    ctx.fillRect(-s * 0.36, s * 0.50, s * 0.72, 5);

    // Palm base
    ctx.beginPath();
    ctx.roundRect(-s * 0.52, -s * 0.40, s * 1.04, s * 0.88, 14);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Palm Creases
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.05);
    ctx.quadraticCurveTo(0, s * 0.1, s * 0.3, -s * 0.1);
    ctx.stroke();

    // Hand Side Identification Badge (LEFT / RIGHT)
    ctx.shadowBlur = 0;
    ctx.fillStyle = lightColor;
    ctx.font = "bold 11px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isLeft ? "LEFT HAND" : "RIGHT HAND", 0, s * 0.82);

    // Knuckle Joints row
    const knuckleX = [-s * 0.33, -s * 0.11, s * 0.11, s * 0.33];
    for (const kx of knuckleX) {
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      ctx.arc(kx, -s * 0.36, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // -----------------------------------------------------------
    // Fingers according to posture shape
    // -----------------------------------------------------------
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    if (shape === "pinched_food") {
      // All fingertips gathered in tapered cone pointing up
      for (let i = 0; i < 4; i++) {
        const ang = -0.3 + i * 0.2;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.roundRect(-s * 0.1, -s * 1.0, s * 0.2, s * 0.7, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
      // Glowing food morsel at center
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, -s * 1.02, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "cup_drink") {
      // Curved C-shape fingers
      for (let i = 0; i < 4; i++) {
        const fy = -s * 0.3 + i * s * 0.18;
        ctx.beginPath();
        ctx.arc(s * 0.2, fy, s * 0.35, -Math.PI * 0.6, Math.PI * 0.6, false);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Thumb opposite
      ctx.beginPath();
      ctx.arc(-s * 0.25, -s * 0.1, s * 0.28, Math.PI * 0.3, Math.PI * 1.5, false);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.stroke();
    } else if (shape === "ok_circle") {
      // Golden circle loop between thumb and index
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.45, s * 0.26, 0, Math.PI * 2);
      ctx.stroke();

      // Middle, Ring, Pinky upright
      const fingers = [0.12, 0.32, 0.50];
      for (const fx of fingers) {
        ctx.beginPath();
        ctx.roundRect(fx * s, -s * 1.15, s * 0.17, s * 0.8, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else if (shape === "pointing_index" || shape === "pointing_down") {
      // Index extended straight, others closed
      const isDown = shape === "pointing_down";
      const dir = isDown ? 1 : -1;

      ctx.beginPath();
      ctx.roundRect(-s * 0.12, isDown ? 0 : -s * 1.25, s * 0.24, s * 0.95, 6);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Fingertip beam
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, isDown ? s * 0.95 : -s * 1.25, 5, 0, Math.PI * 2);
      ctx.fill();

      // Other 3 fingers closed
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.roundRect(s * 0.15 + i * s * 0.12, -s * 0.2, s * 0.15, s * 0.35, 4);
        ctx.fillStyle = primaryColor;
        ctx.fill();
      }
    } else if (shape === "track_horizontal" || shape === "stand_legs") {
      // Index & Middle straight, others folded
      for (let i = 0; i < 2; i++) {
        const ang = -0.1 + i * 0.2;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.roundRect(-s * 0.11, -s * 1.15, s * 0.22, s * 0.85, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.restore();
      }
      // Folded ring and pinky
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(s * 0.2, -s * 0.25, s * 0.24, s * 0.35, 4);
      ctx.fill();
    } else if (shape === "thumbs_up") {
      // Thumb extended up
      ctx.beginPath();
      ctx.roundRect(-s * 0.42, -s * 1.1, s * 0.26, s * 0.85, 7);
      ctx.fillStyle = "#4ade80"; // Bright Green Thumb
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Curled fist fingers
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.roundRect(-s * 0.12 + i * s * 0.14, -s * 0.25, s * 0.16, s * 0.4, 4);
        ctx.fillStyle = primaryColor;
        ctx.fill();
        ctx.stroke();
      }
    } else if (shape === "fist") {
      // Solid closed fist
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.roundRect(-s * 0.38 + i * s * 0.19, -s * 0.45, s * 0.18, s * 0.55, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      // Thumb crossed over
      ctx.beginPath();
      ctx.roundRect(-s * 0.45, -s * 0.15, s * 0.7, s * 0.22, 6);
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    } else if (shape === "flat_vertical" || shape === "roof_shape") {
      // 4 straight fingers held close together
      for (let i = 0; i < 4; i++) {
        const fx = -s * 0.33 + i * s * 0.22;
        const fLen = s * (i === 1 || i === 2 ? 1.18 : 1.05);
        ctx.beginPath();
        ctx.roundRect(fx, -fLen, s * 0.20, fLen * 0.75, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      // Thumb along edge
      ctx.beginPath();
      ctx.roundRect(-s * 0.52, -s * 0.5, s * 0.18, s * 0.6, 5);
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.stroke();
    } else if (shape === "flat_horizontal") {
      // Horizontal palm orientation
      for (let i = 0; i < 4; i++) {
        const fy = -s * 0.35 + i * s * 0.20;
        ctx.beginPath();
        ctx.roundRect(0, fy, s * 1.1, s * 0.18, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else if (shape === "phone_sign") {
      // Thumb and Pinky extended wide, middle 3 curled
      // Thumb
      ctx.beginPath();
      ctx.roundRect(-s * 0.65, -s * 0.6, s * 0.24, s * 0.7, 6);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Pinky
      ctx.beginPath();
      ctx.roundRect(s * 0.45, -s * 0.6, s * 0.22, s * 0.7, 6);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Middle 3 curled
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.roundRect(-s * 0.25 + i * s * 0.18, -s * 0.2, s * 0.16, s * 0.35, 4);
        ctx.fillStyle = primaryColor;
        ctx.fill();
      }
    } else {
      // Default: 5 open fingers spread out with high visual clarity
      const angles = [-0.55, -0.28, 0, 0.28, 0.55];
      const lengths = [0.82, 1.15, 1.25, 1.15, 0.92];

      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate(angles[i]);

        const fLen = s * lengths[i];
        ctx.beginPath();
        ctx.roundRect(-s * 0.11, -fLen, s * 0.22, fLen * 0.75, 5);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Glowing joint dot
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.arc(0, -fLen + 4, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    ctx.restore();
  }

  drawTrajectoryArrow(fromX, fromY, toX, toY, label) {
    const ctx = this.ctx;
    ctx.save();

    // Vibrant golden yellow motion path
    ctx.strokeStyle = "#fbbf24";
    ctx.fillStyle = "#fbbf24";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(251, 191, 36, 0.85)";
    ctx.shadowBlur = 14;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const headLen = 16;

    // Dashed animated path
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Action direction pill label
    if (label) {
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2 - 15;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(10, 17, 40, 0.92)";
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.8;
      ctx.font = "bold 11px 'Inter', sans-serif";
      const txtW = ctx.measureText(label).width;

      ctx.beginPath();
      ctx.roundRect(midX - txtW / 2 - 9, midY - 12, txtW + 18, 24, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.textAlign = "center";
      ctx.fillText(label, midX, midY + 4);
    }

    ctx.restore();
  }

  drawEffect(eff, w, h) {
    const ctx = this.ctx;
    ctx.save();

    if (eff.type === "mouth_target") {
      ctx.strokeStyle = "#f43f5e";
      ctx.fillStyle = "rgba(244, 63, 94, 0.25)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(eff.x * w, eff.y * h, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Mouth / Lips", eff.x * w, eff.y * h - 25);
    } else if (eff.type === "track_line") {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(eff.x1 * w, eff.y1 * h);
      ctx.lineTo(eff.x2 * w, eff.y2 * h);
      ctx.stroke();
    } else if (eff.type === "zzz") {
      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 24px 'Outfit', sans-serif";
      ctx.fillText("Zzz...", eff.x * w, eff.y * h);
    } else if (eff.type === "ok_glow") {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eff.x * w, eff.y * h, 36, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawStageHeader(w, h, item, progress) {
    const ctx = this.ctx;
    ctx.save();

    const title = this.stageState.title;
    const subtitle = this.stageState.subtitle;
    const tip = this.stageState.tip;

    // 1. Top Header Banner Card
    const cardW = Math.min(480, w - 24);
    const cardH = 56;
    const cardX = (w - cardW) / 2;
    const cardY = 12;

    ctx.fillStyle = "rgba(7, 14, 39, 0.92)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 15px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, w / 2, cardY + 23);

    // Subtitle
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.fillText(subtitle, w / 2, cardY + 44);

    // 2. Bottom Tip Banner (Action Instruction)
    if (tip) {
      const tipW = Math.min(520, w - 20);
      const tipH = 32;
      const tipX = (w - tipW) / 2;
      const tipY = h - 42;

      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(tipX, tipY, tipW, tipH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`💡 ${tip}`, w / 2, tipY + 20);
    }

    // 3. Timeline Progress Bar along the very bottom
    if (this.sequence.length > 0) {
      const pbY = h - 4;
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, pbY, w, 4);

      const total = this.sequence.length;
      const currentFraction = (this.currentIndex + progress) / Math.max(1, total);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, pbY, w * currentFraction, 4);
    }

    ctx.restore();
  }
}

if (typeof window !== "undefined") {
  window.SignVisualizer = SignVisualizer;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SignVisualizer };
}
