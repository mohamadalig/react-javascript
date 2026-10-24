import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQty, cartTotal } from "../store/cartSlice";
import { useT } from "../hooks/useT";
import { formatPrice } from "../utils";

export default function Cart() {
  const t = useT();
  const dispatch = useDispatch();
  const lang = useSelector((s) => s.ui.lang);
  const items = useSelector((s) => s.cart.items);

  if (items.length === 0)
    return <div className="container empty">{t("cart.empty")}</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: 20 }}>{t("cart.title")}</h1>
      <div className="cart-list">
        {items.map(({ product, qty }) => (
          <div key={product.id} className="card cart-item">
            <img src={product.image} alt={product.name[lang]} />
            <div className="cart-item-info">
              <div className="product-name">{product.name[lang]}</div>
              <div className="product-price">{formatPrice(product.price, lang)}</div>
            </div>
            <div className="qty-controls">
              <button onClick={() => dispatch(updateQty({ id: product.id, qty: qty - 1 }))}>−</button>
              <span>{qty}</span>
              <button onClick={() => dispatch(updateQty({ id: product.id, qty: qty + 1 }))}>+</button>
            </div>
            <div className="product-price">{formatPrice(product.price * qty, lang)}</div>
            <button className="btn-outline" onClick={() => dispatch(removeFromCart(product.id))}>
              {t("cart.remove")}
            </button>
          </div>
        ))}
      </div>
      <div className="card cart-summary">
        <div className="row">
          <span>{t("cart.total")}</span>
          <strong>{formatPrice(cartTotal(items), lang)}</strong>
        </div>
        <Link to="/checkout" className="btn" style={{ display: "block", textAlign: "center" }}>
          {t("cart.checkout")}
        </Link>
      </div>
    </div>
  );
}