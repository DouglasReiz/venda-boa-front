/**
 * BaseController
 *
 * Princípio SOLID aplicado:
 *  - SRP: centraliza apenas o comportamento compartilhado entre controllers
 *         (logout e tratamento de sessão expirada).
 *  - DRY: elimina a duplicação do bloco #sessaoExpirada que existia no
 *         UIController original e seria copiado em cada novo controller.
 *  - OCP: subclasses estendem sem precisar reescrever o tratamento de auth.
 */
export class BaseController {
    #auth;

    constructor(auth) {
        this.#auth = auth;
    }

    logout() {
        this.#auth.logout();
        window.router.navigate('/login');
    }

    // Chamado em qualquer catch que receba UnauthorizedError
    sessaoExpirada() {
        alert('Sessão expirada. Faça login novamente.');
        this.logout();
    }

    // Atalho para verificar o tipo do erro e redirecionar se necessário.
    // Retorna true se o erro foi tratado (o caller pode usar para early return).
    tratarErroAuth(e) {
        if (e.name === 'UnauthorizedError') {
            this.sessaoExpirada();
            return true;
        }
        return false;
    }
}