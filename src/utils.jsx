export const formatPrice = (price, lang) =>
  lang === "fa" ? `${price.toLocaleString("fa-IR")} تومان` : `$${price.toFixed(2)}`;