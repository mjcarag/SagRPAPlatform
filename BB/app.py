
import os
from flask import Flask, render_template, send_from_directory, jsonify
import subprocess
import time

app = Flask(__name__)

UPLOAD_FOLDER = "static/screenshots"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def hello_world():
    return render_template('Home.html')


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