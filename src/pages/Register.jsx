import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/userSlice";
import { supabase, backendOn } from "../lib/supabase";
import { useT } from "../hooks/useT";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Register() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 3) next.name = t("auth.err.name");
    if (!EMAIL_RE.test(form.email.trim())) next.email = t("auth.err.email");
    const pass = form.password;
    if (pass.length < 8 || !/[a-zA-Z]/.test(pass) || !/\d/.test(pass)) {
      next.password = t("auth.err.password");
    }
    if (form.confirm !== pass || !form.confirm) {
      next.confirm = t("auth.err.confirm");
    }
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // حالت بدون بک‌اند: ثبت‌نام دمو
    if (!backendOn) {
      dispatch(login({
        id: Date.now().toString(),
        name: form.name.trim(),
        email: form.email.trim(),
        role: "customer",
      }));
      navigate("/");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { name: form.name.trim() } },
    });

    if (error) {
      setErrors({ email: error.message });
      setBusy(false);
      return;
    }

    if (!data.session) {
      // اگر Confirm email در پنل روشن باشد به این پیام می‌رسید
      setErrors({ email: t("auth.confirmNeeded") });
      setBusy(false);
      return;
    }

    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      name: form.name.trim(),
      role: "customer",
    });

    dispatch(login({
      id: data.user.id,
      name: form.name.trim(),
      email: data.user.email,
      role: "customer",
    }));
    setBusy(false);
    navigate("/");
  };

  const field = (field, type, label) => (
    <div className="field">
      <input
        className={`input ${errors[field] ? "input-error" : ""}`}
        type={type}
        placeholder={t(label)}
        value={form[field]}
        onChange={set(field)}
      />
      {errors[field] && <div className="field-error">{errors[field]}</div>}
    </div>
  );

  return (
    <div className="container">
      <form className="card auth-box" onSubmit={submit} noValidate>
        <h2>{t("auth.registerTitle")}</h2>
        {field("name", "text", "auth.name")}
        {field("email", "email", "auth.email")}
        {field("password", "password", "auth.password")}
        {field("confirm", "password", "auth.confirmPassword")}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "…" : t("auth.submitRegister")}
        </button>
        <div className="auth-hint">
          {t("auth.haveAccount")} <Link to="/login" className="auth-link">{t("auth.submitLogin")}</Link>
        </div>
      </form>
    </div>
  );
}