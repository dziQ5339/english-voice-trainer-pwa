# Angielski Głosowo PWA — wersja v7

Prosta aplikacja PWA do głosowej nauki angielskich słówek i zdań z własnej listy.

## Najważniejsze zmiany w v7

1. Zmniejszono górną belkę. Opis aplikacji jest dostępny jako dymek po najechaniu/kliknięciu ikony `i`.
2. Przebudowano ekran nauki pod telefon: najpierw widać tekst polski, rozpoznaną odpowiedź, poprawne tłumaczenie i cztery główne przyciski.
3. Główne przyciski są w zwartej linii: `Sprawdź / test`, `Następne / dalej`, `Dodaj / dodaj`, `Mikrofon`.
4. Lista powtórek jest sekcją rozwijaną.
5. Program odczytuje numer pary przed tekstem po polsku, np. `15. Chciałbym zamówić kawę.`
6. Program zapisuje ostatnią pozycję w `localStorage` i po ponownym otwarciu próbuje wrócić do ostatniego miejsca.
7. Lista powtórek jest niezależna od aktualnie załadowanej listy i nie znika po imporcie innego CSV.
8. Mikrofon nie jest już zatrzymywany na czas każdego odczytu syntezatorem mowy. Aplikacja ignoruje wyniki rozpoznania w czasie mówienia programu, co ogranicza częste przełączanie mikrofonu.
9. Ponawianie nasłuchu po zakończeniu sesji rozpoznawania odbywa się z krótkim opóźnieniem, bez agresywnego zapętlania.

## Komendy głosowe

Zalecane krótkie komendy:

- `test` — sprawdź odpowiedź,
- `dalej` — następna para,
- `cofnij` — poprzednia para,
- `jeszcze` — powtórz,
- `dodaj` — dodaj aktualną pozycję do powtórek,
- `lista` — pokaż listę powtórek,
- `mówię` — przełącz na odpowiedź po angielsku,
- `kasuj` — wyczyść rozpoznaną odpowiedź,
- `start` — rozpocznij,
- `stop` — zatrzymaj.

Działają również starsze komendy: `sprawdź`, `następne`, `poprzednie`, `powtórz`, `dodaj do listy`, `pokaż listę powtórek`.

## Format danych

CSV albo tekst wklejany do aplikacji:

```csv
Nr;Polski;English
1;dzień dobry;good morning
2;Chciałbym zamówić kawę.;I would like to order a coffee.
```

Import CSV obsługuje UTF-8, Windows-1250 i ISO-8859-2.

## Uruchomienie lokalne na komputerze

W folderze z plikiem `index.html` uruchom:

```bash
python -m http.server 8000
```

Następnie otwórz:

```text
http://localhost:8000
```

## Aktualizacja na GitHub Pages

1. Rozpakuj paczkę `english-voice-trainer-pwa-v7.zip`.
2. Wgraj zawartość folderu do głównego katalogu repozytorium GitHub.
3. Upewnij się, że `index.html` jest w głównym katalogu repozytorium.
4. Kliknij `Commit changes`.
5. Wejdź w `Actions` i sprawdź, czy publikacja GitHub Pages zakończyła się zielonym znakiem.
6. Na telefonie odśwież aplikację. Jeżeli nadal widać starą wersję, wyczyść dane strony/PWA w Chrome.

## Test mikrofonu

1. Otwórz aplikację przez HTTPS, np. GitHub Pages.
2. Kliknij `Start` lub `Mikrofon`.
3. Zezwól na mikrofon w Chrome.
4. Powiedz odpowiedź po angielsku.
5. Po zapisaniu odpowiedzi powiedz `test`.

## Test zapamiętywania pozycji

1. Zaimportuj listę.
2. Przejdź np. do pozycji 5.
3. Zamknij kartę albo aplikację PWA.
4. Otwórz aplikację ponownie.
5. Aplikacja powinna przywrócić ostatnio zapisaną pozycję, jeżeli lista nadal jest dostępna lokalnie.

## Ograniczenia

- Web Speech API działa najlepiej w Chrome na Androidzie i zwykle wymaga internetu.
- Przeglądarka może zakończyć sesję rozpoznawania mowy mimo ustawienia `continuous = true`.
- Strona powinna działać przez HTTPS, aby mikrofon, PWA i blokada wygaszania ekranu działały możliwie poprawnie.
- Ocena odpowiedzi opiera się na tekście rozpoznanym przez przeglądarkę, a nie na profesjonalnej analizie fonetycznej.
