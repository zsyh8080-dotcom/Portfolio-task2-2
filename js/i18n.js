let translations = {};
const getCurrentLanguage = () => document.documentElement.lang;
const translate = (englishText, persianText) => getCurrentLanguage() === "fa" ? persianText : englishText;
function applyLanguage() {
  const language = getCurrentLanguage();
  document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translation = translations[language]?.[element.dataset.i18n];
    if (translation) element.textContent = translation;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => element.placeholder = translations[language]?.[element.dataset.i18nPlaceholder] || "");
  document.querySelectorAll("[data-en][data-fa]").forEach((element) => {
    element.textContent = element.dataset[language];
  });
  const label = document.querySelector("#language-label");
  if (label) label.textContent = language === "fa" ? "EN" : "FA";
  const heroHeading = document.querySelector("#hero-title");
  if (heroHeading) {
    heroHeading.replaceChildren();
    heroHeading.append(document.createTextNode(translate("Zahrasadat", "زهراسادات")), document.createElement("br"));
    const lastName = document.createElement("span");
    lastName.textContent = translate("Yaghoubi Hashjin", "یعقوبی هشجین");
    heroHeading.append(lastName);
  }
  document.querySelectorAll("[data-aria-en]").forEach((element) => element.setAttribute("aria-label", element.dataset[language === "fa" ? "ariaFa" : "ariaEn"]));
  document.querySelectorAll("[data-alt-en]").forEach((element) => element.alt = element.dataset[language === "fa" ? "altFa" : "altEn"]);
  document.querySelectorAll("[data-highlight-heading]").forEach((element) => {
    const headingText = element.textContent, highlightWords = language === "fa" ? ["ساختن", "ساختم", "ابزارها"] : ["building", "build", "built", "Tools"];
    const highlightWord = highlightWords.find((candidateWord) => headingText.toLowerCase().includes(candidateWord.toLowerCase()));
    if (!highlightWord) return;
    const wordIndex = headingText.toLowerCase().indexOf(highlightWord.toLowerCase());
    element.replaceChildren(document.createTextNode(headingText.slice(0, wordIndex)));
    const highlightElement = document.createElement("span");
    highlightElement.className = "heading-accent";
    highlightElement.textContent = headingText.slice(wordIndex, wordIndex + highlightWord.length);
    element.append(highlightElement, document.createTextNode(headingText.slice(wordIndex + highlightWord.length)));
  });
  document.dispatchEvent(new Event("languagechange"));
}
function toggleLanguage() {
  document.documentElement.lang = getCurrentLanguage() === "fa" ? "en" : "fa";
  try {
    localStorage.setItem("language", getCurrentLanguage());
  } catch {
  }
  applyLanguage();
}
async function initializeLanguage() {
  translations = await fetch("data/i18n.json").then((response) => response.json());
  applyLanguage();
  document.querySelector("#language-toggle")?.addEventListener("click", toggleLanguage);
}
export {
  applyLanguage,
  getCurrentLanguage,
  initializeLanguage,
  toggleLanguage,
  translate
};
