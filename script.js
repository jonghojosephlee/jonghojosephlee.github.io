const sectionTriggers = [...document.querySelectorAll("[data-panel-trigger]")];
const projectPanels = [...document.querySelectorAll(".project-panel")];
const projectPanelGroup = document.querySelector(".project-panels");
const projectClose = document.querySelector(".project-close");
const musicCatalogFrame = document.querySelector("#music-catalog-frame");
const year = document.querySelector("#year");
const mobileProfileDetails = [...document.querySelectorAll("[data-mobile-detail]")];
const mobileProfileQuery = window.matchMedia("(max-width: 680px)");
let projectOpener = null;

if (year) year.textContent = new Date().getFullYear();

const syncProfileDetails = () => {
  mobileProfileDetails.forEach((detail) => {
    const summary = detail.querySelector("summary");
    detail.open = !mobileProfileQuery.matches;
    if (summary) summary.tabIndex = mobileProfileQuery.matches ? 0 : -1;
  });
};

mobileProfileDetails.forEach((detail) => {
  const summary = detail.querySelector("summary");
  summary?.addEventListener("click", (event) => {
    if (!mobileProfileQuery.matches) event.preventDefault();
  });

  detail.addEventListener("toggle", () => {
    if (!mobileProfileQuery.matches || !detail.open) return;
    mobileProfileDetails.forEach((item) => {
      if (item !== detail) item.open = false;
    });
  });
});

syncProfileDetails();
if (typeof mobileProfileQuery.addEventListener === "function") {
  mobileProfileQuery.addEventListener("change", syncProfileDetails);
} else {
  mobileProfileQuery.addListener(syncProfileDetails);
}

const loadMusicCatalog = () => {
  if (!musicCatalogFrame || musicCatalogFrame.hasAttribute("src")) return;
  musicCatalogFrame.src = musicCatalogFrame.dataset.src || "";
};

const closeProjectOverlay = (restoreFocus = true) => {
  if (projectPanelGroup?.getAttribute("aria-hidden") === "true") return;

  projectPanelGroup.setAttribute("aria-hidden", "true");
  projectPanelGroup.setAttribute("inert", "");
  projectPanelGroup.removeAttribute("role");
  projectPanelGroup.removeAttribute("aria-modal");
  projectPanelGroup.removeAttribute("aria-labelledby");
  document.body.classList.remove("project-overlay-open");

  sectionTriggers.forEach((trigger) => {
    trigger.classList.remove("is-active");
    trigger.setAttribute("aria-expanded", "false");
  });

  if (restoreFocus && projectOpener) projectOpener.focus();
};

const openProjectOverlay = (trigger) => {
  if (!projectPanelGroup || !projectClose) return;

  const panelId = trigger.getAttribute("aria-controls");
  const activePanel = document.querySelector(`#${panelId}`);
  const activeTitle = activePanel?.querySelector("h2");

  projectOpener = trigger;
  sectionTriggers.forEach((item) => {
    const selected = item === trigger;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-expanded", String(selected));
  });

  projectPanels.forEach((panel) => {
    const selected = panel.id === panelId;
    panel.hidden = !selected;
  });

  if (activePanel) activePanel.scrollTop = 0;
  if (panelId === "project-panel-02") {
    if (musicCatalogFrame && !musicCatalogFrame.hasAttribute("src")) {
      musicCatalogFrame.addEventListener("load", () => {
        activePanel.scrollTop = 0;
      }, { once: true });
    }
    loadMusicCatalog();
  }

  projectPanelGroup.removeAttribute("inert");
  projectPanelGroup.setAttribute("aria-hidden", "false");
  projectPanelGroup.setAttribute("role", "dialog");
  projectPanelGroup.setAttribute("aria-modal", "true");
  if (activeTitle?.id) projectPanelGroup.setAttribute("aria-labelledby", activeTitle.id);
  document.body.classList.add("project-overlay-open");
  window.setTimeout(() => projectClose.focus(), 100);
};

sectionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openProjectOverlay(trigger));
});

projectClose?.addEventListener("click", () => closeProjectOverlay());

projectPanelGroup?.addEventListener("click", (event) => {
  if (event.target === projectPanelGroup) closeProjectOverlay();
});

document.addEventListener("keydown", (event) => {
  if (projectPanelGroup?.getAttribute("aria-hidden") === "true") return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeProjectOverlay();
    return;
  }

  if (event.key !== "Tab") return;

  const activePanel = projectPanels.find((panel) => !panel.hidden);
  const focusable = [
    projectClose,
    ...(activePanel?.querySelectorAll(
      'a[href], button:not([disabled]), summary, iframe, [tabindex]:not([tabindex="-1"])',
    ) || []),
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
