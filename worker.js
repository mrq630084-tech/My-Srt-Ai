const BOT_TOKEN = "8502339712:AAFBkvJvyaOfA6pNIoI_dlGW1P5zr65mckU";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const update = await request.json();
        if (!update || !update.message) return new Response("OK");
        const chatId = update.message.chat.id;
        const userKey = await env.JOKER_STORAGE.get(`user_key_${chatId}`);

        if (update.message.text === "/start") {
          await sendMessage(chatId, "🃏 **JOKER SRT Bot (Gemini 2.0 Flash)** အဆင်သင့်ဖြစ်ပါပြီ!");
          return new Response("OK");
        }

        if (update.message.text?.startsWith("/setkey")) {
          const key = update.message.text.split(" ")[1];
          await env.JOKER_STORAGE.put(`user_key_${chatId}`, key);
          await sendMessage(chatId, "✅ Gemini 2.0 API Key ကို အောင်မြင်စွာ မှတ်သားပြီးပါပြီ။");
          return new Response("OK");
        }

        const file = update.message.video || update.message.audio || update.message.voice || update.message.document;
        if (file) {
          if (!userKey) return sendMessage(chatId, "❌ API Key အရင်ထည့်ပါ။ /setkey [YOUR_KEY]");
          await sendMessage(chatId, "⏳ Gemini 2.0 Flash က စတင်လုပ်ဆောင်နေပါပြီ။ ခဏစောင့်ပေးပါ...");

          try {
            const fileRef = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file.file_id}`);
            const fileData = await fileRef.json();
            const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
            const mediaResponse = await fetch(fileUrl);
            const mediaBuffer = await mediaResponse.arrayBuffer();

            // Stack size error ကို ကာကွယ်ရန် Chunking စနစ်
            const uint8 = new Uint8Array(mediaBuffer);
            let binary = "";
            for (let i = 0; i < uint8.length; i += 8192) {
              binary += String.fromCharCode.apply(null, uint8.subarray(i, i + 8192));
            }
            const base64Data = btoa(binary);

            // Gemini 2.0 Flash Model သို့ တိုက်ရိုက်ပို့ခြင်း
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userKey}`;
            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: "Generate professional SRT subtitles for this audio with accurate timestamps. Output only the SRT content." },
                    { inline_data: { mime_type: "audio/mpeg", data: base64Data } }
                  ]
                }]
              })
            });

            const result = await geminiResponse.json();
            if (result.error) throw new Error(result.error.message);

            const srtText = result.candidates[0].content.parts[0].text;
            await sendMessage(chatId, "✅ **SRT ထွက်လာပါပြီ (Gemini 2.0):**\n\n" + srtText);

          } catch (e) {
            // Quota ပြည့်ပါက သို့မဟုတ် အခြား Error များရှိပါက အကြောင်းကြားမည်
            await sendMessage(chatId, `❌ **Error:** \`${e.message}\``);
          }
          return new Response("OK");
        }
      } catch (err) { return new Response("OK"); }
    }
    return new Response("OK");
  }
};

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}
