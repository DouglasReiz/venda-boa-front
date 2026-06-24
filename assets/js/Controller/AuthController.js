import { BaseController } from './BaseController.js';

export class AuthController extends BaseController {
    #auth;

    constructor(auth) {
        super(auth);
        this.#auth = auth;
    }

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
            const { primeiro_acesso } = await this.#auth.login(email, senha);

            if (primeiro_acesso) {
                window.router.navigate('/trocar-senha');
            } else {
                window.router.navigate('/dashboard');
            }
        } catch (e) {
            alert('Falha no login: ' + e.message);
        }
    }
}