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
        elif action == "double click":
            self.double_click_element()
        elif action == "type" and keyboard_text:
            self.type_into_element(keyboard_text)
        else:
            return {"status": "error", "message": f"Unsupported action: {action}"}

        return {"status": "success", "message": f"Executed: {action}"}