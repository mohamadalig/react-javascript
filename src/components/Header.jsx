import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLang, toggleTheme } from "../store/uiSlice";
import { setCategory } from "../store/filtersSlice";
import { logout } from "../store/userSlice";
import { useT } from "../hooks/useT";
import SearchBar from "./SearchBar";
import { categories } from "../data/products";

export default function Header() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const theme = useSelector((s) => s.ui.theme);
  const lang = useSelector((s) => s.ui.lang);
  const user = useSelector((s) => s.user.currentUser);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((n, i) => n + i.qty, 0)
  );

  const goCategory = (key) => {
    dispatch(setCategory(key));
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="topbar">
        <div className="container">{t("topbar.promo")}</div>
      </div>

      <div className="container header-inner">
        <button
          className="icon-btn hamburger"
          aria-label="menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ☰
        </button>

        <Link to="/" className="brand">{t("brand")}</Link>

        <SearchBar />

        <div className="header-actions">
          <button className="icon-btn" onClick={() => dispatch(toggleTheme())} aria-label="theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button className="icon-btn" onClick={() => dispatch(setLang(lang === "fa" ? "en" : "fa"))}>
            {lang === "fa" ? "EN" : "فا"}
          </button>

          <Link to="/cart" className="icon-btn cart-btn">
            🛒
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <button className="icon-btn user-btn" onClick={() => setUserOpen((v) => !v)}>
                👤 {user.name.split(" ")[0]}
              </button>
              {userOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-name">{user.name}</div>
                  {user.role === "admin" && (
                    <Link to="/dashboard" onClick={() => setUserOpen(false)}>
                      {t("nav.dashboard")}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setUserOpen(false);
                      navigate("/");
                    }}
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline btn-sm">{t("nav.login")}</Link>
              <Link to="/register" className="btn btn-sm">{t("nav.register")}</Link>
            </>
          )}
        </div>
      </div>

      <nav className={`container nav-row ${menuOpen ? "open" : ""}`}>
        {categories.map((c) => (
          <button key={c} className="nav-link" onClick={() => goCategory(c)}>
            {c === "all" ? t("filter.all") : t(`category.${c}`)}
          </button>
        ))}
      </nav>
    </header>
  );
}