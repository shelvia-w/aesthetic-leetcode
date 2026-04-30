const arrayInput = document.getElementById("arrayInput");
const tilesContainer = document.getElementById("tilesContainer");
const stepMessage = document.getElementById("stepMessage");
const resultArea = document.getElementById("resultArea");
const resultBadge = document.getElementById("resultBadge");
const resultDetails = document.getElementById("resultDetails");
const swapArrow = document.getElementById("swapArrow");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnPlay = document.getElementById("btnPlay");
const btnReset = document.getElementById("btnReset");

let state = {
  chars: [],
  original: [],
  leftPointer: 0,
  rightPointer: 0,
  steps: [],
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

function createStep({ chars, left, right, phase, isFinished, swappedSet, message }) {
  return {
    chars: [...chars],
    left,
    right,
    phase,
    isFinished,
    swappedSet: [...swappedSet],
    message,
  };
}

function generateSteps(original) {
  const steps = [];
  const chars = [...original];
  const swapped = new Set();
  let left = 0;
  let right = chars.length - 1;

  if (chars.length === 0) {
    return steps;
  }

  if (chars.length === 1) {
    swapped.add(0);
    steps.push(createStep({
      chars,
      left,
      right,
      phase: "done",
      isFinished: true,
      swappedSet: swapped,
      message: "String reversed in-place!",
    }));
    return steps;
  }

  while (left < right) {
    steps.push(createStep({
      chars,
      left,
      right,
      phase: "highlight",
      isFinished: false,
      swappedSet: swapped,
      message: `Compare positions ${left} and ${right}. Ready to swap.`,
    }));

    const leftValue = chars[left];
    const rightValue = chars[right];
    chars[left] = rightValue;
    chars[right] = leftValue;
    swapped.add(left);
    swapped.add(right);

    steps.push(createStep({
      chars,
      left,
      right,
      phase: "swap",
      isFinished: false,
      swappedSet: swapped,
      message: `Swapped "${rightValue}" and "${leftValue}". Move L right, R left.`,
    }));

    left++;
    right--;
  }

  if (left === right) swapped.add(left);

  steps.push(createStep({
    chars,
    left,
    right,
    phase: "done",
    isFinished: true,
    swappedSet: swapped,
    message: "String reversed in-place!",
  }));

  return steps;
}

function syncStepState() {
  const step = state.currentStep >= 0 ? state.steps[state.currentStep] : null;

  state.chars = step ? [...step.chars] : [...state.original];
  state.leftPointer = step ? step.left : 0;
  state.rightPointer = step ? step.right : state.chars.length - 1;
  state.phase = step ? step.phase : "highlight";
  state.isFinished = Boolean(step && step.isFinished);
  state.swappedSet = new Set(step ? step.swappedSet : []);
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
        pointer.textContent = "L ->";
        pointer.classList.add("left");
      } else if (i === state.rightPointer) {
        pointer.textContent = "<- R";
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
  const step = state.currentStep >= 0 ? state.steps[state.currentStep] : null;

  if (!step) {
    stepMessage.textContent = "Use Next or Play to swap characters.";
    swapArrow.classList.add("hidden");
    return;
  }

  stepMessage.textContent = step.message;
  swapArrow.classList.toggle("hidden", state.phase !== "highlight" || state.isFinished);
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

function updateButtons() {
  const hasInput = state.original.length >= 1;
  const started = state.currentStep >= 0;

  btnPrev.disabled = !started || state.currentStep <= 0;
  btnNext.disabled = !hasInput || !started || state.isFinished;
  btnPlay.disabled = !hasInput || !started || state.isFinished;
  btnPlay.textContent = state.isRunning ? "Pause" : "Play";
  btnReset.disabled = false;
}

function initialize() {
  stopAuto();

  const raw = parseChars(arrayInput.value);
  state.original = [...raw];
  state.steps = generateSteps(raw);
  state.currentStep = raw.length >= 1 ? 0 : -1;
  state.isRunning = false;
  state.isFinished = false;
  syncStepState();

  resultArea.classList.add("hidden");
  renderTiles();
  updateStepDisplay();
  updateButtons();
}

function stepForward() {
  if (state.isFinished || state.currentStep >= state.steps.length - 1) return false;

  state.currentStep++;
  syncStepState();
  renderTiles();
  updateStepDisplay();

  if (state.isFinished) {
    updateButtons();
    setTimeout(showResult, 400);
    return false;
  }

  updateButtons();
  return true;
}

function stepBack() {
  if (state.currentStep <= 0) return;
  stopAuto();
  resultArea.classList.add("hidden");
  state.currentStep--;
  syncStepState();
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
    const canContinue = stepForward();
    if (!canContinue) {
      stopAuto();
      updateButtons();
    }
  }, 700);
}

btnPrev.addEventListener("click", stepBack);
btnNext.addEventListener("click", () => {
  stepForward();
  updateButtons();
});
btnPlay.addEventListener("click", () => {
  if (state.isRunning) {
    stopAuto();
    updateButtons();
  } else {
    autoPlay();
  }
});
btnReset.addEventListener("click", initialize);

arrayInput.addEventListener("input", initialize);

arrayInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") stepForward();
});

initialize();
