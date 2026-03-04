import os
from flask import Flask, request
import telebot

TOKEN = "8514932008:AAGX3GyNd-9t8GBEYHm7JYfEZlztxAJvr4A"

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

# start command
@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "SRT Bot Ready. Send me MP3.")

# receive audio
@bot.message_handler(content_types=['audio','voice','document'])
def handle_audio(message):
    bot.reply_to(message, "Processing...")

# webhook route
@app.route(f"/{TOKEN}", methods=["POST"])
def webhook():
    json_str = request.get_data().decode("UTF-8")
    update = telebot.types.Update.de_json(json_str)
    bot.process_new_updates([update])
    return "ok", 200

# home route
@app.route("/")
def home():
    return "SRT Bot Running"

if __name__ == "__main__":
    bot.remove_webhook()
    bot.set_webhook(url=f"https://waigyi-srt.up.railway.app/{TOKEN}")

    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
