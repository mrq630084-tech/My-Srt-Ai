FROM python:3.9-slim

# System libraries များ ထည့်သွင်းခြင်း
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Python libraries များ ထည့်သွင်းခြင်း
RUN pip install --no-cache-dir -r requirements.txt

# Bot ကို စတင် Run ရန်
CMD ["python", "main.py"]
