"use client";

export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("voomara-theme", next ? "dark" : "light");
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle light or dark mode">
      <span className="theme-dark-icon" aria-hidden="true">◐</span>
      <span className="theme-light-icon" aria-hidden="true">☀</span>
      <small className="theme-dark-label">Dark</small>
      <small className="theme-light-label">Light</small>
    </button>
  );
}
