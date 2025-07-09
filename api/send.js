// api/send.js
export default async function handler(request, response) {
  // 1. 只接受 POST 請求
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  // 2. 從前端請求中獲取訊息
  const userMessage = request.body.message;
  const n8nWebhookUrl = "https://n8n.harvestwize.com/webhook/indonesia_birth"; // 將您的 n8n URL 放在後端，更安全！

  try {
    // 3. 從您的伺服器向 n8n 發送請求
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        timestamp: new Date().toISOString(),
        type: "chat",
      }),
    });

    // 4. 獲取 n8n 的回應
    const data = await n8nResponse.json();

    // 5. 將 n8n 的回應傳回給前端
    response.status(200).json(data);
  } catch (error) {
    console.error("Error proxying to n8n:", error);
    response.status(500).json({ message: "Internal Server Error" });
  }
}
