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
      <table><thead><tr><th>ID</th><th>Outlet Name</th><th>Owner</th><th>Location</th><th>Phone</th><th>Sales Person</th><th class="text-right">Actions</th></tr></thead>
      <tbody>${data.length===0?'<tr><td colspan="7" class="text-center text-muted" style="padding:24px">No outlets</td></tr>':
        data.map(r=>`<tr>
          <td class="text-muted">${shortId(r.id_outlet)}</td>
          <td><a class="text-primary font-medium" style="cursor:pointer;text-decoration:none" onclick="viewOutletDetail('${r.id_outlet}')">${r.name_outlet||'-'}</a></td>
          <td>${r.name_owner||'-'}</td>
          <td class="text-muted">${r.location||'-'}</td>
          <td>${r.number_phone||'-'}</td>
          <td>${r.sales_person_name||'-'}</td>
          <td class="text-right">
            <button class="action-btn" onclick="viewOutletDetail('${r.id_outlet}')"><span class="material-symbols-outlined" style="font-size:18px">visibility</span></button>
            <button class="action-btn" onclick='openOutletModal(${JSON.stringify(r).replace(/'/g,"&#39;")})'><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
            <button class="action-btn delete" onclick="deleteOutlet('${r.id_outlet}')"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
          </td></tr>`).join('')}</tbody></table>
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
  if(!confirm('Delete this outlet?')) return;
  try{await api(`/api/outlets/${id}`,{method:'DELETE'});toast('Deleted!');renderPage();}catch(e){toast(e.message,'error');}
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
  if(!confirm('Delete this stock record?')) return;
  try{await api(`/api/outlet-stocks/${id}`,{method:'DELETE'});toast('Deleted!');
    if(outletId) viewOutletDetail(outletId); else renderPage();
  }catch(e){toast(e.message,'error');}
}
