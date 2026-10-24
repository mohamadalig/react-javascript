import { useEffect, useState } from "react";
import { useT } from "../hooks/useT";

const slides = [
  { key: "slide1", className: "slide-1" },
  { key: "slide2", className: "slide-2" },
  { key: "slide3", className: "slide-3" },
  { key: "slide4", className: "slide-4" },
];

export default function HeroSlider() {
  const t = useT();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const go = (i) => setIndex((i + slides.length) % slides.length);

  return (
    <section className="hero-slider">
      {slides.map((s, i) => (
        <div key={s.key} className={`hero-slide ${s.className} ${i === index ? "active" : ""}`}>
          <h2>{t(`${s.key}.title`)}</h2>
          <p>{t(`${s.key}.sub`)}</p>
          <a href="#amazing" className="btn hero-cta">{t("hero.cta")}</a>
        </div>
      ))}

      <button className="slider-arrow prev" aria-label="prev" onClick={() => go(index - 1)}>‹</button>
      <button className="slider-arrow next" aria-label="next" onClick={() => go(index + 1)}>›</button>

      <div className="slider-dots">
        {slides.map((s, i) => (
          <button
            key={s.key}
            aria-label={`slide ${i + 1}`}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}