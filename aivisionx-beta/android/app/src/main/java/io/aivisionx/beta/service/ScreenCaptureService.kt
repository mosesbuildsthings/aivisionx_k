package io.aivisionx.beta.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.DisplayMetrics
import androidx.core.app.NotificationCompat
import io.aivisionx.beta.MainActivity
import io.aivisionx.beta.R
import timber.log.Timber
import java.nio.ByteBuffer

class ScreenCaptureService : Service() {

    companion object {
        const val EXTRA_RESULT_CODE = "result_code"
        const val EXTRA_DATA = "data"
        const val NOTIFICATION_CHANNEL_ID = "aivisionx_capture"
        const val NOTIFICATION_ID = 1001
        const val CAPTURE_INTERVAL_MS = 2000L // 2 seconds
    }

    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private var handler: Handler? = null
    private var captureRunnable: Runnable? = null
    
    private var lastCaptureHash: String? = null
    private var captureCount = 0
    private var skipCount = 0

    override fun onCreate() {
        super.onCreate()
        handler = Handler(Looper.getMainLooper())
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val resultCode = intent?.getIntExtra(EXTRA_RESULT_CODE, -1) ?: -1
        val data = intent?.getParcelableExtra<Intent>(EXTRA_DATA)
        
        if (resultCode == -1 || data == null) {
            Timber.e("Invalid media projection data")
            stopSelf()
            return START_NOT_STICKY
        }
        
        startForeground(NOTIFICATION_ID, createNotification())
        initMediaProjection(resultCode, data)
        startCaptureLoop()
        
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        stopCaptureLoop()
        virtualDisplay?.release()
        mediaProjection?.stop()
        imageReader?.close()
        handler = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "AiVisionX Screen Capture",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Captures screen for AI analysis"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )
        
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("AiVisionX is Active")
            .setContentText("Screen capture and AI analysis running")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }

    private fun initMediaProjection(resultCode: Int, data: Intent) {
        val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) 
            as MediaProjectionManager
        
        mediaProjection = projectionManager.getMediaProjection(resultCode, data)
        
        mediaProjection?.registerCallback(object : MediaProjection.Callback() {
            override fun onStop() {
                Timber.d("MediaProjection stopped")
                stopSelf()
            }
        }, handler)
        
        setupImageReader()
    }

    private fun setupImageReader() {
        val metrics = DisplayMetrics()
        val windowManager = getSystemService(Context.WINDOW_SERVICE) as android.view.WindowManager
        windowManager.defaultDisplay.getMetrics(metrics)
        
        // Scale down for performance
        val width = metrics.widthPixels / 2
        val height = metrics.heightPixels / 2
        
        imageReader = ImageReader.newInstance(
            width,
            height,
            PixelFormat.RGBA_8888,
            2
        )
        
        virtualDisplay = mediaProjection?.createVirtualDisplay(
            "AiVisionXCapture",
            width,
            height,
            metrics.densityDpi,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            imageReader?.surface,
            null,
            handler
        )
    }

    private fun startCaptureLoop() {
        captureRunnable = object : Runnable {
            override fun run() {
                captureScreen()
                handler?.postDelayed(this, CAPTURE_INTERVAL_MS)
            }
        }
        handler?.post(captureRunnable!!)
    }

    private fun stopCaptureLoop() {
        captureRunnable?.let { handler?.removeCallbacks(it) }
    }

    private fun captureScreen() {
        val image = imageReader?.acquireLatestImage() ?: return
        
        try {
            val buffer: ByteBuffer = image.planes[0].buffer
            val pixelStride = image.planes[0].pixelStride
            val rowStride = image.planes[0].rowStride
            val rowPadding = rowStride - pixelStride * image.width
            
            val bitmap = Bitmap.createBitmap(
                image.width + rowPadding / pixelStride,
                image.height,
                Bitmap.Config.ARGB_8888
            )
            bitmap.copyPixelsFromBuffer(buffer)
            
            // Check for significant change
            if (shouldProcessCapture(bitmap)) {
                processCapture(bitmap)
            } else {
                skipCount++
            }
            
            captureCount++
            
        } catch (e: Exception) {
            Timber.e(e, "Error capturing screen")
        } finally {
            image.close()
        }
    }

    private fun shouldProcessCapture(bitmap: Bitmap): Boolean {
        // Simple hash-based differential capture
        val currentHash = hashBitmap(bitmap)
        
        if (currentHash == lastCaptureHash) {
            return false
        }
        
        lastCaptureHash = currentHash
        return true
    }

    private fun hashBitmap(bitmap: Bitmap): String {
        // Create a scaled-down version for hashing
        val scaled = Bitmap.createScaledBitmap(bitmap, 32, 18, true)
        val pixels = IntArray(scaled.width * scaled.height)
        scaled.getPixels(pixels, 0, scaled.width, 0, 0, scaled.width, scaled.height)
        
        return pixels.contentHashCode().toString()
    }

    private fun processCapture(bitmap: Bitmap) {
        Timber.d("Processing capture #${captureCount}")
        
        // TODO: Apply privacy redaction
        // TODO: Send to AI for analysis
        // TODO: Update overlay with suggestions
        
        // For now, just log
        Timber.d("Capture processed: ${bitmap.width}x${bitmap.height}")
    }

    fun getStats(): CaptureStats {
        return CaptureStats(
            totalCaptures = captureCount,
            skippedCaptures = skipCount,
            efficiency = if (captureCount + skipCount > 0) {
                (skipCount.toFloat() / (captureCount + skipCount) * 100)
            } else 0f
        )
    }

    data class CaptureStats(
        val totalCaptures: Int,
        val skippedCaptures: Int,
        val efficiency: Float
    )
}
