#!/usr/bin/env node

/**
 * One-command Android deployment script
 * Build → Sync → Clean → Rebuild → Install → Launch
 * Usage: npm run deploy:android
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const ANDROID_DIR = path.join(__dirname, "..", "android");
const BUILD_DIR = path.join(ANDROID_DIR, "build");
const GRADLE_DIR = path.join(ANDROID_DIR, ".gradle");
const APK_PATH = path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const ADB_PATH = path.join(
  process.env.ANDROID_HOME || path.join(os.homedir(), "AppData", "Local", "Android", "Sdk"),
  "platform-tools",
  "adb"
);

function log(msg) {
  console.log(`\n🚀 ${msg}`);
}

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    log(`Cleaning ${path.basename(dirPath)}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

try {
  const cwd = path.join(__dirname, "..");

  // 1. Build
  log("Building app...");
  execSync("npm run build", {
    cwd,
    stdio: "inherit",
  });

  // 2. Sync assets
  log("Syncing assets to Android...");
  execSync("npx cap sync android", {
    cwd,
    stdio: "inherit",
  });

  // 3. Clean gradle caches
  removeDir(BUILD_DIR);
  removeDir(GRADLE_DIR);

  // 4. Gradle clean
  log("Cleaning Gradle...");
  execSync(path.join(ANDROID_DIR, "gradlew") + " clean", {
    cwd: ANDROID_DIR,
    stdio: "inherit",
    shell: true,
  });

  // 5. Build APK
  log("Building APK...");
  execSync(path.join(ANDROID_DIR, "gradlew") + " assembleDebug -q", {
    cwd: ANDROID_DIR,
    stdio: "inherit",
    shell: true,
  });

  // 6. Uninstall old app (fixes hash mismatch issues)
  log("Cleaning old app installation...");
  try {
    execSync(`"${ADB_PATH}" uninstall no.haako.stjernejakt`, {
      stdio: "ignore",
      shell: true,
    });
    // Wait for uninstall to complete
    execSync("timeout /t 1 /nobreak", { stdio: "ignore", shell: true });
  } catch (error) {
    // App might not be installed, that's fine
  }

  // 7. Install
  log("Installing APK...");
  execSync(`"${ADB_PATH}" install -r "${APK_PATH}"`, {
    stdio: "inherit",
    shell: true,
  });

  // 8. Launch
  log("Launching app...");
  execSync(`"${ADB_PATH}" shell am start -n no.haako.stjernejakt/no.haako.stjernejakt.MainActivity`, {
    stdio: "inherit",
    shell: true,
  });

  log("✅ App deployed and running!");
} catch (error) {
  console.error(`\n❌ Deployment failed: ${error.message}`);
  process.exit(1);
}
