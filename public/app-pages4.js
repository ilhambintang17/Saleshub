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
          <td class="text-right">
            <button class="action-btn" onclick="viewOrder('${r.id_order}')"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button>
            <button class="action-btn" onclick='editOrder("${r.id_order}")'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteOrder('${r.id_order}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`}).join('')}</tbody></table>
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
      <div class="form-group"><label>Date <span class="required">*</span></label><input type="date" id="field_date" value="${data?.date?data.date.split('T')[0]:today}"/></div>
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
    if(orderItems.length === 0) return toast('Please add at least one item to the order','error');
    if(id) await api(`/api/orders/${id}`,{method:'PUT',body}); else await api('/api/orders',{method:'POST',body});
    closeModal(); toast(id?'Updated!':'Order created!'); renderPage();
  } catch(e) { toast(e.message,'error'); }
}

async function deleteOrder(id) {
  if(!confirm('Delete this order?')) return;
  try { await api(`/api/orders/${id}`,{method:'DELETE'}); toast('Deleted!'); renderPage(); } catch(e) { toast(e.message,'error'); }
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
