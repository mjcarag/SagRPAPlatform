import pygetwindow as gw
import time
import threading
from pynput import mouse, keyboard as pynput_keyboard
import json
import os
from datetime import datetime
from typing import List, Dict, Any
from pywinauto import Desktop
class ActionRecorder:
    def __init__(self):
        self.actions: List[Dict[str, Any]] = []
        self.current_window = None
        self.last_window = None
        self.last_action_time = time.time()
        self.min_interval = 0.1
        self.output_dir = "recordings"
        os.makedirs(self.output_dir, exist_ok=True)
        self.stop_event = threading.Event()
        self.is_recording = False

    def _get_active_window_title(self):
        """Safe method to get active window title"""
        try:
            active_window = gw.getActiveWindow()
            return active_window.title if active_window else "Unknown"
        except Exception:
            return "Unknown"

    def _get_element_properties(self, x: int, y: int) -> Dict[str, Any]:
        """Get UI element properties at given coordinates"""
        try:
            control = Desktop(backend='uia').from_point(x, y)
            bounds = control.element_info.rectangle
            return {
                "control_type": control.element_info.control_type,
                "automation_id": control.element_info.automation_id,
                "name": control.element_info.name,
                "bounds": {
                    "left": bounds.left,
                    "top": bounds.top,
                    "right": bounds.right,
                    "bottom": bounds.bottom,
                    "width": bounds.width(),
                    "height": bounds.height()
                }
            }
        except Exception as e:
            print(f"Could not get element properties: {str(e)}")
            return None

    def on_click(self, x: int, y: int, button, pressed: bool):
        """Handle mouse click events"""
        if pressed and (time.time() - self.last_action_time) > self.min_interval:
            element_props = self._get_element_properties(x, y)
            
            action = {
                "type": "click",
                "button": str(button),
                "position": {"x": x, "y": y},
                "timestamp": time.time(),
                "element": element_props,
                "window": self._get_active_window_title()
            }
            
            self.actions.append(action)
            self.last_action_time = time.time()

    def on_press(self, key):
        """Handle keyboard press events"""
        try:
            if (time.time() - self.last_action_time) < self.min_interval:
                return
                
            key_str = key.char if hasattr(key, 'char') else str(key)
            
            if key_str in ['Key.shift', 'Key.ctrl', 'Key.alt']:
                return
                
            action = {
                "type": "keypress",
                "key": key_str,
                "timestamp": time.time(),
                "window": self._get_active_window_title()
            }
            
            self.actions.append(action)
            self.last_action_time = time.time()
            
        except AttributeError:
            pass

    def track_window_changes(self):
        """Track active window changes"""
        while self.is_recording and not self.stop_event.is_set():
            current_window = self._get_active_window_title()
            if current_window and current_window != self.last_window:
                action = {
                    "type": "window_change",
                    "window": current_window,
                    "timestamp": time.time()
                }
                self.actions.append(action)
                self.last_window = current_window
            time.sleep(0.5)

    def _simplify_actions(self) -> List[Dict[str, Any]]:
        """Convert raw actions to simplified commands with IDs"""
        simplified = []
        
        for index, action in enumerate(self.actions):
            action_id = f"rec-{index}-{int(time.time())}"
            
            if action['type'] == 'click':
                simplified_click = {
                    "id": action_id,
                    "action_type": "Coordinates",
                    "button": action['button'].replace('Button.', '').lower(),
                    "window": action['window'],
                    "coord": {
                        "x": action['position']['x'],
                        "y": action['position']['y']
                    },
                    "action": "left click" if "left" in action['button'].lower() else "right click"
                }
                element = action.get('element')
                if element and element.get('automation_id'):
                    simplified_click["element"] = element
            
                simplified.append(simplified_click)
                    
            elif action['type'] == 'keypress':
                simplified.append({
                    "id": action_id,
                    "action_type": "keystroke",
                    "key": action['key'],
                    "window": action['window']
                })
                
            elif action['type'] == 'window_change':
                simplified.append({
                    "id": action_id,
                    "action_type": "activate_window",
                    "window": action['window']
                })
            
        return simplified

    def save_recording(self, filename: str = None) -> str:
        """Save recording to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"recording_{timestamp}.json"
            
        filepath = os.path.join(self.output_dir, filename)
        simplified = self._simplify_actions()
        
        with open(filepath, 'w') as f:
            json.dump(simplified, f, indent=2)
            
        return filepath

    def start_recording(self, stop_event: threading.Event):
        """Start recording session"""
        self.stop_event = stop_event
        self.is_recording = True
        self.actions = []
        
        # Start listeners
        mouse_listener = mouse.Listener(on_click=self.on_click)
        mouse_listener.start()
        
        kb_listener = pynput_keyboard.Listener(on_press=self.on_press)
        kb_listener.start()

        # Start window tracker
        window_thread = threading.Thread(
            target=self.track_window_changes, 
            daemon=True
        )
        window_thread.start()

        print("Recording started. Waiting for stop signal...")
        
        while self.is_recording and not self.stop_event.is_set():
            time.sleep(0.1)
        
        # Clean up
        mouse_listener.stop()
        kb_listener.stop()
        window_thread.join(timeout=1)
        
        print("Recording stopped")
        return self._simplify_actions()

    def stop_recording(self):
        """Signal to stop recording"""
        self.is_recording = False