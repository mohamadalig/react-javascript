import { useDispatch, useSelector } from "react-redux";
import { setCategory, setMaxPrice, setMinRating, setSort } from "../store/filtersSlice";
import { useT } from "../hooks/useT";
import { categories } from "../data/products";

export default function FilterBar() {
  const t = useT();
  const dispatch = useDispatch();
  const filters = useSelector((s) => s.filters);

  return (
    <div className="filter-bar">
      {categories.map((c) => (
        <button
          key={c}
          className={`chip ${filters.category === c ? "active" : ""}`}
          onClick={() => dispatch(setCategory(c))}
        >
          {c === "all" ? t("filter.all") : t(`category.${c}`)}
        </button>
      ))}
      <select value={filters.sort} onChange={(e) => dispatch(setSort(e.target.value))}>
        <option value="newest">{t("sort.newest")}</option>
        <option value="cheap">{t("sort.cheap")}</option>
        <option value="expensive">{t("sort.expensive")}</option>
        <option value="rating">{t("sort.rating")}</option>
      </select>
      <input
        type="number"
        min="0"
        placeholder={t("filter.price")}
        value={filters.maxPrice || ""}
        onChange={(e) => dispatch(setMaxPrice(Number(e.target.value)))}
      />
      <select value={filters.minRating} onChange={(e) => dispatch(setMinRating(Number(e.target.value)))}>
        <option value={0}>{t("filter.rating")}</option>
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>{r}★+</option>
        ))}
      </select>
    </div>
  );
}