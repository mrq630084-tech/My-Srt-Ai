const BOT_TOKEN = "8502339712:AAFBkvJvyaOfA6pNIoI_dlGW1P5zr65mckU";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const update = await request.json();
        if (!update || !update.message) return new Response("OK");
        const chatId = update.message.chat.id;

        // ၁။ Start Command
        if (update.message.text === "/start") {
          await sendMessage(chatId, "🃏 **JOKER SRT Bot Active ဖြစ်ပါပြီ!**\n\nဗီဒီယိုပို့ပြီး SRT ထုတ်နိုင်ပါပြီ။ Error တစ်ခုခုတက်ရင် ကျွန်တော် အကြောင်းကြားပေးပါ့မယ်။");
          return new Response("OK");
        }

        // ၂။ API Key သတ်မှတ်ခြင်း (KV သုံးထားသည်)
        if (update.message.text?.startsWith("/setkey")) {
          const key = update.message.text.split(" ")[1];
          if (!key) return sendMessage(chatId, "⚠️ Error: API Key ထည့်ပေးဖို့ လိုအပ်ပါတယ်။");
          await env.JOKER_STORAGE.put(`user_key_${chatId}`, key);
          await sendMessage(chatId, "✅ API Key ကို မှတ်သားလိုက်ပါပြီ။");
          return new Response("OK");
        }

        // ၃။ ဖိုင်လက်ခံပြီး SRT ထုတ်လုပ်ခြင်း
        const file = update.message.video || update.message.audio || update.message.voice || update.message.document;
        if (file) {
          try {
            const userKey = await env.JOKER_STORAGE.get(`user_key_${chatId}`);
            if (!userKey) throw new Error("API Key ရှာမတွေ့ပါ။ အရင်ဆုံး /setkey နဲ့ Key ထည့်ပေးပါ။");

            await sendMessage(chatId, "⏳ Gemini AI က စတင်လုပ်ဆောင်နေပါပြီ။ ခဏစောင့်ပေးပါ...");

            // ဤနေရာတွင် Gemini API ချိတ်ဆက်မှု အစစ်အမှန် Logic ထည့်ရပါမည်
            // စမ်းသပ်ရန်အတွက် Error တက်ပုံကို အောက်တွင် ပြထားပါသည်
            
            // await processTranscription(file, userKey); // ဥပမာ Logic

          } catch (internalErr) {
            // အလုပ်လုပ်နေစဉ်အတွင်း Error တက်ရင် User ဆီ စာပြန်ပို့ပေးမည်
            await sendMessage(chatId, `❌ **Error ဖြစ်ပွားပါသည်!**\n\nအကြောင်းရင်း: \`${internalErr.message}\` \n\nကျေးဇူးပြု၍ Settings များကို ပြန်စစ်ပေးပါဗျ။`);
          }
          return new Response("OK");
        }

      } catch (globalErr) {
        // System တစ်ခုလုံး Error တက်ရင် Cloudflare Log ထဲပို့မည်
        console.error("Global Error: ", globalErr.message);
        return new Response("Error: " + globalErr.message);
      }
    }
    return new Response("OK");
  }
};

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" })
  });
}
