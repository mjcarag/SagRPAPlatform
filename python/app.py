
import os
from flask import Flask, render_template, send_from_directory, jsonify, request
import subprocess
import time
from flask_cors import CORS
import json
import pygetwindow as gw
import pyautogui
from scripts.ElementSelector import ElementSelector
from pymongo import MongoClient
import uuid

app = Flask(__name__)
CORS(app)
element_selector = ElementSelector()


client = MongoClient("mongodb+srv://carjlight:fx8njvXcaY9L29nS@bbcluster.fd7s6.mongodb.net/?retryWrites=true&w=majority&appName=BBCluster")
db = client["BB_DB"]
collection = db["BB_Data"]


UPLOAD_FOLDER = "static/screenshots"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

items = []

@app.route('/start-captureElement', methods=['POST','GET'])
def captureElement():
    data = request.json
    app_window = gw.getWindowsWithTitle(data['window'])[0]
    print(app_window)
    app_window.activate()
    time.sleep(1)
    element_selector.start_captureElement()
    return jsonify({"status": "success", "message": "Listening for mouse clicks..."})

@app.route('/get-Elementproperties', methods=['GET'])
def get_Elementproperties():
    properties = element_selector.get_Elementproperties()
    return jsonify(properties)

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.json
    new_item = {"id": str(len(items) + 1), "content": data['content']}
    items.append(new_item)
    return jsonify(new_item)

@app.route('/window-titles', methods=['GET'])
def get_window_titles():
    windows = gw.getAllTitles()
    filtered_windows = [title for title in windows if title]  # Remove empty titles
    return jsonify({"titles": filtered_windows})

@app.route('/api/fetchitems', methods=['GET', 'POST'])
def fetch_item():
    return jsonify(items)

@app.route('/Controls', methods=['GET', 'POST'])
def Controls():
    data = request.json  # Get JSON data from request

    if not data:
        return jsonify({"error": "No data received"}), 400

    try:
        # Convert JSON data to a string and pass it as an argument
        
        process = subprocess.Popen(
            ["python", "scripts/CaptureClicks.py", json.dumps(data)], 
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        stdout, stderr = process.communicate()
        print(f"📥 Subprocess Output:\n{stdout}")
        print(f"📤 Subprocess Error:\n{stderr}")

        return jsonify({"message": "Action started!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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


app.run(host="0.0.0.0", port=5000,  debug=True)