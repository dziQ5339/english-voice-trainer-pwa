# Angielski Głosowo — prosta aplikacja PWA — v3

Aplikacja do głosowej nauki angielskich słówek i zdań z własnej listy par: tekst po polsku oraz odpowiadający mu tekst po angielsku.

## 1. Architektura aplikacji

Aplikacja jest prostą aplikacją webową PWA bez backendu.

Warstwy:

1. `index.html` — struktura ekranu, przyciski, import danych, lista powtórek, ustawienia mowy.
2. `styles.css` — responsywny interfejs przystosowany do telefonu: duży tekst, duże przyciski, układ kart.
3. `app.js` — cała logika aplikacji:
   - import CSV lub tekstu,
   - przechodzenie po parach w kolejności,
   - synteza mowy PL/EN,
   - rozpoznawanie komend głosowych,
   - proste porównanie rozpoznanej odpowiedzi po angielsku z poprawną odpowiedzią,
   - krótki komentarz głosowy po sprawdzeniu odpowiedzi,
   - automatyczne przełączanie rozpoznawania: odpowiedź EN → komendy PL,
   - lista powtórek,
   - eksport listy powtórek do CSV,
   - zapis danych w `localStorage`.
4. `manifest.webmanifest` — konfiguracja PWA: nazwa, ikony, tryb standalone, kolor motywu.
5. `sw.js` — service worker, czyli cache plików aplikacji i podstawowe działanie offline.
6. `sample.csv` — przykładowy plik z parami słówek i zdań.

## 2. Technologie

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

## 3. Struktura plików

```text
english-voice-trainer-pwa/
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

## 4. Funkcje

- Import listy przez wklejenie tekstu.
- Import pliku CSV.
- Obsługa separatorów: średnik, tabulator, przecinek.
- Kolejność nauki zgodna z listą.
- Wyświetlanie numeru aktualnej pary.
- Odczytywanie tekstu polskiego.
- Odczytywanie odpowiedzi angielskiej dopiero po komendzie lub przycisku `Sprawdź`.
- Prosta ocena rozpoznanej odpowiedzi po angielsku: procent podobieństwa, brakujące słowa, nadmiarowe/inne słowa.
- Krótki komentarz głosowy po sprawdzeniu, np. `Bardzo dobrze`, `Dobrze`, `Częściowo dobrze`, `Spróbuj jeszcze raz`.
- Automatyczne przełączanie języka rozpoznawania: `en-US` do odpowiedzi i `pl-PL` do komend.
- Brak automatycznego przechodzenia do kolejnej pary po sprawdzeniu.
- Obsługa przyciskami i komendami głosowymi.
- Lista powtórek.
- Tryb nauki tylko z listy powtórek.
- Usuwanie pozycji z listy powtórek.
- Czyszczenie listy powtórek.
- Eksport listy powtórek do CSV.
- Lokalny zapis danych w przeglądarce.
- Podstawowe działanie jako PWA.

## 5. Komendy głosowe

Program rozpoznaje następujące komendy:

- `start`
- `stop`
- `sprawdź`
- `następne`
- `poprzednie`
- `powtórz`
- `dodaj do listy`
- `pokaż listę powtórek`

Uwaga: rozpoznawanie komend działa najpewniej przy ustawieniu języka rozpoznawania na `pl-PL`. Przy ustawieniu `en-US` transkrypcja odpowiedzi angielskiej może być lepsza, ale polskie komendy mogą działać gorzej.

W wersji v3 dodano też proste komendy angielskie przy rozpoznawaniu `en-US`: `check`, `next`, `previous`, `repeat`, `start`, `stop`.


## 6. Prosta ocena odpowiedzi — v3

Ta wersja dodaje wariant prosty, bez zewnętrznych usług AI.

Jak działa ocena:

1. Aplikacja zapisuje tekst rozpoznany z Twojej odpowiedzi po angielsku.
2. Po kliknięciu lub powiedzeniu `sprawdź` pokazuje poprawne tłumaczenie.
3. Następnie porównuje rozpoznany tekst z poprawną odpowiedzią.
4. Pokazuje wynik procentowy, brakujące słowa i słowa nadmiarowe/inne.
5. Odczytuje krótki komentarz głosowy po polsku.

Przykład:

```text
Poprawna odpowiedź: I would like to order a coffee.
Rozpoznana odpowiedź: I would like order coffee.
Ocena: około 80%
Komentarz: Dobrze. Są drobne różnice. Brakuje: to, a.
```

To nie jest profesjonalna analiza fonetyczna wymowy. Jest to praktyczne sprawdzenie, czy przeglądarka zrozumiała wypowiedź podobnie do poprawnego tekstu. Jeżeli mikrofon, hałas albo silnik rozpoznawania mowy zadziała słabo, ocena może być zaniżona.

### Zalecany sposób użycia

1. Włącz mikrofon.
2. Zostaw włączoną opcję `Automatycznie przełączaj: odpowiedź EN → komendy PL`.
3. Naciśnij `Start`.
4. Aplikacja przeczyta tekst po polsku.
5. Powiedz odpowiedź po angielsku.
6. Po rozpoznaniu odpowiedzi aplikacja przełączy się na komendy po polsku.
7. Powiedz `sprawdź` albo kliknij `Sprawdź`.
8. Aplikacja pokaże odpowiedź, wynik i komentarz.
9. Powiedz `następne` albo kliknij `Następne`.

Jeżeli aplikacja nie łapie odpowiedzi po angielsku, kliknij przycisk `Odpowiedź EN`. Ten przycisk ustawia rozpoznawanie na angielski i uruchamia mikrofon, jeżeli był wyłączony.

## 7. Uruchomienie na komputerze

Najprostsza metoda:

1. Rozpakuj projekt.
2. Wejdź do katalogu projektu.
3. Uruchom lokalny serwer HTTP.

Przykład dla Pythona:

```bash
cd english-voice-trainer-pwa
python -m http.server 8000
```

Następnie otwórz w przeglądarce:

```text
http://localhost:8000
```

Dlaczego nie wystarczy dwuklik na `index.html`?

- Service worker i część funkcji PWA wymagają uruchomienia przez `http://localhost` albo przez `https://`.
- Rozpoznawanie mowy i mikrofon również zwykle wymagają bezpiecznego kontekstu: `https://` albo `localhost`.

## 8. Uruchomienie na telefonie z Androidem

### Wariant A — przez ten sam komputer w sieci Wi-Fi

1. Komputer i telefon muszą być w tej samej sieci Wi-Fi.
2. Na komputerze sprawdź adres IP, np. `192.168.1.20`.
3. Uruchom serwer:

```bash
python -m http.server 8000
```

4. Na telefonie otwórz w Chrome:

```text
http://ADRES_IP_KOMPUTERA:8000
```

Przykład:

```text
http://192.168.1.20:8000
```

Uwaga: przez zwykły adres `http://192.168...` przeglądarka może ograniczać mikrofon i PWA. Do pełnego testu najlepiej opublikować projekt przez HTTPS.

### Wariant B — hosting HTTPS

Najwygodniej wrzucić katalog projektu na hosting HTTPS, np. GitHub Pages, Netlify, Cloudflare Pages albo własny serwer z certyfikatem HTTPS.

Po wejściu na adres HTTPS w Chrome na Androidzie można dodać aplikację do ekranu głównego.

## 9. Dodanie do ekranu głównego Androida jako PWA

W Chrome na Androidzie:

1. Otwórz adres aplikacji.
2. Dotknij menu z trzema kropkami.
3. Wybierz `Dodaj do ekranu głównego` albo `Zainstaluj aplikację`, zależnie od wersji Chrome i spełnienia warunków PWA.
4. Potwierdź nazwę aplikacji.
5. Uruchamiaj aplikację ikoną z ekranu głównego.

## 10. Format importu

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

## 11. Ograniczenia

1. Rozpoznawanie mowy w przeglądarce zależy od silnika przeglądarki, systemu Android, mikrofonu, internetu i uprawnień.
2. Web Speech API w praktyce działa najlepiej w Chrome/Edge, a w niektórych przeglądarkach może być niedostępne.
3. `SpeechRecognition` używa jednego języka rozpoznawania naraz. Dlatego ustawienie `pl-PL` jest lepsze do komend, a `en-US` może być lepsze do transkrypcji odpowiedzi angielskiej.
4. Prosta ocena v3 nie jest pełną oceną fonetyczną wymowy. To porównanie rozpoznanego tekstu z poprawną odpowiedzią.
5. Przeglądarka używa jednego języka rozpoznawania naraz, dlatego dodano automatyczne przełączanie `en-US` / `pl-PL`.
6. Import XLSX nie został dodany, żeby projekt pozostał prosty i działał offline bez zewnętrznych bibliotek.
7. `localStorage` jest lokalny dla danej przeglądarki i domeny. Dane nie synchronizują się między telefonem i komputerem.

## 12. Możliwe dalsze rozszerzenia

- Import XLSX przez bibliotekę SheetJS.
- Profesjonalna ocena wymowy przez usługę typu Azure AI Speech Pronunciation Assessment.
- Tryb losowy.
- Statystyki poprawności.
- Fiszki z poziomami trudności.
- Eksport i import całej bazy danych.
- IndexedDB zamiast localStorage dla bardzo dużych list.
- Oddzielny tryb „dyktuj odpowiedź po angielsku” i „słuchaj komend po polsku”.
