import os
import whisper
import logging
from telegram import Update
from telegram.ext import Updater, MessageHandler, Filters, CallbackContext

# Error logs များကို စစ်ဆေးရန်
logging.basicConfig(level=logging.INFO)

# Telegram မှ ရလာသည့် Token ကို ဤနေရာတွင် ထည့်ပါ
BOT_TOKEN = "8502339712:AAFBkvJvyaOfA6pNIoI_dlGW1P5zr65mckU"

# Whisper AI Model ကို Load လုပ်ခြင်း
print("Loading Whisper Model...")
model = whisper.load_model("base")

def handle_media(update: Update, context: CallbackContext):
    chat_id = update.message.chat_id
    update.message.reply_text("⏳ Koyeb Server က အသံကို စတင်နားထောင်နေပါပြီ။ ခဏစောင့်ပေးပါ...")

    try:
        # File ကို Download ဆွဲခြင်း
        file = context.bot.get_file(update.message.effective_attachment.file_id)
        file_path = f"audio_{chat_id}.mp3"
        file.download(file_path)

        # AI က SRT ပြောင်းလဲခြင်း
        result = model.transcribe(file_path)
        
        srt_content = ""
        for i, segment in enumerate(result['segments'], start=1):
            start = segment['start']
            end = segment['end']
            text = segment['text'].strip()
            srt_content += f"{i}\n{format_time(start)} --> {format_time(end)}\n{text}\n\n"

        if srt_content:
            # SRT စာသားကို ပြန်ပို့ပေးခြင်း
            update.message.reply_text(f"✅ **SRT ထွက်လာပါပြီ:**\n\n{srt_content}")
        else:
            update.message.reply_text("❌ စကားပြောသံ မတွေ့ရပါ။")

    except Exception as e:
        update.message.reply_text(f"❌ Error တက်သွားပါသည်: {str(e)}")
    finally:
        # နေရာလွတ်စေရန် ဖိုင်ကို ပြန်ဖျက်ခြင်း
        if os.path.exists(file_path):
            os.remove(file_path)

def format_time(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"

def main():
    updater = Updater(BOT_TOKEN, use_context=True)
    dp = updater.dispatcher
    
    # Video, Audio နှင့် Voice ဖိုင်များကို လက်ခံရန်
    dp.add_handler(MessageHandler(Filters.video | Filters.audio | Filters.voice, handle_media))
    
    print("Bot is starting on Koyeb...")
    updater.start_polling(drop_pending_updates=True)
    updater.idle()

if __name__ == "__main__":
    main()
