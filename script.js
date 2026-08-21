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

const featuredPlayer = document.querySelector("#featured-player");
const musicToggle = document.querySelector("#music-toggle");
const musicIcon = document.querySelector(".music-icon");
const musicTime = document.querySelector("#music-time");
const musicProgress = document.querySelector("#music-progress");
const soundcloudFrame = document.querySelector("#soundcloud-widget");
const trackMeta = document.querySelector("#track-meta");
const trackArtist = document.querySelector("#track-artist");
const trackTitle = document.querySelector("#track-title");
const trackPickerToggle = document.querySelector("#track-picker-toggle");
const trackMenu = document.querySelector("#track-menu");
const trackOptions = [...document.querySelectorAll(".track-option")];
const trackPosition = document.querySelector("#track-position");
const trackTotal = document.querySelector("#track-total");
const trackAnnouncement = document.querySelector("#track-announcement");
let activeTrackIndex = Math.max(
  0,
  trackOptions.findIndex((item) => item.getAttribute("aria-pressed") === "true"),
);
let trackIsPlaying = false;
let trackDuration = 0;
let widget = null;

const currentTrack = () => {
  const option = trackOptions[activeTrackIndex];
  if (!option) return null;

  return {
    url: option.dataset.url,
    artist: option.dataset.artist,
    title: option.dataset.title,
  };
};

const formatTime = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const resetProgress = () => {
  trackIsPlaying = false;
  trackDuration = 0;
  if (musicTime) musicTime.textContent = "00:00";
  if (musicProgress) musicProgress.style.transform = "scaleX(0)";
};

const renderPlayerState = () => {
  const track = currentTrack();
  if (!track || !musicToggle || !musicIcon) return;

  musicIcon.textContent = trackIsPlaying ? "Ⅱ" : "▶";
  musicToggle.setAttribute(
    "aria-label",
    `${trackIsPlaying ? "Pause" : "Play"} ${track.title} by ${track.artist}`,
  );
};

const renderTrack = (index, announce = false) => {
  activeTrackIndex = index;
  const track = currentTrack();
  if (!track) return null;

  trackOptions.forEach((item, itemIndex) => {
    item.setAttribute("aria-pressed", String(itemIndex === index));
  });

  if (trackMeta) {
    trackMeta.href = track.url;
    trackMeta.setAttribute(
      "aria-label",
      `${track.title} by ${track.artist} on SoundCloud, opens in a new tab`,
    );
  }
  if (trackArtist) trackArtist.textContent = track.artist;
  if (trackTitle) trackTitle.textContent = track.title;
  if (soundcloudFrame) soundcloudFrame.title = `SoundCloud player for ${track.title}`;
  if (trackPosition) trackPosition.textContent = String(index + 1).padStart(2, "0");
  if (trackTotal) trackTotal.textContent = String(trackOptions.length).padStart(2, "0");
  trackPickerToggle?.setAttribute(
    "aria-label",
    `Choose a track. Track ${index + 1} of ${trackOptions.length}: ${track.title}`,
  );
  if (announce && trackAnnouncement) {
    trackAnnouncement.textContent = `Selected ${track.title} by ${track.artist}`;
  }

  resetProgress();
  featuredPlayer?.setAttribute("aria-busy", "true");
  if (musicToggle) {
    musicToggle.disabled = true;
    musicToggle.setAttribute("aria-label", `Loading ${track.title}`);
  }
  return track;
};

const setTrackMenuOpen = (open, moveFocus = false) => {
  if (!trackMenu || !trackPickerToggle) return;

  trackMenu.hidden = !open;
  trackPickerToggle.setAttribute("aria-expanded", String(open));
  if (open && moveFocus) {
    window.requestAnimationFrame(() => trackOptions[activeTrackIndex]?.focus());
  }
};

const enableExternalPlayerFallback = () => {
  const track = currentTrack();
  if (!track || !musicToggle || !musicIcon) return;

  featuredPlayer?.setAttribute("aria-busy", "false");
  musicToggle.disabled = false;
  musicIcon.textContent = "↗";
  musicToggle.setAttribute(
    "aria-label",
    `Open ${track.title} by ${track.artist} on SoundCloud`,
  );
};

const enableWidgetControls = () => {
  if (!widget || !musicToggle) return;

  featuredPlayer?.setAttribute("aria-busy", "false");
  musicToggle.disabled = false;
  widget.getDuration((duration) => {
    trackDuration = duration || 0;
  });
  renderPlayerState();
};

renderTrack(activeTrackIndex);

trackPickerToggle?.addEventListener("click", () => {
  setTrackMenuOpen(trackMenu?.hidden ?? false, true);
});

trackOptions.forEach((option, index) => {
  option.addEventListener("click", () => {
    if (index === activeTrackIndex) {
      setTrackMenuOpen(false);
      trackPickerToggle?.focus();
      return;
    }

    widget?.pause();
    const track = renderTrack(index, true);
    setTrackMenuOpen(false);
    trackPickerToggle?.focus();
    if (track && widget) {
      widget.load(track.url, {
        auto_play: false,
        hide_related: true,
        show_comments: false,
        show_user: false,
        show_reposts: false,
        visual: false,
        callback: enableWidgetControls,
      });
    } else {
      enableExternalPlayerFallback();
    }
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!trackMenu?.hidden && !featuredPlayer?.contains(event.target)) {
    setTrackMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && trackMenu && !trackMenu.hidden) {
    event.preventDefault();
    setTrackMenuOpen(false);
    trackPickerToggle?.focus();
  }
});

if (window.SC?.Widget && soundcloudFrame && musicToggle) {
  widget = window.SC.Widget(soundcloudFrame);
  const events = window.SC.Widget.Events;

  widget.bind(events.READY, enableWidgetControls);

  widget.bind(events.PLAY, () => {
    trackIsPlaying = true;
    renderPlayerState();
  });

  widget.bind(events.PAUSE, () => {
    trackIsPlaying = false;
    renderPlayerState();
  });

  widget.bind(events.FINISH, () => {
    resetProgress();
    renderPlayerState();
  });

  widget.bind(events.PLAY_PROGRESS, (progress) => {
    const currentPosition = progress.currentPosition || 0;
    if (musicTime) musicTime.textContent = formatTime(currentPosition);
    if (musicProgress) {
      const ratio = trackDuration ? Math.min(currentPosition / trackDuration, 1) : 0;
      musicProgress.style.transform = `scaleX(${ratio})`;
    }
  });

  musicToggle.addEventListener("click", () => {
    if (trackIsPlaying) widget.pause();
    else widget.play();
  });
} else {
  enableExternalPlayerFallback();
  musicToggle?.addEventListener("click", () => {
    const track = currentTrack();
    if (track) window.open(track.url, "_blank", "noopener,noreferrer");
  });
}
