# Angielski Głosowo — PWA v11

Prosta aplikacja PWA do głosowej nauki angielskich słówek i zdań na podstawie własnej listy `Nr;Polski;English`.

## Najważniejsze zmiany w v11

### 1. Sterowanie pilotem Bluetooth / pierścieniem

Dodano nową sekcję ustawień:

```text
Sterowanie pilotem Bluetooth / pierścieniem
```

Funkcja służy do praktycznego sprawdzenia, czy pilot typu **Pilot Pierścionek Bluetooth Multi Function Ring** może sterować aplikacją.

Aplikacja próbuje obsłużyć dwa typy zdarzeń:

- klawisze Bluetooth HID / klawiatura, np. `Enter`, `Space`, `ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `S`, `M`,
- zdarzenia multimedialne Media Session API, np. `play`, `pause`, `nexttrack`, `previoustrack`.

### 2. Test pilota Bluetooth

W ustawieniach dodano ekran:

```text
Test pilota Bluetooth
```

Po naciśnięciu przycisku pilota aplikacja pokazuje:

- typ zdarzenia,
- wykryty klawisz, np. `Key:Enter`, `Key:→`,
- kod fizycznego klawisza, jeżeli przeglądarka go udostępni,
- zdarzenie multimedialne, np. `Media:play`,
- informację, czy zdarzenie można przypisać do funkcji aplikacji.

### 3. Przypisywanie przycisków pilota do funkcji

Dla każdej funkcji dodano przycisk **Przypisz**.

Obsługiwane funkcje:

- Sprawdź,
- Następne,
- Poprzednie,
- Powtórz,
- Dodaj do powtórek,
- Start / Stop,
- Mikrofon.

Przykład użycia:

1. Włącz **Sterowanie pilotem Bluetooth / pierścieniem**.
2. Kliknij **Przypisz** przy funkcji **Następne**.
3. Naciśnij przycisk pilota.
4. Aplikacja zapisze wykryty klawisz lub zdarzenie multimedialne.
5. Przypisanie zostanie zapisane w `localStorage`.

### 4. Domyślne mapowania

Jeżeli użytkownik nic nie przypisze ręcznie, działają mapowania domyślne:

```text
Enter / Space       → Sprawdź
ArrowRight          → Następne
ArrowLeft           → Poprzednie
ArrowUp             → Powtórz
ArrowDown           → Dodaj do powtórek
S                   → Start / Stop
M                   → Mikrofon
Media play/pause     → Sprawdź
Media nexttrack      → Następne
Media previoustrack  → Poprzednie
Media seekbackward   → Powtórz, jeśli przeglądarka przekaże takie zdarzenie
Media seekforward    → Dodaj, jeśli przeglądarka przekaże takie zdarzenie
Media stop           → Start / Stop
```

### 5. Zabezpieczenie przed podwójnym wywołaniem

Dodano filtr czasowy. Jeżeli jedno naciśnięcie pilota wygeneruje kilka zdarzeń, aplikacja próbuje wykonać akcję tylko raz.

### 6. Zachowane funkcje v10

Pozostają funkcje z poprzednich wersji:

- tryb samochodowy z widocznym licznikiem odliczającym,
- sterowanie klawiaturą / pilotem Bluetooth HID,
- sterowanie słuchawkami Bluetooth przez Media Session API,
- rozpoznawanie komend głosowych,
- lista powtórek niezależna od aktualnej listy,
- zapamiętywanie ostatniej pozycji,
- obsługa polskich znaków w imporcie CSV,
- niewygaszanie ekranu podczas nauki.

### 7. Zmieniony cache PWA

Service worker używa cache:

```text
english-voice-trainer-v11
```

Dzięki temu telefon powinien łatwiej pobrać nową wersję po aktualizacji GitHub Pages.

## Struktura plików

```text
english-voice-trainer-pwa-v11/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── sw.js
├── sample.csv
├── README.md
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Uruchomienie lokalnie na komputerze

Wejdź do folderu aplikacji i uruchom:

```bash
python -m http.server 8000
```

Następnie otwórz w przeglądarce:

```text
http://localhost:8000
```

## Testowanie pilota Bluetooth na Androidzie

1. Sparuj pilot-pierścień z telefonem w ustawieniach Bluetooth Androida.
2. Otwórz aplikację w Chrome albo jako PWA.
3. Najlepiej użyj adresu `https://...`, np. GitHub Pages.
4. Wejdź w **Ustawienia mowy**.
5. Rozwiń **Sterowanie pilotem Bluetooth / pierścieniem**.
6. Włącz opcję **Sterowanie pilotem Bluetooth / pierścieniem**.
7. Naciśnij dowolny przycisk pilota.
8. Sprawdź pole **Test pilota Bluetooth**.

Jeżeli pojawi się np.:

```text
Wykryto klawisz HID / keydown: Key:→
```

pilot działa jako klawiatura HID i można go przypisywać do funkcji aplikacji.

Jeżeli pojawi się np.:

```text
Wykryto zdarzenie multimedialne: Media:nexttrack
```

pilot wysyła zdarzenie multimedialne i aplikacja może próbować obsłużyć je przez Media Session API.

Jeżeli nic się nie pojawia, przeglądarka najprawdopodobniej nie otrzymuje zdarzeń z tego pilota.

## Przypisywanie przycisku pilota

1. Włącz **Sterowanie pilotem Bluetooth / pierścieniem**.
2. Przy wybranej funkcji kliknij **Przypisz**.
3. Naciśnij przycisk pilota.
4. Sprawdź komunikat, np.:

```text
Przypisano Key:→ do funkcji Następne.
```

5. Przetestuj przycisk podczas nauki.

## Aktualizacja na GitHub Pages

1. Rozpakuj `english-voice-trainer-pwa-v11.zip`.
2. Wgraj pliki do głównego katalogu repozytorium GitHub.
3. Upewnij się, że `index.html` jest bezpośrednio w głównym katalogu repozytorium.
4. Kliknij **Commit changes**.
5. Wejdź w **Actions** i poczekaj na zielony status publikacji.
6. Na telefonie odśwież aplikację.
7. Jeżeli nadal pokazuje starą wersję, wyczyść dane strony/PWA w Chrome.

## Ograniczenia

- Aplikacja PWA nie ma pełnego dostępu do surowych danych Bluetooth tak jak natywna aplikacja Android.
- Pilot musi działać jako klawiatura HID albo wysyłać zdarzenia multimedialne.
- Nie każdy przycisk pilota będzie widoczny dla przeglądarki.
- WebHID nie jest pewnym rozwiązaniem dla Chrome na Androidzie; dlatego aplikacja używa praktycznego testu `keydown` i Media Session API.
- Media Session API jest eksperymentalne w tym zastosowaniu i może być przejmowane przez inne aplikacje audio, np. Spotify albo YouTube.
- Najlepszym testem jest ekran **Test pilota Bluetooth** w aplikacji.
