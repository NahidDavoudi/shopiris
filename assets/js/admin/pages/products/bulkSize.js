let _bulkSizeCategories = [];
let _bulkSizeAttributeTypes = [];
let _sizeCategoryLoadPromise = null;
let _sizeAttributeLoadPromise = null;

function _sizeEscape(value) {
  const node = document.createElement('span');
  node.textContent = value ?? '';
  return node.innerHTML;
}

async function _loadSizeCategories() {
  if (!_sizeCategoryLoadPromise) {
    _sizeCategoryLoadPromise = window.API.categories.list().then((result) => {
      _bulkSizeCategories = Array.isArray(result) ? result : (result?.data || []);
      const select = document.getElementById('bulkSizeCategory');
      if (select) {
        select.innerHTML = '<option value="">انتخاب دسته‌بندی</option>' + _bulkSizeCategories
          .map((category) => `<option value="${Number(category.id)}">${_sizeEscape(category.name)}</option>`)
          .join('');
      }
      return _bulkSizeCategories;
    }).catch((error) => {
      _sizeCategoryLoadPromise = null;
      throw error;
    });
  }
  return _sizeCategoryLoadPromise;
}

async function _loadSizeAttributeTypes() {
  if (!_sizeAttributeLoadPromise) {
    _sizeAttributeLoadPromise = window.API.products.listAttributeTypes().then((result) => {
      const list = Array.isArray(result) ? result : (result?.data || []);
      _bulkSizeAttributeTypes = list.filter((type) => Number(type.is_variant_axis) === 1);
      const select = document.getElementById('bulkSizeAttributeType');
      if (select) {
        select.innerHTML = '<option value="">انتخاب ویژگی</option>' + _bulkSizeAttributeTypes
          .map((type) => `<option value="${Number(type.id)}">${_sizeEscape(type.name)}</option>`)
          .join('');
      }
      return _bulkSizeAttributeTypes;
    }).catch((error) => {
      _sizeAttributeLoadPromise = null;
      throw error;
    });
  }
  return _sizeAttributeLoadPromise;
}

function _selectedSizeType() {
  const typeId = Number(document.getElementById('bulkSizeAttributeType')?.value);
  return _bulkSizeAttributeTypes.find((type) => Number(type.id) === typeId) || null;
}

function _renderSizeValues() {
  const container = document.getElementById('bulkSizeValues');
  if (!container) return;
  const type = _selectedSizeType();
  const values = type?.values || [];
  if (!values.length) {
    container.innerHTML = '<span class="text-xs text-dim">مقداری تعریف نشده است.</span>';
    return;
  }
  container.innerHTML = values.map((value) => `
    <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm cursor-pointer hover:border-accent transition-colors">
      <input type="checkbox" class="bulk-size-value rounded" value="${Number(value.id)}">
      ${type.input_type === 'swatch' && value.swatch_hex
        ? `<span class="w-4 h-4 rounded-full border border-border" style="background:${value.swatch_hex}"></span>` : ''}
      <span>${_sizeEscape(value.value)}</span>
    </label>`).join('');
}

async function _updateSizeProductCount() {
  const categoryId = document.getElementById('bulkSizeCategory')?.value;
  const countLabel = document.getElementById('bulkSizeProductCount');
  if (!categoryId || !countLabel) {
    if (countLabel) countLabel.textContent = 'یک دسته‌بندی انتخاب کنید.';
    return;
  }
  countLabel.textContent = 'در حال دریافت تعداد محصولات...';
  try {
    const result = await window.API.products.adminList({ category_id: categoryId, limit: 1 });
    const total = Number(result?.total ?? result?.meta?.total ?? result?.data?.total ?? 0);
    countLabel.textContent = `${total.toLocaleString('fa-IR')} محصول در این دسته‌بندی سایزبندی می‌شود.`;
  } catch (error) {
    countLabel.textContent = 'تعداد محصولات قابل دریافت نیست؛ می‌توانید عملیات را ادامه دهید.';
  }
}

window.openBulkSizeModal = async function (categoryId = '') {
  try {
    await Promise.all([_loadSizeCategories(), _loadSizeAttributeTypes()]);
    const form = document.getElementById('bulkSizeForm');
    form?.reset();
    const categorySelect = document.getElementById('bulkSizeCategory');
    if (categorySelect) categorySelect.value = categoryId ? String(categoryId) : '';
    const typeSelect = document.getElementById('bulkSizeAttributeType');
    if (typeSelect) typeSelect.value = '';
    const overwrite = document.getElementById('bulkSizeOverwrite');
    if (overwrite) overwrite.checked = true;
    _renderSizeValues();
    const countLabel = document.getElementById('bulkSizeProductCount');
    if (countLabel) countLabel.textContent = categoryId ? 'در حال دریافت تعداد محصولات...' : 'یک دسته‌بندی انتخاب کنید.';
    window.showModal('bulkSizeModal');
    if (categoryId) await _updateSizeProductCount();
  } catch (error) {
    window.toast(error.message || 'دریافت اطلاعات سایزبندی ناموفق بود.', 'error');
  }
};

document.getElementById('bulkSizeAttributeType')?.addEventListener('change', _renderSizeValues);
document.getElementById('bulkSizeCategory')?.addEventListener('change', _updateSizeProductCount);

document.getElementById('bulkSizeForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const categoryId = Number(document.getElementById('bulkSizeCategory')?.value);
  const type = _selectedSizeType();
  const valueIds = Array.from(document.querySelectorAll('#bulkSizeValues .bulk-size-value:checked'))
    .map((input) => Number(input.value))
    .filter((id) => id > 0);
  const overwrite = !!document.getElementById('bulkSizeOverwrite')?.checked;
  const submit = document.getElementById('bulkSizeSubmit');

  if (!categoryId) {
    window.toast('دسته‌بندی معتبر انتخاب کنید.', 'error');
    return;
  }
  if (!type || !valueIds.length) {
    window.toast('ویژگی و حداقل یک مقدار سایز انتخاب کنید.', 'error');
    return;
  }

  const categoryName = _bulkSizeCategories.find((category) => Number(category.id) === categoryId)?.name || '';
  const countText = document.getElementById('bulkSizeProductCount')?.textContent || '';
  if (!window.confirm(`اعمال سایزبندی «${type.name}»\n${countText}\nدسته‌بندی: «${categoryName}»\nآیا ادامه می‌دهید؟`)) return;

  if (submit) submit.disabled = true;
  window.setLoading(true);
  try {
    const result = await window.API.products.bulkGenerateVariants(
      categoryId,
      [{ type_id: Number(type.id), value_ids: valueIds }],
      overwrite,
    );
    window.hideModal('bulkSizeModal');
    const updated = Number(result?.updated_products ?? 0).toLocaleString('fa-IR');
    const created = Number(result?.created_variants ?? 0).toLocaleString('fa-IR');
    const skipped = Number(result?.skipped_products ?? 0).toLocaleString('fa-IR');
    const failed = Number(result?.failed_products ?? 0).toLocaleString('fa-IR');
    window.toast(`${updated} محصول سایزبندی شد و ${created} واریانت ساخته شد. (رد‌شده: ${skipped}، ناموفق: ${failed})`);
    await window.loadProducts?.();
  } catch (error) {
    window.toast(error.message || 'سایزبندی گروهی ناموفق بود.', 'error');
  } finally {
    window.setLoading(false);
    if (submit) submit.disabled = false;
  }
});
