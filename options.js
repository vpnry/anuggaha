const filterModelStartWith = "models/gemini-2.0-"
const markedKey = "**** saved key ****"

let aiModels = {
  // "gemini-1.5-pro-exp-0827": "gemini-1.5-pro-exp-0827",
  // "gemini-1.5-pro": "gemini-1.5-pro",
  // flash models (the pro ones are much better)
  // "gemini-1.5-flash-exp-0827": "gemini-1.5-flash-exp-0827",
  // "gemini-1.5-flash": "gemini-1.5-flash",
}

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
  if (googleApiStudioKey != markedKey) {
    chrome.storage.sync.set({ googleApiStudioKey }, async () => {
      // Update status to let user know options were saved.
      await restoreOptions()
      const status = document.getElementById("statusKey")
      status.textContent = "Updating models, please wait..."
    })
  }

  // --- models
  const selectedAiModel = document.getElementById("aiModel").value
  if (selectedAiModel) {
    chrome.storage.sync.set({ aiModel: selectedAiModel }, () => {
      const status = document.getElementById("statusModel")
      status.textContent = "Selected model is saved."
      console.log("Selected:", selectedAiModel)
      setTimeout(() => {
        status.textContent = ""
      }, 2000)
    })
  } else {
    console.log("No model selected.")
  }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restoreOptions() {
  chrome.storage.sync.get({ googleApiStudioKey: "" }, async (items) => {
    document.getElementById("googleApiStudioKey").value = ""

    // Fetch and update aiModels if the key is available
    if (items.googleApiStudioKey) {
      document.getElementById("googleApiStudioKey").value = markedKey
      const modelList = await fetchModelList(items.googleApiStudioKey)
      if (modelList.models) {
        const _aiModels = {}
        modelList.models.forEach((model) => {
          const mName = model.name.replace("models/", "")
          _aiModels[mName] = model.displayName + " = " + mName
        })
        aiModels = _aiModels
        // Update the select element with the new models
        updateAiModelSelect()
      }
    } else {
      updateAiModelSelect()
    }
  })
}

function updateAiModelSelect() {
  const aiModelSelect = document.getElementById("aiModel")
  aiModelSelect.innerHTML = ""

  // Split models into marked and non-marked
  const modelEntries = Object.entries(aiModels)
  const markedModels = modelEntries.filter(([key]) => key.startsWith(filterModelStartWith.replace("models/", "")))
  const otherModels = modelEntries.filter(([key]) => !key.startsWith(filterModelStartWith.replace("models/", "")))

  // Sort both arrays
  markedModels.sort(([, a], [, b]) => a.localeCompare(b))
  otherModels.sort(([, a], [, b]) => a.localeCompare(b))

  // Create optgroup for marked models
  if (markedModels.length > 0) {
    const markedGroup = document.createElement("optgroup")
    markedGroup.label = "Recommended Models"
    markedModels.forEach(([key, value]) => {
      const option = document.createElement("option")
      option.value = key
      option.text = value
      markedGroup.appendChild(option)
    })
    aiModelSelect.appendChild(markedGroup)
  }

  // Create optgroup for other models
  if (otherModels.length > 0) {
    const otherGroup = document.createElement("optgroup")
    otherGroup.label = "Other Models"
    otherModels.forEach(([key, value]) => {
      const option = document.createElement("option")
      option.value = key
      option.text = value
      otherGroup.appendChild(option)
    })
    aiModelSelect.appendChild(otherGroup)
  }

  const status = document.getElementById("statusKey")
  status.textContent = "Recommended: select the latest pro-exp model for up to date performance."

  chrome.storage.sync.get(["aiModel"], (data) => {
    if (data.aiModel && aiModels[data.aiModel]) {
      document.getElementById("aiModel").value = data.aiModel
    } else {
      // Select the first pro-exp model if available
      const proExpModel = markedModels.find(([key]) => key.includes("-exp"))
      if (proExpModel) {
        document.getElementById("aiModel").value = proExpModel[0]
        chrome.storage.sync.set({ aiModel: proExpModel[0] }, () => {
          console.log("Saved default model", proExpModel[0])
        })
      } else if (markedModels.length > 0) {
        // Fall back to first marked model
        document.getElementById("aiModel").value = markedModels[0][0]
        chrome.storage.sync.set({ aiModel: markedModels[0][0] }, () => {
          console.log("Saved default model", markedModels[0][0])
        })
      }
    }
  })
}

function onDOMContentLoadedFn() {
  // Initial population of aiModelSelect will happen in restoreOptions after fetching the models
  setTimeout(() => {
    restoreOptions()
  }, 0)
}

document.addEventListener("DOMContentLoaded", onDOMContentLoadedFn)
document.getElementById("save").addEventListener("click", saveOptions)
