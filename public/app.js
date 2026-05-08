// ==================== CORE ====================
const API = '';
let currentPage = 'dashboard';
let cache = {};

async function api(url, opts = {}) {
  const o = { headers: { 'Content-Type': 'application/json' }, ...opts };
  if (o.body && typeof o.body === 'object') o.body = JSON.stringify(o.body);
  const r = await fetch(API + url, o);
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
  return r.json();
}

function toast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function openModal(title, bodyHtml, footerHtml) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalFooter').innerHTML = footerHtml;
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function confirmDialog({ title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Delete', type = 'danger', icon = 'warning' } = {}) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmOverlay');
    const iconEl = document.getElementById('confirmIcon');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = confirmText;
    iconEl.className = 'confirm-icon ' + type;
    iconEl.querySelector('.material-symbols-outlined').textContent = icon;

    // Style the confirm button based on type
    okBtn.className = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

    overlay.classList.add('active');

    function cleanup(result) {
      overlay.classList.remove('active');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onOverlay(e) { if (e.target === overlay) cleanup(false); }
    function onKey(e) { if (e.key === 'Escape') cleanup(false); else if (e.key === 'Enter') cleanup(true); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
    document.addEventListener('keydown', onKey);
  });
}

function formatRp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
function formatDate(d) {
  if (!d) return '-';
  // Handle both "2026-05-07" and "2026-05-07T00:00:00.000Z" formats
  // Append T00:00:00 for plain dates to parse as local timezone
  const dateStr = String(d);
  const dt = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function shortId(id) { return id ? id.substring(0, 8).toUpperCase() : '-'; }

async function generateReport() {
  toast('Generating report...', 'success');
  try {
    const data = await api('/api/orders');
    if (!data || data.length === 0) return toast('No data to report', 'warning');
    
    let csv = 'Order ID,Date,Outlet,Total,Payment,Status\n';
    data.forEach(o => {
      const date = o.date ? new Date(o.date).toISOString().split('T')[0] : '';
      const outlet = (o.name_outlet || '').replace(/"/g, '""');
      const payment = (o.payment_name || '').replace(/"/g, '""');
      const status = (o.status_name || '').replace(/"/g, '""');
      csv += `"${o.id_order}","${date}","${outlet}",${o.total},"${payment}","${status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `saleshub_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast('Report downloaded!', 'success');
  } catch (err) {
    toast('Failed to generate report: ' + err.message, 'error');
  }
}

// ==================== NAVIGATION ====================
const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'sales-persons', icon: 'group', label: 'Sales Persons' },
  { id: 'outlets', icon: 'storefront', label: 'Outlets' },
  { id: 'outlet-stocks', icon: 'inventory_2', label: 'Outlet Stocks' },
  { id: 'products', icon: 'inventory', label: 'Products' },
  { id: 'variants', icon: 'layers', label: 'Variants' },
  { id: 'brands', icon: 'workspace_premium', label: 'Brands' },
  { id: 'categories', icon: 'category', label: 'Categories' },
  { id: 'payments', icon: 'payments', label: 'Payment Methods' },
  { id: 'status-payments', icon: 'fact_check', label: 'Payment Status' },
  { id: 'orders', icon: 'shopping_cart', label: 'Orders' },
];

function renderNav() {
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = NAV_ITEMS.map(n =>
    `<a data-page="${n.id}" class="${currentPage === n.id ? 'active' : ''}" onclick="navigate('${n.id}')">
      <span class="material-symbols-outlined">${n.icon}</span> ${n.label}
    </a>`
  ).join('');
}

function navigate(page) {
  currentPage = page;
  renderNav();
  renderPage();
}

async function renderPage() {
  const pc = document.getElementById('pageContent');
  pc.innerHTML = '<div class="loading"><div class="spinner"></div> Loading...</div>';
  try {
    switch (currentPage) {
      case 'dashboard': await renderDashboard(); break;
      case 'sales-persons': await renderSalesPersons(); break;
      case 'outlets': await renderOutlets(); break;
      case 'outlet-stocks': await renderOutletStocks(); break;
      case 'products': await renderProducts(); break;
      case 'variants': await renderVariants(); break;
      case 'brands': await renderBrands(); break;
      case 'categories': await renderCategories(); break;
      case 'payments': await renderPayments(); break;
      case 'status-payments': await renderStatusPayments(); break;
      case 'orders': await renderOrders(); break;
      default: pc.innerHTML = '<p>Page not found</p>';
    }
  } catch (err) {
    pc.innerHTML = `<div style="padding:40px;text-align:center;color:var(--error)">
      <span class="material-symbols-outlined" style="font-size:48px">error</span>
      <p style="margin-top:16px">${err.message}</p>
      <button class="btn btn-primary" style="margin-top:16px" onclick="renderPage()">Retry</button>
    </div>`;
  }
}
// ==================== DASHBOARD ====================
async function renderDashboard() {
  const data = await api('/api/dashboard');
  const pc = document.getElementById('pageContent');
  const maxRev = Math.max(...(data.revenueTrend || []).map(d => d.revenue), 1);
  pc.innerHTML = `
    <div class="page-header"><div><h2>Dashboard Overview</h2><p>Welcome back, here's your performance summary for today.</p></div></div>
    <div class="stats-grid">
      <div class="stat-card stat-card-primary"><div class="stat-top"><div><div class="stat-label">Today's Revenue</div><div class="stat-value">${formatRp(data.revenueToday)}</div><div class="stat-subtitle" style="color:rgba(255,255,255,0.8)"><span class="material-symbols-outlined">trending_up</span> from all outlets</div></div>
        <div class="stat-icon"><span class="material-symbols-outlined">account_balance_wallet</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-label">Orders Today</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">receipt_long</span></div></div>
        <div class="stat-value">${data.ordersToday}</div><div class="stat-subtitle"><span class="material-symbols-outlined">schedule</span> updated just now</div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-label">Total Products</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">inventory_2</span></div></div>
        <div class="stat-value">${data.totalProducts}</div><div class="stat-subtitle"><span class="material-symbols-outlined">check_circle</span> in stock</div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-label">Total Outlets</div><div class="stat-icon" style="background:rgba(164,65,0,0.1);color:var(--tertiary)"><span class="material-symbols-outlined">storefront</span></div></div>
        <div class="stat-value">${data.totalOutlets}</div><div class="stat-subtitle"><span class="material-symbols-outlined">verified</span> active outlets</div>
      </div>
    </div>
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Revenue (Last 7 Days)</h3>
        <div class="bar-chart">${(data.revenueTrend || []).map(d => {
          const pct = Math.max((d.revenue / maxRev) * 100, 5);
          const dayStr = String(d.day);
          const dayDate = dayStr.includes('T') ? new Date(dayStr) : new Date(dayStr + 'T00:00:00');
          const day = dayDate.toLocaleDateString('id-ID', { weekday: 'short' });
          return `<div class="bar-col"><div class="bar" style="height:${pct}%;background:var(--primary-container)"></div><span class="bar-label">${day}</span></div>`;
        }).join('')}
        ${(data.revenueTrend || []).length === 0 ? '<div style="text-align:center;width:100%;color:var(--on-surface-variant)">No data yet</div>' : ''}
        </div>
      </div>
      <div class="chart-card">
        <h3>Top Products</h3>
        ${(data.topProducts || []).length === 0 ? '<p class="text-muted">No data yet</p>' :
          (data.topProducts || []).map((p, i) => {
            const maxQ = data.topProducts[0].total_qty || 1;
            const colors = ['var(--primary-container)','var(--secondary)','var(--tertiary)','var(--primary)','var(--outline)'];
            return `<div class="progress-item"><div class="progress-top"><span>${p.name}</span><span class="qty">${p.total_qty}</span></div>
            <div class="progress-bar"><div class="fill" style="width:${(p.total_qty/maxQ)*100}%;background:${colors[i%5]}"></div></div></div>`;
          }).join('')}
      </div>
    </div>
    <div class="table-card">
      <div class="table-header"><h3>Recent Orders</h3></div>
      <table><thead><tr><th>Order ID</th><th>Outlet</th><th>Date</th><th>Payment</th><th>Status</th><th class="text-right">Total</th></tr></thead>
      <tbody>${(data.recentOrders || []).length === 0 ? '<tr><td colspan="6" class="text-center text-muted" style="padding:24px">No orders yet</td></tr>' :
        (data.recentOrders || []).map(o => `<tr>
          <td class="text-primary font-medium">${shortId(o.id_order)}</td>
          <td>${o.name_outlet || '-'}</td>
          <td>${formatDate(o.date)}</td>
          <td>${o.payment_name || '-'}</td>
          <td><span class="badge ${o.status_name === 'Paid' ? 'badge-success' : o.status_name === 'Failed' ? 'badge-error' : 'badge-warning'}">${o.status_name || '-'}</span></td>
          <td class="text-right font-medium">${formatRp(o.total)}</td>
        </tr>`).join('')}</tbody></table>
    </div>`;
}

// ==================== GENERIC CRUD PAGE ====================
function crudFormHtml(fields, data = {}) {
  return fields.map(f => {
    if (f.type === 'select') {
      return `<div class="form-group"><label>${f.label} ${f.required ? '<span class="required">*</span>' : ''}</label>
        <select id="field_${f.name}">${f.options.map(o => `<option value="${o.value}" ${data[f.name] == o.value ? 'selected' : ''}>${o.label}</option>`).join('')}</select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="form-group"><label>${f.label}</label>
        <textarea id="field_${f.name}" rows="3" placeholder="${f.placeholder || ''}">${data[f.name] || ''}</textarea></div>`;
    }
    if (f.type === 'number') {
      return `<div class="form-group"><label>${f.label} ${f.required ? '<span class="required">*</span>' : ''}</label>
        <input type="number" id="field_${f.name}" value="${data[f.name] || 0}" placeholder="${f.placeholder || '0'}"/></div>`;
    }
    return `<div class="form-group"><label>${f.label} ${f.required ? '<span class="required">*</span>' : ''}</label>
      <input type="${f.type || 'text'}" id="field_${f.name}" value="${data[f.name] || ''}" placeholder="${f.placeholder || ''}"/></div>`;
  }).join('');
}

function getFormData(fields) {
  const d = {};
  fields.forEach(f => {
    const el = document.getElementById('field_' + f.name);
    if (!el) return;
    d[f.name] = f.type === 'number' ? Number(el.value) : el.value;
  });
  return d;
}
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
          <td><div class="row-info"><div class="row-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">person</span></div><div class="row-info-text"><span class="row-name">${r.name || '-'}</span><span class="row-sub">${r.number_phone || '-'}</span></div></div></td>
          <td>${r.number_phone || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn" onclick='openSalesPersonModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteSalesPerson('${r.id_sales_person}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`).join('')}</tbody></table>
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
  const ok = await confirmDialog({ title: 'Delete Sales Person?', message: 'This sales person record will be permanently removed.', icon: 'person_remove' });
  if (!ok) return;
  try { await api(`/api/sales-persons/${id}`, { method: 'DELETE' }); toast('Sales person deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
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
          <td><div class="row-info"><div class="row-icon" style="background:rgba(79,70,229,0.08);color:var(--primary)"><span class="material-symbols-outlined">layers</span></div><span class="row-name">${r.name || '-'}</span></div></td>
          <td class="text-muted">${r.description || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn" onclick='openVariantModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteVariant('${r.id_variant}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`).join('')}</tbody></table>
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
  const ok = await confirmDialog({ title: 'Delete Variant?', message: 'This variant will be permanently removed from the system.', icon: 'layers_clear' });
  if (!ok) return;
  try { await api(`/api/variants/${id}`, { method: 'DELETE' }); toast('Variant deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
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
      <tbody>${data.length===0?'<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No brands found</td></tr>':
        data.map(r=>`<tr>
          <td class="text-muted">${shortId(r.id_brand)}</td>
          <td><div class="row-info"><div class="row-icon" style="background:rgba(0,108,73,0.08);color:var(--secondary)"><span class="material-symbols-outlined">workspace_premium</span></div><span class="row-name">${r.name||'-'}</span></div></td>
          <td class="text-muted">${r.description||'-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn" onclick='openBrandModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteBrand('${r.id_brand}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`).join('')}</tbody></table>
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
  const ok = await confirmDialog({ title: 'Delete Brand?', message: 'This brand will be permanently removed from the system.', icon: 'delete_forever' });
  if (!ok) return;
  try { await api(`/api/brands/${id}`, { method: 'DELETE' }); toast('Brand deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
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
      <tbody>${data.length===0?'<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No categories</td></tr>':
        data.map(r=>`<tr>
          <td class="text-muted">${shortId(r.id_category)}</td>
          <td><div class="row-info"><div class="row-icon" style="background:rgba(164,65,0,0.08);color:var(--tertiary)"><span class="material-symbols-outlined">category</span></div><span class="row-name">${r.name||'-'}</span></div></td>
          <td class="text-muted">${r.description||'-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn" onclick='openCategoryModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteCategory('${r.id_category}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`).join('')}</tbody></table>
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
  const ok = await confirmDialog({ title: 'Delete Category?', message: 'This category will be permanently removed from the system.', icon: 'category' });
  if (!ok) return;
  try { await api(`/api/categories/${id}`, { method: 'DELETE' }); toast('Category deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}
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
            <td><div class="row-info"><div class="row-icon" style="background:rgba(79,70,229,0.08);color:var(--primary)"><span class="material-symbols-outlined">payments</span></div><span class="row-name">${r.name}</span></div></td>
            <td class="text-muted">${r.description || '-'}</td>
            <td>${formatDate(r.created_at)}</td>
            <td class="text-right"><div class="actions-cell">
              <button class="action-btn" onclick='openPaymentModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
              <button class="action-btn delete" onclick="deletePayment('${r.id_payment}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
            </div></td></tr>`).join('')}</tbody></table>
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
  const ok = await confirmDialog({ title: 'Delete Payment Method?', message: 'This payment method will be permanently removed.', icon: 'credit_card_off' });
  if (!ok) return;
  try { await api(`/api/payments/${id}`, { method: 'DELETE' }); toast('Payment method deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
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
        data.map(r => {
          const icons = { 'Paid': 'check_circle', 'Pending': 'pending', 'Failed': 'error', 'Refunded': 'replay' };
          const colors = { 'Paid': 'rgba(0,108,73,0.08)', 'Pending': 'rgba(164,65,0,0.08)', 'Failed': 'rgba(186,26,26,0.08)', 'Refunded': 'rgba(59,130,246,0.08)' };
          const textColors = { 'Paid': 'var(--secondary)', 'Pending': 'var(--tertiary)', 'Failed': 'var(--error)', 'Refunded': '#1D4ED8' };
          return `<tr>
          <td class="text-muted">${shortId(r.id_status_payment)}</td>
          <td><div class="row-info"><div class="row-icon" style="background:${colors[r.name]||'rgba(79,70,229,0.08)'};color:${textColors[r.name]||'var(--primary)'}"><span class="material-symbols-outlined">${icons[r.name]||'info'}</span></div><span class="row-name">${r.name}</span></div></td>
          <td class="text-muted">${r.description || '-'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn" onclick='openStatusPaymentModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteStatusPayment('${r.id_status_payment}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`}).join('')}</tbody></table>
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
  const ok = await confirmDialog({ title: 'Delete Payment Status?', message: 'This payment status will be permanently removed.', icon: 'rule' });
  if (!ok) return;
  try { await api(`/api/status-payments/${id}`, { method: 'DELETE' }); toast('Payment status deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
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
      <table><thead><tr><th>Product Name</th><th>Brand</th><th>Variant</th><th class="text-right">Price (Rp)</th><th class="text-right">Qty</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length === 0 ? '<tr><td colspan="6" class="text-center text-muted" style="padding:24px">No products</td></tr>' :
        data.map(r => `<tr>
          <td><div class="row-info"><div class="row-icon" style="background:rgba(79,70,229,0.08);color:var(--primary)"><span class="material-symbols-outlined">inventory_2</span></div><div class="row-info-text"><span class="row-name">${r.name}</span><span class="row-sub">ID: ${shortId(r.id_product)}</span></div></div></td>
          <td>${r.brand_name || '-'}</td>
          <td><span class="badge badge-neutral">${r.variant_name || '-'}</span></td>
          <td class="text-right font-medium">${formatRp(r.price)}</td>
          <td class="text-right"><span class="badge ${(r.qty||0) < 10 ? 'badge-error' : (r.qty||0) < 50 ? 'badge-warning' : 'badge-success'}">${r.qty || 0}</span></td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn" onclick='openProductModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteProduct('${r.id_product}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`).join('')}</tbody></table>
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
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">${c.map(x => {
        const checked = data?.category_ids?.includes(x.id_category) || (data?.category_names||'').includes(x.name);
        return `<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="checkbox" class="cat-check" value="${x.id_category}" ${checked?'checked':''}/> ${x.name}</label>`;
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
  const ok = await confirmDialog({ title: 'Delete Product?', message: 'This product and its related data will be permanently removed.', icon: 'inventory_2' });
  if (!ok) return;
  try { await api(`/api/products/${id}`, { method: 'DELETE' }); toast('Product deleted!'); renderPage(); } catch (e) { toast(e.message, 'error'); }
}
// ==================== OUTLETS ====================
async function renderOutlets() {
  const [data, sp] = await Promise.all([api('/api/outlets'), api('/api/sales-persons')]);
  cache.salesPersons = sp;
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Outlets</h2><p>Manage retail outlets and store locations.</p></div>
      <button class="btn btn-primary" onclick="openOutletModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Outlet</button></div>
    <div class="stats-grid stats-grid-3">
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Total Outlets</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">storefront</span></div></div><div class="stat-value">${data.length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">With Sales Person</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">person</span></div></div><div class="stat-value">${data.filter(d=>d.sales_person_id).length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Locations</div><div class="stat-icon" style="background:rgba(164,65,0,0.1);color:var(--tertiary)"><span class="material-symbols-outlined">location_on</span></div></div><div class="stat-value">${new Set(data.map(d=>(d.location||'').split(',')[0])).size}</div></div>
    </div>
    <div class="table-card">
      <div class="table-header"><h3>Outlet Directory</h3></div>
      <table><thead><tr><th>Outlet Name</th><th>Owner</th><th>Location</th><th>Phone</th><th>Sales Person</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length===0?'<tr><td colspan="6" class="text-center text-muted" style="padding:24px">No outlets</td></tr>':
        data.map(r=>`<tr>
          <td><div class="row-info"><div class="row-icon" style="background:rgba(164,65,0,0.08);color:var(--tertiary)"><span class="material-symbols-outlined">storefront</span></div><div class="row-info-text"><span class="row-name"><a style="cursor:pointer;text-decoration:none;color:inherit" onclick="viewOutletDetail('${r.id_outlet}')">${r.name_outlet||'-'}</a></span><span class="row-sub">ID: ${shortId(r.id_outlet)}</span></div></div></td>
          <td>${r.name_owner||'-'}</td>
          <td class="text-muted">${r.location||'-'}</td>
          <td>${r.number_phone||'-'}</td>
          <td>${r.sales_person_name ? `<div class="row-info"><div class="row-icon" style="background:rgba(0,108,73,0.08);color:var(--secondary);width:28px;height:28px;border-radius:50%"><span class="material-symbols-outlined" style="font-size:14px">person</span></div><span style="font-size:13px">${r.sales_person_name}</span></div>` : '<span class="text-muted">—</span>'}</td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn view" onclick="viewOutletDetail('${r.id_outlet}')"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button>
            <button class="action-btn" onclick='openOutletModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteOutlet('${r.id_outlet}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openOutletModal(data=null) {
  const isEdit=!!data; const sp=cache.salesPersons||[];
  const html=`
    <div class="form-group"><label>Outlet Name <span class="required">*</span></label><input type="text" id="field_name_outlet" value="${data?.name_outlet||''}" placeholder="e.g. Toko Maju Jaya"/></div>
    <div class="form-row">
      <div class="form-group"><label>Owner Name</label><input type="text" id="field_name_owner" value="${data?.name_owner||''}" placeholder="Owner name"/></div>
      <div class="form-group"><label>Phone</label><input type="text" id="field_number_phone" value="${data?.number_phone||''}" placeholder="+62..."/></div>
    </div>
    <div class="form-group"><label>Location</label><input type="text" id="field_location" value="${data?.location||''}" placeholder="Full address"/></div>
    <div class="form-group"><label>Sales Person</label><select id="field_sales_person_id"><option value="">-- None --</option>${sp.map(s=>`<option value="${s.id_sales_person}" ${data?.sales_person_id===s.id_sales_person?'selected':''}>${s.name}</option>`).join('')}</select></div>`;
  openModal(isEdit?'Edit Outlet':'Add Outlet',html,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveOutlet('${isEdit?data.id_outlet:''}')">${isEdit?'Save':'Create'}</button>`);
}

async function saveOutlet(id) {
  try {
    const body={name_outlet:document.getElementById('field_name_outlet').value,name_owner:document.getElementById('field_name_owner').value,
      location:document.getElementById('field_location').value,number_phone:document.getElementById('field_number_phone').value,
      sales_person_id:document.getElementById('field_sales_person_id').value||null};
    if(!body.name_outlet) return toast('Outlet name required','error');
    if(id) await api(`/api/outlets/${id}`,{method:'PUT',body}); else await api('/api/outlets',{method:'POST',body});
    closeModal(); toast(id?'Updated!':'Created!'); renderPage();
  } catch(e){toast(e.message,'error');}
}

async function deleteOutlet(id) {
  const ok = await confirmDialog({ title: 'Delete Outlet?', message: 'This outlet and all associated data will be permanently removed.', icon: 'storefront' });
  if (!ok) return;
  try { await api(`/api/outlets/${id}`,{method:'DELETE'}); toast('Outlet deleted!'); renderPage(); } catch(e) { toast(e.message,'error'); }
}

// Outlet Detail View
async function viewOutletDetail(outletId) {
  const [outlet,stocks,products] = await Promise.all([
    api(`/api/outlets/${outletId}`), api(`/api/outlet-stocks?outlet_id=${outletId}`), api('/api/products')
  ]);
  cache.products = products; cache.currentOutletId = outletId;
  const totalItems = stocks.reduce((s,st)=>s+(st.retail_qty||0),0);
  const totalValue = stocks.reduce((s,st)=>s+(st.retail_qty||0)*(st.retail_price||0),0);
  const lowStock = stocks.filter(s=>(s.retail_qty||0)<10);
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="breadcrumb"><a onclick="navigate('outlets')">Outlets</a><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span><span class="font-medium">${outlet.name_outlet}</span></div>
    <div class="page-header"><div>
      <h2 style="font-size:30px;font-weight:700;letter-spacing:-0.02em">${outlet.name_outlet}</h2>
      <div class="outlet-meta">
        <span><span class="material-symbols-outlined" style="font-size:18px">location_on</span> ${outlet.location||'-'}</span>
        <span><span class="material-symbols-outlined" style="font-size:18px">person</span> ${outlet.name_owner||'-'}</span>
        <span><span class="material-symbols-outlined" style="font-size:18px">phone</span> ${outlet.number_phone||'-'}</span>
      </div></div>
      <button class="btn btn-secondary" onclick='openOutletModal(${JSON.stringify(outlet).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span> Edit Info</button>
    </div>
    <div class="stats-grid stats-grid-3">
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Total Items</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">inventory_2</span></div></div><div class="stat-value">${totalItems}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Low Stock</div><div class="stat-icon" style="background:rgba(186,26,26,0.1);color:var(--error)"><span class="material-symbols-outlined">warning</span></div></div><div class="stat-value text-error">${lowStock.length} items</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Est. Stock Value</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">account_balance_wallet</span></div></div><div class="stat-value">${formatRp(totalValue)}</div></div>
    </div>
    <div class="table-card">
      <div class="table-header"><h3>Outlet Stock</h3>
        <button class="btn btn-primary" onclick="openOutletStockModal('${outletId}')"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Stock</button></div>
      <table><thead><tr><th>Product</th><th>Variant</th><th class="text-right">Retail Qty</th><th class="text-right">Retail Price</th><th class="text-center">Actions</th></tr></thead>
      <tbody>${stocks.length===0?'<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No stock records</td></tr>':
        stocks.map(s=>`<tr ${(s.retail_qty||0)<10?'style="background:rgba(255,218,214,0.15)"':''}>
          <td class="font-medium">${s.product_name||'-'}</td>
          <td class="text-muted">${s.variant_name||'-'}</td>
          <td class="text-right ${(s.retail_qty||0)<10?'text-error font-bold':''}">${(s.retail_qty||0)<10?'<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">warning</span> ':''}${s.retail_qty||0}</td>
          <td class="text-right">${formatRp(s.retail_price)}</td>
          <td class="text-center">
            <button class="action-btn" onclick='openEditStockModal(${JSON.stringify(s).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteOutletStock('${s.id_outlet_stock}','${outletId}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

// ==================== OUTLET STOCKS (list view) ====================
async function renderOutletStocks() {
  const [stocks,outlets,products] = await Promise.all([api('/api/outlet-stocks'),api('/api/outlets'),api('/api/products')]);
  cache.outlets=outlets; cache.products=products;
  const pc = document.getElementById('pageContent');
  pc.innerHTML = `
    <div class="page-header"><div><h2>Outlet Stocks</h2><p>Manage inventory across all outlets.</p></div>
      <button class="btn btn-primary" onclick="openOutletStockModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Stock</button></div>
    <div class="table-card">
      <div class="table-header"><h3>All Stock Records</h3></div>
      <table><thead><tr><th>Outlet</th><th>Product</th><th>Variant</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${stocks.length===0?'<tr><td colspan="6" class="text-center text-muted" style="padding:24px">No stocks</td></tr>':
        stocks.map(s=>`<tr>
          <td class="font-medium">${s.name_outlet||'-'}</td>
          <td class="text-primary">${s.product_name||'-'}</td>
          <td class="text-muted">${s.variant_name||'-'}</td>
          <td class="text-right ${(s.retail_qty||0)<10?'text-error font-bold':''}">${s.retail_qty||0}</td>
          <td class="text-right">${formatRp(s.retail_price)}</td>
          <td class="text-right">
            <button class="action-btn" onclick='openEditStockModal(${JSON.stringify(s).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteOutletStock('${s.id_outlet_stock}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
    </div>`;
}

function openOutletStockModal(outletId) {
  const outlets=cache.outlets||[]; const products=cache.products||[];
  const html=`
    <div class="form-group"><label>Outlet <span class="required">*</span></label><select id="field_outlet_id">
      <option value="">Select outlet...</option>${outlets.map(o=>`<option value="${o.id_outlet}" ${outletId===o.id_outlet?'selected':''}>${o.name_outlet}</option>`).join('')}</select></div>
    <div class="form-group"><label>Product <span class="required">*</span></label><select id="field_product_id">
      <option value="">Select product...</option>${products.map(p=>`<option value="${p.id_product}">${p.name}</option>`).join('')}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Retail Qty</label><input type="number" id="field_retail_qty" value="0"/></div>
      <div class="form-group"><label>Retail Price (Rp)</label><input type="number" id="field_retail_price" value="0"/></div>
    </div>`;
  openModal('Add Stock',html,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveOutletStock()">Save Stock</button>`);
}

function openEditStockModal(data) {
  const products=cache.products||[];
  const html=`
    <div class="form-group"><label>Product</label><select id="field_product_id">${products.map(p=>`<option value="${p.id_product}" ${data.product_id===p.id_product?'selected':''}>${p.name}</option>`).join('')}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Retail Qty</label><input type="number" id="field_retail_qty" value="${data.retail_qty||0}"/></div>
      <div class="form-group"><label>Retail Price (Rp)</label><input type="number" id="field_retail_price" value="${data.retail_price||0}"/></div>
    </div>`;
  openModal('Edit Stock',html,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="updateOutletStock('${data.id_outlet_stock}','${data.outlet_id||''}')">Save</button>`);
}

async function saveOutletStock() {
  try {
    const body={outlet_id:document.getElementById('field_outlet_id').value,product_id:document.getElementById('field_product_id').value,
      retail_qty:Number(document.getElementById('field_retail_qty').value),retail_price:Number(document.getElementById('field_retail_price').value)};
    if(!body.outlet_id||!body.product_id) return toast('Select outlet and product','error');
    await api('/api/outlet-stocks',{method:'POST',body});
    closeModal(); toast('Stock added!');
    if(cache.currentOutletId) viewOutletDetail(cache.currentOutletId); else renderPage();
  } catch(e){toast(e.message,'error');}
}

async function updateOutletStock(id,outletId) {
  try {
    const body={product_id:document.getElementById('field_product_id').value,
      retail_qty:Number(document.getElementById('field_retail_qty').value),retail_price:Number(document.getElementById('field_retail_price').value)};
    await api(`/api/outlet-stocks/${id}`,{method:'PUT',body});
    closeModal(); toast('Updated!');
    if(outletId) viewOutletDetail(outletId); else renderPage();
  } catch(e){toast(e.message,'error');}
}

async function deleteOutletStock(id,outletId) {
  const ok = await confirmDialog({ title: 'Delete Stock Record?', message: 'This stock record will be permanently removed from the system.', icon: 'inventory' });
  if (!ok) return;
  try { await api(`/api/outlet-stocks/${id}`,{method:'DELETE'}); toast('Stock record deleted!');
    if(outletId) viewOutletDetail(outletId); else renderPage();
  } catch(e) { toast(e.message,'error'); }
}
// ==================== ORDERS ====================
async function renderOrders() {
  const [data,outlets,payments,statuses,products] = await Promise.all([
    api('/api/orders'),api('/api/outlets'),api('/api/payments'),api('/api/status-payments'),api('/api/products')
  ]);
  cache.outlets=outlets; cache.payments=payments; cache.statuses=statuses; cache.products=products;
  const pc = document.getElementById('pageContent');
  const totalRev = data.reduce((s,o)=>s+(o.total||0),0);
  pc.innerHTML = `
    <div class="page-header"><div><h2>Orders</h2><p>Track and manage all sales orders.</p></div>
      <button class="btn btn-primary" onclick="openOrderModal()"><span class="material-symbols-outlined" style="font-size:18px">add</span> New Order</button></div>
    <div class="stats-grid">
      <div class="stat-card stat-card-primary"><div class="stat-top"><div><div class="stat-label">Total Revenue</div><div class="stat-value">${formatRp(totalRev)}</div></div><div class="stat-icon"><span class="material-symbols-outlined">trending_up</span></div></div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Total Orders</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">receipt_long</span></div></div><div class="stat-value">${data.length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Paid</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">check_circle</span></div></div><div class="stat-value">${data.filter(o=>o.status_name==='Paid').length}</div></div>
      <div class="stat-card"><div class="stat-top"><div class="stat-label">Pending</div><div class="stat-icon" style="background:rgba(164,65,0,0.1);color:var(--tertiary)"><span class="material-symbols-outlined">pending</span></div></div><div class="stat-value">${data.filter(o=>o.status_name==='Pending').length}</div></div>
    </div>
    <div class="table-card">
      <div class="table-header"><h3>Order History</h3></div>
      <table><thead><tr><th>Order ID</th><th>Date</th><th>Outlet</th><th>Payment</th><th>Status</th><th class="text-right">Total</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length===0?'<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No orders yet</td></tr>':
        data.map(r=>{
          const bc=r.status_name==='Paid'?'badge-success':r.status_name==='Failed'?'badge-error':r.status_name==='Pending'?'badge-warning':'badge-info';
          return `<tr>
          <td class="text-primary font-medium">${shortId(r.id_order)}</td>
          <td>${formatDate(r.date)}</td>
          <td>${r.name_outlet||'-'}</td>
          <td>${r.payment_name||'-'}</td>
          <td><span class="badge ${bc}">${r.status_name||'-'}</span></td>
          <td class="text-right font-medium">${formatRp(r.total)}</td>
          <td class="text-right"><div class="actions-cell">
            <button class="action-btn view" onclick="viewOrder('${r.id_order}')"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button>
            <button class="action-btn" onclick='editOrder("${r.id_order}")'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteOrder('${r.id_order}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </div></td></tr>`}).join('')}</tbody></table>
    </div>`;
}

async function viewOrder(id) {
  try {
    const order = await api(`/api/orders/${id}`);
    const items = order.items || [];
    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
        <div><div class="text-muted" style="font-size:12px;text-transform:uppercase;margin-bottom:4px">Order ID</div><div class="font-medium">${shortId(order.id_order)}</div></div>
        <div><div class="text-muted" style="font-size:12px;text-transform:uppercase;margin-bottom:4px">Date</div><div>${formatDate(order.date)}</div></div>
        <div><div class="text-muted" style="font-size:12px;text-transform:uppercase;margin-bottom:4px">Outlet</div><div>${order.name_outlet||'-'}</div></div>
        <div><div class="text-muted" style="font-size:12px;text-transform:uppercase;margin-bottom:4px">Payment</div><div>${order.payment_name||'-'}</div></div>
        <div><div class="text-muted" style="font-size:12px;text-transform:uppercase;margin-bottom:4px">Status</div><div><span class="badge ${order.status_name==='Paid'?'badge-success':order.status_name==='Failed'?'badge-error':'badge-warning'}">${order.status_name||'-'}</span></div></div>
      </div>
      <h4 style="font-weight:600;margin-bottom:12px">Order Items</h4>
      <div class="order-items-table">
        <table><thead><tr><th>Product</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Subtotal</th></tr></thead>
        <tbody>${items.length===0?'<tr><td colspan="4" class="text-center text-muted">No items</td></tr>':
          items.map(i=>`<tr><td>${i.product_name||'-'}</td><td class="text-right">${i.qty}</td><td class="text-right">${formatRp(i.price)}</td><td class="text-right font-medium">${formatRp((i.qty||0)*(i.price||0))}</td></tr>`).join('')}</tbody></table>
        <div class="order-total"><span>Total</span><span class="total-value">${formatRp(order.total)}</span></div>
      </div>`;
    openModal('Order Details', html, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`);
  } catch(e) { toast(e.message, 'error'); }
}

let orderItems = [];

function openOrderModal() {
  orderItems = [];
  const outlets=cache.outlets||[]; const payments=cache.payments||[]; const statuses=cache.statuses||[];
  renderOrderForm(outlets,payments,statuses,false);
}

async function editOrder(id) {
  try {
    const order = await api(`/api/orders/${id}`);
    orderItems = (order.items||[]).map(i=>({product_id:i.product__id,product_name:i.product_name,qty:i.qty,price:i.price}));
    const outlets=cache.outlets||[]; const payments=cache.payments||[]; const statuses=cache.statuses||[];
    renderOrderForm(outlets,payments,statuses,true,order);
  } catch(e) { toast(e.message,'error'); }
}

function renderOrderForm(outlets,payments,statuses,isEdit,data=null) {
  const products = cache.products || [];
  const today = new Date().toISOString().split('T')[0];
  const html = `
    <div class="form-row">
      <div class="form-group"><label>Date <span class="required">*</span></label><input type="date" id="field_date" value="${data?.date?String(data.date).split('T')[0]:today}"/></div>
      <div class="form-group"><label>Outlet <span class="required">*</span></label><select id="field_outlet_id"><option value="">Select...</option>${outlets.map(o=>`<option value="${o.id_outlet}" ${data?.outlet_id===o.id_outlet?'selected':''}>${o.name_outlet}</option>`).join('')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Payment</label><select id="field_payment_id"><option value="">Select...</option>${payments.map(p=>`<option value="${p.id_payment}" ${data?.payment_id===p.id_payment?'selected':''}>${p.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Status</label><select id="field_status_id"><option value="">Select...</option>${statuses.map(s=>`<option value="${s.id_status_payment}" ${data?.status_id===s.id_status_payment?'selected':''}>${s.name}</option>`).join('')}</select></div>
    </div>
    <h4 style="font-weight:600;margin:16px 0 8px">Order Items</h4>
    <div id="orderItemsList">${renderOrderItemsList()}</div>
    <div class="form-row" style="margin-top:12px">
      <div class="form-group"><label>Product</label><select id="newItemProduct"><option value="">Select...</option>${products.map(p=>`<option value="${p.id_product}" data-name="${encodeURIComponent(p.name)}" data-price="${p.price||0}">${p.name} (${formatRp(p.price)})</option>`).join('')}</select></div>
      <div class="form-group"><label>Qty</label><input type="number" id="newItemQty" value="1" min="1"/></div>
    </div>
    <button class="btn btn-secondary" onclick="addOrderItem()" style="margin-bottom:8px"><span class="material-symbols-outlined" style="font-size:16px">add</span> Add Item</button>`;

  openModal(isEdit?'Edit Order':'New Order', html,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveOrder('${isEdit?data.id_order:''}')">${isEdit?'Save':'Create Order'}</button>`);
}

function renderOrderItemsList() {
  if(orderItems.length===0) return '<p class="text-muted" style="font-size:13px">No items added yet</p>';
  const total = orderItems.reduce((s,i)=>s+(i.qty||0)*(i.price||0),0);
  return `<div class="order-items-table"><table><thead><tr><th>Product</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Subtotal</th><th></th></tr></thead>
    <tbody>${orderItems.map((i,idx)=>`<tr><td>${i.product_name}</td><td class="text-right">${i.qty}</td><td class="text-right">${formatRp(i.price)}</td><td class="text-right">${formatRp(i.qty*i.price)}</td>
      <td><button class="action-btn delete" onclick="removeOrderItem(${idx})"><span class="material-symbols-outlined" style="font-size:16px">close</span></button></td></tr>`).join('')}</tbody></table>
    <div class="order-total"><span>Total</span><span class="total-value">${formatRp(total)}</span></div></div>`;
}

function addOrderItem() {
  const sel = document.getElementById('newItemProduct');
  const opt = sel.options[sel.selectedIndex];
  if(!sel.value) return toast('Select a product','error');
  const qty = Number(document.getElementById('newItemQty').value) || 1;
  const productName = decodeURIComponent(opt.dataset.name || opt.textContent.trim());
  const price = Number(opt.dataset.price) || 0;
  orderItems.push({ product_id: sel.value, product_name: productName, qty, price });
  document.getElementById('orderItemsList').innerHTML = renderOrderItemsList();
  sel.value = '';
  document.getElementById('newItemQty').value = '1';
}

function removeOrderItem(idx) {
  orderItems.splice(idx, 1);
  document.getElementById('orderItemsList').innerHTML = renderOrderItemsList();
}

async function saveOrder(id) {
  try {
    const body = {
      date: document.getElementById('field_date').value,
      outlet_id: document.getElementById('field_outlet_id').value || null,
      payment_id: document.getElementById('field_payment_id').value || null,
      status_id: document.getElementById('field_status_id').value || null,
      items: orderItems
    };
    if(!body.date) return toast('Date is required','error');
    if(!body.outlet_id) return toast('Please select an outlet','error');
    if(orderItems.length === 0) return toast('Please add at least one item to the order','error');
    if(id) await api(`/api/orders/${id}`,{method:'PUT',body}); else await api('/api/orders',{method:'POST',body});
    closeModal(); toast(id?'Updated!':'Order created!'); renderPage();
  } catch(e) { toast(e.message,'error'); }
}

async function deleteOrder(id) {
  const ok = await confirmDialog({ title: 'Delete Order?', message: 'This order and all its items will be permanently removed.', icon: 'remove_shopping_cart' });
  if (!ok) return;
  try { await api(`/api/orders/${id}`,{method:'DELETE'}); toast('Order deleted!'); renderPage(); } catch(e) { toast(e.message,'error'); }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderPage();
  // Global search
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  // ESC to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
