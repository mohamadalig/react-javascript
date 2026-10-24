import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { clearCart, cartTotal } from "../store/cartSlice";
import { supabase, backendOn } from "../lib/supabase";
import { useT } from "../hooks/useT";
import { formatPrice } from "../utils";

export default function Checkout() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lang = useSelector((s) => s.ui.lang);
  const items = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.user.currentUser);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [paid, setPaid] = useState(false);
  if (paid)
    return <div className="container"><div className="success">✓ {t("checkout.success")}</div></div>;
  if (items.length === 0)
    return <div className="container empty">{t("cart.empty")}</div>;

  // حالت بدون بک‌اند: پرداخت دمو مثل قبل
  if (!backendOn)
    return (
      <div className="container">
        <h1 style={{ marginBottom: 20 }}>{t("checkout.title")}</h1>
        <form
          className="card checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch(clearCart());
            setPaid(true);
          }}
        >
          <p>{t("cart.total")}: <strong>{formatPrice(cartTotal(items), lang)}</strong></p>
          <input className="input" placeholder={t("checkout.name")} required />
          <button className="btn" type="submit">{t("checkout.pay")}</button>
        </form>
      </div>
    );

  if (!user)
    return (
      <div className="container empty">
        {t("checkout.err.login")}{" "}
        <Link to="/login" className="auth-link">{t("auth.submitLogin")}</Link>
      </div>
    );

  const pay = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const orderItems = items.map(({ product, qty }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty,
      }));
      const total = cartTotal(items);

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          items: orderItems,
          total,
          status: "pending",
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const { data, error: payErr } = await supabase.functions.invoke("payment", {
        body: { action: "request", order_id: order.id },
      });
      if (payErr || !data?.redirect) throw payErr || new Error("no redirect");

      window.location.href = data.redirect;
    } catch (err) {
      console.error(err);
      setError(t("checkout.err.pay"));
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: 20 }}>{t("checkout.title")}</h1>
      <form className="card checkout-form" onSubmit={pay}>
        <p>{t("cart.total")}: <strong>{formatPrice(cartTotal(items), lang)}</strong></p>
        <input
          className="input"
          placeholder={t("checkout.name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder={t("checkout.phone")}
          inputMode="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <textarea
          className="input"
          rows="3"
          placeholder={t("checkout.address")}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />
        {error && <div className="field-error">{error}</div>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "…" : t("checkout.pay")}
        </button>
      </form>
    </div>
  );
}