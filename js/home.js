document.addEventListener('DOMContentLoaded', () => {
  initLayout('home');

  const heroStats = document.getElementById('hero-stats');
  if (heroStats) {
    heroStats.innerHTML = getStatsBar(true);
    initStatsCounters(heroStats);
    initScrollReveal(heroStats);
  }

  const processEl = document.getElementById('process-steps');
  if (processEl) {
    processEl.innerHTML = getProcessSteps();
    initScrollReveal(processEl);
  }

  const trustEl = document.getElementById('trust-signals');
  if (trustEl) {
    trustEl.innerHTML = getTrustSignals();
    initScrollReveal(trustEl);
  }

  const productsSection = document.getElementById('home-products');
  if (productsSection) {
    productsSection.innerHTML = getProductsGridHtml();
    initProductBuyButtons(productsSection);
    initScrollReveal(productsSection);
  }

  initScrollReveal(document.querySelector('main'));
});