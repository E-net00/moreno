function setRole(role) {
    document.getElementById('userRole').value = role;
    
    const tabResident = document.getElementById('tabResident');
    const tabAdmin = document.getElementById('tabAdmin');
    const usernameLabel = document.getElementById('usernameLabel');
    const usernameInput = document.getElementById('username');
    const passwordGroup = document.getElementById('passwordGroup');
    const passwordInput = document.getElementById('password');
    const residentActionToggle = document.getElementById('residentActionToggle');
    const registrationFields = document.getElementById('registrationFields');

    if (role === 'Admin') {
        tabAdmin.classList.add('active');
        tabResident.classList.remove('active');
        usernameLabel.textContent = "Administrative ID";
        usernameInput.placeholder = "e.g., admin";
        passwordGroup.style.display = 'block';
        passwordInput.setAttribute('required', 'true');
        residentActionToggle.style.display = 'none';
        registrationFields.style.display = 'none';
        document.getElementById('btnSubmitForm').textContent = "Access Portal";
    } else {
        tabResident.classList.add('active');
        tabAdmin.classList.remove('active');
        usernameLabel.textContent = "Resident Full Name";
        usernameInput.placeholder = "e.g., Juan Dela Cruz";
        passwordGroup.style.display = 'none';
        passwordInput.removeAttribute('required');
        passwordInput.value = '';
        residentActionToggle.style.display = 'flex';
        setResidentMode(document.getElementById('residentMode').value);
    }
}

function setResidentMode(mode) {
    document.getElementById('residentMode').value = mode;
    const registrationFields = document.getElementById('registrationFields');
    const userBirthday = document.getElementById('userBirthday');
    const userAddress = document.getElementById('userAddress');
    const btnSubmitForm = document.getElementById('btnSubmitForm');

    if (mode === 'register') {
        registrationFields.style.display = 'block';
        userBirthday.setAttribute('required', 'true');
        userAddress.setAttribute('required', 'true');
        btnSubmitForm.textContent = "Create Account & Register";
    } else {
        registrationFields.style.display = 'none';
        userBirthday.removeAttribute('required');
        userAddress.removeAttribute('required');
        btnSubmitForm.textContent = "Access Portal";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const feedback = document.getElementById('loginFeedback');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        feedback.textContent = '';

        const role = document.getElementById('userRole').value;
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const mode = document.getElementById('residentMode').value;

        if (role === 'Admin') {
            if (BIMS_AUTH.verifyAdmin(username, password)) {
                BIMS_AUTH.setSession({ name: 'Administrator', role: 'Admin' });
                feedback.style.color = 'green';
                feedback.innerHTML = 'Verification successful. Redirecting... <br><a href="admin.html" style="font-weight:bold; color:green;">Click here if your browser prevents automatic redirect.</a>';
                
                // Native redirect with replacement fallback to prevent form reset loop
                setTimeout(() => { window.location.replace('admin.html'); }, 800);
            } else {
                feedback.style.color = 'var(--danger)';
                feedback.textContent = 'Invalid Admin credentials. (admin / admin123)';
            }
        } else {
            // === RESIDENT APP FLOWS ===
            if (mode === 'register') {
                if (BIMS_AUTH.verifyResident(username)) {
                    feedback.style.color = 'var(--danger)';
                    feedback.textContent = 'An account with this name already exists. Please choose Sign-In instead.';
                    return;
                }

                const newProfile = {
                    name: username,
                    birthday: document.getElementById('userBirthday').value,
                    address: document.getElementById('userAddress').value.trim()
                };
                BIMS_DB.saveProfile(newProfile);
                
                BIMS_AUTH.setSession({ name: username, role: 'Resident' });
                feedback.style.color = 'green';
                feedback.innerHTML = 'Profile created! Redirecting... <br><a href="resident.html" style="font-weight:bold; color:green;">Click here to enter.</a>';
                
                setTimeout(() => { window.location.replace('resident.html'); }, 800);

            } else {
                // SIGN IN CHECK
                const matchedProfile = BIMS_AUTH.verifyResident(username);
                
                if (matchedProfile) {
                    BIMS_AUTH.setSession({ name: matchedProfile.name, role: 'Resident' });
                    feedback.style.color = 'green';
                    feedback.innerHTML = 'Profile located. Redirecting... <br><a href="resident.html" style="font-weight:bold; color:green;">Click here to enter.</a>';
                    
                    setTimeout(() => { window.location.replace('resident.html'); }, 800);
                } else {
                    feedback.style.color = 'var(--danger)';
                    feedback.textContent = 'Account profile not found. Please select "Create Profile Account" if you are a new resident.';
                }
            }
        }
    });
});
