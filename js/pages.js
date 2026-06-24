document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  initLayout(page);

  if (page === 'faq') {
    renderFAQList(document.getElementById('faq-list'));
    const cta = document.getElementById('page-cta');
    if (cta) {
      cta.innerHTML = getPageCta(['reach'], 'Having more questions? Reach us.');
      initScrollReveal(cta);
    }
  }

  if (page === 'reviews') {
    const grid = document.getElementById('reviews-grid');
    if (grid) {
      grid.innerHTML = getStarDefs() + REVIEWS.map(renderReviewCard).join('');
      initScrollReveal(grid);
    }
    const cta = document.getElementById('page-cta');
    if (cta) {
      cta.innerHTML = getPageCta(['products']);
      initScrollReveal(cta);
    }
  }
});