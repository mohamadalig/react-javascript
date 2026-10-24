
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { seedProducts } from "../data/products";
import { supabase, backendOn } from "../lib/supabase";

// تبدیل رکورد دیتابیس به ساختار مورد استفاده برنامه
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

// تشخیص محصولاتی که از seedProducts آمده‌اند
const isSeedProduct = (id) =>
  id != null &&
  seedProducts.some(
    (item) => String(item.id) === String(id)
  );

// دریافت محصولات از دیتابیس
export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async () => {
    if (!backendOn) return null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id");

    if (error) throw error;

    // اگر دیتابیس خالی بود، محصولات اولیه باقی می‌مانند
    if (!data?.length) return null;

    return data.map(mapRow);
  }
);

// افزودن یا ویرایش محصول
export const saveProduct = createAsyncThunk(
  "products/save",
  async (p) => {
    // بدون بک‌اند، تغییرات فقط در Redux اعمال می‌شوند
    if (!backendOn) {
      return {
        ...p,
        id: p.id ?? Date.now(),
      };
    }

    // محصولات اولیه در فایل seedProducts ذخیره شده‌اند،
    // بنابراین برای آن‌ها عملیات دیتابیس اجرا نمی‌شود.
    if (isSeedProduct(p.id)) {
      return p;
    }

    const row = {
      name: p.name,
      description: p.description,
      price: Number(p.price),
      old_price: p.oldPrice ?? null,
      category: p.category,
      image: p.image,
      gallery: p.gallery ?? [p.image],
      rating: p.rating ?? 4,
      stock: Number(p.stock ?? 0),
    };

    // ویرایش محصول موجود در دیتابیس
    if (p.id != null) {
      const { data, error } = await supabase
        .from("products")
        .update(row)
        .eq("id", p.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          `محصول با شناسه ${p.id} در دیتابیس پیدا نشد.`
        );
      }

      return mapRow(data);
    }

    // افزودن محصول جدید به دیتابیس
    const { data, error } = await supabase
      .from("products")
      .insert(row)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error("محصول جدید ذخیره نشد.");
    }

    return mapRow(data);
  }
);

// حذف محصول
export const removeProduct = createAsyncThunk(
  "products/remove",
  async (id) => {
    // در حالت محلی، محصول از Redux حذف می‌شود
    if (!backendOn) {
      return id;
    }

    // محصولات اولیه در دیتابیس حذف نمی‌شوند
    if (isSeedProduct(id)) {
      return id;
    }

    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data?.length) {
      throw new Error(
        `محصول با شناسه ${id} در دیتابیس پیدا نشد یا حذف نشد.`
      );
    }

    return id;
  }
);

const productsSlice = createSlice({
  name: "products",

  initialState: {
    list: seedProducts,
    loading: false,
    saving: false,
    error: null,
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

        if (action.payload) {
          state.list = action.payload;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "دریافت محصولات ناموفق بود.";
      })

      // شروع افزودن یا ویرایش
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
          action.error.message || "ذخیره محصول ناموفق بود.";
      })

      // حذف محصول
      .addCase(removeProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (item) =>
            String(item.id) !== String(action.payload)
        );
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.error =
          action.error.message || "حذف محصول ناموفق بود.";
      });
  },
});

export const { clearProductsError } = productsSlice.actions;

export default productsSlice.reducer;
