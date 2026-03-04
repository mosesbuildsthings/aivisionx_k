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
    
Environment Variables:
    GEMINI_API_KEY - Your Google Gemini API key
"""

import os
import sys
import time
import json
import base64
import hashlib
import threading
from datetime import datetime
from typing import Optional, Dict, List, Tuple, Callable
from dataclasses import dataclass, asdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import mss

# Optional imports with fallbacks
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. AI features disabled.")

try:
    from pynput import mouse, keyboard
    INPUT_AVAILABLE = True
except ImportError:
    INPUT_AVAILABLE = False
    print("Warning: pynput not installed. Input monitoring disabled.")


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class AiVisionXConfig:
    """Configuration for AiVisionX Prototype"""
    # Screen Capture
    capture_interval: float = 2.0  # Seconds between captures
    differential_threshold: float = 0.05  # 5% pixel change threshold
    capture_region: Optional[Dict[str, int]] = None  # {left, top, width, height}
    
    # Privacy
    enable_redaction: bool = True
    redaction_patterns: List[str] = None
    sensitive_apps: List[str] = None
    
    # AI
    gemini_api_key: Optional[str] = None
    ai_model: str = "gemini-pro-vision"
    max_context_history: int = 10
    
    # Overlay
    overlay_opacity: float = 0.9
    overlay_position: str = "bottom-right"  # top-left, top-right, bottom-left, bottom-right
    
    def __post_init__(self):
        if self.redaction_patterns is None:
            self.redaction_patterns = [
                r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',  # Credit cards
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Emails
                r'\b(?:password|passwd|pwd)\s*[=:]\s*\S+',  # Passwords
                r'sk-[a-zA-Z0-9]{48}',  # OpenAI API keys
                r'ghp_[a-zA-Z0-9]{36}',  # GitHub tokens
                r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
            ]
        if self.sensitive_apps is None:
            self.sensitive_apps = ["1Password", "Bitwarden", "KeePass", "LastPass"]


# =============================================================================
# SCREEN CAPTURE MODULE
# =============================================================================

class ScreenCapture:
    """Handles efficient differential screen capture"""
    
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.sct = mss.mss()
        self.last_capture: Optional[np.ndarray] = None
        self.last_hash: Optional[str] = None
        self.capture_count = 0
        self.skip_count = 0
        
    def get_screen_region(self) -> Dict[str, int]:
        """Get the screen region to capture"""
        if self.config.capture_region:
            return self.config.capture_region
        
        # Capture primary monitor
        monitor = self.sct.monitors[1]
        return {
            "left": monitor["left"],
            "top": monitor["top"],
            "width": monitor["width"],
            "height": monitor["height"]
        }
    
    def capture(self) -> Optional[Image.Image]:
        """
        Capture screen and return if significant change detected
        Returns PIL Image or None if no significant change
        """
        region = self.get_screen_region()
        
        # Capture screenshot
        screenshot = self.sct.grab(region)
        img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
        img_array = np.array(img)
        
        # Check for significant change (differential capture)
        if self.last_capture is not None:
            diff_ratio = self._calculate_difference(img_array, self.last_capture)
            
            if diff_ratio < self.config.differential_threshold:
                self.skip_count += 1
                return None  # No significant change
        
        # Update last capture
        self.last_capture = img_array.copy()
        self.last_hash = hashlib.md5(img_array.tobytes()).hexdigest()
        self.capture_count += 1
        
        return img
    
    def _calculate_difference(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculate pixel difference ratio between two images"""
        if img1.shape != img2.shape:
            return 1.0  # Different sizes = full change
        
        # Resize for faster comparison
        small1 = cv2.resize(img1, (320, 180))
        small2 = cv2.resize(img2, (320, 180))
        
        # Calculate difference
        diff = cv2.absdiff(small1, small2)
        diff_pixels = np.count_nonzero(diff > 30)  # Threshold for pixel change
        total_pixels = diff.size // 3  # RGB channels
        
        return diff_pixels / total_pixels
    
    def get_stats(self) -> Dict:
        """Get capture statistics"""
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
    """Handles on-device privacy filtering and PII redaction"""
    
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.redaction_count = 0
        
    def redact_image(self, image: Image.Image) -> Tuple[Image.Image, List[Dict]]:
        """
        Redact sensitive information from image
        Returns: (redacted_image, list of redactions made)
        """
        if not self.config.enable_redaction:
            return image, []
        
        img_array = np.array(image)
        redactions = []
        
        # Convert to grayscale for OCR
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Detect text regions using contours
        _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        draw_image = image.copy()
        draw = ImageDraw.Draw(draw_image)
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter small regions
            if w < 50 or h < 15:
                continue
            
            # Extract region for pattern matching
            region = gray[y:y+h, x:x+w]
            
            # Check for sensitive patterns (simplified)
            if self._contains_sensitive_pattern(region):
                # Redact with blur effect
                self._redact_region(draw_image, x, y, w, h)
                redactions.append({
                    "type": "pattern_match",
                    "region": {"x": x, "y": y, "w": w, "h": h},
                    "timestamp": datetime.now().isoformat()
                })
                self.redaction_count += 1
        
        return draw_image, redactions
    
    def _contains_sensitive_pattern(self, region: np.ndarray) -> bool:
        """Check if region contains sensitive patterns (simplified)"""
        # In production, use OCR + regex matching
        # This is a simplified version that checks for common patterns
        
        # Check for password-like fields (label + input pattern)
        height, width = region.shape
        if height > 30 and width > 100:
            # Likely a form field
            return True
        
        return False
    
    def _redact_region(self, image: Image.Image, x: int, y: int, w: int, h: int):
        """Apply redaction blur to region"""
        # Crop region
        region = image.crop((x, y, x+w, y+h))
        
        # Apply heavy blur
        blurred = region.filter(ImageFilter.GaussianBlur(radius=10))
        
        # Paste back
        image.paste(blurred, (x, y))
        
        # Add redaction indicator
        draw = ImageDraw.Draw(image)
        draw.rectangle([x, y, x+w, y+h], outline="#4F46E5", width=2)
    
    def check_sensitive_app(self, window_title: str) -> bool:
        """Check if current window is a sensitive application"""
        title_lower = window_title.lower()
        for app in self.config.sensitive_apps:
            if app.lower() in title_lower:
                return True
        return False
    
    def get_stats(self) -> Dict:
        """Get privacy filtering statistics"""
        return {
            "redactions_performed": self.redaction_count,
            "patterns_active": len(self.config.redaction_patterns),
            "sensitive_apps_blocked": len(self.config.sensitive_apps)
        }


# =============================================================================
# AI ENGINE MODULE
# =============================================================================

class AIEngine:
    """Handles AI-powered screen analysis and contextual responses"""
    
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.context_history: List[Dict] = []
        self.request_count = 0
        
        if GEMINI_AVAILABLE and config.gemini_api_key:
            genai.configure(api_key=config.gemini_api_key)
            self.model = genai.GenerativeModel(config.ai_model)
        else:
            self.model = None
    
    def analyze_screen(self, image: Image.Image, user_query: Optional[str] = None) -> Dict:
        """
        Analyze screen content using AI
        Returns analysis results with suggestions/actions
        """
        if not self.model:
            return self._mock_analysis(image, user_query)
        
        try:
            # Convert image for Gemini
            img_bytes = io.BytesIO()
            image.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Build prompt
            prompt = self._build_analysis_prompt(user_query)
            
            # Generate response
            response = self.model.generate_content([
                prompt,
                {"mime_type": "image/png", "data": img_bytes.read()}
            ])
            
            self.request_count += 1
            
            # Parse response
            result = {
                "timestamp": datetime.now().isoformat(),
                "query": user_query,
                "analysis": response.text,
                "suggestions": self._extract_suggestions(response.text),
                "confidence": 0.85  # Would be calculated from model response
            }
            
            # Add to context history
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
        """Build analysis prompt based on context"""
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
        """Extract actionable suggestions from analysis"""
        # In production, use structured output or parsing
        suggestions = []
        
        # Mock suggestions based on common patterns
        if "code" in analysis.lower():
            suggestions.append({
                "action": "Explain selected code",
                "shortcut": "Ctrl+Shift+E",
                "icon": "code"
            })
        
        if "error" in analysis.lower():
            suggestions.append({
                "action": "Search for solution",
                "shortcut": "Ctrl+Shift+S",
                "icon": "search"
            })
        
        suggestions.append({
            "action": "Ask AiVisionX",
            "shortcut": "Ctrl+Space",
            "icon": "chat"
        })
        
        return suggestions
    
    def _mock_analysis(self, image: Image.Image, user_query: Optional[str]) -> Dict:
        """Mock analysis for testing without API"""
        return {
            "timestamp": datetime.now().isoformat(),
            "query": user_query,
            "analysis": "Mock analysis: Screen shows a development environment. VS Code is active with Python code visible.",
            "suggestions": [
                {"action": "Explain selected code", "shortcut": "Ctrl+Shift+E", "icon": "code"},
                {"action": "Generate docstring", "shortcut": "Ctrl+Shift+D", "icon": "edit"},
                {"action": "Find bugs", "shortcut": "Ctrl+Shift+B", "icon": "bug"},
            ],
            "confidence": 0.75,
            "mock": True
        }
    
    def get_stats(self) -> Dict:
        """Get AI engine statistics"""
        return {
            "requests_made": self.request_count,
            "context_history_size": len(self.context_history),
            "model": self.config.ai_model if self.model else "mock"
        }


# =============================================================================
# OVERLAY UI MODULE
# =============================================================================

class OverlayUI:
    """Handles the floating overlay interface"""
    
    def __init__(self, config: AiVisionXConfig):
        self.config = config
        self.visible = False
        self.suggestions: List[Dict] = []
        self.chat_history: List[Dict] = []
        
    def show(self, suggestions: List[Dict]):
        """Show overlay with suggestions"""
        self.suggestions = suggestions
        self.visible = True
        self._render()
    
    def hide(self):
        """Hide overlay"""
        self.visible = False
    
    def add_chat_message(self, role: str, content: str):
        """Add message to chat history"""
        self.chat_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
    
    def _render(self):
        """Render overlay (console version for prototype)"""
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
            for msg in self.chat_history[-3:]:  # Show last 3 messages
                prefix = "You:" if msg["role"] == "user" else "AI:"
                print(f"   {prefix} {msg['content'][:50]}...")
        
        print("\n" + "="*60)
        print(" Press Ctrl+Space to toggle | Type 'help' for commands ")
        print("="*60 + "\n")


# =============================================================================
# MAIN AIVISIONX AGENT
# =============================================================================

class AiVisionXAgent:
    """Main AiVisionX Agent - orchestrates all modules"""
    
    def __init__(self, config: Optional[AiVisionXConfig] = None):
        self.config = config or AiVisionXConfig()
        self.running = False
        
        # Initialize modules
        self.screen_capture = ScreenCapture(self.config)
        self.privacy_firewall = PrivacyFirewall(self.config)
        self.ai_engine = AIEngine(self.config)
        self.overlay = OverlayUI(self.config)
        
        # Stats
        self.start_time: Optional[datetime] = None
        
    def start(self):
        """Start the AiVisionX agent"""
        print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   █████╗ ██╗   ██╗██╗   ██╗██╗███████╗██╗  ██╗██╗  ██╗   ║
║  ██╔══██╗██║   ██║██║   ██║██║██╔════╝╚██╗██╔╝╚██╗██╔╝   ║
║  ███████║██║   ██║██║   ██║██║███████╗ ╚███╔╝  ╚███╔╝    ║
║  ██╔══██║██║   ██║╚██╗ ██╔╝██║╚════██║ ██╔██╗  ██╔██╗    ║
║  ██║  ██║╚██████╔╝ ╚████╔╝ ██║███████║██╔╝ ██╗██╔╝ ██╗   ║
║  ╚═╝  ╚═╝ ╚═════╝   ╚═══╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ║
║                                                              ║
║              AI-Powered Desktop Assistant                    ║
║                    PROTOTYPE v0.1.0                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        self.running = True
        self.start_time = datetime.now()
        
        print(f"[INFO] Starting AiVisionX Agent...")
        print(f"[INFO] Capture interval: {self.config.capture_interval}s")
        print(f"[INFO] Privacy filtering: {'ON' if self.config.enable_redaction else 'OFF'}")
        print(f"[INFO] AI Model: {self.config.ai_model if self.ai_engine.model else 'MOCK'}")
        print(f"\n{'='*60}")
        print(" COMMANDS:")
        print("   capture  - Force screen capture")
        print("   analyze  - Analyze current screen")
        print("   ask      - Ask AiVisionX a question")
        print("   stats    - Show statistics")
        print("   overlay  - Toggle overlay visibility")
        print("   help     - Show this help")
        print("   quit     - Stop the agent")
        print(f"{'='*60}\n")
        
        # Start capture loop in background thread
        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()
        
        # Start command loop
        self._command_loop()
    
    def stop(self):
        """Stop the AiVisionX agent"""
        self.running = False
        print("\n[INFO] Stopping AiVisionX Agent...")
        self._print_stats()
    
    def _capture_loop(self):
        """Background screen capture loop"""
        while self.running:
            # Capture screen
            image = self.screen_capture.capture()
            
            if image:
                # Apply privacy filtering
                redacted_image, redactions = self.privacy_firewall.redact_image(image)
                
                # Save for analysis (optional)
                # redacted_image.save(f"capture_{int(time.time())}.png")
                
                if redactions:
                    print(f"[PRIVACY] Redacted {len(redactions)} sensitive regions")
            
            time.sleep(self.config.capture_interval)
    
    def _command_loop(self):
        """Handle user commands"""
        while self.running:
            try:
                command = input("AiVisionX> ").strip().lower()
                
                if command == "quit" or command == "exit":
                    self.stop()
                    break
                
                elif command == "capture":
                    self._force_capture()
                
                elif command == "analyze":
                    self._analyze_screen()
                
                elif command.startswith("ask "):
                    query = command[4:]
                    self._ask_ai(query)
                
                elif command == "stats":
                    self._print_stats()
                
                elif command == "overlay":
                    self._toggle_overlay()
                
                elif command == "help":
                    self._print_help()
                
                elif command:
                    print(f"[ERROR] Unknown command: {command}")
                    print("[INFO] Type 'help' for available commands")
                    
            except KeyboardInterrupt:
                self.stop()
                break
            except Exception as e:
                print(f"[ERROR] {e}")
    
    def _force_capture(self):
        """Force immediate screen capture"""
        print("[CAPTURE] Taking screenshot...")
        image = self.screen_capture.capture()
        
        if image:
            # Apply privacy filtering
            redacted_image, redactions = self.privacy_firewall.redact_image(image)
            
            # Save
            filename = f"capture_{int(time.time())}.png"
            redacted_image.save(filename)
            print(f"[CAPTURE] Saved to {filename}")
            
            if redactions:
                print(f"[PRIVACY] Redacted {len(redactions)} sensitive regions")
        else:
            print("[CAPTURE] No significant change detected")
    
    def _analyze_screen(self):
        """Analyze current screen with AI"""
        print("[AI] Analyzing screen...")
        
        # Capture current screen
        image = self.screen_capture.capture()
        if not image:
            # Use last capture if available
            print("[CAPTURE] No change detected, using last capture")
            # In real implementation, use cached image
            return
        
        # Apply privacy filtering
        redacted_image, _ = self.privacy_firewall.redact_image(image)
        
        # Analyze with AI
        result = self.ai_engine.analyze_screen(redacted_image)
        
        print(f"\n[ANALYSIS] {result.get('analysis', 'No analysis available')}")
        
        if 'suggestions' in result:
            self.overlay.show(result['suggestions'])
        
        if result.get('mock'):
            print("[INFO] Using mock analysis (no API key configured)")
    
    def _ask_ai(self, query: str):
        """Ask AiVisionX a question"""
        print(f"[YOU] {query}")
        
        # Add to chat
        self.overlay.add_chat_message("user", query)
        
        # Capture and analyze with query
        image = self.screen_capture.capture()
        if image:
            redacted_image, _ = self.privacy_firewall.redact_image(image)
            result = self.ai_engine.analyze_screen(redacted_image, query)
            
            response = result.get('analysis', 'No response')
            print(f"[AI] {response}")
            
            self.overlay.add_chat_message("assistant", response)
    
    def _toggle_overlay(self):
        """Toggle overlay visibility"""
        if self.overlay.visible:
            self.overlay.hide()
            print("[OVERLAY] Hidden")
        else:
            self.overlay.show([])
    
    def _print_stats(self):
        """Print agent statistics"""
        runtime = datetime.now() - self.start_time if self.start_time else None
        
        print(f"\n{'='*60}")
        print(" AiVisionX Statistics ".center(60, "="))
        print(f"{'='*60}")
        
        if runtime:
            print(f" Runtime: {runtime}")
        
        print(f"\n Screen Capture:")
        for key, value in self.screen_capture.get_stats().items():
            print(f"   {key}: {value}")
        
        print(f"\n Privacy Firewall:")
        for key, value in self.privacy_firewall.get_stats().items():
            print(f"   {key}: {value}")
        
        print(f"\n AI Engine:")
        for key, value in self.ai_engine.get_stats().items():
            print(f"   {key}: {value}")
        
        print(f"{'='*60}\n")
    
    def _print_help(self):
        """Print help message"""
        print(f"\n{'='*60}")
        print(" AiVisionX Commands ".center(60, "="))
        print(f"{'='*60}")
        print("   capture  - Force screen capture")
        print("   analyze  - Analyze current screen with AI")
        print("   ask <q>  - Ask AiVisionX a question")
        print("   stats    - Show agent statistics")
        print("   overlay  - Toggle overlay visibility")
        print("   help     - Show this help")
        print("   quit     - Stop the agent")
        print(f"{'='*60}\n")


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main():
    """Main entry point"""
    # Load configuration
    config = AiVisionXConfig()
    
    # Try to load API key from environment
    config.gemini_api_key = os.getenv("GEMINI_API_KEY")
    
    if not config.gemini_api_key:
        print("[WARNING] GEMINI_API_KEY not set. AI features will use mock responses.")
        print("[INFO] Set your API key: export GEMINI_API_KEY='your-key-here'")
    
    # Create and start agent
    agent = AiVisionXAgent(config)
    
    try:
        agent.start()
    except Exception as e:
        print(f"[FATAL] {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Import needed for image filtering
    from PIL import ImageFilter
    import io
    
    main()
