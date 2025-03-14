import cv2
import numpy as np
import pyautogui
import pygetwindow as gw
import mss
import time
import json
import sys
import os
 
def Capture_Click(imagePath,app_title,clickType):
    FileName = os.path.basename(imagePath)
    imageFilePath = os.path.join(os.getcwd(), "static", "screenshots", FileName)
    print(imageFilePath)
    button = cv2.imread(imageFilePath, cv2.IMREAD_GRAYSCALE)  # Image of the button
    app_window = gw.getWindowsWithTitle(app_title)[0]
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
 
 
# if __name__ == "__main__":
#     # Capture_Click('D:\Office Works\VSC\PyAutoGUI\Screenshot\Menu.png','Home - Workday','left',False)
#     # time.sleep(2)
#     # Capture_Click('D:\Office Works\VSC\PyAutoGUI\Screenshot\expenseHub.png','Home - Workday','left',False)
#     # time.sleep(2)
#     # Capture_Click('D:\Office Works\VSC\PyAutoGUI\Screenshot\expenseReport.png','Overview - Workday','left',False)
#     # time.sleep(2)
#     # Capture_Click('D:\Office Works\VSC\PyAutoGUI\Screenshot\expenseCreateReport.png','My Expense Reports - Workday','left',False)
#     time.sleep(5)
#     with open(r'D:\Office Works\VSC\RPAUI\react-bb\python\static\Testing\test.json') as json_file:
#             data = json.load(json_file)
#             for item in data['screenshots']:
#                 Capture_Click(
#                     item['path'],
#                     item['title'],
#                     item['position'],
#                     item['visible']
#                 )
#                 time.sleep(2)

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

def simulate_keystrokes(keys):
    key_sequence = [key.strip() for key in keys.split('+')]

    for key in key_sequence:
        mapped_key = key_map.get(key.lower(), key)

        if len(key) == 1 or key.isalpha() or key.isspace(): #for typing
            print(f"Typing: {key}")
            pyautogui.write(key)
            # time.sleep(0.05)
        elif len(key_sequence) > 1:# for combokeys like ctrl+c
            
            mapped_keys = [key_map.get(k.lower(), k) for k in key_sequence]
            if all(mapped_keys):
                print(f"Holding combo: {mapped_keys}")
                for k in mapped_keys:
                    pyautogui.keyDown(k)
                time.sleep(0.1)
                for k in mapped_keys:
                    pyautogui.keyUp(k)
                break
        else:
            # Handle special keys (like "Enter", "Backspace", etc.)
            if mapped_key:
                pyautogui.press(mapped_key)


def main(jsondata):
    # with open(r'D:\Office Works\VSC\RPAUI\GithubBB\python\static\Testing\test.json') as json_file:
        # jdata = json.load(json_file)
        for item in jsondata['screenshots']:
            print (item['imagePath'])
            if item['action'] == 'click':
                Capture_Click(
                    item['imagePath'],
                    item['title'],
                    item['action']
                )
            elif item['action'] == 'type':
                simulate_keystrokes(item['keys'])
            time.sleep(2)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        json_string = sys.argv[1]
        data = json.loads(json_string)
        time.sleep(5)
        main(data)
    else:
        print("No JSON data provided!")