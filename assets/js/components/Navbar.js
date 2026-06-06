/**
 * Navbar — componente reutilizável
 *
 * Renderiza uma barra superior fixa com o nome do usuário e um dropdown
 * que exibe o botão de logout. Funciona em todas as telas protegidas.
 *
 * Uso:
 *   import { renderNavbar } from '../components/Navbar.js';
 *   renderNavbar(auth, onLogout);
 *
 * Chame após o HTML da página ser injetado no DOM.
 */
export function renderNavbar(auth, onLogout) {
    // Remove navbar anterior se existir (evita duplicatas ao navegar)
    document.getElementById('app-navbar')?.remove();

    const name   = auth.getName();
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');

    const navbar = document.createElement('div');
    navbar.id        = 'app-navbar';
    navbar.innerHTML = `
        <nav class="navbar">
            <a class="navbar-brand" id="navbar-home-link" href="#/dashboard">VendaBoa</a>

            <div class="navbar-user" id="navbar-user-btn">
                <div class="navbar-avatar">${initials}</div>
                <span class="navbar-name">${name}</span>
                <svg class="navbar-chevron" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                          stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>

            <div class="navbar-dropdown" id="navbar-dropdown">
                <div class="navbar-dropdown-header">
                    <strong>${name}</strong>
                    <span>${auth.getUser()?.email ?? ''}</span>
                </div>
                <div class="navbar-dropdown-divider"></div>
                <button class="navbar-dropdown-item danger" id="navbar-logout-btn">
                    <svg viewBox="0 0 20 20" fill="none">
                        <path d="M13 15l4-5-4-5M17 10H7M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3"
                              stroke="currentColor" stroke-width="1.5"
                              stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Sair da conta
                </button>
            </div>
        </nav>
    `;

    // Insere antes do #app
    const app = document.getElementById('app');
    document.body.insertBefore(navbar, app);

    // ── Eventos ───────────────────────────────────────────────────────────────

    const userBtn  = document.getElementById('navbar-user-btn');
    const dropdown = document.getElementById('navbar-dropdown');
    const logoutBtn = document.getElementById('navbar-logout-btn');

    // Abre/fecha o dropdown ao clicar no botão do usuário
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        userBtn.classList.toggle('active', isOpen);
    });

    // Fecha ao clicar fora
    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        userBtn.classList.remove('active');
    }, { capture: true });

    // Logout
    logoutBtn.addEventListener('click', () => {
        auth.logout();
        onLogout();
    });
}