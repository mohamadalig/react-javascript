import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCategory } from "../store/filtersSlice";
import { categories } from "../data/products";
import { useT } from "../hooks/useT";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Footer() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError(t("footer.err.email"));
      setDone(false);
      return;
    }
    setError("");
    setDone(true);
    setEmail("");
  };

  const goCategory = (key) => {
    dispatch(setCategory(key));
    navigate("/");
    window.scrollTo({ top: 0 });
  };

  const services = [
    ["🚚", "hero.features.shipping"],
    ["🔒", "footer.payments"],
    ["↩️", "hero.features.guarantee"],
    ["💬", "hero.features.support"],
  ];

  return (
    <footer className="footer">
      <div className="container footer-services">
        {services.map(([icon, key]) => (
          <div key={key} className="service-item">
            <span className="service-icon">{icon}</span>
            <span>{t(key)}</span>
          </div>
        ))}
      </div>

      <div className="container footer-grid">
        <div className="footer-col">
          <h4>{t("brand")}</h4>
          <p className="footer-about">{t("footer.about")}</p>
          <div className="socials">
            <a href="#" aria-label="instagram">📷</a>
            <a href="#" aria-label="telegram">✈️</a>
            <a href="#" aria-label="x">𝕏</a>
            <a href="#" aria-label="youtube">▶️</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{t("footer.links")}</h4>
          <ul>
            <li><Link to="/">{t("nav.home")}</Link></li>
            <li><Link to="/cart">{t("nav.cart")}</Link></li>
            <li><Link to="/login">{t("nav.login")}</Link></li>
            <li><Link to="/register">{t("nav.register")}</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t("footer.categories")}</h4>
          <ul>
            {categories.slice(1).map((c) => (
              <li key={c}>
                <button className="link-btn" onClick={() => goCategory(c)}>
                  {t(`category.${c}`)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t("footer.contact")}</h4>
          <ul>
            <li>support@lojashop.com</li>
            <li>+98 21 0000 0000</li>
            <li>{t("footer.address")}</li>
          </ul>
          <form className="newsletter" onSubmit={subscribe} noValidate>
            <label>{t("footer.newsletter")}</label>
            <div className="newsletter-row">
              <input
                className="input"
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn" type="submit">{t("footer.subscribe")}</button>
            </div>
            {error && <div className="field-error">{error}</div>}
            {done && <div className="field-ok">{t("footer.ok.subscribe")}</div>}
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{t("footer.followUs")}</span>
        <span>{t("footer.payments")} 🔒 💳 Visa · Mastercard</span>
        <span>© 2026 {t("brand")} — {t("footer.rights")}</span>
      </div>
    </footer>
  );
}