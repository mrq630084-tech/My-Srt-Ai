import os
import telebot
import subprocess
from faster_whisper import WhisperModel

TOKEN = os.environ.get("BOT_TOKEN")

bot = telebot.TeleBot(TOKEN)

print("Loading model...")

model = WhisperModel("base", device="cpu", compute_type="int8")

print("Model loaded ✅")

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message,"SRT Bot Ready ✅\nSend MP3 / Video / Voice")

def download_file(file_info):

    file = bot.download_file(file_info.file_path)

    with open("input","wb") as f:
        f.write(file)

    return "input"


def convert_audio():

    subprocess.run(["ffmpeg","-y","-i","input","audio.wav"])

    return "audio.wav"


def create_srt(segments):

    srt=""

    for i,seg in enumerate(segments):

        start = seg.start
        end = seg.end
        text = seg.text

        def format(t):
            h=int(t//3600)
            m=int((t%3600)//60)
            s=int(t%60)
            ms=int((t-int(t))*1000)

            return f"{h:02}:{m:02}:{s:02},{ms:03}"

        srt+=f"{i+1}\n"
        srt+=f"{format(start)} --> {format(end)}\n"
        srt+=text+"\n\n"

    with open("subtitle.srt","w",encoding="utf-8") as f:
        f.write(srt)

    return "subtitle.srt"


@bot.message_handler(content_types=['voice','audio','video','document'])
def handle(message):

    bot.reply_to(message,"Processing...")

    file_id = (
        message.voice.file_id if message.voice else
        message.audio.file_id if message.audio else
        message.video.file_id if message.video else
        message.document.file_id
    )

    file_info = bot.get_file(file_id)

    download_file(file_info)

    convert_audio()

    segments,info = model.transcribe("audio.wav")

    srt_file = create_srt(segments)

    bot.send_document(message.chat.id,open(srt_file,"rb"))


bot.remove_webhook()

print("Bot Running ✅")

bot.infinity_polling()
