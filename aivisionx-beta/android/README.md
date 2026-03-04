# AiVisionX Android Beta

## Version 0.1.0-beta

---

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Android | 10 (API 29) | 14 (API 34) |
| RAM | 4 GB | 6 GB |
| Storage | 200 MB | 500 MB |
| Display | 1080p | 1440p |
| Internet | Required for AI | Wi-Fi preferred |

### Tested Devices

- Google Pixel 7 (Android 14) ✅
- Samsung Galaxy S23 (Android 13) ✅
- OnePlus 11 (Android 13) ✅

---

## Installation

### APK Installation (Sideload)

1. Download `AiVisionX-0.1.0-beta.apk`
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install
4. Grant required permissions on first launch

### Required Permissions

| Permission | Purpose |
|------------|---------|
| Screen Capture | Capture screen for AI analysis |
| Notifications | Show capture status |
| Internet | Connect to AI services |
| Overlay | Display floating UI |

---

## Quick Start

### 1. First Launch

```
1. Open AiVisionX app
2. Grant screen capture permission
3. Tap "Start Capture"
4. AiVisionX runs in background
```

### 2. Using the Overlay

- Tap the floating AiVisionX bubble to open
- View AI suggestions based on current screen
- Tap suggestions to execute actions
- Swipe bubble to move it

### 3. Accessing History

- Open AiVisionX app
- View "Recent Activity" section
- Tap any item for details

---

## Features

### Screen Capture

- Automatic differential capture
- Battery-optimized processing
- Privacy-first redaction

### AI Analysis

- Context-aware suggestions
- Natural language queries
- Multi-turn conversations

### Privacy Protection

- On-device OCR
- PII redaction before cloud
- Sensitive app detection

---

## Building from Source

### Prerequisites

- Android Studio Hedgehog (2023.1.1)
- JDK 17
- Android SDK 34
- Kotlin 1.9.0

### Build Steps

```bash
# Clone repository
git clone https://github.com/aivisionx/android-beta.git
cd android-beta

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Install to device
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │  Main   │ │ Overlay │ │ Settings │ │
│  │Activity │ │ Service │ │ Activity │ │
│  └─────────┘ └─────────┘ └──────────┘ │
├─────────────────────────────────────────┤
│            Service Layer                │
│  ┌─────────────┐    ┌──────────────┐   │
│  │ScreenCapture│    │   AiService  │   │
│  │  Service    │    │              │   │
│  └─────────────┘    └──────────────┘   │
├─────────────────────────────────────────┤
│           Data Layer                    │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │  OCR    │ │  AI API │ │  Local   │ │
│  │  (MLKit)│ │ (Gemini)│ │  Cache   │ │
│  └─────────┘ └─────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: "Screen capture not working"

**Solution:**
1. Check MediaProjection permission granted
2. Restart the app
3. Reboot device if needed

### Issue: "Overlay not visible"

**Solution:**
1. Check "Display over other apps" permission
2. Ensure AiVisionX is running
3. Check battery optimization settings

### Issue: "High battery usage"

**Solution:**
1. Reduce capture frequency in settings
2. Disable when not needed
3. Use battery saver mode

---

## Privacy on Android

### Data Handling

- Screenshots processed on-device
- OCR runs locally using ML Kit
- Only anonymized data sent to AI
- No persistent screenshot storage

### Sensitive Apps

AiVisionX automatically pauses capture when:
- Banking apps detected
- Password managers open
- VPN configuration screens
- Payment interfaces

---

## Feedback

### In-App Feedback

1. Open AiVisionX
2. Go to Settings → Feedback
3. Submit bug report or feature request

### Community

- **Discord:** [discord.gg/aivisionx](https://discord.gg/aivisionx)
- **Reddit:** r/AiVisionX
- **Email:** android-beta@aivisionx.io

---

## Known Issues

| Issue | Priority | Status |
|-------|----------|--------|
| Overlay position resets | Medium | Investigating |
| Battery drain on older devices | High | Optimization in progress |
| AI response timeout | Medium | Retry logic added |

---

## Roadmap

### v0.2.0-beta
- [ ] Widget support
- [ ] Quick settings tile
- [ ] Improved OCR accuracy

### v0.3.0-beta
- [ ] Plugin system
- [ ] Custom actions
- [ ] Team collaboration

### v1.0.0
- [ ] Google Play Store release
- [ ] Enterprise features
- [ ] Advanced security

---

## License

Beta Software License Agreement - See LICENSE.txt

---

**© 2026 AiVisionX Team**
