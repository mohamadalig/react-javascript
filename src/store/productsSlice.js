import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { seedProducts } from "../data/products";
import { supabase, backendOn } from "../lib/supabase";

const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  oldPrice: row.old_price ?? undefined,
  category: row.category,
  image: row.image,
  gallery: row.gallery?.length ? row.gallery : [row.image],
  rating: Number(row.rating),
  stock: row.stock,
});

// واکشی محصولات از دیتابیس؛ اگر خطا یا خالی بود، همان داده‌های seed می‌مانند
export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  if (!backendOn) return null;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");
  if (error || !data?.length) return null;
  return data.map(mapRow);
});

// افزودن یا ویرایش محصول (ادمین) — روی دیتابیس، و اگر بک‌اند نبود محلی
export const saveProduct = createAsyncThunk("products/save", async (p) => {
  if (!backendOn) return { ...p, id: p.id ?? Date.now() };
  const row = {
    name: p.name,
    description: p.description,
    price: p.price,
    old_price: p.oldPrice ?? null,
    category: p.category,
    image: p.image,
    gallery: p.gallery ?? [p.image],
    rating: p.rating ?? 4,
    stock: p.stock ?? 0,
  };
  if (p.id) {
    const { data, error } = await supabase
      .from("products")
      .update(row)
      .eq("id", p.id)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  }
  const { data, error } = await supabase.from("products").insert(row).select().single();
  if (error) throw error;
  return mapRow(data);
});

export const removeProduct = createAsyncThunk("products/remove", async (id) => {
  if (backendOn) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }
  return id;
});

const productsSlice = createSlice({
  name: "products",
  initialState: { list: seedProducts, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        const p = action.payload;
        const idx = state.list.findIndex((x) => x.id === p.id);
        if (idx >= 0) state.list[idx] = p;
        else state.list.unshift(p);
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((x) => x.id !== action.payload);
      });
  },
});

export default productsSlice.reducer;