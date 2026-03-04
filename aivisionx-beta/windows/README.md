# AiVisionX Windows Beta

## Version 0.1.0-beta

---

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 21H2 | Windows 11 23H2 |
| RAM | 4 GB | 8 GB |
| Storage | 500 MB | 1 GB |
| Display | 1920x1080 | 2560x1440 |
| Internet | Required for AI features | Stable connection |

---

## Installation

### Option 1: Automated Installer (Recommended)

1. Download `AiVisionX-Setup-0.1.0-beta.exe`
2. Double-click to run the installer
3. Follow the on-screen instructions
4. Launch AiVisionX from the Start Menu

### Option 2: Manual Installation

1. Extract the zip file to a folder
2. Run `install.bat` as Administrator
3. Wait for installation to complete
4. Launch from Start Menu or Desktop shortcut

### Option 3: Portable Mode

1. Extract to a USB drive or portable location
2. Run `AiVisionX.exe --portable`
3. Configuration saved to local folder

---

## Quick Start

### 1. First Launch

```
1. Launch AiVisionX from Start Menu
2. Accept screen capture permissions
3. Configure your Gemini API key (optional)
4. Press Ctrl+Space to activate overlay
```

### 2. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Toggle overlay |
| `Ctrl+Shift+E` | Explain selected code |
| `Ctrl+Shift+D` | Generate docstring |
| `Ctrl+Shift+B` | Find bugs |
| `Esc` | Close overlay |

### 3. System Tray Menu

Right-click the AiVisionX tray icon for:
- Start/Stop Capture
- Open Settings
- View Status
- Exit

---

## Configuration

### API Key Setup

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open AiVisionX Settings
3. Paste your API key
4. Click "Test Connection"

### Privacy Settings

Edit `config.json` in your installation directory:

```json
{
  "privacy": {
    "enableRedaction": true,
    "sensitiveApps": ["1Password", "Bitwarden"],
    "neverCaptureApps": ["KeePassXC"]
  }
}
```

### Capture Settings

```json
{
  "capture": {
    "interval": 2.0,
    "differentialThreshold": 0.05,
    "saveCapturesLocally": false
  }
}
```

---

## Python Prototype

The Python prototype is included for testing core functionality without the full application.

### Running the Prototype

```bash
# Navigate to prototype folder
cd "C:\Program Files\AiVisionX\prototype"

# Install dependencies
pip install -r requirements.txt

# Set API key (optional)
set GEMINI_API_KEY=your-api-key-here

# Run prototype
python aivisionx_prototype.py
```

### Prototype Commands

| Command | Description |
|---------|-------------|
| `capture` | Force screen capture |
| `analyze` | Analyze current screen |
| `ask <question>` | Ask AiVisionX |
| `stats` | Show statistics |
| `overlay` | Toggle overlay |
| `help` | Show help |
| `quit` | Exit |

---

## Troubleshooting

### Issue: "Screen capture permission denied"

**Solution:**
1. Right-click AiVisionX → Run as Administrator
2. Or disable UAC temporarily during setup

### Issue: "AI features not working"

**Solution:**
1. Check your internet connection
2. Verify API key in Settings
3. Check firewall isn't blocking connections

### Issue: "High CPU usage"

**Solution:**
1. Increase capture interval in settings
2. Reduce screen resolution
3. Close unnecessary applications

### Issue: "Overlay not appearing"

**Solution:**
1. Check if AiVisionX is running (tray icon)
2. Try different shortcut combination
3. Restart the application

---

## Uninstallation

### Method 1: Control Panel
1. Open Settings → Apps
2. Find "AiVisionX"
3. Click Uninstall

### Method 2: Start Menu
1. Open Start Menu → AiVisionX folder
2. Click "Uninstall AiVisionX"

### Method 3: Manual
1. Delete installation folder
2. Remove registry keys (advanced)

---

## Feedback & Support

- **Bug Reports:** [GitHub Issues](https://github.com/aivisionx/beta/issues)
- **Feature Requests:** [Discord](https://discord.gg/aivisionx)
- **Email:** beta@aivisionx.io

---

## Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| Overlay flickers on some GPUs | Investigating | Disable animations in settings |
| High memory usage over time | Known | Restart application daily |
| API rate limiting | Expected | Upgrade to Pro for higher limits |

---

## Changelog

### v0.1.0-beta (2026-03-04)
- Initial beta release
- Screen capture with differential analysis
- Privacy firewall with PII redaction
- AI-powered screen analysis
- Floating overlay UI
- Windows 10/11 support

---

**License:** Beta Software License Agreement  
**Privacy:** [Privacy Policy](https://aivisionx.io/privacy)
