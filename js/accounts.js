function initAccountsPage() {
  const panel = document.getElementById('accounts-panel');
  if (!panel) return;

  let activeRegion = 'North America';

  function render(region) {
    const accounts = VALORANT_ACCOUNTS[region] || [];

    panel.innerHTML = accounts.map((a, i) => `
      <article class="glass-card product-card scroll-reveal" style="--reveal-delay:${i * 0.05}s">
        <p class="product-region">${region}</p>
        <p class="product-amount text-lg">${a.name}</p>
        <p class="product-price">${formatPrice(a.price)}</p>
        <div class="flex gap-2 mt-auto pt-2">
          <a href="${a.link}" target="_blank" rel="noopener" class="btn-secondary flex-1 text-center py-2.5 text-sm">Preview</a>
          <button type="button" class="btn-primary flex-1 py-2.5 text-sm btn-buy"
            data-buy-type="account"
            data-buy-region="${region}"
            data-buy-name="${a.name}"
            data-buy-price="${a.price}">Buy</button>
        </div>
      </article>
    `).join('');

    panel.querySelectorAll('.btn-buy').forEach((btn) => btn.addEventListener('click', handleBuy));
    initScrollReveal(panel);
  }

  document.querySelectorAll('.region-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.region-tab').forEach((t) => t.classList.remove('region-tab-active'));
      tab.classList.add('region-tab-active');
      activeRegion = tab.dataset.region;
      render(activeRegion);
    });
  });

  render(activeRegion);
}

document.addEventListener('DOMContentLoaded', () => {
  initLayout('accounts');
  initAccountsPage();
});