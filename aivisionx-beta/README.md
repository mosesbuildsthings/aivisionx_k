# AiVisionX Beta Distribution Package
## Version 0.1.0-beta

---

## 📦 Package Contents

```
aivisionx-beta/
├── windows/          # Windows beta installer
│   ├── install.bat
│   ├── config.json
│   ├── AiVisionX.nsi
│   └── README.md
├── android/          # Android beta APK source
│   ├── app/
│   ├── build.gradle
│   └── README.md
├── prototype/        # Python prototype
│   ├── aivisionx_prototype.py
│   ├── requirements.txt
│   └── README.md
├── demo/             # Demo assets
│   ├── overlay_demo_*.jpg
│   └── DEMO_WALKTHROUGH.md
└── docs/             # Documentation
    └── TESTING_PLAN.md
```

---

## 🚀 Quick Start

### Windows Users

```bash
# Option 1: Run installer
cd windows
.\install.bat

# Option 2: Run Python prototype
cd prototype
pip install -r requirements.txt
python aivisionx_prototype.py
```

### Android Users

```bash
# Build APK
cd android
./gradlew assembleDebug

# Install to device
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 What's Included

### 1. Python Prototype
A fully functional prototype demonstrating:
- ✅ Differential screen capture
- ✅ Privacy filtering (PII redaction)
- ✅ AI integration (Gemini API)
- ✅ Interactive overlay UI
- ✅ Command-line interface

### 2. Windows Beta
Installer package with:
- ✅ Automated installation
- ✅ System tray integration
- ✅ Start menu shortcuts
- ✅ Configuration management
- ✅ Uninstaller

### 3. Android Beta
Full Android application with:
- ✅ MediaProjection screen capture
- ✅ ML Kit OCR integration
- ✅ Floating overlay service
- ✅ Material Design 3 UI
- ✅ Privacy-first architecture

### 4. Demo Assets
Visual demonstrations:
- ✅ Code analysis overlay
- ✅ Security scan overlay
- ✅ Chat interface
- ✅ Status dashboard

### 5. Testing Plan
Comprehensive QA strategy:
- ✅ Unit test specifications
- ✅ Integration test scenarios
- ✅ Performance benchmarks
- ✅ Security validation
- ✅ Platform compatibility matrix

---

## 🔧 System Requirements

### Windows
- Windows 10 21H2 or later
- 4 GB RAM minimum
- 500 MB free storage
- Internet connection for AI features

### Android
- Android 10 (API 29) or later
- 4 GB RAM minimum
- 200 MB free storage
- Screen capture permission

### Development
- Python 3.9+ (for prototype)
- Android Studio Hedgehog (for Android)
- NSIS 3.0+ (for Windows installer)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [TESTING_PLAN.md](docs/TESTING_PLAN.md) | Comprehensive QA strategy |
| [DEMO_WALKTHROUGH.md](demo/DEMO_WALKTHROUGH.md) | Overlay UI demonstrations |
| [windows/README.md](windows/README.md) | Windows installation guide |
| [android/README.md](android/README.md) | Android build instructions |

---

## 🧪 Testing

### Run Python Prototype

```bash
cd prototype

# Install dependencies
pip install -r requirements.txt

# Set API key (optional)
export GEMINI_API_KEY="your-key-here"

# Run
python aivisionx_prototype.py
```

### Test Commands

| Command | Action |
|---------|--------|
| `capture` | Force screen capture |
| `analyze` | Analyze current screen |
| `ask <q>` | Ask AiVisionX |
| `stats` | Show statistics |
| `overlay` | Toggle overlay |
| `help` | Show help |

---

## 🔐 Privacy & Security

### On-Device Processing
- Screen capture happens locally
- OCR runs on-device (ML Kit)
- PII redaction before any network call
- No persistent screenshot storage

### Data Sent to Cloud
- Only redacted/anonymized data
- Encrypted with TLS 1.3
- No user-identifiable information
- Optional: Can run in offline mode

### Sensitive App Detection
Auto-pauses capture for:
- Password managers
- Banking apps
- VPN configurations
- Payment interfaces

---

## 🐛 Bug Reporting

### Template

```markdown
**Platform:** Windows/Android
**Version:** 0.1.0-beta
**Device:** [e.g., Windows 11, Pixel 7]

**Steps to Reproduce:**
1. Step one
2. Step two

**Expected:** What should happen
**Actual:** What actually happens

**Logs:**
```
[Relevant log output]
```
```

### Channels
- GitHub Issues: github.com/aivisionx/beta
- Discord: discord.gg/aivisionx
- Email: beta@aivisionx.io

---

## 🗺️ Roadmap

### Phase 1: Beta (Current)
- [x] Core screen capture
- [x] Privacy firewall
- [x] AI integration
- [x] Basic overlay UI

### Phase 2: Public Beta
- [ ] Plugin system
- [ ] Custom actions
- [ ] Team features
- [ ] Advanced OCR

### Phase 3: v1.0 Release
- [ ] Enterprise SSO
- [ ] On-premise deployment
- [ ] Advanced security
- [ ] Full platform support

---

## 📄 License

Beta Software License Agreement

Copyright © 2026 AiVisionX Team

---

## 🤝 Contributing

We welcome feedback and contributions during the beta period!

### Ways to Contribute
1. Report bugs
2. Suggest features
3. Share feedback
4. Spread the word

---

## 📞 Support

| Channel | Link |
|---------|------|
| Documentation | docs.aivisionx.io |
| Community | discord.gg/aivisionx |
| Email | support@aivisionx.io |
| Twitter | @AiVisionX |

---

**Thank you for trying AiVisionX Beta! 🎉**
