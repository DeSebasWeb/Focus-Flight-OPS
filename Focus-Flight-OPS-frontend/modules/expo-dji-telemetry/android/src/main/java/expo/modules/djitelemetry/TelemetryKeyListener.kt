package expo.modules.djitelemetry

import dji.sdk.keyvalue.key.DJIKeyInfo
import dji.sdk.keyvalue.key.FlightControllerKey
import dji.sdk.keyvalue.key.BatteryKey
import dji.sdk.keyvalue.key.KeyTools
import dji.sdk.keyvalue.value.common.LocationCoordinate3D
import dji.sdk.keyvalue.value.common.Velocity3D
import dji.sdk.keyvalue.value.common.Attitude
import dji.sdk.keyvalue.value.common.LocationCoordinate2D
import dji.sdk.keyvalue.value.flightcontroller.FlightMode
import dji.sdk.keyvalue.value.flightcontroller.GPSSignalLevel
import dji.v5.common.callback.CommonCallbacks
import dji.v5.manager.KeyManager
import kotlin.math.sqrt
import kotlin.math.pow

/**
 * SRP: Only responsible for registering/unregistering DJI KeyValue listeners.
 * Each listener callback updates the TelemetryBundler with new values.
 */
object TelemetryKeyListener {
  private val cleanups = mutableListOf<() -> Unit>()

  fun registerAll() {
    // Aircraft Location (lat, lng, altitude)
    listenSafe<LocationCoordinate3D>(FlightControllerKey.KeyAircraftLocation3D) { location ->
      TelemetryBundler.update(
        latitude = location.latitude,
        longitude = location.longitude,
        altitudeM = location.altitude,
      )
    }

    // Velocity (NED frame → speed magnitude)
    listenSafe<Velocity3D>(FlightControllerKey.KeyAircraftVelocity) { velocity ->
      val speed = sqrt(velocity.x.pow(2) + velocity.y.pow(2) + velocity.z.pow(2))
      TelemetryBundler.update(speedMs = speed)
    }

    // Compass heading
    listenSafe<Double>(FlightControllerKey.KeyCompassHeading) { heading ->
      TelemetryBundler.update(headingDeg = heading)
    }

    // GPS satellite count
    listenSafe<Int>(FlightControllerKey.KeyGPSSatelliteCount) { count ->
      TelemetryBundler.update(satelliteCount = count)
    }

    // GPS signal level (enum 0-5 → percentage 0-100)
    listenSafe<GPSSignalLevel>(FlightControllerKey.KeyGPSSignalLevel) { level ->
      val percent = (level.ordinal * 20).coerceAtMost(100)
      TelemetryBundler.update(signalStrength = percent)
    }

    // Battery charge remaining (0-100%)
    listenSafe<Int>(BatteryKey.KeyChargeRemaining) { percent ->
      TelemetryBundler.update(batteryPercent = percent)
    }

    // Aircraft attitude (pitch, roll, yaw)
    listenSafe<Attitude>(FlightControllerKey.KeyAircraftAttitude) { attitude ->
      TelemetryBundler.update(
        pitch = attitude.pitch,
        roll = attitude.roll,
        yaw = attitude.yaw,
      )
    }

    // Flight mode
    listenSafe<FlightMode>(FlightControllerKey.KeyFlightMode) { mode ->
      TelemetryBundler.update(flightMode = mode.name)
    }

    // Low battery warning
    listenSafe<Boolean>(FlightControllerKey.KeyIsLowBatteryWarning) { isLow ->
      TelemetryBundler.update(isLowBattery = isLow)
    }

    // Flight time in seconds
    listenSafe<Int>(FlightControllerKey.KeyFlightTimeInSeconds) { seconds ->
      TelemetryBundler.update(flightTimeSeconds = seconds)
    }

    // Wind speed (may not be available on all models)
    listenSafe<Int>(FlightControllerKey.KeyWindSpeed) { speed ->
      TelemetryBundler.update(windSpeedMs = speed.toDouble())
    }

    // Home location (for distance-from-pilot calculation)
    listenSafe<LocationCoordinate2D>(FlightControllerKey.KeyHomeLocation) { home ->
      TelemetryBundler.update(homeLat = home.latitude, homeLng = home.longitude)
    }
  }

  fun unregisterAll() {
    for (cleanup in cleanups) {
      try { cleanup() } catch (_: Exception) {}
    }
    cleanups.clear()
  }

  /**
   * Registers a single key listener with try-catch guard.
   * Some keys are not available on all DJI models — failure is non-fatal.
   *
   * MSDK v5 type system:
   *   FlightControllerKey.KeyXxx  → DJIKeyInfo<T>  (key descriptor/metadata)
   *   KeyTools.createKey(keyInfo)  → DJIKey<T>      (addressable key for KeyManager)
   *   KeyManager.listen()          accepts DJIKey<T>, NOT DJIKeyInfo<T>
   */
  private fun <T : Any> listenSafe(
    keyInfo: DJIKeyInfo<T>,
    handler: (T) -> Unit,
  ) {
    try {
      val djiKey = KeyTools.createKey(keyInfo)
      val km = KeyManager.getInstance()
      val listener = CommonCallbacks.KeyListener<T> { _: T?, newValue: T? ->
        if (newValue != null) handler(newValue)
      }
      km.listen(djiKey, this, listener)
      cleanups.add {
        KeyManager.getInstance().cancelListen(djiKey, this)
      }
    } catch (_: Exception) {
      // Key not supported on this aircraft model — skip silently
    }
  }
}
