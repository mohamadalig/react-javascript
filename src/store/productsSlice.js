import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { seedProducts } from "../data/products";
import { supabase, backendOn } from "../lib/supabase";

// تبدیل رکورد Supabase به ساختار محصول برنامه
const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  oldPrice: row.old_price ?? undefined,
  category: row.category,
  image: row.image,
  gallery: Array.isArray(row.gallery) && row.gallery.length > 0
    ? row.gallery
    : row.image
      ? [row.image]
      : [],
  rating: Number(row.rating ?? 4),
  stock: Number(row.stock ?? 0),
});

// ساختار داده برای ذخیره در Supabase
const mapToRow = (product) => ({
  name: product.name,
  description: product.description,
  price: Number(product.price),
  old_price: product.oldPrice ?? null,
  category: product.category,
  image: product.image,
  gallery: product.gallery ?? (product.image ? [product.image] : []),
  rating: Number(product.rating ?? 4),
  stock: Number(product.stock ?? 0),
});

// دریافت محصولات
export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (_, { rejectWithValue }) => {
    if (!backendOn || !supabase) {
      return {
        products: seedProducts,
        source: "seed",
      };
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        return rejectWithValue(error.message);
      }

      return {
        products: (data ?? []).map(mapRow),
        source: "database",
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "دریافت محصولات ناموفق بود."
      );
    }
  }
);

// افزودن یا ویرایش محصول
export const saveProduct = createAsyncThunk(
  "products/save",
  async (product, { rejectWithValue }) => {
    if (!backendOn || !supabase) {
      return rejectWithValue(
        "اتصال به Supabase فعال نیست؛ محصول ذخیره نشد."
      );
    }

    try {
      const row = mapToRow(product);
      let result;

      if (product.id !== undefined && product.id !== null) {
        // ویرایش محصول موجود در دیتابیس
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
          "محصول در دیتابیس پیدا نشد یا ذخیره نشد. شناسه محصول را بررسی کن."
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

// حذف محصول از دیتابیس
export const removeProduct = createAsyncThunk(
  "products/remove",
  async (id, { rejectWithValue }) => {
    if (!backendOn || !supabase) {
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

      if (!data || data.length === 0) {
        return rejectWithValue(
          "محصول حذف نشد. شناسه محصول یا مجوزهای دیتابیس را بررسی کن."
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

// وضعیت اولیه Redux
const initialState = {
  list: seedProducts,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  initialized: false,
  source: "seed",
};

// ساخت Slice
const productsSlice = createSlice({
  name: "products",
  initialState,

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
        state.source = action.payload.source;
        state.list = action.payload.products;
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "دریافت محصولات ناموفق بود.";
      })

      // شروع ذخیره محصول
      .addCase(saveProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })

      // ذخیره موفق
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

      // خطای ذخیره
      .addCase(saveProduct.rejected, (state, action) => {
        state.saving = false;
        state.error =
          action.payload ||
          action.error.message ||
          "ذخیره محصول ناموفق بود.";
      })

      // شروع حذف
      .addCase(removeProduct.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      // حذف موفق
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.deleting = false;

        state.list = state.list.filter(
          (item) => String(item.id) !== String(action.payload)
        );
      })

      // خطای حذف
      .addCase(removeProduct.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload ||
          action.error.message ||
          "حذف محصول ناموفق بود.";
      });
  },
});

// خروجی‌های Slice
export const { clearProductsError } = productsSlice.actions;

export default productsSlice.reducer;