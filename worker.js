export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) return new Response(JSON.stringify({ error: "No file found" }), { status: 400 });

        // AI Model ဆီ ပေးမပို့ခင် Audio data အဖြစ် အရင်ပြောင်းခြင်း
        const arrayBuffer = await file.arrayBuffer();
        const audioData = new Uint8Array(arrayBuffer);

        // Whisper AI ကို အချိန်ပိုပေးပြီး Run ခိုင်းခြင်း
        const response = await env.AI.run("@cf/openai/whisper", {
          audio: [...audioData],
        });
        
        return new Response(JSON.stringify(response), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "AI Busy သို့မဟုတ် Timeout ဖြစ်သွားပါပြီ။ ဖိုင်အသေးနဲ့ ထပ်စမ်းပေးပါ။" }), { status: 500 });
      }
    }

    // --- UI အပိုင်း (JOKER SRT DESIGN) ---
    return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Joker SRT - Premium AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: radial-gradient(circle, #aa771c, #4a370e, #000); min-height: 100vh; color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
            .glass { background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
            .gold-grad { background: linear-gradient(to bottom, #fff6ba, #bf953f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .platinum-btn { background: linear-gradient(white, #d1d5db); color: black; border-radius: 50px; font-weight: bold; box-shadow: 0 5px 15px rgba(255,255,255,0.2); transition: 0.3s; }
            .platinum-btn:active { transform: scale(0.98); }
        </style>
    </head>
    <body class="p-6">
        <div class="glass p-10 w-full max-w-md text-center">
            <h1 class="text-5xl font-black gold-grad tracking-tighter mb-2">JOKER SRT</h1>
            <p class="text-[10px] tracking-[0.5em] text-white/40 mb-10 uppercase">Advanced Subtitle Engine</p>
            
            <div class="space-y-6">
                <input type="file" id="f" accept="audio/*,video/*" class="hidden" onchange="document.getElementById('fn').innerText = this.files[0].name"/>
                <label for="f" class="block w-full py-4 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition">
                    <span class="text-sm opacity-80">📁 Video/Audio ရွေးရန်</span>
                    <p id="fn" class="text-[10px] text-yellow-500 mt-2 italic"></p>
                </label>

                <button onclick="go()" id="b" class="platinum-btn w-full py-4 uppercase text-xs tracking-widest">Generate</button>
            </div>

            <div id="st" class="text-[10px] mt-4 text-white/50 h-4"></div>

            <div id="resBox" class="hidden mt-8 space-y-3">
                <div class="flex justify-center gap-4">
                    <button onclick="cp()" class="text-[10px] bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20">📋 Copy Text</button>
                    <button onclick="dl()" class="text-[10px] bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20">💾 Download SRT</button>
                </div>
                <textarea id="res" class="w-full h-40 bg-black/40 rounded-3xl p-4 text-[11px] text-yellow-100/80 border border-white/5 outline-none" readonly></textarea>
            </div>
        </div>

        <script>
            let txt = "";
            async function go() {
                const f = document.getElementById('f').files[0];
                if(!f) return alert("ဖိုင်ရွေးပေးပါ!");
                
                const b = document.getElementById('b');
                const st = document.getElementById('st');
                const resBox = document.getElementById('resBox');
                
                b.disabled = true; st.innerText = "✨ Joker AI is thinking... (ဖိုင်အရွယ်အစားပေါ်မူတည်၍ ကြာနိုင်ပါသည်) ✨";
                resBox.classList.add('hidden');

                const fd = new FormData(); fd.append('file', f);
                try {
                    const r = await fetch(window.location.href, { method: 'POST', body: fd });
                    const d = await r.json();
                    if(d.error) throw new Error(d.error);
                    txt = d.text || "စာသားမထွက်လာပါ။";
                    document.getElementById('res').value = txt;
                    resBox.classList.remove('hidden');
                    st.innerText = "ပြီးပါပြီ!";
                } catch(e) { 
                    alert(e.message); 
                    st.innerText = "Error ဖြစ်သွားပါသည်။";
                } finally { b.disabled = false; }
            }
            function cp() { navigator.clipboard.writeText(txt); alert("Copy ကူးပြီးပါပြီ"); }
            function dl() {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([txt], {type:'text/plain'}));
                a.download = "joker.srt"; a.click();
            }
        </script>
    </body>
    </html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
