        // FUNCTION: Update the Dashboard Display
        function updateDashboard() {
            // Navigator and Screen Objects
            const browserDiv = document.getElementById('browser-info');
            browserDiv.innerHTML = `
                <p class="info-item"><strong>Browser:</strong> ${navigator.appName} (${navigator.userAgent})</p>
                <p class="info-item"><strong>Platform:</strong> ${navigator.platform}</p>
                <p class="info-item"><strong>Java Enabled:</strong> ${navigator.javaEnabled()}</p>
                <p class="info-item"><strong>Screen Res:</strong> ${screen.width} x ${screen.height}</p>
                <p class="info-item"><strong>Available Size:</strong> ${screen.availWidth} x ${screen.availHeight}</p>
                <p class="info-item"><strong>Color Depth:</strong> ${screen.colorDepth}-bit</p>
            `;

            // Location and Document Objects
            const pageDiv = document.getElementById('page-info');
            pageDiv.innerHTML = `
                <p class="info-item"><strong>Current URL:</strong> ${location.href}</p>
                <p class="info-item"><strong>Hostname:</strong> ${location.hostname}</p>
                <p class="info-item"><strong>Page Title:</strong> <span id="display-title">${document.title}</span></p>
            `;
        }

        // Dynamic Title Update
        function updateTitle() {
            const newTitle = prompt("Enter a new page title:");
            if (newTitle) {
                document.title = newTitle;
                document.getElementById('display-title').innerText = newTitle;
            }
        }

        // Dynamic Styling based on Screen Width
        function applyDynamicStyling() {
            const width = window.innerWidth;
            if (width < 600) {
                document.body.style.backgroundColor = "#3498db"; // Blue
            } else if (width >= 600 && width <= 991) {
                document.body.style.backgroundColor = "#2ecc71"; // Green
            } else {
                document.body.style.backgroundColor = "#e67e22"; // Orange
            }
        }

        // Event Listeners for Page Load and Resize
        window.onload = () => {
            updateDashboard();
            applyDynamicStyling();
        };

        window.onresize = applyDynamicStyling;