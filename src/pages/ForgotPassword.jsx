import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("لطفاً آدرس ایمیل خود را وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      // آدرس برگشت سازگار با GitHub Pages و HashRouter
      const redirectTo = new URL(
        import.meta.env.BASE_URL,
        window.location.origin
      );

      redirectTo.searchParams.set("recovery", "1");

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: redirectTo.toString(),
        });

      if (resetError) {
        throw resetError;
      }

      setMessage(
        "اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی برای آن ارسال می‌شود. صندوق ورودی و پوشه Spam را بررسی کنید."
      );
    } catch (err) {
      console.error("Password recovery error:", err);

      setError(
        err.message || "ارسال ایمیل بازیابی ناموفق بود. دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>فراموشی رمز عبور</h2>

        <p className="auth-subtitle">
          ایمیل حساب خود را وارد کنید تا لینک بازیابی رمز عبور برایتان ارسال شود.
        </p>

        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-alert auth-alert-success" role="status">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="recovery-email">آدرس ایمیل</label>

            <input
              id="recovery-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@example.com"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/login">بازگشت به صفحه ورود</Link>
        </div>
      </div>
    </div>
  );
}