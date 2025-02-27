
import React, { useState, useRef, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { toast } from "sonner";

const ChatBox: React.FC = () => {
  const { chatMessages, addChatMessage, diceRolls } = useGame();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"text" | "emote">("text");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "Player",
      content: message,
      type: messageType,
      timestamp: Date.now(),
    };

    addChatMessage(newMessage);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-6">
            No messages yet. Say something!
          </div>
        ) : (
          <>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message animate-slide-up ${
                  msg.type === "system"
                    ? "bg-primary/10 px-3 py-2 rounded-md text-sm italic"
                    : msg.type === "roll"
                    ? "bg-secondary/50 px-3 py-2 rounded-md"
                    : ""
                }`}
              >
                {msg.type === "text" && (
                  <>
                    <span className="font-medium">{msg.sender}: </span>
                    <span>{msg.content}</span>
                  </>
                )}
                {msg.type === "emote" && (
                  <span className="italic text-muted-foreground">
                    {msg.sender} {msg.content}
                  </span>
                )}
                {msg.type === "roll" && (
                  <>
                    <span className="font-medium">{msg.sender} </span>
                    <span>{msg.content}</span>
                  </>
                )}
                {msg.type === "system" && <span>{msg.content}</span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2 items-center mb-2">
          <button
            onClick={() => setMessageType("text")}
            className={`px-3 py-1 text-xs rounded-md ${
              messageType === "text"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Say
          </button>
          <button
            onClick={() => setMessageType("emote")}
            className={`px-3 py-1 text-xs rounded-md ${
              messageType === "emote"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Emote
          </button>
        </div>
        <div className="flex space-x-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={messageType === "text" ? "Type a message..." : "Describes an action..."}
            className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
