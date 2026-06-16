# FitnessPlan - Moderne Mobile WebApp

Eine vollständig browserbasierte WebApp zur Erstellung und Verwaltung eines Fitness- und Trainingsplans. Keine Backend-Abhängigkeiten, alles läuft lokal im Browser mit localStorage.

## 🎯 Features

### Hauptfunktionen
- **Wochenplan**: Montag bis Sonntag mit individuellen Trainingseinträgen
- **Trainingsarten**:
  - 🏃 Laufen (Locker, Tempo, Intervalle)
  - 💪 Krafttraining
  - ☘️ Regeneration/Pause
  - 🧘 Dehnen/Mobilität

### Verwaltung
- ✅ Trainings hinzufügen, bearbeiten und löschen
- ✏️ Jeder Eintrag mit: Titel, Trainingsart, Dauer, Notizen
- ✓ Trainings als "erledigt" markieren
- 📊 Fortschrittsanzeige (% abgeschlossen pro Woche)
- 📈 Statistiken: Anzahl erledigter Trainings, Erfolgsquote, Gesamtdauer

### Views
- 📅 **Wochenansicht**: Alle 7 Tage auf einen Blick
- 📆 **Tagesansicht**: Detaillierte Tagesübersicht mit Edit-Funktionen
- 🎨 **Farbige Kategorien**: Visuelle Unterscheidung der Trainingsarten
- 🌙 **Dark Mode**: Optional für angenehmes nächtliches Arbeiten

## 🚀 Technologie

- **Frontend**: Reines HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser localStorage (keine externe DB nötig)
- **Mobile First**: Optimiert für Smartphones, responsive auf allen Geräten
- **PWA-Ready**: Kann als Web-App installiert werden

## 📁 Dateien

- `index.html` - HTML-Struktur und Markup
- `styles.css` - Umfassendes CSS mit Dark Mode Support
- `app.js` - JavaScript-Logik und Datenverwaltung

## 🎨 Design-Highlights

- **Modern & Clean**: Minimalistisches Interface mit sportlichem Touch
- **Große Buttons**: Thumb-freundlich für mobiles Bedienen
- **Responsive Grid**: 1, 2 oder 4 Spalten je nach Bildschirmgröße
- **Smooth Animations**: Fade-In und Slide-Up Effects
- **Farb-Coding**: Jede Trainingsart hat eine eindeutige Farbe
- **Progress Visualization**: Visueller Fortschrittsbalken

## 🔧 Installation & Nutzung

1. Die drei Dateien (`index.html`, `styles.css`, `app.js`) im gleichen Verzeichnis speichern
2. `index.html` im Browser öffnen (lokal oder auf beliebigem Webserver)
3. Trainings hinzufügen und verwalten

**Keine Installation, keine Dependencies, sofort einsatzbereit!**

## 💾 Datenspeicherung

Alle Daten werden automatisch im Browser-lokalen Storage gespeichert:
- Trainingseinträge
- Abgeschlossen-Status
- Dark Mode Einstellung

Die Daten bleiben erhalten, auch nach Schließen des Browsers.

## 📱 Mobile-Optimierung

- Touch-freundliche Buttons (56px FAB, 40px Icon-Buttons)
- Optimale Lesbarkeit auf kleinen Screens
- Swipe-freundliche Navigation
- Vollbildmodus-Support

## 🌙 Dark Mode

Automatische Umschaltung zwischen Hell- und Dunkelmodus:
- Button oben rechts im Header
- Einstellung wird gespeichert
- Alle Farben optimiert für beide Modi

## 📊 Statistiken

Die App zeigt dir:
- **Gesamte Trainings**: Summe aller Einträge
- **Abgeschlossen**: Wie viele erledigt
- **Erfolgsquote**: Prozentsatz der erledigten Trainings
- **Gesamte Dauer**: Summe aller Trainingsminuten (in Stunden)
- **Durchschnitt pro Tag**: Durchschnittliche Trainingsminuten
- **Nach Trainingsart**: Aufschlüsselung aller Kategorien

## 🎮 Tastenkombinationen

- **FAB (+)**: Neues Training hinzufügen
- **Statistik-Button**: Übersicht der Stats anzeigen
- **Dark Mode**: Zwischen Hell- und Dunkelmode wechseln

## 🔒 Datenschutz

- 100% lokal – keine Cloud, kein Server
- Keine externe API-Aufrufe
- Deine Trainingsdaten bleiben auf deinem Gerät

## 🎯 Roadmap

Potenzielle zukünftige Features:
- Export/Import von Trainingsplänen (JSON)
- Wiederkehrende Trainings
- Erinnerungen/Notifications
- Grafische Statistiken und Charts
- Wöchentliche Reports
- Trainings-Templates

## 📄 Lizenz

Frei nutzbar und erweiterbar.

---

Viel Spaß mit deinem persönlichen Trainingsplaner! 💪
