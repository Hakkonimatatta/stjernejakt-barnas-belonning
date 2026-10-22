# Stjernejobb – App Store-materiell

Alt du trenger å lime inn i App Store Connect når Apple-kontoen er klar.
Skjermbildene ligger i `screenshots/no` og `screenshots/en` (1290 × 2796, passer for «iPhone 6,9-tommers skjerm»).

---

## Grunninfo

| Felt | Verdi |
|---|---|
| Navn | Stjernejobb |
| Bundle ID | no.haako.stjernejakt (usynlig for brukere, kan ikke endres) |
| Hovedspråk | Norsk (bokmål) |
| Kategori | Livsstil (sekundær: Utdanning) |
| Aldersgrense | 4+ (svar «Nei/Ingen» på alle spørsmål i aldersskjemaet) |
| «Laget for barn» (Kids-kategorien) | **Nei** – appen styres av foreldre via foreldremodus |
| Pris | Gratis |
| Personvern-URL | https://stjernejakt-barnas-belonning.vercel.app/privacy |
| Support-URL | *Må bestemmes – må vise en måte å kontakte deg på (f.eks. en e-postadresse)* |
| Copyright | © 2026 *ditt navn* |

### Personvern («App Privacy» i App Store Connect)
Velg **«Data Not Collected»**. Appen sender ingenting fra telefonen – alt lagres lokalt.

### Eksportregler for kryptering
Allerede besvart i appen (`ITSAppUsesNonExemptEncryption = false`), så Apple spør ikke.

---

## Norsk

**Undertittel** (maks 30 tegn)
```
Oppgaver og belønning for barn
```

**Reklametekst** (maks 170 tegn – kan endres uten ny versjon)
```
Gjør hverdagsoppgavene til et spill! Barna samler stjerner for oppdrag hjemme og bytter dem inn i belønninger dere har bestemt sammen.
```

**Nøkkelord** (maks 100 tegn, komma uten mellomrom)
```
gjøremål,husarbeid,poeng,stjerner,motivasjon,foreldre,rutiner,premie,ukeplan,lommepenger,familie
```

**Beskrivelse**
```
Stjernejobb gjør hverdagsoppgavene morsommere – for både barn og voksne.

Barna gjør oppdrag som å rydde rommet, pusse tennene eller dekke på bordet, og får stjerner for hvert oppdrag. Stjernene kan byttes inn i belønninger dere har bestemt sammen, som en ekstra godnatthistorie eller å velge film til filmkvelden.

SLIK FUNGERER DET
• Legg til ett eller flere barn, hver med sin egen figur
• Lag egne oppdrag og bestem hvor mange stjerner de gir
• Lag belønninger barna kan «kjøpe» i butikken
• Barna trykker «Fullfør oppgave» og får konfetti og stjerner
• Bonusmål: gjør 3 oppdrag på en dag og få ekstra stjerner
• Oppdragene nullstilles automatisk hver dag

FOR FORELDRE
• Foreldremodus er beskyttet med PIN-kode
• Gi eller trekk fra stjerner ved behov
• Aktivitetslogg som viser hva som er gjort den siste uken
• Mulighet for å kreve PIN før barna kjøper belønninger
• Overfør data til en annen telefon eller nettbrett

TRYGT OG ENKELT
• Ingen innlogging, ingen reklame og ingen kjøp i appen
• Ingen data sendes fra telefonen – alt lagres lokalt
• Fungerer uten internett
• Norsk og engelsk
```

**Hva er nytt** (første versjon)
```
Første versjon av Stjernejobb i App Store!
```

---

## English

**Subtitle** (max 30)
```
Chores and rewards for kids
```

**Promotional text** (max 170)
```
Turn everyday chores into a game! Kids collect stars for tasks at home and trade them for rewards you've agreed on together.
```

**Keywords** (max 100)
```
chart,star,points,allowance,routine,habit,parent,family,tasks,motivation,sticker,behavior,daily
```

**Description**
```
Stjernejobb makes everyday chores more fun – for kids and grown-ups alike.

Kids complete missions like tidying their room, brushing their teeth or setting the table, and earn stars for each one. Stars can be traded for rewards you've agreed on together, like an extra bedtime story or picking the film for movie night.

HOW IT WORKS
• Add one or more children, each with their own character
• Create your own tasks and decide how many stars they're worth
• Create rewards kids can "buy" in the shop
• Kids tap "Complete task" and get confetti and stars
• Bonus goal: complete 3 tasks in a day for extra stars
• Tasks reset automatically every day

FOR PARENTS
• Parent mode is protected by a PIN code
• Add or remove stars when needed
• Activity log showing what's been done over the last week
• Optionally require a PIN before kids buy rewards
• Transfer data to another phone or tablet

SAFE AND SIMPLE
• No sign-up, no ads and no in-app purchases
• No data leaves the device – everything is stored locally
• Works offline
• English and Norwegian
```

**What's New**
```
The first version of Stjernejobb on the App Store!
```

---

## Notat til Apples gjennomgang (App Review Notes – skrives på engelsk)
```
No account or login is needed. Parent mode is protected by a PIN; the default PIN is 1234 (shown on the PIN screen). All data is stored locally on the device; the app makes no network requests for user data.
```

---

## Gjenstår (krever Mac og Apple-konto)

1. Meld deg inn i Apple Developer Program (99 USD/år) på https://developer.apple.com/programs/
2. Opprett appen i App Store Connect med Bundle ID `no.haako.stjernejakt`
3. Bygg appen: på en Mac (`npm run build`, `npx cap sync ios`, `npx cap open ios`, deretter Archive i Xcode) – eller via en skybygg-tjeneste som Codemagic hvis du ikke har Mac
4. Test på en ekte iPhone via TestFlight
5. Lim inn tekstene og skjermbildene over, og send til gjennomgang
