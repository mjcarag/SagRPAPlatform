import time
import pyautogui
import keyboard
import json
from pynput import mouse, keyboard as kb
from pywinauto import Desktop
import psutil
import os
from datetime import datetime
from typing import List, Dict, Any

class ActionRecorder:
    def __init__(self):
        self.actions: List[Dict[str, Any]] = []
        self.current_window = None
        self.last_window = None
        self.last_action_time = time.time()
        self.min_interval = 0.1  # Minimum time between actions
        self.output_dir = "recordings"
        os.makedirs(self.output_dir, exist_ok=True)
        
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
                "window": pyautogui.getActiveWindowTitle()
            }
            
            self.actions.append(action)
            self.last_action_time = time.time()

    def on_press(self, key):
        """Handle keyboard press events"""
        try:
            # Skip if it's a modifier key or too soon after last action
            if (time.time() - self.last_action_time) < self.min_interval:
                return
                
            key_str = key.char if hasattr(key, 'char') else str(key)
            
            # Skip modifier keys
            if key_str in ['Key.shift', 'Key.ctrl', 'Key.alt']:
                return
                
            action = {
                "type": "keypress",
                "key": key_str,
                "timestamp": time.time(),
                "window": pyautogui.getActiveWindowTitle()
            }
            
            self.actions.append(action)
            self.last_action_time = time.time()
            
        except AttributeError:
            pass

    def track_window_changes(self):
        """Track active window changes"""
        while True:
            current_window = pyautogui.getActiveWindowTitle()
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
        """Convert raw actions to simplified commands"""
        simplified = []
        
        for action in self.actions:
            if action['type'] == 'click':
                simplified.append({
                    "action_type": "click",
                    "button": action['button'].replace('Button.', '').lower(),
                    "element": action.get('element'),
                    "window": action['window']
                })
                
            elif action['type'] == 'keypress':
                simplified.append({
                    "action_type": "keystroke",
                    "key": action['key'],
                    "window": action['window']
                })
                
            elif action['type'] == 'window_change':
                simplified.append({
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

    def start_recording(self) -> List[Dict[str, Any]]:
        """Start recording session"""
        self.actions = []
        

        mouse_listener = mouse.Listener(on_click=self.on_click)
        mouse_listener.start()
        kb_listener = kb.Listener(on_press=self.on_press)
        kb_listener.start()

        import threading
        window_thread = threading.Thread(
            target=self.track_window_changes, 
            daemon=True
        )
        window_thread.start()

        print("Recording started. Press 'Esc' to stop.")
        keyboard.wait('esc')
        
        mouse_listener.stop()
        kb_listener.stop()
        
        return self._simplify_actions()

if __name__ == "__main__":
    recorder = ActionRecorder()
    recording = recorder.start_recording()
    saved_path = recorder.save_recording()
    print(f"Recording saved to: {saved_path}")