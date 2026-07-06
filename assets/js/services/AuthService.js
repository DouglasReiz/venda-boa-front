import { ApiError } from '../ApiClient/Error.js';

export class AuthService {
    #api;

    constructor(api) {
        this.#api = api;
    }

    async login(email, password) {
        const data = await this.#api.request('/login', 'POST', { email, password });
        if (!data.token) throw new ApiError(data.message ?? 'Credenciais inválidas');

        localStorage.setItem('auth_token', data.token);

        const user = await this.#api.get('/user');
        localStorage.setItem('auth_user', JSON.stringify(user));

        return { primeiro_acesso: data.primeiro_acesso ?? false };
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    }

    getUser() {
        try {
            return JSON.parse(localStorage.getItem('auth_user'));
        } catch {
            return null;
        }
    }

    getName() {
        return this.getUser()?.name ?? 'Usuário';
    }

    getRole() {
        return this.getUser()?.role ?? 'operador';
    }

    isAdminGlobal() { return this.getRole() === 'admin_global'; }
    isAdmin()       { return ['admin_global', 'admin'].includes(this.getRole()); }
    isOperador()    { return this.getRole() === 'operador'; }

    /**
     * Mapa centralizado de permissões.
     * Backend é a proteção real — isso controla apenas a visibilidade da UI.
     */
    pode(acao) {
        const role = this.getRole();
        const permissoes = {
            verGerenciarProdutos: ['admin_global', 'admin'],
            verControleEstoque:   ['admin_global', 'admin'],
            verGerenciarUsuarios: ['admin_global', 'admin'],
            verDashboardAdmin:    ['admin'],
            fecharCaixaAdmin:     ['admin_global', 'admin'],
            criarUsuario:         ['admin_global', 'admin'],
            gerenciarTenants:     ['admin_global'],
            abrirCaixa:           ['admin_global', 'admin', 'operador'],
            usarPdv:              ['admin_global', 'admin', 'operador'],
        };
        return (permissoes[acao] ?? []).includes(role);
    }
}