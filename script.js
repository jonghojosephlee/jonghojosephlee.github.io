const projectButtons = [...document.querySelectorAll(".project-button")];
const detail = document.querySelector(".project-detail");
const detailIndex = document.querySelector("#detail-index");
const detailStatus = document.querySelector("#detail-status");
const detailTitle = document.querySelector("#detail-title");
const detailDescription = document.querySelector("#detail-description");
const detailTags = document.querySelector("#detail-tags");
const year = document.querySelector("#year");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

if (year) year.textContent = new Date().getFullYear();

const showProject = (button) => {
  if (button.classList.contains("is-active")) return;

  projectButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });

  detail.classList.add("is-changing");

  window.setTimeout(() => {
    detailIndex.textContent = button.dataset.index;
    detailStatus.textContent = button.dataset.status;
    detailTitle.textContent = button.dataset.title;
    detailDescription.textContent = button.dataset.description;
    detailTags.replaceChildren(
      ...button.dataset.tags.split("|").map((tag) => {
        const item = document.createElement("li");
        item.textContent = tag;
        return item;
      }),
    );

    detail.classList.remove("is-changing");
    detail.classList.remove("signal-on");
    void detail.offsetWidth;
    detail.classList.add("signal-on");
  }, 120);
};

projectButtons.forEach((button) => {
  button.addEventListener("click", () => showProject(button));
  button.addEventListener("focus", () => showProject(button));
  button.addEventListener("pointerenter", () => {
    if (canHover.matches) showProject(button);
  });
});

document.querySelector(".project-list")?.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();

  const current = projectButtons.indexOf(document.activeElement);
  const direction = event.key === "ArrowDown" ? 1 : -1;
  const next = (current + direction + projectButtons.length) % projectButtons.length;
  projectButtons[next].focus();
});
