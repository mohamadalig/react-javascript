import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useT } from "../hooks/useT";
import "../styles/auth.css";

export default function ResetPassword() {
  const t = useT();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password) {
      setError("لطفاً رمز عبور جدید را وارد کنید");
      return;
    }
    if (password.length < 6) {
      setError("رمز عبور حداقل ۶ کاراکتر باشد");
      return;
    }
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }

    setLoading(true);
    try {
      // کاربر از طریق لینک ایمیل بازیابی وارد شده و سشن دارد
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("رمز عبور با موفقیت تغییر کرد. حالا می‌توانید وارد شوید.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.message === "Auth session missing!") {
        setError(
          "لینک بازیابی منقضی یا استفاده شده است. لطفاً دوباره از صفحه ورود لینک جدید بگیرید."
        );
      } else {
        setError(err.message || "خطا در تغییر رمز عبور");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>تغییر رمز عبور</h2>
        <p className="auth-subtitle">
          رمز عبور جدید خود را وارد کنید.
        </p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {message && <div className="auth-alert auth-alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>رمز عبور جدید</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label>تکرار رمز عبور جدید</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "در حال ذخیره..." : "تغییر رمز عبور"}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/login">بازگشت به صفحه ورود</Link>
        </div>
      </div>
    </div>
  );
}
