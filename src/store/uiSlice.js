import { createSlice } from "@reduxjs/toolkit";
import { safeStorage } from "../lib/safeStorage";

const savedTheme = safeStorage.get("theme") || "light";
const savedLang = safeStorage.get("lang") || "fa";

const uiSlice = createSlice({
  name: "ui",
  initialState: { theme: savedTheme, lang: savedLang },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      safeStorage.set("theme", state.theme);
    },
    setLang: (state, action) => {
      state.lang = action.payload;
      safeStorage.set("lang", action.payload);
    },
  },
});

export const { toggleTheme, setLang } = uiSlice.actions;
export default uiSlice.reducer;