// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enhanceText") {
    enhanceSelectedText(request.promptId, request.selectedText)
      .then((enhancedText) => {
        appendTranslatedText(enhancedText)
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

// Function to append translated text in a new div
function appendTranslatedText(translatedText) {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer

    // Find the common parent container that contains the entire selection
    let targetElement = container
    if (container.nodeType === 3) {
      // Text node
      targetElement = container.parentElement
    }

    // Get all selected nodes
    const selectedNodes = []
    const nodeIterator = document.createNodeIterator(targetElement, NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (node) {
        return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      },
    })

    let currentNode
    while ((currentNode = nodeIterator.nextNode())) {
      selectedNodes.push(currentNode)
    }

    // Find the last selected block element
    const lastSelectedBlock = selectedNodes.reverse().find((node) => /^(p|div|article|section|main|h[1-6]|li)$/i.test(node.tagName)) || targetElement

    // Create translation div
    const translationDiv = document.createElement("div")
    translationDiv.classList.add("anuggaha-translation")
    translationDiv.style.cssText = `
      margin: 10px 0;
      padding: 10px;
      background-color: #f8f9fa;
      border-left: 3px solid #2DD4BF;
      font-family: Arial, sans-serif;
      position: relative;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
    `

    // Add close button
    const closeButton = document.createElement("button")
    closeButton.innerHTML = "×"
    closeButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      padding: 0 5px;
      line-height: 1;
    `
    closeButton.onclick = () => translationDiv.remove()

    // Add translation content
    const content = document.createElement("div")
    content.innerHTML = translatedText
    content.style.cssText = `
      margin-right: 20px;
      line-height: 1.5;
    `

    // Assemble the translation div
    translationDiv.appendChild(closeButton)
    translationDiv.appendChild(content)

    // Insert after the last selected block
    try {
      if (lastSelectedBlock === document || lastSelectedBlock === document.documentElement) {
        document.body.appendChild(translationDiv)
      } else {
        if (lastSelectedBlock.nextSibling) {
          lastSelectedBlock.parentNode.insertBefore(translationDiv, lastSelectedBlock.nextSibling)
        } else {
          lastSelectedBlock.parentNode.appendChild(translationDiv)
        }
      }
    } catch (error) {
      console.error("[ANUGGAHA] Error appending translation:", error)
      document.body.appendChild(translationDiv)
    }
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
