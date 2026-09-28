/** Shared admin workflow for applying a price rule to a product category. */
let _bulkPriceCategories = [];
let _categoryLoadPromise = null;

function _escape(value) {
  const node = document.createElement('span');
  node.textContent = value ?? '';
  return node.innerHTML;
}

async function _loadCategories() {
  if (!_categoryLoadPromise) {
    _categoryLoadPromise = window.API.categories.list().then((result) => {
      _bulkPriceCategories = Array.isArray(result) ? result : (result?.data || []);
      const select = document.getElementById('bulkPriceCategory');
      if (select) {
        select.innerHTML = '<option value="">انتخاب دسته‌بندی</option>' + _bulkPriceCategories
          .map((category) => `<option value="${Number(category.id)}">${_escape(category.name)}</option>`)
          .join('');
      }
      return _bulkPriceCategories;
    }).catch((error) => {
      _categoryLoadPromise = null;
      throw error;
    });
  }
  return _categoryLoadPromise;
}

function _updateValueLabel() {
  const operation = document.getElementById('bulkPriceOperation')?.value;
  const isPercent = operation?.startsWith('percent_');
  const label = {
    percent_increase: 'درصد افزایش',
    percent_decrease: 'درصد کاهش',
    fixed_increase: 'مبلغ افزایش (تومان)',
    fixed_decrease: 'مبلغ کاهش (تومان)',
    set: 'قیمت جدید (تومان)',
  }[operation] || 'مقدار';
  const input = document.getElementById('bulkPriceValue');
  const labelNode = document.getElementById('bulkPriceValueLabel');
  if (labelNode) labelNode.textContent = label;
  if (input) {
    input.max = operation === 'percent_decrease' ? '100' : (isPercent ? '1000' : '');
    input.step = isPercent ? '0.01' : '1';
    input.placeholder = isPercent ? 'مثلاً ۱۰' : 'مثلاً ۵۰۰۰۰';
  }
}

window.openBulkPriceModal = async function (categoryId = '') {
  try {
    await _loadCategories();
    const form = document.getElementById('bulkPriceForm');
    form?.reset();
    const categorySelect = document.getElementById('bulkPriceCategory');
    if (categorySelect) categorySelect.value = categoryId ? String(categoryId) : '';
    const includeVariants = document.getElementById('bulkPriceIncludeVariants');
    if (includeVariants) includeVariants.checked = true;
    const countLabel = document.getElementById('bulkPriceProductCount');
    if (countLabel) countLabel.textContent = categoryId ? 'در حال دریافت تعداد محصولات...' : 'یک دسته‌بندی انتخاب کنید.';
    _updateValueLabel();
    window.showModal('bulkPriceModal');
    if (categoryId) await _updateProductCount();
  } catch (error) {
    window.toast(error.message || 'دریافت دسته‌بندی‌ها ناموفق بود.', 'error');
  }
};

async function _updateProductCount() {
  const categoryId = document.getElementById('bulkPriceCategory')?.value;
  const countLabel = document.getElementById('bulkPriceProductCount');
  if (!categoryId || !countLabel) {
    if (countLabel) countLabel.textContent = 'یک دسته‌بندی انتخاب کنید.';
    return;
  }
  countLabel.textContent = 'در حال دریافت تعداد محصولات...';
  try {
    const result = await window.API.products.adminList({ category_id: categoryId, limit: 1 });
    const total = Number(result?.total ?? result?.meta?.total ?? result?.data?.total ?? 0);
    countLabel.textContent = `${total.toLocaleString('fa-IR')} محصول در این دسته‌بندی به‌روزرسانی می‌شود.`;
  } catch (error) {
    countLabel.textContent = 'تعداد محصولات قابل دریافت نیست؛ می‌توانید عملیات را ادامه دهید.';
  }
}

document.getElementById('bulkPriceOperation')?.addEventListener('change', _updateValueLabel);
document.getElementById('bulkPriceCategory')?.addEventListener('change', _updateProductCount);

document.getElementById('bulkPriceForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const categoryId = Number(document.getElementById('bulkPriceCategory')?.value);
  const operation = document.getElementById('bulkPriceOperation')?.value;
  const valueInput = document.getElementById('bulkPriceValue');
  const value = Number(valueInput?.value);
  const field = document.getElementById('bulkPriceField')?.value;
  const submit = document.getElementById('bulkPriceSubmit');

  if (!categoryId || !Number.isFinite(value) || value < 0) {
    window.toast('دسته‌بندی و مقدار معتبر وارد کنید.', 'error');
    return;
  }
  if (operation !== 'set' && value <= 0) {
    window.toast('مقدار تغییر باید بیشتر از صفر باشد.', 'error');
    return;
  }
  const categoryName = _bulkPriceCategories.find((category) => Number(category.id) === categoryId)?.name || '';
  const countText = document.getElementById('bulkPriceProductCount')?.textContent || '';
  if (!window.confirm(`تغییر قیمت برای ${countText}\nدسته‌بندی: «${categoryName}»\nآیا ادامه می‌دهید؟`)) return;

  if (submit) submit.disabled = true;
  window.setLoading(true);
  try {
    const result = await window.API.products.bulkUpdatePrice({
      category_id: categoryId,
      operation,
      value,
      field,
      include_variants: !!document.getElementById('bulkPriceIncludeVariants')?.checked,
    });
    window.hideModal('bulkPriceModal');
    const updatedProducts = Number(result?.updated_products ?? 0).toLocaleString('fa-IR');
    const updatedVariants = Number(result?.updated_variants ?? 0).toLocaleString('fa-IR');
    window.toast(`${updatedProducts} محصول و ${updatedVariants} واریانت بروزرسانی شد.`);
    await window.loadProducts?.();
  } catch (error) {
    window.toast(error.message || 'بروزرسانی قیمت‌ها ناموفق بود.', 'error');
  } finally {
    window.setLoading(false);
    if (submit) submit.disabled = false;
  }
});
