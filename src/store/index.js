import { configureStore } from "@reduxjs/toolkit";
import cart from "./cartSlice";
import user from "./userSlice";
import ui from "./uiSlice";
import products from "./productsSlice";
import filters from "./filtersSlice";

export const store = configureStore({
  reducer: { cart, user, ui, products, filters },
});