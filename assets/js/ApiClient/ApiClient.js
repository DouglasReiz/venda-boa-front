import { ApiError, UnauthorizedError } from './Error.js'; 

export class ApiClient {
    #baseUrl;
    #getToken;

    // D — Inversão de dependência: o token vem de fora via função,
    // não de localStorage diretamente. Fácil de trocar em testes.
    constructor(baseUrl, getToken = () => localStorage.getItem('auth_token')) {
        this.#baseUrl = baseUrl;
        this.#getToken = getToken;
    }

    // S — Uma responsabilidade: montar e executar requisições HTTP.
    async request(path, method = 'GET', body = null) {
        const headers = this.#buildHeaders();
        const config = { method, headers, body: body ? JSON.stringify(body) : null };

        const response = await fetch(`${this.#baseUrl}${path}`, config);

        await this.#assertSuccess(response);

        return response.json();
    }

    // Métodos de conveniência (O — aberto para extensão sem alterar request())
    get(path) { return this.request(path, 'GET'); }
    post(path, body) { return this.request(path, 'POST', body); }
    put(path, body) { return this.request(path, 'PUT', body); }
    delete(path) { return this.request(path, 'DELETE'); }

    // Privados — não fazem parte da interface pública
    #buildHeaders() {
        const token = this.#getToken();
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async #assertSuccess(response) {
        if (response.ok) return;                     // 2xx → tudo certo

        if (response.status === 401) {
            throw new UnauthorizedError();
        }

        // Tenta extrair mensagem de erro do body
        const body = await response.json().catch(() => ({}));
        throw new ApiError(
            body.message ?? body.error ?? `Erro HTTP ${response.status}`,
            response.status
        );
    }
}