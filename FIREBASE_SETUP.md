# Firebase Setup Anleitung

## 1. Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf "Projekt hinzufügen"
3. Gib einen Projektnamen ein (z.B. "restore-black-white")
4. Folge den Schritten und erstelle das Projekt

## 2. Firebase Authentication aktivieren

1. Gehe in deinem Firebase-Projekt zu "Authentication"
2. Klicke auf "Get started"
3. Wähle "Google" als Sign-in Provider
4. Aktiviere Google Sign-in
5. Wähle eine Support-E-Mail aus
6. Speichern

## 3. Cloud Firestore einrichten

1. Gehe zu "Firestore Database"
2. Klicke auf "Datenbank erstellen"
3. Wähle "Im Produktionsmodus starten"
4. Wähle eine Region (z.B. europe-west3)

### Firestore Security Rules

Setze folgende Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Nur der eigene User kann seine Daten lesen und schreiben
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Web-App hinzufügen

1. Gehe zur Projektübersicht
2. Klicke auf das Web-Icon (</>)
3. Gib einen App-Namen ein
4. Kopiere die Firebase-Konfiguration

## 5. Environment Variables setzen

Erstelle eine `.env` Datei im Projekt-Root (basierend auf `.env.example`):

```env
# Gemini API
API_KEY=dein_gemini_api_key
GEMINI_API_KEY=dein_gemini_api_key

# Firebase Configuration
FIREBASE_API_KEY=deine_firebase_api_key
FIREBASE_AUTH_DOMAIN=dein-projekt-id.firebaseapp.com
FIREBASE_PROJECT_ID=dein-projekt-id
FIREBASE_STORAGE_BUCKET=dein-projekt-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=deine_messaging_sender_id
FIREBASE_APP_ID=deine_firebase_app_id
```

## 6. Vercel Environment Variables

Wenn du auf Vercel hostest, füge die gleichen Environment Variables in den Vercel-Projekteinstellungen hinzu:

1. Gehe zu deinem Vercel-Projekt
2. Settings → Environment Variables
3. Füge alle Firebase-Variablen hinzu

## 7. Autorisierte Domains

In Firebase Console → Authentication → Settings → Authorized domains:
- Füge deine Vercel-Domain hinzu (z.B. `deine-app.vercel.app`)
- Localhost ist standardmäßig bereits autorisiert

## Fertig!

Die App sollte jetzt mit Google Sign-In funktionieren. Nutzer können sich anmelden und ihre Credits werden in Firestore gespeichert.

## Firestore Datenstruktur

```
users/
  {userId}/
    credits: number
    welcomeBonusClaimed: boolean
    createdAt: string (ISO timestamp)
    updatedAt: string (ISO timestamp)
```
