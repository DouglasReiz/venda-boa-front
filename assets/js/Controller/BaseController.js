import { renderNavbar } from '../components/navbar.js';

/**
 * BaseController
 *
 * - Centraliza logout e tratamento de sessão expirada (SRP)
 * - Renderiza a navbar automaticamente em todos os controllers filhos (DRY)
 *   Basta chamar this.montarNavbar() no início de qualquer bind method.
 */
export class BaseController {
    #auth;

    constructor(auth) {
        this.#auth = auth;
    }

    /**
     * Renderiza a navbar com o nome do usuário logado.
     * Deve ser chamado no início de cada método de bind das telas protegidas.
     */
    montarNavbar() {
        renderNavbar(this.#auth, () => this.logout());
    }

    logout() {
        this.#auth.logout();
        window.router.navigate('/login');
    }

    sessaoExpirada() {
        alert('Sessão expirada. Faça login novamente.');
        this.logout();
    }

    tratarErroAuth(e) {
        if (e.name === 'UnauthorizedError') {
            this.sessaoExpirada();
            return true;
        }
        return false;
    }
}