import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./styles/global.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/product.css";
import "./styles/cart.css";
import "./styles/auth.css";
import "./styles/chat.css";
import "./styles/dashboard.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);