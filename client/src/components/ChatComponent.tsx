import React, { useState, useRef, useEffect } from "react";
import "./ChatComponent.css";

import { Message, ResponseWithLink } from "../../types/frontendTypes";

const ChatComponent = () => {
  // State types
  const [message, setMessage] = useState<string>("");
  const [response, setResponse] = useState<ResponseWithLink>({
    message: "",
    keywordMessage: null,
    keywordResource: null,
  }); // ResponseWithLink type for response
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = { role: "user", content: message };
    const updatedHistory = [...chatHistory, newMessage];
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setChatHistory([...updatedHistory, assistantMessage]);
      setResponse({
        message: data.message,
        keywordMessage: data.keywordMessage,
        keywordResource: data.keywordResource || null,
      });
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
      setResponse({
        message: "Sorry, something went wrong.",
        keywordMessage: null,
        keywordResource: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="chatContainer">
      <div className="chatWindow">
        <div className={`chatBubble assistant`}>
          <strong>
            👋 Hello, my name is Ivy — your onboard AI assistant at Trillium
            Hospital.
          </strong>
          <br />
          You're currently in <strong>3A Stroke, Room 319</strong>. I'm here to
          keep you company, answer simple questions, or just listen if you feel
          like talking. It's okay to feel overwhelmed — you're not alone.
          <br />
          I'll be here whenever you need me, and I can also help remind you how
          to reach staff if needed. Just type a message, and we'll chat.
        </div>

        {chatHistory.map((msg, index) => (
          <div key={index} className={`chatBubble ${msg.role}`}>
            {msg.content}
          </div>
        ))}

        {response.keywordMessage && (
          <div
            className={`keywordMessage ${
              response.keywordMessage.type || "info"
            }`}
          >
            <strong>Note:</strong> {response.keywordMessage.text}
            {/* Check if there is a link inside keywordMessage */}
            {response.keywordMessage.link && (
              <div>
                <a
                  href={response.keywordMessage.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resourceLink"
                >
                  {response.keywordMessage.link.title}
                </a>
              </div>
            )}
          </div>
        )}

        {response.keywordResource && (
          <div
            className={`keywordResource ${
              response.keywordResource.type || "info"
            }`}
          >
            <p>{response.keywordResource.text}</p>
            {/* Check if there is a link inside keywordResource */}
            {response.keywordResource.link && (
              <a
                href={response.keywordResource.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resourceLink"
              >
                {response.keywordResource.link.title}
              </a>
            )}
          </div>
        )}

        {loading && (
          <div className="assistant typing-indicator">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="chatInput">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
