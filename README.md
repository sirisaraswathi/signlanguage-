# ISL Connect: Two-Way Indian Sign Language Translator

**ISL Connect** is a real-time, browser-native bi-directional communication application designed for seamless interaction between Deaf / Non-Verbal individuals and Hearing individuals using **Indian Sign Language (ISL)**.

---

## 🌟 Key Features

### 1. Deaf / Non-Verbal User $\longrightarrow$ Hearing User (Sign to Speech & Text)
- **Live 3D Hand Tracking**: Powered by MediaPipe Hands running locally in WebAssembly (60 FPS, zero cloud latency).
- **Two-Handed & One-Handed ISL Detection**:
  - **Namaste (Hello)**: Two hands flat vertical with palms touching in Pranam mudra.
  - **Thank You**: Hand moving forward-downward from chin.
  - **Welcome**: Both hands open sweeping inward.
  - **Yes / No**: Nodding fist / side-to-side finger wave.
  - **Help**: Fist on top of open flat palm lifting together.
  - **Good (Thumbs Up)** / **Bad (Thumbs Down)**.
  - **Peace / Victory (V)**.
  - **I Love You (ILY)**.
  - **Water (W)** / **Food & Eat**.
  - **Stop / Wait**: Open palm facing camera.
  - **Time (Watch)**: Index tapping opposite wrist.
  - **House / Home**: Both hands angled forming an inverted-V roof.
  - **ISL Two-Handed Alphabet (A, B, C, D, E, etc.)**.
- **Hold-to-Confirm Timer**: Hold a gesture for 0.75s to confirm and prevent accidental triggers.
- **Sentence Builder**: Automatically constructs sentences with Auto-Speak (TTS), space, and backspace controls.
- **Natural Speech Output**: Speaks the translated phrase aloud using Web Speech Synthesis with Indian English (`en-IN`) / Hindi (`hi-IN`) voice support.

### 2. Hearing User $\longrightarrow$ Deaf / Non-Verbal User (Speech & Text to ISL Sign)
- **Voice Recognition (STT)**: Press the microphone button to transcribe voice instantly into text.
- **Grammar & ISL Glossing Engine**: Automatically converts English/Hindi sentences into ISL Topic-Comment grammatical gloss sequences (e.g. *"Namaste, how are you?"* $\longrightarrow$ `[NAMASTE, YOU, GOOD]`).
- **Interactive Dual-Hand Sign Visualizer**:
  - Animated anatomical hands rendered on HTML5 Canvas.
  - Renders exact 3D hand shapes, finger extensions, and directional motion arrows.
  - Automatic fallback to ISL fingerspelling for words not in the core vocabulary.
  - Complete playback controls: Play, Pause, Next Sign, Prev Sign, Replay, and Speed Slider (0.5x to 1.5x).

### 3. Integrated ISL Learning Guide & Custom Sign Trainer
- **ISL Dictionary**: Searchable reference of common signs and the complete ISL two-handed manual alphabet (A-Z).
- **Custom Sign Studio**: Record and calibrate custom ISL signs from your own webcam with cosine-similarity matching saved to `localStorage`.

---

## 🚀 How to Run the Application

### Option A: Using Node.js (Zero external dependencies)
In this directory, run:
```bash
node server.js
```
Then open your browser at:
```
http://localhost:3000
```

### Option B: Using Python
```bash
python -m http.server 3000 --directory public
```
Then open:
```
http://localhost:3000
```

---

## 📁 File Structure
```
├── package.json               # Node.js project manifest
├── server.js                  # Native HTTP static server
├── README.md                  # Documentation and guide
└── public/
    ├── index.html             # Main dual-panel responsive UI
    ├── css/
    │   └── styles.css         # Modern glassmorphism & accessibility styling
    └── js/
        ├── isl_dictionary.js  # ISL vocabulary, glossing engine & A-Z alphabet
        ├── isl_classifier.js  # MediaPipe landmark analysis & gesture classifier
        ├── sign_visualizer.js # Canvas animated dual-hand player & motion arrows
        ├── speech_engine.js   # Web Speech API STT and TTS audio controller
        └── app.js             # Main application controller
```
