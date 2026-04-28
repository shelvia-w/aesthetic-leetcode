const arrayInput = document.getElementById("arrayInput");
const targetInput = document.getElementById("targetInput");
const tilesContainer = document.getElementById("tilesContainer");
const comparisonText = document.getElementById("comparisonText");
const stepMessage = document.getElementById("stepMessage");
const resultArea = document.getElementById("resultArea");
const resultBadge = document.getElementById("resultBadge");
const resultDetails = document.getElementById("resultDetails");
const sortWarning = document.getElementById("sortWarning");
const btnStart = document.getElementById("btnStart");
const btnNext = document.getElementById("btnNext");
const btnAuto = document.getElementById("btnAuto");
const btnPause = document.getElementById("btnPause");
const btnReset = document.getElementById("btnReset");

let state = {
  numbers: [],
  target: 9,
  wasSorted: false,
  leftPointer: 0,
  rightPointer: 0,
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
  if (state.currentStep < 0) {
    comparisonText.textContent = "Press Start to begin";
    stepMessage.textContent = "Enter a sorted array and target, then start.";
    return;
  }

  if (state.isFinished) {
    if (state.foundIndices) {
      const l = state.foundIndices[0];
      const r = state.foundIndices[1];
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

  const lv = state.numbers[state.leftPointer];
  const rv = state.numbers[state.rightPointer];
  const sum = lv + rv;

  comparisonText.textContent = `${lv} + ${rv} = ${sum}`;

  if (sum === state.target) {
    stepMessage.textContent = `${sum} = ${state.target}, answer found!`;
  } else if (sum > state.target) {
    stepMessage.textContent = `${sum} > ${state.target}, move R left.`;
  } else {
    stepMessage.textContent = `${sum} < ${state.target}, move L right.`;
  }
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

function step() {
  if (state.isFinished) return false;

  if (state.leftPointer >= state.rightPointer) {
    state.isFinished = true;
    state.result = false;
    state.foundIndices = null;
    updateStepDisplay();
    renderTiles();
    showResult();
    updateButtons();
    return false;
  }

  state.currentStep++;
  const lv = state.numbers[state.leftPointer];
  const rv = state.numbers[state.rightPointer];
  const sum = lv + rv;

  updateStepDisplay();
  renderTiles();

  if (sum === state.target) {
    state.isFinished = true;
    state.result = true;
    state.foundIndices = [state.leftPointer, state.rightPointer];
    setTimeout(() => {
      updateStepDisplay();
      renderTiles();
      showResult();
      updateButtons();
    }, 400);
    return false;
  } else if (sum > state.target) {
    state.rightPointer--;
  } else {
    state.leftPointer++;
  }

  if (state.leftPointer >= state.rightPointer && !state.isFinished) {
    const newSum = state.numbers[state.leftPointer] + state.numbers[state.rightPointer];
    if (state.leftPointer === state.rightPointer || newSum !== state.target) {
      return true;
    }
  }

  return true;
}

function updateButtons() {
  const hasInput = state.numbers.length >= 2;
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
  state.leftPointer = 0;
  state.rightPointer = state.numbers.length - 1;
  state.currentStep = -1;
  state.isRunning = false;
  state.isFinished = false;
  state.result = null;
  state.foundIndices = null;

  resultArea.classList.add("hidden");
  renderTiles();
  updateStepDisplay();
  updateButtons();
}

function startViz() {
  initialize();

  if (state.numbers.length < 2) {
    state.isFinished = true;
    state.result = false;
    state.foundIndices = null;
    showResult();
    updateStepDisplay();
    renderTiles();
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

arrayInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && state.currentStep < 0) startViz();
});
targetInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && state.currentStep < 0) startViz();
});

initialize();
