package io.aivisionx.beta

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import io.aivisionx.beta.service.ScreenCaptureService
import io.aivisionx.beta.ui.theme.AiVisionXTheme
import timber.log.Timber

class MainActivity : ComponentActivity() {

    companion object {
        const val REQUEST_MEDIA_PROJECTION = 1001
        const val REQUEST_OVERLAY_PERMISSION = 1002
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Timber for logging
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }

        setContent {
            AiVisionXTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun MainScreen() {
    val context = LocalContext.current
    var isCapturing by remember { mutableStateOf(false) }
    var showPermissionDialog by remember { mutableStateOf(false) }
    
    // Permissions
    val permissionsState = rememberMultiplePermissionsState(
        permissions = listOf(
            android.Manifest.permission.POST_NOTIFICATIONS,
            android.Manifest.permission.FOREGROUND_SERVICE
        )
    )
    
    // Media Projection Launcher
    val mediaProjectionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            startCaptureService(context, result.resultCode, intent)
            isCapturing = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AiVisionX Beta") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Status Card
            item {
                StatusCard(isCapturing = isCapturing)
            }
            
            // Capture Control
            item {
                CaptureControlCard(
                    isCapturing = isCapturing,
                    onStartCapture = {
                        if (!permissionsState.allPermissionsGranted) {
                            permissionsState.launchMultiplePermissionRequest()
                        } else {
                            requestMediaProjection(context, mediaProjectionLauncher)
                        }
                    },
                    onStopCapture = {
                        stopCaptureService(context)
                        isCapturing = false
                    }
                )
            }
            
            // Quick Actions
            item {
                QuickActionsCard()
            }
            
            // Recent Activity
            item {
                RecentActivityCard()
            }
            
            // Settings
            item {
                SettingsCard()
            }
        }
    }
}

@Composable
fun StatusCard(isCapturing: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isCapturing) 
                MaterialTheme.colorScheme.primaryContainer 
            else 
                MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = if (isCapturing) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = if (isCapturing) 
                    MaterialTheme.colorScheme.primary 
                else 
                    MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isCapturing) "AiVisionX is Active" else "AiVisionX is Inactive",
                style = MaterialTheme.typography.titleMedium
            )
            
            Text(
                text = if (isCapturing) 
                    "Screen capture and AI analysis enabled" 
                else 
                    "Tap Start Capture to begin",
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun CaptureControlCard(
    isCapturing: Boolean,
    onStartCapture: () -> Unit,
    onStopCapture: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Screen Capture",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            if (isCapturing) {
                Button(
                    onClick = onStopCapture,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(Icons.Default.Stop, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Stop Capture")
                }
            } else {
                Button(
                    onClick = onStartCapture,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Start Capture")
                }
            }
        }
    }
}

@Composable
fun QuickActionsCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Quick Actions",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                QuickActionButton(
                    icon = Icons.Default.Chat,
                    label = "Ask AI",
                    onClick = { /* TODO */ }
                )
                QuickActionButton(
                    icon = Icons.Default.History,
                    label = "History",
                    onClick = { /* TODO */ }
                )
                QuickActionButton(
                    icon = Icons.Default.Shield,
                    label = "Privacy",
                    onClick = { /* TODO */ }
                )
            }
        }
    }
}

@Composable
fun QuickActionButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        FilledIconButton(onClick = onClick) {
            Icon(icon, contentDescription = label)
        }
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall
        )
    }
}

@Composable
fun RecentActivityCard() {
    val activities = listOf(
        "Analyzed VS Code window - Python function",
        "Security scan - No issues found",
        "Captured terminal output - Error detected"
    )
    
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Recent Activity",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            activities.forEach { activity ->
                ListItem(
                    headlineContent = { Text(activity) },
                    leadingContent = {
                        Icon(Icons.Default.CheckCircle, contentDescription = null)
                    }
                )
            }
        }
    }
}

@Composable
fun SettingsCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Settings",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ListItem(
                headlineContent = { Text("AI Provider") },
                supportingContent = { Text("Gemini Pro Vision") },
                leadingContent = { Icon(Icons.Default.Cloud, contentDescription = null) },
                trailingContent = { Icon(Icons.Default.ChevronRight, contentDescription = null) }
            )
            
            ListItem(
                headlineContent = { Text("Privacy Settings") },
                supportingContent = { Text("Redaction enabled") },
                leadingContent = { Icon(Icons.Default.Security, contentDescription = null) },
                trailingContent = { Icon(Icons.Default.ChevronRight, contentDescription = null) }
            )
            
            ListItem(
                headlineContent = { Text("About") },
                supportingContent = { Text("Version 0.1.0-beta") },
                leadingContent = { Icon(Icons.Default.Info, contentDescription = null) },
                trailingContent = { Icon(Icons.Default.ChevronRight, contentDescription = null) }
            )
        }
    }
}

private fun requestMediaProjection(
    context: Context,
    launcher: androidx.activity.result.ActivityResultLauncher<Intent>
) {
    val mediaProjectionManager = context.getSystemService(
        Context.MEDIA_PROJECTION_SERVICE
    ) as MediaProjectionManager
    
    val intent = mediaProjectionManager.createScreenCaptureIntent()
    launcher.launch(intent)
}

private fun startCaptureService(context: Context, resultCode: Int, data: Intent?) {
    val serviceIntent = Intent(context, ScreenCaptureService::class.java).apply {
        putExtra(ScreenCaptureService.EXTRA_RESULT_CODE, resultCode)
        putExtra(ScreenCaptureService.EXTRA_DATA, data)
    }
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(serviceIntent)
    } else {
        context.startService(serviceIntent)
    }
}

private fun stopCaptureService(context: Context) {
    val serviceIntent = Intent(context, ScreenCaptureService::class.java)
    context.stopService(serviceIntent)
}
