const arrayInput = document.getElementById("arrayInput");
const targetInput = document.getElementById("targetInput");
const tilesContainer = document.getElementById("tilesContainer");
const comparisonText = document.getElementById("comparisonText");
const stepMessage = document.getElementById("stepMessage");
const resultArea = document.getElementById("resultArea");
const resultBadge = document.getElementById("resultBadge");
const resultDetails = document.getElementById("resultDetails");
const sortWarning = document.getElementById("sortWarning");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnPlay = document.getElementById("btnPlay");
const btnReset = document.getElementById("btnReset");

let state = {
  numbers: [],
  target: 9,
  wasSorted: false,
  leftPointer: 0,
  rightPointer: 0,
  steps: [],
  currentStep: -1,
  isRunning: false,
  isFinished: false,
  result: null,
  foundIndices: null,
  autoInterval: null,
};

function parseArray(str) {
  return str
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

function generateSteps(numbers, target) {
  const steps = [];
  let left = 0;
  let right = numbers.length - 1;

  if (numbers.length < 2) {
    steps.push({
      left,
      right,
      sum: null,
      isFinished: true,
      result: false,
      foundIndices: null,
      message: "Need at least 2 numbers.",
    });
    return steps;
  }

  steps.push({
    left,
    right,
    sum: null,
    isFinished: false,
    result: null,
    foundIndices: null,
    message: "Enter a sorted array and target, then start.",
  });

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      steps.push({
        left,
        right,
        sum,
        isFinished: true,
        result: true,
        foundIndices: [left, right],
        message: `${sum} = ${target}, answer found!`,
      });
      return steps;
    }

    steps.push({
      left,
      right,
      sum,
      isFinished: false,
      result: null,
      foundIndices: null,
      message: sum > target ? `${sum} > ${target}, move R left.` : `${sum} < ${target}, move L right.`,
    });

    if (sum > target) {
      right--;
    } else {
      left++;
    }
  }

  steps.push({
    left,
    right,
    sum: null,
    isFinished: true,
    result: false,
    foundIndices: null,
    message: "No valid pair found.",
  });

  return steps;
}

function syncStepState() {
  const step = state.currentStep >= 0 ? state.steps[state.currentStep] : null;

  state.leftPointer = step ? step.left : 0;
  state.rightPointer = step ? step.right : state.numbers.length - 1;
  state.isFinished = Boolean(step && step.isFinished);
  state.result = step ? step.result : null;
  state.foundIndices = step ? step.foundIndices : null;
}

function renderTiles() {
  tilesContainer.innerHTML = "";

  state.numbers.forEach((num, i) => {
    const group = document.createElement("div");
    group.className = "tile-group";

    const index = document.createElement("div");
    index.className = "tile-index";
    index.textContent = i + 1;

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = num;

    if (state.isFinished && state.foundIndices) {
      if (i === state.foundIndices[0] || i === state.foundIndices[1]) {
        tile.classList.add("found");
      } else {
        tile.classList.add("dismissed");
      }
    } else if (state.currentStep >= 0 && !state.isFinished) {
      if (i === state.leftPointer) tile.classList.add("active-left");
      else if (i === state.rightPointer) tile.classList.add("active-right");
    }

    const pointer = document.createElement("div");
    pointer.className = "pointer-label";

    if (state.currentStep >= 0) {
      if (state.isFinished && state.foundIndices) {
        if (i === state.foundIndices[0]) {
          pointer.textContent = "L";
          pointer.classList.add("left");
        } else if (i === state.foundIndices[1]) {
          pointer.textContent = "R";
          pointer.classList.add("right");
        }
      } else if (!state.isFinished) {
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
    comparisonText.textContent = "Press Start to begin";
    stepMessage.textContent = "Enter a sorted array and target, then start.";
    return;
  }

  if (step.isFinished) {
    if (step.foundIndices) {
      const l = step.foundIndices[0];
      const r = step.foundIndices[1];
      const lv = state.numbers[l];
      const rv = state.numbers[r];
      comparisonText.textContent = `${lv} + ${rv} = ${state.target}`;
      stepMessage.textContent = "Target found!";
    } else {
      comparisonText.textContent = "No match";
      stepMessage.textContent = "No valid pair found.";
    }
    return;
  }

  if (step.sum === null) {
    comparisonText.textContent = "Ready";
    stepMessage.textContent = step.message;
    return;
  }

  comparisonText.textContent = `${state.numbers[step.left]} + ${state.numbers[step.right]} = ${step.sum}`;
  stepMessage.textContent = step.message;
}

function showResult() {
  resultArea.classList.remove("hidden");
  resultBadge.className = "result-badge";
  resultDetails.innerHTML = "";

  if (state.foundIndices) {
    const l = state.foundIndices[0];
    const r = state.foundIndices[1];
    const lv = state.numbers[l];
    const rv = state.numbers[r];

    resultBadge.classList.add("found");
    resultBadge.textContent = `Return [${l + 1}, ${r + 1}]`;

    resultDetails.innerHTML = `
      <div class="result-line">
        <span class="result-label">Values</span>
        <span class="result-value">${lv} + ${rv} = ${state.target}</span>
      </div>
      <div class="result-line">
        <span class="result-label">Indices</span>
        <span class="result-value">${l + 1} and ${r + 1}</span>
      </div>
    `;
  } else {
    resultBadge.classList.add("not-found");
    resultBadge.textContent = "No valid pair found";
  }
}

function updateButtons() {
  const hasInput = state.numbers.length >= 2;
  const started = state.currentStep >= 0;

  btnPrev.disabled = !started || state.currentStep <= 0;
  btnNext.disabled = !hasInput || !started || state.isFinished;
  btnPlay.disabled = !hasInput || !started || state.isFinished;
  btnPlay.textContent = state.isRunning ? "Pause" : "Play";
  btnReset.disabled = false;
}

function initialize() {
  stopAuto();

  const raw = parseArray(arrayInput.value);
  const sorted = isSorted(raw);

  if (!sorted && raw.length > 0) {
    state.numbers = [...raw].sort((a, b) => a - b);
    state.wasSorted = true;
    sortWarning.classList.remove("hidden");
  } else {
    state.numbers = raw;
    state.wasSorted = false;
    sortWarning.classList.add("hidden");
  }

  state.target = Number(targetInput.value) || 0;
  state.steps = generateSteps(state.numbers, state.target);
  state.leftPointer = 0;
  state.rightPointer = state.numbers.length - 1;
  state.currentStep = state.numbers.length >= 2 ? 0 : -1;
  state.isRunning = false;
  state.isFinished = false;
  state.result = null;
  state.foundIndices = null;
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

arrayInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") stepForward();
});
targetInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") stepForward();
});

arrayInput.addEventListener("input", () => {
  initialize();
});

targetInput.addEventListener("input", () => {
  initialize();
});

initialize();
