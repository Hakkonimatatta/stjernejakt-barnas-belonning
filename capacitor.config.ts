import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // appId kan ikke endres etter publisering (Google Play bruker den allerede)
  appId: 'no.haako.stjernejakt',
  appName: 'Stjernejobb',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
};

export default config;
