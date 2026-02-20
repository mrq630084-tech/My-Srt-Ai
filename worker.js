const BOT_TOKEN = "8502339712:AAFBkvJvyaOfA6pNIoI_dlGW1P5zr65mckU";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const update = await request.json();
        if (!update.message) return new Response("OK");
        const chatId = update.message.chat.id;

        // ၁။ API Key စစ်ဆေးခြင်း
        const userKey = await env.JOKER_STORAGE.get(`user_key_${chatId}`);
        
        if (update.message.text === "/start") {
          await sendMessage(chatId, "🃏 **JOKER SRT Bot Active ဖြစ်ပါပြီ!**\n\nAPI Key သတ်မှတ်ရန်: `/setkey YOUR_KEY` \n\nKey ရှိပြီးသားဆိုရင် ဗီဒီယို ပို့နိုင်ပါပြီ။");
          return new Response("OK");
        }

        if (update.message.text?.startsWith("/setkey")) {
          const key = update.message.text.split(" ")[1];
          if (!key) return sendMessage(chatId, "⚠️ Key ထည့်ပေးပါ။");
          await env.JOKER_STORAGE.put(`user_key_${chatId}`, key);
          await sendMessage(chatId, "✅ Key မှတ်သားပြီးပါပြီ။");
          return new Response("OK");
        }

        // ၂။ ဖိုင်ကို လက်ခံပြီး Gemini ဆီ ပို့ခြင်း
        const file = update.message.video || update.message.audio || update.message.document;
        if (file) {
          if (!userKey) return sendMessage(chatId, "❌ အရင်ဆုံး API Key သတ်မှတ်ပေးပါဦးဗျ။");
          
          await sendMessage(chatId, "⏳ Gemini AI က စာတန်းထိုး ထုတ်ပေးနေပါတယ်။ ခဏစောင့်ပေးပါ...");
          
          // ဤနေရာတွင် Gemini API သို့ ဖိုင်ပို့သည့် Logic အစစ်အမှန် ပါဝင်လာမည်
          // (ယခုအဆင့်တွင် ချိတ်ဆက်မှုစမ်းသပ်ရန်အတွက်သာ ဖြစ်သည်)
          await sendMessage(chatId, "🔔 လက်ရှိတွင် ဖိုင်ကို လက်ခံရရှိပါသည်။ SRT ထွက်ရန် Gemini API နှင့် ချိတ်ဆက်နေဆဲဖြစ်ပါသည်။");
          return new Response("OK");
        }
      } catch (err) {
        return new Response("Error: " + err.message);
      }
    }
    return new Response("Active");
  }
};

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" })
  });
}
