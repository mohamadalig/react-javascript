import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import { setUser } from "../store/userSlice";
import { useT } from "../hooks/useT";
import "../styles/auth.css";

export default function Login() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "لطفاً ایمیل خود را وارد کنید";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "فرمت ایمیل صحیح نیست";
    }
    if (!password) {
      errs.password = "لطفاً رمز عبور را وارد کنید";
    } else if (password.length < 6) {
      errs.password = "رمز عبور حداقل ۶ کاراکتر است";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setErrors({ form: "ایمیل یا رمز عبور اشتباه است" });
        } else if (error.message === "Email not confirmed") {
          setErrors({ form: "ایمیل شما تأیید نشده است. لطفاً ایمیل خود را بررسی کنید." });
        } else {
          setErrors({ form: error.message });
        }
        return;
      }

      if (data?.user) {
        // نقش از هر دو منبع خوانده می‌شود و نرمال می‌شود (حروف کوچک و بدون فاصله)
        const rawRole =
          data.user.app_metadata?.role ||
          data.user.user_metadata?.role ||
          "user";
        const role = String(rawRole).trim().toLowerCase();

        console.log("USER DATA:", data.user);
        console.log("ROLE:", role);

        dispatch(
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email,
            role,
          })
        );

        navigate(role === "admin" ? "/dashboard" : "/");
      }
    } catch (err) {
      setErrors({ form: err.message || "خطای نامشخص در ورود" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{t("auth.login.title") || "ورود به حساب کاربری"}</h2>
        <p className="auth-subtitle">
          {t("auth.login.subtitle") || "برای ادامه وارد حساب خود شوید."}
        </p>

        {errors.form && <div className="auth-alert auth-alert-error">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>{t("auth.email") || "ایمیل"}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              dir="ltr"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>{t("auth.password") || "رمز عبور"}</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className={errors.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="نمایش رمز"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-row">
            <Link to="/forgot-password" className="forgot-link">
              {t("auth.forgot.link") || "رمز عبورم را فراموش کرده‌ام"}
            </Link>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "در حال ورود..." : t("auth.login.submit") || "ورود"}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>{t("auth.noAccount") || "حساب کاربری ندارید؟"}</span>
          <Link to="/register">{t("auth.register.link") || "ثبت‌نام کنید"}</Link>
        </div>
      </div>
    </div>
  );
}
