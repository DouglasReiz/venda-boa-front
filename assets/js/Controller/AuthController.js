import { BaseController } from './BaseController.js';

/**
 * AuthController
 *
 * Princípios SOLID aplicados:
 *  - SRP: responsável exclusivamente pelo fluxo de autenticação (login/logout
 *         iniciado pela tela de login). Não conhece checkout, dashboard nem
 *         qualquer outra tela.
 *  - DIP: depende da abstração AuthService injetada, não de uma instância
 *         concreta criada internamente.
 */
export class AuthController extends BaseController {
    #auth;

    constructor(auth) {
        super(auth);
        this.#auth = auth;
    }

    // Vincula os eventos da página de login
    bindLogin() {
        const btn = document.getElementById('btn-login');
        if (btn) btn.addEventListener('click', () => this.#login());
    }

    async #login() {
        const email = document.getElementById('email')?.value;
        const senha = document.getElementById('password')?.value;

        if (!email || !senha) {
            alert('Preencha e-mail e senha!');
            return;
        }

        try {
            await this.#auth.login(email, senha);
            window.router.navigate('/dashboard');
        } catch (e) {
            alert('Falha no login: ' + e.message);
        }
    }
}