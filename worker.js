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
          await sendMessage(chatId, "🃏 **JOKER SRT Bot (Gemini 2.0 Flash)** အဆင်သင့်ဖြစ်ပါပြီ!\n\nဗီဒီယို/အသံဖိုင် ပို့ပေးပါ။");
          return new Response("OK");
        }

        if (update.message.text?.startsWith("/setkey")) {
          const key = update.message.text.split(" ")[1];
          await env.JOKER_STORAGE.put(`user_key_${chatId}`, key);
          await sendMessage(chatId, "✅ API Key ကို Gemini 2.0 အတွက် မှတ်သားပြီးပါပြီ။");
          return new Response("OK");
        }

        const file = update.message.video || update.message.audio || update.message.voice || update.message.document;
        if (file) {
          if (!userKey) return sendMessage(chatId, "❌ API Key အရင်ထည့်ပါ။");
          
          await sendMessage(chatId, "⏳ **Gemini 2.0 Flash** က အသံကိုနားထောင်ပြီး SRT ထုတ်ပေးနေပါတယ်။ ခဏစောင့်ပေးပါ...");

          try {
            // ၁။ Telegram ဖိုင်ကို ရယူခြင်း
            const fileRef = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file.file_id}`);
            const fileData = await fileRef.json();
            if (!fileData.ok) throw new Error("Telegram ဖိုင်ကို ဆွဲမရပါ (File size ကြီးလွန်းနေနိုင်သည်)။");

            const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
            const mediaResponse = await fetch(fileUrl);
            const mediaBuffer = await mediaResponse.arrayBuffer();

            // ၂။ Gemini 2.0 Flash API သို့ ပို့ခြင်း
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userKey}`;
            
            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: "Transcribe the audio and provide the output in professional SRT subtitle format only. Use timestamps." },
                    { inline_data: { mime_type: "audio/mpeg", data: btoa(String.fromCharCode(...new Uint8Array(mediaBuffer))) } }
                  ]
                }]
              })
            });

            const result = await geminiResponse.json();
            
            if (result.error) {
              throw new Error(`Gemini Error: ${result.error.message}`);
            }

            const srtText = result.candidates[0].content.parts[0].text;

            // ၃။ ရလာတဲ့ SRT ကို စာသားအဖြစ် ပြန်ပို့ခြင်း
            await sendMessage(chatId, "✅ **SRT ထွက်လာပါပြီ (Gemini 2.0):**\n\n" + srtText);

          } catch (e) {
            await sendMessage(chatId, `❌ **Error:** \`${e.message}\` \n\n(ကျေးဇူးပြု၍ API Key သို့မဟုတ် ဖိုင်ကို ပြန်စစ်ပေးပါ)`);
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
