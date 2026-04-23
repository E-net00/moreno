/**
 * Canvas Logic for Interactive Circles
 */

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let circles = [];
let selectedCircle = null;
let isDragging = false;
let offset = { x: 0, y: 0 };

/**
 * Function to draw everything on the canvas
 */
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        // Color changes to red if selected, otherwise blue
        ctx.fillStyle = (circle === selectedCircle) ? 'red' : 'blue';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    });
};

/**
 * Mouse Down: Handle Selecting, Adding, and Start Dragging
 */
canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clickedOnExisting = false;

    // Check if we clicked on an existing circle (iterate backwards for top-most)
    for (let i = circles.length - 1; i >= 0; i--) {
        const c = circles[i];
        const distance = Math.sqrt((mouseX - c.x) ** 2 + (mouseY - c.y) ** 2);

        if (distance < c.radius) {
            selectedCircle = c;
            isDragging = true;
            offset.x = mouseX - c.x;
            offset.y = mouseY - c.y;
            clickedOnExisting = true;
            break;
        }
    }

    // If no circle was clicked, create a new one and deselect
    if (!clickedOnExisting) {
        circles.push({ x: mouseX, y: mouseY, radius: 20 });
        selectedCircle = null;
    }

    draw();
});

/**
 * Mouse Move: Handle Dragging logic
 */
canvas.addEventListener('mousemove', function(e) {
    if (isDragging && selectedCircle) {
        const rect = canvas.getBoundingClientRect();
        selectedCircle.x = (e.clientX - rect.left) - offset.x;
        selectedCircle.y = (e.clientY - rect.top) - offset.y;
        draw();
    }
});

/**
 * Mouse Up: Stop Dragging
 */
window.addEventListener('mouseup', function() {
    isDragging = false;
});

/**
 * Mouse Wheel: Resize selected circle
 */
canvas.addEventListener('wheel', function(e) {
    if (selectedCircle) {
        e.preventDefault(); // Prevent page scroll
        const zoomSpeed = 2;
        
        if (e.deltaY < 0) {
            // Scroll Up: Increase Radius
            selectedCircle.radius += zoomSpeed;
        } else {
            // Scroll Down: Decrease Radius (min size 5px)
            selectedCircle.radius = Math.max(5, selectedCircle.radius - zoomSpeed);
        }
        draw();
    }
}, { passive: false });

/**
 * Keydown: Delete selected circle
 */
window.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' && selectedCircle) {
        circles = circles.filter(c => c !== selectedCircle);
        selectedCircle = null;
        draw();
    }
});

// Initial draw call
draw();