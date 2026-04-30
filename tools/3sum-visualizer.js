const arrayInput = document.getElementById("arrayInput");
const tilesContainer = document.getElementById("tilesContainer");
const originalTilesContainer = document.getElementById("originalTilesContainer");
const originalArrayRow = document.getElementById("originalArrayRow");
const sortedArrayRow = document.getElementById("sortedArrayRow");
const comparisonText = document.getElementById("comparisonText");
const stepMessage = document.getElementById("stepMessage");
const tripletsPanel = document.getElementById("tripletsPanel");
const tripletsList = document.getElementById("tripletsList");
const resultArea = document.getElementById("resultArea");
const resultBadge = document.getElementById("resultBadge");
const btnSort = document.getElementById("btnSort");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnPlay = document.getElementById("btnPlay");
const btnReset = document.getElementById("btnReset");

let state = {
  original: [],
  nums: [],
  steps: [],
  stepIndex: -1,
  isRunning: false,
  isFinished: false,
  highlightTriplet: null,
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

function generateSteps(nums) {
  const steps = [];
  const found = [];

  steps.push({
    phase: "sorting",
    i: -1, L: -1, R: -1, sum: null,
    found: [],
    message: "Array sorted. Fix each number and search with two pointers.",
  });

  if (nums.length < 3) {
    steps.push({
      phase: "done",
      i: -1, L: -1, R: -1, sum: null,
      found: [],
      message: "Need at least 3 numbers.",
    });
    return steps;
  }

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        phase: "skip-dup-i",
        i, L: -1, R: -1, sum: null,
        found: [...found],
        message: `Skip duplicate i = ${nums[i]}`,
      });
      continue;
    }

    let L = i + 1;
    let R = nums.length - 1;

    steps.push({
      phase: "fixing-i",
      i, L, R, sum: null,
      found: [...found],
      message: `Fix i = ${nums[i]}. Search for two more.`,
    });

    while (L < R) {
      const sum = nums[i] + nums[L] + nums[R];

      if (sum < 0) {
        steps.push({
          phase: "comparing",
          i, L, R, sum,
          found: [...found],
          message: "Sum too small → move L right",
        });
        L++;
      } else if (sum > 0) {
        steps.push({
          phase: "comparing",
          i, L, R, sum,
          found: [...found],
          message: "Sum too large → move R left",
        });
        R--;
      } else {
        found.push({ values: [nums[i], nums[L], nums[R]], indices: [i, L, R] });
        steps.push({
          phase: "found-triplet",
          i, L, R, sum,
          found: [...found],
          message: "Found a triplet!",
        });

        while (L < R && nums[L] === nums[L + 1]) {
          L++;
          steps.push({
            phase: "skip-dup-left",
            i, L, R, sum: null,
            found: [...found],
            message: "Skip duplicate L",
          });
        }
        while (L < R && nums[R] === nums[R - 1]) {
          R--;
          steps.push({
            phase: "skip-dup-right",
            i, L, R, sum: null,
            found: [...found],
            message: "Skip duplicate R",
          });
        }

        L++;
        R--;
      }
    }
  }

  const n = found.length;
  steps.push({
    phase: "done",
    i: -1, L: -1, R: -1, sum: null,
    found: [...found],
    message: n > 0 ? `Found ${n} triplet${n !== 1 ? "s" : ""}!` : "No triplets found.",
  });

  return steps;
}

function renderOriginalTiles() {
  originalTilesContainer.innerHTML = "";
  state.original.forEach((num, idx) => {
    const group = document.createElement("div");
    group.className = "tile-group";
    const indexEl = document.createElement("div");
    indexEl.className = "tile-index";
    indexEl.textContent = idx;
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = num;
    const pointer = document.createElement("div");
    pointer.className = "pointer-label";
    group.appendChild(indexEl);
    group.appendChild(tile);
    group.appendChild(pointer);
    originalTilesContainer.appendChild(group);
  });
}

function renderOriginalInput() {
  state.original = parseArray(arrayInput.value);
  renderOriginalTiles();
}

function renderTiles() {
  tilesContainer.innerHTML = "";
  if (!state.nums.length) return;

  const step = state.stepIndex >= 0 ? state.steps[state.stepIndex] : null;

  state.nums.forEach((num, idx) => {
    const group = document.createElement("div");
    group.className = "tile-group";

    const indexEl = document.createElement("div");
    indexEl.className = "tile-index";
    indexEl.textContent = idx;

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = num;

    const pointer = document.createElement("div");
    pointer.className = "pointer-label";

    if (step) {
      const { phase, i, L, R } = step;

      if (phase !== "sorting" && phase !== "done") {
        if (phase === "skip-dup-i") {
          if (idx < i) {
            tile.classList.add("dismissed");
          } else if (idx === i) {
            tile.classList.add("active-i");
            pointer.textContent = "i";
            pointer.classList.add("fixed");
          }
        } else {
          if (idx < i) {
            tile.classList.add("dismissed");
          } else if (idx === i) {
            tile.classList.add(phase === "found-triplet" ? "found" : "active-i");
            pointer.textContent = "i";
            pointer.classList.add("fixed");
          } else if (R !== -1 && idx > R) {
            tile.classList.add("dismissed");
          } else if (L !== -1 && idx === L && idx === R) {
            tile.classList.add(phase === "found-triplet" ? "found" : "active-left");
            pointer.textContent = "L / R";
            pointer.classList.add("left");
          } else if (L !== -1 && idx === L) {
            tile.classList.add(phase === "found-triplet" ? "found" : "active-left");
            pointer.textContent = "L →";
            pointer.classList.add("left");
          } else if (R !== -1 && idx === R) {
            tile.classList.add(phase === "found-triplet" ? "found" : "active-right");
            pointer.textContent = "← R";
            pointer.classList.add("right");
          }
        }
      }

      if (state.highlightTriplet !== null && state.highlightTriplet < step.found.length) {
        const ht = step.found[state.highlightTriplet];
        if (ht.indices.includes(idx)) {
          tile.className = "tile found";
        }
      }
    }

    group.appendChild(indexEl);
    group.appendChild(tile);
    group.appendChild(pointer);
    tilesContainer.appendChild(group);
  });
}

function updateStepDisplay() {
  if (state.stepIndex < 0) {
    comparisonText.textContent = "Press Sort to begin";
    return;
  }

  const step = state.steps[state.stepIndex];
  const { phase, i, L, R, sum } = step;

  if (phase === "comparing" || phase === "found-triplet") {
    comparisonText.textContent = `${state.nums[i]} + ${state.nums[L]} + ${state.nums[R]} = ${sum}`;
  } else if (phase === "sorting") {
    comparisonText.textContent = "Sorted";
  } else if (phase === "done") {
    comparisonText.textContent = "Done";
  } else {
    comparisonText.textContent = "";
  }

  stepMessage.textContent = step.message;
}

function updateTripletsPanel() {
  if (state.stepIndex < 0) {
    tripletsPanel.classList.add("hidden");
    return;
  }

  const step = state.steps[state.stepIndex];
  if (!step || step.found.length === 0) {
    tripletsPanel.classList.add("hidden");
    return;
  }

  if (state.highlightTriplet !== null && state.highlightTriplet >= step.found.length) {
    state.highlightTriplet = null;
  }

  tripletsPanel.classList.remove("hidden");
  tripletsList.innerHTML = "";

  step.found.forEach((triplet, idx) => {
    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = "triplet-badge" + (state.highlightTriplet === idx ? " highlighted" : "");
    badge.textContent = `[${triplet.values.join(", ")}]`;
    badge.addEventListener("click", () => {
      state.highlightTriplet = state.highlightTriplet === idx ? null : idx;
      renderTiles();
      updateTripletsPanel();
    });
    tripletsList.appendChild(badge);
  });
}

function showResult() {
  const step = state.steps[state.stepIndex];
  if (!step) return;

  resultArea.classList.remove("hidden");
  resultBadge.className = "result-badge";

  if (step.found.length > 0) {
    resultBadge.classList.add("found");
    resultBadge.textContent = `${step.found.length} triplet${step.found.length !== 1 ? "s" : ""} found`;
  } else {
    resultBadge.classList.add("not-found");
    resultBadge.textContent = "No triplets found";
  }
}

function updateButtons() {
  const hasInput = parseArray(arrayInput.value).length >= 2;
  const started = state.stepIndex >= 0;

  btnSort.disabled = started || !hasInput;
  btnPrev.disabled = !started || state.stepIndex <= 0;
  btnNext.disabled = !started || state.isFinished;
  btnPlay.disabled = !started || state.isFinished;
  btnPlay.textContent = state.isRunning ? "Pause" : "Play";
  btnReset.disabled = false;

  btnSort.classList.toggle("primary", !started && hasInput);
}

function initialize() {
  stopAuto();
  state.original = [];
  state.nums = [];
  state.steps = [];
  state.stepIndex = -1;
  state.isRunning = false;
  state.isFinished = false;
  state.highlightTriplet = null;

  tripletsPanel.classList.add("hidden");
  resultArea.classList.add("hidden");
  tilesContainer.innerHTML = "";
  originalArrayRow.classList.remove("hidden");
  sortedArrayRow.classList.add("hidden");
  renderOriginalInput();

  comparisonText.textContent = "Press Sort to begin";
  stepMessage.textContent = "";
  updateButtons();
}

function startViz() {
  const raw = parseArray(arrayInput.value);
  if (raw.length < 2) return;

  const sorted = [...raw].sort((a, b) => a - b);
  state.original = raw;
  state.nums = sorted;
  state.steps = generateSteps(sorted);
  state.stepIndex = 0;
  state.isRunning = false;
  state.isFinished = false;
  state.highlightTriplet = null;

  resultArea.classList.add("hidden");
  originalArrayRow.classList.add("hidden");
  sortedArrayRow.classList.remove("hidden");
  renderTiles();
  updateStepDisplay();
  updateTripletsPanel();
  updateButtons();
}

function stepForward() {
  if (state.isFinished || state.stepIndex >= state.steps.length - 1) return false;
  state.stepIndex++;

  const step = state.steps[state.stepIndex];
  renderTiles();
  updateStepDisplay();
  updateTripletsPanel();

  if (step.phase === "done") {
    state.isFinished = true;
    updateButtons();
    setTimeout(showResult, 400);
    return false;
  }

  updateButtons();
  return true;
}

function stepBack() {
  if (state.stepIndex <= 0) return;
  stopAuto();
  state.isFinished = false;
  resultArea.classList.add("hidden");
  state.stepIndex--;
  renderTiles();
  updateStepDisplay();
  updateTripletsPanel();
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

btnSort.addEventListener("click", startViz);

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

arrayInput.addEventListener("input", () => {
  if (state.stepIndex < 0) {
    renderOriginalInput();
    updateButtons();
  }
});

arrayInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && state.stepIndex < 0) startViz();
});

initialize();
