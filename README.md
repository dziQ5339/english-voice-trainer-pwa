# Angielski Głosowo PWA — wersja v13

Wersja v13 upraszcza aplikację: rozpoznawanie mowy służy wyłącznie do krótkich komend sterujących po angielsku. Program nie rozpoznaje już i nie ocenia treści odpowiedzi użytkownika.

## Najważniejsze zmiany

- Usunięto praktyczne użycie oceny odpowiedzi: brak procentów, brak brakujących słów, brak komentarzy oceniających.
- Aplikacja ignoruje dłuższe wypowiedzi niebędące komendą.
- Mikrofon nasłuchuje tylko komend w języku angielskim: domyślnie `en-US`, opcjonalnie `en-GB`.
- Uproszczono ekran nauki: zamiast rozpoznanej odpowiedzi pokazuje się ostatnia rozpoznana komenda.
- Zachowano: tryb samochodowy, lista powtórek, zapamiętywanie ostatniej pozycji, pilot Bluetooth / pierścień, skróty klawiaturowe, PWA i blokadę wygaszania ekranu.

## Komendy głosowe

| Komenda | Funkcja |
|---|---|
| `check`, `test`, `show` | Sprawdź odpowiedź |
| `next`, `go`, `forward` | Następne |
| `back`, `previous` | Poprzednie |
| `repeat`, `again` | Powtórz |
| `add`, `save` | Dodaj do powtórek |
| `list`, `review` | Pokaż listę powtórek |
| `start`, `begin` | Start |
| `stop`, `pause` | Stop |
| `clear`, `delete` | Wyczyść status komendy |
| `mic`, `microphone` | Mikrofon |

## Zasada działania

1. Program pokazuje i czyta numer oraz tekst po polsku.
2. Użytkownik samodzielnie wypowiada albo myśli odpowiedź po angielsku.
3. Program nie analizuje tej odpowiedzi.
4. Po komendzie `check` program pokazuje i czyta poprawne tłumaczenie po angielsku.
5. Po komendzie `next` program przechodzi do kolejnej pary.

## Uruchomienie lokalne

```bash
python -m http.server 8000
```

Następnie otwórz:

```text
http://localhost:8000
```

## Aktualizacja na GitHub Pages

1. Rozpakuj paczkę `english-voice-trainer-pwa-v13.zip`.
2. Wgraj wszystkie pliki do głównego katalogu repozytorium.
3. Upewnij się, że `index.html` jest bezpośrednio w katalogu głównym.
4. Kliknij `Commit changes`.
5. Poczekaj na zakończenie publikacji w zakładce `Actions`.
6. Na telefonie odśwież stronę lub wyczyść dane PWA, jeżeli nadal pokazuje starą wersję.

## Test mikrofonu

1. Uruchom aplikację przez HTTPS, np. GitHub Pages.
2. Kliknij `Mikrofon / mic`.
3. Powiedz: `check`, `next`, `repeat`, `add`.
4. Jeżeli powiesz dłuższe zdanie, np. `I would like to order a coffee`, program powinien je zignorować, bo nie jest komendą.

## Ograniczenia

Rozpoznawanie mowy w Chrome na Androidzie zależy od przeglądarki, mikrofonu, hałasu i połączenia internetowego. Aplikacja PWA nie ma pełnej kontroli nad Web Speech API, dlatego przy błędach `no-speech` próbuje utrzymać nasłuch, ale użytkownik nadal może używać przycisków ekranowych albo pilota.
