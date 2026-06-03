export class Router {
    #routes = {};
    #app;

    constructor() {
        this.#app = document.getElementById('app');
        // Escuta mudanças na hash da URL (ex: quando o #/login muda)
        window.addEventListener('hashchange', () => this.#resolve());
    }

    // Registra uma rota normalmente: router.on('/login', () => '...')
    on(path, handler) {
        this.#routes[path] = handler;
        return this;
    }

    // Navega para uma rota usando Hash de forma transparente
    navigate(path) {
        // Se o caminho não começar com '#', nós adicionamos automaticamente
        window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
    }

    // Lê a URL atual (o hash) e renderiza a página correta
    #resolve() {
        const hash = window.location.hash || '#/';
        const path = hash.replace('#', '') || '/';

        //console.log("Tentando resolver a rota:", path); // <--- DEBUG
        //console.log("Rotas disponíveis:", Object.keys(this.#routes)); // <--- DEBUG

        const handler = this.#routes[path] ?? this.#routes['/404'];

        if (!handler) {
            console.warn("Rota não encontrada!");
            return;
        }

        const { html, onMount } = handler();
        this.#app.innerHTML = html;

        if (onMount) onMount();
    }

    start() {
        // Escuta mudanças no hash
        window.addEventListener('hashchange', () => this.#resolve());

        // Se a URL estiver vazia, vai para a raiz
        if (!window.location.hash) {
            window.location.hash = '#/';
        } else {
            // Se a URL já tiver um hash (ex: #/dashboard), resolve imediatamente
            this.#resolve();
        }
    }
}