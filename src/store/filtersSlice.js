import { createSlice } from "@reduxjs/toolkit";

const filtersSlice = createSlice({
  name: "filters",
  initialState: { search: "", category: "all", maxPrice: 0, minRating: 0, sort: "newest" },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
    },
    setMinRating: (state, action) => {
      state.minRating = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
  },
});

export const { setSearch, setCategory, setMaxPrice, setMinRating, setSort } = filtersSlice.actions;
export default filtersSlice.reducer;