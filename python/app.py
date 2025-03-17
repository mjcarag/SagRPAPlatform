
import os
from flask import Flask, render_template, send_from_directory, jsonify, request
import subprocess
import time
from flask_cors import CORS
import json
import pygetwindow as gw


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "static/screenshots"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

items = []

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
            ["python", "CaptureClicks.py", json.dumps(data)], 
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        return jsonify({"message": "Action started!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/capture_screenshot', methods=['GET'])
def capture_screenshot():
    """Trigger PyQt5 Snipping Tool and return a new filename."""
    timestamp = int(time.time())  # Unique filename
    screenshot_filename = f"snip_{timestamp}.png"
    screenshot_path = os.path.join(UPLOAD_FOLDER, screenshot_filename)

    # Run PyQt5 snipping tool and pass the filename as an argument
    subprocess.Popen(["python", "snip.py", screenshot_path])  

    return jsonify({"message": "Snipping tool started!", "filename": screenshot_filename})

@app.route('/get_screenshot/<filename>')
def get_screenshot(filename):
    """Serve the requested screenshot."""
    screenshot_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(screenshot_path):
        return send_from_directory(UPLOAD_FOLDER, filename)
    return "No screenshot available", 404

app.run(host="0.0.0.0", port=5000,  debug=True)