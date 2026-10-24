import { createSlice } from "@reduxjs/toolkit";
import { getJSON, setJSON } from "../lib/safeStorage";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: getJSON("cart", []) },
  reducers: {
    addToCart: (state, action) => {
      const { product, qty = 1 } = action.payload;
      const item = state.items.find((i) => i.product.id === product.id);
      if (item) item.qty += qty;
      else state.items.push({ product, qty });
      setJSON("cart", state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
      setJSON("cart", state.items);
    },
    updateQty: (state, action) => {
      const item = state.items.find((i) => i.product.id === action.payload.id);
      if (item) item.qty = Math.max(1, action.payload.qty);
      setJSON("cart", state.items);
    },
    clearCart: (state) => {
      state.items = [];
      setJSON("cart", state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export const cartTotal = (items) =>
  items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
export default cartSlice.reducer;