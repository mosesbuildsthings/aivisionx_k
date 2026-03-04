# AiVisionX Beta - Quick Start Guide

## 🎯 Get Started in 5 Minutes

---

## Option 1: Test with Python Prototype (Fastest)

```bash
# 1. Navigate to prototype
cd prototype

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Set Gemini API key
export GEMINI_API_KEY="your-api-key-here"
# Windows: set GEMINI_API_KEY=your-api-key-here

# 4. Run the prototype
python aivisionx_prototype.py
```

### Try These Commands

```
AiVisionX> capture          # Take a screenshot
AiVisionX> analyze          # Analyze current screen with AI
AiVisionX> ask "What app is this?"   # Ask a question
AiVisionX> stats            # View statistics
AiVisionX> overlay          # Toggle overlay display
AiVisionX> help             # Show all commands
```

---

## Option 2: Install Windows Beta

```bash
# 1. Navigate to Windows folder
cd windows

# 2. Run installer (as Administrator)
install.bat

# 3. Launch from Start Menu
# Press Ctrl+Space to activate overlay
```

---

## Option 3: Build Android Beta

```bash
# 1. Navigate to Android folder
cd android

# 2. Build debug APK
./gradlew assembleDebug

# 3. Install to connected device
adb install app/build/outputs/apk/debug/app-debug.apk

# 4. Open app and grant permissions
```

---

## 📊 What Each Component Does

| Component | Purpose | Best For |
|-----------|---------|----------|
| **Python Prototype** | Test core functionality quickly | Developers, quick testing |
| **Windows Beta** | Full desktop experience | Daily use on Windows |
| **Android Beta** | Mobile screen analysis | On-the-go assistance |

---

## 🔑 API Key Setup (Optional)

Get a free Gemini API key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Set as environment variable:
   - Windows: `set GEMINI_API_KEY=your-key`
   - macOS/Linux: `export GEMINI_API_KEY=your-key`

Without API key, the prototype uses mock responses.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `pip not found` | Install Python from python.org |
| `Permission denied` | Run as Administrator (Windows) or use `sudo` |
| `Module not found` | Run `pip install -r requirements.txt` |
| `API errors` | Check your internet connection and API key |

---

## 📚 Next Steps

1. **Read the Testing Plan**: `docs/TESTING_PLAN.md`
2. **View Demo Screens**: `demo/` folder
3. **Check Platform Guides**: `windows/README.md` or `android/README.md`

---

## 💬 Need Help?

- **Discord**: discord.gg/aivisionx
- **Email**: beta@aivisionx.io
- **Issues**: github.com/aivisionx/beta

---

**Ready to see your screen through AI? Let's go! 🚀**
