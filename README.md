# Angielski Głosowo — PWA v9

Prosta aplikacja PWA do głosowej nauki angielskich słówek i zdań na podstawie własnej listy `Nr;Polski;English`.

## Najważniejsze zmiany w v9

### 1. Tryb samochodowy

Dodano opcję **Tryb samochodowy — automatyczne sterowanie czasem**.

Po włączeniu:

1. aplikacja czyta numer i tekst po polsku,
2. czeka ustawioną liczbę sekund na odpowiedź użytkownika,
3. automatycznie uruchamia funkcję **Sprawdź**,
4. czyta poprawną odpowiedź po angielsku,
5. po ustawionym czasie przechodzi do następnej pary.

Dostępne ustawienia:

- **Czas na odpowiedź przed sprawdzeniem [s]** — domyślnie 8 s,
- **Czas po sprawdzeniu przed następną parą [s]** — domyślnie 4 s.

Ten tryb jest przeznaczony do sytuacji, w których użytkownik nie chce albo nie może klikać przycisków. Podczas jazdy samochodem nie należy obsługiwać telefonu ręcznie.

### 2. Sterowanie klawiaturą / pilotem Bluetooth HID

Dodano opcję **Sterowanie klawiaturą / pilotem Bluetooth**.

Aplikacja reaguje na zwykłe klawisze klawiatury albo małego pilota Bluetooth działającego jako klawiatura HID, nie jako pilot multimedialny.

Domyślne skróty:

| Funkcja | Klawisz |
|---|---|
| Sprawdź | Enter |
| Następne | Strzałka w prawo |
| Poprzednie | Strzałka w lewo |
| Dodaj do powtórek | D |
| Powtórz | R |
| Mikrofon | M |
| Start / Stop | S |

Każdy skrót można zmienić: kliknij pole z przypisanym klawiszem i naciśnij nowy klawisz.

### 3. Zmieniony cache PWA

Service worker używa cache `english-voice-trainer-v9`, żeby telefon łatwiej pobrał nową wersję po aktualizacji GitHub Pages.

## Struktura plików

```text
english-voice-trainer-pwa-v9/
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

## Aktualizacja na GitHub Pages

1. Rozpakuj `english-voice-trainer-pwa-v9.zip`.
2. Wgraj pliki do głównego katalogu repozytorium GitHub.
3. Upewnij się, że `index.html` jest bezpośrednio w głównym katalogu repozytorium.
4. Kliknij **Commit changes**.
5. Wejdź w **Actions** i poczekaj na zielony status publikacji.
6. Na telefonie odśwież aplikację. Gdy nadal pokazuje starą wersję, wyczyść dane strony/PWA w Chrome.

## Ograniczenia

- Rozpoznawanie mowy zależy od przeglądarki, mikrofonu, internetu i ustawień Androida.
- Sterowanie słuchawkami Bluetooth przez Media Session API jest eksperymentalne i nie zawsze działa.
- Sterowanie klawiaturą/pilotem Bluetooth wymaga urządzenia, które wysyła zwykłe klawisze HID, np. Enter, strzałki, litery.
- Tryb samochodowy działa lokalnie w aplikacji i nie wymaga dodatkowego API.
