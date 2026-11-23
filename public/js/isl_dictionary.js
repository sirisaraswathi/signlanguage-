/**
 * ISL Dictionary & Glossing Engine
 * Enhanced with comprehensive conversational vocabulary for Indian Sign Language (ISL),
 * two-way multi-dialect mapping (English, Telugu, Hindi, Tamil), full A-Z manual alphabet,
 * and high-fidelity posture definitions.
 */

const ISL_DICTIONARY = {
  // =========================================================================
  // 1. GREETINGS, COURTESY & POLITE EXPRESSIONS
  // =========================================================================
  "open hands": {
    gloss: "HELLO / ATTENTION",
    english: "Hello / Attention / All",
    telugu: "నమస్కారం / అందరూ",
    hindi: "नमस्ते / ध्यान दें",
    category: "greetings",
    hands: 2,
    description: "Both hands raised forward with all 10 fingers extended and palms facing forward.",
    tips: "Show both open hands with fingers spread toward camera.",
    poseData: {
      type: "open_palm_forward",
      left: { shape: "open_palm_forward", x: 0.35, y: 0.50, rot: 0 },
      right: { shape: "open_palm_forward", x: 0.65, y: 0.50, rot: 0 }
    }
  },
  "attention": { aliasOf: "open hands" },
  "all": { aliasOf: "open hands" },

  "namaste": {
    gloss: "NAMASTE / HELLO",
    english: "Namaste / Hello",
    telugu: "నమస్తే",
    hindi: "नमस्ते",
    category: "greetings",
    hands: 2,
    description: "Both palms pressed flat together vertically in front of chest (Pranam mudra).",
    tips: "Keep both palms touching with fingers pointing upward.",
    poseData: {
      type: "palms_touching_vertical",
      left: { shape: "flat_vertical", x: 0.46, y: 0.52, rot: 0.1 },
      right: { shape: "flat_vertical", x: 0.54, y: 0.52, rot: -0.1 }
    }
  },
  "hello": { aliasOf: "namaste" },
  "hi": { aliasOf: "namaste" },
  "greetings": { aliasOf: "namaste" },

  "thank you": {
    gloss: "THANK YOU",
    english: "Thank You",
    telugu: "ధన్యవాదాలు",
    hindi: "धन्यवाद",
    category: "courtesy",
    hands: 1,
    description: "Flat hand starts near chin/lips and sweeps forward towards the other person.",
    tips: "Touch chin with flat fingers and extend hand forward.",
    poseData: {
      type: "hand_forward_open",
      right: { shape: "flat_vertical", x: 0.50, y: 0.52, rot: -0.3 }
    }
  },
  "thanks": { aliasOf: "thank you" },
  "thank": { aliasOf: "thank you" },

  "welcome": {
    gloss: "WELCOME",
    english: "Welcome / You are welcome",
    telugu: "స్వాగతం",
    hindi: "स्वागत है",
    category: "courtesy",
    hands: 1,
    description: "Open palm sweeping inward towards body in welcoming gesture.",
    tips: "Sweep open hand from outside inward towards your chest.",
    poseData: {
      type: "welcome_sweep",
      right: { shape: "flat_vertical", x: 0.50, y: 0.52, rot: 0.2 }
    }
  },

  "please": {
    gloss: "PLEASE",
    english: "Please",
    telugu: "దయచేసి",
    hindi: "कृपया",
    category: "courtesy",
    hands: 1,
    description: "Flat open hand rubbing chest in a circular polite motion.",
    tips: "Rub flat palm in a gentle circle on chest.",
    poseData: {
      type: "chest_circle",
      right: { shape: "flat_vertical", x: 0.50, y: 0.52, rot: 0 }
    }
  },

  "sorry": {
    gloss: "SORRY",
    english: "Sorry / Apologies",
    telugu: "క్షమించండి",
    hindi: "माफ़ कीजिए",
    category: "courtesy",
    hands: 1,
    description: "Closed fist with thumb rubbing chest in a circular apologetic motion.",
    tips: "Rub closed fist gently in a circle on chest.",
    poseData: {
      type: "fist_chest_circle",
      right: { shape: "fist", x: 0.50, y: 0.52, rot: 0 }
    }
  },

  "goodbye": {
    gloss: "GOODBYE / BYE",
    english: "Goodbye / Bye",
    telugu: "వీడ్కోలు / బై",
    hindi: "अलविदा / बाय",
    category: "greetings",
    hands: 1,
    description: "Open palm waving side-to-side.",
    tips: "Wave open hand side to side toward other person.",
    poseData: {
      type: "wave_hand",
      right: { shape: "open_palm_forward", x: 0.55, y: 0.48, rot: 0.2 }
    }
  },
  "bye": { aliasOf: "goodbye" },

  // =========================================================================
  // 2. RAILWAY & TRANSIT DIALOG (From SignBridge Live Scenario)
  // =========================================================================
  "railway": {
    gloss: "RAILWAY / TRAIN",
    english: "Railway / Train",
    telugu: "రైల్వే / రైలు",
    hindi: "रेलवे / ट्रेन",
    category: "transit",
    hands: 2,
    description: "Two fingers of right hand (index and middle) sliding forward over two fingers of left hand, mimicking a train gliding on tracks.",
    tips: "Slide extended index and middle fingers of one hand over the other.",
    poseData: {
      type: "train_tracks",
      left: { shape: "track_horizontal", x: 0.44, y: 0.58, rot: 0 },
      right: { shape: "track_horizontal", x: 0.56, y: 0.54, rot: -0.2 }
    }
  },
  "train": { aliasOf: "railway" },

  "station": {
    gloss: "STATION",
    english: "Station / Railway Station",
    telugu: "స్టేషన్",
    hindi: "स्टेशन",
    category: "transit",
    hands: 2,
    description: "Non-dominant flat palm held horizontal, dominant hand 2 fingers landing down onto palm like stopping at a platform.",
    tips: "Bring dominant fingertips down to rest on flat horizontal palm.",
    poseData: {
      type: "station_platform",
      left: { shape: "flat_horizontal", x: 0.45, y: 0.60, rot: 0 },
      right: { shape: "stand_legs", x: 0.52, y: 0.48, rot: 0 }
    }
  },
  "platform": { aliasOf: "station" },

  "time": {
    gloss: "TIME / TIMINGS",
    english: "Time / Timings",
    telugu: "సమయం",
    hindi: "समय",
    category: "transit",
    hands: 2,
    description: "Dominant index finger tapping the wrist of the non-dominant hand repeatedly like checking a watch.",
    tips: "Point right index finger to left wrist like tapping a wristwatch.",
    poseData: {
      type: "tap_wrist",
      left: { shape: "flat_horizontal", x: 0.44, y: 0.58, rot: 0.2 },
      right: { shape: "pointing_down", x: 0.54, y: 0.52, rot: -0.7 }
    }
  },
  "timings": { aliasOf: "time" },
  "clock": { aliasOf: "time" },
  "schedule": { aliasOf: "time" },

  "ticket": {
    gloss: "TICKET",
    english: "Ticket",
    telugu: "టిక్కెట్",
    hindi: "टिकट",
    category: "transit",
    hands: 2,
    description: "Right hand bent index and middle fingers clipping the edge of flat left palm like punching a ticket.",
    tips: "Clip edge of flat hand with bent fingers.",
    poseData: {
      type: "ticket_punch",
      left: { shape: "flat_vertical", x: 0.42, y: 0.55, rot: 0 },
      right: { shape: "track_horizontal", x: 0.55, y: 0.55, rot: -0.4 }
    }
  },

  "travel": {
    gloss: "TRAVEL / GO",
    english: "Travel / Go / Journey",
    telugu: "ప్రయాణం / వెళ్లడం",
    hindi: "यात्रा / जाना",
    category: "transit",
    hands: 1,
    description: "Index and middle fingers curled like walking legs moving forward across space.",
    tips: "Move two fingers forward like walking or traveling.",
    poseData: {
      type: "travel_move",
      right: { shape: "stand_legs", x: 0.55, y: 0.52, rot: -0.3 }
    }
  },
  "traveling": { aliasOf: "travel" },
  "go": { aliasOf: "travel" },
  "going": { aliasOf: "travel" },
  "journey": { aliasOf: "travel" },

  "where": {
    gloss: "WHERE",
    english: "Where",
    telugu: "ఎక్కడ",
    hindi: "कहाँ",
    category: "questions",
    hands: 2,
    description: "Both hands held open with palms up, swinging gently side to side in an inquiring gesture.",
    tips: "Hold palms up and move hands gently side-to-side.",
    poseData: {
      type: "where_palms_up",
      left: { shape: "flat_horizontal", x: 0.36, y: 0.54, rot: 0.1 },
      right: { shape: "flat_horizontal", x: 0.64, y: 0.54, rot: -0.1 }
    }
  },

  "which": {
    gloss: "WHICH",
    english: "Which",
    telugu: "ఏది",
    hindi: "कौन सा",
    category: "questions",
    hands: 2,
    description: "Both thumbs up, alternating up and down like weighing choices.",
    tips: "Hold both thumbs up and alternate lifting left and right.",
    poseData: {
      type: "which_thumbs",
      left: { shape: "thumbs_up", x: 0.38, y: 0.52, rot: 0 },
      right: { shape: "thumbs_up", x: 0.62, y: 0.52, rot: 0 }
    }
  },

  "what": {
    gloss: "WHAT",
    english: "What",
    telugu: "ఏమిటి",
    hindi: "क्या",
    category: "questions",
    hands: 1,
    description: "Index finger shaking quickly side-to-side with questioning face.",
    tips: "Shake upright index finger side to side.",
    poseData: {
      type: "what_shake",
      right: { shape: "pointing_index", x: 0.55, y: 0.50, rot: 0 }
    }
  },

  "when": {
    gloss: "WHEN",
    english: "When",
    telugu: "ఎప్పుడు",
    hindi: "कब",
    category: "questions",
    hands: 2,
    description: "Right index finger circles around left upright index finger and touches its tip.",
    tips: "Circle right index finger around left index finger.",
    poseData: {
      type: "when_circle",
      left: { shape: "pointing_index", x: 0.45, y: 0.52, rot: 0 },
      right: { shape: "pointing_index", x: 0.55, y: 0.50, rot: -0.3 }
    }
  },

  "why": {
    gloss: "WHY",
    english: "Why",
    telugu: "ఎందుకు",
    hindi: "क्यों",
    category: "questions",
    hands: 1,
    description: "Fingertips touch forehead and pull down into a Y-handshape.",
    tips: "Touch forehead and pull down with thumb and pinky extended.",
    poseData: {
      type: "why_pull",
      right: { shape: "phone_sign", x: 0.52, y: 0.45, rot: 0 }
    }
  },

  "how": {
    gloss: "HOW",
    english: "How",
    telugu: "ఎలా",
    hindi: "कैसे",
    category: "questions",
    hands: 2,
    description: "Backs of curved fingers touching, rotating outward so palms face upward.",
    tips: "Roll curved hands outward until palms face up.",
    poseData: {
      type: "how_roll",
      left: { shape: "cup_drink", x: 0.42, y: 0.54, rot: 0.2 },
      right: { shape: "cup_drink", x: 0.58, y: 0.54, rot: -0.2 }
    }
  },

  "information": {
    gloss: "INFORMATION / NEWS",
    english: "Information / Details",
    telugu: "సమాచారం",
    hindi: "जानकारी",
    category: "transit",
    hands: 2,
    description: "Fingertips gathered at forehead and opened outward into flat palms facing recipient.",
    tips: "Move gathered fingers from forehead outward and open hands.",
    poseData: {
      type: "info_open",
      left: { shape: "open_palm_forward", x: 0.38, y: 0.48, rot: -0.2 },
      right: { shape: "open_palm_forward", x: 0.62, y: 0.48, rot: 0.2 }
    }
  },
  "info": { aliasOf: "information" },

  // =========================================================================
  // 3. ESSENTIAL DAILY POSTURES (Eat, Drink, Sleep, Book, Write, etc.)
  // =========================================================================
  "eat": {
    gloss: "EAT / FOOD",
    english: "Eat / Food / Meals",
    telugu: "ఆహారం / భోజనం",
    hindi: "खाना",
    category: "needs",
    hands: 1,
    description: "All five fingertips gathered together and brought towards mouth repeatedly in eating gesture.",
    tips: "Bunch fingertips together and touch near lips repeatedly.",
    poseData: {
      type: "pinched_food_to_mouth",
      right: { shape: "pinched_food", x: 0.50, y: 0.42, rot: -0.2 }
    }
  },
  "food": { aliasOf: "eat" },
  "meal": { aliasOf: "eat" },
  "meals": { aliasOf: "eat" },
  "hungry": { aliasOf: "eat" },

  "drink": {
    gloss: "DRINK / WATER",
    english: "Drink / Water",
    telugu: "నీరు / తాగడం",
    hindi: "पानी / पीना",
    category: "needs",
    hands: 1,
    description: "Dominant hand cupped in 'C' shape like holding a tumbler, tilting upward toward mouth.",
    tips: "Cup hand like holding a glass and tilt toward mouth.",
    poseData: {
      type: "cup_drink_to_mouth",
      right: { shape: "cup_drink", x: 0.50, y: 0.42, rot: -0.6 }
    }
  },
  "water": { aliasOf: "drink" },
  "thirsty": { aliasOf: "drink" },

  "tea": {
    gloss: "TEA / CHAI",
    english: "Tea / Chai",
    telugu: "టీ / చాయ్",
    hindi: "चाय",
    category: "needs",
    hands: 2,
    description: "Left hand forms flat saucer, right hand pinches cup dipping up and down like stirring tea.",
    tips: "Dip pinched right hand over left palm saucer.",
    poseData: {
      type: "tea_stir",
      left: { shape: "flat_horizontal", x: 0.42, y: 0.58, rot: 0 },
      right: { shape: "pinched_food", x: 0.54, y: 0.48, rot: 0 }
    }
  },
  "chai": { aliasOf: "tea" },
  "coffee": { aliasOf: "tea" },

  "sleep": {
    gloss: "SLEEP / REST",
    english: "Sleep / Rest",
    telugu: "నిద్ర / విశ్రాంతి",
    hindi: "सोना / आराम",
    category: "needs",
    hands: 1,
    description: "Dominant flat palm placed against side of cheek with head tilted comfortably.",
    tips: "Tilt head slightly and rest cheek on flat palm.",
    poseData: {
      type: "cheek_rest",
      right: { shape: "flat_vertical", x: 0.52, y: 0.45, rot: -0.6 }
    }
  },
  "rest": { aliasOf: "sleep" },
  "tired": { aliasOf: "sleep" },

  "book": {
    gloss: "BOOK / READ",
    english: "Book / Read",
    telugu: "పుస్తకం / చదవడం",
    hindi: "किताब / पढ़ना",
    category: "education",
    hands: 2,
    description: "Both open flat hands side-by-side with pinkies touching, opening like the pages of a book.",
    tips: "Hold both palms together and open them upward like opening a book.",
    poseData: {
      type: "open_book",
      left: { shape: "flat_vertical", x: 0.38, y: 0.55, rot: -0.35 },
      right: { shape: "flat_vertical", x: 0.62, y: 0.55, rot: 0.35 }
    }
  },
  "read": { aliasOf: "book" },
  "study": { aliasOf: "book" },

  "write": {
    gloss: "WRITE / NOTE",
    english: "Write / Note",
    telugu: "రాయడం",
    hindi: "लिखना",
    category: "education",
    hands: 2,
    description: "Right hand pinching invisible pen scribbling across flat open left palm.",
    tips: "Pinch right fingers and scribble on flat left palm.",
    poseData: {
      type: "pen_scribble",
      left: { shape: "flat_horizontal", x: 0.42, y: 0.58, rot: 0.1 },
      right: { shape: "pen_grip", x: 0.52, y: 0.52, rot: -0.5 }
    }
  },
  "note": { aliasOf: "write" },
  "pen": { aliasOf: "write" },

  "stand": {
    gloss: "STAND",
    english: "Stand / Stand Up",
    telugu: "నిలబడండి",
    hindi: "खड़े हो जाओ",
    category: "actions",
    hands: 2,
    description: "Index and middle fingers of dominant hand pointed down standing on flat opposite palm.",
    tips: "Stand index & middle finger tips upright on left palm.",
    poseData: {
      type: "stand_on_palm",
      left: { shape: "flat_horizontal", x: 0.48, y: 0.62, rot: 0 },
      right: { shape: "stand_legs", x: 0.48, y: 0.48, rot: 0 }
    }
  },

  "sit": {
    gloss: "SIT",
    english: "Sit / Have a seat",
    telugu: "కూర్చోండి",
    hindi: "बैठिए",
    category: "actions",
    hands: 2,
    description: "Two fingers of dominant hand bent downward resting over two fingers of opposite hand.",
    tips: "Rest bent index and middle fingers on opposite two fingers.",
    poseData: {
      type: "sit_legs",
      left: { shape: "track_horizontal", x: 0.44, y: 0.58, rot: 0 },
      right: { shape: "track_horizontal", x: 0.52, y: 0.52, rot: 0 }
    }
  },
  "seat": { aliasOf: "sit" },

  "wash": {
    gloss: "WASH / CLEAN",
    english: "Wash / Clean",
    telugu: "కడుక్కోవడం",
    hindi: "धोना",
    category: "actions",
    hands: 2,
    description: "Both palms rubbing against each other in a hand-washing motion.",
    tips: "Rub both open palms together.",
    poseData: {
      type: "wash_hands",
      left: { shape: "flat_vertical", x: 0.44, y: 0.54, rot: 0.2 },
      right: { shape: "flat_vertical", x: 0.56, y: 0.54, rot: -0.2 }
    }
  },
  "clean": { aliasOf: "wash" },
  "bath": { aliasOf: "wash" },

  "toilet": {
    gloss: "TOILET / RESTROOM",
    english: "Toilet / Restroom / Washroom",
    telugu: "మరుగుదొడ్డి / వాష్‌రూమ్",
    hindi: "शौचालय / वॉशरूम",
    category: "needs",
    hands: 1,
    description: "Dominant hand forms 'T' (thumb between index and middle fingers) shaking gently.",
    tips: "Shake 'T' handshape gently side to side.",
    poseData: {
      type: "toilet_shake",
      right: { shape: "fist", x: 0.52, y: 0.50, rot: 0 }
    }
  },
  "bathroom": { aliasOf: "toilet" },
  "washroom": { aliasOf: "toilet" },
  "restroom": { aliasOf: "toilet" },

  "listen": {
    gloss: "LISTEN / HEAR",
    english: "Listen / Hear",
    telugu: "వినండి",
    hindi: "सुनो",
    category: "actions",
    hands: 1,
    description: "Hand cupped behind ear or index finger pointing to ear.",
    tips: "Cup hand behind ear or point index finger to ear.",
    poseData: {
      type: "cup_ear",
      right: { shape: "cup_ear", x: 0.52, y: 0.42, rot: 0 }
    }
  },
  "hear": { aliasOf: "listen" },

  "look": {
    gloss: "LOOK / SEE",
    english: "Look / See",
    telugu: "చూడండి",
    hindi: "देखो",
    category: "actions",
    hands: 1,
    description: "Two fingers in 'V' shape starting near eyes and pointing forward.",
    tips: "Point 'V' fingers forward from eyes.",
    poseData: {
      type: "v_eyes",
      right: { shape: "track_horizontal", x: 0.54, y: 0.44, rot: -0.4 }
    }
  },
  "see": { aliasOf: "look" },
  "watch": { aliasOf: "look" },

  "talk": {
    gloss: "TALK / SPEAK",
    english: "Talk / Speak",
    telugu: "మాట్లాడండి",
    hindi: "बोलिए",
    category: "actions",
    hands: 1,
    description: "4 fingers tapping repeatedly against thumb in front of mouth.",
    tips: "Open and close fingers against thumb near mouth.",
    poseData: {
      type: "talk_mouth",
      right: { shape: "pen_grip", x: 0.52, y: 0.44, rot: 0 }
    }
  },
  "speak": { aliasOf: "talk" },

  "call": {
    gloss: "CALL / PHONE",
    english: "Call / Phone",
    telugu: "కాల్ చేయండి",
    hindi: "कॉल करें",
    category: "actions",
    hands: 1,
    description: "Thumb and pinky extended, held near ear like a telephone receiver.",
    tips: "Hold phone gesture near ear.",
    poseData: {
      type: "phone_sign",
      right: { shape: "phone_sign", x: 0.52, y: 0.42, rot: -0.2 }
    }
  },
  "phone": { aliasOf: "call" },
  "mobile": { aliasOf: "call" },

  "house": {
    gloss: "HOUSE / HOME",
    english: "House / Home",
    telugu: "ఇల్లు",
    hindi: "घर",
    category: "general",
    hands: 2,
    description: "Both open flat hands touching at fingertips at an angle forming a roof peak.",
    tips: "Form inverted V roof shape with both open hands.",
    poseData: {
      type: "roof_shape",
      left: { shape: "roof_shape", x: 0.42, y: 0.48, rot: 0.4 },
      right: { shape: "roof_shape", x: 0.58, y: 0.48, rot: -0.4 }
    }
  },
  "home": { aliasOf: "house" },

  // =========================================================================
  // 4. EMERGENCY, MEDICAL & ASSISTANCE
  // =========================================================================
  "help": {
    gloss: "HELP",
    english: "Help / Assistance",
    telugu: "సహాయం",
    hindi: "मदद",
    category: "emergency",
    hands: 2,
    description: "Closed fist (thumbs up) resting on top of flat open palm of other hand, lifting together.",
    tips: "Rest fist on open flat palm and lift upward.",
    poseData: {
      type: "fist_on_palm_lift",
      left: { shape: "flat_horizontal", x: 0.46, y: 0.60, rot: 0 },
      right: { shape: "thumbs_up", x: 0.50, y: 0.50, rot: 0 }
    }
  },
  "assist": { aliasOf: "help" },
  "support": { aliasOf: "help" },

  "doctor": {
    gloss: "DOCTOR / MEDICAL",
    english: "Doctor / Medical / Hospital",
    telugu: "వైద్యుడు / డాక్టర్",
    hindi: "डॉक्टर / अस्पताल",
    category: "emergency",
    hands: 2,
    description: "Right hand two fingers (index and middle) touching pulse on left wrist.",
    tips: "Touch two fingertips to left wrist like checking pulse.",
    poseData: {
      type: "doctor_pulse",
      left: { shape: "flat_horizontal", x: 0.42, y: 0.58, rot: 0.2 },
      right: { shape: "track_horizontal", x: 0.54, y: 0.52, rot: -0.6 }
    }
  },
  "hospital": { aliasOf: "doctor" },
  "medicine": { aliasOf: "doctor" },
  "sick": { aliasOf: "doctor" },

  "money": {
    gloss: "MONEY / FARE",
    english: "Money / Fare / Price",
    telugu: "డబ్బు / ధర",
    hindi: "पैसे / किराया",
    category: "general",
    hands: 1,
    description: "Thumb rubbing across index and middle fingertips repeatedly in money-counting gesture.",
    tips: "Rub thumb across fingertips like counting cash.",
    poseData: {
      type: "money_rub",
      right: { shape: "pen_grip", x: 0.52, y: 0.52, rot: 0 }
    }
  },
  "cash": { aliasOf: "money" },
  "fare": { aliasOf: "money" },
  "price": { aliasOf: "money" },
  "cost": { aliasOf: "money" },

  // =========================================================================
  // 5. CORE RESPONSES, PRONOUNS & VERBS
  // =========================================================================
  "ok": {
    gloss: "OK / PERFECT",
    english: "OK / All Good / Fine",
    telugu: "సరే / అంతా బాగుంది",
    hindi: "ठीक है / सब बढ़िया",
    category: "responses",
    hands: 1,
    description: "Index finger and thumb joined in a circle, with other 3 fingers extended upright.",
    tips: "Join thumb tip and index tip in a circle, keep other three fingers straight.",
    poseData: {
      type: "ok_circle",
      right: { shape: "ok_circle", x: 0.50, y: 0.50, rot: 0 }
    }
  },
  "okay": { aliasOf: "ok" },
  "perfect": { aliasOf: "ok" },
  "fine": { aliasOf: "ok" },

  "good": {
    gloss: "GOOD",
    english: "Good / Well",
    telugu: "మంచిది / బాగుంది",
    hindi: "अच्छा",
    category: "responses",
    hands: 1,
    description: "Thumbs-up gesture with firm positive nod.",
    tips: "Extend thumb straight up with closed fist.",
    poseData: {
      type: "thumbs_up",
      right: { shape: "thumbs_up", x: 0.52, y: 0.50, rot: 0 }
    }
  },
  "great": { aliasOf: "good" },

  "bad": {
    gloss: "BAD",
    english: "Bad / Not good",
    telugu: "చెడ్డది / బాగాలేదు",
    hindi: "खराब",
    category: "responses",
    hands: 1,
    description: "Thumbs-down gesture.",
    tips: "Turn fist so thumb points straight down.",
    poseData: {
      type: "thumbs_down",
      right: { shape: "thumbs_up", x: 0.52, y: 0.54, rot: Math.PI }
    }
  },

  "yes": {
    gloss: "YES",
    english: "Yes / Correct",
    telugu: "అవును",
    hindi: "हाँ",
    category: "responses",
    hands: 1,
    description: "Closed fist nodding up and down from the wrist like a head nodding.",
    tips: "Nod closed fist up and down from the wrist.",
    poseData: {
      type: "fist_nod",
      right: { shape: "fist", x: 0.52, y: 0.50, rot: 0 }
    }
  },
  "agree": { aliasOf: "yes" },
  "correct": { aliasOf: "yes" },

  "no": {
    gloss: "NO",
    english: "No / Negative",
    telugu: "కాదు / లేదు",
    hindi: "नहीं",
    category: "responses",
    hands: 1,
    description: "Index and middle fingers snap down against thumb, or hand waves back and forth.",
    tips: "Snap index and middle fingers down against thumb.",
    poseData: {
      type: "no_snap",
      right: { shape: "pen_grip", x: 0.52, y: 0.50, rot: 0 }
    }
  },
  "not": { aliasOf: "no" },
  "dont": { aliasOf: "no" },

  "want": {
    gloss: "WANT / NEED",
    english: "Want / Need",
    telugu: "కావాలి",
    hindi: "चाहिए",
    category: "verbs",
    hands: 2,
    description: "Both hands held palms up with fingers slightly bent like claws, pulling slightly towards chest.",
    tips: "Hold palms up with fingers curved and pull towards body.",
    poseData: {
      type: "want_pull",
      left: { shape: "cup_drink", x: 0.40, y: 0.55, rot: 0.2 },
      right: { shape: "cup_drink", x: 0.60, y: 0.55, rot: -0.2 }
    }
  },
  "need": { aliasOf: "want" },
  "like": { aliasOf: "want" },

  "stop": {
    gloss: "STOP / WAIT",
    english: "Stop / Wait",
    telugu: "ఆగండి / వేచి ఉండండి",
    hindi: "रुकिए / इंतज़ार करें",
    category: "actions",
    hands: 1,
    description: "Open palm extended firmly forward towards viewer.",
    tips: "Hold open flat palm forward with fingers pointing upward.",
    poseData: {
      type: "open_palm_forward",
      right: { shape: "open_palm_forward", x: 0.50, y: 0.50, rot: 0 }
    }
  },
  "wait": { aliasOf: "stop" },

  "you": {
    gloss: "YOU",
    english: "You",
    telugu: "మీరు / నువ్వు",
    hindi: "आप / तुम",
    category: "pronouns",
    hands: 1,
    description: "Index finger pointing directly forward towards the other person.",
    tips: "Point index finger straight toward the opposite person.",
    poseData: {
      type: "point_forward",
      right: { shape: "pointing_index", x: 0.52, y: 0.50, rot: -0.3 }
    }
  },
  "your": { aliasOf: "you" },

  "me": {
    gloss: "ME / I",
    english: "Me / I",
    telugu: "నేను / నన్ను",
    hindi: "मैं / मुझे",
    category: "pronouns",
    hands: 1,
    description: "Index finger pointing directly towards own chest.",
    tips: "Point index finger towards your chest.",
    poseData: {
      type: "point_self",
      right: { shape: "pointing_index", x: 0.50, y: 0.50, rot: 1.5 }
    }
  },
  "i": { aliasOf: "me" },
  "my": { aliasOf: "me" }
};

// =========================================================================
// 6. COMPLETE TWO-HANDED & ONE-HANDED ISL MANUAL ALPHABET (A - Z)
// =========================================================================
const ISL_ALPHABET = {
  "A": {
    name: "Letter A",
    hands: 2,
    description: "Left open palm held flat, right index fingertip touches the tip of left thumb.",
    tips: "Touch right index to left thumb tip.",
    left: { shape: "open_palm_forward", x: 0.42, y: 0.54, rot: 0 },
    right: { shape: "pointing_index", x: 0.54, y: 0.52, rot: -0.8 }
  },
  "B": {
    name: "Letter B",
    hands: 2,
    description: "Both hands join thumb and index fingers into circles, touching together side-by-side like glasses or the loops of 'B'.",
    tips: "Touch both OK loops together side-by-side.",
    left: { shape: "ok_circle", x: 0.42, y: 0.52, rot: 0 },
    right: { shape: "ok_circle", x: 0.58, y: 0.52, rot: 0 }
  },
  "C": {
    name: "Letter C",
    hands: 1,
    description: "Right hand curved into a clear, distinct 'C' shape with thumb and fingers arched.",
    tips: "Curve right hand fingers and thumb into a 'C'.",
    right: { shape: "cup_drink", x: 0.50, y: 0.52, rot: 0 }
  },
  "D": {
    name: "Letter D",
    hands: 2,
    description: "Left hand forms curved arc, right index finger stands upright touching it to form 'D'.",
    tips: "Right index upright against left curved thumb/finger arc.",
    left: { shape: "cup_drink", x: 0.42, y: 0.52, rot: 0 },
    right: { shape: "pointing_index", x: 0.56, y: 0.50, rot: 0 }
  },
  "E": {
    name: "Letter E",
    hands: 2,
    description: "Left open palm, right index finger touches the tip of left index finger.",
    tips: "Touch right index to left index tip.",
    left: { shape: "open_palm_forward", x: 0.42, y: 0.54, rot: 0 },
    right: { shape: "pointing_index", x: 0.55, y: 0.48, rot: -0.9 }
  },
  "F": {
    name: "Letter F",
    hands: 2,
    description: "Right index and middle fingers cross horizontally over left index and middle fingers.",
    tips: "Cross right two fingers over left two fingers.",
    left: { shape: "track_horizontal", x: 0.44, y: 0.54, rot: 0 },
    right: { shape: "track_horizontal", x: 0.54, y: 0.52, rot: 1.5 }
  },
  "G": {
    name: "Letter G",
    hands: 2,
    description: "Two closed fists placed one on top of the other like two grinding stones.",
    tips: "Stack right closed fist on top of left closed fist.",
    left: { shape: "fist", x: 0.50, y: 0.60, rot: 0 },
    right: { shape: "fist", x: 0.50, y: 0.45, rot: 0 }
  },
  "H": {
    name: "Letter H",
    hands: 2,
    description: "Right flat hand brushing horizontally across left flat palm from wrist to fingertips.",
    tips: "Brush flat right hand across flat left palm.",
    left: { shape: "flat_horizontal", x: 0.44, y: 0.58, rot: 0 },
    right: { shape: "flat_vertical", x: 0.54, y: 0.52, rot: -0.4 }
  },
  "I": {
    name: "Letter I",
    hands: 2,
    description: "Left open palm, right index touches tip of left middle finger.",
    tips: "Touch right index to tip of left middle finger.",
    left: { shape: "open_palm_forward", x: 0.42, y: 0.54, rot: 0 },
    right: { shape: "pointing_index", x: 0.55, y: 0.46, rot: -0.9 }
  },
  "J": {
    name: "Letter J",
    hands: 1,
    description: "Right pinky extended, tracing a curved 'J' in the air.",
    tips: "Trace 'J' with pinky finger.",
    right: { shape: "phone_sign", x: 0.52, y: 0.50, rot: 0 }
  },
  "K": {
    name: "Letter K",
    hands: 2,
    description: "Left index finger upright, right index finger bent touching its knuckle joint like 'K'.",
    tips: "Right bent index touches middle of upright left index.",
    left: { shape: "pointing_index", x: 0.44, y: 0.50, rot: 0 },
    right: { shape: "pen_grip", x: 0.55, y: 0.52, rot: -0.4 }
  },
  "L": {
    name: "Letter L",
    hands: 1,
    description: "Right hand thumb and index finger extended at 90-degree angle forming 'L'.",
    tips: "Form 90-degree 'L' with thumb and index finger.",
    right: { shape: "pointing_index", x: 0.50, y: 0.50, rot: 0 }
  },
  "M": {
    name: "Letter M",
    hands: 2,
    description: "Right three fingers (index, middle, ring) placed down across left open palm.",
    tips: "Rest right three fingers across flat left palm.",
    left: { shape: "flat_horizontal", x: 0.44, y: 0.58, rot: 0 },
    right: { shape: "open_palm_forward", x: 0.52, y: 0.50, rot: -0.5 }
  },
  "N": {
    name: "Letter N",
    hands: 2,
    description: "Right two fingers (index and middle) placed down across left open palm.",
    tips: "Rest right two fingers across flat left palm.",
    left: { shape: "flat_horizontal", x: 0.44, y: 0.58, rot: 0 },
    right: { shape: "track_horizontal", x: 0.52, y: 0.50, rot: -0.5 }
  },
  "O": {
    name: "Letter O",
    hands: 2,
    description: "Left open palm, right index touches tip of left ring finger.",
    tips: "Touch right index to tip of left ring finger.",
    left: { shape: "open_palm_forward", x: 0.42, y: 0.54, rot: 0 },
    right: { shape: "pointing_index", x: 0.55, y: 0.47, rot: -0.9 }
  },
  "P": {
    name: "Letter P",
    hands: 2,
    description: "Right thumb and index loop touching the top of upright left index finger.",
    tips: "Form circle with right index & thumb on top of left index.",
    left: { shape: "pointing_index", x: 0.44, y: 0.54, rot: 0 },
    right: { shape: "ok_circle", x: 0.52, y: 0.44, rot: 0 }
  },
  "Q": {
    name: "Letter Q",
    hands: 2,
    description: "Left hand forms circular loop, right index finger hooked through from above.",
    tips: "Hook right index through left circular hand.",
    left: { shape: "ok_circle", x: 0.44, y: 0.52, rot: 0 },
    right: { shape: "pointing_index", x: 0.55, y: 0.52, rot: -0.8 }
  },
  "R": {
    name: "Letter R",
    hands: 1,
    description: "Right index and middle fingers crossed tightly over each other.",
    tips: "Cross index and middle fingers.",
    right: { shape: "track_horizontal", x: 0.50, y: 0.50, rot: 0 }
  },
  "S": {
    name: "Letter S",
    hands: 2,
    description: "Pinkies of both hands hooked tightly together.",
    tips: "Hook pinky fingers of both hands together.",
    left: { shape: "phone_sign", x: 0.44, y: 0.52, rot: 0.2 },
    right: { shape: "phone_sign", x: 0.56, y: 0.52, rot: -0.2 }
  },
  "T": {
    name: "Letter T",
    hands: 2,
    description: "Right index finger placed perpendicularly against side edge of left flat hand forming 'T'.",
    tips: "Place right index perpendicularly against left hand edge.",
    left: { shape: "flat_vertical", x: 0.44, y: 0.52, rot: 0 },
    right: { shape: "pointing_index", x: 0.55, y: 0.52, rot: -1.5 }
  },
  "U": {
    name: "Letter U",
    hands: 2,
    description: "Left open palm, right index touches tip of left pinky finger.",
    tips: "Touch right index to tip of left pinky.",
    left: { shape: "open_palm_forward", x: 0.42, y: 0.54, rot: 0 },
    right: { shape: "pointing_index", x: 0.55, y: 0.50, rot: -0.9 }
  },
  "V": {
    name: "Letter V",
    hands: 1,
    description: "Right index and middle fingers spread in a sharp upright 'V' shape.",
    tips: "Spread index and middle fingers in 'V'.",
    right: { shape: "track_horizontal", x: 0.50, y: 0.50, rot: 0 }
  },
  "W": {
    name: "Letter W",
    hands: 1,
    description: "Right index, middle, and ring fingers spread wide upright in a sharp 'W' shape.",
    tips: "Spread index, middle, and ring fingers in 'W'.",
    right: { shape: "open_palm_forward", x: 0.50, y: 0.50, rot: 0 }
  },
  "X": {
    name: "Letter X",
    hands: 2,
    description: "Both index fingers crossed horizontally and vertically forming 'X'.",
    tips: "Cross both index fingers like an 'X'.",
    left: { shape: "pointing_index", x: 0.45, y: 0.52, rot: 0.6 },
    right: { shape: "pointing_index", x: 0.55, y: 0.52, rot: -0.6 }
  },
  "Y": {
    name: "Letter Y",
    hands: 1,
    description: "Right thumb and pinky extended wide, middle 3 fingers curled in 'Y' shape.",
    tips: "Extend thumb and pinky wide in 'Y'.",
    right: { shape: "phone_sign", x: 0.50, y: 0.50, rot: 0 }
  },
  "Z": {
    name: "Letter Z",
    hands: 1,
    description: "Right index finger traces 'Z' zigzag in the air.",
    tips: "Trace letter 'Z' with index finger.",
    right: { shape: "pointing_index", x: 0.50, y: 0.50, rot: 0 }
  }
};

/**
 * Natural language sentence to ISL Gloss Sequence converter
 * with multi-dialect support (English, Telugu, Hindi, Tamil).
 */
function englishToISLGloss(sentence) {
  if (!sentence || typeof sentence !== "string") return [];

  const clean = sentence
    .toLowerCase()
    .replace(/[^\w\s\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Multi-dialect translation dictionary for Telugu, Hindi, and Tamil words
  const dialectMap = {
    // Telugu phrases & vocabulary
    "నాకు": "i",
    "నేను": "i",
    "రైలు": "railway",
    "రైల్వే": "railway",
    "సమయాల": "time",
    "సమయం": "time",
    "సమాచారం": "information",
    "కావాలి": "want",
    "స్టేషన్": "station",
    "ప్రయాణం": "travel",
    "ప్రయాణిస్తున్నారు": "travel",
    "నమస్తే": "namaste",
    "నమస్కారం": "namaste",
    "ధన్యవాదాలు": "thank you",
    "సరే": "ok",
    "బాగుంది": "good",
    "మంచిది": "good",
    "నీరు": "drink",
    "మంచినీళ్లు": "drink",
    "ఆహారం": "eat",
    "భోజనం": "eat",
    "తిను": "eat",
    "తాగు": "drink",
    "నిద్ర": "sleep",
    "పుస్తకం": "book",
    "రాయి": "write",
    "రాయడం": "write",
    "నిలబడు": "stand",
    "కూర్చో": "sit",
    "కడుక్కో": "wash",
    "డాక్టర్": "doctor",
    "వైద్యుడు": "doctor",
    "డబ్బు": "money",
    "సహాయం": "help",
    "ఎక్కడ": "where",
    "ఎప్పుడు": "when",
    "ఏది": "which",
    "ఏమిటి": "what",
    "ఎందుకు": "why",
    "ఎలా": "how",
    "టిక్కెట్": "ticket",
    "ఇల్లు": "house",

    // Hindi phrases & vocabulary
    "मुझे": "i",
    "रेलवे": "railway",
    "ट्रेन": "railway",
    "समय": "time",
    "जानकारी": "information",
    "स्टेशन": "station",
    "यात्रा": "travel",
    "नमस्ते": "namaste",
    "धन्यवाद": "thank you",
    "ठीक": "ok",
    "पानी": "drink",
    "खाना": "eat",
    "सोना": "sleep",
    "किताब": "book",
    "लिखना": "write",
    "मदद": "help",
    "डॉक्टर": "doctor",
    "पैसे": "money",
    "चाहिए": "want",
    "कहाँ": "where",
    "कब": "when",
    "कौन": "which",
    "क्या": "what",
    "क्यों": "why",
    "कैसे": "how",
    "टिकट": "ticket",
    "घर": "house",

    // Tamil
    "வணக்கம்": "namaste",
    "நன்றி": "thank you",
    "தண்ணீர்": "drink",
    "உணவு": "eat",
    "ரயில்": "railway"
  };

  const words = clean.split(/\s+/).filter(Boolean);
  const normalizedWords = words.map(w => dialectMap[w] || w);
  const glossSequence = [];
  
  // Non-essential auxiliary words that ISL grammar omits in Subject-Object-Verb (SOV)
  const filterWords = new Set(["about", "the", "to", "is", "are", "am", "was", "were", "a", "an", "for", "of"]);

  let i = 0;
  while (i < normalizedWords.length) {
    // 1. Check 3-word idioms (e.g. "how are you", "what is time")
    if (i + 2 < normalizedWords.length) {
      const three = `${normalizedWords[i]} ${normalizedWords[i+1]} ${normalizedWords[i+2]}`;
      if (ISL_DICTIONARY[three]) {
        const item = resolveDictionaryItem(three);
        glossSequence.push({ type: "word", key: three, gloss: item.gloss, english: item.english, telugu: item.telugu, hindi: item.hindi, data: item });
        i += 3;
        continue;
      }
    }

    // 2. Check 2-word idioms (e.g. "railway timings", "thank you", "stand up", "sit down", "open hands")
    if (i + 1 < normalizedWords.length) {
      const two = `${normalizedWords[i]} ${normalizedWords[i+1]}`;
      if (ISL_DICTIONARY[two]) {
        const item = resolveDictionaryItem(two);
        glossSequence.push({ type: "word", key: two, gloss: item.gloss, english: item.english, telugu: item.telugu, hindi: item.hindi, data: item });
        i += 2;
        continue;
      }
    }

    const w = normalizedWords[i];
    if (filterWords.has(w)) {
      i++;
      continue;
    }

    // 3. Single Word Match
    if (ISL_DICTIONARY[w]) {
      const item = resolveDictionaryItem(w);
      glossSequence.push({ type: "word", key: w, gloss: item.gloss, english: item.english, telugu: item.telugu, hindi: item.hindi, data: item });
    } else {
      // 4. Fallback: Fingerspell letter by letter
      const letters = w.toUpperCase().split("").filter(c => ISL_ALPHABET[c]);
      if (letters.length > 0) {
        glossSequence.push({
          type: "fingerspell",
          word: w.toUpperCase(),
          gloss: `SPELL[${w.toUpperCase()}]`,
          letters: letters
        });
      }
    }
    i++;
  }

  return glossSequence;
}

function resolveDictionaryItem(key) {
  let item = ISL_DICTIONARY[key];
  while (item && item.aliasOf) {
    item = ISL_DICTIONARY[item.aliasOf];
  }
  return item;
}

// Export for browser & Node
if (typeof window !== "undefined") {
  window.ISL_DICTIONARY = ISL_DICTIONARY;
  window.ISL_ALPHABET = ISL_ALPHABET;
  window.englishToISLGloss = englishToISLGloss;
  window.resolveDictionaryItem = resolveDictionaryItem;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ISL_DICTIONARY,
    ISL_ALPHABET,
    englishToISLGloss,
    resolveDictionaryItem
  };
}
