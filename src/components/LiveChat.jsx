import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { supabase, backendOn } from "../lib/supabase";
import { useT } from "../hooks/useT";

export default function LiveChat() {
  const t = useT();
  const lang = useSelector((s) => s.ui.lang);
  const user = useSelector((s) => s.user.currentUser);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([]);
  const bottomRef = useRef(null);

  // حالت دمو (بدون بک‌اند یا مهمان): همان ربات ساده
  const botReply = (text) => {
    const q = text.toLowerCase();
    if (/قیمت|price/.test(q))
      return lang === "fa"
        ? "قیمت هر محصول در کارت محصول و صفحه جزئیات مشخص شده است."
        : "Each product's price is shown on its card and details page.";
    if (/ارسال|توصیل|ship|deliver/.test(q))
      return lang === "fa"
        ? "ارسال سفارش‌ها بین ۲ تا ۵ روز کاری انجام می‌شود."
        : "Orders are delivered within 2 to 5 business days.";
    if (/گارانتی|مرجوع|warranty|return/.test(q))
      return lang === "fa"
        ? "تمام کالاها ۷ روز ضمانت بازگشت دارند."
        : "All products come with a 7-day return guarantee.";
    return lang === "fa"
      ? "درخواست شما ثبت شد. همکاران ما به‌زودی پاسخ می‌دهند."
      : "Your request has been noted. Our team will reply shortly.";
  };

  useEffect(() => {
    if (!open || !backendOn || !user) return;

    let channel;
    supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => setMsgs(data || []));

    channel = supabase
      .channel(`chat-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => setMsgs((m) => [...m, payload.new])
      )
      .subscribe();

    return () => channel && supabase.removeChannel(channel);
  }, [open, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (!backendOn || !user) {
      setMsgs((m) => [...m, { sender: "user", body: text, author_name: t("chat.you") }]);
      setTimeout(
        () => setMsgs((m) => [...m, { sender: "admin", body: botReply(text), author_name: t("chat.support") }]),
        600
      );
      return;
    }

    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      sender: "user",
      author_name: user.name,
      body: text,
    });
    if (error) console.error(error);
  };

  const list = msgs.length
    ? msgs
    : open && !backendOn
      ? [{ sender: "admin", body: t("chat.greeting"), author_name: t("chat.support") }]
      : [];

  return (
    <>
      {open && (
        <div className="card chat-panel">
          <div className="chat-header">{t("chat.title")}</div>
          <div className="chat-messages">
            {!backendOn || !user ? (
              <div className="chat-msg admin">{t("chat.loginRequired")}</div>
            ) : list.length === 0 ? (
              <div className="chat-msg admin">{t("chat.empty")}</div>
            ) : null}
            {list.map((m) => (
              <div key={m.id ?? Math.random()} className={`chat-msg ${m.sender === "user" ? "me" : "bot"}`}>
                {m.body}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input">
            <input
              value={input}
              placeholder={t("chat.placeholder")}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn" onClick={send}>{t("chat.send")}</button>
          </div>
          {(!backendOn || !user) && (
            <div className="auth-hint" style={{ padding: "0 12px 10px" }}>
              <Link to="/login" className="auth-link">{t("auth.submitLogin")}</Link>
            </div>
          )}
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="chat">💬</button>
    </>
  );
}