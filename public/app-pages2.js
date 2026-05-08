// ==================== PAYMENTS ====================
async function renderPayments() {
  const payments = await api('/api/payments');
  const statuses = await api('/api/status-payments');
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Payment Configuration</h2><p>Manage acceptable payment methods and track status indicators.</p></div>
      <button class="btn btn-primary" onclick="openPaymentModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> New Payment Method</button></div>
    <div class="payment-grid">
      <div class="table-card">
        <div class="table-header"><h3>Active Payment Methods</h3></div>
        <table><thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
        <tbody>${payments.length === 0 ? '<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No payment methods</td></tr>' :
          payments.map(r => `<tr>
            <td class="text-muted">${shortId(r.id_payment)}</td>
            <td class="font-medium flex items-center gap-2"><span class="material-symbols-outlined text-muted" style="font-size:18px">payments</span> ${r.name}</td>
            <td class="text-muted">${r.description || '-'}</td>
            <td>${formatDate(r.created_at)}</td>
            <td class="text-right">
              <button class="action-btn" onclick='openPaymentModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
              <button class="action-btn delete" onclick="deletePayment('${r.id_payment}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
            </td></tr>`).join('')}</tbody></table>
      </div>
      <div>
        <div class="chart-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3 style="margin:0">Status Definitions</h3>
          </div>
          <p class="text-muted mb-2" style="margin-bottom:24px">Standardized status indicators used across orders.</p>
          <div class="status-list">
            ${statuses.length === 0 ? '<p class="text-muted">No statuses defined</p>' :
              statuses.map(s => {
                const icons = { 'Paid': 'check_circle', 'Pending': 'pending', 'Failed': 'error', 'Refunded': 'replay' };
                const cls = { 'Paid': 'success', 'Pending': 'warning', 'Failed': 'error', 'Refunded': 'info' };
                return `<div class="status-item">
                  <span class="status-icon ${cls[s.name] || 'info'}"><span class="material-symbols-outlined" style="font-size:18px">${icons[s.name] || 'info'}</span></span>
                  <div><h4 class="font-medium">${s.name}</h4><p class="text-muted" style="font-size:12px;margin-top:2px">${s.description || ''}</p></div>
                </div>`;
              }).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function openPaymentModal(data = null) {
  const isEdit = !!data;
  openModal(isEdit ? 'Edit Payment Method' : 'New Payment Method', crudFormHtml([
    { name: 'name', label: 'Method Name', required: true, placeholder: 'e.g. Cash' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description...' }
  ], data || {}),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="savePayment('${isEdit ? data.id_payment : ''}')">${isEdit ? 'Save' : 'Create'}</button>`);
}

async function savePayment(id) {
  try {
    const body = { name: document.getElementById('field_name').value, description: document.getElementById('field_description').value };
    if (!body.name) return toast('Name is required', 'error');
    if (id) await api(`/api/payments/${id}`, { method: 'PUT', body });
    else await api('/api/payments', { method: 'POST', body });
    closeModal(); toast(id ? 'Updated!' : 'Created!'); renderPage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deletePayment(id) {
  if (!confirm('Delete this payment method?')) return;
  try { await api(`/api/payments/${id}`, { method: 'DELETE' }); toast('Deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}

// ==================== STATUS PAYMENTS ====================
async function renderStatusPayments() {
  const data = await api('/api/status-payments');
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Payment Status</h2><p>Define and manage payment status indicators.</p></div>
      <button class="btn btn-primary" onclick="openStatusPaymentModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Status</button></div>
    <div class="table-card">
      <div class="table-header"><h3>Status Definitions</h3></div>
      <table><thead><tr><th>ID</th><th>Status Name</th><th>Description</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length === 0 ? '<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No statuses</td></tr>' :
        data.map(r => `<tr>
          <td class="text-muted">${shortId(r.id_status_payment)}</td>
          <td class="text-primary font-medium">${r.name}</td>
          <td class="text-muted">${r.description || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right">
            <button class="action-btn" onclick='openStatusPaymentModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteStatusPayment('${r.id_status_payment}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openStatusPaymentModal(data = null) {
  const isEdit = !!data;
  openModal(isEdit ? 'Edit Status' : 'Add Status', crudFormHtml([
    { name: 'name', label: 'Status Name', required: true, placeholder: 'e.g. Paid' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description...' }
  ], data || {}),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveStatusPayment('${isEdit ? data.id_status_payment : ''}')">${isEdit ? 'Save' : 'Create'}</button>`);
}

async function saveStatusPayment(id) {
  try {
    const body = { name: document.getElementById('field_name').value, description: document.getElementById('field_description').value };
    if (!body.name) return toast('Name is required', 'error');
    if (id) await api(`/api/status-payments/${id}`, { method: 'PUT', body });
    else await api('/api/status-payments', { method: 'POST', body });
    closeModal(); toast(id ? 'Updated!' : 'Created!'); renderPage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteStatusPayment(id) {
  if (!confirm('Delete this status?')) return;
  try { await api(`/api/status-payments/${id}`, { method: 'DELETE' }); toast('Deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}

// ==================== PRODUCTS ====================
async function renderProducts() {
  const [data, variants, brands, categories] = await Promise.all([
    api('/api/products'), api('/api/variants'), api('/api/brands'), api('/api/categories')
  ]);
  cache.variants = variants; cache.brands = brands; cache.categories = categories;
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Products</h2><p>Manage product catalog, pricing and inventory.</p></div>
      <button class="btn btn-primary" onclick="openProductModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Product</button></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Total Products</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">inventory</span></div></div><div class="stat-value">${data.length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Total Value</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">account_balance_wallet</span></div></div><div class="stat-value">${formatRp(data.reduce((s,p) => s + (p.price||0) * (p.qty||0), 0))}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Low Stock</div><div class="stat-icon" style="background:rgba(186,26,26,0.1);color:var(--error)"><span class="material-symbols-outlined">warning</span></div></div><div class="stat-value">${data.filter(p => (p.qty||0) < 10).length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Brands</div><div class="stat-icon" style="background:rgba(164,65,0,0.1);color:var(--tertiary)"><span class="material-symbols-outlined">workspace_premium</span></div></div><div class="stat-value">${brands.length}</div></div>
    </div>
    <div class="table-card">
      <div class="table-header"><h3>Product Catalog</h3></div>
      <table><thead><tr><th>ID</th><th>Product Name</th><th>Variant</th><th>Brand</th><th class="text-right">Price</th><th class="text-right">Qty</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length === 0 ? '<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No products</td></tr>' :
        data.map(r => `<tr>
          <td class="text-muted">${shortId(r.id_product)}</td>
          <td class="text-primary font-medium">${r.name}</td>
          <td>${r.variant_name || '-'}</td>
          <td>${r.brand_name || '-'}</td>
          <td class="text-right">${formatRp(r.price)}</td>
          <td class="text-right ${(r.qty||0) < 10 ? 'text-error font-bold' : ''}">${r.qty || 0}</td>
          <td class="text-right">
            <button class="action-btn" onclick='openProductModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteProduct('${r.id_product}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openProductModal(data = null) {
  const isEdit = !!data;
  const v = cache.variants || []; const b = cache.brands || []; const c = cache.categories || [];
  const html = `
    <div class="form-group"><label>Product Name <span class="required">*</span></label><input type="text" id="field_name" value="${data?.name || ''}" placeholder="e.g. Indomie Goreng"/></div>
    <div class="form-row">
      <div class="form-group"><label>Price</label><input type="number" id="field_price" value="${data?.price || 0}"/></div>
      <div class="form-group"><label>Quantity</label><input type="number" id="field_qty" value="${data?.qty || 0}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Variant</label><select id="field_variant_id"><option value="">-- None --</option>${v.map(x => `<option value="${x.id_variant}" ${data?.variant_id===x.id_variant?'selected':''}>${x.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Brand</label><select id="field_brand_id"><option value="">-- None --</option>${b.map(x => `<option value="${x.id_brand}" ${data?.brand_id===x.id_brand?'selected':''}>${x.name}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label>Categories</label>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-top: 12px;">${c.map(x => {
        const checked = data?.category_ids?.includes(x.id_category) || (data?.category_names||'').includes(x.name);
        return `<label style="display:flex;align-items:center;gap:10px;font-size:14px;cursor:pointer;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;transition:all 0.2s ease;box-shadow:0 1px 2px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='#4f46e5';this.style.background='#f1f5f9';" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#f8fafc';">
          <input type="checkbox" class="cat-check" style="width:18px;height:18px;cursor:pointer;margin:0;accent-color:#4f46e5;" value="${x.id_category}" ${checked?'checked':''}/> 
          <span style="font-weight:500;color:#334155;line-height:1.2;">${x.name}</span>
        </label>`;
      }).join('')}</div>
    </div>`;
  openModal(isEdit ? 'Edit Product' : 'Add Product', html,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveProduct('${isEdit ? data.id_product : ''}')">${isEdit ? 'Save' : 'Create'}</button>`);
}

async function saveProduct(id) {
  try {
    const body = {
      name: document.getElementById('field_name').value,
      price: Number(document.getElementById('field_price').value),
      qty: Number(document.getElementById('field_qty').value),
      variant_id: document.getElementById('field_variant_id').value || null,
      brand_id: document.getElementById('field_brand_id').value || null,
      category_ids: [...document.querySelectorAll('.cat-check:checked')].map(c => c.value)
    };
    if (!body.name) return toast('Name is required', 'error');
    if (id) await api(`/api/products/${id}`, { method: 'PUT', body });
    else await api('/api/products', { method: 'POST', body });
    closeModal(); toast(id ? 'Updated!' : 'Created!'); renderPage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await api(`/api/products/${id}`, { method: 'DELETE' }); toast('Deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}
