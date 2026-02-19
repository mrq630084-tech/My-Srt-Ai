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
        
        // User Key ရှိရင် ၎င်းကိုသာ အသုံးပြုမည်
        const finalKey = (userKey && userKey.trim().length > 10) ? userKey.trim() : apiKeys[Math.floor(Math.random() * apiKeys.length)];

        if (!file) return new Response(JSON.stringify({ error: "ဖိုင်ရွေးချယ်မှုမရှိပါ" }), { status: 400 });

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = b64encode(arrayBuffer);

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
        if (data.error) throw new Error(data.error.message || "API အကန့်အသတ်ပြည့်သွားပါပြီ");
        
        const srtResult = data.candidates[0].content.parts[0].text;
        return new Response(JSON.stringify({ text: srtResult }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // --- UI DESIGN (မြန်မာဘာသာစကားဖြင့်) ---
    return new Response(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JOKER SRT - မြန်မာ AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: #f3f4f6; min-height: 100vh; font-family: sans-serif; }
            .premium-card { background: white; border-radius: 30px; box-shadow: 0 10px 40px rgba(191,149,63,0.15); border: 1px solid #e5e7eb; }
            .gold-grad { background: linear-gradient(to right, #bf953f, #aa771c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
            .btn-gold { background: linear-gradient(135deg, #bf953f, #aa771c); color: white; transition: 0.3s; }
            .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(170,119,28,0.4); }
            textarea { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 12px; }
        </style>
    </head>
    <body class="p-4 md:p-10 flex flex-col items-center">
        
        <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div class="premium-card p-8 h-fit">
                <h2 class="text-lg font-bold mb-4 flex items-center gap-2">🔑 <span class="gold-grad">API ဆက်တင်</span></h2>
                <p class="text-[11px] text-gray-500 mb-4 italic">စနစ်မှပေးထားသော API များအလုပ်မလုပ်ပါက သင်၏ကိုယ်ပိုင် API Key ကို ဤနေရာတွင်ထည့်သွင်းသုံးစွဲနိုင်ပါသည်။</p>
                <input type="password" id="ukey" placeholder="ကိုယ်ပိုင် API Key ထည့်ရန်" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#bf953f] transition"/>
            </div>

            <div class="md:col-span-2 premium-card p-8 md:p-12 text-center">
                <h1 class="text-5xl font-black mb-2 italic gold-grad tracking-tighter">JOKER SRT</h1>
                <p class="text-[10px] tracking-[0.4em] text-gray-400 mb-10 uppercase">AI ဖြင့် မြန်မာစာတန်းထိုးပြုလုပ်စနစ်</p>

                <div class="space-y-6">
                    <div class="text-left">
                        <label for="f" class="block w-full p-10 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition text-center">
                            <span id="fn" class="text-gray-400 font-medium">ဗီဒီယို သို့မဟုတ် အသံဖိုင်ရွေးချယ်ပါ</span>
                        </label>
                        <input type="file" id="f" accept="video/*,audio/*" class="hidden" onchange="document.getElementById('fn').innerText=this.files[0].name"/>
                    </div>

                    <button onclick="go()" id="btn" class="btn-gold w-full py-5 rounded-full font-bold uppercase tracking-widest text-sm">စာတန်းထိုးထုတ်မည်</button>
                    <div id="st" class="text-xs text-gray-500 italic h-4"></div>
                </div>

                <div id="resBox" class="hidden mt-10 animate-fade-in text-left">
                    <hr class="mb-6 border-gray-100">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-gray-700">ရလဒ် (SRT Format)</span>
                        <div class="flex gap-4">
                            <button onclick="cp()" class="text-xs text-[#aa771c] hover:underline font-bold">📋 ကော်ပီကူးမည်</button>
                            <button onclick="dl()" class="text-xs text-[#aa771c] hover:underline font-bold">💾 ဒေါင်းလုဒ်ဆွဲမည်</button>
                        </div>
                    </div>
                    <textarea id="res" class="w-full h-64 p-5 outline-none text-gray-600 leading-relaxed" readonly></textarea>
                </div>
            </div>

        </div>

        <script>
            let txt = "";
            async function go() {
                const f = document.getElementById('f').files[0];
                if(!f) return alert("ဖိုင်အရင်ရွေးချယ်ပေးပါဗျ!");
                const btn = document.getElementById('btn');
                const st = document.getElementById('st');
                
                btn.disabled = true; st.innerText = "🚀 AI က စာတန်းထိုးပြုလုပ်နေပါပြီ၊ ခေတ္တစောင့်ဆိုင်းပေးပါ...";
                
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
                    st.innerText = "✨ အောင်မြင်စွာပြုလုပ်ပြီးစီးပါပြီ!";
                } catch(e) {
                    st.innerText = "❌ အမှားအယွင်းရှိနေပါသည်- " + e.message;
                    alert("အမှားရှိနေပါတယ်- " + e.message);
                } finally { btn.disabled = false; }
            }
            function cp() { navigator.clipboard.writeText(txt); alert("ကော်ပီကူးယူပြီးပါပြီ!"); }
            function dl() {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([txt]));
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
