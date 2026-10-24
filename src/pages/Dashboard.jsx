import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveProduct, removeProduct } from "../store/productsSlice";
import { supabase, backendOn } from "../lib/supabase";
import { useT } from "../hooks/useT";
import { formatPrice } from "../utils";
import { categories } from "../data/products";
import AdminChat from "../components/AdminChat";

const emptyForm = {
  id: null, nameFa: "", nameEn: "", descFa: "", descEn: "",
  price: 0, stock: 0, category: "electronics", image: "", rating: 4,
};

const ORDER_STATUSES = ["pending", "paid", "failed", "shipped", "delivered", "cancelled"];

const NAV = [
  ["overview", "📊"],
  ["products", "📦"],
  ["orders", "🧾"],
  ["users", "👥"],
  ["reviews", "⭐"],
  ["chat", "💬"],
];

export default function Dashboard() {
  const t = useT();
  const dispatch = useDispatch();
  const lang = useSelector((s) => s.ui.lang);
  const user = useSelector((s) => s.user.currentUser);
  const products = useSelector((s) => s.products.list);

  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [productQuery, setProductQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [productError, setProductError] = useState("");
  const [productMessage, setProductMessage] = useState("");

  useEffect(() => {
    if (!backendOn) return;
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300)
      .then(({ data }) => setOrders(data || []));
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setUsers(data || []));
    supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setReviews(data || []));
  }, []);

  if (!user || user.role !== "admin")
    return <div className="container empty">403 — {t("nav.login")}</div>;

  const isFa = lang === "fa";
  const dateStr = (iso) => new Date(iso).toLocaleDateString(isFa ? "fa-IR" : "en-US");
  const statusLabel = (s) => t(`orders.status.${s}`) || s;

  const paid = orders.filter((o) => o.status === "paid");
  const today = new Date().toDateString();
  const todaySales = paid
    .filter((o) => new Date(o.created_at).toDateString() === today)
    .reduce((s, o) => s + o.total, 0);
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const avgOrder = paid.length ? Math.round(revenue / paid.length) : 0;

  const chart = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push({
        label: d.toLocaleDateString(isFa ? "fa-IR" : "en-US", { weekday: "short" }),
        total: paid
          .filter((o) => new Date(o.created_at).toDateString() === key)
          .reduce((s, o) => s + o.total, 0),
      });
    }
    return days;
  }, [orders, isFa]);
  const maxTotal = Math.max(...chart.map((d) => d.total), 1);

  const lowStock = products.filter((p) => (p.stock || 0) <= 5).slice(0, 6);

  const filteredOrders = orders.filter(
    (o) =>
      (orderStatus === "all" || o.status === orderStatus) &&
      (!orderQuery ||
        (o.customer_name || "").toLowerCase().includes(orderQuery.toLowerCase()) ||
        String(o.id) === orderQuery)
  );

  const filteredProducts = products.filter(
    (p) =>
      !productQuery ||
      (p.name?.fa || "").includes(productQuery) ||
      (p.name?.en || "").toLowerCase().includes(productQuery.toLowerCase())
  );

  const setStatus = async (id, status) => {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    if (backendOn) await supabase.from("orders").update({ status }).eq("id", id);
  };

  const setRole = async (id, role) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, role } : u)));
    if (backendOn) await supabase.from("profiles").update({ role }).eq("id", id);
  };

  const deleteReview = async (id) => {
    if (!window.confirm(t("dashboard.reviews.confirm"))) return;
    setReviews((rs) => rs.filter((r) => r.id !== id));
    if (backendOn) await supabase.from("reviews").delete().eq("id", id);
  };

  const submit = async (e) => {
    e.preventDefault();
    setProductError("");
    setProductMessage("");

    const product = {
      id: form.id,
      name: { fa: form.nameFa, en: form.nameEn },
      description: { fa: form.descFa, en: form.descEn },
      price: Number(form.price),
      stock: Number(form.stock),
      rating: Number(form.rating ?? 4),
      category: form.category,
      image: form.image || `https://picsum.photos/seed/${Date.now()}/600/400`,
    };

    try {
      await dispatch(saveProduct(product)).unwrap();
      setForm(emptyForm);
      setProductMessage(t("dashboard.saveSuccess") || "محصول با موفقیت ذخیره شد.");
    } catch (error) {
      console.error("Saving product failed:", error);
      setProductError(error?.message || "ذخیره محصول ناموفق بود. اتصال و تنظیمات دیتابیس را بررسی کن.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("از حذف این محصول مطمئنی؟")) return;
    setProductError("");
    setProductMessage("");

    try {
      await dispatch(removeProduct(id)).unwrap();
      if (form.id === id) setForm(emptyForm);
      setProductMessage("محصول با موفقیت حذف شد.");
    } catch (error) {
      console.error("Deleting product failed:", error);
      setProductError(error?.message || "حذف محصول ناموفق بود. اتصال و تنظیمات دیتابیس را بررسی کن.");
    }
  };

  const edit = (p) => {
    setProductError("");
    setProductMessage("");
    setForm({
      id: p.id,
      nameFa: p.name?.fa || "",
      nameEn: p.name?.en || "",
      descFa: p.description?.fa || "",
      descEn: p.description?.en || "",
      price: p.price,
      stock: p.stock,
      category: p.category,
      image: p.image,
      rating: p.rating ?? 4,
    });
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: 20 }}>{t("dashboard.title")}</h1>

      {!backendOn && (
        <div className="empty" style={{ marginBottom: 16 }}>
          {t("dashboard.offline")}
        </div>
      )}

      <div className="dash-shell">
        <aside className="card dash-side">
          {NAV.map(([key, icon]) => (
            <button
              key={key}
              className={`dash-nav ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              <span className="dash-nav-icon">{icon}</span>
              {t(`dashboard.nav.${key}`)}
            </button>
          ))}
        </aside>

        <div className="dash-main">
          {tab === "overview" && (
            <>
              <div className="dash-stats">
                <div className="card dash-stat">
                  <div className="num">{products.length}</div>
                  {t("dashboard.stats.products")}
                </div>
                <div className="card dash-stat">
                  <div className="num">{paid.length}</div>
                  {t("dashboard.stats.orders")}
                </div>
                <div className="card dash-stat">
                  <div className="num">{formatPrice(revenue, lang)}</div>
                  {t("dashboard.stats.revenue")}
                </div>
                <div className="card dash-stat">
                  <div className="num">{formatPrice(todaySales, lang)}</div>
                  {t("dashboard.stats.today")}
                </div>
                <div className="card dash-stat">
                  <div className="num">{users.length}</div>
                  {t("dashboard.stats.users")}
                </div>
                <div className="card dash-stat">
                  <div className="num">{formatPrice(avgOrder, lang)}</div>
                  {t("dashboard.stats.avg")}
                </div>
              </div>

              <div className="card dash-card">
                <h3>{t("dashboard.chart.title")}</h3>
                <div className="dash-chart">
                  {chart.map((d) => (
                    <div key={d.label} className="dash-chart-col">
                      <div
                        className="dash-chart-bar"
                        style={{ height: `${Math.round((d.total / maxTotal) * 100)}%` }}
                        title={formatPrice(d.total, lang)}
                      />
                      <span>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-two">
                <div className="card dash-card">
                  <h3>{t("dashboard.recent")}</h3>
                  {orders.length === 0 ? (
                    <div className="empty">{t("dashboard.orders.empty")}</div>
                  ) : (
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{t("dashboard.customer")}</th>
                          <th>{t("cart.total")}</th>
                          <th>{t("dashboard.status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.customer_name || "—"}</td>
                            <td>{formatPrice(o.total, lang)}</td>
                            <td>
                              <span className={`badge st-${o.status}`}>{statusLabel(o.status)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="card dash-card">
                  <h3>{t("dashboard.lowStock")}</h3>
                  {lowStock.length === 0 ? (
                    <div className="empty">{t("dashboard.none")}</div>
                  ) : (
                    <ul className="dash-list">
                      {lowStock.map((p) => (
                        <li key={p.id}>
                          <img src={p.image} alt="" />
                          <span className="dash-list-name">{p.name?.[lang]}</span>
                          <span className="badge warn">{p.stock}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <div className="dash-layout">
              <form className="card product-form" onSubmit={submit}>
                <h3>{form.id ? t("dashboard.edit") : t("dashboard.addProduct")}</h3>
                {productError && <div className="empty" role="alert" style={{ color: "#b91c1c", marginBottom: 12 }}>{productError}</div>}
                {productMessage && <div className="empty" role="status" style={{ color: "#15803d", marginBottom: 12 }}>{productMessage}</div>}
                <label>
                  {t("dashboard.nameFa")}
                  <input className="input" value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} required />
                </label>
                <label>
                  {t("dashboard.nameEn")}
                  <input className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
                </label>
                <label>
                  {t("dashboard.descFa")}
                  <input className="input" value={form.descFa} onChange={(e) => setForm({ ...form, descFa: e.target.value })} />
                </label>
                <label>
                  {t("dashboard.descEn")}
                  <input className="input" value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} />
                </label>
                <label>
                  {t("dashboard.price")}
                  <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
                </label>
                <label>
                  {t("dashboard.stock")}
                  <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </label>
                <label>
                  {t("dashboard.category")}
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.filter((c) => c !== "all").map((c) => (
                      <option key={c} value={c}>{t(`category.${c}`)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {t("dashboard.image")}
                  <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn" type="submit">{t("dashboard.save")}</button>
                  {form.id ? (
                    <button className="btn-outline" type="button" onClick={() => setForm(emptyForm)}>
                      {t("dashboard.cancel")}
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="card dash-card">
                <div className="dash-toolbar">
                  <input
                    className="input"
                    placeholder={t("dashboard.search")}
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                  />
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>{t("dashboard.nameFa")}</th>
                        <th>{t("dashboard.price")}</th>
                        <th>{t("dashboard.stock")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td><img src={p.image} alt="" /></td>
                          <td>{p.name?.[lang]}</td>
                          <td>{formatPrice(p.price, lang)}</td>
                          <td>
                            <span className={`badge ${(p.stock || 0) <= 5 ? "warn" : "muted"}`}>{p.stock}</span>
                          </td>
                          <td className="actions">
                            <button type="button" className="btn-outline" onClick={() => edit(p)}>{t("dashboard.edit")}</button>
                            <button type="button" className="btn-outline danger" onClick={() => handleDeleteProduct(p.id)}>
                              {t("dashboard.delete")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="card dash-card">
              <div className="dash-toolbar">
                <input
                  className="input"
                  placeholder={t("dashboard.search")}
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                />
                <select className="input" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                  <option value="all">{t("dashboard.all")}</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="empty">{t("dashboard.orders.empty")}</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t("dashboard.customer")}</th>
                        <th>{t("cart.total")}</th>
                        <th>{t("dashboard.status")}</th>
                        <th>{t("dashboard.date")}</th>
                        <th>{t("cart.title")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.customer_name || "—"}</td>
                          <td>{formatPrice(o.total, lang)}</td>
                          <td>
                            <select
                              className="input dash-status"
                              value={o.status}
                              onChange={(e) => setStatus(o.id, e.target.value)}
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>{statusLabel(s)}</option>
                              ))}
                            </select>
                          </td>
                          <td>{dateStr(o.created_at)}</td>
                          <td className="dash-items">
                            {(o.items || []).map((i) => `${i.name?.[lang] || i.id}×${i.qty}`).join("، ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "users" && (
            <div className="card dash-card">
              {users.length === 0 ? (
                <div className="empty">{t("dashboard.users.empty")}</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>{t("dashboard.colName")}</th>
                        <th>{t("dashboard.colEmail")}</th>
                        <th>{t("dashboard.date")}</th>
                        <th>{t("dashboard.role")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name || "—"}</td>
                          <td>{u.email || "—"}</td>
                          <td>{dateStr(u.created_at)}</td>
                          <td>
                            <span className={`badge ${u.role === "admin" ? "ok" : "muted"}`}>
                              {u.role === "admin" ? t("dashboard.roleAdmin") : t("dashboard.roleCustomer")}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-outline"
                              onClick={() => setRole(u.id, u.role === "admin" ? "customer" : "admin")}
                            >
                              {u.role === "admin" ? t("dashboard.demote") : t("dashboard.promote")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="card dash-card">
              {reviews.length === 0 ? (
                <div className="empty">{t("dashboard.reviews.empty")}</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>{t("dashboard.colProduct")}</th>
                        <th>{t("dashboard.colStars")}</th>
                        <th>{t("dashboard.colBody")}</th>
                        <th>{t("dashboard.date")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr key={r.id}>
                          <td>{r.products?.name?.[lang] || r.product_id}</td>
                          <td>{"⭐".repeat(r.stars)}</td>
                          <td className="dash-review-body">{r.body}</td>
                          <td>{dateStr(r.created_at)}</td>
                          <td>
                            <button className="btn-outline danger" onClick={() => deleteReview(r.id)}>
                              {t("dashboard.delete")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "chat" && <AdminChat />}
        </div>
      </div>
    </div>
  );
}