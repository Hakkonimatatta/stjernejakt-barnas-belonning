# Deploy script for Android - Development
# For hver release til Play Store, husk å øke versionCode i android/app/build.gradle!

Write-Host "🔨 Bygger appen..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build feilet!" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Synkroniserer til Android..." -ForegroundColor Cyan
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Sync feilet!" -ForegroundColor Red
    exit 1
}

Write-Host "🧹 Renser Android cache..." -ForegroundColor Cyan
cd android
.\gradlew clean

Write-Host "📲 Installerer på emulator/enhet..." -ForegroundColor Cyan
.\gradlew installDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Installasjon feilet!" -ForegroundColor Red
    exit 1
}

cd ..
Write-Host "✅ Appen er deployet!" -ForegroundColor Green
Write-Host "💡 Åpne appen på emulatoren/enheten nå" -ForegroundColor Yellow
Write-Host "⚠️  VIKTIG: Før neste Play Store release, øk versionCode i android/app/build.gradle" -ForegroundColor Yellow
