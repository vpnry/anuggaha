import { DEFAULT_PROMPTS } from "./defaultPrompts.js"
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "./GoogleGenerativeAI.mjs"

const safetySettingsGemini = [
  {
    category: "HARM_CATEGORY_CIVIC_INTEGRITY",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_NONE",
  },
]

let selectedAiModel = "gemini-1.5-pro"

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "anuggaha",
    title: "Anuggaha",
    contexts: ["selection"],
  })

  DEFAULT_PROMPTS.forEach((prompt) => {
    chrome.contextMenus.create({
      id: prompt.id,
      parentId: "anuggaha",
      title: prompt.title,
      contexts: ["selection"],
    })
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (DEFAULT_PROMPTS.some((prompt) => prompt.id === info.menuItemId)) {
    const prompt = DEFAULT_PROMPTS.find((prompt) => prompt.id === info.menuItemId)
    if (prompt) {
      if (!prompt.id.startsWith("divider")) {
        chrome.tabs.sendMessage(tab.id, {
          action: "enhanceText",
          promptId: info.menuItemId,
          selectedText: info.selectionText,
        })
      }
    }
  }
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enhanceText") {
    console.log(request.promptId, request.selectedText)
    enhanceTextWithRateLimit(request.promptId, request.selectedText)
      .then((enhancedText) => {
        sendResponse({ success: true, enhancedText })
      })
      .catch((error) => {
        console.error("Error enhancing text:", error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Indicates that the response is asynchronous
  }
})

async function sendPromptToGemini(apiKey, model, safetySettingsInput, systemPromptInput, textInput) {
  const genAI = new GoogleGenerativeAI(apiKey)

  const modelPost = genAI.getGenerativeModel({
    model: model,
    // systemInstruction: systemPromptInput,
    safetySettings: safetySettingsInput,
  })

  try {
    const prompt = `${systemPromptInput}\n\n${textInput}`
    const result = await modelPost.generateContent(prompt)

    if (!result.response) {
      const errorBody = "No response propert in the response"
      throw new Error(`HTTP error! status: ${result.response.status}, body: ${errorBody}`)
    }

    if (result.response.text) {
      return { ok: true, text: result.response.text(), fullAIRes: result, model: model }
    } else {
      throw new Error("Unexpected response structure")
    }
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}

async function sendPromptToGemini2(apiKey, model, safetySettingsInput, systemPromptInput, textInput) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  let requestBody = {
    system_instruction: {
      parts: { text: systemPromptInput },
    },
    contents: [
      {
        role: "user",
        parts: [{ text: textInput }],
      },
    ],
    safetySettings: safetySettingsInput,
  }

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()
    console.log("API Response:", data)
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const result = data.candidates[0].content.parts[0].text
      return { ok: true, text: result, fullAIRes: data }
    } else {
      throw new Error("Unexpected response structure")
    }
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}

async function enhanceTextWithLLM(promptId, textInput) {
  const { googleApiStudioKey } = await chrome.storage.sync.get(["googleApiStudioKey"])

  if (!googleApiStudioKey) {
    throw new Error("Google AI Studio key not set. Please set it in the extension options.")
  }
  // update selected model
  chrome.storage.sync.get(["aiModel"], (data) => {
    if (data.aiModel) {
      selectedAiModel = data.aiModel
    }
  })

  const systemPrompt = DEFAULT_PROMPTS.find((p) => p.id === promptId).prompt

  try {
    const response = await sendPromptToGemini(googleApiStudioKey, selectedAiModel, safetySettingsGemini, systemPrompt, textInput)

    if (!response.ok) {
      throw new Error("API request failed")
    }
    return {
      text: response.text,
      model: selectedAiModel,
      fullAIRes: response.fullAIRes,
    }
  } catch (error) {
    throw new Error(`Failed to enhance text. Please check your API key and try again. Error: ${error.message}`)
  }
}

// Implement rate limiting
const MAX_REQUESTS_PER_MINUTE = 10
let requestCount = 0
let lastResetTime = Date.now()

function checkRateLimit() {
  const now = Date.now()
  if (now - lastResetTime > 60000) {
    requestCount = 0
    lastResetTime = now
  }

  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error("Rate limit exceeded. Please try again later.")
  }

  requestCount++
}

// Wrap the enhanceTextWithLLM function with rate limiting
const enhanceTextWithRateLimit = async (promptId, text) => {
  checkRateLimit()
  return enhanceTextWithLLM(promptId, text)
}
