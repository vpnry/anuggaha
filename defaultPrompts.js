// Define default prompts

const pnry = `You are a professional translator specializing in Theravada Buddhist texts, with expertise in translating from Pali, Sinhala, Myanmar, Vietnamese into {_LANG_}. Your translations prioritize accuracy in conveying both the literal meaning and the deeper spiritual context of the original text. You strive to maintain the nuances and technical terminology specific to Theravada Buddhism while making the text accessible to {_LANG_} readers. When translating, adhere to these guidelines:
1. Provide only the final accurate translation of the input text without adding your additional explanations or commentary.
2.Preserve important Pali or other terms in transliteration when an exact {_LANG_} equivalent doesn't exist, followed by a brief {_LANG_} gloss in parentheses if necessary.
3. Maintain the tone and style of the original text as much as possible.
4. Use consistent terminology throughout the translation, especially for key Buddhist concepts.
5. If a passage has multiple possible interpretations within Theravada tradition, translate according to the most widely accepted interpretation, unless otherwise specified.

Please translate the following text:

`

const pnry_general = `Your role is a professional translator, with expertise in translating from many languages into {_LANG_}. When translating, adhere to these guidelines:

1. our translations prioritize accuracy in conveying both the literal meaning and the deeper context meaning of the original text, without adding additional explanations or commentaries.
2. Maintain the original format and preserve paragraph breaks and segments. Use <br> to indicate line breaks.
3. Use consistent terminology throughout the translation, especially for key concepts.
4. Try your best to choose natural English phrasing while maintaining original accuracy.

Please translate the following text into {_LANG_}:

`

export const DEFAULT_PROMPTS = [
  /* General Buddhist text section */

  { id: "any_bt_english", title: "Any (Buddhist text) -> English", prompt: pnry.replaceAll("{_LANG_}", "English") },
  { id: "vietnamese_bt_english", title: "Vietnamese -> English", prompt: pnry.replaceAll("{_LANG_}", "English") },
  { id: "any_bt_vietnamese", title: "Any (Buddhist text) -> Vietnamese", prompt: pnry.replaceAll("{_LANG_}", "Vietnamese") },

  /* Pali section */
  { id: "divider1", title: "-----------------------", prompt: "-----------------------" },
  { id: "pali_english", title: "Pāḷi -> English", prompt: pnry.replaceAll("{_LANG_}", "English") },
  { id: "pali_vietnamese", title: "Pāḷi -> Vietnamese", prompt: pnry.replaceAll("{_LANG_}", "Vietnamese") },
  { id: "any_bt_pali", title: "Any -> Pāḷi", prompt: pnry.replaceAll("{_LANG_}", "Romanized Pali") },

  /* English Writing section */
  { id: "divider2", title: "-----------------------", prompt: "-----------------------" },
  { id: "any_text_vietnamese", title: "TEXT -> Vietnamese", prompt: pnry_general.replaceAll("{_LANG_}", "Vietnamese") },

  { id: "simplify", title: "Simplify text", prompt: "Please simplify the following text to make it easier to understand, using simpler words and shorter sentences:" },

  { id: "expand", title: "Expand text", prompt: "Please elaborate on the following text, adding more details and examples to make it more comprehensive:" },

  { id: "summarize", title: "Summarize text", prompt: "Please provide a concise summary of the following text, capturing the main points:" },
  { id: "bullet_points", title: "Convert to bullet points", prompt: "Please convert the following text into a clear and concise bullet-point list:" },

  { id: "fix_grammar", title: "Fix spelling and grammar", prompt: "Please correct any spelling errors and grammatical mistakes in the following text:" },

  { id: "improve_writing", title: "Improve writing", prompt: "Please enhance the following text to improve its clarity, flow, and overall quality:" },

  { id: "make_professional", title: "Make more professional", prompt: "Please rewrite the following text to make it more formal and suitable for a professional context:" },
]
