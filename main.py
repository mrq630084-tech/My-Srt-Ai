import whisper

from faster_whisper import WhisperModel

model = WhisperModel("small")

@bot.message_handler(content_types=['audio','voice','document'])
def handle_audio(message):

    file_info = bot.get_file(message.audio.file_id if message.audio else message.document.file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    with open("audio.mp3", "wb") as f:
        f.write(downloaded_file)

    result = model.transcribe("audio.mp3")

    with open("subtitles.srt", "w", encoding="utf-8") as f:
        for i, seg in enumerate(result["segments"], start=1):
            start = seg["start"]
            end = seg["end"]
            text = seg["text"]

            f.write(f"{i}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{text}\n\n")

    bot.send_document(message.chat.id, open("subtitles.srt","rb"))
