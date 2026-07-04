(() => {
  'use strict';

  const STORAGE_KEYS = {
    pairs: 'evt_pairs_v1',
    review: 'evt_review_numbers_v1',
    settings: 'evt_settings_v1'
  };

  const DEFAULT_SETTINGS = {
    ratePl: 1,
    rateEn: 1,
    volume: 1,
    voicePl: '',
    voiceEn: '',
    recognitionLang: 'pl-PL',
    evaluationMode: 'simple',
    autoMic: true,
    autoLanguageSwitch: true,
    keepScreenAwake: true
  };

  const state = {
    pairs: [],
    reviewNumbers: [],
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
    restartRecognitionAfterSpeech: false,
    changingRecognitionLanguage: false,
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
    micBtn: document.getElementById('micBtn'),
    testPlBtn: document.getElementById('testPlBtn'),
    testEnBtn: document.getElementById('testEnBtn'),
    speechInfo: document.getElementById('speechInfo'),
    reviewList: document.getElementById('reviewList'),
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
      startStudy();
    });

    el.studyMode.addEventListener('change', () => {
      state.mode = el.studyMode.value;
      state.currentIndex = 0;
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
    });

    el.evaluationMode.addEventListener('change', () => {
      state.settings.evaluationMode = el.evaluationMode.value;
      state.currentFeedback = null;
      saveSettings();
      renderEvaluationState();
      setStatus(`Tryb oceny: ${getEvaluationModeLabel(state.settings.evaluationMode)}.`);
    });

    el.autoMic.addEventListener('change', () => {
      state.settings.autoMic = el.autoMic.checked;
      saveSettings();
      setStatus(state.settings.autoMic
        ? 'Automatyczne utrzymywanie mikrofonu podczas nauki jest włączone.'
        : 'Automatyczne utrzymywanie mikrofonu podczas nauki jest wyłączone.');
    });

    el.autoLanguageSwitch.addEventListener('change', () => {
      state.settings.autoLanguageSwitch = el.autoLanguageSwitch.checked;
      saveSettings();
      setStatus(state.settings.autoLanguageSwitch
        ? 'Automatyczne przełączanie języka jest włączone.'
        : 'Automatyczne przełączanie języka jest wyłączone. Użyj ręcznie pola „Język rozpoznawania mowy”.');
    });

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

    el.micBtn.addEventListener('click', toggleListening);
    el.testPlBtn.addEventListener('click', () => speak('To jest test polskiego głosu.', 'pl-PL'));
    el.testEnBtn.addEventListener('click', () => speak('This is a test of the English voice.', 'en-US'));
  }

  function loadState() {
    try {
      const storedPairs = JSON.parse(localStorage.getItem(STORAGE_KEYS.pairs) || '[]');
      const storedReview = JSON.parse(localStorage.getItem(STORAGE_KEYS.review) || '[]');
      const storedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');

      state.pairs = Array.isArray(storedPairs) ? storedPairs.filter(isValidPair) : [];
      state.reviewNumbers = Array.isArray(storedReview) ? storedReview : [];
      state.settings = { ...DEFAULT_SETTINGS, ...storedSettings };
      if (storedSettings.rate && !storedSettings.ratePl) state.settings.ratePl = Number(storedSettings.rate) || DEFAULT_SETTINGS.ratePl;
      if (storedSettings.rate && !storedSettings.rateEn) state.settings.rateEn = Number(storedSettings.rate) || DEFAULT_SETTINGS.rateEn;
      if (typeof storedSettings.evaluateAnswer === 'boolean' && !storedSettings.evaluationMode) {
        state.settings.evaluationMode = storedSettings.evaluateAnswer ? 'simple' : 'simple';
      }
    } catch (err) {
      console.error(err);
      state.pairs = [];
      state.reviewNumbers = [];
      state.settings = { ...DEFAULT_SETTINGS };
    }
  }

  function savePairs() {
    localStorage.setItem(STORAGE_KEYS.pairs, JSON.stringify(state.pairs));
  }

  function saveReview() {
    localStorage.setItem(STORAGE_KEYS.review, JSON.stringify(state.reviewNumbers));
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }

  function applySettingsToUi() {
    el.ratePlInput.value = String(state.settings.ratePl);
    el.ratePlValue.textContent = Number(state.settings.ratePl).toFixed(1);
    el.rateEnInput.value = String(state.settings.rateEn);
    el.rateEnValue.textContent = Number(state.settings.rateEn).toFixed(1);
    el.volumeInput.value = String(state.settings.volume);
    el.volumeValue.textContent = Number(state.settings.volume).toFixed(1);
    el.recognitionLang.value = state.settings.recognitionLang;
    if (!['none', 'simple', 'medium', 'advanced'].includes(state.settings.evaluationMode)) state.settings.evaluationMode = 'simple';
    el.evaluationMode.value = state.settings.evaluationMode || 'simple';
    el.autoMic.checked = Boolean(state.settings.autoMic);
    el.autoLanguageSwitch.checked = Boolean(state.settings.autoLanguageSwitch);
    el.keepScreenAwake.checked = Boolean(state.settings.keepScreenAwake);
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
      el.micBtn.textContent = 'Wyłącz mikrofon';
      el.speechInfo.textContent = `Mikrofon aktywny. Język: ${recognition.lang}.`;
    };

    recognition.onerror = (event) => {
      // `no-speech` oznacza, że mikrofon działa, ale w krótkim czasie nie wykryto mowy.
      // W trybie nauki nie wyłączamy wtedy mikrofonu — pozwalamy funkcji onend wznowić nasłuch.
      if (event.error === 'no-speech') {
        setStatus('Nie wykryto mowy. Mikrofon nadal nasłuchuje — powiedz komendę wyraźnie albo użyj przycisku.', 'warning');
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        state.listening = false;
        el.micBtn.textContent = 'Włącz mikrofon';
        setStatus('Przeglądarka nie pozwoliła użyć mikrofonu. Kliknij ikonę przy adresie strony i ustaw Mikrofon → Zezwalaj. Potem użyj przycisku „Włącz mikrofon”.', 'warning');
        return;
      }

      // `aborted` często pojawia się, gdy celowo zatrzymujemy nasłuch na czas syntezy mowy
      // albo przy zmianie języka rozpoznawania.
      if (event.error === 'aborted' && (state.restartRecognitionAfterSpeech || state.changingRecognitionLanguage)) {
        return;
      }

      state.listening = false;
      el.micBtn.textContent = 'Włącz mikrofon';
      setStatus(`Błąd rozpoznawania mowy: ${event.error}. Sprawdź uprawnienia mikrofonu albo używaj przycisków.`, 'warning');
    };

    recognition.onend = () => {
      if (state.changingRecognitionLanguage) {
        state.changingRecognitionLanguage = false;
        if (state.listening) safeStartRecognition();
        return;
      }

      const shouldRestart = state.listening && !state.restartRecognitionAfterSpeech;
      if (shouldRestart) {
        safeStartRecognition();
      } else if (!state.restartRecognitionAfterSpeech) {
        state.listening = false;
        el.micBtn.textContent = 'Włącz mikrofon';
      }
    };

    recognition.onresult = handleSpeechResult;
    state.recognition = recognition;
  }

  function safeStartRecognition() {
    if (!state.recognition) return;
    try {
      state.recognition.lang = state.settings.recognitionLang;
      state.recognition.start();
    } catch (err) {
      // Chrome rzuca błąd, jeżeli start() zostanie wywołany, gdy mikrofon już działa.
    }
  }

  function safeStopRecognition(temporary = false) {
    if (!state.recognition) return;
    state.restartRecognitionAfterSpeech = temporary;
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
    const pair = getCurrentPair();
    if (!pair) {
      setStatus('Brak aktualnej pary do nagrania odpowiedzi.', 'warning');
      return;
    }

    state.revealed = false;
    state.currentFeedback = null;
    renderLearning();

    if (state.settings.autoLanguageSwitch) {
      setRecognitionLanguage('en-US', true);
    }

    if (forceStart && !state.listening) {
      state.listening = true;
      safeStartRecognition();
    }

    setStatus('Tryb odpowiedzi angielskiej. Powiedz odpowiedź po angielsku. Po rozpoznaniu aplikacja wróci do komend po polsku.');
  }

  function clearCurrentAnswer() {
    resetCurrentAnswer();
    renderLearning();
    setStatus('Wyczyszczono rozpoznaną odpowiedź. Możesz powiedzieć ją jeszcze raz.');
  }

  function resetCurrentAnswer() {
    state.recognizedAnswer = '';
    state.currentFeedback = null;
    el.recognizedText.textContent = '—';
    renderEvaluationState();
  }

  function toggleListening() {
    if (!state.recognition) return;
    if (state.listening) {
      state.listening = false;
      safeStopRecognition(false);
      el.micBtn.textContent = 'Włącz mikrofon';
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

    const command = detectCommand(text);
    if (command && finalText) {
      runCommand(command);
      return;
    }

    if (finalText) {
      state.recognizedAnswer = `${state.recognizedAnswer} ${finalText}`.trim();
      el.recognizedText.textContent = state.recognizedAnswer || '—';
      state.currentFeedback = null;
      renderEvaluationState();

      if (state.settings.autoLanguageSwitch && state.running) {
        setRecognitionLanguage('pl-PL', true);
        setStatus('Odpowiedź zapisana. Powiedz „test” albo kliknij przycisk Sprawdź.');
      }
      return;
    }

    const preview = `${state.recognizedAnswer} ${interimText}`.trim();
    el.recognizedText.textContent = preview || '—';
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
    check: ['test', 'sprawdz', 'sprawdzam', 'check'],
    next: ['dalej', 'nastepne', 'nastepny', 'next'],
    prev: ['cofnij', 'wstecz', 'poprzednie', 'poprzedni', 'back', 'previous'],
    repeat: ['jeszcze', 'powtorz', 'powtor', 'repeat'],
    addReview: ['dodaj', 'dodaj do listy', 'dodaj do powtorek', 'add'],
    showReview: ['lista', 'lista powtorek', 'pokaz liste', 'pokaz liste powtorek', 'review list'],
    captureAnswer: ['mowie', 'angielski', 'odpowiedz', 'answer'],
    clearAnswer: ['kasuj', 'wyczysc', 'clear'],
    start: ['start', 'rozpocznij'],
    stop: ['stop', 'zatrzymaj']
  };

  function detectCommand(text) {
    const t = normalizeCommand(text);
    if (!t) return null;

    const commandText = t.startsWith('komenda ') ? t.slice(8).trim() : t;
    for (const [command, aliases] of Object.entries(VOICE_COMMANDS)) {
      if (aliases.some((alias) => commandMatches(commandText, alias))) return command;
    }
    return null;
  }

  function commandMatches(text, alias) {
    if (text === alias) return true;

    const words = text.split(' ').filter(Boolean);
    const aliasWords = alias.split(' ').filter(Boolean);
    if (words.length > aliasWords.length + 1) return false;

    return text === `no ${alias}`
      || text === `${alias} prosze`
      || text === `${alias} teraz`;
  }

  function runCommand(command) {
    const actions = {
      start: startStudy,
      stop: stopStudy,
      check: revealAnswer,
      next: nextPair,
      prev: prevPair,
      repeat: repeatCurrent,
      captureAnswer: () => prepareForEnglishAnswer(true),
      clearAnswer: clearCurrentAnswer,
      addReview: addCurrentToReview,
      showReview: scrollToReview
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

  function speak(text, lang) {
    speakMany([{ text, lang }]);
  }

  function speakMany(items) {
    if (!('speechSynthesis' in window)) return;
    const queue = items.filter((item) => item && item.text);
    if (!queue.length) return;

    const wasListening = state.listening;
    if (wasListening) safeStopRecognition(true);

    window.speechSynthesis.cancel();
    let index = 0;

    const resumeRecognition = () => {
      state.restartRecognitionAfterSpeech = false;
      if (wasListening) {
        state.listening = true;
        safeStartRecognition();
      }
    };

    const speakNext = () => {
      if (index >= queue.length) {
        resumeRecognition();
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

  function getActiveList() {
    if (state.mode === 'review') {
      const reviewSet = new Set(state.reviewNumbers.map(String));
      return state.pairs.filter((pair) => reviewSet.has(String(pair.nr)));
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
    resetCurrentAnswer();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    requestWakeLock();
    renderLearning();
    renderLoadedPairs();

    const pair = getCurrentPair();
    setStatus(`Start od numeru ${pair.nr}. Podaj odpowiedź po angielsku, a potem powiedz „test”.`);
    if (readPolish) speak(pair.pl, 'pl-PL');
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
    if (state.currentIndex >= list.length) state.currentIndex = 0;
    resetCurrentAnswer();
    renderLearning();
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    requestWakeLock();
    renderLoadedPairs();
    setStatus('Start. Wypowiedz odpowiedź po angielsku, a potem powiedz „test” albo kliknij Sprawdź. Mikrofon jest utrzymywany jako włączony, o ile przeglądarka na to pozwala.');
    speak(pair.pl, 'pl-PL');
  }

  function stopStudy() {
    state.running = false;
    state.listening = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    safeStopRecognition(false);
    releaseWakeLock();
    el.micBtn.textContent = 'Włącz mikrofon';
    setStatus('Zatrzymano naukę.');
  }

  function revealAnswer() {
    const pair = getCurrentPair();
    if (!pair) {
      setStatus('Brak aktualnej pary do sprawdzenia.', 'warning');
      return;
    }

    state.revealed = true;
    state.currentFeedback = evaluateCurrentAnswer(pair);

    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('pl-PL', true);
    renderLearning();

    const feedbackText = state.currentFeedback ? state.currentFeedback.spokenComment : '';
    setStatus('Sprawdź swoją odpowiedź. Program czeka na „następne” lub inną komendę.');
    speakMany([
      { text: pair.en, lang: 'en-US' },
      { text: feedbackText, lang: 'pl-PL' }
    ]);
  }

  function nextPair() {
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
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    setStatus('Kolejna para. Podaj odpowiedź po angielsku, a potem powiedz „test”.');
    speak(pair.pl, 'pl-PL');
  }

  function prevPair() {
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
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    ensureListeningDuringStudy();
    setStatus('Poprzednia para. Podaj odpowiedź po angielsku, a potem powiedz „test”.');
    speak(pair.pl, 'pl-PL');
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
      setStatus('Powtarzam tekst polski.');
      speak(pair.pl, 'pl-PL');
    }
  }

  function addCurrentToReview() {
    const pair = getCurrentPair();
    if (!pair) {
      setStatus('Brak aktualnej pary do dodania.', 'warning');
      return;
    }
    const nr = String(pair.nr);
    if (!state.reviewNumbers.map(String).includes(nr)) {
      state.reviewNumbers.push(pair.nr);
      saveReview();
      renderReviewList();
      setStatus(`Dodano do listy powtórek. Liczba pozycji: ${state.reviewNumbers.length}.`);
    } else {
      setStatus('Ta para jest już na liście powtórek.', 'warning');
    }
  }

  function scrollToReview() {
    renderReviewList();
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
    state.reviewNumbers = state.reviewNumbers.filter((nr) => state.pairs.some((pair) => String(pair.nr) === String(nr)));
    state.currentIndex = 0;
    state.revealed = false;
    resetCurrentAnswer();
    savePairs();
    saveReview();
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
    if (!confirm('Czy na pewno wyczyścić całą zaimportowaną listę i listę powtórek?')) return;
    state.pairs = [];
    state.reviewNumbers = [];
    state.currentIndex = 0;
    state.revealed = false;
    resetCurrentAnswer();
    localStorage.removeItem(STORAGE_KEYS.pairs);
    localStorage.removeItem(STORAGE_KEYS.review);
    renderAll();
    setStatus('Wyczyszczono dane.');
  }

  function clearReview() {
    if (!state.reviewNumbers.length) {
      setStatus('Lista powtórek już jest pusta.', 'warning');
      return;
    }
    if (!confirm('Czy wyczyścić całą listę powtórek?')) return;
    state.reviewNumbers = [];
    saveReview();
    if (state.mode === 'review') state.currentIndex = 0;
    renderAll();
    setStatus('Wyczyszczono listę powtórek.');
  }

  function removeFromReview(nr) {
    state.reviewNumbers = state.reviewNumbers.filter((item) => String(item) !== String(nr));
    saveReview();
    if (state.mode === 'review') state.currentIndex = Math.max(0, state.currentIndex - 1);
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
    const reviewSet = new Set(state.reviewNumbers.map(String));
    return state.pairs.filter((pair) => reviewSet.has(String(pair.nr)));
  }

  function renderAll() {
    renderLearning();
    renderReviewList();
    renderImportInfo();
    renderLoadedPairs();
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
    if (!el.evaluationBox) return;
    if (!state.revealed || !state.currentFeedback) {
      el.evaluationBox.hidden = true;
      return;
    }

    const feedback = state.currentFeedback;
    el.evaluationBox.hidden = false;
    el.evaluationScore.textContent = `${feedback.score}%`;
    el.evaluationComment.textContent = feedback.comment;
    el.evaluationModeLabel.textContent = feedback.modeLabel || getEvaluationModeLabel(state.settings.evaluationMode);
    el.missingWords.textContent = feedback.missing.length ? feedback.missing.join(', ') : 'brak';
    el.extraWords.textContent = feedback.extra.length ? feedback.extra.join(', ') : 'brak';
    el.orderInfo.textContent = feedback.orderInfo || '—';
    el.suggestionInfo.textContent = feedback.suggestion || '—';
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
    const currentNr = currentPair ? String(currentPair.nr) : '';
    const activeNumbers = new Set(getActiveList().map((pair) => String(pair.nr)));

    state.pairs.forEach((pair) => {
      const row = document.createElement('tr');
      row.tabIndex = 0;
      row.dataset.nr = pair.nr;
      if (String(pair.nr) === currentNr) row.classList.add('active-row');
      if (!activeNumbers.has(String(pair.nr))) row.classList.add('inactive-row');

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
      removeButton.addEventListener('click', () => removeFromReview(pair.nr));

      item.append(nr, text, removeButton);
      el.reviewList.append(item);
    });
  }

  function renderImportInfo() {
    el.importInfo.textContent = state.pairs.length
      ? `Aktualnie zapisano lokalnie ${state.pairs.length} pozycji.`
      : 'Brak zaimportowanych danych.';
  }

  function setStatus(message, type = '') {
    el.status.className = `status${type ? ` ${type}` : ''}`;
    el.status.textContent = message;
  }
})();
