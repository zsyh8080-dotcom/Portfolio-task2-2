import { translate } from "./i18n.js";
function initializeArchitectureDiagram() {
  const diagram = document.querySelector('[data-dag="architecture"]');
  if (!diagram) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let selectedFlow = "rag", activeStepIndex = 0, playbackTimer = 0, isVisible = false;
  const nodeIcons = [`<path d="M5 5h18v13H12l-6 5v-5H5z"/><path d="M9 10h10M9 14h6"/>`, `<circle cx="12" cy="12" r="7"/><path d="m17 17 7 7"/>`, `<path d="M7 3h11l5 5v19H7zM18 3v6h5M11 14h8M11 19h8"/>`, `<rect x="7" y="7" width="16" height="16" rx="3"/><path d="M11 1v6M19 1v6M11 23v6M19 23v6M1 11h6M1 19h6M23 11h6M23 19h6"/><rect x="11" y="11" width="8" height="8" rx="1"/>`, `<circle cx="15" cy="15" r="11"/><path d="m9 15 4 4 8-8"/>`];
  const workflowSteps = {
    rag: [["Your question", "پرسش شما", "A question sets the direction for retrieval.", "سؤال مشخص می‌کنه باید دنبال چه اطلاعاتی بگردیم."], ["Find relevant sources", "پیدا کردن منابع مرتبط", "Retrieve passages that relate to the question.", "بخش‌های مرتبط از منابع پیدا می‌شن."], ["Build the context", "کنار هم گذاشتن شواهد", "Keep the useful evidence and its source labels together.", "اطلاعات مرتبط، همراه با نام منبع، کنار هم قرار می‌گیرن."], ["Generate a grounded response", "ساختن پاسخ با تکیه بر منبع", "The language model answers from the supplied evidence.", "مدل زبانی جواب رو از روی اطلاعات موجود می‌سازه."], ["Answer with sources", "جواب همراه با منبع", "Return the answer, or say when information is missing.", "جواب ارائه می‌شه؛ اگر اطلاعات کافی نباشه، دستیار همین رو می‌گه."]],
    agent: [["Receive a task", "دریافت کار", "Start with a clear request and its limits.", "از یک درخواست روشن و محدودیت‌هاش شروع می‌کنیم."], ["Plan the steps", "برنامه‌ریزی", "Break the task into a small number of steps.", "کار به چند مرحلهٔ مشخص تقسیم می‌شه."], ["Use a tool", "استفاده از ابزار", "Get the data or run the operation the task needs.", "داده یا ابزار لازم برای انجام کار انتخاب می‌شه."], ["Check the result", "بررسی نتیجه", "Check the output before presenting it.", "خروجی قبل از ارائه بررسی می‌شه."], ["Return the result", "ارائهٔ نتیجه", "A compact view of the outcome and any open questions.", "نتیجه و سؤال‌های باقی‌مانده روشن و خلاصه ارائه می‌شن."]],
    vision: [["Face crop", "برش چهره", "The proposal starts with detecting, cropping and resizing the face.", "در طرح پژوهش، چهره شناسایی، برش و هم‌اندازه می‌شه."], ["Visual stream", "جریان بصری", "The proposed RGB branch may use EfficientNet or ResNet.", "برای شاخهٔ RGB، استفاده از EfficientNet یا ResNet پیشنهاد شده."], ["Noise stream", "جریان نویزی", "A proposed custom CNN combines enhanced ELA and SRM traces.", "در شاخهٔ پیشنهادی نویزی، CNN سفارشی ردپاهای ELA بهبودیافته و SRM رو کنار هم می‌گذاره."], ["Attention fusion", "ادغام با توجه", "The proposal combines the two streams using an attention mechanism.", "در معماری پیشنهادی، دو جریان با یک سازوکار توجه ترکیب می‌شن."], ["Planned evaluation", "ارزیابی برنامه‌ریزی‌شده", "Compare predictions across compression settings; measured results are not available yet.", "پیش‌بینی‌ها در شرایط مختلف فشرده‌سازی مقایسه می‌شن؛ نتیجهٔ اندازه‌گیری‌شده هنوز موجود نیست."]]
  };
  const nodePositions = [[9, 50], [33, 22], [33, 78], [63, 50], [91, 50]];
  function activateStep(stepIndex) {
    activeStepIndex = stepIndex;
    diagram.querySelectorAll(".system-node").forEach((node, index) => {
      node.classList.toggle("active", index === stepIndex);
      node.setAttribute("aria-pressed", String(index === stepIndex));
    });
    diagram.querySelectorAll(".system-edge").forEach((edge, index) => edge.classList.toggle("active", (selectedFlow === "vision" ? [1, 2, 3, 3, 4][index] : index + 1) <= stepIndex));
    const stepContent = workflowSteps[selectedFlow][stepIndex];
    document.querySelector("#architecture-step").textContent = "0" + (stepIndex + 1);
    document.querySelector("#architecture-detail-title").textContent = translate(stepContent[0], stepContent[1]);
    document.querySelector("#architecture-detail-copy").textContent = translate(stepContent[2], stepContent[3]);
  }
  function stopPlayback() {
    clearInterval(playbackTimer);
    playbackTimer = 0;
  }
  function playWorkflow() {
    stopPlayback();
    activateStep(0);
    if (reducedMotion.matches || document.hidden || !isVisible || document.documentElement.classList.contains("motion-paused")) return;
    playbackTimer = setInterval(() => {
      activateStep(activeStepIndex + 1);
      if (activeStepIndex === 4) stopPlayback();
    }, 1200);
  }
  function renderDiagram() {
    stopPlayback();
    diagram.replaceChildren();
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.classList.add("system-edges");
    svg.setAttribute("viewBox", "0 0 1000 260");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    (selectedFlow === "vision" ? ["M90 130C190 130 200 57 330 57", "M90 130C190 130 200 203 330 203", "M330 57C460 57 510 130 630 130", "M330 203C460 203 510 130 630 130", "M630 130H910"] : ["M90 130C190 130 200 57 330 57", "M330 57V203", "M330 203C460 203 510 130 630 130", "M630 130H910"]).forEach((pathDefinition) => {
      const path = document.createElementNS(svgNamespace, "path");
      path.setAttribute("d", pathDefinition);
      path.classList.add("system-edge");
      svg.append(path);
    });
    diagram.append(svg);
    workflowSteps[selectedFlow].forEach((stepContent, index) => {
      const button = document.createElement("button");
      button.className = "system-node";
      button.style.left = nodePositions[index][0] + "%";
      button.style.top = nodePositions[index][1] + "%";
      button.setAttribute("aria-label", translate(stepContent[0], stepContent[1]));
      button.title = translate(stepContent[0], stepContent[1]);
      button.innerHTML = '<svg viewBox="0 0 30 30" aria-hidden="true">' + nodeIcons[index] + "</svg>";
      button.addEventListener("click", () => {
        stopPlayback();
        activateStep(index);
      });
      button.addEventListener("focus", () => {
        stopPlayback();
        activateStep(index);
      });
      diagram.append(button);
    });
    activateStep(0);
    if (isVisible) playWorkflow();
  }
  const workflowTabs = [...document.querySelectorAll(".arch-tab")];
  workflowTabs.forEach((tab, index) => {
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.addEventListener("click", () => {
      selectedFlow = tab.dataset.arch;
      workflowTabs.forEach((candidateTab) => {
        const isActive = candidateTab === tab;
        candidateTab.classList.toggle("active", isActive);
        candidateTab.setAttribute("aria-selected", String(isActive));
        candidateTab.tabIndex = isActive ? 0 : -1;
      });
      renderDiagram();
    });
    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const nextTabIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + workflowTabs.length) % workflowTabs.length;
        workflowTabs[nextTabIndex].click();
        workflowTabs[nextTabIndex].focus();
      }
    });
  });
  document.querySelector("#architecture-replay").addEventListener("click", playWorkflow);
  document.addEventListener("languagechange", renderDiagram);
  document.addEventListener("motionchange", () => {
    stopPlayback();
    if (!document.documentElement.classList.contains("motion-paused")) playWorkflow();
  });
  document.addEventListener("visibilitychange", () => {
    stopPlayback();
    if (!document.hidden && isVisible) playWorkflow();
  });
  reducedMotion.addEventListener("change", () => {
    stopPlayback();
    activateStep(0);
  });
  new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible) playWorkflow();
    else stopPlayback();
  }, { threshold: 0.35 }).observe(diagram);
  renderDiagram();
}
export {
  initializeArchitectureDiagram
};
