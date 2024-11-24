const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function fetchEvents() {
    const eventsContainer = document.getElementById('eventsContainer');
    const role = localStorage.getItem('role'); 

    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const events = await response.json();

        eventsContainer.innerHTML = '';
        events.forEach(event => {
            const eventCard = `
<div class="col-md-6 col-lg-4">
    <div class="event-card">
        <div class="event-image">
            <img src="${event.image_url}" alt="Event Image" class="img-fluid">
            <div class="event-date">
                <span class="day">${new Date(event.date).getDate()}</span>
                <span class="month">${new Date(event.date).toLocaleString('ka-GE', { month: 'short' })}</span>
            </div>
        </div>
        <div class="event-content">
            <h3>${event.name}</h3>
            <div class="event-details">
                <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p><i class="fas fa-clock"></i> ${event.time}</p>
                <p>${event.description || ''}</p>
                <p><strong>Participants:</strong> ${event.participants}</p>
                <p><strong>Awards:</strong> ${event.awards || 'No awards specified'}</p>
            </div>
            <div class="event-buttons">
                ${role === 'admin' ? 
                    `<button class="btn btn-danger w-100" onclick="deleteEvent(${event.id})">
                        წაშლა
                    </button>` 
                    : 
                    `<button class="btn btn-primary w-100" onclick="joinEvent(${event.id})">
                        მონაწილეობის მიღება
                    </button>`
                }
            </div>
        </div>
    </div>
</div>`;
            eventsContainer.innerHTML += eventCard;
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        eventsContainer.innerHTML = '<p>Failed to load events.</p>';
    }
}

document.getElementById('newEventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role'); 

    if (role === 'admin') {
        try {
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                location.reload();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error adding event:', error);
            alert('Failed to add event.');
        }
    } else {
        alert('You do not have permission to add events.');
    }
});

async function deleteEvent(eventId) {
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            location.reload();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event.');
    }
}

async function joinEvent(eventId) {
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Successfully joined the event: ${result.event_name}`);
            location.reload();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error joining event:', error);
        alert('Failed to join the event.');
    }
}

document.addEventListener('DOMContentLoaded', fetchEvents);