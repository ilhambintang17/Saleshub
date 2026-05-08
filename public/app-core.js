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

function formatRp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
function shortId(id) { return id ? id.substring(0, 8).toUpperCase() : '-'; }

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
