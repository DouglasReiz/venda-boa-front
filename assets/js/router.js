export class Router {
    #routes  = {};
    #app;
    #history = []; // pilha de rotas visitadas

    constructor() {
        this.#app = document.getElementById('app');
        window.addEventListener('hashchange', () => this.#resolve());
    }

    on(path, handler) {
        this.#routes[path] = handler;
        return this;
    }

    navigate(path) {
        window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
    }

    /**
     * Volta para a rota anterior na pilha.
     * Se não houver histórico, vai para /dashboard.
     */
    back() {
        // Remove a rota atual da pilha
        this.#history.pop();

        const anterior = this.#history.pop(); // pega a anterior
        this.navigate(anterior ?? '/dashboard');
    }

    #resolve() {
        const hash = window.location.hash || '#/';
        const path = hash.replace('#', '') || '/';

        const handler = this.#routes[path] ?? this.#routes['/404'];

        if (!handler) {
            console.warn('Rota não encontrada:', path);
            return;
        }

        // Empilha a rota atual (evita duplicatas consecutivas)
        const ultima = this.#history.at(-1);
        if (ultima !== path) this.#history.push(path);

        const { html, onMount } = handler();
        this.#app.innerHTML = html;
        if (onMount) onMount();
    }

    start() {
        window.addEventListener('hashchange', () => this.#resolve());

        if (!window.location.hash) {
            window.location.hash = '#/';
        } else {
            this.#resolve();
        }
    }
}