export default {
  async fetch(request, env) {
    // API Keys List
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
        const userKey = formData.get("userApiKey");
        
        // User Key ရှိရင် User Key သုံး၊ မရှိရင် Backend က Key တွေကို Random ရွေးသုံးမယ်
        const selectedKey = userKey || apiKeys[Math.floor(Math.random() * apiKeys.length)];

        if (!file) return new Response(JSON.stringify({ error: "No file!" }), { status: 400 });

        // Gemini API ကို File ပို့ဖို့ ပြင်ဆင်ခြင်း
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = b64encode(arrayBuffer);

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${selectedKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Please provide a professional SRT subtitle for this audio/video in Burmese language. Only return the SRT format." },
                { inline_data: { mime_type: file.type, data: base64Data } }
              ]
            }]
          })
        });

        const data = await apiResponse.json();
        const srtResult = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ text: srtResult }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "API Limit ပြည့်သွားပါပြီ။ ကိုယ်ပိုင် Key သုံးပေးပါ သို့မဟုတ် ခဏစောင့်ပါ။" }), { status: 500 });
      }
    }

    // --- JOKER SRT PREMIUM UI ---
    return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JOKER SRT - ULTIMATE AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: #050505; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow-x: hidden; }
            .gold-glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(191,149,63,0.15) 0%, transparent 70%); z-index: -1; }
            .glass-morphism { background: rgba(15, 15, 15, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(191, 149, 63, 0.3); border-radius: 50px; box-shadow: 0 0 80px rgba(0,0,0,0.9); }
            .gold-title { background: linear-gradient(135deg, #fff6ba 0%, #bf953f 50%, #8a6e2f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 10px 20px rgba(0,0,0,0.5); }
            .btn-platinum { background: linear-gradient(145deg, #ffffff, #a0a0a0); border-radius: 50px; color: #000; font-weight: 800; transition: 0.4s ease; box-shadow: 0 15px 30px rgba(191,149,63,0.2); }
            .btn-platinum:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(191,149,63,0.4); }
            .input-field { background: rgba(255,255,255,0.03); border: 1px solid rgba(191, 149, 63, 0.1); border-radius: 20px; color: #fff; outline: none; transition: 0.3s; }
            .input-field:focus { border-color: #bf953f; background: rgba(255,255,255,0.07); }
        </style>
    </head>
    <body class="p-4">
        <div class="gold-glow"></div>
        <div class="glass-morphism p-12 w-full max-w-lg text-center">
            <h1 class="text-6xl font-black gold-title mb-2 tracking-tighter italic">JOKER SRT</h1>
            <p class="text-[10px] tracking-[0.6em] text-white/30 mb-12 uppercase">Ultimate Multi-API Engine</p>
            
            <div class="space-y-6 mb-10 text-left">
                <div>
                    <label class="text-[9px] text-yellow-600/60 ml-4 uppercase font-bold">API Key (Optional)</label>
                    <input type="password" id="ukey" placeholder="Enter your own Gemini Key" class="w-full p-4 mt-1 input-field text-xs"/>
                </div>
                <div>
                    <label class="text-[9px] text-yellow-600/60 ml-4 uppercase font-bold">Media File</label>
                    <label for="file" class="block w-full p-6 mt-1 input-field cursor-pointer border-dashed border-2 text-center hover:bg-white/5">
                        <span id="fname" class="text-sm text-white/50 font-medium font-sans">Choose Video or Audio</span>
                    </label>
                    <input type="file" id="file" accept="video/*,audio/*" class="hidden" onchange="document.getElementById('fname').innerText=this.files[0].name"/>
                </div>
            </div>

            <button onclick="process()" id="goBtn" class="btn-platinum w-full py-5 uppercase text-xs tracking-[0.3em]">Ignite AI</button>
            <div id="status" class="mt-6 text-[11px] text-white/40 italic"></div>

            <div id="resBox" class="hidden mt-12 space-y-4">
                <div class="flex justify-between">
                    <button onclick="copyTxt()" class="text-[10px] text-yellow-500/80 hover:text-yellow-400">📋 Copy SRT</button>
                    <button onclick="saveFile()" class="text-[10px] text-yellow-500/80 hover:text-yellow-400">💾 Download .SRT</button>
                </div>
                <textarea id="output" class="w-full h-56 input-field p-5 text-[11px] leading-relaxed text-yellow-100/70" readonly></textarea>
            </div>
        </div>

        <script>
            let finalSrt = "";
            async function process() {
                const f = document.getElementById('file').files[0];
                if(!f) return alert("ဖိုင်ရွေးပါဦးဗျ!");
                const btn = document.getElementById('goBtn');
                const st = document.getElementById('status');
                
                btn.disabled = true; st.innerText = "🚀 Joker AI is Analyzing (using Round-Robin API)...";
                
                const fd = new FormData();
                fd.append('file', f);
                fd.append('userApiKey', document.getElementById('ukey').value);

                try {
                    const r = await fetch(window.location.href, { method: 'POST', body: fd });
                    const d = await r.json();
                    if(d.error) throw new Error(d.error);
                    finalSrt = d.text;
                    document.getElementById('output').value = finalSrt;
                    document.getElementById('resBox').classList.remove('hidden');
                    st.innerText = "✨ Done! AI has finished the job.";
                } catch(e) {
                    st.innerText = "❌ Error: " + e.message;
                } finally { btn.disabled = false; }
            }
            function copyTxt() { navigator.clipboard.writeText(finalSrt); alert("Copied!"); }
            function saveFile() {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([finalSrt]));
                a.download = "joker_subtitle.srt"; a.click();
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
