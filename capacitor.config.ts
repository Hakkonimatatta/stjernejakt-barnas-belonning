import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.haako.stjernejakt',
  appName: 'Stjernejakt',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      presentationStyle: 'popover'
    }
  },
  ios: {
    // Kamera-tillatelse spørres automatisk ved bruk
  }
};

export default config;