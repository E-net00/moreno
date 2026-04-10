    // --- INITIALIZATION ---
    window.onload = () => {
        loadFromLocalStorage();
        setupListListeners('skills-list');
        setupListListeners('hobbies-list');
    };

    // --- PROFILE PICTURE ---
    const profilePic = document.getElementById('profile-pic');
    const fileInput = document.getElementById('file-input');

    profilePic.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePic.src = event.target.result;
                console.log("Profile picture updated");
            };
            reader.readAsDataURL(file);
        }
    };

    // --- INLINE EDITING (Name & Bio) ---
    function editField(field) {
        const display = document.getElementById(`${field}-display`);
        const input = document.getElementById(`${field}-input`);
        
        display.classList.add('hidden');
        input.classList.remove('hidden');
        input.value = display.innerText;
        input.focus();

        const save = () => {
            display.innerText = input.value;
            display.classList.remove('hidden');
            input.classList.add('hidden');
            console.log(`${field} edited: ${input.value}`);
        };

        input.onblur = save;
        input.onkeydown = (e) => { if (e.key === 'Enter') save(); };
    }

    // --- SKILLS & HOBBIES LOGIC ---
    function toggleInput(type) {
        document.getElementById(`${type}-input`).classList.toggle('hidden');
        document.getElementById(`${type}-input`).focus();
    }

    // Handle Adding via Enter
    document.querySelectorAll('input[placeholder*="press Enter"]').forEach(input => {
        input.onkeydown = (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                const listId = input.id.includes('skill') ? 'skills-list' : 'hobbies-list';
                addItem(listId, input.value);
                console.log(`${listId.split('-')[0]} added: ${input.value}`);
                input.value = '';
                input.classList.add('hidden');
            }
        };
    });

    function addItem(listId, text) {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.draggable = true;
        li.innerText = text;
        li.ondragstart = drag;
        document.getElementById(listId).appendChild(li);
        setupListItem(li);
    }

    // Selection Logic (Single & Multi)
    function setupListListeners(listId) {
        const items = document.querySelectorAll(`#${listId} .list-item`);
        items.forEach(item => setupListItem(item));
    }

    function setupListItem(item) {
        item.onclick = (e) => {
            if (!e.ctrlKey && !e.metaKey) {
                // Clear others if Ctrl not held
                item.parentElement.querySelectorAll('.list-item').forEach(i => {
                    if (i !== item) i.classList.remove('selected');
                });
            }
            item.classList.toggle('selected');
            console.log("Item selection toggled");
        };
    }

    function deleteSelected(listId) {
        const selected = document.querySelectorAll(`#${listId} .selected`);
        selected.forEach(item => item.remove());
        console.log(`${listId.split('-')[0]} deleted`);
    }

    // --- DRAG AND DROP ---
    let draggedItem = null;

    function drag(e) {
        draggedItem = e.target;
        e.dataTransfer.setData('text/plain', null); 
    }

    function allowDrop(e) {
        e.preventDefault();
        const list = e.currentTarget;
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
            list.appendChild(draggedItem);
        } else {
            list.insertBefore(draggedItem, afterElement);
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.list-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- LOCAL STORAGE ---
    function saveToLocalStorage() {
        const profileData = {
            pic: profilePic.src,
            name: document.getElementById('name-display').innerText,
            bio: document.getElementById('bio-display').innerText,
            skills: Array.from(document.querySelectorAll('#skills-list li')).map(li => li.innerText),
            hobbies: Array.from(document.querySelectorAll('#hobbies-list li')).map(li => li.innerText)
        };
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log("Changes saved to local storage");
        alert("Profile Saved!");
    }

    function loadFromLocalStorage() {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            const data = JSON.parse(saved);
            profilePic.src = data.pic;
            document.getElementById('name-display').innerText = data.name;
            document.getElementById('bio-display').innerText = data.bio;
            
            // Reload Lists
            const skillList = document.getElementById('skills-list');
            const hobbyList = document.getElementById('hobbies-list');
            skillList.innerHTML = '';
            hobbyList.innerHTML = '';
            data.skills.forEach(s => addItem('skills-list', s));
            data.hobbies.forEach(h => addItem('hobbies-list', h));
        }
    }

    function resetProfile() {
        if(confirm("Are you sure you want to clear everything?")) {
            localStorage.clear();
            location.reload();
            console.log("Profile reset to default");
        }
    }