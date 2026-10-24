// دسترسی امن به localStorage — وقتی مرورگر اجازه ندهد سایت نمی‌میرد
const mem = new Map();

export const safeStorage = {
  get(key, fallback = null) {
    try {
      return localStorage.getItem(key) ?? mem.get(key) ?? fallback;
    } catch {
      return mem.get(key) ?? fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      mem.set(key, value);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* بی‌اهمیت */
    }
    mem.delete(key);
  },
};

export const getJSON = (key, fallback) => {
  try {
    const raw = safeStorage.get(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const setJSON = (key, value) => safeStorage.set(key, JSON.stringify(value));