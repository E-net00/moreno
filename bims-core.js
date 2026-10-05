/**
 * BIMS - Centralized Mock Database & Authentication Controller
 * Single source of truth using localStorage
 */

const BIMS_DB = {
    // === REQUESTS ENGINE ===
    getRequests() {
        return JSON.parse(localStorage.getItem('bims_requests')) || [];
    },

    insertRequest(fullName, documentType, purpose) {
        const requests = this.getRequests();
        const newRequest = {
            id: 'REQ-' + Date.now(),
            fullName: fullName.trim(),
            documentType: documentType,
            purpose: purpose.trim(),
            date: new Date().toISOString(),
            status: 'Pending'
        };
        requests.push(newRequest);
        localStorage.setItem('bims_requests', JSON.stringify(requests));
        return newRequest;
    },

    updateStatus(id, newStatus) {
        let requests = this.getRequests();
        requests = requests.map(req => {
            if (req.id === id) {
                req.status = newStatus;
            }
            return req;
        });
        localStorage.setItem('bims_requests', JSON.stringify(requests));
    },

    // === RESIDENT PROFILING REGISTRY ===
    getProfiles() {
        let profiles = JSON.parse(localStorage.getItem('bims_profiles'));
        if (!profiles) {
            // Seed a default account for easier local testing
            profiles = [
                { id: 'RES-101', name: 'Juan Dela Cruz', birthday: '1995-06-15', address: 'Purok 3, Barangay Hall Street' }
            ];
            localStorage.setItem('bims_profiles', JSON.stringify(profiles));
        }
        return profiles;
    },

    saveProfile(profileData) {
        const profiles = this.getProfiles();
        if (profileData.id) {
            const updated = profiles.map(p => p.id === profileData.id ? profileData : p);
            localStorage.setItem('bims_profiles', JSON.stringify(updated));
        } else {
            profileData.id = 'RES-' + Date.now();
            profiles.push(profileData);
            localStorage.setItem('bims_profiles', JSON.stringify(profiles));
        }
        return profileData;
    },

    deleteProfile(id) {
        let profiles = this.getProfiles();
        profiles = profiles.filter(p => p.id !== id);
        localStorage.setItem('bims_profiles', JSON.stringify(profiles));
    }
};

const BIMS_AUTH = {
    // Admin verification
    verifyAdmin(username, password) {
        return username.toLowerCase() === 'admin' && password === 'admin123';
    },

    // Resident Verification lookup inside our profile registry array
    verifyResident(fullName) {
        const profiles = BIMS_DB.getProfiles();
        return profiles.find(p => p.name.toLowerCase() === fullName.toLowerCase().trim());
    },

    setSession(userProfile) {
        localStorage.setItem('bims_active_user', JSON.stringify(userProfile));
    },

    getActiveSession() {
        return JSON.parse(localStorage.getItem('bims_active_user'));
    },

    clearSession() {
        localStorage.removeItem('bims_active_user');
    }
};

const BIMS_GUARD = {
    protectPage(requiredRole) {
        const session = BIMS_AUTH.getActiveSession();
        if (!session || session.role !== requiredRole) {
            alert('Access Denied. Please log in first.');
            window.location.href = 'index.html';
        }
    },

    executeLogout() {
        BIMS_AUTH.clearSession();
        window.location.href = 'index.html';
    }
};
