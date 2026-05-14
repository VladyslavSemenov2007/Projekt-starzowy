let memory = [];

async function loadRecords() {
  const tbody = document.getElementById('records-table-body');
  try {
    // ??? ???
    const params = new URLSearchParams({
      page: state.page,
      limit: state.limit,
      ...(state.search ? { search: state.search } : {}),
    });
    console.log("loading records")
    const response = await fetchWithAuth(`/records?${params}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    console.log("loaded records")
    const result = await response.json();
    const records = result.data;
    const total = result.total;

    // pagination controls


    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No records found</td></tr>';
      return;
    }
    tbody.innerHTML = records.map(record => `
      <tr>
        <td>${escapeHtml(record.name)}</td>
        <td>${escapeHtml(record.email)}</td>
        <td>${escapeHtml(record.phone ?? '—')}</td>
        <td>${escapeHtml(record.purpose)}</td>
        <td>${new Date(record.created_at).toLocaleDateString()}</td>
        <td>
          <a href="${API_URL}/records/${record.id}/export">JSON</a>
          <a href="${API_URL}/records/${record.id}/export?format=csv">CSV</a>
          <a href="record-form.html?id=${record.id}">Edit</a>
          <button onclick="deleteRecord('${record.id}')">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.log("failed")
    tbody.innerHTML = '<tr><td colspan="6">Error: ${error.message}</td></tr>';
  }
}

function escapeHtml(str) {
  if (str == null) return '—';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function deleteRecord(id) {
  if (!confirm('Delete this record?')) return;

  try {
    const response = await fetchWithAuth(`/records/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    loadRecords();
  } catch (error) {
    alert(`Failed to delete: ${error.message}`);
  }
}

const state = {
  page: 1,
  limit: 5,
  search: '',
};

document.getElementById("page").value = state.page;
document.getElementById("limit").value = state.limit;

let memorys = []
let pageD = 0;
let searchTimeout;

document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    memorys.push(e.target.value.trim());
    pageD = memorys.length-1;
    state.search = memorys[pageD];
    state.page = 1;
    const numbers = document.getElementById("numberpage");
    numbers.innerHTML = "PAGE" + memorys.length;
    loadRecords();
  }, 500);
});

document.getElementById('limit').addEventListener('input', (e) => {
  state.limit = document.getElementById("limit").value;
  loadRecords();
});

document.getElementById('page').addEventListener('input', (e) => {
  state.page = document.getElementById("page").value;
  loadRecords();
});

function nextpage(plus) {
  const paged = document.getElementById("page");
  if (plus)
  {
    paged.value ++;
  }
  else{
    paged.value --;
  }
  state.page = paged.value;
  loadRecords();
}

function paging(plus)
{
  if (plus)
  {
    pageD ++;
  }
  else{
    pageD --;
  }
  const real = pageD+1
  state.search = memorys[pageD];
  const numbers = document.getElementById("numberpage");
  const searcher = document.getElementById("search-input");
  numbers.innerHTML = "PAGE" + real;
  searcher.value = state.search;
  loadRecords();
}

// pagination

loadRecords();