import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { clearCart } from "../store/cartSlice";
import { supabase, backendOn } from "../lib/supabase";
import { useT } from "../hooks/useT";

export default function PaymentResult() {
  const t = useT();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const items = useSelector((s) => s.cart.items);
  const [state, setState] = useState("checking"); // checking | success | failed

  useEffect(() => {
    if (!backendOn) {
      setState("failed");
      return;
    }
    const orderId = params.get("order_id");
    const authority = params.get("Authority");
    const status = params.get("Status");

    if (!orderId || !authority || status !== "OK") {
      setState("failed");
      return;
    }

    supabase.functions
      .invoke("payment", {
        body: { action: "verify", order_id: Number(orderId), authority },
      })
      .then(({ data }) => {
        if (data?.ok) {
          if (items.length > 0) dispatch(clearCart());
          setState("success");
        } else {
          setState("failed");
        }
      })
      .catch(() => setState("failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      {state === "checking" && <div className="empty">{t("payment.checking")}</div>}
      {state === "success" && (
        <div className="success">✓ {t("payment.success")}</div>
      )}
      {state === "failed" && (
        <div className="empty">{t("payment.failed")}</div>
      )}
    </div>
  );
}