import os
import telebot
from flask import Flask, request

TOKEN = "8514932008:AAGX3GyNd-9t8GBEYHm7JYfEZlztxAJvr4A"

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "SRT Bot Ready ✅\nSend MP3 or Video")

@app.route(f"/{TOKEN}", methods=["POST"])
def webhook():
    json_str = request.get_data().decode("UTF-8")
    update = telebot.types.Update.de_json(json_str)
    bot.process_new_updates([update])
    return "OK", 200

@app.route("/")
def home():
    return "SRT AI Bot Running ✅"

if __name__ == "__main__":
    bot.remove_webhook()
    bot.set_webhook(url="https://my-srt-ai-production-85f3.up.railway.app/" + TOKEN)

    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
