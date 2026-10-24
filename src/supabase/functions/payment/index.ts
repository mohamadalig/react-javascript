import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { action, order_id, authority } = await req.json();

    const merchant = Deno.env.get("ZARINPAL_MERCHANT_ID");
    const siteUrl = Deno.env.get("SITE_URL");
    if (!merchant || !siteUrl) throw new Error("missing secrets");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error } = await admin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (error || !order) throw new Error("order not found");

    // قیمت‌ها تومان است؛ زرین‌پال ریال می‌خواهد
    const amount = order.total * 10;

    if (action === "request") {
      const res = await fetch(
        "https://payment.zarinpal.com/pg/v4/payment/request.json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            merchant_id: merchant,
            amount,
            callback_url: `${siteUrl}/payment/result?order_id=${order.id}`,
            description: `سفارش #${order.id} — لوجا شاپ`,
          }),
        }
      );
      const out = await res.json();
      const authority = out?.data?.authority;
      if (!authority) throw new Error(JSON.stringify(out?.errors ?? out));
      await admin.from("orders").update({ authority }).eq("id", order.id);
      return json({
        redirect: `https://payment.zarinpal.com/pg/StartPay/${authority}`,
      });
    }

    if (action === "verify") {
      const res = await fetch(
        "https://payment.zarinpal.com/pg/v4/payment/verify.json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ merchant_id: merchant, amount, authority }),
        }
      );
      const out = await res.json();
      const code = out?.data?.code;
      const paid = code === 100 || code === 101;
      await admin
        .from("orders")
        .update({ status: paid ? "paid" : "failed" })
        .eq("id", order_id);
      return json({ ok: paid, code });
    }

    return json({ error: "unknown action" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: String(err?.message ?? err) }, 500);
  }
});