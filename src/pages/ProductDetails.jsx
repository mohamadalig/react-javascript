import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { useT } from "../hooks/useT";
import { formatPrice } from "../utils";
import ProductCard from "../components/ProductCard";
import { getJSON, setJSON } from "../lib/safeStorage";

const loadUserReviews = (pid) => {
  try {
    return JSON.parse(localStorage.getItem(`reviews-${pid}`) || "[]");
  } catch {
    return [];
  }
};

export default function ProductDetails() {
  const { id } = useParams();
  const t = useT();
  const dispatch = useDispatch();
  const lang = useSelector((s) => s.ui.lang);
  const products = useSelector((s) => s.products.list);
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(null);
  const [tab, setTab] = useState("desc");
  const [userReviews, setUserReviews] = useState(() => loadUserReviews(Number(id)));
  const [form, setForm] = useState({ name: "", stars: 5, text: "" });
  const [formError, setFormError] = useState("");

  const product = products.find((p) => p.id === Number(id));
  if (!product)
    return <div className="container empty">{t("product.outOfStock")}</div>;

  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const shown = imgIndex !== null && gallery[imgIndex] ? gallery[imgIndex] : gallery[0];
  const off = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const demoReviews = [
    { name: t("details.reviewer1"), stars: 5, text: t("details.review1") },
    { name: t("details.reviewer2"), stars: 4, text: t("details.review2") },
    { name: t("details.reviewer3"), stars: 5, text: t("details.review3") },
  ];

  const submitReview = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      setFormError(t("reviews.err"));
      return;
    }
    const item = {
      name: form.name.trim(),
      stars: Number(form.stars),
      text: form.text.trim(),
      date: new Date().toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US"),
    };
    const next = [item, ...userReviews];
    setUserReviews(next);
    setJSON(`reviews-${product.id}`, next);
    setForm({ name: "", stars: 5, text: "" });
    setFormError("");
  };

  const specs = [
    [t("details.specs.brand"), t("details.specs.brandValue")],
    [t("details.specs.warranty"), t("details.specs.warrantyValue")],
    [t("details.specs.shipping"), t("details.specs.shippingValue")],
  ];

  return (
    <div className="container">
      <div className="card details">
        <div className="details-gallery">
          <img className="gallery-main" src={shown} alt={product.name[lang]} />
          <div className="gallery-thumbs">
            {gallery.map((src, i) => (
              <button
                key={src}
                className={`gallery-thumb ${(imgIndex ?? 0) === i ? "active" : ""}`}
                onClick={() => setImgIndex(i)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="details-info">
          <h1>{product.name[lang]}</h1>
          <div className="product-rating">
            {"★".repeat(Math.round(product.rating))} ({product.rating})
          </div>
          <div className="product-price-row details-price">
            <span className="product-price" style={{ fontSize: 22 }}>
              {formatPrice(product.price, lang)}
            </span>
            {product.oldPrice && (
              <>
                <span className="old-price">{formatPrice(product.oldPrice, lang)}</span>
                <span className="discount-badge">-{off}%</span>
              </>
            )}
          </div>
          <p className="desc">{product.description[lang]}</p>
          {product.stock > 0 ? (
            <div className="stock-ok">{t("product.stock")}: {product.stock}</div>
          ) : (
            <div className="stock-out">{t("product.outOfStock")}</div>
          )}
          <div className="qty-row">
            <label>{t("product.qty")}</label>
            <input
              className="input"
              type="number"
              min="1"
              max={product.stock || 1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            />
            <button
              className="btn"
              disabled={product.stock === 0}
              onClick={() => dispatch(addToCart({ product, qty }))}
            >
              {t("product.addToCart")}
            </button>
            <Link to="/cart" className="btn-outline">{t("nav.cart")}</Link>
          </div>
        </div>
      </div>

      <div className="card details-tabs">
        <div className="tab-btns">
          <button className={`tab-btn ${tab === "desc" ? "active" : ""}`} onClick={() => setTab("desc")}>
            {t("details.tab.desc")}
          </button>
          <button className={`tab-btn ${tab === "specs" ? "active" : ""}`} onClick={() => setTab("specs")}>
            {t("details.tab.specs")}
          </button>
          <button className={`tab-btn ${tab === "reviews" ? "active" : ""}`} onClick={() => setTab("reviews")}>
            {t("details.tab.reviews")}
          </button>
        </div>

        {tab === "desc" && <p className="tab-desc">{product.description[lang]}</p>}

        {tab === "specs" && (
          <table className="spec-table">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "reviews" && (
          <div className="reviews-wrap">
            <div className="reviews-avg">
              <span>{t("reviews.avg")}:</span>
              <span className="product-rating">
                {"★".repeat(Math.round(product.rating))} ({product.rating})
              </span>
            </div>

            <ul className="reviews-list">
              {[...userReviews, ...demoReviews].map((r, i) => (
                <li key={i} className="review-item">
                  <div className="review-head">
                    <strong>{r.name}</strong>
                    <span className="product-rating">{"★".repeat(r.stars)}</span>
                  </div>
                  <p>{r.text}</p>
                </li>
              ))}
            </ul>

            <form className="review-form" onSubmit={submitReview} noValidate>
              <h3>{t("reviews.form.title")}</h3>
              <input
                className="input"
                placeholder={t("reviews.name")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="star-picker">
                <span className="muted">{t("reviews.stars")}:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`star ${n <= form.stars ? "on" : ""}`}
                    onClick={() => setForm({ ...form, stars: n })}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="input"
                rows="3"
                placeholder={t("reviews.yourReview")}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
              {formError && <div className="field-error">{formError}</div>}
              <button className="btn" type="submit">{t("reviews.submit")}</button>
            </form>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <>
          <h2 style={{ margin: "32px 0 16px" }}>{t("product.related")}</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}