```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { seedProducts } from "../data/products";
import { supabase, backendOn } from "../lib/supabase";

// تبدیل رکورد دیتابیس به ساختار برنامه
const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  oldPrice: row.old_price ?? undefined,
  category: row.category,
  image: row.image,
  gallery: row.gallery?.length ? row.gallery : [row.image],
  rating: Number(row.rating ?? 4),
  stock: Number(row.stock ?? 0),
});

// دریافت محصولات واقعی از دیتابیس
export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (_, { rejectWithValue }) => {
    if (!backendOn) {
      return { products: seedProducts, source: "seed" };
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id");

    if (error) {
      return rejectWithValue(error.message);
    }

    return {
      products: (data ?? []).map(mapRow),
      source: "database",
    };
  }
);

// افزودن یا ویرایش محصول
export const saveProduct = createAsyncThunk(
  "products/save",
  async (product, { rejectWithValue }) => {
    if (!backendOn) {
      return rejectWithValue(
        "اتصال به Supabase فعال نیست؛ تغییرات ذخیره نشدند."
      );
    }

    const row = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      old_price: product.oldPrice ?? null,
      category: product.category,
      image: product.image,
      gallery: product.gallery ?? [product.image],
      rating: Number(product.rating ?? 4),
      stock: Number(product.stock ?? 0),
    };

    try {
      let result;

      if (product.id != null) {
        // ویرایش محصول موجود
        result = await supabase
          .from("products")
          .update(row)
          .eq("id", product.id)
          .select()
          .maybeSingle();
      } else {
        // افزودن محصول جدید
        result = await supabase
          .from("products")
          .insert(row)
          .select()
          .single();
      }

      if (result.error) {
        return rejectWithValue(result.error.message);
      }

      if (!result.data) {
        return rejectWithValue(
          "محصول در دیتابیس پیدا نشد یا ذخیره نشد."
        );
      }

      return mapRow(result.data);
    } catch (error) {
      return rejectWithValue(
        error.message || "ذخیره محصول ناموفق بود."
      );
    }
  }
);

// حذف واقعی محصول
export const removeProduct = createAsyncThunk(
  "products/remove",
  async (id, { rejectWithValue }) => {
    if (!backendOn) {
      return rejectWithValue(
        "اتصال به Supabase فعال نیست؛ محصول حذف نشد."
      );
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        return rejectWithValue(error.message);
      }

      if (!data?.length) {
        return rejectWithValue(
          "محصول حذف نشد؛ شناسه یا مجوزهای دیتابیس را بررسی کن."
        );
      }

      return id;
    } catch (error) {
      return rejectWithValue(
        error.message || "حذف محصول ناموفق بود."
      );
    }
  }
);

const productsSlice = createSlice({
  name: "products",

  initialState: {
    list: seedProducts,
    loading: false,
    saving: false,
    error: null,
    initialized: false,
  },

  reducers: {
    clearProductsError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // دریافت محصولات
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;

        // حتی اگر دیتابیس خالی باشد، محصولات آزمایشی
        // دوباره وارد فهرست نمی‌شوند.
        state.list = action.payload.products;
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "دریافت محصولات ناموفق بود.";
      })

      // ذخیره محصول
      .addCase(saveProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })

      .addCase(saveProduct.fulfilled, (state, action) => {
        state.saving = false;

        const product = action.payload;

        const index = state.list.findIndex(
          (item) => String(item.id) === String(product.id)
        );

        if (index !== -1) {
          state.list[index] = product;
        } else {
          state.list.unshift(product);
        }
      })

      .addCase(saveProduct.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload ||
          action.error.message ||
          "ذخیره محصول ناموفق بود.";
      })

      // حذف محصول
      .addCase(removeProduct.pending, (state) => {
        state.error = null;
      })

      .addCase(removeProduct.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (item) => String(item.id) !== String(action.payload)
        );
      })

      .addCase(removeProduct.rejected, (state, action) => {
        state.error =
          action.payload ||
          action.error.message ||
          "حذف محصول ناموفق بود.";
      });
  },
});

export const { clearProductsError } = productsSlice.actions;

export default productsSlice.reducer;
```