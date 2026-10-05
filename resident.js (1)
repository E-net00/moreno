document.addEventListener('DOMContentLoaded', () => {
    // Page security guard enforcement
    BIMS_GUARD.protectPage('Resident');

    const requestForm = document.getElementById('requestForm');
    const trackingBody = document.getElementById('trackingBody');
    const btnLogout = document.getElementById('btnLogout');

    // Retrieve active session details and lock down the profile identity fields
    const session = BIMS_AUTH.getActiveSession();
    if (session) {
        const nameField = document.getElementById('fullName');
        if (nameField) {
            nameField.value = session.name;
            nameField.setAttribute('readonly', true);
            nameField.style.backgroundColor = '#f1f5f9';
        }
    }

    function renderTrackingTable() {
        const requests = BIMS_DB.getRequests();
        trackingBody.innerHTML = '';
        
        if (requests.length === 0) {
            trackingBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b;">No history found.</td></tr>`;
            return;
        }

        requests.forEach(req => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(req.date).toLocaleDateString()}</td>
                <td><strong>${req.documentType}</strong></td>
                <td>${req.purpose}</td>
                <td><span class="status-badge status-${req.status.toLowerCase()}">${req.status}</span></td>
            `;
            trackingBody.appendChild(row);
        });
    }

    requestForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const documentType = document.getElementById('documentType').value;
        const purpose = document.getElementById('purpose').value;

        BIMS_DB.insertRequest(fullName, documentType, purpose);
        
        requestForm.reset();
        renderTrackingTable();
        alert('Your certificate request has been sent to the Admin desk!');
    });

    btnLogout.addEventListener('click', () => {
        BIMS_GUARD.executeLogout();
    });

    window.addEventListener('storage', renderTrackingTable);
    renderTrackingTable();
});
