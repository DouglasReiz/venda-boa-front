export class UserService {
    #api;
 
    constructor(api) {
        this.#api = api;
    }
 
    // ── Usuários ──────────────────────────────────────────────────────────────
    getUsuarios()              { return this.#api.get('/usuarios'); }
    criarUsuario(data)         { return this.#api.post('/usuarios', data); }
    atualizarUsuario(id, data) { return this.#api.put(`/usuarios/${id}`, data); }
    toggleAtivo(id)            { return this.#api.request(`/usuarios/${id}/ativo`, 'PATCH'); }
 
    // ── Tenants (empresas) ───────────────────────────────────────────────────
    getTenants()              { return this.#api.get('/tenants'); }
    criarTenant(data)         { return this.#api.post('/tenants', data); }
    atualizarTenant(id, data) { return this.#api.put(`/tenants/${id}`, data); }
}