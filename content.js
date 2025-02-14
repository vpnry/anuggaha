// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enhanceText") {
    enhanceSelectedText(request.promptId, request.selectedText)
      .then((enhancedText) => {
        replaceSelectedText(enhancedText)
        sendResponse({ success: true })
      })
      .catch((error) => {
        console.error("Error enhancing text:", error)
        showErrorNotification(error.message)
        sendResponse({ success: false, error: error.message })
      })
    return true // Indicates that the response is asynchronous
  }
})

// Function to enhance selected text
async function enhanceSelectedText(promptId, selectedText) {
  const lineBreakText = selectedText.replaceAll("  ", "\n<br><br>")
  console.log("[ANUGGAHA] task:", promptId, "Selected text:", lineBreakText)
  try {
    const response = await chrome.runtime.sendMessage({
      action: "enhanceText",
      promptId: promptId,
      selectedText: lineBreakText,
    })

    if (response.success) {
      const textResponse = response.enhancedText.text
      console.log("[ANUGGAHA] text response: %c" + textResponse, "color: green;")
      console.log("%c[ANUGGAHA] full AI response:", "color: yellow;", response)
      return textResponse
    } else {
      throw new Error(response.error || "Unknown error occurred")
    }
  } catch (error) {
    console.error("Error in enhanceSelectedText:", error)
    throw error
  }
}

// Function to replace the selected text with enhanced text
function replaceSelectedText(enhancedText) {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()

    // Create a temporary container
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = enhancedText

    // Create a document fragment to hold all nodes
    const fragment = document.createDocumentFragment()

    // Move all nodes to the fragment (maintains order)
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }

    // Insert the entire fragment at once
    range.insertNode(fragment)

    selection.removeAllRanges()
  }
}

// Function to show error notification
function showErrorNotification(message) {
  const notification = document.createElement("div")
  notification.textContent = `Error: ${message}`
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #ff4444;
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 9999;
  `
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.remove()
  }, 5000)
}
