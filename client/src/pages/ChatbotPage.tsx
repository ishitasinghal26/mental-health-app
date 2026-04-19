import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";
import {
  getConversations,
  createConversation,
  getBotHistory,
  sendBotMessage,
  Conversation,
  BotMessage,
} from "../services/mindkareApi";

function now() { return new Date().toISOString(); }
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const aiEnabled = user?.ai_consent === true;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [crisis, setCrisis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (!aiEnabled) return;
    loadConversations();
  }, [aiEnabled]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConvId === null) return;
    setMessages([]);
    setLoading(true);
    getBotHistory(activeConvId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    const convs = await getConversations();
    setConversations(convs);
    if (convs.length > 0 && activeConvId === null) {
      setActiveConvId(convs[0].id);
    }
  }

  async function handleNewChat() {
    const conv = await createConversation();
    setConversations(prev => [{ id: conv.id, title: "New Chat" }, ...prev]);
    setActiveConvId(conv.id);
    setMessages([]);
  }

  async function handleSend() {
    if (!input.trim() || sending || activeConvId === null) return;
    const text = input.trim();
    setInput("");
    const userMsg: BotMessage = { role: "user", text, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    setCrisis(false);

    try {
      const res = await sendBotMessage(text, activeConvId);
      const botMsg: BotMessage = { role: "bot", text: res.reply, time: res.timestamp || now() };
      setMessages(prev => [...prev, botMsg]);
      if (res.crisis) setCrisis(true);
      // Refresh conversation titles
      loadConversations();
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Something went wrong. Please try again.", time: now() }]);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function renderText(text: string) {
    // Handle <br> tags from Python backend
    const withNewlines = text.replace(/<br\s*\/?>/gi, "\n");
    const parts = withNewlines.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>);
  }

  // Non-AI mode
  if (!aiEnabled) {
    return (
      <div style={pageWrap}>
        <AppNavbar />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, padding: "2rem" }}>
          <div style={{ background: "white", borderRadius: 24, padding: "3rem", maxWidth: 480, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 56, marginBottom: "1rem" }}>🔒</div>
            <h2 style={{ fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>AI Chat is Disabled</h2>
            <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Enable AI insights from your Profile page to chat with the MindKare bot, which uses your DASS results to give personalised support.
            </p>
            <a href="/profile" style={{ display: "inline-block", marginTop: "1.25rem", padding: "0.75rem 1.75rem", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>
              Go to Profile →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <AppNavbar />
      <div style={chatLayout}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={sidebar}>
            <div style={sidebarHeader}>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>Conversations</span>
              <button style={newChatBtn} onClick={handleNewChat}>+ New</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {conversations.length === 0 ? (
                <div style={{ padding: "1rem", color: "#9ca3af", fontSize: "0.82rem" }}>No conversations yet</div>
              ) : (
                conversations.map(c => (
                  <button
                    key={c.id}
                    style={{
                      ...convItem,
                      ...(c.id === activeConvId ? convItemActive : {}),
                    }}
                    onClick={() => setActiveConvId(c.id)}
                  >
                    💬 {c.title || "New Chat"}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat panel */}
        <div style={chatPanel}>
          {/* Chat header */}
          <div style={chatHeader}>
            <button style={toggleBtn} onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div style={avatarCircle}>🤖</div>
            <div>
              <div style={headerName}>MindKare AI</div>
              <div style={headerSub}>
                <span style={{ ...dot, background: "#10b981" }} />
                Personalised mental wellness support
              </div>
            </div>
          </div>

          {/* Crisis banner */}
          {crisis && (
            <div style={crisisBanner}>
              🚨 <strong>Crisis detected.</strong> Please reach out to a trusted person or call a mental health helpline immediately. <strong>iCall: 9152987821</strong>
            </div>
          )}

          {/* Messages */}
          <div style={messageArea}>
            {activeConvId === null ? (
              <div style={emptyState}>
                <div style={{ fontSize: 52 }}>🧠</div>
                <p style={{ marginTop: "1rem", color: "#6b7280" }}>Start a new conversation or select one from the sidebar.</p>
                <button style={startBtn} onClick={handleNewChat}>Start New Chat</button>
              </div>
            ) : loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div style={emptyState}>
                    <div style={{ fontSize: 42 }}>👋</div>
                    <p style={{ color: "#6b7280", marginTop: "0.75rem" }}>
                      Hi {user?.name?.split(" ")[0]}! How are you feeling today?
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: "1rem" }}>
                    {m.role === "bot" && <div style={botAvatar}>🤖</div>}
                    <div style={m.role === "user" ? userBubble : botBubble}>
                      <div style={{ whiteSpace: "pre-line", lineHeight: 1.65 }}>{renderText(m.text)}</div>
                      <div style={timeStamp}>{fmtTime(m.time)}</div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div style={{ display: "flex", marginBottom: "1rem" }}>
                    <div style={botAvatar}>🤖</div>
                    <div style={{ ...botBubble, padding: "1rem 1.25rem" }}>
                      <div className="typing-dots"><span /><span /><span /></div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          {activeConvId !== null && (
            <div style={inputArea}>
              <textarea
                id="chatbot-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
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
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh", background: "#f3f4f6", display: "flex", flexDirection: "column",
};
const chatLayout: React.CSSProperties = {
  flex: 1, display: "flex", maxWidth: 1100, width: "100%",
  margin: "1.25rem auto", gap: "1rem", padding: "0 1rem", height: "calc(100vh - 100px)",
};
const sidebar: React.CSSProperties = {
  width: 220, background: "white", borderRadius: 20,
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex",
  flexDirection: "column", overflow: "hidden", flexShrink: 0,
};
const sidebarHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "1rem 1.1rem", borderBottom: "1px solid #f0f0f0",
};
const newChatBtn: React.CSSProperties = {
  padding: "0.3rem 0.7rem", borderRadius: 8, border: "none",
  background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white",
  fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
};
const convItem: React.CSSProperties = {
  display: "block", width: "100%", textAlign: "left",
  padding: "0.75rem 1.1rem", border: "none", background: "none",
  fontSize: "0.83rem", color: "#374151", cursor: "pointer",
  borderBottom: "1px solid #f9fafb",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
const convItemActive: React.CSSProperties = {
  background: "#eef2ff", color: "#4338ca", fontWeight: 700,
};
const chatPanel: React.CSSProperties = {
  flex: 1, background: "white", borderRadius: 20,
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex",
  flexDirection: "column", overflow: "hidden",
};
const chatHeader: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.85rem",
  padding: "1rem 1.25rem", borderBottom: "1px solid #f0f0f0",
};
const toggleBtn: React.CSSProperties = {
  background: "#f3f4f6", border: "none", borderRadius: 8,
  width: 30, height: 30, cursor: "pointer", color: "#6b7280", fontSize: "0.8rem",
};
const avatarCircle: React.CSSProperties = {
  width: 42, height: 42, borderRadius: "50%",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
};
const headerName: React.CSSProperties = { fontWeight: 700, fontSize: "0.98rem", color: "#111827" };
const headerSub: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.4rem",
  fontSize: "0.75rem", color: "#6b7280", marginTop: 2,
};
const dot: React.CSSProperties = { width: 7, height: 7, borderRadius: "50%", display: "inline-block" };

const crisisBanner: React.CSSProperties = {
  background: "#fef2f2", borderBottom: "1px solid #fecaca",
  padding: "0.75rem 1.25rem", color: "#991b1b", fontSize: "0.88rem",
};

const messageArea: React.CSSProperties = {
  flex: 1, overflowY: "auto", padding: "1.25rem",
  maxHeight: "calc(100vh - 230px)",
};
const botAvatar: React.CSSProperties = {
  width: 30, height: 30, borderRadius: "50%",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 15, marginRight: "0.5rem", flexShrink: 0, alignSelf: "flex-end",
};
const botBubble: React.CSSProperties = {
  background: "#f3f4f6", color: "#1f2937",
  padding: "0.85rem 1.05rem", borderRadius: "18px 18px 18px 4px",
  maxWidth: "75%", fontSize: "0.91rem",
};
const userBubble: React.CSSProperties = {
  background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white",
  padding: "0.85rem 1.05rem", borderRadius: "18px 18px 4px 18px",
  maxWidth: "72%", fontSize: "0.91rem",
};
const timeStamp: React.CSSProperties = {
  fontSize: "0.68rem", opacity: 0.5, marginTop: "0.3rem", textAlign: "right",
};
const inputArea: React.CSSProperties = {
  display: "flex", alignItems: "flex-end", gap: "0.6rem",
  padding: "0.9rem 1.1rem", borderTop: "1px solid #f0f0f0",
};
const inputBox: React.CSSProperties = {
  flex: 1, padding: "0.7rem 0.95rem", borderRadius: 14,
  border: "1.5px solid #e5e7eb", fontSize: "0.93rem",
  resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5,
};
const sendBtn: React.CSSProperties = {
  width: 42, height: 42, background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white", border: "none", borderRadius: 12, fontSize: "1rem",
  cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s",
};
const emptyState: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center",
  justifyContent: "center", height: "100%", textAlign: "center",
};
const startBtn: React.CSSProperties = {
  marginTop: "1rem", padding: "0.65rem 1.5rem",
  background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white",
  border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer",
};
