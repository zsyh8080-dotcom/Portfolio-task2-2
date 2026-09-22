try {
  document.documentElement.dataset.theme = localStorage.getItem("theme") || "dark";
  const language = localStorage.getItem("language") || "fa";
  document.documentElement.lang = language;
  document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
} catch {
}
