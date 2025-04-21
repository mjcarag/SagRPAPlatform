
import os
from flask import Flask, render_template, send_from_directory, jsonify, request
import subprocess
import time
from flask_cors import CORS
import json
import pygetwindow as gw
import pyautogui
from scripts.ElementSelector import ElementSelector
from scripts.Recording import ActionRecorder
import threading
from pymongo import MongoClient
import uuid
from pywinauto import Desktop, Application
from pynput import keyboard as pynput_keyboard,mouse
import keyboard as keyboard_module
from bson.objectid import ObjectId

recorder = None
recording_thread = None
stop_event = threading.Event()


app = Flask(__name__)
CORS(app)
element_selector = ElementSelector()


SAVE_FOLDER = "recordings"
os.makedirs(SAVE_FOLDER, exist_ok=True)

USERS = {
    "admin": "ngao"
}

client = MongoClient("mongodb+srv://carjlight:fx8njvXcaY9L29nS@bbcluster.fd7s6.mongodb.net/?retryWrites=true&w=majority&appName=BBCluster")
db = client["BB_DB"]
collection = db["BB_Data"]
users_collection = db['BB_Users']

UPLOAD_FOLDER = "static/screenshots"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

items = []
listener = None
coordinates = {}

def on_click(x, y, button, pressed):
    global coordinates, listener
    if pressed:
        coordinates = {'x': x, 'y': y}
        if listener:
            listener.stop()

listener = mouse.Listener(on_click=on_click)
listener.start()

@app.route('/start-listen', methods=['GET'])
def start_listen():
    global listener
    coordinates.clear()
    listener = mouse.Listener(on_click=on_click)
    listener.start()

    listener.join()  # Wait for the click
    return jsonify(coordinates)

@app.route('/start-captureElement', methods=['POST','GET'])
def captureElement():
    data = request.json
    try:
        # Get all windows with matching title
        # windows = gw.getWindowsWithTitle(data['window'])
        app_window = gw.getWindowsWithTitle(data['window'])[0]
        if not app_window:
            return jsonify({"status": "error", "message": f"Window '{data['window']}' not found"}), 404
        
        # app_window = windows[0]
        # app_window = gw.getWindowsWithTitle(data['window'])[0]
        print(app_window)
        app_window.activate()
        

        try:
            if app_window.isMinimized:
                app_window.restore()
            app_window.activate()
            
            # Alternative activation method if the first fails
            if not app_window.isActive:
                app_window.minimize()
                app_window.restore()
                app_window.activate()
            
            time.sleep(1)  # Reduced wait time
        except Exception as e:
            return jsonify({
                "status": "error", 
                "message": f"Failed to activate window: {str(e)}"
            }), 500
    

        element_selector.start_captureElement()
        return jsonify({"status": "success", "message": "Listening for mouse clicks..."})

    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": f"Unexpected error: {str(e)}"
        }), 500

@app.route('/execute-action', methods=['POST'])
def execute_action():
    data = request.json
    app_window = gw.getWindowsWithTitle(data['window'])[0]
    print(app_window)
    app_window.activate()
    time.sleep(1)
    action = data.get("action", "")
    keyboard_text = data.get("keyboard", "")
    element_selector.execute_action(action, keyboard_text)

@app.route('/get-Elementproperties', methods=['GET'])
def get_Elementproperties():
    properties = element_selector.get_Elementproperties()
    return jsonify(properties)

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.json
    new_item = {"id": str(len(items) + 1), "content": data['content'], "actionType": data['actionType']}
    items.append(new_item)
    return jsonify(new_item)

@app.route('/api/Deleteitems', methods=['POST'])
def add_Deleteitems():
    data = request.json
    item_id = data.get("id")

    global items
    items = [item for item in items if item["id"] != item_id]
    return jsonify(items)

@app.route('/window-titles', methods=['GET'])
def get_window_titles():
    windows = gw.getAllTitles()
    filtered_windows = [title for title in windows if title]  # Remove empty titles
    return jsonify({"titles": filtered_windows})

@app.route('/api/fetchitems', methods=['GET', 'POST'])
def fetch_item():
    return jsonify(items)

# @app.route('/Controls', methods=['GET', 'POST'])
# def Controls():
#     data = request.json  # Get JSON data from request

#     if not data:
#         return jsonify({"error": "No data received"}), 400

#     try:
#         # Convert JSON data to a string and pass it as an argument
        
#         process = subprocess.Popen(
#             ["python", "scripts/CaptureClicks.py", json.dumps(data)], 
#             stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
#         )

#         stdout, stderr = process.communicate()
#         print(f"📥 Subprocess Output:\n{stdout}")
#         print(f"📤 Subprocess Error:\n{stderr}")

#         return jsonify({"message": "Action started!"})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@app.route('/Controls', methods=['POST'])
def Controls():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    try:
        data = request.get_json()
        
        # Validate the data structure
        if not isinstance(data, list):
            return jsonify({"error": "Expected an array of action items"}), 400

        results = []
        
        # Process each action item
        for item in data:
            try:
                # Validate required fields
                if not all(key in item for key in ['content', 'window']):
                    results.append({
                        "id": item.get('id', 'unknown'),
                        "status": "error",
                        "message": "Missing required fields"
                    })
                    continue

                window_title = item['window']
                action = item.get('action', '').lower()
                keyboard_text = item.get('keyboard', '')
                image_path = item.get('imagePath', '')
                content = item['content'].lower()
                coordinates = item.get('coordinates', None)
                # Activate the target window first
                try:
                    if not keyboard_text:
                        if window_title:
                            app_window = gw.getWindowsWithTitle(window_title)

                            if not app_window:
                                results.append({
                                    "id": item.get('id', 'unknown'),
                                    "status": "error",
                                    "message": f"Window '{window_title}' not found"
                                })
                                continue
                            
                            app_window[0].activate()

                    time.sleep(0.5)  # Small delay for window activation
                except Exception as e:
                    results.append({
                        "id": item.get('id', 'unknown'),
                        "status": "error",
                        "message": f"Failed to activate window: {str(e)}"
                    })
                    continue

                # Determine action type
                # For UIElement actions
                if "uielement" in content:
                    if not action:
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": "No action specified for UIElement"
                        })
                        continue
                    
                    try:
                        target_window = gw.getWindowsWithTitle(window_title)
                        if not target_window:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "error",
                                "message": f"Window '{window_title}' not found"
                            })
                            continue

                        target_window[0].activate()
                        time.sleep(0.5)
                        app = Application(backend="uia").connect(title=window_title)
                        automation_id = item.get('automationID', '')
                        print(automation_id)
                        if automation_id:
                            control = app.window(title=window_title).child_window(auto_id=automation_id)
                        # elif element_name:
                        #     control = app.window(title=window_title).child_window(title=element_name)
                        else:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "error",
                                "message": "No automation_id or element_name provided"
                            })
                            continue
                        
                        # Wait for the control to exist
                        control.wait('exists', timeout=5)

                        action = action.lower()
                        if action == "left click":
                            control.click_input()
                            action_message = "Left click"
                        elif action == "right click":
                            control.click_input(button='right')
                            action_message = "Right click"
                        elif action == "double left click":
                            control.double_click_input()
                            action_message = "Double click"
                        elif action == "double right click":
                            control.double_click_input(button='right')
                            action_message = "Double click"
                        elif action == "type" and keyboard_text:
                            control.type_keys(keyboard_text)
                            action_message = f"Typed '{keyboard_text}'"
                        else:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "error",
                                "message": f"Unsupported action: {action}"
                            })
                            continue
                        
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "success",
                            "message": f"Executed {action_message} on element"
                        })
                        
                    except Exception as e:
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": f"Failed to execute action: {str(e)}"
                        })
                        continue

                elif image_path:
                    # Image-based click action
                    if not action:
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": "No action specified for image click"
                        })
                        continue
                    
                    # Extract filename from path
                    filename = os.path.basename(image_path)
                    local_image_path = os.path.join(UPLOAD_FOLDER, filename)
                    
                    if not os.path.exists(local_image_path):
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": f"Image file not found: {filename}"
                        })
                        continue
                    
                    # Use CaptureClicks.py
                    try:
                        process = subprocess.Popen(
                            ["python", "scripts/CaptureClicks.py", json.dumps([{
                                "imagePath": local_image_path,
                                "window": window_title,
                                "action": action
                            }])],
                            stdout=subprocess.PIPE, 
                            stderr=subprocess.PIPE,
                            text=True
                        )
                        stdout, stderr = process.communicate()
                        if process.returncode != 0:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "error",
                                "message": "Image click failed",
                                "details": stderr
                            })
                        else:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "success",
                                "message": f"Executed {action} on image"
                            })
                    except Exception as e:
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": f"Image click failed: {str(e)}"
                        })

                elif keyboard_text:
                    # Keyboard action
                    if not keyboard_text.strip():
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": "No keyboard input specified"
                        })
                        continue
                    
                    # Use CaptureClicks.py
                    try:
                        process = subprocess.Popen(
                            ["python", "scripts/CaptureClicks.py", json.dumps([{
                                "window": window_title,
                                "keyboard": keyboard_text
                            }])],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True
                        )
                        stdout, stderr = process.communicate()
                        if process.returncode != 0:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "error",
                                "message": "Keyboard action failed",
                                "details": stderr
                            })
                        else:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "success",
                                "message": "Keyboard action executed"
                            })
                    except Exception as e:
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": f"Keyboard action failed: {str(e)}"
                        })
                elif coordinates:
                    try:
                        process = subprocess.Popen(
                            ["python", "scripts/CaptureClicks.py", json.dumps([{
                                "action": action,
                                "coordinates": coordinates,
                            }])],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True
                        )
                        stdout, stderr = process.communicate()
                        if process.returncode != 0:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "error",
                                "message": "failed to capture Coordinates",
                                "details": stderr
                            })
                        else:
                            results.append({
                                "id": item.get('id', 'unknown'),
                                "status": "success",
                                "message": "Click action executed" 
                            })
                    except Exception as e:
                        results.append({
                            "id": item.get('id', 'unknown'),
                            "status": "error",
                            "message": f"failed to capture Coordinates: {str(e)}"
                        })
                    

                else:
                    results.append({
                        "id": item.get('id', 'unknown'),
                        "status": "error",
                        "message": "Invalid action item - no valid action type detected"
                    })

                # Small delay between actions
                time.sleep(0.5)

            except Exception as e:
                results.append({
                    "id": item.get('id', 'unknown'),
                    "status": "error",
                    "message": f"Unexpected error processing item: {str(e)}"
                })

        # Check if any actions failed
        if any(result['status'] == 'error' for result in results):
            return jsonify({
                "status": "completed_with_errors",
                "results": results
            }), 207  # Multi-status
        else:
            return jsonify({
                "status": "success",
                "results": results
            })

    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 400
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route('/capture_screenshot', methods=['GET', 'POST'])
def capture_screenshot():
    data = request.json
    app_window = gw.getWindowsWithTitle(data['window'])[0]
    print(app_window)
    if app_window:
        app_window.activate()
        time.sleep(1)

    """Trigger PyQt5 Snipping Tool and return a new filename."""
    timestamp = int(time.time())  # Unique filename
    screenshot_filename = f"snip_{timestamp}.png"
    screenshot_path = os.path.join(UPLOAD_FOLDER, screenshot_filename)

    # Run PyQt5 snipping tool and pass the filename as an argument
    subprocess.Popen(["python", "scripts/snip.py", screenshot_path])  

    return jsonify({"message": "Snipping tool started!", "filename": screenshot_filename})

@app.route('/get_screenshot/<filename>')
def get_screenshot(filename):
    """Serve the requested screenshot."""
    screenshot_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(screenshot_path):
        return send_from_directory(UPLOAD_FOLDER, filename)
    return "No screenshot available", 404

@app.route('/api/save_Action', methods=['POST'])
def save_Action():
    data = request.json  # Parse JSON data
    if data:
        data['_id'] = str(uuid.uuid4())
        collection.insert_one(data)  # Save to MongoDB
        return jsonify({"message": "Data saved successfully!", "id": data['_id']}), 201
    return jsonify({"message": "Invalid data!"}), 400

@app.route('/api/save_Action_Json', methods=['POST'])
def save_Action_Json():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        # Save the JSON to a file
        project_name = list(data.keys())[0]
        filename = f"{project_name.replace(' ', '_')}.json"
        filepath = os.path.join(SAVE_FOLDER, filename)

        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

        return jsonify({"message": f"File '{filename}' saved successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/emptyDB', methods=['POST'])
def delete_db():
    collection.delete_many({})
    return jsonify({"message": "Removed!"}), 201
   
@app.route('/api/save_Project', methods=['POST'])
def save_Project():
    data = request.json  # Parse JSON data
    if data:
        data['_id'] = str(uuid.uuid4())
        collection.insert_one(data)  # Save to MongoDB
        return jsonify({"message": "Data saved successfully!", "id": data['_id']}), 201
    return jsonify({"message": "Invalid data!"}), 400

@app.route('/start-recording', methods=['POST'])
def start_recording():
    global recorder, recording_thread, stop_event
    
    if recorder is not None:
        return jsonify({"status": "error", "message": "Recording already in progress"}), 400
    
    stop_event = threading.Event()
    recorder = ActionRecorder()
    
    def recording_task():
        global recorder
        recorder.start_recording(stop_event)
    
    recording_thread = threading.Thread(target=recording_task)
    recording_thread.start()
    
    return jsonify({"status": "success", "message": "Recording started"})

@app.route('/stop-recording', methods=['POST'])
def stop_recording():
    global recorder, recording_thread, stop_event
    
    if recorder is None:
        return jsonify({"status": "error", "message": "No active recording"}), 400
    stop_event.set()
    if hasattr(recorder, 'stop_recording'):
        recorder.stop_recording()
    recording_thread.join(timeout=2)
    recording = []
    filename = None
    if hasattr(recorder, '_simplify_actions'):
        recording = recorder._simplify_actions()
    if hasattr(recorder, 'save_recording'):
        filename = recorder.save_recording()
    recorder = None
    recording_thread = None
    stop_event = None
    
    return jsonify({
        "status": "success",
        "message": "Recording stopped",
        "recording": recording,
        "filename": filename if filename else None
    })

@app.route('/get-recordings', methods=['GET'])
def get_recordings():
    import glob
    recordings = glob.glob("recordings/*.json")
    return jsonify({"recordings": recordings})
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    user = users_collection.find_one({"username": username})
    
    if user and user.get("password") == password:
        return jsonify({"success": True, 
            "user": {
            "username": user["username"],
            "role": user["role"]
        }})
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    # # Extract fields
    # first_name = data.get("first_name")
    # last_name = data.get("last_name")
    # username = data.get("username")
    # password = data.get("password")
    # role = data.get("role")
    # group = data.get("group")

    # Check if username already exists
    # if users_collection.find_one({"username": username}):
    #     return jsonify({"success": False, "message": "Username already exists"}), 409

    # Hash the password
    # hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create user document
    user_doc = {
        "first_name": "Carj Gilson",
        "last_name": "Concepcion",
        "username": "admin_run",
        "password": "ngao",
        "role": "Runner",
        "group": "Facets"
    }
    # Insert into MongoDB
    users_collection.insert_one(user_doc)

    return jsonify({"success": True, "message": "User registered successfully"})
 
@app.route('/api/load', methods=['POST'])
def load_data():
    data = request.get_json()
    item_id = data.get("id")

    try:
        result = collection.find_one({"_id": item_id})
        if result:
            result['_id'] = str(result['_id'])  # convert ObjectId to string
            return jsonify(result), 200
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route('/api/loadJson', methods=['POST'])
def load_dataJson():
    try:
        req_data = request.get_json()
        project_id = req_data.get("id")

        if not project_id:
            return jsonify({"error": "Missing project ID"}), 400

        # You can use ID as filename, or maintain a mapping if needed
        filename = f"{project_id}.json"  # Assuming ID is the filename (or change this logic)
        print(filename)
        filepath = os.path.join(SAVE_FOLDER, filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "Project not found"}), 404

        with open(filepath, "r") as f:
            project_data = json.load(f)

        for project_items in project_data.values():
            for item in project_items:
                items.append(item)
                
        return jsonify(project_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
app.run(host="0.0.0.0", port=5000,  debug=True)