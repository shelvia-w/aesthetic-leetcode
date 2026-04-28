const concept = concepts.find((item) => item.slug === document.body.dataset.concept);
const conceptDetailPage = document.querySelector("#conceptDetail");

if (concept && conceptDetailPage) {
  const tagBadges = concept.tags.map((tag) => `<span class="badge">${tag}</span>`).join("");
  const useSection = concept.sections.find((section) => section.items);
  const useCaseCards = useSection
    ? useSection.items
        .map(
          (item, index) => `
            <li class="concept-use-card accent-${(index % 3) + 1}">
              <strong>${item.title}</strong>
              <p>${item.description}</p>
              <div class="concept-problems" aria-label="Example problems">
                ${item.problems
                  .map((problem) =>
                    problem.slug
                      ? `<a class="problem-tag" href="../problems/${problem.slug}.html">${problem.title}</a>`
                      : `<span class="problem-tag">${problem.title}</span>`,
                  )
                  .join("")}
              </div>
            </li>
          `,
        )
        .join("")
    : "";
  const methodCards = concept.method
    .map(
      (item) => `
        <article class="method-card">
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `,
    )
    .join("");

  document.title = `${concept.title} | Learn Concepts`;

  conceptDetailPage.innerHTML = `
    <a class="back-link" href="../concepts.html"><span aria-hidden="true">&larr;</span> Back to Concepts</a>
    <section class="problem-page-card">
      <figure class="detail-media ${concept.accent}" aria-label="${concept.title} infographic">
        <img src="../${concept.imagePath}" alt="${concept.title} concept infographic" />
      </figure>
      <div class="detail-copy">
        <h1>${concept.title}</h1>
        <p class="problem-summary">${concept.statement}</p>
        <div class="badges">
          ${tagBadges}
          <span class="badge focus">${concept.focus}</span>
        </div>
        <section class="method-section" aria-label="${concept.title} method">
          <div class="section-heading-row">
            <h2>Method</h2>
          </div>
          <div class="method-list">
            ${methodCards}
          </div>
          ${
            useSection
              ? `<button class="use-popup-trigger" type="button" data-open-use-cases>
                  <span>${useSection.title}</span>
                </button>`
              : ""
          }
        </section>
      </div>
    </section>
    ${
      useSection
        ? `
          <div class="use-popup" id="usePopup" aria-hidden="true">
            <div class="use-popup-scrim" data-close-use-cases></div>
            <section class="use-popup-card" role="dialog" aria-modal="true" aria-labelledby="usePopupTitle">
              <div class="use-popup-heading">
                <div>
                  <p class="eyebrow">Two Pointers</p>
                  <h2 id="usePopupTitle">${useSection.title}</h2>
                </div>
                <button class="use-popup-close" type="button" aria-label="Close" data-close-use-cases>&times;</button>
              </div>
              <ul class="concept-use-list">
                ${useCaseCards}
              </ul>
            </section>
          </div>
        `
        : ""
    }
  `;

  const usePopup = document.querySelector("#usePopup");
  const openUseCases = document.querySelector("[data-open-use-cases]");
  const closeUseCases = document.querySelectorAll("[data-close-use-cases]");

  if (usePopup && openUseCases) {
    const setUsePopupOpen = (isOpen) => {
      usePopup.classList.toggle("is-open", isOpen);
      usePopup.setAttribute("aria-hidden", String(!isOpen));
      document.body.classList.toggle("has-open-popup", isOpen);
    };

    openUseCases.addEventListener("click", () => setUsePopupOpen(true));
    closeUseCases.forEach((button) => button.addEventListener("click", () => setUsePopupOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setUsePopupOpen(false);
      }
    });
  }
}
