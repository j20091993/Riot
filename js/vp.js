function renderVP() {
  const grid = document.getElementById('vp-grid');
  if (!grid) return;

  grid.innerHTML = VP_BUNDLES.map((b, i) => `
      <article class="glass-card product-card scroll-reveal" style="--reveal-delay:${i * 0.08}s">
        ${b.badge ? `<span class="product-badge">${b.badge}</span>` : ''}
        <p class="product-amount">${b.amount}</p>
        <p class="product-sub">Delivered via gift card to your email</p>
        <p class="product-price">${formatPrice(b.price)}</p>
        <button type="button" class="btn-primary w-full py-3 btn-buy"
          data-buy-type="vp"
          data-buy-key="${b.key}"
          data-buy-price="${b.price}"
          data-buy-label="${b.amount}">Buy Now</button>
      </article>
    `).join('');

  grid.querySelectorAll('.btn-buy').forEach((btn) => btn.addEventListener('click', handleBuy));
  initScrollReveal(grid);
}

document.addEventListener('DOMContentLoaded', () => {
  initLayout('vp');
  renderVP();
});