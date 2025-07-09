// /api/send.js (修正後的 Vercel 版本)
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
    let outputText = "";

    console.log("n8n 回傳的原始資料:", JSON.stringify(n8nData, null, 2));

    // 【修正版防禦性檢查】
    // 根據 n8n 的 "Respond to Webhook" 節點，資料結構應該是直接的 object
    if (n8nData && typeof n8nData === "object") {
      // 方法1: 直接檢查 output 屬性
      if (n8nData.output && typeof n8nData.output === "string") {
        outputText = n8nData.output;
        console.log("成功從 n8nData.output 取得資料");
      }
      // 方法2: 檢查是否為陣列格式（以防萬一）
      else if (
        Array.isArray(n8nData) &&
        n8nData.length > 0 &&
        n8nData[0] &&
        n8nData[0].output
      ) {
        outputText = n8nData[0].output;
        console.log("成功從 n8nData[0].output 取得資料");
      }
      // 方法3: 檢查 AI Agent2 的輸出（根據你的 n8n 流程）
      else if (n8nData.json && n8nData.json.output) {
        outputText = n8nData.json.output;
        console.log("成功從 n8nData.json.output 取得資料");
      }
      // 方法4: 檢查其他可能的屬性
      else if (n8nData.response) {
        outputText = n8nData.response;
        console.log("成功從 n8nData.response 取得資料");
      } else if (n8nData.message) {
        outputText = n8nData.message;
        console.log("成功從 n8nData.message 取得資料");
      } else {
        // 如果都沒找到，嘗試找到任何字串值
        const possibleOutput = findStringValue(n8nData);
        if (possibleOutput) {
          outputText = possibleOutput;
          console.log(
            "從物件中找到字串值:",
            possibleOutput.substring(0, 100) + "..."
          );
        } else {
          console.warn("無法在回傳資料中找到有效的輸出內容");
          outputText = "抱歉，我這次沒有得到有效的回覆，請您換個方式再問一次。";
        }
      }
    } else {
      console.warn("n8n 回傳的資料格式異常:", typeof n8nData);
      outputText = "抱歉，系統回傳的資料格式有問題，請稍後再試。";
    }

    // 將最終的文字回傳給前端
    response.status(200).json({ response: outputText });
  } catch (error) {
    console.error("Error in Vercel function:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    response.status(500).json({
      message: "Internal Server Error",
      error:
        process.env.NODE_ENV === "development" ? error.message : "系統錯誤",
    });
  }
}

// 輔助函數：在物件中遞迴尋找字串值
function findStringValue(obj, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return null;

  if (typeof obj === "string" && obj.length > 0) {
    return obj;
  }

  if (typeof obj === "object" && obj !== null) {
    // 優先檢查常見的輸出屬性名稱
    const priorityKeys = ["output", "response", "message", "text", "content"];

    for (const key of priorityKeys) {
      if (obj[key] && typeof obj[key] === "string") {
        return obj[key];
      }
    }

    // 如果沒找到，遞迴檢查所有屬性
    for (const [key, value] of Object.entries(obj)) {
      if (!priorityKeys.includes(key)) {
        const result = findStringValue(value, maxDepth, currentDepth + 1);
        if (result) return result;
      }
    }
  }

  return null;
}
