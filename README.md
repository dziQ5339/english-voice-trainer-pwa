# Angielski Głosowo — PWA v12

Wersja v12 upraszcza rozpoznawanie mowy: aplikacja nasłuchuje stale w języku angielskim (`en-US` lub opcjonalnie `en-GB`). Program nie przełącza już rozpoznawania mowy pomiędzy polskim i angielskim. Dzięki temu jedna sesja rozpoznawania obsługuje zarówno odpowiedź użytkownika po angielsku, jak i krótkie komendy sterujące po angielsku.

## Najważniejsze zmiany w v12

- Domyślny język rozpoznawania mowy ustawiono na `en-US`.
- Dodano opcjonalny wybór `English US` / `English UK`.
- Wyłączono automatyczne przełączanie języka rozpoznawania `EN → PL`.
- Zmieniono komendy głosowe na krótkie komendy angielskie.
- Program odróżnia komendy od odpowiedzi użytkownika:
  - jeżeli rozpoznany tekst jest komendą, wykonuje akcję,
  - jeżeli nie jest komendą, zapisuje tekst jako odpowiedź po angielsku.
- Zmieniono opisy przycisków, aby pokazywały angielskie komendy.
- Zachowano tryb samochodowy, listę powtórek, obsługę pilota Bluetooth, skróty klawiaturowe, PWA i zapamiętywanie ostatniej pozycji.

## Komendy głosowe po angielsku

| Komenda główna | Komendy zapasowe | Funkcja |
|---|---|---|
| `check` | `test`, `show`, `show answer` | Sprawdź odpowiedź |
| `next` | `go`, `go next`, `forward`, `go forward` | Następna para |
| `back` | `previous`, `go back` | Poprzednia para |
| `repeat` | `again`, `say again`, `one more` | Powtórz |
| `add` | `save`, `add review`, `save review` | Dodaj do listy powtórek |
| `list` | `review`, `show list`, `review list` | Pokaż listę powtórek |
| `answer` | `my answer`, `speak`, `talk` | Tryb odpowiedzi / wyczyść bieżącą odpowiedź i słuchaj |
| `clear` | `delete`, `clear answer`, `delete answer` | Wyczyść rozpoznaną odpowiedź |
| `start` | `begin` | Start nauki |
| `stop` | `pause` | Stop nauki |
| `mic` | `microphone` | Włącz / wyłącz mikrofon |

## Jak program interpretuje mowę

Przykład 1:

```text
I would like to order a coffee
```

Program zapisuje ten tekst jako odpowiedź użytkownika.

Przykład 2:

```text
check
```

Program wykonuje funkcję „Sprawdź”.

Przykład 3:

```text
next
```

Program przechodzi do następnej pary.

## Test rozpoznawania mowy

1. Uruchom aplikację na telefonie przez HTTPS, np. z GitHub Pages.
2. W ustawieniach sprawdź, czy język rozpoznawania to `English US` albo `English UK`.
3. Kliknij `Start`.
4. Powiedz odpowiedź po angielsku.
5. Powiedz `check`.
6. Powiedz `next`.

Jeżeli program zamiast wykonać komendę wpisuje ją jako odpowiedź, powtórz krócej i wyraźniej: `check`, `next`, `back`, `repeat`.

## Aktualizacja na GitHub Pages

1. Rozpakuj plik `english-voice-trainer-pwa-v12.zip`.
2. Wgraj zawartość folderu do głównego katalogu repozytorium GitHub.
3. Upewnij się, że `index.html` jest bezpośrednio w katalogu głównym repozytorium.
4. Kliknij `Commit changes`.
5. Wejdź w `Actions` i sprawdź, czy publikacja GitHub Pages zakończyła się poprawnie.
6. Na telefonie odśwież aplikację. Jeżeli widzisz starą wersję, wyczyść dane strony/PWA w Chrome albo usuń ikonę aplikacji i dodaj ją ponownie.

## Ograniczenia

Rozpoznawanie mowy w Chrome na Androidzie zależy od przeglądarki, mikrofonu, połączenia z internetem i hałasu w otoczeniu. Aplikacja PWA nie ma pełnej kontroli nad mechanizmem Web Speech API. Użycie jednego języka rozpoznawania (`en-US` albo `en-GB`) upraszcza działanie, ale nadal nie gwarantuje idealnego rozpoznania każdej wypowiedzi lub komendy.
