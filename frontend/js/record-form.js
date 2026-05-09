const id = new URLSearchParams(window.location.search).get('id');
const isEditMode = !!id;

const form = document.getElementById('record-form');
const errorDiv = document.getElementById('error-message');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

if (isEditMode) {
    formTitle.textContent = 'Edit Record';
    submitBtn.textContent = 'Update';
    loadRecord();
}

async function loadRecord() {
    try {
        const response = await fetchWithAuth(`/records/${id}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const record = await response.json();
        document.getElementById('name').value = record.data.name ?? '';
        document.getElementById('email').value = record.data.email ?? '';
        document.getElementById('phone').value = record.data.phone ?? '';
        document.getElementById('purpose').value = record.data.purpose ?? '';
    } catch (error) {
        showError(`Failed to load record: ${error.message}`);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const body = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        purpose: document.getElementById('purpose').value.trim(),
    };

    try {
        const response = isEditMode
            ? await fetchWithAuth(`/records/${id}`, { method: 'PUT', body: JSON.stringify(body) })
            : await fetchWithAuth('/records', { method: 'POST', body: JSON.stringify(body) });

        if (response.status === 400) {
            const data = await response.json();
            const msg = Array.isArray(data) ? data.join(', ') : data.message ?? 'Validation error';
            showError(msg);
            return;
        }

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        window.location.href = 'index.html';

    } catch (error) {
        showError(`Failed to save record: ${error.message}`);
    }
});

function showError(message) {
    errorDiv.textContent = message;
}

function clearError() {
    errorDiv.textContent = '';
}