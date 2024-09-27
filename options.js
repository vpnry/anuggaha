const filterModelStartWith = "models/gemini-1.5-"
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
          if (model.name.startsWith(filterModelStartWith)) {
            const mName = model.name.replace("models/", "")
            _aiModels[mName] = model.displayName + " = " + mName
          }
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

  for (const model in aiModels) {
    const option = document.createElement("option")
    option.value = model
    option.text = aiModels[model]
    aiModelSelect.add(option)
  }
  const status = document.getElementById("statusKey")
  status.textContent = "Recommended: select the latest pro-exp model for an up to date performance.   "

  chrome.storage.sync.get(["aiModel"], (data) => {
    if (data.aiModel && aiModels[data.aiModel]) {
      // check stored for model
      document.getElementById("aiModel").value = data.aiModel
    } else {
      // use and save the first model in aiModels
      const modelEntries = Object.entries(aiModels)
      if (modelEntries.length > 1) {
        const sortedAiModels = modelEntries
          .sort(([, aValue], [, bValue]) => aValue.localeCompare(bValue)) // Sort by display name
          .reduce((obj, [key, value]) => {
            obj[key] = value
            return obj
          }, {})

        console.log("raw", aiModels)
        console.log("sorted", sortedAiModels)

        const modelKeys = Object.keys(sortedAiModels)
        let chooseModel = modelKeys[0]

        // Find the last key with "pro-exp" and select it
        for (let i = modelKeys.length - 1; i >= 0; i--) {
          if (modelKeys[i].includes("pro-exp")) {
            chooseModel = modelKeys[i]
            break
          }
        }

        document.getElementById("aiModel").value = chooseModel
        chrome.storage.sync.set({ aiModel: chooseModel }, () => {
          console.log("Saved default model", chooseModel)
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
