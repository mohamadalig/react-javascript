import { useSelector } from "react-redux";
import { translations } from "../i18n/translations";

export function useT() {
  const lang = useSelector((s) => s.ui.lang);
  return (key) => translations[lang][key] ?? key;
}