# DJI Mobile SDK v5
-keep class dji.** { *; }
-keepclassmembers class dji.** { *; }
-dontwarn dji.**
-keep class com.dji.** { *; }
-keepclassmembers class com.dji.** { *; }
-dontwarn com.dji.**

# BouncyCastle (used by DJI SDK)
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

# Expo module bridge
-keep class expo.modules.djitelemetry.** { *; }
