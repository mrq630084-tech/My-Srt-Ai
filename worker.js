export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const audioFile = formData.get("file");
        if (!audioFile) return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });

        const response = await env.AI.run("@cf/openai/whisper", {
          audio: [...new Uint8Array(await audioFile.arrayBuffer())],
        });
        
        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Joker SRT - AI Subtitle Maker</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { 
                background: radial-gradient(circle at center, #bf953f, #aa771c, #4a370e); 
                min-height: screen;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(15px);
                border-radius: 40px;
                border: 1px solid rgba(255, 246, 186, 0.3);
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                padding: 3rem;
                width: 100%;
                max-width: 450px;
                text-align: center;
            }
            .gold-title {
                font-size: 3rem;
                font-weight: 900;
                background: linear-gradient(to bottom, #fff6ba, #bf953f, #8a6e2f);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 2px 4px 10px rgba(0,0,0,0.2);
                letter-spacing: 2px;
            }
            .platinum-btn {
                background: linear-gradient(145deg, #ffffff, #d1d5db);
                border-radius: 50px;
                color: #2d3748;
                font-weight: bold;
                transition: 0.3s;
                box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            }
            .platinum-btn:active { transform: scale(0.95); }
            textarea {
                background: rgba(0, 0, 0, 0.2);
                color: #fcf6ba;
                border: 1px solid rgba(191, 149, 63, 0.3);
            }
        </style>
    </head>
    <body class="p-6">
        <div class="glass-card">
            <h1 class="gold-title mb-1">JOKER SRT</h1>
            <p class="text-white/80 text-xs uppercase tracking-[0.3em] mb-10">AI Subtitle Maker</p>
            
            <div class="mb-8">
                <label for="audioInput" class="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition text-sm">
                    📁 Choose Audio File
                </label>
                <input type="file" id="audioInput" accept="audio/*" class="hidden" onchange="document.getElementById('fileName').innerText = this.files[0].name"/>
                <p id="fileName" class="text-white/50 text-[10px] mt-4 italic"></p>
            </div>

            <button onclick="uploadAudio()" id="btn" class="platinum-btn py-4 px-10 w-full uppercase tracking-widest text-sm">
                Convert to Text
            </button>

            <div id="status" class="mt-6 text-sm text-white/70 italic"></div>
            <textarea id="result" class="mt-6 w-full h-48 p-4 rounded-3xl text-xs hidden outline-none" readonly></textarea>
        </div>

        <script>
            async function uploadAudio() {
                const fileInput = document.getElementById('audioInput');
                const status = document.getElementById('status');
                const resultArea = document.getElementById('result');
                const btn = document.getElementById('btn');
                if (!fileInput.files[0]) return alert("ဖိုင်အရင်ရွေးပေးပါဗျ!");
                
                status.innerText = "✨ Joker AI is processing... ✨";
                btn.disabled = true;
                resultArea.classList.add('hidden');
                
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                
                try {
                    const response = await fetch(window.location.href, { method: 'POST', body: formData });
                    const data = await response.json();
                    status.innerText = "အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ!";
                    resultArea.value = data.vtt || data.text || "No transcription available.";
                    resultArea.classList.remove('hidden');
                } catch (e) {
                    status.innerText = "Error: " + e.message;
                } finally {
                    btn.disabled = false;
                }
            }
        </script>
    </body>
    </html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
