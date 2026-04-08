module.exports = {
  expo: {
    name: "Focus Flight Ops",
    slug: "focus-flight-ops",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A0F",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0A0A0F",
      },
      package: "com.focusflightops.app",
      minSdkVersion: 24,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-sqlite",
      "./modules/expo-dji-telemetry/expo-plugin",
    ],
    extra: {
      eas: {
        projectId: "1343689a-0699-46f3-982c-099a522e6160",
      },
    },
  },
};
