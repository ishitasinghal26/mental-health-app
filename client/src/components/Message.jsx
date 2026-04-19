export default function Message({ msg, showTime }) {
  return (
    <article className={`message ${msg.role === "user" ? "outgoing" : "incoming"}`}>
      {showTime && msg.time ? <span className="time-divider">{msg.time}</span> : null}
      <div className={msg.role === "user" ? "user-msg" : "bot-msg"}>
        <span className="message-author">{msg.role === "user" ? "You" : "Mindkare Bot"}</span>
        <p>{msg.text}</p>
        {msg.isCrisis ? (
          <div className="crisis-note">
            If you may be in immediate danger, contact local emergency services or a trusted person nearby now.
          </div>
        ) : null}
      </div>
    </article>
  );
}
