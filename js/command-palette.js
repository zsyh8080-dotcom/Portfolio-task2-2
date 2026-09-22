import { translate, toggleLanguage } from "./i18n.js";
import { toggleTheme } from "./theme.js";
import { createDialog } from "./dialog.js";

export function initializeSearch() {
  const searchPanel = document.querySelector("#command-palette");
  const searchInput = document.querySelector("#command-input");
  const searchResults = document.querySelector("#command-results");
  if (!searchPanel || !searchInput || !searchResults) return;

  const searchDialog = createDialog(searchPanel, searchInput);
  let selectedResultIndex = 0;

  function navigateTo(destination) {
    if (typeof window.__portfolioNavigate === "function") {
      window.__portfolioNavigate(destination);
      return;
    }
    window.location.href = destination;
  }

  function navigateToSection(sectionId) {
    const isHomePage = location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
    navigateTo(`${isHomePage ? "" : "index.html"}#${sectionId}`);
  }

  const searchCommands = [
    { englishLabel: "Home", persianLabel: "خانه", run: () => navigateToSection("home") },
    { englishLabel: "Projects", persianLabel: "پروژه‌ها", run: () => navigateTo("projects.html") },
    { englishLabel: "Research", persianLabel: "پژوهش", run: () => navigateTo("research.html") },
    { englishLabel: "Experience", persianLabel: "تجربه", run: () => navigateToSection("experience") },
    { englishLabel: "Resume", persianLabel: "رزومه", run: () => navigateTo("assets/documents/zahrasadat-yaghoubi-resume.pdf") },
    { englishLabel: "GitHub", persianLabel: "گیت‌هاب", run: () => navigateTo("https://github.com/zsyh8080-dotcom/") },
    { englishLabel: "Theme", persianLabel: "پوسته", run: toggleTheme },
    { englishLabel: "Language", persianLabel: "زبان", run: toggleLanguage }
  ];

  function renderSearchResults() {
    const query = searchInput.value.trim().toLowerCase();
    const matchingCommands = searchCommands.filter((command) =>
      `${command.englishLabel} ${command.persianLabel}`.toLowerCase().includes(query)
    );

    searchResults.replaceChildren();
    matchingCommands.forEach((command, resultIndex) => {
      const resultButton = document.createElement("button");
      resultButton.type = "button";
      resultButton.textContent = translate(command.englishLabel, command.persianLabel);
      resultButton.setAttribute("role", "option");
      resultButton.setAttribute("aria-selected", String(resultIndex === selectedResultIndex));
      resultButton.addEventListener("click", () => {
        searchDialog.close();
        command.run();
      });
      searchResults.append(resultButton);
    });
  }

  function openSearch() {
    searchInput.value = "";
    selectedResultIndex = 0;
    renderSearchResults();
    searchDialog.open();
  }

  searchInput.addEventListener("input", () => {
    selectedResultIndex = 0;
    renderSearchResults();
  });

  searchInput.addEventListener("keydown", (event) => {
    const resultButtons = searchResults.querySelectorAll("button");
    if (["ArrowDown", "ArrowUp"].includes(event.key) && resultButtons.length) {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      selectedResultIndex = (selectedResultIndex + direction + resultButtons.length) % resultButtons.length;
      renderSearchResults();
      searchResults.children[selectedResultIndex].scrollIntoView({ block: "nearest" });
    }
    if (event.key === "Enter") {
      event.preventDefault();
      resultButtons[selectedResultIndex]?.click();
    }
  });

  document.querySelector("#cmd-trigger")?.addEventListener("click", openSearch);
  searchPanel.querySelector("[data-command-close]")?.addEventListener("click", searchDialog.close);
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });
}
