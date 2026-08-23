const inputS = document.getElementById("inputS");
const inputT = document.getElementById("inputT");
const stringRows = document.getElementById("stringRows");
const hashmapNode = document.getElementById("hashmap");
const phaseBadge = document.getElementById("phaseBadge");
const operationText = document.getElementById("operationText");
const stepMessage = document.getElementById("stepMessage");
const resultBadge = document.getElementById("resultBadge");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnPlay = document.getElementById("btnPlay");
const btnReset = document.getElementById("btnReset");

let state = {
  s: [],
  t: [],
  steps: [],
  currentStep: 0,
  isRunning: false,
  autoInterval: null,
};

function createStep({ counts, phase, source = null, index = -1, char = "", operation, message, result = null }) {
  return {
    counts: { ...counts },
    phase,
    source,
    index,
    char,
    operation,
    message,
    result,
    isFinished: result !== null,
  };
}

function generateSteps(s, t) {
  const steps = [
    createStep({
      counts: {},
      phase: "ready",
      operation: "count each character in s",
      message: "First, compare the two string lengths.",
    }),
  ];

  if (s.length !== t.length) {
    steps.push(createStep({
      counts: {},
      phase: "mismatch",
      operation: `${s.length} !== ${t.length}`,
      message: "Different lengths mean the strings cannot be anagrams.",
      result: false,
    }));
    return steps;
  }

  const counts = {};

  s.forEach((char, index) => {
    counts[char] = (counts[char] || 0) + 1;
    steps.push(createStep({
      counts,
      phase: "build",
      source: "s",
      index,
      char,
      operation: `count["${char}"] += 1`,
      message: `Add "${char}" from s to the hashmap. Its count is now ${counts[char]}.`,
    }));
  });

  for (let index = 0; index < t.length; index++) {
    const char = t[index];

    if (!counts[char]) {
      steps.push(createStep({
        counts,
        phase: "mismatch",
        source: "t",
        index,
        char,
        operation: `count["${char}"] is missing or zero`,
        message: `There is no remaining "${char}" from s to match this character.`,
        result: false,
      }));
      return steps;
    }

    counts[char] -= 1;
    steps.push(createStep({
      counts,
      phase: "consume",
      source: "t",
      index,
      char,
      operation: `count["${char}"] -= 1`,
      message: `Match "${char}" from t. Its remaining count is ${counts[char]}.`,
    }));
  }

  steps.push(createStep({
    counts,
    phase: "done",
    operation: "all counts = 0",
    message: "Every character was matched exactly once.",
    result: true,
  }));

  return steps;
}

function getCurrentStep() {
  return state.steps[state.currentStep];
}

function renderStringRow(label, chars, source, step) {
  const row = document.createElement("div");
  row.className = "string-row";

  const rowLabel = document.createElement("span");
  rowLabel.className = "string-label";
  rowLabel.textContent = label;
  row.appendChild(rowLabel);

  const tiles = document.createElement("div");
  tiles.className = "string-tiles";

  chars.forEach((char, index) => {
    const tile = document.createElement("span");
    tile.className = "char-tile";
    tile.textContent = char === " " ? "␠" : char;

    if (step.source === source && step.index === index) {
      tile.classList.add(step.phase === "mismatch" ? "mismatch" : "active");
    } else if (step.source === source && index < step.index) {
      tile.classList.add("visited");
    } else if (step.source === "t" && source === "s") {
      tile.classList.add("visited");
    }

    tiles.appendChild(tile);
  });

  if (chars.length === 0) {
    const empty = document.createElement("span");
    empty.className = "empty-string";
    empty.textContent = "empty string";
    tiles.appendChild(empty);
  }

  row.appendChild(tiles);
  return row;
}

function renderStrings(step) {
  stringRows.innerHTML = "";
  stringRows.appendChild(renderStringRow("s", state.s, "s", step));
  stringRows.appendChild(renderStringRow("t", state.t, "t", step));
}

function renderHashmap(step) {
  hashmapNode.innerHTML = "";
  const entries = Object.entries(step.counts);

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "map-empty";
    empty.textContent = "Hashmap is empty";
    hashmapNode.appendChild(empty);
    return;
  }

  entries.forEach(([char, count]) => {
    const entry = document.createElement("div");
    entry.className = "map-entry";

    if (char === step.char) {
      entry.classList.add(step.phase === "mismatch" ? "mismatch" : "active");
    }
    if (count === 0) entry.classList.add("balanced");

    const key = document.createElement("span");
    key.className = "map-key";
    key.textContent = char === " " ? "␠" : char;

    const value = document.createElement("span");
    value.className = "map-value";
    value.textContent = count;

    entry.appendChild(key);
    entry.appendChild(value);
    hashmapNode.appendChild(entry);
  });
}

function showResult(step) {
  resultBadge.classList.toggle("hidden", !step.isFinished);
  resultBadge.classList.toggle("valid", step.result === true);
  resultBadge.classList.toggle("invalid", step.result === false);
  resultBadge.textContent = step.result === true ? "Anagram" : "Not an Anagram";
}

function render() {
  const step = getCurrentStep();
  renderStrings(step);
  renderHashmap(step);

  phaseBadge.className = `phase-badge ${step.phase}`;
  phaseBadge.textContent = {
    ready: "Length check",
    build: "Count s",
    consume: "Match t",
    mismatch: "Mismatch",
    done: "Complete",
  }[step.phase];
  operationText.textContent = step.operation;
  stepMessage.textContent = step.message;
  showResult(step);
  updateButtons();
}

function updateButtons() {
  const step = getCurrentStep();
  btnPrev.disabled = state.currentStep === 0;
  btnNext.disabled = step.isFinished || state.currentStep >= state.steps.length - 1;
  btnPlay.disabled = step.isFinished || state.steps.length <= 1;
  btnPlay.textContent = state.isRunning ? "Pause" : "Play";
}

function stopAuto() {
  if (state.autoInterval) {
    clearInterval(state.autoInterval);
    state.autoInterval = null;
  }
  state.isRunning = false;
}

function stepForward() {
  if (state.currentStep >= state.steps.length - 1) return false;
  state.currentStep += 1;
  render();
  return !getCurrentStep().isFinished;
}

function stepBack() {
  if (state.currentStep === 0) return;
  stopAuto();
  state.currentStep -= 1;
  render();
}

function autoPlay() {
  state.isRunning = true;
  updateButtons();
  state.autoInterval = setInterval(() => {
    if (!stepForward()) {
      stopAuto();
      updateButtons();
    }
  }, 700);
}

function initialize() {
  stopAuto();
  state.s = Array.from(inputS.value);
  state.t = Array.from(inputT.value);
  state.steps = generateSteps(state.s, state.t);
  state.currentStep = 0;
  render();
}

btnPrev.addEventListener("click", stepBack);
btnNext.addEventListener("click", stepForward);
btnPlay.addEventListener("click", () => {
  if (state.isRunning) {
    stopAuto();
    updateButtons();
  } else {
    autoPlay();
  }
});
btnReset.addEventListener("click", initialize);
inputS.addEventListener("input", initialize);
inputT.addEventListener("input", initialize);

[inputS, inputT].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") stepForward();
  });
});

initialize();
