from pynput import mouse
from pywinauto import Desktop, Application
import tkinter as tk
import threading

class ElementSelector:
    def __init__(self):
        self.last_control_properties = None

    def draw_highlight_rectangle(self, bounds):
        """Draw a highlight rectangle around the control."""
        overlay = tk.Tk()
        overlay.overrideredirect(True)  # Remove window decorations
        overlay.geometry(f"{bounds.width()}x{bounds.height()}+{bounds.left}+{bounds.top}")
        overlay.attributes("-alpha", 0.5)  # Set transparency
        overlay.attributes("-topmost", True)  # Keep the window on top

        # Draw a red rectangle
        canvas = tk.Canvas(overlay, bg="black", highlightthickness=0)
        canvas.pack(fill=tk.BOTH, expand=True)
        canvas.create_rectangle(
            0, 0, bounds.width(), bounds.height(),
            outline="red", width=4
        )

        # Close the overlay after 2 seconds
        overlay.after(2000, overlay.destroy)
        overlay.mainloop()

    def on_click(self, x, y, button, pressed):
        """Handle mouse click events."""
        if pressed:
            control = Desktop(backend='uia').from_point(x, y)
            bounds = control.element_info.rectangle
            bounds_dict = {
                "left": bounds.left,
                "top": bounds.top,
                "right": bounds.right,
                "bottom": bounds.bottom,
                "width": bounds.width(),
                "height": bounds.height()
            }

            self.last_control_properties = {
                "control_type": control.element_info.control_type,
                "automation_id": control.element_info.automation_id,
                "name": control.element_info.name,
                "value": control.get_value() if hasattr(control, 'get_value') else None,
                "bounds": bounds_dict
            }


            self.draw_highlight_rectangle(bounds)
            return False  # Stop listener

    def start_captureElement(self):
        """Start listening for mouse clicks."""
        self.last_control_properties = None
        def listen_for_clicks():
            with mouse.Listener(on_click=self.on_click) as listener:
                listener.join()
        threading.Thread(target=listen_for_clicks).start()

    def get_Elementproperties(self):
        """Get the properties of the last captured control."""
        if self.last_control_properties:
            return self.last_control_properties
        else:
            return {"status": "error", "message": "No control captured yet."}
        

    def click_element(self):
        if self.last_control:
            self.last_control.click_input()

    def right_click_element(self):
        if self.last_control:
            self.last_control.click_input(button='right')

    def double_click_element(self):
        if self.last_control:
            self.last_control.double_click_input()

    def type_into_element(self, text):
        if self.last_control:
            self.last_control.type_keys(text)

    def execute_action(self, action, keyboard_text=""):
        if not self.last_control:
            return {"status": "error", "message": "No element captured yet!"}

        action = action.lower()
        if action == "left click":
            self.click_element()
        elif action == "right click":
            self.right_click_element()
        elif action == "double left click":
            self.double_click_element()
        elif action == "double right click":
            self.double_click_element(button='right')
        elif action == "type" and keyboard_text:
            self.type_into_element(keyboard_text)
        else:
            return {"status": "error", "message": f"Unsupported action: {action}"}

        return {"status": "success", "message": f"Executed: {action}"}



# from pynput import mouse
# from pywinauto import Desktop, Application
# import tkinter as tk
# import threading
# import queue
# from dataclasses import dataclass
# from typing import Optional, Dict, Any

# @dataclass
# class ControlProperties:
#     control_type: str
#     automation_id: str
#     name: str
#     value: Optional[str]
#     bounds: Dict[str, int]
#     control: Any  # The actual pywinauto control object

# class ElementSelector:
#     def __init__(self):
#         self._last_control_properties = None
#         self._control_lock = threading.Lock()
#         self._click_event = queue.Queue(maxsize=1)
#         self._tk_root = None

#     def _run_tkinter(self, bounds):
#         """Run Tkinter in the main thread."""
#         self._tk_root = tk.Tk()
#         self._tk_root.overrideredirect(True)
#         self._tk_root.geometry(f"{bounds.width}x{bounds.height}+{bounds.left}+{bounds.top}")
#         self._tk_root.attributes("-alpha", 0.5)
#         self._tk_root.attributes("-topmost", True)
        
#         canvas = tk.Canvas(self._tk_root, bg="black", highlightthickness=0)
#         canvas.pack(fill=tk.BOTH, expand=True)
#         canvas.create_rectangle(
#             0, 0, bounds.width, bounds.height,
#             outline="red", width=4
#         )
        
#         self._tk_root.after(2000, self._tk_root.destroy)
#         self._tk_root.mainloop()
#         self._tk_root = None

#     def draw_highlight_rectangle(self, bounds):
#         """Draw a highlight rectangle around the control."""
#         if threading.current_thread() is threading.main_thread():
#             self._run_tkinter(bounds)
#         else:
#             # If not in main thread, use after() to schedule in main thread
#             if self._tk_root:
#                 self._tk_root.after(0, self._run_tkinter, bounds)

#     def on_click(self, x, y, button, pressed):
#         """Handle mouse click events."""
#         if pressed:
#             try:
#                 control = Desktop(backend='uia').from_point(x, y)
#                 bounds = control.element_info.rectangle
                    
#                 properties = ControlProperties(
#                     control_type=control.element_info.control_type,
#                     automation_id=control.element_info.automation_id,
#                     name=control.element_info.name,
#                     value=control.get_value() if hasattr(control, 'get_value') else None,
#                     bounds={
#                         "left": bounds.left,
#                         "top": bounds.top,
#                         "right": bounds.right,
#                         "bottom": bounds.bottom,
#                         "width": bounds.width(),
#                         "height": bounds.height()
#                     },
#                     control=control
#                 )
                
#                 with self._control_lock:
#                     self._last_control_properties = properties
                
#                 self.draw_highlight_rectangle(bounds)
#                 self._click_event.put(True)  # Signal that click was captured
#                 return False  # Stop listener
#             except Exception as e:
#                 print(f"Error capturing control: {e}")
#                 return False

#     def start_captureElement(self, timeout=10):
#         """Start listening for mouse clicks with timeout."""
#         self._last_control_properties = None
        
#         def listen_for_clicks():
#             with mouse.Listener(on_click=self.on_click) as listener:
#                 try:
#                     # Wait for click or timeout
#                     self._click_event.get(timeout=timeout)
#                 except queue.Empty:
#                     listener.stop()
        
#         threading.Thread(target=listen_for_clicks, daemon=True).start()

#     def get_Elementproperties(self):
#         """Get the properties of the last captured control."""
#         with self._control_lock:
#             if not self._last_control_properties:
#                 return {"status": "error", "message": "No control captured yet."}
            
#             # Convert the control properties to a serializable dictionary
#             props = {
#                 "control_type": self._last_control_properties.control_type,
#                 "automation_id": self._last_control_properties.automation_id,
#                 "name": self._last_control_properties.name,
#                 "value": self._last_control_properties.value,
#                 "bounds": self._last_control_properties.bounds,
#                 "status": "success"
#             }
            
#             return props

#     def execute_action(self, action, keyboard_text=""):
#         """Execute an action on the last captured control."""
#         with self._control_lock:
#             if not self._last_control_properties:
#                 return {"status": "error", "message": "No element captured yet!"}
            
#             control = self._last_control_properties.control
#             action = action.lower()
            
#             try:
#                 if action == "left click":
#                     control.click_input()
#                 elif action == "right click":
#                     control.click_input(button='right')
#                 elif action == "double click":
#                     control.double_click_input()
#                 elif action == "type" and keyboard_text:
#                     control.type_keys(keyboard_text)
#                 else:
#                     return {"status": "error", "message": f"Unsupported action: {action}"}
                
#                 return {"status": "success", "message": f"Executed: {action}"}
#             except Exception as e:
#                 return {"status": "error", "message": f"Action failed: {str(e)}"}