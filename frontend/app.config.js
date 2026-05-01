const APP_VARIANTS = {
  dev: {
    appName: 'AloVecino Dev',
    androidPackage: 'com.alovecino.app.dev',
  },
  qa: {
    appName: 'AloVecino QA',
    androidPackage: 'com.alovecino.app.qa',
  },
  prod: {
    appName: 'AloVecino',
    androidPackage: 'com.alovecino.app',
  },
};

module.exports = ({ config }) => {
  const variant = process.env.APP_VARIANT || 'dev';
  const selected = APP_VARIANTS[variant] || APP_VARIANTS.dev;

  return {
    ...config,
    owner: 'alovecino',
    name: selected.appName,
    slug: 'alovecino-app',
    scheme: 'alovecino',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/app-icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: selected.androidPackage,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon-foreground.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [...(config.plugins || []), 'expo-router'],
    experiments: {
      ...(config.experiments || {}),
      typedRoutes: true,
    },
    extra: {
      ...config.extra,
      appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'dev',
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api-dev.example.com',
    },
  };
};
