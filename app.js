(() => {
  'use strict';

  const STORAGE_KEYS = {
    pairs: 'evt_pairs_v1',
    review: 'evt_review_numbers_v1',
    settings: 'evt_settings_v1'
  };

  const DEFAULT_SETTINGS = {
    rate: 1,
    volume: 1,
    voicePl: '',
    voiceEn: '',
    recognitionLang: 'pl-PL',
    evaluateAnswer: true,
    autoLanguageSwitch: true
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
    missingWords: document.getElementById('missingWords'),
    extraWords: document.getElementById('extraWords'),
    correctAnswerBox: document.getElementById('correctAnswerBox'),
    englishText: document.getElementById('englishText'),
    status: document.getElementById('status'),
    startBtn: document.getElementById('startBtn'),
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
    rateInput: document.getElementById('rateInput'),
    rateValue: document.getElementById('rateValue'),
    volumeInput: document.getElementById('volumeInput'),
    volumeValue: document.getElementById('volumeValue'),
    voicePl: document.getElementById('voicePl'),
    voiceEn: document.getElementById('voiceEn'),
    recognitionLang: document.getElementById('recognitionLang'),
    evaluateAnswer: document.getElementById('evaluateAnswer'),
    autoLanguageSwitch: document.getElementById('autoLanguageSwitch'),
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
    loadVoices();
    applySettingsToUi();
    renderAll();
  }

  function bindEvents() {
    el.startBtn.addEventListener('click', startStudy);
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

    el.rateInput.addEventListener('input', () => {
      state.settings.rate = Number(el.rateInput.value);
      el.rateValue.textContent = state.settings.rate.toFixed(1);
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

    el.evaluateAnswer.addEventListener('change', () => {
      state.settings.evaluateAnswer = el.evaluateAnswer.checked;
      saveSettings();
      renderEvaluationState();
    });

    el.autoLanguageSwitch.addEventListener('change', () => {
      state.settings.autoLanguageSwitch = el.autoLanguageSwitch.checked;
      saveSettings();
      setStatus(state.settings.autoLanguageSwitch
        ? 'Automatyczne przełączanie języka jest włączone.'
        : 'Automatyczne przełączanie języka jest wyłączone. Użyj ręcznie pola „Język rozpoznawania mowy”.');
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
    el.rateInput.value = String(state.settings.rate);
    el.rateValue.textContent = Number(state.settings.rate).toFixed(1);
    el.volumeInput.value = String(state.settings.volume);
    el.volumeValue.textContent = Number(state.settings.volume).toFixed(1);
    el.recognitionLang.value = state.settings.recognitionLang;
    el.evaluateAnswer.checked = Boolean(state.settings.evaluateAnswer);
    el.autoLanguageSwitch.checked = Boolean(state.settings.autoLanguageSwitch);
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
        setStatus('Odpowiedź zapisana. Powiedz „sprawdź” albo kliknij przycisk Sprawdź.');
      }
      return;
    }

    const preview = `${state.recognizedAnswer} ${interimText}`.trim();
    el.recognizedText.textContent = preview || '—';
  }

  function normalizeCommand(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-ząćęłńóśźż0-9\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function detectCommand(text) {
    const t = normalizeCommand(text);
    const includesAny = (...words) => words.some((word) => t.includes(word));

    if (includesAny('pokaz liste powtorek', 'pokaz liste', 'lista powtorek', 'show review list')) return 'showReview';
    if (includesAny('dodaj do listy', 'dodaj do powtorek', 'dodaj liste', 'dodaj', 'add to list', 'add review')) return 'addReview';
    if (includesAny('sprawdz', 'sprawdzam', 'check')) return 'check';
    if (includesAny('nastepne', 'nastepny', 'dalej', 'next')) return 'next';
    if (includesAny('poprzednie', 'poprzedni', 'wstecz', 'previous', 'back')) return 'prev';
    if (includesAny('powtorz', 'powtor', 'repeat')) return 'repeat';
    if (includesAny('start', 'rozpocznij')) return 'start';
    if (includesAny('stop', 'zatrzymaj')) return 'stop';
    return null;
  }

  function runCommand(command) {
    const actions = {
      start: startStudy,
      stop: stopStudy,
      check: revealAnswer,
      next: nextPair,
      prev: prevPair,
      repeat: repeatCurrent,
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
      utterance.rate = Number(state.settings.rate) || 1;
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
    setStatus('Start. Wypowiedz odpowiedź po angielsku, a potem powiedz „sprawdź”.');
    speak(pair.pl, 'pl-PL');
  }

  function stopStudy() {
    state.running = false;
    state.listening = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    safeStopRecognition(false);
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
    if (state.settings.evaluateAnswer) {
      state.currentFeedback = evaluateCurrentAnswer(pair);
    } else {
      state.currentFeedback = null;
    }

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
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    setStatus('Kolejna para. Podaj odpowiedź po angielsku, a potem powiedz „sprawdź”.');
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
    const pair = getCurrentPair();
    if (state.settings.autoLanguageSwitch) setRecognitionLanguage('en-US', true);
    setStatus('Poprzednia para. Podaj odpowiedź po angielsku, a potem powiedz „sprawdź”.');
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
    reader.onload = () => importFromText(String(reader.result || ''));
    reader.onerror = () => setStatus('Nie udało się odczytać pliku CSV.', 'error');
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  }

  function importFromText(text) {
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
    el.importInfo.textContent = `Zaimportowano ${state.pairs.length} pozycji.${errorInfo}`;
    setStatus(`Zaimportowano ${state.pairs.length} pozycji. Naciśnij Start.`);
  }

  function parsePairs(text) {
    const lines = text
      .replace(/^\uFEFF/, '')
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
  }

  function evaluateCurrentAnswer(pair) {
    const expected = normalizeForComparison(pair.en);
    const actual = normalizeForComparison(state.recognizedAnswer);

    if (!actual) {
      return {
        score: 0,
        missing: uniqueWords(tokenizeComparable(expected)),
        extra: [],
        comment: 'Nie rozpoznano odpowiedzi po angielsku. Spróbuj powiedzieć odpowiedź jeszcze raz albo użyj przycisku „Odpowiedź EN”.',
        spokenComment: 'Nie rozpoznano odpowiedzi. Spróbuj jeszcze raz.'
      };
    }

    const expectedWords = tokenizeComparable(expected);
    const actualWords = tokenizeComparable(actual);
    const missing = subtractWords(expectedWords, actualWords);
    const extra = subtractWords(actualWords, expectedWords);
    const distance = levenshteinDistance(expected, actual);
    const maxLength = Math.max(expected.length, actual.length, 1);
    const textSimilarity = Math.max(0, 1 - distance / maxLength);
    const completeness = expectedWords.length ? Math.max(0, 1 - missing.length / expectedWords.length) : 1;
    const score = Math.round((textSimilarity * 0.7 + completeness * 0.3) * 100);

    let baseComment;
    let spokenComment;
    if (score >= 90) {
      baseComment = 'Bardzo dobrze. Rozpoznany tekst jest bardzo podobny do poprawnej odpowiedzi.';
      spokenComment = 'Bardzo dobrze.';
    } else if (score >= 75) {
      baseComment = 'Dobrze. Są drobne różnice względem poprawnej odpowiedzi.';
      spokenComment = 'Dobrze. Są drobne różnice.';
    } else if (score >= 55) {
      baseComment = 'Częściowo dobrze. Warto powtórzyć całe zdanie i zwrócić uwagę na brakujące słowa.';
      spokenComment = 'Częściowo dobrze. Powtórz całe zdanie.';
    } else {
      baseComment = 'Spróbuj jeszcze raz. Rozpoznany tekst mocno różni się od poprawnej odpowiedzi.';
      spokenComment = 'Spróbuj jeszcze raz.';
    }

    if (missing.length) {
      spokenComment += ` Brakuje: ${missing.slice(0, 3).join(', ')}.`;
    }

    return { score, missing, extra, comment: baseComment, spokenComment };
  }

  function normalizeForComparison(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
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
    if (!state.revealed || !state.settings.evaluateAnswer || !state.currentFeedback) {
      el.evaluationBox.hidden = true;
      return;
    }

    const feedback = state.currentFeedback;
    el.evaluationBox.hidden = false;
    el.evaluationScore.textContent = `${feedback.score}%`;
    el.evaluationComment.textContent = feedback.comment;
    el.missingWords.textContent = feedback.missing.length ? feedback.missing.join(', ') : 'brak';
    el.extraWords.textContent = feedback.extra.length ? feedback.extra.join(', ') : 'brak';
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
