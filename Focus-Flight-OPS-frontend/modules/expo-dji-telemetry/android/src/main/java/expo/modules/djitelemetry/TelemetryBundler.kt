package expo.modules.djitelemetry

import android.os.Handler
import android.os.Looper
import expo.modules.kotlin.modules.Module
import kotlin.math.*

/**
 * SRP: Only responsible for accumulating telemetry values from individual key listeners
 * and emitting a bundled snapshot at a fixed interval (default 100ms).
 *
 * This reduces bridge overhead by batching multiple key updates into a single event.
 */
object TelemetryBundler {
  // Mutable telemetry state — updated by TelemetryKeyListener callbacks
  @Volatile var latitude: Double = 0.0
  @Volatile var longitude: Double = 0.0
  @Volatile var altitudeM: Double = 0.0
  @Volatile var speedMs: Double = 0.0
  @Volatile var headingDeg: Double = 0.0
  @Volatile var batteryPercent: Int = 0
  @Volatile var signalStrength: Int = 0
  @Volatile var satelliteCount: Int = 0
  @Volatile var pitch: Double = 0.0
  @Volatile var roll: Double = 0.0
  @Volatile var yaw: Double = 0.0
  @Volatile var flightMode: String = "UNKNOWN"
  @Volatile var isLowBattery: Boolean = false
  @Volatile var flightTimeSeconds: Int = 0
  @Volatile var windSpeedMs: Double = 0.0

  // Home location for distance calculation
  @Volatile var homeLat: Double = 0.0
  @Volatile var homeLng: Double = 0.0

  private var handler: Handler? = null
  private var emitRunnable: Runnable? = null
  private var moduleRef: Module? = null

  fun update(
    latitude: Double? = null,
    longitude: Double? = null,
    altitudeM: Double? = null,
    speedMs: Double? = null,
    headingDeg: Double? = null,
    batteryPercent: Int? = null,
    signalStrength: Int? = null,
    satelliteCount: Int? = null,
    pitch: Double? = null,
    roll: Double? = null,
    yaw: Double? = null,
    flightMode: String? = null,
    isLowBattery: Boolean? = null,
    flightTimeSeconds: Int? = null,
    windSpeedMs: Double? = null,
    homeLat: Double? = null,
    homeLng: Double? = null,
  ) {
    latitude?.let { this.latitude = it }
    longitude?.let { this.longitude = it }
    altitudeM?.let { this.altitudeM = it }
    speedMs?.let { this.speedMs = it }
    headingDeg?.let { this.headingDeg = it }
    batteryPercent?.let { this.batteryPercent = it }
    signalStrength?.let { this.signalStrength = it }
    satelliteCount?.let { this.satelliteCount = it }
    pitch?.let { this.pitch = it }
    roll?.let { this.roll = it }
    yaw?.let { this.yaw = it }
    flightMode?.let { this.flightMode = it }
    isLowBattery?.let { this.isLowBattery = it }
    flightTimeSeconds?.let { this.flightTimeSeconds = it }
    windSpeedMs?.let { this.windSpeedMs = it }
    homeLat?.let { this.homeLat = it }
    homeLng?.let { this.homeLng = it }
  }

  fun startEmitting(module: Module, intervalMs: Long) {
    moduleRef = module
    handler = Handler(Looper.getMainLooper())

    emitRunnable = object : Runnable {
      override fun run() {
        emitSnapshot()
        handler?.postDelayed(this, intervalMs)
      }
    }
    handler?.post(emitRunnable!!)
  }

  fun stopEmitting() {
    emitRunnable?.let { handler?.removeCallbacks(it) }
    handler = null
    emitRunnable = null
    moduleRef = null
  }

  private fun emitSnapshot() {
    val module = moduleRef ?: return

    val distanceFromPilot = haversineDistance(
      lat1 = homeLat, lng1 = homeLng,
      lat2 = latitude, lng2 = longitude,
    )

    module.sendEvent("onTelemetryUpdate", mapOf(
      "timestamp" to System.currentTimeMillis(),
      "latitude" to latitude,
      "longitude" to longitude,
      "altitudeM" to altitudeM,
      "speedMs" to speedMs,
      "headingDeg" to headingDeg,
      "batteryPercent" to batteryPercent,
      "signalStrength" to signalStrength,
      "satelliteCount" to satelliteCount,
      "distanceFromPilotM" to distanceFromPilot,
      "pitch" to pitch,
      "roll" to roll,
      "yaw" to yaw,
      "flightMode" to flightMode,
      "isLowBattery" to isLowBattery,
      "flightTimeSeconds" to flightTimeSeconds,
      "windSpeedMs" to windSpeedMs,
    ))
  }

  /**
   * Haversine formula to calculate distance between two GPS coordinates in meters.
   */
  private fun haversineDistance(
    lat1: Double, lng1: Double,
    lat2: Double, lng2: Double,
  ): Double {
    if (lat1 == 0.0 && lng1 == 0.0) return 0.0

    val earthRadiusM = 6371000.0
    val dLat = Math.toRadians(lat2 - lat1)
    val dLng = Math.toRadians(lng2 - lng1)
    val a = sin(dLat / 2).pow(2) +
        cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
        sin(dLng / 2).pow(2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return earthRadiusM * c
  }
}
