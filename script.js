const state = {
  activeFilter: "All",
  query: "",
};

const grid = document.querySelector("#problemGrid");
const filtersNode = document.querySelector("#filters");
const filterShell = document.querySelector(".filter-shell");
const filterTrigger = document.querySelector(".filter-trigger");
const activeFilterLabel = document.querySelector("#activeFilterLabel");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const aboutDrawer = document.querySelector("#aboutDrawer");
const aboutTrigger = document.querySelector(".about-trigger");
const aboutDrawerCloseButtons = document.querySelectorAll(".about-drawer-close, .about-drawer-scrim");

function renderFilters() {
  activeFilterLabel.textContent = state.activeFilter;
  filtersNode.innerHTML = filters
    .map(
      (filter) => `
        <button class="chip" type="button" data-filter="${filter}" aria-pressed="${filter === state.activeFilter}">
          ${filter}
        </button>
      `,
    )
    .join("");
}

function setFilterMenuOpen(isOpen) {
  filterShell.classList.toggle("is-open", isOpen);
  filterTrigger.setAttribute("aria-expanded", String(isOpen));
}

function getVisibleProblems() {
  const query = state.query.trim().toLowerCase();

  return problems.filter((problem) => {
    const matchesFilter =
      state.activeFilter === "All" ||
      problem.pattern === state.activeFilter ||
      problem.categories.includes(state.activeFilter);
    const searchable = [problem.title, problem.pattern, problem.difficulty, problem.description, ...problem.categories]
      .join(" ")
      .toLowerCase();

    return matchesFilter && searchable.includes(query);
  });
}

function renderProblems() {
  const visibleProblems = getVisibleProblems();
  emptyState.hidden = visibleProblems.length > 0;
  grid.innerHTML = visibleProblems.map(renderProblemCard).join("");
}

function renderProblemCard(problem) {
  const topicBadges = problem.categories.map((topic) => `<span class="badge">${topic}</span>`).join("");

  return `
    <a class="card" href="problems/${problem.slug}.html" aria-label="Open ${problem.title} detail page">
      <article class="card-inner">
        <figure class="preview ${problem.accent}" aria-label="${problem.title} infographic preview">
          <img src="${problem.imagePath}" alt="${problem.title} coding pattern infographic" loading="lazy" />
        </figure>
        <div class="card-copy">
          <div class="card-heading">
            <h2>${problem.title}</h2>
          </div>
          <p class="card-spacer" aria-hidden="true">${problem.description}</p>
          <div class="badges">
            ${topicBadges}
            <span class="badge ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
          </div>
        </div>
      </article>
    </a>
  `;
}

filtersNode.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");

  if (!button) {
    return;
  }

  state.activeFilter = button.dataset.filter;
  renderFilters();
  renderProblems();
  setFilterMenuOpen(false);
});

filterTrigger.addEventListener("click", () => {
  setFilterMenuOpen(!filterShell.classList.contains("is-open"));
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProblems();
});

function setAboutDrawerOpen(isOpen) {
  aboutDrawer.classList.toggle("is-open", isOpen);
  aboutDrawer.setAttribute("aria-hidden", String(!isOpen));
  aboutTrigger.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("has-open-drawer", isOpen);

  if (isOpen) {
    aboutDrawer.querySelector(".about-drawer-close").focus();
  } else {
    aboutTrigger.focus();
  }
}

aboutTrigger.addEventListener("click", () => {
  setAboutDrawerOpen(true);
});

aboutDrawerCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAboutDrawerOpen(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && filterShell.classList.contains("is-open")) {
    setFilterMenuOpen(false);
    filterTrigger.focus();
    return;
  }

  if (event.key === "Escape" && aboutDrawer.classList.contains("is-open")) {
    setAboutDrawerOpen(false);
  }
});

document.addEventListener("click", (event) => {
  if (!filterShell.contains(event.target)) {
    setFilterMenuOpen(false);
  }
});

renderFilters();
renderProblems();
