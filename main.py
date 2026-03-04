import telebot
import os
from faster_whisper import WhisperModel

TOKEN = os.getenv("BOT_TOKEN")

bot = telebot.TeleBot(TOKEN)

model = WhisperModel("small", compute_type="int8")

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "Video or audio send me. I will create SRT.")

@bot.message_handler(content_types=['audio','voice','video','document'])
def handle_file(message):

    file_info = bot.get_file(message.audio.file_id if message.audio else message.document.file_id)
    downloaded = bot.download_file(file_info.file_path)

    with open("input.mp3","wb") as f:
        f.write(downloaded)

    segments, info = model.transcribe("input.mp3")

    srt = ""
    i = 1

    for segment in segments:
        start = segment.start
        end = segment.end
        text = segment.text

        srt += f"{i}\n{start:.2f} --> {end:.2f}\n{text}\n\n"
        i += 1

    with open("output.srt","w",encoding="utf-8") as f:
        f.write(srt)

    bot.send_document(message.chat.id, open("output.srt","rb"))

bot.infinity_polling()
