import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useT } from "../hooks/useT";
import HeroSlider from "../components/HeroSlider";
import AmazingOffers from "../components/AmazingOffers";
import CategoryCircles from "../components/CategoryCircles";
import CategoryRow from "../components/CategoryRow";
import ProductCard from "../components/ProductCard";
import FilterBar from "../components/FilterBar";
import { categories } from "../data/products";

export default function Home() {
  const t = useT();
  const list = useSelector((s) => s.products.list);
  const filters = useSelector((s) => s.filters);

  const showRows =
    filters.category === "all" &&
    !filters.search &&
    !filters.maxPrice &&
    !filters.minRating;

  const filtered = useMemo(() => {
    let result = list.filter(
      (p) =>
        (filters.category === "all" || p.category === filters.category) &&
        (!filters.search ||
          p.name.fa.includes(filters.search) ||
          p.name.en.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.maxPrice || p.price <= filters.maxPrice) &&
        p.rating >= filters.minRating
    );
    if (filters.sort === "cheap") result = [...result].sort((a, b) => a.price - b.price);
    if (filters.sort === "expensive") result = [...result].sort((a, b) => b.price - a.price);
    if (filters.sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [list, filters]);

  const byCategory = (c) =>
    list.filter((p) => p.category === c).sort((a, b) => b.rating - a.rating).slice(0, 12);

  if (showRows) {
    return (
      <div className="container">
        <HeroSlider />
        <AmazingOffers />
        <CategoryCircles />
        {categories.slice(1).map((c) => (
          <CategoryRow key={c} category={c} products={byCategory(c)} />
        ))}
      </div>
    );
  }

  return (
    <div className="container">
      <FilterBar />
      {filtered.length === 0 ? (
        <div className="empty">{t("cart.empty")}</div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}