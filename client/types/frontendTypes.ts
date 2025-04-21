export type KeywordMessage = {
  type: string;
  text: string;
  link?: {
    url: string;
    title: string;
  };
};

export type KeywordResource = {
  type: string;
  text: string;
  link?: {
    url: string;
    title: string;
  };
};

export type ResponseWithLink = {
  message: string;
  keywordMessage: KeywordMessage | null;
  keywordResource: KeywordResource | null;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};
