const problem = problems.find((item) => item.slug === document.body.dataset.problem);
const detailPage = document.querySelector("#problemDetail");

if (problem && detailPage) {
  const topicBadges = problem.categories.map((topic) => `<span class="badge">${topic}</span>`).join("");
  const examples = problem.examples
    .map(
      (example, index) => `
        <article class="example-card">
          <h3>Example ${index + 1}</h3>
          <dl>
            <div>
              <dt>Input</dt>
              <dd><code>${example.input}</code></dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd><code>${example.output}</code></dd>
            </div>
            ${
              example.explanation
                ? `<div>
                    <dt>Explanation</dt>
                    <dd>${example.explanation}</dd>
                  </div>`
                : ""
            }
          </dl>
        </article>
      `,
    )
    .join("");
  document.title = `${problem.title} | Aesthetic LeetCode`;

  const visualizerLinks = {
    "valid-palindrome": "../tools/valid-palindrome-visualizer.html",
    "two-sum-ii": "../tools/two-sum-ii-visualizer.html",
    "reverse-string": "../tools/reverse-string-visualizer.html",
    "3sum": "../tools/3sum-visualizer.html",
  };
  const vizLink = visualizerLinks[problem.slug];
  const vizCta = vizLink
    ? `<a class="viz-cta" href="${vizLink}"><span class="viz-cta-icon" aria-hidden="true">▶</span> Open Interactive Visualizer</a>`
    : "";

  detailPage.innerHTML = `
    <div class="detail-actions">
      <a class="back-link" href="../index.html"><span aria-hidden="true">←</span> Back to Home</a>
      ${vizCta}
    </div>
    <section class="problem-page-card">
      <figure class="detail-media ${problem.accent}" aria-label="${problem.title} infographic">
        <img src="../${problem.imagePath}" alt="${problem.title} coding pattern infographic" />
      </figure>
      <div class="detail-copy">
        <h1>${problem.title}</h1>
        <p class="problem-summary">${problem.statement}</p>
        <div class="badges">
          ${topicBadges}
          <span class="badge ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
        </div>
        <section class="examples" aria-label="${problem.title} examples">
          ${examples}
        </section>
      </div>
    </section>
  `;
}
