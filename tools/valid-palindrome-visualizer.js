const input = document.getElementById("vizInput");
const tilesContainer = document.getElementById("tilesContainer");
const comparisonText = document.getElementById("comparisonText");
const stepMessage = document.getElementById("stepMessage");
const resultBadge = document.getElementById("resultBadge");
const cleanedTextEl = document.getElementById("cleanedText");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnPlay = document.getElementById("btnPlay");
const btnReset = document.getElementById("btnReset");

let state = {
  originalInput: "",
  cleanedInput: "",
  leftPointer: 0,
  rightPointer: 0,
  steps: [],
  currentStep: -1,
  comparisonStatus: null,
  isRunning: false,
  isFinished: false,
  result: null,
  matchedIndices: new Set(),
  autoInterval: null,
};

function cleanString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function createStep({ left, right, status, result, matchedIndices, message }) {
  return {
    left,
    right,
    comparisonStatus: status,
    isFinished: result !== null,
    result,
    matchedIndices: [...matchedIndices],
    message,
  };
}

function generateSteps(cleaned) {
  const steps = [];
  const matched = new Set();
  let left = 0;
  let right = cleaned.length - 1;

  if (cleaned.length === 0) {
    return steps;
  }

  steps.push(createStep({
    left,
    right,
    status: null,
    result: null,
    matchedIndices: matched,
    message: "Compare both ends.",
  }));

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      steps.push(createStep({
        left,
        right,
        status: "mismatch",
        result: false,
        matchedIndices: matched,
        message: "Mismatch found.",
      }));
      return steps;
    }

    matched.add(left);
    matched.add(right);
    steps.push(createStep({
      left,
      right,
      status: "match",
      result: null,
      matchedIndices: matched,
      message: "Characters match. Move inward.",
    }));

    left++;
    right--;

    if (left < right) {
      steps.push(createStep({
        left,
        right,
        status: null,
        result: null,
        matchedIndices: matched,
        message: "Compare both ends.",
      }));
    }
  }

  if (left === right) matched.add(left);

  steps.push(createStep({
    left,
    right,
    status: null,
    result: true,
    matchedIndices: matched,
    message: "Pointers met. Palindrome confirmed.",
  }));

  return steps;
}

function syncStepState() {
  const step = state.currentStep >= 0 ? state.steps[state.currentStep] : null;

  state.leftPointer = step ? step.left : 0;
  state.rightPointer = step ? step.right : state.cleanedInput.length - 1;
  state.comparisonStatus = step ? step.comparisonStatus : null;
  state.isFinished = Boolean(step && step.isFinished);
  state.result = step ? step.result : null;
  state.matchedIndices = new Set(step ? step.matchedIndices : []);
}

function renderTiles() {
  tilesContainer.innerHTML = "";
  const chars = state.cleanedInput.split("");

  chars.forEach((char, i) => {
    const group = document.createElement("div");
    group.className = "tile-group";

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = char;

    if (state.isFinished && state.result === true) {
      tile.classList.add("done");
    }

    if (state.matchedIndices.has(i)) {
      tile.classList.add("matched");
    }

    if (state.currentStep >= 0 && !state.isFinished) {
      if (i === state.leftPointer) tile.classList.add("active-left");
      if (i === state.rightPointer) tile.classList.add("active-right");
    }

    if (state.comparisonStatus === "mismatch") {
      if (i === state.leftPointer || i === state.rightPointer) {
        tile.classList.remove("active-left", "active-right", "matched");
        tile.classList.add("mismatched");
      }
    }

    const pointer = document.createElement("div");
    pointer.className = "pointer-label";

    if (state.currentStep >= 0 && !state.isFinished) {
      if (i === state.leftPointer && i === state.rightPointer) {
        pointer.textContent = "L / R";
        pointer.classList.add("visible", "left");
      } else if (i === state.leftPointer) {
        pointer.textContent = "L ->";
        pointer.classList.add("visible", "left");
      } else if (i === state.rightPointer) {
        pointer.textContent = "<- R";
        pointer.classList.add("visible", "right");
      }
    }

    group.appendChild(tile);
    group.appendChild(pointer);
    tilesContainer.appendChild(group);
  });
}

function updateStepDisplay() {
  const step = state.currentStep >= 0 ? state.steps[state.currentStep] : null;

  if (!step) {
    comparisonText.textContent = "Ready";
    stepMessage.textContent = "Use Next or Play to compare characters.";
    return;
  }

  const left = state.cleanedInput[state.leftPointer];
  const right = state.cleanedInput[state.rightPointer];

  if (state.isFinished) {
    if (state.result) {
      comparisonText.textContent = "Complete";
    } else {
      comparisonText.textContent = `${left} != ${right}`;
    }
    stepMessage.textContent = step.message;
    return;
  }

  if (state.comparisonStatus === "match") {
    comparisonText.textContent = `${left} = ${right}`;
  } else if (state.comparisonStatus === "mismatch") {
    comparisonText.textContent = `${left} != ${right}`;
  } else {
    comparisonText.textContent = `${left} ? ${right}`;
  }

  stepMessage.textContent = step.message;
}

function showResult() {
  resultBadge.classList.remove("hidden", "palindrome", "not-palindrome");
  if (state.result) {
    resultBadge.classList.add("palindrome");
    resultBadge.textContent = "Palindrome";
  } else {
    resultBadge.classList.add("not-palindrome");
    resultBadge.textContent = "Not Palindrome";
  }
}

function updateButtons() {
  const hasInput = state.cleanedInput.length > 0;
  const started = state.currentStep >= 0;

  btnPrev.disabled = !started || state.currentStep <= 0;
  btnNext.disabled = !hasInput || !started || state.isFinished;
  btnPlay.disabled = !hasInput || !started || state.isFinished;
  btnPlay.textContent = state.isRunning ? "Pause" : "Play";
  btnReset.disabled = false;
}

function initialize() {
  stopAuto();
  state.originalInput = input.value;
  state.cleanedInput = cleanString(input.value);
  state.steps = generateSteps(state.cleanedInput);
  state.currentStep = state.cleanedInput.length > 0 ? 0 : -1;
  state.isRunning = false;
  state.isFinished = false;
  state.result = null;
  state.matchedIndices = new Set();
  syncStepState();

  resultBadge.classList.add("hidden");
  cleanedTextEl.textContent = state.cleanedInput || "(empty)";
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
  resultBadge.classList.add("hidden");
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
  }, 900);
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

input.addEventListener("input", initialize);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") stepForward();
});

initialize();
