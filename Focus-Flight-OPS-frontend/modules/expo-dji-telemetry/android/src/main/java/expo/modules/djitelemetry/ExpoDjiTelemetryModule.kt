package expo.modules.djitelemetry

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoDjiTelemetryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoDjiTelemetry")

    Events("onTelemetryUpdate", "onConnectionChange", "onSdkError")

    AsyncFunction("initialize") {
      val context = appContext.reactContext ?: throw Exception("React context not available")
      DjiSdkManager.initialize(context, this@ExpoDjiTelemetryModule)
    }

    AsyncFunction("startTelemetryListeners") {
      TelemetryKeyListener.registerAll()
      TelemetryBundler.startEmitting(this@ExpoDjiTelemetryModule, intervalMs = 100L)
    }

    Function("stopTelemetryListeners") {
      TelemetryBundler.stopEmitting()
      TelemetryKeyListener.unregisterAll()
    }

    Function("getConnectionStatus") {
      ConnectionStateTracker.isConnected
    }

    Function("getProductName") {
      ConnectionStateTracker.productName
    }
  }
}
