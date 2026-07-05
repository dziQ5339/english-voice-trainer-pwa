# Angielski Głosowo — PWA v8

Prosta aplikacja PWA do głosowej nauki angielskich słówek i zdań na Androidzie oraz komputerze.

## Nowości w v8

- Dodano ustawienie **Sterowanie słuchawkami Bluetooth**.
- Po włączeniu ustawienia aplikacja wykorzystuje **Media Session API**.
- Mapowanie przycisków/gestów multimedialnych:
  - `Play/Pause` = **Sprawdź / test**,
  - `Next track` = **Następne / dalej**,
  - `Previous track` = **Poprzednie / cofnij**.
- Dodano status: **Sterowanie słuchawkami aktywne**.
- Dodano zabezpieczenie przed podwójnym wywołaniem, gdy jedno kliknięcie słuchawek wysyła dwa zdarzenia.
- Zmieniono cache service workera na `english-voice-trainer-v8`, aby telefon łatwiej pobrał nową wersję.

## Ważne ograniczenia sterowania słuchawkami

Funkcja jest eksperymentalna, ponieważ aplikacja PWA nie widzi bezpośrednio surowych kliknięć słuchawek Bluetooth. Może reagować tylko na zdarzenia multimedialne przekazane przez system i przeglądarkę, np. `play`, `pause`, `nexttrack`, `previoustrack`.

Największa szansa działania:

- telefon Samsung z Androidem,
- Chrome,
- aplikacja uruchomiona jako PWA przez HTTPS, np. GitHub Pages,
- słuchawki Bluetooth połączone z telefonem,
- brak aktywnego Spotify, YouTube lub innego odtwarzacza przejmującego przyciski słuchawek.

## Uruchomienie lokalnie na komputerze

```cmd
python -m http.server 8000
```

Następnie otwórz:

```text
http://localhost:8000
```

## Aktualizacja na GitHub Pages

1. Rozpakuj paczkę `english-voice-trainer-pwa-v8.zip`.
2. Wgraj wszystkie pliki z folderu `english-voice-trainer-pwa-v8` do głównego katalogu repozytorium.
3. Upewnij się, że `index.html` jest w głównym katalogu, a nie w podfolderze.
4. Kliknij **Commit changes**.
5. Poczekaj na zielony status w zakładce **Actions**.
6. Na telefonie odśwież PWA. Jeżeli dalej widać starą wersję, wyczyść dane strony/aplikacji w Chrome.

## Test sterowania słuchawkami

1. Otwórz aplikację na telefonie.
2. Połącz słuchawki Bluetooth.
3. W ustawieniach aplikacji włącz **Sterowanie słuchawkami Bluetooth**.
4. Sprawdź status: powinno pojawić się **Sterowanie słuchawkami aktywne**.
5. Uruchom naukę przyciskiem **Start**.
6. Użyj gestu/przycisku `Play/Pause` — aplikacja powinna wykonać **Sprawdź**.
7. Użyj gestu/przycisku `Next track` — aplikacja powinna wykonać **Następne**.
8. Użyj gestu/przycisku `Previous track` — aplikacja powinna wykonać **Poprzednie**.
