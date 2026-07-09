(() => {
  'use strict';

  const STORAGE_KEYS = {
    pairs: 'evt_pairs_v1',
    review: 'evt_review_items_v2',
    legacyReview: 'evt_review_numbers_v1',
    settings: 'evt_settings_v1',
    progress: 'evt_progress_v1'
  };

  const DEFAULT_SETTINGS = {
    ratePl: 1,
    rateEn: 1,
    volume: 1,
    voicePl: '',
    voiceEn: '',
    recognitionLang: 'en-US',
    evaluationMode: 'none',
    autoMic: true,
    autoLanguageSwitch: false,
    keepScreenAwake: true,
    bluetoothControls: false,
    carMode: false,
    carAnswerDelay: 8,
    carAfterCheckDelay: 4,
    keyboardControls: false,
    pilotControls: false,
    pilotCustomBindings: {},
    shortcutCheck: 'Enter',
    shortcutNext: 'ArrowRight',
    shortcutPrev: 'ArrowLeft',
    shortcutAdd: 'd',
    shortcutRepeat: 'r',
    shortcutMic: 'm',
    shortcutStartStop: 's'
  };



  const PILOT_ACTION_LABELS = {
    check: 'Sprawdź',
    next: 'Następne',
    prev: 'Poprzednie',
    repeat: 'Powtórz',
    addReview: 'Dodaj do powtórek',
    startStop: 'Start / Stop',
    mic: 'Mikrofon'
  };

  const PILOT_DEFAULT_BINDINGS = {
    check: [
      { type: 'key', value: 'Enter' },
      { type: 'key', value: 'Space' },
      { type: 'media', value: 'play' },
      { type: 'media', value: 'pause' }
    ],
    next: [
      { type: 'key', value: 'ArrowRight' },
      { type: 'media', value: 'nexttrack' }
    ],
    prev: [
      { type: 'key', value: 'ArrowLeft' },
      { type: 'media', value: 'previoustrack' }
    ],
    repeat: [
      { type: 'key', value: 'ArrowUp' },
      { type: 'media', value: 'seekbackward' }
    ],
    addReview: [
      { type: 'key', value: 'ArrowDown' },
      { type: 'media', value: 'seekforward' }
    ],
    startStop: [
      { type: 'key', value: 's' },
      { type: 'media', value: 'stop' }
    ],
    mic: [
      { type: 'key', value: 'm' }
    ]
  };

  const state = {
    pairs: [],
    reviewItems: [],
    mode: 'all',
    currentIndex: 0,
    revealed: false,
    running: false,
    listening: false,
    recognition: null,
    voices: [],
    recognizedAnswer: '',
    currentFeedback: null,
    wakeLock: null,
    wakeLockSupported: false,
    mediaSessionSupported: false,
    headsetControlsActive: false,
    lastMediaActionKey: '',
    lastMediaActionTime: 0,
    carCheckTimer: null,
    carNextTimer: null,
    carCountdownInterval: null,
    carCountdownPhase: '',
    carCountdownLabel: '',
    carCountdownEndAt: 0,
    carCountdownTotalMs: 0,
    lastKeyboardActionKey: '',
    lastKeyboardActionTime: 0,
    lastPilotActionKey: '',
    lastPilotActionTime: 0,
    pilotAssignAction: '',
    lastPilotEvent: null,
    restartRecognitionAfterSpeech: false,
    changingRecognitionLanguage: false,
    recognitionRestartTimer: null,
    speaking: false,
    ignoreSpeechUntil: 0,
    deferredInstallPrompt: null,
    settings: { ...DEFAULT_SETTINGS }
  };

  const el = {
    installStatus: document.getElementById('installStatus'),
    studyMode: document.getElementById('studyMode'),
    progressText: document.getElementById('progressText'),
    progressBar: document.getElementById('progressBar'),
    pairNumber: document.getElementById('pairNumber'),
    polishText: document.getElementById('polishText'),
    recognizedText: document.getElementById('recognizedText'),
    evaluationBox: document.getElementById('evaluationBox'),
    evaluationScore: document.getElementById('evaluationScore'),
    evaluationComment: document.getElementById('evaluationComment'),
    evaluationModeLabel: document.getElementById('evaluationModeLabel'),
    missingWords: document.getElementById('missingWords'),
    extraWords: document.getElementById('extraWords'),
    orderInfo: document.getElementById('orderInfo'),
    suggestionInfo: document.getElementById('suggestionInfo'),
    correctAnswerBox: document.getElementById('correctAnswerBox'),
    englishText: document.getElementById('englishText'),
    status: document.getElementById('status'),
    startBtn: document.getElementById('startBtn'),
    startNumberInput: document.getElementById('startNumberInput'),
    startNumberBtn: document.getElementById('startNumberBtn'),
    captureAnswerBtn: document.getElementById('captureAnswerBtn'),
    checkBtn: document.getElementById('checkBtn'),
    clearAnswerBtn: document.getElementById('clearAnswerBtn'),
    nextBtn: document.getElementById('nextBtn'),
    prevBtn: document.getElementById('prevBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    addReviewBtn: document.getElementById('addReviewBtn'),
    showReviewBtn: document.getElementById('showReviewBtn'),
    stopBtn: document.getElementById('stopBtn'),
    importText: document.getElementById('importText'),
    importTextBtn: document.getElementById('importTextBtn'),
    csvFile: document.getElementById('csvFile'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    importInfo: document.getElementById('importInfo'),
    loadedPairsBody: document.getElementById('loadedPairsBody'),
    loadedPreviewCount: document.getElementById('loadedPreviewCount'),
    ratePlInput: document.getElementById('ratePlInput'),
    ratePlValue: document.getElementById('ratePlValue'),
    rateEnInput: document.getElementById('rateEnInput'),
    rateEnValue: document.getElementById('rateEnValue'),
    volumeInput: document.getElementById('volumeInput'),
    volumeValue: document.getElementById('volumeValue'),
    voicePl: document.getElementById('voicePl'),
    voiceEn: document.getElementById('voiceEn'),
    recognitionLang: document.getElementById('recognitionLang'),
    evaluationMode: document.getElementById('evaluationMode'),
    autoMic: document.getElementById('autoMic'),
    autoLanguageSwitch: document.getElementById('autoLanguageSwitch'),
    keepScreenAwake: document.getElementById('keepScreenAwake'),
    bluetoothControls: document.getElementById('bluetoothControls'),
    carMode: document.getElementById('carMode'),
    carAnswerDelay: document.getElementById('carAnswerDelay'),
    carAfterCheckDelay: document.getElementById('carAfterCheckDelay'),
    carModeStatus: document.getElementById('carModeStatus'),
    carCountdownBox: document.getElementById('carCountdownBox'),
    carCountdownLabel: document.getElementById('carCountdownLabel'),
    carCountdownValue: document.getElementById('carCountdownValue'),
    carCountdownBar: document.getElementById('carCountdownBar'),
    keyboardControls: document.getElementById('keyboardControls'),
    shortcutCheck: document.getElementById('shortcutCheck'),
    shortcutNext: document.getElementById('shortcutNext'),
    shortcutPrev: document.getElementById('shortcutPrev'),
    shortcutAdd: document.getElementById('shortcutAdd'),
    shortcutRepeat: document.getElementById('shortcutRepeat'),
    shortcutMic: document.getElementById('shortcutMic'),
    shortcutStartStop: document.getElementById('shortcutStartStop'),
    keyboardStatus: document.getElementById('keyboardStatus'),
    pilotControls: document.getElementById('pilotControls'),
    pilotStatus: document.getElementById('pilotStatus'),
    pilotTestStatus: document.getElementById('pilotTestStatus'),
    pilotAssignCheck: document.getElementById('pilotAssignCheck'),
    pilotAssignNext: document.getElementById('pilotAssignNext'),
    pilotAssignPrev: document.getElementById('pilotAssignPrev'),
    pilotAssignRepeat: document.getElementById('pilotAssignRepeat'),
    pilotAssignAdd: document.getElementById('pilotAssignAdd'),
    pilotAssignStartStop: document.getElementById('pilotAssignStartStop'),
    pilotAssignMic: document.getElementById('pilotAssignMic'),
    resetPilotMappingsBtn: document.getElementById('resetPilotMappingsBtn'),
    headsetStatus: document.getElementById('headsetStatus'),
    micBtn: document.getElementById('micBtn'),
    testPlBtn: document.getElementById('testPlBtn'),
    testEnBtn: document.getElementById('testEnBtn'),
    speechInfo: document.getElementById('speechInfo'),
    reviewList: document.getElementById('reviewList'),
    reviewCount: document.getElementById('reviewCount'),
    reviewPanel: document.getElementById('reviewPanel'),
    studyReviewBtn: document.getElementById('studyReviewBtn'),
    exportReviewBtn: document.getElementById('exportReviewBtn'),
    clearReviewBtn: document.getElementById('clearReviewBtn')
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    loadState();
    bindEvents();
    setupPwa();
    setupSpeechRecognition();
    setupWakeLock();
    setupMediaSession();
    setupKeyboardControls();
    setupPilotControls();
    loadVoices();
    applySettingsToUi();
    renderAll();
  }

  function bindEvents() {
    el.startBtn.addEventListener('click', startStudy);
    el.startNumberBtn.addEventListener('click', startFromTypedNumber);
    el.startNumberInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') startFromTypedNumber();
    });
    el.stopBtn.addEventListener('click', stopStudy);
    el.captureAnswerBtn.addEventListener('click', () => prepareForEnglishAnswer(true));
    el.clearAnswerBtn.addEventListener('click', clearCurrentAnswer);
    el.checkBtn.addEventListener('click', revealAnswer);
    el.nextBtn.addEventListener('click', nextPair);
    el.prevBtn.addEventListener('click', prevPair);
    el.repeatBtn.addEventListener('click', repeatCurrent);
    el.addReviewBtn.addEventListener('click', addCurrentToReview);
    el.showReviewBtn.addEventListener('click', () => scrollToReview());
    el.studyReviewBtn.addEventListener('click', () => {
      el.studyMode.value = 'review';
      state.mode = 'review';
      state.currentIndex = 0;
      saveProgress();
      startStudy();
    });

    el.studyMode.addEventListener('change', () => {
      state.mode = el.studyMode.value;
      state.currentIndex = 0;
      saveProgress();
      state.revealed = false;
      resetCurrentAnswer();
      renderLearning();
    });

    el.importTextBtn.addEventListener('click', () => importFromText(el.importText.value));
    el.csvFile.addEventListener('change', importFromFile);
    el.clearDataBtn.addEventListener('click', clearData);
    el.clearReviewBtn.addEventListener('click', clearReview);
    el.exportReviewBtn.addEventListener('click', exportReviewCsv);

    el.ratePlInput.addEventListener('input', () => {
      state.settings.ratePl = Number(el.ratePlInput.value);
      el.ratePlValue.textContent = state.settings.ratePl.toFixed(1);
      saveSettings();
    });
    el.rateEnInput.addEventListener('input', () => {
      state.settings.rateEn = Number(el.rateEnInput.value);
      el.rateEnValue.textContent = state.settings.rateEn.toFixed(1);
      saveSettings();
    });
    el.volumeInput.addEventListener('input', () => {
      state.settings.volume = Number(el.volumeInput.value);
      el.volumeValue.textContent = state.settings.volume.toFixed(1);
      saveSettings();
    });
    el.voicePl.addEventListener('change', () => {
      state.settings.voicePl = el.voicePl.value;
      saveSettings();
    });
    el.voiceEn.addEventListener('change', () => {
      state.settings.voiceEn = el.voiceEn.value;
      saveSettings();
    });
    el.recognitionLang.addEventListener('change', () => {
      setRecognitionLanguage(el.recognitionLang.value, true);
      setStatus(`Język rozpoznawania ustawiony na ${el.recognitionLang.value}. Nasłuchiwane są tylko komendy sterujące po angielsku.`);
    });

    el.evaluationMode.addEventListener('change', () => {
      // Wersja v13: ocena odpowiedzi jest celowo wyłączona. Rozpoznawanie mowy służy tylko do komend.
      state.settings.evaluationMode = 'none';
      el.evaluationMode.value = 'none';
      state.currentFeedback = null;
      saveSettings();
      renderEvaluationState();
      setStatus('Ocena wypowiedzi jest wyłączona. Mikrofon rozpoznaje tylko komendy po angielsku.');
    });

    el.autoMic.addEventListener('change', () => {
      state.settings.autoMic = el.autoMic.checked;
      saveSettings();
      setStatus(state.settings.autoMic
        ? 'Automatyczne utrzymywanie mikrofonu podczas nauki jest włączone.'
        : 'Automatyczne utrzymywanie mikrofonu podczas nauki jest wyłączone.');
    });

    if (el.autoLanguageSwitch) {
      el.autoLanguageSwitch.addEventListener('change', () => {
        state.settings.autoLanguageSwitch = false;
        el.autoLanguageSwitch.checked = false;
        saveSettings();
        setStatus('Przełączanie języka jest wyłączone. Program nasłuchuje tylko języka angielskiego.');
      });
    }

    el.keepScreenAwake.addEventListener('change', async () => {
      state.settings.keepScreenAwake = el.keepScreenAwake.checked;
      saveSettings();
      if (state.settings.keepScreenAwake && state.running) {
        await requestWakeLock();
      } else {
        await releaseWakeLock();
      }
      setStatus(state.settings.keepScreenAwake
        ? 'Opcja niewygaszania ekranu jest włączona.'
        : 'Opcja niewygaszania ekranu jest wyłączona.');
    });

    el.bluetoothControls.addEventListener('change', () => {
      state.settings.bluetoothControls = el.bluetoothControls.checked;
      saveSettings();
      if (state.settings.bluetoothControls) {
        activateBluetoothControls(true);
      } else {
        deactivateBluetoothControls(true);
      }
    });

    el.carMode.addEventListener('change', () => {
      state.settings.carMode = el.carMode.checked;
      saveSettings();
      updateCarModeStatus();
      if (!state.settings.carMode) {
        clearCarTimers();
        setStatus('Tryb samochodowy wyłączony. Aplikacja czeka na komendy i przyciski.');
      } else {
        setStatus('Tryb samochodowy włączony. Aplikacja będzie automatycznie sprawdzać odpowiedź i przechodzić dalej.');
        if (state.running) {
          if (state.revealed) scheduleCarNextPair();
          else scheduleCarAnswerCheck();
        }
      }
    });

    el.carAnswerDelay.addEventListener('input', () => {
      state.settings.carAnswerDelay = clampNumber(el.carAnswerDelay.value, 2, 60, DEFAULT_SETTINGS.carAnswerDelay);
      el.carAnswerDelay.value = String(state.settings.carAnswerDelay);
      saveSettings();
      updateCarModeStatus();
      scheduleCarAnswerCheck();
    });

    el.carAfterCheckDelay.addEventListener('input', () => {
      state.settings.carAfterCheckDelay = clampNumber(el.carAfterCheckDelay.value, 1, 30, DEFAULT_SETTINGS.carAfterCheckDelay);
      el.carAfterCheckDelay.value = String(state.settings.carAfterCheckDelay);
      saveSettings();
      updateCarModeStatus();
      if (state.settings.carMode && state.running && state.revealed) scheduleCarNextPair();
    });

    el.keyboardControls.addEventListener('change', () => {
      state.settings.keyboardControls = el.keyboardControls.checked;
      saveSettings();
      updateKeyboardStatus();
      setStatus(state.settings.keyboardControls
        ? 'Sterowanie klawiaturą albo pilotem Bluetooth HID jest włączone.'
        : 'Sterowanie klawiaturą albo pilotem Bluetooth HID jest wyłączone.');
    });

    bindShortcutInput(el.shortcutCheck, 'shortcutCheck');
    bindShortcutInput(el.shortcutNext, 'shortcutNext');
    bindShortcutInput(el.shortcutPrev, 'shortcutPrev');
    bindShortcutInput(el.shortcutAdd, 'shortcutAdd');
    bindShortcutInput(el.shortcutRepeat, 'shortcutRepeat');
    bindShortcutInput(el.shortcutMic, 'shortcutMic');
    bindShortcutInput(el.shortcutStartStop, 'shortcutStartStop');

    if (el.pilotControls) {
      el.pilotControls.addEventListener('change', () => {
        state.settings.pilotControls = el.pilotControls.checked;
        saveSettings();
        registerMediaSessionHandlers();
        updatePilotStatus(state.settings.pilotControls
          ? 'Pilot Bluetooth aktywny. Naciśnij przycisk pilota, aby sprawdzić zdarzenie.'
          : 'Pilot Bluetooth wyłączony.');
        setStatus(state.settings.pilotControls
          ? 'Sterowanie pilotem Bluetooth / pierścieniem jest włączone.'
          : 'Sterowanie pilotem Bluetooth / pierścieniem jest wyłączone.');
      });
    }

    document.querySelectorAll('[data-pilot-action]').forEach((button) => {
      button.addEventListener('click', () => startPilotAssignment(button.dataset.pilotAction));
    });

    if (el.resetPilotMappingsBtn) {
      el.resetPilotMappingsBtn.addEventListener('click', resetPilotMappings);
    }

    el.micBtn.addEventListener('click', toggleListening);
    el.testPlBtn.addEventListener('click', () => speak('To jest test polskiego głosu.', 'pl-PL'));
    el.testEnBtn.addEventListener('click', () => speak('This is a test of the English voice.', 'en-US'));
  }

  function loadState() {
    try {
      const storedPairs = JSON.parse(localStorage.getItem(STORAGE_KEYS.pairs) || '[]');
      const storedReview = JSON.parse(localStorage.getItem(STORAGE_KEYS.review) || '[]');
      const legacyReview = JSON.parse(localStorage.getItem(STORAGE_KEYS.legacyReview) || '[]');
      const storedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');
      const storedProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}');

      state.pairs = Array.isArray(storedPairs) ? storedPairs.filter(isValidPair) : [];
      state.reviewItems = normalizeStoredReview(storedReview, legacyReview);
      state.settings = { ...DEFAULT_SETTINGS, ...storedSettings };
      state.settings.pilotCustomBindings = normalizePilotCustomBindings(state.settings.pilotCustomBindings);
      forceEnglishOnlyRecognitionSettings();
      if (storedSettings.rate && !storedSettings.ratePl) state.settings.ratePl = Number(storedSettings.rate) || DEFAULT_SETTINGS.ratePl;
      if (storedSettings.rate && !storedSettings.rateEn) state.settings.rateEn = Number(storedSettings.rate) || DEFAULT_SETTINGS.rateEn;
      if (typeof storedSettings.evaluateAnswer === 'boolean' && !storedSettings.evaluationMode) {
        state.settings.evaluationMode = 'none';
      }
      restoreProgress(storedProgress);
      saveReview();
    } catch (err) {
      console.error(err);
      state.pairs = [];
      state.reviewItems = [];
      state.settings = { ...DEFAULT_SETTINGS };
      state.settings.pilotCustomBindings = {};
      forceEnglishOnlyRecognitionSettings();
    }
  }


  function forceEnglishOnlyRecognitionSettings() {
    if (!['en-US', 'en-GB'].includes(state.settings.recognitionLang)) {
      state.settings.recognitionLang = 'en-US';
    }
    state.settings.autoLanguageSwitch = false;
    // v13: brak oceny wypowiedzi; rozpoznawanie mowy obsługuje wyłącznie komendy.
    state.settings.evaluationMode = 'none';
  }

  function normalizeStoredReview(storedReview, legacyReview) {
    if (Array.isArray(storedReview) && storedReview.some((item) => item && typeof item === 'object' && item.pl && item.en)) {
      return uniquePairs(storedReview.filter(isValidPair));
    }

    const numbers = Array.isArray(storedReview) && storedReview.length ? storedReview : legacyReview;
    if (Array.isArray(numbers) && numbers.length && state.pairs.length) {
      const wanted = new Set(numbers.map(String));
      return uniquePairs(state.pairs.filter((pair) => wanted.has(String(pair.nr))));
    }

    return [];
  }

  function restoreProgress(progress) {
    if (!progress) return;
    if (progress.mode === 'review' || progress.mode === 'all') {
      state.mode = progress.mode;
    }
    const list = state.mode === 'review' ? state.reviewItems : state.pairs;
    if (!list.length) return;
    const indexByKey = list.findIndex((pair) => pairIdentity(pair) === progress.pairKey);
    const indexByNumber = list.findIndex((pair) => String(pair.nr) === String(progress.nr));
    const indexByStoredIndex = Number.isInteger(progress.currentIndex) ? progress.currentIndex : -1;
    const index = indexByKey >= 0 ? indexByKey : indexByNumber >= 0 ? indexByNumber : indexByStoredIndex;
    if (index >= 0 && index < list.length) state.currentIndex = index;
  }

  function savePairs() {
    localStorage.setItem(STORAGE_KEYS.pairs, JSON.stringify(state.pairs));
  }

  function saveReview() {
    localStorage.setItem(STORAGE_KEYS.review, JSON.stringify(uniquePairs(state.reviewItems)));
  }

  function saveProgress() {
    const pair = getCurrentPair();
    const progress = {
      mode: state.mode,
      currentIndex: state.currentIndex,
      nr: pair ? pair.nr : null,
      pairKey: pair ? pairIdentity(pair) : null,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  }

  function saveSettings() {
    state.settings.pilotCustomBindings = normalizePilotCustomBindings(state.settings.pilotCustomBindings);
    forceEnglishOnlyRecognitionSettings();
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }

  function applySettingsToUi() {
    el.ratePlInput.value = String(state.settings.ratePl);
    el.ratePlValue.textContent = Number(state.settings.ratePl).toFixed(1);
    el.rateEnInput.value = String(state.settings.rateEn);
    el.rateEnValue.textContent = Number(state.settings.rateEn).toFixed(1);
    el.volumeInput.value = String(state.settings.volume);
    el.volumeValue.textContent = Number(state.settings.volume).toFixed(1);
    el.studyMode.value = state.mode;
    forceEnglishOnlyRecognitionSettings();
    el.recognitionLang.value = state.settings.recognitionLang;
    state.settings.evaluationMode = 'none';
    el.evaluationMode.value = 'none';
    el.autoMic.checked = Boolean(state.settings.autoMic);
    if (el.autoLanguageSwitch) el.autoLanguageSwitch.checked = false;
    el.keepScreenAwake.checked = Boolean(state.settings.keepScreenAwake);
    el.bluetoothControls.checked = Boolean(state.settings.bluetoothControls);
    el.carMode.checked = Boolean(state.settings.carMode);
    el.carAnswerDelay.value = String(clampNumber(state.settings.carAnswerDelay, 2, 60, DEFAULT_SETTINGS.carAnswerDelay));
    el.carAfterCheckDelay.value = String(clampNumber(state.settings.carAfterCheckDelay, 1, 30, DEFAULT_SETTINGS.carAfterCheckDelay));
    el.keyboardControls.checked = Boolean(state.settings.keyboardControls);
    if (el.pilotControls) el.pilotControls.checked = Boolean(state.settings.pilotControls);
    renderShortcutInputs();
    renderPilotMappings();
    updateCarModeStatus();
    updateKeyboardStatus();
    updatePilotStatus();
  }

  function setupPwa() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => setInstallStatus('PWA gotowa'))
        .catch(() => setInstallStatus('PWA bez offline'));
    } else {
      setInstallStatus('Brak SW');
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      setInstallStatus('Można zainstalować');
      el.installStatus.title = 'Kliknij, aby wywołać instalację PWA.';
    });

    el.installStatus.addEventListener('click', async () => {
      if (!state.deferredInstallPrompt) return;
      state.deferredInstallPrompt.prompt();
      await state.deferredInstallPrompt.userChoice;
      state.deferredInstallPrompt = null;
    });
  }

  function setInstallStatus(text) {
    el.installStatus.textContent = text;
  }

  function setupWakeLock() {
    state.wakeLockSupported = 'wakeLock' in navigator;
    if (!state.wakeLockSupported && el.keepScreenAwake) {
      el.keepScreenAwake.title = 'Ta przeglądarka nie obsługuje Screen Wake Lock API albo strona nie działa przez HTTPS.';
    }

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && state.running && state.settings.keepScreenAwake) {
        await requestWakeLock();
      }
    });
  }

  async function requestWakeLock() {
    if (!state.settings.keepScreenAwake || !state.running) return;
    if (!('wakeLock' in navigator)) {
      setStatus('Ta przeglądarka nie obsługuje blokady wygaszania ekranu albo aplikacja nie działa przez HTTPS.', 'warning');
      return;
    }

    try {
      if (state.wakeLock) return;
      state.wakeLock = await navigator.wakeLock.request('screen');
      state.wakeLock.addEventListener('release', () => {
        state.wakeLock = null;
      });
      setStatus('Ekran nie powinien się wygaszać podczas nauki.');
    } catch (err) {
      setStatus(`Nie udało się włączyć blokady wygaszania ekranu: ${err.message || err.name}.`, 'warning');
    }
  }

  async function releaseWakeLock() {
    if (!state.wakeLock) return;
    try {
      await state.wakeLock.release();
    } catch (err) {
      // System albo przeglądarka mogły zwolnić blokadę wcześniej.
    } finally {
      state.wakeLock = null;
    }
  }

  function setupMediaSession() {
    state.mediaSessionSupported = 'mediaSession' in navigator;
    if (!state.mediaSessionSupported) {
      state.settings.bluetoothControls = false;
      saveSettings();
      if (el.bluetoothControls) {
        el.bluetoothControls.checked = false;
        el.bluetoothControls.disabled = true;
        el.bluetoothControls.title = 'Ta przeglądarka nie obsługuje Media Session API.';
      }
      updateHeadsetStatus('Sterowanie słuchawkami niedostępne w tej przeglądarce.');
      updatePilotStatus();
      return;
    }

    registerMediaSessionHandlers();
    if (state.settings.bluetoothControls) {
      activateBluetoothControls(false);
    } else {
      updateHeadsetStatus('Sterowanie słuchawkami wyłączone.');
    }
    updatePilotStatus();
  }

  function registerMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;

    const handlers = {
      play: () => handleMediaSessionAction('play'),
      pause: () => handleMediaSessionAction('pause'),
      nexttrack: () => handleMediaSessionAction('nexttrack'),
      previoustrack: () => handleMediaSessionAction('previoustrack'),
      seekbackward: () => handleMediaSessionAction('seekbackward'),
      seekforward: () => handleMediaSessionAction('seekforward'),
      stop: () => handleMediaSessionAction('stop')
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (err) {
        // Nie każda przeglądarka obsługuje komplet akcji multimedialnych.
      }
    });

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Angielski Głosowo',
        artist: 'Sterowanie nauką',
        album: 'Przyciski słuchawek Bluetooth'
      });
    } catch (err) {
      // Starsze wersje przeglądarek mogą nie mieć konstruktora MediaMetadata.
    }
  }

  function activateBluetoothControls(fromUserAction = false) {
    if (!('mediaSession' in navigator)) {
      state.settings.bluetoothControls = false;
      if (el.bluetoothControls) el.bluetoothControls.checked = false;
      saveSettings();
      updateHeadsetStatus('Sterowanie słuchawkami niedostępne w tej przeglądarce.');
      setStatus('Ta przeglądarka nie obsługuje sterowania słuchawkami przez Media Session API.', 'warning');
      return;
    }

    registerMediaSessionHandlers();
    state.headsetControlsActive = true;
    updateMediaPlaybackState();
    updateHeadsetStatus('Sterowanie słuchawkami aktywne: Play/Pause = Sprawdź, Next = Następne, Previous = Poprzednie.');
    if (fromUserAction) {
      setStatus('Sterowanie słuchawkami Bluetooth aktywne. Play/Pause = Sprawdź, Next = Następne, Previous = Poprzednie.');
    }
  }

  function deactivateBluetoothControls(fromUserAction = false) {
    state.headsetControlsActive = false;

    if ('mediaSession' in navigator) {
      ['play', 'pause', 'nexttrack', 'previoustrack', 'seekbackward', 'seekforward', 'stop'].forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (err) {
          // Ignorujemy brak obsługi czyszczenia danej akcji.
        }
      });
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch (err) {
        // Brak obsługi stanu sesji multimedialnej.
      }
    }

    if (state.settings.pilotControls) registerMediaSessionHandlers();
    updateHeadsetStatus('Sterowanie słuchawkami wyłączone.');
    updateMediaPlaybackState();
    if (fromUserAction) setStatus('Sterowanie słuchawkami Bluetooth wyłączone.');
  }

  function updateMediaPlaybackState() {
    if ((!state.settings.bluetoothControls && !state.settings.pilotControls) || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state.running ? 'playing' : 'paused';
    } catch (err) {
      // Część przeglądarek ignoruje playbackState.
    }
  }

  function runHeadsetAction(actionKey, action, statusText) {
    if (!state.settings.bluetoothControls || !state.headsetControlsActive) return;

    const now = Date.now();
    const sameActionTooSoon = state.lastMediaActionKey === actionKey && now - state.lastMediaActionTime < 1200;
    const anyActionTooSoon = now - state.lastMediaActionTime < 350;
    if (sameActionTooSoon || anyActionTooSoon) return;

    state.lastMediaActionKey = actionKey;
    state.lastMediaActionTime = now;
    action();
    if (statusText) updateHeadsetStatus(`${statusText} Sterowanie słuchawkami aktywne.`);
  }

  function updateHeadsetStatus(text) {
    if (el.headsetStatus) el.headsetStatus.textContent = text;
  }

  function setupPilotControls() {
    document.addEventListener('keydown', handlePilotKeyDown, true);
    renderPilotMappings();
    updatePilotStatus();
  }

  function handlePilotKeyDown(event) {
    const key = normalizeKeyboardKey(event.key);
    if (!key) return;

    const binding = { type: 'key', value: key };
    const shouldObserve = state.settings.pilotControls || state.pilotAssignAction;
    if (shouldObserve) updatePilotDetectedEvent(binding, event);

    if (state.pilotAssignAction) {
      event.preventDefault();
      event.stopPropagation();
      completePilotAssignment(binding);
      return;
    }

    if (!state.settings.pilotControls) return;
    if (isEditableElement(event.target)) return;

    const action = getPilotActionForBinding(binding);
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    runPilotAction(action, binding);
  }

  function handleMediaSessionAction(mediaAction) {
    const binding = { type: 'media', value: mediaAction };
    updatePilotDetectedEvent(binding);

    if (state.pilotAssignAction) {
      completePilotAssignment(binding);
      return;
    }

    if (state.settings.pilotControls) {
      const action = getPilotActionForBinding(binding);
      if (action) {
        runPilotAction(action, binding);
        return;
      }
    }

    const fallback = {
      play: 'check',
      pause: 'check',
      nexttrack: 'next',
      previoustrack: 'prev',
      seekbackward: 'repeat',
      seekforward: 'addReview',
      stop: 'startStop'
    }[mediaAction];
    if (fallback && state.settings.bluetoothControls && state.headsetControlsActive) {
      runHeadsetAction(fallback, () => runAppAction(fallback), `Słuchawki: ${PILOT_ACTION_LABELS[fallback] || fallback}.`);
    }
  }

  function startPilotAssignment(action) {
    if (!PILOT_ACTION_LABELS[action]) return;
    state.pilotAssignAction = action;
    updatePilotStatus(`Oczekiwanie na przycisk pilota dla funkcji: ${PILOT_ACTION_LABELS[action]}. Naciśnij przycisk pierścienia.`);
    setStatus(`Tryb przypisywania: naciśnij przycisk pilota dla funkcji „${PILOT_ACTION_LABELS[action]}”.`);
    if (el.pilotTestStatus) {
      el.pilotTestStatus.textContent = `Oczekiwanie na zdarzenie: ${PILOT_ACTION_LABELS[action]}.`;
    }
  }

  function completePilotAssignment(binding) {
    const action = state.pilotAssignAction;
    if (!action) return;
    state.settings.pilotCustomBindings = normalizePilotCustomBindings(state.settings.pilotCustomBindings);
    state.settings.pilotCustomBindings[action] = binding;
    state.pilotAssignAction = '';
    saveSettings();
    renderPilotMappings();
    updatePilotStatus(`Przypisano ${formatPilotBinding(binding)} do funkcji ${PILOT_ACTION_LABELS[action]}.`);
    setStatus(`Przypisano przycisk pilota: ${formatPilotBinding(binding)} → ${PILOT_ACTION_LABELS[action]}.`);
  }

  function resetPilotMappings() {
    state.settings.pilotCustomBindings = {};
    state.pilotAssignAction = '';
    saveSettings();
    renderPilotMappings();
    updatePilotStatus('Wyczyszczono własne przypisania pilota. Aktywne są mapowania domyślne.');
    setStatus('Wyczyszczono przypisania pilota Bluetooth / pierścienia.');
  }

  function updatePilotDetectedEvent(binding, event = null) {
    state.lastPilotEvent = {
      ...binding,
      code: event ? event.code : '',
      time: new Date().toLocaleTimeString()
    };
    const action = getPilotActionForBinding(binding);
    const canAssign = binding.type === 'key' || binding.type === 'media';
    if (!el.pilotTestStatus) return;
    const typeLabel = binding.type === 'media' ? 'zdarzenie multimedialne' : 'klawisz HID / keydown';
    const codeText = event && event.code ? `, code: ${event.code}` : '';
    const actionText = action ? `Funkcja: ${PILOT_ACTION_LABELS[action]}.` : 'Brak przypisanej funkcji.';
    const assignText = canAssign ? 'Można przypisać do funkcji programu.' : 'Nie można przypisać tego zdarzenia.';
    el.pilotTestStatus.textContent = `Wykryto ${typeLabel}: ${formatPilotBinding(binding)}${codeText}. ${actionText} ${assignText}`;
  }

  function getPilotActionForBinding(binding) {
    const normalized = normalizePilotBinding(binding);
    if (!normalized) return '';

    const custom = normalizePilotCustomBindings(state.settings.pilotCustomBindings);
    for (const [action, customBinding] of Object.entries(custom)) {
      if (pilotBindingEquals(customBinding, normalized)) return action;
    }

    for (const [action, bindings] of Object.entries(PILOT_DEFAULT_BINDINGS)) {
      if (bindings.some((candidate) => pilotBindingEquals(candidate, normalized))) return action;
    }

    return '';
  }

  function runPilotAction(action, binding) {
    const now = Date.now();
    const key = `${action}:${binding.type}:${binding.value}`;
    const sameActionTooSoon = state.lastPilotActionKey === key && now - state.lastPilotActionTime < 800;
    const anyActionTooSoon = now - state.lastPilotActionTime < 150;
    if (sameActionTooSoon || anyActionTooSoon) return;

    state.lastPilotActionKey = key;
    state.lastPilotActionTime = now;
    runAppAction(action);
    updatePilotStatus(`Pilot: ${PILOT_ACTION_LABELS[action]} (${formatPilotBinding(binding)}).`);
  }

  function runAppAction(action) {
    const actions = {
      check: revealAnswer,
      next: nextPair,
      prev: prevPair,
      addReview: addCurrentToReview,
      repeat: repeatCurrent,
      mic: toggleListening,
      startStop: () => state.running ? stopStudy() : startStudy()
    };
    if (actions[action]) actions[action]();
  }

  function normalizePilotBinding(binding) {
    if (!binding || !binding.type || !binding.value) return null;
    const type = binding.type === 'media' ? 'media' : 'key';
    const value = type === 'key' ? normalizeKeyboardKey(binding.value) : String(binding.value).toLowerCase();
    if (!value) return null;
    return { type, value };
  }

  function pilotBindingEquals(a, b) {
    const left = normalizePilotBinding(a);
    const right = normalizePilotBinding(b);
    return Boolean(left && right && left.type === right.type && left.value === right.value);
  }

  function normalizePilotCustomBindings(bindings) {
    const output = {};
    if (!bindings || typeof bindings !== 'object') return output;
    Object.entries(bindings).forEach(([action, binding]) => {
      if (!PILOT_ACTION_LABELS[action]) return;
      const normalized = normalizePilotBinding(binding);
      if (normalized) output[action] = normalized;
    });
    return output;
  }

  function formatPilotBinding(binding) {
    const normalized = normalizePilotBinding(binding);
    if (!normalized) return '—';
    if (normalized.type === 'media') return `Media:${normalized.value}`;
    return `Key:${formatShortcutKey(normalized.value)}`;
  }

  function renderPilotMappings() {
    const map = {
      check: el.pilotAssignCheck,
      next: el.pilotAssignNext,
      prev: el.pilotAssignPrev,
      repeat: el.pilotAssignRepeat,
      addReview: el.pilotAssignAdd,
      startStop: el.pilotAssignStartStop,
      mic: el.pilotAssignMic
    };
    const custom = normalizePilotCustomBindings(state.settings.pilotCustomBindings);
    Object.entries(map).forEach(([action, node]) => {
      if (!node) return;
      const defaultText = (PILOT_DEFAULT_BINDINGS[action] || []).map(formatPilotBinding).join(', ');
      node.textContent = custom[action] ? `${formatPilotBinding(custom[action])} (własne)` : defaultText || 'brak';
      node.title = custom[action]
        ? `Własne przypisanie. Domyślne: ${defaultText}`
        : `Mapowania domyślne: ${defaultText}`;
    });
  }

  function updatePilotStatus(text = '') {
    if (!el.pilotStatus) return;
    const media = 'mediaSession' in navigator ? 'Media Session dostępne' : 'Media Session niedostępne';
    const status = state.settings.pilotControls ? 'Pilot Bluetooth aktywny.' : 'Pilot Bluetooth wyłączony.';
    el.pilotStatus.textContent = text || `${status} ${media}. Test wykrywa zdarzenia keydown oraz zdarzenia multimedialne, jeżeli przeglądarka je przekaże.`;
  }



  function setupKeyboardControls() {
    document.addEventListener('keydown', handleGlobalShortcut);
  }

  function bindShortcutInput(input, settingKey) {
    if (!input) return;
    input.addEventListener('keydown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const key = normalizeKeyboardKey(event.key);
      if (!key) return;
      state.settings[settingKey] = key;
      saveSettings();
      renderShortcutInputs();
      updateKeyboardStatus();
      setStatus(`Przypisano skrót: ${getShortcutActionLabel(settingKey)} = ${formatShortcutKey(key)}.`);
    });
    input.addEventListener('focus', () => input.select());
    input.addEventListener('click', () => input.select());
  }

  function handleGlobalShortcut(event) {
    if (!state.settings.keyboardControls) return;
    if (isEditableElement(event.target)) return;

    const key = normalizeKeyboardKey(event.key);
    const action = shortcutActionForKey(key);
    if (!action) return;

    event.preventDefault();
    runKeyboardAction(action);
  }

  function isEditableElement(target) {
    if (!target) return false;
    const tag = String(target.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  function normalizeKeyboardKey(key) {
    if (!key || key === 'Unidentified' || key === 'Dead') return '';
    if (key === ' ') return 'Space';
    if (key.length === 1) return key.toLowerCase();
    return key;
  }

  function formatShortcutKey(key) {
    const labels = {
      Space: 'Spacja',
      Enter: 'Enter',
      ArrowRight: '→',
      ArrowLeft: '←',
      ArrowUp: '↑',
      ArrowDown: '↓',
      Escape: 'Esc'
    };
    return labels[key] || String(key).toUpperCase();
  }

  function shortcutActionForKey(key) {
    const shortcuts = {
      check: state.settings.shortcutCheck,
      next: state.settings.shortcutNext,
      prev: state.settings.shortcutPrev,
      addReview: state.settings.shortcutAdd,
      repeat: state.settings.shortcutRepeat,
      mic: state.settings.shortcutMic,
      startStop: state.settings.shortcutStartStop
    };

    return Object.entries(shortcuts).find(([, shortcut]) => normalizeKeyboardKey(shortcut) === key)?.[0] || null;
  }

  function runKeyboardAction(action) {
    const now = Date.now();
    const sameActionTooSoon = state.lastKeyboardActionKey === action && now - state.lastKeyboardActionTime < 700;
    const anyActionTooSoon = now - state.lastKeyboardActionTime < 120;
    if (sameActionTooSoon || anyActionTooSoon) return;

    state.lastKeyboardActionKey = action;
    state.lastKeyboardActionTime = now;

    const actions = {
      check: revealAnswer,
      next: nextPair,
      prev: prevPair,
      addReview: addCurrentToReview,
      repeat: repeatCurrent,
      mic: toggleListening,
      startStop: () => state.running ? stopStudy() : startStudy()
    };

    if (actions[action]) {
      actions[action]();
      updateKeyboardStatus(`Skrót: ${getShortcutRuntimeLabel(action)}.`);
    }
  }

  function getShortcutActionLabel(settingKey) {
    const labels = {
      shortcutCheck: 'Sprawdź',
      shortcutNext: 'Następne',
      shortcutPrev: 'Poprzednie',
      shortcutAdd: 'Dodaj',
      shortcutRepeat: 'Powtórz',
      shortcutMic: 'Mikrofon',
      shortcutStartStop: 'Start / Stop'
    };
    return labels[settingKey] || settingKey;
  }

  function getShortcutRuntimeLabel(action) {
    const labels = {
      check: 'Sprawdź',
      next: 'Następne',
      prev: 'Poprzednie',
      addReview: 'Dodaj do powtórek',
      repeat: 'Powtórz',
      mic: 'Mikrofon',
      startStop: 'Start / Stop'
    };
    return labels[action] || action;
  }

  function renderShortcutInputs() {
    const map = {
      shortcutCheck: el.shortcutCheck,
      shortcutNext: el.shortcutNext,
      shortcutPrev: el.shortcutPrev,
      shortcutAdd: el.shortcutAdd,
      shortcutRepeat: el.shortcutRepeat,
      shortcutMic: el.shortcutMic,
      shortcutStartStop: el.shortcutStartStop
    };
    Object.entries(map).forEach(([settingKey, input]) => {
      if (!input) return;
      const value = state.settings[settingKey] || DEFAULT_SETTINGS[settingKey];
      input.value = formatShortcutKey(value);
      input.dataset.shortcut = value;
      input.title = 'Kliknij tutaj i naciśnij klawisz, który chcesz przypisać.';
    });
  }

  function updateKeyboardStatus(prefix = '') {
    if (!el.keyboardStatus) return;
    const status = state.settings.keyboardControls ? 'Sterowanie klawiaturą/pilotem aktywne.' : 'Sterowanie klawiaturą/pilotem wyłączone.';
    const map = ` Sprawdź=${formatShortcutKey(state.settings.shortcutCheck)}, Następne=${formatShortcutKey(state.settings.shortcutNext)}, Poprzednie=${formatShortcutKey(state.settings.shortcutPrev)}, Dodaj=${formatShortcutKey(state.settings.shortcutAdd)}, Powtórz=${formatShortcutKey(state.settings.shortcutRepeat)}, Mikrofon=${formatShortcutKey(state.settings.shortcutMic)}, Start/Stop=${formatShortcutKey(state.settings.shortcutStartStop)}.`;
    el.keyboardStatus.textContent = `${prefix ? `${prefix} ` : ''}${status}${map}`;
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function updateCarModeStatus() {
    if (!el.carModeStatus) return;
    const answerDelay = clampNumber(state.settings.carAnswerDelay, 2, 60, DEFAULT_SETTINGS.carAnswerDelay);
    const afterCheckDelay = clampNumber(state.settings.carAfterCheckDelay, 1, 30, DEFAULT_SETTINGS.carAfterCheckDelay);
    const status = state.settings.carMode ? 'Tryb samochodowy aktywny.' : 'Tryb samochodowy wyłączony.';
    el.carModeStatus.textContent = `${status} Sprawdzenie po ${answerDelay} s, następna para po ${afterCheckDelay} s.`;
    renderCarCountdown();
  }

  function clearCarTimers() {
    clearCarCheckTimer();
    clearCarNextTimer();
    clearCarCountdown(true);
  }

  function clearCarCheckTimer() {
    if (state.carCheckTimer) {
      clearTimeout(state.carCheckTimer);
      state.carCheckTimer = null;
    }
    if (state.carCountdownPhase === 'answer') clearCarCountdown(false);
  }

  function clearCarNextTimer() {
    if (state.carNextTimer) {
      clearTimeout(state.carNextTimer);
      state.carNextTimer = null;
    }
    if (state.carCountdownPhase === 'next') clearCarCountdown(false);
  }

  function startCarCountdown(phase, seconds, label) {
    clearCarCountdown(false);
    const totalMs = Math.max(1000, Math.round(Number(seconds) * 1000));
    state.carCountdownPhase = phase;
    state.carCountdownLabel = label;
    state.carCountdownTotalMs = totalMs;
    state.carCountdownEndAt = Date.now() + totalMs;
    renderCarCountdown();
    state.carCountdownInterval = window.setInterval(renderCarCountdown, 250);
  }

  function clearCarCountdown(resetText = false) {
    if (state.carCountdownInterval) {
      clearInterval(state.carCountdownInterval);
      state.carCountdownInterval = null;
    }
    state.carCountdownPhase = '';
    state.carCountdownLabel = '';
    state.carCountdownEndAt = 0;
    state.carCountdownTotalMs = 0;
    if (resetText) renderCarCountdown();
  }

  function renderCarCountdown() {
    if (!el.carCountdownBox) return;
    const carModeActive = Boolean(state.settings.carMode);
    const hasCountdown = carModeActive && state.carCountdownEndAt > 0 && state.carCountdownTotalMs > 0;

    if (!carModeActive) {
      el.carCountdownBox.hidden = true;
      return;
    }

    el.carCountdownBox.hidden = false;

    if (!hasCountdown) {
      el.carCountdownLabel.textContent = state.running
        ? 'Tryb samochodowy gotowy'
        : 'Tryb samochodowy włączony';
      el.carCountdownValue.textContent = '—';
      el.carCountdownBar.style.width = '0%';
      return;
    }

    const remainingMs = Math.max(0, state.carCountdownEndAt - Date.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const elapsedRatio = Math.min(1, Math.max(0, 1 - remainingMs / state.carCountdownTotalMs));
    el.carCountdownLabel.textContent = state.carCountdownLabel || 'Odliczanie';
    el.carCountdownValue.textContent = `${remainingSeconds} s`;
    el.carCountdownBar.style.width = `${Math.round(elapsedRatio * 100)}%`;

    if (remainingMs <= 0 && state.carCountdownInterval) {
      clearInterval(state.carCountdownInterval);
      state.carCountdownInterval = null;
    }
  }

  function scheduleCarAnswerCheck() {
    clearCarCheckTimer();
    if (!state.settings.carMode || !state.running || state.revealed || !getCurrentPair()) {
      renderCarCountdown();
      return;
    }
    const delaySeconds = clampNumber(state.settings.carAnswerDelay, 2, 60, DEFAULT_SETTINGS.carAnswerDelay);
    startCarCountdown('answer', delaySeconds, 'Automatyczne sprawdzenie za');
    state.carCheckTimer = window.setTimeout(() => {
      state.carCheckTimer = null;
      if (state.settings.carMode && state.running && !state.revealed) {
        clearCarCountdown(false);
        revealAnswer();
      }
    }, delaySeconds * 1000);
    updateCarModeStatus();
  }

  function scheduleCarNextPair() {
    clearCarNextTimer();
    if (!state.settings.carMode || !state.running || !state.revealed) {
      renderCarCountdown();
      return;
    }
    const list = getActiveList();
    if (!list.length || state.currentIndex >= list.length - 1) {
      clearCarCountdown(true);
      setStatus('Tryb samochodowy: to ostatnia pozycja na liście. Nauka zatrzymana na końcu listy.', 'warning');
      return;
    }
    const delaySeconds = clampNumber(state.settings.carAfterCheckDelay, 1, 30, DEFAULT_SETTINGS.carAfterCheckDelay);
    startCarCountdown('next', delaySeconds, 'Następna para za');
    state.carNextTimer = window.setTimeout(() => {
      state.carNextTimer = null;
      if (state.settings.carMode && state.running && state.revealed) {
        clearCarCountdown(false);
        nextPair();
      }
    }, delaySeconds * 1000);
    updateCarModeStatus();
  }

  function setupSpeechRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      el.speechInfo.textContent = 'Ta przeglądarka nie udostępnia rozpoznawania mowy Web Speech API. Użyj przycisków ekranowych.';
      el.micBtn.disabled = true;
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = state.settings.recognitionLang;

    recognition.onstart = () => {
      state.listening = true;
      el.micBtn.textContent = 'Mikrofon ON';
      el.speechInfo.textContent = `Mikrofon aktywny. Język: ${recognition.lang}. Nasłuchiwane są tylko komendy sterujące.`;
    };

    recognition.onerror = (event) => {
      // `no-speech` oznacza, że mikrofon działa, ale w krótkim czasie nie wykryto mowy.
      // W trybie nauki nie wyłączamy wtedy mikrofonu — pozwalamy funkcji onend wznowić nasłuch.
      if (event.error === 'no-speech') {
        setStatus('Nie wykryto komendy. Mikrofon nadal nasłuchuje — powiedz krótką komendę po angielsku albo użyj przycisku.', 'warning');
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        state.listening = false;
        el.micBtn.textContent = 'Mikrofon';
        setStatus('Przeglądarka nie pozwoliła użyć mikrofonu. Kliknij ikonę przy adresie strony i ustaw Mikrofon → Zezwalaj. Potem użyj przycisku „Włącz mikrofon”.', 'warning');
        return;
      }

      // `aborted` często pojawia się, gdy celowo zatrzymujemy nasłuch na czas syntezy mowy
      // albo przy zmianie języka rozpoznawania.
      if (event.error === 'aborted' && (state.restartRecognitionAfterSpeech || state.changingRecognitionLanguage)) {
        return;
      }

      state.listening = false;
      el.micBtn.textContent = 'Mikrofon';
      setStatus(`Błąd rozpoznawania mowy: ${event.error}. Sprawdź uprawnienia mikrofonu albo używaj przycisków.`, 'warning');
    };

    recognition.onend = () => {
      if (state.changingRecognitionLanguage) {
        state.changingRecognitionLanguage = false;
        if (state.listening) scheduleRecognitionRestart(300);
        return;
      }

      const shouldRestart = state.listening && !state.restartRecognitionAfterSpeech;
      if (shouldRestart) {
        scheduleRecognitionRestart(650);
      } else if (!state.restartRecognitionAfterSpeech) {
        state.listening = false;
        el.micBtn.textContent = 'Mikrofon';
      }
    };

    recognition.onresult = handleSpeechResult;
    state.recognition = recognition;
  }

  function scheduleRecognitionRestart(delayMs = 650) {
    if (!state.recognition || !state.listening) return;
    if (state.recognitionRestartTimer) clearTimeout(state.recognitionRestartTimer);
    state.recognitionRestartTimer = window.setTimeout(() => {
      state.recognitionRestartTimer = null;
      if (state.listening) safeStartRecognition();
    }, delayMs);
  }

  function safeStartRecognition() {
    if (!state.recognition) return;
    if (state.recognitionRestartTimer) {
      clearTimeout(state.recognitionRestartTimer);
      state.recognitionRestartTimer = null;
    }
    try {
      state.recognition.lang = state.settings.recognitionLang;
      state.recognition.start();
    } catch (err) {
      // Chrome rzuca błąd, jeżeli start() zostanie wywołany, gdy mikrofon już działa.
      // Drugi typowy przypadek to brak aktywnej zgody użytkownika na mikrofon.
      if (err && err.name && err.name !== 'InvalidStateError') {
        setStatus('Nie udało się automatycznie uruchomić mikrofonu. Kliknij przycisk „Mikrofon”.', 'warning');
      }
    }
  }

  function safeStopRecognition(temporary = false) {
    if (!state.recognition) return;
    state.restartRecognitionAfterSpeech = temporary;
    if (state.recognitionRestartTimer) {
      clearTimeout(state.recognitionRestartTimer);
      state.recognitionRestartTimer = null;
    }
    try {
      state.recognition.stop();
    } catch (err) {
      // Ignorujemy, gdy rozpoznawanie nie było aktywne.
    }
  }

  function setRecognitionLanguage(lang, saveAsSetting = true) {
    if (!lang) return;

    if (saveAsSetting) {
      state.settings.recognitionLang = lang;
      el.recognitionLang.value = lang;
      saveSettings();
    }

    if (!state.recognition) return;
    state.recognition.lang = lang;
    el.speechInfo.textContent = `Język rozpoznawania mowy: ${lang}.`;

    if (state.listening && !state.restartRecognitionAfterSpeech) {
      state.changingRecognitionLanguage = true;
      try {
        state.recognition.stop();
      } catch (err) {
        state.changingRecognitionLanguage = false;
      }
    }
  }

  function prepareForEnglishAnswer(forceStart = false) {
    // Wersja v13: aplikacja nie rozpoznaje już treści odpowiedzi użytkownika.
    // Mikrofon służy wyłącznie do krótkich komend sterujących po angielsku.
    if (forceStart) {
      state.listening = true;
      safeStartRecognition();
    }
    setStatus('Rozpoznawanie odpowiedzi jest wyłączone. Powiedz komendę: check, next, back, repeat, add, list, start, stop, clear albo mic.');
  }

  function clearCurrentAnswer() {
    resetCurrentAnswer();
    renderLearning();
    setStatus('Wyczyszczono status rozpoznanej komendy.');
  }

  function resetCurrentAnswer() {
    state.recognizedAnswer = '';
    state.currentFeedback = null;
    if (el.recognizedText) el.recognizedText.textContent = '—';
    renderEvaluationState();
  }

  function toggleListening() {
    if (!state.recognition) return;
    if (state.listening) {
      state.listening = false;
      safeStopRecognition(false);
      el.micBtn.textContent = 'Mikrofon';
      el.speechInfo.textContent = 'Mikrofon wyłączony.';
    } else {
      state.listening = true;
      safeStartRecognition();
    }
  }

  function handleSpeechResult(event) {
    let finalText = '';
    let interimText = '';

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0].transcript.trim();
      if (event.results[i].isFinal) finalText += ` ${text}`;
      else interimText += ` ${text}`;
    }

    const text = (finalText || interimText).trim();
    if (!text) return;

    if (state.speaking || Date.now() < state.ignoreSpeechUntil) {
      return;
    }

    const command = detectCommand(text);
    if (command && finalText) {
      if (el.recognizedText) el.recognizedText.textContent = normalizeCommand(text);
      runCommand(command);
      return;
    }

    // Wersja v13: ignorujemy dłuższe wypowiedzi użytkownika, bo aplikacja nie ocenia tłumaczenia.
    // Rozpoznawanie mowy ma służyć tylko krótkim komendom sterującym.
    if (finalText) {
      if (el.recognizedText) el.recognizedText.textContent = 'zignorowano: brak komendy';
      setStatus('Zignorowano wypowiedź niebędącą komendą. Dostępne komendy: check, next, back, repeat, add, list, start, stop, clear, mic.');
    }
  }

  function stripPolishDiacritics(text) {
    const polishMap = {
      ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
      Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z'
    };

    return String(text || '')
      .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishMap[char] || char)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function normalizeCommand(text) {
    return stripPolishDiacritics(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const VOICE_COMMANDS = {
    check: ['check', 'test', 'show', 'show answer', 'answer check'],
    next: ['next', 'go', 'go next', 'forward', 'go forward', 'next one'],
    prev: ['back', 'previous', 'go back', 'back one'],
    repeat: ['repeat', 'again', 'say again', 'one more'],
    addReview: ['add', 'save', 'add review', 'save review'],
    showReview: ['list', 'review', 'show list', 'review list'],
    clearAnswer: ['clear', 'delete', 'clear command', 'delete command'],
    start: ['start', 'begin'],
    stop: ['stop', 'pause'],
    mic: ['mic', 'microphone']
  };

  function detectCommand(text) {
    const t = normalizeCommand(text);
    if (!t) return null;

    const commandText = t.startsWith('command ') ? t.slice(8).trim() : t;
    for (const [command, aliases] of Object.entries(VOICE_COMMANDS)) {
      if (aliases.some((alias) => commandMatches(commandText, alias))) return command;
    }
    return null;
  }

  function commandMatches(text, alias) {
    if (text === alias) return true;

    const safeAlias = normalizeCommand(alias);
    if (text === safeAlias) return true;

    const words = text.split(' ').filter(Boolean);
    const aliasWords = safeAlias.split(' ').filter(Boolean);
    if (words.length > aliasWords.length + 2) return false;

    return text === `please ${safeAlias}`
      || text === `${safeAlias} please`
      || text === `now ${safeAlias}`
      || text === `${safeAlias} now`
      || text === `command ${safeAlias}`;
  }

  function runCommand(command) {
    const actions = {
      start: startStudy,
      stop: stopStudy,
      check: revealAnswer,
      next: nextPair,
      prev: prevPair,
      repeat: repeatCurrent,
      clearAnswer: clearCurrentAnswer,
      addReview: addCurrentToReview,
      showReview: scrollToReview,
      mic: toggleListening
    };
    if (actions[command]) actions[command]();
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) {
      el.speechInfo.textContent = 'Ta przeglądarka nie udostępnia syntezy mowy. Tekst będzie tylko wyświetlany.';
      return;
    }

    const refresh = () => {
      state.voices = window.speechSynthesis.getVoices();
      fillVoiceSelect(el.voicePl, 'pl', state.settings.voicePl, 'Automatyczny głos PL');
      fillVoiceSelect(el.voiceEn, 'en', state.settings.voiceEn, 'Automatyczny głos EN');
    };

    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
  }

  function fillVoiceSelect(select, langPrefix, selectedValue, autoLabel) {
    const matchingVoices = state.voices.filter((voice) => voice.lang.toLowerCase().startsWith(langPrefix));
    select.innerHTML = '';

    const autoOption = document.createElement('option');
    autoOption.value = '';
    autoOption.textContent = autoLabel;
    select.append(autoOption);

    matchingVoices.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      select.append(option);
    });

    select.value = selectedValue && matchingVoices.some((voice) => voice.name === selectedValue) ? selectedValue : '';
  }

  function getVoice(lang) {
    const selectedName = lang.startsWith('pl') ? state.settings.voicePl : state.settings.voiceEn;
    if (selectedName) {
      const selected = state.voices.find((voice) => voice.name === selectedName);
      if (selected) return selected;
    }

    return state.voices.find((voice) => voice.lang === lang)
      || state.voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
      || null;
  }

  function speak(text, lang, onDone) {
    speakMany([{ text, lang }], onDone);
  }

  function speakMany(items, onDone) {
    const queue = items.filter((item) => item && item.text);
    if (!queue.length) {
      if (typeof onDone === 'function') window.setTimeout(onDone, 0);
      return;
    }

    if (!('speechSynthesis' in window)) {
      if (typeof onDone === 'function') window.setTimeout(onDone, 0);
      return;
    }

    window.speechSynthesis.cancel();
    state.speaking = true;
    state.ignoreSpeechUntil = Date.now() + 800;
    let index = 0;
    let finished = false;

    const estimatedMs = estimateSpeechQueueMs(queue);
    const fallbackTimer = window.setTimeout(() => {
      // Na części telefonów zdarzenie onend z Web Speech API bywa niestabilne.
      // Ten bezpiecznik powoduje, że tryb samochodowy nie zatrzyma się na stałe po odczycie.
      finishSpeaking();
    }, estimatedMs);

    const finishSpeaking = () => {
      if (finished) return;
      finished = true;
      clearTimeout(fallbackTimer);
      state.speaking = false;
      state.ignoreSpeechUntil = Date.now() + 900;
      if (state.running && state.settings.autoMic && state.recognition && !state.listening) {
        state.listening = true;
        scheduleRecognitionRestart(250);
      }
      if (typeof onDone === 'function') {
        window.setTimeout(onDone, 0);
      }
    };

    const speakNext = () => {
      if (finished) return;
      if (index >= queue.length) {
        finishSpeaking();
        return;
      }

      const item = queue[index];
      index += 1;
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = item.lang;
      utterance.rate = item.lang && item.lang.toLowerCase().startsWith('pl')
        ? Number(state.settings.ratePl) || 1
        : Number(state.settings.rateEn) || 1;
      utterance.volume = Number(state.settings.volume) || 1;
      const voice = getVoice(item.lang);
      if (voice) utterance.voice = voice;

      utterance.onend = speakNext;
      utterance.onerror = speakNext;
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  function estimateSpeechQueueMs(queue) {
    const totalChars = queue.reduce((sum, item) => sum + String(item.text || '').length, 0);
    const totalWords = queue.reduce((sum, item) => sum + String(item.text || '').split(/\s+/).filter(Boolean).length, 0);
    // Ostrożny szacunek: krótka fraza nie kończy fallbacku zbyt szybko, a długie zdanie ma zapas.
    return Math.min(30000, Math.max(2500, 1200 + totalWords * 520 + totalChars * 35));
  }

  function speakPolishPrompt(pair, onDone) {
    if (!pair) return;
    speak(`${pair.nr}. ${pair.pl}`, 'pl-PL', onDone);
  }

  function getActiveList() {
    if (state.mode === 'review') {
      return state.reviewItems;
    }
    return state.pairs;
  }

  function getCurrentPair() {
    const list = getActiveList();
    if (!list.length) return null;
    if (state.currentIndex < 0) state.currentIndex = 0;
    if (state.currentIndex >= list.length) state.currentIndex = list.length - 1;
    return list[state.currentIndex];
  }

  function ensureListeningDuringStudy() {
    if (!state.settings.autoMic || !state.recognition) return;
    state.listening = true;
    safeStartRecognition();
  }

  function startFromTypedNumber() {
    const raw = el.startNumberInput.value.trim();
    if (!raw) {
      setStatus('Wpisz numer pary, od której chcesz rozpocząć naukę.', 'warning');
      return;
    }
    startFromPairNumber(raw, true);
  }

  function startFromPairNumber(nr, readPolish = true) {
    const list = getActiveList();
    if (!list.length) {
      setStatus(state.mode === 'review' ? 'Lista powtórek jest pusta.' : 'Najpierw zaimportuj listę słówek lub zdań.', 'warning');
      return;
    }

    const wanted = String(nr).trim();
    const index = list.findIndex((pair) => String(pair.nr).trim() === wanted);
    if (index < 0) {
      setStatus(`Nie znaleziono pary o numerze ${wanted} w aktualnym trybie nauki.`, 'warning');
      return;
    }

    state.currentIndex = index;
    state.running = true;
    state.revealed = false;
    clearCarTimers();
    resetCurrentAnswer();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    requestWakeLock();
    renderLearning();
    renderLoadedPairs();
    saveProgress();

    const pair = getCurrentPair();
    setStatus(`Start od numeru ${pair.nr}. Podaj odpowiedź po angielsku, a potem powiedz „check”.`);
    if (pair) speakPolishPrompt(pair, scheduleCarAnswerCheck);
  }

  function jumpToPairFromPreview(nr) {
    const activeNumbers = new Set(getActiveList().map((pair) => String(pair.nr)));
    if (!activeNumbers.has(String(nr)) && state.mode === 'review') {
      state.mode = 'all';
      el.studyMode.value = 'all';
    }
    startFromPairNumber(nr, true);
  }

  function startStudy() {
    const list = getActiveList();
    if (!list.length) {
      setStatus(state.mode === 'review' ? 'Lista powtórek jest pusta.' : 'Najpierw zaimportuj listę słówek lub zdań.', 'warning');
      return;
    }

    state.running = true;
    state.revealed = false;
    clearCarTimers();
    if (state.currentIndex >= list.length) state.currentIndex = 0;
    resetCurrentAnswer();
    renderLearning();
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    requestWakeLock();
    if (state.settings.bluetoothControls) activateBluetoothControls(false);
    updateMediaPlaybackState();
    renderLoadedPairs();
    saveProgress();
    setStatus(state.settings.carMode
      ? 'Start w trybie samochodowym. Odpowiedz po angielsku; aplikacja sama sprawdzi po ustawionym czasie.'
      : 'Start. Powiedz w myślach albo na głos odpowiedź po angielsku, a potem użyj komendy „check”. Program rozpoznaje tylko komendy sterujące.');
    speakPolishPrompt(pair, scheduleCarAnswerCheck);
  }

  function stopStudy() {
    state.running = false;
    state.listening = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    safeStopRecognition(false);
    releaseWakeLock();
    clearCarTimers();
    updateMediaPlaybackState();
    el.micBtn.textContent = 'Mikrofon';
    saveProgress();
    setStatus('Zatrzymano naukę.');
  }

  function revealAnswer() {
    const pair = getCurrentPair();
    if (!pair) {
      setStatus('Brak aktualnej pary do sprawdzenia.', 'warning');
      return;
    }

    state.revealed = true;
    clearCarCheckTimer();
    state.currentFeedback = null;

    renderLearning();

    setStatus('Sprawdź swoją odpowiedź. Program nie ocenia wypowiedzi. Powiedz „next”, aby przejść dalej.');
    speakMany([
      { text: pair.en, lang: 'en-US' }
    ], scheduleCarNextPair);
  }

  function nextPair() {
    clearCarTimers();
    const list = getActiveList();
    if (!list.length) {
      setStatus('Brak danych w aktualnym trybie.', 'warning');
      return;
    }
    if (state.currentIndex >= list.length - 1) {
      setStatus('To ostatnia pozycja na liście.', 'warning');
      return;
    }
    state.currentIndex += 1;
    state.revealed = false;
    resetCurrentAnswer();
    renderLearning();
    renderLoadedPairs();
    saveProgress();
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    setStatus(state.settings.carMode
      ? 'Kolejna para. Odpowiedz po angielsku; aplikacja sama sprawdzi po ustawionym czasie.'
      : 'Kolejna para. Samodzielnie odpowiedz po angielsku, a potem powiedz „check”.');
    speakPolishPrompt(pair, scheduleCarAnswerCheck);
  }

  function prevPair() {
    clearCarTimers();
    const list = getActiveList();
    if (!list.length) {
      setStatus('Brak danych w aktualnym trybie.', 'warning');
      return;
    }
    if (state.currentIndex <= 0) {
      setStatus('To pierwsza pozycja na liście.', 'warning');
      return;
    }
    state.currentIndex -= 1;
    state.revealed = false;
    resetCurrentAnswer();
    renderLearning();
    renderLoadedPairs();
    saveProgress();
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    setStatus(state.settings.carMode
      ? 'Poprzednia para. Odpowiedz po angielsku; aplikacja sama sprawdzi po ustawionym czasie.'
      : 'Poprzednia para. Samodzielnie odpowiedz po angielsku, a potem powiedz „check”.');
    speakPolishPrompt(pair, scheduleCarAnswerCheck);
  }

  function repeatCurrent() {
    const pair = getCurrentPair();
    if (!pair) {
      setStatus('Brak aktualnej pary do powtórzenia.', 'warning');
      return;
    }
    if (state.revealed) {
      setStatus('Powtarzam odpowiedź angielską.');
      speak(pair.en, 'en-US');
    } else {
      clearCarCheckTimer();
      setStatus('Powtarzam tekst polski.');
      speakPolishPrompt(pair, state.settings.carMode && state.running ? scheduleCarAnswerCheck : undefined);
    }
  }

  function addCurrentToReview() {
    const pair = getCurrentPair();
    if (!pair) {
      setStatus('Brak aktualnej pary do dodania.', 'warning');
      return;
    }
    const key = pairIdentity(pair);
    if (!state.reviewItems.some((item) => pairIdentity(item) === key)) {
      state.reviewItems.push({ nr: String(pair.nr), pl: pair.pl, en: pair.en });
      state.reviewItems = uniquePairs(state.reviewItems);
      saveReview();
      renderReviewList();
      setStatus(`Dodano do listy powtórek. Liczba pozycji: ${state.reviewItems.length}.`);
    } else {
      setStatus('Ta para jest już na liście powtórek.', 'warning');
    }
  }

  function scrollToReview() {
    renderReviewList();
    if (el.reviewPanel) el.reviewPanel.open = true;
    document.getElementById('reviewTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function importFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const decoded = decodeTextFile(reader.result, file.name);
      importFromText(decoded.text, ` Kodowanie pliku: ${decoded.encoding}.`);
    };

    reader.onerror = () => setStatus('Nie udało się odczytać pliku CSV.', 'error');
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  }

  function importFromText(text, sourceInfo = '') {
    const result = parsePairs(text);
    if (!result.pairs.length) {
      setStatus('Nie znaleziono poprawnych par. Sprawdź format: Nr;Polski;English.', 'error');
      el.importInfo.textContent = result.errors.length ? result.errors.join(' ') : 'Brak poprawnych danych.';
      return;
    }

    state.pairs = result.pairs;
    const storedProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}');
    state.currentIndex = 0;
    restoreProgress(storedProgress);
    state.revealed = false;
    resetCurrentAnswer();
    savePairs();
    renderAll();

    const errorInfo = result.errors.length ? ` Pominięto ${result.errors.length} błędnych wierszy.` : '';
    el.importInfo.textContent = `Zaimportowano ${state.pairs.length} pozycji.${errorInfo}${sourceInfo}`;
    setStatus(`Zaimportowano ${state.pairs.length} pozycji. Polskie znaki są obsługiwane. Naciśnij Start.`);
  }

  function decodeTextFile(buffer, fileName = '') {
    if (typeof buffer === 'string') return { text: sanitizeImportedText(buffer), encoding: 'tekst' };

    const bytes = new Uint8Array(buffer || []);
    if (!bytes.length) return { text: '', encoding: 'pusty plik' };

    const candidates = [];
    const hasUtf8Bom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
    const encodings = hasUtf8Bom
      ? ['utf-8', 'windows-1250', 'iso-8859-2']
      : ['utf-8', 'windows-1250', 'iso-8859-2'];

    encodings.forEach((encoding) => {
      try {
        const decoder = new TextDecoder(encoding, { fatal: false });
        const text = sanitizeImportedText(decoder.decode(bytes));
        candidates.push({ encoding, text, score: scoreDecodedText(text, encoding, fileName, hasUtf8Bom) });
      } catch (err) {
        // Nie każda starsza przeglądarka musi wspierać wszystkie kodowania.
      }
    });

    if (!candidates.length) {
      return { text: sanitizeImportedText(String.fromCharCode(...bytes)), encoding: 'awaryjne' };
    }

    candidates.sort((a, b) => b.score - a.score);
    return { text: candidates[0].text, encoding: candidates[0].encoding };
  }

  function scoreDecodedText(text, encoding, fileName, hasUtf8Bom) {
    let score = 0;

    if (encoding === 'utf-8') score += 5;
    if (hasUtf8Bom && encoding === 'utf-8') score += 500;
    if (/\.csv$/i.test(fileName || '')) score += 5;

    const replacementChars = (text.match(/�/g) || []).length;
    score -= replacementChars * 1000;

    const mojibakeMarkers = (text.match(/[ÃÅÄÂ]/g) || []).length;
    score -= mojibakeMarkers * 80;

    const unexpectedControls = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
    score -= unexpectedControls * 100;

    const polishLetters = (text.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || []).length;
    score += polishLetters * 10;

    const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || '';
    const headerGuess = firstLine.split(/[;,\t]/).map((column) => normalizeCommand(column));
    if (isHeader(headerGuess)) score += 100;
    if (/\bpolski\b/i.test(stripPolishDiacritics(firstLine))) score += 30;
    if (/\benglish\b/i.test(firstLine)) score += 30;

    return score;
  }

  function sanitizeImportedText(text) {
    return String(text || '')
      .replace(/^\uFEFF/, '')
      .replace(/\u0000/g, '')
      .replace(/\u00A0/g, ' ')
      .normalize('NFC');
  }

  function parsePairs(text) {
    const lines = sanitizeImportedText(text)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const pairs = [];
    const errors = [];

    lines.forEach((line, index) => {
      const separator = guessSeparator(line);
      const columns = parseDelimitedLine(line, separator).map((column) => column.trim());
      if (index === 0 && isHeader(columns)) return;

      let nr;
      let pl;
      let en;

      if (columns.length >= 3) {
        nr = columns[0] || String(pairs.length + 1);
        pl = columns[1];
        en = columns.slice(2).join(separator).trim();
      } else if (columns.length === 2) {
        nr = String(pairs.length + 1);
        pl = columns[0];
        en = columns[1];
      } else {
        errors.push(`Wiersz ${index + 1}: za mało kolumn.`);
        return;
      }

      if (!pl || !en) {
        errors.push(`Wiersz ${index + 1}: brak tekstu PL albo EN.`);
        return;
      }

      pairs.push({ nr: String(nr).trim(), pl: pl.trim(), en: en.trim() });
    });

    return { pairs, errors };
  }

  function guessSeparator(line) {
    const candidates = [';', '\t', ','];
    let best = ';';
    let bestCount = -1;
    candidates.forEach((separator) => {
      const count = (line.match(new RegExp(separator === '\\t' ? '\\t' : escapeRegExp(separator), 'g')) || []).length;
      if (count > bestCount) {
        best = separator === '\\t' ? '\t' : separator;
        bestCount = count;
      }
    });
    return best;
  }

  function parseDelimitedLine(line, separator) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function isHeader(columns) {
    const normalized = columns.map((column) => normalizeCommand(column));
    return normalized.includes('nr') && normalized.some((column) => column.includes('polski')) && normalized.some((column) => column.includes('english') || column.includes('angielski'));
  }

  function isValidPair(pair) {
    return pair && pair.nr !== undefined && typeof pair.pl === 'string' && typeof pair.en === 'string' && pair.pl.trim() && pair.en.trim();
  }

  function clearData() {
    if (!confirm('Czy na pewno wyczyścić zaimportowaną listę? Lista powtórek zostanie zachowana.')) return;
    state.pairs = [];
    state.currentIndex = 0;
    state.revealed = false;
    clearCarTimers();
    resetCurrentAnswer();
    localStorage.removeItem(STORAGE_KEYS.pairs);
    localStorage.removeItem(STORAGE_KEYS.progress);
    renderAll();
    setStatus('Wyczyszczono zaimportowaną listę. Lista powtórek została zachowana.');
  }

  function clearReview() {
    if (!state.reviewItems.length) {
      setStatus('Lista powtórek już jest pusta.', 'warning');
      return;
    }
    if (!confirm('Czy wyczyścić całą listę powtórek?')) return;
    state.reviewItems = [];
    saveReview();
    if (state.mode === 'review') state.currentIndex = 0;
    renderAll();
    setStatus('Wyczyszczono listę powtórek.');
  }

  function removeFromReview(key) {
    state.reviewItems = state.reviewItems.filter((item) => pairIdentity(item) !== key);
    saveReview();
    if (state.mode === 'review') state.currentIndex = Math.max(0, Math.min(state.currentIndex, state.reviewItems.length - 1));
    renderAll();
    setStatus('Usunięto pozycję z listy powtórek.');
  }

  function exportReviewCsv() {
    const reviewPairs = getReviewPairs();
    if (!reviewPairs.length) {
      setStatus('Lista powtórek jest pusta — nie ma czego eksportować.', 'warning');
      return;
    }

    const rows = [['Nr', 'Polski', 'English'], ...reviewPairs.map((pair) => [pair.nr, pair.pl, pair.en])];
    const csv = rows.map((row) => row.map(csvEscape).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lista_powtorek.csv';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Wyeksportowano listę powtórek do CSV.');
  }

  function csvEscape(value) {
    const text = String(value ?? '');
    if (/[";\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function getReviewPairs() {
    return uniquePairs(state.reviewItems);
  }

  function pairIdentity(pair) {
    return [String(pair?.nr ?? '').trim(), String(pair?.pl ?? '').trim().toLowerCase(), String(pair?.en ?? '').trim().toLowerCase()].join('||');
  }

  function uniquePairs(pairs) {
    const seen = new Set();
    const result = [];
    (pairs || []).forEach((pair) => {
      if (!isValidPair(pair)) return;
      const key = pairIdentity(pair);
      if (seen.has(key)) return;
      seen.add(key);
      result.push({ nr: String(pair.nr).trim(), pl: String(pair.pl).trim(), en: String(pair.en).trim() });
    });
    return result;
  }

  function renderAll() {
    renderLearning();
    renderReviewList();
    renderImportInfo();
    renderLoadedPairs();
    updateCarModeStatus();
  }

  function renderLearning() {
    const list = getActiveList();
    const pair = getCurrentPair();
    const total = list.length;
    const visibleNumber = total ? state.currentIndex + 1 : 0;
    const percent = total ? (visibleNumber / total) * 100 : 0;

    el.progressText.textContent = `Para ${visibleNumber} z ${total}`;
    el.progressBar.style.width = `${percent}%`;
    el.pairNumber.textContent = pair ? `Nr ${pair.nr}` : 'Nr —';
    el.polishText.textContent = pair ? pair.pl : 'Zaimportuj listę i naciśnij Start.';
    el.englishText.textContent = pair ? pair.en : '—';
    el.correctAnswerBox.hidden = !state.revealed;
    renderEvaluationState();
    renderCarCountdown();
    renderLoadedPairs();
  }

  function getEvaluationModeLabel(mode) {
    const labels = {
      none: 'Brak oceny',
      simple: 'Ocena prosta',
      medium: 'Ocena średnia',
      advanced: 'Ocena zaawansowana lokalna'
    };
    return labels[mode] || labels.simple;
  }

  function evaluateCurrentAnswer(pair) {
    const mode = state.settings.evaluationMode || 'simple';
    if (mode === 'none') return null;
    const expected = normalizeForComparison(pair.en);
    const actual = normalizeForComparison(state.recognizedAnswer);
    const expectedWords = tokenizeComparable(expected);
    const actualWords = tokenizeComparable(actual);

    if (!actual) {
      return buildFeedback({
        mode,
        score: 0,
        missing: uniqueWords(expectedWords),
        extra: [],
        orderInfo: 'Nie można ocenić szyku, bo nie rozpoznano odpowiedzi.',
        suggestion: 'Powiedz odpowiedź jeszcze raz albo użyj przycisku „Odpowiedź EN”.',
        comment: 'Nie rozpoznano odpowiedzi po angielsku. Sprawdź mikrofon i spróbuj powiedzieć odpowiedź jeszcze raz.',
        spokenComment: 'Nie rozpoznano odpowiedzi. Spróbuj jeszcze raz.'
      });
    }

    if (mode === 'advanced') return evaluateAdvanced(pair, expected, actual, expectedWords, actualWords);
    if (mode === 'medium') return evaluateMedium(pair, expected, actual, expectedWords, actualWords);
    return evaluateSimple(pair, expected, actual, expectedWords, actualWords);
  }

  function evaluateSimple(pair, expected, actual, expectedWords, actualWords) {
    const missing = subtractWords(expectedWords, actualWords);
    const extra = subtractWords(actualWords, expectedWords);
    const distance = levenshteinDistance(expected, actual);
    const maxLength = Math.max(expected.length, actual.length, 1);
    const textSimilarity = Math.max(0, 1 - distance / maxLength);
    const completeness = expectedWords.length ? Math.max(0, 1 - missing.length / expectedWords.length) : 1;
    const score = Math.round((textSimilarity * 0.7 + completeness * 0.3) * 100);

    let comment;
    let spokenComment;
    if (score >= 90) {
      comment = 'Bardzo dobrze. Rozpoznany tekst jest bardzo podobny do poprawnej odpowiedzi.';
      spokenComment = 'Bardzo dobrze.';
    } else if (score >= 75) {
      comment = 'Dobrze. Są drobne różnice względem poprawnej odpowiedzi.';
      spokenComment = 'Dobrze. Są drobne różnice.';
    } else if (score >= 55) {
      comment = 'Częściowo dobrze. Warto powtórzyć całe zdanie i zwrócić uwagę na brakujące słowa.';
      spokenComment = 'Częściowo dobrze. Powtórz całe zdanie.';
    } else {
      comment = 'Spróbuj jeszcze raz. Rozpoznany tekst mocno różni się od poprawnej odpowiedzi.';
      spokenComment = 'Spróbuj jeszcze raz.';
    }

    if (missing.length) spokenComment += ` Brakuje: ${missing.slice(0, 3).join(', ')}.`;

    return buildFeedback({
      mode: 'simple',
      score,
      missing,
      extra,
      orderInfo: 'W trybie prostym program nie analizuje dokładnie kolejności słów.',
      suggestion: missing.length ? `Powtórz z brakującymi słowami: ${missing.slice(0, 4).join(', ')}.` : 'Porównaj rozpoznany tekst z poprawną odpowiedzią.',
      comment,
      spokenComment
    });
  }

  function evaluateMedium(pair, expected, actual, expectedWords, actualWords) {
    const missing = subtractWords(expectedWords, actualWords);
    const extra = subtractWords(actualWords, expectedWords);
    const distance = levenshteinDistance(expected, actual);
    const maxLength = Math.max(expected.length, actual.length, 1);
    const textSimilarity = Math.max(0, 1 - distance / maxLength);
    const lcs = longestCommonSubsequenceLength(expectedWords, actualWords);
    const wordCoverage = expectedWords.length ? lcs / expectedWords.length : 1;
    const orderScore = expectedWords.length ? lcs / Math.max(expectedWords.length, actualWords.length, 1) : 1;
    const score = Math.round((textSimilarity * 0.45 + wordCoverage * 0.35 + orderScore * 0.20) * 100);

    let comment;
    let spokenComment;
    if (score >= 92) {
      comment = 'Bardzo dobrze. Wypowiedź zawiera prawie wszystkie wymagane słowa i zachowuje poprawną kolejność.';
      spokenComment = 'Bardzo dobrze.';
    } else if (score >= 78) {
      comment = 'Prawie dobrze. Sens jest prawdopodobnie zachowany, ale są drobne braki albo różnice w słowach.';
      spokenComment = 'Prawie dobrze.';
    } else if (score >= 60) {
      comment = 'Częściowo dobrze. Część zdania została rozpoznana, ale brakuje ważnych słów lub kolejność wymaga poprawy.';
      spokenComment = 'Częściowo dobrze. Powtórz całe zdanie.';
    } else {
      comment = 'Spróbuj jeszcze raz. Rozpoznany tekst jest zbyt odległy od poprawnej odpowiedzi.';
      spokenComment = 'Spróbuj jeszcze raz.';
    }

    const orderInfo = orderScore >= 0.85
      ? 'Kolejność słów wygląda dobrze.'
      : orderScore >= 0.6
        ? 'Kolejność słów jest częściowo podobna, ale warto powtórzyć pełne zdanie.'
        : 'Kolejność słów znacząco różni się od poprawnej odpowiedzi.';

    const suggestion = missing.length
      ? `Brakuje: ${missing.slice(0, 5).join(', ')}. Powtórz: ${pair.en}`
      : extra.length
        ? `Masz dodatkowe lub inne słowa: ${extra.slice(0, 5).join(', ')}. Porównaj z poprawną wersją.`
        : `Powtórz końcówkę lub całe zdanie: ${pair.en}`;

    if (missing.length) spokenComment += ` Brakuje: ${missing.slice(0, 3).join(', ')}.`;
    if (score < 92) spokenComment += ` Powtórz: ${pair.en}`;

    return buildFeedback({
      mode: 'medium',
      score,
      missing,
      extra,
      orderInfo,
      suggestion,
      comment,
      spokenComment
    });
  }

  function evaluateAdvanced(pair, expected, actual, expectedWords, actualWords) {
    const missing = subtractWords(expectedWords, actualWords);
    const extra = subtractWords(actualWords, expectedWords);
    const lcs = longestCommonSubsequenceLength(expectedWords, actualWords);
    const wordCoverage = expectedWords.length ? lcs / expectedWords.length : 1;
    const jaccard = jaccardSimilarity(expectedWords, actualWords);
    const orderScore = expectedWords.length ? lcs / Math.max(expectedWords.length, actualWords.length, 1) : 1;
    const distance = levenshteinDistance(expected, actual);
    const textSimilarity = Math.max(0, 1 - distance / Math.max(expected.length, actual.length, 1));
    const score = Math.round((textSimilarity * 0.35 + wordCoverage * 0.30 + jaccard * 0.20 + orderScore * 0.15) * 100);

    const importantMissing = missing.filter((word) => !isMinorWord(word));
    const missingArticles = missing.filter((word) => ['a', 'an', 'the'].includes(word));
    const missingAuxiliaries = missing.filter((word) => AUXILIARIES.has(word));

    const meaningInfo = score >= 85 || importantMissing.length === 0
      ? 'Sens odpowiedzi jest prawdopodobnie poprawny.'
      : score >= 65
        ? 'Sens odpowiedzi jest częściowo poprawny, ale brakuje elementów wpływających na znaczenie.'
        : 'Sens odpowiedzi jest niepewny, bo rozpoznany tekst mocno odbiega od poprawnej wersji.';

    const grammarNotes = [];
    if (missingArticles.length) grammarNotes.push(`brakuje przedimka: ${missingArticles.join(', ')}`);
    if (missingAuxiliaries.length) grammarNotes.push(`brakuje czasownika pomocniczego/modalnego: ${missingAuxiliaries.join(', ')}`);
    if (importantMissing.length) grammarNotes.push(`brakuje istotnych słów: ${importantMissing.slice(0, 4).join(', ')}`);
    if (extra.length && score < 90) grammarNotes.push(`pojawiły się inne lub nadmiarowe słowa: ${extra.slice(0, 4).join(', ')}`);
    if (!grammarNotes.length) grammarNotes.push('nie widać dużych braków w rozpoznanym tekście');

    const orderInfo = orderScore >= 0.88
      ? 'Szyk zdania wygląda naturalnie względem wzorca.'
      : orderScore >= 0.65
        ? 'Szyk zdania jest częściowo poprawny, ale warto przećwiczyć kolejność słów.'
        : 'Szyk zdania wymaga poprawy. Powtórz zdanie powoli od początku.';

    const naturalnessInfo = score >= 88
      ? 'Odpowiedź brzmi naturalnie względem wzorca.'
      : score >= 70
        ? 'Odpowiedź jest zrozumiała, ale mniej naturalna niż wzorzec.'
        : 'Odpowiedź wymaga ponownego powtórzenia, aby brzmiała naturalnie.';

    const comment = `${meaningInfo} Gramatyka: ${grammarNotes.join('; ')}. Naturalność: ${naturalnessInfo}`;
    const suggestion = buildAdvancedSuggestion(pair, missingArticles, missingAuxiliaries, importantMissing, extra, score);
    const spokenComment = buildAdvancedSpokenComment(pair, score, missingArticles, missingAuxiliaries, importantMissing, extra);

    return buildFeedback({
      mode: 'advanced',
      score,
      missing,
      extra,
      orderInfo,
      suggestion,
      comment,
      spokenComment
    });
  }

  function buildFeedback(data) {
    return {
      mode: data.mode || 'simple',
      modeLabel: getEvaluationModeLabel(data.mode),
      score: data.score,
      missing: data.missing || [],
      extra: data.extra || [],
      orderInfo: data.orderInfo || '—',
      suggestion: data.suggestion || '—',
      comment: data.comment,
      spokenComment: data.spokenComment
    };
  }

  const AUXILIARIES = new Set(['am', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must']);
  const MINOR_WORDS = new Set(['a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'and', 'or']);

  function isMinorWord(word) {
    return MINOR_WORDS.has(word);
  }

  function buildAdvancedSuggestion(pair, missingArticles, missingAuxiliaries, importantMissing, extra, score) {
    if (missingArticles.length) return `Dodaj przedimek ${missingArticles[0]} i powtórz: ${pair.en}`;
    if (missingAuxiliaries.length) return `Zwróć uwagę na ${missingAuxiliaries[0]}; to ważny element konstrukcji zdania. Powtórz: ${pair.en}`;
    if (importantMissing.length) return `Dodaj brakujące słowo „${importantMissing[0]}” i powtórz całe zdanie: ${pair.en}`;
    if (extra.length && score < 90) return `Usuń lub zmień nadmiarowe słowa: ${extra.slice(0, 3).join(', ')}. Wzorzec: ${pair.en}`;
    if (score >= 90) return 'Dobra odpowiedź. Dla utrwalenia powtórz jeszcze raz płynnie.';
    return `Powtórz powoli całe zdanie: ${pair.en}`;
  }

  function buildAdvancedSpokenComment(pair, score, missingArticles, missingAuxiliaries, importantMissing, extra) {
    if (score >= 92) return 'Bardzo dobrze. Wypowiedź jest bardzo bliska poprawnej wersji.';
    if (missingArticles.length) return `Dobrze, ale brakuje przedimka ${missingArticles[0]}. Powtórz: ${pair.en}`;
    if (missingAuxiliaries.length) return `Prawie dobrze, ale brakuje ${missingAuxiliaries[0]}. Powtórz: ${pair.en}`;
    if (importantMissing.length) return `Częściowo dobrze, ale brakuje słowa ${importantMissing[0]}. Powtórz: ${pair.en}`;
    if (extra.length && score < 85) return `Uważaj na dodatkowe słowa. Powtórz poprawnie: ${pair.en}`;
    if (score >= 75) return `Dobrze, ale powtórz płynniej: ${pair.en}`;
    return `Spróbuj jeszcze raz. Poprawna odpowiedź brzmi: ${pair.en}`;
  }

  function longestCommonSubsequenceLength(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length];
  }

  function jaccardSimilarity(a, b) {
    const setA = new Set(a);
    const setB = new Set(b);
    const union = new Set([...setA, ...setB]);
    if (!union.size) return 1;
    let intersection = 0;
    setA.forEach((item) => { if (setB.has(item)) intersection += 1; });
    return intersection / union.size;
  }

  function normalizeForComparison(text) {
    return stripPolishDiacritics(text)
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenizeComparable(text) {
    return normalizeForComparison(text).split(' ').filter(Boolean);
  }

  function uniqueWords(words) {
    return [...new Set(words)];
  }

  function subtractWords(source, reference) {
    const counts = new Map();
    reference.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
    const result = [];
    source.forEach((word) => {
      const count = counts.get(word) || 0;
      if (count > 0) counts.set(word, count - 1);
      else result.push(word);
    });
    return uniqueWords(result);
  }

  function levenshteinDistance(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let i = 0; i < rows; i += 1) dp[i][0] = i;
    for (let j = 0; j < cols; j += 1) dp[0][j] = j;

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }

    return dp[a.length][b.length];
  }

  function renderEvaluationState() {
    // Wersja v13: ocena odpowiedzi jest usunięta z interfejsu.
    if (el.evaluationBox) el.evaluationBox.hidden = true;
  }

  function renderLoadedPairs() {
    if (!el.loadedPairsBody || !el.loadedPreviewCount) return;
    el.loadedPreviewCount.textContent = `${state.pairs.length} pozycji`;
    el.loadedPairsBody.innerHTML = '';

    if (!state.pairs.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'Brak zaimportowanych danych.';
      row.append(cell);
      el.loadedPairsBody.append(row);
      return;
    }

    const currentPair = getCurrentPair();
    const currentKey = currentPair ? pairIdentity(currentPair) : '';
    const activeKeys = new Set(getActiveList().map((pair) => pairIdentity(pair)));

    state.pairs.forEach((pair) => {
      const row = document.createElement('tr');
      row.tabIndex = 0;
      row.dataset.nr = pair.nr;
      if (pairIdentity(pair) === currentKey) row.classList.add('active-row');
      if (!activeKeys.has(pairIdentity(pair))) row.classList.add('inactive-row');

      const nrCell = document.createElement('td');
      nrCell.textContent = pair.nr;
      const plCell = document.createElement('td');
      plCell.textContent = pair.pl;
      const enCell = document.createElement('td');
      enCell.textContent = pair.en;

      row.append(nrCell, plCell, enCell);
      row.addEventListener('click', () => jumpToPairFromPreview(pair.nr));
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          jumpToPairFromPreview(pair.nr);
        }
      });
      el.loadedPairsBody.append(row);
    });
  }

  function renderReviewList() {
    const reviewPairs = getReviewPairs();
    el.reviewList.innerHTML = '';
    if (el.reviewCount) el.reviewCount.textContent = `${reviewPairs.length} pozycji`;

    if (!reviewPairs.length) {
      el.reviewList.textContent = 'Lista powtórek jest pusta.';
      return;
    }

    reviewPairs.forEach((pair) => {
      const item = document.createElement('div');
      item.className = 'review-item';

      const nr = document.createElement('div');
      nr.className = 'pair-number';
      nr.textContent = `Nr ${pair.nr}`;

      const text = document.createElement('div');
      text.innerHTML = `<strong></strong><span></span>`;
      text.querySelector('strong').textContent = pair.pl;
      text.querySelector('span').textContent = pair.en;

      const removeButton = document.createElement('button');
      removeButton.className = 'btn btn-danger';
      removeButton.textContent = 'Usuń';
      removeButton.addEventListener('click', () => removeFromReview(pairIdentity(pair)));

      item.append(nr, text, removeButton);
      el.reviewList.append(item);
    });
  }

  function renderImportInfo() {
    el.importInfo.textContent = state.pairs.length
      ? `Aktualnie zapisano lokalnie ${state.pairs.length} pozycji. Lista powtórek jest zapisywana niezależnie.`
      : 'Brak zaimportowanych danych. Lista powtórek jest zachowana niezależnie.';
  }

  function setStatus(message, type = '') {
    el.status.className = `status${type ? ` ${type}` : ''}`;
    el.status.textContent = message;
  }
})();
