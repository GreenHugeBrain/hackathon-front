const trashItems = [
    { id: 1, name: 'ნაგავი 1', mass: 1, coinReward: 10 },
    { id: 2, name: 'ნაგავი 2', mass: 2, coinReward: 20 },
    { id: 3, name: 'ნაგავი 3', mass: 3, coinReward: 30 },
    { id: 4, name: 'ნაგავი 4', mass: 4, coinReward: 40 },
    { id: 5, name: 'ნაგავი 5', mass: 5, coinReward: 50 },
    { id: 6, name: 'ნაგავი 6', mass: 6, coinReward: 60 },
    { id: 7, name: 'ნაგავი 7', mass: 7, coinReward: 70 },
    { id: 8, name: 'ნაგავი 8', mass: 8, coinReward: 80 },
    { id: 9, name: 'ნაგავი 9', mass: 9, coinReward: 90 },
    { id: 10, name: 'ნაგავი 10', mass: 10, coinReward: 100 }
];

const locations = ['გლდანი', 'ვაკე', 'აბაშიძე'];

function setupLocation(location) {
    const trashContainer = document.getElementById('trashContainer');
    trashContainer.innerHTML = '';
    trashItems.forEach(item => {
        const trashElement = document.createElement('div');
        trashElement.classList.add('trash-item', 'border', 'p-2', 'mb-2');
        trashElement.setAttribute('draggable', true);
        trashElement.setAttribute('data-id', item.id);
        trashElement.setAttribute('data-coin', item.coinReward);
        trashElement.setAttribute('data-mass', item.mass);
        trashElement.textContent = `${item.name} (მასა: ${item.mass}kg)`;
        trashElement.ondragstart = dragStart;
        trashContainer.appendChild(trashElement);
    });

    document.getElementById('trashBinSection').classList.remove('d-none');
}

function dragStart(e) {
    e.dataTransfer.setData('text', e.target.getAttribute('data-id'));
    e.dataTransfer.setData('coin', e.target.getAttribute('data-coin'));
}

document.getElementById('bin').ondragover = function (e) {
    e.preventDefault();
};

document.getElementById('bin').ondrop = function (e) {
    e.preventDefault();
    const trashId = e.dataTransfer.getData('text');
    const coinReward = e.dataTransfer.getData('coin');
    const trashElement = document.querySelector(`[data-id="${trashId}"]`);

    let ecoCoinAmount = parseInt(coinReward, 10);
    console.log(`ნაგავი ჩაგდებულია. მიცემულია ${ecoCoinAmount} ecoCoin`);

    const coinText = document.createElement('div');
    coinText.classList.add('coin-anim');
    coinText.textContent = `+${ecoCoinAmount} ecoCoin`;
    document.body.appendChild(coinText);
    setTimeout(() => coinText.remove(), 1000);

    document.getElementById('ecoCoinSound').play();

    trashElement.remove();
};

locations.forEach(location => {
    document.getElementById('location1').addEventListener('click', () => setupLocation(location));
    document.getElementById('location2').addEventListener('click', () => setupLocation(location));
    document.getElementById('location3').addEventListener('click', () => setupLocation(location));
});