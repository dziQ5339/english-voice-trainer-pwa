# Angielski Głosowo — PWA v10

Prosta aplikacja PWA do głosowej nauki angielskich słówek i zdań na podstawie własnej listy `Nr;Polski;English`.

## Najważniejsze zmiany w v10

### 1. Poprawiony tryb samochodowy

W wersji v10 poprawiono mechanizm automatycznego działania trybu samochodowego. W poprzedniej wersji przejście do automatycznego sprawdzenia lub następnej pary mogło nie uruchomić się poprawnie, jeżeli przeglądarka nie zwróciła zdarzenia zakończenia syntezy mowy.

Dodano bezpiecznik czasowy dla odczytu głosowego. Dzięki temu aplikacja powinna kontynuować tryb samochodowy nawet wtedy, gdy Web Speech API nie zgłosi poprawnie końca odczytywania.

### 2. Widoczny licznik odliczający wstecz

Dodano widoczny licznik trybu samochodowego na głównym ekranie nauki.

Licznik pokazuje:

- ile sekund zostało do automatycznego sprawdzenia odpowiedzi,
- ile sekund zostało do przejścia do następnej pary.

Przykładowe komunikaty:

```text
Automatyczne sprawdzenie za: 8 s
Następna para za: 4 s
```

### 3. Zachowane funkcje v9

Pozostają funkcje z wersji v9:

- tryb samochodowy z ustawieniem czasów,
- sterowanie klawiaturą / pilotem Bluetooth HID,
- możliwość przypisywania własnych skrótów klawiszowych,
- sterowanie słuchawkami Bluetooth przez Media Session API,
- lista powtórek niezależna od aktualnej listy,
- zapamiętywanie ostatniej pozycji,
- obsługa polskich znaków w imporcie CSV.

### 4. Zmieniony cache PWA

Service worker używa cache `english-voice-trainer-v10`, żeby telefon łatwiej pobrał nową wersję po aktualizacji GitHub Pages.

## Struktura plików

```text
english-voice-trainer-pwa-v10/
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

## Jak przetestować tryb samochodowy

1. Zaimportuj przykładowe dane albo własny plik CSV.
2. W ustawieniach rozwiń sekcję **Tryb samochodowy — automatyczne sterowanie czasem**.
3. Zaznacz **Tryb samochodowy: automatycznie sprawdzaj i przechodź dalej**.
4. Ustaw dla testu krótkie czasy, np.:
   - czas na odpowiedź: `4 s`,
   - czas po sprawdzeniu: `2 s`.
5. Kliknij **Start**.
6. Po odczytaniu tekstu po polsku powinien pojawić się licznik odliczający do sprawdzenia.
7. Po sprawdzeniu powinien pojawić się licznik odliczający do następnej pary.

## Aktualizacja na GitHub Pages

1. Rozpakuj `english-voice-trainer-pwa-v10.zip`.
2. Wgraj pliki do głównego katalogu repozytorium GitHub.
3. Upewnij się, że `index.html` jest bezpośrednio w głównym katalogu repozytorium.
4. Kliknij **Commit changes**.
5. Wejdź w **Actions** i poczekaj na zielony status publikacji.
6. Na telefonie odśwież aplikację. Gdy nadal pokazuje starą wersję, wyczyść dane strony/PWA w Chrome.

## Ograniczenia

- Rozpoznawanie mowy zależy od przeglądarki, mikrofonu, internetu i ustawień Androida.
- Synteza mowy Web Speech API na telefonach może czasem działać niestabilnie. W v10 dodano obejście, ale przeglądarka nadal może mieć własne ograniczenia.
- Sterowanie słuchawkami Bluetooth przez Media Session API jest eksperymentalne i nie zawsze działa.
- Sterowanie klawiaturą/pilotem Bluetooth wymaga urządzenia, które wysyła zwykłe klawisze HID, np. Enter, strzałki, litery.
- Tryb samochodowy działa lokalnie w aplikacji i nie wymaga dodatkowego API.
