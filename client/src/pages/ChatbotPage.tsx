import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";
import { getChatHistory, sendChatMessage, ChatMessage } from "../services/chatbotApi";

type Message = {
  role: "user" | "bot";
  text: string;
  time: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function now() {
  return new Date().toISOString();
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const aiEnabled = user?.ai_consent === true;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    if (!aiEnabled) {
      setMessages([{
        role: "bot",
        text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 AI insights are currently disabled. You can enable them from your Profile page to get personalised support based on your assessment results. In the meantime, feel free to talk — I'm still here to listen!`,
        time: now(),
      }]);
      setLoading(false);
      return;
    }

    getChatHistory()
      .then((history: ChatMessage[]) => {
        if (history.length === 0) {
          // First message — trigger the greeting by sending empty init
          sendFirstGreeting();
          return;
        }
        const msgs: Message[] = [];
        history.forEach((h) => {
          msgs.push({ role: "user", text: h.user_message, time: h.created_at });
          msgs.push({ role: "bot", text: h.bot_response, time: h.created_at });
        });
        setMessages(msgs);
      })
      .catch(() => {
        setMessages([{ role: "bot", text: "Could not load chat history.", time: now() }]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function sendFirstGreeting() {
    try {
      const res = await sendChatMessage("__init__");
      setMessages([{ role: "bot", text: res.response, time: now() }]);
    } catch {
      setMessages([{ role: "bot", text: `Hello ${user?.name?.split(" ")[0] || ""}! How are you feeling today?`, time: now() }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg, time: now() }]);
    setSending(true);

    if (!aiEnabled) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "bot",
          text: "AI insights are disabled. Enable them from your Profile to get personalised responses. 💙",
          time: now(),
        }]);
        setSending(false);
      }, 500);
      return;
    }

    try {
      const res = await sendChatMessage(userMsg);
      setMessages(prev => [...prev, { role: "bot", text: res.response, time: now() }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Something went wrong. Please try again.", time: now() }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Render markdown-like bold (**text**)
  function renderText(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) =>
      i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>
    );
  }

  return (
    <div style={pageWrap}>
      <AppNavbar />
      <div style={chatContainer}>
        {/* Header */}
        <div style={chatHeader}>
          <div style={avatarCircle}>🤖</div>
          <div>
            <div style={headerName}>MindKare AI</div>
            <div style={headerStatus}>
              <span style={{ ...statusDot, background: aiEnabled ? "#10b981" : "#f59e0b" }} />
              {aiEnabled ? "AI mode — personalised support" : "Basic mode — AI disabled"}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={messageArea}>
          {loading ? (
            <div style={loadingWrap}>
              <div className="typing-dots"><span /><span /><span /></div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: "1rem" }}>
                {m.role === "bot" && <div style={botAvatar}>🤖</div>}
                <div style={m.role === "user" ? userBubble : botBubble}>
                  <div style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{renderText(m.text)}</div>
                  <div style={timeStamp}>{formatTime(m.time)}</div>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
              <div style={botAvatar}>🤖</div>
              <div style={{ ...botBubble, padding: "1rem 1.25rem" }}>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={inputArea}>
          <textarea
            id="chatbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            style={inputBox}
          />
          <button
            id="chatbot-send"
            style={{ ...sendBtn, opacity: !input.trim() || sending ? 0.5 : 1 }}
            onClick={handleSend}
            disabled={!input.trim() || sending}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  display: "flex",
  flexDirection: "column",
};

const chatContainer: React.CSSProperties = {
  flex: 1,
  maxWidth: 760,
  width: "100%",
  margin: "1.5rem auto",
  background: "white",
  borderRadius: 24,
  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const chatHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid #f0f0f0",
  background: "white",
};

const avatarCircle: React.CSSProperties = {
  width: 48,
  height: 48,
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
};

const headerName: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#111827",
};

const headerStatus: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.8rem",
  color: "#6b7280",
  marginTop: 2,
};

const statusDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  display: "inline-block",
};

const messageArea: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "1.5rem",
  minHeight: 400,
  maxHeight: "calc(100vh - 280px)",
};

const botAvatar: React.CSSProperties = {
  width: 32,
  height: 32,
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  marginRight: "0.5rem",
  flexShrink: 0,
  alignSelf: "flex-end",
};

const botBubble: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#1f2937",
  padding: "0.9rem 1.1rem",
  borderRadius: "18px 18px 18px 4px",
  maxWidth: "75%",
  fontSize: "0.92rem",
};

const userBubble: React.CSSProperties = {
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  padding: "0.9rem 1.1rem",
  borderRadius: "18px 18px 4px 18px",
  maxWidth: "72%",
  fontSize: "0.92rem",
};

const timeStamp: React.CSSProperties = {
  fontSize: "0.7rem",
  opacity: 0.55,
  marginTop: "0.35rem",
  textAlign: "right",
};

const inputArea: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: "0.75rem",
  padding: "1rem 1.25rem",
  borderTop: "1px solid #f0f0f0",
};

const inputBox: React.CSSProperties = {
  flex: 1,
  padding: "0.75rem 1rem",
  borderRadius: 14,
  border: "1.5px solid #e5e7eb",
  fontSize: "0.95rem",
  resize: "none",
  outline: "none",
  fontFamily: "inherit",
  lineHeight: 1.5,
};

const sendBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontSize: "1.1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "opacity 0.2s",
};

const loadingWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 120,
};

const typingDots: React.CSSProperties = {
  display: "flex",
  gap: "0.35rem",
  alignItems: "center",
};
