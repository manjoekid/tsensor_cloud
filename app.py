from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_file
from werkzeug.security import generate_password_hash, check_password_hash
import os
import datetime
import csv

app = Flask(__name__,
            static_folder='static',
            template_folder='templates')
app.secret_key = 'your_secret_key'


@app.route('/')
def index():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    # Save the uploaded file to a desired location
    file.save('uploaded_files/' + file.filename)
    return 'File uploaded successfully'

@app.route('/teste')
def teste():
    return render_template('box-test.html')

if __name__ == '__main__':
    app.run(debug=False)

