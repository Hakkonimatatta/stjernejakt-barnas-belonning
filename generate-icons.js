#!/usr/bin/env node
/**
 * Generate app icons in all required sizes for web and Android
 * Run: npm run generate-icons
 */

import { Jimp } from "jimp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WEB_SIZES = [
  [72, 72],
  [96, 96],
  [128, 128],
  [144, 144],
  [152, 152],
  [192, 192],
  [384, 384],
  [512, 512],
];

const ANDROID_SIZES = {
  "drawable-ldpi": 36,
  "drawable-mdpi": 48,
  "drawable-hdpi": 72,
  "drawable-xhdpi": 96,
  "drawable-xxhdpi": 144,
  "drawable-xxxhdpi": 192,
};

async function generateIcons() {
  const sourcePath = path.join(__dirname, "public/icon-source.png");

  if (!fs.existsSync(sourcePath)) {
    console.error(
      `❌ Error: ${sourcePath} not found!\nMake sure icon-source.png exists in the public folder`
    );
    process.exit(1);
  }

  try {
    const img = await Jimp.read(sourcePath);
    console.log(`✅ Loaded ${sourcePath}`);

    // Generate web icons
    console.log("\n📱 Generating web icons...");
    for (const [width, height] of WEB_SIZES) {
      const resized = img.resize({ w: width, h: height, fit: "contain" });
      const output = path.join(__dirname, `public/icon-${width}.png`);
      await resized.write(output);
      console.log(`  ✓ icon-${width}.png`);
    }

    // Generate Android icons
    const androidPath = path.join(__dirname, "android/app/src/main/res");
    if (fs.existsSync(androidPath)) {
      console.log("\n🤖 Generating Android icons...");
      for (const [folder, size] of Object.entries(ANDROID_SIZES)) {
        const dirPath = path.join(androidPath, folder);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        const resized = img.resize({ w: size, h: size, fit: "contain" });
        const output = path.join(dirPath, "ic_launcher.png");
        await resized.write(output);
        console.log(`  ✓ ${folder}/ic_launcher.png`);
      }
    } else {
      console.log("\n⚠️  Android folder not found, skipping Android icons");
    }

    console.log("\n🎉 All icons generated successfully!");
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

generateIcons();
