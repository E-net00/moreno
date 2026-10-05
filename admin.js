document.addEventListener('DOMContentLoaded', () => {
    BIMS_GUARD.protectPage('Admin');

    // Navigation and Operations DOM handles
    const queueBody = document.getElementById('adminQueueBody');
    const logsBody = document.getElementById('adminLogsBody');
    const btnAdminLogout = document.getElementById('btnAdminLogout');
    const printModal = document.getElementById('printModal');

    // Registry Form and View DOM handles
    const registryTableBody = document.getElementById('registryTableBody');
    const profileForm = document.getElementById('profileForm');
    const formPanelTitle = document.getElementById('formPanelTitle');

    // === TAB MANAGEMENT VIEW ROUTER ===
    window.switchAdminTab = function(tabName) {
        const tabOpDesk = document.getElementById('tabOpDesk');
        const tabRegistry = document.getElementById('tabRegistry');
        const viewOperations = document.getElementById('viewOperations');
        const viewRegistry = document.getElementById('viewRegistry');

        if (tabName === 'Operations') {
            tabOpDesk.classList.add('active');
            tabRegistry.classList.remove('active');
            viewOperations.classList.add('active-view');
            viewRegistry.classList.remove('active-view');
        } else {
            tabRegistry.classList.add('active');
            tabOpDesk.classList.remove('active');
            viewRegistry.classList.add('active-view');
            viewOperations.classList.remove('active-view');
        }
    };

    // === TRANSACTIONS DESK LOOP RENDERERS ===
    function updateAdminPanels() {
        const requests = BIMS_DB.getRequests();
        queueBody.innerHTML = '';
        logsBody.innerHTML = '';

        const pendingItems = requests.filter(r => r.status === 'Pending');
        const loggedItems = requests.filter(r => r.status !== 'Pending');

        if (pendingItems.length === 0) {
            queueBody.innerHTML = `<tr><td colspan="4" style="color:#94a3b8; text-align:center;">No pending clearance requests.</td></tr>`;
        } else {
            pendingItems.forEach(req => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${req.fullName}</strong></td>
                    <td>${req.documentType}</td>
                    <td>${req.purpose}</td>
                    <td>
                        <button class="btn btn-approve" onclick="openCertificateForm('${req.id}')">Issue</button>
                        <button class="btn btn-reject" onclick="handleAdminAction('${req.id}', 'Rejected')">Deny</button>
                    </td>
                `;
                queueBody.appendChild(tr);
            });
        }

        if (loggedItems.length === 0) {
            logsBody.innerHTML = `<tr><td colspan="4" style="color:#94a3b8; text-align:center;">No records processed yet.</td></tr>`;
        } else {
            loggedItems.forEach(req => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><small style="color:#64748b">${req.id}</small></td>
                    <td>${req.fullName}</td>
                    <td>${req.documentType}</td>
                    <td><span class="status-text text-${req.status.toLowerCase()}">${req.status}</span></td>
                `;
                logsBody.appendChild(tr);
            });
        }
    }

    window.handleAdminAction = function(id, newStatus) {
        BIMS_DB.updateStatus(id, newStatus);
        updateAdminPanels();
    };

    // === RESIDENT PROFILING ENGINE INTERACTIONS ===
    function renderRegistryTable() {
        const profiles = BIMS_DB.getProfiles();
        registryTableBody.innerHTML = '';

        if (profiles.length === 0) {
            registryTableBody.innerHTML = `<tr><td colspan="5" style="color:#94a3b8; text-align:center;">No records registered in the local index.</td></tr>`;
            return;
        }

        profiles.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><small style="color:#64748b">${p.id}</small></td>
                <td><strong>${p.name}</strong></td>
                <td>${new Date(p.birthday).toLocaleDateString()}</td>
                <td>${p.address}</td>
                <td>
                    <button class="btn btn-edit" onclick="editProfileRow('${p.id}')">Edit</button>
                    <button class="btn btn-reject" onclick="deleteProfileRow('${p.id}')">Delete</button>
                </td>
            `;
            registryTableBody.appendChild(tr);
        });
    }

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const profilePayload = {
            id: document.getElementById('profileId').value || null,
            name: document.getElementById('resName').value.trim(),
            birthday: document.getElementById('resBirthday').value,
            address: document.getElementById('resAddress').value.trim()
        };

        BIMS_DB.saveProfile(profilePayload);
        resetProfileForm();
        renderRegistryTable();
        alert('Resident information matrix sync processing successful.');
    });

    window.editProfileRow = function(id) {
        const profiles = BIMS_DB.getProfiles();
        const targeted = profiles.find(p => p.id === id);
        if (!targeted) return;

        // Map selection attributes up into input nodes
        document.getElementById('profileId').value = targeted.id;
        document.getElementById('resName').value = targeted.name;
        document.getElementById('resBirthday').value = targeted.birthday;
        document.getElementById('resAddress').value = targeted.address;

        formPanelTitle.textContent = "Modify Resident Profile Record";
        document.getElementById('btnSaveProfile').textContent = "Update Profile";
    };

    window.deleteProfileRow = function(id) {
        if (confirm("Are you sure you want to delete this resident record from the centralized matrix database index?")) {
            BIMS_DB.deleteProfile(id);
            renderRegistryTable();
            resetProfileForm();
        }
    };

    window.resetProfileForm = function() {
        profileForm.reset();
        document.getElementById('profileId').value = "";
        formPanelTitle.textContent = "Register New Resident Profile";
        document.getElementById('btnSaveProfile').textContent = "Save Record";
    };

    // === PRINT DOCUMENT CANVASS ENGINE CODES ===
    window.openCertificateForm = function(id) {
        const requests = BIMS_DB.getRequests();
        const targetedRequest = requests.find(r => r.id === id);
        if (!targetedRequest) return;

        document.getElementById('certTitleText').textContent = targetedRequest.documentType;
        document.getElementById('certResidentName').textContent = targetedRequest.fullName.toUpperCase();
        document.getElementById('certPurpose').textContent = targetedRequest.purpose.toUpperCase();

        const orderDate = new Date();
        const dateSuffix = getDaySuffix(orderDate.getDate());
        
        document.getElementById('certDay').textContent = orderDate.getDate() + dateSuffix;
        document.getElementById('certMonthYear').textContent = orderDate.toLocaleString('default', { month: 'long' }) + " " + orderDate.getFullYear();

        printModal.setAttribute('data-target-id', id);
        printModal.style.display = 'block';
    };

    window.closePrintModal = function() { printModal.style.display = 'none'; };

    window.triggerPrint = function() {
        const activeTargetId = printModal.getAttribute('data-target-id');
        if(activeTargetId) {
            BIMS_DB.updateStatus(activeTargetId, 'Approved');
            updateAdminPanels();
        }
        window.print();
        closePrintModal();
    };

    function getDaySuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }

    // Global listeners instantiation blocks
    btnAdminLogout.addEventListener('click', () => { BIMS_GUARD.executeLogout(); });
    window.addEventListener('storage', () => { updateAdminPanels(); renderRegistryTable(); });
    
    // Core system initialize sequences trigger configurations
    updateAdminPanels();
    renderRegistryTable();
});
