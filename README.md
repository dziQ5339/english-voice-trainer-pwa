# Angielski Głosowo — prosta aplikacja PWA — v6

Aplikacja do głosowej nauki angielskich słówek i zdań z własnej listy par: tekst po polsku oraz odpowiadający mu tekst po angielsku.

## 1. Co zmieniono w wersji v6

Wersja v6 rozbudowuje wersję v5 o trzy główne zmiany:

1. **Nie wygaszaj ekranu podczas nauki**
   - dodano opcję `Nie wygaszaj ekranu podczas nauki`,
   - po kliknięciu `Start` aplikacja próbuje zablokować wygaszanie ekranu przez `Screen Wake Lock API`,
   - po kliknięciu `Stop` blokada ekranu jest zwalniana,
   - po powrocie do aplikacji program próbuje ponownie utrzymać ekran aktywny,
   - funkcja działa tylko wtedy, gdy pozwala na to przeglądarka, system Android i bezpieczny kontekst strony, najlepiej `HTTPS`.

2. **Nowy tryb oceny: BRAK**
   - w ustawieniu `Tryb oceny odpowiedzi po angielsku` dodano opcję `BRAK — nie oceniaj wypowiedzi`,
   - po wybraniu tej opcji program pokazuje i odczytuje poprawną odpowiedź po angielsku, ale nie liczy procentów, nie pokazuje brakujących słów i nie wypowiada komentarza oceniającego.

3. **Prostsze komendy głosowe**
   - dodano krótkie komendy zaprojektowane tak, aby były łatwiejsze do wymówienia i rozpoznania przez przeglądarkę,
   - stare komendy nadal działają.

## 2. Zalecane komendy głosowe w v6

| Cel | Zalecana komenda | Starsza komenda, która nadal działa |
|---|---|---|
| Sprawdź odpowiedź | `test` | `sprawdź`, `sprawdz` |
| Następna para | `dalej` | `następne`, `nastepne` |
| Poprzednia para | `cofnij` | `poprzednie`, `wstecz` |
| Powtórz aktualny tekst | `jeszcze` | `powtórz`, `powtorz` |
| Dodaj do listy powtórek | `dodaj` | `dodaj do listy` |
| Pokaż listę powtórek | `lista` | `pokaż listę powtórek` |
| Tryb mówienia odpowiedzi EN | `mówię` | `odpowiedź`, `angielski` |
| Wyczyść rozpoznaną odpowiedź | `kasuj` | `wyczyść` |
| Rozpocznij | `start` | `rozpocznij` |
| Zatrzymaj | `stop` | `zatrzymaj` |

Przyjęta zasada: komendy powinny być krótkie, jednoznaczne i możliwie bez polskich znaków. Dlatego np. `dalej` jest praktyczniejsze niż `następne`, a `test` jest praktyczniejsze niż `sprawdź`.

## 3. Funkcje zachowane z wersji v5

- import tekstu i CSV,
- obsługa polskich znaków w imporcie CSV: `UTF-8`, `Windows-1250`, `ISO-8859-2`,
- przewijany podgląd załadowanych par,
- start nauki od dowolnego numeru pary,
- lista powtórek,
- nauka z listy powtórek,
- eksport listy powtórek do CSV,
- osobna szybkość głosu PL i EN,
- automatyczne utrzymywanie mikrofonu podczas nauki,
- automatyczne przełączanie języka rozpoznawania: odpowiedź EN → komendy PL,
- tryby oceny: `BRAK`, `prosta`, `średnia`, `zaawansowana lokalna`.

## 4. Architektura aplikacji

Aplikacja jest prostą aplikacją webową PWA bez backendu.

Pliki:

```text
english-voice-trainer-pwa-v6/
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

Warstwy:

1. `index.html` — struktura interfejsu.
2. `styles.css` — responsywny wygląd dla komputera i telefonu.
3. `app.js` — cała logika aplikacji.
4. `manifest.webmanifest` — konfiguracja PWA.
5. `sw.js` — service worker i cache plików.
6. `sample.csv` — przykładowe dane.

## 5. Uruchomienie na komputerze

W folderze aplikacji uruchom:

```bash
python -m http.server 8000
```

Następnie otwórz w przeglądarce:

```text
http://localhost:8000
```

Nie uruchamiaj aplikacji przez dwuklik na `index.html`, bo mikrofon, service worker i PWA działają poprawniej przez `localhost` albo `HTTPS`.

## 6. Uruchomienie na Androidzie

Najlepsza metoda to GitHub Pages, Netlify albo inny hosting z `HTTPS`.

Po wgraniu plików na GitHub Pages otwórz adres aplikacji w Chrome na Androidzie, np.:

```text
https://twoj-login.github.io/nazwa-repozytorium/
```

Następnie:

1. Zezwól na mikrofon.
2. Otwórz menu Chrome z trzema kropkami.
3. Wybierz `Dodaj do ekranu głównego` albo `Zainstaluj aplikację`.
4. Uruchamiaj aplikację z ikony na ekranie telefonu.

## 7. Ważne ograniczenia

1. **Nie wygaszaj ekranu** działa tylko wtedy, gdy przeglądarka obsługuje `Screen Wake Lock API`. Na Androidzie najlepiej testować w Chrome i przez `HTTPS`.
2. System Android lub Chrome mogą zwolnić blokadę ekranu, np. przy niskim poziomie baterii, przełączeniu aplikacji albo zablokowaniu telefonu.
3. Rozpoznawanie mowy zależy od przeglądarki, mikrofonu, internetu, uprawnień i hałasu w otoczeniu.
4. Tryb `Ocena zaawansowana lokalna` nie jest profesjonalną analizą fonetyczną wymowy. Program ocenia tekst rozpoznany przez przeglądarkę, a nie dokładną artykulację głosek, akcent i intonację.
5. Dane są zapisywane lokalnie w `localStorage`, osobno dla danej przeglądarki i adresu strony.

## 8. Format importu

Przykład:

```csv
Nr;Polski;English
1;dzień dobry;good morning
2;Chciałbym zamówić kawę.;I would like to order a coffee.
3;Gdzie jest najbliższy przystanek?;Where is the nearest bus stop?
```

Obsługiwane separatory:

- średnik,
- tabulator,
- przecinek.

Obsługiwane kodowania pliku CSV:

- `UTF-8`,
- `Windows-1250`,
- `ISO-8859-2`.
