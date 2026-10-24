import { useRef } from "react";
import { useSelector } from "react-redux";
import { useT } from "../hooks/useT";
import ProductCard from "./ProductCard";

export default function AmazingOffers() {
  const t = useT();
  const ref = useRef(null);
  const list = useSelector((s) => s.products.list);

  const deals = list
    .filter((p) => p.oldPrice)
    .map((p) => ({ ...p, off: 1 - p.price / p.oldPrice }))
    .sort((a, b) => b.off - a.off)
    .slice(0, 12);

  if (deals.length === 0) return null;

  const rtl = document.documentElement.dir === "rtl";
  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir * (rtl ? -1 : 1) * 640, behavior: "smooth" });

  return (
    <section className="amazing" id="amazing">
      <div className="amazing-head">
        <h2>⚡ {t("amazing.title")}</h2>
        <div className="row-arrows">
          <button onClick={() => scroll(1)} aria-label="prev">‹</button>
          <button onClick={() => scroll(-1)} aria-label="next">›</button>
        </div>
      </div>
      <div className="h-scroll" ref={ref}>
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}