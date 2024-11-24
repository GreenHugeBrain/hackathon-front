document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("jwt_token");

    if (!token) {
        window.location.href = "login.html"; 
    }

    fetch("http://127.0.0.1:5000/api/profile", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.username)

            document.getElementById("username").textContent = `მომხმარებლის სახელი:${data.username}`
            document.getElementById("role").textContent = data.role ? "როლი : Admin" : "როლი : User";  
            const eventList = document.getElementById("events-list");

            data.events.forEach(event => {
                const li = document.createElement("li");
                li.textContent = event;
                eventList.appendChild(li);
            });

        })
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
});

document.addEventListener('DOMContentLoaded', () => {
    fetchEcoCoins();
});

function fetchEcoCoins() {
    const token = localStorage.getItem('jwt_token'); 

    fetch('http://127.0.0.1:5000/api/ecocoins/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch EcoCoins');
            }
            return response.json();
        })
        .then(data => {
            displayEcoCoins(data);
            localStorage.setItem('coins', data.totalEcoCoins);
        })
        .catch(error => {
            console.error('Error:', error);

        });
}

function displayEcoCoins(data) {

    const ecoCoinsContainer = document.createElement('div');
    ecoCoinsContainer.className = 'mt-4';

    ecoCoinsContainer.innerHTML = `
        <h6>ეკო ქოინები:</h6>
        <p><strong>${data.totalEcoCoins}</strong></p>
    `;

    const cardBody = document.querySelector('.card-body');
    cardBody.appendChild(ecoCoinsContainer);
}

var amountttt = document.querySelector('.amountofwithdraw')
var coins = localStorage.getItem('coins');
amountttt.textContent = (coins * 0.2).toFixed(2);