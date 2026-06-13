// services/ProductService.js

export class ProductService {
    #api;

    constructor(api) {
        this.#api = api;
    }

    // ── Catálogo ──────────────────────────────────────────────────────────────
    getCatalogo()    { return this.#api.get('/catalogo'); }

    // ── Categorias ────────────────────────────────────────────────────────────
    getCategorias()              { return this.#api.get('/categorias'); }
    criarCategoria(data)         { return this.#api.post('/categorias', data); }
    atualizarCategoria(id, data) { return this.#api.put(`/categorias/${id}`, data); }
    deletarCategoria(id)         { return this.#api.delete(`/categorias/${id}`); }

    // ── Produtos ──────────────────────────────────────────────────────────────
    getProdutos()              { return this.#api.get('/produtos'); }
    criarProduto(data)         { return this.#api.post('/produtos', data); }
    atualizarProduto(id, data) { return this.#api.put(`/produtos/${id}`, data); }
    deletarProduto(id)         { return this.#api.delete(`/produtos/${id}`); }

    // ── Variantes ─────────────────────────────────────────────────────────────
    criarVariante(productId, data) { return this.#api.post(`/produtos/${productId}/variantes`, data); }
    deletarVariante(id)            { return this.#api.delete(`/variantes/${id}`); }

    // ── Estoque ───────────────────────────────────────────────────────────────
    getAlertas()                        { return this.#api.get('/estoque/alertas'); }
    getVisaoGeral()                     { return this.#api.get('/estoque'); }
    ajustarEstoque(variantId, data)     { return this.#api.post(`/estoque/variantes/${variantId}/ajustar`, data); }
    atualizarMinimo(variantId, data)    { return this.#api.put(`/estoque/variantes/${variantId}/minimo`, data); }
    getHistoricoEstoque(variantId)      { return this.#api.get(`/estoque/variantes/${variantId}/historico`); }
}