document.addEventListener('DOMContentLoaded', () => {
  initLayout('products');

  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = getProductsGridHtml({ showBuyButtons: true });
  initProductBuyButtons(grid);
  initScrollReveal(grid);
});