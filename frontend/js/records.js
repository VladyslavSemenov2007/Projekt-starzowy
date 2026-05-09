async function loadRecords() {
  const tbody = document.getElementById('records-table-body');

  tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    console.log("loading");
    const response = await fetchWithAuth('/records');
    console.log("loaded");
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const records = await response.json();

    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No records found</td></tr>';
      return;
    }
    tbody.innerHTML = records.data.map(record => `
      <tr>
        <td>${escapeHtml(record.name)}</td>
        <td>${escapeHtml(record.email)}</td>
        <td>${escapeHtml(record.phone ?? '—')}</td>
        <td>${escapeHtml(record.purpose)}</td>
        <td>${new Date(record.created_at).toLocaleDateString()}</td>
        <td>
          <a href="record-form.html?id=${record.id}">Edit</a>
          <button onclick="deleteRecord(${record.id})">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
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

loadRecords();