import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { supabase, backendOn } from "../lib/supabase";
import { useT } from "../hooks/useT";

export default function AdminChat() {
  const t = useT();
  const user = useSelector((s) => s.user.currentUser);
  const [convos, setConvos] = useState([]); // [{userId, name, last, count}]
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!backendOn) return;
    let channel;

    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at");
      const all = data || [];
      const map = new Map();
      all.forEach((m) => {
        const cur = map.get(m.user_id) || { userId: m.user_id, name: m.author_name, last: m.body, count: 0 };
        cur.name = m.author_name || cur.name;
        cur.last = m.body;
        cur.count += 1;
        map.set(m.user_id, cur);
      });
      setConvos([...map.values()].reverse());
      if (active) setMsgs(all.filter((m) => m.user_id === active));
    };

    load();
    channel = supabase
      .channel("admin-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => load()
      )
      .subscribe();

    return () => channel && supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const reply = async () => {
    const text = input.trim();
    if (!text || !active) return;
    setInput("");
    const { error } = await supabase.from("messages").insert({
      user_id: active,
      sender: "admin",
      author_name: user?.name || "پشتیبانی لوجا",
      body: text,
    });
    if (error) console.error(error);
  };

  if (!backendOn)
    return <div className="card empty">{t("dashboard.offline")}</div>;

  return (
    <div className="dash-layout">
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 14, fontWeight: 600 }}>{t("adminchat.title")}</div>
        {convos.length === 0 && <div className="empty">{t("chat.empty")}</div>}
        {convos.map((c) => (
          <button
            key={c.userId}
            className={`convo-item ${active === c.userId ? "active" : ""}`}
            onClick={() => setActive(c.userId)}
          >
            <strong>{c.name || "کاربر"}</strong>
            <span className="muted">{c.last?.slice(0, 40)}</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
        {!active ? (
          <div className="empty">{t("adminchat.pick")}</div>
        ) : (
          <>
            <div className="chat-messages" style={{ flex: 1 }}>
              {msgs.map((m) => (
                <div key={m.id} className={`chat-msg ${m.sender === "user" ? "bot" : "me"}`}>
                  {m.body}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="chat-input">
              <input
                value={input}
                placeholder={t("adminchat.placeholder")}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && reply()}
              />
              <button className="btn" onClick={reply}>{t("chat.send")}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}