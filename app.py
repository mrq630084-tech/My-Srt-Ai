from faster_whisper import WhisperModel
from flask import Flask, request, send_file
import os

app = Flask(__name__)

model = WhisperModel("small", compute_type="int8")

@app.route("/")
def home():
    return "SRT Generator Ready"

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["file"]
    filename = file.filename
    file.save(filename)

    segments, info = model.transcribe(filename)

    srt_file = filename + ".srt"

    with open(srt_file, "w", encoding="utf-8") as f:
        for i, segment in enumerate(segments, start=1):
            f.write(f"{i}\n")
            f.write(f"{segment.start} --> {segment.end}\n")
            f.write(segment.text + "\n\n")

    return send_file(srt_file, as_attachment=True)

app.run(host="0.0.0.0", port=7860)
