// services/GraficoService.js
export class GraficoService {
    #api;

    constructor(api) {
        this.#api = api;
    }

    getHistoricoFechamentos() {
        return this.#api.get('/admin/historico-fechamentos');
    }
}