// ==================== DASHBOARD ====================
async function renderDashboard() {
  const data = await api('/api/dashboard');
  const pc = document.getElementById('pageContent');
  const maxRev = Math.max(...(data.revenueTrend || []).map(d => d.revenue), 1);
  pc.innerHTML = `
    <div class="page-header"><div><h2>Dashboard</h2><p>Welcome back to your sales command center.</p></div></div>
    <div class="stats-grid">
      <div class="stat-card stat-card-primary">
        <div class="stat-top"><div><div class="stat-label">Today's Revenue</div><div class="stat-value">${formatRp(data.revenueToday)}</div></div>
        <div class="stat-icon"><span class="material-symbols-outlined">trending_up</span></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-label">Orders Today</div><div class="stat-icon" style="background:rgba(79,70,229,0.1);color:var(--primary)"><span class="material-symbols-outlined">receipt_long</span></div></div>
        <div class="stat-value">${data.ordersToday}</div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-label">Total Products</div><div class="stat-icon" style="background:rgba(0,108,73,0.1);color:var(--secondary)"><span class="material-symbols-outlined">inventory</span></div></div>
        <div class="stat-value">${data.totalProducts}</div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-label">Total Outlets</div><div class="stat-icon" style="background:rgba(164,65,0,0.1);color:var(--tertiary)"><span class="material-symbols-outlined">storefront</span></div></div>
        <div class="stat-value">${data.totalOutlets}</div>
      </div>
    </div>
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Revenue (Last 7 Days)</h3>
        <div class="bar-chart">${(data.revenueTrend || []).map(d => {
          const pct = Math.max((d.revenue / maxRev) * 100, 5);
          const day = new Date(d.day).toLocaleDateString('id-ID', { weekday: 'short' });
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
