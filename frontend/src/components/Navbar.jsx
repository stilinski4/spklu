import React from "react";

export default function Navbar({ isDarkMode, toggleTheme }) {
  // Animated scroll with custom easing
  const scrollTo = (id) => (e) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 64;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - navH;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 600; // ms
      let start;

      function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutQuad(progress);
        window.scrollTo(0, startY + distance * ease);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      }
      window.requestAnimationFrame(step);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">SPKLU.id</div>
      <div className="navbar-links">
        <a href="#beranda" onClick={scrollTo("beranda")} className="navbar-link">Beranda</a>
        <a href="#peta" onClick={scrollTo("peta")} className="navbar-link">Peta SPKLU</a>
        <a href="#informasi" onClick={scrollTo("informasi")} className="navbar-link">Informasi</a>
        <a href="#tentang" onClick={scrollTo("tentang")} className="navbar-link">Tentang Kami</a>
        <a href="#kontak" onClick={scrollTo("kontak")} className="navbar-link">Kontak</a>
        <button onClick={toggleTheme} className="btn-theme">
          {isDarkMode ? "Light" : "Dark"}
        </button>
      </div>
    </nav>
  );
}
