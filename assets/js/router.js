/**
 * Venda Boa PDV
 * 
 * @copyright Copyright (c) 2026 Douglas Alves
 * @license PROPRIETÁRIA - TODOS OS DIREITOS RESERVADOS.
 * É estritamente proibido copiar, modificar ou distribuir este arquivo 
 * sem autorização expressa por escrito do autor.
 */

export class Router {
    #routes = {};
    #app;
    #history = [];

    constructor() {
        this.#app = document.getElementById('app');
        // hashchange registrado APENAS no start() — evita duplo disparo
    }

    on(path, handler) {
        this.#routes[path] = handler;
        return this;
    }

    navigate(path) {
        window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
    }

    back() {
        this.#history.pop();
        const anterior = this.#history.pop();
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

        const ultima = this.#history.at(-1);
        if (ultima !== path) this.#history.push(path);

        const result = handler();

        // Garante que html e onMount existem
        const html = result?.html ?? '';
        const onMount = result?.onMount ?? null;

        this.#app.innerHTML = html;

        // onMount executa APÓS o HTML ser inserido no DOM
        if (onMount) onMount();
    }

    start() {
        // Registrado uma única vez aqui
        window.addEventListener('hashchange', () => this.#resolve());

        if (!window.location.hash) {
            window.location.hash = '#/';
        } else {
            this.#resolve();
        }
    }
}