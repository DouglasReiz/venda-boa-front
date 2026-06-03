// services/CaixaAdminService.js
export class CaixaAdminService {
    #api;

    constructor(api) {
        this.#api = api;
    }

    getCaixasAbertos() {
        return this.#api.get('/admin/caixas-abertos');
    }

    fecharCaixa(caixaId) {
        return this.#api.post(`/admin/caixas/${caixaId}/fechar`);
    }
}