import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useT } from "../hooks/useT";
import "../styles/auth.css";

export default function ForgotPassword() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError(t("auth.error.emailRequired") || "لطفاً ایمیل خود را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setMessage(
        t("auth.forgot.success") ||
          "لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً صندوق ورودی (و پوشه اسپم) را بررسی کنید."
      );
    } catch (err) {
      setError(err.message || "خطا در ارسال ایمیل بازیابی");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{t("auth.forgot.title") || "فراموشی رمز عبور"}</h2>
        <p className="auth-subtitle">
          {t("auth.forgot.subtitle") || "ایمیل ثبت‌نامی خود را وارد کنید تا لینک تغییر رمز برای شما ارسال شود."}
        </p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {message && <div className="auth-alert auth-alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t("auth.email") || "ایمیل"}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              dir="ltr"
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "در حال ارسال..." : t("auth.forgot.submit") || "ارسال لینک بازیابی"}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/login">{t("auth.backToLogin") || "بازگشت به صفحه ورود"}</Link>
        </div>
      </div>
    </div>
  );
}
