# Angielski Głosowo — prosta aplikacja PWA — v5

Aplikacja do głosowej nauki angielskich słówek i zdań z własnej listy par: tekst po polsku oraz odpowiadający mu tekst po angielsku.

## 1. Co zmieniono w wersji v5

Wersja v5 rozbudowuje wersję v4 o obsługę polskich znaków w imporcie CSV oraz w rozpoznawaniu komend głosowych. Wersja v4 zawierała wcześniej następujące funkcje:

1. **Mikrofon domyślnie utrzymywany jako włączony podczas nauki**
   - po kliknięciu `Start` aplikacja próbuje uruchomić nasłuch,
   - po błędzie `no-speech` aplikacja nie wyłącza trwale mikrofonu,
   - `Stop` zatrzymuje naukę i wyłącza mikrofon,
   - jeżeli przeglądarka blokuje mikrofon, aplikacja pokazuje komunikat o uprawnieniach.

2. **Podgląd załadowanych słów i zdań**
   - po imporcie widoczna jest przewijana tabela załadowanych par,
   - kolumny: `Nr`, `Polski`, `English`,
   - aktualna para jest wyróżniona,
   - kliknięcie w wiersz przechodzi do wybranej pary.

3. **Start nauki od dowolnego numeru pary**
   - dodano pole `Start od nr`,
   - aplikacja szuka oryginalnego numeru z kolumny `Nr`, a nie indeksu tablicy,
   - po przejściu do wybranej pary odczytuje tekst po polsku.

4. **Osobna szybkość odczytu dla języka polskiego i angielskiego**
   - `Szybkość głosu PL`,
   - `Szybkość głosu EN`,
   - ustawienia zapisują się lokalnie w `localStorage`.

5. **Trzy tryby oceny odpowiedzi po angielsku**
   - `Ocena prosta`,
   - `Ocena średnia`,
   - `Ocena zaawansowana lokalna`.

6. **Lepsza obsługa polskich znaków — nowość w v5**
   - import CSV obsługuje `UTF-8`, `Windows-1250` oraz `ISO-8859-2`,
   - pliki CSV utworzone w Excelu w polskiej wersji Windows powinny poprawniej zachowywać znaki `ą ć ę ł ń ó ś ź ż`,
   - komendy głosowe działają zarówno z polskimi znakami, jak i bez nich, np. `sprawdź` / `sprawdz`, `następne` / `nastepne`, `powtórz` / `powtorz`,
   - tekst importowany ręcznie jest normalizowany do poprawnej postaci Unicode `NFC`,
   - eksport listy powtórek nadal zapisuje CSV jako `UTF-8` z BOM, żeby Excel poprawniej widział polskie znaki.

## 2. Ważna uwaga o ocenie zaawansowanej

Tryb `Ocena zaawansowana lokalna` działa **bez zewnętrznego API**. Nie wysyła głosu ani tekstu do OpenAI, Azure ani innej usługi. Jest to ocena heurystyczna wykonywana w JavaScript w przeglądarce.

Ten tryb analizuje m.in.:

- podobieństwo rozpoznanego tekstu do poprawnej odpowiedzi,
- brakujące istotne słowa,
- brakujące przedimki `a`, `an`, `the`,
- brakujące czasowniki pomocnicze lub modalne, np. `would`, `can`, `should`,
- kolejność słów,
- ogólną naturalność odpowiedzi względem wzorca.

Nie jest to pełna profesjonalna analiza fonetyczna wymowy. Aplikacja nadal ocenia głównie to, **co przeglądarka rozpoznała jako tekst**, a nie dokładną artykulację głosek, akcent, rytm i intonację.

Prawdziwa ocena wymowy typu `accuracy`, `fluency`, `prosody` wymagałaby zewnętrznego silnika, np. Azure AI Speech Pronunciation Assessment albo własnego backendu korzystającego z modelu AI. Klucza API nie należy umieszczać bezpośrednio w kodzie frontendowym PWA.

## 3. Architektura aplikacji

Aplikacja jest prostą aplikacją webową PWA bez backendu.

Warstwy:

1. `index.html` — struktura ekranu, przyciski, import danych, podgląd par, lista powtórek i ustawienia.
2. `styles.css` — responsywny interfejs przystosowany do telefonu: duży tekst, duże przyciski, układ kart, przewijana tabela.
3. `app.js` — cała logika aplikacji:
   - import CSV lub tekstu, w tym plików z polskimi znakami w kodowaniu UTF-8, Windows-1250 i ISO-8859-2,
   - przechodzenie po parach w kolejności,
   - start od konkretnego numeru pary,
   - synteza mowy PL/EN z osobnymi szybkościami,
   - rozpoznawanie komend głosowych,
   - automatyczne utrzymywanie mikrofonu,
   - trzy tryby oceny rozpoznanej odpowiedzi po angielsku,
   - automatyczne przełączanie rozpoznawania: odpowiedź EN → komendy PL,
   - lista powtórek,
   - eksport listy powtórek do CSV,
   - zapis danych w `localStorage`.
4. `manifest.webmanifest` — konfiguracja PWA.
5. `sw.js` — service worker i cache plików aplikacji.
6. `sample.csv` — przykładowy plik z parami słówek i zdań.

## 4. Technologie

- HTML5
- CSS3
- JavaScript bez frameworków
- Web Speech API:
  - `speechSynthesis` do odczytywania tekstu,
  - `SpeechRecognition` / `webkitSpeechRecognition` do rozpoznawania mowy, jeżeli przeglądarka obsługuje tę funkcję.
- PWA:
  - `manifest.webmanifest`,
  - `service worker`,
  - ikony aplikacji.
- `localStorage` do lokalnego zapisu danych w przeglądarce.

## 5. Struktura plików

```text
english-voice-trainer-pwa-v5/
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

## 6. Komendy głosowe

Program rozpoznaje następujące komendy. W wersji v5 komendy mogą być rozpoznane z polskimi znakami albo bez nich:

- `start`
- `stop`
- `sprawdź` / `sprawdz`
- `następne` / `nastepne`
- `poprzednie`
- `powtórz` / `powtorz`
- `dodaj do listy`
- `pokaż listę powtórek`

Przy rozpoznawaniu `en-US` działają też proste komendy angielskie: `check`, `next`, `previous`, `repeat`, `start`, `stop`.

## 7. Uruchomienie na komputerze

Najprostsza metoda:

1. Rozpakuj projekt.
2. Wejdź do katalogu projektu.
3. Uruchom lokalny serwer HTTP.

```bash
cd english-voice-trainer-pwa-v5
python -m http.server 8000
```

Następnie otwórz w przeglądarce:

```text
http://localhost:8000
```

Nie zaleca się uruchamiania przez dwuklik na `index.html`, bo service worker, PWA i mikrofon działają poprawniej przez `localhost` albo `HTTPS`.

## 8. Uruchomienie na telefonie z Androidem

### Wariant A — test przez komputer w tej samej sieci Wi‑Fi

1. Komputer i telefon muszą być w tej samej sieci Wi‑Fi.
2. Na komputerze uruchom serwer w folderze aplikacji:

```bash
python -m http.server 8000 --bind 0.0.0.0
```

3. Sprawdź adres IP komputera poleceniem:

```bash
ipconfig
```

4. Na telefonie otwórz w Chrome:

```text
http://ADRES_IP_KOMPUTERA:8000
```

Przykład:

```text
http://192.168.1.20:8000
```

Uwaga: przez zwykły adres `http://192.168...` przeglądarka może ograniczać mikrofon i PWA. Do pełnego działania najlepiej użyć hostingu z `HTTPS`.

### Wariant B — hosting HTTPS

Najwygodniej wrzucić katalog projektu na hosting HTTPS, np. GitHub Pages, Netlify albo Cloudflare Pages.

Po wejściu na adres HTTPS w Chrome na Androidzie można dodać aplikację do ekranu głównego.

## 9. Dodanie do ekranu głównego Androida jako PWA

W Chrome na Androidzie:

1. Otwórz adres aplikacji.
2. Dotknij menu z trzema kropkami.
3. Wybierz `Dodaj do ekranu głównego` albo `Zainstaluj aplikację`.
4. Potwierdź nazwę aplikacji.
5. Uruchamiaj aplikację ikoną z ekranu głównego.

## 10. Format importu

Obsługiwane kodowania pliku CSV:

- `UTF-8`,
- `Windows-1250`,
- `ISO-8859-2`.

To jest ważne, ponieważ Excel w polskiej wersji Windows często tworzy pliki CSV w kodowaniu systemowym, przez co bez poprawnej obsługi mogłyby pojawiać się błędne znaki zamiast `ą ć ę ł ń ó ś ź ż`.

Obsługiwany format z nagłówkiem:

```csv
Nr;Polski;English
1;dzień dobry;good morning
2;Chciałbym zamówić kawę.;I would like to order a coffee.
```

Działa również format bez numeru, wtedy program nada numery automatycznie:

```csv
dzień dobry;good morning
Chciałbym zamówić kawę.;I would like to order a coffee.
```

## 11. Funkcje lokalne i funkcje wymagające internetu

Działają lokalnie w przeglądarce:

- import CSV/tekstu z obsługą polskich znaków,
- lista powtórek,
- podgląd załadowanych par,
- start od numeru,
- zapis w `localStorage`,
- eksport CSV,
- trzy lokalne tryby oceny tekstu.

Mogą wymagać internetu lub zależeć od przeglądarki/systemu:

- rozpoznawanie mowy przez Web Speech API,
- dostępność głosów syntezy mowy,
- instalacja PWA i działanie service workera poza `localhost` — zwykle wymaga `HTTPS`.

## 12. Ograniczenia

1. Rozpoznawanie mowy w przeglądarce zależy od silnika przeglądarki, systemu Android, mikrofonu, internetu i uprawnień.
2. Web Speech API w praktyce działa najlepiej w Chrome/Edge, a w niektórych przeglądarkach może być niedostępne.
3. `SpeechRecognition` używa jednego języka rozpoznawania naraz. Dlatego `pl-PL` jest lepsze do komend, a `en-US` jest lepsze do transkrypcji odpowiedzi angielskiej.
4. Ocena odpowiedzi nie jest pełną fonetyczną oceną wymowy. Jest oparta na rozpoznanym tekście.
5. Import CSV próbuje automatycznie rozpoznać kodowanie, ale przy bardzo nietypowym lub uszkodzonym pliku może być potrzebne zapisanie pliku jako `CSV UTF-8` w Excelu.
6. Import XLSX nie został dodany, żeby projekt pozostał prosty i działał offline bez zewnętrznych bibliotek.
7. `localStorage` jest lokalny dla danej przeglądarki i domeny. Dane nie synchronizują się między telefonem i komputerem.

## 13. Możliwe dalsze rozszerzenia

- Import XLSX przez bibliotekę SheetJS.
- Prawdziwa ocena wymowy przez Azure AI Speech lub inny silnik oceny wymowy.
- Backend Node.js/Python ukrywający klucz API do modelu AI.
- Tryb losowy.
- Statystyki poprawności.
- Eksport i import całej bazy danych.
- IndexedDB zamiast localStorage dla bardzo dużych list.
