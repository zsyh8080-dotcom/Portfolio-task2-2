import { translate, getCurrentLanguage } from "./i18n.js";
function initializeProjectFilters() {
  const filterButtons = document.querySelectorAll("[data-filter]");
  filterButtons.forEach((selectedFilter) => selectedFilter.addEventListener("click", () => {
    filterButtons.forEach((filterButton) => filterButton.setAttribute("aria-pressed", String(filterButton === selectedFilter)));
    document.querySelectorAll("[data-category]").forEach((projectCard) => projectCard.hidden = selectedFilter.dataset.filter !== "all" && projectCard.dataset.category !== selectedFilter.dataset.filter);
  }));
}
export {
  initializeProjectFilters
};
