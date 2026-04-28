const arrayInput = document.getElementById("arrayInput");
const tilesContainer = document.getElementById("tilesContainer");
const stepMessage = document.getElementById("stepMessage");
const resultArea = document.getElementById("resultArea");
const resultBadge = document.getElementById("resultBadge");
const resultDetails = document.getElementById("resultDetails");
const swapArrow = document.getElementById("swapArrow");
const btnStart = document.getElementById("btnStart");
const btnNext = document.getElementById("btnNext");
const btnAuto = document.getElementById("btnAuto");
const btnPause = document.getElementById("btnPause");
const btnReset = document.getElementById("btnReset");

let state = {
  chars: [],
  original: [],
  leftPointer: 0,
  rightPointer: 0,
  currentStep: -1,
  phase: "highlight",
  isRunning: false,
  isFinished: false,
  swappedSet: new Set(),
  autoInterval: null,
};

function parseChars(str) {
  return Array.from(str.trim());
}

function renderTiles() {
  tilesContainer.innerHTML = "";

  state.chars.forEach((ch, i) => {
    const group = document.createElement("div");
    group.className = "tile-group";

    const index = document.createElement("div");
    index.className = "tile-index";
    index.textContent = i;

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = ch;

    if (state.isFinished) {
      tile.classList.add("done");
    } else if (state.currentStep >= 0) {
      if (state.swappedSet.has(i)) {
        tile.classList.add("done");
      } else if (i === state.leftPointer && i === state.rightPointer) {
        tile.classList.add("done");
      } else if (state.phase === "swap" && (i === state.leftPointer || i === state.rightPointer)) {
        tile.classList.add("swapping");
      } else if (i === state.leftPointer || i === state.rightPointer) {
        tile.classList.add("active-left");
      }
    }

    const pointer = document.createElement("div");
    pointer.className = "pointer-label";

    if (state.currentStep >= 0 && !state.isFinished) {
      if (i === state.leftPointer && i === state.rightPointer) {
        pointer.textContent = "L / R";
        pointer.classList.add("left");
      } else if (i === state.leftPointer) {
        pointer.textContent = "L →";
        pointer.classList.add("left");
      } else if (i === state.rightPointer) {
        pointer.textContent = "← R";
        pointer.classList.add("right");
      }
    }

    group.appendChild(index);
    group.appendChild(tile);
    group.appendChild(pointer);
    tilesContainer.appendChild(group);
  });
}

function updateStepDisplay() {
  if (state.currentStep < 0) {
    stepMessage.textContent = "Enter a string, then start.";
    swapArrow.classList.add("hidden");
    return;
  }

  if (state.isFinished) {
    stepMessage.textContent = "String reversed in-place!";
    swapArrow.classList.add("hidden");
    return;
  }

  const l = state.leftPointer;
  const r = state.rightPointer;
  const lv = state.chars[l];
  const rv = state.chars[r];

  if (state.phase === "highlight") {
    stepMessage.textContent = `Compare positions ${l} and ${r}. Ready to swap.`;
    swapArrow.classList.remove("hidden");
  } else {
    stepMessage.textContent = `Swapped "${rv}" and "${lv}". Move L right, R left.`;
    swapArrow.classList.add("hidden");
  }
}

function showResult() {
  resultArea.classList.remove("hidden");
  resultBadge.className = "result-badge found";
  resultBadge.textContent = "Reversed!";

  const original = `[${state.original.map((c) => `"${c}"`).join(", ")}]`;
  const reversed = `[${state.chars.map((c) => `"${c}"`).join(", ")}]`;

  resultDetails.innerHTML = `
    <div class="result-line">
      <span class="result-label">Before</span>
      <span class="result-value">${original}</span>
    </div>
    <div class="result-line">
      <span class="result-label">After</span>
      <span class="result-value">${reversed}</span>
    </div>
    <div class="result-line">
      <span class="result-label">Swaps</span>
      <span class="result-value">${Math.floor(state.original.length / 2)}</span>
    </div>
  `;
}

function step() {
  if (state.isFinished) return false;

  if (state.leftPointer >= state.rightPointer) {
    state.isFinished = true;
    updateStepDisplay();
    renderTiles();
    showResult();
    updateButtons();
    return false;
  }

  if (state.phase === "highlight") {
    state.phase = "swap";
    const l = state.leftPointer;
    const r = state.rightPointer;
    const tmp = state.chars[l];
    state.chars[l] = state.chars[r];
    state.chars[r] = tmp;
    state.swappedSet.add(l);
    state.swappedSet.add(r);
    updateStepDisplay();
    renderTiles();
    return true;
  }

  state.leftPointer++;
  state.rightPointer--;
  state.phase = "highlight";
  state.currentStep++;

  if (state.leftPointer >= state.rightPointer) {
    if (state.leftPointer === state.rightPointer) {
      state.swappedSet.add(state.leftPointer);
    }
    state.isFinished = true;
    updateStepDisplay();
    renderTiles();
    showResult();
    updateButtons();
    return false;
  }

  updateStepDisplay();
  renderTiles();
  return true;
}

function updateButtons() {
  const hasInput = state.chars.length >= 1;
  const started = state.currentStep >= 0;

  btnStart.disabled = started || !hasInput;
  btnNext.disabled = state.isFinished || !started;
  btnAuto.disabled = state.isFinished || !started || state.isRunning;
  btnPause.disabled = !state.isRunning;
  btnReset.disabled = false;

  btnStart.classList.toggle("primary", !started && hasInput);
}

function initialize() {
  stopAuto();

  const raw = parseChars(arrayInput.value);
  state.chars = raw;
  state.original = [...raw];
  state.leftPointer = 0;
  state.rightPointer = raw.length - 1;
  state.currentStep = -1;
  state.phase = "highlight";
  state.isRunning = false;
  state.isFinished = false;
  state.swappedSet = new Set();

  resultArea.classList.add("hidden");
  renderTiles();
  updateStepDisplay();
  updateButtons();
}

function startViz() {
  initialize();

  if (state.chars.length === 0) {
    return;
  }

  if (state.chars.length === 1) {
    state.currentStep = 0;
    state.isFinished = true;
    state.swappedSet.add(0);
    renderTiles();
    updateStepDisplay();
    showResult();
    updateButtons();
    return;
  }

  state.currentStep = 0;
  renderTiles();
  updateStepDisplay();
  updateButtons();
}

function stopAuto() {
  if (state.autoInterval) {
    clearInterval(state.autoInterval);
    state.autoInterval = null;
  }
  state.isRunning = false;
}

function autoPlay() {
  state.isRunning = true;
  updateButtons();
  state.autoInterval = setInterval(() => {
    const canContinue = step();
    if (!canContinue) {
      stopAuto();
      updateButtons();
    }
  }, 700);
}

btnStart.addEventListener("click", startViz);
btnNext.addEventListener("click", () => {
  step();
  updateButtons();
});
btnAuto.addEventListener("click", autoPlay);
btnPause.addEventListener("click", () => {
  stopAuto();
  updateButtons();
});
btnReset.addEventListener("click", initialize);

arrayInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && state.currentStep < 0) startViz();
});

initialize();
