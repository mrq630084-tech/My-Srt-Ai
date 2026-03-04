import os
import telebot
import whisper
import subprocess

TOKEN = os.environ.get("BOT_TOKEN")

bot = telebot.TeleBot(TOKEN)

print("Loading Whisper model...")
model = whisper.load_model("base")
print("Model Loaded ✅")

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "SRT Bot Ready ✅\nSend MP3 / Voice / Video")

def download_file(file_info):
    file = bot.download_file(file_info.file_path)
    path = "input"
    with open(path, "wb") as f:
        f.write(file)
    return path

def convert_to_wav(input_file):
    output = "audio.wav"
    subprocess.run(["ffmpeg","-y","-i",input_file,output])
    return output

def create_srt(result):

    srt = ""
    for i, seg in enumerate(result["segments"]):

        start = seg["start"]
        end = seg["end"]
        text = seg["text"]

        def format_time(t):
            h = int(t//3600)
            m = int((t%3600)//60)
            s = int(t%60)
            ms = int((t-int(t))*1000)
            return f"{h:02}:{m:02}:{s:02},{ms:03}"

        srt += f"{i+1}\n"
        srt += f"{format_time(start)} --> {format_time(end)}\n"
        srt += text.strip() + "\n\n"

    with open("subtitle.srt","w",encoding="utf-8") as f:
        f.write(srt)

    return "subtitle.srt"


@bot.message_handler(content_types=['voice','audio','video','document'])
def handle(message):

    try:

        bot.reply_to(message,"Processing...")

        file_info = bot.get_file(message.voice.file_id if message.voice else
                                 message.audio.file_id if message.audio else
                                 message.video.file_id if message.video else
                                 message.document.file_id)

        input_file = download_file(file_info)

        wav = convert_to_wav(input_file)

        result = model.transcribe(wav)

        srt_file = create_srt(result)

        bot.send_document(message.chat.id, open(srt_file,"rb"))

    except Exception as e:
        bot.reply_to(message,str(e))


bot.remove_webhook()

print("SRT Bot Running ✅")

bot.infinity_polling()
