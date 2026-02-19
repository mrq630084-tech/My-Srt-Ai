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
        const userKey = formData.get("userApiKey");
        
        const finalKey = (userKey && userKey.trim().length > 10) ? userKey.trim() : apiKeys[Math.floor(Math.random() * apiKeys.length)];

        if (!file) return new Response(JSON.stringify({ error: "ဖိုင်မတွေ့ပါ" }), { 
          status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
        });

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = b64encode(arrayBuffer);

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Generate professional Burmese SRT subtitles for this audio/video. Return ONLY the raw SRT format text. No talk, no markdown." },
                { inline_data: { mime_type: file.type, data: base64Data } }
              ]
            }]
          })
        });

        const data = await apiResponse.json();
        
        // Error handling ကို ပိုမိုခိုင်မာအောင် လုပ်ထားသည်
        if (data.error) {
          return new Response(JSON.stringify({ error: data.error.message }), { 
            status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
          });
        }

        const srtResult = data.candidates[0].content.parts[0].text;
        return new Response(JSON.stringify({ text: srtResult }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "Server Error: " + err.message }), { 
          status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
        });
      }
    }

    // --- UI DESIGN (မြန်မာဘာသာ၊ ဘေးတိုက် API Key UI) ---
    return new Response(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JOKER SRT - PRO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: #f0f2f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
            .card { background: white; border-radius: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.05); }
            .gold-text { background: linear-gradient(to bottom, #bf953f, #aa771c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
            .btn-gold { background: linear-gradient(135deg, #bf953f, #aa771c); color: white; transition: 0.3s; }
            .btn-gold:hover { transform: translateY(-2px); opacity: 0.9; }
        </style>
    </head>
    <body class="p-4">
        <div class="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="card p-8 h-fit border border-gray-100">
                <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">🔑 API ဆက်တင်</h3>
                <p class="text-[11px] text-gray-400 mb-4 italic">ဖိုင်အကြီးကြီးများအတွက် ကိုယ်ပိုင် Key သုံးနိုင်သည်</p>
                <input type="password" id="ukey" placeholder="Gemini API Key ထည့်ရန်" class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:border-[#bf953f] transition"/>
            </div>

            <div class="md:col-span-2 card p-10 text-center border-t-4 border-[#bf953f]">
                <h1 class="text-5xl gold-text italic mb-2 tracking-tighter">JOKER SRT</h1>
                <p class="text-[10px] tracking-[0.5em] text-gray-300 mb-10 uppercase font-bold">Ultimate Subtitle Engine</p>

                <div class="space-y-6">
                    <label for="file" class="block w-full p-12 border-2 border-dashed border-gray-100 rounded-3xl cursor-pointer hover:bg-gray-50 transition">
                        <span id="fname" class="text-gray-400 text-sm">ဗီဒီယို သို့မဟုတ် အသံဖိုင် ရွေးချယ်ပါ</span>
                    </label>
                    <input type="file" id="file" accept="video/*,audio/*" class="hidden" onchange="document.getElementById('fname').innerText=this.files[0].name"/>
                    
                    <button onclick="process()" id="goBtn" class="btn-gold w-full py-5 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg shadow-[#bf953f]/20">စာတန်းထိုးထုတ်မည်</button>
                    <div id="status" class="text-xs text-gray-400 italic"></div>
                </div>

                <div id="resBox" class="hidden mt-10 text-left border-t border-gray-50 pt-8">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-gray-600">ရလဒ် (SRT)</span>
                        <div class="flex gap-3">
                            <button onclick="copyTxt()" class="text-xs text-[#bf953f] font-bold">📋 Copy</button>
                            <button onclick="save()" class="text-xs text-[#bf953f] font-bold">💾 Download</button>
                        </div>
                    </div>
                    <textarea id="output" class="w-full h-64 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-[11px] text-gray-600 outline-none" readonly></textarea>
                </div>
            </div>
        </div>

        <script>
            let srtData = "";
            async function process() {
                const f = document.getElementById('file').files[0];
                if(!f) return alert("ဖိုင်အရင်ရွေးပေးပါဗျ!");
                
                const btn = document.getElementById('goBtn');
                const st = document.getElementById('status');
                btn.disabled = true; st.innerText = "🚀 AI က လုပ်ဆောင်နေပါပြီ၊ ခေတ္တစောင့်ပေးပါ...";
                
                const fd = new FormData();
                fd.append('file', f);
                fd.append('userApiKey', document.getElementById('ukey').value);

                try {
                    const r = await fetch(window.location.href, { method: 'POST', body: fd });
                    const text = await r.text();
                    
                    let d;
                    try {
                        d = JSON.parse(text); // JSON ကို သေချာဖတ်သည်
                    } catch(e) {
                        throw new Error("Server မှ HTML ပြန်လာနေပါသည် (Error တက်နေသည်)");
                    }

                    if(d.error) throw new Error(d.error);
                    
                    srtData = d.text;
                    document.getElementById('output').value = srtData;
                    document.getElementById('resBox').classList.remove('hidden');
                    st.innerText = "✨ အောင်မြင်စွာ ပြီးဆုံးပါပြီ!";
                } catch(e) {
                    alert("အမှားအယွင်း: " + e.message);
                    st.innerText = "❌ ပြဿနာရှိနေပါသည်";
                } finally { btn.disabled = false; }
            }
            function copyTxt() { navigator.clipboard.writeText(srtData); alert("ကော်ပီကူးပြီးပါပြီ"); }
            function save() {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([srtData]));
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
