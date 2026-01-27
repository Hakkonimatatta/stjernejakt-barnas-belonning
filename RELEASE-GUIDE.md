# 📱 Release Guide - Stjernejobb

## Før hver ny versjon til Google Play Store

### 1️⃣ Øk versjonsnummer
Rediger `android/app/build.gradle`:
```groovy
versionCode 3  // Øk med 1 for hver release (må være høyere enn forrige)
versionName "1.2"  // Øk versjonsnavn (f.eks. 1.0 → 1.1 → 1.2)
```

### 2️⃣ Test appen grundig
```powershell
.\deploy-android.ps1
```
Test alle funksjoner:
- Legge til barn
- Legge til oppgaver (maks 3 per barn)
- Legge til belønninger (maks 3 per barn)
- Fullføre oppgaver
- Kjøpe belønninger
- Foreldremodus
- Språkbytte (norsk/engelsk)
- ÆØÅ i inputfelt

### 3️⃣ Bygg production APK/AAB
```powershell
cd android
.\gradlew bundleRelease  # For AAB (Google Play)
# ELLER
.\gradlew assembleRelease  # For APK
```

Filen ligger her:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

### 4️⃣ Last opp til Google Play Console
1. Gå til https://play.google.com/console
2. Velg appen "Stjernejakt"
3. Production → Create new release
4. Last opp AAB-filen
5. Skriv release notes
6. Send til gjennomgang

---

## 🔒 Datalagring og oppdateringer

### Brukerdata beholdes automatisk
- Data lagres i `localStorage` som er persistent
- Når brukere oppdaterer via Play Store, beholdes ALL data
- Migrasjonslogikk i `src/lib/storage.ts` håndterer datastrukturendringer

### Hvis du endrer datastrukturen
Legg til migrering i `migrateData()` funksjonen i `src/lib/storage.ts`:

```typescript
const migrateData = (data: any, language: Language): AppData => {
  // Eksempel: Legge til nytt felt
  if (data.version < 2) {
    data.children = data.children.map(child => ({
      ...child,
      newField: defaultValue  // Legg til nytt felt
    }));
    data.version = 2;
  }
  
  return data;
};
```

---

## 🐛 Feilsøking

### Cache-problemer i utvikling
```powershell
cd android
.\gradlew clean
.\gradlew installDebug
```

### Brukere opplever blank skjerm
Dette skal IKKE skje i produksjon når de oppdaterer via Play Store.
Hvis det skjer:
1. Sjekk at `versionCode` er økt
2. Sjekk at alle assets er bygget riktig
3. Test APK/AAB før opplasting

---

## ✅ Sjekkliste før release

- [ ] `versionCode` er økt i `build.gradle`
- [ ] `versionName` er oppdatert
- [ ] Appen er testet på emulator
- [ ] Alle nye funksjoner fungerer
- [ ] Ingen feil i produksjonsbygg
- [ ] AAB/APK er signert riktig
- [ ] Release notes er skrevet
