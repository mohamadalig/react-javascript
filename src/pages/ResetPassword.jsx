
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/auth.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const params = new URLSearchParams(window.location.search);
        const errorCode = params.get("error_code");

        if (errorCode) {
          throw new Error(
            errorCode === "otp_expired"
              ? "لینک بازیابی منقضی یا نامعتبر است. لطفاً لینک جدید درخواست کن."
              : params.get("error_description") ||
                  "لینک بازیابی معتبر نیست."
          );
        }

        // Supabase در حالت PKCE کد موجود در query string
        // را هنگام راه‌اندازی کلاینت به نشست تبدیل می‌کند.
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!active) return;

        if (data.session) {
          setValidSession(true);
        } else {
          setError(
            "نشست بازیابی پیدا نشد. از صفحه فراموشی رمز عبور، لینک جدید بگیر."
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message || "بررسی لینک بازیابی ناموفق بود.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        throw new Error(
          "نشست بازیابی معتبر نیست. دوباره لینک بازیابی درخواست کن."
        );
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setMessage("رمز عبور با موفقیت تغییر کرد. اکنون می‌توانی وارد شوی.");
      setValidSession(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "تغییر رمز عبور ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>بازیابی رمز عبور</h2>
          <p>در حال بررسی لینک بازیابی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>بازیابی رمز عبور</h2>
        <p className="auth-subtitle">
          رمز عبور جدیدت را وارد کن.
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

        {validSession && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="new-password">رمز عبور جدید</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                تکرار رمز عبور
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? "در حال ذخیره..." : "ثبت رمز عبور جدید"}
            </button>
          </form>
        )}

        <div className="auth-footer-links">
          <Link to="/forgot-password">درخواست لینک جدید</Link>
          {" · "}
          <Link to="/login">بازگشت به ورود</Link>
        </div>
      </div>
    </div>
  );
}
