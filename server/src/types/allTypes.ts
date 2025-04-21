export interface APIResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

export interface Patient {
  name: string;
  age: number;
  location: string;
  nurse: string;
  condition: string;
  subjectPronoun: string;
  objectPronoun: string;
}

export interface ChatRequestBody {
  messages: { content: string; role: "system" | "user" | "assistant" }[];
}

export interface ChatResponse {
  message: string;
  keywordMessage: string | null;
  error?: string;
}

export interface Link {
  url: string;
  title: string;
}

export interface Response {
  type: "alert" | "info" | "support";
  text: string;
  link?: Link;
}

export interface KeywordResponse {
  keywords: string[];
  response: Response;
}

export interface ResponseWithLink extends Response {
  link?: Link;
}
