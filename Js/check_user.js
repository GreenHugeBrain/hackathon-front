document.addEventListener('DOMContentLoaded', function () {

    const jwtToken = localStorage.getItem('jwt_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (jwtToken && username && role) {

        const navbarNav = document.querySelector('.navbar-nav');
        const usernameDisplay = document.createElement('li');
        usernameDisplay.classList.add('nav-item');
        usernameDisplay.classList.add('dropdown');

        usernameDisplay.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${username}
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><span class="dropdown-item"><a href="profile.html" style="color: black; text-decoration: none;">Profile</></span></li>
                <li><a class="dropdown-item" href="#" id="logout">გამოსვლა</a></li>
            </ul>
        `;

        navbarNav.appendChild(usernameDisplay);

        const logoutButton = document.getElementById('logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', function () {

                localStorage.removeItem('jwt_token');
                localStorage.removeItem('username');
                localStorage.removeItem('role');

                window.location.href = 'index.html';
            });
        }
    }

})