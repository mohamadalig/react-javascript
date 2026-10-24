import { createSlice } from "@reduxjs/toolkit";

const loadUser = () => {
  try {
    const saved = localStorage.getItem("lojashop_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const savedUser = loadUser();

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: savedUser,
    isAuthenticated: !!savedUser,
    isAdmin: savedUser?.role === "admin",
  },
  reducers: {
    setUser(state, action) {
      const user = action.payload || null;
      state.currentUser = user;
      state.isAuthenticated = !!user;
      state.isAdmin = user?.role === "admin";
      try {
        if (user) {
          localStorage.setItem("lojashop_user", JSON.stringify(user));
        } else {
          localStorage.removeItem("lojashop_user");
        }
      } catch {
        /* دسترسی localStorage مسدود است؛ مشکلی برای کارکرد سایت نیست */
      }
    },
    logout(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      try {
        localStorage.removeItem("lojashop_user");
      } catch {
        /* بی‌اثر */
      }
    },
    updateProfile(state, action) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        try {
          localStorage.setItem("lojashop_user", JSON.stringify(state.currentUser));
        } catch {
          /* بی‌اثر */
        }
      }
    },
  },
});

export const { setUser, logout, updateProfile } = userSlice.actions;
export const login = setUser;
export default userSlice.reducer;
