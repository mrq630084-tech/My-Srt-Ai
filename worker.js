export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });

        // Whisper AI ကို Run ခြင်း
        const response = await env.AI.run("@cf/openai/whisper", {
          audio: [...new Uint8Array(await file.arrayBuffer())],
        });
        
        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "AI Error: " + err.message }), { status: 500 });
      }
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Joker SRT - Premium AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: radial-gradient(circle at center, #bf953f, #aa771c, #2a1f07); min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
            .glass-card { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); border-radius: 40px; border: 1px solid rgba(255, 246, 186, 0.2); box-shadow: 0 25px 50px rgba(0,0,0,0.5); padding: 2.5rem; width: 100%; max-width: 450px; text-align: center; }
            .gold-title { font-size: 3rem; font-weight: 900; background: linear-gradient(to bottom, #fff6ba, #bf953f, #8a6e2f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 3px; }
            .platinum-btn { background: linear-gradient(145deg, #ffffff, #d1d5db); border-radius: 50px; color: #1a202c; font-weight: bold; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
            .platinum-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            textarea { background: rgba(0, 0, 0, 0.3); color: #fcf6ba; border: 1px solid rgba(191, 149, 63, 0.2); scrollbar-width: thin; }
            .action-btn { font-size: 10px; padding: 5px 12px; border-radius: 20px; color: white; border: 1px solid rgba(255,255,255,0.3); transition: 0.2s; }
            .action-btn:hover { background: rgba(255,255,255,0.1); }
        </style>
    </head>
    <body class="p-4">
        <div class="glass-card">
            <h1 class="gold-title">JOKER SRT</h1>
            <p class="text-white/60 text-[10px] uppercase tracking-[0.4em] mb-8">Professional AI Subtitle Tool</p>
            
            <div class="mb-6">
                <label for="fileInput" class="cursor-pointer bg-white/5 hover:bg-white/10 text-white/90 px-8 py-4 rounded-3xl border border-white/10 block transition text-sm">
                    📁 Audio သို့မဟုတ် Video ရွေးပါ
                </label>
                <input type="file" id="fileInput" accept="audio/*,video/*" class="hidden" onchange="document.getElementById('fileName').innerText = this.files[0].name"/>
                <p id="fileName" class="text-white/40 text-[10px] mt-3 italic"></p>
            </div>

            <button onclick="processFile()" id="btn" class="platinum-btn py-4 px-10 w-full uppercase tracking-widest text-xs mb-6">
                Generate Subtitles
            </button>

            <div id="status" class="text-xs text-white/60 mb-4 h-4"></div>

            <div id="resultBox" class="hidden">
                <div class="flex justify-end gap-2 mb-2">
                    <button onclick="copyText()" class="action-btn">📋 Copy</button>
                    <button onclick="downloadSRT()" class="action-btn">💾 Download SRT</button>
                </div>
                <textarea id="result" class="w-full h-48 p-4 rounded-2xl text-[11px] outline-none text-left" readonly></textarea>
            </div>
        </div>

        <script>
            let currentText = "";

            async function processFile() {
                const fileInput = document.getElementById('fileInput');
                const status = document.getElementById('status');
                const resultBox = document.getElementById('resultBox');
                const resultArea = document.getElementById('result');
                const btn = document.getElementById('btn');

                if (!fileInput.files[0]) return alert("ဖိုင်အရင်ရွေးပါဗျ!");
                
                status.innerText = "✨ Joker AI က စတင်လုပ်ဆောင်နေပါပြီ... ✨";
                btn.disabled = true;
                resultBox.classList.add('hidden');
                
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                
                try {
                    const response = await fetch(window.location.href, { method: 'POST', body: formData });
                    const data = await response.json();
                    
                    if (data.error) throw new Error(data.error);
                    
                    currentText = data.text || "စာသားရှာမတွေ့ပါ။ အသံအရည်အသွေးကို ပြန်စစ်ပေးပါ။";
                    resultArea.value = currentText;
                    status.innerText = "အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ!";
                    resultBox.classList.remove('hidden');
                } catch (e) {
                    status.innerText = "Error: " + e.message;
                    alert("ဖိုင်အရွယ်အစား ကြီးလွန်းတာ (သို့) AI Error ဖြစ်နိုင်ပါတယ်ဗျ။");
                } finally {
                    btn.disabled = false;
                }
            }

            function copyText() {
                navigator.clipboard.writeText(currentText);
                alert("စာသားများကို Copy ကူးပြီးပါပြီ!");
            }

            function downloadSRT() {
                const element = document.createElement('a');
                const file = new Blob([currentText], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = "joker_subtitle.srt";
                document.body.appendChild(element);
                element.click();
            }
        </script>
    </body>
    </html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
