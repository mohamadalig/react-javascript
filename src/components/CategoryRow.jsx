import { useRef } from "react";
import { useDispatch } from "react-redux";
import { setCategory } from "../store/filtersSlice";
import { useT } from "../hooks/useT";
import ProductCard from "./ProductCard";

export default function CategoryRow({ category, products }) {
  const t = useT();
  const dispatch = useDispatch();
  const ref = useRef(null);

  const rtl = document.documentElement.dir === "rtl";
  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir * (rtl ? -1 : 1) * 640, behavior: "smooth" });

  const viewAll = () => {
    dispatch(setCategory(category));
    window.scrollTo({ top: 0 });
  };

  return (
    <section className="cat-row">
      <div className="cat-row-head">
        <h2>{t(`category.${category}`)}</h2>
        <div className="row-head-actions">
          <button className="link-btn view-all" onClick={viewAll}>
            {t("row.viewAll")}
          </button>
          <div className="row-arrows">
            <button onClick={() => scroll(1)} aria-label="prev">‹</button>
            <button onClick={() => scroll(-1)} aria-label="next">›</button>
          </div>
        </div>
      </div>
      <div className="h-scroll" ref={ref}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}