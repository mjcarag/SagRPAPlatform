import cv2
import numpy as np
import pyautogui
import pygetwindow as gw
import mss
import time
import json
import sys
import os

def activate_window(app_title):
    window = gw.getWindowsWithTitle(app_title)
    windows = gw.getAllTitles()
    print(windows)
    if window:
        app_window = window[0]

        if app_window.isMinimized:
            app_window.restore()
            time.sleep(1)

        for _ in range(3):  # Retry up to 3 times
            try:
                app_window.activate()
                time.sleep(0.3)
                if app_window.isActive:
                    return True
                app_window.minimize()
                time.sleep(0.2)
                app_window.restore()
                time.sleep(0.3)
                
            except Exception:
                time.sleep(0.5)
                continue

        # app_window.activate()
        # time.sleep(1)
def Mouse_Click(XCoordinates,YCoordinates,clickType):
    # pyautogui.click(XCoordinates, YCoordinates)
    pyautogui.moveTo(XCoordinates, YCoordinates)
    # pyautogui.click()
    if "left" in clickType.lower():
        # if doubleClick:
        if "double" in clickType.lower():
            pyautogui.doubleClick(button='left')
        else:
            pyautogui.click(button='left')
    # elif clickType == 'right':
    if "right" in clickType.lower():
        # if doubleClick:
        if "double" in clickType.lower():
            pyautogui.doubleClick(button='right')
        else:
            pyautogui.click(button='right')

def Capture_Click(imagePath,app_title,clickType):
    activate_window(app_title)
    # print(app_title)
    
    FileName = os.path.basename(imagePath)
    imageFilePath = os.path.join(os.getcwd(), "static", "screenshots", FileName)
    print(imageFilePath)
    button = cv2.imread(imageFilePath, cv2.IMREAD_GRAYSCALE)  # Image of the button
    app_window = gw.getWindowsWithTitle(app_title)[0]
    # print(app_window)
    with mss.mss() as sct:
        monitor = {
            "top": app_window.top,
            "left": app_window.left,
            "width": app_window.width,
            "height": app_window.height,
        }
        app_screenshot = np.array(sct.grab(monitor))
        app_screenshot_gray = cv2.cvtColor(app_screenshot, cv2.COLOR_BGR2GRAY)
    result_button = cv2.matchTemplate(app_screenshot_gray, button, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result_button)
    button_top_left = max_loc
    button_center_x = app_window.left + button_top_left[0] + (button.shape[1] // 2)
    button_center_y = app_window.top + button_top_left[1] + (button.shape[0] // 2)
    pyautogui.moveTo(button_center_x, button_center_y)
    # if clickType == 'left':
    if "left" in clickType.lower():
        # if doubleClick:
        if "double" in clickType.lower():
            pyautogui.doubleClick(button='left')
        else:
            pyautogui.click(button='left')
    # elif clickType == 'right':
    if "right" in clickType.lower():
        # if doubleClick:
        if "double" in clickType.lower():
            pyautogui.doubleClick(button='right')
        else:
            pyautogui.click(button='right')
    # pyautogui.click()
    print(f"Button clicked at: ({button_center_x}, {button_center_y})")
 

key_map = {
    "ctrl": "ctrl",
    "shift": "shift",
    "alt": "alt",
    "tab": "tab",
    "caps": "capslock",
    "esc": "esc",
    "enter": "enter",
    "space": "space",
    "backspace": "backspace",
    "delete": "delete",
    "home": "home",
    "end": "end",
    "pageup": "pageup",
    "pagedown": "pagedown",
    "print": "printscreen",
    "scroll": "scrolllock",
    "pause": "pause",
    "insert": "insert",
    "arrowup": "up",
    "arrowdown": "down",
    "arrowleft": "left",
    "arrowright": "right"
}

for i in range(1, 13):
    key_map[f"f{i}"] = f"f{i}"

# def simulate_keystrokes(keys):
#     print(f"Keys: {keys}")
#     key_sequence = [key.strip() for key in keys.split('+')]
#     print(f"Key sequence: {key_sequence}")
#     for key in key_sequence:
#         mapped_key = key_map.get(key.lower(), key)
#         print(f"Mapped key: {mapped_key}")
#         if len(key) == 1 or key.isalpha() or key.isspace(): #for typing
#             print(f"Typing: {key}")
#             pyautogui.write(key)
#             # time.sleep(0.05)
#         elif len(key_sequence) > 1:# for combokeys like ctrl+c
            
#             mapped_keys = [key_map.get(k.lower(), k) for k in key_sequence]
#             if all(mapped_keys):
#                 print(f"Holding combo: {mapped_keys}")
#                 for k in mapped_keys:
#                     pyautogui.keyDown(k)
#                 time.sleep(0.1)
#                 for k in mapped_keys:
#                     pyautogui.keyUp(k)
#                 break
#         else:
#             # Handle special keys (like "Enter", "Backspace", etc.)
#             if mapped_key:
#                 print(f"Pressing: {mapped_key}")
#                 pyautogui.write(mapped_key)

def simulate_keystrokes(keys):
    print(f"Keys: {keys}")
    key_sequence = [key.strip() for key in keys.split('+')]
    print(f"Key sequence: {key_sequence}")
    
    if len(key_sequence) > 1:
        mapped_keys = []
        for key in key_sequence:
            mapped_key = key_map.get(key.lower(), key)
            mapped_keys.append(mapped_key)
        
        print(f"Pressing combo: {'+'.join(mapped_keys)}")
        for key in mapped_keys:
            pyautogui.keyDown(key)
        for key in reversed(mapped_keys):
            pyautogui.keyUp(key)
    else:
        key = key_sequence[0]
        mapped_key = key_map.get(key.lower(), key)
        if len(key) == 1 or key.isalpha() or key.isspace():
            print(f"Typing: {key}")
            pyautogui.write(key)
        elif len(key) > 1:
            pyautogui.write(mapped_key)
        elif mapped_key:
            print(f"Pressing: {mapped_key}")
            pyautogui.press(mapped_key)


def main(jsondata):
    # with open(r'D:\Office Works\VSC\RPAUI\GithubBB\python\static\Testing\test.json') as json_file:
        # jsondata = json.load(json_file)
        print(jsondata)
        
        for item in jsondata:
            # print(item['imagePath'])
            image_path = item.get('imagePath')
            action = item.get('action')
            keyboard = item.get('keyboard')
            window = item.get('window')
            coordinates = item.get('coordinates')


            if keyboard:
                # activate_window(item['window'])
                # print(item['keyboard'])
                simulate_keystrokes(item['keyboard'])
            if action:
                if coordinates:
                    x = coordinates['x']
                    y = coordinates['y']
                    Mouse_Click(x, y, action)
                else:
                    Capture_Click(image_path, window, action)
            time.sleep(1)

if __name__ == "__main__":
    print(sys.argv)
    print('test')
    if len(sys.argv) > 1:
        json_string = sys.argv[1]
        data = json.loads(json_string)
        main(data)
    else:
        print("No JSON data provided!")