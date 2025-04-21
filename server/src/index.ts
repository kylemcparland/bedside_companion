import express, { Request, Response } from "express";
import fetch from "node-fetch";
import cors from "cors";
import { checkKeywordTriggers } from "./keywordEngine.ts";
import { APIResponse, ChatResponse, Patient } from "./types/allTypes.ts";

// Express...
const app = express();
const port: number = 5000;
app.use(cors());
app.use(express.json());

// TEST static patient info...
const patient: Patient = {
  name: "Margaret",
  age: 78,
  location: "Unit: 3A Stroke, Room: 319, Hospital: Trillium Hospital",
  nurse: "Lindsay",
  condition: "stroke",
  subjectPronoun: "she",
  objectPronoun: "her",
};

// LLM SYSTEM PROMPT...
const systemInfo = `
System:
You are a bedside companion for ${patient.name}, a ${patient.age}-year-old ${patient.condition} patient in ${patient.location}. You are a **conversational AI** named "Ivy" designed to provide emotional support and keep ${patient.objectPronoun} company. You are **not human** and **cannot offer physical comfort**, touch, or medical advice.
Always respond with empathy, validation, and companionship. Do **not** try to solve problems, give instructions, or encourage ${patient.name} to act unless ${patient.subjectPronoun} directly asks for help. If ${patient.subjectPronoun} does, gently remind ${patient.objectPronoun} to use the red call button to page a nurse or PCA.
Never assume facts that the patient has not shared. For example, if ${patient.name} says ${patient.subjectPronoun} misses someone, never assume they are deceased or gone forever.
Do not suggest medications, treatments, or activities - not even walking or getting out of bed. You may say things like “That sounds hard,” “I hear you,” or “It's okay to feel this way.” Keep your tone warm, gentle, and conversational. Your job is to listen and emotionally support.
Avoid formal language or therapist-like dialogue. Never say things like “I'm here to hold you” or “Try this.” You can say “I'm here with you” or “You're not alone.”
Always keep your responses brief, supportive, and emotionally tuned to ${patient.objectPronoun} needs. Your goal is not to assist, but to be a companion who listens and offers support.
Stay present and let ${patient.name} know ${patient.subjectPronoun} is not alone and the staff is here to help ${patient.objectPronoun} at any time.
Limit your responses to 2-3 sentences. Be present, not prescriptive.
`;

// Chat route function...
const chatHandler = async (req: Request, res: Response) => {
  const { messages } = req.body;
  console.log("Request received at: ", Date.now());
  console.log(messages);

  // Error handling if no messages...
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({
      message: "",
      keywordMessage: null,
      error: "No messages provided",
    });
  }

  // Assign newest message to variable...
  const latestUserMessage = messages[messages.length - 1]?.content;

  // Check for if any keywords were hit...
  const keywordMatch = checkKeywordTriggers(latestUserMessage);

  // Chat history + system prompt:
  const fullMessages = [
    {
      role: "system",
      content: systemInfo,
    },
    ...messages,
  ];

  // Sent prompt + chat history to LLM...
  try {
    const start = Date.now();
    const response = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:7b",
        messages: fullMessages,
        temperature: 0.5,
      }),
    });

    // Log response time...
    console.log("API call took", Date.now() - start, "ms");

    // Assign response from LLM...
    const data = (await response.json()) as APIResponse;

    // Assign first "choice" in response, if any...
    if (data.choices && data.choices.length > 0) {
      // console.log(data.choices); // => (deepseek returns a single choice)
      let reply = data.choices[0].message.content;

      // Filter <thinking> and double-quotations out of response...
      reply = reply
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/["]/g, "")
        .trim();

      // Construct response object...
      const chatResponse: ChatResponse = {
        message: reply,
        keywordMessage: keywordMatch ? keywordMatch.text : null,
      };

      // Return response object...
      res.json(chatResponse);
    } else {
      // Error!
      res.status(500).json({
        message: "Something went wrong",
        keywordMessage: null,
      });
    }
  } catch (error) {
    // Error!
    console.error("Error contacting model:", error);
    res.status(500).json({
      message: "Failed to contact model",
      keywordMessage: null,
    });
  }
};

// Attach chatHandler function to Express...
app.post("/chat", chatHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
