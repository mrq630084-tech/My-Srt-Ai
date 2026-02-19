export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const formData = await request.formData();
      const audioFile = formData.get("file");
      
      const response = await env.AI.run("@cf/openai/whisper", {
        audio: [...new Uint8Array(await audioFile.arrayBuffer())],
      });
      
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Website UI (ရွှေရောင် Design)
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium AI Subtitle Generator</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); }
            .premium-card { background: #e5e7eb; border-radius: 30px; box-shadow: 20px 20px 60px #c2c5ca, -20px -20px 60px #ffffff; }
            .gold-text { background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; }
            .platinum-btn { background: linear-gradient(145deg, #ffffff, #d1d5db); box-shadow: 5px 5px 15px #c2c5ca, -5px -5px 15px #ffffff; transition: all 0.3s ease; color: #4b5563; }
            .platinum-btn:active { box-shadow: inset 5px 5px 10px #c2c5ca, inset -5px -5px 10px #ffffff; }
        </style>
    </head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <div class="premium-card p-10 w-full max-w-md text-center">
            <h1 class="text-3xl mb-8 gold-text uppercase tracking-widest">AI Subtitle Maker</h1>
            <input type="file" id="audioInput" accept="audio/*" class="mb-6 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-200 file:text-gray-700 cursor-pointer"/>
            <button onclick="uploadAudio()" id="btn" class="platinum-btn py-3 px-8 rounded-full font-bold uppercase tracking-wider w-full mb-6">Convert to Text</button>
            <div id="status" class="text-xs font-medium text-gray-500 italic mb-4"></div>
            <textarea id="result" class="w-full h-48 p-4 bg-gray-100 rounded-2xl text-gray-700 text-sm shadow-inner hidden focus:outline-none" readonly></textarea>
        </div>
        <script>
            async function uploadAudio() {
                const fileInput = document.getElementById('audioInput');
                const status = document.getElementById('status');
                const resultArea = document.getElementById('result');
                const btn = document.getElementById('btn');
                if (!fileInput.files[0]) return alert("Please select a file!");
                status.innerText = "✨ AI is analyzing... ✨";
                btn.disabled = true;
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                try {
                    const response = await fetch(window.location.href, { method: 'POST', body: formData });
                    const data = await response.json();
                    status.innerText = "Success!";
                    resultArea.value = data.vtt || data.text || JSON.stringify(data);
                    resultArea.classList.remove('hidden');
                } catch (e) { status.innerText = "Error: " + e.message; }
                finally { btn.disabled = false; }
            }
        </script>
    </body>
    </html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  }
};
