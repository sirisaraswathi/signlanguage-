/**
 * Speech Engine
 * Provides dual-direction audio support:
 * 1. Speech-to-Text (STT) via webkitSpeechRecognition / SpeechRecognition
 * 2. Text-to-Speech (TTS) via window.speechSynthesis
 * 3. Synthetic audio feedback sounds via Web Audio API (chimes, beeps)
 */

class SpeechEngine {
  constructor(options = {}) {
    this.lang = options.lang || "en-IN";
    this.rate = options.rate || 1.0;
    this.pitch = options.pitch || 1.0;
    this.volume = options.volume || 1.0;

    // Callbacks
    this.onTranscript = options.onTranscript || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onError = options.onError || (() => {});

    // Audio Context for sound feedback
    this.audioCtx = null;

    // STT State
    this.recognition = null;
    this.isListening = false;
    this.initSTT();

    // TTS Voices
    this.voices = [];
    this.selectedVoice = null;
    this.initTTS();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play synthetic feedback chime (e.g. on gesture confirmed or speech recognized)
  playChime(type = "confirm") {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "confirm") {
        // Cheerful double chime: C5 -> G5
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "start") {
        // Low to high chirp
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "delete") {
        // Descending blip
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      // Audio autoplay may be blocked before first user click
    }
  }

  // Initialize Speech-to-Text
  initSTT() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusChange({ status: "listening", message: "Listening for speech..." });
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      this.onTranscript({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim()
      });
    };

    this.recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        console.warn("Speech recognition error:", event.error);
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStatusChange({ status: "idle", message: "Microphone idle" });
    };
  }

  setLanguage(langCode) {
    this.lang = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
    this.updatePreferredVoice();
  }

  startListening() {
    if (!this.recognition) {
      this.onError("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (this.isListening) return;

    this.playChime("start");
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Speech recognition already running or error:", e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Initialize Text-to-Speech
  initTTS() {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
      this.updatePreferredVoice();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  updatePreferredVoice() {
    if (!this.voices || this.voices.length === 0) return;

    // Prioritize Indian English or Hindi voices if target language is en-IN or hi-IN
    const langPrefix = this.lang.split("-")[0]; // "en" or "hi"
    const isIndia = this.lang.includes("IN");

    let match = null;

    if (isIndia) {
      match = this.voices.find(v => v.lang.replace("_", "-") === this.lang);
      if (!match) {
        match = this.voices.find(v => v.lang.toLowerCase().includes("in") || v.name.toLowerCase().includes("india") || v.name.toLowerCase().includes("hindi"));
      }
    }

    if (!match) {
      match = this.voices.find(v => v.lang.startsWith(langPrefix));
    }

    this.selectedVoice = match || this.voices[0];
  }

  /**
   * Speak text aloud
   */
  speak(text, onComplete = null) {
    if (!("speechSynthesis" in window) || !text) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = this.lang;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    if (onComplete) {
      utterance.onend = onComplete;
      utterance.onerror = onComplete;
    }

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Export for browser
if (typeof window !== "undefined") {
  window.SpeechEngine = SpeechEngine;
}
