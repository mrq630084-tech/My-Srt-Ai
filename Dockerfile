FROM python:3.9-slim

# System dependency များတင်ခြင်း
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# CPU version သီးသန့်တင်ခြင်း
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "main.py"]
