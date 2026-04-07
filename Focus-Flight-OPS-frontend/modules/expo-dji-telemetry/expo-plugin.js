const {
  withAndroidManifest,
  withProjectBuildGradle,
  withAppBuildGradle,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DJI_API_KEY = 'dfce378a784d5af2748ee8cf';

/**
 * Expo Config Plugin for expo-dji-telemetry.
 *
 * Modifies the Android build at prebuild time to:
 * 1. Add USB host permissions and DJI API key to AndroidManifest.xml
 * 2. Add DJI Maven repository to project-level build.gradle
 * 3. Add packaging, lint, and DJI resource fix to app-level build.gradle
 * 4. Create res/xml/accessory_filter.xml for USB auto-launch
 */
function withDjiTelemetry(config) {
  config = withDjiAndroidManifest(config);
  config = withDjiProjectBuildGradle(config);
  config = withDjiAppBuildGradle(config);
  config = withDjiAccessoryFilter(config);
  return config;
}

// --- 1. AndroidManifest.xml ---

function withDjiAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // USB host feature
    if (!manifest.manifest['uses-feature']) {
      manifest.manifest['uses-feature'] = [];
    }
    if (!manifest.manifest['uses-feature'].some(f => f.$?.['android:name'] === 'android.hardware.usb.host')) {
      manifest.manifest['uses-feature'].push({
        $: { 'android:name': 'android.hardware.usb.host', 'android:required': 'false' },
      });
    }

    const application = manifest.manifest.application?.[0];
    if (application) {
      if (!application['meta-data']) application['meta-data'] = [];

      // DJI API key
      if (!application['meta-data'].some(m => m.$?.['android:name'] === 'com.dji.sdk.API_KEY')) {
        application['meta-data'].push({
          $: { 'android:name': 'com.dji.sdk.API_KEY', 'android:value': DJI_API_KEY },
        });
      }

      // USB accessory intent filter on main activity
      const mainActivity = application.activity?.find(a =>
        a['intent-filter']?.some(f =>
          f.action?.some(act => act.$?.['android:name'] === 'android.intent.action.MAIN')
        )
      );

      if (mainActivity) {
        if (!mainActivity['intent-filter']) mainActivity['intent-filter'] = [];
        if (!mainActivity['intent-filter'].some(f =>
          f.action?.some(act => act.$?.['android:name'] === 'android.hardware.usb.action.USB_ACCESSORY_ATTACHED')
        )) {
          mainActivity['intent-filter'].push({
            action: [{ $: { 'android:name': 'android.hardware.usb.action.USB_ACCESSORY_ATTACHED' } }],
          });
        }

        if (!mainActivity['meta-data']) mainActivity['meta-data'] = [];
        if (!mainActivity['meta-data'].some(m => m.$?.['android:name'] === 'android.hardware.usb.action.USB_ACCESSORY_ATTACHED')) {
          mainActivity['meta-data'].push({
            $: {
              'android:name': 'android.hardware.usb.action.USB_ACCESSORY_ATTACHED',
              'android:resource': '@xml/accessory_filter',
            },
          });
        }
      }
    }

    return config;
  });
}

// --- 2. Project-level build.gradle: DJI Maven repository ---

function withDjiProjectBuildGradle(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    const djiMaven = 'maven { url = uri("https://artifact.bytedance.com/repository/pcdn/") }';

    if (!contents.includes('artifact.bytedance.com')) {
      contents = contents.replace(
        /allprojects\s*\{[\s\S]*?repositories\s*\{/,
        (match) => `${match}\n        ${djiMaven}`
      );
      // Fallback
      if (!contents.includes('artifact.bytedance.com')) {
        contents += `\nallprojects {\n    repositories {\n        ${djiMaven}\n    }\n}\n`;
      }
    }

    config.modResults.contents = contents;
    return config;
  });
}

// --- 3. App-level build.gradle ---

function withDjiAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Packaging for DJI native libs
    if (!contents.includes('useLegacyPackaging = true')) {
      contents = contents.replace(
        /android\s*\{/,
        `android {\n    packaging {\n        jniLibs {\n            useLegacyPackaging = true\n        }\n    }`
      );
    }

    // Disable lint abort
    if (!contents.includes('abortOnError')) {
      contents = contents.replace(
        /android\s*\{/,
        `android {\n    lint {\n        abortOnError = false\n        checkReleaseBuilds = false\n    }`
      );
    }

    // DJI SDK resource fix.
    // The DJI SDK v5 AAR ships string resources with non-positional format strings
    // (e.g. "%s and %s" instead of "%1$s and %2$s"). AAPT2 rejects these as errors.
    //
    // This Gradle script hooks into the dependency extraction pipeline and patches
    // the XML files in the Gradle transform cache BEFORE mergeResources runs.
    // It searches the build cache for extracted DJI AAR resources and adds
    // formatted="false" to any <string> containing multiple %s.
    if (!contents.includes('patchDjiStringResources')) {
      contents += `

// === DJI SDK v5 Resource Patch ===
// Patches malformed format strings in DJI SDK AAR before AAPT2 processes them.
def patchDjiStringResources() {
    // Search in Gradle caches for extracted DJI SDK resources
    def cacheRoots = [
        new File(gradle.gradleUserHomeDir, "caches"),
        new File(project.buildDir, "intermediates"),
    ]
    cacheRoots.each { root ->
        if (!root.exists()) return
        root.eachFileRecurse { file ->
            if (file.name == "values.xml" && file.absolutePath.contains("dji-sdk-v5")) {
                patchXmlFile(file)
            }
            // Also check locale variants (values-zh-rHK, values-zh-rCN, etc.)
            if (file.name.matches("values.*\\\\.xml") && file.absolutePath.contains("dji-sdk-v5")) {
                patchXmlFile(file)
            }
        }
    }
}

def patchXmlFile(File file) {
    def text = file.text
    // Only patch files that have the problematic pattern
    if (!text.contains('%s')) return

    def patched = text
    // Match <string name="...">...%s...%s...</string> without formatted="false"
    // and add formatted="false" attribute
    patched = patched.replaceAll(
        '(<string\\\\s+name="[^"]*")>(([^<]*%s[^<]*){2,})</string>',
        '\\$1 formatted="false">\\$2</string>'
    )

    if (patched != text) {
        file.text = patched
        logger.lifecycle("Patched DJI SDK resources: " + file.absolutePath)
    }
}

// Hook into all mergeResources tasks
tasks.configureEach { task ->
    if (task.name.matches("merge.*Resources")) {
        task.doFirst {
            patchDjiStringResources()
        }
    }
}
`;
    }

    config.modResults.contents = contents;
    return config;
  });
}

// --- 4. Create res/xml/accessory_filter.xml ---

function withDjiAccessoryFilter(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const xmlDir = path.join(projectRoot, 'app', 'src', 'main', 'res', 'xml');

      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(xmlDir, 'accessory_filter.xml'),
        `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <usb-accessory manufacturer="DJI" />\n</resources>\n`,
        'utf-8'
      );

      return config;
    },
  ]);
}

module.exports = withDjiTelemetry;
