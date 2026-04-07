package expo.modules.djitelemetry

import android.content.Context
import dji.v5.manager.SDKManager
import dji.v5.manager.interfaces.SDKManagerCallback
import dji.v5.common.error.IDJIError
import dji.v5.common.register.DJISDKInitEvent
import expo.modules.kotlin.modules.Module

/**
 * SRP: Only responsible for DJI SDK initialization and registration callbacks.
 */
object DjiSdkManager {
  private var initialized = false

  fun initialize(context: Context, module: Module) {
    if (initialized) return

    SDKManager.getInstance().init(context, object : SDKManagerCallback {
      override fun onRegisterSuccess() {
        initialized = true
      }

      override fun onRegisterFailure(error: IDJIError?) {
        module.sendEvent("onSdkError", mapOf(
          "code" to "REGISTRATION_FAILED",
          "message" to (error?.description() ?: "Unknown registration error"),
        ))
      }

      override fun onProductConnect(productId: Int) {
        ConnectionStateTracker.updateState(
          connected = true,
          productName = "DJI Aircraft",
          module = module,
        )
      }

      override fun onProductDisconnect(productId: Int) {
        ConnectionStateTracker.updateState(
          connected = false,
          productName = null,
          module = module,
        )
      }

      override fun onProductChanged(productId: Int) {
        ConnectionStateTracker.updateState(
          connected = true,
          productName = "DJI Aircraft",
          module = module,
        )
      }

      override fun onInitProcess(event: DJISDKInitEvent?, totalProcess: Int) {
        // SDK init progress — no action needed
      }

      override fun onDatabaseDownloadProgress(current: Long, total: Long) {
        // Database download progress — no action needed
      }
    })
  }
}
