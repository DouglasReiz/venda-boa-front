// services/ProductService.js

export class ProductService {
    #api;

    constructor(api) {
        this.#api = api;
    }

    // ── Catálogo ──────────────────────────────────────────────────────────────

    /** Retorna categorias com produtos e variantes — usado no PDV */
    getCatalogo() {
        return this.#api.get('/catalogo');
    }

    // ── Categorias ────────────────────────────────────────────────────────────

    getCategorias()          { return this.#api.get('/categorias'); }
    criarCategoria(data)     { return this.#api.post('/categorias', data); }
    atualizarCategoria(id, data) { return this.#api.put(`/categorias/${id}`, data); }
    deletarCategoria(id)     { return this.#api.delete(`/categorias/${id}`); }

    // ── Produtos ──────────────────────────────────────────────────────────────

    getProdutos()            { return this.#api.get('/produtos'); }
    criarProduto(data)       { return this.#api.post('/produtos', data); }
    atualizarProduto(id, data) { return this.#api.put(`/produtos/${id}`, data); }
    deletarProduto(id)       { return this.#api.delete(`/produtos/${id}`); }

    // ── Variantes ─────────────────────────────────────────────────────────────

    criarVariante(productId, data) {
        return this.#api.post(`/produtos/${productId}/variantes`, data);
    }

    deletarVariante(id) {
        return this.#api.delete(`/variantes/${id}`);
    }
}