const input = document.getElementById("vizInput");
const tilesContainer = document.getElementById("tilesContainer");
const comparisonText = document.getElementById("comparisonText");
const stepMessage = document.getElementById("stepMessage");
const resultBadge = document.getElementById("resultBadge");
const cleanedTextEl = document.getElementById("cleanedText");
const btnStart = document.getElementById("btnStart");
const btnNext = document.getElementById("btnNext");
const btnAuto = document.getElementById("btnAuto");
const btnPause = document.getElementById("btnPause");
const btnReset = document.getElementById("btnReset");

let state = {
  originalInput: "",
  cleanedInput: "",
  leftPointer: 0,
  rightPointer: 0,
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

    if (state.comparisonStatus === "mismatch" && !state.isFinished) {
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
        pointer.textContent = "L →";
        pointer.classList.add("visible", "left");
      } else if (i === state.rightPointer) {
        pointer.textContent = "← R";
        pointer.classList.add("visible", "right");
      }
    }

    group.appendChild(tile);
    group.appendChild(pointer);
    tilesContainer.appendChild(group);
  });
}

function updateStepDisplay() {
  if (state.currentStep < 0) {
    comparisonText.textContent = "Press Start to begin";
    stepMessage.textContent = "Enter a string and start the visualizer.";
    return;
  }

  const left = state.cleanedInput[state.leftPointer];
  const right = state.cleanedInput[state.rightPointer];

  if (state.isFinished) {
    if (state.result) {
      comparisonText.textContent = "Complete";
      stepMessage.textContent = "Pointers met — palindrome confirmed.";
    } else {
      comparisonText.textContent = `${left} ≠ ${right}`;
      stepMessage.textContent = "Mismatch found.";
    }
    return;
  }

  if (state.comparisonStatus === "match") {
    comparisonText.textContent = `${left} = ${right}`;
    stepMessage.textContent = "Characters match — move inward.";
  } else if (state.comparisonStatus === "mismatch") {
    comparisonText.textContent = `${left} ≠ ${right}`;
    stepMessage.textContent = "Mismatch found.";
  } else {
    comparisonText.textContent = `${left} ? ${right}`;
    stepMessage.textContent = "Compare both ends.";
  }
}

function showResult() {
  resultBadge.classList.remove("hidden", "palindrome", "not-palindrome");
  if (state.result) {
    resultBadge.classList.add("palindrome");
    resultBadge.textContent = "Palindrome ✓";
  } else {
    resultBadge.classList.add("not-palindrome");
    resultBadge.textContent = "Not Palindrome ✗";
  }
}

function step() {
  if (state.isFinished) return false;

  const cleaned = state.cleanedInput;

  if (cleaned.length === 0) {
    state.isFinished = true;
    state.result = true;
    showResult();
    updateStepDisplay();
    renderTiles();
    updateButtons();
    return false;
  }

  if (state.leftPointer >= state.rightPointer) {
    state.matchedIndices.add(state.leftPointer);
    state.isFinished = true;
    state.result = true;
    showResult();
    updateStepDisplay();
    renderTiles();
    updateButtons();
    return false;
  }

  state.currentStep++;
  const left = cleaned[state.leftPointer];
  const right = cleaned[state.rightPointer];

  if (left === right) {
    state.comparisonStatus = "match";
    state.matchedIndices.add(state.leftPointer);
    state.matchedIndices.add(state.rightPointer);
    updateStepDisplay();
    renderTiles();

    state.leftPointer++;
    state.rightPointer--;

    if (state.leftPointer >= state.rightPointer) {
      if (state.leftPointer === state.rightPointer) {
        state.matchedIndices.add(state.leftPointer);
      }
      state.isFinished = true;
      state.result = true;
      setTimeout(() => {
        showResult();
        updateStepDisplay();
        renderTiles();
        updateButtons();
      }, 400);
    }
    return true;
  } else {
    state.comparisonStatus = "mismatch";
    state.isFinished = true;
    state.result = false;
    updateStepDisplay();
    renderTiles();
    setTimeout(() => {
      showResult();
      updateButtons();
    }, 400);
    return false;
  }
}

function updateButtons() {
  const hasInput = state.cleanedInput.length > 0;
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
  state.originalInput = input.value;
  state.cleanedInput = cleanString(input.value);
  state.leftPointer = 0;
  state.rightPointer = state.cleanedInput.length - 1;
  state.currentStep = -1;
  state.comparisonStatus = null;
  state.isRunning = false;
  state.isFinished = false;
  state.result = null;
  state.matchedIndices = new Set();
  resultBadge.classList.add("hidden");
  cleanedTextEl.textContent = state.cleanedInput || "(empty)";
  renderTiles();
  updateStepDisplay();
  updateButtons();
}

function startViz() {
  initialize();
  state.currentStep = 0;

  if (state.cleanedInput.length === 0) {
    state.isFinished = true;
    state.result = true;
    showResult();
    updateStepDisplay();
    renderTiles();
    updateButtons();
    return;
  }

  state.comparisonStatus = null;
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
  }, 900);
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

input.addEventListener("input", () => {
  if (state.currentStep < 0) {
    state.cleanedInput = cleanString(input.value);
    cleanedTextEl.textContent = state.cleanedInput || "(empty)";
    renderTiles();
    updateButtons();
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (state.currentStep < 0) startViz();
  }
});

initialize();
