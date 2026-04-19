import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Message from "./Message";

const STARTER_PROMPTS = [
  "I've been feeling overwhelmed lately.",
  "Can you help me calm down right now?",
  "I need help sorting through my thoughts.",
];

const BOT_EMOJIS = ["🙂", "💛", "🌼", "✨"];

function formatTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(text) {
  return String(text ?? "").replace(/<br\s*\/?>/gi, "\n").trim();
}

function addFriendlyBotTone(text, index = 0) {
  if (!text) {
    return text;
  }

  const emoji = BOT_EMOJIS[index % BOT_EMOJIS.length];
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text);

  if (hasEmoji) {
    return text;
  }

  return `${text} ${emoji}`;
}

function normalizeMessages(messages) {
  return messages.map((message, index) => ({
    id: `${message.role}-${message.timestamp || index}`,
    role: message.role === "assistant" ? "bot" : message.role,
    text:
      message.role === "assistant"
        ? addFriendlyBotTone(normalizeText(message.text), index)
        : normalizeText(message.text),
    time: formatTime(message.timestamp),
    timestamp: message.timestamp || null,
  }));
}

export default function ChatWindow({ conversationId, apiBaseUrl, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    void loadHistory();
  }, [conversationId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    setError("");

    try {
      const res = await axios.get(`${apiBaseUrl}/history`, {
        params: { user_id: userId, conversation_id: conversationId },
      });

      setMessages(normalizeMessages(res.data));
    } catch {
      setError("Message history could not be loaded for this conversation.");
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendMessage = async (presetMessage) => {
    const outgoingText = (presetMessage ?? input).trim();
    if (!outgoingText || loading) {
      return;
    }

    const optimisticTimestamp = new Date().toISOString();
    const optimisticMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: outgoingText,
      time: formatTime(optimisticTimestamp),
      timestamp: optimisticTimestamp,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${apiBaseUrl}/chat`, null, {
        params: {
          user_id: userId,
          message: outgoingText,
          conversation_id: conversationId,
        },
      });

      const responseTimestamp = res.data.timestamp || new Date().toISOString();
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: addFriendlyBotTone(normalizeText(res.data.reply), messages.length),
        time: formatTime(responseTimestamp),
        timestamp: responseTimestamp,
        isCrisis: Boolean(res.data.crisis),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setError("The message could not be sent. Please try again in a moment.");
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-panel">
      {error ? <div className="status-banner error">{error}</div> : null}

      <div className="chat-box">
        {historyLoading ? (
          <div className="empty-state subtle">
            <div className="pulse-orb" />
            <p>Loading your conversation...</p>
          </div>
        ) : null}

        {!historyLoading && messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <span />
              <span />
              <span />
            </div>
            <p>Mindkare Bot is here like a friend. Start with whatever feels easiest to say 🙂</p>
            <div className="starter-grid">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="starter-chip"
                  onClick={() => void sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!historyLoading
          ? messages.map((message, index) => (
              <Message
                key={message.id}
                msg={message}
                showTime={!messages[index - 1] || messages[index - 1].time !== message.time}
              />
            ))
          : null}

        {loading ? (
          <div className="message incoming">
            <div className="bot-msg typing-indicator">
              <span className="typing-bubble" />
              <span className="typing-bubble" />
              <span className="typing-bubble" />
            </div>
          </div>
        ) : null}

        <div ref={chatEndRef} />
      </div>

      <div className="composer-shell">
        <div className="input-area">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Message Mindkare Bot..."
            rows={1}
          />
          <button
            type="button"
            className="primary-button send-button"
            onClick={() => void sendMessage()}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
