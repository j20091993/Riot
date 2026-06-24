function injectFaqSchema() {
  if (document.getElementById('faq-schema')) return;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  const script = document.createElement('script');
  script.id = 'faq-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  initLayout(page);

  if (page === 'faq') {
    renderFAQList(document.getElementById('faq-list'));
    injectFaqSchema();
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