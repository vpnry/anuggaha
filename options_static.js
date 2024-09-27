let aiModels = {
  "gemini-1.5-pro-exp-0827": "gemini-1.5-pro-exp-0827",
  "gemini-1.5-pro": "gemini-1.5-pro",
  // flash models (the pro ones are much better)
  "gemini-1.5-flash-exp-0827": "gemini-1.5-flash-exp-0827",
  "gemini-1.5-flash": "gemini-1.5-flash",
}

// TODO dynamic list models
// chrome.storage.sync.get("aiModel", (data) => {
//   if (data.aiModel) selectedAiModel = data.aiModel
// })

async function fetchModelList(googleApiStudioKey) {
  // https://ai.google.dev/api/models#models_list-SHELL
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/?key=${googleApiStudioKey}`)
  const data = await response.json()
  console.log(data)
  return data
}

// Saves options to chrome.storage
function saveOptions() {
  const googleApiStudioKey = document.getElementById("googleApiStudioKey").value
  chrome.storage.sync.set({ googleApiStudioKey }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status")
    status.textContent = "Options saved."
    setTimeout(() => {
      status.textContent = ""
    }, 1000)
  })

  // --- models
  const selectedAiModel = document.getElementById("aiModel").value
  chrome.storage.sync.set({ aiModel: selectedAiModel }, () => {
    const status = document.getElementById("status")
    status.textContent = "Selected model is saved."
    setTimeout(() => {
      status.textContent = ""
    }, 2000)
  })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get({ googleApiStudioKey: "" }, (items) => {
    document.getElementById("googleApiStudioKey").value = items.googleApiStudioKey
  })

  chrome.storage.sync.get("aiModel", (data) => {
    if (data.model) {
      document.getElementById("aiModel").value = data.model
    } else {
      // If no model is saved, use and save the first model in aiModels
      const firstModel = Object.keys(aiModels)[0]
      document.getElementById("aiModel").value = firstModel
      chrome.storage.sync.set({ aiModel: firstModel }, () => {
        console.log("Saved default model", firstModel)
      })
    }
  })
}

function onDOMContentLoaded() {
  const aiModelSelect = document.getElementById("aiModel")
  for (const model in aiModels) {
    const option = document.createElement("option")
    option.value = model
    option.text = aiModels[model]
    aiModelSelect.add(option)
  }
  setTimeout(() => {
    restoreOptions()
  }, 0)
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded)
document.getElementById("save").addEventListener("click", saveOptions)
