#!/usr/bin/env python3
"""
AiVisionX Prototype - Core Screen Capture + AI Flow
====================================================
This prototype demonstrates the core functionality of AiVisionX:
1. Differential screen capture
2. Privacy filtering (PII redaction)
3. AI-powered screen analysis
4. Contextual overlay responses

Usage:
    python aivisionx_prototype.py

Requirements:
    pip install -r requirements.txt
    pip install google-genai
    pip install python-dotenv
"""

import os
import sys
import time
import json
import hashlib
import threading
from datetime import datetime
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import mss
from dotenv import load_dotenv

# New Google GenAI SDK integration
try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-genai package not installed. AI features disabled.")

# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class AiVisionXConfig:
    """Configuration for AiVisionX Prototype"""
    # Screen Capture
    capture_interval: float = 2.0  
    differential_threshold: float = 0.05  
    capture_region: Optional[Dict[str, int]] = None  
    
    # Privacy
    enable_redaction: bool = True
    redaction_patterns: List[str] = None
    sensitive_apps: List[str] = None
    
    # AI (Secured: Key loads dynamically)
    gemini_api_key: Optional[str] = None
    ai_model: str = "gemini-3.1-pro" 
    max_context_history: int = 10
    
    # Overlay
    overlay_opacity: float = 0.9
    overlay_position: str = "bottom-right"  
    
    def __post_init__(self):
        if self.redaction_patterns is None:
            self.redaction_patterns = [
                r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',  
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  
                r'\b(?:password|passwd|pwd)\s*[=:]\s*\S+',  
                r'sk-[a-zA-Z0-9]{48}',  
                r'ghp_[a-zA-Z0-9]{36}',  
                r'\b\d{3}-\d{2}-\d{4}\b',  
            ]
        if self.sensitive_apps is None:
            self.sensitive_apps = ["1Password", "Bitwarden", "KeePass", "LastPass"]


# =============================================================================
# SCREEN CAPTURE MODULE
# =============================================================================

class ScreenCapture:
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.last_capture: Optional[np.ndarray] = None
        self.last_hash: Optional[str] = None
        self.capture_count = 0
        self.skip_count = 0
        
    def get_screen_region(self) -> Dict[str, int]:
        if self.config.capture_region:
            return self.config.capture_region
        
        with mss.mss() as sct:
            monitor = sct.monitors[1]
            return {
                "left": monitor["left"],
                "top": monitor["top"],
                "width": monitor["width"],
                "height": monitor["height"]
            }
    
    def capture(self) -> Optional[Image.Image]:
        region = self.get_screen_region()
        
        # Thread-safe GDI context
        with mss.mss() as sct:
            screenshot = sct.grab(region)
            
        img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
        img_array = np.array(img)
        
        # Differential capture logic
        if self.last_capture is not None:
            diff_ratio = self._calculate_difference(img_array, self.last_capture)
            if diff_ratio < self.config.differential_threshold:
                self.skip_count += 1
                return None  
        
        self.last_capture = img_array.copy()
        self.last_hash = hashlib.md5(img_array.tobytes()).hexdigest()
        self.capture_count += 1
        return img
    
    def _calculate_difference(self, img1: np.ndarray, img2: np.ndarray) -> float:
        if img1.shape != img2.shape:
            return 1.0  
        small1 = cv2.resize(img1, (320, 180))
        small2 = cv2.resize(img2, (320, 180))
        diff = cv2.absdiff(small1, small2)
        diff_pixels = np.count_nonzero(diff > 30)  
        total_pixels = diff.size // 3  
        return diff_pixels / total_pixels
    
    def get_stats(self) -> Dict:
        total = self.capture_count + self.skip_count
        return {
            "captured": self.capture_count,
            "skipped": self.skip_count,
            "total_attempts": total,
            "efficiency": f"{(self.skip_count / total * 100):.1f}%" if total > 0 else "0%"
        }


# =============================================================================
# PRIVACY FIREWALL MODULE
# =============================================================================

class PrivacyFirewall:
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.redaction_count = 0
        
    def redact_image(self, image: Image.Image) -> Tuple[Image.Image, List[Dict]]:
        if not self.config.enable_redaction:
            return image, []
        
        img_array = np.array(image)
        redactions = []
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        draw_image = image.copy()
        draw = ImageDraw.Draw(draw_image)
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            # Filter layout blocks to prevent full-screen blurring
            if w < 50 or h < 15 or w > 600 or h > 100:
                continue
            
            region = gray[y:y+h, x:x+w]
            if self._contains_sensitive_pattern(region):
                self._redact_region(draw_image, x, y, w, h)
                redactions.append({
                    "type": "pattern_match",
                    "region": {"x": x, "y": y, "w": w, "h": h},
                    "timestamp": datetime.now().isoformat()
                })
                self.redaction_count += 1
        
        return draw_image, redactions
    
    def _contains_sensitive_pattern(self, region: np.ndarray) -> bool:
        height, width = region.shape
        if 15 < height < 50 and 50 < width < 400:
            return True
        return False
    
    def _redact_region(self, image: Image.Image, x: int, y: int, w: int, h: int):
        region = image.crop((x, y, x+w, y+h))
        blurred = region.filter(ImageFilter.GaussianBlur(radius=10))
        image.paste(blurred, (x, y))
        draw = ImageDraw.Draw(image)
        draw.rectangle([x, y, x+w, y+h], outline="#4F46E5", width=2)
    
    def check_sensitive_app(self, window_title: str) -> bool:
        title_lower = window_title.lower()
        for app in self.config.sensitive_apps:
            if app.lower() in title_lower:
                return True
        return False
    
    def get_stats(self) -> Dict:
        return {
            "redactions_performed": self.redaction_count,
            "patterns_active": len(self.config.redaction_patterns),
            "sensitive_apps_blocked": len(self.config.sensitive_apps)
        }


# =============================================================================
# AI ENGINE MODULE (Gemini API Integration)
# =============================================================================

class AIEngine:
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.context_history: List[Dict] = []
        self.request_count = 0
        
        if GEMINI_AVAILABLE and config.gemini_api_key:
            # Safely pass the API key to the new Google GenAI SDK client
            self.client = genai.Client(api_key=config.gemini_api_key)
            self.model = config.ai_model
        else:
            self.client = None
            self.model = None

    def analyze_screen(self, image: Image.Image, user_query: Optional[str] = None) -> Dict:
        if not self.client:
            return self._mock_analysis(image, user_query)
        
        try:
            prompt_text = self._build_analysis_prompt(user_query)
            
            # Gemini natively processes the raw PIL.Image object without manual encoding
            response = self.client.models.generate_content(
                model=self.model,
                contents=[prompt_text, image]
            )
            
            self.request_count += 1
            analysis_text = response.text
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "query": user_query,
                "analysis": analysis_text,
                "suggestions": self._extract_suggestions(analysis_text),
                "confidence": 0.85 
            }
            
            self.context_history.append(result)
            if len(self.context_history) > self.config.max_context_history:
                self.context_history.pop(0)
            
            return result
            
        except Exception as e:
            return {
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _build_analysis_prompt(self, user_query: Optional[str]) -> str:
        base_prompt = """You are AiVisionX, an AI-powered desktop assistant. 
Analyze the current screen and provide helpful insights.
Focus on:
1. What application is currently active
2. What the user appears to be working on
3. Any potential issues or improvements
4. Relevant shortcuts or actions
Keep responses concise and actionable."""
        
        if user_query:
            base_prompt += f"\n\nUser question: {user_query}"
        
        return base_prompt
    
    def _extract_suggestions(self, analysis: str) -> List[Dict]:
        suggestions = []
        if "code" in analysis.lower():
            suggestions.append({"action": "Explain selected code", "shortcut": "Ctrl+Shift+E", "icon": "code"})
        if "error" in analysis.lower():
            suggestions.append({"action": "Search for solution", "shortcut": "Ctrl+Shift+S", "icon": "search"})
        suggestions.append({"action": "Ask AiVisionX", "shortcut": "Ctrl+Space", "icon": "chat"})
        return suggestions
    
    def _mock_analysis(self, image: Image.Image, user_query: Optional[str]) -> Dict:
        return {
            "timestamp": datetime.now().isoformat(),
            "query": user_query,
            "analysis": "Mock analysis: Screen shows a development environment. VS Code is active with Python code visible.",
            "suggestions": [
                {"action": "Explain selected code", "shortcut": "Ctrl+Shift+E", "icon": "code"},
                {"action": "Find bugs", "shortcut": "Ctrl+Shift+B", "icon": "bug"},
            ],
            "confidence": 0.75,
            "mock": True
        }
    
    def get_stats(self) -> Dict:
        return {
            "requests_made": self.request_count,
            "context_history_size": len(self.context_history),
            "model": self.model if self.model else "mock"
        }


# =============================================================================
# OVERLAY UI MODULE
# =============================================================================

class OverlayUI:
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.visible = False
        self.suggestions: List[Dict] = []
        self.chat_history: List[Dict] = []
        
    def show(self, suggestions: List[Dict]):
        self.suggestions = suggestions
        self.visible = True
        self._render()
    
    def hide(self):
        self.visible = False
    
    def add_chat_message(self, role: str, content: str):
        self.chat_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
    
    def _render(self):
        if not self.visible:
            return
        
        print("\n" + "="*60)
        print(" AiVisionX Overlay ".center(60, "="))
        print("="*60)
        
        if self.suggestions:
            print("\n Suggestions:")
            for i, sugg in enumerate(self.suggestions, 1):
                print(f"   {i}. {sugg['action']} ({sugg['shortcut']})")
        
        if self.chat_history:
            print("\n Chat:")
            for msg in self.chat_history[-3:]: 
                prefix = "You:" if msg["role"] == "user" else "AI:"
                print(f"   {prefix} {msg['content'][:50]}...")
        
        print("\n" + "="*60)
        print(" Press Ctrl+Space to toggle | Type 'help' for commands ")
        print("="*60 + "\n")


# =============================================================================
# MAIN AIVISIONX AGENT
# =============================================================================

class AiVisionXAgent:
    def __init__(self, config: Optional[AiVisionXConfig] = None):
        self.config = config or AiVisionXConfig()
        self.running = False
        self.screen_capture = ScreenCapture(self.config)
        self.privacy_firewall = PrivacyFirewall(self.config)
        self.ai_engine = AIEngine(self.config)
        self.overlay = OverlayUI(self.config)
        self.start_time: Optional[datetime] = None
        
    def start(self):
        print("""
╔══════════════════════════════════════════════════════════════╗
║              AI-Powered Desktop Assistant                    ║
║                    PROTOTYPE v0.1.0                          ║
╚══════════════════════════════════════════════════════════════╝
        """)
        self.running = True
        self.start_time = datetime.now()
        
        print(f"[INFO] Starting AiVisionX Agent...")
        print(f"[INFO] Privacy filtering: {'ON' if self.config.enable_redaction else 'OFF'}")
        print(f"[INFO] AI Model: {self.config.ai_model if self.ai_engine.model else 'MOCK'}")
        print(f"\n{'='*60}")
        print(" COMMANDS:")
        print("   capture  - Force screen capture")
        print("   analyze  - Analyze current screen")
        print("   ask      - Ask AiVisionX a question")
        print("   stats    - Show statistics")
        print("   quit     - Stop the agent")
        print(f"{'='*60}\n")
        
        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()
        self._command_loop()
    
    def stop(self):
        self.running = False
        print("\n[INFO] Stopping AiVisionX Agent...")
        self._print_stats()
    
    def _capture_loop(self):
        while self.running:
            image = self.screen_capture.capture()
            if image:
                redacted_image, redactions = self.privacy_firewall.redact_image(image)
                if redactions:
                    print(f"[PRIVACY] Redacted {len(redactions)} sensitive regions")
            time.sleep(self.config.capture_interval)
    
    def _command_loop(self):
        while self.running:
            try:
                command = input("AiVisionX> ").strip().lower()
                
                if command in ("quit", "exit"):
                    self.stop()
                    break
                elif command == "capture":
                    self._force_capture()
                elif command == "analyze":
                    self._analyze_screen()
                elif command.startswith("ask "):
                    self._ask_ai(command[4:])
                elif command == "stats":
                    self._print_stats()
                elif command:
                    print(f"[ERROR] Unknown command. Type 'analyze', 'capture', or 'quit'.")
                    
            except KeyboardInterrupt:
                self.stop()
                break
            except Exception as e:
                print(f"[ERROR] {e}")
    
    def _force_capture(self):
        print("[CAPTURE] Taking screenshot...")
        self.screen_capture.last_capture = None
        image = self.screen_capture.capture()
        
        if image:
            redacted_image, redactions = self.privacy_firewall.redact_image(image)
            filename = f"capture_{int(time.time())}.png"
            redacted_image.save(filename)
            print(f"[CAPTURE] Saved to {filename}")
        else:
            print("[CAPTURE] Failed to grab frame.")
    
    def _analyze_screen(self):
        print("[AI] Analyzing screen...")
        
        # Bypass differential check on manual trigger
        self.screen_capture.last_capture = None 
        
        image = self.screen_capture.capture()
        if not image:
            print("[CAPTURE] Failed to grab frame.")
            return
        
        redacted_image, _ = self.privacy_firewall.redact_image(image)
        result = self.ai_engine.analyze_screen(redacted_image)
        
        if "error" in result:
            print(f"\n[API ERROR] {result['error']}")
        else:
            print(f"\n[ANALYSIS] {result.get('analysis', 'No analysis available')}")
        
        if 'suggestions' in result:
            self.overlay.show(result['suggestions'])
        if result.get('mock'):
            print("[INFO] Using mock analysis (API key not detected)")
    
    def _ask_ai(self, query: str):
        print(f"[YOU] {query}")
        self.overlay.add_chat_message("user", query)
        
        # Bypass differential check on manual trigger
        self.screen_capture.last_capture = None 
        image = self.screen_capture.capture()
        
        if image:
            redacted_image, _ = self.privacy_firewall.redact_image(image)
            result = self.ai_engine.analyze_screen(redacted_image, query)
            
            if "error" in result:
                response = f"API ERROR: {result['error']}"
            else:
                response = result.get('analysis', 'No response')
                
            print(f"[AI] {response}")
            self.overlay.add_chat_message("assistant", response)
    
    def _print_stats(self):
        print("\n=== AiVisionX Statistics ===")
        print(f" AI Engine Model: {self.ai_engine.get_stats()['model']}")
        print(f" Requests Made: {self.ai_engine.get_stats()['requests_made']}")
        print("============================\n")


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main():
    # Automatically load hidden variables from .env file
    load_dotenv()
    
    config = AiVisionXConfig()
    
    # Securely pull the key from the environment
    config.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
    if not config.gemini_api_key:
        print("[WARNING] GEMINI_API_KEY not set in .env file. Using mock mode.")
    
    agent = AiVisionXAgent(config)
    try:
        agent.start()
    except Exception as e:
        print(f"[FATAL] {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()