// /api/send.js (Vercel 版本)

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  const userMessage = request.body.message;
  const n8nWebhookUrl = "https://n8n.harvestwize.com/webhook/indonesia_birth"; // 請再次確認此 URL 正確

  try {
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    // 【重要修改】解析 n8n 回傳的資料
    const n8nData = await n8nResponse.json();

    // 【重要修改】從回傳的資料中，提取我們真正想要的 'output' 文字
    // n8nData[0] -> 取得陣列中的第一個元素 (物件)
    // .output -> 取得該物件中 'output' 欄位的值
    const outputText = n8nData[0].output;

    // 【重要修改】只將提取出來的文字，用標準格式回傳給前端
    response.status(200).json({ response: outputText });
  } catch (error) {
    console.error("Error in Vercel function:", error);
    response.status(500).json({ message: "Internal Server Error" });
  }
}
