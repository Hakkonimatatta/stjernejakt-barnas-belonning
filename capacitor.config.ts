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
    // Camera permission will be requested automatically when accessing camera
    // The permission message is defined in Info.plist
  }
};

export default config;
