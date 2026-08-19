const stage = document.querySelector(".object-stage");
const metaObject = document.querySelector(".meta-object");
const pulseControl = document.querySelector(".pulse-control");
const projectNodes = [...document.querySelectorAll(".research-node")];
const activeNote = document.querySelector(".active-note");
const noteIndex = document.querySelector("#note-index");
const noteStatus = document.querySelector("#note-status");
const noteTitle = document.querySelector("#note-title");
const noteDescription = document.querySelector("#note-description");
const year = document.querySelector("#year");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let audioContext;

if (year) year.textContent = new Date().getFullYear();

const playMaterialSound = async () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();

  const now = audioContext.currentTime + 0.01;
  const master = audioContext.createGain();
  const color = audioContext.createBiquadFilter();

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.15, now + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.18);
  color.type = "lowpass";
  color.frequency.setValueAtTime(3100, now);
  color.frequency.exponentialRampToValueAtTime(1200, now + 1.1);
  color.Q.value = 0.7;
  color.connect(master);
  master.connect(audioContext.destination);

  const voices = [
    { type: "sine", start: 196, end: 132, delay: 0, duration: 1.08, level: 0.19 },
    { type: "sine", start: 594, end: 471, delay: 0.025, duration: 0.78, level: 0.085 },
    { type: "triangle", start: 844, end: 704, delay: 0.07, duration: 0.54, level: 0.035 },
  ];

  voices.forEach((voice) => {
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    const startAt = now + voice.delay;
    const stopAt = startAt + voice.duration;

    oscillator.type = voice.type;
    oscillator.frequency.setValueAtTime(voice.start, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(voice.end, stopAt);
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(voice.level, startAt + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    oscillator.connect(envelope).connect(color);
    oscillator.start(startAt);
    oscillator.stop(stopAt + 0.02);
  });

  const noiseLength = Math.floor(audioContext.sampleRate * 0.12);
  const noiseBuffer = audioContext.createBuffer(1, noiseLength, audioContext.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let index = 0; index < noiseLength; index += 1) {
    noiseData[index] = (Math.random() * 2 - 1) * Math.exp((-7 * index) / noiseLength);
  }

  const noise = audioContext.createBufferSource();
  const noiseBand = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();
  noise.buffer = noiseBuffer;
  noiseBand.type = "bandpass";
  noiseBand.frequency.value = 2600;
  noiseBand.Q.value = 1.4;
  noiseGain.gain.value = 0.05;
  noise.connect(noiseBand).connect(noiseGain).connect(color);
  noise.start(now);
};

const pulseObject = () => {
  metaObject.classList.remove("is-pulsing");
  stage.classList.remove("is-awake");
  void metaObject.offsetWidth;
  metaObject.classList.add("is-pulsing");
  stage.classList.add("is-awake");
  void playMaterialSound();

  window.setTimeout(() => {
    metaObject.classList.remove("is-pulsing");
    stage.classList.remove("is-awake");
  }, 1100);
};

metaObject?.addEventListener("click", pulseObject);
pulseControl?.addEventListener("click", pulseObject);

const showProject = (node) => {
  projectNodes.forEach((item) => {
    const active = item === node;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });

  activeNote.classList.add("is-changing");
  stage.classList.add("is-awake");

  window.setTimeout(() => {
    noteIndex.textContent = node.dataset.index;
    noteStatus.textContent = node.dataset.status;
    noteTitle.textContent = node.dataset.title;
    noteDescription.textContent = node.dataset.description;
    activeNote.classList.remove("is-changing");
  }, 110);

  window.setTimeout(() => stage.classList.remove("is-awake"), 520);
};

projectNodes.forEach((node) => {
  node.addEventListener("click", () => showProject(node));
  node.addEventListener("focus", () => showProject(node));
  node.addEventListener("pointerenter", () => {
    if (finePointer.matches) showProject(node);
  });
});

document.addEventListener("pointermove", (event) => {
  if (!finePointer.matches || reducedMotion.matches) return;

  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;
  stage.style.setProperty("--mx", `${x * 10}px`);
  stage.style.setProperty("--my", `${y * 8}px`);
  stage.style.setProperty("--ry", `${x * 2.4}deg`);
  stage.style.setProperty("--rx", `${y * -2.1}deg`);
});

document.documentElement.addEventListener("mouseleave", () => {
  stage.style.setProperty("--mx", "0px");
  stage.style.setProperty("--my", "0px");
  stage.style.setProperty("--ry", "0deg");
  stage.style.setProperty("--rx", "0deg");
});
