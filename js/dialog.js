let closeActiveDialog = null;
function createDialog(dialogPanel, initialFocusTarget) {
  let returnFocusTarget;
  let scrollPosition = 0;
  const documentRoot = document.documentElement;
  function focusWithoutScrolling(element) {
    element?.focus({ preventScroll: true });
  }
  function closeDialog() {
    if (!dialogPanel.classList.contains("open")) return;
    dialogPanel.classList.remove("open");
    dialogPanel.setAttribute("aria-hidden", "true");
    dialogPanel.inert = true;
    document.removeEventListener("keydown", handleDialogKeyDown);
    if (closeActiveDialog === closeDialog) {
      closeActiveDialog = null;
      documentRoot.classList.remove("dialog-open");
    }
    window.scrollTo(0, scrollPosition);
    focusWithoutScrolling(returnFocusTarget);
    window.scrollTo(0, scrollPosition);
  }
  function handleDialogKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab") return;
    const focusableElements = [...dialogPanel.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')].filter((element) => element.getClientRects().length);
    const firstElement = focusableElements[0], lastElement = focusableElements.at(-1);
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      focusWithoutScrolling(lastElement);
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      focusWithoutScrolling(firstElement);
    }
  }
  function openDialog() {
    closeActiveDialog?.();
    returnFocusTarget = document.activeElement;
    scrollPosition = window.scrollY;
    closeActiveDialog = closeDialog;
    dialogPanel.inert = false;
    dialogPanel.classList.add("open");
    dialogPanel.setAttribute("aria-hidden", "false");
    documentRoot.classList.add("dialog-open");
    document.addEventListener("keydown", handleDialogKeyDown);
    focusWithoutScrolling(initialFocusTarget);
    window.scrollTo(0, scrollPosition);
  }
  return { open: openDialog, close: closeDialog };
}
export {
  createDialog
};
