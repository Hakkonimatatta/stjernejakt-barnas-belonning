# Stjernejobb

Belønningsapp for barn: barna fullfører oppdrag hjemme, samler stjerner og bytter dem inn i belønninger i butikken. Foreldre styrer oppgaver, belønninger og poeng i en PIN-beskyttet foreldremodus.

- **Web (PWA):** https://stjernejakt-barnas-belonning.vercel.app/ – deployes automatisk fra `main` via Vercel
- **Android:** se [RELEASE-GUIDE.md](RELEASE-GUIDE.md)
- **iPhone / App Store:** se [appstore/APP-STORE.md](appstore/APP-STORE.md)

All data lagres lokalt på enheten (ingen backend). I iOS/Android-appen speiles dataene til native lagring, se `src/lib/persistentStorage.ts`.

## Utvikling

```sh
npm install
npm run dev      # lokal utviklingsserver
npm run build    # bygg til dist/
npx cap sync     # kopier bygget inn i android/ og ios/
```

Teknologi: React, TypeScript, Vite, Tailwind CSS, shadcn/ui og Capacitor.
