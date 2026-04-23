import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";
import {
  getConversations, createConversation, getBotHistory, sendBotMessage,
  Conversation, BotMessage,
} from "../services/mindkareApi";

function now() { return new Date().toISOString(); }
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const aiEnabled = user?.ai_consent === true;

  const [conversations,  setConversations]  = useState<Conversation[]>([]);
  const [activeConvId,   setActiveConvId]   = useState<number | null>(null);
  const [messages,       setMessages]       = useState<BotMessage[]>([]);
  const [input,          setInput]          = useState("");
  const [sending,        setSending]        = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [crisis,         setCrisis]         = useState(false);
  const [newStarted,     setNewStarted]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const QUICK_QUESTIONS = [
    "I feel anxious lately, what should I do?",
    "How can I manage stress better?",
    "I can't sleep properly, can you help?",
    "I feel low and unmotivated — what helps?",
  ];

  // Always start with a FRESH chat on page load
  useEffect(() => {
    if (!aiEnabled || newStarted) return;
    setNewStarted(true);
    handleNewChat();
    // Load sidebar history in background
    getConversations().then(setConversations).catch(() => {});
  }, [aiEnabled]);

  // Load history when switching to a past conversation from sidebar
  useEffect(() => {
    if (activeConvId === null) return;
    setMessages([]); setLoading(true);
    getBotHistory(activeConvId).then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, [activeConvId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadConversations() {
    const convs = await getConversations();
    setConversations(convs);
  }

  async function handleNewChat() {
    const conv = await createConversation();
    setConversations(prev => [{ id: conv.id, title: "New Chat" }, ...prev]);
    setActiveConvId(conv.id);
    setMessages([]);
  }

  function handleQuickQuestion(q: string) {
    setInput(q);
    // Small timeout to let state settle, then auto-send
    setTimeout(() => {
      setInput("");
      setMessages(prev => [...prev, { role: "user", text: q, time: new Date().toISOString() }]);
      setSending(true); setCrisis(false);
      if (activeConvId !== null) {
        sendBotMessage(q, activeConvId)
          .then(res => {
            setMessages(prev => [...prev, { role: "bot", text: res.reply, time: res.timestamp || new Date().toISOString() }]);
            if (res.crisis) setCrisis(true);
            loadConversations();
          })
          .catch(() => setMessages(prev => [...prev, { role: "bot", text: "Something went wrong. Please try again.", time: new Date().toISOString() }]))
          .finally(() => setSending(false));
      }
    }, 50);
  }

  async function handleSend() {
    if (!input.trim() || sending || activeConvId === null) return;
    const text = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text, time: now() }]);
    setSending(true); setCrisis(false);
    try {
      const res = await sendBotMessage(text, activeConvId);
      setMessages(prev => [...prev, { role: "bot", text: res.reply, time: res.timestamp || now() }]);
      if (res.crisis) setCrisis(true);
      loadConversations();
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Something went wrong. Please try again.", time: now() }]);
    } finally { setSending(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function renderText(text: string) {
    const withNewlines = text.replace(/<br\s*\/?>/gi, "\n");
    const parts = withNewlines.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>);
  }

  if (!aiEnabled) {
    return (
      <div className="min-h-screen">
        <AppNavbar />
        <div className="flex items-center justify-center p-8 min-h-[80vh]">
          <div className="glass-card-strong p-10 max-w-md text-center animate-fade-in">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">AI Chat is Disabled</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Enable AI insights from your Profile page to chat with the MindKare bot, which uses your DASS results to give personalised support.
            </p>
            <a href="/profile" className="btn-primary px-6 py-2.5 no-underline inline-block">Go to Profile →</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <div className="flex flex-1 max-w-5xl w-full mx-auto gap-4 p-4" style={{ height: "calc(100vh - 70px)" }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="glass-card w-56 shrink-0 flex flex-col overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <span className="font-bold text-sm text-gray-700">Conversations</span>
              <button
                onClick={handleNewChat}
                className="text-xs bg-gradient-to-r from-rose-300 to-pink-300 text-white px-2.5 py-1 rounded-full font-semibold hover:shadow-md transition-all cursor-pointer border-none"
              >+ New</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No conversations yet</p>
              ) : conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`text-left w-full px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border-none
                    ${c.id === activeConvId
                      ? "bg-white/50 text-rose-600 font-semibold"
                      : "text-gray-600 hover:bg-white/30"}`}
                >
                  💬 {c.title || "New Chat"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat panel */}
        <div className="glass-card flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/20">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="w-8 h-8 rounded-full bg-white/30 border border-white/30 text-gray-500 text-xs hover:bg-white/50 transition-colors cursor-pointer"
            >{sidebarOpen ? "◀" : "▶"}</button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-pink-300 flex items-center justify-center text-xl shadow-md">🤖</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">MindKare AI</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Personalised mental wellness support
              </div>
            </div>
          </div>

          {/* Crisis banner */}
          {crisis && (
            <div className="bg-red-100/70 border border-red-200 text-red-700 px-4 py-2.5 text-sm font-medium">
              🚨 <strong>Crisis detected.</strong> Please reach out to a trusted person or call a mental health helpline. <strong>iCall: 9152987821</strong>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {activeConvId === null ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="text-5xl animate-float">🧠</div>
                <p className="text-gray-500 text-sm max-w-xs">Start a new conversation or select one from the sidebar.</p>
                <button onClick={handleNewChat} className="btn-primary px-6 py-2 text-sm">Start New Chat</button>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-rose-300" style={{ animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-4 animate-fade-in">
                    <div className="text-5xl emoji-bounce">🤖</div>
                    <div>
                      <p className="font-bold text-gray-800 mb-1">Hi {user?.name?.split(" ")[0]}! 👋</p>
                      <p className="text-gray-500 text-sm">I'm here to support you. Choose a question or type your own below.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                      {QUICK_QUESTIONS.map(q => (
                        <button
                          key={q}
                          onClick={() => handleQuickQuestion(q)}
                          className="text-left px-4 py-3 rounded-2xl bg-white/50 border border-rose-100/60 hover:bg-white/70 hover:border-rose-300/60 hover:shadow-md text-sm text-gray-700 font-medium transition-all duration-200 cursor-pointer"
                        >
                          💭 {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                    {m.role === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-pink-300 flex items-center justify-center text-sm shrink-0">🤖</div>
                    )}
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${m.role === "user"
                        ? "bg-gradient-to-br from-rose-300 to-pink-300 text-white rounded-br-sm"
                        : "bg-white/50 backdrop-blur-sm border border-white/30 text-gray-700 rounded-bl-sm"}`}
                    >
                      <div className="whitespace-pre-line">{renderText(m.text)}</div>
                      <div className={`text-xs mt-1.5 ${m.role === "user" ? "text-white/70" : "text-gray-400"}`}>{fmtTime(m.time)}</div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-pink-300 flex items-center justify-center text-sm shrink-0">🤖</div>
                    <div className="bg-white/50 backdrop-blur-sm border border-white/30 px-5 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-rose-300" style={{ animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          {activeConvId !== null && (
            <div className="p-4 border-t border-white/20 flex gap-3">
              <textarea
                id="chatbot-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className="glass-input resize-none flex-1 py-2.5 text-sm"
                style={{ minHeight: 44, maxHeight: 120 }}
              />
              <button
                id="chatbot-send"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="btn-primary w-11 h-11 rounded-full p-0 flex items-center justify-center text-lg shrink-0"
              >➤</button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}
