export default function Sidebar({
  conversations,
  activeConv,
  createNewChat,
  loading,
  onSelectConversation,
  onClose,
}) {
  return (
    <>
      <div className="sidebar-backdrop" onClick={onClose} />
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="primary-button new-chat" type="button" onClick={createNewChat}>
            New Chat
          </button>
        </div>

        <div className="conversation-list">
          {loading ? <div className="sidebar-state">Loading conversations...</div> : null}

          {!loading && conversations.length === 0 ? (
            <div className="sidebar-state">No chats yet. Start one whenever you're ready 🙂</div>
          ) : null}

          {!loading
            ? conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`conv ${activeConv === conversation.id ? "active" : ""}`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <span className="conv-title">{conversation.title || "New Chat"}</span>
                </button>
              ))
            : null}
        </div>
      </aside>
    </>
  );
}
