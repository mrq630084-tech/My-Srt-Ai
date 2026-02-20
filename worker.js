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
          await sendMessage(chatId, "🃏 **JOKER SRT Bot (Gemini 2.0 Flash)**");
          return new Response("OK");
        }

        if (update.message.text?.startsWith("/setkey")) {
          const key = update.message.text.split(" ")[1];
          await env.JOKER_STORAGE.put(`user_key_${chatId}`, key);
          await sendMessage(chatId, "✅ Key မှတ်သားပြီးပါပြီ။");
          return new Response("OK");
        }

        const file = update.message.video || update.message.audio || update.message.voice || update.message.document;
        if (file) {
          if (!userKey) return sendMessage(chatId, "❌ Key အရင်ထည့်ပါ။");
          await sendMessage(chatId, "⏳ Gemini 2.0 က စတင်လုပ်ဆောင်နေပါပြီ...");

          try {
            const fileRef = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file.file_id}`);
            const fileData = await fileRef.json();
            const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
            
            const mediaResponse = await fetch(fileUrl);
            const mediaBuffer = await mediaResponse.arrayBuffer();

            // Stack size error ကို လုံးဝကျော်လွှားနိုင်သော Base64 ပြောင်းနည်း
            const uint8 = new Uint8Array(mediaBuffer);
            let binary = "";
            const chunk_size = 8192; 
            for (let i = 0; i < uint8.length; i += chunk_size) {
              binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunk_size));
            }
            const base64Data = btoa(binary);

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userKey}`;
            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: "Provide ONLY professional SRT format content for this audio. No extra text." },
                    { inline_data: { mime_type: "audio/mpeg", data: base64Data } }
                  ]
                }]
              })
            });

            const result = await geminiResponse.json();
            if (result.error) throw new Error(result.error.message);

            const srtText = result.candidates[0].content.parts[0].text;
            await sendMessage(chatId, "✅ **SRT ထွက်လာပါပြီ:**\n\n" + srtText);

          } catch (e) {
            await sendMessage(chatId, `❌ **Error:** \`${e.message}\``);
          }
          return new Response("OK");
        }
      } catch (err) {
        return new Response("OK");
      }
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
