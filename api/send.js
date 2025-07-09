// /api/send.js (Vercel 最終健壯版本)

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  const userMessage = request.body.message;
  const n8nWebhookUrl = "https://n8n.harvestwize.com/webhook/indonesia_birth";

  try {
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const n8nData = await n8nResponse.json();
    let outputText = ""; // 先建立一個空字串變數

    // 【重要修正】增加一個防禦性檢查
    // 檢查 n8nData 是否為一個陣列、長度大於 0、且第一個元素真的有 output 屬性
    if (Array.isArray(n8nData) && n8nData.length > 0 && n8nData[0].output) {
      // 如果條件都滿足，才去讀取 output 的內容
      outputText = n8nData[0].output;
    } else {
      // 如果 n8n 回傳的是空陣列或其他非預期格式，就給一個預設的友好提示
      console.warn("Received an empty or invalid response from n8n:", n8nData);
      outputText = "抱歉，我這次沒有得到有效的回覆，請您換個方式再問一次。";
    }

    // 將最終的文字（無論是成功取得的還是預設提示）回傳給前端
    response.status(200).json({ response: outputText });
  } catch (error) {
    console.error("Error in Vercel function:", error);
    response.status(500).json({ message: "Internal Server Error" });
  }
}
