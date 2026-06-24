/* ==========================================================================
   pages/users.js
   Contém: usersPage (gerenciamento de usuários e, para admin_global, tenants)
   ========================================================================== */

/**
 * usersPage
 * @param {boolean} isAdminGlobal — controla se a seção de empresas aparece
 */
export function usersPage(isAdminGlobal = false) {
    return `
    <div class="admin-products-layout">

        <!-- Coluna esquerda: Empresas (somente admin_global) -->
        ${isAdminGlobal ? `
        <section class="admin-section">
            <div class="admin-section-header">
                <h2>Empresas</h2>
                <button class="btn btn-primary btn-sm" id="btn-nova-empresa">+ Nova</button>
            </div>

            <div class="admin-form hidden" id="form-empresa">
                <input type="text" id="tenant-nome" placeholder="Nome da empresa">
                <input type="text" id="tenant-slug" placeholder="slug-da-empresa (sem espaços)">
                <input type="text" id="tenant-cnpj" placeholder="CNPJ (opcional)">
                <div class="button-row">
                    <button class="btn btn-primary" id="btn-salvar-empresa">Salvar</button>
                    <button class="btn btn-ghost"   id="btn-cancelar-empresa">Cancelar</button>
                </div>
            </div>

            <ul class="admin-list" id="lista-empresas">
                <li class="admin-list-loading">Carregando...</li>
            </ul>
        </section>
        ` : ''}

        <!-- Coluna direita: Usuários -->
        <section class="admin-section">
            <div class="admin-section-header">
                <h2>Usuários</h2>
                <button class="btn btn-primary btn-sm" id="btn-novo-usuario">+ Novo</button>
            </div>

            <!-- Formulário inline -->
            <div class="admin-form hidden" id="form-usuario">
                <input type="text"     id="user-nome"  placeholder="Nome completo">
                <input type="email"    id="user-email" placeholder="E-mail">
                <input type="password" id="user-senha"
                       placeholder="Senha (deixe vazio para manter, ao editar)">

                <select id="user-role">
                    <option value="operador">Operador</option>
                    <option value="admin">Admin (empresa)</option>
                    ${isAdminGlobal ? '<option value="admin_global">Admin Global</option>' : ''}
                </select>

                ${isAdminGlobal ? `
                    <select id="user-tenant">
                        <option value="">Selecione a empresa</option>
                    </select>
                ` : ''}

                <div class="button-row">
                    <button class="btn btn-primary" id="btn-salvar-usuario">Salvar</button>
                    <button class="btn btn-ghost"   id="btn-cancelar-usuario">Cancelar</button>
                </div>
            </div>

            <ul class="admin-list" id="lista-usuarios">
                <li class="admin-list-loading">Carregando...</li>
            </ul>
        </section>

    </div>
    `;
}