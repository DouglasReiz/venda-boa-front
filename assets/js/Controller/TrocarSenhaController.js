import { BaseController } from './BaseController.js';

export class TrocarSenhaController extends BaseController {
    #api;

    constructor(auth, api) {
        super(auth);
        this.#api = api;
    }

    bind() {
        const btn = document.getElementById('btn-trocar-senha');
        if (btn) btn.addEventListener('click', () => this.#trocar());
    }

    async #trocar() {
        const senhaAtual     = document.getElementById('senha-atual')?.value;
        const novaSenha      = document.getElementById('nova-senha')?.value;
        const confirmarSenha = document.getElementById('confirmar-senha')?.value;

        if (!senhaAtual)          { alert('Informe a senha atual.'); return; }
        if (!novaSenha)           { alert('Informe a nova senha.'); return; }
        if (novaSenha.length < 8) { alert('A nova senha precisa ter pelo menos 8 caracteres.'); return; }
        if (novaSenha !== confirmarSenha) { alert('As senhas não coincidem.'); return; }
        if (novaSenha === senhaAtual)     { alert('A nova senha não pode ser igual à senha atual.'); return; }

        const btn = document.getElementById('btn-trocar-senha');
        btn.disabled    = true;
        btn.textContent = 'Salvando...';

        try {
            await this.#api.post('/auth/trocar-senha', {
                senha_atual:             senhaAtual,
                nova_senha:              novaSenha,
                nova_senha_confirmation: confirmarSenha,
            });

            alert('Senha atualizada! Bem-vindo ao sistema.');
            window.router.navigate('/dashboard');
        } catch (e) {
            alert('Erro: ' + e.message);
            btn.disabled    = false;
            btn.textContent = 'Salvar nova senha';
        }
    }
}