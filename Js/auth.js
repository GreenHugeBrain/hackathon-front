const API_BASE_URL = 'http://127.0.0.1:5000/api';

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => alertDiv.remove(), 5000);
}

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await handleResponse(response);
            localStorage.setItem('jwt_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role ? 'admin' : 'guest');
            showAlert('წარმატებით შეხვედით სისტემაში', 'success');

            setTimeout(() => {
                window.location.href = 'events.html';
            }, 1500);
        } catch (error) {
            showAlert(error.message || 'შესვლა ვერ მოხერხდა', 'danger');
        }
    });
}

if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            showAlert('პაროლები არ ემთხვევა', 'danger');
            return;
        }

        const userData = {
            username: formData.get('username'),
            password: password
        };

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await handleResponse(response);
            showAlert('რეგისტრაცია წარმატებით დასრულდა', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } catch (error) {
            showAlert(error.message || 'რეგისტრაცია ვერ მოხერხდა', 'danger');
        }
    });
}

function isAuthenticated() {
    return !!localStorage.getItem('jwt_token');
}

function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    window.location.href = 'login.html';
}

if (isAuthenticated()) {
    const navbarNav = document.querySelector('.navbar-nav');
    if (navbarNav) {
        const logoutLi = document.createElement('li');
        logoutLi.className = 'nav-item';
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline-light ms-2';
        logoutBtn.textContent = 'გასვლა';
        logoutBtn.onclick = logout;
        logoutLi.appendChild(logoutBtn);
        navbarNav.appendChild(logoutLi);
    }
}