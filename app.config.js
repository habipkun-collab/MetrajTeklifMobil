/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'MetrajTeklifMobil',
  slug: 'MetrajTeklifMobil',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#f4f2f8',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.metrajteklif.mobil',
  },
  android: {
    package: 'com.metrajteklif.mobil',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#f4f2f8',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: '3a7045cd-8384-439a-b9e9-656eb7db71ff',
    },
  },
  owner: 'habibkun',
}

export default config
