const conceptState = {
  activeFilter: "All",
  query: "",
};

const conceptGrid = document.querySelector("#conceptGrid");
const conceptFiltersNode = document.querySelector("#conceptFilters");
const conceptSearchInput = document.querySelector("#conceptSearchInput");
const conceptEmptyState = document.querySelector("#conceptEmptyState");

function renderConceptFilters() {
  conceptFiltersNode.innerHTML = conceptFilters
    .map(
      (filter) => `
        <button class="chip" type="button" data-concept-filter="${filter}" aria-pressed="${filter === conceptState.activeFilter}">
          ${filter}
        </button>
      `,
    )
    .join("");
}

function getVisibleConcepts() {
  const query = conceptState.query.trim().toLowerCase();

  return concepts.filter((concept) => {
    const matchesFilter = conceptState.activeFilter === "All" || concept.tags.includes(conceptState.activeFilter);
    const searchable = [concept.title, concept.summary, concept.focus, ...concept.tags].join(" ").toLowerCase();

    return matchesFilter && searchable.includes(query);
  });
}

function renderConcepts() {
  const visibleConcepts = getVisibleConcepts();
  conceptEmptyState.hidden = visibleConcepts.length > 0;
  conceptGrid.innerHTML = visibleConcepts.map(renderConceptCard).join("");
}

function renderConceptCard(concept) {
  const tagBadges = concept.tags.map((tag) => `<span class="badge">${tag}</span>`).join("");

  return `
    <a class="card concept-card" href="concepts/${concept.slug}.html" aria-label="Open ${concept.title} concept page">
      <article class="card-inner">
        <figure class="preview concept-preview ${concept.accent}" aria-label="${concept.title} concept preview">
          <img src="${concept.imagePath}" alt="${concept.title} concept infographic" loading="lazy" />
        </figure>
        <div class="card-copy">
          <div class="card-heading">
            <h2>${concept.title}</h2>
          </div>
          <p class="card-spacer" aria-hidden="true">${concept.summary}</p>
          <div class="badges">
            ${tagBadges}
            <span class="badge focus">${concept.focus}</span>
          </div>
        </div>
      </article>
    </a>
  `;
}

conceptFiltersNode.addEventListener("click", (event) => {
  const button = event.target.closest("[data-concept-filter]");

  if (!button) {
    return;
  }

  conceptState.activeFilter = button.dataset.conceptFilter;
  renderConceptFilters();
  renderConcepts();
});

conceptSearchInput.addEventListener("input", (event) => {
  conceptState.query = event.target.value;
  renderConcepts();
});

renderConceptFilters();
renderConcepts();
