export default {
  async fetch(request, env) {
    const apiKeys = [
      "AIzaSyDw5pjNj-_fJQ4P0divia2O66RAK2tKW8o",
      "AIzaSyC-gs3BZ2B96wEnO1XMdRpaCBtWxpL3BFQ",
      "AIzaSyAtmRj9WcC5aSjG4yBOi217YWeiHvPo9z8",
      "AIzaSyBSWX3G37ahBaqQA9oz8l41TkJlJiNaDpM",
      "AIzaSyAHpGiKmCNNMEAp1KDVQ2qaeduWxXZfdKk",
      "AIzaSyBQXfVh8kxlSRAxrSSsOwnw52H84Vm7hUw",
      "AIzaSyAo1AYwSRuJvvWvog3UOn1EnZV-hDKBEFk",
      "AIzaSyDQJWz2P_6h4cQO1_UGRhN0TIDskjTsYyA",
      "AIzaSyCKP_EiBRoQRMd4UiK-Mlf2779Hop0rNL0",
      "AIzaSyAzrO7gCSdDB9nlxQmM5WyvaCPsA-5C3YM"
    ];

    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const userKey = formData.get("userApiKey"); // User ထည့်လိုက်တဲ့ Key ကို ယူခြင်း
        
        // အရေးကြီးဆုံးအချက်: User Key ရှိရင် ၎င်းကိုသာ အသုံးပြုမည်
        const finalKey = (userKey && userKey.trim().length > 10) ? userKey.trim() : apiKeys[Math.floor(Math.random() * apiKeys.length)];

        if (!file) return new Response(JSON.stringify({ error: "ဖိုင်ရှာမတွေ့ပါ" }), { status: 400 });

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = b64encode(arrayBuffer);

        // Gemini API သို့ ပို့ဆောင်ခြင်း
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Generate professional Burmese SRT subtitles for this media. Return ONLY the SRT text." },
                { inline_data: { mime_type: file.type, data: base64Data } }
              ]
            }]
          })
        });

        const data = await apiResponse.json();
        
        // API မှ Error ပြန်လာလျှင်
        if (data.error) throw new Error(data.error.message || "API Error");
        
        const srtResult = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ text: srtResult }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "Error: " + err.message }), { status: 500 });
      }
    }

    // --- PREMIUM JOKER SRT UI ---
    return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JOKER SRT - PRO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: #000; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .joker-card { background: rgba(10,10,10,0.9); border: 1px solid #bf953f; border-radius: 40px; box-shadow: 0 0 50px rgba(191,149,63,0.2); }
            .gold-text { background: linear-gradient(to bottom, #fff, #bf953f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            input, label { background: rgba(255,255,255,0.05); border: 1px solid rgba(191,149,63,0.2); color: white; }
        </style>
    </head>
    <body class="p-6">
        <div class="joker-card p-10 w-full max-w-md text-center">
            <h1 class="text-5xl font-black gold-text mb-2 italic">JOKER SRT</h1>
            <p class="text-[9px] tracking-[0.5em] text-white/30 mb-10 uppercase">Ultimate Subtitle Engine</p>
            
            <div class="space-y-4 mb-8 text-left">
                <input type="password" id="ukey" placeholder="Paste your private API Key here..." class="w-full p-4 rounded-2xl text-xs outline-none focus:border-[#bf953f]"/>
                <label for="f" class="block w-full p-5 rounded-2xl cursor-pointer text-center text-sm border-dashed border-2">
                    <span id="fn" class="opacity-50">Choose Video/Audio</span>
                </label>
                <input type="file" id="f" accept="video/*,audio/*" class="hidden" onchange="document.getElementById('fn').innerText=this.files[0].name"/>
            </div>

            <button onclick="go()" id="btn" class="w-full py-4 bg-white text-black font-bold rounded-full uppercase tracking-widest text-xs hover:bg-[#bf953f] transition">Ignite AI</button>
            <div id="st" class="mt-4 text-[10px] text-white/40 italic"></div>

            <div id="resBox" class="hidden mt-8">
                <div class="flex justify-between mb-2">
                    <button onclick="cp()" class="text-[10px] text-yellow-500">📋 Copy</button>
                    <button onclick="dl()" class="text-[10px] text-yellow-500">💾 Download</button>
                </div>
                <textarea id="res" class="w-full h-48 bg-black/50 border border-white/10 rounded-2xl p-4 text-[11px] text-yellow-100/70 outline-none" readonly></textarea>
            </div>
        </div>
        <script>
            let txt = "";
            async function go() {
                const f = document.getElementById('f').files[0];
                if(!f) return alert("ဖိုင်ရွေးပေးပါဗျ!");
                const btn = document.getElementById('btn');
                const st = document.getElementById('status');
                
                btn.disabled = true; document.getElementById('st').innerText = "🚀 Processing with your API Key...";
                
                const fd = new FormData();
                fd.append('file', f);
                fd.append('userApiKey', document.getElementById('ukey').value);

                try {
                    const r = await fetch(window.location.href, { method: 'POST', body: fd });
                    const d = await r.json();
                    if(d.error) throw new Error(d.error);
                    txt = d.text;
                    document.getElementById('res').value = txt;
                    document.getElementById('resBox').classList.remove('hidden');
                    document.getElementById('st').innerText = "✨ Success!";
                } catch(e) {
                    document.getElementById('st').innerText = "❌ " + e.message;
                } finally { btn.disabled = false; }
            }
            function cp() { navigator.clipboard.writeText(txt); alert("Copied!"); }
            function dl() {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([txt]));
                a.download = "joker.srt"; a.click();
            }
        </script>
    </body>
    </html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};

function b64encode(buf) {
  let binary = "";
  let bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
