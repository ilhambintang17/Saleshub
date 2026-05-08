// ==================== SALES PERSONS ====================
async function renderSalesPersons() {
  const data = await api('/api/sales-persons');
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Sales Persons</h2><p>Manage your sales team members.</p></div>
      <button class="btn btn-primary" onclick="openSalesPersonModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Sales Person</button></div>
    <div class="stats-grid stats-grid-3">
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Total Active</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">group</span></div></div><div class="stat-value">${data.length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">This Month</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">person_add</span></div></div><div class="stat-value">${data.filter(d => { const m = new Date(); return d.created_at && new Date(d.created_at).getMonth() === m.getMonth(); }).length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Avg. Performance</div><div class="stat-icon" style="background:rgba(164,65,0,0.1);color:var(--tertiary)"><span class="material-symbols-outlined">trending_up</span></div></div><div class="stat-value">—</div></div>
    </div>
    <div class="table-card">
      <div class="table-header"><h3>Sales Person List</h3></div>
      <table><thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length === 0 ? '<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No sales persons found</td></tr>' :
        data.map(r => `<tr>
          <td class="text-muted">${shortId(r.id_sales_person)}</td>
          <td class="text-primary font-medium">${r.name || '-'}</td>
          <td>${r.number_phone || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right">
            <button class="action-btn" onclick='openSalesPersonModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteSalesPerson('${r.id_sales_person}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openSalesPersonModal(data = null) {
  const isEdit = !!data;
  const fields = [
    { name: 'name', label: 'Full Name', required: true, placeholder: 'e.g. John Doe' },
    { name: 'number_phone', label: 'Phone Number', placeholder: 'e.g. +62 812-3456-7890' }
  ];
  openModal(isEdit ? 'Edit Sales Person' : 'Add Sales Person', crudFormHtml(fields, data || {}),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveSalesPerson('${isEdit ? data.id_sales_person : ''}')">${isEdit ? 'Save Changes' : 'Create'}</button>`);
}

async function saveSalesPerson(id) {
  try {
    const body = { name: document.getElementById('field_name').value, number_phone: document.getElementById('field_number_phone').value };
    if (!body.name) return toast('Name is required', 'error');
    if (id) await api(`/api/sales-persons/${id}`, { method: 'PUT', body });
    else await api('/api/sales-persons', { method: 'POST', body });
    closeModal(); toast(id ? 'Updated!' : 'Created!'); renderPage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteSalesPerson(id) {
  if (!confirm('Delete this sales person?')) return;
  try { await api(`/api/sales-persons/${id}`, { method: 'DELETE' }); toast('Deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}

// ==================== VARIANTS ====================
async function renderVariants() {
  const data = await api('/api/variants');
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Variants Management</h2><p>Manage product variants, sizes, and specific SKUs.</p></div>
      <button class="btn btn-primary" onclick="openVariantModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Variant</button></div>
    <div class="stats-grid stats-grid-3">
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Total Variants</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">layers</span></div></div><div class="stat-value">${data.length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Active Brands</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">workspace_premium</span></div></div><div class="stat-value">—</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Categories</div><div class="stat-icon" style="background:rgba(164,65,0,0.1);color:var(--tertiary)"><span class="material-symbols-outlined">category</span></div></div><div class="stat-value">—</div></div>
    </div>
    <div class="table-card">
      <div class="table-header"><h3>Variant Listing</h3></div>
      <table><thead><tr><th>ID</th><th>Variant Name</th><th>Description</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length === 0 ? '<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No variants found</td></tr>' :
        data.map(r => `<tr>
          <td class="text-muted">${shortId(r.id_variant)}</td>
          <td class="text-primary font-medium">${r.name || '-'}</td>
          <td class="text-muted">${r.description || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right">
            <button class="action-btn" onclick='openVariantModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteVariant('${r.id_variant}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openVariantModal(data = null) {
  const isEdit = !!data;
  const fields = [
    { name: 'name', label: 'Variant Name', required: true, placeholder: 'e.g. Extra Large' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description of this variant...' }
  ];
  openModal(isEdit ? 'Edit Variant' : 'Add Variant', crudFormHtml(fields, data || {}),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveVariant('${isEdit ? data.id_variant : ''}')">${isEdit ? 'Save Changes' : 'Save Variant'}</button>`);
}

async function saveVariant(id) {
  try {
    const body = { name: document.getElementById('field_name').value, description: document.getElementById('field_description').value };
    if (!body.name) return toast('Name is required', 'error');
    if (id) await api(`/api/variants/${id}`, { method: 'PUT', body });
    else await api('/api/variants', { method: 'POST', body });
    closeModal(); toast(id ? 'Updated!' : 'Created!'); renderPage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteVariant(id) {
  if (!confirm('Delete this variant?')) return;
  try { await api(`/api/variants/${id}`, { method: 'DELETE' }); toast('Deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}

// ==================== BRANDS ====================
async function renderBrands() {
  const data = await api('/api/brands');
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Brands Management</h2><p>Manage product brands and manufacturers.</p></div>
      <button class="btn btn-primary" onclick="openBrandModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Brand</button></div>
    <div class="table-card">
      <div class="table-header"><h3>Brand Listing</h3></div>
      <table><thead><tr><th>ID</th><th>Brand Name</th><th>Description</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length === 0 ? '<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No brands found</td></tr>' :
        data.map(r => `<tr>
          <td class="text-muted">${shortId(r.id_brand)}</td>
          <td class="text-primary font-medium">${r.name || '-'}</td>
          <td class="text-muted">${r.description || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right">
            <button class="action-btn" onclick='openBrandModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteBrand('${r.id_brand}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openBrandModal(data = null) {
  const isEdit = !!data;
  openModal(isEdit ? 'Edit Brand' : 'Add Brand', crudFormHtml([
    { name: 'name', label: 'Brand Name', required: true, placeholder: 'e.g. Indofood' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Brand description...' }
  ], data || {}),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveBrand('${isEdit ? data.id_brand : ''}')">${isEdit ? 'Save' : 'Create'}</button>`);
}

async function saveBrand(id) {
  try {
    const body = { name: document.getElementById('field_name').value, description: document.getElementById('field_description').value };
    if (!body.name) return toast('Name is required', 'error');
    if (id) await api(`/api/brands/${id}`, { method: 'PUT', body });
    else await api('/api/brands', { method: 'POST', body });
    closeModal(); toast(id ? 'Updated!' : 'Created!'); renderPage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteBrand(id) {
  if (!confirm('Delete this brand?')) return;
  try { await api(`/api/brands/${id}`, { method: 'DELETE' }); toast('Deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}

// ==================== CATEGORIES ====================
async function renderCategories() {
  const data = await api('/api/categories');
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Categories Management</h2><p>Organize products into categories.</p></div>
      <button class="btn btn-primary" onclick="openCategoryModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Category</button></div>
    <div class="table-card">
      <div class="table-header"><h3>Category Listing</h3></div>
      <table><thead><tr><th>ID</th><th>Category Name</th><th>Description</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length === 0 ? '<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No categories found</td></tr>' :
        data.map(r => `<tr>
          <td class="text-muted">${shortId(r.id_category)}</td>
          <td class="text-primary font-medium">${r.name || '-'}</td>
          <td class="text-muted">${r.description || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right">
            <button class="action-btn" onclick='openCategoryModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteCategory('${r.id_category}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openCategoryModal(data = null) {
  const isEdit = !!data;
  openModal(isEdit ? 'Edit Category' : 'Add Category', crudFormHtml([
    { name: 'name', label: 'Category Name', required: true, placeholder: 'e.g. Beverages' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Category description...' }
  ], data || {}),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveCategory('${isEdit ? data.id_category : ''}')">${isEdit ? 'Save' : 'Create'}</button>`);
}

async function saveCategory(id) {
  try {
    const body = { name: document.getElementById('field_name').value, description: document.getElementById('field_description').value };
    if (!body.name) return toast('Name is required', 'error');
    if (id) await api(`/api/categories/${id}`, { method: 'PUT', body });
    else await api('/api/categories', { method: 'POST', body });
    closeModal(); toast(id ? 'Updated!' : 'Created!'); renderPage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  try { await api(`/api/categories/${id}`, { method: 'DELETE' }); toast('Deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}
