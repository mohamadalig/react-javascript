import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCategory } from "../store/filtersSlice";
import { categories } from "../data/products";
import { useT } from "../hooks/useT";

const icons = { electronics: "📱", clothes: "👕", home: "🏠" };

export default function CategoryCircles() {
  const t = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <section className="cat-circles">
      {categories.slice(1).map((c) => (
        <button
          key={c}
          className="cat-circle"
          onClick={() => {
            dispatch(setCategory(c));
            navigate("/");
            window.scrollTo({ top: 0 });
          }}
        >
          <span className="cat-icon">{icons[c]}</span>
          <span>{t(`category.${c}`)}</span>
        </button>
      ))}
    </section>
  );
}