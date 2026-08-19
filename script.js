const body = document.body;
const languageButton = document.querySelector(".language-switch");
const languageCurrent = document.querySelector(".language-current");
const languageNext = document.querySelector(".language-next");

function setLanguage(language) {
  const isKorean = language === "ko";
  body.dataset.language = isKorean ? "ko" : "en";
  document.documentElement.lang = isKorean ? "ko" : "en";
  languageCurrent.textContent = isKorean ? "KR" : "EN";
  languageNext.textContent = isKorean ? "EN" : "KR";
  languageButton.setAttribute("aria-pressed", String(isKorean));
  languageButton.setAttribute("aria-label", isKorean ? "View in English" : "한국어로 보기");
  localStorage.setItem("portfolio-language", isKorean ? "ko" : "en");
}

languageButton.addEventListener("click", () => {
  setLanguage(body.dataset.language === "en" ? "ko" : "en");
});

setLanguage(localStorage.getItem("portfolio-language") || "en");
document.querySelector("#year").textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
