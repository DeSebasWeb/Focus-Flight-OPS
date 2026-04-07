package expo.modules.djitelemetry

import expo.modules.kotlin.modules.Module

/**
 * SRP: Only responsible for tracking and reporting DJI product connection state.
 */
object ConnectionStateTracker {
  @Volatile
  var isConnected: Boolean = false
    private set

  @Volatile
  var productName: String? = null
    private set

  fun updateState(connected: Boolean, productName: String?, module: Module) {
    this.isConnected = connected
    this.productName = productName

    module.sendEvent("onConnectionChange", mapOf(
      "connected" to connected,
      "productName" to productName,
    ))
  }
}
