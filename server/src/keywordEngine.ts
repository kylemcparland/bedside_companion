import { KeywordResponse, ResponseWithLink } from "./types/allTypes";

// Keyword + response pairs array:
const keywordResponses: KeywordResponse[] = [
  // ALERTS...
  {
    keywords: ["cold", "chilly", "freezing", "blanket"],
    response: {
      type: "alert",
      text: "If you're feeling cold, please let a staff member know. This unit has a blanket warmer, and a PCA can bring you a warm one.",
    },
  },
  {
    keywords: ["bathroom", "washroom", "restroom", "pee"],
    response: {
      type: "alert",
      text: "If you need help getting to the washroom, please press the **red call button** and a staff member will assist you safely.",
    },
  },
  // INFO...
  {
    keywords: ["water", "thirsty", "drink"],
    response: {
      type: "info",
      text: "If you'd like some water, feel free to ask your nurse or PCA. They're happy to help.",
    },
  },
  // RESOURCE LINKS...
  {
    keywords: ["lonely", "isolation", "alone"],
    response: {
      type: "support",
      text: "Feeling lonely is tough. You're not alone, and there are resources to help.",
      link: {
        url: "https://bc.cmha.ca/documents/coping-with-loneliness/",
        title:
          "📖 Helpful Resource: Coping with Loneliness - Canadian Mental Health Association",
      },
    },
  },
];

// Check keyword triggers and return matched responses...
export function checkKeywordTriggers(message: string): ResponseWithLink | null {
  const lower = message.toLowerCase();

  for (let entry of keywordResponses) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response; // Return the entire ResponseWithLink object...
    }
  }

  // No match found:
  return null;
}
