import { useDispatch, useSelector } from "react-redux";
import { setSearch } from "../store/filtersSlice";
import { useT } from "../hooks/useT";

export default function SearchBar() {
  const t = useT();
  const dispatch = useDispatch();
  const search = useSelector((s) => s.filters.search);

  return (
    <div className="search-box">
      <input
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        placeholder={t("search.placeholder")}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
}