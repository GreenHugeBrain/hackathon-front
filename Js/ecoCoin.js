const COIN_TO_GEL_RATE = 0.2;

const redeemButton = document.querySelector('.redeem-button');
const modalOverlay = document.querySelector('.redeem-modal-overlay');
const modal = document.querySelector('.redeem-success-modal');
const closeButton = document.querySelector('.close-modal');
const totalCoinsElement = document.getElementById('totalCoinsRedeemed');
const redeemAmountElement = document.getElementById('redeemAmount');

let points = 0;
const trashTypes = [
    { name: 'პლასტმასის ბოთლი', icon: 'fa-bottle-water', points: 10 },
    { name: 'ქაღალდი', icon: 'fa-newspaper', points: 5 },
    { name: 'მინის ბოთლი', icon: 'fa-wine-bottle', points: 15 },
    { name: 'ალუმინის ქილა', icon: 'fa-can-food', points: 8 },
    { name: 'მუყაოს ყუთი', icon: 'fa-box', points: 12 }
];

document.addEventListener('DOMContentLoaded', () => {
    initializeLocationButtons();
    initializeDragAndDrop();
});

function initializeLocationButtons() {
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = document.getElementById('trashBinSection');
            section.classList.remove('d-none');
            section.classList.add('visible');
            generateTrashItems();
        });
    });
}

function generateTrashItems() {
    const container = document.getElementById('trashContainer');
    container.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const randomTrash = trashTypes[Math.floor(Math.random() * trashTypes.length)];
        const trashElement = document.createElement('div');
        trashElement.className = 'trash-item';
        trashElement.draggable = true;
        trashElement.innerHTML = `
            <i class="fas ${randomTrash.icon}"></i>
            <span>${randomTrash.name}</span>
        `;
        trashElement.dataset.points = randomTrash.points;

        setupDragAndDrop(trashElement);
        container.appendChild(trashElement);
    }
}

function initializeDragAndDrop() {
    const bin = document.getElementById('bin');

    bin.addEventListener('dragover', (e) => {
        e.preventDefault();
        bin.classList.add('highlight');
    });

    bin.addEventListener('dragleave', () => {
        bin.classList.remove('highlight');
    });

    bin.addEventListener('drop', handleTrashDrop);
}

function setupDragAndDrop(element) {
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.dataset.points);
        element.classList.add('dragging');
    });

    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
    });
}

function handleTrashDrop(e) {
    e.preventDefault();
    const bin = document.getElementById('bin');
    bin.classList.remove('highlight');

    const pointsEarned = parseInt(e.dataTransfer.getData('text/plain'));
    points += pointsEarned;
    document.getElementById('pointsDisplay').textContent = points;

    playEcoCoinSound();
    createCoinAnimation(e.clientX, e.clientY, pointsEarned);
    document.querySelector('.dragging').remove();
}

function playEcoCoinSound() {
    const sound = document.getElementById('ecoCoinSound');
    sound.currentTime = 0;
    sound.play();
}

function createCoinAnimation(x, y, points) {
    const animation = document.createElement('div');
    animation.className = 'coin-animation';
    animation.innerHTML = `+${points} <i class="fas fa-leaf"></i>`;
    animation.style.left = `${x}px`;
    animation.style.top = `${y}px`;
    document.body.appendChild(animation);

    setTimeout(() => animation.remove(), 1500);
}

function createConfetti() {
    const colors = ['#00d084', '#6366f1', '#00b8d4', '#ffffff'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.classList.add('confetti-animation');
        modalOverlay.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
    }
}

redeemButton.addEventListener('click', (e) => {
    e.preventDefault()
    totalCoinsElement.textContent = points;
    redeemAmountElement.textContent = (points * COIN_TO_GEL_RATE).toFixed(2);

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalOverlay.classList.add('active');
        modal.classList.add('active');
    }, 10);

    createConfetti();

    sendRedemptionRequest(points);
});

function sendRedemptionRequest(points) {
    const token = localStorage.getItem('jwt_token');  

    fetch('http://127.0.0.1:5000/api/redeem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            "points": points
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Redemption successful") {
            console.log(`Points successfully redeemed: ${data.eco_coin}`);
        } else {
            console.error("Error in redemption:", data.error);
        }
    })
    .catch(error => {
        console.error('Request failed', error);
    });
}

closeButton.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 300);
});

function animateNumber(start, end, duration, element) {
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentValue = start + (range * progress);
        element.textContent = Number(currentValue.toFixed(2)).toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}