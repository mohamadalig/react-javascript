import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { useT } from "../hooks/useT";
import { formatPrice } from "../utils";

export default function ProductCard({ product }) {
  const t = useT();
  const dispatch = useDispatch();
  const lang = useSelector((s) => s.ui.lang);
  const off = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div className="card product-card">
      <div className="product-card-media">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name[lang]} />
        </Link>
        {off > 0 && <span className="discount-badge">-{off}%</span>}
      </div>
      <div className="product-card-body">
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name[lang]}
        </Link>
        <div className="product-rating">
          {"★".repeat(Math.round(product.rating))}
          <span className="muted"> ({product.rating})</span>
        </div>
        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.price, lang)}</span>
          {product.oldPrice && (
            <span className="old-price">{formatPrice(product.oldPrice, lang)}</span>
          )}
        </div>
        <button className="btn" onClick={() => dispatch(addToCart({ product }))}>
          {t("product.addToCart")}
        </button>
      </div>
    </div>
  );
}