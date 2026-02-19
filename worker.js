export default {
  async fetch(request, env) {
    // CORS configuration - တခြား Website တွေကနေ လှမ်းသုံးလို့ရအောင် လုပ်ပေးတာပါ
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Browser က စစ်ဆေးတဲ့ OPTIONS request ကို လက်ခံခြင်း
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // အသံဖိုင် လက်ခံပြီး SRT ထုတ်ပေးမည့်အပိုင်း
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const audioFile = formData.get("file");

        if (!audioFile) {
          return new Response("Error: No audio file provided", { status: 400, headers: corsHeaders });
        }

        // Cloudflare AI Whisper Model ကို အသုံးပြုခြင်း
        const response = await env.AI.run("@cf/openai/whisper", {
          audio: [...new Uint8Array(await audioFile.arrayBuffer())],
        });

        // ရလာတဲ့ Result ကို JSON format နဲ့ ပြန်ပို့ပေးခြင်း
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(`Error: ${e.message}`, { status: 500, headers: corsHeaders });
      }
    }

    // Browser မှာ ဒီအတိုင်း ဖွင့်ကြည့်ရင် မြင်ရမည့်စာသား
    return new Response("AI Subtitle Worker is running!", { headers: corsHeaders });
  },
};
