/** === UsersController ===
 * 
 * @copyright Copyright (c) 2026 Douglas Alves
 * @license PROPRIETÁRIA - TODOS OS DIREITOS RESERVADOS.
 * É estritamente proibido copiar, modificar ou distribuir este arquivo 
 * sem autorização expressa por escrito do autor.
 */

import { BaseController } from './BaseController.js';

/**
 * UsersController
 *
 * SRP: gerencia a tela de usuários e, se admin_global, também empresas.
 *
 * Regras de negócio aplicadas no frontend (espelham o backend):
 *  - admin_global: vê e cria usuários de qualquer tenant, e cria/edita tenants
 *  - admin:        vê e cria apenas operadores/admins do próprio tenant
 */
export class UsersController extends BaseController {
    #users;
    #isAdminGlobal;
    #tenants = [];
    #editUserId = null;
    #editTenantId = null;

    constructor(auth, userService) {
        super(auth);
        this.#users = userService;
        this.#isAdminGlobal = auth.getUser()?.role === 'admin_global';
    }

    async init() {
        this.montarNavbar();

        this.#bindFormUsuario();
        if (this.#isAdminGlobal) this.#bindFormEmpresa();

        const tasks = [this.#carregarUsuarios()];
        if (this.#isAdminGlobal) tasks.push(this.#carregarEmpresas());
        await Promise.all(tasks);
    }

    // ── Usuários ──────────────────────────────────────────────────────────────

    #bindFormUsuario() {
        document.getElementById('btn-novo-usuario')
            ?.addEventListener('click', () => this.#abrirFormUsuario());

        document.getElementById('btn-salvar-usuario')
            ?.addEventListener('click', () => this.#salvarUsuario());

        document.getElementById('btn-cancelar-usuario')
            ?.addEventListener('click', () => this.#fecharFormUsuario());
    }

    #abrirFormUsuario(user = null) {
        this.#editUserId = user?.id ?? null;

        document.getElementById('user-nome').value = user?.name ?? '';
        document.getElementById('user-email').value = user?.email ?? '';
        document.getElementById('user-senha').value = '';
        document.getElementById('user-senha').placeholder = user
            ? 'Nova senha (deixe vazio para manter)'
            : 'Senha';
        document.getElementById('user-role').value = user?.role ?? 'operador';

        if (this.#isAdminGlobal) {
            this.#atualizarSelectTenants();
            document.getElementById('user-tenant').value = user?.tenant_id ?? '';
        }

        this.#toggleForm('form-usuario', true);
    }

    #fecharFormUsuario() {
        this.#editUserId = null;
        this.#toggleForm('form-usuario', false);
    }

    async #salvarUsuario() {
        const name = document.getElementById('user-nome').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const senha = document.getElementById('user-senha').value;
        const role = document.getElementById('user-role').value;
        const tenant_id = this.#isAdminGlobal
            ? (document.getElementById('user-tenant').value || null)
            : undefined; // admin não escolhe — backend usa o próprio tenant

        if (!name) { alert('Informe o nome.'); return; }
        if (!email) { alert('Informe o e-mail.'); return; }
        if (!this.#editUserId && !senha) { alert('Informe a senha.'); return; }
        if (role !== 'admin_global' && this.#isAdminGlobal && !tenant_id) {
            alert('Selecione a empresa.');
            return;
        }

        const payload = { name, email, role };
        if (senha) payload.password = senha;
        if (this.#isAdminGlobal) payload.tenant_id = tenant_id;

        try {
            if (this.#editUserId) {
                await this.#users.atualizarUsuario(this.#editUserId, payload);
            } else {
                await this.#users.criarUsuario(payload);
            }
            this.#fecharFormUsuario();
            await this.#carregarUsuarios();
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao salvar usuário: ' + e.message);
        }
    }

    async #carregarUsuarios() {
        const lista = document.getElementById('lista-usuarios');
        if (!lista) return;

        try {
            const usuarios = await this.#users.getUsuarios();

            lista.innerHTML = usuarios.length === 0
                ? '<li class="admin-list-empty">Nenhum usuário cadastrado.</li>'
                : usuarios.map(u => `
                    <li class="admin-list-item ${!u.ativo ? 'inativo' : ''}">
                        <div class="admin-list-item-info">
                            <span class="prod-name">
                                ${u.name}
                                ${!u.ativo ? '<span class="stock-badge zerado">Inativo</span>' : ''}
                            </span>
                            <span class="prod-meta">
                                ${u.email} •
                                <strong>${this.#labelRole(u.role)}</strong>
                                ${u.tenant ? `• ${u.tenant.nome}` : (u.role === 'admin_global' ? '• Acesso total' : '')}
                            </span>
                        </div>
                        <div class="admin-list-item-actions">
                            <button class="btn-icon" data-action="edit-user" data-id="${u.id}"
                                    title="Editar">✏️</button>
                            <button class="btn-icon ${u.ativo ? 'danger' : ''}"
                                    data-action="toggle-user" data-id="${u.id}"
                                    title="${u.ativo ? 'Desativar' : 'Ativar'}">
                                ${u.ativo ? '🚫' : '✅'}
                            </button>
                        </div>
                    </li>
                `).join('');

            lista.onclick = (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const { action, id } = btn.dataset;

                if (action === 'edit-user') {
                    const user = usuarios.find(u => u.id == id);
                    this.#abrirFormUsuario(user);
                }
                if (action === 'toggle-user') this.#toggleUsuario(id);
            };
        } catch (e) {
            lista.innerHTML = '<li class="admin-list-empty">Erro ao carregar usuários.</li>';
        }
    }

    async #toggleUsuario(id) {
        try {
            await this.#users.toggleAtivo(id);
            await this.#carregarUsuarios();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    }

    #labelRole(role) {
        return { admin_global: 'Admin Global', admin: 'Admin', operador: 'Operador' }[role] ?? role;
    }

    // ── Empresas (somente admin_global) ──────────────────────────────────────

    #bindFormEmpresa() {
        document.getElementById('btn-nova-empresa')
            ?.addEventListener('click', () => this.#abrirFormEmpresa());

        document.getElementById('btn-salvar-empresa')
            ?.addEventListener('click', () => this.#salvarEmpresa());

        document.getElementById('btn-cancelar-empresa')
            ?.addEventListener('click', () => this.#fecharFormEmpresa());
    }

    #abrirFormEmpresa(tenant = null) {
        this.#editTenantId = tenant?.id ?? null;
        document.getElementById('tenant-nome').value = tenant?.nome ?? '';
        document.getElementById('tenant-slug').value = tenant?.slug ?? '';
        document.getElementById('tenant-cnpj').value = tenant?.cnpj ?? '';
        this.#toggleForm('form-empresa', true);
    }

    #fecharFormEmpresa() {
        this.#editTenantId = null;
        this.#toggleForm('form-empresa', false);
    }

    async #salvarEmpresa() {
        const nome = document.getElementById('tenant-nome').value.trim();
        const slug = document.getElementById('tenant-slug').value.trim()
            .toLowerCase().replace(/\s+/g, '-');
        const cnpj = document.getElementById('tenant-cnpj').value.trim();

        if (!nome) { alert('Informe o nome da empresa.'); return; }
        if (!slug) { alert('Informe o slug da empresa.'); return; }

        try {
            if (this.#editTenantId) {
                await this.#users.atualizarTenant(this.#editTenantId, { nome, slug, cnpj });
            } else {
                await this.#users.criarTenant({ nome, slug, cnpj });
            }
            this.#fecharFormEmpresa();
            await this.#carregarEmpresas();
        } catch (e) {
            alert('Erro ao salvar empresa: ' + e.message);
        }
    }

    async #carregarEmpresas() {
        const lista = document.getElementById('lista-empresas');
        if (!lista) return;

        try {
            this.#tenants = await this.#users.getTenants();

            lista.innerHTML = this.#tenants.length === 0
                ? '<li class="admin-list-empty">Nenhuma empresa cadastrada.</li>'
                : this.#tenants.map(t => `
                    <li class="admin-list-item ${!t.ativo ? 'inativo' : ''}">
                        <div class="admin-list-item-info">
                            <span class="prod-name">
                                ${t.nome}
                                ${!t.ativo ? '<span class="stock-badge zerado">Inativa</span>' : ''}
                            </span>
                            <span class="prod-meta">
                                ${t.slug} • ${t.users_count ?? 0} usuário(s)
                            </span>
                        </div>
                        <div class="admin-list-item-actions">
                            <button class="btn-icon" data-action="edit-tenant" data-id="${t.id}"
                                    title="Editar">✏️</button>
                        </div>
                    </li>
                `).join('');

            lista.onclick = (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                if (btn.dataset.action === 'edit-tenant') {
                    const tenant = this.#tenants.find(t => t.id == btn.dataset.id);
                    this.#abrirFormEmpresa(tenant);
                }
            };

            // Atualiza o select de empresas no form de usuário
            this.#atualizarSelectTenants();
        } catch (e) {
            lista.innerHTML = '<li class="admin-list-empty">Erro ao carregar empresas.</li>';
        }
    }

    #atualizarSelectTenants() {
        const sel = document.getElementById('user-tenant');
        if (!sel) return;
        sel.innerHTML = '<option value="">Selecione a empresa</option>' +
            this.#tenants.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    #toggleForm(id, show) {
        document.getElementById(id)?.classList.toggle('hidden', !show);
    }
}