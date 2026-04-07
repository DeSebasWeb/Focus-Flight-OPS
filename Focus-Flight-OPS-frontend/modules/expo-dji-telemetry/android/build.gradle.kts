plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")
}

android {
  namespace = "expo.modules.djitelemetry"
  compileSdk = 36

  defaultConfig {
    minSdk = 24
    consumerProguardFiles("../proguard-rules.pro")
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  packaging {
    jniLibs {
      useLegacyPackaging = true
    }
  }
}

dependencies {
  implementation(project(":expo-modules-core"))
  implementation("com.dji:dji-sdk-v5-aircraft:5.17.0")
  compileOnly("com.dji:dji-sdk-v5-aircraft-provided:5.17.0")
  runtimeOnly("com.dji:dji-sdk-v5-networkImp:5.17.0")
}
