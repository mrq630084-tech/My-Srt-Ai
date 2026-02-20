const BOT_TOKEN = "8502339712:AAFBkvJvyaOfA6pNIoI_dlGW1P5zr65mckU";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const update = await request.json();
        if (!update.message) return new Response("OK");

        const chatId = update.message.chat.id;
        const text = update.message.text;

        // Command: /start
        if (text === "/start") {
          await sendMessage(chatId, "🃏 **JOKER SRT Bot အဆင်သင့်ဖြစ်ပါပြီ!**\n\nကိုယ်ပိုင် API Key သုံးရန် အောက်ပါအတိုင်း အရင်ပို့ပေးပါ-\n`/setkey သင်၏_API_KEY` \n\nပြီးမှ ဗီဒီယို ပို့ပေးပါဗျ။");
          return new Response("OK");
        }

        // Command: /setkey
        if (text && text.startsWith("/setkey")) {
          const key = text.split(" ")[1];
          if (!key) return sendMessage(chatId, "⚠️ Key ထည့်ပေးဖို့ လိုပါတယ်ဗျ။ \n`/setkey AIzaSy...` လို့ ရိုက်ပါ။");
          
          // KV ထဲသိမ်းခြင်း (JOKER_STORAGE သုံးထားသည်)
          await env.JOKER_STORAGE.put(`user_key_${chatId}`, key);
          await sendMessage(chatId, "✅ API Key ကို မှတ်သားလိုက်ပါပြီ။ အခု ဗီဒီယို/အသံဖိုင် ပို့နိုင်ပါပြီ။");
          return new Response("OK");
        }

        // ဖိုင်လက်ခံခြင်းအပိုင်း
        if (update.message.video || update.message.audio || update.message.voice || update.message.document) {
          await sendMessage(chatId, "⏳ စတင်လုပ်ဆောင်နေပါပြီ။ ခဏစောင့်ပေးပါ...");
          // ဒီနေရာမှာ Transcription Logic ဆက်သွားမှာပါ
          return new Response("OK");
        }

      } catch (err) {
        // Error ဖြစ်ရင်တောင် Response ပြန်ပေးရမယ်
        return new Response("Error: " + err.message);
      }
    }
    return new Response("Joker Bot is Active!");
  }
};

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" })
  });
}
