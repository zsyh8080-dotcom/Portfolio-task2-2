function updateThemeButton() {
  const themeButton = document.querySelector("#theme-toggle");
  if (!themeButton) return;
  const isLightTheme = document.documentElement.dataset.theme === "light";
  const isPersian = document.documentElement.lang === "fa";
  const label = isLightTheme
    ? (isPersian ? "فعال کردن حالت تیره" : "Switch to dark mode")
    : (isPersian ? "فعال کردن حالت روشن" : "Switch to light mode");
  themeButton.setAttribute("aria-label", label);
  themeButton.setAttribute("aria-pressed", String(isLightTheme));
  themeButton.title = label;
}

export function toggleTheme() {
  const documentRoot = document.documentElement;
  documentRoot.dataset.theme = documentRoot.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("theme", documentRoot.dataset.theme);
  } catch {}
  updateThemeButton();
  document.dispatchEvent(new Event("themechange"));
}

export function initializeTheme() {
  document.querySelector("#theme-toggle")?.addEventListener("click", toggleTheme);
  document.addEventListener("languagechange", updateThemeButton);
  updateThemeButton();
}
