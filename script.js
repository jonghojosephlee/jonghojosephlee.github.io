const sectionTriggers = [...document.querySelectorAll("[data-panel-trigger]")];
const projectPanels = [...document.querySelectorAll(".project-panel")];
const projectPanelGroup = document.querySelector(".project-panels");
const contextPanel = document.querySelector(".context");
const projectClose = document.querySelector(".project-close");
const year = document.querySelector("#year");
const compactLayout = window.matchMedia("(max-width: 1079px)");
let projectOpener = null;

if (year) year.textContent = new Date().getFullYear();

const closeProjectOverlay = (restoreFocus = true) => {
  if (!projectPanelGroup?.classList.contains("is-open")) return;

  projectPanelGroup.classList.remove("is-open");
  projectPanelGroup.removeAttribute("role");
  projectPanelGroup.removeAttribute("aria-modal");
  projectPanelGroup.removeAttribute("aria-labelledby");
  document.body.classList.remove("project-overlay-open");

  if (restoreFocus && projectOpener) projectOpener.focus();
};

const openProjectOverlay = (trigger) => {
  if (!compactLayout.matches || !projectPanelGroup || !projectClose) return;

  const activePanel = document.querySelector(`#${trigger.getAttribute("aria-controls")}`);
  const activeTitle = activePanel?.querySelector("h2");
  projectOpener = trigger;
  projectPanelGroup.classList.add("is-open");
  projectPanelGroup.setAttribute("role", "dialog");
  projectPanelGroup.setAttribute("aria-modal", "true");
  if (activeTitle?.id) projectPanelGroup.setAttribute("aria-labelledby", activeTitle.id);
  document.body.classList.add("project-overlay-open");
  window.setTimeout(() => projectClose.focus(), 120);
};

const selectSection = (trigger, openDetails = false) => {
  const panelId = trigger.getAttribute("aria-controls");

  contextPanel?.classList.toggle("is-cv", panelId === "project-panel-03");

  sectionTriggers.forEach((item) => {
    const selected = item === trigger;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-expanded", String(selected));
  });

  projectPanels.forEach((panel) => {
    const selected = panel.id === panelId;
    panel.classList.toggle("is-active", selected);
    panel.hidden = !selected;
  });

  if (openDetails) openProjectOverlay(trigger);
};

sectionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => selectSection(trigger, true));
});

projectClose?.addEventListener("click", () => closeProjectOverlay());

document.addEventListener("keydown", (event) => {
  if (!projectPanelGroup?.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeProjectOverlay();
  }

  if (event.key === "Tab") {
    const activePanel = projectPanels.find((panel) => !panel.hidden);
    const focusable = [
      projectClose,
      ...(activePanel?.querySelectorAll('a[href], button:not([disabled])') || []),
    ].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});

projectPanelGroup?.addEventListener("click", (event) => {
  if (event.target === projectPanelGroup) closeProjectOverlay();
});

const syncCompactState = () => {
  sectionTriggers.forEach((trigger) => {
    if (compactLayout.matches) trigger.setAttribute("aria-haspopup", "dialog");
    else trigger.removeAttribute("aria-haspopup");
  });

  if (!compactLayout.matches) closeProjectOverlay(false);
};

compactLayout.addEventListener("change", syncCompactState);
syncCompactState();

const musicCatalogOpen = document.querySelector("#music-catalog-open");
const musicCatalog = document.querySelector("#music-catalog");
const musicCatalogClose = document.querySelector("#music-catalog-close");
const musicCatalogFrame = document.querySelector("#music-catalog-frame");

musicCatalogOpen?.addEventListener("click", () => {
  if (!musicCatalog || musicCatalog.open) return;

  if (musicCatalogFrame && !musicCatalogFrame.hasAttribute("src")) {
    musicCatalogFrame.src = musicCatalogFrame.dataset.src || "";
  }
  musicCatalogOpen.setAttribute("aria-expanded", "true");
  musicCatalog.showModal();
  window.setTimeout(() => musicCatalogClose?.focus(), 100);
});

musicCatalogClose?.addEventListener("click", () => musicCatalog?.close());

musicCatalog?.addEventListener("click", (event) => {
  if (event.target === musicCatalog) musicCatalog.close();
});

musicCatalog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  musicCatalog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !musicCatalog?.open) return;
  event.preventDefault();
  musicCatalog.close();
});

musicCatalog?.addEventListener("close", () => {
  musicCatalogOpen?.setAttribute("aria-expanded", "false");
  musicCatalogOpen?.focus();
});

const publicationTabs = [...document.querySelectorAll("[data-publication-group]")];
const publicationGroups = [...document.querySelectorAll(".publication-group")];

const selectPublicationGroup = (tab, moveFocus = false) => {
  const groupId = tab.dataset.publicationGroup;

  publicationTabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  publicationGroups.forEach((group) => {
    const selected = group.id === groupId;
    group.classList.toggle("is-active", selected);
    group.hidden = !selected;
  });

  if (moveFocus) tab.focus();
};

publicationTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectPublicationGroup(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + publicationTabs.length) % publicationTabs.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % publicationTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = publicationTabs.length - 1;
    selectPublicationGroup(publicationTabs[nextIndex], true);
  });
});
