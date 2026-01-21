#!/usr/bin/env node

/**
 * Android clean rebuild script
 * Automatically cleans Gradle cache and rebuilds APK
 * This fixes the "blue background only" issue that occurs when asset hashes change
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ANDROID_DIR = path.join(__dirname, "..", "android");
const BUILD_DIR = path.join(ANDROID_DIR, "build");
const GRADLE_DIR = path.join(ANDROID_DIR, ".gradle");

function log(msg) {
  console.log(`\n📱 ${msg}`);
}

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    log(`Removing ${path.basename(dirPath)}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

try {
  log("Starting Android clean rebuild process...");

  // Clean up old caches
  removeDir(BUILD_DIR);
  removeDir(GRADLE_DIR);

  // Run gradlew clean
  log("Running Gradle clean...");
  execSync("./gradlew clean", {
    cwd: ANDROID_DIR,
    stdio: "inherit",
  });

  // Build APK
  log("Building APK...");
  execSync("./gradlew assembleDebug -q", {
    cwd: ANDROID_DIR,
    stdio: "inherit",
  });

  log("✅ Android rebuild complete!");
  log("APK ready at: android/app/build/outputs/apk/debug/app-debug.apk");
  log("Run: adb install -r android/app/build/outputs/apk/debug/app-debug.apk");
} catch (error) {
  console.error(`\n❌ Error during Android rebuild: ${error.message}`);
  process.exit(1);
}
