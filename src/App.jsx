
import React, { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Header from "./components/Header";
import Footer from "./components/Footer";
import LiveChat from "./components/LiveChat";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/ChecKout.jsx";
import PaymentResult from "./pages/PaymentResult";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { fetchProducts } from "./store/productsSlice";

export default function App() {
  const dispatch = useDispatch();

  const theme = useSelector((state) => state.ui?.theme || "light");
  const lang = useSelector((state) => state.ui?.lang || "fa");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute(
      "dir",
      lang === "fa" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", lang);
  }, [theme, lang]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <HashRouter>
      <div className="app-container">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />
          </Routes>
        </main>

        <Footer />
        <LiveChat />
      </div>
    </HashRouter>
  );
}
